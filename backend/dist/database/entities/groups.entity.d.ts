import type { Relation } from 'typeorm';
import { Course, Enrollment } from './education.entity.js';
import { User } from './core.entity.js';
export type StudyGroupStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type GroupMembershipStatus = 'ACTIVE' | 'COMPLETED' | 'LEFT' | 'REMOVED';
export type LessonSessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export declare class StudyGroup {
    id: string;
    name: string;
    code: string;
    course: Relation<Course>;
    leadTeacher: Relation<User>;
    description: string | null;
    capacity: number;
    status: StudyGroupStatus;
    startDate: string;
    endDate: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class GroupStudent {
    id: string;
    group: Relation<StudyGroup>;
    student: Relation<User>;
    enrollment: Relation<Enrollment | null>;
    status: GroupMembershipStatus;
    changedBy: Relation<User | null>;
    joinedAt: Date;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Classroom {
    id: string;
    name: string;
    code: string;
    location: string | null;
    capacity: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class GroupSchedule {
    id: string;
    group: Relation<StudyGroup>;
    weekday: number;
    startTime: string;
    endTime: string;
    effectiveStartDate: string;
    effectiveEndDate: string | null;
    classroom: Relation<Classroom>;
    teacher: Relation<User>;
    timezone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LessonSession {
    id: string;
    schedule: Relation<GroupSchedule>;
    group: Relation<StudyGroup>;
    classroom: Relation<Classroom>;
    teacher: Relation<User>;
    startAt: Date;
    endAt: Date;
    originalStartAt: Date;
    originalEndAt: Date;
    status: LessonSessionStatus;
    changeNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}
