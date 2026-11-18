import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CRM20261104220000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
