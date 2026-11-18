export declare const ASSIGNMENT_STORAGE: unique symbol;
export declare const MAX_ASSIGNMENT_FILE_BYTES: number;
export declare const MAX_ASSIGNMENT_ATTACHMENTS = 10;
export declare const MAX_SUBMISSION_ATTACHMENTS = 5;
export declare const ALLOWED_ASSIGNMENT_MIME_TYPES: readonly ["application/pdf", "text/plain", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
export interface PrivateUploadGrant {
    uploadId: string;
    uploadUrl: string;
    expiresAt: Date;
}
export interface VerifiedPrivateObject {
    uploadId: string;
    scope: string;
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
}
export interface PrivateDownloadGrant {
    url: string;
    expiresAt: Date;
}
export interface AssignmentStorageProvider {
    createUpload(input: {
        scope: string;
        uploadId: string;
        fileName: string;
        mimeType: string;
        maxBytes: number;
        allowedMimeTypes: readonly string[];
    }): Promise<PrivateUploadGrant>;
    verifyUpload(uploadId: string): Promise<VerifiedPrivateObject>;
    createDownloadUrl(storageKey: string): Promise<PrivateDownloadGrant>;
}
export declare class UnavailableAssignmentStorageProvider implements AssignmentStorageProvider {
    createUpload(): Promise<PrivateUploadGrant>;
    verifyUpload(): Promise<VerifiedPrivateObject>;
    createDownloadUrl(): Promise<PrivateDownloadGrant>;
}
export declare function validateRequestedFile(file: {
    fileName: string;
    mimeType: string;
    fileSize: number;
}): void;
