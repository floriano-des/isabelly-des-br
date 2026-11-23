type Choice = 'granted' | 'denied';
type Clarity = { (...args: unknown[]): void; q?: IArguments[] };
declare global {
  interface Window {
    dataLayer?: unknown[];
    clarity?: Clarity;
  }
}

const storageKey = 'isabelly-analytics-consent';
const production = ['isabelly.des.br', 'www.isabelly.des.br'].includes(location.hostname);
let tracking = false;
let opener: HTMLElement | null = null;

function readChoice(): Choice | null {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === 'granted' || saved === 'denied' ? saved : null;
  } catch {
    return null;
  }
}
let choice = readChoice();

function googleConsent(_command: 'consent', _action: 'default' | 'update', _settings: Record<string, Choice>) {
  // O GTM lê as chamadas gtag pelo objeto arguments na dataLayer.
  (window.dataLayer ??= []).push(arguments);
}
function signalConsent(state: Choice, action: 'default' | 'update') {
  googleConsent('consent', action, {
    analytics_storage: state, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  });
  window.clarity?.('consentv2', { analytics_Storage: state, ad_Storage: 'denied' });
}
function startTracking() {
  if (!production || tracking || choice !== 'granted') return;
  tracking = true;
  const queue: Clarity = function () { (queue.q ??= []).push(arguments); };
  window.clarity ??= queue;
  signalConsent('denied', 'default');
  signalConsent('granted', 'update');
  window.dataLayer!.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PJGH2MT6';
  document.head.append(script);

  const performanceBeacon = document.createElement('script');
  performanceBeacon.type = 'module';
  performanceBeacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  performanceBeacon.dataset.cfBeacon = JSON.stringify({ token: '829177c6197349e98d60450cf2d61481' });
  document.head.append(performanceBeacon);
}

function clearAnalyticsCookies() {
  try {
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (!/^(_clck|_clsk|_ga(?:_.+)?)$/.test(name)) continue;
      const expired = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
      document.cookie = expired;
      document.cookie = expired + '; Domain=isabelly.des.br';
    }
  } catch {
    // Com os cookies bloqueados pelo navegador, ainda é possível alterar o consentimento.
  }
}

function render(open = choice === null) {
  const panel = document.querySelector<HTMLElement>('[data-analytics-panel]');
  if (!panel) return;
  panel.hidden = !open;
  panel.querySelectorAll<HTMLElement>('[data-current-choice]').forEach(label => {
    label.hidden = label.dataset.currentChoice !== choice;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-privacy-settings]').forEach(button => {
    button.hidden = false;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-controls', panel.id);
  });
}

function applyChoice(next: Choice | null) {
  choice = next;
  if (next === 'granted') startTracking();
  else if (production) {
    if (tracking) signalConsent('denied', 'update');
    clearAnalyticsCookies();
    // Descarrega também os scripts de gravação que já estavam em execução nesta aba.
    if (tracking) { location.reload(); return; }
  }
  render();
}

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const trigger = event.target.closest<HTMLButtonElement>('[data-privacy-settings]');
  if (trigger) {
    opener = trigger;
    render(true);
    document.querySelector<HTMLElement>('#analytics-title')?.focus({ preventScroll: true });
    return;
  }
  const next = event.target.closest<HTMLElement>('[data-analytics-choice]')?.dataset.analyticsChoice;
  if (next !== 'granted' && next !== 'denied') return;
  try { localStorage.setItem(storageKey, next); } catch { /* A escolha vale para a página aberta. */ }
  applyChoice(next);
  opener?.focus({ preventScroll: true });
  opener = null;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && opener && choice) {
    render(false);
    opener.focus({ preventScroll: true });
    opener = null;
  }
});
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) applyChoice(readChoice());
});
document.addEventListener('astro:page-load', () => { opener = null; render(); });
applyChoice(choice);

export {};
