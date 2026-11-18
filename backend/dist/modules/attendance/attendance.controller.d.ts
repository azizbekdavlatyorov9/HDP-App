import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AttendanceBulkDto, AttendanceListDto, AttendanceUpdateDto, ReopenAttendanceDto } from './attendance.dto.js';
import { AttendanceService } from './attendance.service.js';
export declare class TeacherAttendanceController {
    private readonly service;
    constructor(service: AttendanceService);
    view(id: string, u: AuthenticatedUser): Promise<{
        session: {
            id: string;
            startAt: Date;
            endAt: Date;
            group: {
                id: string;
                name: string;
            };
            course: {
                id: string;
                title: string;
            };
        };
        lifecycle: import("../../database/entities/attendance.entity.js").AttendanceLifecycleStatus;
        eligibleCount: number;
        recordedCount: number;
        records: {
            markedById: string;
            markedAt: Date;
            updatedAt: Date;
            teacherNote?: string | null | undefined;
            id: string;
            sessionId: string;
            studentId: string;
            membershipId: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
        }[];
    }>;
    eligible(id: string, u: AuthenticatedUser): Promise<{
        student: {
            id: string;
            displayName: string;
        };
        membershipId: string;
        attendance: {
            id: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
        } | null;
    }[]>;
    start(id: string, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        startedAt: any;
    }>;
    submit(id: string, d: AttendanceBulkDto, u: AuthenticatedUser): Promise<{
        sessionId: string;
        updated: number;
        records: {
            markedById: string;
            markedAt: Date;
            updatedAt: Date;
            teacherNote?: string | null | undefined;
            id: string;
            sessionId: string;
            studentId: string;
            membershipId: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
        }[];
    }>;
    update(id: string, aid: string, d: AttendanceUpdateDto, u: AuthenticatedUser): Promise<{
        markedById: string;
        markedAt: Date;
        updatedAt: Date;
        teacherNote?: string | null | undefined;
        id: string;
        sessionId: string;
        studentId: string;
        membershipId: string;
        status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
        latenessMinutes: number | null;
        reason: string | null;
    }>;
    finalize(id: string, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        finalizedAt: any;
    }>;
}
export declare class StudentAttendanceController {
    private readonly service;
    constructor(service: AttendanceService);
    statistics(u: AuthenticatedUser, q: AttendanceListDto): Promise<{
        totalScheduledSessions: number;
        presentSessions: number;
        absentSessions: number;
        lateSessions: number;
        excusedSessions: number;
        attendancePercentage: number;
        absencePercentage: number;
        latePercentage: number;
    }>;
    list(u: AuthenticatedUser, q: AttendanceListDto): Promise<{
        data: ({
            markedById: string;
            markedAt: Date;
            updatedAt: Date;
            teacherNote?: string | null | undefined;
            id: string;
            sessionId: string;
            studentId: string;
            membershipId: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
        } | {
            id: string;
            session: {
                id: string;
                startAt: Date;
                endAt: Date;
                group: {
                    id: string;
                    name: string;
                };
                course: {
                    id: string;
                    title: string;
                };
            };
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
            markedAt: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    detail(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        session: {
            id: string;
            startAt: Date;
            endAt: Date;
            group: {
                id: string;
                name: string;
            };
            course: {
                id: string;
                title: string;
            };
        };
        status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
        latenessMinutes: number | null;
        reason: string | null;
        markedAt: Date;
    }>;
}
export declare class AdminAttendanceController {
    private readonly service;
    constructor(service: AttendanceService);
    statistics(q: AttendanceListDto, u: AuthenticatedUser): Promise<{
        totalScheduledSessions: number;
        presentSessions: number;
        absentSessions: number;
        lateSessions: number;
        excusedSessions: number;
        attendancePercentage: number;
        absencePercentage: number;
        latePercentage: number;
    }>;
    session(id: string, u: AuthenticatedUser): Promise<{
        session: {
            id: string;
            startAt: Date;
            endAt: Date;
            group: {
                id: string;
                name: string;
            };
            course: {
                id: string;
                title: string;
            };
        };
        lifecycle: import("../../database/entities/attendance.entity.js").AttendanceLifecycleStatus;
        eligibleCount: number;
        recordedCount: number;
        records: {
            markedById: string;
            markedAt: Date;
            updatedAt: Date;
            teacherNote?: string | null | undefined;
            id: string;
            sessionId: string;
            studentId: string;
            membershipId: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
        }[];
    }>;
    list(q: AttendanceListDto, u: AuthenticatedUser): Promise<{
        data: ({
            markedById: string;
            markedAt: Date;
            updatedAt: Date;
            teacherNote?: string | null | undefined;
            id: string;
            sessionId: string;
            studentId: string;
            membershipId: string;
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
        } | {
            id: string;
            session: {
                id: string;
                startAt: Date;
                endAt: Date;
                group: {
                    id: string;
                    name: string;
                };
                course: {
                    id: string;
                    title: string;
                };
            };
            status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
            latenessMinutes: number | null;
            reason: string | null;
            markedAt: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    update(id: string, d: AttendanceUpdateDto, u: AuthenticatedUser): Promise<{
        markedById: string;
        markedAt: Date;
        updatedAt: Date;
        teacherNote?: string | null | undefined;
        id: string;
        sessionId: string;
        studentId: string;
        membershipId: string;
        status: import("../../database/entities/attendance.entity.js").AttendanceStatus;
        latenessMinutes: number | null;
        reason: string | null;
    }>;
    reopen(id: string, d: ReopenAttendanceDto, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        reason: string;
    }>;
}
