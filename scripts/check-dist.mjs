#!/usr/bin/env node
// Static security check of the production build (run after `npm run build`).
// Fails if the output contains inline code, unexpected third parties, secrets or personal data.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
const WIDGET_PREFIX = "https://www.tradingview-widget.com/embed-widget/";
const ALLOWED_LINK_HOSTS = new Set(["www.tradingview.com", "github.com"]);
const problems = [];

if (!existsSync(DIST)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const all = walk(DIST);
const html = all.filter((f) => f.endsWith(".html"));
const js = all.filter((f) => f.endsWith(".js"));
const text = all.filter((f) => /\.(html|js|css|txt|svg|xml|json)$/.test(f) || f.endsWith("_headers"));
const fail = (file, msg) => problems.push(`${relative(DIST, file)}: ${msg}`);

for (const file of html) {
  const page = readFileSync(file, "utf8");

  for (const [, attrs, body] of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = /\bsrc="([^"]+)"/.exec(attrs)?.[1];
    if (!src) fail(file, "inline <script> found");
    else if (/^https?:/i.test(src) || src.startsWith("//")) fail(file, `external script ${src}`);
    if (body.trim()) fail(file, "script with inline body");
  }
  if (/<style\b/i.test(page)) fail(file, "inline <style> found");
  if (/\sstyle="/i.test(page)) fail(file, "inline style attribute found");
  if (/\son[a-z]+\s*=/i.test(page)) fail(file, "inline event handler found");
  if (/javascript:/i.test(page)) fail(file, "javascript: URL found");
  if (/<form\b/i.test(page)) fail(file, "form found (the site collects no data)");
  if (!/<meta http-equiv="Content-Security-Policy"/.test(page)) fail(file, "missing CSP meta tag");

  for (const [tag] of page.matchAll(/<iframe\b[^>]*>/gi)) {
    const url = (/\b(?:data-)?src="([^"]+)"/.exec(tag)?.[1] ?? "").replace(/&amp;/g, "&");
    if (!url.startsWith(WIDGET_PREFIX)) fail(file, `iframe to unexpected URL ${url.slice(0, 80)}`);
    if (!/\bsandbox="/.test(tag)) fail(file, "iframe without sandbox");
    if (/allow-top-navigation|allow-forms/.test(tag)) fail(file, "iframe sandbox too permissive");
    if (!/\btitle="[^"]+"/.test(tag)) fail(file, "iframe without title");
  }

  for (const [, url] of page.matchAll(/<a\b[^>]*href="(https?:[^"]+)"[^>]*>/gi)) {
    const host = new URL(url.replace(/&amp;/g, "&")).host;
    if (!ALLOWED_LINK_HOSTS.has(host)) fail(file, `unexpected external link ${host}`);
  }
  for (const [tag] of page.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer|rel="[^"]*noreferrer[^"]*noopener/.test(tag)) fail(file, "target=_blank without rel=noopener noreferrer");
  }
}

for (const file of js) {
  const code = readFileSync(file, "utf8");
  if (/\.innerHTML\s*=|insertAdjacentHTML|document\.write\(|\beval\(|new Function\(/.test(code)) fail(file, "dangerous DOM API in bundle");
  if (/https?:\/\/(?!www\.tradingview-widget\.com)[a-z0-9.-]+\.[a-z]{2,}/i.test(code.replace(/http:\/\/www\.w3\.org\/[^"']*/g, ""))) {
    fail(file, "bundle references an unexpected external URL");
  }
}

for (const file of text) {
  const body = readFileSync(file, "utf8");
  if (/[A-Za-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|icloud)\.[a-z]{2,}/i.test(body)) fail(file, "personal email address");
  if (/(sk|pk)_(live|test)_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|AIza[0-9A-Za-z_-]{30,}/.test(body)) fail(file, "possible secret");
}

if (!existsSync(join(DIST, "_headers"))) problems.push("_headers missing from dist");
if (all.some((f) => /\.map$/.test(f))) problems.push("source maps shipped in dist");

if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s) in the build:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK: ${html.length} pages and ${js.length} scripts passed the static security check.`);
