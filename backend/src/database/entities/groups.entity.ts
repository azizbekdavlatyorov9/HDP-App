import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Course, Enrollment } from './education.entity.js';
import { User } from './core.entity.js';

export type StudyGroupStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type GroupMembershipStatus = 'ACTIVE' | 'COMPLETED' | 'LEFT' | 'REMOVED';
export type LessonSessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

@Entity('study_groups')
@Check('CHK_study_groups_status', `"status" IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED')`)
@Check('CHK_study_groups_capacity', '"capacity" > 0')
@Check('CHK_study_groups_date_range', '"end_date" IS NULL OR "end_date" >= "start_date"')
@Index('UQ_study_groups_code', ['code'], { unique: true })
@Index('IDX_study_groups_course_status', ['course', 'status'])
@Index('IDX_study_groups_teacher_status', ['leadTeacher', 'status'])
export class StudyGroup {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 140 }) name!: string;
  @Column({ type: 'varchar', length: 40 }) code!: string;
  @ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'course_id' }) course!: Relation<Course>;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'lead_teacher_id' }) leadTeacher!: Relation<User>;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'integer' }) capacity!: number;
  @Column({ type: 'varchar', length: 16, default: 'DRAFT' }) status!: StudyGroupStatus;
  @Column({ name: 'start_date', type: 'date' }) startDate!: string;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('group_students')
@Check('CHK_group_students_status', `"status" IN ('ACTIVE','COMPLETED','LEFT','REMOVED')`)
@Index('UQ_group_students_active_pair', ['group', 'student'], { unique: true, where: `"status" = 'ACTIVE'` })
@Index('UQ_group_students_active_enrollment', ['enrollment'], { unique: true, where: `"status" = 'ACTIVE' AND "enrollment_id" IS NOT NULL` })
@Index('IDX_group_students_enrollment', ['enrollment'])
@Index('IDX_group_students_student_status', ['student', 'status'])
@Index('IDX_group_students_group_status', ['group', 'status'])
export class GroupStudent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'group_id' }) group!: Relation<StudyGroup>;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'student_id' }) student!: Relation<User>;
  // Nullable only for pre-migration historical memberships that cannot be matched safely.
  @ManyToOne(() => Enrollment, { nullable: true, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'enrollment_id' }) enrollment!: Relation<Enrollment | null>;
  @Column({ type: 'varchar', length: 16, default: 'ACTIVE' }) status!: GroupMembershipStatus;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'changed_by_user_id' }) changedBy!: Relation<User | null>;
  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) joinedAt!: Date;
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true }) endedAt!: Date | null;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('classrooms')
@Check('CHK_classrooms_capacity', '"capacity" > 0')
@Index('UQ_classrooms_code', ['code'], { unique: true })
@Index('IDX_classrooms_active', ['isActive'])
export class Classroom {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 140 }) name!: string;
  @Column({ type: 'varchar', length: 40 }) code!: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) location!: string | null;
  @Column({ type: 'integer' }) capacity!: number;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('group_schedules')
@Check('CHK_group_schedules_weekday', '"weekday" BETWEEN 0 AND 6')
@Check('CHK_group_schedules_time_range', '"start_time" < "end_time"')
@Check('CHK_group_schedules_date_range', '"effective_end_date" IS NULL OR "effective_end_date" >= "effective_start_date"')
@Index('IDX_group_schedules_group_active', ['group', 'isActive'])
@Index('IDX_group_schedules_teacher_weekday', ['teacher', 'weekday', 'isActive'])
@Index('IDX_group_schedules_classroom_weekday', ['classroom', 'weekday', 'isActive'])
export class GroupSchedule {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'group_id' }) group!: Relation<StudyGroup>;
  @Column({ type: 'smallint' }) weekday!: number;
  @Column({ name: 'start_time', type: 'time' }) startTime!: string;
  @Column({ name: 'end_time', type: 'time' }) endTime!: string;
  @Column({ name: 'effective_start_date', type: 'date' }) effectiveStartDate!: string;
  @Column({ name: 'effective_end_date', type: 'date', nullable: true }) effectiveEndDate!: string | null;
  @ManyToOne(() => Classroom, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'classroom_id' }) classroom!: Relation<Classroom>;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'teacher_id' }) teacher!: Relation<User>;
  @Column({ type: 'varchar', length: 64, default: 'Asia/Tashkent' }) timezone!: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('lesson_sessions')
@Check('CHK_lesson_sessions_status', `"status" IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')`)
@Check('CHK_lesson_sessions_time_range', '"start_at" < "end_at"')
@Unique('UQ_lesson_sessions_schedule_original_start', ['schedule', 'originalStartAt'])
@Index('IDX_lesson_sessions_group_start', ['group', 'startAt'])
@Index('IDX_lesson_sessions_teacher_start', ['teacher', 'startAt'])
@Index('IDX_lesson_sessions_classroom_start', ['classroom', 'startAt'])
export class LessonSession {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => GroupSchedule, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'schedule_id' }) schedule!: Relation<GroupSchedule>;
  @ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'group_id' }) group!: Relation<StudyGroup>;
  @ManyToOne(() => Classroom, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'classroom_id' }) classroom!: Relation<Classroom>;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'teacher_id' }) teacher!: Relation<User>;
  @Column({ name: 'start_at', type: 'timestamptz' }) startAt!: Date;
  @Column({ name: 'end_at', type: 'timestamptz' }) endAt!: Date;
  @Column({ name: 'original_start_at', type: 'timestamptz' }) originalStartAt!: Date;
  @Column({ name: 'original_end_at', type: 'timestamptz' }) originalEndAt!: Date;
  @Column({ type: 'varchar', length: 16, default: 'SCHEDULED' }) status!: LessonSessionStatus;
  @Column({ name: 'change_note', type: 'varchar', length: 500, nullable: true }) changeNote!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
