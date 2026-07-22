import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// SOUND
// ═══════════════════════════════════════════════════════════════════════════
function createSound(muted) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  return function playSound(type) {
    if (muted) return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.connect(ctx.destination);
    const play = (freq, start, dur, wave = "sine") => {
      const o = ctx.createOscillator();
      o.type = wave;
      o.frequency.setValueAtTime(freq, ctx.currentTime + start);
      o.connect(g);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur);
    };
    const fade = (delay, dur) => {
      g.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + dur);
    };
    if (type === "add") { play(220, 0, 0.08); play(440, 0.07, 0.08); fade(0, 0.15); }
    else if (type === "correct") { play(523, 0, 0.1); play(659, 0.1, 0.1); play(784, 0.2, 0.1); fade(0, 0.3); }
    else if (type === "submit") { play(392, 0, 0.4); fade(0.1, 0.3); }
    else if (type === "warn") { play(330, 0, 0.1); play(277, 0.1, 0.1); fade(0, 0.2); }
    else if (type === "reveal") { play(523, 0, 0.1); play(659, 0.1, 0.1); play(784, 0.2, 0.1); play(1047, 0.3, 0.2); fade(0, 0.5); }
    else if (type === "tick") { play(800, 0, 0.05, "triangle"); fade(0, 0.05); }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════════════════════════
const CALLOUT_VARIANTS = {
  info: { bg: "#EFF6FF", border: "#BFDBFE", accent: "#2563EB", color: "#1E3A8A" },
  tip: { bg: "#FFFBEB", border: "#FDE68A", accent: "#D97706", color: "#92400E" },
  success: { bg: "#F0FDF4", border: "#BBF7D0", accent: "#16A34A", color: "#166534" },
  danger: { bg: "#FEF2F2", border: "#FECACA", accent: "#DC2626", color: "#7F1D1D" },
  neutral: { bg: "#F9FAFB", border: "#E2E8F0", accent: "#64748B", color: "#374151" },
};
function Callout({ icon, title, variant = "info", shake, children, style }) {
  const v = CALLOUT_VARIANTS[variant];
  return (
    <div className={`hk-card${shake ? " hk-shake" : ""}`} style={{
      background: v.bg, border: `1px solid ${v.border}`, borderLeft: `4px solid ${v.accent}`,
      borderRadius: 12, padding: "16px 20px", marginBottom: 14, fontSize: 15, lineHeight: 1.65, color: v.color, ...style
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 12.5, letterSpacing: 0.6, marginBottom: 8, color: v.accent, textTransform: "uppercase" }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{title}
        </div>
      )}
      {!title && icon && <span style={{ fontSize: 18, marginRight: 8 }}>{icon}</span>}
      {children}
    </div>
  );
}

