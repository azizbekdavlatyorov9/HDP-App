import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { validateRequestedFile, UnavailableAssignmentStorageProvider } from './assignment-storage.provider.js';
import { assignmentCanBePublished, assertResubmissionAllowed, classifySubmission, validateGradeScore } from './assignments.policy.js';
import type { Assignment, AssignmentSubmission } from '../../database/entities/assignments.entity.js';
import { AssignmentsService } from './assignments.service.js';

const assignment=(overrides:Partial<Assignment>={})=>({status:'PUBLISHED',dueAt:null,allowLateSubmission:false,allowResubmission:true,allowResubmissionAfterGraded:false,maxScore:'100.00',...overrides} as Assignment);
const submission=(overrides:Partial<AssignmentSubmission>={})=>({status:'SUBMITTED',...overrides} as AssignmentSubmission);

describe('assignment submission policy',()=>{
  it('accepts a submission at its deadline and rejects one after it unless late work is allowed',()=>{
    const due=new Date('2026-11-10T12:00:00Z');
    expect(classifySubmission(due,false,new Date(due.getTime()))).toEqual({isLate:false,status:'SUBMITTED'});
    expect(()=>classifySubmission(due,false,new Date(due.getTime()+1))).toThrow(BadRequestException);
    expect(classifySubmission(due,true,new Date(due.getTime()+1))).toEqual({isLate:true,status:'LATE'});
  });
  it('enforces the resubmission policy while allowing returned work to be corrected',()=>{
    const a=assignment();const now=new Date();
    expect(()=>assertResubmissionAllowed(a,submission(),now)).not.toThrow();
    expect(()=>assertResubmissionAllowed(assignment({allowResubmission:false}),submission(),now)).toThrow(ConflictException);
    expect(()=>assertResubmissionAllowed(a,submission({status:'GRADED'}),now)).toThrow(ConflictException);
    expect(()=>assertResubmissionAllowed(a,submission({status:'RETURNED'}),now)).not.toThrow();
    expect(()=>assertResubmissionAllowed(assignment({status:'ARCHIVED'}),submission(),now)).toThrow(BadRequestException);
  });
  it('requires published course, active group, and published linked lesson before publishing',()=>{
    expect(()=>assignmentCanBePublished({courseStatus:'published',groupStatus:'ACTIVE',lessonStatus:'published'})).not.toThrow();
    expect(()=>assignmentCanBePublished({courseStatus:'draft',groupStatus:'ACTIVE'})).toThrow(BadRequestException);
    expect(()=>assignmentCanBePublished({courseStatus:'published',groupStatus:'PAUSED'})).toThrow(BadRequestException);
    expect(()=>assignmentCanBePublished({courseStatus:'published',groupStatus:'ACTIVE',lessonStatus:'draft'})).toThrow(BadRequestException);
    expect(()=>assignmentCanBePublished({courseStatus:'published',groupStatus:'ACTIVE',dueAt:new Date('2020-01-01T00:00:00Z'),allowLateSubmission:false,now:new Date('2026-01-01T00:00:00Z')})).toThrow(BadRequestException);
    expect(()=>assignmentCanBePublished({courseStatus:'published',groupStatus:'ACTIVE',dueAt:new Date('2020-01-01T00:00:00Z'),allowLateSubmission:true,now:new Date('2026-01-01T00:00:00Z')})).not.toThrow();
  });
  it('keeps a grade within the assignment maximum',()=>{
    expect(()=>validateGradeScore(0,'100.00')).not.toThrow();
    expect(()=>validateGradeScore(100,'100.00')).not.toThrow();
    expect(()=>validateGradeScore(-1,'100.00')).toThrow(BadRequestException);
    expect(()=>validateGradeScore(100.01,'100.00')).toThrow(BadRequestException);
    expect(()=>validateGradeScore(Number.NaN,'100.00')).toThrow(BadRequestException);
  });
});

describe('private assignment storage boundary',()=>{
  it('rejects unsafe names, unsupported MIME types, and overlarge objects',()=>{
    expect(()=>validateRequestedFile({fileName:'../secret.pdf',mimeType:'application/pdf',fileSize:20})).toThrow(BadRequestException);
    expect(()=>validateRequestedFile({fileName:'answer.exe',mimeType:'application/x-msdownload',fileSize:20})).toThrow(BadRequestException);
    expect(()=>validateRequestedFile({fileName:'answer.pdf',mimeType:'application/pdf',fileSize:60*1024*1024})).toThrow(BadRequestException);
    expect(()=>validateRequestedFile({fileName:'answer.pdf',mimeType:'application/pdf',fileSize:20})).not.toThrow();
  });
  it('fails upload and download operations safely when no provider is configured',async()=>{
    const provider=new UnavailableAssignmentStorageProvider();
    await expect(provider.createUpload({} as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(provider.verifyUpload('opaque-id')).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(provider.createDownloadUrl('private/key')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('assignment authorization boundaries',()=>{
  const build=(assignments:any,submissions:any)=>new AssignmentsService(assignments as never,{} as never,submissions as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never,{} as never);
  it('derives student submission ownership from the authenticated identity',async()=>{
    const submissions={findOne:vi.fn().mockResolvedValue(null)};const service=build({},submissions);
    await expect(service.studentSubmission('submission-id',{id:'student-a',roles:['STUDENT']} as never)).rejects.toBeInstanceOf(NotFoundException);
    expect(submissions.findOne).toHaveBeenCalledWith(expect.objectContaining({where:{id:'submission-id',student:{id:'student-a'}}}));
  });
  it('rejects students attempting to create teacher assignments before repository writes',async()=>{
    const assignments={save:vi.fn(),create:vi.fn()};const service=build(assignments,{});
    await expect(service.create({} as never,{id:'student-a',roles:['STUDENT']} as never)).rejects.toBeInstanceOf(ForbiddenException);
    expect(assignments.save).not.toHaveBeenCalled();
  });
});
