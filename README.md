# Mission Control — StraitsX Agentic Payment Control Plane

> **An AI agent that can shop — without giving the AI unrestricted payment authority.**

Mission Control is the MVP for the StraitsX Agentic Playground Hackathon. The canonical demo asks the agent to:

> **Buy Koh Kae Thai peanut snack from Shopee.**

The system demonstrates agentic discovery followed by deterministic payment controls, human authorization, and a StraitsX sandbox payment flow.

## Demo controls

| Control | Demo value |
|---|---:|
| Autonomous transaction limit | S$6.00 |
| Total demo spend limit | S$12.00 |
| Payment identity | `PA-001` |
| StraitsX integration | Card Issuance MCP Sandbox |

## Architecture

See [`docs/PRD.md`](docs/PRD.md) and [`docs/Architecture.drawio`](docs/Architecture.drawio).

```text
User → Mission Control → Agent → Payment Firewall → Policy Engine
                                      │
                                      ├─ ALLOW ──────────────┐
                                      └─ HUMAN AUTHORIZATION │
                                                            ↓
                                                   StraitsX MCP Sandbox
                                                            ↓
                                                     Test Merchant
```

## Security principles

- PaymentAgentID is server-controlled.
- Card-to-agent binding is enforced before payment.
- LLMs do not receive PAN/CVV/secrets.
- Spending policy is deterministic application logic.
- The LLM cannot modify its own limits or approve its own payment.
- Unknown payment state fails closed.
- Payment operations should use idempotency protections.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run build
npm run lint
npm run format:check
npm test
npm run test:e2e
```

## Repository structure

```text
src/domain/          deterministic payment policy
src/App.tsx          Mission Control demo UI
tests/e2e/            Playwright acceptance tests
.github/workflows/   CI
/docs/               PRD and architecture/security documentation
```

## Status

MVP implementation in progress. External StraitsX MCP tool schemas and merchant execution are intentionally isolated behind integration boundaries and must be verified against the live hackathon sandbox before enabling real sandbox payment execution.
