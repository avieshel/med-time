/** iOS Shortcuts handoff: builds the deep link that runs the one-time
 *  "Med Alarms" shortcut with the 3 alarm times as comma-separated input. */

export const SHORTCUT_NAME = "Med Alarms";
export const ALARM_LABEL = "Med";

export function buildShortcutUrl(times: [string, string, string]): string {
  const input = times.join(",");
  return (
    `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}` +
    `&input=${encodeURIComponent(input)}`
  );
}

/** True on iPhone / iPad / iPod (where the shortcuts:// scheme works). */
export function isIOS(nav: Navigator = navigator): boolean {
  return /iPad|iPhone|iPod/.test(nav.userAgent);
}
