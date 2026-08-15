# Contributing

## Development rules

- Use TypeScript strict mode.
- Run `npm run lint`, `npm run format`, `npm test`, and `npm run build` before pushing.
- Run `npx playwright install --with-deps chromium` once before E2E tests when using a clean environment.
- Keep security and payment decisions in server/domain code, never UI-only code.
- Never commit secrets or payment credentials.
- Keep commits small and use conventional-style messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Do not invent external payment API/MCP schemas. Verify the live provider contract first.

## Payment changes

Any change affecting PaymentAgentID, card binding, spending limits, authorization or payment execution must include automated tests and preserve fail-closed behavior.
