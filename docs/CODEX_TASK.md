# StraitsX Mission Control — Codex Execution Task

**Repository:** `mars69kk/StraitsX`  
**Branch:** `feat/mission-control-mvp`  
**Execution environment:** local Codex/laptop checkout  
**Primary objective:** complete and verify the StraitsX Agentic Playground sandbox payment integration without using production credentials or endpoints.

> **Important:** This file is an execution plan, not permission to bypass safety checkpoints. Do not perform a financial mutation, card issuance, x402 signing, or production operation unless the conditions below are satisfied.

---

## 0. Current verified context

### Product/demo

The Mission Control demo should show:

```text
User request
  -> product discovery/search
  -> purchase proposal
  -> human confirmation
  -> payment policy decision
  -> StraitsX sandbox card/payment execution
  -> payment confirmation/result
```

Canonical example: **buy Koh Kae Thai Thai peanut snack from Shopee**.

### Demo payment policy

- Autonomous transaction limit: **S$6.00**.
- Absolute cumulative spend limit: **S$12.00**.
- `amount > S$6.00` requires explicit human authorization.
- Any transaction that would make cumulative spend exceed S$12.00 is denied.
- Payment/card identity must be bound to `PaymentAgentID`.
- A different agent must not be able to spend through the bound payment identity.
- Fail closed on missing/invalid identity, policy state, payment challenge, or provider response.

These are Mission Control controls. Do **not** claim that the StraitsX sandbox MCP itself enforces the S$6/S$12 daily policy unless the provider contract explicitly proves it.

### AWS

AWS account and Bedrock are ready. Keep provider credentials/signing material server-side. Use least-privilege IAM and AWS Secrets Manager where appropriate.

---

## 1. Repository safety and preflight

[ ] Work from the actual local checkout of `mars69kk/StraitsX`. Do **not** use the `github-plugin-github-openai-curated-remote-4` directory.

[ ] Verify:

```bash
git remote -v
git branch --show-current
git status
```

Expected branch:

```text
feat/mission-control-mvp
```

[ ] Do not use `git reset --hard`, `git clean -fd`, force-push, or destructive checkout operations.

[ ] Inspect the existing provider, policy, audit, frontend, test, and CI architecture before modifying it.

---

## 2. Establish a clean quality baseline

Run:

```bash
npm install
npx prettier --write .
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

[ ] Fix failures without weakening/removing quality gates.

[ ] Inspect the diff after formatting/fixes.

[ ] Do not commit unrelated generated files or secrets.

---

## 3. StraitsX MCP contract — use only verified schemas

Sandbox endpoint:

```text
https://card.straitsx.ai/sandbox/sse
```

**Never use the production endpoint for this project.**

Production endpoint exists at `https://card.straitsx.ai/production/sse`, but it is explicitly out of scope.

Verified MCP server:

```text
name: straitsx-card-mcp-sandbox
version: 2.0.0
protocolVersion: 2024-11-05
```

Verified discovery sequence already completed:

```text
initialize
notifications/initialized
tools/list
```

Verified tools:

### `get_card_sandbox`

Input:

```json
{
  "amount_sgd": 12,
  "cardholder_name": "Mission Control",
  "wallet_address": "0x..."
}
```

Constraints:

- `amount_sgd`: number, **5–30 SGD**.
- `cardholder_name`: string, **2–26 characters**, letters and spaces only.
- `wallet_address`: Avalanche wallet address `0x...`.

Description says the tool returns a cardapi URL and x402 payment requirements. The cardapi must then be called directly. If it returns HTTP 402, the documented flow is to sign an **EIP-3009 `TransferWithAuthorization`** for testnet XSGD and retry using the `PAYMENT-SIGNATURE` header. Successful cardapi response contains:

- `card_opaque_id`
- `card_html`
- `settlement_tx`

### `view_card_sandbox`

Input:

```json
{
  "card_opaque_id": "...",
  "settlement_tx": "...",
  "wallet_address": "0x..."
}
```

