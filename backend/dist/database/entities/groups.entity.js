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
import { Course, Enrollment } from './education.entity.js';
import { User } from './core.entity.js';
let StudyGroup = class StudyGroup {
    id;
    name;
    code;
    course;
    leadTeacher;
    description;
    capacity;
    status;
    startDate;
    endDate;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], StudyGroup.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 140 }),
    __metadata("design:type", String)
], StudyGroup.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], StudyGroup.prototype, "code", void 0);
__decorate([
    ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], StudyGroup.prototype, "course", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'lead_teacher_id' }),
    __metadata("design:type", Object)
], StudyGroup.prototype, "leadTeacher", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], StudyGroup.prototype, "description", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], StudyGroup.prototype, "capacity", void 0);
__decorate([
    Column({ type: 'varchar', length: 16, default: 'DRAFT' }),
    __metadata("design:type", String)
], StudyGroup.prototype, "status", void 0);
__decorate([
    Column({ name: 'start_date', type: 'date' }),
    __metadata("design:type", String)
], StudyGroup.prototype, "startDate", void 0);
__decorate([
    Column({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], StudyGroup.prototype, "endDate", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], StudyGroup.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], StudyGroup.prototype, "updatedAt", void 0);
StudyGroup = __decorate([
    Entity('study_groups'),
    Check('CHK_study_groups_status', `"status" IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED')`),
    Check('CHK_study_groups_capacity', '"capacity" > 0'),
    Check('CHK_study_groups_date_range', '"end_date" IS NULL OR "end_date" >= "start_date"'),
    Index('UQ_study_groups_code', ['code'], { unique: true }),
    Index('IDX_study_groups_course_status', ['course', 'status']),
    Index('IDX_study_groups_teacher_status', ['leadTeacher', 'status'])
], StudyGroup);
export { StudyGroup };
let GroupStudent = class GroupStudent {
    id;
    group;
    student;
    enrollment;
    status;
    changedBy;
    joinedAt;
    endedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], GroupStudent.prototype, "id", void 0);
__decorate([
    ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'group_id' }),
    __metadata("design:type", Object)
], GroupStudent.prototype, "group", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'student_id' }),
    __metadata("design:type", Object)
], GroupStudent.prototype, "student", void 0);
__decorate([
    ManyToOne(() => Enrollment, { nullable: true, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'enrollment_id' }),
    __metadata("design:type", Object)
], GroupStudent.prototype, "enrollment", void 0);
__decorate([
    Column({ type: 'varchar', length: 16, default: 'ACTIVE' }),
    __metadata("design:type", String)
], GroupStudent.prototype, "status", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'changed_by_user_id' }),
    __metadata("design:type", Object)
], GroupStudent.prototype, "changedBy", void 0);
__decorate([
    Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], GroupStudent.prototype, "joinedAt", void 0);
