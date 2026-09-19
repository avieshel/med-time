import { useEffect, useState } from "react";
import "./App.css";
import {
  formatTime,
  nowRounded,
  parseTimeInput,
  previewAlarms,
  roundToQuarter,
} from "./lib/schedule";
import { buildClearShortcutUrl, buildShortcutUrl, isIOS } from "./lib/shortcuts";
import {
  appendHistory,
  clearToday,
  dayKey,
  loadHistory,
  loadToday,
  saveToday,
  takeStaleToday,
  type HistoryEntry,
  type TodayState,
} from "./lib/storage";

function toHistory(s: TodayState): HistoryEntry {
  return {
    day: s.day,
    firstPill: formatTime(new Date(s.firstPillIso)),
    alarms: s.alarmIsos.map((iso) => formatTime(new Date(iso))) as [
      string,
      string,
      string,
    ],
  };
}

function defaultDraft(): string {
  return formatTime(roundToQuarter(nowRounded()));
}

export default function App() {
  const [today, setToday] = useState<TodayState | null>(null);
  const [draftFirst, setDraftFirst] = useState<string>(defaultDraft);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const stored = loadToday();
    const stale = takeStaleToday(); // yesterday's plan → history, not lost
    if (stale) appendHistory(toHistory(stale));
    setToday(stored);
    if (stored) setDraftFirst(formatTime(new Date(stored.firstPillIso)));
    setHistory(loadHistory());
  }, []);

  const parsed = parseTimeInput(draftFirst);
  const preview: [Date, Date, Date] | null = parsed
    ? previewAlarms(parsed)
    : null;
  const previewTimes = preview?.map(formatTime) as
    | [string, string, string]
    | undefined;

  // Confirmation: stored plan was sent and the input still matches it.
  const confirmed =
    !!today?.alarmsSent &&
    !!parsed &&
    !!previewTimes &&
    formatTime(new Date(today.firstPillIso)) === formatTime(parsed) &&
    today.alarmIsos
      .map((iso) => formatTime(new Date(iso)))
      .every((t, i) => t === previewTimes[i]);

  function handleClear() {
    const ok = window.confirm(
      "Clear today's plan and delete all Med-Time alarms from the Clock app? Previous days are kept.",
    );
    if (!ok) return;
    if (today) appendHistory(toHistory(today));
    clearToday();
    setToday(null);
    setHistory(loadHistory());
    setDraftFirst(defaultDraft());
    setError("");
    // Reset the device too: stale alarms can outlive the local plan
    // (e.g. after day rollover), so the deleter always runs — it no-ops
    // when there is nothing to delete.
    window.location.href = buildClearShortcutUrl();
  }

  function handleSetAlarms() {
    if (!parsed || !preview || !previewTimes) {
      setError("Please enter a valid time, e.g. 09:00.");
      return;
    }
    if (today && !confirmed) appendHistory(toHistory(today)); // archive replaced plan
    const next: TodayState = {
      firstPillIso: parsed.toISOString(),
      alarmIsos: preview.map((d) => d.toISOString()) as [
        string,
        string,
        string,
      ],
      day: dayKey(parsed),
      alarmsSent: true,
    };
    saveToday(next);
    setToday(next);
    setHistory(loadHistory());
    setError("");
    window.location.href = buildShortcutUrl(previewTimes);
  }

  return (
    <main className="app">
      <h1>Med-Time</h1>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <label htmlFor="first-pill">First pill taken at:</label>
        <input
          id="first-pill"
          type="time"
          step={900}
          value={draftFirst}
          onChange={(e) => setDraftFirst(e.target.value)}
        />

        <p className="subtitle">Set alarm to:</p>
        <ol className="alarms">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <span className="alarm-num">{i + 1}.)</span>
              <span className="alarm-time">
                {previewTimes ? previewTimes[i] : "--:--"}
              </span>
            </li>
          ))}
        </ol>

        {confirmed && today && (
          <p className="confirmation" role="status">
            ✓ Alarms set for {previewTimes!.join(", ")}
          </p>
        )}

        <button
          type="button"
          className="primary"
          onClick={handleSetAlarms}
          disabled={!preview}
        >
          Set alarms
        </button>

        <div className="row">
          <button type="button" className="danger" onClick={handleClear}>
            {today ? "Clear" : "Clear Med-Time alarms"}
          </button>
        </div>

        {!isIOS() && previewTimes && (
          <p className="hint">
            On iPhone this opens the Shortcuts app to create real alarms. On
            this device, set these times manually: {previewTimes.join(", ")}.
          </p>
        )}
      </section>

      {history.length > 0 && (
        <section className="card history">
          <h2>Previous days</h2>
          <ul>
            {history.slice(0, 5).map((h) => (
              <li key={h.day}>
                {h.day}: {h.firstPill} → {h.alarms.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
