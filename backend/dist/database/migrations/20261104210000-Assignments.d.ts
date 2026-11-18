import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class Assignments20261104210000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
