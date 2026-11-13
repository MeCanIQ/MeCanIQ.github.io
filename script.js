/* eslint-env browser */
// MeCanIQ website - progressive enhancement. The page reads fine without it; with it, the nav gets
// its border, cards rise in, and the price charts and the "describe it" examples are drawn from the
// two JSON blocks at the end of index.html (generated from the app - see src/__tests__/siteData.test.ts).

// Nav gets a border/blur once the hero has scrolled past it.
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const readJson = (id) => {
  try { return JSON.parse(document.getElementById(id).textContent); } catch { return null; }
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => '$' + Number(n).toLocaleString('en-US');
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// "a, b and c" - the app's joinPlainList.
const plainList = (items) => (items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]);

// ---------- Price charts ----------
const prices = readJson('price-data');
if (prices) {
  // 1. Range chart: what one job costs at each kind of place, low to high, on one dollar axis.
  const range = document.getElementById('range-chart');
  if (range) {
    const step = 100;
    const max = Math.ceil(Math.max(...prices.rows.map((r) => r.high)) / step) * step;
    const ticks = max / step;
    const pct = (v) => (v / max) * 100;
    range.querySelector('.chart-title').innerHTML =
      `What ${esc(prices.job)} cost, by where you go<span class="chart-sub">${esc(prices.car)} in ${esc(prices.state)} · both front wheels</span>`;
    range.querySelector('.chart-body').innerHTML = `
      <ul class="chart-rows">
        ${prices.rows.map((r) => `
          <li class="chart-row" tabindex="0" data-tip="${esc(r.label)}: ${esc(r.text.replace('-', ' to '))}" aria-label="${esc(r.label)}: ${esc(r.text.replace('-', ' to '))}">
            <span class="chart-label">${esc(r.label)}</span>
            <span class="chart-value">${esc(r.text.replace('-', '–'))}</span>
            <span class="chart-track has-grid" style="--ticks:${ticks}" aria-hidden="true">
              <span class="chart-bar range-bar" style="left:${pct(r.low)}%;width:${pct(r.high - r.low)}%"></span>
            </span>
          </li>`).join('')}
      </ul>
      <div class="chart-axis" aria-hidden="true">
        ${Array.from({ length: ticks + 1 }, (_, i) => `<span style="left:${(i / ticks) * 100}%">${money(i * step)}</span>`).join('')}
      </div>
      <details class="chart-table">
        <summary>See the numbers</summary>
        <table>
          <thead><tr><th>Where</th><th>Low</th><th>High</th></tr></thead>
          <tbody>${prices.rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${money(r.low)}</td><td>${money(r.high)}</td></tr>`).join('')}</tbody>
        </table>
      </details>`;
  }

  // 2. Ranked bars: what an independent shop saves against the dealership, job by job.
  const savings = document.getElementById('savings-chart');
  if (savings) {
    const top = Math.max(...prices.savings.map((s) => s.saved));
    savings.querySelector('.chart-title').innerHTML =
      `What skipping the dealership saves, job by job<span class="chart-sub">Independent shop instead of the dealership · typical price, ${esc(prices.car)} in ${esc(prices.state)}</span>`;
    savings.querySelector('.chart-body').innerHTML = `
      <ul class="chart-rows">
        ${prices.savings.map((s) => {
          const tip = `${capital(s.job)}: dealership about ${money(s.dealership)}, independent shop about ${money(s.independent)}`;
          return `
          <li class="chart-row" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip)}, about ${money(s.saved)} less">
            <span class="chart-label">${esc(capital(s.job))}</span>
            <span class="chart-value">${money(s.saved)} less</span>
            <span class="chart-track" aria-hidden="true"><span class="chart-bar save-bar" style="width:${(s.saved / top) * 100}%"></span></span>
          </li>`;
        }).join('')}
      </ul>
      <details class="chart-table">
        <summary>See the numbers</summary>
        <table>
          <thead><tr><th>Job</th><th>Dealership</th><th>Independent</th><th>Saved</th></tr></thead>
          <tbody>${prices.savings.map((s) => `<tr><td>${esc(capital(s.job))}</td><td>${money(s.dealership)}</td><td>${money(s.independent)}</td><td>${money(s.saved)}</td></tr>`).join('')}</tbody>
        </table>
      </details>`;
  }
}

// ---------- "Weird noise? Just describe it." ----------
// Each example is a phrase someone might type, with the sign the app's own search puts first for it.
const signs = readJson('sign-data');
const chipBox = document.getElementById('try-chips');
const result = document.getElementById('try-result');
if (signs && chipBox && result) {
  const show = (i) => {
    const s = signs[i];
    chipBox.querySelectorAll('.try-chip').forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
    const outcome = s.part
      ? `<div class="sign-outcome tone-${s.urgency}">
           <span class="sign-lead">Usually points to</span>
           <span class="sign-part">${esc(s.part)}</span>
           <span class="sign-pill">${esc(s.headline)}</span>
         </div>`
      : `<span class="sign-tag">No single part to point at - here's what it usually means</span>`;
    const also = s.alsoCheck.length ? `<p class="sign-also"><strong>Also worth checking:</strong> ${esc(plainList(s.alsoCheck))}.</p>` : '';
    result.innerHTML = `
      <div class="sign-card">
        <p class="sign-heard">You typed "${esc(s.q)}"</p>
        <p class="sign-label">${esc(s.label)}</p>
        ${outcome}
        <p class="sign-advice">${esc(s.advice)}</p>
        ${also}
      </div>`;
  };
  chipBox.innerHTML = signs.map((s, i) => `<button type="button" class="try-chip" aria-pressed="false" data-i="${i}">${esc(capital(s.q))}</button>`).join('');
  chipBox.addEventListener('click', (e) => {
    const chip = e.target.closest('.try-chip');
    if (chip) show(Number(chip.dataset.i));
  });
  show(0);
}

