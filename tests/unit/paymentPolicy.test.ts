import { describe, expect, it } from 'vitest';
import { DEMO_POLICY, evaluatePaymentPolicy } from '../../src/domain/paymentPolicy';

const baseContext = {
  paymentAgentId: 'agent-1',
  authenticatedPaymentAgentId: 'agent-1',
  cardBoundPaymentAgentId: 'agent-1',
  amountCents: 500,
  cumulativeSpendCents: 0,
  userAuthorized: false,
};

describe('evaluatePaymentPolicy', () => {
  it('allows an amount below S$6', () => {
    expect(evaluatePaymentPolicy(DEMO_POLICY, baseContext).decision).toBe('ALLOW');
  });

  it('allows exactly S$6', () => {
    expect(
      evaluatePaymentPolicy(DEMO_POLICY, { ...baseContext, amountCents: 600 }).decision,
    ).toBe('ALLOW');
  });

  it('requires human authorization above S$6', () => {
    expect(
      evaluatePaymentPolicy(DEMO_POLICY, { ...baseContext, amountCents: 601 }).decision,
    ).toBe('REQUIRE_HUMAN_AUTHORIZATION');
  });

  it('allows a human-authorized amount above S$6 within the S$12 ceiling', () => {
    expect(
      evaluatePaymentPolicy(DEMO_POLICY, {
        ...baseContext,
        amountCents: 800,
        userAuthorized: true,
      }).decision,
    ).toBe('ALLOW');
  });

  it('denies a transaction that would exceed the S$12 total ceiling', () => {
    expect(
      evaluatePaymentPolicy(DEMO_POLICY, {
        ...baseContext,
        amountCents: 601,
        cumulativeSpendCents: 600,
        userAuthorized: true,
      }).decision,
    ).toBe('DENY');
  });

  it('denies an agent/card mismatch', () => {
    expect(
      evaluatePaymentPolicy(DEMO_POLICY, {
        ...baseContext,
        cardBoundPaymentAgentId: 'agent-2',
      }).decision,
    ).toBe('DENY');
  });
});
