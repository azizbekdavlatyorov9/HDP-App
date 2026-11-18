import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { EnrollmentStatusDto, ManualEnrollmentDto } from './enrollments.dto.js';
import { EnrollmentsService } from './enrollments.service.js';
export declare class EnrollmentsController {
    private readonly service;
    constructor(service: EnrollmentsService);
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
    detail(id: string, user: AuthenticatedUser): Promise<{
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
export declare class AdminEnrollmentsController {
    private readonly service;
    constructor(service: EnrollmentsService);
    manual(dto: ManualEnrollmentDto, user: AuthenticatedUser): Promise<{
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
    list(user: AuthenticatedUser): Promise<{
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
    detail(id: string, user: AuthenticatedUser): Promise<{
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
    status(id: string, dto: EnrollmentStatusDto, user: AuthenticatedUser): Promise<{
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
