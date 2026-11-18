import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Course } from './education.entity.js';
import { LessonSession, StudyGroup } from './groups.entity.js';
import { User } from './core.entity.js';

export type CrmLeadSource='WEBSITE'|'PHONE'|'TELEGRAM'|'INSTAGRAM'|'REFERRAL'|'WALK_IN'|'OTHER';
export type CrmLeadStatus='NEW'|'CONTACTED'|'INTERESTED'|'TRIAL_SCHEDULED'|'TRIAL_COMPLETED'|'NEGOTIATION'|'WON'|'LOST';
export type CrmActivityType='CALL'|'MESSAGE'|'EMAIL'|'MEETING'|'NOTE'|'STATUS_CHANGE'|'ASSIGNMENT_CHANGE'|'OTHER';
export type TrialLessonStatus='SCHEDULED'|'CONFIRMED'|'ATTENDED'|'MISSED'|'CANCELLED';

@Entity('crm_leads')
@Check('CHK_crm_leads_source',`"source" IN ('WEBSITE','PHONE','TELEGRAM','INSTAGRAM','REFERRAL','WALK_IN','OTHER')`)
@Check('CHK_crm_leads_status',`"status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST')`)
@Check('CHK_crm_leads_phone_e164',`"phone_number" ~ '^\\+[1-9][0-9]{7,14}$'`)
@Check('CHK_crm_leads_lost_reason',`"status" <> 'LOST' OR ("lost_reason" IS NOT NULL AND length(trim("lost_reason"))>0)`)
@Check('CHK_crm_leads_conversion',`"status" <> 'WON' OR ("converted_student_user_id" IS NOT NULL AND "converted_at" IS NOT NULL)`)
@Index('UQ_crm_leads_active_phone',['phoneNumber'],{unique:true,where:`"status" NOT IN ('WON','LOST')`})
@Index('IDX_crm_leads_status_created',['status','createdAt'])
@Index('IDX_crm_leads_source_created',['source','createdAt'])
@Index('IDX_crm_leads_assigned_status_followup',['assignedTo','status','nextFollowUpAt'])
@Index('IDX_crm_leads_course_status',['interestedCourse','status'])
@Index('IDX_crm_leads_followup',['nextFollowUpAt','status'])
export class CrmLead {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @Column({name:'full_name',type:'varchar',length:160}) fullName!:string;
  @Column({name:'phone_number',type:'varchar',length:20}) phoneNumber!:string;
  @Column({type:'varchar',length:254,nullable:true}) email!:string|null;
  @Column({type:'varchar',length:16}) source!:CrmLeadSource;
  @Column({type:'varchar',length:20,default:'NEW'}) status!:CrmLeadStatus;
  @ManyToOne(()=>Course,{nullable:true,onDelete:'SET NULL'}) @JoinColumn({name:'interested_course_id'}) interestedCourse!:Relation<Course|null>;
  @ManyToOne(()=>User,{nullable:true,onDelete:'SET NULL'}) @JoinColumn({name:'assigned_to_user_id'}) assignedTo!:Relation<User|null>;
  @ManyToOne(()=>User,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'created_by_user_id'}) createdBy!:Relation<User>;
  @ManyToOne(()=>User,{nullable:true,onDelete:'RESTRICT'}) @JoinColumn({name:'converted_student_user_id'}) convertedStudent!:Relation<User|null>;
  @Column({name:'lost_reason',type:'varchar',length:1000,nullable:true}) lostReason!:string|null;
  @Column({type:'text',nullable:true}) notes!:string|null;
  @Column({name:'next_follow_up_at',type:'timestamptz',nullable:true}) nextFollowUpAt!:Date|null;
  @Column({name:'last_contacted_at',type:'timestamptz',nullable:true}) lastContactedAt!:Date|null;
  @Column({name:'converted_at',type:'timestamptz',nullable:true}) convertedAt!:Date|null;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
  @UpdateDateColumn({name:'updated_at',type:'timestamptz'}) updatedAt!:Date;
}

@Entity('crm_lead_activities')
@Check('CHK_crm_lead_activities_type',`"type" IN ('CALL','MESSAGE','EMAIL','MEETING','NOTE','STATUS_CHANGE','ASSIGNMENT_CHANGE','OTHER')`)
@Check('CHK_crm_lead_activities_metadata_size','"metadata" IS NULL OR octet_length("metadata"::text)<=8192')
@Index('IDX_crm_lead_activities_lead_created',['lead','createdAt'])
@Index('IDX_crm_lead_activities_actor_created',['actor','createdAt'])
export class CrmLeadActivity {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>CrmLead,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'lead_id'}) lead!:Relation<CrmLead>;
  @ManyToOne(()=>User,{nullable:true,onDelete:'SET NULL'}) @JoinColumn({name:'actor_user_id'}) actor!:Relation<User|null>;
  @Column({type:'varchar',length:20}) type!:CrmActivityType;
  @Column({type:'varchar',length:3000}) description!:string;
  @Column({type:'jsonb',nullable:true}) metadata!:Record<string,unknown>|null;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}

