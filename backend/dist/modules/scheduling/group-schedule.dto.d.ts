export declare class GroupScheduleEntryDto {
    weekday: number;
    startTime: string;
    endTime: string;
    classroomId: string;
    effectiveStartDate?: string;
    effectiveEndDate?: string | null;
    timezone?: string;
}
export declare class ReplaceGroupScheduleDto {
    schedules: GroupScheduleEntryDto[];
}
