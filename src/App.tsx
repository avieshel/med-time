import { useEffect, useState } from "react";
import "./App.css";
import {
  computeAlarms,
  formatTime,
  nowRounded,
  parseTimeInput,
} from "./lib/schedule";
import { buildShortcutUrl, isIOS } from "./lib/shortcuts";
import {
  appendHistory,
  clearToday,
  dayKey,
  loadHistory,
  loadToday,
  saveToday,
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

export default function App() {
  const [today, setToday] = useState<TodayState | null>(null);
  const [draftFirst, setDraftFirst] = useState<string>(() =>
    formatTime(nowRounded()),
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setToday(loadToday());
    setHistory(loadHistory());
  }, []);

  const alarms: [Date, Date, Date] | null = today
    ? (today.alarmIsos.map((iso) => new Date(iso)) as [Date, Date, Date])
    : null;

  function persist(next: TodayState) {
    saveToday(next);
    setToday(next);
    setError("");
  }

  function handleStartDay() {
    const first = parseTimeInput(draftFirst);
    if (!first) {
      setError("Please enter a valid time, e.g. 09:00.");
      return;
    }
    if (today) appendHistory(toHistory(today)); // keep the replaced plan
    persist({
      firstPillIso: first.toISOString(),
      alarmIsos: computeAlarms(first).map((d) => d.toISOString()) as [
        string,
        string,
        string,
      ],
      day: dayKey(first),
    });
    setHistory(loadHistory());
  }

  function handleEditAlarm(index: number, hhmm: string) {
    if (!today || !alarms) return;
    const parsed = parseTimeInput(hhmm, alarms[index]); // keep the alarm's date (midnight rollover)
    if (!parsed) {
      setError("Please enter a valid time, e.g. 13:00.");
      return;
    }
    const alarmIsos = [...today.alarmIsos] as [string, string, string];
    alarmIsos[index] = parsed.toISOString();
    persist({ ...today, alarmIsos });
  }

  function handleResetComputed() {
    if (!today) return;
    const first = new Date(today.firstPillIso);
    persist({
      ...today,
      alarmIsos: computeAlarms(first).map((d) => d.toISOString()) as [
        string,
        string,
        string,
      ],
    });
  }

  function handleStartOver() {
    if (today) appendHistory(toHistory(today));
    clearToday();
    setToday(null);
    setHistory(loadHistory());
    setDraftFirst(formatTime(nowRounded()));
    setError("");
  }

  function handleSetAlarms() {
    if (!alarms) return;
    const times = alarms.map(formatTime) as [string, string, string];
    window.location.href = buildShortcutUrl(times);
  }

  return (
    <main className="app">
      <h1>💊 Med-Time</h1>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!today || !alarms ? (
        <section className="card">
          <label htmlFor="first-pill">First pill taken at:</label>
          <input
            id="first-pill"
            type="time"
            value={draftFirst}
            onChange={(e) => setDraftFirst(e.target.value)}
          />
          <button type="button" className="primary" onClick={handleStartDay}>
            I took my pill
          </button>
        </section>
      ) : (
        <section className="card">
          <p className="subtitle">
            First pill: <strong>{formatTime(new Date(today.firstPillIso))}</strong>
          </p>
          <ol className="alarms">
            {alarms.map((alarm, i) => (
              <li key={i}>
                <span className="alarm-num">{i + 1}</span>
                <input
                  type="time"
                  aria-label={`Alarm ${i + 1}`}
                  value={formatTime(alarm)}
                  onChange={(e) => handleEditAlarm(i, e.target.value)}
                />
              </li>
            ))}
          </ol>
          <button type="button" className="primary" onClick={handleSetAlarms}>
            🔔 Set alarms
          </button>
          {!isIOS() && (
            <p className="hint">
              On iPhone this opens the Shortcuts app to create real alarms.
              On this device, set these times manually:{" "}
              {alarms.map(formatTime).join(", ")}.
            </p>
          )}
          <div className="row">
            <button type="button" onClick={handleResetComputed}>
              Reset times
            </button>
            <button type="button" onClick={handleStartOver}>
              Start over
            </button>
          </div>
        </section>
      )}

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
