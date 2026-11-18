import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TestAttempt } from './assessment.entity.js';
import { Course, Enrollment } from './education.entity.js';
import { Payment } from './payments.entity.js';
import { CourseProgress, LessonProgress } from './progress.entity.js';

@Entity('users')
@Check('CHK_users_status', "\"status\" IN ('active', 'suspended', 'deleted')")
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'suspended' | 'deleted';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: Relation<UserRole[]>;

  @OneToMany(() => AuthIdentity, (identity) => identity.user)
  authIdentities!: Relation<AuthIdentity[]>;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: Relation<RefreshToken[]>;

  @OneToMany(() => Course, (course) => course.leadTeacher)
  ledCourses!: Relation<Course[]>;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments!: Relation<Enrollment[]>;

  @OneToMany(() => TestAttempt, (attempt) => attempt.user)
  testAttempts!: Relation<TestAttempt[]>;

  @OneToMany(() => LessonProgress, (progress) => progress.user)
  lessonProgress!: Relation<LessonProgress[]>;

  @OneToMany(() => CourseProgress, (progress) => progress.user)
  courseProgress!: Relation<CourseProgress[]>;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Relation<Payment[]>;
}

@Entity('roles')
@Index('UQ_roles_code', ['code'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  code!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: Relation<UserRole[]>;
}

@Entity('user_roles')
@Unique('UQ_user_roles_user_role', ['user', 'role'])
@Index('IDX_user_roles_role', ['role'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.userRoles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne(() => Role, (role) => role.userRoles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<Role>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('auth_identities')
@Check('CHK_auth_identities_provider', "\"provider\" IN ('telegram', 'phone')")
@Unique('UQ_auth_identities_provider_subject', ['provider', 'providerSubject'])
@Index('IDX_auth_identities_user', ['user'])
export class AuthIdentity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.authIdentities, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @Column({ type: 'varchar', length: 20 })
  provider!: 'telegram' | 'phone';

  @Column({ name: 'provider_subject', type: 'varchar', length: 255 })
  providerSubject!: string;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('refresh_tokens')
@Index('UQ_refresh_tokens_hash', ['tokenHash'], { unique: true })
@Index('IDX_refresh_tokens_user_expiry', ['user', 'expiresAt'])
@Index('IDX_refresh_tokens_replaced_by', ['replacedBy'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @Column({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @ManyToOne(() => RefreshToken, (token) => token.replacements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'replaced_by_id' })
  replacedBy!: Relation<RefreshToken | null>;

  @OneToMany(() => RefreshToken, (token) => token.replacedBy)
  replacements!: Relation<RefreshToken[]>;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('phone_verifications')
@Check('CHK_phone_verifications_attempt_count', '"attempt_count" >= 0')
@Check('CHK_phone_verifications_purpose', "\"purpose\" IN ('login', 'link')")
@Check(
  'CHK_phone_verifications_purpose_user',
  '("purpose" = \'login\' AND "requested_for_user_id" IS NULL) OR ("purpose" = \'link\' AND "requested_for_user_id" IS NOT NULL)',
)
@Index('IDX_phone_verifications_phone_created', ['phoneNumber', 'createdAt'])
export class PhoneVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 10, default: 'login' })
  purpose!: 'login' | 'link';

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_for_user_id' })
  requestedForUser!: Relation<User | null>;

  @Column({ name: 'code_hash', type: 'char', length: 64 })
  codeHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'attempt_count', type: 'smallint', default: 0 })
  attemptCount!: number;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;

  @Column({ name: 'requested_from_ip', type: 'inet', nullable: true })
  requestedFromIp!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('auth_challenges')
@Check('CHK_auth_challenges_provider', '"provider" IN (\'telegram\')')
@Check(
  'CHK_auth_challenges_purpose_user',
  '("purpose" = \'login\' AND "requested_for_user_id" IS NULL) OR ("purpose" = \'link\' AND "requested_for_user_id" IS NOT NULL)',
)
@Index('UQ_auth_challenges_nonce_hash', ['nonceHash'], { unique: true })
@Index('IDX_auth_challenges_expiry', ['expiresAt'])
export class AuthChallenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  provider!: 'telegram';

  @Column({ type: 'varchar', length: 10 })
  purpose!: 'login' | 'link';

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_for_user_id' })
  requestedForUser!: Relation<User | null>;

  @RelationId((challenge: AuthChallenge) => challenge.requestedForUser)
  requestedForUserId!: string | null;

  @Column({ name: 'nonce_hash', type: 'char', length: 64 })
  nonceHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
