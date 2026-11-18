# Reports and analytics

## Architecture and permissions

`ReportsModule` performs read-only, database-side aggregation against existing application records. It creates no reporting records and introduces no cache or snapshot table. All routes are under `/api/admin/reports` and protected by `JwtAuthGuard` plus `ADMIN`/`SUPER_ADMIN` role checks. Finance routes and exports inherit the same restriction. Response queries select report fields explicitly and never return auth identities, OTPs, refresh tokens, answer contents, private teacher notes, or storage keys.

## Data sources

- Students and teachers: `users`, `user_roles`, `roles`.
- Courses and enrollment: `courses`, `lessons`, `enrollments`, `course_progress`.
- Groups and sessions: `study_groups`, `group_students`, `lesson_sessions`.
- Attendance: `attendance_sessions`, `attendances`.
- Finance: `payments`, `payment_transactions`.
- Assignments: `assignments`, `group_students`, `assignment_submissions`, `assignment_submission_reviews`.
- CRM: `crm_leads`, `crm_trial_lessons`.

No reporting schema migration or index is added. Existing indexes support the principal join keys and common filters; larger production datasets should be profiled before proposing additional indexes.

## Endpoints

- `GET /api/admin/reports/dashboard`
- `GET /api/admin/reports/students`, `/students/statistics`, `/students/:studentId`, `/students/export`
- `GET /api/admin/reports/teachers`, `/teachers/statistics`, `/teachers/:teacherId`
- `GET /api/admin/reports/courses`, `/courses/:courseId`, `/groups`, `/groups/:groupId`
- `GET /api/admin/reports/attendance`, `/attendance/export`
- `GET /api/admin/reports/finance/overview`, `/finance/payments`, `/finance/payments/export`, `/finance/revenue-by-period`, `/finance/providers`, `/finance/course-revenue`
- `GET /api/admin/reports/assignments`, `/assignments/export`
- `GET /api/admin/reports/crm/overview`, `/crm/conversion`, `/crm/operators`, `/crm/leads/export`

List endpoints use page/limit with a maximum limit of 100. CSV exports are bounded to the first 5,000 filtered rows and use UTF-8 with BOM. CSV fields are quoted, embedded quotes are doubled, and formula-like values are prefixed with an apostrophe. Exports omit lead phone/email and assignment answers/feedback.

## Date and timezone rules

Dates are accepted as ISO `YYYY-MM-DD` or ISO timestamps with an explicit timezone. The default IANA timezone is `Asia/Tashkent`. Date-only bounds are interpreted as local calendar dates and converted to a half-open UTC interval: `from` includes local midnight and `to` includes that full local day by using the following day’s midnight as the exclusive upper bound. Timestamp bounds are passed as half-open instants (`>= from`, `< to`). The maximum selected interval is 366 days. Invalid dates, zones, and reversed intervals are rejected.

## Metric definitions

- Student “active” means `users.status='active'`; inactive means `suspended`; deleted users are omitted. Active-group membership requires `group_students.status='ACTIVE'`.
- Course status values are `draft`, `published`, `archived`. Group active means `study_groups.status='ACTIVE'`; available capacity compares active membership count with the persisted `capacity`.
- Attendance excludes cancelled lesson sessions and counts records only when their `attendance_sessions.status='FINALIZED'`. Present, absent, late, and excused are counted separately. The percentage denominator is `present + absent + late`; excused records are omitted. Attendance rate is `(present + late) / denominator`; absence and late rates divide their respective count by the same denominator. An unfinalized session is not treated as absent.
- Successful payment volume uses `payments.status='succeeded'`, a successful `PaymentTransaction`, `paid_at` within the selected period, and sums `amount_minor` as exact integer text, grouped by currency. Pending/processing and failed counts use payment creation time; failed and refunded payment statuses are not revenue. Provider reports assign each payment to its most recent successful provider transaction, so a payment is not added to multiple providers. Values are gross payment volume, not profit. The Payment model has no cancelled status, so cancellation count is unavailable and failed payments are not treated as cancellations. The existing schema has no authoritative refund amount record, so refund amount is explicitly unavailable; refunded status is not treated as an amount. Payment list and status overview date filters use payment `created_at`; revenue-by-period uses `paid_at`.
- Assignment eligibility counts group memberships active at publication (`joined_at <= published_at/created_at` and no end before that time). Submission rate is `submissions / eligible students`; the latest review is the authoritative current grade. Missing submission counts are populated only for assignments with a due date in the past. The assignment report also returns the total historical review count separately from current submission status.
- CRM conversion rate is converted (`WON`) leads divided by all leads created in the filtered cohort, including open and lost leads. Conversion duration is the average time from lead creation to `converted_at`. Trials are grouped by their trial status and scheduled time. Operator workload is measurable assignment/follow-up activity, not a performance ranking.

## Limitations

Several detailed report filters are intentionally limited to existing indexed relations. Teacher and course detail reports expose activity counts rather than subjective scores. Current response models do not provide an independent count of completed assignment review history. No report query was run against PostgreSQL, so runtime SQL behavior and query plans remain unverified. Existing migrations may not have been applied; CRM reports require the Phase 10 CRM migration to be applied by the deployment owner. `synchronize` and `migrationsRun` remain disabled. No migration was created or executed in this phase.
