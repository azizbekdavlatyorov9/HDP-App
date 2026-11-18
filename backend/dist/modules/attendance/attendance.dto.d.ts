export declare const ATTENDANCE_STATUSES: readonly ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
export declare class AttendanceFieldsDto {
    status: typeof ATTENDANCE_STATUSES[number];
    latenessMinutes?: number;
    reason?: string;
    teacherNote?: string;
}
export declare class AttendanceEntryDto extends AttendanceFieldsDto {
    studentId: string;
}
export declare class AttendanceBulkDto {
    records: AttendanceEntryDto[];
    changeReason?: string;
}
export declare class AttendanceUpdateDto extends AttendanceFieldsDto {
    changeReason?: string;
}
export declare class ReopenAttendanceDto {
    reason: string;
}
export declare class AttendanceListDto {
    page: number;
    limit: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
    courseId?: string;
    status?: string;
    from?: string;
    to?: string;
    sessionId?: string;
}
