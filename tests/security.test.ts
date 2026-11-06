import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CSP } from "../src/lib/security";

const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("security configuration", () => {
  it("serves the same CSP in _headers as in the meta tag (plus header-only directives)", () => {
    expect(headers).toContain(`Content-Security-Policy: ${CSP.header}`);
    expect(CSP.header.startsWith(CSP.meta)).toBe(true);
  });

  it("never allows inline or eval'd code", () => {
    expect(CSP.header).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
    expect(CSP.header).toContain("frame-ancestors 'none'");
    expect(CSP.header).toContain("object-src 'none'");
  });

  it.each(["Strict-Transport-Security", "X-Content-Type-Options: nosniff", "X-Frame-Options: DENY", "Referrer-Policy", "Permissions-Policy"])(
    "sets %s",
    (header) => expect(headers).toContain(header),
  );

  it("keeps dangerous DOM APIs and secrets out of the source", () => {
    const source = files("src").filter((f) => /\.(ts|astro|css|mjs|js)$/.test(f));
    for (const file of source) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(|set:html/);
      expect(text, file).not.toMatch(/[A-Za-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.[a-z]+/i);
      expect(text, file).not.toMatch(/(api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{12,}/i);
      expect(text, file).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
    }
  });
});
