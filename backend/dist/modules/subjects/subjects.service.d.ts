import { Repository } from 'typeorm';
import { Course, Subject } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';
export declare class SubjectsService {
    private readonly subjects;
    private readonly courses;
    private readonly access;
    constructor(subjects: Repository<Subject>, courses: Repository<Course>, access: LearningAccessService);
    private assertId;
    private admin;
    private view;
    listForCourse(courseId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    get(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        status: "archived" | "active";
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(courseId: string, dto: CreateSubjectDto, user: AuthenticatedUser): Promise<{
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
