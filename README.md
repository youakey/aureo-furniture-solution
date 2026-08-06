# Aureo Furniture Solution — website

Static marketing site for **aureofur.com**. Custom kitchen cabinets, closet systems
and cabinet installation in Atlanta, GA and the surrounding North Atlanta area.

## Stack

Plain HTML/CSS/JS. **No build step, no `package.json`, no bundler.** Edit the files,
commit, push — GitHub Pages serves them. Cloudflare sits in front for DNS and proxy.

```
index.html                        homepage — LocalBusiness + FAQPage JSON-LD
services/kitchen-cabinets.html    one page per service, each with its own
services/custom-closets.html      title / description / H1 / Service + BreadcrumbList JSON-LD
services/cabinet-installation.html
styles.css                        the single stylesheet (read to the end — later
                                  blocks intentionally override earlier ones)
script.js                         nav, phone input, scroll reveal, sticky call bar, lead form
config.js                         one line: the Cloudflare Worker URL. No secrets.
assets/                           hero, logo, og-image, portfolio/p1…p6 (all .webp)
sitemap.xml robots.txt CNAME      update sitemap.xml whenever a page is added
CLAUDE.md                         project memory, SEO rules, design constraints — read first
SECURITY-HEADERS.md               Cloudflare header configuration
```

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from the filesystem mostly works, but `file://`
breaks the CSP meta tag and root-relative links such as `/services/…`.
Use the local server.

## Deploy

```bash
git add -A && git commit -m "…" && git push
```

GitHub Pages publishes from `main`. If you changed `styles.css` or `script.js`,
bump the cache-buster in all four HTML files at once:

```bash
sed -i '' 's/?v=20260806/?v=YYYYMMDD/g' index.html services/*.html
```

## Lead form → Telegram

```
#leadForm → script.js sendToWorker() → POST {proxyUrl}/lead → Cloudflare Worker → Telegram Bot API
```

`config.js` holds only the public Worker URL:

```js
window.AUREO = { proxyUrl: "https://aureo-leads.zerocppscript.workers.dev" };
```

> **The bot token and chat id are Cloudflare Worker secrets and must never appear
> in this repository.** Anything committed here is public and permanently visible
> in the git history. Earlier revisions of this README described putting `tgToken`
> and `tgChatId` in `config.js` — that approach is insecure and is no longer used.
> The Worker source lives outside this repo.

To change where leads are delivered, update the Worker's secrets
(`wrangler secret put TG_TOKEN` / `TG_CHAT_ID`) — not any file here.

Spam protection in the browser: HTML5 validation, a JS validation pass, an
off-screen honeypot (`#company`, never sent to the Worker), a 3 s minimum
time-to-fill and a 30 s resubmit cooldown. Rate limiting and any Turnstile
verification belong in the Worker — see `SECURITY-HEADERS.md`.

## Conventions

- The business name is **"Aureo Furniture Solution"** — singular. Never "Solutions".
- One service = one page. New page → add it to `sitemap.xml`.
- Homepage and JSON-LD `areaServed` list exactly six cities: Atlanta, Cumming,
  Alpharetta, Roswell, Johns Creek, Sandy Springs.
- Every `<img>` needs a descriptive, keyword-bearing `alt`, plus `width`/`height`
  to keep CLS at zero, plus `loading="lazy"` below the fold.
- The visual concept — dark `#070707`, gold `#c9a24a`, the pine-cone logo, the hero
  composition — is frozen. See the Design Discipline section of `CLAUDE.md` before
  changing anything visual.
