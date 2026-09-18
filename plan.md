# Med-Time — Build Plan (resumable)

> **How to use this file across model restarts / timeouts:**
> Work top-to-bottom. Before starting a task, write the current
> date-time into its `Started at`. When fully done (including its
> `Verify`), write the date-time into `Completed` and tick the box
> (`[ ]` → `[x]`). Only **one** task may be in progress at a time.
> To resume: find the first `[ ]` task with a `Started at` but no
> `Completed` — continue there. A fresh model should read `README.md`
> + this file, then run the `Verify` of the last `[x]` task as a sanity
> check before continuing.

Legend: `[ ]` pending · `[x]` done. Timestamps format: `YYYY-MM-DD HH:MM`.

---

## Phase 0 — Repo bootstrap (small & simple first)

### Task 0 — Git init + minimal safety files
- [x] Task 0 — Git init + minimal safety files
  - Started at: 2026-09-18 14:32
  - Completed: 2026-09-18 14:32
  - Completed: _
  - Do: `git init` (if needed); write `.gitignore`
    (`node_modules/`, `dist/`, `*.log`, `.env`, `coverage/`);
    confirm no secrets in repo.
  - Verify: `git status --short` clean-ish; `ls -la` shows `.gitignore`.
  - Resume note: safe to re-run; never commit secrets.

### Task 1 — Scaffold Vite + React + TypeScript
- [x] Task 1 — Scaffold Vite + React + TypeScript
  - Started at: 2026-09-18 14:32
  - Completed: 2026-09-18 14:35
  - Completed: _
  - Do: `npm create vite@latest . -- --template react-ts` (merge, no overwrite
    of README/plan); `npm install`; keep default lint light (no eslint yet).
  - Verify: `npm run dev` serves; `npm run build` succeeds.
  - Resume note: if `node_modules/` half-installed, delete it and re-run
    `npm install`.

## Phase 1 — Core logic (testable, no UI yet)

### Task 2 — Time-math module (`src/lib/schedule.ts`)
- [x] Task 2 — Time-math module
  - Started at: 2026-09-18 14:35
  - Completed: 2026-09-18 14:36
  - Completed: _
  - Do: pure functions — `computeAlarms(firstPill: Date): Date[3]`
    (+3h/+6h/+9h), `formatTime`, `parseTimeInput`; handle midnight rollover
    (e.g. 22:00 → 01:00 next day).
  - Verify: `npm test` passes (tests written in Task 3).
  - Resume note: no UI, no storage in this module — keep it pure.

### Task 3 — Unit tests for time math
- [x] Task 3 — Unit tests for time math
  - Started at: 2026-09-18 14:36
  - Completed: 2026-09-18 14:37
  - Completed: _
  - Do: add `vitest` (`npm i -D vitest`), `test` script; cover 09:00→12/15/18,
    10:00→13/16/19, midnight rollover, DST-adjacent date handling.
  - Verify: `npm test` green.
  - Resume note: if vitest config missing, tests run with defaults.

### Task 4 — Storage module (`src/lib/storage.ts`)
- [x] Task 4 — Storage module
  - Started at: 2026-09-18 14:37
  - Completed: 2026-09-18 14:38
  - Completed: _
  - Do: `localStorage` helpers — save today's `{ firstPill, alarms, edited }`,
    load, clear-on-new-day, append to simple history log (date + times).
  - Verify: `npm test` covers save/load/rollover (extend test file).
  - Resume note: keep keys namespaced (`medtime:*`).

## Phase 2 — UI (big buttons, minimal taps)

### Task 5 — Home screen: pill button + schedule display
- [x] Task 5 — Home screen
  - Started at: 2026-09-18 14:38
  - Completed: 2026-09-18 14:40
  - Completed: _
  - Do: single screen — huge "I took my pill" button (defaults to now,
    tap-to-adjust time), today's 3 alarm times displayed large.
  - Verify: `npm run dev` → click through on desktop Safari-sized viewport.
  - Resume note: large fonts / high contrast; no settings page in v1.

### Task 6 — Editable times + reset
- [x] Task 6 — Editable times + reset
  - Started at: 2026-09-18 14:38
  - Completed: 2026-09-18 14:40
  - Completed: _
  - Do: each of the 3 times editable (time input); per-alarm override kept;
    "Reset all" restores computed values; "Start over" clears the day.
  - Verify: manual click-through; `npm test` still green.
  - Resume note: edits must survive reload (via Task 4 storage).

## Phase 3 — iOS handoff

