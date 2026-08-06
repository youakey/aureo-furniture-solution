# Aureo Furniture Solution - SEO & Dev Guidelines

## Project Context
- **Business:** Custom furniture, kitchen cabinets, and closets.
- **Location:** Atlanta, GA (USA).
- **Core Goal:** Transform the site into an SEO-optimized lead generation tool for the Atlanta local market.

## Critical Rules
1. **Naming:** Always use "Aureo Furniture Solution" (Singular). Never "Solutions" (Plural).
2. **SEO Structure:** "One Service = One Page".
3. **Target Keywords:** See Extended Target Keywords section below.

## Extended Target Keywords (Homepage)
kitchen cabinets Atlanta · custom kitchen cabinets Atlanta · closet systems Atlanta · walk-in closets Atlanta · custom closets Atlanta · cabinet installation Atlanta · custom interior solutions Atlanta · kitchen remodel Atlanta · shaker cabinets Atlanta · modern kitchen cabinets Atlanta · Cumming · Alpharetta · Roswell · Johns Creek · Sandy Springs

## SEO Structure (Homepage Requirements)
The homepage must always include:
- H1 containing the primary keyword AND the city "Atlanta" or "Atlanta, GA"
- Geo meta tags: geo.region (US-GA), geo.placename (Atlanta), geo.position, ICBM, author, theme-color
- OG tags: og:type, og:title, og:description, og:url, og:image (1200×630 → assets/og-image.webp), og:image:width/height
- Twitter Card meta: summary_large_image
- Robots meta: index, follow, max-image-preview:large, max-snippet:-1
- FAQ section (min 8 Q&A) + separate FAQPage JSON-LD script block
- Reviews/Testimonials section + Review schema + AggregateRating inside LocalBusiness JSON-LD
- JSON-LD LocalBusiness with: geo (GeoCoordinates), openingHoursSpecification (array), email, priceRange: $$-$$$, image → og-image.webp

