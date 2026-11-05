/**
 * Content Security Policy shared by the <meta> tag (any host) and public/_headers
 * (hosts that support custom headers, e.g. Cloudflare Pages or Netlify).
 * The only third-party origin is TradingView's widget host, and only inside iframes.
 */
import { WIDGET_HOST } from "./tradingview";

const directives: [string, string][] = [
  ["default-src", "'self'"],
  ["script-src", "'self'"],
  ["style-src", "'self'"],
  ["img-src", "'self' data:"],
  ["font-src", "'self'"],
  ["connect-src", "'self'"],
  ["frame-src", WIDGET_HOST],
  ["form-action", "'none'"],
  ["base-uri", "'none'"],
  ["object-src", "'none'"],
];

const join = (list: [string, string][]) => list.map(([k, v]) => `${k} ${v}`).join("; ");

export const CSP = {
  /** frame-ancestors is ignored in <meta>, so it only goes in the HTTP header. */
  meta: join(directives),
  header: join([...directives, ["frame-ancestors", "'none'"], ["upgrade-insecure-requests", ""]]).trim(),
};
