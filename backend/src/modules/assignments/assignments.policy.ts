import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Assignment, AssignmentSubmission } from '../../database/entities/assignments.entity.js';

export function classifySubmission(dueAt:Date|null,allowLate:boolean,submittedAt:Date) {
  const isLate=Boolean(dueAt&&submittedAt.getTime()>dueAt.getTime());
  if(isLate&&!allowLate)throw new BadRequestException('The assignment deadline has passed');
  return {isLate,status:isLate?'LATE' as const:'SUBMITTED' as const};
}

export function assertResubmissionAllowed(assignment:Assignment,submission:AssignmentSubmission,now:Date) {
  if(assignment.status!=='PUBLISHED')throw new BadRequestException('Only published assignments accept submissions');
  classifySubmission(assignment.dueAt,assignment.allowLateSubmission,now);
  if(submission.status==='GRADED'&&!assignment.allowResubmissionAfterGraded)throw new ConflictException('The assignment does not allow resubmission after grading');
  if(submission.status!=='GRADED'&&submission.status!=='RETURNED'&&!assignment.allowResubmission)throw new ConflictException('The assignment does not allow resubmissions');
}

export function assignmentCanBePublished(input:{courseStatus:string;groupStatus:string;lessonStatus?:string|null;dueAt?:Date|null;allowLateSubmission?:boolean;now?:Date}) {
  if(input.courseStatus!=='published')throw new BadRequestException('The course must be published before this assignment');
  if(input.groupStatus!=='ACTIVE')throw new BadRequestException('The group must be active before this assignment');
  if(input.lessonStatus!==undefined&&input.lessonStatus!=='published')throw new BadRequestException('The linked lesson must be published before this assignment');
  if(input.dueAt&&input.dueAt.getTime()<(input.now??new Date()).getTime()&&!input.allowLateSubmission)throw new BadRequestException('A past-deadline assignment must allow late submissions before it can be published');
}

export function validateGradeScore(score:number,maxScore:string|number) {
  if(!Number.isFinite(score)||score<0||score>Number(maxScore))throw new BadRequestException('Score must be between zero and the assignment maximum');
}
