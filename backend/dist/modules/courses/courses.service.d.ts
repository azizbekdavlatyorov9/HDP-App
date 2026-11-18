import { Repository } from 'typeorm';
import { Category, Course, CourseCategory, User, UserRole } from '../../database/entities/index.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { LearningAccessService } from '../learning/learning-access.service.js';
import type { CreateCourseDto, ListCoursesDto, UpdateCourseDto, CategoryDto } from './courses.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
export declare class CoursesService {
    private readonly courses;
    private readonly categories;
    private readonly courseCategories;
    private readonly users;
    private readonly userRoles;
    private readonly access;
    private readonly notifications;
    constructor(courses: Repository<Course>, categories: Repository<Category>, courseCategories: Repository<CourseCategory>, users: Repository<User>, userRoles: Repository<UserRole>, access: LearningAccessService, notifications: NotificationsService);
    private readonly relations;
    private byId;
    private map;
    private assertSlug;
    private generatedSlug;
    private setCategories;
    private getTeacher;
    create(dto: CreateCourseDto, actor: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateCourseDto, actor: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignTeacher(id: string, teacherId: string, actor: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    setStatus(id: string, status: 'published' | 'archived', actor: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, actor: AuthenticatedUser): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(query: ListCoursesDto): Promise<{
        data: {
            id: string;
            title: string;
            slug: string;
            description: string | null;
            image: string | null;
            thumbnailUrl: string | null;
            price: number;
            priceMinor: string;
            currency: string;
            duration: number | null;
            status: "active" | "inactive";
            lifecycleStatus: "draft" | "published" | "archived";
            leadTeacher: {
                id: string;
                displayName: string;
            };
            categories: {
                id: string;
                name: string;
                slug: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    details(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        image: string | null;
        thumbnailUrl: string | null;
        price: number;
        priceMinor: string;
        currency: string;
        duration: number | null;
        status: "active" | "inactive";
        lifecycleStatus: "draft" | "published" | "archived";
        leadTeacher: {
            id: string;
            displayName: string;
        };
        categories: {
            id: string;
            name: string;
            slug: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCategory(dto: CategoryDto, actor: AuthenticatedUser): Promise<Category>;
    updateCategory(id: string, dto: CategoryDto, actor: AuthenticatedUser): Promise<Category>;
    archiveCategory(id: string, actor: AuthenticatedUser): Promise<Category>;
    listCategories(): Promise<Category[]>;
    categoryCourses(id: string, query: ListCoursesDto): Promise<{
        data: {
            id: string;
            title: string;
            slug: string;
            description: string | null;
            image: string | null;
            thumbnailUrl: string | null;
            price: number;
            priceMinor: string;
            currency: string;
            duration: number | null;
            status: "active" | "inactive";
            lifecycleStatus: "draft" | "published" | "archived";
            leadTeacher: {
                id: string;
                displayName: string;
            };
            categories: {
                id: string;
                name: string;
                slug: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
