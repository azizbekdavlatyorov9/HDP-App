import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class Attendance20261104200000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
