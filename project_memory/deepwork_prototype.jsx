import { useState, useEffect, useRef, useCallback } from "react";

// ── Fonts via Google Fonts (injected) ──────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@300;400;500&family=Lato:wght@300;400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0e0d0b;
      --bg2:       #141210;
      --bg3:       #1c1916;
      --surface:   #222019;
      --border:    #2e2b25;
      --amber:     #c8843a;
      --amber-dim: #8a5a26;
      --amber-glow:#c8843a33;
      --text:      #e8e0d0;
      --text-dim:  #7a7060;
      --text-muted:#4a4438;
      --red:       #b85555;
      --green:     #6a9a6a;
      --mono:      'JetBrains Mono', monospace;
      --serif:     'Playfair Display', Georgia, serif;
      --sans:      'Lato', sans-serif;
    }

    html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--sans); }

    /* grain overlay */
    body::before {
      content: '';
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.35;
    }

    @keyframes pulse-ring {
      0%   { transform: scale(1);    opacity: 0.6; }
      50%  { transform: scale(1.04); opacity: 1;   }
      100% { transform: scale(1);    opacity: 0.6; }
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes tick {
      0%   { opacity: 1; }
      49%  { opacity: 1; }
      50%  { opacity: 0; }
      99%  { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0);   }
    }

    .fade-in   { animation: fade-in  0.4s ease forwards; }
    .slide-up  { animation: slide-up 0.35s ease forwards; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  `}</style>
);

// ── Utility ────────────────────────────────────────────────────────────────
const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return { m, sec };
};

const fmtDuration = (s) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
  { id: 1, tag: "Coding — Auth Feature", duration: 52 * 60, type: "focus", ts: Date.now() - 3600000 * 2 },
  { id: 2, tag: "PR Reviews",            duration: 18 * 60, type: "focus", ts: Date.now() - 3600000 * 3 },
  { id: 3, tag: "Coding — Auth Feature", duration: 45 * 60, type: "focus", ts: Date.now() - 3600000 * 4 },
  { id: 4, tag: "Client A — Report",     duration: 30 * 60, type: "focus", ts: Date.now() - 86400000 },
  { id: 5, tag: "Reading",               duration: 25 * 60, type: "focus", ts: Date.now() - 86400000 * 2 },
  { id: 6, tag: "Coding — Auth Feature", duration: 60 * 60, type: "focus", ts: Date.now() - 86400000 * 2 },
];

const BREAK_SUGGESTIONS = [
  "Drink a full glass of water",
  "Step outside for 2 minutes",
  "Roll your shoulders back 10 times",
  "Look 20 feet away for 20 seconds",
  "Take 5 slow, deep breaths",
  "Stand up and stretch your spine",
];

// ── Sub-components ─────────────────────────────────────────────────────────

function CircularTimer({ progress, radius = 140, isBreak, running }) {
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (1 - progress);

  return (
    <svg width={radius * 2 + 40} height={radius * 2 + 40} style={{ overflow: "visible" }}>
      {/* glow */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* track */}
      <circle
        cx={radius + 20} cy={radius + 20} r={radius}
        fill="none" stroke="#1e1c18" strokeWidth="2"
      />
      {/* tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i / 60) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const inner = radius - (i % 5 === 0 ? 10 : 5);
        const outer = radius;
        const cx = radius + 20;
        const cy = radius + 20;
        return (
          <line
            key={i}
            x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
            x2={cx + outer * Math.cos(rad)} y2={cy + outer * Math.sin(rad)}
            stroke={i % 5 === 0 ? "#2e2b25" : "#1e1c18"}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
          />
        );
      })}
      {/* progress arc */}
      <circle
        cx={radius + 20} cy={radius + 20} r={radius}
        fill="none"
        stroke={isBreak ? "#6a9a6a" : "#c8843a"}
        strokeWidth="2.5"
        strokeDasharray={circumference}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${radius + 20} ${radius + 20})`}
        style={{
          transition: "stroke-dashoffset 0.5s ease",
          filter: running ? "url(#soft-glow)" : "none",
        }}
      />
      {/* pulse dot */}
      {running && (
        <circle
          cx={
            (radius + 20) +
            radius * Math.cos(((progress * 360 - 90) * Math.PI) / 180)
          }
          cy={
            (radius + 20) +
            radius * Math.sin(((progress * 360 - 90) * Math.PI) / 180)
          }
          r="5"
          fill={isBreak ? "#6a9a6a" : "#c8843a"}
          filter="url(#glow)"
          style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
        />
      )}
    </svg>
  );
}

