# Homework and assignments (Phase 9)

## Architecture and relationships

`Assignment` belongs to one course and one study group, optionally one lesson, and records its author. The service verifies that the group belongs to the course and the optional lesson belongs to the same course. Publishing also requires a published course, active group, and (when linked) published lesson.

`AssignmentAttachment` stores private reference-file metadata. `AssignmentSubmission` is the current submission for one assignment/student pair and references the group membership. `AssignmentSubmissionRevision` snapshots each submitted version with an idempotency key; `AssignmentSubmissionAttachment` links private objects to a specific revision. `AssignmentSubmissionReview` is append-only grade/return history. Assignment edits, publication changes, submissions, resubmissions, grades, and returns also write `AuditLog` records in the same transaction when applicable.

All foreign keys preserve history with `ON DELETE RESTRICT`. Scores use PostgreSQL `numeric(10,2)`; the database enforces nonnegative values and the service enforces the assignment maximum. Storage keys are selected out by default and omitted from all API responses.

## Endpoints

Teacher or administrator routes:

- `POST /api/teachers/me/assignments` — create draft.
- `GET /api/teachers/me/assignments` — paginated list; filter group, course, status, and deadline.
- `GET /api/teachers/me/assignments/statistics` — assignment/submission status counts with supported assignment filters.
- `GET /api/teachers/me/assignments/:id` — details and submission summary.
- `PATCH /api/teachers/me/assignments/:id` — update under lifecycle restrictions.
- `POST /api/teachers/me/assignments/:id/publish` and `/archive`.
- `GET /api/teachers/me/assignments/:id/submissions` — paginated, optionally status-filtered list.
- `GET /api/teachers/me/submissions/:submissionId`, `POST .../:submissionId/grade`, and `POST .../:submissionId/return`.
- Assignment reference upload flow: `POST /api/teachers/me/assignments/:id/attachments/upload` then `/attachments/complete`; download link request at `GET /api/teachers/me/assignment-attachments/:attachmentId/url?assignmentId=...`.
- Submission attachment download link request: `GET /api/teachers/me/submissions/:submissionId/attachments/:attachmentId/url`.

Student routes:

- `GET /api/students/me/assignments` — paginated published assignments for active groups; filters group, course, submission status, and deadline.
- `GET /api/students/me/assignments/:id` and `POST .../:id/submissions`.
- `PATCH /api/students/me/submissions/:submissionId` — resubmit under the policy below.
- `GET /api/students/me/submissions` and `GET .../:submissionId` — own current submission, versions, review history, and feedback.
- Assignment reference download link: `GET /api/students/me/assignments/:assignmentId/attachments/:attachmentId/url`.
- Own submission attachment upload/download routes are under `/api/students/me/submissions/:submissionId/attachments`.

Admin routes (ADMIN/SUPER_ADMIN):

- `GET /api/admin/assignments`, `GET /api/admin/assignments/:id`, `PATCH /api/admin/assignments/:id/status`, `GET /api/admin/assignments/statistics`, and `GET /api/admin/submissions`.

Paginated lists default to 20 and cap at 100. DTO validation and Swagger metadata are applied on the API inputs/routes.

## Access and lifecycle

Only an active teacher assigned as the group lead or an administrator may manage an assignment. Students need their own active membership in its group to list/view/submit. Every student query scopes records by the authenticated user; actor, teacher, and student IDs are never accepted from request bodies. Teachers/admins can review submissions only for assignments they manage, except administrators may manage all.

Assignments move from `DRAFT` to `PUBLISHED` to `ARCHIVED`. Archived assignments retain all submissions and reviews and cannot be reactivated or edited through normal APIs. Published assignment content, group/course/lesson, score maximum, and correction policy are frozen. Before any submissions exist, a published deadline can only be extended and late submissions can be enabled, not disabled. Once submissions exist, deadline settings are frozen too.

The first submission creates the one current assignment/student record and revision 1. Repeated POSTs with the same idempotency key and same answer return the existing submission; different content under the same key conflicts. Further submissions use PATCH and a new idempotency key, increment the version, preserve the previous revision and its attachment metadata, and record an audit event.

Resubmission is allowed before the deadline when `allowResubmission` is enabled (default true). A `RETURNED` submission may be corrected, subject to the same deadline/late-submission rule. A `GRADED` submission may be resubmitted only when `allowResubmissionAfterGraded` was enabled before publication (default false). If `allowLateSubmission` is false, the server rejects submissions after `dueAt`; if true, the server sets `isLate` and `LATE` using its own timestamp. At the exact deadline a submission is on time. Scores and review metadata are never accepted from students.

## Attachments and storage

Cloudflare Stream is only used for video. There was no general private document storage provider in the project, so this phase adds an `AssignmentStorageProvider` boundary and a default unavailable adapter. All upload, completion, and download URL operations return HTTP 503 until a private object-storage adapter is configured. The code does not store binary data in PostgreSQL and does not claim uploads currently work.

When a provider is added, it must issue short-lived scoped upload grants, verify the stored object's actual MIME type, size, and scope on completion, issue short-lived authorized download URLs, and never accept arbitrary client storage keys. The API currently allows PDF, plain text, JPEG, PNG, DOC/DOCX, and XLS/XLSX metadata up to 50 MiB; max counts are 10 assignment files and 5 files per submission revision. Object cleanup for abandoned uploads also needs a provider-specific lifecycle policy. No new storage credentials/environment variables are required until a provider is selected.

## Notifications and deadlines

Publishing queues an idempotent generic notification for active group members. Grading and return-for-correction queue generic notifications for the relevant student; notification text does not contain answers or feedback. Delivery is delegated to the existing `NotificationsService`; Firebase delivery depends on its provider configuration and is not guaranteed by this module.

No reliable scheduler/background-job mechanism is configured in the project. Deadline reminders are therefore deferred; this phase does not invent a scheduler.

## Migration and verification

The additive migration is `20261104210000-Assignments`. It creates assignments, reference attachments, current submissions, version snapshots, submission attachments, and review history with UUID keys, restrictive foreign keys, unique constraints, status/score/file-size checks, and query indexes. It has not been executed. Apply it later through the approved TypeORM migration workflow. `synchronize: false` and `migrationsRun: false` remain disabled.

Unit tests cover deadline/late classification, publish prerequisites, resubmission rules, grade range, safe filename/MIME/size checks, and the unavailable-storage response. Database-backed transaction, relation-integrity, notification, and ownership scenarios still need more dedicated tests. No PostgreSQL integration test was run because no isolated assignment test database is configured. A notification can be missed if the process stops between a committed assignment/submission transaction and the subsequent notification persistence call; an outbox would eliminate that window.
