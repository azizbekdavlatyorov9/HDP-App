var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { Test } from './assessment.entity.js';
import { User } from './core.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';
let Category = class Category {
    id;
    name;
    slug;
    description;
    archivedAt;
    parent;
    children;
    courseCategories;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Category.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', length: 140 }),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Category.prototype, "description", void 0);
__decorate([
    Column({ name: 'archived_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Category.prototype, "archivedAt", void 0);
__decorate([
    ManyToOne(() => Category, (category) => category.children, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    JoinColumn({ name: 'parent_id' }),
    __metadata("design:type", Object)
], Category.prototype, "parent", void 0);
__decorate([
    OneToMany(() => Category, (category) => category.parent),
    __metadata("design:type", Object)
], Category.prototype, "children", void 0);
__decorate([
    OneToMany(() => CourseCategory, (courseCategory) => courseCategory.category),
    __metadata("design:type", Object)
], Category.prototype, "courseCategories", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Category.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Category.prototype, "updatedAt", void 0);
Category = __decorate([
    Entity('categories'),
    Index('UQ_categories_slug', ['slug'], { unique: true })
], Category);
export { Category };
let Course = class Course {
    id;
    leadTeacher;
    title;
    slug;
    description;
    thumbnailUrl;
    duration;
    priceMinor;
    currency;
    status;
    createdAt;
    updatedAt;
    courseCategories;
    subjects;
    lessons;
    enrollments;
    tests;
    progress;
    payments;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.ledCourses, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'lead_teacher_id' }),
    __metadata("design:type", Object)
], Course.prototype, "leadTeacher", void 0);
__decorate([
    Column({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    Column({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "description", void 0);
__decorate([
    Column({ name: 'thumbnail_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "thumbnailUrl", void 0);
__decorate([
    Column({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "duration", void 0);
__decorate([
    Column({ name: 'price_minor', type: 'bigint' }),
    __metadata("design:type", String)
], Course.prototype, "priceMinor", void 0);
__decorate([
    Column({ type: 'char', length: 3 }),
    __metadata("design:type", String)
], Course.prototype, "currency", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'draft' }),
    __metadata("design:type", String)
], Course.prototype, "status", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => CourseCategory, (courseCategory) => courseCategory.course),
    __metadata("design:type", Object)
], Course.prototype, "courseCategories", void 0);
__decorate([
    OneToMany(() => Subject, (subject) => subject.course),
    __metadata("design:type", Object)
], Course.prototype, "subjects", void 0);
__decorate([
    OneToMany(() => Lesson, (lesson) => lesson.course),
    __metadata("design:type", Object)
], Course.prototype, "lessons", void 0);
__decorate([
    OneToMany(() => Enrollment, (enrollment) => enrollment.course),
    __metadata("design:type", Object)
], Course.prototype, "enrollments", void 0);
__decorate([
    OneToMany(() => Test, (test) => test.course),
    __metadata("design:type", Object)
], Course.prototype, "tests", void 0);
__decorate([
    OneToMany(() => CourseProgress, (progress) => progress.course),
    __metadata("design:type", Object)
], Course.prototype, "progress", void 0);
__decorate([
    OneToMany(() => Payment, (payment) => payment.course),
    __metadata("design:type", Object)
], Course.prototype, "payments", void 0);
Course = __decorate([
    Entity('courses'),
    Check('CHK_courses_status', "\"status\" IN ('draft', 'published', 'archived')"),
    Check('CHK_courses_price_minor', '"price_minor" >= 0'),
    Check('CHK_courses_duration', '"duration" IS NULL OR "duration" > 0'),
    Index('UQ_courses_slug', ['slug'], { unique: true }),
    Index('IDX_courses_lead_teacher', ['leadTeacher']),
    Index('IDX_courses_status_created', ['status', 'createdAt'])
], Course);
export { Course };
let Subject = class Subject {
    id;
    course;
    title;
    description;
    status;
    lessons;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Subject.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.subjects, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Subject.prototype, "course", void 0);
__decorate([
    Column({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], Subject.prototype, "title", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Subject.prototype, "description", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], Subject.prototype, "status", void 0);
__decorate([
    OneToMany(() => Lesson, (lesson) => lesson.subject),
    __metadata("design:type", Object)
], Subject.prototype, "lessons", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Subject.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Subject.prototype, "updatedAt", void 0);
Subject = __decorate([
    Entity('subjects'),
    Check('CHK_subjects_status', "\"status\" IN ('active', 'archived')"),
    Index('IDX_subjects_course_status_created', ['course', 'status', 'createdAt'])
], Subject);
export { Subject };
let CourseCategory = class CourseCategory {
    id;
    course;
    category;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CourseCategory.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.courseCategories, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], CourseCategory.prototype, "course", void 0);
__decorate([
    ManyToOne(() => Category, (category) => category.courseCategories, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'category_id' }),
    __metadata("design:type", Object)
], CourseCategory.prototype, "category", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CourseCategory.prototype, "createdAt", void 0);
CourseCategory = __decorate([
    Entity('course_categories'),
    Unique('UQ_course_categories_course_category', ['course', 'category']),
    Index('IDX_course_categories_category', ['category'])
], CourseCategory);
export { CourseCategory };
let Lesson = class Lesson {
    id;
    course;
    subject;
    title;
    description;
    position;
    videoUrl;
    materials;
    status;
    isFree;
    createdAt;
    updatedAt;
    prerequisites;
    requiredBy;
    videos;
    tests;
    progress;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Lesson.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.lessons, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Lesson.prototype, "course", void 0);
__decorate([
    ManyToOne(() => Subject, (subject) => subject.lessons, {
        nullable: true,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'subject_id' }),
    __metadata("design:type", Object)
], Lesson.prototype, "subject", void 0);
__decorate([
    Column({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], Lesson.prototype, "title", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Lesson.prototype, "description", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Lesson.prototype, "position", void 0);
__decorate([
    Column({ name: 'video_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Lesson.prototype, "videoUrl", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Lesson.prototype, "materials", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'draft' }),
    __metadata("design:type", String)
], Lesson.prototype, "status", void 0);
__decorate([
    Column({ name: 'is_free', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lesson.prototype, "isFree", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Lesson.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Lesson.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => LessonPrerequisite, (edge) => edge.lesson),
    __metadata("design:type", Object)
], Lesson.prototype, "prerequisites", void 0);
__decorate([
    OneToMany(() => LessonPrerequisite, (edge) => edge.prerequisiteLesson),
    __metadata("design:type", Object)
], Lesson.prototype, "requiredBy", void 0);
__decorate([
    OneToMany(() => Video, (video) => video.lesson),
    __metadata("design:type", Object)
], Lesson.prototype, "videos", void 0);
__decorate([
    OneToMany(() => Test, (test) => test.lesson),
    __metadata("design:type", Object)
], Lesson.prototype, "tests", void 0);
__decorate([
    OneToMany(() => LessonProgress, (progress) => progress.lesson),
    __metadata("design:type", Object)
], Lesson.prototype, "progress", void 0);
Lesson = __decorate([
    Entity('lessons'),
    Check('CHK_lessons_status', "\"status\" IN ('draft', 'published', 'archived')"),
    Index('UQ_lessons_subject_position', ['subject', 'position'], {
        unique: true,
        where: '"subject_id" IS NOT NULL',
    }),
    Index('UQ_lessons_legacy_course_position', ['course', 'position'], {
        unique: true,
        where: '"subject_id" IS NULL',
    }),
    Index('IDX_lessons_course_status_position', ['course', 'status', 'position'])
], Lesson);
export { Lesson };
let LessonPrerequisite = class LessonPrerequisite {
    id;
    lesson;
    prerequisiteLesson;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], LessonPrerequisite.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Lesson, (lesson) => lesson.prerequisites, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'lesson_id' }),
    __metadata("design:type", Object)
], LessonPrerequisite.prototype, "lesson", void 0);
__decorate([
    ManyToOne(() => Lesson, (lesson) => lesson.requiredBy, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'prerequisite_lesson_id' }),
    __metadata("design:type", Object)
], LessonPrerequisite.prototype, "prerequisiteLesson", void 0);
LessonPrerequisite = __decorate([
    Entity('lesson_prerequisites'),
    Check('CHK_lesson_prerequisites_not_self', '"lesson_id" <> "prerequisite_lesson_id"'),
    Unique('UQ_lesson_prerequisites_pair', ['lesson', 'prerequisiteLesson']),
    Index('IDX_lesson_prerequisites_prerequisite', ['prerequisiteLesson'])
], LessonPrerequisite);
export { LessonPrerequisite };
let Video = class Video {
    id;
    lesson;
    initiatedBy;
    cloudflareUid;
    provider;
    title;
    thumbnailUrl;
    position;
    status;
    durationSeconds;
    metadata;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Video.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Lesson, (lesson) => lesson.videos, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'lesson_id' }),
    __metadata("design:type", Object)
], Video.prototype, "lesson", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'initiated_by_user_id' }),
    __metadata("design:type", Object)
], Video.prototype, "initiatedBy", void 0);
__decorate([
    Column({ name: 'cloudflare_uid', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Video.prototype, "cloudflareUid", void 0);
__decorate([
    Column({ type: 'varchar', length: 30, default: 'cloudflare_stream' }),
    __metadata("design:type", String)
], Video.prototype, "provider", void 0);
__decorate([
    Column({ type: 'varchar', length: 180, nullable: true }),
    __metadata("design:type", Object)
], Video.prototype, "title", void 0);
__decorate([
    Column({ name: 'thumbnail_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Video.prototype, "thumbnailUrl", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Video.prototype, "position", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], Video.prototype, "status", void 0);
__decorate([
    Column({ name: 'duration_seconds', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Video.prototype, "durationSeconds", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Video.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Video.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Video.prototype, "updatedAt", void 0);
Video = __decorate([
    Entity('videos'),
    Check('CHK_videos_status', "\"status\" IN ('pending', 'uploading', 'processing', 'ready', 'error', 'deleted')"),
    Unique('UQ_videos_lesson_position', ['lesson', 'position']),
    Index('UQ_videos_cloudflare_uid', ['cloudflareUid'], { unique: true })
], Video);
export { Video };
let Enrollment = class Enrollment {
    id;
    user;
    course;
    status;
    source;
    enrolledAt;
    expiresAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Enrollment.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.enrollments, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], Enrollment.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.enrollments, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Enrollment.prototype, "course", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Enrollment.prototype, "source", void 0);
__decorate([
    Column({ name: 'enrolled_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Enrollment.prototype, "enrolledAt", void 0);
__decorate([
    Column({ name: 'expires_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Enrollment.prototype, "expiresAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Enrollment.prototype, "createdAt", void 0);
Enrollment = __decorate([
    Entity('enrollments'),
    Check('CHK_enrollments_status', "\"status\" IN ('active', 'completed', 'revoked')"),
    Check('CHK_enrollments_source', "\"source\" IN ('manual', 'payment', 'admin')"),
    Unique('UQ_enrollments_user_course', ['user', 'course']),
    Index('IDX_enrollments_course_status', ['course', 'status'])
], Enrollment);
export { Enrollment };
//# sourceMappingURL=education.entity.js.map