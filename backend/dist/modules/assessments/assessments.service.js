var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AnswerOption, Enrollment, Lesson, NotificationType, Question, StudentAnswer, StudentAnswerOption, Test, TestAttempt } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { enforceAttemptLimit, validateAndScoreQuestion } from './grading.js';
let AssessmentsService = class AssessmentsService {
    tests;
    questions;
    options;
    attempts;
    enrollments;
    db;
    access;
    notifications;
    constructor(tests, questions, options, attempts, enrollments, db, access, notifications) {
        this.tests = tests;
        this.questions = questions;
        this.options = options;
        this.attempts = attempts;
        this.enrollments = enrollments;
        this.db = db;
        this.access = access;
        this.notifications = notifications;
    }
    async create(dto, u) { if (Boolean(dto.courseId) === Boolean(dto.lessonId))
        throw new BadRequestException('Specify exactly one courseId or lessonId'); if (!this.access.isAdmin(u) && !u.roles.includes('TEACHER'))
        throw new ForbiddenException(); let course = null; let lesson = null; if (dto.courseId)
        course = await this.access.canManageCourse(dto.courseId, u);
    else {
        lesson = await this.questions.manager.getRepository(Lesson).findOne({ where: { id: dto.lessonId }, relations: { course: true } });
        if (!lesson)
            throw new NotFoundException();
        await this.access.canManageCourse(lesson.course.id, u);
    } const test = await this.tests.save(this.tests.create({ course, lesson, title: dto.title, description: dto.description ?? null, passingScore: dto.passingScore, timeLimitSeconds: dto.timeLimitSeconds ?? null, attemptLimit: dto.attemptLimit ?? null, status: 'draft' })); for (let i = 0; i < dto.questions.length; i++) {
        const q = dto.questions[i];
        if (!q.options.some(o => o.isCorrect) || (!q.allowMultipleAnswers && q.options.filter(o => o.isCorrect).length !== 1))
            throw new BadRequestException('Each question must have valid correct options');
        const saved = await this.questions.save(this.questions.create({ test, prompt: q.prompt, position: i + 1, points: q.points, allowMultipleAnswers: q.allowMultipleAnswers }));
        await this.options.save(q.options.map((o, j) => this.options.create({ question: saved, text: o.text, position: j + 1, isCorrect: o.isCorrect })));
    } return { id: test.id, status: test.status }; }
    async publish(id, u) { const t = await this.tests.findOne({ where: { id }, relations: { course: { leadTeacher: true }, lesson: { course: { leadTeacher: true } }, questions: { options: true } } }); if (!t)
        throw new NotFoundException(); const c = t.course ?? t.lesson?.course; if (!c)
        throw new NotFoundException(); await this.access.canManageCourse(c.id, u); if (!t.questions.length)
        throw new BadRequestException('Test must contain questions'); const newlyPublished = t.status !== 'published'; t.status = 'published'; const saved = await this.tests.save(t); if (newlyPublished) {
        const rows = await this.enrollments.find({ where: { course: { id: c.id }, status: 'active' }, relations: { user: true }, select: { user: { id: true } } });
        await this.notifications.createAndDeliverMany(rows.map((x) => x.user.id), { type: NotificationType.TEST_AVAILABLE, title: 'Test available', body: t.title, relatedEntityId: t.id, eventKey: `test-published:${t.id}` });
    } return saved; }
    async get(id, u) { const t = await this.tests.findOne({ where: { id, status: 'published' }, relations: { course: true, lesson: { course: true }, questions: { options: true } } }); if (!t)
        throw new NotFoundException(); if (t.lesson)
        await this.access.canAccessLesson(t.lesson.id, u);
    else if (t.course) {
        if (!this.access.isAdmin(u)) {
            const enrollment = await this.enrollments.findOne({ where: { user: { id: u.id }, course: { id: t.course.id }, status: 'active' } });
            if (!enrollment || (enrollment.expiresAt && enrollment.expiresAt < new Date()))
                throw new ForbiddenException();
        }
    } return { id: t.id, title: t.title, description: t.description, passingScore: t.passingScore, timeLimitSeconds: t.timeLimitSeconds, questions: t.questions.sort((a, b) => a.position - b.position).map(q => ({ id: q.id, prompt: q.prompt, position: q.position, points: q.points, allowMultipleAnswers: q.allowMultipleAnswers, options: q.options.sort((a, b) => a.position - b.position).map(o => ({ id: o.id, text: o.text, position: o.position })) })) }; }
    async start(id, u) { await this.get(id, u); return this.db.transaction(async (manager) => { await manager.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [u.id, id]); const repo = manager.getRepository(TestAttempt); const test = await manager.getRepository(Test).findOneByOrFail({ id }); const previous = await repo.find({ where: { test: { id }, user: { id: u.id } }, order: { attemptNumber: 'DESC' } }); enforceAttemptLimit(test.attemptLimit, previous.length); const attempt = repo.create({ test, user: { id: u.id }, attemptNumber: (previous[0]?.attemptNumber ?? 0) + 1, startedAt: new Date(), submittedAt: null, scorePercent: null, passed: null }); return repo.save(attempt); }); }
    async submit(attemptId, dto, u) { const result = await this.db.transaction(async (m) => { const ar = m.getRepository(TestAttempt); const a = await ar.findOne({ where: { id: attemptId, user: { id: u.id } }, relations: { test: true }, lock: { mode: 'pessimistic_write' } }); if (!a)
        throw new NotFoundException(); if (a.submittedAt)
        throw new BadRequestException('Attempt already submitted'); if (a.test.timeLimitSeconds && Date.now() > a.startedAt.getTime() + a.test.timeLimitSeconds * 1000)
        throw new BadRequestException('Attempt time limit exceeded'); const qs = await m.getRepository(Question).find({ where: { test: { id: a.test.id } }, relations: { options: true } }); const byId = new Map(qs.map(q => [q.id, q])); if (new Set(dto.answers.map(x => x.questionId)).size !== dto.answers.length || dto.answers.some(x => !byId.has(x.questionId)))
        throw new BadRequestException('Answer contains a question outside this test'); let maxPoints = 0, earned = 0; for (const q of qs) {
        maxPoints += q.points;
        const submitted = dto.answers.find(x => x.questionId === q.id);
        const selected = submitted?.optionIds ?? [];
        const correct = await m.getRepository(AnswerOption).createQueryBuilder('o').addSelect('o.isCorrect').where('o.question_id=:qid', { qid: q.id }).andWhere('o.is_correct=true').getMany();
        const ok = validateAndScoreQuestion(selected, q.options.map(o => o.id), correct.map(o => o.id), q.allowMultipleAnswers);
        const ans = await m.getRepository(StudentAnswer).save(m.getRepository(StudentAnswer).create({ attempt: a, question: q, isCorrectSnapshot: ok, awardedPoints: ok ? q.points : 0 }));
        if (selected.length)
            await m.getRepository(StudentAnswerOption).save(selected.map(optionId => m.getRepository(StudentAnswerOption).create({ studentAnswer: ans, answerOption: { id: optionId } })));
        if (ok)
            earned += q.points;
    } a.scorePercent = maxPoints ? Math.round(earned / maxPoints * 100) : 0; a.passed = a.scorePercent >= a.test.passingScore; a.submittedAt = new Date(); await ar.save(a); return { id: a.id, scorePercent: a.scorePercent, passed: a.passed, submittedAt: a.submittedAt }; }); await this.notifications.createAndDeliver(u.id, { type: NotificationType.TEST_RESULT, title: 'Test result available', body: `${result.scorePercent}%`, relatedEntityId: attemptId, eventKey: `test-result:${attemptId}` }); return result; }
    async history(u) { return this.attempts.createQueryBuilder('attempt').leftJoinAndSelect('attempt.test', 'test').leftJoinAndSelect('attempt.answers', 'answers').leftJoinAndSelect('answers.question', 'question').leftJoinAndSelect('answers.selectedOptions', 'selections').leftJoinAndSelect('selections.answerOption', 'option').where('attempt.user_id=:userId AND attempt.submitted_at IS NOT NULL', { userId: u.id }).orderBy('attempt.started_at', 'DESC').getMany(); }
};
AssessmentsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Test)),
    __param(1, InjectRepository(Question)),
    __param(2, InjectRepository(AnswerOption)),
    __param(3, InjectRepository(TestAttempt)),
    __param(4, InjectRepository(Enrollment)),
    __metadata("design:paramtypes", [Repository, Repository, Repository, Repository, Repository, DataSource, LearningAccessService, NotificationsService])
], AssessmentsService);
export { AssessmentsService };
//# sourceMappingURL=assessments.service.js.map