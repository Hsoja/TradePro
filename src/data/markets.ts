import type { FeedMarket } from "../lib/tradingview";

export type Quote = { symbol: string; title: string };

export type Market = {
  slug: string;
  name: string;
  short: string;
  summary: string;
  watch: string;
  lead: Quote;
  symbols: Quote[];
  feed: FeedMarket;
  heatmap?: "stocks" | "crypto" | "forex";
  movers?: boolean;
};

export const MARKETS: Market[] = [
  {
    slug: "indices",
    name: "Global indices",
    short: "Indices",
    summary: "The headline benchmarks for the US, Europe and Asia, and the volatility gauge traders watch when sentiment turns.",
    watch: "Central bank decisions, earnings season and inflation data move the whole index at once.",
    lead: { symbol: "FOREXCOM:SPXUSD", title: "S&P 500" },
    symbols: [
      { symbol: "FOREXCOM:SPXUSD", title: "S&P 500" },
      { symbol: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
      { symbol: "FOREXCOM:DJI", title: "Dow Jones" },
      { symbol: "INDEX:DEU40", title: "DAX" },
      { symbol: "FOREXCOM:UKXGBP", title: "FTSE 100" },
      { symbol: "INDEX:NKY", title: "Nikkei 225" },
    ],
    feed: "index",
  },
  {
    slug: "stocks",
    name: "Stocks",
    short: "Stocks",
    summary: "The largest US companies by market value, where a single earnings report can move an entire sector.",
    watch: "Quarterly earnings, guidance and AI spending headlines drive the biggest single-stock moves.",
    lead: { symbol: "NASDAQ:NVDA", title: "NVIDIA" },
    symbols: [
      { symbol: "NASDAQ:NVDA", title: "NVIDIA" },
      { symbol: "NASDAQ:AAPL", title: "Apple" },
      { symbol: "NASDAQ:MSFT", title: "Microsoft" },
      { symbol: "NASDAQ:AMZN", title: "Amazon" },
      { symbol: "NASDAQ:GOOGL", title: "Alphabet" },
      { symbol: "NASDAQ:META", title: "Meta" },
      { symbol: "NASDAQ:TSLA", title: "Tesla" },
      { symbol: "NYSE:JPM", title: "JPMorgan" },
    ],
    feed: "stock",
    heatmap: "stocks",
    movers: true,
  },
  {
    slug: "futures",
    name: "Futures and 24-hour markets",
    short: "Futures",
    summary: "Contracts and around-the-clock index prices that show how markets will open before the opening bell.",
    watch: "Overnight trading reacts first to news from Asia and Europe and to surprise economic data. US exchange futures (CME) aren't licensed for free widgets, so the S&P 500, Nasdaq and Dow are shown as 24-hour CFDs that track them.",
    lead: { symbol: "OANDA:SPX500USD", title: "S&P 500 (24h)" },
    symbols: [
      { symbol: "OANDA:SPX500USD", title: "S&P 500 (24h)" },
      { symbol: "OANDA:NAS100USD", title: "Nasdaq 100 (24h)" },
      { symbol: "OANDA:US30USD", title: "Dow 30 (24h)" },
      { symbol: "EUREX:FDAX1!", title: "DAX futures" },
      { symbol: "OANDA:USB10YUSD", title: "US 10-year note" },
      { symbol: "OANDA:WTICOUSD", title: "WTI crude (24h)" },
    ],
    feed: "futures",
  },
  {
    slug: "crypto",
    name: "Crypto",
    short: "Crypto",
    summary: "Digital assets trade every hour of every day, so news hits prices here before any other market.",
    watch: "Regulation, ETF flows and large exchange events tend to move the whole sector together.",
    lead: { symbol: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    symbols: [
      { symbol: "BITSTAMP:BTCUSD", title: "Bitcoin" },
      { symbol: "BITSTAMP:ETHUSD", title: "Ethereum" },
      { symbol: "BINANCE:SOLUSDT", title: "Solana" },
      { symbol: "BINANCE:XRPUSDT", title: "XRP" },
      { symbol: "BINANCE:BNBUSDT", title: "BNB" },
      { symbol: "BINANCE:DOGEUSDT", title: "Dogecoin" },
    ],
    feed: "crypto",
    heatmap: "crypto",
  },
  {
    slug: "commodities",
    name: "Commodities",
    short: "Commodities",
    summary: "Energy, metals and crops: the natural resources that feed straight into inflation and company costs.",
    watch: "OPEC+ decisions, weather, inventories and the US dollar shape most commodity moves.",
    lead: { symbol: "OANDA:XAUUSD", title: "Gold" },
    symbols: [
      { symbol: "OANDA:XAUUSD", title: "Gold" },
      { symbol: "OANDA:XAGUSD", title: "Silver" },
      { symbol: "TVC:USOIL", title: "WTI crude" },
      { symbol: "TVC:UKOIL", title: "Brent crude" },
      { symbol: "OANDA:NATGASUSD", title: "Natural gas" },
      { symbol: "OANDA:XCUUSD", title: "Copper" },
      { symbol: "OANDA:WHEATUSD", title: "Wheat" },
      { symbol: "OANDA:CORNUSD", title: "Corn" },
    ],
    feed: "futures",
  },
  {
    slug: "forex",
    name: "Forex",
    short: "Forex",
    summary: "The world's most traded market, where interest-rate expectations decide which currencies gain.",
    watch: "Rate decisions, employment reports and inflation surprises move currency pairs within seconds.",
    lead: { symbol: "FX:EURUSD", title: "EUR/USD" },
    symbols: [
      { symbol: "FX:EURUSD", title: "EUR/USD" },
      { symbol: "FX:GBPUSD", title: "GBP/USD" },
      { symbol: "FX:USDJPY", title: "USD/JPY" },
      { symbol: "FX:USDCAD", title: "USD/CAD" },
      { symbol: "FX:AUDUSD", title: "AUD/USD" },
      { symbol: "FX:USDCHF", title: "USD/CHF" },
    ],
    feed: "forex",
    heatmap: "forex",
  },
];

/** Bond prices (not yields): when the price falls, the yield rises. */
export const BONDS: Quote[] = [
  { symbol: "OANDA:USB10YUSD", title: "US 10-year note" },
  { symbol: "OANDA:USB02YUSD", title: "US 2-year note" },
  { symbol: "OANDA:DE10YBEUR", title: "German 10-year Bund" },
];

export const TAPE: Quote[] = [
  { symbol: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { symbol: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
  { symbol: "FOREXCOM:DJI", title: "Dow" },
  { symbol: "EUREX:FDAX1!", title: "DAX futures" },
  { symbol: "BITSTAMP:BTCUSD", title: "Bitcoin" },
  { symbol: "BITSTAMP:ETHUSD", title: "Ethereum" },
  { symbol: "OANDA:XAUUSD", title: "Gold" },
  { symbol: "TVC:USOIL", title: "WTI" },
  { symbol: "FX:EURUSD", title: "EUR/USD" },
  { symbol: "FX:USDCAD", title: "USD/CAD" },
  { symbol: "OANDA:USB10YUSD", title: "US 10Y note" },
];

export function getMarket(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug);
}

/** Regular trading hours of the main exchanges (local time, Mon to Fri, holidays not included). */
export const SESSIONS = [
  { id: "nyse", city: "New York", exchange: "NYSE", tz: "America/New_York", open: "09:30", close: "16:00" },
  { id: "tsx", city: "Toronto", exchange: "TSX", tz: "America/Toronto", open: "09:30", close: "16:00" },
  { id: "lse", city: "London", exchange: "LSE", tz: "Europe/London", open: "08:00", close: "16:30" },
  { id: "xetra", city: "Frankfurt", exchange: "Xetra", tz: "Europe/Berlin", open: "09:00", close: "17:30" },
  { id: "tse", city: "Tokyo", exchange: "TSE", tz: "Asia/Tokyo", open: "09:00", close: "15:30" },
  { id: "hkex", city: "Hong Kong", exchange: "HKEX", tz: "Asia/Hong_Kong", open: "09:30", close: "16:00" },
] as const;
