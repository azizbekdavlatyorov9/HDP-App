import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { CreateLessonDto, CreateSubjectLessonDto, ReorderLessonsDto, UpdateLessonDto } from './lessons.dto.js';
import { LessonsService } from './lessons.service.js';
export declare class LessonsController {
    private readonly service;
    constructor(service: LessonsService);
    create(courseId: string, dto: CreateLessonDto, user: AuthenticatedUser): Promise<{
        isFree: boolean;
        prerequisiteIds: string[];
        id: string;
        subjectId: string | null;
        courseId: string;
        title: string;
        description: string | null;
        orderIndex: number;
        videoUrl: string | null;
        materials: Record<string, unknown>[] | null;
        status: "draft" | "published" | "archived";
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(courseId: string, user: AuthenticatedUser): Promise<(import("../../database/entities/education.entity.js").Lesson | {
        id: string;
        title: string;
        position: number;
        isLocked: boolean;
    })[]>;
    reorder(courseId: string, dto: ReorderLessonsDto, user: AuthenticatedUser): Promise<(import("../../database/entities/education.entity.js").Lesson | {
        id: string;
        title: string;
        position: number;
        isLocked: boolean;
    })[]>;
    listForSubject(subjectId: string): Promise<{
        id: string;
        subjectId: string | null;
        courseId: string;
        title: string;
        description: string | null;
        orderIndex: number;
        videoUrl: string | null;
        materials: Record<string, unknown>[] | null;
        status: "draft" | "published" | "archived";
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createForSubject(subjectId: string, dto: CreateSubjectLessonDto, user: AuthenticatedUser): Promise<{
        isFree: boolean;
        prerequisiteIds: string[];
        id: string;
        subjectId: string | null;
        courseId: string;
        title: string;
        description: string | null;
        orderIndex: number;
        videoUrl: string | null;
        materials: Record<string, unknown>[] | null;
        status: "draft" | "published" | "archived";
        createdAt: Date;
        updatedAt: Date;
    }>;
    publicDetail(id: string): Promise<{
        id: string;
        subjectId: string | null;
        courseId: string;
        title: string;
        description: string | null;
        orderIndex: number;
        videoUrl: string | null;
        materials: Record<string, unknown>[] | null;
        status: "draft" | "published" | "archived";
        createdAt: Date;
        updatedAt: Date;
    }>;
    detail(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        courseId: string;
        title: string;
        description: string | null;
        position: number;
        status: "draft" | "published" | "archived";
        isFree: boolean;
        prerequisiteIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateLessonDto, user: AuthenticatedUser): Promise<{
        isFree: boolean;
        prerequisiteIds: string[];
        id: string;
        subjectId: string | null;
        courseId: string;
        title: string;
        description: string | null;
        orderIndex: number;
        videoUrl: string | null;
        materials: Record<string, unknown>[] | null;
        status: "draft" | "published" | "archived";
        createdAt: Date;
        updatedAt: Date;
    }>;
    publish(id: string, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Lesson>;
    archive(id: string, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Lesson>;
    archiveLegacy(id: string, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Lesson>;
}
