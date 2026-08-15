export const TRANSACTION_LIMIT_CENTS = 600;
export const TOTAL_SPEND_LIMIT_CENTS = 1200;

export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_HUMAN_AUTHORIZATION';

export interface PolicyInput {
  amountCents: number;
  cumulativeSpendCents: number;
  paymentAgentId: string;
  authenticatedAgentId: string;
  cardBoundAgentId: string;
  humanAuthorization: boolean;
}

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
  remainingSpendCents: number;
}

export function evaluatePaymentPolicy(input: PolicyInput): PolicyResult {
  const remainingSpendCents = Math.max(0, TOTAL_SPEND_LIMIT_CENTS - input.cumulativeSpendCents);

  if (input.paymentAgentId !== input.authenticatedAgentId) {
    return { decision: 'DENY', reason: 'PaymentAgentID authentication mismatch', remainingSpendCents };
  }

  if (input.paymentAgentId !== input.cardBoundAgentId) {
    return { decision: 'DENY', reason: 'Payment card is not bound to this PaymentAgentID', remainingSpendCents };
  }

  if (input.amountCents <= 0) {
    return { decision: 'DENY', reason: 'Payment amount must be positive', remainingSpendCents };
  }

  if (input.cumulativeSpendCents + input.amountCents > TOTAL_SPEND_LIMIT_CENTS) {
    return {
      decision: input.humanAuthorization ? 'ALLOW' : 'REQUIRE_HUMAN_AUTHORIZATION',
      reason: 'Transaction would exceed the S$12 total spend policy',
      remainingSpendCents,
    };
  }

  if (input.amountCents > TRANSACTION_LIMIT_CENTS && !input.humanAuthorization) {
    return {
      decision: 'REQUIRE_HUMAN_AUTHORIZATION',
      reason: 'Transaction exceeds the S$6 autonomous transaction limit',
      remainingSpendCents,
    };
  }

  return { decision: 'ALLOW', reason: 'Transaction is within the configured payment policy', remainingSpendCents };
}
