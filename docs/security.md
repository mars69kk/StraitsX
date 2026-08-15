# Mission Control Security Model

## Trust boundaries

1. Browser → authenticated application API.
2. Agent → untrusted merchant/product content.
3. Agent → deterministic payment firewall.
4. Payment firewall → StraitsX MCP sandbox.
5. Secrets → server-side AWS secret store/runtime only.

## Non-negotiable controls

- PaymentAgentID is established by authenticated server context, not by the LLM.
- Card references are bound to PaymentAgentID server-side.
- S$6 is the autonomous per-transaction ceiling.
- S$12 is the hard cumulative demo ceiling.
- Human approval can override the S$6 autonomy threshold but cannot increase the S$12 ceiling.
- Payment credentials are never passed to the LLM.
- Browser code cannot invoke privileged payment operations directly.
- Merchant content is untrusted input.
- Unknown payment status fails closed and cannot trigger blind retry.
- Payment operations require idempotency protection.

## Sensitive data

Never store or log PAN, CVV, expiry, private keys, seed phrases, API keys, access tokens, or other payment secrets. Use masked references and transaction IDs for observability.

## Bedrock Guardrails

Bedrock Guardrails may be used at the model boundary for prompt-injection, sensitive-information and unsafe-content controls. Guardrails are defense-in-depth; they do not replace deterministic server-side payment authorization.