// ---------- Scroll-in ----------
// Cards and rows fade/rise in as they enter view, once. Respects prefers-reduced-motion via
// styles.css (they're already visible there), so this is harmless to run either way.
const revealed = document.querySelectorAll('.benefit-card, .reveal');
if ('IntersectionObserver' in window && revealed.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Where a visitor came from ----------
// A link like https://.../?ref=reddit (or utm_source=...) says which post, video or card brought
// someone here. It's a plain label, kept for this visit only (sessionStorage) and sent along
// with a waitlist signup - nothing about the person. Anything that isn't a short label is dropped.
const cleanRef = (v) => { const s = String(v || '').trim().toLowerCase(); return /^[a-z0-9_-]{1,40}$/.test(s) ? s : null; };
let visitRef = null;
try {
  const query = new URLSearchParams(window.location.search);
  visitRef = cleanRef(query.get('ref') || query.get('utm_source'));
  if (visitRef) sessionStorage.setItem('mecaniq-ref', visitRef);
  else visitRef = cleanRef(sessionStorage.getItem('mecaniq-ref'));
} catch { /* private mode: just this page view */ }

// ---------- Launch waitlist ----------
// The form at the top of index.html. It calls join_waitlist() in the app's Supabase project
// (supabase/migrations/20261111_waitlist.sql) with the public anon key from the form's data-
// attributes - that key can't read the list or do anything else there. The answer is the same
// whether or not the email was already on the list. Joining is remembered on this browser only
// (localStorage), so a return visit says "You're on the list" instead of asking again.
const waitlistForm = document.getElementById('waitlist-form');
if (waitlistForm) {
  const STORE_KEY = 'mecaniq-waitlist';
  const SUPPORT = 'mecaniq.app@gmail.com';
  const email = document.getElementById('waitlist-email');
  const error = document.getElementById('waitlist-error');
  const submit = waitlistForm.querySelector('.waitlist-submit');
  const done = document.getElementById('waitlist-done');
  const doneTitle = document.getElementById('waitlist-done-title');
  const doneText = document.getElementById('waitlist-done-text');
  const navCta = document.getElementById('nav-cta');
  const boxes = [...waitlistForm.querySelectorAll('input[name="platform"]')];
  const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
  const where = (platforms) =>
    platforms.length === 1 ? (platforms[0] === 'ios' ? 'the App Store' : 'Google Play') : 'the App Store and Google Play';
  const remember = (value) => {
    try {
      if (value) localStorage.setItem(STORE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORE_KEY);
    } catch { /* private mode: just not remembered */ }
  };
  const remembered = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; } };

  // The phone they're on is the likeliest answer - ticked for them, easy to change (still optional).
  const ua = navigator.userAgent || '';
  const onPhone = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : /Android/i.test(ua) ? 'android' : null;
  if (onPhone) boxes.forEach((b) => { b.checked = b.value === onPhone; });

  const showError = (message) => {
    error.textContent = message;
    email.setAttribute('aria-invalid', 'true');
  };
  const clearError = () => {
    error.textContent = '';
    email.removeAttribute('aria-invalid');
  };
  // Once joined, the nav's button becomes the demo - the next thing worth doing.
  const setNav = (joined) => {
    if (!navCta) return;
    navCta.textContent = joined ? 'Try it free' : 'Join Waitlist';
    navCta.href = joined ? 'https://mecaniq.github.io/' : '#waitlist';
    if (joined) { navCta.target = '_blank'; navCta.rel = 'noopener'; } else { navCta.removeAttribute('target'); navCta.removeAttribute('rel'); }
  };
  const showJoined = (entry, moveFocus) => {
    doneText.innerHTML = `We'll email <strong>${esc(entry.email)}</strong> the day MeCanIQ is on ${where(entry.platforms || [])}. Meanwhile, the preview below is yours to try.`;
    waitlistForm.hidden = true;
    done.hidden = false;
    setNav(true);
    if (moveFocus) doneTitle.focus();
  };

  const saved = remembered();
  if (saved && saved.email) showJoined(saved, false);

  document.getElementById('waitlist-change').addEventListener('click', () => {
    remember(null);
    done.hidden = true;
    waitlistForm.hidden = false;
    setNav(false);
    email.value = '';
    clearError();
    email.focus();
  });

  email.addEventListener('input', () => { if (error.textContent) clearError(); });

  waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const value = email.value.trim();
    const platforms = boxes.filter((b) => b.checked).map((b) => b.value);
    if (!looksLikeEmail(value)) {
      showError(value ? "That email doesn't look quite right. Please check it." : 'Add your email address to join.');
      email.focus();
      return;
    }
    clearError();
    // A form-filling bot fills the hidden box: tell it "done" and send nothing.
    if (waitlistForm.elements.website.value) { showJoined({ email: value, platforms }, true); return; }

    submit.disabled = true;
    submit.textContent = 'Joining…';
    try {
      const url = waitlistForm.dataset.supabaseUrl, key = waitlistForm.dataset.supabaseKey;
      const call = (path, body) => fetch(`${url}${path}`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      // With a source to remember, the newer function takes it; where that one isn't there yet
      // (supabase/migrations/20261112_...), the plain join still gets the person on the list.
      let res = visitRef
        ? await call('/rest/v1/rpc/join_waitlist_from', { p_email: value, p_platforms: platforms, p_source: visitRef })
        : await call('/rest/v1/rpc/join_waitlist', { p_email: value, p_platforms: platforms });
      if (visitRef && res.status === 404) res = await call('/rest/v1/rpc/join_waitlist', { p_email: value, p_platforms: platforms });
      const answer = res.ok ? await res.json() : null;
      if (answer && answer.ok) {
        const entry = { email: value, platforms };
        remember(entry);
        showJoined(entry, true);
      } else if (answer && answer.reason === 'email') {
        showError("That email doesn't look quite right. Please check it.");
        email.focus();
      } else if (answer && answer.reason === 'busy') {
        showError('Lots of people are joining right now. Please try again in a few minutes.');
      } else {
        throw new Error(`waitlist ${res.status}`);
      }
    } catch {
      showError(`That didn't go through. Please try again, or email ${SUPPORT} and we'll add you.`);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Join Waitlist';
    }
  });

  // Every "#waitlist" link: scroll up to the form and put the cursor in the email box.
  document.querySelectorAll('a[href="#waitlist"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') !== '#waitlist') return; // the nav button after joining
      e.preventDefault();
      const card = document.getElementById('waitlist');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        // A smooth scroll can be cut short (or skipped in a background tab): make sure it got there.
        const r = card.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) card.scrollIntoView({ behavior: 'instant', block: 'center' });
        if (!waitlistForm.hidden) email.focus({ preventScroll: true });
      }, 700);
    });
  });
}

// ---------- Visit counts (off until the owner turns them on) ----------
// When the form carries data-count="on", the page adds one to a private daily tally when it's
// opened and when the demo button is tapped (count_site_event() in the app's Supabase project):
// a number per day, per event, per source. No cookie, no visitor id, nothing stored here. Skipped
// for anyone whose browser asks not to be tracked, and on a developer's own machine.
if (waitlistForm && waitlistForm.dataset.count === 'on') {
  const asksNotToBeTracked = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) || /\.localhost$/.test(window.location.hostname);
  if (!asksNotToBeTracked && !local) {
    const url = waitlistForm.dataset.supabaseUrl, key = waitlistForm.dataset.supabaseKey;
    const count = (event) => {
      try {
        fetch(`${url}/rest/v1/rpc/count_site_event`, {
          method: 'POST',
          keepalive: true,
          headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_event: event, p_source: visitRef }),
        }).catch(() => {});
      } catch { /* counting must never get in the page's way */ }
    };
    count('home_view');
    document.querySelectorAll('a[href="https://mecaniq.github.io/"]').forEach((link) => link.addEventListener('click', () => count('demo_click')));
  }
}
