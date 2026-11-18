import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class GroupsScheduling20261104190000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
