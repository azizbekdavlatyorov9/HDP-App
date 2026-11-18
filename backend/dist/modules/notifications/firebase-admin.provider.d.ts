import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FcmMessage, FcmProvider, FcmSendResult } from './fcm-provider.js';
export declare class FirebaseAdminProvider implements FcmProvider, OnModuleInit {
    private readonly config;
    private messaging;
    private configured;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    available(): boolean;
    send(tokens: string[], notification: FcmMessage): Promise<FcmSendResult>;
}
