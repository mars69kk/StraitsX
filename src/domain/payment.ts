export type PaymentStatus = 'READY' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';

export interface PaymentRequest {
  transactionId: string;
  idempotencyKey: string;
  paymentAgentId: string;
  merchant: string;
  amountCents: number;
  currency: 'SGD';
}

export interface PaymentResult {
  status: PaymentStatus;
  providerReference?: string;
  message: string;
}

export interface PaymentProvider {
  issueDisposableCard(paymentAgentId: string): Promise<{ cardReference: string }>;
  executePayment(request: PaymentRequest, cardReference: string): Promise<PaymentResult>;
}

/** Deterministic local provider used by tests and offline demo development. */
export class MockPaymentProvider implements PaymentProvider {
  private readonly processedKeys = new Set<string>();

  async issueDisposableCard(paymentAgentId: string): Promise<{ cardReference: string }> {
    if (!paymentAgentId) throw new Error('PaymentAgentID is required');
    return { cardReference: `mock-card-${paymentAgentId}` };
  }

  async executePayment(request: PaymentRequest, cardReference: string): Promise<PaymentResult> {
    if (!cardReference.includes(request.paymentAgentId)) {
      return { status: 'FAILED', message: 'Card is not bound to PaymentAgentID' };
    }

    if (this.processedKeys.has(request.idempotencyKey)) {
      return { status: 'SUCCEEDED', providerReference: `mock-${request.transactionId}`, message: 'Idempotent replay: existing payment returned' };
    }

    this.processedKeys.add(request.idempotencyKey);
    return { status: 'SUCCEEDED', providerReference: `mock-${request.transactionId}`, message: 'Mock payment completed' };
  }
}

/**
 * StraitsX MCP adapter boundary.
 *
 * Deliberately does not invent MCP tool names or card/payment schemas. The
 * live sandbox manifest must be inspected before implementing the transport.
 */
export interface StraitsXMcpTransport {
  callTool(name: string, arguments_: Record<string, unknown>): Promise<unknown>;
}

export class StraitsXPaymentProvider implements PaymentProvider {
  constructor(private readonly transport: StraitsXMcpTransport) {}

  async issueDisposableCard(paymentAgentId: string): Promise<{ cardReference: string }> {
    if (!paymentAgentId) throw new Error('PaymentAgentID is required');
    throw new Error('StraitsX MCP card tool mapping is pending sandbox manifest verification');
  }

  async executePayment(_request: PaymentRequest, _cardReference: string): Promise<PaymentResult> {
    throw new Error('StraitsX MCP payment tool mapping is pending sandbox manifest verification');
  }
}
