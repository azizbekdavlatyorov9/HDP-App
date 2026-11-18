import type { Assignment, AssignmentSubmission } from '../../database/entities/assignments.entity.js';
export declare function classifySubmission(dueAt: Date | null, allowLate: boolean, submittedAt: Date): {
    isLate: boolean;
    status: "LATE" | "SUBMITTED";
};
export declare function assertResubmissionAllowed(assignment: Assignment, submission: AssignmentSubmission, now: Date): void;
export declare function assignmentCanBePublished(input: {
    courseStatus: string;
    groupStatus: string;
    lessonStatus?: string | null;
    dueAt?: Date | null;
    allowLateSubmission?: boolean;
    now?: Date;
}): void;
export declare function validateGradeScore(score: number, maxScore: string | number): void;
