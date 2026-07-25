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

## Deploying

Works on either host, because the waitlist has two sinks.

**GitHub Pages (current plan).** Repo is public, so Pages is free. Set the custom
domain in Settings > Pages, which uses the committed `CNAME`. Signups arrive as
PostHog `waitlist_submit` events carrying the address, the same pattern already
used for the Android waitlist. `_worker.js` is simply ignored here.

Apex DNS at the registrar (Host `@`, four A records):
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
plus AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
`2606:50c0:8003::153`. Domain verification wants a TXT record whose Host is
whatever GitHub shows you minus the domain, e.g. `_github-pages-challenge-merthade`.

**Cloudflare Pages (optional upgrade).** Connect the repo and `_worker.js` starts
answering `POST /api/waitlist`, so addresses also land in a KV namespace bound as
`WAITLIST` (Settings > Bindings), which dedupes and survives ad blockers. Nothing
in the page needs changing to move.

## Where signups land

1. **PostHog `waitlist_submit`** (works everywhere, primary). Ad blockers can stop
   it, so a blocked visitor is told the submit failed rather than shown a false
   success.
2. **KV via `_worker.js`** (Cloudflare only, best effort). A 404 here is expected
   on static hosting and is ignored.

## Notes

- Analytics is cookieless on purpose (`persistence: memory`, `disable_cookie`),
  so no consent banner is needed. The `phc_` key in `index.html` is a public,
  write-only project token, safe to commit.
- Copy rules: no em dashes, no emoji, first person. The page describes the
  problem rather than listing features; feature detail gets added deliberately.
