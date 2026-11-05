# Security model

TradePro is a public, static site that collects nothing from its visitors. Its main risks are third-party content, supply-chain changes and accidental exposure of the maintainer's own data. The latest audit is in [SECURITY_REPORT.md](../SECURITY_REPORT.md).

## Reporting a vulnerability

Please don't open a public issue. Use **Report a vulnerability** on the repository's Security tab to send a private report.

## Threat model (STRIDE)

| Asset | Threat | Control |
| --- | --- | --- |
| Page integrity | Third-party script or injected markup changes the page (Tampering) | No external scripts; TradingView isolated in cross-origin sandboxed iframes; CSP `script-src 'self'`; no `innerHTML` (checked in tests and in the build) |
| Visitors | Clickjacking, framing the site (Spoofing) | `frame-ancestors 'none'` and `X-Frame-Options: DENY` on hosts that support `public/_headers` |
| Visitors' privacy | Tracking or data collection (Information disclosure) | No forms, cookies, analytics or storage; fonts self-hosted; `Referrer-Policy: strict-origin-when-cross-origin` |
| Maintainer's data | Personal email, keys or tokens in the public repo (Information disclosure) | No secrets needed; Gitleaks on full history; build scan for emails and key patterns; `.gitignore` and `scan_exposed_files.sh` |
| Widget URLs | A crafted symbol or widget name breaks out of the URL (Tampering) | Allow-listed widget types, `EXCHANGE:TICKER` regex, config only in the URL hash, URL prefix re-checked at build and at runtime |
| Build pipeline | Malicious dependency or workflow change (Elevation of privilege) | Two runtime dependencies, no install scripts, `npm ci --ignore-scripts`, `npm audit`, actions pinned by SHA, `permissions: contents: read`, Dependabot |
| Availability | Hosting abuse | Static files on a CDN (GitHub Pages, Cloudflare or Netlify) |

**Trust boundary:** our origin ↔ `www.tradingview-widget.com`. Everything inside the iframes is TradingView's responsibility and can't reach our DOM.

## Controls and where they live

- **CSP and headers:** `src/lib/security.ts` (meta tag) and `public/_headers` (HTTP headers). A test keeps them identical.
- **Widget allow-list and validation:** `src/lib/tradingview.ts`, `src/components/TvWidget.astro`.
- **Runtime DOM safety:** `src/scripts/app.ts` (no HTML injection, URL prefix check).
- **Build checks:** `scripts/check-dist.mjs` fails on inline scripts or styles, event-handler attributes, `javascript:` URLs, forms, unexpected iframes or links, `target="_blank"` without `rel="noopener noreferrer"`, dangerous DOM APIs, personal emails, key patterns and source maps.
- **Repository hygiene:** `scripts/scan_exposed_files.sh`, Gitleaks in `.github/workflows/security.yml`.

## Sandbox flags

`allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox`

- `allow-scripts` and `allow-same-origin` let the widget run and use its own storage. Because the iframe is on a different origin, `allow-same-origin` gives it no access to TradePro.
- `allow-popups*` let headlines and "open on TradingView" links open in a new tab.
- Not granted: top-level navigation, forms, modals, downloads, pointer lock.

## Hosting notes

GitHub Pages doesn't support custom headers, so on Pages the CSP comes only from the `<meta>` tag (which can't express `frame-ancestors`) and HSTS comes from `github.io` itself. For full header coverage, deploy to Cloudflare Pages or Netlify, which read `public/_headers`. See [DEPLOYMENT.md](DEPLOYMENT.md).

## If something goes wrong

1. **Contain:** revert the offending commit on `main`; Pages redeploys automatically.
2. **Secrets:** if anything sensitive is ever committed, rotate it first, then remove it from history (with the owner's approval) and record it in `SECURITY_REPORT.md`.
3. **Fix and prove:** add a test or build check that reproduces the problem.
