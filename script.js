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
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const h = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const t = Math.min(1, Math.max(0, y / h));
      root.style.setProperty('--scroll', t.toFixed(4));
      const mx = Math.sin(t * Math.PI * 2) * 48;
      const my = (t - 0.5) * 140;
      root.style.setProperty('--mx', mx.toFixed(1) + 'px');
      root.style.setProperty('--my', my.toFixed(1) + 'px');
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  // Portfolio: if data-img is set, use it as a background image.
  document.querySelectorAll(".ph[data-img]").forEach((el) => {
    const src = (el.getAttribute("data-img") || "").trim();
    if (!src) return;
    // Use CSS var so we can render layered backgrounds (cover + contain).
    el.style.setProperty("--ph-img", `url('${src.replace(/'/g, "\\'")}')`);
    el.classList.add("ph--img");
  });

  // Button ripple
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    }, { passive: true });
  });

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll(
    '.hero__grid > *, .section, .card, .step, .ph, .tags span'
  ));
  revealEls.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach((el) => io.observe(el));

  const form = $("#leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideToast();

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
      await sendToWorker({ name, phone, email, message });

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