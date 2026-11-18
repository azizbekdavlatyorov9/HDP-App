import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.js';
import { CreateCourseDto, ListCoursesDto, UpdateCourseDto } from './courses.dto.js';
import { CoursesService } from './courses.service.js';
export declare class CoursesController {
    private readonly service;
    constructor(service: CoursesService);
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
    create(dto: CreateCourseDto, user: AuthenticatedUser): Promise<{
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
    update(id: string, dto: UpdateCourseDto, user: AuthenticatedUser): Promise<{
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
    remove(id: string, user: AuthenticatedUser): Promise<{
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
    publish(id: string, user: AuthenticatedUser): Promise<{
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
    archive(id: string, user: AuthenticatedUser): Promise<{
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
    assignTeacher(id: string, teacherId: string, user: AuthenticatedUser): Promise<{
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
}
export declare class CategoriesController {
    private readonly service;
    constructor(service: CoursesService);
    list(): Promise<import("../../database/entities/education.entity.js").Category[]>;
    courses(id: string, query: ListCoursesDto): Promise<{
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
    create(dto: import('./courses.dto.js').CategoryDto, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Category>;
    update(id: string, dto: import('./courses.dto.js').CategoryDto, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Category>;
    archive(id: string, user: AuthenticatedUser): Promise<import("../../database/entities/education.entity.js").Category>;
}
