var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Course, Lesson } from './education.entity.js';
import { GroupStudent, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';
let Assignment = class Assignment {
    id;
    title;
    description;
    instructions;
    course;
    lesson;
    group;
    createdBy;
    maxScore;
    dueAt;
    status;
    allowLateSubmission;
    allowResubmission;
    allowResubmissionAfterGraded;
    publishedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Assignment.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], Assignment.prototype, "title", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Assignment.prototype, "description", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Assignment.prototype, "instructions", void 0);
__decorate([
    ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Assignment.prototype, "course", void 0);
__decorate([
    ManyToOne(() => Lesson, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'lesson_id' }),
    __metadata("design:type", Object)
], Assignment.prototype, "lesson", void 0);
__decorate([
    ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'group_id' }),
    __metadata("design:type", Object)
], Assignment.prototype, "group", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'created_by_teacher_id' }),
    __metadata("design:type", Object)
], Assignment.prototype, "createdBy", void 0);
__decorate([
    Column({ name: 'max_score', type: 'numeric', precision: 10, scale: 2 }),
    __metadata("design:type", String)
], Assignment.prototype, "maxScore", void 0);
__decorate([
    Column({ name: 'due_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Assignment.prototype, "dueAt", void 0);
__decorate([
    Column({ type: 'varchar', length: 12, default: 'DRAFT' }),
    __metadata("design:type", String)
], Assignment.prototype, "status", void 0);
__decorate([
    Column({ name: 'allow_late_submission', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Assignment.prototype, "allowLateSubmission", void 0);
__decorate([
    Column({ name: 'allow_resubmission', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Assignment.prototype, "allowResubmission", void 0);
__decorate([
    Column({ name: 'allow_resubmission_after_graded', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Assignment.prototype, "allowResubmissionAfterGraded", void 0);
__decorate([
    Column({ name: 'published_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Assignment.prototype, "publishedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Assignment.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Assignment.prototype, "updatedAt", void 0);
Assignment = __decorate([
    Entity('assignments'),
    Check('CHK_assignments_status', `"status" IN ('DRAFT','PUBLISHED','ARCHIVED')`),
    Check('CHK_assignments_max_score', '"max_score" > 0'),
    Index('IDX_assignments_group_status_due', ['group', 'status', 'dueAt']),
    Index('IDX_assignments_course_status', ['course', 'status']),
    Index('IDX_assignments_creator_created', ['createdBy', 'createdAt'])
], Assignment);
export { Assignment };
let AssignmentAttachment = class AssignmentAttachment {
    id;
    assignment;
    fileName;
    mimeType;
    fileSize;
    storageKey;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AssignmentAttachment.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Assignment, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'assignment_id' }),
    __metadata("design:type", Object)
], AssignmentAttachment.prototype, "assignment", void 0);
__decorate([
    Column({ name: 'file_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AssignmentAttachment.prototype, "fileName", void 0);
__decorate([
    Column({ name: 'mime_type', type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], AssignmentAttachment.prototype, "mimeType", void 0);
__decorate([
    Column({ name: 'file_size', type: 'integer' }),
    __metadata("design:type", Number)
], AssignmentAttachment.prototype, "fileSize", void 0);
__decorate([
    Column({ name: 'storage_key', type: 'text', select: false }),
    __metadata("design:type", String)
], AssignmentAttachment.prototype, "storageKey", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentAttachment.prototype, "createdAt", void 0);
AssignmentAttachment = __decorate([
    Entity('assignment_attachments'),
    Check('CHK_assignment_attachments_file_size', '"file_size" > 0 AND "file_size" <= 52428800'),
    Index('IDX_assignment_attachments_assignment_created', ['assignment', 'createdAt']),
    Index('UQ_assignment_attachments_storage_key', ['storageKey'], { unique: true })
], AssignmentAttachment);
export { AssignmentAttachment };
let AssignmentSubmission = class AssignmentSubmission {
    id;
    assignment;
    student;
    membership;
    submittedAt;
    textAnswer;
    status;
    isLate;
    currentVersion;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AssignmentSubmission.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Assignment, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'assignment_id' }),
    __metadata("design:type", Object)
], AssignmentSubmission.prototype, "assignment", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'student_id' }),
    __metadata("design:type", Object)
], AssignmentSubmission.prototype, "student", void 0);
__decorate([
    ManyToOne(() => GroupStudent, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'membership_id' }),
    __metadata("design:type", Object)
], AssignmentSubmission.prototype, "membership", void 0);
__decorate([
    Column({ name: 'submitted_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmission.prototype, "submittedAt", void 0);
__decorate([
    Column({ name: 'text_answer', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AssignmentSubmission.prototype, "textAnswer", void 0);
__decorate([
    Column({ type: 'varchar', length: 12 }),
    __metadata("design:type", String)
], AssignmentSubmission.prototype, "status", void 0);
__decorate([
    Column({ name: 'is_late', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AssignmentSubmission.prototype, "isLate", void 0);
__decorate([
    Column({ name: 'current_version', type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], AssignmentSubmission.prototype, "currentVersion", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmission.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmission.prototype, "updatedAt", void 0);
AssignmentSubmission = __decorate([
    Entity('assignment_submissions'),
    Check('CHK_assignment_submissions_status', `"status" IN ('SUBMITTED','LATE','GRADED','RETURNED')`),
    Check('CHK_assignment_submissions_version', '"current_version" > 0'),
    Check('CHK_assignment_submissions_late_status', `"status" <> 'LATE' OR "is_late"=true`),
    Unique('UQ_assignment_submissions_assignment_student', ['assignment', 'student']),
    Index('IDX_assignment_submissions_student_submitted', ['student', 'submittedAt']),
    Index('IDX_assignment_submissions_assignment_status', ['assignment', 'status']),
    Index('IDX_assignment_submissions_membership', ['membership'])
], AssignmentSubmission);
export { AssignmentSubmission };
let AssignmentSubmissionRevision = class AssignmentSubmissionRevision {
    id;
    submission;
    versionNumber;
    idempotencyKey;
    textAnswer;
    submittedAt;
    isLate;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AssignmentSubmissionRevision.prototype, "id", void 0);
__decorate([
    ManyToOne(() => AssignmentSubmission, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'submission_id' }),
    __metadata("design:type", Object)
], AssignmentSubmissionRevision.prototype, "submission", void 0);
__decorate([
    Column({ name: 'version_number', type: 'integer' }),
    __metadata("design:type", Number)
], AssignmentSubmissionRevision.prototype, "versionNumber", void 0);
__decorate([
    Column({ name: 'idempotency_key', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AssignmentSubmissionRevision.prototype, "idempotencyKey", void 0);
__decorate([
    Column({ name: 'text_answer', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AssignmentSubmissionRevision.prototype, "textAnswer", void 0);
__decorate([
    Column({ name: 'submitted_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmissionRevision.prototype, "submittedAt", void 0);
__decorate([
    Column({ name: 'is_late', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AssignmentSubmissionRevision.prototype, "isLate", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmissionRevision.prototype, "createdAt", void 0);
AssignmentSubmissionRevision = __decorate([
    Entity('assignment_submission_revisions'),
    Check('CHK_assignment_submission_revisions_version', '"version_number" > 0'),
    Unique('UQ_assignment_submission_revisions_number', ['submission', 'versionNumber']),
    Unique('UQ_assignment_submission_revisions_idempotency', ['submission', 'idempotencyKey']),
    Index('IDX_assignment_submission_revisions_submission_created', ['submission', 'createdAt'])
], AssignmentSubmissionRevision);
export { AssignmentSubmissionRevision };
let AssignmentSubmissionAttachment = class AssignmentSubmissionAttachment {
    id;
    submission;
    revision;
    fileName;
    mimeType;
    fileSize;
    storageKey;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AssignmentSubmissionAttachment.prototype, "id", void 0);
__decorate([
    ManyToOne(() => AssignmentSubmission, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'submission_id' }),
    __metadata("design:type", Object)
], AssignmentSubmissionAttachment.prototype, "submission", void 0);
__decorate([
    ManyToOne(() => AssignmentSubmissionRevision, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'revision_id' }),
    __metadata("design:type", Object)
], AssignmentSubmissionAttachment.prototype, "revision", void 0);
__decorate([
    Column({ name: 'file_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AssignmentSubmissionAttachment.prototype, "fileName", void 0);
__decorate([
    Column({ name: 'mime_type', type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], AssignmentSubmissionAttachment.prototype, "mimeType", void 0);
__decorate([
    Column({ name: 'file_size', type: 'integer' }),
    __metadata("design:type", Number)
], AssignmentSubmissionAttachment.prototype, "fileSize", void 0);
__decorate([
    Column({ name: 'storage_key', type: 'text', select: false }),
    __metadata("design:type", String)
], AssignmentSubmissionAttachment.prototype, "storageKey", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmissionAttachment.prototype, "createdAt", void 0);
AssignmentSubmissionAttachment = __decorate([
    Entity('assignment_submission_attachments'),
    Check('CHK_assignment_submission_attachments_file_size', '"file_size" > 0 AND "file_size" <= 52428800'),
    Index('IDX_assignment_submission_attachments_revision_created', ['revision', 'createdAt']),
    Index('UQ_assignment_submission_attachments_storage_key', ['storageKey'], { unique: true })
], AssignmentSubmissionAttachment);
export { AssignmentSubmissionAttachment };
let AssignmentSubmissionReview = class AssignmentSubmissionReview {
    id;
    submission;
    reviewedBy;
    action;
    score;
    feedback;
    reviewedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AssignmentSubmissionReview.prototype, "id", void 0);
__decorate([
    ManyToOne(() => AssignmentSubmission, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'submission_id' }),
    __metadata("design:type", Object)
], AssignmentSubmissionReview.prototype, "submission", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'reviewed_by_teacher_id' }),
    __metadata("design:type", Object)
], AssignmentSubmissionReview.prototype, "reviewedBy", void 0);
__decorate([
    Column({ type: 'varchar', length: 8 }),
    __metadata("design:type", String)
], AssignmentSubmissionReview.prototype, "action", void 0);
__decorate([
    Column({ type: 'numeric', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], AssignmentSubmissionReview.prototype, "score", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], AssignmentSubmissionReview.prototype, "feedback", void 0);
__decorate([
    Column({ name: 'reviewed_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmissionReview.prototype, "reviewedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignmentSubmissionReview.prototype, "createdAt", void 0);
AssignmentSubmissionReview = __decorate([
    Entity('assignment_submission_reviews'),
    Check('CHK_assignment_submission_reviews_action', `"action" IN ('GRADED','RETURNED')`),
    Check('CHK_assignment_submission_reviews_score', `("score" IS NULL OR "score">=0) AND (("action"='GRADED' AND "score" IS NOT NULL) OR ("action"='RETURNED' AND "score" IS NULL))`),
    Index('IDX_assignment_submission_reviews_submission_reviewed', ['submission', 'reviewedAt'])
], AssignmentSubmissionReview);
export { AssignmentSubmissionReview };
//# sourceMappingURL=assignments.entity.js.map