export class Subjects20261112100000 {
    name = 'Subjects20261112100000';
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "subjects"`);
    }
}
//# sourceMappingURL=20261112100000-Subjects.js.map