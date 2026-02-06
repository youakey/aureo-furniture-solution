// Aureo Furniture Solution — v2
// Works on GitHub Pages.
// Lead capture + attachments via Supabase (acts like a simple CRM).

const $ = (sel) => document.querySelector(sel);
const toast = $("#toast");

function showToast(msg, ok=true){
  toast.hidden = false;
  toast.textContent = msg;
  toast.style.borderColor = ok ? "rgba(201,162,74,.35)" : "rgba(255,180,180,.35)";
}

function hideToast(){
  toast.hidden = true;
  toast.textContent = "";
}

function setLoading(isLoading){
  const btn = $("#submitBtn");
  if(!btn) return;
  btn.classList.toggle("loading", isLoading);
  btn.disabled = isLoading;
}

function setError(id, msg){
  const el = document.querySelector(`[data-err-for="${id}"]`);
  if(el) el.textContent = msg || "";
}

function validateEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

function safeConfig(){
  // config.js should define window.AUREO = { url, anonKey, table, bucket }
  const cfg = window.AUREO || {};
  return {
    url: cfg.url || "",
    anonKey: cfg.anonKey || "",
    table: cfg.table || "leads",
    bucket: cfg.bucket || "lead-attachments",
  };
}

// Mobile menu
const burger = $("#burger");
const mobile = $("#mobile");
if(burger && mobile){
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    mobile.hidden = open;
  });
  mobile.addEventListener("click", (e) => {
    if(e.target.tagName === "A"){
      burger.setAttribute("aria-expanded", "false");
      mobile.hidden = true;
    }
  });
}

// Intl phone input
let iti = null;
const phoneInput = $("#phone");
if(phoneInput && window.intlTelInput){
  iti = window.intlTelInput(phoneInput, {
    initialCountry: "us",
    preferredCountries: ["us","ca"],
    separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js",
  });
}

async function uploadFiles(supabase, bucket, files){
  const uploaded = [];
  for(const file of files){
    // basic size guard (8MB per image)
    if(file.size > 8 * 1024 * 1024){
      throw new Error(`File too large: ${file.name} (max 8MB)`);
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_").slice(0, 60);
    const path = `leads/${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || `image/${ext}`
    });
    if(error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    uploaded.push({ name: file.name, path, url: data.publicUrl });
  }
  return uploaded;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $("#leadForm");
  if(!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideToast();

    // clear errors
    ["firstName","phone","email","message"].forEach(id => setError(id, ""));

    const firstName = $("#firstName").value.trim();
    const lastName  = $("#lastName").value.trim();
    const email     = $("#email").value.trim();
    const message   = $("#message").value.trim();
    const files     = $("#files").files ? Array.from($("#files").files) : [];

    let phone = phoneInput ? phoneInput.value.trim() : "";
    let phoneE164 = phone;

    if(iti){
      phoneE164 = iti.getNumber(); // E.164
    }

    let ok = true;
    if(!firstName){ setError("firstName", "First name is required."); ok = false; }
    if(!phone){ setError("phone", "Phone is required."); ok = false; }
    if(!email || !validateEmail(email)){ setError("email", "Please enter a valid email."); ok = false; }
    if(!message){ setError("message", "Message is required."); ok = false; }

    if(files.length > 8){
      showToast("Please attach up to 8 images.", false);
      ok = false;
    }

    if(!ok) return;

    const cfg = safeConfig();
    if(!cfg.url || !cfg.anonKey){
      showToast("Supabase is not configured yet. Open config.js and paste SUPABASE URL + ANON KEY.", false);
      return;
    }

    setLoading(true);

    try{
      const supabase = window.supabase.createClient(cfg.url, cfg.anonKey);

      // Upload attachments (optional)
      let uploaded = [];
      if(files.length){
        uploaded = await uploadFiles(supabase, cfg.bucket, files);
      }

      const payload = {
        first_name: firstName,
        last_name: lastName || null,
        phone: phone,
        phone_e164: phoneE164 || phone,
        email,
        message,
        attachments: uploaded, // JSON array
        source: "website",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from(cfg.table).insert(payload);
      if(error) throw error;

      form.reset();
      if(iti) iti.setNumber("");
      showToast("Thank you! Your request has been received. We will contact you soon.", true);
    }catch(err){
      console.error(err);
      showToast("Sorry — something went wrong while sending your request. Please call us at +1 (943) 238‑9384.", false);
    }finally{
      setLoading(false);
    }
  });
});