@Entity('crm_lead_status_history')
@Check('CHK_crm_lead_status_history_new_status',`"new_status" IN ('NEW','CONTACTED','INTERESTED','TRIAL_SCHEDULED','TRIAL_COMPLETED','NEGOTIATION','WON','LOST')`)
@Index('IDX_crm_lead_status_history_lead_created',['lead','createdAt'])
export class CrmLeadStatusHistory {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>CrmLead,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'lead_id'}) lead!:Relation<CrmLead>;
  @Column({name:'previous_status',type:'varchar',length:20,nullable:true}) previousStatus!:CrmLeadStatus|null;
  @Column({name:'new_status',type:'varchar',length:20}) newStatus!:CrmLeadStatus;
  @ManyToOne(()=>User,{nullable:true,onDelete:'SET NULL'}) @JoinColumn({name:'actor_user_id'}) actor!:Relation<User|null>;
  @Column({name:'change_reason',type:'varchar',length:1000,nullable:true}) changeReason!:string|null;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}

@Entity('crm_trial_lessons')
@Check('CHK_crm_trial_lessons_status',`"status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`)
@Index('IDX_crm_trial_lessons_lead_scheduled',['lead','scheduledAt'])
@Index('IDX_crm_trial_lessons_course_scheduled',['course','scheduledAt'])
@Index('IDX_crm_trial_lessons_group_scheduled',['group','scheduledAt'])
@Index('IDX_crm_trial_lessons_status_scheduled',['status','scheduledAt'])
export class CrmTrialLesson {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>CrmLead,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'lead_id'}) lead!:Relation<CrmLead>;
  @ManyToOne(()=>Course,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'course_id'}) course!:Relation<Course>;
  @ManyToOne(()=>StudyGroup,{nullable:true,onDelete:'RESTRICT'}) @JoinColumn({name:'group_id'}) group!:Relation<StudyGroup|null>;
  @ManyToOne(()=>LessonSession,{nullable:true,onDelete:'RESTRICT'}) @JoinColumn({name:'session_id'}) session!:Relation<LessonSession|null>;
  @Column({name:'scheduled_at',type:'timestamptz'}) scheduledAt!:Date;
  @Column({type:'varchar',length:12,default:'SCHEDULED'}) status!:TrialLessonStatus;
  @Column({type:'varchar',length:2000,nullable:true}) result!:string|null;
  @Column({type:'varchar',length:5000,nullable:true}) feedback!:string|null;
  @ManyToOne(()=>User,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'created_by_user_id'}) createdBy!:Relation<User>;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
  @UpdateDateColumn({name:'updated_at',type:'timestamptz'}) updatedAt!:Date;
}

@Entity('crm_trial_lesson_history')
@Check('CHK_crm_trial_lesson_history_previous_status',`"previous_status" IS NULL OR "previous_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`)
@Check('CHK_crm_trial_lesson_history_new_status',`"new_status" IS NULL OR "new_status" IN ('SCHEDULED','CONFIRMED','ATTENDED','MISSED','CANCELLED')`)
@Index('IDX_crm_trial_lesson_history_trial_created',['trialLesson','createdAt'])
export class CrmTrialLessonHistory {
  @PrimaryGeneratedColumn('uuid') id!:string;
  @ManyToOne(()=>CrmTrialLesson,{ nullable: false, onDelete:'RESTRICT'}) @JoinColumn({name:'trial_lesson_id'}) trialLesson!:Relation<CrmTrialLesson>;
  @Column({name:'previous_status',type:'varchar',length:12,nullable:true}) previousStatus!:TrialLessonStatus|null;
  @Column({name:'new_status',type:'varchar',length:12,nullable:true}) newStatus!:TrialLessonStatus|null;
  @Column({name:'previous_scheduled_at',type:'timestamptz',nullable:true}) previousScheduledAt!:Date|null;
  @Column({name:'new_scheduled_at',type:'timestamptz',nullable:true}) newScheduledAt!:Date|null;
  @ManyToOne(()=>User,{nullable:true,onDelete:'SET NULL'}) @JoinColumn({name:'actor_user_id'}) actor!:Relation<User|null>;
  @Column({name:'change_reason',type:'varchar',length:1000,nullable:true}) changeReason!:string|null;
  @CreateDateColumn({name:'created_at',type:'timestamptz'}) createdAt!:Date;
}
