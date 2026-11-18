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
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { Assignment, AssignmentAttachment, AssignmentSubmission, AssignmentSubmissionAttachment, AssignmentSubmissionRevision, AssignmentSubmissionReview, AuditLog, Course, GroupStudent, Lesson, NotificationType, StudyGroup, User, UserRole } from '../../database/entities/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ALLOWED_ASSIGNMENT_MIME_TYPES, ASSIGNMENT_STORAGE, MAX_ASSIGNMENT_ATTACHMENTS, MAX_ASSIGNMENT_FILE_BYTES, MAX_SUBMISSION_ATTACHMENTS, validateRequestedFile } from './assignment-storage.provider.js';
import { assignmentCanBePublished, assertResubmissionAllowed, classifySubmission, validateGradeScore } from './assignments.policy.js';
let AssignmentsService = class AssignmentsService {
    assignments;
    assignmentAttachments;
    submissions;
    revisions;
    submissionAttachments;
    reviews;
    courses;
    lessons;
    groups;
    memberships;
    userRoles;
    users;
    db;
    notifications;
    storage;
    constructor(assignments, assignmentAttachments, submissions, revisions, submissionAttachments, reviews, courses, lessons, groups, memberships, userRoles, users, db, notifications, storage) {
        this.assignments = assignments;
        this.assignmentAttachments = assignmentAttachments;
        this.submissions = submissions;
        this.revisions = revisions;
        this.submissionAttachments = submissionAttachments;
        this.reviews = reviews;
        this.courses = courses;
        this.lessons = lessons;
        this.groups = groups;
        this.memberships = memberships;
        this.userRoles = userRoles;
        this.users = users;
        this.db = db;
        this.notifications = notifications;
        this.storage = storage;
    }
    admin(u) { return u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN'); }
    async requireTeacher(u) { if (this.admin(u))
        return; if (!u.roles.includes('TEACHER') || !await this.users.exists({ where: { id: u.id, status: 'active' } }) || !await this.userRoles.exists({ where: { user: { id: u.id }, role: { code: 'TEACHER' } } }))
        throw new ForbiddenException('An active teacher role is required'); }
    async group(id, manager) { const row = await (manager?.getRepository(StudyGroup) ?? this.groups).findOne({ where: { id }, relations: { course: true, leadTeacher: true } }); if (!row)
        throw new BadRequestException('Group not found'); return row; }
    async canManage(a, u) { if (this.admin(u))
        return; await this.requireTeacher(u); if (a.group.leadTeacher.id !== u.id && a.createdBy.id !== u.id)
        throw new ForbiddenException('You cannot manage this assignment'); }
    async assignment(id, manager) { const row = await (manager?.getRepository(Assignment) ?? this.assignments).findOne({ where: { id }, relations: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true } }); if (!row)
        throw new NotFoundException('Assignment not found'); return row; }
    async studentMembership(groupId, studentId, manager) { const row = await (manager?.getRepository(GroupStudent) ?? this.memberships).findOne({ where: { group: { id: groupId }, student: { id: studentId }, status: 'ACTIVE' }, relations: { student: true, group: true } }); if (!row)
        throw new ForbiddenException('An active membership in this assignment group is required'); return row; }
    view(a, attachments = [], extras = {}) { return { id: a.id, title: a.title, description: a.description, instructions: a.instructions, course: { id: a.course.id, title: a.course.title }, lesson: a.lesson ? { id: a.lesson.id, title: a.lesson.title } : null, group: { id: a.group.id, name: a.group.name, code: a.group.code }, createdBy: { id: a.createdBy.id, displayName: a.createdBy.displayName }, maxScore: a.maxScore, dueAt: a.dueAt, status: a.status, allowLateSubmission: a.allowLateSubmission, allowResubmission: a.allowResubmission, allowResubmissionAfterGraded: a.allowResubmissionAfterGraded, publishedAt: a.publishedAt, attachments: attachments.map(x => ({ id: x.id, fileName: x.fileName, mimeType: x.mimeType, fileSize: x.fileSize, createdAt: x.createdAt })), createdAt: a.createdAt, updatedAt: a.updatedAt, ...extras }; }
    validateDue(value) { if (value === undefined || value === null)
        return; const d = new Date(value); if (!Number.isFinite(d.getTime()))
        throw new BadRequestException('dueAt must be a valid timestamp'); }
    async validateRelations(courseId, groupId, lessonId, manager) { const repos = manager; const course = await (repos?.getRepository(Course) ?? this.courses).findOne({ where: { id: courseId } }); if (!course)
        throw new BadRequestException('Course not found'); const group = await this.group(groupId, manager); if (group.course.id !== course.id)
        throw new BadRequestException('Assignment group must belong to the selected course'); let lesson = null; if (lessonId) {
        lesson = await (repos?.getRepository(Lesson) ?? this.lessons).findOne({ where: { id: lessonId }, relations: { course: true } });
        if (!lesson)
            throw new BadRequestException('Lesson not found');
        if (lesson.course.id !== course.id)
            throw new BadRequestException('Assignment lesson must belong to the selected course');
    } return { course, group, lesson }; }
    async auditAssignment(m, a, actor, before) { await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_UPDATED', resourceType: 'assignment', resourceId: a.id, actor: { id: actor.id }, beforeState: before, afterState: { title: a.title, description: a.description, instructions: a.instructions, courseId: a.course.id, lessonId: a.lesson?.id ?? null, groupId: a.group.id, maxScore: a.maxScore, dueAt: a.dueAt, allowLateSubmission: a.allowLateSubmission, allowResubmission: a.allowResubmission, allowResubmissionAfterGraded: a.allowResubmissionAfterGraded } })); }
    async create(dto, u) { await this.requireTeacher(u); this.validateDue(dto.dueAt); const { course, group, lesson } = await this.validateRelations(dto.courseId, dto.groupId, dto.lessonId); if (!this.admin(u) && group.leadTeacher.id !== u.id)
        throw new ForbiddenException('Only the assigned group teacher can create assignments'); const row = await this.assignments.save(this.assignments.create({ title: dto.title.trim(), description: dto.description.trim(), instructions: dto.instructions?.trim() ?? null, course, lesson, group, createdBy: { id: u.id }, maxScore: Number(dto.maxScore).toFixed(2), dueAt: dto.dueAt ? new Date(dto.dueAt) : null, status: 'DRAFT', allowLateSubmission: dto.allowLateSubmission ?? false, allowResubmission: dto.allowResubmission ?? true, allowResubmissionAfterGraded: dto.allowResubmissionAfterGraded ?? false, publishedAt: null })); return this.view(await this.assignment(row.id)); }
    async managerListQuery(q, u) { const qb = this.assignments.createQueryBuilder('a').leftJoinAndSelect('a.course', 'course').leftJoinAndSelect('a.lesson', 'lesson').leftJoinAndSelect('a.group', 'group').leftJoinAndSelect('group.leadTeacher', 'leadTeacher').leftJoinAndSelect('a.createdBy', 'createdBy'); if (q.groupId)
        qb.andWhere('a.group_id=:groupId', { groupId: q.groupId }); if (q.courseId)
        qb.andWhere('a.course_id=:courseId', { courseId: q.courseId }); if (q.status)
        qb.andWhere('a.status=:status', { status: q.status }); if (q.deadline === 'upcoming')
        qb.andWhere('a.due_at >= now()'); if (q.deadline === 'overdue')
        qb.andWhere('a.due_at < now()'); if (q.deadline === 'no_deadline')
        qb.andWhere('a.due_at IS NULL'); if (u && !this.admin(u))
        qb.andWhere('(a.created_by_teacher_id=:uid OR group.lead_teacher_id=:uid)', { uid: u.id }); return qb; }
    async teacherList(q, u) { await this.requireTeacher(u); return this.paginateAssignments(await this.managerListQuery(q, u), q); }
    async adminList(q, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.paginateAssignments(await this.managerListQuery(q), q); }
    async paginateAssignments(qb, q) { const [rows, total] = await qb.orderBy('a.updated_at', 'DESC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); return { data: await Promise.all(rows.map(async (a) => this.view(a, await this.assignmentAttachments.find({ where: { assignment: { id: a.id } }, order: { createdAt: 'ASC' } })))), pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async teacherGet(id, u) { const a = await this.assignment(id); await this.canManage(a, u); const [attachments, counts] = await Promise.all([this.assignmentAttachments.find({ where: { assignment: { id } }, order: { createdAt: 'ASC' } }), this.submissions.createQueryBuilder('s').select('s.status', 'status').addSelect('COUNT(*)', 'count').where('s.assignment_id=:id', { id }).groupBy('s.status').getRawMany()]); return this.view(a, attachments, { submissionSummary: counts.reduce((o, r) => ({ ...o, [r.status]: Number(r.count) }), {}) }); }
    async studentList(q, u) { const qb = this.assignments.createQueryBuilder('a').leftJoinAndSelect('a.course', 'course').leftJoinAndSelect('a.lesson', 'lesson').leftJoinAndSelect('a.group', 'group').leftJoinAndSelect('a.createdBy', 'createdBy').leftJoin('group_students', 'membership', 'membership.group_id=a.group_id AND membership.student_id=:studentId AND membership.status=:active', { studentId: u.id, active: 'ACTIVE' }).leftJoin('assignment_submissions', 'submission', 'submission.assignment_id=a.id AND submission.student_id=:studentId', { studentId: u.id }).where("a.status='PUBLISHED'").andWhere('membership.id IS NOT NULL'); if (q.groupId)
        qb.andWhere('a.group_id=:groupId', { groupId: q.groupId }); if (q.courseId)
        qb.andWhere('a.course_id=:courseId', { courseId: q.courseId }); if (q.submissionStatus === 'NOT_SUBMITTED')
        qb.andWhere('submission.id IS NULL');
    else if (q.submissionStatus)
        qb.andWhere('submission.status=:submissionStatus', { submissionStatus: q.submissionStatus }); if (q.deadline === 'upcoming')
        qb.andWhere('a.due_at>=now()'); if (q.deadline === 'overdue')
        qb.andWhere('a.due_at<now()'); if (q.deadline === 'no_deadline')
        qb.andWhere('a.due_at IS NULL'); const [rows, total] = await qb.orderBy('a.due_at', 'ASC', 'NULLS LAST').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); const data = await Promise.all(rows.map(async (a) => { const sub = await this.submissions.findOne({ where: { assignment: { id: a.id }, student: { id: u.id } } }); return this.view(a, await this.assignmentAttachments.find({ where: { assignment: { id: a.id } } }), { mySubmission: sub ? { id: sub.id, status: sub.status, submittedAt: sub.submittedAt, isLate: sub.isLate, score: sub.status === 'GRADED' ? await this.latestScore(sub.id) : null } : null }); })); return { data, pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async studentGet(id, u) { const a = await this.assignment(id); if (a.status !== 'PUBLISHED')
        throw new NotFoundException('Assignment not found'); await this.studentMembership(a.group.id, u.id); const [atts, sub] = await Promise.all([this.assignmentAttachments.find({ where: { assignment: { id } }, order: { createdAt: 'ASC' } }), this.submissions.findOne({ where: { assignment: { id }, student: { id: u.id } }, relations: { assignment: true, student: true } })]); return this.view(a, atts, { mySubmission: sub ? await this.submissionDetails(sub, false) : null }); }
    async update(id, dto, u) {
        const updated = await this.db.transaction(async (m) => {
            const a = await m.getRepository(Assignment).findOne({ where: { id }, relations: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true }, lock: { mode: 'pessimistic_write' } });
            if (!a)
                throw new NotFoundException();
            await this.canManage(a, u);
            if (a.status === 'ARCHIVED')
                throw new ConflictException('Archived assignments cannot be modified');
            const before = { title: a.title, description: a.description, instructions: a.instructions, courseId: a.course.id, lessonId: a.lesson?.id ?? null, groupId: a.group.id, maxScore: a.maxScore, dueAt: a.dueAt, allowLateSubmission: a.allowLateSubmission, allowResubmission: a.allowResubmission, allowResubmissionAfterGraded: a.allowResubmissionAfterGraded };
            const count = await m.getRepository(AssignmentSubmission).count({ where: { assignment: { id } } });
            if (a.status === 'PUBLISHED') {
                const forbidden = ['title', 'description', 'instructions', 'courseId', 'lessonId', 'groupId', 'maxScore', 'allowResubmission', 'allowResubmissionAfterGraded'].some(k => dto[k] !== undefined);
                if (forbidden)
                    throw new ConflictException('Published assignment content and grading policy cannot be changed');
                if (count)
                    throw new ConflictException('Deadline settings cannot change after submissions exist');
                if (dto.dueAt !== undefined) {
                    this.validateDue(dto.dueAt);
                    if (!a.dueAt)
                        throw new BadRequestException('A deadline cannot be added after publishing');
                    if (!dto.dueAt || new Date(dto.dueAt) <= a.dueAt)
                        throw new BadRequestException('Published assignment deadline may only be extended');
                    a.dueAt = new Date(dto.dueAt);
                }
                if (dto.allowLateSubmission !== undefined) {
                    if (a.allowLateSubmission && !dto.allowLateSubmission)
                        throw new BadRequestException('Late submissions cannot be disabled after publishing');
                    a.allowLateSubmission = dto.allowLateSubmission;
                }
                const saved = await m.getRepository(Assignment).save(a);
                await this.auditAssignment(m, saved, u, before);
                return saved;
            }
            const courseId = dto.courseId ?? a.course.id, groupId = dto.groupId ?? a.group.id, lessonId = dto.lessonId === undefined ? a.lesson?.id ?? null : dto.lessonId;
            const rel = await this.validateRelations(courseId, groupId, lessonId, m);
            Object.assign(a, { title: dto.title?.trim() ?? a.title, description: dto.description?.trim() ?? a.description, instructions: dto.instructions === undefined ? a.instructions : dto.instructions?.trim() || null, course: rel.course, group: rel.group, lesson: rel.lesson, maxScore: dto.maxScore === undefined ? a.maxScore : Number(dto.maxScore).toFixed(2), dueAt: dto.dueAt === undefined ? a.dueAt : dto.dueAt ? new Date(dto.dueAt) : null, allowLateSubmission: dto.allowLateSubmission ?? a.allowLateSubmission, allowResubmission: dto.allowResubmission ?? a.allowResubmission, allowResubmissionAfterGraded: dto.allowResubmissionAfterGraded ?? a.allowResubmissionAfterGraded });
            this.validateDue(dto.dueAt);
            const saved = await m.getRepository(Assignment).save(a);
            await this.auditAssignment(m, saved, u, before);
            return saved;
        });
        return this.view(updated, await this.assignmentAttachments.find({ where: { assignment: { id } } }));
    }
    async setStatus(id, status, u, adminOnly = false) { const published = await this.db.transaction(async (m) => { const a = await m.getRepository(Assignment).findOne({ where: { id }, relations: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true }, lock: { mode: 'pessimistic_write' } }); if (!a)
        throw new NotFoundException(); if (adminOnly && !this.admin(u))
        throw new ForbiddenException(); if (!adminOnly)
        await this.canManage(a, u); if (a.status === 'ARCHIVED' && status !== 'ARCHIVED')
        throw new ConflictException('Archived assignments cannot be reactivated'); if (a.status === 'PUBLISHED' && status === 'DRAFT')
        throw new ConflictException('Published assignments cannot return to draft'); const oldStatus = a.status; if (status === 'PUBLISHED' && a.status !== 'PUBLISHED') {
        assignmentCanBePublished({ courseStatus: a.course.status, groupStatus: a.group.status, lessonStatus: a.lesson?.status, dueAt: a.dueAt, allowLateSubmission: a.allowLateSubmission });
        a.publishedAt = new Date();
    } if (status === 'ARCHIVED')
        a.status = 'ARCHIVED';
    else if (status === 'PUBLISHED')
        a.status = 'PUBLISHED';
    else
        a.status = 'DRAFT'; const saved = await m.getRepository(Assignment).save(a); if (oldStatus !== saved.status)
        await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_STATUS_CHANGED', resourceType: 'assignment', resourceId: id, actor: { id: u.id }, beforeState: { status: oldStatus }, afterState: { status: saved.status } })); return { assignment: saved, notify: oldStatus !== 'PUBLISHED' && status === 'PUBLISHED' }; }); if (published.notify) {
        const students = await this.memberships.find({ where: { group: { id: published.assignment.group.id }, status: 'ACTIVE' }, relations: { student: true } });
        await this.notifications.createAndDeliverMany(students.filter(x => x.student.status === 'active').map(x => x.student.id), { type: NotificationType.GENERAL, title: 'New assignment available', body: published.assignment.title, relatedEntityId: published.assignment.id, eventKey: `assignment-published:${published.assignment.id}` });
    } return this.view(published.assignment, await this.assignmentAttachments.find({ where: { assignment: { id } } })); }
    async publish(id, u) { return this.setStatus(id, 'PUBLISHED', u); }
    async archive(id, u) { return this.setStatus(id, 'ARCHIVED', u); }
    async adminStatus(id, status, u) { return this.setStatus(id, status, u, true); }
    async studentAssignmentForSubmission(id, u, manager) { const a = await this.assignment(id, manager); if (a.status !== 'PUBLISHED')
        throw new BadRequestException('Only published assignments accept submissions'); const member = await this.studentMembership(a.group.id, u.id, manager); return { a, member }; }
    async submit(assignmentId, dto, u) { await this.studentAssignmentForSubmission(assignmentId, u); const result = await this.db.transaction(async (m) => { const locked = await m.getRepository(Assignment).findOne({ where: { id: assignmentId }, relations: { course: true, group: { course: true, leadTeacher: true } }, lock: { mode: 'pessimistic_write' } }); if (!locked || locked.status !== 'PUBLISHED')
        throw new ConflictException('Assignment is no longer available'); if (!await m.getRepository(StudyGroup).findOne({ where: { id: locked.group.id }, lock: { mode: 'pessimistic_write' } }))
        throw new NotFoundException('Group not found'); const member = await m.getRepository(GroupStudent).findOne({ where: { group: { id: locked.group.id }, student: { id: u.id }, status: 'ACTIVE' }, relations: { student: true, group: true }, lock: { mode: 'pessimistic_write' } }); if (!member)
        throw new ForbiddenException('An active membership in this assignment group is required'); let sub = await m.getRepository(AssignmentSubmission).findOne({ where: { assignment: { id: assignmentId }, student: { id: u.id } }, relations: { student: true, assignment: true }, lock: { mode: 'pessimistic_write' } }); if (sub) {
        const prior = await m.getRepository(AssignmentSubmissionRevision).findOne({ where: { submission: { id: sub.id }, idempotencyKey: dto.idempotencyKey } });
        if (prior) {
            if (prior.textAnswer !== (dto.textAnswer?.trim() || null))
                throw new ConflictException('Idempotency key was already used for different submission content');
            return { submission: sub };
        }
        throw new ConflictException('A submission already exists; use the resubmission endpoint');
    } const now = new Date(), late = classifySubmission(locked.dueAt, locked.allowLateSubmission, now); sub = await m.getRepository(AssignmentSubmission).save(m.getRepository(AssignmentSubmission).create({ assignment: locked, student: { id: u.id }, membership: member, submittedAt: now, textAnswer: dto.textAnswer?.trim() || null, status: late.status, isLate: late.isLate, currentVersion: 1 })); await m.getRepository(AssignmentSubmissionRevision).save(m.getRepository(AssignmentSubmissionRevision).create({ submission: sub, versionNumber: 1, idempotencyKey: dto.idempotencyKey, textAnswer: sub.textAnswer, submittedAt: now, isLate: late.isLate })); await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_SUBMITTED', resourceType: 'assignment_submission', resourceId: sub.id, actor: { id: u.id }, afterState: { version: 1, isLate: late.isLate } })); return { submission: sub }; }); return this.submissionView(result.submission, u, false); }
    async resubmit(id, dto, u) { const result = await this.db.transaction(async (m) => { const sub = await m.getRepository(AssignmentSubmission).findOne({ where: { id, student: { id: u.id } }, relations: { assignment: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true }, student: true, membership: true }, lock: { mode: 'pessimistic_write' } }); if (!sub)
        throw new NotFoundException('Submission not found'); const assignment = await m.getRepository(Assignment).findOne({ where: { id: sub.assignment.id }, lock: { mode: 'pessimistic_write' } }); if (!assignment)
        throw new NotFoundException('Assignment not found'); if (!await m.getRepository(StudyGroup).findOne({ where: { id: sub.assignment.group.id }, lock: { mode: 'pessimistic_write' } }))
        throw new NotFoundException('Group not found'); const membership = await m.getRepository(GroupStudent).findOne({ where: { id: sub.membership.id, status: 'ACTIVE' }, lock: { mode: 'pessimistic_write' } }); if (!membership)
        throw new ForbiddenException('An active membership in this assignment group is required to resubmit'); const old = await m.getRepository(AssignmentSubmissionRevision).findOne({ where: { submission: { id }, idempotencyKey: dto.idempotencyKey } }); if (old) {
        const requested = dto.textAnswer === undefined ? old.textAnswer : dto.textAnswer?.trim() || null;
        if (old.textAnswer !== requested)
            throw new ConflictException('Idempotency key was already used for different submission content');
        return sub;
    } assertResubmissionAllowed(assignment, sub, new Date()); const was = sub.status, now = new Date(), late = classifySubmission(assignment.dueAt, assignment.allowLateSubmission, now), version = sub.currentVersion + 1; sub.currentVersion = version; sub.textAnswer = dto.textAnswer === undefined ? sub.textAnswer : dto.textAnswer?.trim() || null; sub.submittedAt = now; sub.isLate = late.isLate; sub.status = late.status; const saved = await m.getRepository(AssignmentSubmission).save(sub); await m.getRepository(AssignmentSubmissionRevision).save(m.getRepository(AssignmentSubmissionRevision).create({ submission: saved, versionNumber: version, idempotencyKey: dto.idempotencyKey, textAnswer: saved.textAnswer, submittedAt: now, isLate: late.isLate })); await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_RESUBMITTED', resourceType: 'assignment_submission', resourceId: id, actor: { id: u.id }, beforeState: { status: was, version: version - 1 }, afterState: { status: saved.status, version } })); return saved; }); return this.submissionView(result, u, false); }
    submissionView(s, u, teacher) { return this.submissionDetails(s, teacher); }
    async submissionDetails(s, teacher) { const [revs, reviews] = await Promise.all([this.revisions.find({ where: { submission: { id: s.id } }, order: { versionNumber: 'DESC' } }), this.reviews.find({ where: { submission: { id: s.id } }, relations: { reviewedBy: true }, order: { reviewedAt: 'DESC' } })]); const revisionData = await Promise.all(revs.map(async (r) => ({ version: r.versionNumber, textAnswer: r.textAnswer, submittedAt: r.submittedAt, isLate: r.isLate, attachments: (await this.submissionAttachments.find({ where: { revision: { id: r.id } }, order: { createdAt: 'ASC' } })).map(x => ({ id: x.id, fileName: x.fileName, mimeType: x.mimeType, fileSize: x.fileSize, createdAt: x.createdAt })) }))); return { id: s.id, assignmentId: s.assignment.id, student: teacher ? { id: s.student.id, displayName: s.student.displayName } : undefined, status: s.status, submittedAt: s.submittedAt, isLate: s.isLate, currentVersion: s.currentVersion, textAnswer: s.textAnswer, score: s.status === 'GRADED' && reviews[0]?.action === 'GRADED' ? reviews[0].score : null, feedback: ['GRADED', 'RETURNED'].includes(s.status) ? reviews[0]?.feedback : null, reviews: reviews.map(r => ({ id: r.id, action: r.action, score: r.score, feedback: r.feedback, reviewedAt: r.reviewedAt, reviewedBy: teacher ? { id: r.reviewedBy.id, displayName: r.reviewedBy.displayName } : undefined })), versions: revisionData, createdAt: s.createdAt, updatedAt: s.updatedAt }; }
    async studentSubmissionList(u, q) { const qb = this.submissions.createQueryBuilder('s').leftJoinAndSelect('s.assignment', 'assignment').leftJoinAndSelect('s.student', 'student').where('s.student_id=:uid', { uid: u.id }); if (q.status)
        qb.andWhere('s.status=:status', { status: q.status }); const [rows, total] = await qb.orderBy('s.submitted_at', 'DESC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); return { data: await Promise.all(rows.map(s => this.submissionDetails(s, false))), pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async studentSubmission(id, u) { const s = await this.submissions.findOne({ where: { id, student: { id: u.id } }, relations: { assignment: true, student: true } }); if (!s)
        throw new NotFoundException('Submission not found'); return this.submissionDetails(s, false); }
    async managedSubmission(id, u, manager) { const s = await (manager?.getRepository(AssignmentSubmission) ?? this.submissions).findOne({ where: { id }, relations: { assignment: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true }, student: true, membership: true } }); if (!s)
        throw new NotFoundException('Submission not found'); await this.canManage(s.assignment, u); return s; }
    async teacherSubmission(id, u) { const s = await this.managedSubmission(id, u); return this.submissionDetails(s, true); }
    async listSubmissions(assignmentId, q, u) { const a = await this.assignment(assignmentId); await this.canManage(a, u); const qb = this.submissions.createQueryBuilder('s').leftJoinAndSelect('s.assignment', 'assignment').leftJoinAndSelect('s.student', 'student').where('s.assignment_id=:id', { id: assignmentId }); if (q.status)
        qb.andWhere('s.status=:status', { status: q.status }); const [rows, total] = await qb.orderBy('s.submitted_at', 'ASC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); return { data: await Promise.all(rows.map(s => this.submissionDetails(s, true))), pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async grade(id, dto, u) { await this.requireTeacher(u); const result = await this.db.transaction(async (m) => { const s = await this.managedSubmission(id, u, m); const locked = await m.getRepository(AssignmentSubmission).findOne({ where: { id }, relations: { assignment: true, student: true }, lock: { mode: 'pessimistic_write' } }); if (!locked)
        throw new NotFoundException(); if (locked.status === 'RETURNED')
        throw new ConflictException('Returned submission must be resubmitted before grading'); validateGradeScore(dto.score, locked.assignment.maxScore); const review = await m.getRepository(AssignmentSubmissionReview).save(m.getRepository(AssignmentSubmissionReview).create({ submission: locked, reviewedBy: { id: u.id }, action: 'GRADED', score: Number(dto.score).toFixed(2), feedback: dto.feedback.trim(), reviewedAt: new Date() })); locked.status = 'GRADED'; await m.getRepository(AssignmentSubmission).save(locked); await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_SUBMISSION_GRADED', resourceType: 'assignment_submission', resourceId: id, actor: { id: u.id }, afterState: { score: review.score, reviewId: review.id } })); return { studentId: locked.student.id, assignmentTitle: locked.assignment.title, review }; }); await this.notifications.createAndDeliver(result.studentId, { type: NotificationType.GENERAL, title: 'Assignment graded', body: 'Your assignment has been reviewed.', relatedEntityId: id, eventKey: `assignment-graded:${result.review.id}` }); return { id: result.review.id, submissionId: id, score: result.review.score, feedback: result.review.feedback, reviewedAt: result.review.reviewedAt }; }
    async returnForCorrection(id, dto, u) { await this.requireTeacher(u); const result = await this.db.transaction(async (m) => { const s = await this.managedSubmission(id, u, m); const locked = await m.getRepository(AssignmentSubmission).findOne({ where: { id }, relations: { assignment: true, student: true }, lock: { mode: 'pessimistic_write' } }); if (!locked)
        throw new NotFoundException(); const review = await m.getRepository(AssignmentSubmissionReview).save(m.getRepository(AssignmentSubmissionReview).create({ submission: locked, reviewedBy: { id: u.id }, action: 'RETURNED', score: null, feedback: dto.feedback.trim(), reviewedAt: new Date() })); locked.status = 'RETURNED'; await m.getRepository(AssignmentSubmission).save(locked); await m.getRepository(AuditLog).save(m.getRepository(AuditLog).create({ action: 'ASSIGNMENT_SUBMISSION_RETURNED', resourceType: 'assignment_submission', resourceId: id, actor: { id: u.id }, afterState: { reviewId: review.id } })); return { studentId: locked.student.id, review }; }); await this.notifications.createAndDeliver(result.studentId, { type: NotificationType.GENERAL, title: 'Assignment returned for correction', body: 'Your assignment needs a correction. Open it to view teacher feedback.', relatedEntityId: id, eventKey: `assignment-returned:${result.review.id}` }); return { id: result.review.id, submissionId: id, feedback: result.review.feedback, reviewedAt: result.review.reviewedAt }; }
    async latestScore(submissionId) { const r = await this.reviews.findOne({ where: { submission: { id: submissionId }, action: 'GRADED' }, order: { reviewedAt: 'DESC' } }); return r?.score ?? null; }
    async teacherStatistics(u, q) { await this.requireTeacher(u); const qb = await this.managerListQuery(q, u); const rows = await qb.select('a.id', 'assignmentId').addSelect('a.status', 'status').getRawMany(); const ids = rows.map(r => r.assignmentId); const stats = ids.length ? await this.submissions.createQueryBuilder('s').select('s.status', 'status').addSelect('COUNT(*)', 'count').where('s.assignment_id IN (:...ids)', { ids }).groupBy('s.status').getRawMany() : []; return { assignments: rows.length, byAssignmentStatus: rows.reduce((out, r) => ({ ...out, [r.status]: (out[r.status] ?? 0) + 1 }), {}), submissions: stats.reduce((out, r) => ({ ...out, [r.status]: Number(r.count) }), {}) }; }
    async adminStatistics(u, q) { if (!this.admin(u))
        throw new ForbiddenException(); return this.teacherStatistics({ ...u, roles: ['ADMIN'] }, q); }
    async adminGet(id, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.teacherGet(id, u); }
    async adminSubmissions(q, u) { if (!this.admin(u))
        throw new ForbiddenException(); const qb = this.submissions.createQueryBuilder('s').leftJoinAndSelect('s.assignment', 'assignment').leftJoinAndSelect('s.student', 'student'); if (q.status)
        qb.andWhere('s.status=:status', { status: q.status }); const [rows, total] = await qb.orderBy('s.submitted_at', 'DESC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); return { data: await Promise.all(rows.map(s => this.submissionDetails(s, true))), pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async verifiedObject(uploadId, scope, requested) { const object = await this.storage.verifyUpload(uploadId); if (object.uploadId !== uploadId || object.scope !== scope || !object.storageKey || object.storageKey.includes('\0') || object.storageKey.split(/[\\/]/).some(segment => segment === '..'))
        throw new BadRequestException('Uploaded object scope is invalid'); validateRequestedFile({ fileName: object.fileName, mimeType: object.mimeType, fileSize: object.fileSize }); if (object.fileName !== requested.fileName || object.mimeType !== requested.mimeType || object.fileSize !== requested.fileSize)
        throw new BadRequestException('Uploaded file metadata does not match the verified object'); return object; }
    async assignmentUpload(id, dto, u) { const a = await this.assignment(id); await this.canManage(a, u); if (a.status !== 'DRAFT')
        throw new ConflictException('Reference attachments can only be added to draft assignments'); validateRequestedFile(dto); if (await this.assignmentAttachments.count({ where: { assignment: { id } } }) >= MAX_ASSIGNMENT_ATTACHMENTS)
        throw new BadRequestException('Assignment attachment limit reached'); const uploadId = randomUUID(); const grant = await this.storage.createUpload({ scope: `assignment:${id}`, uploadId, fileName: dto.fileName, mimeType: dto.mimeType, maxBytes: MAX_ASSIGNMENT_FILE_BYTES, allowedMimeTypes: ALLOWED_ASSIGNMENT_MIME_TYPES }); return { uploadId, uploadUrl: grant.uploadUrl, expiresAt: grant.expiresAt }; }
    async completeAssignmentUpload(id, uploadId, dto, u) { const a = await this.assignment(id); await this.canManage(a, u); if (a.status !== 'DRAFT')
        throw new ConflictException('Reference attachments can only be added to draft assignments'); const object = await this.verifiedObject(uploadId, `assignment:${id}`, dto); const row = await this.db.transaction(async (m) => { const locked = await m.getRepository(Assignment).findOne({ where: { id }, relations: { course: true, lesson: true, group: { course: true, leadTeacher: true }, createdBy: true }, lock: { mode: 'pessimistic_write' } }); if (!locked || locked.status !== 'DRAFT')
        throw new ConflictException('Reference attachments can only be added to draft assignments'); if (await m.getRepository(AssignmentAttachment).count({ where: { assignment: { id } } }) >= MAX_ASSIGNMENT_ATTACHMENTS)
        throw new BadRequestException('Assignment attachment limit reached'); return m.getRepository(AssignmentAttachment).save(m.getRepository(AssignmentAttachment).create({ assignment: locked, fileName: object.fileName, mimeType: object.mimeType, fileSize: object.fileSize, storageKey: object.storageKey })); }); return { id: row.id, fileName: row.fileName, mimeType: row.mimeType, fileSize: row.fileSize, createdAt: row.createdAt }; }
    assertAttachmentWindow(assignment, submission, now) { if (assignment.status !== 'PUBLISHED')
        throw new BadRequestException('Only published assignments accept attachments'); if (submission.status === 'GRADED')
        throw new ConflictException('Graded submissions cannot accept attachments'); classifySubmission(assignment.dueAt, assignment.allowLateSubmission, now); }
    async submissionUpload(id, dto, u) { const s = await this.submissions.findOne({ where: { id, student: { id: u.id } }, relations: { assignment: { group: true } } }); if (!s)
        throw new NotFoundException('Submission not found'); this.assertAttachmentWindow(s.assignment, s, new Date()); await this.studentMembership(s.assignment.group.id, u.id); validateRequestedFile(dto); const revision = await this.revisions.findOne({ where: { submission: { id }, versionNumber: s.currentVersion } }); if (!revision)
        throw new ConflictException('Submission revision is not available'); if (await this.submissionAttachments.count({ where: { revision: { id: revision.id } } }) >= MAX_SUBMISSION_ATTACHMENTS)
        throw new BadRequestException('Submission attachment limit reached'); const uploadId = randomUUID(); const grant = await this.storage.createUpload({ scope: `submission:${id}:revision:${s.currentVersion}`, uploadId, fileName: dto.fileName, mimeType: dto.mimeType, maxBytes: MAX_ASSIGNMENT_FILE_BYTES, allowedMimeTypes: ALLOWED_ASSIGNMENT_MIME_TYPES }); return { uploadId, uploadUrl: grant.uploadUrl, expiresAt: grant.expiresAt }; }
    async completeSubmissionUpload(id, uploadId, dto, u) { const s = await this.submissions.findOne({ where: { id, student: { id: u.id } }, relations: { assignment: { group: true } } }); if (!s)
        throw new NotFoundException('Submission not found'); this.assertAttachmentWindow(s.assignment, s, new Date()); await this.studentMembership(s.assignment.group.id, u.id); const version = s.currentVersion; const revision = await this.revisions.findOne({ where: { submission: { id }, versionNumber: version } }); if (!revision)
        throw new ConflictException('Submission revision is not available'); const object = await this.verifiedObject(uploadId, `submission:${id}:revision:${version}`, dto); const row = await this.db.transaction(async (m) => { const locked = await m.getRepository(AssignmentSubmission).findOne({ where: { id, student: { id: u.id } }, relations: { assignment: { group: true }, student: true }, lock: { mode: 'pessimistic_write' } }); if (!locked || locked.currentVersion !== version)
        throw new ConflictException('Submission changed while the attachment was being verified'); this.assertAttachmentWindow(locked.assignment, locked, new Date()); if (!await m.getRepository(StudyGroup).findOne({ where: { id: locked.assignment.group.id }, lock: { mode: 'pessimistic_write' } }) || !await m.getRepository(GroupStudent).findOne({ where: { group: { id: locked.assignment.group.id }, student: { id: u.id }, status: 'ACTIVE' }, lock: { mode: 'pessimistic_write' } }))
        throw new ForbiddenException('An active membership in this assignment group is required'); const lockedRevision = await m.getRepository(AssignmentSubmissionRevision).findOne({ where: { submission: { id }, versionNumber: version }, lock: { mode: 'pessimistic_write' } }); if (!lockedRevision)
        throw new ConflictException('Submission revision is not available'); if (await m.getRepository(AssignmentSubmissionAttachment).count({ where: { revision: { id: lockedRevision.id } } }) >= MAX_SUBMISSION_ATTACHMENTS)
        throw new BadRequestException('Submission attachment limit reached'); return m.getRepository(AssignmentSubmissionAttachment).save(m.getRepository(AssignmentSubmissionAttachment).create({ submission: locked, revision: lockedRevision, fileName: object.fileName, mimeType: object.mimeType, fileSize: object.fileSize, storageKey: object.storageKey })); }); return { id: row.id, fileName: row.fileName, mimeType: row.mimeType, fileSize: row.fileSize, createdAt: row.createdAt }; }
    async assignmentAttachmentUrl(id, attachmentId, u) { const attachment = await this.assignmentAttachments.createQueryBuilder('file').addSelect('file.storageKey').leftJoinAndSelect('file.assignment', 'assignment').leftJoinAndSelect('assignment.group', 'group').leftJoinAndSelect('assignment.createdBy', 'createdBy').where('file.id=:attachmentId AND assignment.id=:id', { attachmentId, id }).getOne(); if (!attachment)
        throw new NotFoundException('Attachment not found'); if (this.admin(u) || attachment.assignment.group.leadTeacher.id === u.id || attachment.assignment.createdBy.id === u.id)
        await this.canManage(attachment.assignment, u);
    else {
        if (attachment.assignment.status !== 'PUBLISHED')
            throw new NotFoundException('Attachment not found');
        await this.studentMembership(attachment.assignment.group.id, u.id);
    } return this.storage.createDownloadUrl(attachment.storageKey); }
    async submissionAttachmentUrl(id, attachmentId, u) { const file = await this.submissionAttachments.createQueryBuilder('file').addSelect('file.storageKey').leftJoinAndSelect('file.submission', 'submission').leftJoinAndSelect('submission.student', 'student').leftJoinAndSelect('submission.assignment', 'assignment').leftJoinAndSelect('assignment.group', 'group').leftJoinAndSelect('assignment.createdBy', 'createdBy').where('file.id=:attachmentId AND submission.id=:id', { attachmentId, id }).getOne(); if (!file)
        throw new NotFoundException('Attachment not found'); if (file.submission.student.id === u.id)
        return this.storage.createDownloadUrl(file.storageKey); await this.canManage(file.submission.assignment, u); return this.storage.createDownloadUrl(file.storageKey); }
};
AssignmentsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Assignment)),
    __param(1, InjectRepository(AssignmentAttachment)),
    __param(2, InjectRepository(AssignmentSubmission)),
    __param(3, InjectRepository(AssignmentSubmissionRevision)),
    __param(4, InjectRepository(AssignmentSubmissionAttachment)),
    __param(5, InjectRepository(AssignmentSubmissionReview)),
    __param(6, InjectRepository(Course)),
    __param(7, InjectRepository(Lesson)),
    __param(8, InjectRepository(StudyGroup)),
    __param(9, InjectRepository(GroupStudent)),
    __param(10, InjectRepository(UserRole)),
    __param(11, InjectRepository(User)),
    __param(14, Inject(ASSIGNMENT_STORAGE)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        DataSource,
        NotificationsService, Object])
], AssignmentsService);
export { AssignmentsService };
//# sourceMappingURL=assignments.service.js.map