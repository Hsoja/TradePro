/** Pure helpers for exchange trading sessions (regular hours, weekdays only). */

export type Session = {
  id: string;
  city: string;
  exchange: string;
  tz: string;
  open: string; // HH:MM local
  close: string; // HH:MM local
};

export type SessionStatus = {
  open: boolean;
  localTime: string; // HH:MM in the exchange's time zone
  minutesToChange: number; // until it opens or closes
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function localParts(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: WEEKDAYS.indexOf(get("weekday")), hour: Number(get("hour")), minute: Number(get("minute")) };
}

export function sessionStatus(session: Session, now: Date = new Date()): SessionStatus {
  const { weekday, hour, minute } = localParts(now, session.tz);
  const current = hour * 60 + minute;
  const open = toMinutes(session.open);
  const close = toMinutes(session.close);
  const isWeekday = weekday >= 1 && weekday <= 5;
  const isOpen = isWeekday && current >= open && current < close;

  let minutesToChange: number;
  if (isOpen) {
    minutesToChange = close - current;
  } else {
    // Days until the next weekday opening.
    let days = 0;
    let day = weekday;
    if (isWeekday && current < open) days = 0;
    else {
      do {
        days += 1;
        day = (day + 1) % 7;
      } while (day === 0 || day === 6);
    }
    minutesToChange = days * 1440 + open - current;
  }

  const localTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { open: isOpen, localTime, minutesToChange };
}

export function formatDuration(minutes: number): string {
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
