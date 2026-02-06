# Aureo Furniture Solution — Website (v2)

This is a static website made for GitHub Pages.  
Lead capture + attachments work via **Supabase** (acts like a simple CRM).

## 1) Create Supabase table (SQL)
Open **Supabase → SQL Editor** and run:

```sql
create table if not exists public.leads (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text,
  phone text not null,
  phone_e164 text,
  email text not null,
  message text not null,
  attachments jsonb not null default '[]'::jsonb,
  source text not null default 'website'
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow anonymous inserts only (no reads)
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads"
on public.leads
for insert
to anon
with check (true);
```

## 2) Create Storage bucket for attachments
Supabase → Storage → Create bucket:
- Name: `lead-attachments`
- Public bucket: **ON** (so you can open uploaded photos from CRM)

Then add policies:

```sql
-- Storage policies (allow anon uploads)
create policy "anon_upload_lead_attachments"
on storage.objects for insert
to anon
with check (bucket_id = 'lead-attachments');

create policy "anon_read_lead_attachments"
on storage.objects for select
to anon
using (bucket_id = 'lead-attachments');
```

## 3) Configure the website
Open `config.js` and paste:
- Supabase URL
- Supabase anon key

## 4) Deploy to GitHub Pages
Upload the project to a GitHub repo and enable Pages in repo settings.
