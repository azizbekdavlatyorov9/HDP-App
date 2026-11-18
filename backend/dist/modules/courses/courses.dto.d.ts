export declare class CreateCourseDto {
    title: string;
    slug?: string;
    description?: string;
    image?: string | null;
    thumbnailUrl?: string;
    price?: number;
    priceMinor?: string;
    currency?: string;
    duration?: number;
    status?: 'active' | 'inactive';
    leadTeacherId?: string;
    categoryIds?: string[];
}
export declare class UpdateCourseDto {
    title?: string;
    slug?: string;
    description?: string;
    image?: string | null;
    thumbnailUrl?: string;
    price?: number;
    priceMinor?: string;
    currency?: string;
    duration?: number;
    status?: 'active' | 'inactive';
    categoryIds?: string[];
}
export declare class ListCoursesDto {
    search?: string;
    category?: string;
    page: number;
    limit: number;
    sort: 'createdAt' | 'title';
    order: 'ASC' | 'DESC';
}
export declare class CategoryDto {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
}
export declare class UpdateCategoryDto extends CategoryDto {
}
export declare class CourseResponseDto {
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
    status: 'active' | 'inactive';
    lifecycleStatus: 'draft' | 'published' | 'archived';
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
}
