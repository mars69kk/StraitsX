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

/** Deterministic server-side payment policy. The LLM never controls this function. */
export function evaluatePaymentPolicy(input: PolicyInput): PolicyResult {
  const remainingSpendCents = Math.max(0, TOTAL_SPEND_LIMIT_CENTS - input.cumulativeSpendCents);

  if (input.paymentAgentId !== input.authenticatedAgentId) {
    return { decision: 'DENY', reason: 'PaymentAgentID authentication mismatch', remainingSpendCents };
  }

  if (input.paymentAgentId !== input.cardBoundAgentId) {
    return { decision: 'DENY', reason: 'Payment card is not bound to this PaymentAgentID', remainingSpendCents };
  }

  if (input.amountCents <= 0 || !Number.isSafeInteger(input.amountCents)) {
    return { decision: 'DENY', reason: 'Payment amount must be a positive integer number of cents', remainingSpendCents };
  }

  if (input.cumulativeSpendCents < 0 || !Number.isSafeInteger(input.cumulativeSpendCents)) {
    return { decision: 'DENY', reason: 'Cumulative spend is invalid', remainingSpendCents };
  }

  // S$12 is a hard demo ceiling. Human authorization can override the S$6
  // autonomous threshold, but cannot silently increase the total policy.
  if (input.cumulativeSpendCents + input.amountCents > TOTAL_SPEND_LIMIT_CENTS) {
    return { decision: 'DENY', reason: 'Transaction exceeds the S$12 total spend limit', remainingSpendCents };
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
