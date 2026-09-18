/** localStorage state for Med-Time. Keys namespaced with `medtime:`. */

const TODAY_KEY = "medtime:today";
const HISTORY_KEY = "medtime:history";

/** Today's schedule, times stored as ISO strings. */
export interface TodayState {
  /** ISO date string of first pill, e.g. "2026-09-18T09:00:00". */
  firstPillIso: string;
  /** 3 alarm times as ISO strings (may include per-alarm edits). */
  alarmIsos: [string, string, string];
  /** YYYY-MM-DD of the day this state belongs to. */
  day: string;
  /** True once the user tapped "Set alarms" for this exact plan. */
  alarmsSent?: boolean;
}

export interface HistoryEntry {
  day: string;
  firstPill: string; // "HH:MM"
  alarms: [string, string, string]; // "HH:MM" ×3
}

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode / quota — app still works for the session.
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Load today's state; returns null if none or if it belongs to a past day. */
export function loadToday(now: Date = new Date()): TodayState | null {
  const raw = safeGet(TODAY_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as TodayState;
    if (state.day !== dayKey(now)) return null; // stale — new day
    if (!state.firstPillIso || state.alarmIsos?.length !== 3) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveToday(state: TodayState): void {
  safeSet(TODAY_KEY, JSON.stringify(state));
}

export function clearToday(): void {
  safeRemove(TODAY_KEY);
}

/**
 * Remove and return the stored plan if it belongs to a past day, so the
 * app can archive it to history instead of silently dropping it.
 * Returns null when the stored plan is for today (or when none exists).
 */
export function takeStaleToday(now: Date = new Date()): TodayState | null {
  const raw = safeGet(TODAY_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as TodayState;
    if (!state.firstPillIso || state.alarmIsos?.length !== 3) {
      safeRemove(TODAY_KEY); // corrupt — drop it
      return null;
    }
    if (state.day === dayKey(now)) return null; // current — leave it
    safeRemove(TODAY_KEY);
    return state;
  } catch {
    safeRemove(TODAY_KEY);
    return null;
  }
}

export function loadHistory(): HistoryEntry[] {
  const raw = safeGet(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Append entry (skips duplicates for the same day), keeps last 30. */
export function appendHistory(entry: HistoryEntry): void {
  const history = loadHistory().filter((h) => h.day !== entry.day);
  history.unshift(entry);
  safeSet(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}
