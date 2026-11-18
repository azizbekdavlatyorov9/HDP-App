import { DataSource } from 'typeorm';
import { ReportQueryDto } from './reports.dto.js';
export declare class ReportsService {
    private readonly db;
    constructor(db: DataSource);
    private period;
    private range;
    private filters;
    private pg;
    dashboard(q: ReportQueryDto): Promise<{
        period: {
            from: Date | null;
            toExclusive: Date | null;
            timezone: string;
        };
        students: any;
        courses: any;
        groups: any;
        attendance: any;
        finance: {
            successful: {
                currency: string;
                successfulCount: number;
                successfulAmountMinor: string;
            }[];
            failedCount: number;
            cancelledCount: null;
            cancellationCountUnavailable: string;
            pendingCount: number;
            refunds: {
                available: boolean;
                amountMinor: null;
                reason: string;
            };
            byProvider: any;
        };
        assignments: any;
        crm: any;
    }>;
    studentList(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    studentDetail(id: string): Promise<{
        student: any;
        groups: any;
        enrollments: any;
        attendance: any;
        assignments: any;
        payments: any;
    }>;
    studentStatistics(q: ReportQueryDto): Promise<any>;
    teacherList(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    teacherDetail(id: string): Promise<{
        teacher: any;
        groups: any;
        sessions: any;
        attendance: {
            denominator: number;
            attendanceRate: number;
            absenceRate: number;
            lateRate: number;
        };
        assignments: any;
    }>;
    teacherStatistics(): Promise<any>;
    courseList(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    courseDetail(id: string): Promise<any>;
    groupList(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    groupDetail(id: string): Promise<any>;
    attendance(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    financeOverview(q: ReportQueryDto): Promise<{
        byStatus: any;
        successful: {
            currency: string;
            successfulCount: number;
            successfulAmountMinor: string;
        }[];
        grossVolumeMeaning: string;
        refunds: {
            available: boolean;
            reason: string;
        };
    }>;
    paymentList(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    revenueByPeriod(q: ReportQueryDto): Promise<any>;
    providers(q: ReportQueryDto): Promise<any>;
    courseRevenue(q: ReportQueryDto): Promise<any>;
    assignmentReports(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    crmOverview(q: ReportQueryDto): Promise<{
        overview: any;
        bySource: any;
        byStatus: any;
        trials: any;
        operators: any;
    }>;
    crmConversion(q: ReportQueryDto): Promise<{
        byStatus: any;
        total: any;
        converted: number;
        conversionRate: number;
        definition: string;
    }>;
    crmOperators(q: ReportQueryDto): Promise<any>;
    export(kind: 'students' | 'attendance' | 'finance' | 'assignments' | 'leads', q: ReportQueryDto): Promise<string>;
}
