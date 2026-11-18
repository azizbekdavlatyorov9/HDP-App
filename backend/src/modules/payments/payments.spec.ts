import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  Payment,
  PaymentTransaction,
  Enrollment,
} from '../../database/entities/index.js';
import { AdminPaymentsController } from './payments.controller.js';
import { REQUIRED_ROLES } from '../../common/decorators/roles.decorator.js';
import { PaymeProvider } from './payme.provider.js';
import { ClickProvider } from './click.provider.js';
import { ClickCallbackService } from './click-callback.service.js';
import { PaymentsService } from './payments.service.js';

const user = { id: 'user-1', displayName: 'Student', status: 'active' };
const course = { id: 'course-1', title: 'Course' };
function clickFixture() {
  const payment = {
    id: 'payment-1',
    user,
    course,
    amountMinor: '10000',
    currency: 'UZS',
    status: 'processing',
    paidAt: null,
    refundedAt: null,
  };
  const tx = {
    id: 'tx-1',
    payment,
    provider: 'click',
    providerTransactionId: 'click-1',
    providerEventId: null,
    clickPrepareId: '42',
    status: 'pending',
    eventType: 'Prepare',
    occurredAt: new Date(),
  };
  const enrollment = {
    id: 'enrollment-1',
    user,
    course,
    status: 'active',
    source: 'payment',
  };
  const enrollmentRepo = {
    findOne: vi.fn(async () => null),
    create: vi.fn((x) => x),
    save: vi.fn(async (x) => x),
  };
  const txRepo = {
    findOne: vi.fn(async () => tx),
    save: vi.fn(async (x) => x),
  };
  const paymentRepo = {
    findOne: vi.fn(async () => payment),
    save: vi.fn(async (x) => x),
  };
  const manager = {
    getRepository: (entity: unknown) =>
      entity === PaymentTransaction
        ? txRepo
        : entity === Payment
          ? paymentRepo
          : entity === Enrollment
            ? enrollmentRepo
            : undefined,
    query: vi.fn(async () => undefined),
  };
  const db = { transaction: vi.fn(async (fn) => fn(manager)) };
  const provider = { verifySignature: vi.fn(() => true) };
  const service = new ClickCallbackService(
    {} as never,
    {} as never,
    db as never,
    provider as never,
  );
  const payload = {
    click_trans_id: '88',
    service_id: 'sid',
    merchant_trans_id: 'payment-1',
    merchant_prepare_id: '42',
    amount: '100.00',
    action: 1,
    sign_time: '2026-11-04 17:00:00',
    sign_string: 'signed',
    error: 0,
  };
  return {
    service,
    payload,
    payment,
    tx,
    enrollmentRepo,
    txRepo,
    paymentRepo,
    manager,
    db,
    provider,
  };
}
describe('Payme and Click payment flows', () => {
  it('authenticates Payme Merchant API requests', () => {
    const p = new PaymeProvider({
      get: (k: string) => (k === 'PAYME_MERCHANT_PASSWORD' ? 'pw' : undefined),
    } as never);
    expect(
      p.verifyAuthorization(
        `Basic ${Buffer.from('Paycom:pw').toString('base64')}`,
      ),
    ).toBe(true);
    expect(p.verifyAuthorization('Basic bad')).toBe(false);
  });
  it('rejects malformed and non-canonical Payme Basic credentials', () => {
    const p = new PaymeProvider({
      get: (k: string) => (k === 'PAYME_MERCHANT_PASSWORD' ? 'pw' : undefined),
    } as never);
    expect(
      p.verifyAuthorization(
        `Basic ${Buffer.from('Paycom:pw').toString('base64')} trailing`,
      ),
    ).toBe(false);
    expect(p.verifyAuthorization('Basic UGF5Y29tOnB3====')).toBe(false);
  });
  it('generates Click prepare and complete signatures and rejects invalid signatures', () => {
    const config = {
      get: (k: string) =>
        k === 'CLICK_SECRET_KEY'
          ? 'secret'
          : k === 'CLICK_SERVICE_ID'
            ? '7'
            : undefined,
    };
    const provider = new ClickProvider(config as never);
    const params = {
      click_trans_id: '1',
      service_id: '7',
      merchant_trans_id: 'p',
      merchant_prepare_id: '3',
      amount: '10.00',
      action: 1,
      sign_time: '2026-11-04 17:00:00',
      sign_string: '',
    };
    const raw = '17secretp3' + '10.00' + '1' + '2026-11-04 17:00:00';
    params.sign_string = createHash('md5').update(raw).digest('hex');
    expect(provider.verifySignature(params, 1)).toBe(true);
    expect(provider.verifySignature({ ...params, sign_string: 'bad' }, 1)).toBe(
      false,
    );
  });
  it('completes a valid Click payment and activates one enrollment', async () => {
    const f = clickFixture();
    const result = await f.service.complete(f.payload);
    expect(result.error).toBe(0);
    expect(f.payment.status).toBe('succeeded');
    expect(f.enrollmentRepo.save).toHaveBeenCalledTimes(1);
    expect(f.manager.query).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      [user.id, course.id],
    );
    expect(f.txRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });
  it('uses transaction row locks to serialize concurrent callback state changes', async () => {
    const f = clickFixture();
    await f.service.complete(f.payload);
    expect(f.txRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provider: 'click', providerTransactionId: '88' },
        lock: { mode: 'pessimistic_write' },
      }),
    );
  });
  it('makes duplicate Click completion idempotent and does not duplicate enrollment', async () => {
    const f = clickFixture();
    await f.service.complete(f.payload);
    await f.service.complete(f.payload);
    expect(f.enrollmentRepo.save).toHaveBeenCalledTimes(1);
    expect(f.db.transaction).toHaveBeenCalledTimes(2);
  });
  it('does not touch the database for an invalid Click signature', async () => {
    const f = clickFixture();
    f.provider.verifySignature.mockReturnValue(false);
    expect((await f.service.complete(f.payload)).error).toBe(-1);
    expect(f.db.transaction).not.toHaveBeenCalled();
  });
  it('rejects an invalid Click state transition', async () => {
    const f = clickFixture();
    f.tx.status = 'initiated';
    expect((await f.service.complete(f.payload)).error).toBe(-9);
    expect(f.enrollmentRepo.save).not.toHaveBeenCalled();
  });
  it('expires a stale Click transaction without granting enrollment', async () => {
    const f = clickFixture();
    f.tx.occurredAt = new Date(Date.now() - 13 * 60 * 60 * 1000);
    expect((await f.service.complete(f.payload)).error).toBe(-9);
    expect(f.payment.status).toBe('failed');
    expect(f.enrollmentRepo.save).not.toHaveBeenCalled();
  });
  it('keeps a failed Click completion from granting access', async () => {
    const f = clickFixture();
    f.payload.error = -1;
    expect((await f.service.complete(f.payload)).error).toBe(-9);
    expect(f.payment.status).toBe('failed');
    expect(f.enrollmentRepo.save).not.toHaveBeenCalled();
  });
  it('returns a protocol success for a repeated Click Prepare', async () => {
    const f = clickFixture();
    const result = await f.service.prepare({ ...f.payload, action: 0 });
    expect(result.error).toBe(0);
    expect(result.merchant_prepare_id).toBe(42);
  });
  it('rejects Click Prepare when the database prepare ID is null instead of falling back to the transaction UUID', async () => {
    const f = clickFixture();
    f.tx.clickPrepareId = null;
    const result = await f.service.prepare({ ...f.payload, action: 0 });
    expect(result).toMatchObject({ error: -7, merchant_prepare_id: 0 });
    expect(result.merchant_prepare_id).not.toBe(Number(f.tx.id));
    expect(f.txRepo.save).not.toHaveBeenCalled();
  });
  it('rejects Click Prepare when the stored prepare ID is a UUID', async () => {
    const f = clickFixture();
    f.tx.clickPrepareId = '123e4567-e89b-42d3-a456-426614174000';
    const result = await f.service.prepare({ ...f.payload, action: 0 });
    expect(result.error).toBe(-7);
    expect(result.merchant_prepare_id).toBe(0);
  });
  it.each(['0', '-42', '1.5', '9007199254740992', '9223372036854775807'])(
    'rejects unsafe or invalid Click Prepare ID %s',
    async (value) => {
      const f = clickFixture();
      f.tx.clickPrepareId = value;
      const result = await f.service.prepare({ ...f.payload, action: 0 });
      expect(result.error).toBe(-7);
      expect(result.merchant_prepare_id).toBe(0);
    },
  );
  it('rejects Click Complete when the stored prepare ID is null and performs no confirmation', async () => {
    const f = clickFixture();
    f.tx.clickPrepareId = null;
    const result = await f.service.complete(f.payload);
    expect(result).toMatchObject({ error: -7, merchant_confirm_id: 0 });
    expect(f.txRepo.save).not.toHaveBeenCalled();
    expect(f.paymentRepo.save).not.toHaveBeenCalled();
    expect(f.enrollmentRepo.save).not.toHaveBeenCalled();
  });
  it.each(['not-a-number', '0', '9007199254740992'])(
    'rejects Click Complete with invalid prepare ID %s without activating enrollment',
    async (value) => {
      const f = clickFixture();
      f.payload.merchant_prepare_id = value;
      const result = await f.service.complete(f.payload);
      expect(result.error).toBe(-7);
      expect(f.txRepo.save).not.toHaveBeenCalled();
      expect(f.paymentRepo.save).not.toHaveBeenCalled();
      expect(f.enrollmentRepo.save).not.toHaveBeenCalled();
    },
  );
  it('fails safely when admin requests a refund unavailable through the configured provider protocol', async () => {
    const provider = new PaymeProvider({ get: () => 'configured' } as never);
    await expect(
      provider.refund({} as never, '012345678901234567890123'),
    ).rejects.toThrow();
  });
  it('restricts payment administration metadata to administrator roles', () => {
    expect(
      Reflect.getMetadata(REQUIRED_ROLES, AdminPaymentsController),
    ).toEqual(['ADMIN', 'SUPER_ADMIN']);
  });
  it('performs Payme payment once and creates enrollment inside the callback transaction', async () => {
    const payment = {
      id: 'payment-1',
      user,
      course,
      amountMinor: '10000',
      currency: 'UZS',
      status: 'processing',
      paidAt: null,
      refundedAt: null,
    };
    const tx = {
      id: 'payme-local',
      payment,
      provider: 'payme',
      providerTransactionId: '012345678901234567890123',
      status: 'pending',
      eventType: 'CreateTransaction',
      occurredAt: new Date(),
    };
    const enrollRepo = {
      findOne: vi.fn(async () => null),
      create: vi.fn((x) => x),
      save: vi.fn(async (x) => x),
    };
    const txRepo = {
      findOne: vi.fn(async () => tx),
      save: vi.fn(async (x) => x),
    };
    const payRepo = {
      findOne: vi.fn(async () => payment),
      save: vi.fn(async (x) => x),
    };
    const manager = {
      getRepository: (e: unknown) =>
        e === PaymentTransaction
          ? txRepo
          : e === Payment
            ? payRepo
            : e === Enrollment
              ? enrollRepo
              : undefined,
      query: vi.fn(async () => undefined),
    };
    const db = { transaction: vi.fn(async (fn) => fn(manager)) };
    const service = new PaymentsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      db as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const result = await service.paymeRpc({
      jsonrpc: '2.0',
      id: 7,
      method: 'PerformTransaction',
      params: { id: '012345678901234567890123' },
    });
    expect((result as { result: { state: number } }).result.state).toBe(2);
    expect(payment.status).toBe('succeeded');
    expect(enrollRepo.save).toHaveBeenCalledTimes(1);
  });
  it('does not create duplicate enrollments for successful duplicate callbacks', async () => {
    const f = clickFixture();
    await f.service.complete(f.payload);
    f.tx.status = 'succeeded';
    f.payment.status = 'succeeded';
    await f.service.complete(f.payload);
    expect(f.enrollmentRepo.save).toHaveBeenCalledTimes(1);
  });
  it('rejects Click amount mismatch without changing records', async () => {
    const f = clickFixture();
    f.payload.amount = '99.99';
    expect((await f.service.complete(f.payload)).error).toBe(-2);
    expect(f.txRepo.save).not.toHaveBeenCalled();
    expect(f.paymentRepo.save).not.toHaveBeenCalled();
  });
  it('rejects a repeated Click Prepare after its transaction failed', async () => {
    const f = clickFixture();
    f.tx.status = 'failed';
    expect(
      (await f.service.prepare({ ...f.payload, action: 0 })).error,
    ).not.toBe(0);
  });
  it('checks Payme order identifiers and tiyin amounts', async () => {
    const payment = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      amountMinor: '10000',
      status: 'pending',
    };
    const payments = { findOne: vi.fn(async () => payment) };
    const svc = new PaymentsService(
      payments as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const valid = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'CheckPerformTransaction',
      params: { amount: 10000, account: { order_id: payment.id } },
    });
    expect((valid as { result: { allow: boolean } }).result.allow).toBe(true);
    const bad = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 2,
      method: 'CheckPerformTransaction',
      params: { amount: 10001, account: { order_id: payment.id } },
    });
    expect((bad as { error: { code: number } }).error.code).toBe(-31001);
    const malformed = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 3,
      method: 'CheckPerformTransaction',
      params: { amount: 10000, account: { order_id: '12345678-garbage' } },
    });
    expect((malformed as { error: { code: number } }).error.code).toBe(-31050);
  });
  it('answers Payme CheckTransaction with merchant transaction state', async () => {
    const tx = {
      id: 'local-tx',
      status: 'succeeded',
      providerCreatedAt: new Date(1790000000000),
      providerPerformedAt: new Date(1790000001000),
      providerCancelledAt: null,
      providerCancelReason: null,
    };
    const repo = { findOne: vi.fn(async () => tx) };
    const svc = new PaymentsService(
      {} as never,
      repo as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const out = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 5,
      method: 'CheckTransaction',
      params: { id: '012345678901234567890124' },
    });
    expect(
      (out as { result: { state: number; transaction: string } }).result,
    ).toMatchObject({ state: 2, transaction: 'local-tx' });
  });
  it('maps invalid Payme cancellation reason and malformed JSON-RPC to protocol errors', async () => {
    const svc = new PaymentsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const reason = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 7,
      method: 'CancelTransaction',
      params: { id: '012345678901234567890123', reason: 6 },
    });
    expect((reason as { error: { code: number } }).error.code).toBe(-32600);
    const version = await svc.paymeRpc({
      jsonrpc: '1.0',
      id: 8,
      method: 'CheckTransaction',
      params: {},
    });
    expect((version as { error: { code: number } }).error.code).toBe(-32600);
  });
  it('returns Payme GetStatement transactions in inclusive timestamp range order', async () => {
    const tx = {
      providerTransactionId: 'payme-id',
      providerCreatedAt: new Date(1790000000000),
      providerPerformedAt: new Date(1790000001000),
      providerCancelledAt: null,
      providerCancelReason: null,
      payment: { id: 'order-id', amountMinor: '10000' },
      id: 'local-id',
      status: 'succeeded',
    };
    const qb = {
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn(async () => [tx]),
    };
    const repo = { createQueryBuilder: vi.fn(() => qb) };
    const svc = new PaymentsService(
      {} as never,
      repo as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const out = await svc.paymeRpc({
      jsonrpc: '2.0',
      id: 6,
      method: 'GetStatement',
      params: { from: 1790000000000, to: 1790000002000 },
    });
    expect(
      (
        out as {
          result: { transactions: Array<{ time: number; amount: number }> };
        }
      ).result.transactions[0],
    ).toMatchObject({ time: 1790000000000, amount: 10000 });
    expect(qb.where).toHaveBeenCalledWith(expect.stringContaining('BETWEEN'), {
      from: new Date(1790000000000),
      to: new Date(1790000002000),
    });
  });
  it('records Payme expiry as a timeout cancellation with reason 4', async () => {
    const payment = { status: 'processing', paidAt: null };
    const tx = {
      provider: 'payme',
      status: 'pending',
      providerCreatedAt: new Date(Date.now() - 13 * 60 * 60 * 1000),
      occurredAt: new Date(Date.now() - 13 * 60 * 60 * 1000),
    };
    const paymentRepo = { save: vi.fn(async (x) => x) },
      txRepo = { save: vi.fn(async (x) => x) };
    const manager = {
      getRepository: (e: unknown) => (e === Payment ? paymentRepo : txRepo),
    };
    const svc = new PaymentsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    expect(
      await svc.expirePayment(manager as never, payment as never, tx as never),
    ).toBe(true);
    expect(tx).toMatchObject({
      status: 'failed',
      providerCancelReason: 4,
      eventType: 'expired',
    });
  });
});
