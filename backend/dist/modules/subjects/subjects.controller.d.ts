import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';
import { SubjectsService } from './subjects.service.js';
export declare class CourseSubjectsController {
    private readonly subjects;
    constructor(subjects: SubjectsService);
    list(courseId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(courseId: string, dto: CreateSubjectDto, user: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare class SubjectsController {
    private readonly subjects;
    constructor(subjects: SubjectsService);
    get(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateSubjectDto, user: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }>;
    archive(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }>;
}
