import type { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupsScheduling20261104190000 implements MigrationInterface {
  name = 'GroupsScheduling20261104190000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "study_groups" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(140) NOT NULL, "code" varchar(40) NOT NULL UNIQUE,
      "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
      "lead_teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "description" text, "capacity" integer NOT NULL, "status" varchar(16) NOT NULL DEFAULT 'DRAFT',
      "start_date" date NOT NULL, "end_date" date, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_study_groups_status" CHECK ("status" IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED')),
      CONSTRAINT "CHK_study_groups_capacity" CHECK ("capacity" > 0),
      CONSTRAINT "CHK_study_groups_date_range" CHECK ("end_date" IS NULL OR "end_date" >= "start_date")
    )`);
    await q.query(`CREATE INDEX "IDX_study_groups_course_status" ON "study_groups"("course_id","status")`);
    await q.query(`CREATE INDEX "IDX_study_groups_teacher_status" ON "study_groups"("lead_teacher_id","status")`);
    await q.query(`CREATE TABLE "group_students" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE RESTRICT,
      "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "status" varchar(16) NOT NULL DEFAULT 'ACTIVE', "changed_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "joined_at" timestamptz NOT NULL DEFAULT now(), "ended_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_group_students_status" CHECK ("status" IN ('ACTIVE','COMPLETED','LEFT','REMOVED'))
    )`);
    await q.query(`CREATE UNIQUE INDEX "UQ_group_students_active_pair" ON "group_students"("group_id","student_id") WHERE "status"='ACTIVE'`);
    await q.query(`CREATE INDEX "IDX_group_students_student_status" ON "group_students"("student_id","status")`);
    await q.query(`CREATE INDEX "IDX_group_students_group_status" ON "group_students"("group_id","status")`);
    await q.query(`CREATE TABLE "classrooms" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(140) NOT NULL, "code" varchar(40) NOT NULL UNIQUE,
      "location" varchar(200), "capacity" integer NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "CHK_classrooms_capacity" CHECK ("capacity">0)
    )`);
    await q.query(`CREATE INDEX "IDX_classrooms_active" ON "classrooms"("is_active")`);
    await q.query(`CREATE TABLE "group_schedules" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE RESTRICT,
      "weekday" smallint NOT NULL, "start_time" time NOT NULL, "end_time" time NOT NULL,
      "effective_start_date" date NOT NULL, "effective_end_date" date,
      "classroom_id" uuid NOT NULL REFERENCES "classrooms"("id") ON DELETE RESTRICT,
      "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "timezone" varchar(64) NOT NULL DEFAULT 'Asia/Tashkent', "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_group_schedules_weekday" CHECK ("weekday" BETWEEN 0 AND 6),
      CONSTRAINT "CHK_group_schedules_time_range" CHECK ("start_time" < "end_time"),
      CONSTRAINT "CHK_group_schedules_date_range" CHECK ("effective_end_date" IS NULL OR "effective_end_date" >= "effective_start_date")
    )`);
    await q.query(`CREATE INDEX "IDX_group_schedules_group_active" ON "group_schedules"("group_id","is_active")`);
    await q.query(`CREATE INDEX "IDX_group_schedules_teacher_weekday" ON "group_schedules"("teacher_id","weekday","is_active")`);
    await q.query(`CREATE INDEX "IDX_group_schedules_classroom_weekday" ON "group_schedules"("classroom_id","weekday","is_active")`);
    await q.query(`CREATE TABLE "lesson_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "schedule_id" uuid NOT NULL REFERENCES "group_schedules"("id") ON DELETE RESTRICT,
      "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE RESTRICT,
      "classroom_id" uuid NOT NULL REFERENCES "classrooms"("id") ON DELETE RESTRICT,
      "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "start_at" timestamptz NOT NULL, "end_at" timestamptz NOT NULL, "original_start_at" timestamptz NOT NULL, "original_end_at" timestamptz NOT NULL,
      "status" varchar(16) NOT NULL DEFAULT 'SCHEDULED', "change_note" varchar(500),
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_lesson_sessions_status" CHECK ("status" IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
      CONSTRAINT "CHK_lesson_sessions_time_range" CHECK ("start_at" < "end_at")
    )`);
    await q.query(`CREATE UNIQUE INDEX "UQ_lesson_sessions_schedule_original_start" ON "lesson_sessions"("schedule_id","original_start_at")`);
    await q.query(`CREATE INDEX "IDX_lesson_sessions_group_start" ON "lesson_sessions"("group_id","start_at")`);
    await q.query(`CREATE INDEX "IDX_lesson_sessions_teacher_start" ON "lesson_sessions"("teacher_id","start_at")`);
    await q.query(`CREATE INDEX "IDX_lesson_sessions_classroom_start" ON "lesson_sessions"("classroom_id","start_at")`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE "lesson_sessions"');
    await q.query('DROP TABLE "group_schedules"');
    await q.query('DROP TABLE "classrooms"');
    await q.query('DROP TABLE "group_students"');
    await q.query('DROP TABLE "study_groups"');
  }
}
