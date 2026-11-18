import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { DeviceToken, Notification, NotificationType, User } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { FCM_PROVIDER } from './fcm-provider.js';
import type { FcmProvider } from './fcm-provider.js';
import type { AdminCreateNotificationDto, NotificationListDto, RegisterDeviceDto } from './notifications.dto.js';

const FORBIDDEN_METADATA_KEY = /(token|secret|password|otp|phone|email|payment|credential|authorization|user(name|_id)?)/i;
@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>, @InjectRepository(DeviceToken) private readonly devices: Repository<DeviceToken>, @InjectRepository(User) private readonly users: Repository<User>, private readonly db: DataSource, @Inject(FCM_PROVIDER) private readonly fcm: FcmProvider) {}

  private safeMetadata(value?: Record<string, unknown>): Record<string, string | number | boolean> | null {
    if (!value) return null;
    if (Object.keys(value).length > 20) throw new BadRequestException('Metadata has too many fields');
    const safe: Record<string, string | number | boolean> = {};
    for (const [key, item] of Object.entries(value)) {
      if (FORBIDDEN_METADATA_KEY.test(key)) throw new BadRequestException('Sensitive metadata fields are not allowed');
      if (typeof item === 'string' && item.length <= 200 || typeof item === 'number' && Number.isFinite(item) || typeof item === 'boolean') safe[key] = item as string | number | boolean;
      else throw new BadRequestException('Metadata values must be short strings, numbers, or booleans');
    }
    return safe;
  }

  async queueWithin(manager: EntityManager, recipientId: string, input: { type: NotificationType; title: string; body: string; relatedEntityId?: string | null; metadata?: Record<string, unknown> | null; eventKey: string }): Promise<string> {
    const notification = this.notifications.create({ recipient: { id: recipientId } as User, type: input.type, title: input.title, body: input.body, relatedEntityId: input.relatedEntityId ?? null, metadata: this.safeMetadata(input.metadata ?? undefined), eventKey: input.eventKey, readAt: null, deliveryStatus: 'pending', deliveredAt: null, deliveryErrorCode: null });
    const result = await manager.createQueryBuilder().insert().into(Notification).values(notification as unknown as QueryDeepPartialEntity<Notification>).orIgnore().returning(['id']).execute();
    if (result.identifiers[0]?.id) return result.identifiers[0].id as string;
    const existing = await manager.getRepository(Notification).findOne({ where: { eventKey: input.eventKey } });
    if (!existing) throw new Error('Notification outbox insert failed');
    return existing.id;
  }

  async createAndDeliver(recipientId: string, input: { type: NotificationType; title: string; body: string; relatedEntityId?: string | null; metadata?: Record<string, unknown> | null; eventKey: string }): Promise<void> {
    const id = await this.db.transaction((manager) => this.queueWithin(manager, recipientId, input));
    await this.deliverAfterCommit(id);
  }
  async createAndDeliverMany(recipientIds: string[], input: { type: NotificationType; title: string; body: string; relatedEntityId?: string | null; metadata?: Record<string, unknown> | null; eventKey: string }): Promise<void> {
    const uniqueIds = [...new Set(recipientIds)];
    const ids = await this.db.transaction(async (manager) => {
      const result: string[] = [];
      for (const recipientId of uniqueIds) result.push(await this.queueWithin(manager, recipientId, { ...input, eventKey: `${input.eventKey}:${recipientId}` }));
      return result;
    });
    await Promise.allSettled(ids.map((id) => this.deliverAfterCommit(id)));
  }

  async deliverAfterCommit(id: string): Promise<void> {
    const notification = await this.notifications.findOne({ where: { id }, relations: { recipient: true } });
    if (!notification || notification.deliveryStatus !== 'pending') return;
    const claim = await this.notifications.update({ id, deliveryStatus: 'pending' }, { deliveryStatus: 'sending' });
    if (!claim.affected) return;
    if (!this.fcm.available()) { await this.notifications.update({ id, deliveryStatus: 'sending' }, { deliveryStatus: 'unavailable', deliveryErrorCode: 'provider_unavailable' }); return; }
    const tokens = await this.devices.find({ where: { user: { id: notification.recipient.id }, isActive: true }, select: { id: true, token: true } });
    if (!tokens.length) { await this.notifications.update({ id, deliveryStatus: 'sending' }, { deliveryStatus: 'unavailable', deliveryErrorCode: 'no_active_devices' }); return; }
    try {
      const sent = await this.fcm.send(tokens.map((d) => d.token), { title: notification.title, body: notification.body, data: { notificationId: notification.id, type: notification.type, ...(notification.relatedEntityId ? { relatedEntityId: notification.relatedEntityId } : {}) } });
      if (sent.invalidTokens.length) await this.devices.update({ token: In(sent.invalidTokens), isActive: true }, { isActive: false });
      await this.notifications.update({ id, deliveryStatus: 'sending' }, { deliveryStatus: sent.successTokens.length ? 'sent' : 'failed', deliveredAt: sent.successTokens.length ? new Date() : null, deliveryErrorCode: sent.successTokens.length ? null : 'provider_rejected' });
    } catch {
      await this.notifications.update({ id, deliveryStatus: 'sending' }, { deliveryStatus: 'failed', deliveryErrorCode: 'provider_error' });
    }
  }

  async registerDevice(user: AuthenticatedUser, dto: RegisterDeviceDto) {
    const device = await this.db.transaction(async (m) => {
      const repo = m.getRepository(DeviceToken);
      await repo.createQueryBuilder().update().set({ isActive: false }).where('token = :token', { token: dto.token }).execute();
      let row = await repo.findOne({ where: { token: dto.token }, order: { lastSeenAt: 'DESC' }, lock: { mode: 'pessimistic_write' } });
      if (row) { row.user = { id: user.id } as User; row.platform = dto.platform; row.deviceName = dto.deviceName ?? null; row.isActive = true; row.lastSeenAt = new Date(); }
      else row = repo.create({ user: { id: user.id } as User, token: dto.token, platform: dto.platform, deviceName: dto.deviceName ?? null, isActive: true, lastSeenAt: new Date() });
      return repo.save(row);
    });
    return { id: device.id, platform: device.platform, deviceName: device.deviceName, lastSeenAt: device.lastSeenAt };
  }
  async listDevices(user: AuthenticatedUser) {
    const rows = await this.devices.find({ where: { user: { id: user.id }, isActive: true }, order: { lastSeenAt: 'DESC' } });
    return rows.map(({ id, platform, deviceName, lastSeenAt, createdAt }) => ({ id, platform, deviceName, lastSeenAt, createdAt }));
  }
  async removeDevice(user: AuthenticatedUser, id: string) {
    const result = await this.devices.update({ id, user: { id: user.id }, isActive: true }, { isActive: false });
    if (!result.affected) throw new NotFoundException('Device not found');
    return { removed: true };
  }
  async list(user: AuthenticatedUser, query: NotificationListDto) {
    const qb = this.notifications.createQueryBuilder('n').where('n.recipient_user_id = :userId', { userId: user.id });
    if (query.unread === 'true') qb.andWhere('n.read_at IS NULL');
    if (query.unread === 'false') qb.andWhere('n.read_at IS NOT NULL');
    const [rows, total] = await qb.orderBy('n.created_at', 'DESC').addOrderBy('n.id', 'DESC').skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { data: rows.map((n) => this.toView(n)), pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
  }
  private toView(n: Notification) { return { id: n.id, type: n.type, title: n.title, body: n.body, relatedEntityId: n.relatedEntityId, metadata: n.metadata, isRead: n.readAt !== null, readAt: n.readAt, createdAt: n.createdAt }; }
  unreadCount(user: AuthenticatedUser) { return this.notifications.count({ where: { recipient: { id: user.id }, readAt: IsNull() } }).then((count) => ({ count })); }
  async markRead(user: AuthenticatedUser, id: string) {
    const row = await this.notifications.findOne({ where: { id, recipient: { id: user.id } } });
    if (!row) throw new NotFoundException('Notification not found');
    if (!row.readAt) { row.readAt = new Date(); await this.notifications.save(row); }
    return { id: row.id, isRead: true, readAt: row.readAt };
  }
  async readAll(user: AuthenticatedUser) {
    const result = await this.notifications.createQueryBuilder().update().set({ readAt: new Date() }).where('recipient_user_id = :userId AND read_at IS NULL', { userId: user.id }).execute();
    return { updated: result.affected ?? 0 };
  }
  async remove(user: AuthenticatedUser, id: string) {
    const result = await this.notifications.delete({ id, recipient: { id: user.id } });
    if (!result.affected) throw new NotFoundException('Notification not found');
    return { deleted: true };
  }
  async adminCreate(dto: AdminCreateNotificationDto) {
    const metadata = this.safeMetadata(dto.metadata);
    const recipients = dto.userIds === undefined ? await this.users.find({ where: { status: 'active' }, select: { id: true } }) : dto.userIds.length ? await this.users.find({ where: { id: In(dto.userIds), status: 'active' }, select: { id: true } }) : [];
    if (dto.userIds !== undefined && recipients.length !== new Set(dto.userIds).size) throw new BadRequestException('One or more recipients are missing or inactive');
    const ids = await this.db.transaction(async (m) => {
      const out: string[] = [];
      for (const recipient of recipients) out.push(await this.queueWithin(m, recipient.id, { ...dto, metadata, eventKey: `admin:${dto.idempotencyKey}:${recipient.id}` }));
      return out;
    });
    await Promise.allSettled(ids.map((id) => this.deliverAfterCommit(id)));
    return { queued: ids.length };
  }
  async adminList(query: NotificationListDto) {
    const [rows, total] = await this.notifications.findAndCount({ order: { createdAt: 'DESC', id: 'DESC' }, skip: (query.page - 1) * query.limit, take: query.limit, relations: { recipient: true } });
    return { data: rows.map((n) => ({ ...this.toView(n), recipientId: n.recipient.id, deliveryStatus: n.deliveryStatus })), pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
  }
  async statistics() {
    const rows = await this.notifications.createQueryBuilder('n').select('n.delivery_status', 'deliveryStatus').addSelect('COUNT(*)', 'count').groupBy('n.delivery_status').getRawMany<{deliveryStatus:string;count:string}>();
    const readCount = await this.notifications.count({ where: { readAt: IsNull() } });
    const total = rows.reduce((a, r) => a + Number(r.count), 0);
    return { delivery: rows.map((r) => ({ status: r.deliveryStatus, count: Number(r.count) })), total, readCount: total - readCount, unreadCount: readCount };
  }
}
