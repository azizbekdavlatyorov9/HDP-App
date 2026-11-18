import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class GroupEnrollmentLink20261112130000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
