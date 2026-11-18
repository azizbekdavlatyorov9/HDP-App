export class GroupEnrollmentLink20261112130000 {
    name = 'GroupEnrollmentLink20261112130000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "group_students" ADD COLUMN "enrollment_id" uuid');
        await queryRunner.query('ALTER TABLE "group_students" ADD CONSTRAINT "FK_group_students_enrollment" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT');
        await queryRunner.query(`
      UPDATE "group_students" AS membership
      SET "enrollment_id" = enrollment."id"
      FROM "study_groups" AS study_group
      JOIN "enrollments" AS enrollment
        ON enrollment."course_id" = study_group."course_id"
      WHERE membership."group_id" = study_group."id"
        AND membership."student_id" = enrollment."user_id"
    `);
        await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM "group_students"
          WHERE "status" = 'ACTIVE' AND "enrollment_id" IS NOT NULL
          GROUP BY "enrollment_id" HAVING COUNT(*) > 1
        ) THEN
          RAISE EXCEPTION 'Cannot add active-enrollment uniqueness: duplicate active group assignments exist';
        END IF;
      END $$
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_group_students_active_enrollment"
      ON "group_students" ("enrollment_id")
      WHERE "status" = 'ACTIVE' AND "enrollment_id" IS NOT NULL
    `);
        await queryRunner.query('CREATE INDEX "IDX_group_students_enrollment" ON "group_students" ("enrollment_id")');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX "IDX_group_students_enrollment"');
        await queryRunner.query('DROP INDEX "UQ_group_students_active_enrollment"');
        await queryRunner.query('ALTER TABLE "group_students" DROP CONSTRAINT "FK_group_students_enrollment"');
        await queryRunner.query('ALTER TABLE "group_students" DROP COLUMN "enrollment_id"');
    }
}
//# sourceMappingURL=20261112130000-GroupEnrollmentLink.js.map