export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_HUMAN_AUTHORIZATION';

export interface PaymentPolicy {
  transactionLimitCents: number;
  totalSpendLimitCents: number;
  currency: 'SGD';
}

export interface PaymentContext {
  paymentAgentId: string;
  authenticatedPaymentAgentId: string;
  cardBoundPaymentAgentId: string;
  amountCents: number;
  cumulativeSpendCents: number;
  userAuthorized: boolean;
}

export interface PolicyEvaluation {
  decision: PolicyDecision;
  reason: string;
}

export const DEMO_POLICY: PaymentPolicy = {
  transactionLimitCents: 600,
  totalSpendLimitCents: 1200,
  currency: 'SGD',
};

export function evaluatePaymentPolicy(
  policy: PaymentPolicy,
  context: PaymentContext,
): PolicyEvaluation {
  if (context.paymentAgentId !== context.authenticatedPaymentAgentId) {
    return { decision: 'DENY', reason: 'PaymentAgentID authentication mismatch.' };
  }

  if (context.paymentAgentId !== context.cardBoundPaymentAgentId) {
    return { decision: 'DENY', reason: 'Card is not bound to this PaymentAgentID.' };
  }

  if (context.amountCents <= 0) {
    return { decision: 'DENY', reason: 'Payment amount must be positive.' };
  }

  if (context.cumulativeSpendCents + context.amountCents > policy.totalSpendLimitCents) {
    return { decision: 'DENY', reason: 'Total spending limit would be exceeded.' };
  }

  if (context.amountCents > policy.transactionLimitCents && !context.userAuthorized) {
    return {
      decision: 'REQUIRE_HUMAN_AUTHORIZATION',
      reason: 'Transaction exceeds the autonomous transaction limit.',
    };
  }

  return { decision: 'ALLOW', reason: 'Payment satisfies the configured policy.' };
}
