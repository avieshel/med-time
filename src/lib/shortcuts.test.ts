import { describe, expect, it } from "vitest";
import { buildShortcutUrl, SHORTCUT_NAME } from "./shortcuts";

describe("buildShortcutUrl", () => {
  it("builds the exact shortcuts:// URL with encoded input", () => {
    expect(buildShortcutUrl(["12:00", "15:00", "18:00"])).toBe(
      "shortcuts://run-shortcut?name=Med%20Alarms&input=12%3A00%2C15%3A00%2C18%3A00",
    );
  });

  it("uses the agreed shortcut name", () => {
    expect(SHORTCUT_NAME).toBe("Med Alarms");
  });
});
