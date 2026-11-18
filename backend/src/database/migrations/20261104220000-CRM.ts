import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CRM20261104220000 implements MigrationInterface {
  name='CRM20261104220000';
  async up(q:QueryRunner):Promise<void>{
    await q.query(`CREATE TABLE "crm_leads" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "full_name" varchar(160) NOT NULL,
      "phone_number" varchar(20) NOT NULL, "email" varchar(254), "source" varchar(16) NOT NULL,
      "status" varchar(20) NOT NULL DEFAULT 'NEW', "interested_course_id" uuid REFERENCES "courses"("id") ON DELETE SET NULL,
      "assigned_to_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "created_by_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "converted_student_user_id" uuid REFERENCES "users"("id") ON DELETE RESTRICT,
      "lost_reason" varchar(1000), "notes" text, "next_follow_up_at" timestamptz, "last_contacted_at" timestamptz,
      "converted_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_crm_leads_source" CHECK ("source" IN ('WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER')),
      CONSTRAINT "CHK_crm_leads_status" CHECK ("status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST')),
      CONSTRAINT "CHK_crm_leads_phone_e164" CHECK ("phone_number" ~ '^\\+[1-9][0-9]{7,14}$'),
      CONSTRAINT "CHK_crm_leads_lost_reason" CHECK ("status"<>'LOST' OR ("lost_reason" IS NOT NULL AND length(trim("lost_reason"))>0)),
      CONSTRAINT "CHK_crm_leads_conversion" CHECK ("status"<>'WON' OR ("converted_student_user_id" IS NOT NULL AND "converted_at" IS NOT NULL))
    )`);
    await q.query(`CREATE UNIQUE INDEX "UQ_crm_leads_active_phone" ON "crm_leads"("phone_number") WHERE "status" NOT IN ('WON','LOST')`);
    await q.query(`CREATE INDEX "IDX_crm_leads_status_created" ON "crm_leads"("status","created_at" DESC)`);
    await q.query(`CREATE INDEX "IDX_crm_leads_source_created" ON "crm_leads"("source","created_at" DESC)`);
    await q.query(`CREATE INDEX "IDX_crm_leads_assigned_status_followup" ON "crm_leads"("assigned_to_user_id","status","next_follow_up_at")`);
    await q.query(`CREATE INDEX "IDX_crm_leads_course_status" ON "crm_leads"("interested_course_id","status")`);
    await q.query(`CREATE INDEX "IDX_crm_leads_followup" ON "crm_leads"("next_follow_up_at","status")`);
    await q.query(`CREATE TABLE "crm_lead_activities" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "lead_id" uuid NOT NULL REFERENCES "crm_leads"("id") ON DELETE RESTRICT,
      "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "type" varchar(20) NOT NULL,
      "description" varchar(3000) NOT NULL, "metadata" jsonb, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_crm_lead_activities_type" CHECK ("type" IN ('CALL','MESSAGE','EMAIL','MEETING','NOTE','STATUS_CHANGE','ASSIGNMENT_CHANGE','OTHER')),
      CONSTRAINT "CHK_crm_lead_activities_metadata_size" CHECK ("metadata" IS NULL OR octet_length("metadata"::text)<=8192)
    )`);
    await q.query(`CREATE INDEX "IDX_crm_lead_activities_lead_created" ON "crm_lead_activities"("lead_id","created_at" DESC)`);
    await q.query(`CREATE INDEX "IDX_crm_lead_activities_actor_created" ON "crm_lead_activities"("actor_user_id","created_at" DESC)`);
    await q.query(`CREATE TABLE "crm_lead_status_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "lead_id" uuid NOT NULL REFERENCES "crm_leads"("id") ON DELETE RESTRICT,
      "previous_status" varchar(20), "new_status" varchar(20) NOT NULL,
      "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "change_reason" varchar(1000),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_crm_lead_status_history_new_status" CHECK ("new_status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST'))
    )`);
    await q.query(`CREATE INDEX "IDX_crm_lead_status_history_lead_created" ON "crm_lead_status_history"("lead_id","created_at" DESC)`);
    await q.query(`CREATE TABLE "crm_trial_lessons" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "lead_id" uuid NOT NULL REFERENCES "crm_leads"("id") ON DELETE RESTRICT,
      "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
      "group_id" uuid REFERENCES "study_groups"("id") ON DELETE RESTRICT,
      "session_id" uuid REFERENCES "lesson_sessions"("id") ON DELETE RESTRICT,
      "scheduled_at" timestamptz NOT NULL, "status" varchar(12) NOT NULL DEFAULT 'SCHEDULED',
      "result" varchar(2000), "feedback" varchar(5000), "created_by_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_crm_trial_lessons_status" CHECK ("status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED'))
    )`);
    await q.query(`CREATE INDEX "IDX_crm_trial_lessons_lead_scheduled" ON "crm_trial_lessons"("lead_id","scheduled_at" DESC)`);
    await q.query(`CREATE INDEX "IDX_crm_trial_lessons_course_scheduled" ON "crm_trial_lessons"("course_id","scheduled_at")`);
    await q.query(`CREATE INDEX "IDX_crm_trial_lessons_group_scheduled" ON "crm_trial_lessons"("group_id","scheduled_at")`);
    await q.query(`CREATE INDEX "IDX_crm_trial_lessons_status_scheduled" ON "crm_trial_lessons"("status","scheduled_at")`);
    await q.query(`CREATE TABLE "crm_trial_lesson_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "trial_lesson_id" uuid NOT NULL REFERENCES "crm_trial_lessons"("id") ON DELETE RESTRICT,
      "previous_status" varchar(12), "new_status" varchar(12), "previous_scheduled_at" timestamptz, "new_scheduled_at" timestamptz,
      "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL, "change_reason" varchar(1000), "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_crm_trial_lesson_history_previous_status" CHECK ("previous_status" IS NULL OR "previous_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')),
      CONSTRAINT "CHK_crm_trial_lesson_history_new_status" CHECK ("new_status" IS NULL OR "new_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED'))
    )`);
    await q.query(`CREATE INDEX "IDX_crm_trial_lesson_history_trial_created" ON "crm_trial_lesson_history"("trial_lesson_id","created_at" DESC)`);
  }
  async down(q:QueryRunner):Promise<void>{
    await q.query('DROP TABLE "crm_trial_lesson_history"');
    await q.query('DROP TABLE "crm_trial_lessons"');
    await q.query('DROP TABLE "crm_lead_status_history"');
    await q.query('DROP TABLE "crm_lead_activities"');
    await q.query('DROP TABLE "crm_leads"');
  }
}
