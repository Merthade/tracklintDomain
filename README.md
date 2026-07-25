# tracklint.dev

The marketing and waitlist page for [Tracklint](https://tracklint.dev), an
analytics instrumentation linter. Static HTML, no build step.

## Layout

| Path | What it is |
|---|---|
| `index.html` | the whole page: markup, CSS and JS inline |
| `_worker.js` | Cloudflare Pages advanced-mode worker. Handles `POST /api/waitlist`, passes everything else to the static assets |
| `img/` | screenshots (currently unused by the page) |
| `robots.txt`, `sitemap.xml` | crawling basics |

## Deploying (Cloudflare Pages)

Connect this repo to a Pages project, or drag the folder into the dashboard.
A root `_worker.js` works with both, which a `functions/` directory does not.

**One required step for signups to persist:** create a KV namespace, then bind it
to the Pages project as variable `WAITLIST` (Settings > Bindings). Without it the
form returns a clean "not available right now" rather than pretending to succeed.
Read the signups from the KV browser in the dashboard.

## Notes

- Analytics is cookieless on purpose (`persistence: memory`, `disable_cookie`),
  so no consent banner is needed. The `phc_` key in `index.html` is a public,
  write-only project token, safe to commit.
- Copy rules: no em dashes, no emoji, first person. The page describes the
  problem rather than listing features; feature detail gets added deliberately.
