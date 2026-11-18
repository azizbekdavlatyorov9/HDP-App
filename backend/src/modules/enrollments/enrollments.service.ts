import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { QueryFailedError, Repository } from 'typeorm';
import { Course, Enrollment, User } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { ManualEnrollmentDto } from './enrollments.dto.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    private readonly access: LearningAccessService,
  ) {}

  private id(value: string) {
    if (!isUUID(value)) throw new BadRequestException('Invalid UUID');
  }
  private admin(user: AuthenticatedUser) {
    if (!this.access.isAdmin(user)) throw new ForbiddenException();
  }
  private view(row: Enrollment) {
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

  async manual(dto: ManualEnrollmentDto, actor: AuthenticatedUser) {
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
    if (!user) throw new NotFoundException('Active student not found');
    if (!course) throw new NotFoundException('Published course not found');
    if (
      await this.enrollments.findOne({
        where: { user: { id: user.id }, course: { id: course.id } },
      })
    )
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
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23505'
      )
        throw new ConflictException('Enrollment already exists');
      throw error;
    }
  }

  async mine(user: AuthenticatedUser) {
    const rows = await this.enrollments.find({
      where: { user: { id: user.id } },
      relations: { user: true, course: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.view(row));
  }

  async adminList(actor: AuthenticatedUser) {
    this.admin(actor);
    const rows = await this.enrollments.find({
      relations: { user: true, course: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.view(row));
  }

  async detail(id: string, actor: AuthenticatedUser) {
    this.id(id);
    const admin = this.access.isAdmin(actor);
    const row = await this.enrollments.findOne({
      where: admin ? { id } : { id, user: { id: actor.id } },
      relations: { user: true, course: true },
    });
    if (!row) throw new NotFoundException('Enrollment not found');
    return this.view(row);
  }

  async setStatus(
    id: string,
    status: Enrollment['status'],
    actor: AuthenticatedUser,
  ) {
    this.admin(actor);
    this.id(id);
    const row = await this.enrollments.findOne({
      where: { id },
      relations: { user: true, course: true },
    });
    if (!row) throw new NotFoundException('Enrollment not found');
    row.status = status;
    return this.view(await this.enrollments.save(row));
  }
}
