import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { ChangeLeadStatusDto, ConvertLeadDto, CreateActivityDto, CreateLeadDto, LeadListDto, TrialCreateDto, TrialStatusDto, TrialUpdateDto, UpdateLeadDto } from './crm.dto.js';
import { CrmService } from './crm.service.js';
export declare class CrmAdminController {
    private readonly crm;
    constructor(crm: CrmService);
    create(dto: CreateLeadDto, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(q: LeadListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            fullName: string;
            phoneNumber: string;
            email: string | null;
            source: import("../../database/entities/crm.entity.js").CrmLeadSource;
            status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
            interestedCourse: {
                id: string;
                title: string;
            } | null;
            assignedTo: {
                id: string;
                displayName: string;
            } | null;
            createdById: string;
            lostReason: string | null;
            notes: string | null;
            nextFollowUpAt: Date | null;
            lastContactedAt: Date | null;
            convertedStudentId: string | null;
            convertedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    get(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateLeadDto, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    status(id: string, dto: ChangeLeadStatusDto, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activities(id: string, page: string | undefined, limit: string | undefined, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            type: import("../../database/entities/crm.entity.js").CrmActivityType;
            description: string;
            actor: {
                id: string;
                displayName: string;
            } | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    activity(id: string, dto: CreateActivityDto, u: AuthenticatedUser): Promise<{
        id: string;
        type: import("../../database/entities/crm.entity.js").CrmActivityType;
        description: string;
        actorId: string;
        createdAt: Date;
    }>;
    createTrial(id: string, dto: TrialCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }>;
    trials(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }[]>;
    updateTrial(id: string, dto: TrialUpdateDto, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }>;
    trialStatus(id: string, dto: TrialStatusDto, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }>;
    convert(id: string, dto: ConvertLeadDto, u: AuthenticatedUser): Promise<{
        studentId: string;
        alreadyConverted: boolean;
        unlinked?: undefined;
    } | {
        studentId: string;
        alreadyConverted: boolean;
        unlinked: boolean;
    }>;
    overdue(u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    upcoming(u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    statistics(u: AuthenticatedUser): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        conversionRatePercent: number;
        averageConversionHours: number | null;
        attendedTrials: number;
    }>;
    workload(u: AuthenticatedUser): Promise<any[]>;
}
export declare class CrmOperatorController {
    private readonly crm;
    constructor(crm: CrmService);
    list(q: LeadListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            fullName: string;
            phoneNumber: string;
            email: string | null;
            source: import("../../database/entities/crm.entity.js").CrmLeadSource;
            status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
            interestedCourse: {
                id: string;
                title: string;
            } | null;
            assignedTo: {
                id: string;
                displayName: string;
            } | null;
            createdById: string;
            lostReason: string | null;
            notes: string | null;
            nextFollowUpAt: Date | null;
            lastContactedAt: Date | null;
            convertedStudentId: string | null;
            convertedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    overdue(u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    upcoming(u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    get(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateLeadDto, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    status(id: string, dto: ChangeLeadStatusDto, u: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        source: import("../../database/entities/crm.entity.js").CrmLeadSource;
        status: import("../../database/entities/crm.entity.js").CrmLeadStatus;
        interestedCourse: {
            id: string;
            title: string;
        } | null;
        assignedTo: {
            id: string;
            displayName: string;
        } | null;
        createdById: string;
        lostReason: string | null;
        notes: string | null;
        nextFollowUpAt: Date | null;
        lastContactedAt: Date | null;
        convertedStudentId: string | null;
        convertedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activities(id: string, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            type: import("../../database/entities/crm.entity.js").CrmActivityType;
            description: string;
            actor: {
                id: string;
                displayName: string;
            } | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    activity(id: string, dto: CreateActivityDto, u: AuthenticatedUser): Promise<{
        id: string;
        type: import("../../database/entities/crm.entity.js").CrmActivityType;
        description: string;
        actorId: string;
        createdAt: Date;
    }>;
    createTrial(id: string, dto: TrialCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }>;
    trials(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        leadId: string;
        courseId: string;
        groupId: string | null;
        sessionId: string | null;
        scheduledAt: Date;
        status: import("../../database/entities/crm.entity.js").TrialLessonStatus;
        result: string | null;
        feedback: string | null;
        createdAt: Date;
    }[]>;
    convert(id: string, dto: ConvertLeadDto, u: AuthenticatedUser): Promise<{
        studentId: string;
        alreadyConverted: boolean;
        unlinked?: undefined;
    } | {
        studentId: string;
        alreadyConverted: boolean;
        unlinked: boolean;
    }>;
    statistics(u: AuthenticatedUser): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        conversionRatePercent: number;
        averageConversionHours: number | null;
        attendedTrials: number;
    }>;
}
