import { describe, expect, it } from "vitest";
import { BONDS, MARKETS, SESSIONS, TAPE, getMarket } from "../src/data/markets";
import { isSymbol } from "../src/lib/tradingview";

describe("market data", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = MARKETS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z-]+$/));
  });

  it("only uses well-formed symbols", () => {
    const all = [...MARKETS.flatMap((m) => [m.lead, ...m.symbols]), ...BONDS, ...TAPE];
    all.forEach((q) => expect(isSymbol(q.symbol), q.symbol).toBe(true));
  });

  it("covers every asset class the site promises", () => {
    ["indices", "stocks", "futures", "crypto", "commodities", "forex"].forEach((slug) => expect(getMarket(slug)).toBeDefined());
  });

  it("uses valid IANA time zones for exchanges", () => {
    SESSIONS.forEach((s) => expect(() => new Intl.DateTimeFormat("en", { timeZone: s.tz })).not.toThrow());
  });
});
