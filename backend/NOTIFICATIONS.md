# Notifications and FCM

## Firebase project setup

Create a Firebase project and enable Cloud Messaging. Grant the backend workload service account permission to send FCM messages. The API uses Firebase Admin SDK Application Default Credentials (ADC), not service-account JSON in source control. In Google Cloud, bind a least-privilege workload identity/service account to the runtime. Outside Google Cloud, mount the service-account file from a secret manager and set `GOOGLE_APPLICATION_CREDENTIALS` to its path. Set `FIREBASE_PROJECT_ID` to the matching project. Missing configuration or SDK credentials leaves the Nest application running; deliveries are marked unavailable/failed and no credentials are returned to clients.

The repository currently cannot fetch npm packages from this environment, so `firebase-admin` is not yet present in `package-lock.json`. The provider loads the official SDK lazily and remains unavailable until `firebase-admin` is installed from the npm registry (`npm install firebase-admin@14.5.0`). Do this before enabling Firebase configuration in a deployment.

The official setup guidance recommends ADC in Google environments and an externally secured credentials file for non-Google hosts: [Firebase Admin setup](https://firebase.google.com/docs/admin/setup).

## Mobile app responsibilities

Android and iOS apps must be registered in the same Firebase project, include their platform Firebase configuration, request notification permission where required, obtain/refresh the FCM registration token, and send the current token to the authenticated API. APNs credentials and iOS notification capabilities must be configured in Firebase/Apple developer settings. On logout, token rotation, app reinstall, or device retirement, remove/re-register the device token.

## Configuration

- `FIREBASE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` (path only; keep the file outside the repository), or workload ADC in the runtime environment

The backend accepts no private key content through API requests. FCM multicast sends up to 500 tokens per SDK request; invalid/unregistered tokens are deactivated. Provider acceptance does not guarantee that an operating system displays a push notification. The API stores notification history independently of push delivery.

## API

- `POST /api/notifications/devices` register/reassign the authenticated user's token (`token`, `platform`, optional `deviceName`).
- `GET /api/notifications/devices` list owned device metadata without returning tokens.
- `DELETE /api/notifications/devices` deactivate an owned device by `deviceId`.
- `GET /api/notifications?page=1&limit=20&unread=true|false`, `GET /api/notifications/unread-count`.
- `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/:id`.
- `POST /api/admin/notifications` (includes an `idempotencyKey`), `GET /api/admin/notifications`, `GET /api/admin/notifications/statistics` (ADMIN/SUPER_ADMIN only).

Notification type values: `GENERAL`, `COURSE_PUBLISHED`, `NEW_LESSON`, `LESSON_UPDATED`, `TEST_AVAILABLE`, `TEST_RESULT`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `PAYMENT_CANCELLED`, `ENROLLMENT_CREATED`, `SCHEDULE_UPDATED`, `ANNOUNCEMENT`.

## Delivery and reliability

Notification rows are an outbox with unique event keys and a single-winner `pending` to `sending` claim. FCM is invoked after the existing business write/transaction commits; notification persistence currently follows that commit, leaving a small crash window in which a committed business event might not create a notification. Provider delivery failures are recorded; there is no background retry worker. FCM does not offer transactional exactly-once delivery, so an ambiguous provider/network outcome can still be duplicated at the device. Event coverage is added at the existing payment, course publication, lesson publication/update, and assessment submission boundaries where available; there is no schedule module in this phase.
