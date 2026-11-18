import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { calculateAttendanceStatistics, validateAttendanceEntry } from './attendance.helpers.js';
import { AttendanceService } from './attendance.service.js';
import { vi } from 'vitest';

describe('attendance validation',()=>{
  it('accepts all four statuses with their valid fields',()=>{
    for(const status of ['PRESENT','ABSENT'] as const)expect(()=>validateAttendanceEntry({studentId:'student',status})).not.toThrow();
    expect(()=>validateAttendanceEntry({studentId:'student',status:'LATE',latenessMinutes:5})).not.toThrow();
    expect(()=>validateAttendanceEntry({studentId:'student',status:'EXCUSED',reason:'Medical'})).not.toThrow();
  });
  it('requires positive lateness only for late attendance',()=>{
    for(const minutes of [undefined,0,-1,1.5])expect(()=>validateAttendanceEntry({studentId:'student',status:'LATE',latenessMinutes:minutes})).toThrow(BadRequestException);
    expect(()=>validateAttendanceEntry({studentId:'student',status:'PRESENT',latenessMinutes:2})).toThrow(BadRequestException);
    expect(()=>validateAttendanceEntry({studentId:'student',status:'ABSENT',latenessMinutes:0})).not.toThrow();
  });
  it('requires an excuse reason',()=>{
    expect(()=>validateAttendanceEntry({studentId:'student',status:'EXCUSED'})).toThrow(BadRequestException);
    expect(()=>validateAttendanceEntry({studentId:'student',status:'EXCUSED',reason:'  '})).toThrow(BadRequestException);
  });
});

describe('attendance statistics',()=>{
  it('excludes excused sessions from attendance and absence percentage denominators',()=>{
    expect(calculateAttendanceStatistics({present:2,absent:1,late:1,excused:1})).toEqual({totalScheduledSessions:5,presentSessions:2,absentSessions:1,lateSessions:1,excusedSessions:1,attendancePercentage:75,absencePercentage:25,latePercentage:25});
  });
  it('returns zero percentages when every confirmed record is excused',()=>{
    expect(calculateAttendanceStatistics({present:0,absent:0,late:0,excused:3})).toMatchObject({totalScheduledSessions:3,attendancePercentage:0,absencePercentage:0,latePercentage:0});
  });
});

describe('attendance access controls',()=>{
  const makeService=(records:any,sessions:any)=>new AttendanceService(records as never,{} as never,{} as never,sessions as never,{} as never,{} as never,{} as never);
  it('rejects a student attempting to mark attendance for a lesson',async()=>{
    const sessions={findOne:vi.fn().mockResolvedValue({id:'session-1',status:'SCHEDULED',teacher:{id:'teacher-1'}})};
    const service=makeService({},sessions);
    await expect(service.start('session-1',{id:'student-1',roles:['STUDENT']} as never)).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('scopes student detail lookup to the authenticated student id',async()=>{
    const records={findOne:vi.fn().mockResolvedValue(null)};
    const service=makeService(records,{});
    await expect(service.studentDetail('attendance-1',{id:'student-1',roles:['STUDENT']} as never)).rejects.toBeInstanceOf(NotFoundException);
    expect(records.findOne).toHaveBeenCalledWith(expect.objectContaining({where:{id:'attendance-1',student:{id:'student-1'}}}));
  });
  it('rejects non-admin attendance reports before querying data',async()=>{
    const records={createQueryBuilder:vi.fn()};
    const service=makeService(records,{});
    await expect(service.adminList({page:1,limit:20},{id:'teacher-1',roles:['TEACHER']} as never)).rejects.toBeInstanceOf(ForbiddenException);
    expect(records.createQueryBuilder).not.toHaveBeenCalled();
  });
});
