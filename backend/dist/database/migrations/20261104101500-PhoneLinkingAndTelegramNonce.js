export class PhoneLinkingAndTelegramNonce20261104101500 {
    name = 'PhoneLinkingAndTelegramNonce20261104101500';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "phone_verifications"
        ADD COLUMN "purpose" varchar(10) NOT NULL DEFAULT 'login',
        ADD COLUMN "requested_for_user_id" uuid,
        ADD CONSTRAINT "FK_phone_verifications_requested_user"
          FOREIGN KEY ("requested_for_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "CHK_phone_verifications_purpose"
          CHECK ("purpose" IN ('login', 'link')),
        ADD CONSTRAINT "CHK_phone_verifications_purpose_user"
          CHECK (("purpose" = 'login' AND "requested_for_user_id" IS NULL) OR ("purpose" = 'link' AND "requested_for_user_id" IS NOT NULL));

      CREATE TABLE "auth_challenges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "provider" varchar(20) NOT NULL,
        "purpose" varchar(10) NOT NULL,
        "requested_for_user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "nonce_hash" char(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_auth_challenges_provider" CHECK ("provider" IN ('telegram')),
        CONSTRAINT "CHK_auth_challenges_purpose_user"
          CHECK (("purpose" = 'login' AND "requested_for_user_id" IS NULL) OR ("purpose" = 'link' AND "requested_for_user_id" IS NOT NULL)),
        CONSTRAINT "UQ_auth_challenges_nonce_hash" UNIQUE ("nonce_hash")
      );

      CREATE INDEX "IDX_auth_challenges_expiry" ON "auth_challenges" ("expires_at");
    `);
    }
    async down(_queryRunner) {
        throw new Error('This authentication migration is forward-only to protect verification history and replay-protection state.');
    }
}
//# sourceMappingURL=20261104101500-PhoneLinkingAndTelegramNonce.js.map