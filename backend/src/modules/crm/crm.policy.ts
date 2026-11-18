import { BadRequestException } from '@nestjs/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CrmLeadStatus } from '../../database/entities/crm.entity.js';

export const LEAD_TRANSITIONS: Readonly<Record<CrmLeadStatus, readonly CrmLeadStatus[]>> = {
  NEW:['CONTACTED','INTERESTED','TRIAL_SCHEDULED','NEGOTIATION','LOST'],
  CONTACTED:['INTERESTED','TRIAL_SCHEDULED','NEGOTIATION','LOST'],
  INTERESTED:['CONTACTED','TRIAL_SCHEDULED','NEGOTIATION','LOST'],
  TRIAL_SCHEDULED:['TRIAL_COMPLETED','CONTACTED','INTERESTED','NEGOTIATION','LOST'],
  TRIAL_COMPLETED:['NEGOTIATION','CONTACTED','LOST'],
  NEGOTIATION:['TRIAL_SCHEDULED','TRIAL_COMPLETED','LOST'],
  WON:[],LOST:[],
};

export function normalizeCrmPhone(input:string):string {
  const parsed=parsePhoneNumberFromString(input);
  if(!parsed?.isValid())throw new BadRequestException('Phone number must be a valid international number');
  return parsed.number;
}

export function canTransitionLead(from:CrmLeadStatus,to:CrmLeadStatus):boolean {
  return LEAD_TRANSITIONS[from].includes(to);
}
