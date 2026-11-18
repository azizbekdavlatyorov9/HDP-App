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
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Attendance, AttendanceHistory, AttendanceSession, GroupStudent, LessonSession, NotificationType, StudyGroup } from '../../database/entities/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { calculateAttendanceStatistics, validateAttendanceEntry } from './attendance.helpers.js';
let AttendanceService = class AttendanceService {
    records;
    states;
    history;
    sessions;
    memberships;
    db;
    notifications;
    constructor(records, states, history, sessions, memberships, db, notifications) {
        this.records = records;
        this.states = states;
        this.history = history;
        this.sessions = sessions;
        this.memberships = memberships;
        this.db = db;
        this.notifications = notifications;
    }
    admin(u) { return u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN'); }
    async getSession(id) { const s = await this.sessions.findOne({ where: { id }, relations: { group: { course: true }, teacher: true } }); if (!s)
        throw new NotFoundException('Lesson session not found'); return s; }
    async lockSession(m, session) { const row = await m.getRepository(LessonSession).findOne({ where: { id: session.id }, lock: { mode: 'pessimistic_write' } }); if (!row)
        throw new NotFoundException('Lesson session not found'); if (!await m.getRepository(StudyGroup).findOne({ where: { id: session.group.id }, lock: { mode: 'pessimistic_write' } }))
        throw new NotFoundException('Session group not found'); }
    async canManage(s, u) { if (this.admin(u))
        return; if (!u.roles.includes('TEACHER') || s.teacher.id !== u.id)
        throw new ForbiddenException('Only the assigned teacher or an administrator may manage attendance'); }
    async eligible(session, repo = this.memberships) { return repo.createQueryBuilder('membership').leftJoinAndSelect('membership.student', 'student').where('membership.group_id=:groupId', { groupId: session.group.id }).andWhere('membership.joined_at <= :sessionStart', { sessionStart: session.startAt }).andWhere('(membership.ended_at IS NULL OR membership.ended_at > :sessionStart)', { sessionStart: session.startAt }).orderBy('membership.joined_at', 'ASC').getMany(); }
    view(a, privateNotes = false) { return { id: a.id, sessionId: a.session.id, studentId: a.student.id, membershipId: a.membership.id, status: a.status, latenessMinutes: a.latenessMinutes, reason: a.reason, ...(privateNotes ? { teacherNote: a.teacherNote } : {}), markedById: a.markedBy.id, markedAt: a.markedAt, updatedAt: a.updatedAt }; }
    async sessionState(m, session, create = false) { const repo = m.getRepository(AttendanceSession); let row = await repo.findOne({ where: { session: { id: session.id } }, relations: { finalizedBy: true } }); if (!row && create)
        row = await repo.save(repo.create({ session, status: 'NOT_STARTED', finalizedBy: null, finalizedAt: null })); return row; }
    async recordHistory(m, input) { await m.getRepository(AttendanceHistory).save(m.getRepository(AttendanceHistory).create({ attendance: input.attendance ?? null, session: input.session, action: input.action, previousStatus: input.previousStatus ?? null, newStatus: input.newStatus ?? null, previousLatenessMinutes: input.previousLateness ?? null, newLatenessMinutes: input.newLateness ?? null, changeReason: input.reason ?? null, actor: { id: input.actor.id } })); }
    assertEditable(state, u) { if (state?.status === 'FINALIZED' && !this.admin(u))
        throw new ForbiddenException('Finalized attendance can only be changed by an administrator'); if (state?.status === 'FINALIZED' && this.admin(u))
        throw new ConflictException('Reopen finalized attendance before editing records'); }
    async saveEntry(m, session, membership, e, u, reason) { validateAttendanceEntry(e); const repo = m.getRepository(Attendance); let row = await repo.findOne({ where: { session: { id: session.id }, student: { id: membership.student.id } }, relations: { student: true, session: true, membership: true, markedBy: true }, lock: { mode: 'pessimistic_write' } }); const before = row ? { status: row.status, lateness: row.latenessMinutes } : undefined; const isCreate = !row; if (!row)
        row = repo.create({ session, student: membership.student, membership, status: e.status, latenessMinutes: e.status === 'LATE' ? e.latenessMinutes : null, reason: e.reason?.trim() || null, teacherNote: e.teacherNote?.trim() || null, markedBy: { id: u.id }, markedAt: new Date() });
    else {
        row.status = e.status;
        row.latenessMinutes = e.status === 'LATE' ? e.latenessMinutes : null;
        row.reason = e.reason?.trim() || null;
        row.teacherNote = e.teacherNote?.trim() || null;
        row.markedBy = { id: u.id };
        row.markedAt = new Date();
    } row = await repo.save(row); await this.recordHistory(m, { attendance: row, session, action: isCreate ? 'CREATED' : 'UPDATED', previousStatus: before?.status ?? null, newStatus: row.status, previousLateness: before?.lateness ?? null, newLateness: row.latenessMinutes, reason, actor: u }); return row; }
    async start(sessionId, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); if (s.status === 'CANCELLED')
        throw new BadRequestException('Cancelled sessions cannot have attendance'); return this.db.transaction(async (m) => { await this.lockSession(m, s); let state = await this.sessionState(m, s, true); if (state.status === 'FINALIZED')
        throw new ConflictException('Attendance is already finalized'); if (state.status === 'NOT_STARTED' || state.status === 'REOPENED')
        state.status = 'IN_PROGRESS'; return m.getRepository(AttendanceSession).save(state); }).then(x => ({ sessionId, status: x.status, startedAt: x.updatedAt })); }
    async eligibleStudents(sessionId, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); const members = await this.eligible(s); const existing = await this.records.find({ where: { session: { id: sessionId } }, relations: { student: true } }); const byId = new Map(existing.map(a => [a.student.id, a])); return members.map(m => ({ student: { id: m.student.id, displayName: m.student.displayName }, membershipId: m.id, attendance: byId.has(m.student.id) ? { id: byId.get(m.student.id).id, status: byId.get(m.student.id).status } : null })); }
    async viewSession(sessionId, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); const [state, rows, members] = await Promise.all([this.states.findOne({ where: { session: { id: sessionId } }, relations: { finalizedBy: true } }), this.records.find({ where: { session: { id: sessionId } }, relations: { student: true, membership: true, markedBy: true }, order: { markedAt: 'ASC' } }), this.eligible(s)]); return { session: { id: s.id, startAt: s.startAt, endAt: s.endAt, group: { id: s.group.id, name: s.group.name }, course: { id: s.group.course.id, title: s.group.course.title } }, lifecycle: state?.status ?? 'NOT_STARTED', eligibleCount: members.length, recordedCount: rows.length, records: rows.map(r => this.view(r, true)) }; }
    async submit(sessionId, dto, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); if (s.status === 'CANCELLED')
        throw new BadRequestException('Cancelled sessions cannot have attendance'); const ids = dto.records.map(r => r.studentId); if (new Set(ids).size !== ids.length)
        throw new BadRequestException('Duplicate students in attendance request'); const rows = await this.db.transaction(async (m) => { await this.lockSession(m, s); const state = await this.sessionState(m, s, true); this.assertEditable(state, u); if (state.status === 'NOT_STARTED' || state.status === 'REOPENED') {
        state.status = 'IN_PROGRESS';
        await m.getRepository(AttendanceSession).save(state);
    } const eligible = await this.eligible(s, m.getRepository(GroupStudent)); const map = new Map(eligible.map(x => [x.student.id, x])); const result = []; for (const entry of dto.records) {
        const membership = map.get(entry.studentId);
        if (!membership)
            throw new BadRequestException(`Student ${entry.studentId} was not a group member when this session occurred`);
        result.push(await this.saveEntry(m, s, membership, entry, u, dto.changeReason));
    } return result; }); return { sessionId, updated: rows.length, records: rows.map(x => this.view(x)) }; }
    async update(sessionId, attendanceId, dto, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); if (s.status === 'CANCELLED')
        throw new BadRequestException('Cancelled sessions cannot have attendance changed'); const row = await this.db.transaction(async (m) => { await this.lockSession(m, s); const state = await this.sessionState(m, s); this.assertEditable(state, u); const old = await m.getRepository(Attendance).findOne({ where: { id: attendanceId, session: { id: sessionId } }, relations: { membership: { student: true, group: true } }, lock: { mode: 'pessimistic_write' } }); if (!old)
        throw new NotFoundException('Attendance record not found'); const membership = old.membership; if (membership.group.id !== s.group.id || membership.joinedAt > s.startAt || (membership.endedAt && membership.endedAt <= s.startAt))
        throw new BadRequestException('Attendance membership does not match the lesson session'); const updated = await this.saveEntry(m, s, membership, dto, u, dto.changeReason); return m.getRepository(Attendance).findOneOrFail({ where: { id: updated.id }, relations: { student: true, session: true, membership: true, markedBy: true } }); }); return this.view(row); }
    async finalize(sessionId, u) { const s = await this.getSession(sessionId); await this.canManage(s, u); if (s.status === 'CANCELLED')
        throw new BadRequestException('Cancelled sessions cannot be finalized'); const finalized = await this.db.transaction(async (m) => { await this.lockSession(m, s); const state = await this.sessionState(m, s, true); if (state.status === 'FINALIZED')
        throw new ConflictException('Attendance is already finalized'); const eligible = (await this.eligible(s, m.getRepository(GroupStudent))).length; const recorded = await m.getRepository(Attendance).count({ where: { session: { id: sessionId }, membership: { group: { id: s.group.id } } } }); if (recorded !== eligible)
        throw new BadRequestException(`Cannot finalize: ${eligible - recorded} eligible students have no attendance record`); const repo = m.getRepository(AttendanceSession); state.status = 'FINALIZED'; state.finalizedBy = { id: u.id }; state.finalizedAt = new Date(); const saved = await repo.save(state); await this.recordHistory(m, { session: s, action: 'FINALIZED', reason: 'Attendance finalized', actor: u }); return saved; }); const rows = await this.records.find({ where: [{ session: { id: sessionId }, status: 'ABSENT' }, { session: { id: sessionId }, status: 'LATE' }], relations: { student: true } }); for (const row of rows)
        await this.notifications.createAndDeliver(row.student.id, { type: NotificationType.GENERAL, title: row.status === 'ABSENT' ? 'Attendance finalized: absent' : 'Attendance finalized: late', body: 'Your lesson attendance was finalized.', relatedEntityId: sessionId, eventKey: `attendance-finalized:${sessionId}:${row.student.id}:${finalized.updatedAt.getTime()}` }); return { sessionId, status: finalized.status, finalizedAt: finalized.finalizedAt }; }
    async reopen(sessionId, reason, u) { if (!this.admin(u))
        throw new ForbiddenException(); const s = await this.getSession(sessionId); const state = await this.db.transaction(async (m) => { await this.lockSession(m, s); const current = await this.sessionState(m, s, true); if (current.status !== 'FINALIZED')
        throw new ConflictException('Only finalized attendance can be reopened'); current.status = 'REOPENED'; current.finalizedBy = null; current.finalizedAt = null; const saved = await m.getRepository(AttendanceSession).save(current); await this.recordHistory(m, { session: s, action: 'REOPENED', reason, actor: u }); return saved; }); return { sessionId, status: state.status, reason }; }
    async studentList(u, q) { return this.queryList(q, false, u.id); }
    async studentDetail(id, u) { const row = await this.records.findOne({ where: { id, student: { id: u.id } }, relations: { session: { group: { course: true } }, student: true, membership: true, markedBy: true } }); if (!row)
        throw new NotFoundException('Attendance record not found'); return this.studentView(row); }
    studentView(r) { return { id: r.id, session: { id: r.session.id, startAt: r.session.startAt, endAt: r.session.endAt, group: { id: r.session.group.id, name: r.session.group.name }, course: { id: r.session.group.course.id, title: r.session.group.course.title } }, status: r.status, latenessMinutes: r.latenessMinutes, reason: r.reason, markedAt: r.markedAt }; }
    listQuery(q) { const validDate = (value) => { const parsed = new Date(`${value}T00:00:00.000Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value; }; if (q.from && !validDate(q.from) || q.to && !validDate(q.to))
        throw new BadRequestException('Date filters must use valid YYYY-MM-DD dates'); if (q.from && q.to && q.from > q.to)
        throw new BadRequestException('from must not be after to'); const qb = this.records.createQueryBuilder('a').leftJoinAndSelect('a.student', 'student').leftJoinAndSelect('a.session', 'session').leftJoinAndSelect('session.group', 'group').leftJoinAndSelect('group.course', 'course').leftJoinAndSelect('session.teacher', 'teacher').leftJoinAndSelect('a.membership', 'membership').leftJoinAndSelect('a.markedBy', 'markedBy').addSelect('a.teacherNote'); if (q.studentId)
        qb.andWhere('a.student_id=:studentId', { studentId: q.studentId }); if (q.teacherId)
        qb.andWhere('session.teacher_id=:teacherId', { teacherId: q.teacherId }); if (q.groupId)
        qb.andWhere('session.group_id=:groupId', { groupId: q.groupId }); if (q.courseId)
        qb.andWhere('group.course_id=:courseId', { courseId: q.courseId }); if (q.status)
        qb.andWhere('a.status=:status', { status: q.status }); if (q.sessionId)
        qb.andWhere('a.session_id=:sessionId', { sessionId: q.sessionId }); if (q.from)
        qb.andWhere('session.start_at >= :from', { from: `${q.from}T00:00:00Z` }); if (q.to)
        qb.andWhere('session.start_at < :to', { to: `${q.to}T00:00:00Z` }); return qb; }
    async queryList(q, admin, studentId) { const qb = this.listQuery(q); if (studentId)
        qb.andWhere('a.student_id=:owner', { owner: studentId }); const [rows, total] = await qb.orderBy('session.start_at', 'DESC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount(); return { data: rows.map(r => admin ? this.view(r, true) : this.studentView(r)), pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } }; }
    async adminList(q, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.queryList(q, true); }
    async adminUpdate(attendanceId, dto, u) { if (!this.admin(u))
        throw new ForbiddenException(); const existing = await this.records.findOne({ where: { id: attendanceId }, relations: { session: true } }); if (!existing)
        throw new NotFoundException('Attendance record not found'); return this.update(existing.session.id, attendanceId, dto, u); }
    async statistics(u, studentId, q = { page: 1, limit: 20 }) { if (!studentId && !this.admin(u))
        studentId = u.id;
    else if (studentId && studentId !== u.id && !this.admin(u))
        throw new ForbiddenException(); const qb = this.listQuery({ ...q, studentId: studentId ?? q.studentId }).innerJoin(AttendanceSession, 'attendanceState', 'attendanceState.session_id=session.id AND attendanceState.status=\'FINALIZED\'').andWhere("session.status <> 'CANCELLED'"); const raw = await qb.select('COUNT(a.id)', 'total').addSelect("COUNT(a.id) FILTER (WHERE a.status='PRESENT')", 'present').addSelect("COUNT(a.id) FILTER (WHERE a.status='ABSENT')", 'absent').addSelect("COUNT(a.id) FILTER (WHERE a.status='LATE')", 'late').addSelect("COUNT(a.id) FILTER (WHERE a.status='EXCUSED')", 'excused').getRawOne(); return calculateAttendanceStatistics({ present: Number(raw.present), absent: Number(raw.absent), late: Number(raw.late), excused: Number(raw.excused) }); }
    async adminStatistics(q, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.statistics(u, q.studentId, q); }
};
AttendanceService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Attendance)),
    __param(1, InjectRepository(AttendanceSession)),
    __param(2, InjectRepository(AttendanceHistory)),
    __param(3, InjectRepository(LessonSession)),
    __param(4, InjectRepository(GroupStudent)),
    __metadata("design:paramtypes", [Repository, Repository, Repository, Repository, Repository, DataSource, NotificationsService])
], AttendanceService);
export { AttendanceService };
//# sourceMappingURL=attendance.service.js.map