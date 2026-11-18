export class NotificationsAndDeviceTokens20261104180000 {
    name = 'NotificationsAndDeviceTokens20261104180000';
    async up(q) {
        await q.query(`CREATE TABLE "notifications" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipient_user_id" uuid NOT NULL,
      "type" varchar(80) NOT NULL, "title" varchar(160) NOT NULL, "body" varchar(1000) NOT NULL,
      "related_entity_id" uuid NULL, "metadata" jsonb NULL, "event_key" varchar(200) NULL,
      "read_at" timestamptz NULL, "delivery_status" varchar(20) NOT NULL DEFAULT 'pending',
      "delivered_at" timestamptz NULL, "delivery_error_code" varchar(100) NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_notifications_recipient" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
      CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('GENERAL','COURSE_PUBLISHED','NEW_LESSON','LESSON_UPDATED','TEST_AVAILABLE','TEST_RESULT','PAYMENT_SUCCESS','PAYMENT_FAILED','PAYMENT_CANCELLED','ENROLLMENT_CREATED','SCHEDULE_UPDATED','ANNOUNCEMENT')),
      CONSTRAINT "CHK_notifications_delivery_status" CHECK ("delivery_status" IN ('pending','sending','sent','failed','unavailable'))
    )`);
        await q.query(`CREATE UNIQUE INDEX "UQ_notifications_event_key" ON "notifications" ("event_key")`);
        await q.query(`CREATE INDEX "IDX_notifications_recipient_created" ON "notifications" ("recipient_user_id", "created_at" DESC)`);
        await q.query(`CREATE INDEX "IDX_notifications_recipient_read_created" ON "notifications" ("recipient_user_id", "read_at", "created_at" DESC)`);
        await q.query(`CREATE TABLE "device_tokens" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL,
      "token" text NOT NULL, "platform" varchar(10) NOT NULL, "device_name" varchar(100) NULL,
      "is_active" boolean NOT NULL DEFAULT true, "last_seen_at" timestamptz NOT NULL DEFAULT now(),
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_device_tokens_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_device_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
      CONSTRAINT "CHK_device_tokens_platform" CHECK ("platform" IN ('ANDROID','IOS'))
    )`);
        await q.query(`CREATE UNIQUE INDEX "UQ_device_tokens_active_token" ON "device_tokens" ("token") WHERE "is_active" = true`);
        await q.query(`CREATE INDEX "IDX_device_tokens_user_active" ON "device_tokens" ("user_id", "is_active")`);
    }
    async down(q) {
        await q.query('DROP TABLE "device_tokens"');
        await q.query('DROP TABLE "notifications"');
    }
}
//# sourceMappingURL=20261104180000-NotificationsAndDeviceTokens.js.map