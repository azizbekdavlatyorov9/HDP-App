import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  Enrollment,
  NotificationType,
  Payment,
  PaymentTransaction,
} from '../../database/entities/index.js';
import type { ClickCallbackDto } from './payments.dto.js';
import { ClickProvider, majorToMinor } from './click.provider.js';
import { NotificationsService } from '../notifications/notifications.service.js';

type Manager = EntityManager;

const CLICK_ERROR_INTERNAL = -7;
const CLICK_ERROR_MALFORMED_REQUEST = -8;
const CLICK_ERROR_NOTE_INTERNAL = 'Failed to update user';
const MAX_SAFE_CLICK_ID = BigInt(Number.MAX_SAFE_INTEGER);

/** Click Shop API identifiers are JSON numbers, so only exact safe integers may be emitted. */
function parseClickInteger(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  try {
    const integer = BigInt(value);
    if (integer <= 0n || integer > MAX_SAFE_CLICK_ID) return null;
    return Number(integer);
  } catch {
    return null;
  }
}

@Injectable()
export class ClickCallbackService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(PaymentTransaction)
    private readonly transactions: Repository<PaymentTransaction>,
    private readonly db: DataSource,
    private readonly provider: ClickProvider,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  private response(
    payload: ClickCallbackDto,
    phase: 'prepare' | 'complete',
    error: number,
    note: string,
    prepareId?: string | null,
  ) {
    const clickTransactionId = parseClickInteger(payload.click_trans_id);
    const numericPrepareId = parseClickInteger(prepareId);
    const resultError =
      error === 0 && (!clickTransactionId || !numericPrepareId)
        ? CLICK_ERROR_INTERNAL
        : error;
    const id = resultError === 0 ? numericPrepareId! : (numericPrepareId ?? 0);

    return {
      click_trans_id: clickTransactionId ?? 0,
      merchant_trans_id: payload.merchant_trans_id,
      ...(phase === 'prepare'
        ? { merchant_prepare_id: id }
        : { merchant_confirm_id: id }),
      error: resultError,
      error_note:
        resultError === CLICK_ERROR_INTERNAL && error === 0
          ? CLICK_ERROR_NOTE_INTERNAL
          : note,
    };
  }

  private async expire(
    manager: Manager,
    payment: Payment,
    transaction: PaymentTransaction,
  ) {
    if (
      Date.now() - (transaction.occurredAt ?? transaction.createdAt).getTime() <
        12 * 60 * 60 * 1000 ||
      payment.status === 'succeeded'
    ) {
      return false;
    }
    payment.status = 'failed';
    transaction.status = 'failed';
    transaction.eventType = 'expired';
    await manager.getRepository(Payment).save(payment);
    await manager.getRepository(PaymentTransaction).save(transaction);
    return true;
  }

  async prepare(payload: ClickCallbackDto) {
    if (!parseClickInteger(payload.click_trans_id)) {
      return this.response(
        payload,
        'prepare',
        CLICK_ERROR_MALFORMED_REQUEST,
        'Error in request from Click',
      );
    }
    if (!this.provider.verifySignature(payload, 0)) {
      return this.response(payload, 'prepare', -1, 'SIGN CHECK FAILED');
    }
    const amount = majorToMinor(payload.amount);
    if (!amount)
      return this.response(payload, 'prepare', -2, 'Incorrect amount');

    return this.db.transaction(async (manager) => {
      const payment = await manager.getRepository(Payment).findOne({
        where: { id: payload.merchant_trans_id },
        relations: { user: true, course: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment)
        return this.response(payload, 'prepare', -5, 'User does not exist');
      if (payment.currency !== 'UZS' || payment.amountMinor !== amount) {
        return this.response(payload, 'prepare', -2, 'Incorrect amount');
      }
      if (payment.status === 'succeeded') {
        return this.response(payload, 'prepare', -4, 'Already paid');
      }

      let transaction = await manager
        .getRepository(PaymentTransaction)
        .findOne({
          where: {
            provider: 'click',
            providerTransactionId: payload.click_trans_id,
          },
          relations: { payment: true },
          lock: { mode: 'pessimistic_write' },
        });
      if (transaction) {
        if (transaction.payment.id !== payment.id) {
          return this.response(
            payload,
            'prepare',
            -8,
            'Error in request from Click',
          );
        }
        if (
          transaction.status === 'pending' ||
          transaction.status === 'succeeded'
        ) {
          const prepareId = parseClickInteger(transaction.clickPrepareId);
          if (!prepareId) {
            return this.response(
              payload,
              'prepare',
              CLICK_ERROR_INTERNAL,
              CLICK_ERROR_NOTE_INTERNAL,
            );
          }
          return this.response(
            payload,
            'prepare',
            0,
            'Success',
            transaction.clickPrepareId,
          );
        }
        return this.response(payload, 'prepare', -9, 'Transaction cancelled');
      }

      transaction = await manager.getRepository(PaymentTransaction).findOne({
        where: {
          provider: 'click',
          payment: { id: payment.id },
          status: 'initiated',
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!transaction)
        return this.response(
          payload,
          'prepare',
          -6,
          'Transaction does not exist',
        );
      if (!parseClickInteger(transaction.clickPrepareId)) {
        return this.response(
          payload,
          'prepare',
          CLICK_ERROR_INTERNAL,
          CLICK_ERROR_NOTE_INTERNAL,
        );
      }
      if (await this.expire(manager, payment, transaction)) {
        return this.response(payload, 'prepare', -9, 'Transaction cancelled');
      }

      transaction.providerTransactionId = payload.click_trans_id;
      transaction.status = 'pending';
      transaction.eventType = 'Prepare';
      transaction.occurredAt = new Date();
      payment.status = 'processing';
      await manager.getRepository(PaymentTransaction).save(transaction);
      await manager.getRepository(Payment).save(payment);
      return this.response(
        payload,
        'prepare',
        0,
        'Success',
        transaction.clickPrepareId,
      );
    });
  }

  async complete(payload: ClickCallbackDto) {
    if (!parseClickInteger(payload.click_trans_id)) {
      return this.response(
        payload,
        'complete',
        CLICK_ERROR_MALFORMED_REQUEST,
        'Error in request from Click',
      );
    }
    if (!this.provider.verifySignature(payload, 1)) {
      return this.response(payload, 'complete', -1, 'SIGN CHECK FAILED');
    }
    const suppliedPrepareId = parseClickInteger(payload.merchant_prepare_id);
    if (!suppliedPrepareId) {
      return this.response(
        payload,
        'complete',
        CLICK_ERROR_INTERNAL,
        CLICK_ERROR_NOTE_INTERNAL,
      );
    }
    const amount = majorToMinor(payload.amount);
    if (!amount)
      return this.response(payload, 'complete', -2, 'Incorrect amount');

    return this.db
      .transaction(async (manager) => {
        const transaction = await manager
          .getRepository(PaymentTransaction)
          .findOne({
            where: {
              provider: 'click',
              providerTransactionId: payload.click_trans_id,
            },
            relations: { payment: { user: true, course: true } },
            lock: { mode: 'pessimistic_write' },
          });
        if (!transaction) {
          return this.response(
            payload,
            'complete',
            -6,
            'Transaction does not exist',
          );
        }
        const prepareId = parseClickInteger(transaction.clickPrepareId);
        if (!prepareId || prepareId !== suppliedPrepareId) {
          return this.response(
            payload,
            'complete',
            CLICK_ERROR_INTERNAL,
            CLICK_ERROR_NOTE_INTERNAL,
          );
        }
        const payment = await manager.getRepository(Payment).findOne({
          where: { id: transaction.payment.id },
          relations: { user: true, course: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!payment || payment.id !== payload.merchant_trans_id) {
          return this.response(
            payload,
            'complete',
            -5,
            'User does not exist',
            transaction.clickPrepareId,
          );
        }
        if (payment.amountMinor !== amount) {
          return this.response(
            payload,
            'complete',
            -2,
            'Incorrect amount',
            transaction.clickPrepareId,
          );
        }
        if (transaction.status === 'succeeded') {
          return this.response(
            payload,
            'complete',
            0,
            'Success',
            transaction.clickPrepareId,
          );
        }
        if (
          transaction.status !== 'pending' ||
          payment.status === 'failed' ||
          payment.status === 'refunded'
        ) {
          return this.response(
            payload,
            'complete',
            -9,
            'Transaction cancelled',
            transaction.clickPrepareId,
          );
        }
        if (payload.error !== undefined && payload.error < 0) {
          transaction.status = 'failed';
          transaction.eventType = 'CompleteFailed';
          transaction.occurredAt = new Date();
          payment.status = 'failed';
          await manager.getRepository(PaymentTransaction).save(transaction);
          await manager.getRepository(Payment).save(payment);
          return this.response(
            payload,
            'complete',
            -9,
            'Transaction cancelled',
            transaction.clickPrepareId,
          );
        }
        if (await this.expire(manager, payment, transaction)) {
          return this.response(
            payload,
            'complete',
            -9,
            'Transaction cancelled',
            transaction.clickPrepareId,
          );
        }

        transaction.status = 'succeeded';
        transaction.eventType = 'Complete';
        transaction.occurredAt = new Date();
        payment.status = 'succeeded';
        payment.paidAt = new Date();
        await manager.getRepository(PaymentTransaction).save(transaction);
        await manager.getRepository(Payment).save(payment);
        await this.activateEnrollment(manager, payment);
        return this.response(
          payload,
          'complete',
          0,
          'Success',
          transaction.clickPrepareId,
        );
      })
      .then(async (response) => {
        if (this.notifications && response.error === 0) {
          await this.notifyPayment(
            payload.click_trans_id,
            NotificationType.PAYMENT_SUCCESS,
          );
        } else if (
          this.notifications &&
          response.error === -9 &&
          payload.error !== undefined &&
          payload.error < 0
        ) {
          await this.notifyPayment(
            payload.click_trans_id,
            NotificationType.PAYMENT_FAILED,
          );
        }
        return response;
      });
  }

  private async notifyPayment(
    providerTransactionId: string,
    type: NotificationType,
  ) {
    if (!this.notifications) return;
    const transaction = await this.transactions.findOne({
      where: { provider: 'click', providerTransactionId },
      relations: { payment: { user: true, course: true } },
    });
    if (!transaction) return;
    const succeeded = type === NotificationType.PAYMENT_SUCCESS;
    await this.notifications.createAndDeliverMany(
      [transaction.payment.user.id],
      {
        type,
        title: succeeded ? 'Payment successful' : 'Payment failed',
        body: transaction.payment.course.title,
        relatedEntityId: transaction.payment.id,
        eventKey: `payment-${succeeded ? 'success' : 'failed'}:${transaction.payment.id}`,
      },
    );
    if (succeeded) {
      await this.notifications.createAndDeliverMany(
        [transaction.payment.user.id],
        {
          type: NotificationType.ENROLLMENT_CREATED,
          title: 'Course access ready',
          body: transaction.payment.course.title,
          relatedEntityId: transaction.payment.course.id,
          eventKey: `enrollment-created:${transaction.payment.id}`,
        },
      );
    }
  }

  private async activateEnrollment(manager: Manager, payment: Payment) {
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      [payment.user.id, payment.course.id],
    );
    const repository = manager.getRepository(Enrollment);
    const existing = await repository.findOne({
      where: {
        user: { id: payment.user.id },
        course: { id: payment.course.id },
      },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing) {
      if (existing.status !== 'active') {
        existing.status = 'active';
        existing.source = 'payment';
        existing.enrolledAt = new Date();
        existing.expiresAt = null;
        await repository.save(existing);
      }
      return;
    }
    await repository.save(
      repository.create({
        user: payment.user,
        course: payment.course,
        status: 'active',
        source: 'payment',
        enrolledAt: new Date(),
        expiresAt: null,
      }),
    );
  }
}