## Background Effects Rule
Decorative background effects (radial-gradient, box-shadow glow, blur, any shimmer) must NOT be directly visible under text content. They are allowed in purely decorative zones (card corners, hero overlays, between-section decorators). If an effect lands under text — remove it or give the text container a solid opaque backing (background: var(--bg) / #070707). Goal: every line of text sits on a visually flat, even-colored surface.

## Tech Stack & Style
- Keep existing styling and layout consistency.
- Do not break existing contact forms or interactive elements.
- Use semantic HTML5 for SEO (H1-H3 hierarchy).

## SEO Requirements for New Pages
- **Title:** Primary Keyword | Atlanta, GA | Aureo Furniture Solution
- **H1:** Must contain the primary keyword and "Atlanta".
- **Images:** All <img> must have descriptive `alt` tags with keywords.
- **Sitemap:** Must be updated whenever a new page is added.

## Service Areas
Official service area — 6 cities:
- Atlanta
- Cumming
- Alpharetta
- Roswell
- Johns Creek
- Sandy Springs

On the homepage (`index.html`) and in JSON-LD `areaServed`, use only these 6 cities. Do not add Marietta, Suwanee, Forsyth County, Fulton County, Cobb County, or North Atlanta to the homepage or structured data. Inner service pages (`/services/*.html`) may retain city references already present in their body text.

## Design Discipline
The visual concept of the site is **frozen**: dark palette (`#070707` background, gold `#c9a24a` accent), pine-cone logo, hero composition (logo watermark + hero photo + side card). These elements must not be changed without an explicit client request. All content edits must fit within the existing visual style — no palette changes, no font swaps, no hero restructuring.

> 2026-07-06: client requested a hero/portfolio/typography redesign pass; implemented, then **reverted 2026-07-07** at the client's request ("keep the design as it was"). The frozen baseline above is back in effect — any hero/typography/portfolio-grid restructuring needs a fresh explicit request.

## Site Analysis & Roadmap (2026-07-06)

This section is the project's persistent memory — read it before re-analyzing the repo from scratch in a new session. Update the checklist as work lands instead of re-deriving this from the code.

### Stack
Plain static site, **no build step, no `package.json`**: raw HTML/CSS/JS. Deployed via GitHub Pages (`CNAME` → `aureofur.com`), Cloudflare sits in front for DNS/proxy only. Fonts via Google Fonts CDN, phone input via `intl-tel-input` CDN.

### File map
- `index.html` — homepage (all sections + 3 JSON-LD blocks: LocalBusiness, FAQPage, Review ItemList)
- `services/kitchen-cabinets.html`, `services/custom-closets.html`, `services/cabinet-installation.html` — one page per service, each with unique title/description/H1 (verified, not templated duplicates)
- `styles.css` — single stylesheet, CSS custom properties in `:root` (`--bg`, `--gold`, `--card`, etc.), several appended "patch" sections at the bottom (bug fixes / flat-text-surface fixes layered on top of the base rules — read to the end of the file, not just the top, before touching a selector)
- `script.js` — nav toggle, `intl-tel-input` init, scroll-driven background parallax vars, reveal-on-scroll `IntersectionObserver` (also lazy-loads portfolio background images), sticky header darkening, lead form submit handler
- `config.js` — one line: `window.AUREO = { proxyUrl: "..." }`. Nothing else lives here.
- `assets/` — `hero.webp`, `hero-mobile.webp`, `og-image.webp` (1200×630), `logo.webp` (66KB after Block 5, used inline + as apple-touch-icon), `favicon-32.webp` (886B, the actual favicon), `logo.png` (2.1MB, **referenced by nothing** — kept as the high-res master)
- `assets/portfolio/` — `p1.webp`…`p6.webp`
- `sitemap.xml` / `robots.txt` — match the 4 real pages 1:1, no orphans, no `Disallow` rules
- `google*.html` × 2 — Search Console verification files at root, harmless
- `README.md` — rewritten in Block 5: correct architecture, deploy steps, conventions, and an explicit warning never to put the bot token in `config.js`
- `SECURITY-HEADERS.md` — Cloudflare Transform Rule config for the headers GitHub Pages cannot set, plus the lead-form threat model

### Lead form / Telegram bot architecture
`#leadForm` (index.html) → validated client-side (required fields, email regex) → `script.js`'s `sendToWorker()` → `POST {proxyUrl}/lead` → Cloudflare Worker at `https://aureo-leads.zerocppscript.workers.dev` (source lives **outside this repo**) → Telegram Bot API.

**No token or chat-id anywhere in this repo** — confirmed by grep. This is the correct/secure pattern (proxy holds secrets, client never sees them). **Client confirmed the bot works and has the Worker source — do not modify `config.js`, the form handler in `script.js`, or attempt to "fix" the Worker integration.** Treat it as a working external dependency. The only loose end is `README.md` documenting a stale architecture (low-priority cleanup, optional).

### SEO status
**Already in place:** JSON-LD LocalBusiness + FAQPage (8 Q&A) + Review ItemList (4 reviews), geo meta, OG/Twitter meta, `robots` meta, unique per-page title/description/H1, sitemap/robots correctness, single-h1 pages with clean h2→h3 nesting.

**Gaps identified this session:**
- `assets/og-image.webp` referenced by OG/Twitter meta and JSON-LD `image` — **file does not exist**, social previews are broken
- Geo mismatch: `geo.position`/ICBM meta say Atlanta coords while JSON-LD `address` says Cumming, GA (same lat/long reused for both)
- Review `ItemList` block is a separate JSON-LD script, not nested under LocalBusiness's `review` property — disconnected from its own `aggregateRating`
- LocalBusiness address missing `streetAddress`/`postalCode`/`sameAs`
- Favicon uses `logo.png` (2.2MB) instead of the existing `logo.webp` (260KB)
- Portfolio photos are `<div class="ph" data-img="..." role="img" aria-label="...">` (CSS background-image via hand-rolled `IntersectionObserver`), not real `<img alt loading="lazy">` — weaker for image SEO/accessibility than native markup
- No `.gitignore` — stray `.DS_Store` committed

### Design gaps ("generic AI site" feel, pre-redesign)
- Portfolio grid: 6 items, all treated identically (`.grid--3`, uniform card size) — no visual hierarchy/featured item
- Hero: centered logo + photo + side glass card, but composition reads flat/default rather than art-directed
- Brand motif (gold accent, pine-cone/logo) confined to buttons/badges — not used systemically as a recurring visual device
- Playfair Display used only for portfolio captions and review quotes — underused given it's the site's one distinctive typographic choice

### Roadmap checklist
- [x] Block 1 — this section (project memory)
- [x] Block 2 — SEO/technical fixes: added `assets/og-image.webp` (1200×630, generated from `hero.webp`), favicon now `logo.webp` (was 2.2MB `logo.png`), LocalBusiness JSON-LD `geo` corrected to Cumming, GA coordinates, reviews nested under LocalBusiness's own `review` property (removed the disconnected separate `ItemList` block), portfolio items converted from `<div data-img>` to real `<img alt loading="lazy">`, added `.gitignore` + untracked stray `.DS_Store` files
- [x] Block 3 — Portfolio caption/description fix: p5 "Shaker Kitchen Project · Roswell" → **"TV Area"** (photo is a wood-slat TV/media wall), p6 "Custom Storage Solutions · Sandy Springs" → **"Shaker Kitchen Project"** (photo is a white shaker kitchen with island). Descriptions rewritten to match the actual photos.
- [x] Block 5 (2026-08-06) — Full audit pass: design polish / SEO / performance / security. Client explicitly re-authorised design work but chose the **conservative tier only** ("воздух и полировка"): palette, heading typeface, hero composition and the logo stay frozen. What landed:
  - **Bugs:** footer `<img>` was closed with `</img>` and wrapped a `<div>` (invalid HTML) — fixed; `services/*.html` loaded the 2.1 MB `logo.png` as favicon — now a dedicated 886-byte `assets/favicon-32.webp`; header logo on service pages had no `width`/`height` (CLS) — added; hero `<img>` had `width="340" height="340"` against a 2:3 image — corrected to 340×510.
  - **CSS consolidation:** `.hero__logo` was declared in **5 conflicting blocks** (mix-blend-mode set and then unset, two competing `animation`s, four different widths). Collapsed into one block. Verified with a postcss cascade diff at 1440/900/600px: **all 13 resolved declarations identical** to the previous output. Removed dead rules: `.hero__markrow`, `.hero__markfill` (+2 pseudo-elements), `.ph--wide`, `.trust__num`, `.trust__label`, `.btn .ripple`, `@keyframes ripple`, `.hero__fade` (+ its markup). Moved the inline `<style>` block from `index.html` into `styles.css` (last in cascade, so identical rendering) — this is what lets the CSP drop `script-src 'unsafe-inline'`.
  - **Design (conservative):** `.section` padding 64→88px (72 tablet / 56 mobile), `.section__head` margin 22→34px, grid gap 16→22px, h2 28→34px with a single scale applied to `#why`/`#areas` too (they previously fell back to the browser default 24px), tile padding 18→24px, step padding 14→18px. Portfolio hover reworked: the **photo** zooms (`scale(1.06)`) instead of the whole card jumping, caption chip turns gold, border picks up the accent. Mobile portfolio is now a `scroll-snap` slider (84% cards, edge-bleed) instead of six stacked images. New sticky mobile "Call Now" bar (`#callbar`) that appears past the hero and hides while `#contact` is on screen.
  - **SEO:** geo meta was Atlanta coords while JSON-LD said Cumming — both now Cumming (34.2073, -84.1402). Service pages gained `twitter:card`, `og:image` → real 1200×630 `og-image.webp` (was `hero.webp`), `og:image:width/height`, `og:site_name`, `og:locale`, geo/author/theme-color meta, full `robots` directives, and a **BreadcrumbList** JSON-LD block. `sitemap.xml` lastmod → 2026-08-06.
  - **Performance:** `logo.webp` 254 KB → **66 KB** (1024×1536 → 720×1080; largest on-screen size is 360 CSS px, so still retina-safe — artwork and displayed size unchanged). Hero photo is a CSS background, so added `<link rel=preload as=image>` split by the 768px breakpoint for LCP. All three scripts now `defer` (order preserved); `intlTelInput.css` is no longer render-blocking — `script.js` injects it lazily. Added `preload as=script` + `preconnect` for the jsDelivr CDN. Cache-buster `?v=hero1` → `?v=20260806`.
  - **Security:** `novalidate` removed from all 4 forms → native HTML5 validation is now the first layer, with `pattern`/`minlength`/`maxlength`/`inputmode`/`title` on every field; JS validation stays as layer 2. Off-screen honeypot `#company` + a 3 s minimum time-to-fill + a 30 s resubmit cooldown — **all checked client-side only, the request payload to the Worker is byte-identical**. Added a meta CSP (no `script-src 'unsafe-inline'` needed) and `referrer` meta to all 4 pages. `.gitignore` expanded from 1 line to cover secrets/editor/OS/tooling. New `SECURITY-HEADERS.md` with the Cloudflare Transform Rule config for the headers a meta tag cannot set. `README.md` rewritten — it previously instructed putting the Telegram bot token in `config.js`.
  - **Verified:** vnu HTML validator clean on all 4 pages; `node --check` on JS; JSON-LD parsed; sitemap XML parsed; postcss cascade diff (see above); every local asset reference resolves; no secrets anywhere in source.
- [reverted] Block 4 — Visual redesign was implemented (hero flanking gold bars, gold divider under h1, pine-cone icon before section headings, Playfair Display h1/h2s, featured portfolio mosaic with staggered reveal) then **explicitly reverted by the client on 2026-07-07** ("по дизайну верни как было, остальное норм" — keep Blocks 2/3, undo Block 4 only). Reverted via `git revert` of the redesign commit. Design gaps listed above are therefore still open/unaddressed — do not redo this pass without a fresh explicit request.

**Still open / not done:**
- LocalBusiness JSON-LD still missing `streetAddress`/`postalCode`/`sameAs` — **blocked on the client**, no real data available. Do not invent an address. `sameAs` needs the Google Business / Facebook / Instagram profile URLs.
- `assets/logo.png` (2.1 MB) is now referenced by nothing. Left on disk deliberately as the high-res master; it is dead weight in the deploy but harmless since nothing requests it. Deleting it does not shrink git history.
- Rate limiting for the lead form must be added **in the Cloudflare Worker** — every browser-side guard added in Block 5 is trivially bypassed by POSTing to `/lead` directly. See `SECURITY-HEADERS.md`.
- Security headers (`frame-ancestors`, HSTS, `X-Content-Type-Options`) need the Cloudflare Transform Rule from `SECURITY-HEADERS.md` — a meta tag cannot express them.
- `style-src 'unsafe-inline'` is still required because inline `style="…"` attributes remain in the markup. Moving them to classes would let the CSP drop it.
- `.hero{min-height}` on mobile: an old patch set `100svh` at ≤768px but the inline `<style>` block always overrode it back to `92vh`, so `100svh` never rendered. Block 5 kept `92vh` to preserve the live appearance exactly — switching to `100svh` is available as a deliberate decision, not a bug fix.
- Visual redesign (Block 4) — reverted, see above. The client re-authorised design work in Block 5 but explicitly chose the conservative tier, so the "generic AI site" gaps (uniform portfolio grid, flat hero composition, underused Playfair, brand motif confined to buttons) **remain open by choice**. Do not attempt the Playfair-headings / portfolio-mosaic pass again without a fresh explicit request.
