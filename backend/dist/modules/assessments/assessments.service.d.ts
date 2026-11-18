import { DataSource, Repository } from 'typeorm';
import { AnswerOption, Enrollment, Question, Test, TestAttempt } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { CreateTestDto, SubmitTestDto } from './assessments.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
export declare class AssessmentsService {
    private readonly tests;
    private readonly questions;
    private readonly options;
    private readonly attempts;
    private readonly enrollments;
    private readonly db;
    private readonly access;
    private readonly notifications;
    constructor(tests: Repository<Test>, questions: Repository<Question>, options: Repository<AnswerOption>, attempts: Repository<TestAttempt>, enrollments: Repository<Enrollment>, db: DataSource, access: LearningAccessService, notifications: NotificationsService);
    create(dto: CreateTestDto, u: AuthenticatedUser): Promise<{
        id: string;
        status: "draft" | "published" | "archived";
    }>;
    publish(id: string, u: AuthenticatedUser): Promise<Test>;
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
    start(id: string, u: AuthenticatedUser): Promise<TestAttempt>;
    submit(attemptId: string, dto: SubmitTestDto, u: AuthenticatedUser): Promise<{
        id: string;
        scorePercent: number;
        passed: boolean;
        submittedAt: Date;
    }>;
    history(u: AuthenticatedUser): Promise<TestAttempt[]>;
}
