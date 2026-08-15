export interface PaymentRequest {
  transactionId: string;
  paymentAgentId: string;
  amountCents: number;
  currency: 'SGD';
  merchant: string;
  idempotencyKey: string;
}

export interface PaymentResult {
  status: 'AUTHORIZED' | 'DECLINED' | 'UNKNOWN';
  providerReference?: string;
  reason?: string;
}

export interface PaymentProvider {
  authorizePayment(request: PaymentRequest): Promise<PaymentResult>;
}

/**
 * Deterministic local provider used by automated tests and development.
 * It deliberately contains no card credentials.
 */
export class MockPaymentProvider implements PaymentProvider {
  async authorizePayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.idempotencyKey) {
      return { status: 'DECLINED', reason: 'Missing idempotency key.' };
    }

    return {
      status: 'AUTHORIZED',
      providerReference: `mock-${request.transactionId}`,
    };
  }
}

/**
 * Boundary for the StraitsX Card Issuance MCP Sandbox.
 * Actual MCP tool names/schema must be discovered from the live sandbox
 * before this adapter is wired to real card operations.
 */
export class StraitsXPaymentProvider implements PaymentProvider {
  constructor(private readonly sandboxEndpoint: string) {}

  async authorizePayment(_request: PaymentRequest): Promise<PaymentResult> {
    if (!this.sandboxEndpoint.startsWith('https://card.straitsx.ai/sandbox/')) {
      return { status: 'DECLINED', reason: 'Only the StraitsX sandbox is permitted for MVP.' };
    }

    return {
      status: 'UNKNOWN',
      reason: 'StraitsX MCP tool contract has not yet been bound to the adapter.',
    };
  }
}
