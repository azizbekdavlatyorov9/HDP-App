import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CloudflareVideoLifecycle20261109000000 implements MigrationInterface {
  name = 'CloudflareVideoLifecycle20261109000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "videos" DROP CONSTRAINT "CHK_videos_status";
      ALTER TABLE "videos" ADD COLUMN "provider" varchar(30) NOT NULL DEFAULT 'cloudflare_stream';
      ALTER TABLE "videos" ADD COLUMN "title" varchar(180);
      ALTER TABLE "videos" ADD COLUMN "thumbnail_url" text;
      UPDATE "videos" SET "status" = 'pending' WHERE "status" = 'initiated';
      ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'pending';
      ALTER TABLE "videos" ADD CONSTRAINT "CHK_videos_status"
        CHECK ("status" IN ('pending', 'uploading', 'processing', 'ready', 'error', 'deleted'));
    `);
  }

  async down(): Promise<void> {
    throw new Error(
      'Cloudflare video lifecycle migration is forward-only; use a reviewed corrective migration to preserve video metadata and lifecycle state.',
    );
  }
}
