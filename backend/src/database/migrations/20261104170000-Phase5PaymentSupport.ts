import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Additive support for Phase 4 category archival and Click Shop API prepare IDs. */
export class Phase5PaymentSupport20261104170000 implements MigrationInterface {
  name = 'Phase5PaymentSupport20261104170000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN "archived_at" timestamptz`);
    await queryRunner.query(`CREATE SEQUENCE "click_prepare_id_seq" AS bigint`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ADD COLUMN "click_prepare_id" bigint`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ADD COLUMN "provider_created_at" timestamptz`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ADD COLUMN "provider_performed_at" timestamptz`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ADD COLUMN "provider_cancelled_at" timestamptz`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ADD COLUMN "provider_cancel_reason" integer`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ALTER COLUMN "click_prepare_id" SET DEFAULT nextval('"click_prepare_id_seq"')`);
    await queryRunner.query(`ALTER SEQUENCE "click_prepare_id_seq" OWNED BY "payment_transactions"."click_prepare_id"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_payment_transactions_click_prepare" ON "payment_transactions" ("click_prepare_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_payment_transactions_click_prepare"`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" ALTER COLUMN "click_prepare_id" DROP DEFAULT`);
    await queryRunner.query(`ALTER SEQUENCE "click_prepare_id_seq" OWNED BY NONE`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "provider_cancelled_at"`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "provider_cancel_reason"`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "provider_performed_at"`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "provider_created_at"`);
    await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "click_prepare_id"`);
    await queryRunner.query(`DROP SEQUENCE "click_prepare_id_seq"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "archived_at"`);
  }
}
