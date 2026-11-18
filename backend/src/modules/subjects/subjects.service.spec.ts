import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import {
  CourseSubjectsController,
  SubjectsController,
} from './subjects.controller.js';
import { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';
import { SubjectsService } from './subjects.service.js';

const admin = {
  id: '10000000-0000-4000-8000-000000000001',
  displayName: 'Admin',
  roles: ['ADMIN'],
};
const teacher = {
  id: '10000000-0000-4000-8000-000000000002',
  displayName: 'Teacher',
  roles: ['TEACHER'],
};
const courseId = '20000000-0000-4000-8000-000000000001';
const subjectId = '30000000-0000-4000-8000-000000000001';

function setup() {
  const course = { id: courseId, title: 'Mathematics', status: 'published' };
  const subject = {
    id: subjectId,
    course,
    title: 'Algebra',
    description: null as string | null,
    status: 'active' as 'active' | 'archived',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const courses = {
    findOne: vi.fn(async ({ where }: { where: { id: string } }) =>
      where.id === courseId ? course : null,
    ),
  };
  const subjects = {
    create: vi.fn((value: typeof subject) => ({ ...value, id: subjectId })),
    save: vi.fn(async (row: typeof subject) => row),
    find: vi.fn().mockResolvedValue([subject]),
    findOne: vi.fn(
      async ({ where }: { where: { id: string; status?: string } }) =>
        where.id === subjectId &&
        (!where.status || subject.status === where.status)
          ? subject
          : null,
    ),
  };
  const access = {
    isAdmin: vi.fn((user: { roles: string[] }) =>
      user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)),
    ),
  };
  const service = new SubjectsService(
    subjects as never,
    courses as never,
    access as never,
  );
  return { service, courses, subjects, access, course, subject };
}

describe('SubjectsService', () => {
  it('creates a subject for an existing course', async () => {
    const { service, subjects } = setup();
    const result = await service.create(
      courseId,
      { title: '  Algebra  ', description: 'Expressions' },
      admin as never,
    );
    expect(subjects.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Algebra',
        description: 'Expressions',
        status: 'active',
        course: expect.objectContaining({ id: courseId }),
      }),
    );
    expect(result).toMatchObject({
      id: subjectId,
      courseId,
      title: 'Algebra',
      status: 'active',
    });
  });

  it('lists active subjects only for published courses', async () => {
    const { service, courses, subjects } = setup();
    await expect(service.listForCourse(courseId)).resolves.toHaveLength(1);
    expect(subjects.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { course: { id: courseId }, status: 'active' },
      }),
    );
    courses.findOne.mockResolvedValueOnce({
      id: courseId,
      status: 'archived',
    } as never);
    await expect(service.listForCourse(courseId)).resolves.toEqual([]);
  });

  it('gets one active subject and returns 404 when it is absent', async () => {
    const { service, subjects } = setup();
    await expect(service.get(subjectId)).resolves.toMatchObject({
      id: subjectId,
      title: 'Algebra',
    });
    subjects.findOne.mockResolvedValueOnce(null as never);
    await expect(service.get(subjectId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a subject', async () => {
    const { service, subject, subjects } = setup();
    await expect(
      service.update(
        subjectId,
        { title: 'Geometry', description: 'Shapes' },
        admin as never,
      ),
    ).resolves.toMatchObject({ title: 'Geometry', description: 'Shapes' });
    expect(subject.title).toBe('Geometry');
    expect(subjects.save).toHaveBeenCalled();
  });

  it('archives a subject without deleting it', async () => {
    const { service, subject, subjects } = setup();
    await expect(
      service.archive(subjectId, admin as never),
    ).resolves.toMatchObject({
      status: 'archived',
    });
    expect(subject.status).toBe('archived');
    expect(subjects.save).toHaveBeenCalledWith(subject);
  });

  it('denies non-admin write operations', async () => {
    const { service, subjects } = setup();
    await expect(
      service.create(courseId, { title: 'Algebra' }, teacher as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(subjectId, { title: 'Geometry' }, teacher as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.archive(subjectId, teacher as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(subjects.save).not.toHaveBeenCalled();
  });

  it('rejects adding subjects to archived courses and returns 404 for missing courses', async () => {
    const { service, courses } = setup();
    courses.findOne.mockResolvedValueOnce({
      id: courseId,
      status: 'archived',
    } as never);
    await expect(
      service.create(courseId, { title: 'Algebra' }, admin as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    courses.findOne.mockResolvedValueOnce(null as never);
    await expect(
      service.create(courseId, { title: 'Algebra' }, admin as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects malformed course and subject UUIDs', async () => {
    const { service } = setup();
    await expect(
      service.create('bad-id', { title: 'Algebra' }, admin as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.listForCourse('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.get('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.update('bad-id', {}, admin as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('Subject validation and guards', () => {
  it('requires a non-empty title while allowing an optional description', async () => {
    const invalid = plainToInstance(CreateSubjectDto, { title: ' ' });
    expect((await validate(invalid)).map((error) => error.property)).toEqual(
      expect.arrayContaining(['title']),
    );
    const valid = plainToInstance(CreateSubjectDto, {
      title: 'Algebra',
      description: 'Basic algebra',
    });
    expect(await validate(valid)).toHaveLength(0);
    const invalidUpdate = plainToInstance(UpdateSubjectDto, { title: '' });
    expect(await validate(invalidUpdate)).not.toHaveLength(0);
  });

  it('keeps GET endpoints public and protects all writes with JWT and admin role guards', () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        CourseSubjectsController.prototype.list,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(GUARDS_METADATA, SubjectsController.prototype.get),
    ).toBeUndefined();
    for (const handler of [
      CourseSubjectsController.prototype.create,
      SubjectsController.prototype.update,
      SubjectsController.prototype.archive,
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
        JwtAuthGuard,
        RolesGuard,
      ]);
      expect(Reflect.getMetadata('requiredRoles', handler)).toEqual([
        'ADMIN',
        'SUPER_ADMIN',
      ]);
    }
  });
});
