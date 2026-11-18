export declare class CreateLessonDto {
    title: string;
    description?: string;
    position: number;
    isFree: boolean;
    prerequisites?: string[];
}
export declare class UpdateLessonDto {
    title?: string;
    description?: string;
    isFree?: boolean;
    orderIndex?: number;
    videoUrl?: string | null;
    materials?: Record<string, unknown>[] | null;
    status?: 'draft' | 'published' | 'archived';
    prerequisites?: string[];
}
export declare class CreateSubjectLessonDto {
    title: string;
    description?: string;
    orderIndex: number;
    videoUrl?: string | null;
    materials?: Record<string, unknown>[] | null;
    status?: 'draft' | 'published' | 'archived';
}
export declare class ReorderLessonsDto {
    lessonIds: string[];
}
