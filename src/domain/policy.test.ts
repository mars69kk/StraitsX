import { describe, expect, it } from 'vitest';
import { evaluatePaymentPolicy } from './policy';

const base = {
  cumulativeSpendCents: 0,
  paymentAgentId: 'PA-001',
  authenticatedAgentId: 'PA-001',
  cardBoundAgentId: 'PA-001',
  humanAuthorization: false,
};

describe('evaluatePaymentPolicy', () => {
  it('allows a transaction below S$6', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 599 }).decision).toBe('ALLOW');
  });

  it('allows exactly S$6', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 600 }).decision).toBe('ALLOW');
  });

  it('requires human authorization above S$6', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 601 }).decision).toBe('REQUIRE_HUMAN_AUTHORIZATION');
  });

  it('denies an agent/card mismatch', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 100, cardBoundAgentId: 'PA-002' }).decision).toBe('DENY');
  });

  it('requires authorization when cumulative spend would exceed S$12', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 100, cumulativeSpendCents: 1200 }).decision).toBe('REQUIRE_HUMAN_AUTHORIZATION');
  });

  it('allows an above-limit transaction after explicit human authorization', () => {
    expect(evaluatePaymentPolicy({ ...base, amountCents: 800, humanAuthorization: true }).decision).toBe('ALLOW');
  });
});
