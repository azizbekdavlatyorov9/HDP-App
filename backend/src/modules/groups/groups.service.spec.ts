import { ConflictException, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGroupsController } from './groups.controller.js';
import { GroupsService } from './groups.service.js';
import { StudyGroup, GroupStudent } from '../../database/entities/groups.entity.js';
import { Enrollment } from '../../database/entities/education.entity.js';
import { User, UserRole } from '../../database/entities/core.entity.js';

const ids = {
  group: '10000000-0000-4000-8000-000000000001',
  course: '20000000-0000-4000-8000-000000000001',
  enrollment: '30000000-0000-4000-8000-000000000001',
  student: '40000000-0000-4000-8000-000000000001',
};
const admin = { id: '50000000-0000-4000-8000-000000000001', roles: ['ADMIN'] };
const studentActor = { id: ids.student, roles: ['STUDENT'] };

function fixture() {
  const course = { id: ids.course, title: 'Mathematics' };
  const student = { id: ids.student, displayName: 'Student', status: 'active' };
  const group = {
    id: ids.group,
    name: 'Algebra A',
    code: 'ALG-A',
    course,
    leadTeacher: { id: 'teacher-id', displayName: 'Teacher' },
    capacity: 5,
    status: 'ACTIVE',
  };
  const enrollment = {
    id: ids.enrollment,
    user: student,
    course,
    status: 'active',
    expiresAt: null,
  };
  const groups: any = { findOne: vi.fn(async () => group) };
  const enrollments: any = { findOne: vi.fn(async () => enrollment) };
  const memberRepo: any = {
    exists: vi.fn(async () => false),
    count: vi.fn(async () => 0),
    create: vi.fn((value) => value),
    save: vi.fn(async (value) => ({ ...value, id: 'membership-id' })),
  };
  const txGroupRepo = { findOne: vi.fn(async () => group) };
  const txEnrollmentRepo = { findOne: vi.fn(async () => enrollment) };
  const txUserRepo = { findOne: vi.fn(async () => student) };
  const txUserRoleRepo = {
    createQueryBuilder: () => ({
      innerJoin: () => ({ where: () => ({ getExists: async () => true }) }),
    }),
  };
  const db: any = {
    transaction: vi.fn(async (callback) =>
      callback({
        query: vi.fn(async () => undefined),
        getRepository: (entity: unknown) => {
          if (entity === StudyGroup) return txGroupRepo;
          if (entity === Enrollment) return txEnrollmentRepo;
          if (entity === User) return txUserRepo;
          if (entity === UserRole) return txUserRoleRepo;
          if (entity === GroupStudent) return memberRepo;
          throw new Error('Unexpected repository');
        },
      }),
    ),
  };
  const notifications = { createAndDeliver: vi.fn(async () => undefined) };
  const service = new GroupsService(
    groups,
    memberRepo,
    { findOne: vi.fn() } as any,
    { findOne: vi.fn() } as any,
    enrollments,
    db,
    notifications as any,
  );
  return { service, groups, enrollments, memberRepo, db, enrollment, group };
}

describe('GroupsService enrollment integration', () => {
  it('assigns an active, matching enrollment and records it in historical membership', async () => {
    const f = fixture();
    await expect(f.service.addEnrollment(ids.group, ids.enrollment, admin as never)).resolves.toMatchObject({
      enrollmentId: ids.enrollment,
      studentId: ids.student,
      status: 'ACTIVE',
    });
    expect(f.memberRepo.create).toHaveBeenCalledWith(expect.objectContaining({ enrollment: f.enrollment }));
    expect(f.db.transaction).toHaveBeenCalledOnce();
  });

  it('rejects a student caller and prevents duplicate active assignments', async () => {
    const forbidden = fixture();
    await expect(forbidden.service.addEnrollment(ids.group, ids.enrollment, studentActor as never)).rejects.toBeInstanceOf(ForbiddenException);

    const duplicate = fixture();
    duplicate.memberRepo.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(duplicate.service.addEnrollment(ids.group, ids.enrollment, admin as never)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects revoked/completed enrollments and enrollments from another course', async () => {
    for (const status of ['revoked', 'completed']) {
      const f = fixture();
      f.enrollment.status = status;
      await expect(f.service.addEnrollment(ids.group, ids.enrollment, admin as never)).rejects.toMatchObject({ status: 400 });
      expect(f.db.transaction).toHaveBeenCalledOnce();
      expect(f.memberRepo.save).not.toHaveBeenCalled();
    }
    const mismatch = fixture();
    mismatch.enrollment.course = { id: 'another-course', title: 'Other course' };
    await expect(mismatch.service.addEnrollment(ids.group, ids.enrollment, admin as never)).rejects.toMatchObject({ status: 400 });
    expect(mismatch.db.transaction).toHaveBeenCalledOnce();
    expect(mismatch.memberRepo.save).not.toHaveBeenCalled();
  });

  it('locks the group and enrollment and checks capacity inside one transaction', async () => {
    const f = fixture();
    await f.service.addEnrollment(ids.group, ids.enrollment, admin as never);
    expect(f.db.transaction).toHaveBeenCalledOnce();
    const tx = f.db.transaction.mock.calls[0]![0];
    const query = vi.fn(async () => undefined);
    const manager: any = {
      query,
      getRepository: (entity: unknown) => {
        if (entity === StudyGroup) return { findOne: async () => ({ ...((await f.groups.findOne()) as object), course: { id: ids.course } }) };
        if (entity === Enrollment) return { findOne: async () => f.enrollment };
        if (entity === User) return { findOne: async () => ({ id: ids.student, status: 'active' }) };
        if (entity === UserRole) return { createQueryBuilder: () => ({ innerJoin: () => ({ where: () => ({ getExists: async () => true }) }) }) };
        return f.memberRepo;
      },
    };
    await tx(manager);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('pg_advisory_xact_lock'), expect.any(Array));
  });

  it('rejects assignment when the group is inactive or at capacity', async () => {
    const inactive = fixture();
    inactive.group.status = 'CANCELLED';
    await expect(inactive.service.addEnrollment(ids.group, ids.enrollment, admin as never)).rejects.toMatchObject({ status: 400 });

    const full = fixture();
    full.group.capacity = 0;
    await expect(full.service.addEnrollment(ids.group, ids.enrollment, admin as never)).rejects.toMatchObject({ status: 400 });
  });

  it('protects admin routes with JWT and ADMIN/SUPER_ADMIN role guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminGroupsController)).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata('requiredRoles', AdminGroupsController)).toEqual(['ADMIN', 'SUPER_ADMIN']);
  });
});
