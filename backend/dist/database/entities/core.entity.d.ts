import type { Relation } from 'typeorm';
import { TestAttempt } from './assessment.entity.js';
import { Course, Enrollment } from './education.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';
export declare class User {
    id: string;
    displayName: string;
    status: 'active' | 'suspended' | 'deleted';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    userRoles: Relation<UserRole[]>;
    authIdentities: Relation<AuthIdentity[]>;
    refreshTokens: Relation<RefreshToken[]>;
    ledCourses: Relation<Course[]>;
    enrollments: Relation<Enrollment[]>;
    testAttempts: Relation<TestAttempt[]>;
    lessonProgress: Relation<LessonProgress[]>;
    courseProgress: Relation<CourseProgress[]>;
    payments: Relation<Payment[]>;
}
export declare class Role {
    id: string;
    code: string;
    description: string | null;
    createdAt: Date;
    userRoles: Relation<UserRole[]>;
}
export declare class UserRole {
    id: string;
    user: Relation<User>;
    role: Relation<Role>;
    createdAt: Date;
}
export declare class AuthIdentity {
    id: string;
    user: Relation<User>;
    provider: 'telegram' | 'phone';
    providerSubject: string;
    verifiedAt: Date | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
export declare class RefreshToken {
    id: string;
    user: Relation<User>;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    replacedBy: Relation<RefreshToken | null>;
    replacements: Relation<RefreshToken[]>;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
}
export declare class PhoneVerification {
    id: string;
    phoneNumber: string;
    purpose: 'login' | 'link';
    requestedForUser: Relation<User | null>;
    codeHash: string;
    expiresAt: Date;
    attemptCount: number;
    consumedAt: Date | null;
    requestedFromIp: string | null;
    createdAt: Date;
}
export declare class AuthChallenge {
    id: string;
    provider: 'telegram';
    purpose: 'login' | 'link';
    requestedForUser: Relation<User | null>;
    requestedForUserId: string | null;
    nonceHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
}
