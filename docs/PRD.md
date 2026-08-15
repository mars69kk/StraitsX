# Mission Control — Agentic Payment Control Plane

## Product Requirements Document (PRD) v1.0 — LOCKED

**Project:** StraitsX Agentic Playground Hackathon  
**Status:** Locked for MVP implementation  
**Team:** 1 person  
**Canonical demo:** “Buy Koh Kae Thai peanut snack from Shopee.”  
**Autonomous transaction limit:** S$6.00  
**Total demo spend limit:** S$12.00  
**Primary payment integration:** StraitsX Card Issuance MCP Sandbox  
**MCP endpoint:** `https://card.straitsx.ai/sandbox/sse`

## 1. Product Vision

Mission Control is an agentic payment control plane that lets an AI shopping agent discover and prepare a purchase while deterministic server-side controls govern payment authority.

> **The agent can act autonomously, but the payment is governed by deterministic user-controlled policies.**

The MVP demonstrates:

**Intent → Discovery → Policy → Human Control → StraitsX Payment → Confirmation**

## 2. Goals

- Natural-language purchase request.
- Product discovery on the designated test merchant.
- Purchase proposal before payment.
- Authenticated `PaymentAgentID`.
- Card-to-agent binding enforcement.
- Deterministic S$6 per-transaction policy.
- Deterministic S$12 cumulative spend policy.
- Explicit human authorization for policy exceptions.
- StraitsX sandbox card/payment integration where supported.
- Payment confirmation and audit trail.
- Secret and PII/PDI protection.
- Playwright critical-path testing.
- GitHub Actions CI.
- `docs/Architecture.drawio`.

## 3. Non-goals

No universal shopping agent, production payment platform, custom blockchain/network/card network, mobile app, fine-tuned model, complex multi-agent orchestration, full KYC/AML stack, or unrestricted autonomous spending.

## 4. Canonical Demo

User instruction:

> Buy Koh Kae Thai peanut snack from Shopee.

The product price must be discovered dynamically. Do not hard-code a purchase price.

| Policy | Value |
|---|---:|
| Per-transaction autonomous limit | S$6.00 |
| Total demo spend limit | S$12.00 |

## 5. Core Flow

```text
User Request
  ↓
Mission Control
  ↓
AI Shopping Agent
  ↓
Search / Discovery
  ↓
Product Result
  ↓
Purchase Proposal
  ↓
Agent Payment Firewall
  ↓
Deterministic Policy Evaluation
  ├── ALLOW → StraitsX MCP → Merchant Checkout
  └── REQUIRE_HUMAN_AUTHORIZATION → User Decision → Payment if approved
  ↓
Payment Confirmation
  ↓
Audit Trail
```

## 6. Security Requirements

The agent must never receive raw PAN, CVV, expiry, private keys, seed phrases, AWS credentials, StraitsX secrets, or other payment secrets.

Security decisions are server-side. Frontend checks are UX only.

The payment policy engine returns:

```text
ALLOW
DENY
REQUIRE_HUMAN_AUTHORIZATION
```

The LLM cannot:

- change its own PaymentAgentID;
- change spending limits;
- approve its own payment;
- bypass the policy engine;
- directly call privileged payment APIs from the browser.

If identity, policy, card binding, authorization, or payment state cannot be verified: **fail closed / do not pay**.

Merchant/product content is untrusted input and must not be allowed to override system instructions or payment policy.

## 7. PaymentAgentID and Card Binding

Each payment-capable agent has an immutable PaymentAgentID associated server-side with its user, card reference, and payment policy.

Before payment:

```text
authenticated_agent == card.bound_agent
```

must be true. The application enforces this regardless of whether the StraitsX MCP exposes an equivalent native binding capability.

## 8. Spending Policy

- Amount ≤ S$6.00: eligible for autonomous payment, subject to all other controls.
- Amount > S$6.00: require explicit human authorization or deny according to final implementation policy.
- Exactly S$6.00 must be tested.
- Cumulative autonomous spend must not exceed S$12.00.
- Limits cannot be silently changed by the agent.

## 9. StraitsX Integration

Use the StraitsX Card Issuance MCP Sandbox only for the MVP. Production MCP is out of scope.

The integration must be isolated behind a typed provider/adapter boundary. Actual MCP tool names and schemas must come from the live sandbox manifest/docs; do not invent tool names.

A mock payment provider is required for deterministic automated tests.

## 10. AWS

Target infrastructure:

- API Gateway
- Amazon Cognito
- Lambda or equivalent service runtime
- Amazon Bedrock / Bedrock Guardrails
- AWS Secrets Manager
- AWS KMS
- DynamoDB
- CloudWatch

Optional services may be added only when they materially improve the MVP.

## 11. Testing

Playwright is mandatory for critical UI/UX acceptance testing.

Minimum E2E scenarios:

1. Purchase request.
2. Product discovery/proposal.
3. Amount below S$6 → ALLOW.
4. Exactly S$6 → ALLOW.
5. Amount above S$6 → HUMAN AUTHORIZATION.
6. Cumulative spend above S$12 → not autonomous.
7. Human rejection → no payment.
8. Human approval → payment proceeds.
9. Agent/card mismatch → DENY.
10. Sensitive payment data is not exposed.
11. Payment confirmation and audit trail.

## 12. Coding Standards

- TypeScript strict mode.
- ESLint + Prettier.
- Avoid `any`; isolate and validate external untyped boundaries.
- Payment/security logic belongs server-side.
- Descriptive naming.
- No secrets in source control.
- No PAN/CVV/secrets in logs.
- External boundaries use validation, typed schemas, explicit error mapping and correlation IDs.
- Payment operations use idempotency where supported.
- Unknown payment state must not trigger an automatic duplicate payment.

## 13. Repository Requirements

Required:

```text
docs/PRD.md
docs/Architecture.drawio
docs/architecture.md
docs/security.md
docs/threat-model.md
README.md
SECURITY.md
CONTRIBUTING.md
.env.example
```

The repository must include automated GitHub Actions for linting, type checking, unit tests and Playwright E2E tests where practical.

## 14. Demo

The final demo is approximately one minute and should show:

1. Frontend.
2. User request.
3. Search.
4. Product discovery.
5. Purchase proposal.
6. Policy evaluation.
7. Human confirmation when required.
8. StraitsX card/payment flow.
9. Payment confirmation.
10. Final result.
11. AWS backend/security evidence if time permits.

## 15. Definition of Done

- Purchase request works.
- Koh Kae discovery works against the designated test merchant.
- Purchase proposal works.
- PaymentAgentID is authenticated.
- Card/agent binding is checked.
- S$6 transaction policy works.
- S$12 cumulative policy works.
- Human authorization works.
- StraitsX sandbox integration works where supported.
- Test checkout works.
- Payment confirmation works.
- Audit trail works.
- Secrets are isolated.
- Playwright critical tests pass.
- AWS backend is operational for demo.
- `Architecture.drawio` exists.
- README is complete.
- 60-second demo path is reliable.
- 8-slide presentation is complete.

## 16. Delivery Principle

> **One complete, credible, tested agentic payment transaction is more valuable than many partially implemented features.**
