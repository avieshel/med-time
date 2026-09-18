/** iOS Shortcuts handoff: builds the deep link that runs the one-time
 *  "Med Alarms" shortcut with the 3 alarm times as comma-separated input.
 *
 *  Lifecycle contract (enforced inside the Shortcut, NOT by this app —
 *  the PWA cannot read the Clock app at all):
 *  every run deletes ALL alarms whose label contains ALARM_LABEL_PREFIX,
 *  then creates one alarm per slot with the matching ALARM_LABELS entry
 *  (via the Repeat Index). Steady state is always exactly these 3 alarms.
 *  Labels are sequence-based (1/2/3), not time-of-day — the times shift
 *  with wake-up time, so a "Noon" label would lie on late days.
 */

export const SHORTCUT_NAME = "Med Alarms";
export const ALARM_LABEL_PREFIX = "Med-Time";
export const ALARM_LABELS = [
  "Med-Time 1",
  "Med-Time 2",
  "Med-Time 3",
] as const;

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
