# Attendance (Phase 8)

## Architecture

`Attendance` associates one `LessonSession`, one student, and the `GroupStudent` membership that covered the session date. A unique session/student constraint prevents duplicate records. `AttendanceSession` stores the recording lifecycle separately from the lesson session. `AttendanceHistory` is append-only through application APIs and records record creation/changes plus finalization and reopening. Foreign keys use restrictive deletion for historical records; actor references may become null if the actor account is removed.

The additive migration is `20261104200000-Attendance`. It has not been executed. Apply it only after approval using the TypeORM migration process. `synchronize` and `migrationsRun` remain disabled. No database connection or persistent data was accessed for this work.

## Statuses and workflow

Record statuses are `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED`. `LATE` requires positive `latenessMinutes`; other statuses accept null/zero. `EXCUSED` requires a non-empty reason. Teacher notes are selected out by default and are omitted from student responses.

The session attendance lifecycle is `NOT_STARTED → IN_PROGRESS → FINALIZED → REOPENED → IN_PROGRESS/FINALIZED`. Starting and progressive saves create or move the lifecycle into progress. Finalization requires a record for every membership whose joined/ended interval covered the lesson start. Students are never automatically marked absent. Only an administrator can reopen a finalized session, with a reason; administrators must reopen before changing finalized records. Lifecycle operations and bulk updates lock the lesson session and group rows. Every record change writes history in the same transaction.

## Permissions and endpoints

- Teachers can act only on sessions assigned to their authenticated user. Administrators can act on all sessions.
- Students can list, inspect, and view statistics for their own attendance. The student ID is always taken from the authenticated identity.
- Admin routes require `ADMIN` or `SUPER_ADMIN`.
- Teacher workflow: `GET /api/teachers/me/sessions/:sessionId/attendance`, `GET .../eligible`, `POST .../start`, `PUT ...`, `PATCH .../:attendanceId`, and `POST .../finalize`.
- Student: `GET /api/students/me/attendance`, `GET /api/students/me/attendance/statistics`, `GET /api/students/me/attendance/:id`.
- Admin: `GET /api/admin/attendance`, `GET /api/admin/attendance/statistics`, `GET /api/admin/attendance/sessions/:sessionId`, `PATCH /api/admin/attendance/:attendanceId`, and `POST /api/admin/attendance/sessions/:sessionId/reopen`.
- Admin listing/statistics filters include student, teacher, group, course, status, session, and date range. Lists are paginated (up to 100 rows).

## Statistics

Only finalized attendance records for non-cancelled lesson sessions contribute. Unfinalized sessions and missing records do not count. Excused records are reported separately and excluded from the attendance, absence, and lateness percentage denominator. Attendance percentage is `(present + late) / (total - excused) * 100`; absence and late percentages use the same denominator. `totalScheduledSessions` is the number of finalized session records included, including excused records. Date filters use UTC calendar dates.

## Notifications and audit

Finalization of absent or late records produces generic notifications without teacher notes, reason text, or other sensitive fields. Notifications use event keys and are persisted/delivered through the existing NotificationsService after the attendance transaction commits. A process interruption between commit and notification persistence can still miss a notification; a transactional outbox would close that gap. History is never exposed through a mutation endpoint; each status/lateness change records the actor and before/after values.

## Limitations

Automated Phase 8 tests cover field validation and statistics formulas. Database-backed transactional, authorization, lifecycle, notification, and rollback scenarios still need dedicated tests. No PostgreSQL integration test was run because this task must not touch the existing database; the migration has only been reviewed offline.
