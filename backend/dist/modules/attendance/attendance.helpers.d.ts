import type { AttendanceStatus } from '../../database/entities/attendance.entity.js';
import type { AttendanceFieldsDto } from './attendance.dto.js';
export declare function validateAttendanceEntry(entry: AttendanceFieldsDto): void;
export declare function calculateAttendanceStatistics(counts: {
    present: number;
    absent: number;
    late: number;
    excused: number;
}): {
    totalScheduledSessions: number;
    presentSessions: number;
    absentSessions: number;
    lateSessions: number;
    excusedSessions: number;
    attendancePercentage: number;
    absencePercentage: number;
    latePercentage: number;
};
export declare const attendanceStatuses: readonly AttendanceStatus[];
