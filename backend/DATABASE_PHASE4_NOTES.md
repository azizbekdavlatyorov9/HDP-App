# Phase 4 database notes

No migration was executed. The current entity schema supports the Phase 4 course, lesson, video, assessment, enrollment, and progress flows. `Category.archivedAt` is the one additive schema change introduced by Phase 4 and is not present in the initial migration: the next migration must add nullable `categories.archived_at TIMESTAMPTZ` (no default, backfill, or data deletion). Apply only after separately reviewing and approving that migration against the target database.

Assessment attempt creation uses a PostgreSQL transaction-scoped advisory lock keyed by the user and test to serialize attempt-limit checks. Existing attempt uniqueness remains `(test_id, user_id, attempt_number)`.
