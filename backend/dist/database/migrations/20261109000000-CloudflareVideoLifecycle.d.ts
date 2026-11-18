import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CloudflareVideoLifecycle20261109000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
