import { Repository } from 'typeorm';
import { Course, Enrollment, User } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { ManualEnrollmentDto } from './enrollments.dto.js';
export declare class EnrollmentsService {
    private readonly enrollments;
    private readonly users;
    private readonly courses;
    private readonly access;
    constructor(enrollments: Repository<Enrollment>, users: Repository<User>, courses: Repository<Course>, access: LearningAccessService);
    private id;
    private admin;
    private view;
    manual(dto: ManualEnrollmentDto, actor: AuthenticatedUser): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        status: "active" | "completed" | "revoked";
        source: "payment" | "manual" | "admin";
        enrolledAt: Date;
        expiresAt: Date | null;
        createdAt: Date;
    }>;
    mine(user: AuthenticatedUser): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        status: "active" | "completed" | "revoked";
        source: "payment" | "manual" | "admin";
        enrolledAt: Date;
        expiresAt: Date | null;
        createdAt: Date;
    }[]>;
    adminList(actor: AuthenticatedUser): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        status: "active" | "completed" | "revoked";
        source: "payment" | "manual" | "admin";
        enrolledAt: Date;
        expiresAt: Date | null;
        createdAt: Date;
    }[]>;
    detail(id: string, actor: AuthenticatedUser): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        status: "active" | "completed" | "revoked";
        source: "payment" | "manual" | "admin";
        enrolledAt: Date;
        expiresAt: Date | null;
        createdAt: Date;
    }>;
    setStatus(id: string, status: Enrollment['status'], actor: AuthenticatedUser): Promise<{
        id: string;
        user: {
            id: string;
            displayName: string;
        };
        course: {
            id: string;
            title: string;
        };
        status: "active" | "completed" | "revoked";
        source: "payment" | "manual" | "admin";
        enrolledAt: Date;
        expiresAt: Date | null;
        createdAt: Date;
    }>;
}
