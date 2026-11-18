export interface ReportPeriod {
    from?: Date;
    toExclusive?: Date;
    timezone: string;
}
export declare function localMidnightToUtc(day: string, zone: string): Date;
export declare function parseReportPeriod(from?: string, to?: string, timezone?: string): ReportPeriod;
export declare function attendanceRates(input: {
    present: number;
    absent: number;
    late: number;
    excused: number;
}): {
    denominator: number;
    attendanceRate: number;
    absenceRate: number;
    lateRate: number;
};
export declare function paymentTotals(rows: Array<{
    currency: string;
    amountMinor: string;
    count: number;
}>): {
    currency: string;
    successfulCount: number;
    successfulAmountMinor: string;
}[];
export declare function aggregateSuccessfulPayments(rows: Array<{
    id: string;
    status: string;
    currency: string;
    amountMinor: string;
}>): {
    currency: string;
    count: number;
    amountMinor: string;
}[];
export declare function submissionRate(submissions: number, eligible: number): number;
export declare function crmConversionRate(won: number, total: number): number;
export declare function csvCell(value: unknown): string;
export declare function toCsv(headers: string[], rows: unknown[][]): string;
export declare function pagination(page: number, limit: number): {
    page: number;
    limit: number;
    offset: number;
};
