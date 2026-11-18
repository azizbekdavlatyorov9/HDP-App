import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';
export declare class LessonProgress {
    id: string;
    user: Relation<User>;
    lesson: Relation<Lesson>;
    watchedSeconds: number;
    watchedPercent: number;
    lastAccessedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CourseProgress {
    id: string;
    user: Relation<User>;
    course: Relation<Course>;
    lessonsCompleted: number;
    lessonsTotal: number;
    completionPercent: number;
    completedAt: Date | null;
    calculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
