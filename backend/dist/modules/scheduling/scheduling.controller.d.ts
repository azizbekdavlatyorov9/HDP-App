import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { GroupListDto } from '../groups/groups.dto.js';
import { ReplaceGroupScheduleDto } from './group-schedule.dto.js';
import { CancelSessionDto, GenerateSessionsDto, RescheduleSessionDto, ScheduleCreateDto, ScheduleStatusDto, ScheduleUpdateDto, SessionStatusDto } from './scheduling.dto.js';
import { SchedulingService } from './scheduling.service.js';
export declare class SchedulingController {
    private readonly service;
    constructor(service: SchedulingService);
    create(d: ScheduleCreateDto, u: AuthenticatedUser): Promise<{
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
    get(id: string, u: AuthenticatedUser): Promise<{
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
    update(id: string, d: ScheduleUpdateDto, u: AuthenticatedUser): Promise<{
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
    status(id: string, d: ScheduleStatusDto, u: AuthenticatedUser): Promise<{
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
    generate(id: string, d: GenerateSessionsDto, u: AuthenticatedUser): Promise<{
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
}
export declare class SessionsController {
    private readonly service;
    constructor(service: SchedulingService);
    list(u: AuthenticatedUser, q: GroupListDto, groupId?: string): Promise<{
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
    get(id: string, u: AuthenticatedUser): Promise<{
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
    reschedule(id: string, d: RescheduleSessionDto, u: AuthenticatedUser): Promise<{
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
    cancel(id: string, d: CancelSessionDto, u: AuthenticatedUser): Promise<{
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
    status(id: string, d: SessionStatusDto, u: AuthenticatedUser): Promise<{
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
}
export declare class StudentSessionsController {
    private readonly service;
    constructor(service: SchedulingService);
    list(u: AuthenticatedUser, q: GroupListDto): Promise<{
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
}
export declare class TeacherSessionsController {
    private readonly service;
    constructor(service: SchedulingService);
    list(u: AuthenticatedUser, q: GroupListDto): Promise<{
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
}
export declare class GroupSchedulesController {
    private readonly service;
    constructor(service: SchedulingService);
    get(groupId: string, u: AuthenticatedUser): Promise<{
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
}
export declare class AdminGroupSchedulesController {
    private readonly service;
    constructor(service: SchedulingService);
    replace(groupId: string, dto: ReplaceGroupScheduleDto, u: AuthenticatedUser): Promise<{
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
}
