import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { ProgressService } from './progress.service.js';
import { WatchProgressDto } from './progress.dto.js';
export declare class ProgressController {
    private readonly service;
    constructor(service: ProgressService);
    watch(id: string, d: WatchProgressDto, u: AuthenticatedUser): Promise<import("../../database/entities/progress.entity.js").LessonProgress>;
    complete(id: string, u: AuthenticatedUser): Promise<import("../../database/entities/progress.entity.js").CourseProgress>;
    mine(u: AuthenticatedUser): Promise<import("../../database/entities/progress.entity.js").CourseProgress[]>;
    overview(id: string, u: AuthenticatedUser): Promise<import("../../database/entities/progress.entity.js").CourseProgress[]>;
    forStudent(c: string, id: string, u: AuthenticatedUser): Promise<import("../../database/entities/progress.entity.js").CourseProgress[]>;
}
