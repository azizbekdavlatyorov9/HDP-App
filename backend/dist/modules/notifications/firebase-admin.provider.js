var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
let FirebaseAdminProvider = class FirebaseAdminProvider {
    config;
    messaging = null;
    configured = false;
    constructor(config) {
        this.config = config;
    }
    async onModuleInit() {
        const projectId = this.config.get('FIREBASE_PROJECT_ID');
        if (!projectId)
            return;
        const credentialFile = this.config.get('GOOGLE_APPLICATION_CREDENTIALS');
        const managedRuntime = Boolean(process.env.K_SERVICE || process.env.GAE_ENV || process.env.GCE_METADATA_HOST);
        if (credentialFile ? !existsSync(credentialFile) : !managedRuntime)
            return;
        try {
            const appModuleName = 'firebase-admin/app';
            const messagingModuleName = 'firebase-admin/messaging';
            const appSdk = await import(appModuleName);
            const msgSdk = await import(messagingModuleName);
            const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp({ credential: appSdk.applicationDefault(), projectId });
            this.messaging = msgSdk.getMessaging(app);
            this.configured = Boolean(this.messaging);
        }
        catch {
            this.configured = false;
            this.messaging = null;
        }
    }
    available() { return this.configured && this.messaging !== null; }
    async send(tokens, notification) {
        if (!this.messaging)
            throw new Error('FCM_UNAVAILABLE');
        const result = { successTokens: [], invalidTokens: [] };
        for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500);
            const response = await this.messaging.sendEachForMulticast({ tokens: batch, notification: { title: notification.title, body: notification.body }, data: notification.data });
            response.responses.forEach((item, index) => {
                if (item.success)
                    result.successTokens.push(batch[index]);
                else if (item.error?.code === 'messaging/invalid-registration-token' || item.error?.code === 'messaging/registration-token-not-registered')
                    result.invalidTokens.push(batch[index]);
            });
        }
        return result;
    }
};
FirebaseAdminProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], FirebaseAdminProvider);
export { FirebaseAdminProvider };
//# sourceMappingURL=firebase-admin.provider.js.map