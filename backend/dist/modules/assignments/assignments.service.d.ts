import { DataSource, Repository } from 'typeorm';
import { Assignment, AssignmentAttachment, AssignmentSubmission, AssignmentSubmissionAttachment, AssignmentSubmissionRevision, AssignmentSubmissionReview, Course, GroupStudent, Lesson, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { AssignmentStorageProvider } from './assignment-storage.provider.js';
import type { AssignmentCreateDto, AssignmentFileDto, AssignmentListDto, AssignmentSubmissionDto, AssignmentUpdateDto, GradeSubmissionDto, ReturnSubmissionDto, SubmissionListDto } from './assignments.dto.js';
export declare class AssignmentsService {
    private readonly assignments;
    private readonly assignmentAttachments;
    private readonly submissions;
    private readonly revisions;
    private readonly submissionAttachments;
    private readonly reviews;
    private readonly courses;
    private readonly lessons;
    private readonly groups;
    private readonly memberships;
    private readonly userRoles;
    private readonly users;
    private readonly db;
    private readonly notifications;
    private readonly storage;
    constructor(assignments: Repository<Assignment>, assignmentAttachments: Repository<AssignmentAttachment>, submissions: Repository<AssignmentSubmission>, revisions: Repository<AssignmentSubmissionRevision>, submissionAttachments: Repository<AssignmentSubmissionAttachment>, reviews: Repository<AssignmentSubmissionReview>, courses: Repository<Course>, lessons: Repository<Lesson>, groups: Repository<StudyGroup>, memberships: Repository<GroupStudent>, userRoles: Repository<UserRole>, users: Repository<User>, db: DataSource, notifications: NotificationsService, storage: AssignmentStorageProvider);
    private admin;
    private requireTeacher;
    private group;
    private canManage;
    private assignment;
    private studentMembership;
    private view;
    private validateDue;
    private validateRelations;
    private auditAssignment;
    create(dto: AssignmentCreateDto, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private managerListQuery;
    teacherList(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            title: string;
            description: string;
            instructions: string | null;
            course: {
                id: string;
                title: string;
            };
            lesson: {
                id: string;
                title: string;
            } | null;
            group: {
                id: string;
                name: string;
                code: string;
            };
            createdBy: {
                id: string;
                displayName: string;
            };
            maxScore: string;
            dueAt: Date | null;
            status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
            allowLateSubmission: boolean;
            allowResubmission: boolean;
            allowResubmissionAfterGraded: boolean;
            publishedAt: Date | null;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
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
    adminList(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            title: string;
            description: string;
            instructions: string | null;
            course: {
                id: string;
                title: string;
            };
            lesson: {
                id: string;
                title: string;
            } | null;
            group: {
                id: string;
                name: string;
                code: string;
            };
            createdBy: {
                id: string;
                displayName: string;
            };
            maxScore: string;
            dueAt: Date | null;
            status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
            allowLateSubmission: boolean;
            allowResubmission: boolean;
            allowResubmissionAfterGraded: boolean;
            publishedAt: Date | null;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
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
    private paginateAssignments;
    teacherGet(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    studentList(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            title: string;
            description: string;
            instructions: string | null;
            course: {
                id: string;
                title: string;
            };
            lesson: {
                id: string;
                title: string;
            } | null;
            group: {
                id: string;
                name: string;
                code: string;
            };
            createdBy: {
                id: string;
                displayName: string;
            };
            maxScore: string;
            dueAt: Date | null;
            status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
            allowLateSubmission: boolean;
            allowResubmission: boolean;
            allowResubmissionAfterGraded: boolean;
            publishedAt: Date | null;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
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
    studentGet(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: AssignmentUpdateDto, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private setStatus;
    publish(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    archive(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    adminStatus(id: string, status: Assignment['status'], u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private studentAssignmentForSubmission;
    submit(assignmentId: string, dto: AssignmentSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        assignmentId: string;
        student: {
            id: string;
            displayName: string;
        } | undefined;
        status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
        submittedAt: Date;
        isLate: boolean;
        currentVersion: number;
        textAnswer: string | null;
        score: string | null;
        feedback: string | null;
        reviews: {
            id: string;
            action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
            score: string | null;
            feedback: string;
            reviewedAt: Date;
            reviewedBy: {
                id: string;
                displayName: string;
            } | undefined;
        }[];
        versions: {
            version: number;
            textAnswer: string | null;
            submittedAt: Date;
            isLate: boolean;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    resubmit(id: string, dto: AssignmentSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        assignmentId: string;
        student: {
            id: string;
            displayName: string;
        } | undefined;
        status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
        submittedAt: Date;
        isLate: boolean;
        currentVersion: number;
        textAnswer: string | null;
        score: string | null;
        feedback: string | null;
        reviews: {
            id: string;
            action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
            score: string | null;
            feedback: string;
            reviewedAt: Date;
            reviewedBy: {
                id: string;
                displayName: string;
            } | undefined;
        }[];
        versions: {
            version: number;
            textAnswer: string | null;
            submittedAt: Date;
            isLate: boolean;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private submissionView;
    private submissionDetails;
    studentSubmissionList(u: AuthenticatedUser, q: SubmissionListDto): Promise<{
        data: {
            id: string;
            assignmentId: string;
            student: {
                id: string;
                displayName: string;
            } | undefined;
            status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
            submittedAt: Date;
            isLate: boolean;
            currentVersion: number;
            textAnswer: string | null;
            score: string | null;
            feedback: string | null;
            reviews: {
                id: string;
                action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
                score: string | null;
                feedback: string;
                reviewedAt: Date;
                reviewedBy: {
                    id: string;
                    displayName: string;
                } | undefined;
            }[];
            versions: {
                version: number;
                textAnswer: string | null;
                submittedAt: Date;
                isLate: boolean;
                attachments: {
                    id: string;
                    fileName: string;
                    mimeType: string;
                    fileSize: number;
                    createdAt: Date;
                }[];
            }[];
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
    studentSubmission(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        assignmentId: string;
        student: {
            id: string;
            displayName: string;
        } | undefined;
        status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
        submittedAt: Date;
        isLate: boolean;
        currentVersion: number;
        textAnswer: string | null;
        score: string | null;
        feedback: string | null;
        reviews: {
            id: string;
            action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
            score: string | null;
            feedback: string;
            reviewedAt: Date;
            reviewedBy: {
                id: string;
                displayName: string;
            } | undefined;
        }[];
        versions: {
            version: number;
            textAnswer: string | null;
            submittedAt: Date;
            isLate: boolean;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    private managedSubmission;
    teacherSubmission(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        assignmentId: string;
        student: {
            id: string;
            displayName: string;
        } | undefined;
        status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
        submittedAt: Date;
        isLate: boolean;
        currentVersion: number;
        textAnswer: string | null;
        score: string | null;
        feedback: string | null;
        reviews: {
            id: string;
            action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
            score: string | null;
            feedback: string;
            reviewedAt: Date;
            reviewedBy: {
                id: string;
                displayName: string;
            } | undefined;
        }[];
        versions: {
            version: number;
            textAnswer: string | null;
            submittedAt: Date;
            isLate: boolean;
            attachments: {
                id: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                createdAt: Date;
            }[];
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    listSubmissions(assignmentId: string, q: SubmissionListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            assignmentId: string;
            student: {
                id: string;
                displayName: string;
            } | undefined;
            status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
            submittedAt: Date;
            isLate: boolean;
            currentVersion: number;
            textAnswer: string | null;
            score: string | null;
            feedback: string | null;
            reviews: {
                id: string;
                action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
                score: string | null;
                feedback: string;
                reviewedAt: Date;
                reviewedBy: {
                    id: string;
                    displayName: string;
                } | undefined;
            }[];
            versions: {
                version: number;
                textAnswer: string | null;
                submittedAt: Date;
                isLate: boolean;
                attachments: {
                    id: string;
                    fileName: string;
                    mimeType: string;
                    fileSize: number;
                    createdAt: Date;
                }[];
            }[];
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
    grade(id: string, dto: GradeSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        submissionId: string;
        score: string | null;
        feedback: string;
        reviewedAt: Date;
    }>;
    returnForCorrection(id: string, dto: ReturnSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        submissionId: string;
        feedback: string;
        reviewedAt: Date;
    }>;
    private latestScore;
    teacherStatistics(u: AuthenticatedUser, q: AssignmentListDto): Promise<{
        assignments: number;
        byAssignmentStatus: Record<string, number>;
        submissions: Record<string, number>;
    }>;
    adminStatistics(u: AuthenticatedUser, q: AssignmentListDto): Promise<{
        assignments: number;
        byAssignmentStatus: Record<string, number>;
        submissions: Record<string, number>;
    }>;
    adminGet(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string;
        instructions: string | null;
        course: {
            id: string;
            title: string;
        };
        lesson: {
            id: string;
            title: string;
        } | null;
        group: {
            id: string;
            name: string;
            code: string;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        maxScore: string;
        dueAt: Date | null;
        status: import("../../database/entities/assignments.entity.js").AssignmentStatus;
        allowLateSubmission: boolean;
        allowResubmission: boolean;
        allowResubmissionAfterGraded: boolean;
        publishedAt: Date | null;
        attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            fileSize: number;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    adminSubmissions(q: SubmissionListDto, u: AuthenticatedUser): Promise<{
        data: {
            id: string;
            assignmentId: string;
            student: {
                id: string;
                displayName: string;
            } | undefined;
            status: import("../../database/entities/assignments.entity.js").AssignmentSubmissionStatus;
            submittedAt: Date;
            isLate: boolean;
            currentVersion: number;
            textAnswer: string | null;
            score: string | null;
            feedback: string | null;
            reviews: {
                id: string;
                action: import("../../database/entities/assignments.entity.js").SubmissionReviewAction;
                score: string | null;
                feedback: string;
                reviewedAt: Date;
                reviewedBy: {
                    id: string;
                    displayName: string;
                } | undefined;
            }[];
            versions: {
                version: number;
                textAnswer: string | null;
                submittedAt: Date;
                isLate: boolean;
                attachments: {
                    id: string;
                    fileName: string;
                    mimeType: string;
                    fileSize: number;
                    createdAt: Date;
                }[];
            }[];
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
    private verifiedObject;
    assignmentUpload(id: string, dto: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        uploadId: `${string}-${string}-${string}-${string}-${string}`;
        uploadUrl: string;
        expiresAt: Date;
    }>;
    completeAssignmentUpload(id: string, uploadId: string, dto: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        createdAt: Date;
    }>;
    private assertAttachmentWindow;
    submissionUpload(id: string, dto: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        uploadId: `${string}-${string}-${string}-${string}-${string}`;
        uploadUrl: string;
        expiresAt: Date;
    }>;
    completeSubmissionUpload(id: string, uploadId: string, dto: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        createdAt: Date;
    }>;
    assignmentAttachmentUrl(id: string, attachmentId: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
    submissionAttachmentUrl(id: string, attachmentId: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
}
