# Deployment

`npm run build` produces a fully static site in `dist/`. Any static host works; these are the three tested setups.

## GitHub Pages (current)

The workflow `.github/workflows/deploy-pages.yml` runs on every push to `main`: it installs with `npm ci --ignore-scripts`, runs the tests, builds with `BASE_PATH=/TradePro/`, runs the build security check and publishes `dist/`.

One-time setup: **Settings → Pages → Source: GitHub Actions**.

Live URL: https://hsoja.github.io/TradePro/

Limitation: Pages ignores `public/_headers`, so `frame-ancestors`, `X-Frame-Options` and the other HTTP-only headers aren't sent. The CSP still applies through the `<meta>` tag.

## Cloudflare Pages or Netlify (full security headers)

| Setting | Value |
| --- | --- |
| Build command | `npm ci --ignore-scripts && npm run build` |
| Output directory | `dist` |
| Node version | `22` (from `.nvmrc`) |
| Environment variables | none needed (leave `BASE_PATH` unset to serve from the domain root) |

Both hosts read `dist/_headers` and send the full policy, including `frame-ancestors 'none'`, HSTS and `X-Frame-Options`.

## Checks after deploying

- [ ] The home page shows the ticker, top stories and market snapshot.
- [ ] Browser devtools show no Content Security Policy violations in the console.
- [ ] Response headers include `Content-Security-Policy` (Cloudflare/Netlify) or the page has the CSP `<meta>` tag (Pages).
- [ ] `/.git/config` and `/.env` return 404.
