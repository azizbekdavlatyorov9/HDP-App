import type { Relation } from 'typeorm';
import { Course, Lesson } from './education.entity.js';
import { GroupStudent, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AssignmentSubmissionStatus = 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
export type SubmissionReviewAction = 'GRADED' | 'RETURNED';
export declare class Assignment {
    id: string;
    title: string;
    description: string;
    instructions: string | null;
    course: Relation<Course>;
    lesson: Relation<Lesson | null>;
    group: Relation<StudyGroup>;
    createdBy: Relation<User>;
    maxScore: string;
    dueAt: Date | null;
    status: AssignmentStatus;
    allowLateSubmission: boolean;
    allowResubmission: boolean;
    allowResubmissionAfterGraded: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AssignmentAttachment {
    id: string;
    assignment: Relation<Assignment>;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
    createdAt: Date;
}
export declare class AssignmentSubmission {
    id: string;
    assignment: Relation<Assignment>;
    student: Relation<User>;
    membership: Relation<GroupStudent>;
    submittedAt: Date;
    textAnswer: string | null;
    status: AssignmentSubmissionStatus;
    isLate: boolean;
    currentVersion: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AssignmentSubmissionRevision {
    id: string;
    submission: Relation<AssignmentSubmission>;
    versionNumber: number;
    idempotencyKey: string;
    textAnswer: string | null;
    submittedAt: Date;
    isLate: boolean;
    createdAt: Date;
}
export declare class AssignmentSubmissionAttachment {
    id: string;
    submission: Relation<AssignmentSubmission>;
    revision: Relation<AssignmentSubmissionRevision>;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
    createdAt: Date;
}
export declare class AssignmentSubmissionReview {
    id: string;
    submission: Relation<AssignmentSubmission>;
    reviewedBy: Relation<User>;
    action: SubmissionReviewAction;
    score: string | null;
    feedback: string;
    reviewedAt: Date;
    createdAt: Date;
}
