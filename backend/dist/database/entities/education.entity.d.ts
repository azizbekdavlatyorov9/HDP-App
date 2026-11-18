import type { Relation } from 'typeorm';
import { Test } from './assessment.entity.js';
import { User } from './core.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';
export declare class Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    archivedAt: Date | null;
    parent: Relation<Category | null>;
    children: Relation<Category[]>;
    courseCategories: Relation<CourseCategory[]>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Course {
    id: string;
    leadTeacher: Relation<User>;
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    priceMinor: string;
    currency: string;
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    courseCategories: Relation<CourseCategory[]>;
    subjects: Relation<Subject[]>;
    lessons: Relation<Lesson[]>;
    enrollments: Relation<Enrollment[]>;
    tests: Relation<Test[]>;
    progress: Relation<CourseProgress[]>;
    payments: Relation<Payment[]>;
}
export declare class Subject {
    id: string;
    course: Relation<Course>;
    title: string;
    description: string | null;
    status: 'active' | 'archived';
    lessons: Relation<Lesson[]>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CourseCategory {
    id: string;
    course: Relation<Course>;
    category: Relation<Category>;
    createdAt: Date;
}
export declare class Lesson {
    id: string;
    course: Relation<Course>;
    subject: Relation<Subject | null>;
    title: string;
    description: string | null;
    position: number;
    videoUrl: string | null;
    materials: Record<string, unknown>[] | null;
    status: 'draft' | 'published' | 'archived';
    isFree: boolean;
    createdAt: Date;
    updatedAt: Date;
    prerequisites: Relation<LessonPrerequisite[]>;
    requiredBy: Relation<LessonPrerequisite[]>;
    videos: Relation<Video[]>;
    tests: Relation<Test[]>;
    progress: Relation<LessonProgress[]>;
}
export declare class LessonPrerequisite {
    id: string;
    lesson: Relation<Lesson>;
    prerequisiteLesson: Relation<Lesson>;
}
export declare class Video {
    id: string;
    lesson: Relation<Lesson>;
    initiatedBy: Relation<User | null>;
    cloudflareUid: string;
    provider: string;
    title: string | null;
    thumbnailUrl: string | null;
    position: number;
    status: 'pending' | 'uploading' | 'processing' | 'ready' | 'error' | 'deleted';
    durationSeconds: number | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Enrollment {
    id: string;
    user: Relation<User>;
    course: Relation<Course>;
    status: 'active' | 'completed' | 'revoked';
    source: 'manual' | 'payment' | 'admin';
    enrolledAt: Date;
    expiresAt: Date | null;
    createdAt: Date;
}
