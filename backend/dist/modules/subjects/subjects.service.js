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
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Course, Subject } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
let SubjectsService = class SubjectsService {
    subjects;
    courses;
    access;
    constructor(subjects, courses, access) {
        this.subjects = subjects;
        this.courses = courses;
        this.access = access;
    }
    assertId(id, field) {
        if (!isUUID(id))
            throw new BadRequestException(`Invalid ${field}`);
    }
    admin(user) {
        if (!this.access.isAdmin(user))
            throw new ForbiddenException();
    }
    view(subject) {
        return {
            id: subject.id,
            title: subject.title,
            description: subject.description,
            courseId: subject.course.id,
            status: subject.status,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt,
        };
    }
    async listForCourse(courseId) {
        this.assertId(courseId, 'course ID');
        const course = await this.courses.findOne({ where: { id: courseId } });
        if (!course)
            throw new NotFoundException('Course not found');
        if (course.status !== 'published')
            return [];
        const rows = await this.subjects.find({
            where: { course: { id: courseId }, status: 'active' },
            order: { createdAt: 'ASC' },
            relations: { course: true },
        });
        return rows.map((subject) => this.view(subject));
    }
    async get(id) {
        this.assertId(id, 'subject ID');
        const subject = await this.subjects.findOne({
            where: { id, status: 'active' },
            relations: { course: true },
        });
        if (!subject || subject.course.status !== 'published')
            throw new NotFoundException('Subject not found');
        return this.view(subject);
    }
    async create(courseId, dto, user) {
        this.admin(user);
        this.assertId(courseId, 'course ID');
        const course = await this.courses.findOne({ where: { id: courseId } });
        if (!course)
            throw new NotFoundException('Course not found');
        if (course.status === 'archived')
            throw new BadRequestException('Cannot add a subject to an archived course');
        const subject = this.subjects.create({
            course,
            title: dto.title.trim(),
            description: dto.description ?? null,
            status: 'active',
        });
        return this.view(await this.subjects.save(subject));
    }
    async update(id, dto, user) {
        this.admin(user);
        this.assertId(id, 'subject ID');
        const subject = await this.subjects.findOne({
            where: { id },
            relations: { course: true },
        });
        if (!subject)
            throw new NotFoundException('Subject not found');
        if (subject.status === 'archived')
            throw new NotFoundException('Subject not found');
        if (dto.title !== undefined)
            subject.title = dto.title.trim();
        if (dto.description !== undefined)
            subject.description = dto.description;
        if (dto.status !== undefined)
            subject.status = dto.status;
        return this.view(await this.subjects.save(subject));
    }
    async archive(id, user) {
        this.admin(user);
        this.assertId(id, 'subject ID');
        const subject = await this.subjects.findOne({
            where: { id },
            relations: { course: true },
        });
        if (!subject)
            throw new NotFoundException('Subject not found');
        if (subject.status !== 'archived') {
            subject.status = 'archived';
            await this.subjects.save(subject);
        }
        return this.view(subject);
    }
};
SubjectsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Subject)),
    __param(1, InjectRepository(Course)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        LearningAccessService])
], SubjectsService);
export { SubjectsService };
//# sourceMappingURL=subjects.service.js.map