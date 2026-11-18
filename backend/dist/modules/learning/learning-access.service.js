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
import { ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Enrollment, Lesson, LessonProgress, } from '../../database/entities/index.js';
let LearningAccessService = class LearningAccessService {
    courses;
    lessons;
    enrollments;
    progress;
    constructor(courses, lessons, enrollments, progress) {
        this.courses = courses;
        this.lessons = lessons;
        this.enrollments = enrollments;
        this.progress = progress;
    }
    isAdmin(user) {
        return user.roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
    }
    async hasActiveEnrollment(courseId, userId) {
        const enrollment = await this.enrollments.findOne({
            where: {
                user: { id: userId },
                course: { id: courseId },
                status: 'active',
            },
        });
        return Boolean(enrollment &&
            (!enrollment.expiresAt || enrollment.expiresAt > new Date()));
    }
    async canManageCourse(courseId, user) {
        const course = await this.courses.findOne({
            where: { id: courseId },
            relations: { leadTeacher: true },
        });
        if (!course)
            throw new NotFoundException('Course not found');
        if (!this.isAdmin(user) &&
            !(user.roles.includes('TEACHER') && course.leadTeacher.id === user.id))
            throw new ForbiddenException();
        return course;
    }
    async canAccessLesson(lessonId, user) {
        const lesson = await this.lessons.findOne({
            where: { id: lessonId },
            relations: {
                course: { leadTeacher: true },
                prerequisites: { prerequisiteLesson: true },
            },
        });
        if (!lesson ||
            lesson.status !== 'published' ||
            lesson.course.status !== 'published')
            throw new NotFoundException('Lesson not found');
        if (this.isAdmin(user) ||
            (user.roles.includes('TEACHER') &&
                lesson.course.leadTeacher.id === user.id))
            return lesson;
        const hasEnrollment = await this.hasActiveEnrollment(lesson.course.id, user.id);
        if (!lesson.isFree && !hasEnrollment)
            throw new ForbiddenException('An active enrollment is required');
        for (const edge of lesson.prerequisites ?? []) {
            const done = await this.progress.findOne({
                where: {
                    user: { id: user.id },
                    lesson: { id: edge.prerequisiteLesson.id },
                },
            });
            if (!done?.completedAt)
                throw new ForbiddenException('Complete prerequisite lessons first');
        }
        return lesson;
    }
};
LearningAccessService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Course)),
    __param(1, InjectRepository(Lesson)),
    __param(2, InjectRepository(Enrollment)),
    __param(3, InjectRepository(LessonProgress)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository])
], LearningAccessService);
export { LearningAccessService };
//# sourceMappingURL=learning-access.service.js.map