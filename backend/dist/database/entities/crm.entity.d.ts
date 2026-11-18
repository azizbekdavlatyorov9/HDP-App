import type { Relation } from 'typeorm';
import { Course } from './education.entity.js';
import { LessonSession, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';
export type CrmLeadSource = 'WEBSITE' | 'PHONE' | 'TELEGRAM' | 'INSTAGRAM' | 'REFERRAL' | 'WALK_IN' | 'OTHER';
export type CrmLeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'TRIAL_SCHEDULED' | 'TRIAL_COMPLETED' | 'NEGOTIATION' | 'WON' | 'LOST';
export type CrmActivityType = 'CALL' | 'MESSAGE' | 'EMAIL' | 'MEETING' | 'NOTE' | 'STATUS_CHANGE' | 'ASSIGNMENT_CHANGE' | 'OTHER';
export type TrialLessonStatus = 'SCHEDULED' | 'CONFIRMED' | 'ATTENDED' | 'MISSED' | 'CANCELLED';
export declare class CrmLead {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    source: CrmLeadSource;
    status: CrmLeadStatus;
    interestedCourse: Relation<Course | null>;
    assignedTo: Relation<User | null>;
    createdBy: Relation<User>;
    convertedStudent: Relation<User | null>;
    lostReason: string | null;
    notes: string | null;
    nextFollowUpAt: Date | null;
    lastContactedAt: Date | null;
    convertedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CrmLeadActivity {
    id: string;
    lead: Relation<CrmLead>;
    actor: Relation<User | null>;
    type: CrmActivityType;
    description: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
export declare class CrmLeadStatusHistory {
    id: string;
    lead: Relation<CrmLead>;
    previousStatus: CrmLeadStatus | null;
    newStatus: CrmLeadStatus;
    actor: Relation<User | null>;
    changeReason: string | null;
    createdAt: Date;
}
export declare class CrmTrialLesson {
    id: string;
    lead: Relation<CrmLead>;
    course: Relation<Course>;
    group: Relation<StudyGroup | null>;
    session: Relation<LessonSession | null>;
    scheduledAt: Date;
    status: TrialLessonStatus;
    result: string | null;
    feedback: string | null;
    createdBy: Relation<User>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CrmTrialLessonHistory {
    id: string;
    trialLesson: Relation<CrmTrialLesson>;
    previousStatus: TrialLessonStatus | null;
    newStatus: TrialLessonStatus | null;
    previousScheduledAt: Date | null;
    newScheduledAt: Date | null;
    actor: Relation<User | null>;
    changeReason: string | null;
    createdAt: Date;
}
