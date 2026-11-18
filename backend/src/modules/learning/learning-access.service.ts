import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';

@Injectable()
export class LearningAccessService {
  constructor(
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(Lesson) private readonly lessons: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private readonly progress: Repository<LessonProgress>,
  ) {}

  isAdmin(user: AuthenticatedUser) {
    return user.roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  }

  async hasActiveEnrollment(courseId: string, userId: string) {
    const enrollment = await this.enrollments.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: 'active',
      },
    });
    return Boolean(
      enrollment &&
      (!enrollment.expiresAt || enrollment.expiresAt > new Date()),
    );
  }

  async canManageCourse(courseId: string, user: AuthenticatedUser) {
    const course = await this.courses.findOne({
      where: { id: courseId },
      relations: { leadTeacher: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (
      !this.isAdmin(user) &&
      !(user.roles.includes('TEACHER') && course.leadTeacher.id === user.id)
    )
      throw new ForbiddenException();
    return course;
  }

  async canAccessLesson(lessonId: string, user: AuthenticatedUser) {
    const lesson = await this.lessons.findOne({
      where: { id: lessonId },
      relations: {
        course: { leadTeacher: true },
        prerequisites: { prerequisiteLesson: true },
      },
    });
    if (
      !lesson ||
      lesson.status !== 'published' ||
      lesson.course.status !== 'published'
    )
      throw new NotFoundException('Lesson not found');
    if (
      this.isAdmin(user) ||
      (user.roles.includes('TEACHER') &&
        lesson.course.leadTeacher.id === user.id)
    )
      return lesson;
    const hasEnrollment = await this.hasActiveEnrollment(
      lesson.course.id,
      user.id,
    );
    if (!lesson.isFree && !hasEnrollment)
      throw new ForbiddenException('An active enrollment is required');
    for (const edge of lesson.prerequisites ?? []) {
      const done = await this.progress.findOne({
        where: {
          user: { id: user.id },
          lesson: { id: edge.prerequisiteLesson.id },
        },
      });
      if (!done?.completedAt)
        throw new ForbiddenException('Complete prerequisite lessons first');
    }
    return lesson;
  }
}
