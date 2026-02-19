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
    if (e.target.tagName === "A") {
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

async function sendToWorker(text) {
  const { proxyUrl } = cfg();
  if (!proxyUrl) throw new Error("Proxy not configured (proxyUrl missing)");

  const res = await fetch(cfg().proxyUrl + "/lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, phone, email, message })
});


  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.ok === false) {
    throw new Error(j.description || j.error || "Worker/Telegram error");
  }
  return j;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $("#leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideToast();

    ["firstName", "phone", "email", "message"].forEach((id) => setError(id, ""));

    const firstName = $("#firstName").value.trim();
    const lastName = $("#lastName").value.trim();
    const email = $("#email").value.trim();
    const message = $("#message").value.trim();

    const phoneRaw = phoneInput ? phoneInput.value.trim() : "";
    const phoneE164 = iti ? iti.getNumber() : phoneRaw || "";

    let ok = true;
    if (!firstName) {
      setError("firstName", "First name is required.");
      ok = false;
    }
    if (!phoneRaw) {
      setError("phone", "Phone is required.");
      ok = false;
    }
    if (!email || !validEmail(email)) {
      setError("email", "Please enter a valid email.");
      ok = false;
    }
    if (!message) {
      setError("message", "Message is required.");
      ok = false;
    }

    if (!ok) return;

    const c = cfg();
    if (!c.proxyUrl) {
      showToast("Server is not configured. Please check config.js (proxyUrl).", false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const text = [
        "<b>New website request</b>",
        "",
        `<b>Name:</b> ${escapeHtml(firstName)}${
          lastName ? " " + escapeHtml(lastName) : ""
        }`,
        `<b>Phone:</b> ${escapeHtml(phoneRaw)}${
          phoneE164 ? " (" + escapeHtml(phoneE164) + ")" : ""
        }`,
        `<b>Email:</b> ${escapeHtml(email)}`,
        "",
        `<b>Message:</b> ${escapeHtml(message)}`,
        "",
        `<i>${now.toLocaleString()}</i>`,
      ].join("\n");

      await sendToWorker(text);

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
