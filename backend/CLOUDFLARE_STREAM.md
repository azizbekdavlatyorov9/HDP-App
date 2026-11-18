# Cloudflare Stream video workflow

The backend creates Cloudflare Stream Direct Creator Upload URLs. Video bytes go from the administrator's app directly to Cloudflare; NestJS never proxies the file. PostgreSQL stores the lesson relation, provider UID, title, upload/processing status, duration, thumbnail, and audit timestamps.

## Configuration

Set these values in the deployment secret store or local `.env` (never commit real credentials):

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account identifier.
- `CLOUDFLARE_STREAM_API_TOKEN`: API token with the Stream read/write permissions needed to create uploads, issue signed tokens, and delete videos. The legacy `CLOUDFLARE_API_TOKEN` name remains accepted for compatibility.
- `CLOUDFLARE_WEBHOOK_SECRET`: signing secret returned when configuring the Stream webhook.
- `CLOUDFLARE_STREAM_CUSTOMER_CODE`: optional customer code for `customer-<code>.cloudflarestream.com` playback URLs.

If account/token configuration is missing, upload, playback, and deletion return service unavailable. The webhook secret is separately required to validate callbacks.

## Upload flow

1. An authenticated `ADMIN` or `SUPER_ADMIN` calls `POST /api/videos/upload-url` with `lessonId`, `maxDurationSeconds` (1–36,000), and optional `title`.
2. The backend checks the lesson and its course authorization, creates a private one-time Cloudflare upload (`requireSignedURLs: true`), and stores its UID and metadata as `pending`.
3. The app uploads the file directly to the returned `uploadUrl`. Do not send the video file through the NestJS API.
4. Cloudflare calls `POST /api/videos/webhook`; the API verifies the `Webhook-Signature` against the raw request body and advances the record to `processing`, `ready`, or `error`.

The legacy `POST /api/lessons/:lessonId/videos/upload` remains available and accepts `maxDurationSeconds`.

## Playback and metadata

- `GET /api/videos?lessonId=<uuid>` returns metadata visible to the current role. Students see ready videos only and must have access to the lesson/course; teachers are limited to courses they manage; administrators can inspect all records.
- `GET /api/videos/:id/playback` is restricted to `STUDENT`, verifies active enrollment/free-lesson and prerequisite access, and requires the video to be `ready`.
- The backend requests a Cloudflare signed token with a 15-minute expiry and downloads disabled. The returned HLS manifest is suitable for an HLS-capable mobile player and Cloudflare serves adaptive bitrate variants.
- `GET /api/videos/:id/status` is available to administrators and the course's lead teacher.
- `DELETE /api/videos/:id` is restricted to administrators, verifies course authorization, deletes the corresponding Cloudflare UID, then marks the row `deleted`.

Never log, persist, or expose the Cloudflare API token. Signed playback URLs are bearer credentials and should not be stored by mobile clients longer than needed.

## Webhook and migration

Configure the Stream webhook URL as `https://<api-host>/api/videos/webhook` and set its signing secret in `CLOUDFLARE_WEBHOOK_SECRET`. Duplicate/out-of-order callbacks are handled idempotently: terminal `ready`, `error`, and `deleted` states do not regress.

`20261109000000-CloudflareVideoLifecycle` adds the provider/title/thumbnail metadata and the `pending`/`deleted` statuses. Review its SQL before applying it. It has not been run by this implementation task; do not run it against production or staging without the separately required approval. Its `down()` intentionally refuses to discard persisted video metadata or lifecycle state.

No real Cloudflare API credentials were used for local verification, so a successful provider round trip must be verified in an isolated deployment environment.
