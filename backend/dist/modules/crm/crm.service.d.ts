import { DataSource, Repository } from 'typeorm';
import { CrmLead, User } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { IdentityService } from '../auth/identity.service.js';
import { GroupsService } from '../groups/groups.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ChangeLeadStatusDto, ConvertLeadDto, CreateActivityDto, CreateLeadDto, LeadListDto, TrialCreateDto, TrialStatusDto, TrialUpdateDto, UpdateLeadDto } from './crm.dto.js';
export declare class CrmService {
    private readonly leads;
    private readonly users;
    private readonly db;
    private readonly identities;
    private readonly groups;
    private readonly notifications;
    constructor(leads: Repository<CrmLead>, users: Repository<User>, db: DataSource, identities: IdentityService, groups: GroupsService, notifications: NotificationsService);
    private admin;
    private staff;
    private lead;
    private access;
    private normalize;
    private view;
    private assignee;
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
    changeStatus(id: string, dto: ChangeLeadStatusDto, u: AuthenticatedUser): Promise<{
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
    addActivity(id: string, dto: CreateActivityDto, u: AuthenticatedUser): Promise<{
        id: string;
        type: import("../../database/entities/crm.entity.js").CrmActivityType;
        description: string;
        actorId: string;
        createdAt: Date;
    }>;
    activities(id: string, page: number | undefined, limit: number | undefined, u: AuthenticatedUser): Promise<{
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
    followUps(u: AuthenticatedUser, overdue?: boolean): Promise<{
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
    createTrial(leadId: string, dto: TrialCreateDto, u: AuthenticatedUser): Promise<{
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
    private trialView;
    trials(leadId: string, u: AuthenticatedUser): Promise<{
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
    setTrialStatus(id: string, dto: TrialStatusDto, u: AuthenticatedUser): Promise<{
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
    convert(leadId: string, dto: ConvertLeadDto, u: AuthenticatedUser): Promise<{
        studentId: string;
        alreadyConverted: boolean;
        unlinked?: undefined;
    } | {
        studentId: string;
        alreadyConverted: boolean;
        unlinked: boolean;
    }>;
    operatorWorkload(u: AuthenticatedUser): Promise<any[]>;
}
