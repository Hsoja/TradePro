import { describe, expect, it } from "vitest";
import { formatDuration, sessionStatus } from "../src/lib/sessions";

const nyse = { id: "nyse", city: "New York", exchange: "NYSE", tz: "America/New_York", open: "09:30", close: "16:00" };

describe("sessionStatus", () => {
  it("is open during regular hours on a weekday", () => {
    // Wednesday 2026-11-04 15:00 UTC = 10:00 in New York (EST)
    const s = sessionStatus(nyse, new Date("2026-11-04T15:00:00Z"));
    expect(s.open).toBe(true);
    expect(s.localTime).toBe("10:00");
    expect(s.minutesToChange).toBe(360);
  });

  it("is closed before the open and counts down to it", () => {
    const s = sessionStatus(nyse, new Date("2026-11-04T14:00:00Z")); // 09:00 NY
    expect(s.open).toBe(false);
    expect(s.minutesToChange).toBe(30);
  });

  it("skips the weekend", () => {
    const s = sessionStatus(nyse, new Date("2026-11-06T22:00:00Z")); // Friday 17:00 NY
    expect(s.open).toBe(false);
    // Monday 09:30 is 2 days + 16h30 away
    expect(s.minutesToChange).toBe(3 * 1440 + 570 - 1020);
  });

  it("closes exactly at the closing time", () => {
    expect(sessionStatus(nyse, new Date("2026-11-04T21:00:00Z")).open).toBe(false); // 16:00 NY
  });
});

describe("formatDuration", () => {
  it.each([
    [5, "5m"],
    [65, "1h 5m"],
    [1500, "1d 1h"],
  ])("%i minutes -> %s", (m, out) => expect(formatDuration(m)).toBe(out));
});
