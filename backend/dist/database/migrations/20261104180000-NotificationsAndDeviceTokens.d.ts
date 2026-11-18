import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class NotificationsAndDeviceTokens20261104180000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
