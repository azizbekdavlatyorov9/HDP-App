import { BadRequestException } from '@nestjs/common';
import type { AttendanceStatus } from '../../database/entities/attendance.entity.js';
import type { AttendanceFieldsDto } from './attendance.dto.js';

export function validateAttendanceEntry(entry:AttendanceFieldsDto):void {
  if(entry.status==='LATE'&&(!Number.isInteger(entry.latenessMinutes)||!entry.latenessMinutes||entry.latenessMinutes<1))throw new BadRequestException('LATE attendance requires positive latenessMinutes');
  if(entry.status!=='LATE'&&entry.latenessMinutes!=null&&entry.latenessMinutes!==0)throw new BadRequestException('latenessMinutes must be null or zero unless status is LATE');
  if(entry.status==='EXCUSED'&&!entry.reason?.trim())throw new BadRequestException('EXCUSED attendance requires a reason');
}

export function calculateAttendanceStatistics(counts:{present:number;absent:number;late:number;excused:number}) {
  const {present,absent,late,excused}=counts,total=present+absent+late+excused,denominator=total-excused;
  const percentage=(value:number)=>denominator?Math.round(value/denominator*10000)/100:0;
  return {totalScheduledSessions:total,presentSessions:present,absentSessions:absent,lateSessions:late,excusedSessions:excused,attendancePercentage:percentage(present+late),absencePercentage:percentage(absent),latePercentage:percentage(late)};
}

export const attendanceStatuses:readonly AttendanceStatus[]=['PRESENT','ABSENT','LATE','EXCUSED'];
