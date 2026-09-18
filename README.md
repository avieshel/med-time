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
iOS gives web apps no way to touch alarms directly — the Shortcut is the
bridge. Live at https://avieshel.github.io/med-time/.

## Put it on her iPhone

1. Open the live URL above in Safari (iOS 16.4+).
2. Share → **Add to Home Screen** → Add.
3. Open the Med-Time icon from the home screen.

## Build the `Med Alarms` shortcut (once, on her iPhone)

The shortcut name must be exactly `Med Alarms` — the app calls it by name.
Action names below are the ones in the Shortcuts editor's action list
(tap `+` / search to add each one).

1. Open **Shortcuts** → `+` (top right) → tap the title → **Rename** →
   `Med Alarms` → Done.
2. Add **Split Text**. Tap its input field and choose the **Shortcut Input**
   variable (the times arrive here automatically from the app — no receiving
   action needed). Set the separator to **Custom** `,`.
3. Add **Find Alarms**. Tap **Add Filter** → `Name` `contains` `Med-Time`.
4. Add **Delete Alarms** right after (it automatically takes the alarms
   found in step 3). This is the whole anti-bloat lifecycle: every run wipes
   the app's old alarms before creating new ones. Nothing else is touched —
   just don't label any other alarm `Med-Time`.
   - If you can't find **Delete Alarms**, update to the latest iOS first.
5. Add **Repeat with Each**. ⚠️ It will default to repeating over the
   deleted alarms — tap its input and switch it to the **Split Text** result
   (magic variable) so it repeats over the 3 times instead.
6. Inside the repeat, add **Create Alarm**:
   - Time = **Repeat Item** (default).
   - Label: type `Med-Time ` (with a space) then insert the **Repeat Index**
     variable → reads `Med-Time Repeat Index`, producing `Med-Time 1`,
     `Med-Time 2`, `Med-Time 3`.
   - Repeat = Never/None, alarm toggled ON.
   - Tap `>` on the action and turn off **Show When Run** so it never asks
     for confirmation.
7. Tap **Done**.

First run will ask for permission to access Clock/alarms — tap **Allow**
(and allow always / don't ask again if offered).

## Test it (without the app)

Paste this into Safari and go — it must create the 3 alarms directly:

```text
shortcuts://run-shortcut?name=Med%20Alarms&input=text&text=12%3A00%2C15%3A00%2C18%3A00
```

Then open Clock: exactly `Med-Time 1` (12:00), `Med-Time 2` (15:00),
`Med-Time 3` (18:00), all ON. Run it again — still exactly 3. If that works,
the app's **Set alarms** button will work too.

URL format per Apple: <https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios>
