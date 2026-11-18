# Groups and scheduling (Phase 7)

## Model and relationships

`StudyGroup` belongs to one course and one lead teacher. `GroupStudent` is a historical membership record; an active membership is unique per group/student pair. A group may have multiple `GroupSchedule` weekly recurrence rules, each linked to a classroom and assigned teacher. `LessonSession` is a generated dated instance linked to its recurrence, group, classroom and teacher. Classrooms and all referenced historical records use restrictive foreign keys so history is preserved.

## Lifecycles

Groups use `DRAFT → ACTIVE → PAUSED/COMPLETED/CANCELLED` (paused groups may reactivate). Membership states are `ACTIVE`, `COMPLETED`, `LEFT`, and `REMOVED`; leaving or removing closes the row, and rejoining creates/re-activates a historical row without deleting history. Terminal group states close active memberships. Session states are `SCHEDULED → IN_PROGRESS → COMPLETED`, with cancellation allowed before completion.

Only `ADMIN` and `SUPER_ADMIN` create or administer groups/classrooms/schedules. A lead teacher may manage their own group schedules and sessions. Teachers see their assigned groups/sessions; students see only their active memberships and related schedules/sessions. Membership lists and history are restricted to managers.

## Recurrence and time zones

Weekdays use JavaScript numbering (`0` = Sunday through `6` = Saturday). Recurrence dates and weekly wall-clock hours are stored as PostgreSQL `date` and `time`; timezone defaults to `Asia/Tashkent` and is validated using the runtime IANA timezone database. Generated session timestamps are UTC instants stored as `timestamptz`. Generation accepts an inclusive date interval up to 366 days and is idempotent on `(schedule_id, original_start_at)`. Rescheduling changes actual start/end while preserving original occurrence timestamps.

## Conflict control

The service checks active recurrence rules and generated non-cancelled sessions for group, teacher, and classroom overlaps, plus room/group capacity. Transaction-scoped PostgreSQL advisory locks serialize operations on each of those resources. A partial unique index protects active membership and a unique index prevents duplicate generated occurrences. Explicit SQL overlap constraints were not added: current TypeORM setup does not model PostgreSQL range/exclusion constraints, and advisory locks plus transactional checks are used instead. All writers must follow these service locks; direct database writes bypass the protection.

## Notifications

Membership changes, teacher replacement, schedule changes, session rescheduling, and cancellation persist notification events after the business transaction commits through the existing `NotificationsService`; event keys provide deduplication. Existing push delivery remains owned by that service. A process failure between commit and notification persistence can leave a missed notification; a transactional outbox would be needed to eliminate that gap.

## Endpoints

- Groups: `POST/GET /api/groups`, `GET/PATCH /api/groups/:id`, `PATCH /api/groups/:id/status`.
- Membership: `POST/GET /api/groups/:id/students`, `DELETE /api/groups/:id/students/:studentId`, `GET /api/groups/:id/memberships`, `PATCH /api/groups/:id/memberships/:membershipId`, `GET /api/groups/me`.
- Teacher groups: `GET /api/teachers/me/groups`, `GET /api/teachers/:teacherId/groups` (self or administrator).
- Classrooms: `POST/GET /api/classrooms`, `GET/PATCH /api/classrooms/:id`, `PATCH /api/classrooms/:id/status`.
- Schedules: `POST/GET /api/schedules`, `GET/PATCH /api/schedules/:id`, `PATCH /api/schedules/:id/status`, `POST /api/schedules/:id/generate-sessions`.
- Sessions: `GET /api/sessions`, `GET /api/sessions/:id`, `PATCH /api/sessions/:id/reschedule`, `PATCH /api/sessions/:id/cancel`, `PATCH /api/sessions/:id/status`, plus personal student/teacher session lists.

## Migration and verification

`20261104190000-GroupsScheduling` is additive and has not been executed. Apply it only through the reviewed TypeORM migration process after approval. PostgreSQL connectivity and schema state were not inspected in this phase; no database data or `.env` values were accessed. `synchronize` and automatic migrations remain disabled.
