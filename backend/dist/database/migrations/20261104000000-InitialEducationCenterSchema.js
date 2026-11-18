export class InitialEducationCenterSchema20261104000000 {
    name = 'InitialEducationCenterSchema20261104000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "display_name" varchar(100) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "CHK_users_status" CHECK ("status" IN ('active', 'suspended', 'deleted'))
      );

      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(30) NOT NULL,
        "description" varchar(200),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_code" UNIQUE ("code")
      );

      INSERT INTO "roles" ("code", "description") VALUES
        ('SUPER_ADMIN', 'Full system administration'),
        ('ADMIN', 'Education center administration'),
        ('TEACHER', 'Course instructor'),
        ('STUDENT', 'Enrolled learner');

      CREATE TABLE "user_roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_roles_user_role" UNIQUE ("user_id", "role_id")
      );

      CREATE TABLE "auth_identities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider" varchar(20) NOT NULL,
        "provider_subject" varchar(255) NOT NULL,
        "verified_at" timestamptz,
        "metadata" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_auth_identities_provider" CHECK ("provider" IN ('telegram', 'phone')),
        CONSTRAINT "UQ_auth_identities_provider_subject" UNIQUE ("provider", "provider_subject")
      );

      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" char(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "replaced_by_id" uuid REFERENCES "refresh_tokens"("id") ON DELETE SET NULL,
        "user_agent" text,
        "ip_address" inet,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_tokens_hash" UNIQUE ("token_hash")
      );

      CREATE TABLE "phone_verifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "phone_number" varchar(20) NOT NULL,
        "code_hash" char(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "attempt_count" smallint NOT NULL DEFAULT 0,
        "consumed_at" timestamptz,
        "requested_from_ip" inet,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_phone_verifications_attempt_count" CHECK ("attempt_count" >= 0)
      );

      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "slug" varchar(140) NOT NULL,
        "description" text,
        "parent_id" uuid REFERENCES "categories"("id") ON DELETE SET NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      );

      CREATE TABLE "courses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "lead_teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "title" varchar(180) NOT NULL,
        "slug" varchar(200) NOT NULL,
        "description" text,
        "thumbnail_url" text,
        "price_minor" bigint NOT NULL,
        "currency" char(3) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_courses_status" CHECK ("status" IN ('draft', 'published', 'archived')),
        CONSTRAINT "CHK_courses_price_minor" CHECK ("price_minor" >= 0),
        CONSTRAINT "UQ_courses_slug" UNIQUE ("slug")
      );

      CREATE TABLE "course_categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_course_categories_course_category" UNIQUE ("course_id", "category_id")
      );

      CREATE TABLE "lessons" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "title" varchar(180) NOT NULL,
        "description" text,
        "position" integer NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "is_free" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_lessons_status" CHECK ("status" IN ('draft', 'published', 'archived')),
        CONSTRAINT "UQ_lessons_course_position" UNIQUE ("course_id", "position")
      );

      CREATE TABLE "lesson_prerequisites" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
        "prerequisite_lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_lesson_prerequisites_not_self" CHECK ("lesson_id" <> "prerequisite_lesson_id"),
        CONSTRAINT "UQ_lesson_prerequisites_pair" UNIQUE ("lesson_id", "prerequisite_lesson_id")
      );

      CREATE TABLE "videos" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE RESTRICT,
        "initiated_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "cloudflare_uid" varchar(100) NOT NULL,
        "position" integer NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'initiated',
        "duration_seconds" integer,
        "metadata" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_videos_status" CHECK ("status" IN ('initiated', 'uploading', 'processing', 'ready', 'error')),
        CONSTRAINT "UQ_videos_lesson_position" UNIQUE ("lesson_id", "position"),
        CONSTRAINT "UQ_videos_cloudflare_uid" UNIQUE ("cloudflare_uid")
      );

      CREATE TABLE "enrollments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "source" varchar(20) NOT NULL,
        "enrolled_at" timestamptz NOT NULL,
        "expires_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_enrollments_status" CHECK ("status" IN ('active', 'completed', 'revoked')),
        CONSTRAINT "CHK_enrollments_source" CHECK ("source" IN ('manual', 'payment', 'admin')),
        CONSTRAINT "UQ_enrollments_user_course" UNIQUE ("user_id", "course_id")
      );

      CREATE TABLE "tests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_id" uuid REFERENCES "courses"("id") ON DELETE RESTRICT,
        "lesson_id" uuid REFERENCES "lessons"("id") ON DELETE RESTRICT,
        "title" varchar(180) NOT NULL,
        "description" text,
        "passing_score" smallint NOT NULL,
        "time_limit_seconds" integer,
        "attempt_limit" smallint,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_tests_exactly_one_parent" CHECK (("course_id" IS NULL) <> ("lesson_id" IS NULL)),
        CONSTRAINT "CHK_tests_passing_score" CHECK ("passing_score" BETWEEN 0 AND 100),
        CONSTRAINT "CHK_tests_status" CHECK ("status" IN ('draft', 'published', 'archived')),
        CONSTRAINT "CHK_tests_time_limit" CHECK ("time_limit_seconds" IS NULL OR "time_limit_seconds" > 0),
        CONSTRAINT "CHK_tests_attempt_limit" CHECK ("attempt_limit" IS NULL OR "attempt_limit" > 0)
      );

      CREATE TABLE "questions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "test_id" uuid NOT NULL REFERENCES "tests"("id") ON DELETE CASCADE,
        "prompt" text NOT NULL,
        "position" integer NOT NULL,
        "points" integer NOT NULL DEFAULT 1,
        "allow_multiple_answers" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_questions_points" CHECK ("points" > 0),
        CONSTRAINT "UQ_questions_test_position" UNIQUE ("test_id", "position")
      );

      CREATE TABLE "answer_options" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
        "text" text NOT NULL,
        "position" integer NOT NULL,
        "is_correct" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_answer_options_question_position" UNIQUE ("question_id", "position")
      );

      CREATE TABLE "test_attempts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "test_id" uuid NOT NULL REFERENCES "tests"("id") ON DELETE RESTRICT,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "attempt_number" smallint NOT NULL,
        "started_at" timestamptz NOT NULL,
        "submitted_at" timestamptz,
        "score_percent" smallint,
        "passed" boolean,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_test_attempts_score_percent" CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
        CONSTRAINT "UQ_test_attempts_test_user_number" UNIQUE ("test_id", "user_id", "attempt_number")
      );

      CREATE TABLE "student_answers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "attempt_id" uuid NOT NULL REFERENCES "test_attempts"("id") ON DELETE RESTRICT,
        "question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE RESTRICT,
        "is_correct_snapshot" boolean,
        "awarded_points" integer,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_student_answers_attempt_question" UNIQUE ("attempt_id", "question_id")
      );

      CREATE TABLE "student_answer_options" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_answer_id" uuid NOT NULL REFERENCES "student_answers"("id") ON DELETE CASCADE,
        "answer_option_id" uuid NOT NULL REFERENCES "answer_options"("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_student_answer_options_pair" UNIQUE ("student_answer_id", "answer_option_id")
      );

      CREATE TABLE "lesson_progress" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE RESTRICT,
        "watched_seconds" integer NOT NULL DEFAULT 0,
        "watched_percent" smallint NOT NULL DEFAULT 0,
        "last_accessed_at" timestamptz,
        "completed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_lesson_progress_watched_seconds" CHECK ("watched_seconds" >= 0),
        CONSTRAINT "CHK_lesson_progress_watched_percent" CHECK ("watched_percent" BETWEEN 0 AND 100),
        CONSTRAINT "UQ_lesson_progress_user_lesson" UNIQUE ("user_id", "lesson_id")
      );

      CREATE TABLE "course_progress" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "lessons_completed" integer NOT NULL DEFAULT 0,
        "lessons_total" integer NOT NULL DEFAULT 0,
        "completion_percent" smallint NOT NULL DEFAULT 0,
        "completed_at" timestamptz,
        "calculated_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_course_progress_counts" CHECK ("lessons_completed" >= 0 AND "lessons_total" >= 0),
        CONSTRAINT "CHK_course_progress_percent" CHECK ("completion_percent" BETWEEN 0 AND 100),
        CONSTRAINT "UQ_course_progress_user_course" UNIQUE ("user_id", "course_id")
      );

      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "amount_minor" bigint NOT NULL,
        "currency" char(3) NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'pending',
        "idempotency_key" varchar(128) NOT NULL,
        "paid_at" timestamptz,
        "refunded_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_payments_status" CHECK ("status" IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded')),
        CONSTRAINT "CHK_payments_amount_minor" CHECK ("amount_minor" >= 0),
        CONSTRAINT "UQ_payments_user_idempotency" UNIQUE ("user_id", "idempotency_key")
      );

      CREATE TABLE "payment_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE RESTRICT,
        "provider" varchar(16) NOT NULL,
        "provider_transaction_id" varchar(200),
        "provider_event_id" varchar(200),
        "status" varchar(20) NOT NULL,
        "event_type" varchar(80),
        "occurred_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_payment_transactions_provider" CHECK ("provider" IN ('payme', 'click')),
        CONSTRAINT "CHK_payment_transactions_status" CHECK ("status" IN ('initiated', 'pending', 'succeeded', 'failed', 'refunded')),
        CONSTRAINT "UQ_payment_transactions_provider_tx" UNIQUE ("provider", "provider_transaction_id"),
        CONSTRAINT "UQ_payment_transactions_provider_event" UNIQUE ("provider", "provider_event_id")
      );

      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "action" varchar(120) NOT NULL,
        "resource_type" varchar(100) NOT NULL,
        "resource_id" uuid,
        "request_id" varchar(100),
        "source_ip" inet,
        "before_state" jsonb,
        "after_state" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX "IDX_user_roles_role" ON "user_roles" ("role_id");
      CREATE INDEX "IDX_auth_identities_user" ON "auth_identities" ("user_id");
      CREATE INDEX "IDX_refresh_tokens_user_expiry" ON "refresh_tokens" ("user_id", "expires_at");
      CREATE INDEX "IDX_refresh_tokens_replaced_by" ON "refresh_tokens" ("replaced_by_id");
      CREATE INDEX "IDX_phone_verifications_phone_created" ON "phone_verifications" ("phone_number", "created_at");
      CREATE INDEX "IDX_courses_lead_teacher" ON "courses" ("lead_teacher_id");
      CREATE INDEX "IDX_courses_status_created" ON "courses" ("status", "created_at");
      CREATE INDEX "IDX_course_categories_category" ON "course_categories" ("category_id");
      CREATE INDEX "IDX_lessons_course_status_position" ON "lessons" ("course_id", "status", "position");
      CREATE INDEX "IDX_lesson_prerequisites_prerequisite" ON "lesson_prerequisites" ("prerequisite_lesson_id");
      CREATE INDEX "IDX_enrollments_course_status" ON "enrollments" ("course_id", "status");
      CREATE INDEX "IDX_tests_course_status" ON "tests" ("course_id", "status");
      CREATE INDEX "IDX_tests_lesson_status" ON "tests" ("lesson_id", "status");
      CREATE INDEX "IDX_test_attempts_user_started" ON "test_attempts" ("user_id", "started_at");
      CREATE INDEX "IDX_lesson_progress_lesson" ON "lesson_progress" ("lesson_id");
      CREATE INDEX "IDX_course_progress_course" ON "course_progress" ("course_id");
      CREATE INDEX "IDX_payments_course_status_created" ON "payments" ("course_id", "status", "created_at");
      CREATE INDEX "IDX_payments_user_created" ON "payments" ("user_id", "created_at");
      CREATE INDEX "IDX_payment_transactions_payment_created" ON "payment_transactions" ("payment_id", "created_at");
      CREATE INDEX "IDX_audit_logs_created" ON "audit_logs" ("created_at");
      CREATE INDEX "IDX_audit_logs_actor_created" ON "audit_logs" ("actor_user_id", "created_at");
      CREATE INDEX "IDX_audit_logs_resource" ON "audit_logs" ("resource_type", "resource_id", "created_at");
    `);
    }
    async down(_queryRunner) {
        throw new Error('This initial schema migration is forward-only to protect stored data. Create a reviewed forward migration to make schema changes.');
    }
}
//# sourceMappingURL=20261104000000-InitialEducationCenterSchema.js.map