export class Assignments20261104210000 {
    name = 'Assignments20261104210000';
    async up(q) {
        await q.query(`CREATE TABLE "assignments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" varchar(180) NOT NULL, "description" text NOT NULL, "instructions" text,
      "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
      "lesson_id" uuid REFERENCES "lessons"("id") ON DELETE RESTRICT,
      "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE RESTRICT,
      "created_by_teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "max_score" numeric(10,2) NOT NULL, "due_at" timestamptz,
      "status" varchar(12) NOT NULL DEFAULT 'DRAFT', "allow_late_submission" boolean NOT NULL DEFAULT false,
      "allow_resubmission" boolean NOT NULL DEFAULT true, "allow_resubmission_after_graded" boolean NOT NULL DEFAULT false,
      "published_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignments_status" CHECK ("status" IN ('DRAFT','PUBLISHED','ARCHIVED')),
      CONSTRAINT "CHK_assignments_max_score" CHECK ("max_score">0)
    )`);
        await q.query(`CREATE INDEX "IDX_assignments_group_status_due" ON "assignments"("group_id","status","due_at")`);
        await q.query(`CREATE INDEX "IDX_assignments_course_status" ON "assignments"("course_id","status")`);
        await q.query(`CREATE INDEX "IDX_assignments_creator_created" ON "assignments"("created_by_teacher_id","created_at" DESC)`);
        await q.query(`CREATE TABLE "assignment_attachments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "assignment_id" uuid NOT NULL REFERENCES "assignments"("id") ON DELETE RESTRICT,
      "file_name" varchar(255) NOT NULL, "mime_type" varchar(120) NOT NULL, "file_size" integer NOT NULL,
      "storage_key" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignment_attachments_file_size" CHECK ("file_size">0 AND "file_size"<=52428800)
    )`);
        await q.query(`CREATE INDEX "IDX_assignment_attachments_assignment_created" ON "assignment_attachments"("assignment_id","created_at")`);
        await q.query(`CREATE UNIQUE INDEX "UQ_assignment_attachments_storage_key" ON "assignment_attachments"("storage_key")`);
        await q.query(`CREATE TABLE "assignment_submissions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "assignment_id" uuid NOT NULL REFERENCES "assignments"("id") ON DELETE RESTRICT,
      "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "membership_id" uuid NOT NULL REFERENCES "group_students"("id") ON DELETE RESTRICT,
      "submitted_at" timestamptz NOT NULL, "text_answer" text, "status" varchar(12) NOT NULL,
      "is_late" boolean NOT NULL DEFAULT false, "current_version" integer NOT NULL DEFAULT 1,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignment_submissions_status" CHECK ("status" IN ('SUBMITTED','LATE','GRADED','RETURNED')),
      CONSTRAINT "CHK_assignment_submissions_version" CHECK ("current_version">0),
      CONSTRAINT "CHK_assignment_submissions_late_status" CHECK ("status"<>'LATE' OR "is_late"=true),
      CONSTRAINT "UQ_assignment_submissions_assignment_student" UNIQUE ("assignment_id","student_id")
    )`);
        await q.query(`CREATE INDEX "IDX_assignment_submissions_student_submitted" ON "assignment_submissions"("student_id","submitted_at" DESC)`);
        await q.query(`CREATE INDEX "IDX_assignment_submissions_assignment_status" ON "assignment_submissions"("assignment_id","status")`);
        await q.query(`CREATE INDEX "IDX_assignment_submissions_membership" ON "assignment_submissions"("membership_id")`);
        await q.query(`CREATE TABLE "assignment_submission_revisions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "submission_id" uuid NOT NULL REFERENCES "assignment_submissions"("id") ON DELETE RESTRICT,
      "version_number" integer NOT NULL, "idempotency_key" varchar(100) NOT NULL, "text_answer" text,
      "submitted_at" timestamptz NOT NULL, "is_late" boolean NOT NULL DEFAULT false, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignment_submission_revisions_version" CHECK ("version_number">0),
      CONSTRAINT "UQ_assignment_submission_revisions_number" UNIQUE ("submission_id","version_number"),
      CONSTRAINT "UQ_assignment_submission_revisions_idempotency" UNIQUE ("submission_id","idempotency_key")
    )`);
        await q.query(`CREATE INDEX "IDX_assignment_submission_revisions_submission_created" ON "assignment_submission_revisions"("submission_id","created_at" DESC)`);
        await q.query(`CREATE TABLE "assignment_submission_attachments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "submission_id" uuid NOT NULL REFERENCES "assignment_submissions"("id") ON DELETE RESTRICT,
      "revision_id" uuid NOT NULL REFERENCES "assignment_submission_revisions"("id") ON DELETE RESTRICT,
      "file_name" varchar(255) NOT NULL, "mime_type" varchar(120) NOT NULL, "file_size" integer NOT NULL,
      "storage_key" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignment_submission_attachments_file_size" CHECK ("file_size">0 AND "file_size"<=52428800)
    )`);
        await q.query(`CREATE INDEX "IDX_assignment_submission_attachments_revision_created" ON "assignment_submission_attachments"("revision_id","created_at")`);
        await q.query(`CREATE UNIQUE INDEX "UQ_assignment_submission_attachments_storage_key" ON "assignment_submission_attachments"("storage_key")`);
        await q.query(`CREATE TABLE "assignment_submission_reviews" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "submission_id" uuid NOT NULL REFERENCES "assignment_submissions"("id") ON DELETE RESTRICT,
      "reviewed_by_teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "action" varchar(8) NOT NULL, "score" numeric(10,2), "feedback" text NOT NULL,
      "reviewed_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_assignment_submission_reviews_action" CHECK ("action" IN ('GRADED','RETURNED')),
      CONSTRAINT "CHK_assignment_submission_reviews_score" CHECK (("score" IS NULL OR "score">=0) AND (("action"='GRADED' AND "score" IS NOT NULL) OR ("action"='RETURNED' AND "score" IS NULL)))
    )`);
        await q.query(`CREATE INDEX "IDX_assignment_submission_reviews_submission_reviewed" ON "assignment_submission_reviews"("submission_id","reviewed_at" DESC)`);
    }
    async down(q) {
        await q.query('DROP TABLE "assignment_submission_reviews"');
        await q.query('DROP TABLE "assignment_submission_attachments"');
        await q.query('DROP TABLE "assignment_submission_revisions"');
        await q.query('DROP TABLE "assignment_submissions"');
        await q.query('DROP TABLE "assignment_attachments"');
        await q.query('DROP TABLE "assignments"');
    }
}
//# sourceMappingURL=20261104210000-Assignments.js.map