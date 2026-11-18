export declare class CreateSubjectDto {
    title: string;
    description?: string | null;
}
export declare class UpdateSubjectDto {
    title?: string;
    description?: string | null;
    status?: 'active' | 'archived';
}
