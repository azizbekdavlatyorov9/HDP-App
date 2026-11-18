export class CourseDuration20261112090000 {
    name = 'CourseDuration20261112090000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "courses" ADD COLUMN "duration" integer;
      ALTER TABLE "courses"
        ADD CONSTRAINT "CHK_courses_duration"
        CHECK ("duration" IS NULL OR "duration" > 0);
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "courses" DROP CONSTRAINT "CHK_courses_duration";
      ALTER TABLE "courses" DROP COLUMN "duration";
    `);
    }
}
//# sourceMappingURL=20261112090000-CourseDuration.js.map