It returns a fresh one-time iframe URL for a previously issued sandbox card. Ownership is cryptographically verified.

**Do not invent any additional StraitsX MCP tools or schemas.**

---

## 4. Implement the StraitsX provider boundary

[ ] Preserve/extend the existing payment-provider abstraction rather than coupling UI/LLM code directly to StraitsX.

Target logical flow:

```text
Mission Control
  -> PaymentPolicy
  -> StraitsXProvider
  -> MCP sandbox
  -> cardapi/x402
  -> sandbox card
```

The agent/frontend must not receive unrestricted provider credentials or private keys.

The provider adapter should expose application-level operations, not raw secrets. Suggested logical responsibilities (adapt to the existing architecture):

- sandbox card issuance request;
- x402 challenge validation;
- EIP-3009 authorization payload construction;
- secure signing delegation;
- card issuance result normalization;
- one-time card-view URL retrieval;
- safe transaction/audit result mapping.

Do not add speculative API endpoints when the actual contract is not known.

---

## 5. Strict x402 challenge validation

Before signing anything:

[ ] Parse the actual HTTP 402 response and its payment requirements.

[ ] Validate that the challenge is for the expected sandbox environment.

[ ] Validate **Avalanche Fuji / chain ID 43113**.

[ ] Validate the expected **testnet XSGD asset/token** from the actual challenge/StraitsX contract. Do not hard-code an unverified token address.

[ ] Validate recipient/payment destination from the actual challenge against the expected StraitsX cardapi flow.

[ ] Validate requested amount and currency/asset semantics.

[ ] Validate nonce/deadline/authorization fields as required by the actual EIP-3009/x402 challenge.

[ ] Reject malformed, expired, unexpected-network, unexpected-asset, unexpected-recipient, or unexpected-amount challenges.

[ ] Fail closed if any required field cannot be verified.

Add unit tests for every rejection path.

---

## 6. EIP-3009 signing boundary

The private key must **never** be exposed to:

- the LLM/agent context;
- browser/frontend code;
- GitHub source;
- logs;
- test snapshots;
- chat messages.

Preferred boundary:

```text
Mission Control backend
      -> validated x402 authorization payload
      -> signing service/secret boundary
      -> EIP-3009 signature
      -> PAYMENT-SIGNATURE
```

For AWS deployment, use AWS Secrets Manager and least-privilege IAM where appropriate.

[ ] Implement deterministic construction/validation of the EIP-3009 authorization payload.

[ ] Unit-test payload construction and domain/message validation.

[ ] Unit-test that an unexpected challenge cannot be signed.

[ ] Do not log private keys or full signed authorization objects if they contain sensitive material.

---

## 7. Wallet prerequisite checkpoint

A **dedicated Avalanche Fuji test wallet** is required.

Required non-secret information:

```text
wallet address: 0x...
network: Avalanche Fuji
chain_id: 43113
```

Private signing material must already exist locally or in the approved secret store.

### If the wallet/private key is NOT configured

**STOP. Do not generate, guess, request, print, commit, or transmit a private key.**

Report exactly what non-secret configuration is missing and wait for the developer to configure it.

### If a wallet is configured

Proceed only to the next human checkpoint.

---

## 8. HUMAN CHECKPOINT — required before real sandbox mutation

Before invoking `get_card_sandbox` in a way that causes x402 payment/signing, stop and report:

1. Wallet address (public address only).
2. Network and chain ID.
3. Actual x402 payment requirements/challenge fields.
4. Asset/token identity.
5. Requested amount.
6. Recipient/destination.
7. Nonce/deadline.
8. How the challenge was validated.
9. How the Mission Control S$6/S$12 policy applies.
10. Whether the operation is definitely sandbox/testnet and cannot spend real money.

**Do not sign until this checkpoint has been reviewed/approved by the developer.**

If any field is ambiguous, stop.

---

## 9. Controlled sandbox card issuance

After the human checkpoint is satisfied:

Invoke only:

```text
get_card_sandbox
```

