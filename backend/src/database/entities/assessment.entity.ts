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
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';

@Entity('tests')
@Check(
  'CHK_tests_exactly_one_parent',
  '("course_id" IS NULL) <> ("lesson_id" IS NULL)',
)
@Check('CHK_tests_passing_score', '"passing_score" BETWEEN 0 AND 100')
@Check('CHK_tests_status', "\"status\" IN ('draft', 'published', 'archived')")
@Check(
  'CHK_tests_time_limit',
  '"time_limit_seconds" IS NULL OR "time_limit_seconds" > 0',
)
@Check(
  'CHK_tests_attempt_limit',
  '"attempt_limit" IS NULL OR "attempt_limit" > 0',
)
@Index('IDX_tests_course_status', ['course', 'status'])
@Index('IDX_tests_lesson_status', ['lesson', 'status'])
export class Test {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Course, (course) => course.tests, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Relation<Course | null>;

  @ManyToOne(() => Lesson, (lesson) => lesson.tests, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Relation<Lesson | null>;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'passing_score', type: 'smallint' })
  passingScore!: number;

  @Column({ name: 'time_limit_seconds', type: 'integer', nullable: true })
  timeLimitSeconds!: number | null;

  @Column({ name: 'attempt_limit', type: 'smallint', nullable: true })
  attemptLimit!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: 'draft' | 'published' | 'archived';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Question, (question) => question.test)
  questions!: Relation<Question[]>;

  @OneToMany(() => TestAttempt, (attempt) => attempt.test)
  attempts!: Relation<TestAttempt[]>;
}

@Entity('questions')
@Check('CHK_questions_points', '"points" > 0')
@Unique('UQ_questions_test_position', ['test', 'position'])
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Test, (test) => test.questions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test!: Relation<Test>;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'integer' })
  position!: number;

  @Column({ type: 'integer', default: 1 })
  points!: number;

  @Column({ name: 'allow_multiple_answers', type: 'boolean', default: false })
  allowMultipleAnswers!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => AnswerOption, (option) => option.question)
  options!: Relation<AnswerOption[]>;

  @OneToMany(() => StudentAnswer, (answer) => answer.question)
  studentAnswers!: Relation<StudentAnswer[]>;
}

@Entity('answer_options')
@Unique('UQ_answer_options_question_position', ['question', 'position'])
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Question, (question) => question.options, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question!: Relation<Question>;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'integer' })
  position!: number;

  // Never expose this field in a test payload returned before submission.
  @Column({
    name: 'is_correct',
    type: 'boolean',
    default: false,
    select: false,
  })
  isCorrect!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => StudentAnswerOption, (selection) => selection.answerOption)
  studentSelections!: Relation<StudentAnswerOption[]>;
}

@Entity('test_attempts')
@Check(
  'CHK_test_attempts_score_percent',
  '"score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100',
)
@Unique('UQ_test_attempts_test_user_number', ['test', 'user', 'attemptNumber'])
@Index('IDX_test_attempts_user_started', ['user', 'startedAt'])
export class TestAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Test, (test) => test.attempts, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'test_id' })
  test!: Relation<Test>;

  @ManyToOne(() => User, (user) => user.testAttempts, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @Column({ name: 'attempt_number', type: 'smallint' })
  attemptNumber!: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  @Column({ name: 'score_percent', type: 'smallint', nullable: true })
  scorePercent!: number | null;

  @Column({ type: 'boolean', nullable: true })
  passed!: boolean | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => StudentAnswer, (answer) => answer.attempt)
  answers!: Relation<StudentAnswer[]>;
}

@Entity('student_answers')
@Unique('UQ_student_answers_attempt_question', ['attempt', 'question'])
export class StudentAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TestAttempt, (attempt) => attempt.answers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'attempt_id' })
  attempt!: Relation<TestAttempt>;

  @ManyToOne(() => Question, (question) => question.studentAnswers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'question_id' })
  question!: Relation<Question>;

  @Column({ name: 'is_correct_snapshot', type: 'boolean', nullable: true })
  isCorrectSnapshot!: boolean | null;

  @Column({ name: 'awarded_points', type: 'integer', nullable: true })
  awardedPoints!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => StudentAnswerOption, (selection) => selection.studentAnswer)
  selectedOptions!: Relation<StudentAnswerOption[]>;
}

@Entity('student_answer_options')
@Unique('UQ_student_answer_options_pair', ['studentAnswer', 'answerOption'])
export class StudentAnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => StudentAnswer, (answer) => answer.selectedOptions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_answer_id' })
  studentAnswer!: Relation<StudentAnswer>;

  @ManyToOne(() => AnswerOption, (option) => option.studentSelections, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'answer_option_id' })
  answerOption!: Relation<AnswerOption>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
