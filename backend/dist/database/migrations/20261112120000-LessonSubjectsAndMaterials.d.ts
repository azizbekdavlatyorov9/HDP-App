import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class LessonSubjectsAndMaterials20261112120000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
