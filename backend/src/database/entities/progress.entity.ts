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
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';

@Entity('lesson_progress')
@Check('CHK_lesson_progress_watched_seconds', '"watched_seconds" >= 0')
@Check(
  'CHK_lesson_progress_watched_percent',
  '"watched_percent" BETWEEN 0 AND 100',
)
@Unique('UQ_lesson_progress_user_lesson', ['user', 'lesson'])
@Index('IDX_lesson_progress_lesson', ['lesson'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.lessonProgress, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Relation<Lesson>;

  @Column({ name: 'watched_seconds', type: 'integer', default: 0 })
  watchedSeconds!: number;

  @Column({ name: 'watched_percent', type: 'smallint', default: 0 })
  watchedPercent!: number;

  @Column({ name: 'last_accessed_at', type: 'timestamptz', nullable: true })
  lastAccessedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('course_progress')
@Check(
  'CHK_course_progress_counts',
  '"lessons_completed" >= 0 AND "lessons_total" >= 0',
)
@Check('CHK_course_progress_percent', '"completion_percent" BETWEEN 0 AND 100')
@Unique('UQ_course_progress_user_course', ['user', 'course'])
@Index('IDX_course_progress_course', ['course'])
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.courseProgress, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne(() => Course, (course) => course.progress, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course>;

  @Column({ name: 'lessons_completed', type: 'integer', default: 0 })
  lessonsCompleted!: number;

  @Column({ name: 'lessons_total', type: 'integer', default: 0 })
  lessonsTotal!: number;

  @Column({ name: 'completion_percent', type: 'smallint', default: 0 })
  completionPercent!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'calculated_at', type: 'timestamptz' })
  calculatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
