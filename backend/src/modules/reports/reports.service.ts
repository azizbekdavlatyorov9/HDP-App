import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportQueryDto } from './reports.dto.js';
import {
  attendanceRates,
  crmConversionRate,
  pagination,
  parseReportPeriod,
  paymentTotals,
  submissionRate,
  toCsv,
} from './reports.helpers.js';

type Row = Record<string, any>;
@Injectable()
export class ReportsService {
  constructor(private readonly db: DataSource) {}
  private period(q: ReportQueryDto) {
    return parseReportPeriod(q.from, q.to, q.timezone);
  }
  private range(
    alias: string,
    p: ReturnType<typeof parseReportPeriod>,
    params: unknown[],
    column = 'created_at',
  ) {
    let s = '';
    if (p.from) {
      params.push(p.from);
      s += ` AND ${alias}.${column} >= $${params.length}`;
    }
    if (p.toExclusive) {
      params.push(p.toExclusive);
      s += ` AND ${alias}.${column} < $${params.length}`;
    }
    return s;
  }
  private filters(
    q: ReportQueryDto,
    params: unknown[],
    map: Record<string, string>,
  ) {
    let s = '';
    for (const [key, col] of Object.entries(map)) {
      const v = (q as any)[key];
      if (v !== undefined) {
        params.push(v);
        s += ` AND ${col}=$${params.length}`;
      }
    }
    return s;
  }
  private pg(q: ReportQueryDto) {
    return pagination(q.page, q.limit);
  }