### Task 7 — Shortcuts deep-link builder (`src/lib/shortcuts.ts`)
- [x] Task 7 — Shortcuts deep-link builder
  - Started at: 2026-09-18 14:38
  - Completed: 2026-09-18 14:40
  - Completed: _
  - Do: `buildShortcutUrl(times)` → `shortcuts://run-shortcut?name=Med%20Alarms&input=HH:MM,HH:MM,HH:MM`
    (URL-encoded); "Set alarms" button opens it; graceful fallback message
    on non-iOS (show times to set manually).
  - Verify: unit test asserts exact URL encoding; manual tap on iPhone
    opens Shortcuts (needs Task 10 Shortcut installed).
  - Resume note: shortcut name `Med Alarms` must match exactly.

## Phase 4 — PWA packaging

### Task 8 — Manifest, icons, service worker, iOS meta
- [x] Task 8 — PWA packaging
  - Started at: 2026-09-18 14:40
  - Completed: 2026-09-18 14:43
  - Completed: _
  - Do: add `vite-plugin-pwa` (manifest + SW, offline cache);
    `display: standalone`, theme color; Apple touch icon + iOS meta tags;
    app installable via Add to Home Screen.
  - Verify: `npm run build && npm run preview`; Lighthouse PWA check
    or manual Add-to-Home-Screen on iPhone.
  - Resume note: icons can be placeholder first, pretty later.

## Phase 5 — Ship + field test

### Task 9 — Deploy to HTTPS static host
- [x] Task 9 — Deploy to HTTPS static host
  - Started at: 2026-09-18 14:45 (target = GitHub Pages avieshel/med-time)
  - Completed: 2026-09-18 14:48
  - Live URL: https://avieshel.github.io/med-time/
  - Completed: _
  - Do: pick GitHub Pages or Netlify; document exact commands in README;
    confirm HTTPS + SW active.
  - Verify: public URL loads on iPhone Safari over cellular.
  - Resume note: record final URL here: _

### Task 10 — One-time Shortcut install + end-to-end test
- [ ] Task 10 — One-time Shortcut install + end-to-end test
  - Started at: _ (BLOCKED on iPhone in hand; steps are in README — run them, then tick this off)
  - Completed: _
  - Do: on her phone create `Med Alarms` shortcut (Split `,` input →
    delete alarms named `Med` → Create Alarm ×3, label `Med`, ON);
    full drill: first-pill 09:00 → alarms ring at 12/15/18; test 10:00 day;
    test editing one alarm before confirming.
  - Verify: all 3 native alarms exist in Clock app with correct times.
  - Resume note: write final action list back into README if it differs.

## Phase 6 — Harden later (deferred on purpose)

### Task 11 — Add checks only when they pay off
- [ ] Task 11 — Add checks only when they pay off
  - Started at: _
  - Completed: _
  - Do (in this order, stop when enough): `typecheck` script → `prettier`
    → `eslint` → `husky` pre-commit with `oasis`-style trufflehog scan +
    lint-staged → CI workflow (`npm ci`, build, test).
  - Verify: each added check passes locally before keeping it.
  - Resume note: do NOT bundle all checks at once; smallest useful step first.

## Phase 7 — Native iOS look

### Task 12 — iOS-native theme (system font + iOS styling)
- [x] Task 12 — iOS-native theme
  - Started at: 2026-09-18 14:55
  - Completed: 2026-09-18 14:57
  - Live at https://avieshel.github.io/med-time/ — confirm look on her
    iPhone (standalone, light + dark) together with Task 10.
  - Do: SF system font stack; iOS grouped bg (#F2F2F7) + cards;
    iOS blue #007AFF primary, red #FF3B30 destructive; large-title header;
    safe-area insets + viewport-fit=cover; light/dark via
    prefers-color-scheme; theme-color meta per scheme; manifest colors match.
  - Verify: `npm run build` + `npm test` green; visual check on iPhone
    (standalone, light + dark mode).
  - Resume note: `<input type="time">` renders native iOS wheels already —
    only needs minimal styling, not a custom picker.

### Task 13 — Quarter-hour defaults + "Remind me" copy
- [x] Task 13 — Quarter-hour defaults + "Remind me" copy
  - Started at: 2026-09-18 15:00
  - Completed: 2026-09-18 15:02
  - Do: `roundToQuarter` in schedule.ts; default first-pill time rounds to
    nearest 15 min (explicit user input always kept exact — full minute
    control retained); `step={900}` hint on time inputs; schedule screen
    states the 3 alarms explicitly; primary button renamed "Remind me".
  - Verify: `npm test` (new rounding cases) + `npm run build` green.
  - Resume note: computed alarms inherit quarter alignment from first pill;
    per-alarm edits are never re-snapped.
