import { BadRequestException } from '@nestjs/common';

export interface ReportPeriod {
  from?: Date;
  toExclusive?: Date;
  timezone: string;
}
function validZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
function isoInstant(s: string): boolean {
  return (
    /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,9})?)?(?:Z|[+-]\d\d:\d\d)$/.test(
      s,
    ) && Number.isFinite(Date.parse(s))
  );
}
function zoneOffset(at: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'longOffset',
    hour12: false,
  }).formatToParts(at);
  const value =
    parts.find((x) => x.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const m = /GMT([+-])(\d\d):(\d\d)/.exec(value);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}
export function localMidnightToUtc(day: string, zone: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  let candidate = target;
  for (let i = 0; i < 3; i++)
    candidate = target - zoneOffset(new Date(candidate), zone) * 60_000;
  return new Date(candidate);
}
export function parseReportPeriod(
  from?: string,
  to?: string,
  timezone = 'Asia/Tashkent',
): ReportPeriod {
  if (!validZone(timezone))
    throw new BadRequestException('timezone must be a valid IANA timezone');
  const parse = (value: string, isTo: boolean) => {
    if (/^\d{4}-\d\d-\d\d$/.test(value)) {
      const d = new Date(`${value}T00:00:00Z`);
      if (
        !Number.isFinite(d.getTime()) ||
        d.toISOString().slice(0, 10) !== value
      )
        throw new BadRequestException('Date filter is invalid');
      if (isTo) {
        const next = new Date(d.getTime() + 86400000)
          .toISOString()
          .slice(0, 10);
        return localMidnightToUtc(next, timezone);
      }
      return localMidnightToUtc(value, timezone);
    }
    if (!isoInstant(value))
      throw new BadRequestException(
        'Date-time filters must be ISO 8601 with a timezone offset',
      );
    const day = value.slice(0, 10),
      normalized = new Date(`${day}T00:00:00Z`);
    if (normalized.toISOString().slice(0, 10) !== day)
      throw new BadRequestException('Date-time filter is invalid');
    return new Date(value);
  };
  const start = from ? parse(from, false) : undefined,
    end = to ? parse(to, true) : undefined;
  if (start && end && start > end)
    throw new BadRequestException('from must be earlier than or equal to to');
  if (start && end && end.getTime() - start.getTime() > 366 * 86400000)
    throw new BadRequestException('Report range cannot exceed 366 days');
  return { from: start, toExclusive: end, timezone };
}
export function attendanceRates(input: {
  present: number;
  absent: number;
  late: number;
  excused: number;
}) {
  const denominator = input.present + input.absent + input.late;
  const pct = (v: number) =>
    denominator ? Math.round((v / denominator) * 10000) / 100 : 0;
  return {
    denominator,
    attendanceRate: pct(input.present + input.late),
    absenceRate: pct(input.absent),
    lateRate: pct(input.late),
  };
}
export function paymentTotals(
  rows: Array<{ currency: string; amountMinor: string; count: number }>,
) {
  return rows.map((r) => ({
    currency: r.currency,
    successfulCount: r.count,
    successfulAmountMinor: r.amountMinor,
  }));
}
export function aggregateSuccessfulPayments(
  rows: Array<{
    id: string;
    status: string;
    currency: string;
    amountMinor: string;
  }>,
) {
  const seen = new Set<string>(),
    totals = new Map<string, { count: number; amount: bigint }>();
  for (const row of rows) {
    if (row.status !== 'succeeded' || seen.has(row.id)) continue;
    seen.add(row.id);
    const value = totals.get(row.currency) ?? { count: 0, amount: 0n };
    value.count++;
    value.amount += BigInt(row.amountMinor);
    totals.set(row.currency, value);
  }
  return [...totals].map(([currency, value]) => ({
    currency,
    count: value.count,
    amountMinor: value.amount.toString(),
  }));
}
export function submissionRate(submissions: number, eligible: number) {
  return eligible ? Math.round((submissions / eligible) * 10000) / 100 : 0;
}
export function crmConversionRate(won: number, total: number) {
  return total ? Math.round((won / total) * 10000) / 100 : 0;
}
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[\s]*[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}
export function pagination(page: number, limit: number) {
  const p = Number.isInteger(page) && page > 0 ? page : 1;
  const l = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  return { page: p, limit: l, offset: (p - 1) * l };
}
