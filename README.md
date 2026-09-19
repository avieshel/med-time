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

One shortcut, not two: the app can only open a single `shortcuts://` link
per tap, so delete-then-create must live as ordered actions inside one
shortcut (actions always run top-to-bottom). Two separate runs could strand
her with alarms deleted but never recreated — one shortcut can't do that.

The shortcut name must be exactly `Med Alarms` — the app calls it by name.
Add each action with the `+` / search bar in the editor.

**0. Allow deletion first (iOS blocks it otherwise — do this before testing).**
Settings → Apps → Shortcuts → Advanced → turn ON **Allow Deleting Without
Confirmation**. (On older iOS: Settings → Shortcuts → Advanced.)

**1. Create and name it.** Shortcuts → `+` → tap the title → Rename →
`Med Alarms` → Done.

**2. Split the times.** Add **Split Text**. Tap its input, choose the
**Shortcut Input** variable (the times arrive here automatically from the
app), separator **Custom** `,`. Result: a list of 3 times.

**3. Wipe yesterday's alarms.** Add **Find Alarms** → **Add Filter** →
`Label` `contains` `Med-Time`. Then add **Delete Alarms** directly after
(it automatically takes the alarms found in step 3). Nothing else is touched
— just never label any other alarm `Med-Time`.

**4. Recreate slot 1.** Add **Get Item from List** → **Item at Index** `1`
(tap its list field, choose the **Split Text** result). Add **Create Alarm**:
Time = that item, Label = `Med-Time 1`, Repeat = Never, toggled ON. Tap `>`
on the action, turn off **Show When Run**.

**5. Same for slots 2 and 3.** Repeat step 4 with Index `2` → label
`Med-Time 2`, and Index `3` → label `Med-Time 3`. No Repeat/loop actions
anywhere — just 3 explicit pairs.

**6. Grant permission.** With at least one alarm on the phone, run the
shortcut once from the editor (▶). When it asks about deleting, choose
**Always Allow**. Also allow Clock access if asked. Done.

## Test it (without the app)

Paste this into Safari and go:

```text
shortcuts://run-shortcut?name=Med%20Alarms&input=text&text=12%3A00%2C15%3A00%2C18%3A00
```

Clock must show exactly `Med-Time 1` (12:00), `Med-Time 2` (15:00),
`Med-Time 3` (18:00), all ON. Run it again — still exactly 3, never 6.
Then the app's **Set alarms** button works the same way.

If a step fails, note the step number and the exact message — that's what
we'll debug next. URL format per Apple:
<https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios>
