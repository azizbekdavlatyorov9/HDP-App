import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CoursesController } from './courses.controller.js';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto.js';
import { CoursesService } from './courses.service.js';

const admin = {
  id: '10000000-0000-4000-8000-000000000001',
  displayName: 'Admin',
  roles: ['ADMIN'],
};
const student = {
  id: '10000000-0000-4000-8000-000000000002',
  displayName: 'Student',
  roles: ['STUDENT'],
};
const courseId = '20000000-0000-4000-8000-000000000001';

function setup() {
  const rows: Record<string, any> = {};
  const courseRepo: any = {
    create: vi.fn((data) => ({
      ...data,
      id: courseId,
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCategories: [],
    })),
    save: vi.fn(async (row) => {
      rows[row.id] = row;
      return row;
    }),
    findOne: vi.fn(
      async ({ where }: any) =>
        Object.values(rows).find((row: any) =>
          where.id ? row.id === where.id : row.slug === where.slug,
        ) ?? null,
    ),
    createQueryBuilder: vi.fn(() => {
      const builder: any = {};
      for (const method of [
        'leftJoinAndSelect',
        'where',
        'andWhere',
        'orderBy',
        'skip',
        'take',
      ])
        builder[method] = vi.fn(() => builder);
      builder.getManyAndCount = vi.fn(async () => [
        Object.values(rows).filter((row: any) => row.status === 'published'),
        rows.length,
      ]);
      return builder;
    }),
  };
  const users: any = {
    findOne: vi.fn(async ({ where }: any) => ({
      id: where.id,
      displayName: 'Admin',
      status: 'active',
    })),
    find: vi.fn().mockResolvedValue([]),
  };
  const userRoles: any = { findOne: vi.fn().mockResolvedValue({}) };
  const categories: any = {
    find: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(false),
  };
  const courseCategories: any = {
    create: vi.fn((value) => value),
    save: vi.fn(),
    delete: vi.fn(),
  };
  const access = {
    isAdmin: vi.fn((user) =>
      user.roles.some((role: string) =>
        ['ADMIN', 'SUPER_ADMIN'].includes(role),
      ),
    ),
    canManageCourse: vi.fn(async (id) => {
      const row = rows[id];
      if (!row) throw new NotFoundException('Course not found');
      return row;
    }),
  };
  const notifications = { createAndDeliverMany: vi.fn() };
  const service = new CoursesService(
    courseRepo,
    categories,
    courseCategories,
    users,
    userRoles,
    access as never,
    notifications as never,
  );
  return { service, courseRepo, users, access, notifications, rows };
}

describe('CoursesService CRUD', () => {
  it('creates a course with a generated slug and active status for administrators', async () => {
    const { service, courseRepo } = setup();
    const result = await service.create(
      { title: 'Algebra', price: 250000, duration: 12, status: 'active' },
      admin as never,
    );
    expect(courseRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Algebra',
        slug: 'algebra',
        priceMinor: '250000',
        currency: 'UZS',
        duration: 12,
        status: 'published',
      }),
    );
    expect(result).toMatchObject({
      title: 'Algebra',
      status: 'active',
      image: null,
      duration: 12,
    });
  });

  it('denies non-admin creation and updates', async () => {
    const { service } = setup();
    await expect(
      service.create(
        { title: 'Algebra', price: 1, duration: 1 },
        student as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(courseId, { title: 'Changed' }, student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists active courses only', async () => {
    const { service, courseRepo } = setup();
    const result = await service.list({
      page: 1,
      limit: 20,
      sort: 'createdAt',
      order: 'DESC',
    });
    expect(courseRepo.createQueryBuilder).toHaveBeenCalledWith('course');
    expect(result.data).toEqual([]);
  });

  it('gets an active course by UUID and returns 404 for an absent course', async () => {
    const { service, rows } = setup();
    rows[courseId] = {
      id: courseId,
      title: 'Algebra',
      slug: 'algebra',
      description: null,
      thumbnailUrl: null,
      priceMinor: '0',
      currency: 'UZS',
      duration: null,
      status: 'published',
      leadTeacher: { id: admin.id, displayName: 'Admin' },
      courseCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await expect(service.details(courseId)).resolves.toMatchObject({
      id: courseId,
      status: 'active',
    });
    await expect(
      service.details('30000000-0000-4000-8000-000000000001'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects malformed IDs with 400', async () => {
    const { service } = setup();
    await expect(service.details('not-a-uuid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('updates course fields and maps image/status to the existing schema', async () => {
    const { service, rows } = setup();
    rows[courseId] = {
      id: courseId,
      title: 'Algebra',
      slug: 'algebra',
      description: null,
      thumbnailUrl: null,
      priceMinor: '100',
      currency: 'UZS',
      duration: null,
      status: 'published',
      leadTeacher: { id: admin.id, displayName: 'Admin' },
      courseCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await service.update(
      courseId,
      {
        title: 'Advanced Algebra',
        image: 'https://example.test/algebra.png',
        price: 200,
        duration: 24,
      },
      admin as never,
    );
    expect(result).toMatchObject({
      title: 'Advanced Algebra',
      image: 'https://example.test/algebra.png',
      price: 200,
      duration: 24,
      status: 'active',
    });
  });

  it('deactivates without deleting records and restricts writes to administrators', async () => {
    const { service, rows, courseRepo } = setup();
    rows[courseId] = {
      id: courseId,
      title: 'Algebra',
      slug: 'algebra',
      description: null,
      thumbnailUrl: null,
      priceMinor: '100',
      currency: 'UZS',
      duration: null,
      status: 'published',
      leadTeacher: { id: admin.id, displayName: 'Admin' },
      courseCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await expect(
      service.remove(courseId, student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    const result = await service.remove(courseId, admin as never);
    expect(result.status).toBe('inactive');
    expect(rows[courseId].status).toBe('archived');
    expect(courseRepo.save).toHaveBeenCalledTimes(1);
  });
});

describe('Course DTO validation and route guards', () => {
  it('requires a title and rejects negative price, non-positive duration, and unsupported status', async () => {
    const dto = plainToInstance(CreateCourseDto, {
      title: '',
      price: -1,
      duration: 0,
      status: 'published',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['title', 'price', 'duration', 'status']),
    );

    const valid = plainToInstance(CreateCourseDto, {
      title: 'Algebra',
      price: 0,
      duration: 1,
      status: 'active',
    });
    expect(await validate(valid)).toHaveLength(0);
    const invalidUpdate = plainToInstance(UpdateCourseDto, {
      price: -1,
      duration: -2,
      status: 'draft',
    });
    expect(
      (await validate(invalidUpdate)).map((error) => error.property),
    ).toEqual(expect.arrayContaining(['price', 'duration', 'status']));
  });

  it('leaves GET routes public and applies JWT plus role guards to all writes', () => {
    const prototype = CoursesController.prototype;
    expect(
      Reflect.getMetadata(GUARDS_METADATA, prototype.list),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(GUARDS_METADATA, prototype.details),
    ).toBeUndefined();
    for (const handler of [
      prototype.create,
      prototype.update,
      prototype.remove,
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
        JwtAuthGuard,
        RolesGuard,
      ]);
      expect(Reflect.getMetadata('requiredRoles', handler)).toEqual([
        'ADMIN',
        'SUPER_ADMIN',
      ]);
    }
  });
});
