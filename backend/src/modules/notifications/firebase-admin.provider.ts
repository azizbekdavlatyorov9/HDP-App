import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import type { FcmMessage, FcmProvider, FcmSendResult } from './fcm-provider.js';
type MessagingClient = { sendEachForMulticast(message: unknown): Promise<{ responses: Array<{ success: boolean; error?: { code?: string } }> }> };

@Injectable()
export class FirebaseAdminProvider implements FcmProvider, OnModuleInit {
  private messaging: MessagingClient | null = null;
  private configured = false;
  constructor(private readonly config: ConfigService) {}
  async onModuleInit(): Promise<void> {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) return;
    const credentialFile = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    const managedRuntime = Boolean(process.env.K_SERVICE || process.env.GAE_ENV || process.env.GCE_METADATA_HOST);
    if (credentialFile ? !existsSync(credentialFile) : !managedRuntime) return;
    try {
      const appModuleName = 'firebase-admin/app';
      const messagingModuleName = 'firebase-admin/messaging';
      const appSdk = await import(appModuleName) as { getApps(): unknown[]; initializeApp(options: unknown): unknown; applicationDefault(): unknown; getApp(): unknown };
      const msgSdk = await import(messagingModuleName) as { getMessaging(app?: unknown): MessagingClient };
      const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp({ credential: appSdk.applicationDefault(), projectId });
      this.messaging = msgSdk.getMessaging(app);
      this.configured = Boolean(this.messaging);
    } catch {
      this.configured = false;
      this.messaging = null;
    }
  }
  available(): boolean { return this.configured && this.messaging !== null; }
  async send(tokens: string[], notification: FcmMessage): Promise<FcmSendResult> {
    if (!this.messaging) throw new Error('FCM_UNAVAILABLE');
    const result: FcmSendResult = { successTokens: [], invalidTokens: [] };
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const response = await this.messaging.sendEachForMulticast({ tokens: batch, notification: { title: notification.title, body: notification.body }, data: notification.data });
      response.responses.forEach((item, index) => {
        if (item.success) result.successTokens.push(batch[index]!);
        else if (item.error?.code === 'messaging/invalid-registration-token' || item.error?.code === 'messaging/registration-token-not-registered') result.invalidTokens.push(batch[index]!);
      });
    }
    return result;
  }
}
