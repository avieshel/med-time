# Med-Time

Med-Time helps Mom take her medicine on time. She takes the first pill when
she wakes up (often around 09:00), then needs the next doses every 3 hours
(12:00, 15:00, 18:00). On late days the first pill shifts (e.g. 10:00) and
all following alarms shift with it — re-setting them by hand in the Clock
app is fiddly, so this app does the math.

How it works: Mom opens the app, sets the first-pill time, sees the 3 alarm
times, and taps **Set alarms**. The app hands the times to a one-time iOS
Shortcut (built once, below), which deletes the previous Med-Time alarms and
creates 3 real Clock alarms labeled `Med-Time 1`, `Med-Time 2`, `Med-Time 3`.
**Clear** runs a second tiny shortcut that deletes all Med-Time alarms and
resets the app. iOS gives web apps no way to touch alarms directly — the
Shortcuts are the bridge. Live at https://avieshel.github.io/med-time/.

## Put it on her iPhone

1. Open the live URL above in Safari (iOS 16.4+).
2. Share → **Add to Home Screen** → Add.
3. Open the Med-Time icon from the home screen.

## Build the `Med Alarms` shortcut (once, on her iPhone)

One shortcut does the whole job, top to bottom: **wipe old, read the new
times, create 3 alarms.** (The app can only hand off once per tap, so all
three phases must live in this one shortcut. Calling a "create one" shortcut
three times is not reliable: taps 2 and 3 die when the app switches away.)

The shortcut name must be exactly `Med Alarms`. Add actions with `+`/search.

**0. Allow deletion (do this first).** Settings → Apps → Shortcuts →
Advanced → **Allow Deleting Without Confirmation** ON. (Older iOS: Settings
→ Shortcuts → Advanced.) Without this, step 2 silently does nothing.

**1. Name it.** Shortcuts → `+` → tap the title → Rename → `Med Alarms`.

**2. Wipe yesterday's alarms.**
- Add **Find Alarms**. It searches Clock on its own — wire nothing. Tap
  **Add Filter**, set `Label` `contains` `Med-Time`.
  PASS: you see "Find Alarms where Label contains Med-Time".
- Add **Delete Alarms** directly below. It auto-takes the found alarms —
  touch nothing.
  PASS: two stacked actions, no red warnings.

**3. Read the 3 times the app sends (e.g. `12:00,15:00,18:00`).**
- Add **Split Text**. Tap the blue `Text` field — a row of variables pops up
  above the keyboard — tap **Shortcut Input**. Set the separator to
  **Custom** and type `,`.
  PASS: you see "Split Shortcut Input by Custom Separator ','".

**4. Create alarm 1.**
- Add **Get Item from List**. Tap `List` — variables row — tap **Split
  Text**. Set it to **Item at Index** → `1`.
  PASS: you see "Get Item at Index 1 from Split Text".
- Add **Create Alarm**. Leave **Time** alone — it already holds the item
  from the line above. Tap **Label**, type `Med-Time 1`. Leave **Repeat**
  at Never, switch ON. Tap `>` on the action, turn off **Show When Run**.
  PASS: a Create Alarm with your label, switch on.

**5. Alarm 2.** Repeat step 4 exactly: Index `2`, label `Med-Time 2`.

**6. Alarm 3.** Repeat step 4 exactly: Index `3`, label `Med-Time 3`.

**7. Permissions.** With any alarm on the phone, press the play button once.
Choose **Always Allow** for deleting, **Allow** for Clock access. Done.

If something misbehaves:
- *Delete does nothing* → redo step 0, then step 7's Always Allow.
- *Alarm created at a wrong time, or the Time field is red* → insert **Get
  Date from Input** between Get Item and Create Alarm, and set Time to its
  result.
- *The app opens the shortcut but nothing happens* → the name must be
  exactly `Med Alarms`; retest with the Safari URL below and report the
  step number.

## Test it (without the app)

Paste this into Safari and go:

```text
shortcuts://run-shortcut?name=Med%20Alarms&input=text&text=12%3A00%2C15%3A00%2C18%3A00
```

Clock must show exactly `Med-Time 1` (12:00), `Med-Time 2` (15:00),
`Med-Time 3` (18:00), all ON. Run it again — still exactly 3, never 6.
Then the app's **Set alarms** button works the same way.

## Build the `Clear Med Alarms` shortcut (same phone, same idea)

The app's **Clear** button opens this after a confirmation dialog. It takes
no input — just wipes the app's alarms so "Clear" truly resets everything.

1. New shortcut, rename to exactly `Clear Med Alarms` → Done.
2. Add **Find Alarms** → **Add Filter** → `Label` `contains` `Med-Time`.
3. Add **Delete Alarms** right after. Tap `>` on both actions, turn off
   **Show When Run**. (Step 0's deletion permission covers this one too.)
4. Done. Test in Safari (alarms may or may not exist — both are fine):

```text
shortcuts://run-shortcut?name=Clear%20Med%20Alarms
```

Clock must contain zero `Med-Time` alarms afterwards.

URL format per Apple:
<https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios>
