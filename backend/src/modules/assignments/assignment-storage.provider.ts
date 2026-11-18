import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

export const ASSIGNMENT_STORAGE=Symbol('ASSIGNMENT_STORAGE');
export const MAX_ASSIGNMENT_FILE_BYTES=50*1024*1024;
export const MAX_ASSIGNMENT_ATTACHMENTS=10;
export const MAX_SUBMISSION_ATTACHMENTS=5;
export const ALLOWED_ASSIGNMENT_MIME_TYPES=['application/pdf','text/plain','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] as const;

export interface PrivateUploadGrant { uploadId:string; uploadUrl:string; expiresAt:Date; }
export interface VerifiedPrivateObject { uploadId:string; scope:string; storageKey:string; fileName:string; mimeType:string; fileSize:number; }
export interface PrivateDownloadGrant { url:string; expiresAt:Date; }
export interface AssignmentStorageProvider {
  createUpload(input:{scope:string;uploadId:string;fileName:string;mimeType:string;maxBytes:number;allowedMimeTypes:readonly string[]}):Promise<PrivateUploadGrant>;
  verifyUpload(uploadId:string):Promise<VerifiedPrivateObject>;
  createDownloadUrl(storageKey:string):Promise<PrivateDownloadGrant>;
}

@Injectable()
export class UnavailableAssignmentStorageProvider implements AssignmentStorageProvider {
  async createUpload():Promise<PrivateUploadGrant>{throw new ServiceUnavailableException('Private file storage is not configured; attachment uploads are unavailable');}
  async verifyUpload():Promise<VerifiedPrivateObject>{throw new ServiceUnavailableException('Private file storage is not configured; attachment uploads are unavailable');}
  async createDownloadUrl():Promise<PrivateDownloadGrant>{throw new ServiceUnavailableException('Private file storage is not configured; attachment downloads are unavailable');}
}

export function validateRequestedFile(file:{fileName:string;mimeType:string;fileSize:number}) {
  const safeName=file.fileName.trim();
  if(!safeName||safeName.length>255||/[\\/\0]/.test(safeName)||safeName==='.'||safeName==='..')throw new BadRequestException('Invalid attachment file name');
  if(!(ALLOWED_ASSIGNMENT_MIME_TYPES as readonly string[]).includes(file.mimeType))throw new BadRequestException('Unsupported attachment MIME type');
  if(!Number.isInteger(file.fileSize)||file.fileSize<1||file.fileSize>MAX_ASSIGNMENT_FILE_BYTES)throw new BadRequestException('Attachment file size exceeds the allowed limit');
}
