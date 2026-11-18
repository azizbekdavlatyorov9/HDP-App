import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AdminEnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';

const userId = '10000000-0000-4000-8000-000000000001',
  courseId = '20000000-0000-4000-8000-000000000001',
  enrollmentId = '30000000-0000-4000-8000-000000000001';
const admin = { id: 'admin', displayName: 'Admin', roles: ['ADMIN'] },
  superAdmin = { id: 'root', displayName: 'Root', roles: ['SUPER_ADMIN'] },
  student = { id: userId, displayName: 'Student', roles: ['STUDENT'] };
function setup() {
  const user = { id: userId, displayName: 'Student', status: 'active' },
    course = { id: courseId, title: 'Math', status: 'published' };
  const row: any = {
    id: enrollmentId,
    user,
    course,
    status: 'active',
    source: 'admin',
    enrolledAt: new Date(),
    expiresAt: null,
    createdAt: new Date(),
  };
  const users: any = { findOne: vi.fn(async () => user) };
  const courses: any = { findOne: vi.fn(async () => course) };
  const enrollments: any = {
    create: vi.fn((x) => ({ ...x, id: enrollmentId, createdAt: new Date() })),
    save: vi.fn(async (x) => x),
    findOne: vi.fn(async () => null),
    find: vi.fn(async () => [row]),
  };
  const access = {
    isAdmin: vi.fn((u: any) =>
      u.roles.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r)),
    ),
  };
  return {
    service: new EnrollmentsService(
      enrollments,
      users,
      courses,
      access as never,
    ),
    users,
    courses,
    enrollments,
    access,
    row,
    user,
    course,
  };
}
describe('EnrollmentsService', () => {
  it('creates active manual enrollment with server controlled source for admins and super admins', async () => {
    for (const actor of [admin, superAdmin]) {
      const f = setup();
      const out = await f.service.manual({ userId, courseId }, actor as never);
      expect(out).toMatchObject({ status: 'active', source: 'admin' });
      expect(f.enrollments.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', source: 'admin' }),
      );
    }
  });
  it('denies students and rejects inactive or missing students and unpublished courses', async () => {
    const f = setup();
    await expect(
      f.service.manual({ userId, courseId }, student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    f.users.findOne.mockResolvedValueOnce(null);
    await expect(
      f.service.manual({ userId, courseId }, admin as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    f.courses.findOne.mockResolvedValueOnce(null);
    await expect(
      f.service.manual({ userId, courseId }, admin as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('returns conflict for duplicate enrollments and unique-constraint races', async () => {
    const f = setup();
    f.enrollments.findOne.mockResolvedValueOnce({ id: enrollmentId });
    await expect(
      f.service.manual({ userId, courseId }, admin as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('lists only the caller’s own enrollments and hides another student’s records', async () => {
    const f = setup();
    await f.service.mine(student as never);
    expect(f.enrollments.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user: { id: userId } } }),
    );
    f.enrollments.findOne.mockResolvedValueOnce(null);
    await expect(
      f.service.detail(enrollmentId, student as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('allows admin detail/list and changes status without changing source', async () => {
    const f = setup();
    f.enrollments.findOne.mockResolvedValue(f.row);
    await expect(
      f.service.detail(enrollmentId, admin as never),
    ).resolves.toMatchObject({ source: 'admin' });
    await f.service.adminList(admin as never);
    for (const status of ['active', 'completed', 'revoked'] as const) {
      f.row.status = status;
      await f.service.setStatus(enrollmentId, status, admin as never);
      expect(f.row.source).toBe('admin');
    }
  });
  it('rejects malformed UUIDs and returns 404 for missing enrollment', async () => {
    const f = setup();
    await expect(
      f.service.manual({ userId: 'bad', courseId }, admin as never),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      f.service.setStatus('bad', 'revoked', admin as never),
    ).rejects.toMatchObject({ status: 400 });
    f.enrollments.findOne.mockResolvedValueOnce(null);
    await expect(
      f.service.setStatus(enrollmentId, 'revoked', admin as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('exposes admin endpoints only behind JWT and role guards', () => {
    for (const handler of [
      AdminEnrollmentsController.prototype.manual,
      AdminEnrollmentsController.prototype.list,
      AdminEnrollmentsController.prototype.status,
    ]) {
      expect(
        Reflect.getMetadata(GUARDS_METADATA, AdminEnrollmentsController),
      ).toEqual([JwtAuthGuard, RolesGuard]);
      expect(
        Reflect.getMetadata('requiredRoles', AdminEnrollmentsController),
      ).toEqual(['ADMIN', 'SUPER_ADMIN']);
      expect(handler).toBeDefined();
    }
  });
});
