var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
export const ASSIGNMENT_STORAGE = Symbol('ASSIGNMENT_STORAGE');
export const MAX_ASSIGNMENT_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_ASSIGNMENT_ATTACHMENTS = 10;
export const MAX_SUBMISSION_ATTACHMENTS = 5;
export const ALLOWED_ASSIGNMENT_MIME_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
let UnavailableAssignmentStorageProvider = class UnavailableAssignmentStorageProvider {
    async createUpload() { throw new ServiceUnavailableException('Private file storage is not configured; attachment uploads are unavailable'); }
    async verifyUpload() { throw new ServiceUnavailableException('Private file storage is not configured; attachment uploads are unavailable'); }
    async createDownloadUrl() { throw new ServiceUnavailableException('Private file storage is not configured; attachment downloads are unavailable'); }
};
UnavailableAssignmentStorageProvider = __decorate([
    Injectable()
], UnavailableAssignmentStorageProvider);
export { UnavailableAssignmentStorageProvider };
export function validateRequestedFile(file) {
    const safeName = file.fileName.trim();
    if (!safeName || safeName.length > 255 || /[\\/\0]/.test(safeName) || safeName === '.' || safeName === '..')
        throw new BadRequestException('Invalid attachment file name');
    if (!ALLOWED_ASSIGNMENT_MIME_TYPES.includes(file.mimeType))
        throw new BadRequestException('Unsupported attachment MIME type');
    if (!Number.isInteger(file.fileSize) || file.fileSize < 1 || file.fileSize > MAX_ASSIGNMENT_FILE_BYTES)
        throw new BadRequestException('Attachment file size exceeds the allowed limit');
}
//# sourceMappingURL=assignment-storage.provider.js.map