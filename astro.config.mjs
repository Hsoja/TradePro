// @ts-check
import { defineConfig } from "astro/config";

// BASE_PATH lets the site live under a sub-path (e.g. /TradePro/ on GitHub Pages).
const base = process.env.BASE_PATH || "/";
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  build: {
    // Keep CSS and JS in external files so the CSP needs no 'unsafe-inline'.
    inlineStylesheets: "never",
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
