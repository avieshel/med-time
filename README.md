# Med-Time — Medicine Alarm PWA

A tiny installable PWA for iPhone that computes medicine alarm times
(first pill +3h / +6h / +9h) and hands them to iOS Shortcuts, which
creates real native Clock alarms.

> iOS gives PWAs **no API** to create Clock alarms directly.
> The app computes the times; a one-time iOS Shortcut (installed by you)
> creates the actual alarms via a `shortcuts://run-shortcut?...` deep link.

## How it works

1. Mom opens the PWA from the home screen (works offline).
2. Taps **"I took my pill"** — time defaults to now, adjustable.
3. App shows the 3 computed times, each editable before confirming.
4. Taps **"Set alarms"** → opens the `Med Alarms` Shortcut with the times.
5. The Shortcut deletes old `Med` alarms and creates the new ones.
   Real iOS alarms, real sound.

## Prerequisites

- Node 22 (`node --version`), npm 11 (`npm --version`)
- Git
- Optional but recommended: `trufflehog` for secret scanning
  (`brew install trufflehog`) — same convention as the `oasis` repo.

## Quick start

```sh
cd /Users/avieshel/dev/typescript/med-time
npm install
npm run dev        # local dev server
npm run build      # production build
npm run preview    # preview the production build
npm test           # unit tests (time math)
```

> These scripts exist after build Task 1 (scaffolding) in `plan.md`.
> Until then this repo holds only `README.md` and `plan.md`.

## iPhone install (PWA)

1. Deploy the built app to HTTPS (GitHub Pages / Netlify — see Task 9).
2. On her iPhone, open the URL in Safari.
3. Share → **Add to Home Screen**.
4. Open from the home-screen icon (standalone, offline-capable).

Requires iOS 16.4+ for full PWA behavior.

## One-time Shortcut setup (on her phone)

Shortcut name must be exactly `Med Alarms` (matches the deep link).

1. Open **Shortcuts** → `+` (new shortcut) → rename to `Med Alarms`.
2. Add **Receive `Shortcut Input`** from Nowhere; set input type to **Text**.
   (In the shortcut settings — ⓘ — enable **Show in Share Sheet** off;
   nothing else needed. The PWA passes text like `12:00,15:00,18:00`.)
3. Add actions in this order:
   - **Split** `Shortcut Input` by **Custom** separator `,`
     (this gives 3 items: the 3 alarm times).
   - **Find `Alarms`** with filter `Name` `contains` `Med`,
     then **Delete** `Alarms` (the found ones) — clears yesterday's alarms.
   - **Repeat with Each** in `Split Text result`:
     - **Create Alarm** with Time = `Repeat Item`, Label = `Med`,
       toggle the alarm ON.
   - **End Repeat**.
4. Save (Done). Test: in the PWA tap **"🔔 Set alarms"** → Shortcuts
   opens and runs → check the Clock app: 3 alarms labeled `Med`, ON.

If **Create Alarm** asks for confirmation each run, turn off
**Show When Run** on that action.

Exact action list with screenshots/notes will be added during Task 10.

## Project structure (planned)

```text
med-time/
├── README.md          # this file
├── plan.md            # granular, resumable build checklist
├── index.html
├── src/
│   ├── lib/schedule.ts   # pure time math (+3h/+6h/+9h), unit-tested
│   ├── lib/storage.ts    # localStorage state (today + history)
│   ├── lib/shortcuts.ts  # shortcuts:// URL builder
│   └── ui/               # one big-button screen + editable times
├── public/            # PWA icons
└── vite.config.ts     # vite-plugin-pwa (manifest + service worker)
```

State is local-first (`localStorage`). No backend, no accounts, no secrets.

## Safety / secrets (minimal, borrowed from `oasis`)

- Never commit secrets. This app needs none (no API keys, no backend).
- `.gitignore` covers `node_modules/`, `dist/`, `*.log`, `.env`, `coverage/`.
- Before first push, optional manual scan (same tool as `oasis`):
  `trufflehog filesystem --no-verification .`
- Heavier checks (husky pre-commit hook + lint-staged + CI) are
  **deferred** on purpose — see `plan.md` Task 11. Small and simple first.

## Deploy

Static hosting only (no server). **Chosen target: GitHub Pages**
(deferred — not deployed yet). When ready: add `base: '/<repo>/'` to
`vite.config.ts` if serving from a project subpath, `npm run build`,
and publish `dist/` via Pages. The PWA requires HTTPS, which Pages
provides.
