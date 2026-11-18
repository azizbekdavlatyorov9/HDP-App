import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseDuration20261112090000 implements MigrationInterface {
  name = 'CourseDuration20261112090000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses" ADD COLUMN "duration" integer;
      ALTER TABLE "courses"
        ADD CONSTRAINT "CHK_courses_duration"
        CHECK ("duration" IS NULL OR "duration" > 0);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses" DROP CONSTRAINT "CHK_courses_duration";
      ALTER TABLE "courses" DROP COLUMN "duration";
    `);
  }
}
