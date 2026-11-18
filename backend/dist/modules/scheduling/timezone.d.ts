export interface LocalDateTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    weekday: number;
}
export declare function assertTimezone(zone: string): void;
export declare function localParts(at: Date, zone: string): LocalDateTime;
export declare function localDateTimeToUtc(date: string, time: string, zone: string): Date;
export declare function dateOnly(at: Date, zone: string): string;
export declare function addDays(date: string, count: number): string;
export declare function weekday(date: string): number;
export declare function intervalOverlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean;
