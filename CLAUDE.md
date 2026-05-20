# Aureo Furniture Solution - SEO & Dev Guidelines

## Project Context
- **Business:** Custom furniture, kitchen cabinets, and closets.
- **Location:** Atlanta, GA (USA).
- **Core Goal:** Transform the site into an SEO-optimized lead generation tool for the Atlanta local market.

## Critical Rules
1. **Naming:** Always use "Aureo Furniture Solution" (Singular). Never "Solutions" (Plural).
2. **SEO Structure:** "One Service = One Page".
3. **Target Keywords:**
   - Kitchen Cabinets Atlanta
   - Closet Systems Atlanta / Custom Closets Atlanta
   - Cabinet Installation Atlanta
   - Custom Interior Solutions Atlanta

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