function AccumulatedBar({ minutes, threshold }) {
  const pct = Math.min((minutes / threshold) * 100, 100);
  const segments = Math.floor(threshold / 25);

  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Accumulated Focus
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--amber)" }}>
          {fmtDuration(minutes * 60)} / {fmtDuration(threshold * 60)}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`,
          background: pct >= 100 ? "var(--green)" : "linear-gradient(90deg, var(--amber-dim), var(--amber))",
          borderRadius: 3,
          transition: "width 1s ease",
          boxShadow: pct > 0 ? "0 0 8px var(--amber-glow)" : "none",
        }} />
        {/* segment markers */}
        {Array.from({ length: segments - 1 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${((i + 1) / segments) * 100}%`,
            width: 1, background: "var(--bg2)",
          }} />
        ))}
      </div>
      {pct >= 100 && (
        <p style={{ marginTop: 6, fontFamily: "var(--sans)", fontSize: 11, color: "var(--green)", letterSpacing: "0.08em" }}>
          ✦ Time for a meaningful break
        </p>
      )}
    </div>
  );
}

function SessionTag({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(input.toLowerCase()) && s !== input
  );

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 6, padding: "8px 12px",
      }}>
        <span style={{ color: "var(--text-dim)", fontSize: 12 }}>⬡</span>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Tag this session…"
          style={{
            background: "transparent", border: "none", outline: "none",
            fontFamily: "var(--sans)", fontSize: 13, color: "var(--text)",
            width: "100%", letterSpacing: "0.02em",
          }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: 6, overflow: "hidden", zIndex: 10,
        }}>
          {filtered.map(s => (
            <div key={s}
              onMouseDown={() => { setInput(s); onChange(s); setOpen(false); }}
              style={{
                padding: "8px 12px", fontFamily: "var(--sans)", fontSize: 13,
                color: "var(--text-dim)", cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.target.style.background = "var(--surface)"}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BreakSuggestion({ suggestion }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid #2e3a2e",
      borderRadius: 8, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 12,
      animation: "slide-up 0.4s ease",
    }}>
      <span style={{ fontSize: 18 }}>🌿</span>
      <span style={{ fontFamily: "var(--sans)", fontSize: 14, color: "#9ab09a", letterSpacing: "0.02em" }}>
        {suggestion}
      </span>
    </div>
  );
}

// ── Analytics View ─────────────────────────────────────────────────────────
function Analytics({ sessions, onBack }) {
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.ts);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  // Group by tag
  const byTag = sessions.reduce((acc, s) => {
    acc[s.tag] = (acc[s.tag] || 0) + s.duration;
    return acc;
  }, {});
  const maxTag = Math.max(...Object.values(byTag));

  // Last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = sessions
      .filter(s => new Date(s.ts).toDateString() === d.toDateString())
      .reduce((acc, s) => acc + s.duration, 0);
    return { label, total };
  });
  const maxDay = Math.max(...days.map(d => d.total), 1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 24px", animation: "fade-in 0.3s ease" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <button onClick={onBack} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-dim)",
            padding: "6px 14px", borderRadius: 4, cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--amber)"; e.target.style.color = "var(--amber)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-dim)"; }}
          >← back</button>
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, color: "var(--text)" }}>Focus History</h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-dim)", marginTop: 2, letterSpacing: "0.06em" }}>{TODAY}</p>
          </div>
        </div>

        {/* today summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40,
        }}>
          {[
            { label: "Today's Focus", value: fmtDuration(totalToday) },
            { label: "Sessions", value: todaySessions.length },
            { label: "Avg Session", value: todaySessions.length ? fmtDuration(Math.round(totalToday / todaySessions.length)) : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "16px 18px",
            }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 22, color: "var(--amber)", fontWeight: 400 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* 7-day bar chart */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Last 7 Days</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {days.map(({ label, total }) => {
              const h = maxDay > 0 ? (total / maxDay) * 72 : 0;
              const isToday = label === new Date().toLocaleDateString("en-US", { weekday: "short" });
              return (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: 72, display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%", height: `${Math.max(h, total > 0 ? 4 : 0)}px`,
                      background: isToday ? "var(--amber)" : "var(--bg3)",
                      border: `1px solid ${isToday ? "var(--amber)" : "var(--border)"}`,
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.6s ease",
                      boxShadow: isToday ? "0 0 12px var(--amber-glow)" : "none",
                    }} />
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: isToday ? "var(--amber)" : "var(--text-muted)", letterSpacing: "0.08em" }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* by tag */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Time by Project</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(byTag).sort((a, b) => b[1] - a[1]).map(([tag, dur]) => (
              <div key={tag}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--text)" }}>{tag}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)" }}>{fmtDuration(dur)}</span>
                </div>
                <div style={{ height: 3, background: "var(--surface)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(dur / maxTag) * 100}%`,
                    background: "linear-gradient(90deg, var(--amber-dim), var(--amber))",
                    borderRadius: 2, transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* session log */}
        <div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Session Log</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sessions.slice().sort((a, b) => b.ts - a.ts).map(s => (
              <div key={s.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--text)" }}>{s.tag}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-muted)", marginLeft: 10 }}>
                    {new Date(s.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--amber)" }}>{fmtDuration(s.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings panel ─────────────────────────────────────────────────────────
function Settings({ settings, onChange, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,9,7,0.85)",
      backdropFilter: "blur(4px)", zIndex: 100, display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "fade-in 0.2s ease",
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "32px", width: 340,
        animation: "slide-up 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, marginBottom: 28, color: "var(--text)" }}>
          Settings
        </h2>
        {[
          { label: "Work Duration", key: "workMinutes", unit: "min", min: 5, max: 120 },
          { label: "Short Break", key: "shortBreakMinutes", unit: "min", min: 1, max: 30 },
          { label: "Long Break", key: "longBreakMinutes", unit: "min", min: 5, max: 60 },
          { label: "Long Break After", key: "accThreshold", unit: "min", min: 60, max: 240 },
        ].map(({ label, key, unit, min, max }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--text-dim)" }}>{label}</label>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--amber)" }}>{settings[key]} {unit}</span>
            </div>
            <input type="range" min={min} max={max} value={settings[key]}
              onChange={e => onChange(key, +e.target.value)}
              style={{ width: "100%", accentColor: "var(--amber)", height: 3, cursor: "pointer" }}
            />
          </div>
        ))}
        <button onClick={onClose} style={{
          width: "100%", marginTop: 8, padding: "10px",
          background: "var(--amber)", border: "none", borderRadius: 6,
          fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em",
          color: "#1a1208", cursor: "pointer", transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >SAVE</button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("timer"); // "timer" | "analytics"
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [sessionTag, setSessionTag] = useState("");
  const [accMinutes, setAccMinutes] = useState(115); // start with some for demo
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);
  const [breakSuggestion, setBreakSuggestion] = useState(null);
  const [settings, setSettings] = useState({
    workMinutes: 45,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    accThreshold: 100,
  });

  const intervalRef = useRef(null);
  const tagSuggestions = [...new Set(sessions.map(s => s.tag)), "Coding", "PR Reviews", "Writing", "Reading", "Planning"];

  const totalSeconds = mode === "focus"
    ? settings.workMinutes * 60
    : (accMinutes >= settings.accThreshold ? settings.longBreakMinutes : settings.shortBreakMinutes) * 60;

  const currentSeconds = secondsLeft ?? totalSeconds;
  const progress = 1 - currentSeconds / totalSeconds;
  const { m, sec } = fmt(currentSeconds);

  const notify = useCallback((msg, duration = 4000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  }, []);

  const handleSessionEnd = useCallback(() => {
    setRunning(false);
    if (mode === "focus") {
      const dur = settings.workMinutes * 60;
      setSessions(prev => [{
        id: Date.now(), tag: sessionTag || "Untitled Session",
        duration: dur, type: "focus", ts: Date.now(),
      }, ...prev]);
      setAccMinutes(prev => prev + settings.workMinutes);
      const suggestion = BREAK_SUGGESTIONS[Math.floor(Math.random() * BREAK_SUGGESTIONS.length)];
      setBreakSuggestion(suggestion);
      notify("Session complete. Ready for a break?");
    } else {
      setBreakSuggestion(null);
      notify("Break over. Ready to focus?");
    }
    setSecondsLeft(null);
  }, [mode, sessionTag, settings.workMinutes, notify]);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = (prev ?? totalSeconds) - 1;
        if (next <= 0) { clearInterval(intervalRef.current); handleSessionEnd(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, totalSeconds, handleSessionEnd]);

  const toggleTimer = () => {
    if (secondsLeft === 0) { setSecondsLeft(null); setRunning(true); return; }
    setRunning(r => !r);
  };

  const switchMode = (newMode) => {
    setRunning(false); setMode(newMode); setSecondsLeft(null); setBreakSuggestion(null);
  };

  const changeSetting = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  if (view === "analytics") return (
    <>
      <FontLoader />
      <Analytics sessions={sessions} onBack={() => setView("timer")} />
    </>
  );

  return (
    <>
      <FontLoader />
      {showSettings && (
        <Settings settings={settings} onChange={changeSetting} onClose={() => setShowSettings(false)} />
      )}

      {/* notification toast */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "10px 20px",
          fontFamily: "var(--sans)", fontSize: 13, color: "var(--text-dim)",
          zIndex: 200, animation: "slide-up 0.3s ease",
          letterSpacing: "0.04em",
        }}>
          {notification}
        </div>
      )}

      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(ellipse 60% 50% at 50% 20%, #1a1710 0%, var(--bg) 70%)",
      }}>
        {/* top bar */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(14,13,11,0.8)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--amber)",
              boxShadow: running ? "0 0 8px var(--amber)" : "none",
              animation: running ? "pulse-ring 2s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontFamily: "var(--serif)", fontSize: 17, fontStyle: "italic", letterSpacing: "0.02em", color: "var(--text)" }}>
              DeepWork
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <NavBtn onClick={() => setView("analytics")}>History</NavBtn>
            <NavBtn onClick={() => setShowSettings(true)}>Settings</NavBtn>
          </div>
        </div>

        {/* main content */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 32, paddingTop: 60, animation: "fade-in 0.5s ease",
        }}>
          {/* timer face */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularTimer progress={progress} radius={140} isBreak={mode === "break"} running={running} />
            <div style={{
              position: "absolute", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              {/* digits */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 68, fontWeight: 300,
                  color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1,
                }}>{m}</span>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 68, fontWeight: 300,
                  color: "var(--text-dim)", lineHeight: 1,
                  animation: running ? "tick 1s step-end infinite" : "none",
                }}>:</span>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 68, fontWeight: 300,
                  color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1,
                }}>{sec}</span>
              </div>
              {/* mode label */}
              <span style={{
                fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: mode === "break" ? "#6a9a6a" : "var(--amber-dim)",
                marginTop: 6,
              }}>
                {mode === "focus" ? "deep focus" : "resting"}
              </span>
            </div>
          </div>

          {/* controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <ControlBtn
              onClick={toggleTimer}
              primary
              color={mode === "break" ? "#6a9a6a" : "var(--amber)"}
            >
              {running ? "PAUSE" : secondsLeft === 0 ? "RESTART" : "START"}
            </ControlBtn>
            {(running || secondsLeft !== null) && (
              <ControlBtn onClick={() => { setRunning(false); setSecondsLeft(null); }}>
                RESET
              </ControlBtn>
            )}
            <ControlBtn
              onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
              color="#6a9a6a"
              isBreakToggle
              active={mode === "break"}
            >
              {mode === "focus" ? "BREAK" : "FOCUS"}
            </ControlBtn>
          </div>

          {/* tag input (only in focus mode) */}
          {mode === "focus" && (
            <div style={{ animation: "fade-in 0.3s ease" }}>
              <SessionTag value={sessionTag} onChange={setSessionTag} suggestions={tagSuggestions} />
            </div>
          )}

          {/* break suggestion */}
          {breakSuggestion && mode === "focus" && (
            <div style={{ maxWidth: 320, width: "100%" }}>
              <BreakSuggestion suggestion={breakSuggestion} />
              <button
                onClick={() => switchMode("break")}
                style={{
                  width: "100%", marginTop: 8, padding: "9px",
                  background: "transparent", border: "1px solid #2e3a2e",
                  borderRadius: 6, color: "#9ab09a",
                  fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.background = "#1a231a"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; }}
              >
                START BREAK
              </button>
            </div>
          )}

          {/* accumulated bar */}
          <AccumulatedBar minutes={accMinutes} threshold={settings.accThreshold} />

          {/* session count */}
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "today", value: sessions.filter(s => new Date(s.ts).toDateString() === new Date().toDateString()).length },
              { label: "this week", value: sessions.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--text)", fontWeight: 300 }}>{value}</p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Tiny button atoms ──────────────────────────────────────────────────────
function ControlBtn({ children, onClick, primary, color, isBreakToggle, active }) {
  const [hov, setHov] = useState(false);
  const base = primary
    ? {
        background: hov ? "transparent" : color || "var(--amber)",
        border: `1px solid ${color || "var(--amber)"}`,
        color: hov ? (color || "var(--amber)") : "#1a1208",
      }
    : isBreakToggle
    ? {
        background: active ? "#1a2e1a" : (hov ? "#1a2e1a" : "transparent"),
        border: `1px solid ${active ? "#6a9a6a" : (hov ? "#6a9a6a" : "var(--border)")}`,
        color: active ? "#9ab09a" : (hov ? "#9ab09a" : "var(--text-dim)"),
      }
    : {
        background: "transparent",
        border: "1px solid var(--border)",
        color: hov ? "var(--text)" : "var(--text-dim)",
      };

  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...base, padding: "12px 32px", borderRadius: 6, cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.16em",
        transition: "all 0.2s",
      }}>
      {children}
    </button>
  );
}

function NavBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em",
        color: hov ? "var(--text)" : "var(--text-dim)",
        padding: "4px 10px", transition: "color 0.2s",
      }}>
      {children}
    </button>
  );
}
