const $ = (s) => document.querySelector(s);

const toast = $("#toast");
const phoneInput = $("#phone");

function showToast(m, ok = true) {
  toast.hidden = false;
  toast.textContent = m;
  toast.style.borderColor = ok
    ? "rgba(201,162,74,.35)"
    : "rgba(255,180,180,.35)";
}
function hideToast() {
  toast.hidden = true;
  toast.textContent = "";
}
function setLoading(v) {
  const b = $("#submitBtn");
  b.classList.toggle("loading", v);
  b.disabled = v;
}
function setError(id, msg) {
  const e = document.querySelector(`[data-err-for="${id}"]`);
  if (e) e.textContent = msg || "";
}
function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}
function cfg() {
  return window.AUREO || { proxyUrl: "" };
}

const burger = $("#burger"),
  mobile = $("#mobile");
if (burger && mobile) {
  burger.addEventListener("click", () => {
    const o = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!o));
    mobile.hidden = o;
  });
  mobile.addEventListener("click", (e) => {
    if (e.target.closest("button[data-href]")) {
      burger.setAttribute("aria-expanded", "false");
      mobile.hidden = true;
    }
  });
}

// intl-tel-input's stylesheet is only needed for the phone field, which sits far
// below the fold. Injecting it here keeps it off the critical rendering path and
// avoids an inline onload handler (which the CSP would otherwise have to allow).
if (phoneInput) {
  const itiCss = document.createElement("link");
  itiCss.rel = "stylesheet";
  itiCss.href =
    "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/css/intlTelInput.css";
  document.head.appendChild(itiCss);
}

let iti = null;
if (phoneInput && window.intlTelInput) {
  iti = window.intlTelInput(phoneInput, {
    initialCountry: "us",
    preferredCountries: ["us", "ca"],
    separateDialCode: true,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js",
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function sendToWorker(payload) {
  const { proxyUrl } = cfg();
  if (!proxyUrl) throw new Error("Proxy not configured (proxyUrl missing)");

  const res = await fetch(proxyUrl.replace(/\/$/, "") + "/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.ok === false) {
    throw new Error(j.error || j.description || `HTTP ${res.status}`);
  }
  return j;
}

document.addEventListener("DOMContentLoaded", () => {
  // Buttons with data-href (avoid browser status bar URLs on hover)
  document.querySelectorAll('button[data-href]').forEach((b) => {
    b.addEventListener('click', (e) => {
      const href = (b.getAttribute('data-href') || '').trim();
      if (!href) return;
      if (href.startsWith('#')) {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = href;
      }
      // close mobile menu if open
      const burger = document.querySelector('#burger');
      const mobile = document.querySelector('#mobile');
      if (burger && mobile && burger.getAttribute('aria-expanded') === 'true') {
        burger.setAttribute('aria-expanded', 'false');
        mobile.hidden = true;
      }
    });
  });

  // Background motion (scroll-driven CSS vars)
  const root = document.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const h = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const t = Math.min(1, Math.max(0, y / h));
      root.style.setProperty('--scroll', t.toFixed(4));
      const mx = Math.sin(t * Math.PI * 2) * 16;
      const my = (t - 0.5) * 48;
      root.style.setProperty('--mx', mx.toFixed(1) + 'px');
      root.style.setProperty('--my', my.toFixed(1) + 'px');
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  }
  // Portfolio images use native <img loading="lazy">; only the reveal fade-in is JS-driven.

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll(
    '.hero__grid > *, .section, .step, .ph'
  ));
  revealEls.forEach((el) => el.classList.add('reveal'));

  // Sticky header: darken background after 40px scroll
  const header = document.querySelector('.header');
  if (header) {
    const onHeaderScroll = () =>
      header.classList.toggle('header--scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // Sticky mobile "Call Now" bar:
  // appears once the visitor scrolls past the first screen, hides again while the
  // contact form is on screen so it never covers the fields.
  const callbar = document.querySelector('#callbar');
  if (callbar) {
    const contact = document.querySelector('#contact');
    let contactVisible = false;

    if (contact && 'IntersectionObserver' in window) {
      new IntersectionObserver(
        (entries) => {
          contactVisible = entries[0].isIntersecting;
          updateCallbar();
        },
        { threshold: 0 }
      ).observe(contact);
    }

    function updateCallbar() {
      const pastHero = window.scrollY > Math.min(520, window.innerHeight * 0.6);
      callbar.classList.toggle('is-visible', pastHero && !contactVisible);
    }

    let cbTicking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (cbTicking) return;
        cbTicking = true;
        requestAnimationFrame(() => {
          updateCallbar();
          cbTicking = false;
        });
      },
      { passive: true }
    );
    updateCallbar();
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.20, rootMargin: '0px 0px 0px 0px' });

  revealEls.forEach((el) => io.observe(el));

  const form = $("#leadForm");
  if (!form) return;

  // --- Spam guards (client side only — the request payload is unchanged) ---
  const honeypot = $("#company");
  const formOpenedAt = Date.now();
  const MIN_FILL_MS = 3000; // a human cannot fill this form in under 3 seconds
  const RESUBMIT_COOLDOWN_MS = 30000;
  let lastSentAt = 0;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideToast();

    // Bot filled the invisible field, or submitted implausibly fast.
    // Show the normal success message so scripted submitters get no signal.
    if (
      (honeypot && honeypot.value.trim() !== "") ||
      Date.now() - formOpenedAt < MIN_FILL_MS
    ) {
      form.reset();
      showToast(
        "Thank you! Your request has been sent. We will contact you soon.",
        true
      );
      return;
    }

    // Throttle rapid repeat submissions from the same visitor.
    if (Date.now() - lastSentAt < RESUBMIT_COOLDOWN_MS) {
      showToast(
        "We already received your request. Please give us a moment, or call +1 (943) 238-9384.",
        true
      );
      return;
    }

    ["firstName", "phone", "email", "message"].forEach((id) => setError(id, ""));

    const firstName = $("#firstName").value.trim();
    const lastName  = $("#lastName").value.trim();
    const email     = $("#email").value.trim();
    const message   = $("#message").value.trim();

    const phoneRaw  = phoneInput ? phoneInput.value.trim() : "";
    const phoneE164 = iti ? iti.getNumber() : "";
    const phone     = (phoneE164 || phoneRaw).trim();

    let ok = true;
    if (!firstName) { setError("firstName", "First name is required."); ok = false; }
    if (!phone)     { setError("phone", "Phone is required."); ok = false; }
    if (!email || !validEmail(email)) { setError("email", "Please enter a valid email."); ok = false; }
    if (!message)   { setError("message", "Message is required."); ok = false; }
    if (!ok) return;

    const c = cfg();
    if (!c.proxyUrl) {
      showToast("Server is not configured. Please check config.js (proxyUrl).", false);
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      // Payload shape is unchanged — the Worker contract stays exactly as it was.
      await sendToWorker({ name, phone, email, message });

      lastSentAt = Date.now();
      form.reset();
      if (iti) iti.setNumber("");
      showToast("Thank you! Your request has been sent. We will contact you soon.", true);
    } catch (err) {
      console.error(err);
      showToast("Sorry — something went wrong. Please call us at +1 (943) 238-9384.", false);
    } finally {
      setLoading(false);
    }
  });
});