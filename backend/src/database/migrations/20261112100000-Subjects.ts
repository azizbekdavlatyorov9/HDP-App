import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Subjects20261112100000 implements MigrationInterface {
  name = 'Subjects20261112100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subjects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "title" varchar(180) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_subjects_status" CHECK ("status" IN ('active', 'archived'))
      );
      CREATE INDEX "IDX_subjects_course_status_created"
        ON "subjects" ("course_id", "status", "created_at");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subjects"`);
  }
}
