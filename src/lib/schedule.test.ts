import { describe, expect, it } from "vitest";
import {
  computeAlarms,
  formatTime,
  nowRounded,
  parseTimeInput,
  roundToQuarter,
} from "./schedule";

function dayAt(hh: number, mm = 0): Date {
  const d = new Date(2026, 8, 18);
  d.setHours(hh, mm, 0, 0);
  return d;
}

describe("computeAlarms", () => {
  it("09:00 → 12:00 / 15:00 / 18:00", () => {
    const [a, b, c] = computeAlarms(dayAt(9));
    expect(formatTime(a)).toBe("12:00");
    expect(formatTime(b)).toBe("15:00");
    expect(formatTime(c)).toBe("18:00");
  });

  it("10:00 → 13:00 / 16:00 / 19:00", () => {
    const [a, b, c] = computeAlarms(dayAt(10));
    expect(formatTime(a)).toBe("13:00");
    expect(formatTime(b)).toBe("16:00");
    expect(formatTime(c)).toBe("19:00");
  });

  it("rolls over midnight (22:00 → 01:00 next day)", () => {
    const [a, b, c] = computeAlarms(dayAt(22));
    expect(formatTime(a)).toBe("01:00");
    expect(formatTime(b)).toBe("04:00");
    expect(formatTime(c)).toBe("07:00");
    expect(a.getDate()).toBe(19); // next day
  });

  it("keeps minutes (09:30 → 12:30 / 15:30 / 18:30)", () => {
    const [a, b, c] = computeAlarms(dayAt(9, 30));
    expect(formatTime(a)).toBe("12:30");
    expect(formatTime(b)).toBe("15:30");
    expect(formatTime(c)).toBe("18:30");
  });
});

describe("parseTimeInput", () => {
  it("parses valid HH:MM", () => {
    const d = parseTimeInput("09:05", dayAt(0));
    expect(d && formatTime(d)).toBe("09:05");
  });

  it("rejects invalid input", () => {
    expect(parseTimeInput("abc")).toBeNull();
    expect(parseTimeInput("25:00")).toBeNull();
    expect(parseTimeInput("9:5")).toBeNull();
    expect(parseTimeInput("")).toBeNull();
  });
});

describe("nowRounded", () => {
  it("has zero seconds/millis", () => {
    const d = nowRounded();
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });
});

describe("roundToQuarter", () => {
  it("rounds down (09:07 → 09:00)", () => {
    expect(formatTime(roundToQuarter(dayAt(9, 7)))).toBe("09:00");
  });

  it("rounds up (09:08 → 09:15)", () => {
    expect(formatTime(roundToQuarter(dayAt(9, 8)))).toBe("09:15");
  });

  it("keeps exact quarters (09:30 → 09:30)", () => {
    expect(formatTime(roundToQuarter(dayAt(9, 30)))).toBe("09:30");
  });

  it("rolls the hour (09:53 → 10:00)", () => {
    expect(formatTime(roundToQuarter(dayAt(9, 53)))).toBe("10:00");
  });

  it("rolls midnight (23:53 → 00:00 next day)", () => {
    const d = roundToQuarter(dayAt(23, 53));
    expect(formatTime(d)).toBe("00:00");
    expect(d.getDate()).toBe(19);
  });
});
