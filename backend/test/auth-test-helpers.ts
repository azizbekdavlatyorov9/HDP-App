import { RefreshToken } from '../src/database/entities/core.entity.js';
import { randomUUID } from 'node:crypto';

export class MemoryRepository<T extends Record<string, any>> {
  readonly items: T[] = [];

  create(value: Partial<T>): T {
    const created = { ...value } as T;
    if (!created.id) created.id = randomUUID() as T['id'];
    return created;
  }

  async save(value: T): Promise<T> {
    if (!value.createdAt) {
      value.createdAt = new Date();
    }
    const id = value.id;
    const existing = this.items.findIndex((item) => item.id === id);
    if (existing >= 0) this.items[existing] = value;
    else this.items.push(value);
    return value;
  }

  async findOne(options: {
    where?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
  }): Promise<T | null> {
    const matches = this.items.filter((item) =>
      Object.entries(options.where ?? {}).every(([key, expected]) => {
        const actual = item[key];
        if (expected && typeof expected === 'object' && 'type' in expected) {
          return (
            (expected as { type?: string }).type === 'isNull' && actual == null
          );
        }
        if (expected && typeof expected === 'object' && 'id' in expected) {
          return (
            (actual as { id?: string } | null)?.id ===
            (expected as { id: string }).id
          );
        }
        return actual === expected;
      }),
    );
    const order = options.order && Object.entries(options.order)[0];
    if (order) {
      matches.sort((left, right) => {
        const leftValue = left[order[0]] as Date;
        const rightValue = right[order[0]] as Date;
        return (
          (leftValue.getTime() - rightValue.getTime()) *
          (order[1] === 'DESC' ? -1 : 1)
        );
      });
    }
    return matches[0] ?? null;
  }

  async findOneBy(where: Record<string, unknown>): Promise<T | null> {
    return this.findOne({ where });
  }

  async update(
    criteria: Record<string, unknown>,
    patch: Partial<T>,
  ): Promise<void> {
    const row = this.items.find((item) =>
      Object.entries(criteria).every(([key, value]) => item[key] === value),
    );
    if (row) Object.assign(row, patch);
  }

  createQueryBuilder(): any {
    const builder: any = {
      mode: 'select',
      update: () => builder,
      leftJoinAndSelect: () => builder,
      setLock: () => builder,
      set: (patch: Partial<T>) => {
        builder.mode = 'update';
        builder.patch = patch;
        return builder;
      },
      where: (_sql: string, parameters: Record<string, unknown>) => {
        builder.parameters = parameters;
        return builder;
      },
      execute: async () => {
        for (const row of this.items) {
          if (
            row.user?.id === builder.parameters.userId &&
            row.revokedAt == null &&
            (!builder.parameters.tokenHash ||
              row.tokenHash === builder.parameters.tokenHash)
          ) {
            Object.assign(row, builder.patch);
          }
        }
      },
      getOne: async () =>
        this.items.find(
          (row) => row.tokenHash === builder.parameters.tokenHash,
        ) ?? null,
    };
    return builder;
  }
}

export class MemoryDataSource {
  constructor(
    private readonly repositories: Map<Function, MemoryRepository<any>>,
  ) {}

  async transaction<T>(work: (manager: any) => Promise<T>): Promise<T> {
    const manager = {
      getRepository: (entity: Function) => this.repositories.get(entity),
      query: async (sql: string, parameters: unknown[]) => {
        if (sql.includes('UPDATE "refresh_tokens"')) {
          const tokens = this.repositories.get(RefreshToken);
          for (const token of tokens?.items ?? []) {
            if (token.user?.id === parameters[1] && token.revokedAt == null) {
              token.revokedAt = parameters[0];
            }
          }
        }
      },
    };
    return work(manager);
  }
}
