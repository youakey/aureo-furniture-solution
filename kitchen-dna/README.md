# Aureo Furniture Solution · Kitchen DNA

React/Vite advertising quiz for https://dna.aureofur.com.

## Preview

```sh
npm ci
npm run build
wrangler pages dev
```

Use `wrangler pages dev` to preview the page and the API together. A local service binding may require a local instance of the lead Worker. Use synthetic contact details for integration tests.

## Cloudflare Pages deployment

Use the Cloudflare account that owns `aureo-leads`. For a Git integration, select the `main` branch, set the root directory to `kitchen-dna`, use `npm run build` and set the output directory to `dist`. Vite copies `public/_worker.js` into the build for Pages to run.

The equivalent manual deployment uses `wrangler pages deploy` after building, with the project name and build output configured in `wrangler.jsonc`.

In the Pages project, add `dna.aureofur.com` under **Custom domains**. At the DNS provider for `aureofur.com`, create a CNAME named `dna` pointing to the Pages production hostname shown in the dashboard. After TLS activates, open the HTTPS address, submit a synthetic lead and check the existing Telegram destination.

## Lead delivery

The quiz posts to same-origin `/api/lead`. The Pages Worker validates the request and forwards `name`, `email`, `phone` and `message` to the existing `aureo-leads` service binding. The message includes campaign attribution and a summary of quiz answers. The quiz confirms delivery after an affirmative response from the lead Worker.

If the lead Worker enforces an origin allowlist for POST requests, add the production landing origin alongside the existing origins. The lead Worker owns the Telegram credentials and destination.
