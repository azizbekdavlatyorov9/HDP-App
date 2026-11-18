import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AssignmentCreateDto, AssignmentFileDto, AssignmentListDto, AssignmentStatusDto, AssignmentSubmissionDto, AssignmentUpdateDto, CompleteUploadDto, GradeSubmissionDto, ReturnSubmissionDto, SubmissionListDto } from './assignments.dto.js';
import { AssignmentsService } from './assignments.service.js';
export declare class TeacherAssignmentsController {
    private readonly service;
    constructor(service: AssignmentsService);
    create(d: AssignmentCreateDto, u: AuthenticatedUser): Promise<{
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
    statistics(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
        assignments: number;
        byAssignmentStatus: Record<string, number>;
        submissions: Record<string, number>;
    }>;
    list(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
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
    get(id: string, u: AuthenticatedUser): Promise<{
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
    update(id: string, d: AssignmentUpdateDto, u: AuthenticatedUser): Promise<{
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
    submissions(id: string, q: SubmissionListDto, u: AuthenticatedUser): Promise<{
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
    upload(id: string, d: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        uploadId: `${string}-${string}-${string}-${string}-${string}`;
        uploadUrl: string;
        expiresAt: Date;
    }>;
    complete(id: string, d: CompleteUploadDto, u: AuthenticatedUser): Promise<{
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        createdAt: Date;
    }>;
}
export declare class TeacherSubmissionsController {
    private readonly service;
    constructor(service: AssignmentsService);
    get(id: string, u: AuthenticatedUser): Promise<{
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
    grade(id: string, d: GradeSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        submissionId: string;
        score: string | null;
        feedback: string;
        reviewedAt: Date;
    }>;
    returnForCorrection(id: string, d: ReturnSubmissionDto, u: AuthenticatedUser): Promise<{
        id: string;
        submissionId: string;
        feedback: string;
        reviewedAt: Date;
    }>;
    download(id: string, aid: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
}
export declare class TeacherAssignmentAttachmentsController {
    private readonly service;
    constructor(service: AssignmentsService);
    download(id: string, assignmentId: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
}
export declare class StudentAssignmentsController {
    private readonly service;
    constructor(service: AssignmentsService);
    list(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
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
    get(id: string, u: AuthenticatedUser): Promise<{
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
    assignmentAttachment(id: string, aid: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
    submit(id: string, d: AssignmentSubmissionDto, u: AuthenticatedUser): Promise<{
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
    submissions(q: SubmissionListDto, u: AuthenticatedUser): Promise<{
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
    submission(id: string, u: AuthenticatedUser): Promise<{
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
    resubmit(id: string, d: AssignmentSubmissionDto, u: AuthenticatedUser): Promise<{
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
    upload(id: string, d: AssignmentFileDto, u: AuthenticatedUser): Promise<{
        uploadId: `${string}-${string}-${string}-${string}-${string}`;
        uploadUrl: string;
        expiresAt: Date;
    }>;
    complete(id: string, d: CompleteUploadDto, u: AuthenticatedUser): Promise<{
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        createdAt: Date;
    }>;
    download(id: string, aid: string, u: AuthenticatedUser): Promise<import("./assignment-storage.provider.js").PrivateDownloadGrant>;
}
export declare class AdminAssignmentsController {
    private readonly service;
    constructor(service: AssignmentsService);
    statistics(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
        assignments: number;
        byAssignmentStatus: Record<string, number>;
        submissions: Record<string, number>;
    }>;
    list(q: AssignmentListDto, u: AuthenticatedUser): Promise<{
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
    get(id: string, u: AuthenticatedUser): Promise<{
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
    status(id: string, d: AssignmentStatusDto, u: AuthenticatedUser): Promise<{
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
}
export declare class AdminSubmissionsController {
    private readonly service;
    constructor(service: AssignmentsService);
    list(q: SubmissionListDto, u: AuthenticatedUser): Promise<{
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
}
