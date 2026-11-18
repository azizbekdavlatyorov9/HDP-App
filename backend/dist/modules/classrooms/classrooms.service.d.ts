import { DataSource, Repository } from 'typeorm';
import { Classroom, GroupSchedule, LessonSession } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import type { ClassroomCreateDto, ClassroomUpdateDto } from './classrooms.dto.js';
export declare class ClassroomsService {
    private readonly rooms;
    private readonly schedules;
    private readonly sessions;
    private readonly db;
    constructor(rooms: Repository<Classroom>, schedules: Repository<GroupSchedule>, sessions: Repository<LessonSession>, db: DataSource);
    private admin;
    create(dto: ClassroomCreateDto, u: AuthenticatedUser): Promise<Classroom>;
    list(includeInactive: boolean, u: AuthenticatedUser): Promise<Classroom[]>;
    get(id: string): Promise<Classroom>;
    update(id: string, dto: ClassroomUpdateDto, u: AuthenticatedUser): Promise<Classroom>;
    setActive(id: string, isActive: boolean, u: AuthenticatedUser): Promise<Classroom>;
}
