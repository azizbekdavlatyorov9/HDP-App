import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CourseDuration20261112090000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
