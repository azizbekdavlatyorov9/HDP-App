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
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';
let LessonProgress = class LessonProgress {
    id;
    user;
    lesson;
    watchedSeconds;
    watchedPercent;
    lastAccessedAt;
    completedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], LessonProgress.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.lessonProgress, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], LessonProgress.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Lesson, (lesson) => lesson.progress, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'lesson_id' }),
    __metadata("design:type", Object)
], LessonProgress.prototype, "lesson", void 0);
__decorate([
    Column({ name: 'watched_seconds', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], LessonProgress.prototype, "watchedSeconds", void 0);
__decorate([
    Column({ name: 'watched_percent', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], LessonProgress.prototype, "watchedPercent", void 0);
__decorate([
    Column({ name: 'last_accessed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LessonProgress.prototype, "lastAccessedAt", void 0);
__decorate([
    Column({ name: 'completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LessonProgress.prototype, "completedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonProgress.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LessonProgress.prototype, "updatedAt", void 0);
LessonProgress = __decorate([
    Entity('lesson_progress'),
    Check('CHK_lesson_progress_watched_seconds', '"watched_seconds" >= 0'),
    Check('CHK_lesson_progress_watched_percent', '"watched_percent" BETWEEN 0 AND 100'),
    Unique('UQ_lesson_progress_user_lesson', ['user', 'lesson']),
    Index('IDX_lesson_progress_lesson', ['lesson'])
], LessonProgress);
export { LessonProgress };
let CourseProgress = class CourseProgress {
    id;
    user;
    course;
    lessonsCompleted;
    lessonsTotal;
    completionPercent;
    completedAt;
    calculatedAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CourseProgress.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.courseProgress, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], CourseProgress.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.progress, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], CourseProgress.prototype, "course", void 0);
__decorate([
    Column({ name: 'lessons_completed', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], CourseProgress.prototype, "lessonsCompleted", void 0);
__decorate([
    Column({ name: 'lessons_total', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], CourseProgress.prototype, "lessonsTotal", void 0);
__decorate([
    Column({ name: 'completion_percent', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], CourseProgress.prototype, "completionPercent", void 0);
__decorate([
    Column({ name: 'completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CourseProgress.prototype, "completedAt", void 0);
__decorate([
    Column({ name: 'calculated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CourseProgress.prototype, "calculatedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CourseProgress.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CourseProgress.prototype, "updatedAt", void 0);
CourseProgress = __decorate([
    Entity('course_progress'),
    Check('CHK_course_progress_counts', '"lessons_completed" >= 0 AND "lessons_total" >= 0'),
    Check('CHK_course_progress_percent', '"completion_percent" BETWEEN 0 AND 100'),
    Unique('UQ_course_progress_user_course', ['user', 'course']),
    Index('IDX_course_progress_course', ['course'])
], CourseProgress);
export { CourseProgress };
//# sourceMappingURL=progress.entity.js.map