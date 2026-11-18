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
import { LessonsController } from './lessons.controller.js';
import { CreateSubjectLessonDto, UpdateLessonDto } from './lessons.dto.js';
import { LessonsService } from './lessons.service.js';

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
const lessonId = '40000000-0000-4000-8000-000000000001';

function setup() {
  const course = {
    id: courseId,
    status: 'published',
    leadTeacher: { id: admin.id, displayName: 'Admin' },
  };
  const subject = { id: subjectId, status: 'active', course };
  const lesson: any = {
    id: lessonId,
    course,
    subject,
    title: 'Linear equations',
    description: null,
    position: 0,
    videoUrl: null,
    materials: null,
    isFree: false,
    status: 'published',
    prerequisites: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const rows: any[] = [lesson];
  const lessons: any = {
    create: vi.fn((data) => ({
      ...data,
      id: lessonId,
      prerequisites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    save: vi.fn(async (row) => {
      const index = rows.findIndex((existing) => existing.id === row.id);
      if (index < 0) rows.push(row);
      else rows[index] = row;
      return row;
    }),
    findOne: vi.fn(async ({ where }: any) => {
      if (where.id) {
        return (
          rows.find(
            (row) =>
              row.id === where.id &&
              (!where.status || row.status === where.status),
          ) ?? null
        );
      }
      if (where.subject?.id) {
        return (
          rows.find(
            (row) =>
              row.subject?.id === where.subject.id &&
              row.position === where.position,
          ) ?? null
        );
      }
      if (where.course?.id) {
        return (
          rows.find(
            (row) =>
              row.course.id === where.course.id &&
              row.subject == null &&
              row.position === where.position,
          ) ?? null
        );
      }
      return null;
    }),
    find: vi.fn(async ({ where }: any) => {
      if (where.subject?.id)
        return rows.filter(
          (row) =>
            row.subject?.id === where.subject.id && row.status === 'published',
        );
      return rows.filter(
        (row) =>
          row.course.id === where.course.id && row.status === 'published',
      );
    }),
    manager: {
      getRepository: vi.fn(() => {
        const query: any = {};
        query.select = vi.fn(() => query);
        query.where = vi.fn(() => query);
        query.getRawMany = vi.fn().mockResolvedValue([]);
        return { createQueryBuilder: vi.fn(() => query) };
      }),
    },
  };
  const subjects: any = {
    findOne: vi.fn(async () => subject),
  };
  const courses: any = {
    findOne: vi.fn(async () => course),
  };
  const edges: any = {
    find: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
    create: vi.fn((value) => value),
    save: vi.fn(),
  };
  const access = {
    isAdmin: vi.fn((user: { roles: string[] }) =>
      user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)),
    ),
    canManageCourse: vi.fn(async () => course),
    canAccessLesson: vi.fn(async () => ({ course })),
  };
  const notifications = { createAndDeliverMany: vi.fn() };
  const service = new LessonsService(
    lessons as never,
    edges as never,
    courses as never,
    subjects as never,
    access as never,
    notifications as never,
  );
  return { service, lessons, subjects, courses, access, rows, course, subject };
}

describe('LessonsService subject lessons', () => {
  it('creates a lesson linked to the selected subject and course', async () => {
    const { service, lessons } = setup();
    const result = await service.createForSubject(
      subjectId,
      {
        title: '  Linear equations  ',
        orderIndex: 3,
        videoUrl: 'https://example.test/lesson.mp4',
        materials: [
          { name: 'worksheet', url: 'https://example.test/sheet.pdf' },
        ],
      },
      admin as never,
    );
    expect(lessons.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Linear equations',
        position: 3,
        subject: expect.objectContaining({ id: subjectId }),
        course: expect.objectContaining({ id: courseId }),
        status: 'draft',
      }),
    );
    expect(result).toMatchObject({ subjectId, orderIndex: 3, status: 'draft' });
  });

  it('lists only published lessons for a published course and active subject', async () => {
    const { service, lessons, subjects, course } = setup();
    await expect(
      service.publicListForSubject(subjectId),
    ).resolves.toMatchObject([{ id: lessonId, status: 'published' }]);
    expect(lessons.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { subject: { id: subjectId }, status: 'published' },
      }),
    );
    subjects.findOne.mockResolvedValueOnce({
      id: subjectId,
      status: 'archived',
      course,
    } as never);
    await expect(service.publicListForSubject(subjectId)).resolves.toEqual([]);
  });

  it('gets published lesson details and hides unpublished lessons', async () => {
    const { service, rows } = setup();
    await expect(service.publicDetail(lessonId)).resolves.toMatchObject({
      id: lessonId,
      subjectId,
      orderIndex: 0,
    });
    rows[0].status = 'draft';
    await expect(service.publicDetail(lessonId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates lesson fields including ordering and materials', async () => {
    const { service, rows } = setup();
    const result = await service.update(
      lessonId,
      {
        title: 'Updated title',
        orderIndex: 4,
        materials: [{ name: 'notes' }],
      },
      admin as never,
    );
    expect(rows[0]).toMatchObject({
      title: 'Updated title',
      position: 4,
      materials: [{ name: 'notes' }],
    });
    expect(result).toMatchObject({ title: 'Updated title', orderIndex: 4 });
  });

  it('archives without deleting the lesson row', async () => {
    const { service, lessons, rows } = setup();
    await expect(
      service.archive(lessonId, admin as never),
    ).resolves.toMatchObject({
      status: 'archived',
    });
    expect(rows[0].status).toBe('archived');
    expect(lessons.save).toHaveBeenCalledWith(rows[0]);
  });

  it('denies non-admin create, update, and archive operations', async () => {
    const { service, lessons } = setup();
    await expect(
      service.createForSubject(
        subjectId,
        { title: 'Algebra', orderIndex: 1 },
        teacher as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(lessonId, { title: 'Changed' }, teacher as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.archive(lessonId, teacher as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(lessons.save).not.toHaveBeenCalled();
  });

  it('rejects lesson creation for archived subjects or unpublished courses', async () => {
    const { service, subjects } = setup();
    subjects.findOne.mockResolvedValueOnce({
      id: subjectId,
      status: 'archived',
      course: { id: courseId, status: 'published' },
    } as never);
    await expect(
      service.createForSubject(
        subjectId,
        { title: 'Algebra', orderIndex: 1 },
        admin as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    subjects.findOne.mockResolvedValueOnce({
      id: subjectId,
      status: 'active',
      course: { id: courseId, status: 'draft' },
    } as never);
    await expect(
      service.createForSubject(
        subjectId,
        { title: 'Algebra', orderIndex: 1 },
        admin as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate orderIndex values within a subject', async () => {
    const { service } = setup();
    await expect(
      service.createForSubject(
        subjectId,
        { title: 'Duplicate', orderIndex: 0 },
        admin as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 400 for malformed UUIDs and 404 for missing subjects/lessons', async () => {
    const { service, subjects, lessons } = setup();
    await expect(service.publicListForSubject('bad')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.publicDetail('bad')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.createForSubject(
        'bad',
        { title: 'A', orderIndex: 0 },
        admin as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    subjects.findOne.mockResolvedValueOnce(null as never);
    await expect(
      service.publicListForSubject(subjectId),
    ).rejects.toBeInstanceOf(NotFoundException);
    lessons.findOne.mockResolvedValueOnce(null as never);
    await expect(service.publicDetail(lessonId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('Lesson validation and endpoint guards', () => {
  it('validates title, orderIndex, video URL, materials, and status', async () => {
    const invalid = plainToInstance(CreateSubjectLessonDto, {
      title: ' ',
      orderIndex: -1,
      videoUrl: 'http://',
      materials: 'wrong-shape',
      status: 'ready',
    });
    expect((await validate(invalid)).map((error) => error.property)).toEqual(
      expect.arrayContaining([
        'title',
        'orderIndex',
        'videoUrl',
        'materials',
        'status',
      ]),
    );
    const valid = plainToInstance(CreateSubjectLessonDto, {
      title: 'Algebra',
      orderIndex: 0,
      videoUrl: null,
      materials: [{ name: 'worksheet' }],
      status: 'draft',
    });
    expect(await validate(valid)).toHaveLength(0);
    const invalidUpdate = plainToInstance(UpdateLessonDto, {
      orderIndex: -1,
      status: 'ready',
    });
    expect(await validate(invalidUpdate)).not.toHaveLength(0);
  });

  it('keeps public GET routes unguarded and protects all lesson writes with JWT/admin role guards', () => {
    const prototype = LessonsController.prototype;
    expect(
      Reflect.getMetadata(GUARDS_METADATA, prototype.listForSubject),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(GUARDS_METADATA, prototype.publicDetail),
    ).toBeUndefined();
    for (const handler of [
      prototype.createForSubject,
      prototype.update,
      prototype.archive,
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
