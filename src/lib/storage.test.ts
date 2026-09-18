import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendHistory,
  clearToday,
  dayKey,
  loadHistory,
  loadToday,
  saveToday,
  takeStaleToday,
  type TodayState,
} from "./storage";

// In-memory localStorage stub (vitest runs in node env by default).
const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

function stateFor(day: string): TodayState {  return {
    firstPillIso: `${day}T09:00:00`,
    alarmIsos: [
      `${day}T12:00:00`,
      `${day}T15:00:00`,
      `${day}T18:00:00`,
    ],
    day,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("loadToday / saveToday", () => {
  it("round-trips today's state", () => {
    const now = new Date(2026, 8, 18, 10, 0);
    saveToday(stateFor(dayKey(now)));
    expect(loadToday(now)).toEqual(stateFor("2026-09-18"));
  });

  it("returns null when nothing saved", () => {
    expect(loadToday(new Date(2026, 8, 18))).toBeNull();
  });

  it("returns null for a stale (past-day) state", () => {
    saveToday(stateFor("2026-09-17"));
    expect(loadToday(new Date(2026, 8, 18))).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem("medtime:today", "{broken");
    expect(loadToday(new Date(2026, 8, 18))).toBeNull();
  });

  it("clearToday removes state", () => {
    const now = new Date(2026, 8, 18, 10, 0);
    saveToday(stateFor(dayKey(now)));
    clearToday();
    expect(loadToday(now)).toBeNull();
  });
});

describe("takeStaleToday", () => {
  it("returns null and keeps a current-day state", () => {
    const now = new Date(2026, 8, 18, 10, 0);
    saveToday(stateFor(dayKey(now)));
    expect(takeStaleToday(now)).toBeNull();
    expect(loadToday(now)).toEqual(stateFor("2026-09-18"));
  });

  it("removes and returns a past-day state", () => {
    saveToday(stateFor("2026-09-17"));
    const stale = takeStaleToday(new Date(2026, 8, 18));
    expect(stale).toEqual(stateFor("2026-09-17"));
    expect(loadToday(new Date(2026, 8, 18))).toBeNull();
  });

  it("returns null when nothing stored", () => {
    expect(takeStaleToday(new Date(2026, 8, 18))).toBeNull();
  });
});

describe("history", () => {
  it("appends and loads entries, newest first", () => {
    appendHistory({
      day: "2026-09-17",
      firstPill: "09:00",
      alarms: ["12:00", "15:00", "18:00"],
    });
    appendHistory({
      day: "2026-09-18",
      firstPill: "10:00",
      alarms: ["13:00", "16:00", "19:00"],
    });
    const h = loadHistory();
    expect(h.map((e) => e.day)).toEqual(["2026-09-18", "2026-09-17"]);
  });

  it("replaces duplicate entries for the same day", () => {
    appendHistory({
      day: "2026-09-18",
      firstPill: "09:00",
      alarms: ["12:00", "15:00", "18:00"],
    });
    appendHistory({
      day: "2026-09-18",
      firstPill: "10:00",
      alarms: ["13:00", "16:00", "19:00"],
    });
    const h = loadHistory();
    expect(h).toHaveLength(1);
    expect(h[0].firstPill).toBe("10:00");
  });
});
