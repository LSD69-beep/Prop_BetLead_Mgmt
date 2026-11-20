import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Tier 1 Google Maps Demo Key Quota & Auth Failure Listeners
(window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

const origConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : '')).join(' ');
  if (
    msg.includes('QuotaExceeded') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('ApiNotActivatedMapError') ||
    msg.includes('BillingNotEnabledMapError')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
  origConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(<App />);
