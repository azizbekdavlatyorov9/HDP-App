export interface AuthenticatedUser {
  id: string;
  displayName: string;
  roles: string[];
}

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}
