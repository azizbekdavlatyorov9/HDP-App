import type { Relation } from 'typeorm';
import { GroupStudent, LessonSession } from './groups.entity.js';
import { User } from './core.entity.js';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceLifecycleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINALIZED' | 'REOPENED';
export type AttendanceHistoryAction = 'CREATED' | 'UPDATED' | 'FINALIZED' | 'REOPENED';
export declare class Attendance {
    id: string;
    session: Relation<LessonSession>;
    student: Relation<User>;
    membership: Relation<GroupStudent>;
    status: AttendanceStatus;
    latenessMinutes: number | null;
    reason: string | null;
    teacherNote: string | null;
    markedBy: Relation<User>;
    markedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AttendanceSession {
    id: string;
    session: Relation<LessonSession>;
    status: AttendanceLifecycleStatus;
    finalizedBy: Relation<User | null>;
    finalizedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AttendanceHistory {
    id: string;
    attendance: Relation<Attendance | null>;
    session: Relation<LessonSession>;
    action: AttendanceHistoryAction;
    previousStatus: AttendanceStatus | null;
    newStatus: AttendanceStatus | null;
    previousLatenessMinutes: number | null;
    newLatenessMinutes: number | null;
    changeReason: string | null;
    actor: Relation<User | null>;
    createdAt: Date;
}
