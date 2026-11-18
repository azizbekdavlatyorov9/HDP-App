import type { Response } from 'express';
import { TelegramOidcProbeService } from './telegram-oidc-probe.service.js';
export declare class TelegramOidcProbeController {
    private readonly probe;
    constructor(probe: TelegramOidcProbeService);
    start(): Promise<{
        authorizationUrl: string;
        probeId: string;
    }>;
    result(probeId: string | undefined): {
        result: "PASS" | "FAIL";
    };
    callback(code: string | undefined, state: string | undefined, response: Response): Promise<void>;
}
