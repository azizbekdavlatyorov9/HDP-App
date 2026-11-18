import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AddEnrollmentToGroupDto, AddStudentDto, AssignGroupTeacherDto, GroupCreateDto, GroupListDto, GroupStatusDto, GroupUpdateDto, MembershipStatusDto } from './groups.dto.js';
import { GroupsService } from './groups.service.js';
export declare class GroupsController {
    private readonly service;
    constructor(service: GroupsService);
    create(d: GroupCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(q: GroupListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            name: string;
            code: string;
            course: {
                id: string;
                title: string;
            } | undefined;
            leadTeacher: {
                id: string;
                displayName: string;
            } | undefined;
            description: string | null;
            capacity: number;
            status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
            startDate: string;
            endDate: string | null;
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
    me(u: AuthenticatedUser): Promise<{
        membershipId: string;
        joinedAt: Date;
        group: {
            id: string;
            name: string;
            code: string;
            course: {
                id: string;
                title: string;
            } | undefined;
            leadTeacher: {
                id: string;
                displayName: string;
            } | undefined;
            description: string | null;
            capacity: number;
            status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
            startDate: string;
            endDate: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }[]>;
    get(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, d: GroupUpdateDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    status(id: string, d: GroupStatusDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    add(id: string, d: AddStudentDto, u: AuthenticatedUser): Promise<{
        id: string;
        groupId: string;
        studentId: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
    }>;
    students(id: string, u: AuthenticatedUser): Promise<{
        membershipId: string;
        student: {
            id: string;
            displayName: string;
        };
        enrollmentId: string | null;
        joinedAt: Date;
    }[]>;
    history(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        student: {
            id: string;
            displayName: string;
        };
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
        changedById: string | null;
    }[]>;
    membershipStatus(id: string, mid: string, d: MembershipStatusDto, u: AuthenticatedUser): Promise<{
        id: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
    }>;
    remove(id: string, studentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    } | {
        id: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    }>;
}
export declare class AdminGroupsController {
    private readonly service;
    constructor(service: GroupsService);
    create(d: GroupCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, d: GroupUpdateDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    archive(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    teacher(id: string, d: AssignGroupTeacherDto, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addStudent(id: string, d: AddEnrollmentToGroupDto, u: AuthenticatedUser): Promise<{
        id: string;
        groupId: string;
        studentId: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
    }>;
    removeStudent(id: string, enrollmentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    }>;
}
export declare class TeacherGroupsController {
    private readonly service;
    constructor(service: GroupsService);
    me(u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    byTeacher(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            title: string;
        } | undefined;
        leadTeacher: {
            id: string;
            displayName: string;
        } | undefined;
        description: string | null;
        capacity: number;
        status: import("../../database/entities/groups.entity.js").StudyGroupStatus;
        startDate: string;
        endDate: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
