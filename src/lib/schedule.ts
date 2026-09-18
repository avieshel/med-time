/** Pure time math for Med-Time. No UI, no storage, no side effects. */

export const INTERVAL_HOURS = 3;
export const ALARM_COUNT = 3;

/** First pill time +3h / +6h / +9h. Handles midnight rollover via Date. */
export function computeAlarms(firstPill: Date): [Date, Date, Date] {
  return [1, 2, 3].map(
    (n) => new Date(firstPill.getTime() + n * INTERVAL_HOURS * 3_600_000),
  ) as [Date, Date, Date];
}

/** Format as 24h "HH:MM" (e.g. "09:00", "15:30"). */
export function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Parse "HH:MM" (24h) onto the given base date (defaults to today).
 * Returns null for invalid input.
 */
export function parseTimeInput(input: string, base: Date = new Date()): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) return null;
  const d = new Date(base);
  d.setHours(hh, mm, 0, 0);
  return d;
}

/** "now" rounded down to the minute (so displayed times are clean). */
export function nowRounded(): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  return d;
}

/**
 * Round to the nearest 15 minutes (:00/:15/:30/:45). Used for defaults —
 * explicit user input is always kept exact. Handles hour/day rollover.
 */
export function roundToQuarter(d: Date): Date {
  const out = new Date(d);
  const mins = out.getMinutes();
  const snapped = Math.round(mins / 15) * 15;
  out.setMinutes(snapped, 0, 0);
  return out;
}

/**
 * Live preview for the opener screen: +3h/+6h/+9h, each snapped to the
 * nearest 15 minutes. (Alarms exactly 3h apart share minutes, so snapping
 * can never collapse two alarms onto the same time.)
 */
export function previewAlarms(firstPill: Date): [Date, Date, Date] {
  return computeAlarms(firstPill).map(roundToQuarter) as [Date, Date, Date];
}
