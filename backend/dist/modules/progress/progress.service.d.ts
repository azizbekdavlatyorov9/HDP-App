import { Repository } from 'typeorm';
import { Course, CourseProgress, Enrollment, Lesson, LessonProgress, Video } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
export declare class ProgressService {
    private readonly courses;
    private readonly cp;
    private readonly enrollments;
    private readonly lessons;
    private readonly lp;
    private readonly videos;
    private readonly access;
    constructor(courses: Repository<Course>, cp: Repository<CourseProgress>, enrollments: Repository<Enrollment>, lessons: Repository<Lesson>, lp: Repository<LessonProgress>, videos: Repository<Video>, access: LearningAccessService);
    watch(id: string, delta: number, u: AuthenticatedUser): Promise<LessonProgress>;
    complete(id: string, u: AuthenticatedUser): Promise<CourseProgress>;
    private recalculate;
    mine(u: AuthenticatedUser): Promise<CourseProgress[]>;
    forCourse(courseId: string, userId: string, u: AuthenticatedUser): Promise<CourseProgress[]>;
    overview(courseId: string, u: AuthenticatedUser): Promise<CourseProgress[]>;
}
