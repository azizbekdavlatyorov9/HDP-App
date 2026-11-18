var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { GroupStudent, LessonSession } from './groups.entity.js';
import { User } from './core.entity.js';
let Attendance = class Attendance {
    id;
    session;
    student;
    membership;
    status;
    latenessMinutes;
    reason;
    teacherNote;
    markedBy;
    markedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Attendance.prototype, "id", void 0);
__decorate([
    ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'session_id' }),
    __metadata("design:type", Object)
], Attendance.prototype, "session", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'student_id' }),
    __metadata("design:type", Object)
], Attendance.prototype, "student", void 0);
__decorate([
    ManyToOne(() => GroupStudent, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'membership_id' }),
    __metadata("design:type", Object)
], Attendance.prototype, "membership", void 0);
__decorate([
    Column({ type: 'varchar', length: 12 }),
    __metadata("design:type", String)
], Attendance.prototype, "status", void 0);
__decorate([
    Column({ name: 'lateness_minutes', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "latenessMinutes", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "reason", void 0);
__decorate([
    Column({ name: 'teacher_note', type: 'text', nullable: true, select: false }),
    __metadata("design:type", Object)
], Attendance.prototype, "teacherNote", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'marked_by_user_id' }),
    __metadata("design:type", Object)
], Attendance.prototype, "markedBy", void 0);
__decorate([
    Column({ name: 'marked_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Attendance.prototype, "markedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Attendance.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Attendance.prototype, "updatedAt", void 0);
Attendance = __decorate([
    Entity('attendances'),
    Check('CHK_attendances_status', `"status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`),
    Check('CHK_attendances_lateness', `("status" = 'LATE' AND "lateness_minutes" IS NOT NULL AND "lateness_minutes" > 0) OR ("status" <> 'LATE' AND ("lateness_minutes" IS NULL OR "lateness_minutes" = 0))`),
    Check('CHK_attendances_excuse_reason', `"status" <> 'EXCUSED' OR ("reason" IS NOT NULL AND length(trim("reason")) > 0)`),
    Unique('UQ_attendances_session_student', ['session', 'student']),
    Index('IDX_attendances_student_marked', ['student', 'markedAt']),
    Index('IDX_attendances_session_status', ['session', 'status']),
    Index('IDX_attendances_membership', ['membership'])
], Attendance);
export { Attendance };
let AttendanceSession = class AttendanceSession {
    id;
    session;
    status;
    finalizedBy;
    finalizedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AttendanceSession.prototype, "id", void 0);
__decorate([
    ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'session_id' }),
    __metadata("design:type", Object)
], AttendanceSession.prototype, "session", void 0);
__decorate([
    Column({ type: 'varchar', length: 16, default: 'NOT_STARTED' }),
    __metadata("design:type", String)
], AttendanceSession.prototype, "status", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'finalized_by_user_id' }),
    __metadata("design:type", Object)
], AttendanceSession.prototype, "finalizedBy", void 0);
__decorate([
    Column({ name: 'finalized_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], AttendanceSession.prototype, "finalizedAt", void 0);
__decorate([
    Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "updatedAt", void 0);
AttendanceSession = __decorate([
    Entity('attendance_sessions'),
    Check('CHK_attendance_sessions_status', `"status" IN ('NOT_STARTED','IN_PROGRESS','FINALIZED','REOPENED')`),
    Unique('UQ_attendance_sessions_lesson_session', ['session'])
], AttendanceSession);
export { AttendanceSession };
let AttendanceHistory = class AttendanceHistory {
    id;
    attendance;
    session;
    action;
    previousStatus;
    newStatus;
    previousLatenessMinutes;
    newLatenessMinutes;
    changeReason;
    actor;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AttendanceHistory.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Attendance, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'attendance_id' }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "attendance", void 0);
__decorate([
    ManyToOne(() => LessonSession, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'session_id' }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "session", void 0);
__decorate([
    Column({ type: 'varchar', length: 12 }),
    __metadata("design:type", String)
], AttendanceHistory.prototype, "action", void 0);
__decorate([
    Column({
        name: 'previous_status',
        type: 'varchar',
        length: 12,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "previousStatus", void 0);
__decorate([
    Column({ name: 'new_status', type: 'varchar', length: 12, nullable: true }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "newStatus", void 0);
__decorate([
    Column({
        name: 'previous_lateness_minutes',
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "previousLatenessMinutes", void 0);
__decorate([
    Column({ name: 'new_lateness_minutes', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "newLatenessMinutes", void 0);
__decorate([
    Column({ name: 'change_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "changeReason", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'actor_user_id' }),
    __metadata("design:type", Object)
], AttendanceHistory.prototype, "actor", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AttendanceHistory.prototype, "createdAt", void 0);
AttendanceHistory = __decorate([
    Entity('attendance_history'),
    Check('CHK_attendance_history_action', `"action" IN ('CREATED','UPDATED','FINALIZED','REOPENED')`),
    Check('CHK_attendance_history_previous_status', `"previous_status" IS NULL OR "previous_status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`),
    Check('CHK_attendance_history_new_status', `"new_status" IS NULL OR "new_status" IN ('PRESENT','ABSENT','LATE','EXCUSED')`),
    Index('IDX_attendance_history_attendance_created', ['attendance', 'createdAt']),
    Index('IDX_attendance_history_session_created', ['session', 'createdAt'])
], AttendanceHistory);
export { AttendanceHistory };
//# sourceMappingURL=attendance.entity.js.map