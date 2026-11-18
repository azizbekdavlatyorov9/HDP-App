import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Test } from './assessment.entity.js';
import { User } from './core.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';

@Entity('categories')
@Index('UQ_categories_slug', ['slug'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 140 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt!: Date | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Relation<Category | null>;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Relation<Category[]>;

  @OneToMany(() => CourseCategory, (courseCategory) => courseCategory.category)
  courseCategories!: Relation<CourseCategory[]>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('courses')
@Check('CHK_courses_status', "\"status\" IN ('draft', 'published', 'archived')")
@Check('CHK_courses_price_minor', '"price_minor" >= 0')
@Check('CHK_courses_duration', '"duration" IS NULL OR "duration" > 0')
@Index('UQ_courses_slug', ['slug'], { unique: true })
@Index('IDX_courses_lead_teacher', ['leadTeacher'])
@Index('IDX_courses_status_created', ['status', 'createdAt'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.ledCourses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lead_teacher_id' })
  leadTeacher!: Relation<User>;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'varchar', length: 200 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'integer', nullable: true })
  duration!: number | null;

  @Column({ name: 'price_minor', type: 'bigint' })
  priceMinor!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: 'draft' | 'published' | 'archived';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CourseCategory, (courseCategory) => courseCategory.course)
  courseCategories!: Relation<CourseCategory[]>;

  @OneToMany(() => Subject, (subject) => subject.course)
  subjects!: Relation<Subject[]>;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons!: Relation<Lesson[]>;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Relation<Enrollment[]>;

  @OneToMany(() => Test, (test) => test.course)
  tests!: Relation<Test[]>;

  @OneToMany(() => CourseProgress, (progress) => progress.course)
  progress!: Relation<CourseProgress[]>;

  @OneToMany(() => Payment, (payment) => payment.course)
  payments!: Relation<Payment[]>;
}

@Entity('subjects')
@Check('CHK_subjects_status', "\"status\" IN ('active', 'archived')")
@Index('IDX_subjects_course_status_created', ['course', 'status', 'createdAt'])
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Course, (course) => course.subjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'archived';

  @OneToMany(() => Lesson, (lesson) => lesson.subject)
  lessons!: Relation<Lesson[]>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('course_categories')
@Unique('UQ_course_categories_course_category', ['course', 'category'])
@Index('IDX_course_categories_category', ['category'])
export class CourseCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Course, (course) => course.courseCategories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @ManyToOne(() => Category, (category) => category.courseCategories, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Relation<Category>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('lessons')
@Check('CHK_lessons_status', "\"status\" IN ('draft', 'published', 'archived')")
@Index('UQ_lessons_subject_position', ['subject', 'position'], {
  unique: true,
  where: '"subject_id" IS NOT NULL',
})
@Index('UQ_lessons_legacy_course_position', ['course', 'position'], {
  unique: true,
  where: '"subject_id" IS NULL',
})
@Index('IDX_lessons_course_status_position', ['course', 'status', 'position'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Course, (course) => course.lessons, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @ManyToOne(() => Subject, (subject) => subject.lessons, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'subject_id' })
  subject!: Relation<Subject | null>;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'integer' })
  position!: number;

  @Column({ name: 'video_url', type: 'text', nullable: true })
  videoUrl!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  materials!: Record<string, unknown>[] | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: 'draft' | 'published' | 'archived';

  @Column({ name: 'is_free', type: 'boolean', default: false })
  isFree!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => LessonPrerequisite, (edge) => edge.lesson)
  prerequisites!: Relation<LessonPrerequisite[]>;

  @OneToMany(() => LessonPrerequisite, (edge) => edge.prerequisiteLesson)
  requiredBy!: Relation<LessonPrerequisite[]>;

  @OneToMany(() => Video, (video) => video.lesson)
  videos!: Relation<Video[]>;

  @OneToMany(() => Test, (test) => test.lesson)
  tests!: Relation<Test[]>;

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progress!: Relation<LessonProgress[]>;
}

@Entity('lesson_prerequisites')
@Check(
  'CHK_lesson_prerequisites_not_self',
  '"lesson_id" <> "prerequisite_lesson_id"',
)
@Unique('UQ_lesson_prerequisites_pair', ['lesson', 'prerequisiteLesson'])
@Index('IDX_lesson_prerequisites_prerequisite', ['prerequisiteLesson'])
export class LessonPrerequisite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.prerequisites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Relation<Lesson>;

  @ManyToOne(() => Lesson, (lesson) => lesson.requiredBy, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'prerequisite_lesson_id' })
  prerequisiteLesson!: Relation<Lesson>;
}

@Entity('videos')
@Check(
  'CHK_videos_status',
  "\"status\" IN ('pending', 'uploading', 'processing', 'ready', 'error', 'deleted')",
)
@Unique('UQ_videos_lesson_position', ['lesson', 'position'])
@Index('UQ_videos_cloudflare_uid', ['cloudflareUid'], { unique: true })
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.videos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Relation<Lesson>;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'initiated_by_user_id' })
  initiatedBy!: Relation<User | null>;

  @Column({ name: 'cloudflare_uid', type: 'varchar', length: 100 })
  cloudflareUid!: string;

  @Column({ type: 'varchar', length: 30, default: 'cloudflare_stream' })
  provider!: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  title!: string | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'integer' })
  position!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!:
    'pending' | 'uploading' | 'processing' | 'ready' | 'error' | 'deleted';

  @Column({ name: 'duration_seconds', type: 'integer', nullable: true })
  durationSeconds!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('enrollments')
@Check(
  'CHK_enrollments_status',
  "\"status\" IN ('active', 'completed', 'revoked')",
)
@Check('CHK_enrollments_source', "\"source\" IN ('manual', 'payment', 'admin')")
@Unique('UQ_enrollments_user_course', ['user', 'course'])
@Index('IDX_enrollments_course_status', ['course', 'status'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.enrollments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'completed' | 'revoked';

  @Column({ type: 'varchar', length: 20 })
  source!: 'manual' | 'payment' | 'admin';

  @Column({ name: 'enrolled_at', type: 'timestamptz' })
  enrolledAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