function CodeBlock({ children, style, border }) {
  return (
    <div className="hk-card" style={{
      background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16,
      fontFamily: "monospace", fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

function RunButton({ onClick, children, disabled, variant = "primary", small }) {
  const bg = variant === "danger" ? "linear-gradient(135deg,#DC2626,#991B1B)"
    : variant === "success" ? "linear-gradient(135deg,#10B981,#059669)"
    : variant === "ghost" ? "#fff"
    : "linear-gradient(135deg,#7C3AED,#2563EB)";
  return (
    <button onClick={onClick} disabled={disabled} className="hk-btn" style={{
      padding: small ? "8px 14px" : "13px 24px", borderRadius: small ? 9 : 12,
      border: variant === "ghost" ? "1px solid #E2E8F0" : "none",
      background: disabled ? "#CBD5E1" : bg, color: variant === "ghost" ? "#1E293B" : "#fff",
      fontWeight: 800, fontSize: small ? 13 : 15.5,
      cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled || variant === "ghost" ? "none" : "0 6px 16px rgba(124,58,237,0.3)"
    }}>{children}</button>
  );
}

function Stage({ children, caption, label = "LIVE PREVIEW" }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14.5, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>⚛️</span> {label}
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, background: "#F1F5F9",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 380,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 22
      }}>
        {children}
      </div>
      <div style={{ minHeight: 38, marginTop: 12, textAlign: "center" }}>
        {caption && <div key={caption} className="hk-slide-in" style={{ fontSize: 14.5, fontWeight: 600, color: "#475569" }}>{caption}</div>}
      </div>
    </div>
  );
}

const STEPS = [
  { label: "User Test", icon: "👤" },
  { label: "README", icon: "📄" },
  { label: "Gate Checklist", icon: "🚪" },
  { label: "Module 4 Complete", icon: "🎉" },
];
function ProgressBar({ slot }) {
  const pct = Math.max(0, Math.min(100, ((slot - 1) / (STEPS.length - 1)) * 100));
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 17, left: 17, right: 17, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 17, left: 17, height: 4, borderRadius: 2, width: `calc(${pct}% - ${pct === 0 ? 0 : 34 * (pct / 100)}px)`, background: "linear-gradient(90deg,#10B981,#F59E0B)", transition: "width 0.5s ease" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {STEPS.map((s, i) => {
            const stepNum = i + 1, done = stepNum < slot, active = stepNum === slot;
            return (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                <div className={active ? "hk-pulse" : ""} style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#F59E0B,#D97706)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #FDE68A" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(245,158,11,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>{done ? "✓" : s.icon}</div>
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, textAlign: "center", color: done ? "#059669" : active ? "#1E293B" : "#94A3B8" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CopyBlock({ text, playSound }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
    setCopied(true);
    playSound("tick");
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <CodeBlock style={{ maxHeight: 280, overflowY: "auto" }}>{text}</CodeBlock>
      <button onClick={copy} className="hk-btn" style={{
        position: "absolute", top: 10, right: 10, background: copied ? "#10B981" : "#334155",
        color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer"
      }}>{copied ? "✓ Copied" : "Copy"}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — USER TEST
// ═══════════════════════════════════════════════════════════════════════════
const OBSERVE_ITEMS = [
  "Can they log in without help?",
  "Can they find the members list?",
  "Can they add a member?",
  "Do they get confused anywhere?",
  "Do they tap something that does nothing?",
  "Do they complete a task successfully?",
  "What do they say out loud?",
];

function Step1({ state, setState, playSound, onNext }) {
  const { shown, watched, notes, wroteNotes } = state;
  const allChecked = shown && watched && wroteNotes;
  const prevAll = useRef(false);
  useEffect(() => {
    if (allChecked && !prevAll.current) playSound("correct");
    prevAll.current = allChecked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const toggle = (key) => {
    if (key === "wroteNotes" && !state.wroteNotes && !notes.trim()) return;
    setState(s => ({ ...s, [key]: !s[key] }));
    playSound("add");
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>👤 Show it to one real person</div>

      <Callout icon="🎯" title="Who to show" variant="tip">
        Options — from best to good:
        <br /><br />
        <strong>Best:</strong> The actual business owner you are building for. (Gym owner, hotel manager, mess supervisor, chai shop owner)
        <br />
        <strong>Good:</strong> A friend who has never seen the app.
        <br />
        <strong>Also good:</strong> A family member.
        <br /><br />
        <strong style={{ color: "#DC2626" }}>Not:</strong> Another developer. <strong style={{ color: "#DC2626" }}>Not:</strong> Someone who watched you build it.
      </Callout>

      <div className="hk-card hk-pulse" style={{
        background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: 16,
        padding: "22px 24px", marginBottom: 16, boxShadow: "0 6px 20px rgba(245,158,11,0.2)"
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#92400E", letterSpacing: 1.5, marginBottom: 10 }}>⚖️ THE ONE RULE</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#78350F", marginBottom: 12 }}>Do not help them.</div>
        <div style={{ fontSize: 15, color: "#92400E", lineHeight: 1.8, marginBottom: 12 }}>
          Not one word. Not one point. Not "the button is over there."
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: 14, fontSize: 14.5, color: "#78350F", lineHeight: 1.8, marginBottom: 10 }}>
          Give them the device. Say: <em>"This is an app for [your domain]. Try using it."</em>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#78350F" }}>Then — be silent. Watch. Take notes.</div>
      </div>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>📋 What to observe — print this or open on your phone</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {OBSERVE_ITEMS.map(item => (
            <div key={item} style={{ fontSize: 14, color: "#374151", display: "flex", gap: 8 }}>
              <span>□</span><span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8 }}>After the test — what did you observe?</div>
      <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 8 }}>What confused them? What worked well?</div>
      <textarea
        value={notes}
        onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
        placeholder="They got confused when they tried to... They found it easy to... I need to fix..."
        style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14.5, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit", marginBottom: 16 }}
      />

      <Callout icon="💡" variant="success">
        Every confusion is feedback. Every hesitation is a signal.
        <br /><br />
        If they could not figure something out — that is not their problem. That is your app's problem.
        <br /><br />
        <strong>A good product does not need a manual.</strong>
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
          <input type="checkbox" checked={shown} onChange={() => toggle("shown")} />
          I showed the app to one real person
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
          <input type="checkbox" checked={watched} onChange={() => toggle("watched")} />
          I watched without helping them
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: notes.trim() ? "pointer" : "not-allowed", opacity: notes.trim() ? 1 : 0.5 }}>
          <input type="checkbox" checked={wroteNotes} onChange={() => toggle("wroteNotes")} disabled={!notes.trim()} />
          I wrote down what I observed
        </label>
        {!notes.trim() && <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 6 }}>Write your observations above to check this off.</div>}
      </div>

      {allChecked && (
        <div className="hk-slide-in"><RunButton onClick={() => { playSound("tick"); onNext(); }}>Write your README →</RunButton></div>
      )}
    </div>
  );
}

function UserTestScene({ notesLen, checks }) {
  const lineThresholds = [10, 40, 90];
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div className="hk-bounce" style={{ fontSize: 42 }}>🧑</div>
          <div style={{ fontSize: 30, marginTop: -8 }}>📱</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: 700 }}>Real person, testing</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", fontSize: 38, display: "inline-block" }}>
            🧑‍💻
            <span className="hk-dotpulse" style={{ position: "absolute", top: -8, right: -14, fontSize: 15 }}>🤫</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>Observing... ✅</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8" }}>Not helping 🚫🗣️</div>
        </div>
      </div>

      <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14, boxShadow: "0 4px 14px rgba(15,23,42,0.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", marginBottom: 8, letterSpacing: 0.6 }}>📝 OBSERVATION NOTEPAD</div>
        {lineThresholds.map((t, i) => (
          <div key={i} className={notesLen > t ? "hk-pop" : ""} style={{
            height: 8, borderRadius: 4, marginBottom: 8,
            width: notesLen > t ? `${60 + i * 12}%` : "0%",
            background: "#CBD5E1", transition: "width 0.3s ease"
          }} />
        ))}
        {notesLen > 0 && notesLen <= 90 && <div className="hk-blink" style={{ display: "inline-block", width: 2, height: 10, background: "#7C3AED" }} />}
        {notesLen === 0 && <div style={{ fontSize: 12, color: "#CBD5E1" }}>Waiting for notes...</div>}
      </div>

      <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", marginBottom: 8, letterSpacing: 0.6 }}>SIGNS TO WATCH FOR</div>
        <div style={{ fontSize: 12.5, color: "#166534", marginBottom: 5 }}>✅ Completed task without help</div>
        <div style={{ fontSize: 12.5, color: "#166534", marginBottom: 5 }}>✅ Understood button labels</div>
        <div style={{ fontSize: 12.5, color: "#92400E", marginBottom: 5 }}>⚠️ Confused by this screen</div>
        <div style={{ fontSize: 12.5, color: "#92400E" }}>⚠️ Looked for missing button</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — README
// ═══════════════════════════════════════════════════════════════════════════
const BACKEND_README = `# [Your Project Name] — Backend

## What this is
A Spring Boot REST API for [your domain description —
e.g. "a gym management system that lets an owner
manage members, plans, and payments"].

## Tech stack
- Java + Spring Boot
- Spring Security + JWT authentication
- MySQL — database: [your database name]
- Maven

## API Endpoints
| Method | Endpoint              | Description         |
|--------|------------------------|----------------------|
| POST   | /api/auth/login         | Login, returns JWT   |
| GET    | /api/[resource]         | List all [resource]  |
| POST   | /api/[resource]         | Add a [resource]     |
| PUT    | /api/[resource]/{id}    | Update a [resource]  |
| DELETE | /api/[resource]/{id}    | Delete a [resource]  |

## Running locally
1. Clone this repo
2. Set your MySQL credentials in application.properties
3. mvn spring-boot:run
4. API runs on http://localhost:8080

## Author
[Your name]`;

const FRONTEND_README = `# [Your Project Name] — Frontend

## What this is
A React frontend for [your domain description].

## Features
- Login screen with JWT authentication
- [Your feature 1]
- [Your feature 2]
- [Your feature 3]

## Tech stack
- React — useState + useEffect
- fetch() calling the Spring Boot backend

## Running locally
1. Clone this repo
2. npm install
3. npm run dev
4. Connects to backend at http://localhost:8080

## Author
[Your name]`;

const BACKEND_FILL = ["Your project name", "Your domain description", "Your database name", "Your API endpoints (from your controller)"];
const FRONTEND_FILL = ["Your project name", "Your features list"];

function Step2({ state, setState, playSound, onNext }) {
  const { backendFill, frontendFill, backendDone, frontendDone } = state;
  const allChecked = backendDone && frontendDone;
  const prevAll = useRef(false);
  useEffect(() => {
    if (allChecked && !prevAll.current) playSound("correct");
    prevAll.current = allChecked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const toggleFill = (which, i) => {
    setState(s => ({ ...s, [which]: { ...s[which], [i]: !s[which][i] } }));
    playSound("tick");
  };
  const toggleDone = (key) => {
    setState(s => ({ ...s, [key]: !s[key] }));
    playSound("add");
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>📄 Write your README — every professional project has one</div>

      <Callout icon="📖" title="Why README" variant="info">
        A README explains your project to anyone who finds it on GitHub. A potential employer. A mentor reviewing your work. You yourself in 6 months.
        <br /><br />
        <strong>Good README = professional developer. No README = student project.</strong>
      </Callout>

      <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 8 }}>BACKEND README TEMPLATE</div>
      <CopyBlock text={BACKEND_README} playSound={playSound} />
      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>FILL IN:</div>
        {BACKEND_FILL.map((item, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer", marginBottom: 4 }}>
            <input type="checkbox" checked={!!backendFill[i]} onChange={() => toggleFill("backendFill", i)} />{item}
          </label>
        ))}
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 8 }}>FRONTEND README TEMPLATE</div>
      <CopyBlock text={FRONTEND_README} playSound={playSound} />
      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>FILL IN:</div>
        {FRONTEND_FILL.map((item, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer", marginBottom: 4 }}>
            <input type="checkbox" checked={!!frontendFill[i]} onChange={() => toggleFill("frontendFill", i)} />{item}
          </label>
        ))}
      </div>

      <Callout icon="🗂️" title="How to add" variant="tip">
        Create README.md in <strong>both</strong> repos:
        <br /><br />
        Backend root folder: <code>gymapp-backend/README.md</code>
        <br />
        Frontend root folder: <code>gymapp-frontend/README.md</code>
      </Callout>
      <CodeBlock style={{ marginBottom: 16 }}>
        <div>git add README.md</div>
        <div>git commit -m "add README"</div>
        <div>git push origin main</div>
      </CodeBlock>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
          <input type="checkbox" checked={backendDone} onChange={() => toggleDone("backendDone")} />
          Backend README created and pushed
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
          <input type="checkbox" checked={frontendDone} onChange={() => toggleDone("frontendDone")} />
          Frontend README created and pushed
        </label>
      </div>

      {allChecked && (
        <div className="hk-slide-in"><RunButton onClick={() => { playSound("tick"); onNext(); }}>Go to Deploy v2 gate →</RunButton></div>
      )}
    </div>
  );
}

