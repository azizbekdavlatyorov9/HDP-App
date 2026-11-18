export declare class ReportQueryDto {
    from?: string;
    to?: string;
    timezone: string;
    page: number;
    limit: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
    courseId?: string;
    assignmentId?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    provider?: string;
    submissionStatus?: string;
    membershipStatus?: string;
}
export declare class DashboardQueryDto extends ReportQueryDto {
}
