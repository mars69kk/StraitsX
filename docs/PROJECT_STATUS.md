# StraitsX Mission Control — Project Status

**Last updated:** 2026-08-16  
**Repository:** `mars69kk/StraitsX`  
**Primary development branch:** `feat/mission-control-mvp`  
**Status:** In active MVP implementation; StraitsX MCP transaction integration is the next critical integration milestone.

## 1. Project objective

Build a secure agentic-payment Mission Control demo for the StraitsX Agentic Playground Hackathon. The canonical demo flow is:

1. User instructs the agent to buy Koh Kae Thai peanut snack from Shopee.
2. Agent searches/discovers the requested product.
3. Mission Control presents the purchase proposal.
4. User confirms the purchase.
5. Mission Control evaluates payment guardrails.
6. A StraitsX card/payment instrument is used for execution in the sandbox.
7. Payment is confirmed and the final result is shown to the user.

The demo policy is intentionally constrained:

- **Autonomous per-transaction limit:** S$6.00
- **Total spend limit:** S$12.00
- Transactions above S$6.00 require explicit human authorization.
- Transactions that would exceed S$12.00 are denied.
- The payment card is bound to the `PaymentAgentID`.
- A different agent must not be able to spend using the bound card.
- Secrets and card PII/PDI must not be exposed to the agent or frontend.

## 2. Durable source of truth

The GitHub repository is the durable engineering source of truth. This file is intended to make the project resumable across ChatGPT, Codex, laptop, and other development environments.

ChatGPT conversation context contains additional reasoning and decisions, but should not be treated as the only project state.

## 3. Repository state

Known development branch:

```text
feat/mission-control-mvp
```

The branch contains the Mission Control MVP scaffold, policy/security work, tests, documentation, and GitHub Actions work completed so far.

The latest known CI-related commit before this status file was:

```text
a3b94da — ci: unblock dependency installation without lockfile cache
```

A later local formatting pass may exist on the developer laptop and should be checked with `git status` before further commits.

## 4. Completed / implemented

### Product and architecture

- Locked Mission Control PRD.
- Mission Control frontend/application scaffold.
- Payment-provider abstraction.
- Deterministic payment policy engine.
- Human-authorization state concept.
- Audit/security boundary concept.
- Architecture documentation.
- `docs/Architecture.drawio` requirement incorporated.

### Payment policy

The deterministic policy engine enforces:

```text
PaymentAgentID authentication mismatch       -> DENY
Card/payment-agent binding mismatch           -> DENY
Non-positive amount                            -> DENY
Cumulative spend > S$12                       -> DENY
Amount > S$6 and no human authorization        -> REQUIRE_HUMAN_AUTHORIZATION
Otherwise                                      -> ALLOW
```

Human authorization may approve a transaction above the S$6 autonomous threshold, but must never bypass the S$12 absolute ceiling.

### Testing and quality

- Unit-test structure exists for payment policy behavior.
- Playwright E2E test structure exists.
- ESLint configuration exists.
- Prettier configuration exists.
- TypeScript/Vite build is configured.
- GitHub Actions quality and Playwright jobs are configured.

## 5. Current CI status

The first CI run failed before application checks because npm caching expected a lockfile that was not present.

The workflow was subsequently changed to remove the failing npm-cache dependency and retain Node 22, lint, formatting, unit tests, build, and Playwright checks.

The next CI run then reached Prettier and failed because approximately 20 files were not formatted.

**Current action:** format the actual local repository checkout with Prettier, inspect the diff, run all local checks, then push the verified formatting commit.

### Required local verification sequence

```bash
npm install
npx prettier --write .
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

Do not weaken or remove the formatting gate merely to obtain a green build.

## 6. StraitsX MCP integration status

### Known connection configuration

Sandbox MCP endpoint supplied for the project:

```text
https://card.straitsx.ai/sandbox/sse
```

Production endpoint exists but **must not be used by the demo application**:

```text
https://card.straitsx.ai/production/sse
```

MCP client configuration supplied by the developer:

```json
{
  "mcpServers": {
    "straitsx-card-sandbox": {
      "type": "sse",
      "url": "https://card.straitsx.ai/sandbox/sse"
    },
    "straitsx-card-prod": {
      "type": "sse",
      "url": "https://card.straitsx.ai/production/sse"
    }
  }
}
```

For the hackathon application, only `straitsx-card-sandbox` should be enabled.

### Critical outstanding item

The actual MCP handshake and `tools/list` result have **not yet been captured in the project state**.

Required discovery sequence:

```text
MCP initialize
    -> server capabilities
    -> tools/list
    -> record actual tool names and schemas
