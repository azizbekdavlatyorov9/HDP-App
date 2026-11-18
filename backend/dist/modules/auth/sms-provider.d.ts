export declare abstract class SmsProvider {
    abstract sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
}
export declare class UnconfiguredSmsProvider extends SmsProvider {
    sendVerificationCode(_phoneNumber: string, _code: string): Promise<void>;
}
