import { describe, expect, it, vi } from 'vitest';
import { DeviceToken, Notification, NotificationType } from '../../database/entities/index.js';
import { AdminNotificationsController } from './notifications.controller.js';
import { REQUIRED_ROLES } from '../../common/decorators/roles.decorator.js';
import { FirebaseAdminProvider } from './firebase-admin.provider.js';
import { NotificationsService } from './notifications.service.js';

const user = { id: 'user-1' } as never;
function serviceFixture() {
  const notifications = { findOne: vi.fn(), update: vi.fn(async () => ({ affected: 1 })), count: vi.fn(async () => 3), save: vi.fn(async (v) => v), create: vi.fn((v) => v), createQueryBuilder: vi.fn() };
  const devices = { find: vi.fn(async () => []), findOne: vi.fn(), update: vi.fn(async () => ({ affected: 1 })), create: vi.fn((v) => v), save: vi.fn(async (v) => v), createQueryBuilder: vi.fn(() => ({ update: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), execute: vi.fn(async () => ({})) })) };
  const users = { find: vi.fn(async () => []) };
  const db = { transaction: vi.fn(async (fn) => fn({ getRepository: (e: unknown) => e === DeviceToken ? devices : notifications, createQueryBuilder: () => ({ insert: vi.fn().mockReturnThis(), into: vi.fn().mockReturnThis(), values: vi.fn().mockReturnThis(), orIgnore: vi.fn().mockReturnThis(), returning: vi.fn().mockReturnThis(), execute: vi.fn(async () => ({ identifiers: [{ id: 'notif-1' }] })) }) })) };
  const fcm = { available: vi.fn(() => false), send: vi.fn(async () => ({ successTokens: [], invalidTokens: [] })) };
  return { service: new NotificationsService(notifications as never, devices as never, users as never, db as never, fcm as never), notifications, devices, users, db, fcm };
}

