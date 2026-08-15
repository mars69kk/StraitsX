export type AuditEventType =
  | 'PURCHASE_REQUESTED'
  | 'PRODUCT_FOUND'
  | 'PURCHASE_PROPOSED'
  | 'POLICY_EVALUATED'
  | 'HUMAN_AUTHORIZATION_REQUIRED'
  | 'HUMAN_APPROVED'
  | 'HUMAN_REJECTED'
  | 'CARD_ISSUED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED';

export interface AuditEvent {
  eventId: string;
  transactionId: string;
  type: AuditEventType;
  timestamp: string;
  metadata: Record<string, string | number | boolean | null>;
}

export function createAuditEvent(
  transactionId: string,
  type: AuditEventType,
  metadata: AuditEvent['metadata'] = {},
): AuditEvent {
  return {
    eventId: crypto.randomUUID(),
    transactionId,
    type,
    timestamp: new Date().toISOString(),
    metadata,
  };
}
