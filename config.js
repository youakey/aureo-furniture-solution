// config.js
// Fill these values from your Supabase project settings.
// This enables a working “CRM” on GitHub Pages (leads + attachments).
//
// Steps summary:
// 1) Create Supabase project
// 2) Run SQL from README.md
// 3) Create Storage bucket: lead-attachments
// 4) Paste URL + anonKey below

window.AUREO = {
  url: "",          // e.g. https://xxxx.supabase.co
  anonKey: "",      // anon public key
  table: "leads",
  bucket: "lead-attachments"
};
