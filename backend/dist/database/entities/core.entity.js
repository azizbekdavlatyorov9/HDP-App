var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId, Unique, UpdateDateColumn, } from 'typeorm';
import { TestAttempt } from './assessment.entity.js';
import { Course, Enrollment } from './education.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';
let User = class User {
    id;
    displayName;
    status;
    createdAt;
    updatedAt;
    deletedAt;
    userRoles;
    authIdentities;
    refreshTokens;
    ledCourses;
    enrollments;
    testAttempts;
    lessonProgress;
    courseProgress;
    payments;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ name: 'display_name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    Column({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "deletedAt", void 0);
__decorate([
    OneToMany(() => UserRole, (userRole) => userRole.user),
    __metadata("design:type", Object)
], User.prototype, "userRoles", void 0);
__decorate([
    OneToMany(() => AuthIdentity, (identity) => identity.user),
    __metadata("design:type", Object)
], User.prototype, "authIdentities", void 0);
__decorate([
    OneToMany(() => RefreshToken, (token) => token.user),
    __metadata("design:type", Object)
], User.prototype, "refreshTokens", void 0);
__decorate([
    OneToMany(() => Course, (course) => course.leadTeacher),
    __metadata("design:type", Object)
], User.prototype, "ledCourses", void 0);
__decorate([
    OneToMany(() => Enrollment, (enrollment) => enrollment.user),
    __metadata("design:type", Object)
], User.prototype, "enrollments", void 0);
__decorate([
    OneToMany(() => TestAttempt, (attempt) => attempt.user),
    __metadata("design:type", Object)
], User.prototype, "testAttempts", void 0);
__decorate([
    OneToMany(() => LessonProgress, (progress) => progress.user),
    __metadata("design:type", Object)
], User.prototype, "lessonProgress", void 0);
__decorate([
    OneToMany(() => CourseProgress, (progress) => progress.user),
    __metadata("design:type", Object)
], User.prototype, "courseProgress", void 0);
__decorate([
    OneToMany(() => Payment, (payment) => payment.user),
    __metadata("design:type", Object)
], User.prototype, "payments", void 0);
User = __decorate([
    Entity('users'),
    Check('CHK_users_status', "\"status\" IN ('active', 'suspended', 'deleted')")
], User);
export { User };
let Role = class Role {
    id;
    code;
    description;
    createdAt;
    userRoles;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], Role.prototype, "code", void 0);
__decorate([
    Column({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], Role.prototype, "description", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Role.prototype, "createdAt", void 0);
__decorate([
    OneToMany(() => UserRole, (userRole) => userRole.role),
    __metadata("design:type", Object)
], Role.prototype, "userRoles", void 0);
Role = __decorate([
    Entity('roles'),
    Index('UQ_roles_code', ['code'], { unique: true })
], Role);
export { Role };
let UserRole = class UserRole {
    id;
    user;
    role;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], UserRole.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.userRoles, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], UserRole.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Role, (role) => role.userRoles, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'role_id' }),
    __metadata("design:type", Object)
], UserRole.prototype, "role", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserRole.prototype, "createdAt", void 0);
UserRole = __decorate([
    Entity('user_roles'),
    Unique('UQ_user_roles_user_role', ['user', 'role']),
    Index('IDX_user_roles_role', ['role'])
], UserRole);
export { UserRole };
let AuthIdentity = class AuthIdentity {
    id;
    user;
    provider;
    providerSubject;
    verifiedAt;
    metadata;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuthIdentity.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.authIdentities, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], AuthIdentity.prototype, "user", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AuthIdentity.prototype, "provider", void 0);
