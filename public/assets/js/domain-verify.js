(() => {
  const PREFIX = '_gitlgbt-verify';
  const HOUR = 3600 * 1000;
  const RESOLVERS = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve'];
  const hostOf = (url) => { try { return new URL(url).hostname.toLowerCase(); } catch { return ''; } };
  const bare = (host) => host.replace(/^www\./, '');
  const expected = (org) => `${location.host}/${org}`;
  const clean = (s) => String(s).replace(/"/g, '').trim().toLowerCase();
  async function lookup(name) {
    for (const url of RESOLVERS) {
      try {
        const res = await fetch(`${url}?type=TXT&name=${encodeURIComponent(name)}`, {headers: {Accept: 'application/dns-json'}});
        if (!res.ok) continue;
        const data = await res.json();
        return (data.Answer || []).filter((a) => a.type === 16).map((a) => clean(a.data));
      } catch { }
    }
    return null;
  }
  async function isVerified(org, website) {
    const host = bare(hostOf(website));
    if (!host) return false;
    const key = `gitlgbt-verify:${org}:${host}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached && Date.now() < cached.exp) return cached.ok;
    } catch { }
    const records = await lookup(`${PREFIX}.${host}`);
    if (records === null) return false;    const ok = records.includes(expected(org).toLowerCase());
    try {
      localStorage.setItem(key, JSON.stringify({ok, exp: Date.now() + (ok ? 6 * HOUR : HOUR / 6)}));
    } catch { }
    return ok;
  }
  async function initBadge() {
    const el = document.getElementById('org-verified');
    if (!el || !el.dataset.website) return;
    if (!(await isVerified(el.dataset.org, el.dataset.website))) return;
    el.querySelector('.verify-domain').textContent = bare(hostOf(el.dataset.website));
    el.classList.remove('tw-hidden');
  }
  function initSettings() {
    const box = document.getElementById('org-domain-verify');
    const input = document.getElementById('website');
    if (!box || !input) return;
    const nameEl = box.querySelector('.verify-name');
    const valueEl = box.querySelector('.verify-value');
    const placeholder = nameEl.textContent;
    const refresh = () => {
      const host = bare(hostOf(input.value));
      nameEl.textContent = host ? `${PREFIX}.${host}` : placeholder;
      valueEl.textContent = expected(box.dataset.org);
    };
    input.addEventListener('input', refresh);
    refresh();
    box.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => navigator.clipboard?.writeText(box.querySelector(btn.dataset.copy).textContent));
    });
  }
  const init = () => { initBadge(); initSettings(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();