import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { AssessmentsService } from './assessments.service.js';
import { CreateTestDto, SubmitTestDto } from './assessments.dto.js';
export declare class AssessmentsController {
    private readonly service;
    constructor(service: AssessmentsService);
    create(d: CreateTestDto, u: AuthenticatedUser): Promise<{
        id: string;
        status: "draft" | "published" | "archived";
    }>;
    publish(id: string, u: AuthenticatedUser): Promise<import("../../database/entities/assessment.entity.js").Test>;
    get(id: string, u: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        description: string | null;
        passingScore: number;
        timeLimitSeconds: number | null;
        questions: {
            id: string;
            prompt: string;
            position: number;
            points: number;
            allowMultipleAnswers: boolean;
            options: {
                id: string;
                text: string;
                position: number;
            }[];
        }[];
    }>;
    start(id: string, u: AuthenticatedUser): Promise<import("../../database/entities/assessment.entity.js").TestAttempt>;
    submit(id: string, d: SubmitTestDto, u: AuthenticatedUser): Promise<{
        id: string;
        scorePercent: number;
        passed: boolean;
        submittedAt: Date;
    }>;
    history(u: AuthenticatedUser): Promise<import("../../database/entities/assessment.entity.js").TestAttempt[]>;
}
