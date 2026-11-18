import type { CrmLeadStatus } from '../../database/entities/crm.entity.js';
export declare const LEAD_TRANSITIONS: Readonly<Record<CrmLeadStatus, readonly CrmLeadStatus[]>>;
export declare function normalizeCrmPhone(input: string): string;
export declare function canTransitionLead(from: CrmLeadStatus, to: CrmLeadStatus): boolean;
