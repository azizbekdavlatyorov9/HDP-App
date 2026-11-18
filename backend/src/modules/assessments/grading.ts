import { BadRequestException,ForbiddenException } from '@nestjs/common';
export function validateAndScoreQuestion(selectedIds:string[],validOptionIds:string[],correctOptionIds:string[],allowMultiple:boolean):boolean {
 if(new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>!validOptionIds.includes(id)))throw new BadRequestException('Answer option does not belong to its question');
 if(!allowMultiple&&selectedIds.length>1)throw new BadRequestException('Question accepts one answer');
 return selectedIds.length===correctOptionIds.length&&correctOptionIds.every(id=>selectedIds.includes(id));
}
export function enforceAttemptLimit(limit:number|null,used:number){if(limit!==null&&used>=limit)throw new ForbiddenException('Attempt limit reached');}
