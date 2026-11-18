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
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseProgress, Enrollment, Lesson, LessonProgress, Video } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import { calculateCompletion } from './progress-calculation.js';
let ProgressService = class ProgressService {
    courses;
    cp;
    enrollments;
    lessons;
    lp;
    videos;
    access;
    constructor(courses, cp, enrollments, lessons, lp, videos, access) {
        this.courses = courses;
        this.cp = cp;
        this.enrollments = enrollments;
        this.lessons = lessons;
        this.lp = lp;
        this.videos = videos;
        this.access = access;
    }
    async watch(id, delta, u) { await this.access.canAccessLesson(id, u); let p = await this.lp.findOne({ where: { lesson: { id }, user: { id: u.id } }, relations: { lesson: true, user: true } }); if (!p)
        p = this.lp.create({ lesson: { id }, user: { id: u.id }, watchedSeconds: 0, watchedPercent: 0, lastAccessedAt: null, completedAt: null }); const durations = await this.videos.find({ where: { lesson: { id }, status: 'ready' } }); const total = durations.reduce((sum, v) => sum + (v.durationSeconds ?? 0), 0); const now = new Date(); const elapsed = p.lastAccessedAt ? Math.max(0, Math.floor((now.getTime() - p.lastAccessedAt.getTime()) / 1000)) : 0; const accepted = Math.min(delta, elapsed + 5); p.watchedSeconds = total ? Math.min(total, p.watchedSeconds + accepted) : p.watchedSeconds + accepted; p.watchedPercent = total ? Math.min(100, Math.floor(p.watchedSeconds / total * 100)) : 0; p.lastAccessedAt = now; return this.lp.save(p); }
    async complete(id, u) { const lesson = await this.access.canAccessLesson(id, u); const videos = await this.videos.find({ where: { lesson: { id }, status: 'ready' } }); if (videos.length) {
        const p = await this.lp.findOne({ where: { lesson: { id }, user: { id: u.id } } });
        if (!p || p.watchedPercent < 90)
            throw new ForbiddenException('Watch at least 90% of lesson videos');
    } let p = await this.lp.findOne({ where: { lesson: { id }, user: { id: u.id } }, relations: { lesson: true, user: true } }); if (!p)
        p = this.lp.create({ lesson, user: { id: u.id }, watchedSeconds: 0, watchedPercent: 0, lastAccessedAt: new Date(), completedAt: null }); p.completedAt ??= new Date(); await this.lp.save(p); return this.recalculate(lesson.course.id, u.id); }
    async recalculate(courseId, userId) { const lessons = await this.lessons.find({ where: { course: { id: courseId }, status: 'published' } }); const actual = await this.lp.createQueryBuilder('p').innerJoin('p.lesson', 'l').where('p.user_id=:userId AND l.course_id=:courseId AND l.status=:status AND p.completed_at IS NOT NULL', { userId, courseId, status: 'published' }).getCount(); const row = await this.cp.findOne({ where: { user: { id: userId }, course: { id: courseId } }, relations: { user: true, course: true } }) ?? this.cp.create({ user: { id: userId }, course: { id: courseId }, lessonsCompleted: 0, lessonsTotal: 0, completionPercent: 0, completedAt: null, calculatedAt: new Date() }); Object.assign(row, calculateCompletion(lessons.length, actual)); row.completedAt = lessons.length && actual === lessons.length ? row.completedAt ?? new Date() : null; row.calculatedAt = new Date(); return this.cp.save(row); }
    async mine(u) { return this.cp.find({ where: { user: { id: u.id } }, relations: { course: true }, order: { updatedAt: 'DESC' } }); }
    async forCourse(courseId, userId, u) { const course = await this.access.canManageCourse(courseId, u); if (!this.access.isAdmin(u) && course.leadTeacher.id !== u.id)
        throw new ForbiddenException(); return this.cp.find({ where: { course: { id: courseId }, user: { id: userId } }, relations: { course: true, user: true } }); }
    async overview(courseId, u) { await this.access.canManageCourse(courseId, u); return this.cp.find({ where: { course: { id: courseId } }, relations: { user: true }, order: { updatedAt: 'DESC' } }); }
};
ProgressService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Course)),
    __param(1, InjectRepository(CourseProgress)),
    __param(2, InjectRepository(Enrollment)),
    __param(3, InjectRepository(Lesson)),
    __param(4, InjectRepository(LessonProgress)),
    __param(5, InjectRepository(Video)),
    __metadata("design:paramtypes", [Repository, Repository, Repository, Repository, Repository, Repository, LearningAccessService])
], ProgressService);
export { ProgressService };
//# sourceMappingURL=progress.service.js.map