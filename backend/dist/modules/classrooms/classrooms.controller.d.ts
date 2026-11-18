import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { ClassroomCreateDto, ClassroomStatusDto, ClassroomUpdateDto } from './classrooms.dto.js';
import { ClassroomsService } from './classrooms.service.js';
export declare class ClassroomsController {
    private readonly service;
    constructor(service: ClassroomsService);
    create(d: ClassroomCreateDto, u: AuthenticatedUser): Promise<import("../../database/entities/groups.entity.js").Classroom>;
    list(inactive: string | undefined, u: AuthenticatedUser): Promise<import("../../database/entities/groups.entity.js").Classroom[]>;
    get(id: string): Promise<import("../../database/entities/groups.entity.js").Classroom>;
    update(id: string, d: ClassroomUpdateDto, u: AuthenticatedUser): Promise<import("../../database/entities/groups.entity.js").Classroom>;
    status(id: string, d: ClassroomStatusDto, u: AuthenticatedUser): Promise<import("../../database/entities/groups.entity.js").Classroom>;
}
