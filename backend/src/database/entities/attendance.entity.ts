import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { GroupStudent, LessonSession } from './groups.entity.js';
import { User } from './core.entity.js';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceLifecycleStatus =
  'NOT_STARTED' | 'IN_PROGRESS' | 'FINALIZED' | 'REOPENED';
export type AttendanceHistoryAction =
  'CREATED' | 'UPDATED' | 'FINALIZED' | 'REOPENED';

@Entity('attendances')
@Check(
  'CHK_attendances_status',
  `"status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`,
)
@Check(
  'CHK_attendances_lateness',
  `("status" = 'LATE' AND "lateness_minutes" IS NOT NULL AND "lateness_minutes" > 0) OR ("status" <> 'LATE' AND ("lateness_minutes" IS NULL OR "lateness_minutes" = 0))`,
)
@Check(
  'CHK_attendances_excuse_reason',
  `"status" <> 'EXCUSED' OR ("reason" IS NOT NULL AND length(trim("reason")) > 0)`,
)
@Unique('UQ_attendances_session_student', ['session', 'student'])
@Index('IDX_attendances_student_marked', ['student', 'markedAt'])
@Index('IDX_attendances_session_status', ['session', 'status'])
@Index('IDX_attendances_membership', ['membership'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  session!: Relation<LessonSession>;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student!: Relation<User>;
  @ManyToOne(() => GroupStudent, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'membership_id' })
  membership!: Relation<GroupStudent>;
  @Column({ type: 'varchar', length: 12 }) status!: AttendanceStatus;
  @Column({ name: 'lateness_minutes', type: 'integer', nullable: true })
  latenessMinutes!: number | null;
  @Column({ type: 'text', nullable: true }) reason!: string | null;
  @Column({ name: 'teacher_note', type: 'text', nullable: true, select: false })
  teacherNote!: string | null;
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'marked_by_user_id' })
  markedBy!: Relation<User>;
  @Column({ name: 'marked_at', type: 'timestamptz' }) markedAt!: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('attendance_sessions')
@Check(
  'CHK_attendance_sessions_status',
  `"status" IN ('NOT_STARTED','IN_PROGRESS','FINALIZED','REOPENED')`,
)
@Unique('UQ_attendance_sessions_lesson_session', ['session'])
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  session!: Relation<LessonSession>;
  @Column({ type: 'varchar', length: 16, default: 'NOT_STARTED' })
  status!: AttendanceLifecycleStatus;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'finalized_by_user_id' })
  finalizedBy!: Relation<User | null>;
  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt!: Date | null;
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('attendance_history')
@Check(
  'CHK_attendance_history_action',
  `"action" IN ('CREATED','UPDATED','FINALIZED','REOPENED')`,
)
@Check(
  'CHK_attendance_history_previous_status',
  `"previous_status" IS NULL OR "previous_status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`,
)
@Check(
  'CHK_attendance_history_new_status',
  `"new_status" IS NULL OR "new_status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`,
)
@Index('IDX_attendance_history_attendance_created', ['attendance', 'createdAt'])
@Index('IDX_attendance_history_session_created', ['session', 'createdAt'])
export class AttendanceHistory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Attendance, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'attendance_id' })
  attendance!: Relation<Attendance | null>;
  @ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  session!: Relation<LessonSession>;
  @Column({ type: 'varchar', length: 12 }) action!: AttendanceHistoryAction;
  @Column({
    name: 'previous_status',
    type: 'varchar',
    length: 12,
    nullable: true,
  })
  previousStatus!: AttendanceStatus | null;
  @Column({ name: 'new_status', type: 'varchar', length: 12, nullable: true })
  newStatus!: AttendanceStatus | null;
  @Column({
    name: 'previous_lateness_minutes',
    type: 'integer',
    nullable: true,
  })
  previousLatenessMinutes!: number | null;
  @Column({ name: 'new_lateness_minutes', type: 'integer', nullable: true })
  newLatenessMinutes!: number | null;
  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actor!: Relation<User | null>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
