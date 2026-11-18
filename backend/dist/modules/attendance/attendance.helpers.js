import { BadRequestException } from '@nestjs/common';
export function validateAttendanceEntry(entry) {
    if (entry.status === 'LATE' && (!Number.isInteger(entry.latenessMinutes) || !entry.latenessMinutes || entry.latenessMinutes < 1))
        throw new BadRequestException('LATE attendance requires positive latenessMinutes');
    if (entry.status !== 'LATE' && entry.latenessMinutes != null && entry.latenessMinutes !== 0)
        throw new BadRequestException('latenessMinutes must be null or zero unless status is LATE');
    if (entry.status === 'EXCUSED' && !entry.reason?.trim())
        throw new BadRequestException('EXCUSED attendance requires a reason');
}
export function calculateAttendanceStatistics(counts) {
    const { present, absent, late, excused } = counts, total = present + absent + late + excused, denominator = total - excused;
    const percentage = (value) => denominator ? Math.round(value / denominator * 10000) / 100 : 0;
    return { totalScheduledSessions: total, presentSessions: present, absentSessions: absent, lateSessions: late, excusedSessions: excused, attendancePercentage: percentage(present + late), absencePercentage: percentage(absent), latePercentage: percentage(late) };
}
export const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
//# sourceMappingURL=attendance.helpers.js.map