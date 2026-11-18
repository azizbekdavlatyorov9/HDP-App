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
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { QueryFailedError, Repository } from 'typeorm';
import { Course, Enrollment, User } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
let EnrollmentsService = class EnrollmentsService {
    enrollments;
    users;
    courses;
    access;
    constructor(enrollments, users, courses, access) {
        this.enrollments = enrollments;
        this.users = users;
        this.courses = courses;
        this.access = access;
    }
    id(value) {
        if (!isUUID(value))
            throw new BadRequestException('Invalid UUID');
    }
    admin(user) {
        if (!this.access.isAdmin(user))
            throw new ForbiddenException();
    }
    view(row) {
        return {
            id: row.id,
            user: { id: row.user.id, displayName: row.user.displayName },
            course: { id: row.course.id, title: row.course.title },
            status: row.status,
            source: row.source,
            enrolledAt: row.enrolledAt,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt,
        };
    }
    async manual(dto, actor) {
        this.admin(actor);
        this.id(dto.userId);
        this.id(dto.courseId);
        const [user, course] = await Promise.all([
            this.users.findOne({
                where: {
                    id: dto.userId,
                    status: 'active',
                    userRoles: { role: { code: 'STUDENT' } },
                },
                relations: { userRoles: { role: true } },
            }),
            this.courses.findOne({
                where: { id: dto.courseId, status: 'published' },
            }),
        ]);
        if (!user)
            throw new NotFoundException('Active student not found');
        if (!course)
            throw new NotFoundException('Published course not found');
        if (await this.enrollments.findOne({
            where: { user: { id: user.id }, course: { id: course.id } },
        }))
            throw new ConflictException('Enrollment already exists');
        const row = this.enrollments.create({
            user,
            course,
            status: 'active',
            source: 'admin',
            enrolledAt: new Date(),
            expiresAt: null,
        });
        try {
            return this.view(await this.enrollments.save(row));
        }
        catch (error) {
            if (error instanceof QueryFailedError &&
                error.driverError?.code === '23505')
                throw new ConflictException('Enrollment already exists');
            throw error;
        }
    }
    async mine(user) {
        const rows = await this.enrollments.find({
            where: { user: { id: user.id } },
            relations: { user: true, course: true },
            order: { createdAt: 'DESC' },
        });
        return rows.map((row) => this.view(row));
    }
    async adminList(actor) {
        this.admin(actor);
        const rows = await this.enrollments.find({
            relations: { user: true, course: true },
            order: { createdAt: 'DESC' },
        });
        return rows.map((row) => this.view(row));
    }
    async detail(id, actor) {
        this.id(id);
        const admin = this.access.isAdmin(actor);
        const row = await this.enrollments.findOne({
            where: admin ? { id } : { id, user: { id: actor.id } },
            relations: { user: true, course: true },
        });
        if (!row)
            throw new NotFoundException('Enrollment not found');
        return this.view(row);
    }
    async setStatus(id, status, actor) {
        this.admin(actor);
        this.id(id);
        const row = await this.enrollments.findOne({
            where: { id },
            relations: { user: true, course: true },
        });
        if (!row)
            throw new NotFoundException('Enrollment not found');
        row.status = status;
        return this.view(await this.enrollments.save(row));
    }
};
EnrollmentsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Enrollment)),
    __param(1, InjectRepository(User)),
    __param(2, InjectRepository(Course)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        LearningAccessService])
], EnrollmentsService);
export { EnrollmentsService };
//# sourceMappingURL=enrollments.service.js.map