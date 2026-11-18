import { DataSource, Repository } from 'typeorm';
import { Enrollment, GroupStudent, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { GroupCreateDto, GroupListDto, GroupUpdateDto } from './groups.dto.js';
export declare class GroupsService {
    private readonly groups;
    private readonly members;
    private readonly users;
    private readonly userRoles;
    private readonly enrollments;
    private readonly db;
    private readonly notifications;
    constructor(groups: Repository<StudyGroup>, members: Repository<GroupStudent>, users: Repository<User>, userRoles: Repository<UserRole>, enrollments: Repository<Enrollment>, db: DataSource, notifications: NotificationsService);
    private admin;
    private teacher;
    private student;
    private group;
    private canManage;
    private canView;
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
    addEnrollment(groupId: string, enrollmentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        groupId: string;
        studentId: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
    }>;
    removeEnrollment(groupId: string, enrollmentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    }>;
    addStudentWithinTransaction(manager: import('typeorm').EntityManager, groupId: string, studentId: string, actorId: string): Promise<GroupStudent>;
    private addEnrollmentWithinTransaction;
    create(dto: GroupCreateDto, u: AuthenticatedUser): Promise<{
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
    list(u: AuthenticatedUser, q: GroupListDto): Promise<{
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
    update(id: string, dto: GroupUpdateDto, u: AuthenticatedUser): Promise<{
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
    setStatus(id: string, status: string, u: AuthenticatedUser): Promise<{
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
    addStudent(id: string, studentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        groupId: string;
        studentId: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
    }>;
    removeStudent(id: string, studentId: string, u: AuthenticatedUser): Promise<{
        id: string;
        enrollmentId: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    } | {
        id: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        endedAt: Date | null;
    }>;
    setMembershipStatus(groupId: string, membershipId: string, status: string, u: AuthenticatedUser): Promise<{
        id: string;
        status: import("../../database/entities/groups.entity.js").GroupMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
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
    studentGroups(user: AuthenticatedUser): Promise<{
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
    teacherGroups(user: AuthenticatedUser, teacherId: string): Promise<{
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
    private view;
}
