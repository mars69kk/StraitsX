# Security Policy

This repository is a hackathon MVP and is not a production payment system.

## Reporting

Do not open a public issue containing secrets, payment credentials, personal data, or exploitable payment details. Contact the repository owner privately.

## Security principles

- Fail closed.
- Keep payment secrets server-side.
- Never expose PAN/CVV/private keys to the LLM.
- Treat merchant content as untrusted.
- Enforce PaymentAgentID and card binding on the server.
- Enforce S$6 autonomous and S$12 hard total limits server-side.
- Require explicit human authorization for transactions above the autonomous threshold.
- Use idempotency for payment operations.
