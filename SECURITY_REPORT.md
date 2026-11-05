# Security report

**Date:** 2026-11-05 · **Branch:** `feat/news-portal` · **Scope:** full rebuild of the site, dependencies, CI and the Git history of the public repository.

**Verdict: 🟢 Approved.** No high or medium findings are open. Residual risks are low and documented below.

## Tool results

| Check | Result | Notes |
| --- | --- | --- |
| `npm test` (Vitest, 40 tests) | ✅ Pass | Widget URL allow-list and symbol validation, market data, exchange sessions, CSP/header parity, banned DOM APIs and secrets in source |
| `npm run check:dist` | ✅ Pass | 14 pages, 1 script: no inline scripts or styles, no event handlers, no forms, only sandboxed TradingView iframes, safe external links, no emails or key patterns, no source maps. A negative test confirmed it fails on injected code |
| `npm audit` | ✅ 0 vulnerabilities | |
| Install scripts | ✅ None | `npm query` found no `preinstall`/`install`/`postinstall` in the dependency tree; CI installs with `--ignore-scripts` |
| `gitleaks` (full history, all branches) | ✅ No leaks | After the history rewrite below |
| `scripts/scan_exposed_files.sh` | ✅ Pass | |
| Live check (Chrome, GitHub Pages) | ✅ Pass | Ticker, news, overview, heatmaps, chart and calendar load inside sandboxed iframes; no CSP violations |
| OWASP ZAP (DAST) | ⚪ Not verified | Low value for a static site with no inputs; recommended before adding any server feature |

## Findings in the previous version

| ID | Severity | File | Issue | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| T1 | High (privacy) | `src/pages/index.astro`, `registro.astro` | The maintainer's personal email address was hard-coded in client-side code and in the Git history of a public repository, as the FormSubmit destination | Forms removed; email replaced in **every commit** with `git filter-repo` and `main` force-pushed with the owner's approval | Fixed (see residual risk R1) |
| T2 | Medium | `registro.astro` | Sign-up form sent visitors' names, emails and plan to a third-party form service, with no consent record or privacy basis | Accounts and forms removed: the site now collects no personal data | Fixed |
| T3 | Medium | `src/scripts/tv.js` | TradingView loader scripts injected into the page with `innerHTML` and run on our origin, without SRI | Widgets rebuilt as cross-origin sandboxed iframes from an allow-listed URL builder | Fixed |
| T4 | Medium | `src/layouts/Base.astro` | No Content Security Policy or security headers; Google Fonts loaded from a third party | Strict CSP (meta + `_headers`), HSTS, framing protection, self-hosted fonts | Fixed |
| T5 | Low | `src/pages/login.astro` | Log-in page that did nothing and claimed "two-factor authentication and encryption" for accounts that didn't exist | Removed; copy no longer makes security or trading claims | Fixed |
| T6 | Low | `index.astro` | Marketing claims for a trading platform (0.14 ms execution, AI signals, paid plans) on a demo | Site repositioned as an information-only news portal with a clear disclaimer | Fixed |
| T7 | Low | `package.json` | Three.js (large dependency) only for a background effect; 8 Dependabot alerts on `main` from the old lockfile | Replaced by a 2D canvas; new lockfile with 0 known vulnerabilities | Fixed on merge |

## Controls in place

- [x] No secrets required; none in code or history
- [x] No third-party JavaScript on our origin; TradingView isolated in sandboxed cross-origin iframes
- [x] Widget types allow-listed, symbols validated, iframe URLs re-checked at build and runtime
- [x] CSP `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `frame-src` TradingView only, `form-action 'none'`, `object-src 'none'`, `base-uri 'none'`
- [x] `_headers`: HSTS, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, Referrer and Permissions policies
- [x] No forms, cookies, analytics or storage of personal data
- [x] External links `rel="noopener noreferrer"`
- [x] Accessibility: keyboard tabs, visible focus, titled iframes, `prefers-reduced-motion`
- [x] CI with `permissions: contents: read`, actions pinned by SHA, Dependabot

## Residual risks

| ID | Risk | Severity | Note |
| --- | --- | --- | --- |
| R1 | The old email may still be reachable through cached copies, forks or GitHub's stored pull-request refs (`refs/pull/1/head` from a closed Dependabot PR) | Low | Only GitHub Support can purge PR refs and cached views. The address should be treated as public: watch it for spam and phishing |
| R2 | GitHub Pages can't send custom headers, so `frame-ancestors` and `X-Frame-Options` don't apply there | Low | The site has no actions to hijack; use Cloudflare Pages or Netlify for full headers |
| R3 | TradingView may set its own cookies inside the iframes | Low | Disclosed in the privacy section; blocking third-party cookies doesn't break the site |
| R4 | Market data availability depends on TradingView's free widget licensing | Info | A test blocks symbols known to be unavailable |
