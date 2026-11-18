export declare class GroupCreateDto {
    name: string;
    code: string;
    courseId: string;
    teacherId: string;
    description?: string;
    capacity: number;
    startDate: string;
    endDate?: string;
}
export declare class GroupUpdateDto {
    name?: string;
    code?: string;
    courseId?: string;
    teacherId?: string;
    description?: string;
    capacity?: number;
    startDate?: string;
    endDate?: string | null;
}
export declare class GroupStatusDto {
    status: string;
}
export declare class AddStudentDto {
    studentId: string;
}
export declare class AddEnrollmentToGroupDto {
    enrollmentId: string;
}
export declare class AssignGroupTeacherDto {
    teacherId: string;
}
export declare class MembershipStatusDto {
    status: string;
}
export declare class GroupListDto {
    page: number;
    limit: number;
}
