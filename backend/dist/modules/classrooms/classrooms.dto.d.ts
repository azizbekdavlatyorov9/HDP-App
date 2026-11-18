export declare class ClassroomCreateDto {
    name: string;
    code: string;
    location?: string;
    capacity: number;
    description?: string;
}
export declare class ClassroomUpdateDto {
    name?: string;
    code?: string;
    location?: string;
    capacity?: number;
    description?: string;
}
export declare class ClassroomStatusDto {
    isActive: boolean;
}
