export declare class AssignmentCreateDto {
    title: string;
    description: string;
    instructions?: string;
    courseId: string;
    lessonId?: string;
    groupId: string;
    maxScore: number;
    dueAt?: string | null;
    allowLateSubmission?: boolean;
    allowResubmission?: boolean;
    allowResubmissionAfterGraded?: boolean;
}
declare const AssignmentUpdateDto_base: import("@nestjs/common").Type<Partial<AssignmentCreateDto>>;
export declare class AssignmentUpdateDto extends AssignmentUpdateDto_base {
}
export declare class AssignmentStatusDto {
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
export declare class AssignmentListDto {
    page: number;
    limit: number;
    groupId?: string;
    courseId?: string;
    status?: string;
    submissionStatus?: string;
    deadline?: string;
}
export declare class SubmissionListDto {
    page: number;
    limit: number;
    status?: string;
}
export declare class AssignmentSubmissionDto {
    idempotencyKey: string;
    textAnswer?: string | null;
}
export declare class GradeSubmissionDto {
    score: number;
    feedback: string;
}
export declare class ReturnSubmissionDto {
    feedback: string;
}
export declare class AssignmentFileDto {
    fileName: string;
    mimeType: string;
    fileSize: number;
}
export declare class CompleteUploadDto extends AssignmentFileDto {
    uploadId: string;
}
export {};
