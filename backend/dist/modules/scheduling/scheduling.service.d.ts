import { DataSource, Repository } from 'typeorm';
import { Classroom, GroupSchedule, GroupStudent, LessonSession, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { GenerateSessionsDto, RescheduleSessionDto, ScheduleCreateDto, ScheduleUpdateDto } from './scheduling.dto.js';
import type { GroupScheduleEntryDto } from './group-schedule.dto.js';
export declare class SchedulingService {
    private readonly schedules;
    private readonly sessions;
    private readonly groups;
    private readonly rooms;
    private readonly users;
    private readonly userRoles;
    private readonly memberships;
    private readonly db;
    private readonly notifications;
    constructor(schedules: Repository<GroupSchedule>, sessions: Repository<LessonSession>, groups: Repository<StudyGroup>, rooms: Repository<Classroom>, users: Repository<User>, userRoles: Repository<UserRole>, memberships: Repository<GroupStudent>, db: DataSource, notifications: NotificationsService);
    private admin;
    private teacher;
    private group;
    private canManageGroup;
    private canViewSession;
    private lockResources;
    private dateRange;
    private overlapsRule;
    private conflicts;
    private assertScheduleAvailable;
    private resolveInput;
    create(dto: ScheduleCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    replaceGroupSchedules(groupId: string, entries: GroupScheduleEntryDto[], u: AuthenticatedUser): Promise<{
        weekday: number;
        id: string;
        group: {
            id: string;
            name: string;
        };
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, dto: ScheduleUpdateDto, u: AuthenticatedUser): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setStatus(id: string, isActive: boolean, u: AuthenticatedUser): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private schedule;
    private scheduleView;
    list(u: AuthenticatedUser, groupId?: string): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listGroupSchedule(groupId: string, u: AuthenticatedUser): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getSchedule(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        group: {
            id: string;
            name: string;
        };
        weekday: number;
        startTime: string;
        endTime: string;
        effectiveStartDate: string;
        effectiveEndDate: string | null;
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        timezone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private assertSessionAvailable;
    generate(id: string, dto: GenerateSessionsDto, u: AuthenticatedUser): Promise<{
        created: number;
        existing: number;
        sessions: {
            id: string;
            scheduleId: string;
            group: {
                id: string;
                name: string;
            };
            teacher: {
                id: string;
                displayName: string;
            };
            classroom: {
                id: string;
                name: string;
                code: string;
            };
            startAt: Date;
            endAt: Date;
            originalStartAt: Date;
            originalEndAt: Date;
            status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
            changeNote: string | null;
        }[];
    }>;
    listSessions(u: AuthenticatedUser, groupId?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            scheduleId: string;
            group: {
                id: string;
                name: string;
            };
            teacher: {
                id: string;
                displayName: string;
            };
            classroom: {
                id: string;
                name: string;
                code: string;
            };
            startAt: Date;
            endAt: Date;
            originalStartAt: Date;
            originalEndAt: Date;
            status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
            changeNote: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getSession(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        scheduleId: string;
        group: {
            id: string;
            name: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        startAt: Date;
        endAt: Date;
        originalStartAt: Date;
        originalEndAt: Date;
        status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
        changeNote: string | null;
    }>;
    private session;
    private sessionView;
    reschedule(id: string, dto: RescheduleSessionDto, u: AuthenticatedUser): Promise<{
        id: string;
        scheduleId: string;
        group: {
            id: string;
            name: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        startAt: Date;
        endAt: Date;
        originalStartAt: Date;
        originalEndAt: Date;
        status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
        changeNote: string | null;
    }>;
    cancelSession(id: string, note: string | undefined, u: AuthenticatedUser): Promise<{
        id: string;
        scheduleId: string;
        group: {
            id: string;
            name: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        startAt: Date;
        endAt: Date;
        originalStartAt: Date;
        originalEndAt: Date;
        status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
        changeNote: string | null;
    }>;
    setSessionStatus(id: string, status: string, u: AuthenticatedUser): Promise<{
        id: string;
        scheduleId: string;
        group: {
            id: string;
            name: string;
        };
        teacher: {
            id: string;
            displayName: string;
        };
        classroom: {
            id: string;
            name: string;
            code: string;
        };
        startAt: Date;
        endAt: Date;
        originalStartAt: Date;
        originalEndAt: Date;
        status: import("../../database/entities/groups.entity.js").LessonSessionStatus;
        changeNote: string | null;
    }>;
    private notifyGroup;
}
