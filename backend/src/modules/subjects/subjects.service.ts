import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Course, Subject } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './subjects.dto.js';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjects: Repository<Subject>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    private readonly access: LearningAccessService,
  ) {}

  private assertId(id: string, field: string) {
    if (!isUUID(id)) throw new BadRequestException(`Invalid ${field}`);
  }

  private admin(user: AuthenticatedUser) {
    if (!this.access.isAdmin(user)) throw new ForbiddenException();
  }

  private view(subject: Subject) {
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

  async listForCourse(courseId: string) {
    this.assertId(courseId, 'course ID');
    const course = await this.courses.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'published') return [];
    const rows = await this.subjects.find({
      where: { course: { id: courseId }, status: 'active' },
      order: { createdAt: 'ASC' },
      relations: { course: true },
    });
    return rows.map((subject) => this.view(subject));
  }

  async get(id: string) {
    this.assertId(id, 'subject ID');
    const subject = await this.subjects.findOne({
      where: { id, status: 'active' },
      relations: { course: true },
    });
    if (!subject || subject.course.status !== 'published')
      throw new NotFoundException('Subject not found');
    return this.view(subject);
  }

  async create(
    courseId: string,
    dto: CreateSubjectDto,
    user: AuthenticatedUser,
  ) {
    this.admin(user);
    this.assertId(courseId, 'course ID');
    const course = await this.courses.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status === 'archived')
      throw new BadRequestException(
        'Cannot add a subject to an archived course',
      );

    const subject = this.subjects.create({
      course,
      title: dto.title.trim(),
      description: dto.description ?? null,
      status: 'active',
    });
    return this.view(await this.subjects.save(subject));
  }

  async update(id: string, dto: UpdateSubjectDto, user: AuthenticatedUser) {
    this.admin(user);
    this.assertId(id, 'subject ID');
    const subject = await this.subjects.findOne({
      where: { id },
      relations: { course: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    if (subject.status === 'archived')
      throw new NotFoundException('Subject not found');
    if (dto.title !== undefined) subject.title = dto.title.trim();
    if (dto.description !== undefined) subject.description = dto.description;
    if (dto.status !== undefined) subject.status = dto.status;
    return this.view(await this.subjects.save(subject));
  }

  async archive(id: string, user: AuthenticatedUser) {
    this.admin(user);
    this.assertId(id, 'subject ID');
    const subject = await this.subjects.findOne({
      where: { id },
      relations: { course: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    if (subject.status !== 'archived') {
      subject.status = 'archived';
      await this.subjects.save(subject);
    }
    return this.view(subject);
  }
}
