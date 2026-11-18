import { Repository } from 'typeorm';
import { Course, Enrollment, Lesson, LessonProgress } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
export declare class LearningAccessService {
    private readonly courses;
    private readonly lessons;
    private readonly enrollments;
    private readonly progress;
    constructor(courses: Repository<Course>, lessons: Repository<Lesson>, enrollments: Repository<Enrollment>, progress: Repository<LessonProgress>);
    isAdmin(user: AuthenticatedUser): boolean;
    hasActiveEnrollment(courseId: string, userId: string): Promise<boolean>;
    canManageCourse(courseId: string, user: AuthenticatedUser): Promise<Course>;
    canAccessLesson(lessonId: string, user: AuthenticatedUser): Promise<Lesson>;
}
