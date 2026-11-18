import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InitialEducationCenterSchema20261104000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