describe('NotificationsService', () => {
  it('registers and safely reassigns a globally unique device token', async () => {
    const f = serviceFixture();
    const dto = { token: 'a'.repeat(40), platform: 'IOS' as const, deviceName: 'iPhone' };
    await f.service.registerDevice(user, dto);
    expect(f.devices.create).toHaveBeenCalledWith(expect.objectContaining({ user: { id: 'user-1' }, isActive: true }));
    const prior = { id: 'device-1', user: { id: 'another-user' }, token: dto.token, platform: 'ANDROID', isActive: false, lastSeenAt: new Date() };
    f.devices.findOne.mockResolvedValueOnce(prior);
    await f.service.registerDevice({ id: 'user-1' } as never, dto);
    expect(prior.user).toEqual({ id: 'user-1' });
    expect(prior.platform).toBe('IOS');
  });
  it('removes only a device owned by the current user', async () => {
    const f = serviceFixture();
    await f.service.removeDevice({ id: 'user-1' } as never, 'device-id');
    expect(f.devices.update).toHaveBeenCalledWith({ id: 'device-id', user: { id: 'user-1' }, isActive: true }, { isActive: false });
    f.devices.update.mockResolvedValueOnce({ affected: 0 } as never);
    await expect(f.service.removeDevice({ id: 'user-1' } as never, 'other-device')).rejects.toThrow('Device not found');
  });
  it('filters and paginates only the current user notifications', async () => {
    const f = serviceFixture();
    const qb = { where: vi.fn().mockReturnThis(), andWhere: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), addOrderBy: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), take: vi.fn().mockReturnThis(), getManyAndCount: vi.fn(async () => [[], 0]) };
    f.notifications.createQueryBuilder.mockReturnValue(qb);
    await f.service.list({ id: 'user-1' } as never, { page: 2, limit: 10, unread: 'true' });
    expect(qb.where).toHaveBeenCalledWith('n.recipient_user_id = :userId', { userId: 'user-1' });
    expect(qb.andWhere).toHaveBeenCalledWith('n.read_at IS NULL');
    expect(qb.skip).toHaveBeenCalledWith(10);
  });
  it('returns unread count and marks a notification idempotently', async () => {
    const f = serviceFixture();
    f.notifications.findOne.mockResolvedValue({ id: 'n-1', readAt: null });
    await expect(f.service.unreadCount({ id: 'user-1' } as never)).resolves.toEqual({ count: 3 });
    await f.service.markRead({ id: 'user-1' } as never, 'n-1');
    expect(f.notifications.save).toHaveBeenCalledTimes(1);
    const alreadyRead = { id: 'n-2', readAt: new Date() };
    f.notifications.findOne.mockResolvedValueOnce(alreadyRead);
    await f.service.markRead({ id: 'user-1' } as never, 'n-2');
    expect(f.notifications.save).toHaveBeenCalledTimes(1);
  });
  it('marks all notifications read with a user ownership predicate', async () => {
    const f = serviceFixture();
    const qb = { update: vi.fn().mockReturnThis(), set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), execute: vi.fn(async () => ({ affected: 2 })) };
    f.notifications.createQueryBuilder.mockReturnValue(qb);
    await f.service.readAll({ id: 'user-1' } as never);
    expect(qb.where).toHaveBeenCalledWith('recipient_user_id = :userId AND read_at IS NULL', { userId: 'user-1' });
  });
  it('does not send when Firebase configuration is missing', async () => {
    const provider = new FirebaseAdminProvider({ get: () => undefined } as never);
    await provider.onModuleInit();
    expect(provider.available()).toBe(false);
    await expect(provider.send(['token'], { title: 'title', body: 'body', data: {} })).rejects.toThrow('FCM_UNAVAILABLE');
  });
  it('deactivates invalid FCM tokens and does not expose provider error details', async () => {
    const f = serviceFixture();
    f.fcm.available.mockReturnValue(true);
    f.fcm.send.mockResolvedValue({ successTokens: [], invalidTokens: ['bad-token'] });
    const notification = { id: 'n-1', recipient: { id: 'user-1' }, type: NotificationType.GENERAL, title: 'Hi', body: 'There', relatedEntityId: null, deliveryStatus: 'pending' };
    f.notifications.findOne.mockResolvedValue(notification);
    f.devices.find.mockResolvedValue([{ token: 'bad-token' }]);
    await f.service.deliverAfterCommit('n-1');
    expect(f.devices.update).toHaveBeenCalledWith({ token: expect.anything(), isActive: true }, { isActive: false });
    expect(f.notifications.update).toHaveBeenCalledWith({ id: 'n-1', deliveryStatus: 'sending' }, expect.objectContaining({ deliveryStatus: 'failed' }));
  });
  it('stores safe event information and rejects sensitive metadata keys', async () => {
    const f = serviceFixture();
    const manager = { createQueryBuilder: () => ({ insert() { return this; }, into() { return this; }, values() { return this; }, orIgnore() { return this; }, returning() { return this; }, async execute() { return { identifiers: [{ id: 'n-1' }] }; } }) };
    await expect(f.service.queueWithin(manager as never, 'user-1', { type: NotificationType.GENERAL, title: 'Hello', body: 'World', eventKey: 'evt', metadata: { password: 'secret' } })).rejects.toThrow('Sensitive metadata');
    await expect(f.service.queueWithin(manager as never, 'user-1', { type: NotificationType.GENERAL, title: 'Hello', body: 'World', eventKey: 'evt', metadata: { source: 'system' } })).resolves.toBe('n-1');
  });
  it('deduplicates retried event keys and restricts admin operations to admin roles', async () => {
    const f = serviceFixture();
    const manager = { createQueryBuilder: () => ({ insert() { return this; }, into() { return this; }, values() { return this; }, orIgnore() { return this; }, returning() { return this; }, async execute() { return { identifiers: [] }; } }), getRepository: () => ({ findOne: vi.fn(async () => ({ id: 'existing-notification' })) }) };
    await expect(f.service.queueWithin(manager as never, 'user-1', { type: NotificationType.PAYMENT_SUCCESS, title: 'Paid', body: 'Course', eventKey: 'payment-success:1' })).resolves.toBe('existing-notification');
    expect(Reflect.getMetadata(REQUIRED_ROLES, AdminNotificationsController)).toEqual(['ADMIN', 'SUPER_ADMIN']);
  });
  it('does not attempt delivery when persistence transaction fails', async () => {
    const f = serviceFixture();
    f.db.transaction.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(f.service.createAndDeliver('user-1', { type: NotificationType.GENERAL, title: 'Hello', body: 'World', eventKey: 'event-1' })).rejects.toThrow('database unavailable');
    expect(f.notifications.update).not.toHaveBeenCalled();
  });
  it('records a sanitized provider failure state', async () => {
    const f = serviceFixture();
    f.fcm.available.mockReturnValue(true);
    f.fcm.send.mockRejectedValueOnce(new Error('contains private provider details'));
    f.notifications.findOne.mockResolvedValue({ id: 'n-2', recipient: { id: 'user-1' }, deliveryStatus: 'pending' });
    f.devices.find.mockResolvedValue([{ token: 'token' }]);
    await f.service.deliverAfterCommit('n-2');
    expect(f.notifications.update).toHaveBeenLastCalledWith({ id: 'n-2', deliveryStatus: 'sending' }, { deliveryStatus: 'failed', deliveryErrorCode: 'provider_error' });
  });
});
