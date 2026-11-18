export interface FcmMessage {
    title: string;
    body: string;
    data: Record<string, string>;
}
export interface FcmSendResult {
    successTokens: string[];
    invalidTokens: string[];
}
export interface FcmProvider {
    available(): boolean;
    send(tokens: string[], message: FcmMessage): Promise<FcmSendResult>;
}
export declare const FCM_PROVIDER: unique symbol;
