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
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';
let Test = class Test {
    id;
    course;
    lesson;
    title;
    description;
    passingScore;
    timeLimitSeconds;
    attemptLimit;
    status;
    createdAt;
    updatedAt;
    questions;
    attempts;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Test.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Course, (course) => course.tests, {
        nullable: true,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'course_id' }),
    __metadata("design:type", Object)
], Test.prototype, "course", void 0);
__decorate([
    ManyToOne(() => Lesson, (lesson) => lesson.tests, {
        nullable: true,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'lesson_id' }),
    __metadata("design:type", Object)
], Test.prototype, "lesson", void 0);
__decorate([
    Column({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], Test.prototype, "title", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Test.prototype, "description", void 0);
__decorate([
    Column({ name: 'passing_score', type: 'smallint' }),
    __metadata("design:type", Number)
], Test.prototype, "passingScore", void 0);
__decorate([
    Column({ name: 'time_limit_seconds', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Test.prototype, "timeLimitSeconds", void 0);
__decorate([
    Column({ name: 'attempt_limit', type: 'smallint', nullable: true }),
    __metadata("design:type", Object)
], Test.prototype, "attemptLimit", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'draft' }),
    __metadata("design:type", String)
], Test.prototype, "status", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Test.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Test.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => Question, (question) => question.test),
    __metadata("design:type", Object)
], Test.prototype, "questions", void 0);
__decorate([
    OneToMany(() => TestAttempt, (attempt) => attempt.test),
    __metadata("design:type", Object)
], Test.prototype, "attempts", void 0);
Test = __decorate([
    Entity('tests'),
    Check('CHK_tests_exactly_one_parent', '("course_id" IS NULL) <> ("lesson_id" IS NULL)'),
    Check('CHK_tests_passing_score', '"passing_score" BETWEEN 0 AND 100'),
    Check('CHK_tests_status', "\"status\" IN ('draft', 'published', 'archived')"),
    Check('CHK_tests_time_limit', '"time_limit_seconds" IS NULL OR "time_limit_seconds" > 0'),
    Check('CHK_tests_attempt_limit', '"attempt_limit" IS NULL OR "attempt_limit" > 0'),
    Index('IDX_tests_course_status', ['course', 'status']),
    Index('IDX_tests_lesson_status', ['lesson', 'status'])
], Test);
export { Test };
let Question = class Question {
    id;
    test;
    prompt;
    position;
    points;
    allowMultipleAnswers;
    createdAt;
    updatedAt;
    options;
    studentAnswers;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Question.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Test, (test) => test.questions, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'test_id' }),
    __metadata("design:type", Object)
], Question.prototype, "test", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Question.prototype, "prompt", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], Question.prototype, "position", void 0);
__decorate([
    Column({ type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], Question.prototype, "points", void 0);
__decorate([
    Column({ name: 'allow_multiple_answers', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Question.prototype, "allowMultipleAnswers", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Question.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Question.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => AnswerOption, (option) => option.question),
    __metadata("design:type", Object)
], Question.prototype, "options", void 0);
__decorate([
    OneToMany(() => StudentAnswer, (answer) => answer.question),
    __metadata("design:type", Object)
], Question.prototype, "studentAnswers", void 0);
Question = __decorate([
    Entity('questions'),
    Check('CHK_questions_points', '"points" > 0'),
    Unique('UQ_questions_test_position', ['test', 'position'])
], Question);
export { Question };
let AnswerOption = class AnswerOption {
    id;
    question;
    text;
    position;
    isCorrect;
    createdAt;
    studentSelections;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AnswerOption.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Question, (question) => question.options, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'question_id' }),
    __metadata("design:type", Object)
], AnswerOption.prototype, "question", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], AnswerOption.prototype, "text", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], AnswerOption.prototype, "position", void 0);
__decorate([
    Column({
        name: 'is_correct',
        type: 'boolean',
        default: false,
        select: false,
    }),
    __metadata("design:type", Boolean)
], AnswerOption.prototype, "isCorrect", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AnswerOption.prototype, "createdAt", void 0);
__decorate([
    OneToMany(() => StudentAnswerOption, (selection) => selection.answerOption),
    __metadata("design:type", Object)
], AnswerOption.prototype, "studentSelections", void 0);
AnswerOption = __decorate([
    Entity('answer_options'),
    Unique('UQ_answer_options_question_position', ['question', 'position'])
], AnswerOption);
export { AnswerOption };
let TestAttempt = class TestAttempt {
    id;
    test;
    user;
    attemptNumber;
    startedAt;
    submittedAt;
    scorePercent;
    passed;
    createdAt;
    answers;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TestAttempt.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Test, (test) => test.attempts, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'test_id' }),
    __metadata("design:type", Object)
], TestAttempt.prototype, "test", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.testAttempts, { nullable: false, onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], TestAttempt.prototype, "user", void 0);
__decorate([
    Column({ name: 'attempt_number', type: 'smallint' }),
    __metadata("design:type", Number)
], TestAttempt.prototype, "attemptNumber", void 0);
__decorate([
    Column({ name: 'started_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TestAttempt.prototype, "startedAt", void 0);
__decorate([
    Column({ name: 'submitted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TestAttempt.prototype, "submittedAt", void 0);
__decorate([
    Column({ name: 'score_percent', type: 'smallint', nullable: true }),
    __metadata("design:type", Object)
], TestAttempt.prototype, "scorePercent", void 0);
__decorate([
    Column({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], TestAttempt.prototype, "passed", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TestAttempt.prototype, "createdAt", void 0);
__decorate([
    OneToMany(() => StudentAnswer, (answer) => answer.attempt),
    __metadata("design:type", Object)
], TestAttempt.prototype, "answers", void 0);
TestAttempt = __decorate([
    Entity('test_attempts'),
    Check('CHK_test_attempts_score_percent', '"score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100'),
    Unique('UQ_test_attempts_test_user_number', ['test', 'user', 'attemptNumber']),
    Index('IDX_test_attempts_user_started', ['user', 'startedAt'])
], TestAttempt);
export { TestAttempt };
let StudentAnswer = class StudentAnswer {
    id;
    attempt;
    question;
    isCorrectSnapshot;
    awardedPoints;
    createdAt;
    selectedOptions;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], StudentAnswer.prototype, "id", void 0);
__decorate([
    ManyToOne(() => TestAttempt, (attempt) => attempt.answers, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'attempt_id' }),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "attempt", void 0);
__decorate([
    ManyToOne(() => Question, (question) => question.studentAnswers, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'question_id' }),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "question", void 0);
__decorate([
    Column({ name: 'is_correct_snapshot', type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "isCorrectSnapshot", void 0);
__decorate([
    Column({ name: 'awarded_points', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "awardedPoints", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], StudentAnswer.prototype, "createdAt", void 0);
__decorate([
    OneToMany(() => StudentAnswerOption, (selection) => selection.studentAnswer),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "selectedOptions", void 0);
StudentAnswer = __decorate([
    Entity('student_answers'),
    Unique('UQ_student_answers_attempt_question', ['attempt', 'question'])
], StudentAnswer);
export { StudentAnswer };
let StudentAnswerOption = class StudentAnswerOption {
    id;
    studentAnswer;
    answerOption;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], StudentAnswerOption.prototype, "id", void 0);
__decorate([
    ManyToOne(() => StudentAnswer, (answer) => answer.selectedOptions, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'student_answer_id' }),
    __metadata("design:type", Object)
], StudentAnswerOption.prototype, "studentAnswer", void 0);
__decorate([
    ManyToOne(() => AnswerOption, (option) => option.studentSelections, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    JoinColumn({ name: 'answer_option_id' }),
    __metadata("design:type", Object)
], StudentAnswerOption.prototype, "answerOption", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], StudentAnswerOption.prototype, "createdAt", void 0);
StudentAnswerOption = __decorate([
    Entity('student_answer_options'),
    Unique('UQ_student_answer_options_pair', ['studentAnswer', 'answerOption'])
], StudentAnswerOption);
export { StudentAnswerOption };
//# sourceMappingURL=assessment.entity.js.map