# Mission Control Architecture

```text
User
 │
 ▼
Mission Control UI
 │ authenticated request
 ▼
API / Agent Service
 │
 ├── Bedrock + Guardrails (reasoning/discovery)
 │
 ▼
Agent Payment Firewall
 ├── PaymentAgentID authentication
 ├── Card ↔ Agent binding
 ├── S$6 transaction policy
 ├── S$12 hard total policy
 ├── Human authorization state
 └── idempotency / fail-closed checks
 │
 ▼
Payment Provider Adapter
 ├── StraitsX MCP Sandbox
 └── Mock provider (tests)
 │
 ▼
Test Merchant

Secrets → AWS Secrets Manager / KMS
Audit → application events / CloudWatch
State → DynamoDB (target deployment)
```

The browser never receives payment secrets. The LLM does not make the final authorization decision. The payment firewall performs deterministic authorization immediately before provider execution.

See `Architecture.drawio` for the editable architecture source.
