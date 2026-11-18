import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class PhoneLinkingAndTelegramNonce20261104101500 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
