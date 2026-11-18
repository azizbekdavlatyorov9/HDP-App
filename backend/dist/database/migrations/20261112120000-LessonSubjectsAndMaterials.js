export class LessonSubjectsAndMaterials20261112120000 {
    name = 'LessonSubjectsAndMaterials20261112120000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "lessons"
        ADD COLUMN "subject_id" uuid,
        ADD COLUMN "video_url" text,
        ADD COLUMN "materials" jsonb,
        ADD CONSTRAINT "FK_lessons_subject"
          FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT;

      ALTER TABLE "lessons" DROP CONSTRAINT "UQ_lessons_course_position";

      CREATE UNIQUE INDEX "UQ_lessons_subject_position"
        ON "lessons" ("subject_id", "position")
        WHERE "subject_id" IS NOT NULL;

      CREATE UNIQUE INDEX "UQ_lessons_legacy_course_position"
        ON "lessons" ("course_id", "position")
        WHERE "subject_id" IS NULL;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX "UQ_lessons_subject_position";
      DROP INDEX "UQ_lessons_legacy_course_position";
      ALTER TABLE "lessons"
        ADD CONSTRAINT "UQ_lessons_course_position" UNIQUE ("course_id", "position");
      ALTER TABLE "lessons"
        DROP CONSTRAINT "FK_lessons_subject",
        DROP COLUMN "subject_id",
        DROP COLUMN "video_url",
        DROP COLUMN "materials";
    `);
    }
}
//# sourceMappingURL=20261112120000-LessonSubjectsAndMaterials.js.map