__decorate([
    Column({ name: 'provider_subject', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AuthIdentity.prototype, "providerSubject", void 0);
__decorate([
    Column({ name: 'verified_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], AuthIdentity.prototype, "verifiedAt", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuthIdentity.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuthIdentity.prototype, "createdAt", void 0);
AuthIdentity = __decorate([
    Entity('auth_identities'),
    Check('CHK_auth_identities_provider', "\"provider\" IN ('telegram', 'phone')"),
    Unique('UQ_auth_identities_provider_subject', ['provider', 'providerSubject']),
    Index('IDX_auth_identities_user', ['user'])
], AuthIdentity);
export { AuthIdentity };
let RefreshToken = class RefreshToken {
    id;
    user;
    tokenHash;
    expiresAt;
    revokedAt;
    replacedBy;
    replacements;
    userAgent;
    ipAddress;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.refreshTokens, { nullable: false, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "user", void 0);
__decorate([
    Column({ name: 'token_hash', type: 'char', length: 64 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tokenHash", void 0);
__decorate([
    Column({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    Column({ name: 'revoked_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "revokedAt", void 0);
__decorate([
    ManyToOne(() => RefreshToken, (token) => token.replacements, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    JoinColumn({ name: 'replaced_by_id' }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "replacedBy", void 0);
__decorate([
    OneToMany(() => RefreshToken, (token) => token.replacedBy),
    __metadata("design:type", Object)
], RefreshToken.prototype, "replacements", void 0);
__decorate([
    Column({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "userAgent", void 0);
__decorate([
    Column({ name: 'ip_address', type: 'inet', nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "ipAddress", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "createdAt", void 0);
RefreshToken = __decorate([
    Entity('refresh_tokens'),
    Index('UQ_refresh_tokens_hash', ['tokenHash'], { unique: true }),
    Index('IDX_refresh_tokens_user_expiry', ['user', 'expiresAt']),
    Index('IDX_refresh_tokens_replaced_by', ['replacedBy'])
], RefreshToken);
export { RefreshToken };
let PhoneVerification = class PhoneVerification {
    id;
    phoneNumber;
    purpose;
    requestedForUser;
    codeHash;
    expiresAt;
    attemptCount;
    consumedAt;
    requestedFromIp;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], PhoneVerification.prototype, "id", void 0);
__decorate([
    Column({ name: 'phone_number', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PhoneVerification.prototype, "phoneNumber", void 0);
__decorate([
    Column({ type: 'varchar', length: 10, default: 'login' }),
    __metadata("design:type", String)
], PhoneVerification.prototype, "purpose", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'requested_for_user_id' }),
    __metadata("design:type", Object)
], PhoneVerification.prototype, "requestedForUser", void 0);
__decorate([
    Column({ name: 'code_hash', type: 'char', length: 64 }),
    __metadata("design:type", String)
], PhoneVerification.prototype, "codeHash", void 0);
__decorate([
    Column({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PhoneVerification.prototype, "expiresAt", void 0);
__decorate([
    Column({ name: 'attempt_count', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], PhoneVerification.prototype, "attemptCount", void 0);
__decorate([
    Column({ name: 'consumed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PhoneVerification.prototype, "consumedAt", void 0);
__decorate([
    Column({ name: 'requested_from_ip', type: 'inet', nullable: true }),
    __metadata("design:type", Object)
], PhoneVerification.prototype, "requestedFromIp", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PhoneVerification.prototype, "createdAt", void 0);
PhoneVerification = __decorate([
    Entity('phone_verifications'),
    Check('CHK_phone_verifications_attempt_count', '"attempt_count" >= 0'),
    Check('CHK_phone_verifications_purpose', "\"purpose\" IN ('login', 'link')"),
    Check('CHK_phone_verifications_purpose_user', '("purpose" = \'login\' AND "requested_for_user_id" IS NULL) OR ("purpose" = \'link\' AND "requested_for_user_id" IS NOT NULL)'),
    Index('IDX_phone_verifications_phone_created', ['phoneNumber', 'createdAt'])
], PhoneVerification);
export { PhoneVerification };
let AuthChallenge = class AuthChallenge {
    id;
    provider;
    purpose;
    requestedForUser;
    requestedForUserId;
    nonceHash;
    expiresAt;
    consumedAt;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuthChallenge.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "provider", void 0);
__decorate([
    Column({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "purpose", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' }),
    JoinColumn({ name: 'requested_for_user_id' }),
    __metadata("design:type", Object)
], AuthChallenge.prototype, "requestedForUser", void 0);
__decorate([
    RelationId((challenge) => challenge.requestedForUser),
    __metadata("design:type", Object)
], AuthChallenge.prototype, "requestedForUserId", void 0);
__decorate([
    Column({ name: 'nonce_hash', type: 'char', length: 64 }),
    __metadata("design:type", String)
], AuthChallenge.prototype, "nonceHash", void 0);
__decorate([
    Column({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuthChallenge.prototype, "expiresAt", void 0);
__decorate([
    Column({ name: 'consumed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], AuthChallenge.prototype, "consumedAt", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuthChallenge.prototype, "createdAt", void 0);
AuthChallenge = __decorate([
    Entity('auth_challenges'),
    Check('CHK_auth_challenges_provider', '"provider" IN (\'telegram\')'),
    Check('CHK_auth_challenges_purpose_user', '("purpose" = \'login\' AND "requested_for_user_id" IS NULL) OR ("purpose" = \'link\' AND "requested_for_user_id" IS NOT NULL)'),
    Index('UQ_auth_challenges_nonce_hash', ['nonceHash'], { unique: true }),
    Index('IDX_auth_challenges_expiry', ['expiresAt'])
], AuthChallenge);
export { AuthChallenge };
//# sourceMappingURL=core.entity.js.map