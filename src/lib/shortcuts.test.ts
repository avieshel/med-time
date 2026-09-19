import { describe, expect, it } from "vitest";
import {
  ALARM_LABEL_PREFIX,
  ALARM_LABELS,
  buildClearShortcutUrl,
  buildShortcutUrl,
  CLEAR_SHORTCUT_NAME,
  SHORTCUT_NAME,
} from "./shortcuts";

describe("buildShortcutUrl", () => {
  it("builds the exact shortcuts:// URL with encoded input", () => {
    expect(buildShortcutUrl(["12:00", "15:00", "18:00"])).toBe(
      "shortcuts://run-shortcut?name=Med%20Alarms&input=text&text=12%3A00%2C15%3A00%2C18%3A00",
    );
  });

  it("uses the agreed shortcut name", () => {
    expect(SHORTCUT_NAME).toBe("Med Alarms");
  });
});

describe("alarm labels", () => {
  it("defines exactly 3 slot labels sharing the delete-scope prefix", () => {
    expect(ALARM_LABELS).toHaveLength(3);
    for (const label of ALARM_LABELS) {
      expect(label.startsWith(ALARM_LABEL_PREFIX)).toBe(true);
    }
    expect(new Set(ALARM_LABELS).size).toBe(3); // unique per slot
  });
});

describe("buildClearShortcutUrl", () => {
  it("opens the deleter shortcut with no input", () => {
    expect(CLEAR_SHORTCUT_NAME).toBe("Clear Med Alarms");
    expect(buildClearShortcutUrl()).toBe(
      "shortcuts://run-shortcut?name=Clear%20Med%20Alarms",
    );
  });
});
