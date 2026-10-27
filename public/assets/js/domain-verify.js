(function () {
  'use strict';
  const PREFIX = '_gitlgbt-verify';
  const TTL_OK = 6 * 3600 * 1000;
  const TTL_NO = 10 * 60 * 1000;
  const RESOLVERS = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve'];

  const hostOf = (url) => { try { return new URL(url).hostname.toLowerCase(); } catch { return ''; } };
  const bare = (host) => host.replace(/^www\./, '');
  const expected = (org) => `${location.host}/${org}`;
  const norm = (s) => String(s).replace(/^"+|"+$/g, '').replace(/"\s*"/g, '').trim().toLowerCase();

  async function txt(name) {
    for (const url of RESOLVERS) {
      try {
        const r = await fetch(`${url}?type=TXT&name=${encodeURIComponent(name)}`, { headers: { Accept: 'application/dns-json' } });
        if (!r.ok) continue;
        const j = await r.json();
        return (j.Answer || []).filter((a) => a.type === 16).map((a) => norm(a.data));
      } catch {}
    }
    return null;
  }

  async function check(org, website, useCache) {
    const host = hostOf(website);
    if (!host) return false;
    const key = `gitlgbt-verify:${org}:${host}`;

    if (useCache) {
      try {
        const c = JSON.parse(localStorage.getItem(key));
        if (c && Date.now() < c.exp) return c.ok;
      } catch {}
    }

    const want = expected(org).toLowerCase();
    let ok = false, failed = false;
    for (const h of new Set([host, bare(host)])) {
      const records = await txt(`${PREFIX}.${h}`);
      if (!records) failed = true;
      else if (records.includes(want)) { ok = true; break; }
    }

    if (ok || !failed) {
      try { localStorage.setItem(key, JSON.stringify({ ok, exp: Date.now() + (ok ? TTL_OK : TTL_NO) })); } catch {}
    }
    return ok;
  }

  function initBadge() {
    const el = document.getElementById('org-verified');
    if (!el || !el.dataset.website) return;
    check(el.dataset.org, el.dataset.website, true).then((ok) => {
      if (!ok) return;
      el.querySelector('.verify-domain').textContent = bare(hostOf(el.dataset.website));
      el.classList.remove('tw-hidden');
    });
  }

  function initSettings() {
    const box = document.getElementById('org-domain-verify');
    if (!box) return;
    const org = box.dataset.org;
    const input = document.getElementById('website');
    const status = box.querySelector('.verify-status');
    const run = box.querySelector('.verify-run');

    const refresh = () => {
      const h = hostOf(input.value);
      box.querySelector('.verify-name').textContent = h ? `${PREFIX}.${bare(h)}` : 'enter a website above';
      box.querySelector('.verify-value').textContent = expected(org);
    };
    input.addEventListener('input', refresh);
    refresh();

    box.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText(box.querySelector(b.dataset.copy).textContent);
    }));

    run.addEventListener('click', async () => {
      if (!hostOf(input.value)) { status.textContent = 'Enter a website first.'; return; }
      run.classList.add('loading');
      status.textContent = '';
      const ok = await check(org, input.value, false);
      run.classList.remove('loading');
      status.textContent = ok
        ? 'Verified. A Verified badge will show under the organization description.'
        : 'Record not found yet. Check the name and value, then try again later.';
    });
  }

  const init = () => { initBadge(); initSettings(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();