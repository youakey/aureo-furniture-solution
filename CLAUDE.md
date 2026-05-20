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
