import { DataSource, Repository } from 'typeorm';
import { Attendance, AttendanceHistory, AttendanceSession, GroupStudent, LessonSession } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { AttendanceBulkDto, AttendanceListDto, AttendanceUpdateDto } from './attendance.dto.js';
export declare class AttendanceService {
    private readonly records;
    private readonly states;
    private readonly history;
    private readonly sessions;
    private readonly memberships;
    private readonly db;
    private readonly notifications;
    constructor(records: Repository<Attendance>, states: Repository<AttendanceSession>, history: Repository<AttendanceHistory>, sessions: Repository<LessonSession>, memberships: Repository<GroupStudent>, db: DataSource, notifications: NotificationsService);
    private admin;
    private getSession;
    private lockSession;
    private canManage;
    private eligible;
    private view;
    private sessionState;
    private recordHistory;
    private assertEditable;
    private saveEntry;
    start(sessionId: string, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        startedAt: any;
    }>;
    eligibleStudents(sessionId: string, u: AuthenticatedUser): Promise<{
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
    viewSession(sessionId: string, u: AuthenticatedUser): Promise<{
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
    submit(sessionId: string, dto: AttendanceBulkDto, u: AuthenticatedUser): Promise<{
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
    update(sessionId: string, attendanceId: string, dto: AttendanceUpdateDto, u: AuthenticatedUser): Promise<{
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
    finalize(sessionId: string, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        finalizedAt: any;
    }>;
    reopen(sessionId: string, reason: string, u: AuthenticatedUser): Promise<{
        sessionId: string;
        status: any;
        reason: string;
    }>;
    studentList(u: AuthenticatedUser, q: AttendanceListDto): Promise<{
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
    studentDetail(id: string, u: AuthenticatedUser): Promise<{
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
    private studentView;
    private listQuery;
    private queryList;
    adminList(q: AttendanceListDto, u: AuthenticatedUser): Promise<{
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
    adminUpdate(attendanceId: string, dto: AttendanceUpdateDto, u: AuthenticatedUser): Promise<{
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
    statistics(u: AuthenticatedUser, studentId?: string, q?: AttendanceListDto): Promise<{
        totalScheduledSessions: number;
        presentSessions: number;
        absentSessions: number;
        lateSessions: number;
        excusedSessions: number;
        attendancePercentage: number;
        absencePercentage: number;
        latePercentage: number;
    }>;
    adminStatistics(q: AttendanceListDto, u: AuthenticatedUser): Promise<{
        totalScheduledSessions: number;
        presentSessions: number;
        absentSessions: number;
        lateSessions: number;
        excusedSessions: number;
        attendancePercentage: number;
        absencePercentage: number;
        latePercentage: number;
    }>;
}