__decorate([
    Column({ name: 'ended_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], GroupStudent.prototype, "endedAt", void 0);
__decorate([
    Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], GroupStudent.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], GroupStudent.prototype, "updatedAt", void 0);
GroupStudent = __decorate([
    Entity('group_students'),
    Check('CHK_group_students_status', `"status" IN ('ACTIVE','COMPLETED','LEFT','REMOVED')`),
    Index('UQ_group_students_active_pair', ['group', 'student'], { unique: true, where: `"status" = 'ACTIVE'` }),
    Index('UQ_group_students_active_enrollment', ['enrollment'], { unique: true, where: `"status" = 'ACTIVE' AND "enrollment_id" IS NOT NULL` }),
    Index('IDX_group_students_enrollment', ['enrollment']),
    Index('IDX_group_students_student_status', ['student', 'status']),
    Index('IDX_group_students_group_status', ['group', 'status'])
], GroupStudent);
export { GroupStudent };
let Classroom = class Classroom {
    id;
    name;
    code;
    location;
    capacity;
    description;
    isActive;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Classroom.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 140 }),
    __metadata("design:type", String)
], Classroom.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], Classroom.prototype, "code", void 0);
__decorate([
    Column({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], Classroom.prototype, "location", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Classroom.prototype, "capacity", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Classroom.prototype, "description", void 0);
__decorate([
    Column({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Classroom.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Classroom.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Classroom.prototype, "updatedAt", void 0);
Classroom = __decorate([
    Entity('classrooms'),
    Check('CHK_classrooms_capacity', '"capacity" > 0'),
    Index('UQ_classrooms_code', ['code'], { unique: true }),
    Index('IDX_classrooms_active', ['isActive'])
], Classroom);
export { Classroom };
let GroupSchedule = class GroupSchedule {
    id;
    group;
    weekday;
    startTime;
    endTime;
    effectiveStartDate;
    effectiveEndDate;
    classroom;
    teacher;
    timezone;
    isActive;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], GroupSchedule.prototype, "id", void 0);
__decorate([
    ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'group_id' }),
    __metadata("design:type", Object)
], GroupSchedule.prototype, "group", void 0);
__decorate([
    Column({ type: 'smallint' }),
    __metadata("design:type", Number)
], GroupSchedule.prototype, "weekday", void 0);
__decorate([
    Column({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], GroupSchedule.prototype, "startTime", void 0);
__decorate([
    Column({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], GroupSchedule.prototype, "endTime", void 0);
__decorate([
    Column({ name: 'effective_start_date', type: 'date' }),
    __metadata("design:type", String)
], GroupSchedule.prototype, "effectiveStartDate", void 0);
__decorate([
    Column({ name: 'effective_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], GroupSchedule.prototype, "effectiveEndDate", void 0);
__decorate([
    ManyToOne(() => Classroom, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'classroom_id' }),
    __metadata("design:type", Object)
], GroupSchedule.prototype, "classroom", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'teacher_id' }),
    __metadata("design:type", Object)
], GroupSchedule.prototype, "teacher", void 0);
__decorate([
    Column({ type: 'varchar', length: 64, default: 'Asia/Tashkent' }),
    __metadata("design:type", String)
], GroupSchedule.prototype, "timezone", void 0);
__decorate([
    Column({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GroupSchedule.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], GroupSchedule.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], GroupSchedule.prototype, "updatedAt", void 0);
GroupSchedule = __decorate([
    Entity('group_schedules'),
    Check('CHK_group_schedules_weekday', '"weekday" BETWEEN 0 AND 6'),
    Check('CHK_group_schedules_time_range', '"start_time" < "end_time"'),
    Check('CHK_group_schedules_date_range', '"effective_end_date" IS NULL OR "effective_end_date" >= "effective_start_date"'),
    Index('IDX_group_schedules_group_active', ['group', 'isActive']),
    Index('IDX_group_schedules_teacher_weekday', ['teacher', 'weekday', 'isActive']),
    Index('IDX_group_schedules_classroom_weekday', ['classroom', 'weekday', 'isActive'])
], GroupSchedule);
export { GroupSchedule };
let LessonSession = class LessonSession {
    id;
    schedule;
    group;
    classroom;
    teacher;
    startAt;
    endAt;
    originalStartAt;
    originalEndAt;
    status;
    changeNote;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], LessonSession.prototype, "id", void 0);
__decorate([
    ManyToOne(() => GroupSchedule, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'schedule_id' }),
    __metadata("design:type", Object)
], LessonSession.prototype, "schedule", void 0);
__decorate([
    ManyToOne(() => StudyGroup, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'group_id' }),
    __metadata("design:type", Object)
], LessonSession.prototype, "group", void 0);
__decorate([
    ManyToOne(() => Classroom, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'classroom_id' }),
    __metadata("design:type", Object)
], LessonSession.prototype, "classroom", void 0);
__decorate([
    ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'teacher_id' }),
    __metadata("design:type", Object)
], LessonSession.prototype, "teacher", void 0);
__decorate([
    Column({ name: 'start_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "startAt", void 0);
__decorate([
    Column({ name: 'end_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "endAt", void 0);
__decorate([
    Column({ name: 'original_start_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "originalStartAt", void 0);
__decorate([
    Column({ name: 'original_end_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "originalEndAt", void 0);
__decorate([
    Column({ type: 'varchar', length: 16, default: 'SCHEDULED' }),
    __metadata("design:type", String)
], LessonSession.prototype, "status", void 0);
__decorate([
    Column({ name: 'change_note', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], LessonSession.prototype, "changeNote", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonSession.prototype, "updatedAt", void 0);
LessonSession = __decorate([
    Entity('lesson_sessions'),
    Check('CHK_lesson_sessions_status', `"status" IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')`),
    Check('CHK_lesson_sessions_time_range', '"start_at" < "end_at"'),
    Unique('UQ_lesson_sessions_schedule_original_start', ['schedule', 'originalStartAt']),
    Index('IDX_lesson_sessions_group_start', ['group', 'startAt']),
    Index('IDX_lesson_sessions_teacher_start', ['teacher', 'startAt']),
    Index('IDX_lesson_sessions_classroom_start', ['classroom', 'startAt'])
], LessonSession);
export { LessonSession };
//# sourceMappingURL=groups.entity.js.map