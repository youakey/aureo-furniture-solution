# Security headers — Cloudflare configuration

The site is hosted on **GitHub Pages**, which does not let you set custom response
headers. Cloudflare already sits in front of `aureofur.com` for DNS/proxy, so that
is where the headers belong.

The pages already carry a `Content-Security-Policy` **meta tag**. A meta CSP covers
most directives but *cannot* express `frame-ancestors`, `Strict-Transport-Security`,
or `X-Content-Type-Options` — those must be real headers. The rules below add them.

## Setup (5 minutes, no code)

Cloudflare dashboard → **aureofur.com** → **Rules** → **Transform Rules** →
**Modify Response Header** → *Create rule*.

**Rule name:** `Security headers`
**If:** `Hostname equals aureofur.com` (or *All incoming requests*)
**Then — Set static:**

| Header | Value |
| --- | --- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()` |
| `Content-Security-Policy` | see the single line below |

```
default-src 'self'; base-uri 'none'; object-src 'none'; frame-src https://www.googletagmanager.com; frame-ancestors 'none'; script-src 'self' https://cdn.jsdelivr.net https://www.googletagmanager.com https://tagmanager.google.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://tagmanager.google.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://cdn.jsdelivr.net https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://www.google.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://ad.doubleclick.net; connect-src 'self' https://aureo-leads.zerocppscript.workers.dev https://cdn.jsdelivr.net https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://www.google.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://ad.doubleclick.net; form-action 'self'; upgrade-insecure-requests
```

Once the header version is live you can delete the `<meta http-equiv="Content-Security-Policy">`
tags from all public HTML files if desired. If both are present, browsers enforce
both policies: neither can loosen the other. Keep their source lists synchronized.
The header adds `frame-ancestors` to the shared meta policy.

> **Enable HSTS only after you are certain** every subdomain of `aureofur.com` is
> HTTPS-only. `preload` in particular is difficult to undo.

## What each source in the CSP is for

| Directive | Why it is there |
| --- | --- |
| `script-src … cdn.jsdelivr.net` | `intlTelInput.min.js` and the `utils.js` it loads on demand |
| `style-src … fonts.googleapis.com` | Google Fonts stylesheet (Inter + Playfair Display) |
| `style-src … cdn.jsdelivr.net` | `intlTelInput.css`, injected lazily by `script.js` |
| `style-src 'unsafe-inline'` | legacy `style="…"` attributes still present in the markup |
| `font-src fonts.gstatic.com` | the actual woff2 font files |
| `img-src … cdn.jsdelivr.net` | country-flag sprite used by intl-tel-input |
| `connect-src … workers.dev` | the lead form's `fetch()` to the Cloudflare Worker |

`script-src` deliberately has **no** `'unsafe-inline'`. There is no inline
JavaScript left in the project — JSON-LD blocks use `type="application/ld+json"`,
which browsers treat as data rather than script, so CSP does not block them.

### If you remove the last `style="…"` attributes

Dropping `'unsafe-inline'` from `style-src` is the last meaningful hardening step.
It requires moving every remaining inline `style` attribute in the four HTML files
into `styles.css` as a class.

## Lead form — current threat model

```
#leadForm → script.js sendToWorker() → POST https://aureo-leads.zerocppscript.workers.dev/lead → Telegram Bot API
```

The bot token and chat id live in **Cloudflare Worker secrets**, outside this
repository. Nothing secret is in the client bundle, which is the correct pattern
for a static site — do not move credentials into `config.js`.

**Protections in the browser (this repo):**

- native HTML5 constraint validation (`required`, `pattern`, `minlength`, `maxlength`, `type="email"`)
- a second JS validation pass with inline error messages
- an off-screen honeypot field (`#company`) — checked locally, never sent
- a minimum time-to-fill check (3 s) and a 30 s resubmit cooldown

**Protections that must live in the Worker (not in this repo):**

- rate limiting per IP — a determined attacker can call `/lead` directly and skip
  every browser-side guard above
- an `Origin` / `Referer` allowlist for `https://aureofur.com`
- a payload size cap and server-side field validation
- optionally Cloudflare Turnstile: add the widget to the form and verify the token
  server-side. Verifying it only in the browser provides no protection.

The browser-side guards stop commodity spam bots. They do not stop anyone who
reads `script.js`. Server-side rate limiting on the Worker is the real control.

## Google Tag Manager / Ads (2026-11-08)

Every public page, including `/thank-you.html`, loads `/analytics.js`, which
initializes the data layer with the standard `gtm.js` event before loading container
`GTM-WPVW74DV`. Do not add a second GTM or gtag bootstrap to individual pages.
The Google Ads conversion remains configured in GTM with the existing thank-you
page-view trigger; no duplicate conversion event is sent from the form handler.

The source lists above allow GTM, Preview Mode assets, GA4 and Google Ads
conversion/linker requests. The `googleads.g.doubleclick.net` script source is
required by the view-through conversion request observed in Tag Assistant.
No `unsafe-eval` or inline executable scripts are required by this bootstrap.
If a container uses Custom JavaScript variables, prefer GTM Custom Templates
rather than enabling `unsafe-eval` globally.

Reference: https://developers.google.com/tag-platform/security/guides/csp

To verify: open GTM Preview, submit a valid form, then confirm that the thank-you
page loads this container, the configured conversion tag fires once, and Tag
Assistant reports no CSP violations. Do not submit real conversion beacons from
automated tests; stub the Google endpoints.