```

Do not invent StraitsX MCP tool names, parameters, authentication requirements, or output schemas.

After discovery, map the actual tools into the existing payment-provider abstraction and perform the first sandbox transaction only after the tool contract is verified.

### Credentials

Never commit API keys, tokens, client secrets, PAN, CVV, private keys, or other card/payment secrets to GitHub or ChatGPT messages.

For deployment, secrets should be stored in AWS Secrets Manager or an equivalent secret-management facility and accessed only by the backend integration boundary.

## 7. Security architecture target

The intended control path is:

```text
User
  -> AI Agent
  -> Mission Control
  -> Payment Firewall / Policy Engine
  -> StraitsX MCP / payment provider
  -> Merchant
```

The AI agent must not receive unrestricted card credentials.

Mission Control must independently enforce:

- PaymentAgentID identity.
- Card-to-agent binding.
- Autonomous transaction limit.
- Total spending ceiling.
- Human authorization escalation.
- Secret isolation.
- PII/PDI redaction.
- Audit logging.
- Fail-closed behavior.
- Idempotency protection where applicable.

Where supported by StraitsX, provider-side spend controls should complement rather than replace Mission Control controls.

## 8. Crossmint research status

Crossmint documentation was reviewed as a potential complementary agent-payment architecture.

Useful concepts identified include agent identity, scoped spending permissions, agent cards, stablecoin wallets, browser checkout, and agentic commerce.

Decision for this hackathon:

- **Do not replace StraitsX with Crossmint.**
- Keep StraitsX/XSGD/Avalanche as the primary hackathon payment infrastructure.
- Use Crossmint's permission/security model as architectural reference material.
- A future `CrossmintProvider` may be considered only if it materially improves the demo and does not undermine the StraitsX requirements.

## 9. AWS target

AWS account is ready and Bedrock is available.

The intended backend should keep provider credentials and payment execution server-side. Candidate AWS responsibilities include:

- Bedrock for agent/model orchestration where appropriate.
- Secrets Manager for payment/provider secrets.
- CloudWatch for logs and operational observability.
- API Gateway/Lambda or an appropriate backend runtime for controlled API boundaries.
- IAM least-privilege roles.

The exact AWS deployment topology should be finalized after the StraitsX MCP contract is discovered.

## 10. Demo target

Canonical product:

**Koh Kae Thai peanut snack on Shopee**

Target walkthrough for the 1-minute demo video:

```text
Frontend
  -> purchase request
  -> agent search/discovery
  -> product found
  -> purchase proposal
  -> human confirmation
  -> payment policy decision
  -> StraitsX sandbox payment/card execution
  -> payment confirmation
  -> final result
```

AWS backend should be shown briefly if it can be done without distracting from the payment lifecycle.

## 11. Submission deliverables

Required final submission assets:

- GitHub repository URL.
- Approximately 1-minute demo video with narrative.
- Presentation slides.
- Working end-to-end demo.
- Architecture diagram, including `docs/Architecture.drawio`.

The video should emphasize the complete payment lifecycle rather than only the UI.

## 12. Immediate next actions

Priority order:

1. Confirm actual local repository checkout.
2. Format repository with Prettier.
3. Run lint, format check, unit tests, build, and Playwright.
4. Commit/push formatting and test fixes.
5. Confirm green GitHub Actions.
6. Perform read-only StraitsX MCP handshake/tool discovery.
7. Capture the actual `tools/list` schemas without secrets.
8. Implement the real StraitsX sandbox provider adapter.
9. Configure sandbox card/payment controls.
10. Execute a controlled sandbox transaction.
11. Complete end-to-end Shopee-style demo flow.
12. Harden security/audit controls.
13. Finalize Architecture.drawio and submission assets.

## 13. Definition of Done

The MVP is ready for submission when:

- CI is green.
- Playwright covers the primary user journey.
- The frontend demonstrates request -> discovery -> confirmation -> payment -> result.
- StraitsX sandbox integration performs a real supported sandbox operation.
- S$6/S$12 policy behavior is demonstrated and tested.
- Human authorization is demonstrated for an above-S$6 transaction where applicable.
- Agent/card binding is tested.
- Secrets/card PII/PDI do not appear in frontend logs or agent context.
- Audit events are captured.
- Architecture.drawio matches the implemented architecture.
- Demo video and slides are ready.
- No production payment endpoint or production credentials are used by the demo.
