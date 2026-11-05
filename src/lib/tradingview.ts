/**
 * Builds URLs for TradingView's public embed widgets.
 *
 * Widgets are embedded as cross-origin iframes instead of loading TradingView's
 * loader script into our page, so no third-party JavaScript ever runs on our origin.
 * Only allow-listed widget types and well-formed symbols are accepted.
 */

export const WIDGET_HOST = "https://www.tradingview-widget.com";

export const WIDGETS = [
  "advanced-chart",
  "crypto-coins-heatmap",
  "events",
  "forex-cross-rates",
  "hotlists",
  "market-overview",
  "market-quotes",
  "mini-symbol-overview",
  "stock-heatmap",
  "ticker-tape",
  "timeline",
] as const;

export type WidgetId = (typeof WIDGETS)[number];
export type WidgetConfig = Record<string, unknown>;

/** EXCHANGE:TICKER, e.g. NASDAQ:AAPL, CME_MINI:ES1!, BITSTAMP:BTCUSD */
export const SYMBOL_RE = /^[A-Z0-9_]{1,20}:[A-Z0-9._!]{1,20}$/;

/** Sandbox for widget iframes. They are cross-origin, so allow-same-origin only lets
 * TradingView use its own storage; it gives no access to our page. Popups let news
 * links open on tradingview.com. */
export const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

export const BRAND = {
  colorTheme: "dark",
  isTransparent: true,
} as const;

export function isSymbol(value: unknown): value is string {
  return typeof value === "string" && SYMBOL_RE.test(value);
}

function collectSymbols(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => collectSymbols(v, found));
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if ((key === "symbol" || key === "proName" || key === "s") && typeof v === "string") found.push(v);
      else collectSymbols(v, found);
    }
  }
  return found;
}

export function widgetUrl(widget: WidgetId, config: WidgetConfig, locale = "en"): string {
  if (!(WIDGETS as readonly string[]).includes(widget)) {
    throw new Error(`Unknown TradingView widget: ${widget}`);
  }
  if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  const bad = collectSymbols(config).filter((s) => !isSymbol(s));
  if (bad.length) {
    throw new Error(`Invalid symbol(s): ${bad.join(", ")}`);
  }
  const settings = { width: "100%", height: "100%", ...config };
  const hash = encodeURIComponent(JSON.stringify(settings));
  return `${WIDGET_HOST}/embed-widget/${widget}/?locale=${locale}#${hash}`;
}

// ---------------------------------------------------------------- widget presets

export const tickerTape = (symbols: { symbol: string; title: string }[]) =>
  widgetUrl("ticker-tape", {
    ...BRAND,
    symbols: symbols.map((s) => ({ proName: s.symbol, title: s.title })),
    showSymbolLogo: true,
    displayMode: "adaptive",
  });

export const advancedChart = (symbol: string, interval = "D") =>
  widgetUrl("advanced-chart", {
    symbol,
    interval,
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    backgroundColor: "rgba(12, 14, 28, 1)",
    gridColor: "rgba(148, 160, 255, 0.06)",
    allow_symbol_change: true,
    hide_side_toolbar: false,
    save_image: false,
    calendar: false,
    support_host: "https://www.tradingview.com",
  });

export type FeedMarket = "stock" | "crypto" | "forex" | "index" | "futures" | "cfd";

export const newsTimeline = (market?: FeedMarket) =>
  widgetUrl("timeline", {
    ...BRAND,
    displayMode: "regular",
    ...(market ? { feedMode: "market", market } : { feedMode: "all_symbols" }),
  });

export const economicCalendar = () =>
  widgetUrl("events", {
    ...BRAND,
    importanceFilter: "0,1",
    countryFilter: "us,ca,eu,gb,cn,jp,de",
  });

export const marketQuotes = (groups: { name: string; symbols: { symbol: string; title: string }[] }[]) =>
  widgetUrl("market-quotes", {
    ...BRAND,
    showSymbolLogo: true,
    symbolsGroups: groups.map((g) => ({
      name: g.name,
      symbols: g.symbols.map((s) => ({ name: s.symbol, displayName: s.title })),
    })),
  });

export const marketOverview = (tabs: { title: string; symbols: { symbol: string; title: string }[] }[]) =>
  widgetUrl("market-overview", {
    ...BRAND,
    dateRange: "1D",
    showChart: true,
    showSymbolLogo: true,
    showFloatingTooltip: true,
    plotLineColorGrowing: "rgba(43, 217, 160, 1)",
    plotLineColorFalling: "rgba(255, 92, 122, 1)",
    gridLineColor: "rgba(148, 160, 255, 0)",
    scaleFontColor: "rgba(140, 147, 181, 1)",
    belowLineFillColorGrowing: "rgba(43, 217, 160, 0.12)",
    belowLineFillColorFalling: "rgba(255, 92, 122, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(43, 217, 160, 0)",
    belowLineFillColorFallingBottom: "rgba(255, 92, 122, 0)",
    symbolActiveColor: "rgba(123, 108, 255, 0.12)",
    tabs: tabs.map((t) => ({
      title: t.title,
      symbols: t.symbols.map((s) => ({ s: s.symbol, d: s.title })),
    })),
  });

export const stockHeatmap = (dataSource = "SPX500") =>
  widgetUrl("stock-heatmap", {
    colorTheme: "dark",
    isTransparent: true,
    dataSource,
    blockSize: "market_cap_basic",
    blockColor: "change",
    grouping: "sector",
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
  });

export const cryptoHeatmap = () =>
  widgetUrl("crypto-coins-heatmap", {
    colorTheme: "dark",
    isTransparent: true,
    dataSource: "Crypto",
    blockSize: "market_cap_calc",
    blockColor: "24h_close_change|5",
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
  });

export const forexCrossRates = () =>
  widgetUrl("forex-cross-rates", {
    ...BRAND,
    currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "CNY"],
  });

export const topMovers = (exchange = "US") =>
  widgetUrl("hotlists", {
    ...BRAND,
    exchange,
    dateRange: "1D",
    showChart: true,
    showSymbolLogo: true,
    showFloatingTooltip: false,
    plotLineColorGrowing: "rgba(43, 217, 160, 1)",
    plotLineColorFalling: "rgba(255, 92, 122, 1)",
    gridLineColor: "rgba(148, 160, 255, 0)",
    scaleFontColor: "rgba(140, 147, 181, 1)",
    symbolActiveColor: "rgba(123, 108, 255, 0.12)",
  });
