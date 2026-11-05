/**
 * Page behaviour. Only DOM properties and attributes are changed: no innerHTML,
 * no eval, and iframe URLs are only ever taken from our own markup and re-checked.
 */
import { WIDGET_HOST } from "../lib/tradingview";
import { formatDuration, sessionStatus, type Session } from "../lib/sessions";
import { startTrendField } from "./trend-field";

const SAFE_PREFIX = `${WIDGET_HOST}/embed-widget/`;

function isSafeWidgetUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.startsWith(SAFE_PREFIX);
}

function loadIframe(frame: HTMLIFrameElement) {
  const pending = frame.dataset.src;
  if (isSafeWidgetUrl(pending) && !frame.getAttribute("src")) {
    frame.src = pending;
    frame.removeAttribute("data-src");
  }
}

function watchWidgetLoading() {
  document.querySelectorAll<HTMLElement>("[data-widget]").forEach((box) => {
    const frame = box.querySelector("iframe");
    if (!frame) return;
    box.classList.add("is-loading");
    frame.addEventListener("load", () => box.classList.remove("is-loading"), { once: true });
  });
}

function setupNav() {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

/** Accessible tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls] + [role=tabpanel] */
function setupTabs() {
  document.querySelectorAll<HTMLElement>("[data-tabs]").forEach((group) => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const select = (tab: HTMLButtonElement, focus = false) => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
        if (!panel) return;
        panel.hidden = !active;
        if (active) panel.querySelectorAll("iframe").forEach(loadIframe);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
        if (event.key in keys) {
          event.preventDefault();
          select(tabs[(index + keys[event.key] + tabs.length) % tabs.length], true);
        } else if (event.key === "Home") {
          event.preventDefault();
          select(tabs[0], true);
        } else if (event.key === "End") {
          event.preventDefault();
          select(tabs[tabs.length - 1], true);
        }
      });
    });
  });
}

/** Symbol chips that swap the chart in [data-chart-target]. */
function setupSymbolSwitcher() {
  document.querySelectorAll<HTMLElement>("[data-symbols]").forEach((group) => {
    const frame = document.getElementById(group.dataset.symbols ?? "")?.querySelector("iframe");
    const label = document.getElementById(group.dataset.label ?? "");
    if (!frame) return;
    group.querySelectorAll<HTMLButtonElement>("button[data-url]").forEach((button) => {
      button.addEventListener("click", () => {
        const url = button.dataset.url;
        if (!isSafeWidgetUrl(url)) return;
        group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        frame.parentElement?.classList.add("is-loading");
        frame.addEventListener("load", () => frame.parentElement?.classList.remove("is-loading"), { once: true });
        frame.src = url;
        frame.title = `${button.textContent?.trim() ?? "Symbol"} live chart`;
        if (label) label.textContent = button.dataset.name ?? "";
      });
    });
  });
}

/** Exchange session board: open/closed status, local time and countdown. */
function setupSessions() {
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-session]"));
  if (!rows.length) return;
  const update = () => {
    const now = new Date();
    let openCount = 0;
    rows.forEach((row) => {
      const session: Session = {
        id: row.dataset.session ?? "",
        city: "",
        exchange: "",
        tz: row.dataset.tz ?? "UTC",
        open: row.dataset.open ?? "09:30",
        close: row.dataset.close ?? "16:00",
      };
      const status = sessionStatus(session, now);
      if (status.open) openCount += 1;
      row.dataset.state = status.open ? "open" : "closed";
      const state = row.querySelector("[data-state-label]");
      const time = row.querySelector("[data-time]");
      const change = row.querySelector("[data-change]");
      if (state) state.textContent = status.open ? "Open" : "Closed";
      if (time) time.textContent = status.localTime;
      if (change) change.textContent = `${status.open ? "Closes in" : "Opens in"} ${formatDuration(status.minutesToChange)}`;
    });
    const summary = document.querySelector("[data-sessions-summary]");
    if (summary) summary.textContent = openCount === 0 ? "All major exchanges are closed" : `${openCount} of ${rows.length} exchanges open now`;
  };
  update();
  window.setInterval(update, 30_000);
}

function setupClock() {
  const clock = document.querySelector("[data-utc-clock]");
  if (!clock) return;
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  };
  tick();
  window.setInterval(tick, 1000);
}

function init() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-trend-field]");
  if (canvas) startTrendField(canvas);
  watchWidgetLoading();
  setupNav();
  setupTabs();
  setupSymbolSwitcher();
  setupSessions();
  setupClock();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
