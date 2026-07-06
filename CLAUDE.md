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

> 2026-07-06: client explicitly requested a hero/portfolio/typography redesign pass (see roadmap below) — treat that pass as the standing exception to "no hero restructuring." Any *further* hero changes beyond what's documented here still need a fresh explicit request.

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
- `assets/` — `hero.webp`, `hero-mobile.webp`, `logo.webp` (260KB, used inline), `logo.png` (2.2MB, used only as `<link rel="icon">` favicon — oversized for that purpose)
- `assets/portfolio/` — `p1.webp`…`p6.webp`
- `sitemap.xml` / `robots.txt` — match the 4 real pages 1:1, no orphans, no `Disallow` rules
- `google*.html` × 2 — Search Console verification files at root, harmless
- `README.md` — **stale**, describes an old client-side `tgToken`/`tgChatId` config model that no longer exists in `config.js`

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
- [ ] Block 2 — SEO/technical fixes (geo mismatch, og-image, favicon, JSON-LD review nesting, portfolio `<img>` conversion, `.gitignore`)
- [ ] Block 3 — Portfolio caption/description fix: p5 "Shaker Kitchen Project · Roswell" → "TV Area" (photo is actually a wood-slat TV/media wall), p6 "Custom Storage Solutions · Sandy Springs" → "Shaker Kitchen Project" (photo is actually a white shaker kitchen with island)
- [ ] Block 4 — Visual redesign: hero recomposition, varied portfolio grid, typography tuning, systemic brand-motif use, restrained micro-interactions (client explicitly approved touching the hero for this pass)
