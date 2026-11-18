import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.js';
interface AccessTokenPayload {
    sub?: string;
    tokenUse?: string;
    iss?: string;
    aud?: string | string[];
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly users;
    constructor(config: ConfigService, users: UsersService);
    validate(payload: AccessTokenPayload): Promise<AuthenticatedUser>;
}
export {};