with:

```text
amount_sgd = 12
cardholder_name = Mission Control
wallet_address = <dedicated Fuji wallet>
```

Purpose: establish the real sandbox card/x402 integration. Do not merchant-checkout yet.

[ ] Validate the x402 challenge before signing.

[ ] Sign only the validated EIP-3009 authorization.

[ ] Retry cardapi using the required `PAYMENT-SIGNATURE` mechanism.

[ ] Capture the non-secret result:

```text
card_opaque_id
settlement_tx
card_html handling metadata (do not expose card credentials)
```

[ ] Do not paste full card credentials into ChatGPT, GitHub issues, source files, or logs.

[ ] Do not commit secrets.

---

## 10. Secure card display

After successful issuance:

[ ] Use `view_card_sandbox` only with the actual `card_opaque_id`, `settlement_tx`, and the same wallet address.

[ ] Treat the returned one-time iframe URL as sensitive.

[ ] Keep it out of persistent logs and source control.

[ ] Frontend should receive only the minimum short-lived data necessary to display the card securely.

[ ] Do not expose PAN/CVV/expiry to the agent's reasoning context.

---

## 11. PaymentAgentID binding and policy firewall

Enforce these checks before every payment action:

```text
agent authenticated?
        ↓ yes
PaymentAgentID matches bound payment identity?
        ↓ yes
amount > 0?
        ↓ yes
cumulative spend + amount <= 12?
        ↓ yes
amount <= 6 OR explicit human authorization?
        ↓ yes
ALLOW
```

Otherwise:

- identity mismatch -> `DENY`;
- card/agent binding mismatch -> `DENY`;
- cumulative total > S$12 -> `DENY`;
- amount > S$6 without explicit authorization -> `REQUIRE_HUMAN_AUTHORIZATION`;
- malformed provider challenge -> `DENY`;
- provider/network error -> fail closed.

Human authorization may approve a >S$6 transaction but may **never** override the S$12 absolute ceiling.

Add tests for:

- S$5.99 -> allow;
- S$6.00 -> allow;
- S$6.01 -> human authorization required;
- authorized S$6.01 -> allow if cumulative <= S$12;
- cumulative exactly S$12 -> allow only if otherwise permitted;
- any cumulative total > S$12 -> deny;
- wrong PaymentAgentID -> deny;
- wrong card binding -> deny;
- missing authorization -> deny/escalate as specified;
- duplicate request/idempotency behavior;
- invalid/missing spend ledger -> fail closed.

---

## 12. Security/redaction/audit

[ ] Redact secrets and payment-card PII/PDI from logs.

[ ] Never log private keys, PAN, CVV, full expiry, bearer tokens, or secret headers.

[ ] Use opaque identifiers such as `card_opaque_id` only where necessary.

[ ] Audit events should record safe metadata such as:

```text
request id
PaymentAgentID
merchant/product identifier
requested amount
policy decision
human authorization state
provider operation type
provider status
settlement transaction hash where safe
timestamp
```

[ ] Audit records must not contain secrets/card credentials.

---

## 13. Tests

Add/update tests for:

### Unit

- payment policy;
- cumulative spend;
- human authorization;
- PaymentAgentID binding;
- x402 challenge validation;
- EIP-3009 payload construction;
- invalid challenge rejection;
- secret/PDI redaction;
- provider error/fail-closed behavior;
- idempotency.

### Integration/mocked provider

Mock x402 HTTP 402 and successful retry responses. Verify:

```text
402 -> validate -> sign -> PAYMENT-SIGNATURE -> success
```

and all invalid challenges fail before signing.

### Playwright

Cover the visible user journey:

```text
frontend
 -> request
 -> search/discovery
 -> product result
 -> purchase proposal
 -> human confirmation
 -> policy decision
 -> payment state
 -> final result
```

Do not fake a provider success in the production integration path. Use an explicit test/mock mode for deterministic CI if required.

---

## 14. Architecture artifact

Create/verify:

```text
docs/Architecture.drawio
```

