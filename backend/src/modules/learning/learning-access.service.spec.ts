import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { LearningAccessService } from './learning-access.service.js';

describe('LearningAccessService enrollment checks', () => {
  const student = {
    id: 'student-id',
    displayName: 'Student',
    roles: ['STUDENT'],
  };
  function setup(enrollmentStatus: 'active' | 'revoked' | null) {
    const lesson = {
      id: 'lesson-id',
      status: 'published',
      isFree: false,
      course: {
        id: 'course-id',
        status: 'published',
        leadTeacher: { id: 'teacher-id' },
      },
      prerequisites: [],
    };
    const enrollments = {
      findOne: vi.fn(async () =>
        enrollmentStatus === 'active'
          ? { status: enrollmentStatus, expiresAt: null }
          : null,
      ),
    };
    const lessons = { findOne: vi.fn(async () => lesson) };
    const progress = { findOne: vi.fn() };
    const access = new LearningAccessService(
      {} as never,
      lessons as never,
      enrollments as never,
      progress as never,
    );
    return { access, lessons, enrollments, lesson };
  }
  it('grants published lesson access with an active enrollment', async () => {
    const f = setup('active');
    await expect(
      f.access.canAccessLesson('lesson-id', student as never),
    ).resolves.toBe(f.lesson);
    expect(f.enrollments.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user: { id: 'student-id' },
          course: { id: 'course-id' },
          status: 'active',
        },
      }),
    );
  });
  it('denies lesson access when enrollment is revoked or missing', async () => {
    for (const state of ['revoked', null] as const) {
      const f = setup(state);
      await expect(
        f.access.canAccessLesson('lesson-id', student as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
    }
  });
});
