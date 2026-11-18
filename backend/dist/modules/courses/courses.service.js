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
import { In, IsNull, Repository } from 'typeorm';
import { Category, Course, CourseCategory, NotificationType, User, UserRole, } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
let CoursesService = class CoursesService {
    courses;
    categories;
    courseCategories;
    users;
    userRoles;
    access;
    notifications;
    constructor(courses, categories, courseCategories, users, userRoles, access, notifications) {
        this.courses = courses;
        this.categories = categories;
        this.courseCategories = courseCategories;
        this.users = users;
        this.userRoles = userRoles;
        this.access = access;
        this.notifications = notifications;
    }
    relations = {
        leadTeacher: true,
        courseCategories: { category: true },
    };
    async byId(id) {
        if (!isUUID(id))
            throw new BadRequestException('Invalid course ID');
        const course = await this.courses.findOne({
            where: { id },
            relations: this.relations,
        });
        if (!course)
            throw new NotFoundException('Course not found');
        return course;
    }
    map(c) {
        return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            image: c.thumbnailUrl,
            thumbnailUrl: c.thumbnailUrl,
            price: Number(c.priceMinor),
            priceMinor: c.priceMinor,
            currency: c.currency,
            duration: c.duration,
            status: c.status === 'published' ? 'active' : 'inactive',
            lifecycleStatus: c.status,
            leadTeacher: {
                id: c.leadTeacher.id,
                displayName: c.leadTeacher.displayName,
            },
            categories: (c.courseCategories ?? [])
                .filter((x) => !x.category.archivedAt)
                .map((x) => ({
                id: x.category.id,
                name: x.category.name,
                slug: x.category.slug,
            })),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        };
    }
    async assertSlug(slug, except) {
        const existing = await this.courses.findOne({ where: { slug } });
        if (existing && existing.id !== except)
            throw new ConflictException('Slug already exists');
    }
    async generatedSlug(title) {
        const base = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 190) || 'course';
        let slug = base;
        let suffix = 2;
        while (await this.courses.findOne({ where: { slug } })) {
            const tail = `-${suffix++}`;
            slug = `${base.slice(0, 200 - tail.length)}${tail}`;
        }
        return slug;
    }
    async setCategories(course, ids) {
        const categories = ids.length
            ? await this.categories.find({
                where: { id: In(ids), archivedAt: IsNull() },
            })
            : [];
        if (categories.length !== new Set(ids).size)
            throw new BadRequestException('One or more categories are missing or archived');
        await this.courseCategories.delete({ course: { id: course.id } });
        if (categories.length)
            await this.courseCategories.save(categories.map((category) => this.courseCategories.create({ course, category })));
    }
    async getTeacher(id) {
        const user = await this.users.findOne({ where: { id, status: 'active' } });
        if (!user)
            throw new BadRequestException('Lead teacher must be an active user');
        const hasRole = await this.userRoles.findOne({
            where: { user: { id }, role: { code: 'TEACHER' } },
        });
        if (!hasRole)
            throw new BadRequestException('Lead teacher must have the TEACHER role');
        return user;
    }
    async create(dto, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        const slug = dto.slug ?? (await this.generatedSlug(dto.title));
        await this.assertSlug(slug);
        const leadTeacher = dto.leadTeacherId
            ? await this.getTeacher(dto.leadTeacherId)
            : await this.users.findOne({ where: { id: actor.id, status: 'active' } });
        if (!leadTeacher)
            throw new BadRequestException('Course owner must be an active user');
        const course = this.courses.create({
            title: dto.title.trim(),
            slug,
            description: dto.description ?? null,
            thumbnailUrl: dto.image ?? dto.thumbnailUrl ?? null,
            duration: dto.duration ?? null,
            priceMinor: dto.priceMinor ?? String(dto.price),
            currency: (dto.currency ?? 'UZS').toUpperCase(),
            status: dto.status === 'active'
                ? 'published'
                : dto.status === 'inactive'
                    ? 'archived'
                    : 'draft',
            leadTeacher,
        });
        const saved = await this.courses.save(course);
        if (dto.categoryIds)
            await this.setCategories(saved, dto.categoryIds);
        if (saved.status === 'published') {
            const recipients = await this.users.find({
                where: { status: 'active' },
                select: { id: true },
            });
            await this.notifications.createAndDeliverMany(recipients.map((recipient) => recipient.id), {
                type: NotificationType.COURSE_PUBLISHED,
                title: 'New course available',
                body: saved.title,
                relatedEntityId: saved.id,
                eventKey: `course-published:${saved.id}`,
            });
        }
        return this.map(await this.byId(saved.id));
    }
    async update(id, dto, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        const course = await this.access.canManageCourse(id, actor);
        const loaded = await this.byId(course.id);
        if (dto.slug)
            await this.assertSlug(dto.slug, id);
        if (dto.title !== undefined)
            loaded.title = dto.title.trim();
        if (dto.slug !== undefined)
            loaded.slug = dto.slug;
        if (dto.description !== undefined)
            loaded.description = dto.description;
        if (dto.image !== undefined)
            loaded.thumbnailUrl = dto.image;
        else if (dto.thumbnailUrl !== undefined)
            loaded.thumbnailUrl = dto.thumbnailUrl;
        if (dto.priceMinor !== undefined)
            loaded.priceMinor = dto.priceMinor;
        else if (dto.price !== undefined)
            loaded.priceMinor = String(dto.price);
        if (dto.currency !== undefined)
            loaded.currency = dto.currency.toUpperCase();
        if (dto.duration !== undefined)
            loaded.duration = dto.duration;
        if (dto.categoryIds)
            await this.setCategories(loaded, dto.categoryIds);
        await this.courses.save(loaded);
        if (dto.status !== undefined)
            return this.setStatus(id, dto.status === 'active' ? 'published' : 'archived', actor);
        return this.map(await this.byId(id));
    }
    async assignTeacher(id, teacherId, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        const course = await this.byId(id);
        course.leadTeacher = await this.getTeacher(teacherId);
        return this.map(await this.courses.save(course));
    }
    async setStatus(id, status, actor) {
        await this.access.canManageCourse(id, actor);
        const course = await this.byId(id);
        if (status === 'published') {
            if (course.courseCategories.some((cc) => cc.category.archivedAt))
                throw new BadRequestException('Course contains archived categories');
        }
        const wasPublished = course.status === 'published';
        course.status = status;
        const saved = await this.courses.save(course);
        if (status === 'published' && !wasPublished) {
            const recipients = await this.users.find({
                where: { status: 'active' },
                select: { id: true },
            });
            await this.notifications.createAndDeliverMany(recipients.map((r) => r.id), {
                type: NotificationType.COURSE_PUBLISHED,
                title: 'New course available',
                body: course.title,
                relatedEntityId: course.id,
                eventKey: `course-published:${course.id}`,
            });
        }
        return this.map(saved);
    }
    async remove(id, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        return this.setStatus(id, 'archived', actor);
    }
    async list(query) {
        const qb = this.courses
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.leadTeacher', 'teacher')
            .leftJoinAndSelect('course.courseCategories', 'cc')
            .leftJoinAndSelect('cc.category', 'category')
            .where('course.status = :status', { status: 'published' });
        if (query.search)
            qb.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', { search: `%${query.search}%` });
        if (query.category)
            qb.andWhere('category.slug = :slug AND category.archivedAt IS NULL', {
                slug: query.category,
            });
        const [rows, total] = await qb
            .orderBy(`course.${query.sort}`, query.order)
            .skip((query.page - 1) * query.limit)
            .take(query.limit)
            .getManyAndCount();
        return {
            data: rows.map((row) => this.map(row)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                pages: Math.ceil(total / query.limit),
            },
        };
    }
    async details(id) {
        const c = await this.byId(id);
        if (c.status !== 'published')
            throw new NotFoundException();
        return this.map(c);
    }
    async createCategory(dto, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        if (await this.categories.exists({ where: { slug: dto.slug } }))
            throw new ConflictException('Slug already exists');
        const parent = dto.parentId
            ? await this.categories.findOne({
                where: { id: dto.parentId, archivedAt: IsNull() },
            })
            : null;
        if (dto.parentId && !parent)
            throw new BadRequestException('Parent category not found');
        return this.categories.save(this.categories.create({
            name: dto.name,
            slug: dto.slug,
            description: dto.description ?? null,
            parent,
        }));
    }
    async updateCategory(id, dto, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        const c = await this.categories.findOne({
            where: { id, archivedAt: IsNull() },
            relations: { parent: true },
        });
        if (!c)
            throw new NotFoundException();
        const collision = await this.categories.findOne({
            where: { slug: dto.slug },
        });
        if (collision && collision.id !== id)
            throw new ConflictException('Slug already exists');
        c.name = dto.name;
        c.slug = dto.slug;
        c.description = dto.description ?? null;
        if (dto.parentId === id)
            throw new BadRequestException('Category cannot be its own parent');
        c.parent = dto.parentId
            ? await this.categories.findOne({
                where: { id: dto.parentId, archivedAt: IsNull() },
            })
            : null;
        if (dto.parentId && !c.parent)
            throw new BadRequestException('Parent category not found');
        return this.categories.save(c);
    }
    async archiveCategory(id, actor) {
        if (!this.access.isAdmin(actor))
            throw new ForbiddenException();
        const c = await this.categories.findOne({
            where: { id, archivedAt: IsNull() },
        });
        if (!c)
            throw new NotFoundException();
        c.archivedAt = new Date();
        return this.categories.save(c);
    }
    async listCategories() {
        return this.categories.find({
            where: { archivedAt: IsNull() },
            order: { name: 'ASC' },
        });
    }
    async categoryCourses(id, query) {
        const category = await this.categories.findOne({
            where: { id, archivedAt: IsNull() },
        });
        if (!category)
            throw new NotFoundException();
        const qb = this.courses
            .createQueryBuilder('course')
            .innerJoin('course.courseCategories', 'cc', 'cc.category_id = :id', {
            id,
        })
            .leftJoinAndSelect('course.leadTeacher', 'teacher')
            .leftJoinAndSelect('course.courseCategories', 'allcc')
            .leftJoinAndSelect('allcc.category', 'cat')
            .where('course.status = :status', { status: 'published' });
        const [rows, total] = await qb
            .orderBy(`course.${query.sort}`, query.order)
            .skip((query.page - 1) * query.limit)
            .take(query.limit)
            .getManyAndCount();
        return {
            data: rows.map((r) => this.map(r)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                pages: Math.ceil(total / query.limit),
            },
        };
    }
};
CoursesService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Course)),
    __param(1, InjectRepository(Category)),
    __param(2, InjectRepository(CourseCategory)),
    __param(3, InjectRepository(User)),
    __param(4, InjectRepository(UserRole)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository,
        Repository,
        LearningAccessService,
        NotificationsService])
], CoursesService);
export { CoursesService };
//# sourceMappingURL=courses.service.js.map