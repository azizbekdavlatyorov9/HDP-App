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
import { In, IsNull, Repository } from 'typeorm';
import { Course, Enrollment, Lesson, LessonPrerequisite, NotificationType, Subject, } from '../../database/entities/index.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
let LessonsService = class LessonsService {
    lessons;
    edges;
    courses;
    subjects;
    access;
    notifications;
    constructor(lessons, edges, courses, subjects, access, notifications) {
        this.lessons = lessons;
        this.edges = edges;
        this.courses = courses;
        this.subjects = subjects;
        this.access = access;
        this.notifications = notifications;
    }
    admin(user) {
        return this.access.isAdmin(user);
    }
    requireAdmin(user) {
        if (!this.admin(user))
            throw new ForbiddenException();
    }
    assertId(id, label) {
        if (!isUUID(id))
            throw new BadRequestException(`Invalid ${label}`);
    }
    async manage(lesson, user) {
        return this.access.canManageCourse(lesson.course.id, user);
    }
    publicView(lesson) {
        return {
            id: lesson.id,
            subjectId: lesson.subject?.id ?? null,
            courseId: lesson.course.id,
            title: lesson.title,
            description: lesson.description,
            orderIndex: lesson.position,
            videoUrl: lesson.videoUrl,
            materials: lesson.materials,
            status: lesson.status,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt,
        };
    }
    async assertPositionAvailable(courseId, subjectId, position, exceptId) {
        const existing = await this.lessons.findOne({
            where: subjectId
                ? { subject: { id: subjectId }, position }
                : { course: { id: courseId }, subject: IsNull(), position },
        });
        if (existing && existing.id !== exceptId)
            throw new BadRequestException('orderIndex must be unique within its subject');
    }
    async saveLesson(lesson) {
        try {
            return await this.lessons.save(lesson);
        }
        catch (error) {
            if (error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === '23505') {
                throw new BadRequestException('orderIndex must be unique within its subject');
            }
            throw error;
        }
    }
    async setPrerequisites(lesson, ids) {
        if (ids.includes(lesson.id))
            throw new BadRequestException('A lesson cannot depend on itself');
        const prereqs = ids.length
            ? await this.lessons.find({
                where: { id: In(ids), course: { id: lesson.course.id } },
            })
            : [];
        if (prereqs.length !== new Set(ids).size)
            throw new BadRequestException('Prerequisites must be lessons in the same course');
        for (const prereq of prereqs) {
            const pending = [prereq.id];
            const visited = new Set();
            while (pending.length) {
                const current = pending.pop();
                if (current === lesson.id)
                    throw new BadRequestException('Prerequisite cycle detected');
                if (visited.has(current))
                    continue;
                visited.add(current);
                const edges = await this.edges.find({
                    where: { lesson: { id: current } },
                    relations: { prerequisiteLesson: true },
                });
                pending.push(...edges.map((edge) => edge.prerequisiteLesson.id));
            }
        }
        await this.edges.delete({ lesson: { id: lesson.id } });
        if (prereqs.length)
            await this.edges.save(prereqs.map((prereq) => this.edges.create({ lesson, prerequisiteLesson: prereq })));
    }
    async create(courseId, dto, user) {
        this.requireAdmin(user);
        this.assertId(courseId, 'course ID');
        const course = await this.access.canManageCourse(courseId, user);
        await this.assertPositionAvailable(courseId, null, dto.position);
        const lesson = await this.saveLesson(this.lessons.create({
            course,
            subject: null,
            title: dto.title.trim(),
            description: dto.description ?? null,
            position: dto.position,
            videoUrl: null,
            materials: null,
            isFree: dto.isFree,
            status: 'draft',
        }));
        if (dto.prerequisites)
            await this.setPrerequisites(lesson, dto.prerequisites);
        return this.detailsForManager(lesson.id, user);
    }
    async createForSubject(subjectId, dto, user) {
        this.requireAdmin(user);
        this.assertId(subjectId, 'subject ID');
        const subject = await this.subjects.findOne({
            where: { id: subjectId },
            relations: { course: true },
        });
        if (!subject)
            throw new NotFoundException('Subject not found');
        if (subject.status !== 'active')
            throw new BadRequestException('Cannot add a lesson to an archived subject');
        if (subject.course.status !== 'published')
            throw new BadRequestException('Publish the course before adding lessons to its subject');
        await this.assertPositionAvailable(subject.course.id, subject.id, dto.orderIndex);
        const lesson = await this.saveLesson(this.lessons.create({
            course: subject.course,
            subject,
            title: dto.title.trim(),
            description: dto.description ?? null,
            position: dto.orderIndex,
            videoUrl: dto.videoUrl ?? null,
            materials: dto.materials ?? null,
            isFree: false,
            status: dto.status ?? 'draft',
        }));
        if (lesson.status === 'published')
            await this.notifyEnrolled(lesson, NotificationType.NEW_LESSON, `lesson-published:${lesson.id}`, 'New lesson available');
        return this.detailsForManager(lesson.id, user);
    }
    async publicListForSubject(subjectId) {
        this.assertId(subjectId, 'subject ID');
        const subject = await this.subjects.findOne({
            where: { id: subjectId },
            relations: { course: true },
        });
        if (!subject)
            throw new NotFoundException('Subject not found');
        if (subject.status !== 'active' || subject.course.status !== 'published')
            return [];
        const lessons = await this.lessons.find({
            where: { subject: { id: subjectId }, status: 'published' },
            order: { position: 'ASC' },
            relations: { course: true, subject: true },
        });
        return lessons.map((lesson) => this.publicView(lesson));
    }
    async publicDetail(id) {
        this.assertId(id, 'lesson ID');
        const lesson = await this.lessons.findOne({
            where: { id, status: 'published' },
            relations: { course: true, subject: { course: true } },
        });
        if (!lesson ||
            lesson.course.status !== 'published' ||
            (lesson.subject && lesson.subject.status !== 'active')) {
            throw new NotFoundException('Lesson not found');
        }
        return this.publicView(lesson);
    }
    async update(id, dto, user) {
        this.requireAdmin(user);
        this.assertId(id, 'lesson ID');
        const lesson = await this.lessons.findOne({
            where: { id },
            relations: { course: true, subject: true },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        await this.manage(lesson, user);
        if (dto.orderIndex !== undefined && dto.orderIndex !== lesson.position) {
            await this.assertPositionAvailable(lesson.course.id, lesson.subject?.id ?? null, dto.orderIndex, lesson.id);
            lesson.position = dto.orderIndex;
        }
        if (dto.title !== undefined)
            lesson.title = dto.title.trim();
        if (dto.description !== undefined)
            lesson.description = dto.description;
        if (dto.isFree !== undefined)
            lesson.isFree = dto.isFree;
        if (dto.videoUrl !== undefined)
            lesson.videoUrl = dto.videoUrl;
        if (dto.materials !== undefined)
            lesson.materials = dto.materials;
        if (dto.status !== undefined) {
            if (dto.status === 'published' && lesson.course.status !== 'published') {
                throw new BadRequestException('Publish the course first');
            }
            lesson.status = dto.status;
        }
        const saved = await this.saveLesson(lesson);
        if (dto.prerequisites)
            await this.setPrerequisites(saved, dto.prerequisites);
        const changed = dto.title !== undefined ||
            dto.description !== undefined ||
            dto.orderIndex !== undefined;
        if (changed && saved.status === 'published')
            await this.notifyEnrolled(saved, NotificationType.LESSON_UPDATED, `lesson-updated:${saved.id}:${saved.updatedAt?.getTime() ?? Date.now()}`, 'Lesson updated');
        return this.detailsForManager(id, user);
    }
    async reorder(courseId, ids, user) {
        this.requireAdmin(user);
        this.assertId(courseId, 'course ID');
        await this.access.canManageCourse(courseId, user);
        const existing = await this.lessons.find({
            where: { course: { id: courseId }, status: 'published' },
        });
        if (ids.length !== existing.length ||
            new Set(ids).size !== ids.length ||
            ids.some((id) => !existing.some((lesson) => lesson.id === id))) {
            throw new BadRequestException('Provide every published lesson exactly once');
        }
        await this.lessons.manager.transaction(async (manager) => {
            for (let index = 0; index < ids.length; index++)
                await manager.update(Lesson, { id: ids[index] }, { position: -(index + 1) });
            for (let index = 0; index < ids.length; index++)
                await manager.update(Lesson, { id: ids[index] }, { position: index + 1 });
        });
        return this.list(courseId, user);
    }
    async archive(id, user) {
        this.requireAdmin(user);
        this.assertId(id, 'lesson ID');
        const lesson = await this.lessons.findOne({
            where: { id },
            relations: { course: true },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        await this.manage(lesson, user);
        lesson.status = 'archived';
        return this.lessons.save(lesson);
    }
    async publish(id, user) {
        this.requireAdmin(user);
        this.assertId(id, 'lesson ID');
        const lesson = await this.lessons.findOne({
            where: { id },
            relations: { course: true, subject: true },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        await this.manage(lesson, user);
        if (lesson.course.status !== 'published')
            throw new BadRequestException('Publish the course first');
        if (lesson.subject && lesson.subject.status !== 'active')
            throw new BadRequestException('Activate the subject first');
        const newlyPublished = lesson.status !== 'published';
        lesson.status = 'published';
        const saved = await this.saveLesson(lesson);
        if (newlyPublished)
            await this.notifyEnrolled(saved, NotificationType.NEW_LESSON, `lesson-published:${saved.id}`, 'New lesson available');
        return saved;
    }
    async notifyEnrolled(lesson, type, eventKey, title) {
        const recipients = await this.lessons.manager
            .getRepository(Enrollment)
            .createQueryBuilder('enrollment')
            .select('enrollment.user_id', 'userId')
            .where('enrollment.course_id = :courseId AND enrollment.status = :status', {
            courseId: lesson.course.id,
            status: 'active',
        })
            .getRawMany();
        await this.notifications.createAndDeliverMany(recipients.map((recipient) => recipient.userId), {
            type,
            title,
            body: lesson.title,
            relatedEntityId: lesson.id,
            eventKey,
        });
    }
    async list(courseId, user) {
        this.assertId(courseId, 'course ID');
        const course = await this.courses.findOne({
            where: { id: courseId },
            relations: { leadTeacher: true },
        });
        if (!course)
            throw new NotFoundException('Course not found');
        const lessons = await this.lessons.find({
            where: { course: { id: courseId }, status: 'published' },
            order: { position: 'ASC' },
            relations: { prerequisites: { prerequisiteLesson: true } },
        });
        if (this.admin(user) ||
            (user.roles.includes('TEACHER') && course.leadTeacher.id === user.id)) {
            return lessons;
        }
        return Promise.all(lessons.map(async (lesson) => {
            try {
                await this.access.canAccessLesson(lesson.id, user);
                return lesson;
            }
            catch {
                return {
                    id: lesson.id,
                    title: lesson.title,
                    position: lesson.position,
                    isLocked: true,
                };
            }
        }));
    }
    async detail(id, user) {
        this.assertId(id, 'lesson ID');
        await this.access.canAccessLesson(id, user);
        const lesson = await this.lessons.findOne({
            where: { id },
            relations: { course: true, prerequisites: { prerequisiteLesson: true } },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        return {
            id: lesson.id,
            courseId: lesson.course.id,
            title: lesson.title,
            description: lesson.description,
            position: lesson.position,
            status: lesson.status,
            isFree: lesson.isFree,
            prerequisiteIds: lesson.prerequisites.map((edge) => edge.prerequisiteLesson.id),
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt,
        };
    }
    async detailsForManager(id, user) {
        const lesson = await this.lessons.findOne({
            where: { id },
            relations: {
                course: true,
                subject: true,
                prerequisites: { prerequisiteLesson: true },
            },
        });
        if (!lesson)
            throw new NotFoundException('Lesson not found');
        await this.manage(lesson, user);
        return {
            ...this.publicView(lesson),
            isFree: lesson.isFree,
            prerequisiteIds: lesson.prerequisites.map((edge) => edge.prerequisiteLesson.id),
        };
    }
};
LessonsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Lesson)),
    __param(1, InjectRepository(LessonPrerequisite)),
    __param(2, InjectRepository(Course)),
    __param(3, InjectRepository(Subject)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository,
        LearningAccessService,
        NotificationsService])
], LessonsService);
export { LessonsService };
//# sourceMappingURL=lessons.service.js.map