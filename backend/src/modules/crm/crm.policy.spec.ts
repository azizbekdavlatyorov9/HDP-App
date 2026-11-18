import { BadRequestException } from '@nestjs/common';
import { canTransitionLead, normalizeCrmPhone } from './crm.policy.js';

describe('CRM policy', () => {
  it('allows normal lead progression and prohibits terminal-state changes', () => {
    expect(canTransitionLead('NEW','CONTACTED')).toBe(true);
    expect(canTransitionLead('TRIAL_SCHEDULED','TRIAL_COMPLETED')).toBe(true);
    expect(canTransitionLead('WON','CONTACTED')).toBe(false);
    expect(canTransitionLead('LOST','WON')).toBe(false);
  });

  it('normalizes valid international phone numbers to E.164', () => {
    expect(normalizeCrmPhone('+1 202-555-0123')).toBe('+12025550123');
  });

  it('rejects invalid phone numbers', () => {
    expect(() => normalizeCrmPhone('not-a-phone')).toThrow(BadRequestException);
  });
});
