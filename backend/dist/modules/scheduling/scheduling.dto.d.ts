export declare class ScheduleCreateDto {
    groupId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    effectiveStartDate: string;
    effectiveEndDate?: string;
    classroomId: string;
    teacherId?: string;
    timezone?: string;
}
export declare class ScheduleUpdateDto {
    weekday?: number;
    startTime?: string;
    endTime?: string;
    effectiveStartDate?: string;
    effectiveEndDate?: string | null;
    classroomId?: string;
    teacherId?: string;
    timezone?: string;
}
export declare class ScheduleStatusDto {
    isActive: boolean;
}
export declare class GenerateSessionsDto {
    from: string;
    to: string;
}
export declare class RescheduleSessionDto {
    startAt: string;
    endAt: string;
    note?: string;
}
export declare class SessionStatusDto {
    status: string;
}
export declare class CancelSessionDto {
    note?: string;
}