  async dashboard(q: ReportQueryDto) {
    const p = this.period(q),
      attendanceParams: unknown[] = [],
      paymentParams: unknown[] = [],
      revenueParams: unknown[] = [],
      assignmentParams: unknown[] = [],
      crmParams: unknown[] = [];
    const s = this.range('s', p, attendanceParams, 'start_at');
    const pay = this.range('p', p, paymentParams);
    const revenueRange = this.range('p', p, revenueParams, 'paid_at');
    const a = this.range('a', p, assignmentParams);
    const crm = this.range('l', p, crmParams);
    const [
      students,
      courses,
      groups,
      attendance,
      finance,
      assignments,
      crmStats,
    ] = await Promise.all([
      this.db.query(
        `SELECT COUNT(DISTINCT u.id) FILTER (WHERE u.status<>'deleted')::int total,COUNT(DISTINCT u.id) FILTER (WHERE u.status='active')::int active,COUNT(DISTINCT u.id) FILTER (WHERE u.status='suspended')::int inactive,COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= COALESCE($1::timestamptz,'-infinity') AND ($2::timestamptz IS NULL OR u.created_at<$2) AND u.status<>'deleted')::int new_students,COUNT(DISTINCT gs.student_id) FILTER (WHERE gs.status='ACTIVE' AND g.status='ACTIVE' AND u.status='active')::int in_active_groups FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT' LEFT JOIN group_students gs ON gs.student_id=u.id LEFT JOIN study_groups g ON g.id=gs.group_id`,
        [p.from ?? null, p.toExclusive ?? null],
      ),
      this.db.query(
        `SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='published')::int published,COUNT(*) FILTER(WHERE status='archived')::int archived FROM courses`,
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER(WHERE status='ACTIVE')::int active,COUNT(*) FILTER(WHERE status<>'ACTIVE')::int inactive,COUNT(*) FILTER(WHERE status='ACTIVE' AND member_count<capacity)::int available_capacity,COUNT(*) FILTER(WHERE status='ACTIVE' AND member_count>=capacity)::int full_capacity FROM (SELECT g.id,g.status,g.capacity,COUNT(gs.id) FILTER(WHERE gs.status='ACTIVE') member_count FROM study_groups g LEFT JOIN group_students gs ON gs.group_id=g.id GROUP BY g.id) x`,
      ),
      this.db.query(
        `SELECT COUNT(DISTINCT s.id) FILTER(WHERE ss.status='FINALIZED')::int finalized_sessions,COUNT(a.id) FILTER(WHERE ss.status='FINALIZED' AND a.status='PRESENT')::int present,COUNT(a.id) FILTER(WHERE ss.status='FINALIZED' AND a.status='ABSENT')::int absent,COUNT(a.id) FILTER(WHERE ss.status='FINALIZED' AND a.status='LATE')::int late,COUNT(a.id) FILTER(WHERE ss.status='FINALIZED' AND a.status='EXCUSED')::int excused,COUNT(DISTINCT s.id) FILTER(WHERE s.status='SCHEDULED')::int scheduled FROM lesson_sessions s LEFT JOIN attendance_sessions ss ON ss.session_id=s.id LEFT JOIN attendances a ON a.session_id=s.id WHERE s.status<>'CANCELLED' ${s}`,
        [...attendanceParams],
      ),
      this.db.query(
        `SELECT p.status,p.currency,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p WHERE true ${pay} GROUP BY p.status,p.currency`,
        [...paymentParams],
      ),
      this.db.query(
        `WITH selected AS (SELECT a.id,a.status FROM assignments a WHERE true ${a}) SELECT COUNT(*) FILTER(WHERE selected.status='PUBLISHED')::int published,(SELECT COUNT(*)::int FROM assignment_submissions ss JOIN selected s ON s.id=ss.assignment_id) submissions,(SELECT COUNT(*)::int FROM assignment_submissions ss JOIN selected s ON s.id=ss.assignment_id WHERE ss.is_late) late,(SELECT COUNT(*)::int FROM assignment_submissions ss JOIN selected s ON s.id=ss.assignment_id WHERE NOT ss.is_late) submitted_on_time,(SELECT COUNT(*)::int FROM assignment_submissions ss JOIN selected s ON s.id=ss.assignment_id WHERE ss.status='GRADED') graded,(SELECT COUNT(*)::int FROM assignment_submissions ss JOIN selected s ON s.id=ss.assignment_id WHERE ss.status='RETURNED') returned,(SELECT AVG(latest.score/NULLIF(a.max_score,0)*100)::numeric(8,2) FROM selected s JOIN assignments a ON a.id=s.id JOIN assignment_submissions ss ON ss.assignment_id=a.id JOIN LATERAL(SELECT action,score FROM assignment_submission_reviews WHERE submission_id=ss.id ORDER BY reviewed_at DESC,id DESC LIMIT 1) latest ON latest.action='GRADED') average_score_percent FROM selected`,
        [...assignmentParams],
      ),
      this.db.query(
        `SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='NEW')::int new,COUNT(*) FILTER(WHERE status='WON')::int won,COUNT(*) FILTER(WHERE status='LOST')::int lost FROM crm_leads l WHERE true ${crm}`,
        [...crmParams],
      ),
    ]);
    const [providerTotals, successfulRevenue] = await Promise.all([
      this.db.query(
        `SELECT pt.provider,p.currency,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p JOIN (SELECT DISTINCT ON(payment_id) payment_id,provider FROM payment_transactions WHERE status='succeeded' ORDER BY payment_id,COALESCE(provider_performed_at,created_at) DESC,id DESC) pt ON pt.payment_id=p.id WHERE p.status='succeeded' AND p.paid_at IS NOT NULL ${revenueRange} GROUP BY pt.provider,p.currency`,
        [...revenueParams],
      ),
      this.db.query(
        `SELECT p.currency,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p WHERE p.status='succeeded' AND p.paid_at IS NOT NULL AND EXISTS(SELECT 1 FROM payment_transactions ok WHERE ok.payment_id=p.id AND ok.status='succeeded') ${revenueRange} GROUP BY p.currency`,
        [...revenueParams],
      ),
    ]);
    const trialParams: unknown[] = [];
    const trialRange = this.range('t', p, trialParams, 'scheduled_at');
    const trialStats = await this.db.query(
      `SELECT COUNT(*) FILTER(WHERE status IN ('SCHEDULED','CONFIRMED'))::int scheduled,COUNT(*) FILTER(WHERE status='ATTENDED')::int attended FROM crm_trial_lessons t WHERE true ${trialRange}`,
      [...trialParams],
    );
    const att = attendance[0] ?? {},
      rates = attendanceRates({
        present: Number(att.present || 0),
        absent: Number(att.absent || 0),
        late: Number(att.late || 0),
        excused: Number(att.excused || 0),
      });
    const payRows = finance as Row[];
    return {
      period: {
        from: p.from ?? null,
        toExclusive: p.toExclusive ?? null,
        timezone: p.timezone,
      },
      students: {
        ...students[0],
        withoutActiveGroup: Math.max(
          0,
          Number(students[0]?.active ?? 0) -
            Number(students[0]?.in_active_groups ?? 0),
        ),
      },
      courses: courses[0],
      groups: groups[0],
      attendance: {
        ...att,
        ...rates,
        scheduledSessions: Number(att.scheduled_sessions ?? 0),
      },
      finance: {
        successful: paymentTotals(
          successfulRevenue.map((x: Row) => ({
            currency: x.currency,
            count: Number(x.count),
            amountMinor: x.amount_minor,
          })),
        ),
        failedCount: payRows
          .filter((x) => x.status === 'failed')
          .reduce((n, x) => n + Number(x.count), 0),
        cancelledCount: null,
        cancellationCountUnavailable:
          'The Payment model has no cancelled state; failed payments are reported separately and are not assumed cancelled.',
        pendingCount: payRows
          .filter((x) => ['pending', 'processing'].includes(x.status))
          .reduce((n, x) => n + Number(x.count), 0),
        refunds: {
          available: false,
          amountMinor: null,
          reason:
            'Payment entity has status/refundedAt fields but no separate completed refund transaction amount; refund amount cannot be calculated reliably.',
        },
        byProvider: providerTotals,
      },
      assignments: assignments[0],
      crm: {
        ...crmStats[0],
        conversionRate: crmConversionRate(
          Number(crmStats[0]?.won ?? 0),
          Number(crmStats[0]?.total ?? 0),
        ),
        trials: trialStats[0],
      },
    };
  }

  async studentList(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE r.code='STUDENT' AND u.status<>'deleted'`;
    if (p.from) {
      params.push(p.from);
      where += ` AND u.created_at >= $${params.length}`;
    }
    if (p.toExclusive) {
      params.push(p.toExclusive);
      where += ` AND u.created_at < $${params.length}`;
    }
    if (q.search) {
      params.push(`%${q.search.trim().toLowerCase()}%`);
      where += ` AND (lower(u.display_name) LIKE $${params.length} OR EXISTS(SELECT 1 FROM auth_identities i WHERE i.user_id=u.id AND i.provider='phone' AND i.verified_at IS NOT NULL AND i.provider_subject LIKE $${params.length}))`;
    }
    if (q.groupId) {
      params.push(q.groupId);
      where += ` AND EXISTS (SELECT 1 FROM group_students x WHERE x.student_id=u.id AND x.group_id=$${params.length}`;
      if (q.membershipStatus) {
        params.push(q.membershipStatus);
        where += ` AND x.status=$${params.length}`;
      }
      where += ')';
    }
    if (q.membershipStatus && !q.groupId) {
      params.push(q.membershipStatus);
      where += ` AND EXISTS(SELECT 1 FROM group_students x WHERE x.student_id=u.id AND x.status=$${params.length})`;
    }
    if (q.courseId) {
      params.push(q.courseId);
      where += ` AND EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id=u.id AND e.course_id=$${params.length})`;
    }
    if (q.status) {
      params.push(q.status);
      where += ` AND EXISTS(SELECT 1 FROM attendances ast JOIN attendance_sessions ax ON ax.session_id=ast.session_id JOIN lesson_sessions sx ON sx.id=ast.session_id WHERE ast.student_id=u.id AND ast.status=$${params.length} AND ax.status='FINALIZED' AND sx.status<>'CANCELLED')`;
    }
    const pg = this.pg(q);
    const rows = await this.db.query(
      `SELECT u.id,u.display_name,u.status,u.created_at,COUNT(DISTINCT gs.id) FILTER(WHERE gs.status='ACTIVE')::int active_groups FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id LEFT JOIN group_students gs ON gs.student_id=u.id ${where} GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pg.limit, pg.offset],
    );
    const count = await this.db.query(
      `SELECT COUNT(DISTINCT u.id)::int total FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id ${where}`,
      [...params],
    );
    return {
      data: rows,
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total: Number(count[0]?.total ?? 0),
        pages: Math.ceil(Number(count[0]?.total ?? 0) / pg.limit),
      },
    };
  }
  async studentDetail(id: string) {
    const rows = await this.db.query(
      `SELECT u.id,u.display_name,u.status,u.created_at FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT' WHERE u.id=$1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Student not found');
    const [groups, enrollments, attendance, assignments, payments] =
      await Promise.all([
        this.db.query(
          `SELECT g.id,g.name,g.status group_status,gs.status membership_status,gs.joined_at,gs.ended_at,c.id course_id,c.title course_title,t.id teacher_id,t.display_name teacher_name FROM group_students gs JOIN study_groups g ON g.id=gs.group_id JOIN courses c ON c.id=g.course_id JOIN users t ON t.id=g.lead_teacher_id WHERE gs.student_id=$1 ORDER BY gs.joined_at DESC`,
          [id],
        ),
        this.db.query(
          `SELECT c.id,c.title,e.status,e.enrolled_at,e.expires_at FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC`,
          [id],
        ),
        this.db.query(
          `SELECT COUNT(*) FILTER(WHERE a.status='PRESENT')::int present,COUNT(*) FILTER(WHERE a.status='ABSENT')::int absent,COUNT(*) FILTER(WHERE a.status='LATE')::int late,COUNT(*) FILTER(WHERE a.status='EXCUSED')::int excused,COUNT(*)::int total FROM attendances a JOIN attendance_sessions ats ON ats.session_id=a.session_id JOIN lesson_sessions s ON s.id=a.session_id WHERE a.student_id=$1 AND ats.status='FINALIZED' AND s.status<>'CANCELLED'`,
          [id],
        ),
        this.db.query(
          `SELECT COUNT(*)::int submissions,COUNT(*) FILTER(WHERE s.status='LATE' OR s.is_late)::int late,COUNT(*) FILTER(WHERE s.status='GRADED')::int graded,AVG(CASE WHEN rev.action='GRADED' THEN rev.score/NULLIF(a.max_score,0)*100 END)::numeric(8,2) average_score_percent FROM assignment_submissions s JOIN assignments a ON a.id=s.assignment_id LEFT JOIN LATERAL (SELECT action,score FROM assignment_submission_reviews WHERE submission_id=s.id ORDER BY reviewed_at DESC,id DESC LIMIT 1) rev ON true WHERE s.student_id=$1`,
          [id],
        ),
        this.db.query(
          `SELECT p.currency,p.status,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p WHERE p.user_id=$1 GROUP BY p.currency,p.status`,
          [id],
        ),
      ]);
    return {
      student: rows[0],
      groups,
      enrollments,
      attendance: {
        ...attendance[0],
        ...attendanceRates({
          present: Number(attendance[0]?.present || 0),
          absent: Number(attendance[0]?.absent || 0),
          late: Number(attendance[0]?.late || 0),
          excused: Number(attendance[0]?.excused || 0),
        }),
      },
      assignments: assignments[0],
      payments,
    };
  }
  async studentStatistics(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE u.status<>'deleted' AND ro.code='STUDENT'`;
    if (p.from) {
      params.push(p.from);
      where += ` AND u.created_at >= $${params.length}`;
    }
    if (p.toExclusive) {
      params.push(p.toExclusive);
      where += ` AND u.created_at < $${params.length}`;
    }
    if (q.courseId) {
      params.push(q.courseId);
      where += ` AND EXISTS(SELECT 1 FROM enrollments e WHERE e.user_id=u.id AND e.course_id=$${params.length})`;
    }
    if (q.groupId) {
      params.push(q.groupId);
      where += ` AND EXISTS(SELECT 1 FROM group_students gs WHERE gs.student_id=u.id AND gs.group_id=$${params.length}${q.membershipStatus ? ` AND gs.status=$${params.length + 1}` : ''})`;
      if (q.membershipStatus) params.push(q.membershipStatus);
    }
    const r = await this.db.query(
      `SELECT COUNT(*)::int count,COUNT(*) FILTER(WHERE u.status='active')::int active,COUNT(*) FILTER(WHERE u.status='suspended')::int inactive FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id ${where}`,
      [...params],
    );
    return r[0];
  }

  async teacherList(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE r.code='TEACHER'`;
    where += this.range('u', p, params);
    if (q.search) {
      params.push(`%${q.search.trim().toLowerCase()}%`);
      where += ` AND lower(u.display_name) LIKE $${params.length}`;
    }
    const pg = this.pg(q),
      limitIndex = params.length + 1;
    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT u.id,u.display_name,u.status,COUNT(DISTINCT g.id) FILTER(WHERE g.status='ACTIVE')::int active_groups,COUNT(DISTINCT g.id)::int historical_groups,COUNT(DISTINCT gs.student_id) FILTER(WHERE gs.status='ACTIVE')::int active_students FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id LEFT JOIN study_groups g ON g.lead_teacher_id=u.id LEFT JOIN group_students gs ON gs.group_id=g.id ${where} GROUP BY u.id ORDER BY u.display_name LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(
        `SELECT COUNT(DISTINCT u.id)::int total FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id ${where}`,
        [...params],
      ),
    ]);
    const total = Number(count[0].total);
    return {
      data: rows,
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total,
        pages: Math.ceil(total / pg.limit),
      },
    };
  }
  async teacherDetail(id: string) {
    const exists = await this.db.query(
      `SELECT u.id,u.display_name FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.code='TEACHER' WHERE u.id=$1`,
      [id],
    );
    if (!exists.length) throw new NotFoundException('Teacher not found');
    const [groups, sessions, attendance, assignments] = await Promise.all([
      this.db.query(
        `SELECT g.id,g.name,g.status,COUNT(DISTINCT gs.student_id) FILTER(WHERE gs.status='ACTIVE')::int active_students FROM study_groups g LEFT JOIN group_students gs ON gs.group_id=g.id WHERE g.lead_teacher_id=$1 GROUP BY g.id`,
        [id],
      ),
      this.db.query(
        `SELECT s.status,COUNT(*)::int count FROM lesson_sessions s WHERE s.teacher_id=$1 GROUP BY s.status`,
        [id],
      ),
      this.db.query(
        `SELECT a.status,COUNT(*)::int count FROM attendances a JOIN attendance_sessions ats ON ats.session_id=a.session_id JOIN lesson_sessions s ON s.id=a.session_id WHERE s.teacher_id=$1 AND ats.status='FINALIZED' AND s.status<>'CANCELLED' GROUP BY a.status`,
        [id],
      ),
      this.db.query(
        `SELECT COUNT(DISTINCT a.id)::int created,COUNT(DISTINCT ss.id) FILTER(WHERE latest.action='GRADED')::int graded,COUNT(DISTINCT ss.id) FILTER(WHERE latest.action='RETURNED')::int returned FROM assignments a LEFT JOIN assignment_submissions ss ON ss.assignment_id=a.id LEFT JOIN LATERAL(SELECT action FROM assignment_submission_reviews WHERE submission_id=ss.id ORDER BY reviewed_at DESC,id DESC LIMIT 1) latest ON true WHERE a.created_by_teacher_id=$1`,
        [id],
      ),
    ]);
    const counts = Object.fromEntries(
      attendance.map((x: Row) => [x.status, Number(x.count)]),
    );
    return {
      teacher: exists[0],
      groups,
      sessions,
      attendance: {
        ...counts,
        ...attendanceRates({
          present: counts.PRESENT ?? 0,
          absent: counts.ABSENT ?? 0,
          late: counts.LATE ?? 0,
          excused: counts.EXCUSED ?? 0,
        }),
      },
      assignments: assignments[0],
    };
  }
  async teacherStatistics() {
    return this.db.query(
      `SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE u.status='active')::int active FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.code='TEACHER'`,
    );
  }

  async courseList(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE true';
    where += this.range('c', p, params);
    if (q.search) {
      params.push(`%${q.search.trim().toLowerCase()}%`);
      where += ` AND lower(c.title) LIKE $${params.length}`;
    }
    const pg = this.pg(q),
      limitIndex = params.length + 1;
    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT c.id,c.title,c.status,COUNT(DISTINCT e.user_id) FILTER(WHERE e.status='active')::int active_enrollments,COUNT(DISTINCT g.id) FILTER(WHERE g.status='ACTIVE')::int active_groups,COUNT(DISTINCT gs.student_id) FILTER(WHERE gs.status='ACTIVE' AND g.status='ACTIVE')::int active_group_students,COUNT(DISTINCT l.id) FILTER(WHERE l.status='published')::int published_lessons FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id LEFT JOIN study_groups g ON g.course_id=c.id LEFT JOIN group_students gs ON gs.group_id=g.id LEFT JOIN lessons l ON l.course_id=c.id ${where} GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(`SELECT COUNT(*)::int total FROM courses c ${where}`, [
        ...params,
      ]),
    ]);
    const total = Number(count[0].total);
    return {
      data: rows,
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total,
        pages: Math.ceil(total / pg.limit),
      },
    };
  }
  async courseDetail(id: string) {
    const rows = await this.db.query(
      `SELECT c.id,c.title,c.status,COUNT(DISTINCT e.id) FILTER(WHERE e.status='active')::int active_enrollments,COUNT(DISTINCT e.id) FILTER(WHERE e.status='completed')::int completed_enrollments,COUNT(DISTINCT g.id) FILTER(WHERE g.status='ACTIVE')::int active_groups,COUNT(DISTINCT gs.student_id) FILTER(WHERE g.status='ACTIVE' AND gs.status='ACTIVE')::int active_students,COUNT(DISTINCT l.id) FILTER(WHERE l.status='published')::int published_lessons FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id LEFT JOIN study_groups g ON g.course_id=c.id LEFT JOIN group_students gs ON gs.group_id=g.id LEFT JOIN lessons l ON l.course_id=c.id WHERE c.id=$1 GROUP BY c.id`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Course not found');
    const [progress, assignments, attendance] = await Promise.all([
      this.db.query(
        `SELECT AVG(cp.completion_percent)::numeric(8,2) average_completion,COUNT(*)::int learners FROM course_progress cp WHERE cp.course_id=$1`,
        [id],
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER(WHERE a.status='PUBLISHED')::int published,COUNT(DISTINCT ss.id)::int submissions,COUNT(DISTINCT ss.id) FILTER(WHERE ss.status='GRADED')::int graded FROM assignments a LEFT JOIN assignment_submissions ss ON ss.assignment_id=a.id WHERE a.course_id=$1`,
        [id],
      ),
      this.db.query(
        `SELECT a.status,COUNT(*)::int count FROM attendances a JOIN attendance_sessions ats ON ats.session_id=a.session_id JOIN lesson_sessions s ON s.id=a.session_id JOIN study_groups g ON g.id=s.group_id WHERE g.course_id=$1 AND s.status<>'CANCELLED' AND ats.status='FINALIZED' GROUP BY a.status`,
        [id],
      ),
    ]);
    const counts = Object.fromEntries(
      attendance.map((x: Row) => [x.status, Number(x.count)]),
    );
    return {
      ...rows[0],
      progress: progress[0],
      assignments: assignments[0],
      attendance: {
        ...counts,
        ...attendanceRates({
          present: counts.PRESENT ?? 0,
          absent: counts.ABSENT ?? 0,
          late: counts.LATE ?? 0,
          excused: counts.EXCUSED ?? 0,
        }),
      },
    };
  }
  async groupList(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE true';
    where += this.range('g', p, params);
    if (q.courseId) {
      params.push(q.courseId);
      where += ` AND g.course_id=$${params.length}`;
    }
    if (q.teacherId) {
      params.push(q.teacherId);
      where += ` AND g.lead_teacher_id=$${params.length}`;
    }
    if (q.search) {
      params.push(`%${q.search.trim().toLowerCase()}%`);
      where += ` AND lower(g.name) LIKE $${params.length}`;
    }
    const pg = this.pg(q),
      limitIndex = params.length + 1;
    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT g.id,g.name,g.status,g.capacity,c.id course_id,c.title course_title,t.id teacher_id,t.display_name teacher_name,COUNT(DISTINCT gs.id) FILTER(WHERE gs.status='ACTIVE')::int active_members FROM study_groups g JOIN courses c ON c.id=g.course_id JOIN users t ON t.id=g.lead_teacher_id LEFT JOIN group_students gs ON gs.group_id=g.id ${where} GROUP BY g.id,c.id,t.id ORDER BY g.created_at DESC LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(`SELECT COUNT(*)::int total FROM study_groups g ${where}`, [
        ...params,
      ]),
    ]);
    const total = Number(count[0].total);
    return {
      data: rows,
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total,
        pages: Math.ceil(total / pg.limit),
      },
    };
  }
  async groupDetail(id: string) {
    const rows = await this.db.query(
      `SELECT g.id,g.name,g.status,g.capacity,c.id course_id,c.title course_title,t.id teacher_id,t.display_name teacher_name,COUNT(DISTINCT gs.id) FILTER(WHERE gs.status='ACTIVE')::int active_members,COUNT(DISTINCT gs.id)::int historical_members FROM study_groups g JOIN courses c ON c.id=g.course_id JOIN users t ON t.id=g.lead_teacher_id LEFT JOIN group_students gs ON gs.group_id=g.id WHERE g.id=$1 GROUP BY g.id,c.id,t.id`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Group not found');
    const [sessions, attendance, assignments] = await Promise.all([
      this.db.query(
        `SELECT s.status,COUNT(*)::int count FROM lesson_sessions s WHERE s.group_id=$1 GROUP BY s.status`,
        [id],
      ),
      this.db.query(
        `SELECT a.status,COUNT(*)::int count FROM attendances a JOIN attendance_sessions ats ON ats.session_id=a.session_id JOIN lesson_sessions s ON s.id=a.session_id WHERE s.group_id=$1 AND s.status<>'CANCELLED' AND ats.status='FINALIZED' GROUP BY a.status`,
        [id],
      ),
      this.db.query(
        `SELECT COUNT(DISTINCT a.id)::int assignments,COUNT(DISTINCT ss.id)::int submissions,COUNT(DISTINCT ss.id) FILTER(WHERE ss.status='GRADED')::int graded FROM assignments a LEFT JOIN assignment_submissions ss ON ss.assignment_id=a.id WHERE a.group_id=$1`,
        [id],
      ),
    ]);
    const counts = Object.fromEntries(
      attendance.map((x: Row) => [x.status, Number(x.count)]),
    );
    return {
      ...rows[0],
      sessions,
      attendance: {
        ...counts,
        ...attendanceRates({
          present: counts.PRESENT ?? 0,
          absent: counts.ABSENT ?? 0,
          late: counts.LATE ?? 0,
          excused: counts.EXCUSED ?? 0,
        }),
      },
      assignments: assignments[0],
    };
  }

  async attendance(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE s.status<>'CANCELLED'`;
    if (p.from) {
      params.push(p.from);
      where += ` AND s.start_at >= $${params.length}`;
    }
    if (p.toExclusive) {
      params.push(p.toExclusive);
      where += ` AND s.start_at < $${params.length}`;
    }
    where += this.filters(q, params, {
      teacherId: 's.teacher_id',
      groupId: 's.group_id',
      courseId: 'g.course_id',
    });
    if (q.studentId) {
      params.push(q.studentId);
      where += ` AND EXISTS(SELECT 1 FROM attendances x JOIN attendance_sessions ax ON ax.session_id=x.session_id WHERE x.session_id=s.id AND x.student_id=$${params.length} AND ax.status='FINALIZED')`;
    }
    if (q.status) {
      params.push(q.status);
      where += ` AND EXISTS(SELECT 1 FROM attendances x JOIN attendance_sessions ax ON ax.session_id=x.session_id WHERE x.session_id=s.id AND x.status=$${params.length} AND ax.status='FINALIZED')`;
    }
    const pg = this.pg(q);
    const base = `FROM lesson_sessions s JOIN study_groups g ON g.id=s.group_id JOIN courses c ON c.id=g.course_id JOIN users t ON t.id=s.teacher_id LEFT JOIN attendance_sessions ats ON ats.session_id=s.id LEFT JOIN attendances a ON a.session_id=s.id AND ats.status='FINALIZED' ${where} GROUP BY s.id,g.id,c.id,t.id,ats.status`;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT s.id session_id,s.start_at,s.end_at,c.id course_id,c.title course_title,g.id group_id,g.name group_name,t.id teacher_id,t.display_name teacher_name,ats.status finalization_status,(SELECT COUNT(*)::int FROM group_students eligible WHERE eligible.group_id=g.id AND eligible.joined_at<=s.start_at AND (eligible.ended_at IS NULL OR eligible.ended_at>s.start_at)) eligible_student_count,COUNT(a.id) FILTER(WHERE a.status='PRESENT')::int present,COUNT(a.id) FILTER(WHERE a.status='ABSENT')::int absent,COUNT(a.id) FILTER(WHERE a.status='LATE')::int late,COUNT(a.id) FILTER(WHERE a.status='EXCUSED')::int excused,COUNT(a.id)::int recorded ${base} ORDER BY s.start_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(
        `SELECT COUNT(*)::int total FROM lesson_sessions s JOIN study_groups g ON g.id=s.group_id ${where}`,
        [...params],
      ),
    ]);
    return {
      data: rows.map((x: Row) => ({
        ...x,
        attendanceRates: attendanceRates({
          present: Number(x.present),
          absent: Number(x.absent),
          late: Number(x.late),
          excused: Number(x.excused),
        }),
      })),
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total: Number(total[0]?.total ?? 0),
        pages: Math.ceil(Number(total[0]?.total ?? 0) / pg.limit),
      },
    };
  }

  async financeOverview(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE true';
    where += this.range('p', p, params);
    where += this.filters(q, params, {
      paymentStatus: 'p.status',
      courseId: 'p.course_id',
      studentId: 'p.user_id',
    });
    const provider = q.provider;
    if (provider) {
      params.push(provider);
      where += ` AND EXISTS(SELECT 1 FROM payment_transactions pt WHERE pt.payment_id=p.id AND pt.provider=$${params.length})`;
    }
    const successfulParams: unknown[] = [];
    let successfulWhere = `WHERE p.status='succeeded' AND p.paid_at IS NOT NULL AND EXISTS(SELECT 1 FROM payment_transactions ok WHERE ok.payment_id=p.id AND ok.status='succeeded')`;
    successfulWhere += this.range('p', p, successfulParams, 'paid_at');
    successfulWhere += this.filters(q, successfulParams, {
      paymentStatus: 'p.status',
      courseId: 'p.course_id',
      studentId: 'p.user_id',
    });
    if (q.provider) {
      successfulParams.push(q.provider);
      successfulWhere += ` AND EXISTS(SELECT 1 FROM payment_transactions pt WHERE pt.payment_id=p.id AND pt.provider=$${successfulParams.length} AND pt.status='succeeded')`;
    }
    const [rows, successful] = await Promise.all([
      this.db.query(
        `SELECT p.status,p.currency,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p ${where} GROUP BY p.status,p.currency`,
        params,
      ),
      this.db.query(
        `SELECT p.currency,COUNT(*)::int count,COALESCE(SUM(p.amount_minor),0)::text amount_minor FROM payments p ${successfulWhere} GROUP BY p.currency`,
        successfulParams,
      ),
    ]);
    return {
      byStatus: rows,
      successful: paymentTotals(
        successful.map((x: Row) => ({
          currency: x.currency,
          count: Number(x.count),
          amountMinor: x.amount_minor,
        })),
      ),
      grossVolumeMeaning: 'Successful payment volume; not profit.',
      refunds: {
        available: false,
        reason:
          'Refund amount is not represented as an authoritative amount in the existing entities.',
      },
    };
  }
  async paymentList(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE true';
    where += this.range('p', p, params);
    where += this.filters(q, params, {
      paymentStatus: 'p.status',
      courseId: 'p.course_id',
      studentId: 'p.user_id',
    });
    if (q.provider) {
      params.push(q.provider);
      where += ` AND EXISTS(SELECT 1 FROM payment_transactions x WHERE x.payment_id=p.id AND x.provider=$${params.length})`;
    }
    const pg = this.pg(q);
    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT p.id,p.user_id student_id,u.display_name student_name,p.course_id,c.title course_title,p.amount_minor::text,p.currency,p.status,p.paid_at,p.created_at,COALESCE(json_agg(json_build_object('provider',pt.provider,'status',pt.status,'createdAt',pt.created_at)) FILTER(WHERE pt.id IS NOT NULL),'[]') transactions FROM payments p JOIN users u ON u.id=p.user_id JOIN courses c ON c.id=p.course_id LEFT JOIN payment_transactions pt ON pt.payment_id=p.id ${where} GROUP BY p.id,u.id,c.id ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(`SELECT COUNT(*)::int total FROM payments p ${where}`, [
        ...params,
      ]),
    ]);
    const total = Number(count[0].total);
    return {
      data: rows,
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total,
        pages: Math.ceil(total / pg.limit),
      },
    };
  }
  async revenueByPeriod(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE p.status='succeeded' AND EXISTS(SELECT 1 FROM payment_transactions ok WHERE ok.payment_id=p.id AND ok.status='succeeded')`;
    where += this.range('p', p, params, 'paid_at');
    return this.db.query(
      `SELECT date_trunc('day',p.paid_at AT TIME ZONE $${params.push(p.timezone)}::text)::date day,p.currency,COUNT(*)::int payment_count,SUM(p.amount_minor)::text gross_amount_minor FROM payments p ${where} AND p.paid_at IS NOT NULL GROUP BY day,p.currency ORDER BY day`,
      params,
    );
  }
  async providers(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE p.status='succeeded' AND EXISTS(SELECT 1 FROM payment_transactions ok WHERE ok.payment_id=p.id AND ok.status='succeeded')`;
    where += this.range('p', p, params, 'paid_at');
    return this.db.query(
      `SELECT pt.provider,p.currency,COUNT(*)::int payment_count,COALESCE(SUM(p.amount_minor),0)::text gross_amount_minor FROM payments p JOIN (SELECT DISTINCT ON(payment_id) payment_id,provider FROM payment_transactions WHERE status='succeeded' ORDER BY payment_id,COALESCE(provider_performed_at,created_at) DESC,id DESC) pt ON pt.payment_id=p.id ${where} GROUP BY pt.provider,p.currency ORDER BY pt.provider,p.currency`,
      params,
    );
  }
  async courseRevenue(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE p.status='succeeded' AND EXISTS(SELECT 1 FROM payment_transactions ok WHERE ok.payment_id=p.id AND ok.status='succeeded')`;
    where += this.range('p', p, params, 'paid_at');
    if (q.courseId) {
      params.push(q.courseId);
      where += ` AND p.course_id=$${params.length}`;
    }
    return this.db.query(
      `SELECT c.id course_id,c.title,c.currency course_currency,p.currency payment_currency,COUNT(DISTINCT p.id)::int payment_count,SUM(p.amount_minor)::text gross_amount_minor FROM payments p JOIN courses c ON c.id=p.course_id ${where} GROUP BY c.id,p.currency ORDER BY gross_amount_minor DESC`,
      params,
    );
  }

  async assignmentReports(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = `WHERE a.status<>'DRAFT'`;
    where += this.range('a', p, params);
    where += this.filters(q, params, {
      courseId: 'a.course_id',
      groupId: 'a.group_id',
      teacherId: 'a.created_by_teacher_id',
    });
    if (q.assignmentId) {
      params.push(q.assignmentId);
      where += ` AND a.id=$${params.length}`;
    }
    let submissionFilter = '';
    if (q.submissionStatus) {
      params.push(q.submissionStatus);
      const index = params.length;
      submissionFilter = ` AND sub.status=$${index}`;
      where += ` AND EXISTS(SELECT 1 FROM assignment_submissions f WHERE f.assignment_id=a.id AND f.status=$${index})`;
    }
    const pg = this.pg(q);
    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT a.id,a.title,a.status,a.due_at,a.max_score::text,c.id course_id,c.title course_title,g.id group_id,g.name group_name,t.display_name teacher_name,COUNT(DISTINCT gs.student_id) FILTER(WHERE gs.joined_at<=COALESCE(a.published_at,a.created_at) AND (gs.ended_at IS NULL OR gs.ended_at>COALESCE(a.published_at,a.created_at)))::int eligible,COUNT(DISTINCT sub.id)::int submissions,COUNT(DISTINCT sub.id) FILTER(WHERE sub.is_late)::int late,COUNT(DISTINCT sub.id) FILTER(WHERE NOT sub.is_late)::int submitted_on_time,COUNT(DISTINCT sub.id) FILTER(WHERE sub.status='GRADED')::int graded,COUNT(DISTINCT sub.id) FILTER(WHERE sub.status='RETURNED')::int returned,(SELECT COUNT(*)::int FROM assignment_submission_reviews hist JOIN assignment_submissions sub_hist ON sub_hist.id=hist.submission_id WHERE sub_hist.assignment_id=a.id) historical_review_count,AVG(latest.score/NULLIF(a.max_score,0)*100) FILTER(WHERE latest.action='GRADED')::numeric(8,2) average_score_percent FROM assignments a JOIN courses c ON c.id=a.course_id JOIN study_groups g ON g.id=a.group_id JOIN users t ON t.id=a.created_by_teacher_id LEFT JOIN group_students gs ON gs.group_id=g.id LEFT JOIN assignment_submissions sub ON sub.assignment_id=a.id${submissionFilter} LEFT JOIN LATERAL(SELECT action,score FROM assignment_submission_reviews WHERE submission_id=sub.id ORDER BY reviewed_at DESC,id DESC LIMIT 1) latest ON true ${where} GROUP BY a.id,c.id,g.id,t.id ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pg.limit, pg.offset],
      ),
      this.db.query(`SELECT COUNT(*)::int total FROM assignments a ${where}`, [
        ...params,
      ]),
    ]);
    const total = Number(count[0].total);
    return {
      data: rows.map((x: Row) => ({
        ...x,
        submission_rate: submissionRate(
          Number(x.submissions),
          Number(x.eligible),
        ),
        missing_submissions:
          x.due_at && new Date(x.due_at).getTime() <= Date.now()
            ? Math.max(0, Number(x.eligible) - Number(x.submissions))
            : null,
      })),
      pagination: {
        page: pg.page,
        limit: pg.limit,
        total,
        pages: Math.ceil(total / pg.limit),
      },
    };
  }

  async crmOverview(q: ReportQueryDto) {
    const p = this.period(q),
      leadParams: unknown[] = [];
    let leadWhere = 'WHERE true';
    leadWhere += this.range('l', p, leadParams);
    const trialParams: unknown[] = [];
    let trialWhere = 'WHERE true';
    trialWhere += this.range('t', p, trialParams, 'scheduled_at');
    const [rows, sources, statuses, trials, operators, conversion] =
      await Promise.all([
        this.db.query(
          `SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='NEW')::int new,COUNT(*) FILTER(WHERE status='WON')::int converted,COUNT(*) FILTER(WHERE status='LOST')::int lost,COUNT(*) FILTER(WHERE assigned_to_user_id IS NULL)::int unassigned,COUNT(*) FILTER(WHERE assigned_to_user_id IS NOT NULL)::int assigned,COUNT(*) FILTER(WHERE next_follow_up_at<now() AND status NOT IN ('WON','LOST'))::int overdue FROM crm_leads l ${leadWhere}`,
          leadParams,
        ),
        this.db.query(
          `SELECT source,COUNT(*)::int count FROM crm_leads l ${leadWhere} GROUP BY source`,
          leadParams,
        ),
        this.db.query(
          `SELECT status,COUNT(*)::int count FROM crm_leads l ${leadWhere} GROUP BY status`,
          leadParams,
        ),
        this.db.query(
          `SELECT t.status,COUNT(*)::int count FROM crm_trial_lessons t ${trialWhere} GROUP BY t.status`,
          trialParams,
        ),
        this.db.query(
          `SELECT u.id,u.display_name,COUNT(*) FILTER(WHERE l.status NOT IN ('WON','LOST'))::int open_leads,COUNT(*) FILTER(WHERE l.next_follow_up_at<now() AND l.status NOT IN ('WON','LOST'))::int overdue FROM crm_leads l JOIN users u ON u.id=l.assigned_to_user_id ${leadWhere} GROUP BY u.id ORDER BY open_leads DESC LIMIT 100`,
          leadParams,
        ),
        this.db.query(
          `SELECT AVG(EXTRACT(EPOCH FROM(l.converted_at-l.created_at))/86400) FILTER(WHERE l.status='WON')::numeric(10,2) average_conversion_days FROM crm_leads l ${leadWhere}`,
          leadParams,
        ),
      ]);
    return {
      overview: {
        ...rows[0],
        conversionRate: crmConversionRate(
          Number(rows[0]?.converted ?? 0),
          Number(rows[0]?.total ?? 0),
        ),
        averageConversionDays: conversion[0]?.average_conversion_days ?? null,
      },
      bySource: sources,
      byStatus: statuses,
      trials,
      operators,
    };
  }
  async crmConversion(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE true';
    where += this.range('l', p, params);
    const rows = await this.db.query(
      `SELECT status,COUNT(*)::int count,AVG(EXTRACT(EPOCH FROM(converted_at-created_at))/86400) FILTER(WHERE status='WON')::numeric(10,2) avg_days_to_conversion FROM crm_leads l ${where} GROUP BY status`,
      params,
    );
    const total = rows.reduce((n: number, r: Row) => n + Number(r.count), 0),
      won = Number(rows.find((r: Row) => r.status === 'WON')?.count ?? 0);
    return {
      byStatus: rows,
      total,
      converted: won,
      conversionRate: crmConversionRate(won, total),
      definition:
        'Converted leads divided by all leads created in the filtered cohort.',
    };
  }
  async crmOperators(q: ReportQueryDto) {
    const p = this.period(q),
      params: unknown[] = [];
    let where = 'WHERE l.assigned_to_user_id IS NOT NULL';
    where += this.range('l', p, params);
    return this.db.query(
      `SELECT u.id,u.display_name,COUNT(*)::int assigned_leads,COUNT(*) FILTER(WHERE l.status='WON')::int converted,COUNT(*) FILTER(WHERE l.status='LOST')::int lost,COUNT(*) FILTER(WHERE l.next_follow_up_at<now() AND l.status NOT IN ('WON','LOST'))::int overdue_followups FROM crm_leads l JOIN users u ON u.id=l.assigned_to_user_id ${where} GROUP BY u.id ORDER BY assigned_leads DESC`,
      params,
    );
  }

  async export(
    kind: 'students' | 'attendance' | 'finance' | 'assignments' | 'leads',
    q: ReportQueryDto,
  ) {
    const rows: Row[] = [];
    if (kind === 'leads') {
      const p = this.period(q),
        params: unknown[] = [];
      let where = 'WHERE true';
      where += this.range('l', p, params);
      rows.push(
        ...(await this.db.query(
          `SELECT l.id,l.source,l.status,l.created_at,l.converted_at FROM crm_leads l ${where} ORDER BY l.created_at DESC LIMIT 5000`,
          params,
        )),
      );
    } else {
      for (let page = 1; page <= 50; page++) {
        const bounded = { ...q, page, limit: 100 };
        const result =
          kind === 'students'
            ? await this.studentList(bounded)
            : kind === 'attendance'
              ? await this.attendance(bounded)
              : kind === 'finance'
                ? await this.paymentList(bounded)
                : await this.assignmentReports(bounded);
        rows.push(...(result.data as Row[]));
        if (result.data.length < 100) break;
      }
    }
    if (kind === 'students')
      return toCsv(
        ['id', 'display_name', 'status', 'created_at', 'active_groups'],
        rows.map((x) => [
          x.id,
          x.display_name,
          x.status,
          x.created_at,
          x.active_groups,
        ]),
      );
    if (kind === 'finance')
      return toCsv(
        [
          'id',
          'student_id',
          'student_name',
          'course_id',
          'course_title',
          'amount_minor',
          'currency',
          'status',
          'paid_at',
          'created_at',
        ],
        rows.map((x) => [
          x.id,
          x.student_id,
          x.student_name,
          x.course_id,
          x.course_title,
          x.amount_minor,
          x.currency,
          x.status,
          x.paid_at,
          x.created_at,
        ]),
      );
    if (kind === 'leads')
      return toCsv(
        ['id', 'source', 'status', 'created_at', 'converted_at'],
        rows.map((x) => [
          x.id,
          x.source,
          x.status,
          x.created_at,
          x.converted_at,
        ]),
      );
    if (kind === 'attendance')
      return toCsv(
        [
          'session_id',
          'start_at',
          'end_at',
          'course_title',
          'group_name',
          'teacher_name',
          'finalization_status',
          'eligible_student_count',
          'present',
          'absent',
          'late',
          'excused',
          'attendance_rate',
          'absence_rate',
          'late_rate',
        ],
        rows.map((x) => [
          x.session_id,
          x.start_at,
          x.end_at,
          x.course_title,
          x.group_name,
          x.teacher_name,
          x.finalization_status,
          x.eligible_student_count,
          x.present,
          x.absent,
          x.late,
          x.excused,
          x.attendanceRates.attendanceRate,
          x.attendanceRates.absenceRate,
          x.attendanceRates.lateRate,
        ]),
      );
    return toCsv(
      [
        'assignment_id',
        'title',
        'status',
        'due_at',
        'course_title',
        'group_name',
        'teacher_name',
        'eligible',
        'submissions',
        'submission_rate',
        'late',
        'submitted_on_time',
        'graded',
        'returned',
        'historical_review_count',
        'average_score_percent',
        'missing_submissions',
      ],
      rows.map((x) => [
        x.id,
        x.title,
        x.status,
        x.due_at,
        x.course_title,
        x.group_name,
        x.teacher_name,
        x.eligible,
        x.submissions,
        x.submission_rate,
        x.late,
        x.submitted_on_time,
        x.graded,
        x.returned,
        x.historical_review_count,
        x.average_score_percent,
        x.missing_submissions,
      ]),
    );
  }
}
