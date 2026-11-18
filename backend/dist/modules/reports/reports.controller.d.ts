import type { Response } from 'express';
import { DashboardQueryDto, ReportQueryDto } from './reports.dto.js';
import { ReportsService } from './reports.service.js';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    dashboard(q: DashboardQueryDto): Promise<{
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
    studentStatistics(q: ReportQueryDto): Promise<any>;
    exportStudents(q: ReportQueryDto, res: Response): Promise<void>;
    studentDetail(id: string): Promise<{
        student: any;
        groups: any;
        enrollments: any;
        attendance: any;
        assignments: any;
        payments: any;
    }>;
    students(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    teacherStatistics(): Promise<any>;
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
    teachers(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    courseDetail(id: string): Promise<any>;
    courses(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    groupDetail(id: string): Promise<any>;
    groups(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    exportAttendance(q: ReportQueryDto, res: Response): Promise<void>;
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
    exportFinance(q: ReportQueryDto, res: Response): Promise<void>;
    payments(q: ReportQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    revenue(q: ReportQueryDto): Promise<any>;
    providers(q: ReportQueryDto): Promise<any>;
    courseRevenue(q: ReportQueryDto): Promise<any>;
    exportAssignments(q: ReportQueryDto, res: Response): Promise<void>;
    assignments(q: ReportQueryDto): Promise<{
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
    exportLeads(q: ReportQueryDto, res: Response): Promise<void>;
}
