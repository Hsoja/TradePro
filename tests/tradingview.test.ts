import { describe, expect, it } from "vitest";
import {
  IFRAME_SANDBOX,
  WIDGET_HOST,
  advancedChart,
  economicCalendar,
  isSymbol,
  marketOverview,
  newsTimeline,
  tickerTape,
  widgetUrl,
} from "../src/lib/tradingview";

const decode = (url: string) => JSON.parse(decodeURIComponent(url.split("#")[1]));

describe("widgetUrl", () => {
  it("always points at TradingView's widget host", () => {
    const url = widgetUrl("timeline", { feedMode: "all_symbols" });
    expect(url.startsWith(`${WIDGET_HOST}/embed-widget/timeline/?locale=en#`)).toBe(true);
    expect(new URL(url).protocol).toBe("https:");
  });

  it("rejects widgets that aren't on the allow-list", () => {
    // @ts-expect-error testing a runtime guard
    expect(() => widgetUrl("../../evil", {})).toThrow(/Unknown TradingView widget/);
  });

  it("rejects malformed locales", () => {
    expect(() => widgetUrl("timeline", {}, "en&x=1")).toThrow(/Invalid locale/);
  });

  it.each(["AAPL", "nasdaq:aapl", "NASDAQ:AAPL<script>", "NASDAQ:", ":AAPL", "A:B C", "X".repeat(30) + ":Y"])(
    "rejects the malformed symbol %s",
    (symbol) => {
      expect(() => advancedChart(symbol)).toThrow(/Invalid symbol/);
    },
  );

  it.each(["NASDAQ:AAPL", "CME_MINI:ES1!", "BITSTAMP:BTCUSD", "TVC:US10Y", "FOREXCOM:SPXUSD"])("accepts %s", (symbol) => {
    expect(isSymbol(symbol)).toBe(true);
  });

  it("checks symbols nested anywhere in the config", () => {
    expect(() => marketOverview([{ title: "x", symbols: [{ symbol: "bad symbol", title: "x" }] }])).toThrow();
    expect(() => tickerTape([{ symbol: "javascript:alert(1)", title: "x" }])).toThrow();
  });

  it("encodes the config in the hash so it is never sent to a server", () => {
    const url = advancedChart("NASDAQ:AAPL");
    const { search, hash } = new URL(url);
    expect(search).toBe("?locale=en");
    expect(decode(url)).toMatchObject({ symbol: "NASDAQ:AAPL", width: "100%", height: "100%" });
    expect(hash.length).toBeGreaterThan(10);
  });

  it("builds the top-stories news feed", () => {
    expect(decode(newsTimeline())).toMatchObject({ feedMode: "all_symbols", displayMode: "regular" });
    expect(decode(newsTimeline("compact"))).toMatchObject({ displayMode: "compact" });
  });

  it("filters the calendar to medium and high impact events", () => {
    expect(decode(economicCalendar())).toMatchObject({ importanceFilter: "0,1" });
  });

  it("never lets the sandbox include top-navigation or forms", () => {
    expect(IFRAME_SANDBOX).not.toMatch(/allow-top-navigation|allow-forms|allow-modals/);
  });
});