function GithubReadmeVisual({ backendDone, frontendDone }) {
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <div className="hk-card" style={{ background: "#0F172A", borderRadius: "10px 10px 0 0", padding: "8px 12px", display: "flex", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399" }} />
      </div>
      <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14, marginBottom: 14 }}>
        {["src/", "package.json", ".gitignore"].map(f => (
          <div key={f} style={{ fontSize: 13, color: "#64748B", padding: "5px 0", borderBottom: "1px solid #F1F5F9" }}>📁 {f}</div>
        ))}
        <div className={backendDone || frontendDone ? "hk-pop" : ""} style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", padding: "5px 0", display: "flex", alignItems: "center", gap: 6 }}>
          📄 README.md {(backendDone || frontendDone) && <span style={{ color: "#10B981", fontSize: 11 }}>✓ pushed</span>}
        </div>
      </div>
      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}># GymApp {backendDone && frontendDone ? "— Full Stack" : ""}</div>
        <div style={{ height: 6, width: "80%", background: "#E2E8F0", borderRadius: 3, marginBottom: 6 }} />
        <div style={{ height: 6, width: "60%", background: "#E2E8F0", borderRadius: 3, marginBottom: 10 }} />
        <div style={{ fontSize: 11, color: "#94A3B8" }}>## Tech stack</div>
        <div style={{ height: 6, width: "70%", background: "#E2E8F0", borderRadius: 3, marginTop: 6 }} />
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>What employers and mentors see when they open your GitHub</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — DEPLOY v2 GATE
// ═══════════════════════════════════════════════════════════════════════════
const FEATURE_EXAMPLES = ["Add member", "View members list", "Edit / delete member"];
const GATE_ITEMS = [
  { key: "connected", label: "React frontend connects to Spring Boot backend — login works, data loads" },
  { key: "jwt", label: "Login with JWT works end to end — login → token → protected data" },
  { key: "features", label: "All 3 MVP features work" },
  { key: "realPerson", label: "At least one real person has used the app (from Step 1)" },
  { key: "bothRepos", label: "Both repos on GitHub (backend + frontend)" },
  { key: "bothReadmes", label: "Both repos have a README" },
  { key: "commits", label: "Commits are meaningful (not just \"update\" or \"fix\") — 8+ backend, 5+ frontend" },
];

