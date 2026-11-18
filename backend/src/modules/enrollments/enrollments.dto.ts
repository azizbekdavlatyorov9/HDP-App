import { IsIn, IsUUID } from 'class-validator';

export class ManualEnrollmentDto {
  @IsUUID() userId!: string;
  @IsUUID() courseId!: string;
}

export class EnrollmentStatusDto {
  @IsIn(['active', 'completed', 'revoked'])
  status!: 'active' | 'completed' | 'revoked';
}
