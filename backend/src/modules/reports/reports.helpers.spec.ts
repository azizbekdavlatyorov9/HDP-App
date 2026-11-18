import { BadRequestException } from '@nestjs/common';
import {
  aggregateSuccessfulPayments,
  attendanceRates,
  crmConversionRate,
  csvCell,
  localMidnightToUtc,
  pagination,
  parseReportPeriod,
  submissionRate,
  toCsv,
} from './reports.helpers.js';

describe('report helpers', () => {
  it('validates ranges and converts inclusive local dates to half-open UTC bounds', () => {
    const p = parseReportPeriod('2026-01-01', '2026-01-01', 'Asia/Tashkent');
    expect(p.from?.toISOString()).toBe('2025-12-31T19:00:00.000Z');
    expect(p.toExclusive?.toISOString()).toBe('2026-01-01T19:00:00.000Z');
    expect(
      localMidnightToUtc('2026-01-01', 'Asia/Tashkent').toISOString(),
    ).toBe(p.from?.toISOString());
    expect(() => parseReportPeriod('2026-02-01', '2026-01-01')).toThrow(
      BadRequestException,
    );
    expect(() =>
      parseReportPeriod(undefined, undefined, 'No/SuchZone'),
    ).toThrow(BadRequestException);
  });
  it('excludes excused and unfinalized records from attendance denominators', () => {
    expect(
      attendanceRates({ present: 6, absent: 2, late: 1, excused: 3 }),
    ).toEqual({
      denominator: 9,
      attendanceRate: 77.78,
      absenceRate: 22.22,
      lateRate: 11.11,
    });
  });
  it('sums successful payments once and keeps currencies separate using integer arithmetic', () => {
    expect(
      aggregateSuccessfulPayments([
        {
          id: 'a',
          status: 'succeeded',
          currency: 'UZS',
          amountMinor: '9007199254740993',
        },
        {
          id: 'a',
          status: 'succeeded',
          currency: 'UZS',
          amountMinor: '9007199254740993',
        },
        { id: 'b', status: 'pending', currency: 'UZS', amountMinor: '100' },
        { id: 'c', status: 'succeeded', currency: 'USD', amountMinor: '25' },
      ]),
    ).toEqual([
      { currency: 'UZS', count: 1, amountMinor: '9007199254740993' },
      { currency: 'USD', count: 1, amountMinor: '25' },
    ]);
  });
  it('calculates rates with safe zero denominators', () => {
    expect(submissionRate(3, 4)).toBe(75);
    expect(submissionRate(0, 0)).toBe(0);
    expect(crmConversionRate(2, 10)).toBe(20);
  });
  it('escapes quotes and prevents spreadsheet formula injection', () => {
    expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');
    expect(toCsv(['value'], [['a,"b"']])).toBe('"value"\r\n"a,""b"""');
  });
  it('caps pagination and rejects excessive date ranges', () => {
    expect(pagination(2, 500)).toMatchObject({
      page: 2,
      limit: 100,
      offset: 100,
    });
    expect(() => parseReportPeriod('2020-01-01', '2022-01-01')).toThrow(
      BadRequestException,
    );
  });
});
