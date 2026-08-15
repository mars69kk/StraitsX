import { useMemo, useState } from 'react';
import { evaluatePaymentPolicy } from './domain/policy';
import './styles.css';

const AGENT_ID = 'PA-001';

export default function App() {
  const [instruction, setInstruction] = useState('Buy Koh Kae Thai peanut snack from Shopee.');
  const [amountCents, setAmountCents] = useState(500);
  const [status, setStatus] = useState<'idle' | 'searching' | 'proposal' | 'awaiting' | 'success'>('idle');
  const [authorized, setAuthorized] = useState(false);

  const policy = useMemo(() => evaluatePaymentPolicy({
    amountCents,
    cumulativeSpendCents: 0,
    paymentAgentId: AGENT_ID,
    authenticatedAgentId: AGENT_ID,
    cardBoundAgentId: AGENT_ID,
    humanAuthorization: authorized,
  }), [amountCents, authorized]);

  function search() {
    setStatus('searching');
    window.setTimeout(() => setStatus('proposal'), 500);
  }

  function pay() {
    if (policy.decision === 'REQUIRE_HUMAN_AUTHORIZATION') {
      setStatus('awaiting');
      return;
    }
    if (policy.decision === 'ALLOW') setStatus('success');
  }

  return (
    <main className="shell">
      <header>
        <div className="eyebrow">STRAITSX × AVALANCHE</div>
        <h1>Mission Control</h1>
        <p className="subtitle">Agentic payment control plane</p>
      </header>

      <section className="card request-card">
        <label htmlFor="instruction">Purchase request</label>
        <textarea id="instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
        <button onClick={search} disabled={status === 'searching'}>
          {status === 'searching' ? 'Searching…' : 'Ask Agent to Find It'}
        </button>
      </section>

      {status !== 'idle' && (
        <section className="card">
          <div className="section-title">Agent activity</div>
          <div className="timeline">
            <div className="done">✓ Request received</div>
            <div className={status === 'searching' ? 'active' : 'done'}>{status === 'searching' ? '◉ Searching Shopee…' : '✓ Product discovered'}</div>
            {status !== 'searching' && <div className="done">✓ Purchase proposal prepared</div>}
          </div>
        </section>
      )}

      {(status === 'proposal' || status === 'awaiting' || status === 'success') && (
        <section className="card proposal">
          <div className="section-title">Purchase proposal</div>
          <div className="product">
            <div>
              <h2>Koh Kae Thai Peanut Snack</h2>
              <p>Shopee · test merchant</p>
            </div>
            <strong>S${(amountCents / 100).toFixed(2)}</strong>
          </div>

          <div className="controls">
            <label htmlFor="amount">Demo amount (cents)</label>
            <input id="amount" type="number" min="1" value={amountCents} onChange={(e) => setAmountCents(Number(e.target.value))} />
          </div>

          <div className="policy">
            <span>PaymentAgentID</span><b>{AGENT_ID}</b>
            <span>Card binding</span><b className="ok">VERIFIED</b>
            <span>Per-transaction limit</span><b>S$6.00</b>
            <span>Total spend limit</span><b>S$12.00</b>
            <span>Policy decision</span><b className={policy.decision === 'ALLOW' ? 'ok' : 'warn'}>{policy.decision}</b>
          </div>

          {status === 'awaiting' && (
            <div className="approval">
              <strong>Explicit authorization required</strong>
              <p>{policy.reason}</p>
              <div className="actions">
                <button onClick={() => { setAuthorized(true); setStatus('proposal'); }}>Authorize</button>
                <button className="secondary" onClick={() => setStatus('proposal')}>Decline</button>
              </div>
            </div>
          )}

          {status !== 'awaiting' && status !== 'success' && (
            <button onClick={pay}>Continue to Payment</button>
          )}

          {status === 'success' && (
            <div className="success">✓ Payment confirmed · Demo transaction complete</div>
          )}
        </section>
      )}

      <footer>Secrets stay server-side · Policy decisions are deterministic · Agent cannot approve its own payment</footer>
    </main>
  );
}
