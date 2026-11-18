import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Attendance20261104200000 implements MigrationInterface {
  name = 'Attendance20261104200000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "attendance_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "session_id" uuid NOT NULL REFERENCES "lesson_sessions"("id") ON DELETE RESTRICT,
      "status" varchar(16) NOT NULL DEFAULT 'NOT_STARTED', "finalized_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "finalized_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_attendance_sessions_status" CHECK ("status" IN ('NOT_STARTED','IN_PROGRESS','FINALIZED','REOPENED')),
      CONSTRAINT "UQ_attendance_sessions_lesson_session" UNIQUE ("session_id")
    )`);
    await q.query(`CREATE TABLE "attendances" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "session_id" uuid NOT NULL REFERENCES "lesson_sessions"("id") ON DELETE RESTRICT,
      "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "membership_id" uuid NOT NULL REFERENCES "group_students"("id") ON DELETE RESTRICT,
      "status" varchar(12) NOT NULL, "lateness_minutes" integer, "reason" text, "teacher_note" text,
      "marked_by_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "marked_at" timestamptz NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_attendances_status" CHECK ("status" IN ('PRESENT','ABSENT','LATE','EXCUSED')),
      CONSTRAINT "CHK_attendances_lateness" CHECK (("status"='LATE' AND "lateness_minutes" IS NOT NULL AND "lateness_minutes">0) OR ("status"<>'LATE' AND ("lateness_minutes" IS NULL OR "lateness_minutes"=0))),
      CONSTRAINT "CHK_attendances_excuse_reason" CHECK ("status"<>'EXCUSED' OR ("reason" IS NOT NULL AND length(trim("reason"))>0)),
      CONSTRAINT "UQ_attendances_session_student" UNIQUE ("session_id","student_id")
    )`);
    await q.query(
      `CREATE INDEX "IDX_attendances_student_marked" ON "attendances"("student_id","marked_at" DESC)`,
    );
    await q.query(
      `CREATE INDEX "IDX_attendances_session_status" ON "attendances"("session_id","status")`,
    );
    await q.query(
      `CREATE INDEX "IDX_attendances_membership" ON "attendances"("membership_id")`,
    );
    await q.query(`CREATE TABLE "attendance_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "attendance_id" uuid REFERENCES "attendances"("id") ON DELETE RESTRICT,
      "session_id" uuid NOT NULL REFERENCES "lesson_sessions"("id") ON DELETE RESTRICT, "action" varchar(12) NOT NULL,
      "previous_status" varchar(12), "new_status" varchar(12), "previous_lateness_minutes" integer, "new_lateness_minutes" integer,
      "change_reason" text, "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_attendance_history_action" CHECK ("action" IN ('CREATED','UPDATED','FINALIZED','REOPENED')),
      CONSTRAINT "CHK_attendance_history_previous_status" CHECK ("previous_status" IS NULL OR "previous_status" IN ('PRESENT','ABSENT','LATE','EXCUSED')),
      CONSTRAINT "CHK_attendance_history_new_status" CHECK ("new_status" IS NULL OR "new_status" IN ('PRESENT','ABSENT','LATE','EXCUSED'))
    )`);
    await q.query(
      `CREATE INDEX "IDX_attendance_history_attendance_created" ON "attendance_history"("attendance_id","created_at")`,
    );
    await q.query(
      `CREATE INDEX "IDX_attendance_history_session_created" ON "attendance_history"("session_id","created_at")`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE "attendance_history"');
    await q.query('DROP TABLE "attendances"');
    await q.query('DROP TABLE "attendance_sessions"');
  }
}
