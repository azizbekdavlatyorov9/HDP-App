import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Course, Lesson } from './education.entity.js';
import { GroupStudent, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';

export type AssignmentStatus='DRAFT'|'PUBLISHED'|'ARCHIVED';
export type AssignmentSubmissionStatus='SUBMITTED'|'LATE'|'GRADED'|'RETURNED';
export type SubmissionReviewAction='GRADED'|'RETURNED';

@Entity('assignments')
@Check('CHK_assignments_status', `"status" IN ('DRAFT','PUBLISHED','ARCHIVED')`)
@Check('CHK_assignments_max_score', '"max_score" > 0')
@Index('IDX_assignments_group_status_due', ['group','status','dueAt'])
@Index('IDX_assignments_course_status', ['course','status'])
@Index('IDX_assignments_creator_created', ['createdBy','createdAt'])
export class Assignment {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @Column({type:'varchar',length:180}) title!:string;
  @Column({type:'text'}) description!:string;
  @Column({type:'text',nullable:true}) instructions!:string|null;
  @ManyToOne(()=>Course,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'course_id'}) course!:Relation<Course>;
  @ManyToOne(()=>Lesson,{nullable:true,onDelete:'RESTRICT'}) @JoinColumn({name:'lesson_id'}) lesson!:Relation<Lesson|null>;
  @ManyToOne(()=>StudyGroup,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'group_id'}) group!:Relation<StudyGroup>;
  @ManyToOne(()=>User,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'created_by_teacher_id'}) createdBy!:Relation<User>;
  @Column({name:'max_score',type:'numeric',precision:10,scale:2}) maxScore!:string;
  @Column({name:'due_at',type:'timestamptz',nullable:true}) dueAt!:Date|null;
  @Column({type:'varchar',length:12,default:'DRAFT'}) status!:AssignmentStatus;
  @Column({name:'allow_late_submission',type:'boolean',default:false}) allowLateSubmission!:boolean;
  @Column({name:'allow_resubmission',type:'boolean',default:true}) allowResubmission!:boolean;
  @Column({name:'allow_resubmission_after_graded',type:'boolean',default:false}) allowResubmissionAfterGraded!:boolean;
  @Column({name:'published_at',type:'timestamptz',nullable:true}) publishedAt!:Date|null;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
  @UpdateDateColumn({name:'updated_at',type:'timestamptz'}) updatedAt!:Date;
}

@Entity('assignment_attachments')
@Check('CHK_assignment_attachments_file_size','"file_size" > 0 AND "file_size" <= 52428800')
@Index('IDX_assignment_attachments_assignment_created',['assignment','createdAt'])
@Index('UQ_assignment_attachments_storage_key',['storageKey'],{unique:true})
export class AssignmentAttachment {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>Assignment,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'assignment_id'}) assignment!:Relation<Assignment>;
  @Column({name:'file_name',type:'varchar',length:255}) fileName!:string;
  @Column({name:'mime_type',type:'varchar',length:120}) mimeType!:string;
  @Column({name:'file_size',type:'integer'}) fileSize!:number;
  @Column({name:'storage_key',type:'text',select:false}) storageKey!:string;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}

@Entity('assignment_submissions')
@Check('CHK_assignment_submissions_status', `"status" IN ('SUBMITTED','LATE','GRADED','RETURNED')`)
@Check('CHK_assignment_submissions_version','"current_version" > 0')
@Check('CHK_assignment_submissions_late_status', `"status" <> 'LATE' OR "is_late"=true`)
@Unique('UQ_assignment_submissions_assignment_student',['assignment','student'])
@Index('IDX_assignment_submissions_student_submitted',['student','submittedAt'])
@Index('IDX_assignment_submissions_assignment_status',['assignment','status'])
@Index('IDX_assignment_submissions_membership',['membership'])
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>Assignment,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'assignment_id'}) assignment!:Relation<Assignment>;
  @ManyToOne(()=>User,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'student_id'}) student!:Relation<User>;
  @ManyToOne(()=>GroupStudent,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'membership_id'}) membership!:Relation<GroupStudent>;
  @Column({name:'submitted_at',type:'timestamptz'}) submittedAt!:Date;
  @Column({name:'text_answer',type:'text',nullable:true}) textAnswer!:string|null;
  @Column({type:'varchar',length:12}) status!:AssignmentSubmissionStatus;
  @Column({name:'is_late',type:'boolean',default:false}) isLate!:boolean;
  @Column({name:'current_version',type:'integer',default:1}) currentVersion!:number;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
  @UpdateDateColumn({name:'updated_at',type:'timestamptz'}) updatedAt!:Date;
}

@Entity('assignment_submission_revisions')
@Check('CHK_assignment_submission_revisions_version','"version_number" > 0')
@Unique('UQ_assignment_submission_revisions_number',['submission','versionNumber'])
@Unique('UQ_assignment_submission_revisions_idempotency',['submission','idempotencyKey'])
@Index('IDX_assignment_submission_revisions_submission_created',['submission','createdAt'])
export class AssignmentSubmissionRevision {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>AssignmentSubmission,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'submission_id'}) submission!:Relation<AssignmentSubmission>;
  @Column({name:'version_number',type:'integer'}) versionNumber!:number;
  @Column({name:'idempotency_key',type:'varchar',length:100}) idempotencyKey!:string;
  @Column({name:'text_answer',type:'text',nullable:true}) textAnswer!:string|null;
  @Column({name:'submitted_at',type:'timestamptz'}) submittedAt!:Date;
  @Column({name:'is_late',type:'boolean',default:false}) isLate!:boolean;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}

@Entity('assignment_submission_attachments')
@Check('CHK_assignment_submission_attachments_file_size','"file_size" > 0 AND "file_size" <= 52428800')
@Index('IDX_assignment_submission_attachments_revision_created',['revision','createdAt'])
@Index('UQ_assignment_submission_attachments_storage_key',['storageKey'],{unique:true})
export class AssignmentSubmissionAttachment {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>AssignmentSubmission,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'submission_id'}) submission!:Relation<AssignmentSubmission>;
  @ManyToOne(()=>AssignmentSubmissionRevision,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'revision_id'}) revision!:Relation<AssignmentSubmissionRevision>;
  @Column({name:'file_name',type:'varchar',length:255}) fileName!:string;
  @Column({name:'mime_type',type:'varchar',length:120}) mimeType!:string;
  @Column({name:'file_size',type:'integer'}) fileSize!:number;
  @Column({name:'storage_key',type:'text',select:false}) storageKey!:string;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}

@Entity('assignment_submission_reviews')
@Check('CHK_assignment_submission_reviews_action',`"action" IN ('GRADED','RETURNED')`)
@Check('CHK_assignment_submission_reviews_score', `("score" IS NULL OR "score">=0) AND (("action"='GRADED' AND "score" IS NOT NULL) OR ("action"='RETURNED' AND "score" IS NULL))`)
@Index('IDX_assignment_submission_reviews_submission_reviewed',['submission','reviewedAt'])
export class AssignmentSubmissionReview {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>AssignmentSubmission,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'submission_id'}) submission!:Relation<AssignmentSubmission>;
  @ManyToOne(()=>User,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'reviewed_by_teacher_id'}) reviewedBy!:Relation<User>;
  @Column({type:'varchar',length:8}) action!:SubmissionReviewAction;
  @Column({type:'numeric',precision:10,scale:2,nullable:true}) score!:string|null;
  @Column({type:'text'}) feedback!:string;
  @Column({name:'reviewed_at',type:'timestamptz'}) reviewedAt!:Date;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}
