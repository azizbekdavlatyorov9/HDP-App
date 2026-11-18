-- REVIEW-ONLY STAGING MIGRATION PREVIEW
-- Generated locally from the pending migration up() method using a mock QueryRunner.
-- No database was contacted while generating this file.
-- Do not execute this file directly; use the reviewed TypeORM migration workflow.
-- Staging history inspection: 8 migrations applied, 1 pending.

-- 20261109000000-CloudflareVideoLifecycle
ALTER TABLE "videos" DROP CONSTRAINT "CHK_videos_status";
      ALTER TABLE "videos" ADD COLUMN "provider" varchar(30) NOT NULL DEFAULT 'cloudflare_stream';
      ALTER TABLE "videos" ADD COLUMN "title" varchar(180);
      ALTER TABLE "videos" ADD COLUMN "thumbnail_url" text;
      UPDATE "videos" SET "status" = 'pending' WHERE "status" = 'initiated';
      ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'pending';
      ALTER TABLE "videos" ADD CONSTRAINT "CHK_videos_status"
        CHECK ("status" IN ('pending', 'uploading', 'processing', 'ready', 'error', 'deleted'));
