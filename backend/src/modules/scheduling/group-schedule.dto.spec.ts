import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import { AdminGroupSchedulesController } from './scheduling.controller.js';
import { ReplaceGroupScheduleDto } from './group-schedule.dto.js';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SchedulingService } from './scheduling.service.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const valid = {
  schedules: [{
    weekday: 1,
    startTime: '09:00',
    endTime: '10:30',
    classroomId: '10000000-0000-4000-8000-000000000001',
  }],
};

describe('Group schedule API validation', () => {
  it('accepts ISO weekdays 1 through 7 and valid time formats', () => {
    for (const weekday of [1, 7]) {
      const dto = plainToInstance(ReplaceGroupScheduleDto, {
        schedules: [{ ...valid.schedules[0], weekday }],
      });
      expect(validateSync(dto)).toHaveLength(0);
    }
  });

  it('rejects weekday zero, malformed times, invalid classroom UUIDs, and empty replacements', () => {
    for (const schedules of [
      [{ ...valid.schedules[0], weekday: 0 }],
      [{ ...valid.schedules[0], startTime: '9am' }],
      [{ ...valid.schedules[0], classroomId: 'invalid' }],
      [],
    ]) {
      const dto = plainToInstance(ReplaceGroupScheduleDto, { schedules });
      expect(validateSync(dto).length).toBeGreaterThan(0);
    }
  });

  it('protects schedule replacement with JWT and administrator role guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminGroupSchedulesController)).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata('requiredRoles', AdminGroupSchedulesController)).toEqual(['ADMIN', 'SUPER_ADMIN']);
  });

  it('rejects duplicate time slots and non-admin schedule replacement before opening a transaction', async () => {
    const group = {
      id: '20000000-0000-4000-8000-000000000001',
      status: 'ACTIVE',
      course: {},
      leadTeacher: { id: 'teacher-id' },
    };
    const db = { transaction: vi.fn() };
    const service = new SchedulingService(
      { findOne: vi.fn(), find: vi.fn() } as any,
      {} as any,
      { findOne: vi.fn(async () => group) } as any,
      {} as any,
      {} as any,
      {} as any,
      { exists: vi.fn() } as any,
      db as any,
      {} as any,
    );
    const schedule = { ...valid.schedules[0], effectiveStartDate: '2026-11-12' };
    await expect(service.replaceGroupSchedules('group-id', [schedule, schedule], { id: 'admin', roles: ['ADMIN'] } as never)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.replaceGroupSchedules('group-id', [schedule], { id: 'student', roles: ['STUDENT'] } as never)).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.transaction).not.toHaveBeenCalled();
  });
});
