import type { CrmActivityType, CrmLeadSource, CrmLeadStatus, TrialLessonStatus } from '../../database/entities/crm.entity.js';
export declare class CreateLeadDto {
    fullName: string;
    phoneNumber: string;
    email?: string;
    source: CrmLeadSource;
    interestedCourseId?: string;
    assignedToUserId?: string;
    notes?: string;
    nextFollowUpAt?: string;
}
export declare class UpdateLeadDto {
    fullName?: string;
    phoneNumber?: string;
    email?: string | null;
    interestedCourseId?: string | null;
    assignedToUserId?: string | null;
    notes?: string | null;
    nextFollowUpAt?: string | null;
}
export declare class ChangeLeadStatusDto {
    status: CrmLeadStatus;
    reason?: string;
}
export declare class CreateActivityDto {
    type: CrmActivityType;
    description: string;
}
export declare class LeadListDto {
    page: number;
    limit: number;
    status?: CrmLeadStatus;
    source?: CrmLeadSource;
    assignedToUserId?: string;
    courseId?: string;
    search?: string;
    followUpBefore?: string;
}
export declare class TrialCreateDto {
    courseId: string;
    groupId?: string;
    sessionId?: string;
    scheduledAt: string;
}
export declare class TrialUpdateDto {
    scheduledAt?: string;
    result?: string | null;
    feedback?: string | null;
}
export declare class TrialStatusDto {
    status: TrialLessonStatus;
    reason?: string;
}
export declare class ConvertLeadDto {
    groupId?: string;
    courseId?: string;
}