It must show at minimum:

```text
User
  -> Mission Control / Agent
  -> Payment Firewall / Policy Engine
  -> StraitsX MCP sandbox
  -> x402/cardapi
  -> Avalanche Fuji / testnet XSGD
  -> StraitsX sandbox Visa card
  -> merchant checkout/demo result

AWS boundary should show appropriate backend, Bedrock, Secrets Manager, IAM, and logging/observability components where actually implemented.
```

Do not claim components are deployed if they are only planned.

---

## 15. CI and GitHub

After local implementation:

```bash
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

[ ] Review `git diff`.

[ ] Review `git status`.

[ ] Confirm no secrets are present:

```bash
git diff --check
git status
```

[ ] Commit intentionally with a focused message.

[ ] Push to:

```text
feat/mission-control-mvp
```

[ ] Inspect GitHub Actions.

[ ] Fix real CI failures rather than disabling checks.

[ ] Do not force-push.

---

## 16. Project status maintenance

Update `docs/PROJECT_STATUS.md` after each verified milestone.

Record:

- date/time;
- commit SHA;
- tests passed/failed;
- MCP integration state;
- wallet configuration state without secrets;
- sandbox issuance state;
- CI state;
- blockers;
- next action.

Do not record private keys, secret values, PAN/CVV, or other sensitive credentials.

---

## 17. Final demo readiness

Before submission, verify:

[ ] GitHub URL is current.

[ ] 1-minute video demonstrates:

```text
frontend
 -> request
 -> search
 -> product
 -> human confirmation
 -> payment confirmation
 -> final result
```

[ ] AWS backend can be shown briefly if operational and useful.

[ ] S$6 autonomous limit is demonstrable.

[ ] >S$6 human authorization path is demonstrable.

[ ] S$12 absolute ceiling is demonstrable.

[ ] PaymentAgentID/card binding is demonstrable.

[ ] Secret/PDI redaction is demonstrable or clearly explained.

[ ] StraitsX sandbox card issuance is real, not fabricated.

[ ] No production endpoint/credential is used.

[ ] `docs/Architecture.drawio` is present and consistent with implementation.

[ ] CI is green.

[ ] Playwright is green.

[ ] No secrets are committed.

---

## 18. Stop conditions

Stop immediately and report to the developer if any of the following occurs:

- local repository cannot be located;
- current branch is not `feat/mission-control-mvp` and cannot be safely switched;
- required dependency installation cannot be performed;
- StraitsX MCP schema differs from the verified schema above;
- x402 challenge cannot be validated;
- network/chain/token is unexpected;
- wallet/private key is unavailable;
- signing request contains unexpected data;
- production endpoint/credentials are encountered;
- payment/card credentials would be exposed;
- operation would exceed the S$12 policy;
- any requested action is ambiguous or irreversible outside the sandbox scope.

---

## 19. Execution order — condensed checklist

```text
[ ] 1. Verify actual repo + branch
[ ] 2. Establish clean quality baseline
[ ] 3. Inspect provider/policy architecture
[ ] 4. Implement StraitsX sandbox adapter
[ ] 5. Implement x402 validation
[ ] 6. Implement EIP-3009 payload/signing boundary
[ ] 7. Verify dedicated Fuji wallet configuration
[ ] 8. HUMAN CHECKPOINT before signing/mutation
[ ] 9. Issue controlled S$12 sandbox card
[ ] 10. Verify secure one-time card view
[ ] 11. Integrate PaymentAgentID + S$6/S$12 firewall
[ ] 12. Add unit/integration/Playwright tests
[ ] 13. Add/update Architecture.drawio
[ ] 14. Update PROJECT_STATUS.md
[ ] 15. Run full local quality suite
[ ] 16. Review diff + secret scan
[ ] 17. Commit + push
[ ] 18. Verify GitHub Actions
[ ] 19. Fix CI failures
[ ] 20. Prepare final demo/submission
```

**Do not skip the human checkpoint at Step 8.**