function Step3({ state, setState, playSound, onNext, userTestDone, readmesDone }) {
  const { checks, feat1, feat2, feat3, backendUrl, frontendUrl } = state;
  const featuresFilled = feat1.trim() && feat2.trim() && feat3.trim();
  const doneCount = Object.values(checks).filter(Boolean).length;
  const allSeven = doneCount === GATE_ITEMS.length;
  const urlsFilled = backendUrl.trim() && frontendUrl.trim();
  const prevAll = useRef(false);

  useEffect(() => {
    if (checks.realPerson === undefined && userTestDone) setState(s => ({ ...s, checks: { ...s.checks, realPerson: false } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allSeven && !prevAll.current) playSound("correct");
    prevAll.current = allSeven;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSeven]);

  const toggle = (key) => {
    if (key === "features" && !checks.features && !featuresFilled) return;
    setState(s => ({ ...s, checks: { ...s.checks, [key]: !s.checks[key] } }));
    playSound("add");
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🚪 Deploy v2 — seven checks with your mentor</div>

      <Callout icon="🔒" variant="neutral">
        Go through each item with your mentor. Every bolt turns green as you check it off — all seven, and the gate to Module 5 swings open.
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {GATE_ITEMS.map(item => (
          <div key={item.key} style={{ marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14.5, cursor: (item.key === "features" && !featuresFilled) ? "not-allowed" : "pointer", opacity: (item.key === "features" && !featuresFilled) ? 0.5 : 1 }}>
              <input type="checkbox" checked={!!checks[item.key]} disabled={item.key === "features" && !featuresFilled}
                onChange={() => toggle(item.key)} style={{ marginTop: 3 }} />
              <span>{item.label}</span>
            </label>
            {item.key === "features" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, marginLeft: 26 }}>
                {["feat1", "feat2", "feat3"].map((f, i) => (
                  <input key={f} value={state[f]} onChange={e => setState(s => ({ ...s, [f]: e.target.value }))}
                    placeholder={`Feature ${i + 1} — e.g. ${FEATURE_EXAMPLES[i]}`}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13.5, boxSizing: "border-box" }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Backend repo URL:</div>
      <input value={backendUrl} onChange={e => setState(s => ({ ...s, backendUrl: e.target.value }))}
        placeholder="https://github.com/yourname/gymapp-backend"
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Frontend repo URL:</div>
      <input value={frontendUrl} onChange={e => setState(s => ({ ...s, frontendUrl: e.target.value }))}
        placeholder="https://github.com/yourname/gymapp-frontend"
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, boxSizing: "border-box", marginBottom: 16 }} />

      {allSeven && urlsFilled && (
        <div className="hk-slide-in"><RunButton onClick={() => { playSound("tick"); onNext(); }}>Module 4 complete →</RunButton></div>
      )}
      {allSeven && !urlsFilled && <div style={{ fontSize: 13, color: "#94A3B8" }}>Add both GitHub URLs above to continue.</div>}
    </div>
  );
}

function GateVisual({ checks }) {
  const doneCount = Object.values(checks).filter(Boolean).length;
  const open = doneCount === GATE_ITEMS.length;
  return (
    <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 18, flexWrap: "wrap" }}>
        {GATE_ITEMS.map((item, i) => (
          <div key={item.key} className={checks[item.key] ? "hk-pop" : ""} style={{
            width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800,
            background: checks[item.key] ? "linear-gradient(135deg,#10B981,#059669)" : "#E2E8F0",
            color: checks[item.key] ? "#fff" : "#94A3B8",
            boxShadow: checks[item.key] ? "0 0 0 4px rgba(16,185,129,0.18)" : "none",
            transition: "all 0.3s ease"
          }}>{checks[item.key] ? "✓" : i + 1}</div>
        ))}
      </div>

      <div style={{ position: "relative", height: 190, borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg,#FEF3C7,#FDE68A)", border: "2px solid #92400E" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#78350F", letterSpacing: 1 }}>MODULE 5 →</div>
          <div style={{ fontSize: 22 }}>🌐 🤖 🎬</div>
        </div>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: "linear-gradient(135deg,#4C1D95,#1E293B)", borderRight: "2px solid #F59E0B",
          display: "flex", alignItems: "center", justifyContent: "center",
          transformOrigin: "left center", transform: open ? "perspective(700px) rotateY(-108deg)" : "rotateY(0deg)",
          transition: "transform 1.1s cubic-bezier(.34,1.56,.64,1)"
        }}><span style={{ fontSize: 24 }}>🔒</span></div>
        <div style={{
          position: "absolute", top: 0, left: "50%", width: "50%", height: "100%",
          background: "linear-gradient(225deg,#4C1D95,#1E293B)", borderLeft: "2px solid #F59E0B",
          display: "flex", alignItems: "center", justifyContent: "center",
          transformOrigin: "right center", transform: open ? "perspective(700px) rotateY(108deg)" : "rotateY(0deg)",
          transition: "transform 1.1s cubic-bezier(.34,1.56,.64,1)"
        }}><span style={{ fontSize: 24 }}>🔒</span></div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: open ? "#16A34A" : "#94A3B8", marginTop: 10 }}>
        {open ? "✅ Gate open — Module 5 unlocked" : `${doneCount}/${GATE_ITEMS.length} bolts turned`}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — MODULE 4 COMPLETE
// ═══════════════════════════════════════════════════════════════════════════
const BUILT_ITEMS = [
  ["✅ HTML", "skeleton of web pages"],
  ["✅ CSS", "appearance and layout"],
  ["✅ JavaScript", "7 core concepts"],
  ["✅ React components", "LEGO blocks"],
  ["✅ useState", "memory that updates"],
  ["✅ useEffect", "load data on mount"],
  ["✅ fetch()", "call Spring Boot"],
  ["✅ Login screen", "with JWT"],
  ["✅ Add member form", "validated, connected"],
  ["✅ All screens", "navigate between them"],
  ["✅ Error handling", "kind messages"],
  ["✅ Real person tested the app", "watched, not helped"],
];

function Step4({ reflection, setReflection, onSubmit, submitted, playSound }) {
  const sentenceCount = reflection.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length;
  const reflectionOk = sentenceCount >= 2;
  const [ticked, setTicked] = useState([]);

  useEffect(() => {
    playSound("reveal");
    BUILT_ITEMS.forEach((_, i) => {
      setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 400);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      background: "linear-gradient(180deg,#E1F5EE,#fff)", border: "1px solid #A7F3D0", borderRadius: 20,
      padding: "32px 26px", marginBottom: 24
    }}>
      <div style={{ fontSize: 30, fontWeight: 900, color: "#065F46", textAlign: "center", marginBottom: 4 }}>Module 4 Complete. 🚀</div>
      <div style={{ fontSize: 14.5, color: "#047857", textAlign: "center", marginBottom: 24 }}>Full stack. Real user. Real deploy.</div>

      <div style={{ maxWidth: 480, margin: "0 auto 20px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>WEEK-BY-WEEK</div>
        <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 2 }}>
          Week 1: Problem Card, paper sketch<br />
          Week 2: Java fundamentals<br />
          Week 3-4: Spring Boot REST API + MySQL<br />
          Week 5: Spring Security + JWT<br />
          <strong>Week 5-6: ← YOU ARE HERE</strong>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto 20px" }}>
        {BUILT_ITEMS.map(([term, def], i) => (
          <div key={i} className={ticked.includes(i) ? "hk-pop" : ""} style={{
            display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10,
            opacity: ticked.includes(i) ? 1 : 0.15, transition: "opacity 0.4s"
          }}>
            <span style={{ fontSize: 15 }}>{ticked.includes(i) ? term.slice(0, 2) : "○"}</span>
            <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term.slice(2).trim()}</span>{" — "}<span style={{ color: "#374151" }}>{def}</span></div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #A7F3D0", margin: "20px 0" }} />
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", fontSize: 15.5, fontWeight: 700, color: "#065F46", lineHeight: 1.8 }}>
        This is Deploy v2.<br />
        React + Spring Boot + MySQL + JWT. Running locally.<br />
        A real person has used it. Both repos on GitHub.
      </div>
      <div style={{ borderTop: "1px dashed #A7F3D0", margin: "20px 0" }} />

      <div className="hk-card" style={{
        maxWidth: 480, margin: "0 auto 24px", background: "linear-gradient(180deg,#FFFBEB,#FEF3C7)",
        border: "2px solid #F59E0B", borderRadius: 16, padding: 20
      }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#78350F", marginBottom: 14, textAlign: "center" }}>What Module 5 builds</div>
        <div style={{ fontSize: 13.5, color: "#78350F", lineHeight: 1.9 }}>
          🌐 <strong>Deploy to the internet</strong> — A real URL, not just localhost. Your gym owner opens it on their phone.
          <br /><br />
          🤖 <strong>One AI feature</strong> — Call Gemini or OpenAI. One endpoint that thinks. Something that makes the business owner say wow.
          <br /><br />
          🎬 <strong>Record your demo</strong> — 3-minute video. Your answer to "tell me about your project."
          <br /><br />
          📬 <strong>Show the live app to your client</strong> — Their reaction is your real grade.
        </div>
      </div>

      {!submitted && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8 }}>
            In 2 sentences — describe what your full stack app does and what technology powers it.
          </div>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            onPaste={e => e.preventDefault()}
            placeholder="My gym management app allows the gym owner to login securely, view all members, add new members, and edit or delete existing ones — powered by React frontend, Spring Boot backend, MySQL database, and JWT authentication..."
            style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 15, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ fontSize: 13, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 16 }}>
            {sentenceCount} sentence{sentenceCount === 1 ? "" : "s"} {reflectionOk ? "✓" : "(minimum 2 sentences)"}
          </div>
          <RunButton onClick={onSubmit} disabled={!reflectionOk}>Deploy v2 complete — ready for Module 5 →</RunButton>
        </div>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ maxWidth: 480, margin: "0 auto", background: "#fff", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.25)" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#065F46", textAlign: "center", marginBottom: 12 }}>Full stack developer.</div>
          <div style={{ fontSize: 15, color: "#065F46", lineHeight: 1.9, textAlign: "center" }}>
            You are no longer a student who learned about these things.
            <br /><br />
            You built: A real backend API. Real authentication. A real frontend. Real data. Real users.
            <br /><br />
            <strong>The gym owner used your app.</strong>
            <br /><br />
            <span style={{ fontSize: 17, fontWeight: 900, color: "#78350F" }}>Module 5 — make it live.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ShowToRealPerson() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const [muted, setMuted] = useState(false);
  const soundRef = useRef(null);
  const playSound = (t) => {
    try {
      if (!soundRef.current) soundRef.current = createSound(muted);
      if (muted) return;
      soundRef.current(t);
    } catch (_) {}
  };

  const [slot, setSlot] = useState(1);

  const [step1, setStep1] = useState({ shown: false, watched: false, notes: "", wroteNotes: false });
  const [step2, setStep2] = useState({ backendFill: {}, frontendFill: {}, backendDone: false, frontendDone: false });
  const [step3, setStep3] = useState({ checks: {}, feat1: "", feat2: "", feat3: "", backendUrl: "", frontendUrl: "" });

  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t3-s3-show-to-real-person",
      exerciseType: "interactive",
      status: "completed",
      score: 4,
      maxScore: 4,
      answers: {
        steps: {
          userTestDone: step1.shown && step1.watched && step1.wroteNotes,
          watchedWithoutHelping: step1.watched,
          observationsNoted: step1.notes,
          backendReadmeDone: step2.backendDone,
          frontendReadmeDone: step2.frontendDone,
        },
        gate: {
          reactConnectedToSpringBoot: !!step3.checks.connected,
          jwtLoginWorks: !!step3.checks.jwt,
          allThreeFeaturesWork: !!step3.checks.features,
          realPersonTested: !!step3.checks.realPerson,
          bothReposOnGitHub: !!step3.checks.bothRepos,
          bothReposHaveReadme: !!step3.checks.bothReadmes,
          meaningfulCommits: !!step3.checks.commits,
        },
        githubUrls: {
          backend: step3.backendUrl,
          frontend: step3.frontendUrl,
        },
        reflectionText: reflection,
      },
      metadata: { subtopicId, taskId },
      completedAt: new Date().toISOString(),
    }, "*");
  }, [submitted]);

  const handleSubmit = () => {
    playSound("submit");
    setSubmitted(true);
    setTimeout(() => playSound("reveal"), 50);
    setTimeout(() => playSound("correct"), 2050);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.9); opacity:0.5; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(245,158,11,0.45); } 70% { box-shadow:0 0 0 10px rgba(245,158,11,0); } 100% { box-shadow:0 0 0 0 rgba(245,158,11,0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bounceY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes dotPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.8); } }
        @keyframes blinkCursor { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-slide-in { animation: slideInRight 0.5s ease; }
        .hk-bounce { animation: bounceY 1.4s ease-in-out infinite; display: inline-block; }
        .hk-dotpulse { animation: dotPulse 1.2s ease-in-out infinite; display: inline-block; }
        .hk-blink { animation: blinkCursor 1s step-end infinite; }
        .hk-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hk-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .hk-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(30,41,59,0.28); }
        .hk-btn:active:not(:disabled) { transform: translateY(0); }
        textarea, input, select { font-family: inherit; }
        @media (max-width: 720px) {
          .split-panel { flex-direction: column !important; }
          .split-right { position: static !important; }
        }
      `}</style>

      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }} className="hk-btn"
        style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: "#1E293B", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 18 }}>
        {muted ? "🔇" : "🔊"}
      </button>

      <div style={{ background: "linear-gradient(135deg,#78350F,#1E293B 55%,#0F172A)", color: "#fff", padding: "32px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.35),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,0.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13.5, color: "#FDE68A", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🚪 SUBTOPIC 4.3.3 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>👤 Show It To A Real Person — Deploy v2 Gate</div>
          <div style={{ fontSize: 15.5, color: "#FEF3C7" }}>Your final Module 4 milestone. Ravi, this is the real thing.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {slot < 4 && <ProgressBar slot={slot} />}

        {slot === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Step1 state={step1} setState={setStep1} playSound={playSound} onNext={() => setSlot(2)} />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption="Silent observation — notes fill in as you type on the left">
                  <UserTestScene notesLen={step1.notes.length} checks={step1} />
                </Stage>
              </div>
            </div>
          </div>
        )}

        {slot === 2 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Step2 state={step2} setState={setStep2} playSound={playSound} onNext={() => setSlot(3)} />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption="Your GitHub repo, as employers see it">
                  <GithubReadmeVisual backendDone={step2.backendDone} frontendDone={step2.frontendDone} />
                </Stage>
              </div>
            </div>
          </div>
        )}

        {slot === 3 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Step3 state={step3} setState={setStep3} playSound={playSound} onNext={() => setSlot(4)}
                userTestDone={step1.shown && step1.watched && step1.wroteNotes} readmesDone={step2.backendDone && step2.frontendDone} />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption="Seven bolts. All green — the gate opens.">
                  <GateVisual checks={step3.checks} />
                </Stage>
              </div>
            </div>
          </div>
        )}

        {slot === 4 && (
          <Step4 reflection={reflection} setReflection={setReflection} onSubmit={handleSubmit} submitted={submitted} playSound={playSound} />
        )}
      </div>
    </div>
  );
}
