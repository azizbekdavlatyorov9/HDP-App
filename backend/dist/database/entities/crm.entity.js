var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './education.entity.js';
import { LessonSession, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';
let CrmLead = class CrmLead {
    id;
    fullName;
    phoneNumber;
    email;
    source;
    status;
    interestedCourse;
    assignedTo;
    createdBy;
    convertedStudent;
    lostReason;
    notes;
    nextFollowUpAt;
    lastContactedAt;
    convertedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CrmLead.prototype, "id", void 0);
__decorate([
    Column({ name: 'full_name', type: 'varchar', length: 160 }),
    __metadata("design:type", String)
], CrmLead.prototype, "fullName", void 0);
__decorate([
    Column({ name: 'phone_number', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CrmLead.prototype, "phoneNumber", void 0);
__decorate([
    Column({ type: 'varchar', length: 254, nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "email", void 0);
__decorate([
    Column({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], CrmLead.prototype, "source", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'NEW' }),
    __metadata("design:type", String)
], CrmLead.prototype, "status", void 0);
__decorate([
    ManyToOne(() => Course, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'interested_course_id' }),
    __metadata("design:type", Object)
], CrmLead.prototype, "interestedCourse", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'assigned_to_user_id' }),
    __metadata("design:type", Object)
], CrmLead.prototype, "assignedTo", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'created_by_user_id' }),
    __metadata("design:type", Object)
], CrmLead.prototype, "createdBy", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'converted_student_user_id' }),
    __metadata("design:type", Object)
], CrmLead.prototype, "convertedStudent", void 0);
__decorate([
    Column({ name: 'lost_reason', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "lostReason", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "notes", void 0);
__decorate([
    Column({ name: 'next_follow_up_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "nextFollowUpAt", void 0);
__decorate([
    Column({ name: 'last_contacted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "lastContactedAt", void 0);
__decorate([
    Column({ name: 'converted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CrmLead.prototype, "convertedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmLead.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmLead.prototype, "updatedAt", void 0);
CrmLead = __decorate([
    Entity('crm_leads'),
    Check('CHK_crm_leads_source', `"source" IN ('WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER')`),
    Check('CHK_crm_leads_status', `"status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST')`),
    Check('CHK_crm_leads_phone_e164', `"phone_number" ~ '^\\+[1-9][0-9]{7,14}$'`),
    Check('CHK_crm_leads_lost_reason', `"status" <> 'LOST' OR ("lost_reason" IS NOT NULL AND length(trim("lost_reason"))>0)`),
    Check('CHK_crm_leads_conversion', `"status" <> 'WON' OR ("converted_student_user_id" IS NOT NULL AND "converted_at" IS NOT NULL)`),
    Index('UQ_crm_leads_active_phone', ['phoneNumber'], { unique: true, where: `"status" NOT IN ('WON','LOST')` }),
    Index('IDX_crm_leads_status_created', ['status', 'createdAt']),
    Index('IDX_crm_leads_source_created', ['source', 'createdAt']),
    Index('IDX_crm_leads_assigned_status_followup', ['assignedTo', 'status', 'nextFollowUpAt']),
    Index('IDX_crm_leads_course_status', ['interestedCourse', 'status']),
    Index('IDX_crm_leads_followup', ['nextFollowUpAt', 'status'])
], CrmLead);
export { CrmLead };
let CrmLeadActivity = class CrmLeadActivity {
    id;
    lead;
    actor;
    type;
    description;
    metadata;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CrmLeadActivity.prototype, "id", void 0);
__decorate([
    ManyToOne(() => CrmLead, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'lead_id' }),
    __metadata("design:type", Object)
], CrmLeadActivity.prototype, "lead", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'actor_user_id' }),
    __metadata("design:type", Object)
], CrmLeadActivity.prototype, "actor", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CrmLeadActivity.prototype, "type", void 0);
__decorate([
    Column({ type: 'varchar', length: 3000 }),
    __metadata("design:type", String)
], CrmLeadActivity.prototype, "description", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CrmLeadActivity.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmLeadActivity.prototype, "createdAt", void 0);
CrmLeadActivity = __decorate([
    Entity('crm_lead_activities'),
    Check('CHK_crm_lead_activities_type', `"type" IN ('CALL','MESSAGE','EMAIL','MEETING','NOTE','STATUS_CHANGE','ASSIGNMENT_CHANGE','OTHER')`),
    Check('CHK_crm_lead_activities_metadata_size', '"metadata" IS NULL OR octet_length("metadata"::text)<=8192'),
    Index('IDX_crm_lead_activities_lead_created', ['lead', 'createdAt']),
    Index('IDX_crm_lead_activities_actor_created', ['actor', 'createdAt'])
], CrmLeadActivity);
export { CrmLeadActivity };
let CrmLeadStatusHistory = class CrmLeadStatusHistory {
    id;
    lead;
    previousStatus;
    newStatus;
    actor;
    changeReason;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CrmLeadStatusHistory.prototype, "id", void 0);
__decorate([
    ManyToOne(() => CrmLead, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'lead_id' }),
    __metadata("design:type", Object)
], CrmLeadStatusHistory.prototype, "lead", void 0);
__decorate([
    Column({ name: 'previous_status', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], CrmLeadStatusHistory.prototype, "previousStatus", void 0);
__decorate([
    Column({ name: 'new_status', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CrmLeadStatusHistory.prototype, "newStatus", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'actor_user_id' }),
    __metadata("design:type", Object)
], CrmLeadStatusHistory.prototype, "actor", void 0);
__decorate([
    Column({ name: 'change_reason', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], CrmLeadStatusHistory.prototype, "changeReason", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmLeadStatusHistory.prototype, "createdAt", void 0);
CrmLeadStatusHistory = __decorate([
    Entity('crm_lead_status_history'),
    Check('CHK_crm_lead_status_history_new_status', `"new_status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST')`),
    Index('IDX_crm_lead_status_history_lead_created', ['lead', 'createdAt'])
], CrmLeadStatusHistory);
export { CrmLeadStatusHistory };
let CrmTrialLesson = class CrmTrialLesson {
    id;
    lead;
    course;
    group;
    session;
    scheduledAt;
    status;
    result;
    feedback;
    createdBy;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CrmTrialLesson.prototype, "id", void 0);
__decorate([
    ManyToOne(() => CrmLead, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'lead_id' }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "lead", void 0);
__decorate([
    ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "course", void 0);
__decorate([
    ManyToOne(() => StudyGroup, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'group_id' }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "group", void 0);
__decorate([
    ManyToOne(() => LessonSession, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'session_id' }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "session", void 0);
__decorate([
    Column({ name: 'scheduled_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmTrialLesson.prototype, "scheduledAt", void 0);
__decorate([
    Column({ type: 'varchar', length: 12, default: 'SCHEDULED' }),
    __metadata("design:type", String)
], CrmTrialLesson.prototype, "status", void 0);
__decorate([
    Column({ type: 'varchar', length: 2000, nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "result", void 0);
__decorate([
    Column({ type: 'varchar', length: 5000, nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "feedback", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'created_by_user_id' }),
    __metadata("design:type", Object)
], CrmTrialLesson.prototype, "createdBy", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmTrialLesson.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmTrialLesson.prototype, "updatedAt", void 0);
CrmTrialLesson = __decorate([
    Entity('crm_trial_lessons'),
    Check('CHK_crm_trial_lessons_status', `"status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`),
    Index('IDX_crm_trial_lessons_lead_scheduled', ['lead', 'scheduledAt']),
    Index('IDX_crm_trial_lessons_course_scheduled', ['course', 'scheduledAt']),
    Index('IDX_crm_trial_lessons_group_scheduled', ['group', 'scheduledAt']),
    Index('IDX_crm_trial_lessons_status_scheduled', ['status', 'scheduledAt'])
], CrmTrialLesson);
export { CrmTrialLesson };
let CrmTrialLessonHistory = class CrmTrialLessonHistory {
    id;
    trialLesson;
    previousStatus;
    newStatus;
    previousScheduledAt;
    newScheduledAt;
    actor;
    changeReason;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CrmTrialLessonHistory.prototype, "id", void 0);
__decorate([
    ManyToOne(() => CrmTrialLesson, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'trial_lesson_id' }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "trialLesson", void 0);
__decorate([
    Column({ name: 'previous_status', type: 'varchar', length: 12, nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "previousStatus", void 0);
__decorate([
    Column({ name: 'new_status', type: 'varchar', length: 12, nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "newStatus", void 0);
__decorate([
    Column({ name: 'previous_scheduled_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "previousScheduledAt", void 0);
__decorate([
    Column({ name: 'new_scheduled_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "newScheduledAt", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'actor_user_id' }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "actor", void 0);
__decorate([
    Column({ name: 'change_reason', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", Object)
], CrmTrialLessonHistory.prototype, "changeReason", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CrmTrialLessonHistory.prototype, "createdAt", void 0);
CrmTrialLessonHistory = __decorate([
    Entity('crm_trial_lesson_history'),
    Check('CHK_crm_trial_lesson_history_previous_status', `"previous_status" IS NULL OR "previous_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`),
    Check('CHK_crm_trial_lesson_history_new_status', `"new_status" IS NULL OR "new_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`),
    Index('IDX_crm_trial_lesson_history_trial_created', ['trialLesson', 'createdAt'])
], CrmTrialLessonHistory);
export { CrmTrialLessonHistory };
//# sourceMappingURL=crm.entity.js.map