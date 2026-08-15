# Mission Control Threat Model

| Threat | Control | Expected outcome |
|---|---|---|
| LLM attempts to raise limits | Server-side deterministic policy | Deny |
| Agent impersonation | Authenticated PaymentAgentID | Deny |
| Card used by another agent | Agent/card binding check | Deny |
| Merchant prompt injection | Treat merchant data as untrusted | Ignore instruction |
| Card secret leakage | Secret isolation + no LLM access | Secret remains server-side |
| Human approval spoofing | Authenticated UI/API authorization state | Deny |
| Duplicate payment retry | Idempotency key | Single payment |
| Provider timeout | Unknown state + fail closed | No blind retry |
| Total spend bypass | Atomic/server-side spend accounting | Never exceed S$12 |
| Frontend tampering | Backend re-evaluation | Client cannot authorize payment |
