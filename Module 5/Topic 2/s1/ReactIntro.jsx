import { useState, useEffect, useRef } from "react";

// ─── SOUND ───────────────────────────────────────────────────────────────────
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

// ─── CALLOUT ─────────────────────────────────────────────────────────────────
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
      borderRadius: 12, padding: "14px 18px", marginBottom: 14, fontSize: 13, lineHeight: 1.75, color: v.color, ...style
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 11, letterSpacing: 0.6, marginBottom: 8, color: v.accent, textTransform: "uppercase" }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </div>
      )}
      {!title && icon && <span style={{ fontSize: 16, marginRight: 8 }}>{icon}</span>}
      {children}
    </div>
  );
}

// ─── SCENE STEPPER ───────────────────────────────────────────────────────────
const SCENES = [
  { label: "Old Way", icon: "📰" },
  { label: "React Way", icon: "📡" },
  { label: "Components", icon: "🧱" },
  { label: "Check", icon: "✅" },
];
function Stepper({ index }) {
  const pct = Math.max(0, Math.min(100, (index / (SCENES.length - 1)) * 100));
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 17, left: 17, right: 17, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 17, left: 17, height: 4, borderRadius: 2, width: `calc(${pct}% - ${pct === 0 ? 0 : 34 * (pct / 100)}px)`, background: "linear-gradient(90deg,#7C3AED,#2563EB)", transition: "width 0.5s ease" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {SCENES.map((s, i) => {
            const done = i < index, active = i === index;
            return (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                <div className={active ? "hk-pulse" : ""} style={{
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #DDD6FE" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>{done ? "✓" : s.icon}</div>
                <div style={{ marginTop: 5, fontSize: 10, fontWeight: 700, textAlign: "center", color: done ? "#059669" : active ? "#1E293B" : "#94A3B8" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RunButton({ onClick, children, disabled, variant = "primary" }) {
  const bg = variant === "danger" ? "linear-gradient(135deg,#DC2626,#991B1B)"
    : variant === "success" ? "linear-gradient(135deg,#10B981,#059669)"
    : "linear-gradient(135deg,#7C3AED,#2563EB)";
  return (
    <button onClick={onClick} disabled={disabled} className="hk-btn" style={{
      padding: "12px 22px", borderRadius: 12, border: "none",
      background: disabled ? "#CBD5E1" : bg, color: "#fff", fontWeight: 800, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 6px 16px rgba(124,58,237,0.3)"
    }}>{children}</button>
  );
}

// ─── STAGE WRAPPER — right panel visual frame ───────────────────────────────
function Stage({ children, caption }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>👀</span> WATCH WHAT HAPPENS
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, background: "#F1F5F9",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 380,
        display: "flex", flexDirection: "column", padding: 18
      }}>
        {children}
      </div>
      <div style={{ minHeight: 34, marginTop: 10, textAlign: "center" }}>
        {caption && (
          <div key={caption} className="hk-pop" style={{
            display: "inline-block", fontSize: 13, fontWeight: 800, color: "#1E293B",
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: 999, padding: "8px 16px",
            boxShadow: "0 4px 12px rgba(15,23,42,0.08)"
          }}>{caption}</div>
        )}
      </div>
    </div>
  );
}

// ─── GYM MOCKUP — reused in scene 1 & 2 ──────────────────────────────────────
function GymMockup({ redFlash, greenPulse, whiteFlash, raviStatus }) {
  const sections = ["header", "nav", "content", "footer"];
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "2px solid #CBD5E1", background: "#fff" }}>
      {whiteFlash && (
        <div className="hk-whiteflash" style={{
          position: "absolute", inset: 0, background: "#fff", zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10
        }}>
          <div className="hk-spinner" />
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>📥 Downloading whole page...</div>
        </div>
      )}

      <div style={{
        background: redFlash === "header" ? "#DC2626" : "#1A3C6E", color: "#fff", padding: "10px 14px", fontSize: 13, fontWeight: 800,
        transition: "background 0.25s ease", position: "relative"
      }}>
        🏋️ SaiFit Gym App
        {redFlash === "header" && <span className="hk-badge-bad">Reloaded ❌</span>}
      </div>

      <div style={{
        background: redFlash === "nav" ? "#DC2626" : "#E2E8F0", color: redFlash === "nav" ? "#fff" : "#374151",
        padding: "8px 14px", fontSize: 11, fontWeight: 700, display: "flex", gap: 14, transition: "background 0.25s ease", position: "relative"
      }}>
        <span>Members</span><span>Plans</span><span>Reports</span>
        {redFlash === "nav" && <span className="hk-badge-bad">Reloaded ❌</span>}
      </div>

      <div style={{
        padding: 12, background: redFlash === "content" ? "#FEF2F2" : "#fff", transition: "background 0.25s ease", position: "relative"
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", marginBottom: 6 }}>MEMBERS LIST</div>
        {redFlash === "content" && <span className="hk-badge-bad" style={{ top: -4 }}>Reloaded ❌ — only 1 row changed!</span>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <tbody>
            <tr className={greenPulse ? "hk-row-pulse" : ""} style={{ background: greenPulse ? undefined : "transparent" }}>
              <td style={{ padding: "6px 4px", fontWeight: 700 }}>Ravi Kumar</td>
              <td style={{ padding: "6px 4px", color: "#64748B" }}>Basic</td>
              <td style={{ padding: "6px 4px", fontWeight: 700, color: raviStatus === "Inactive" ? "#DC2626" : "#059669" }}>{raviStatus}</td>
            </tr>
            <tr style={{ background: "#F9FAFB" }}>
              <td style={{ padding: "6px 4px", fontWeight: 700 }}>Suresh</td>
              <td style={{ padding: "6px 4px", color: "#64748B" }}>Premium</td>
              <td style={{ padding: "6px 4px", fontWeight: 700, color: "#059669" }}>Active</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 4px", fontWeight: 700 }}>Priya</td>
              <td style={{ padding: "6px 4px", color: "#64748B" }}>Basic</td>
              <td style={{ padding: "6px 4px", fontWeight: 700, color: "#DC2626" }}>Inactive</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{
        background: redFlash === "footer" ? "#DC2626" : "#F1F5F9", color: redFlash === "footer" ? "#fff" : "#94A3B8",
        padding: "8px 14px", fontSize: 10, fontWeight: 700, transition: "background 0.25s ease", position: "relative"
      }}>
        © 2025 SaiFit
        {redFlash === "footer" && <span className="hk-badge-bad">Reloaded ❌</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — REACT WAY (only what changed)
// ═══════════════════════════════════════════════════════════════════════════
function Scene2({ onNext, playSound, run, done }) {
  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>📡 React — only what changed updates</div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>Same app, same button. Watch closely — it's fast.</div>

      <RunButton onClick={run} variant="success" disabled={done}>Mark Ravi as Inactive →</RunButton>

      {done && (
        <div style={{ marginTop: 18, animation: "slideIn 0.4s ease" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Header: untouched ✅</span>
            <span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Nav: untouched ✅</span>
            <span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Footer: untouched ✅</span>
            <span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Only this row updated ✅</span>
          </div>

          <Callout icon="⚡" variant="success">
            Only Ravi's row was updated. Header, Nav, Footer — never touched.<br /><br />
            No white flash. No waiting. <strong>Feels instant.</strong><br /><br />
            Like a news ticker — only the new headline updates.
          </Callout>

          <div className="hk-card" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: "1 1 200px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#DC2626", marginBottom: 6 }}>OLD WAY</div>
              <div style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 1.9 }}>
                ❌ Full page reload<br />❌ White flash<br />❌ Server sends everything<br />❌ You lose your place<br /><strong>⏱ 1–3 seconds</strong>
              </div>
            </div>
            <div style={{ flex: "1 1 200px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#059669", marginBottom: 6 }}>REACT WAY</div>
              <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.9 }}>
                ✅ Only changed parts update<br />✅ No flash<br />✅ Server sends just data (JSON)<br />✅ You stay where you are<br /><strong>⏱ milliseconds</strong>
              </div>
            </div>
          </div>

          <RunButton onClick={() => { playSound("tick"); onNext(); }}>What makes this possible? →</RunButton>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — COMPONENTS (LEGO) + FULL STACK FLOW
// ═══════════════════════════════════════════════════════════════════════════
const LEGO_BLOCKS = [
  { key: "header", label: "HeaderComponent", color: "#1A3C6E", grid: "1 / 1 / 2 / 4", caption: "HeaderComponent re-renders only if header data changes" },
  { key: "nav", label: "NavComponent", color: "#7C3AED", grid: "2 / 1 / 4 / 2", caption: "NavComponent almost never re-renders — the menu rarely changes" },
  { key: "list", label: "MembersListComponent", color: "#0EA5E9", grid: "2 / 2 / 3 / 4", caption: "MembersListComponent holds all the rows" },
  { key: "row1", label: "MemberRowComponent", color: "#10B981", grid: "3 / 2 / 4 / 4", caption: "Only THIS MemberRowComponent re-renders when Ravi's status changes" },
  { key: "footer", label: "FooterComponent", color: "#94A3B8", grid: "4 / 1 / 5 / 4", caption: "FooterComponent — practically never re-renders" },
];

function Scene3({ onNext, playSound, componentSeen, phase, setPhase, runFlow, flowStep }) {
  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>🧱 Components — LEGO blocks for your screen</div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>Tap each block in the picture on the right to see what it's responsible for.</div>

      <Callout icon="🧩" variant="tip">
        React breaks your app into components. Each component = one piece of UI — like a LEGO block.<br /><br />
        When Ravi's row needs to update — only <strong>MemberRowComponent</strong> re-renders. Everything else stays.<br /><br />
        You'll build components in 4.1.2.
      </Callout>

      {phase === "lego" && (
        <RunButton onClick={() => { playSound("tick"); setPhase("flow"); }} disabled={!componentSeen}>
          See the full stack →
        </RunButton>
      )}

      {phase === "flow" && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>🔌 Where your React app fits</div>
          <RunButton onClick={runFlow} disabled={flowStep > 0 && flowStep < 5}>Run the flow →</RunButton>

          {flowStep >= 5 && (
            <div style={{ marginTop: 16, animation: "slideIn 0.4s ease" }}>
              <Callout icon="🏗️" variant="success">
                Your Spring Boot API is ready. Your JWT security is ready. Your MySQL data is ready.<br /><br />
                Module 4 builds the React app that connects to all of it.<br /><br />
                The gym owner opens a browser. Types login. Sees their members.<br /><br />
                <strong>Full stack. Your app. Real.</strong>
              </Callout>
              <RunButton onClick={() => { playSound("tick"); onNext(); }}>Test your understanding →</RunButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UNDERSTANDING CHECK
// ═══════════════════════════════════════════════════════════════════════════
const QUIZ = [
  { q: "Why does React NOT reload the whole page when data changes?", options: [
    ["A", "React downloads a new page but faster"],
    ["B", "React keeps the page in memory and updates only what changed"],
    ["C", "React asks Spring Boot to send a new page"],
    ["D", "React uses MySQL directly"]
  ], correct: "B", wrongMsg: "React keeps the page in memory. When something changes — only that part updates." },
  { q: "What is a React component?", options: [
    ["A", "A Java class"],
    ["B", "A Spring Boot endpoint"],
    ["C", "A reusable piece of UI — like a LEGO block"],
    ["D", "A MySQL table"]
  ], correct: "C", wrongMsg: "A component is a reusable piece of UI — like a LEGO block." },
  { q: "After Module 4 — how does your gym app get its data?", options: [
    ["A", "React reads MySQL directly"],
    ["B", "React calls your Spring Boot API with JWT token — gets JSON — displays on screen"],
    ["C", "Spring Boot sends HTML pages to the browser"],
    ["D", "MySQL sends data directly to the browser"]
  ], correct: "B", wrongMsg: "React calls your Spring Boot API with a JWT token, gets JSON back, and displays it." },
];

function CheckPhase({ playSound, quizAnswers, setQuizAnswers, attempts, setAttempts, reflection, setReflection, onSubmit, submitted }) {
  const allCorrect = QUIZ.every((item, i) => quizAnswers[i] === item.correct);
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const [allCorrectPlayed, setAllCorrectPlayed] = useState(false);

  const answer = (i, opt) => {
    setAttempts(a => { const next = [...a]; next[i] = (next[i] || 0) + 1; return next; });
    setQuizAnswers(prev => ({ ...prev, [i]: opt }));
    playSound(opt === QUIZ[i].correct ? "correct" : "warn");
  };

  useEffect(() => {
    if (allCorrect && !allCorrectPlayed) { playSound("correct"); setAllCorrectPlayed(true); }
  }, [allCorrect]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>✅ Understanding check</div>
      {QUIZ.map((item, i) => (
        <div key={i} className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Q{i + 1}. {item.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.options.map(([key, label]) => {
              const picked = quizAnswers[i] === key;
              const isCorrect = key === item.correct;
              return (
                <button key={key} onClick={() => answer(i, key)} className="hk-btn" style={{
                  textAlign: "left", padding: "10px 14px", borderRadius: 8, fontSize: 13,
                  border: picked ? (isCorrect ? "2px solid #059669" : "2px solid #DC2626") : "1px solid #E2E8F0",
                  background: picked ? (isCorrect ? "#ECFDF5" : "#FEF2F2") : "#fff",
                  animation: picked ? (isCorrect ? "popIn 0.35s ease" : "shakeX 0.4s ease") : "none"
                }}>{key}) {label} {picked && (isCorrect ? "✅" : "❌")}</button>
              );
            })}
          </div>
          {quizAnswers[i] && quizAnswers[i] !== item.correct && (
            <Callout icon="🚫" variant="danger" style={{ marginTop: 10, marginBottom: 0 }}>{item.wrongMsg}</Callout>
          )}
        </div>
      ))}

      {allCorrect && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="🎉" variant="success">All 3 correct! Reflection unlocked.</Callout>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            In one sentence — why does your gym owner's experience improve when you use React instead of a traditional website?
          </div>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            onPaste={e => e.preventDefault()}
            placeholder="With React, when the gym owner updates a member's status, only that row changes on screen without reloading the whole page, which feels instant and doesn't interrupt their workflow..."
            style={{ width: "100%", minHeight: 90, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 14, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ fontSize: 12, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 12 }}>
            {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
          </div>

          {!submitted && (
            <RunButton onClick={onSubmit} disabled={!reflectionOk}>I understand React — build components next →</RunButton>
          )}
        </div>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)", marginTop: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>🧩 React is clear.</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            Only what changed updates.<br />
            Components are LEGO blocks.<br />
            Your Spring Boot API is ready for it.<br /><br />
            Next — 4.1.2.<br />
            Build your first React component.<br />
            See JSX for the first time.<br />
            Write a members list that displays real data.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT PANEL STAGES
// ═══════════════════════════════════════════════════════════════════════════
function StageOld({ current, raviStatus }) {
  const captions = {
    white: "📥 Downloading whole page from the server...",
    header: "Header reloaded ❌ — it didn't need to",
    nav: "Nav reloaded ❌ — it didn't need to",
    content: "Content reloaded ❌ — but only ONE row changed",
    footer: "Footer reloaded ❌ — it didn't need to",
    done: "✅ Ravi is Inactive now — but everything else reloaded too"
  };
  return (
    <Stage caption={current ? captions[current] : "👈 Click the button on the left to begin"}>
      <GymMockup
        whiteFlash={current === "white"}
        redFlash={["header", "nav", "content", "footer"].includes(current) ? current : null}
        raviStatus={raviStatus}
      />
    </Stage>
  );
}

function StageReact({ pulsing, raviStatus }) {
  return (
    <Stage caption={pulsing ? "⚡ Only Ravi's row is updating — everything else is frozen" : raviStatus === "Inactive" ? "✅ Done — instantly, no reload" : "👈 Click the button on the left"}>
      <GymMockup greenPulse={pulsing} raviStatus={raviStatus} />
    </Stage>
  );
}

function StageLego({ activeLego, onTap }) {
  const active = LEGO_BLOCKS.find(b => b.key === activeLego);
  return (
    <Stage caption={active ? active.caption : "👈 Tap a block to see what it does"}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "44px 60px 60px 44px", gap: 6, flex: 1 }}>
        {LEGO_BLOCKS.map(b => {
          const isActive = activeLego === b.key;
          const dimmed = activeLego && !isActive;
          return (
            <button key={b.key} onClick={() => onTap(b.key)} className="hk-btn" style={{
              gridArea: b.grid, background: b.color, border: "none", borderRadius: 8,
              color: "#fff", fontSize: 10.5, fontWeight: 800,
              boxShadow: isActive ? "0 0 0 3px #fff, 0 0 0 6px " + b.color + ", 0 8px 18px rgba(0,0,0,0.25)" : "inset 0 -3px 0 rgba(0,0,0,0.2)",
              opacity: dimmed ? 0.3 : 1, transform: isActive ? "scale(1.04)" : "scale(1)",
              transition: "all 0.25s ease", padding: 4
            }}>{b.label}</button>
          );
        })}
      </div>
    </Stage>
  );
}

const FLOW_LABELS = {
  1: "GET /gym/members + Bearer token",
  2: "SELECT * FROM gym_member",
  3: "rows as Java objects",
  4: "JSON array",
  5: "members displayed on screen ✅",
};
function StageFlow({ flowStep }) {
  const boxStyle = (litFrom) => ({
    background: flowStep >= litFrom ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#334155",
    color: "#fff", borderRadius: 12, padding: "16px 14px", textAlign: "center", fontSize: 12, fontWeight: 800,
    minWidth: 90, transition: "background 0.3s ease", boxShadow: flowStep >= litFrom ? "0 6px 16px rgba(124,58,237,0.35)" : "none"
  });
  return (
    <Stage caption={flowStep > 0 ? FLOW_LABELS[flowStep] : "👈 Click Run the flow to see React talk to your backend"}>
      <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={boxStyle(1)}>🖥️<br />React Browser</div>
          <div style={{ textAlign: "center", fontSize: 18, color: flowStep >= 1 ? "#A78BFA" : "#475569" }}>
            {flowStep === 1 ? "➡️" : flowStep === 4 ? "⬅️" : "↔️"}
          </div>
          <div style={boxStyle(2)}>☕<br />Spring Boot</div>
        </div>
        <div style={{ fontSize: 18, color: flowStep >= 2 ? "#A78BFA" : "#475569" }}>{flowStep === 2 ? "⬇️" : flowStep === 3 ? "⬆️" : "↕️"}</div>
        <div style={boxStyle(3)}>🗄️<br />MySQL</div>
      </div>
    </Stage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ReactIntro() {
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

  const [sceneIdx, setSceneIdx] = useState(0); // 0=old,1=react,2=components,3=check
  const [oldWaySeen, setOldWaySeen] = useState(false);
  const [reactWaySeen, setReactWaySeen] = useState(false);
  const [componentSeen, setComponentSeen] = useState(false);
  const [flowSeen, setFlowSeen] = useState(false);

  // Scene1 (old way) state lifted for right-panel stage
  const [oldStep, setOldStep] = useState(-1);
  const [oldStatus, setOldStatus] = useState("Active");
  const oldTimers = useRef([]);
  const runOld = () => {
    playSound("warn");
    oldTimers.current.forEach(clearTimeout);
    oldTimers.current = [];
    const steps = ["white", "header", "nav", "content", "footer", "done"];
    const delays = [0, 900, 1300, 1700, 2100, 2500];
    steps.forEach((s, i) => {
      oldTimers.current.push(setTimeout(() => {
        setOldStep(i);
        if (s === "done") { setOldStatus("Inactive"); setOldWaySeen(true); }
      }, delays[i]));
    });
  };
  useEffect(() => () => oldTimers.current.forEach(clearTimeout), []);
  const oldCurrent = oldStep >= 0 ? ["white", "header", "nav", "content", "footer", "done"][oldStep] : null;

  // Scene2 (react way) state lifted
  const [pulsing, setPulsing] = useState(false);
  const [reactStatus, setReactStatus] = useState("Active");
  const runReact = () => {
    playSound("correct");
    setPulsing(true);
    setTimeout(() => setReactStatus("Inactive"), 120);
    setTimeout(() => { setPulsing(false); setReactWaySeen(true); }, 500);
  };

  // Scene3 lego + flow
  const [activeLego, setActiveLego] = useState(null);
  const [scene3Phase, setScene3Phase] = useState("lego");
  const [flowStep, setFlowStep] = useState(0);
  const flowTimers = useRef([]);
  const tapLego = (key) => {
    playSound("tick");
    setActiveLego(key);
    setComponentSeen(true);
  };
  const runFlow = () => {
    flowTimers.current.forEach(clearTimeout);
    flowTimers.current = [];
    setFlowStep(0);
    [1, 2, 3, 4, 5].forEach((s, i) => {
      flowTimers.current.push(setTimeout(() => {
        setFlowStep(s);
        playSound("add");
        if (s === 5) setFlowSeen(true);
      }, [0, 700, 1400, 2100, 2800][i]));
    });
  };
  useEffect(() => () => flowTimers.current.forEach(clearTimeout), []);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [attempts, setAttempts] = useState([0, 0, 0]);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t1-s1-react-intro",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          oldWaySeen: true,
          reactWaySeen: true,
          componentConceptUnderstood: true,
          fullStackFlowUnderstood: true,
          q1: quizAnswers[0],
          q2: quizAnswers[1],
          q3: quizAnswers[2],
          attemptsPerQ: attempts,
          reflectionText: reflection
        }
      },
      metadata: { subtopicId, taskId },
      completedAt: new Date().toISOString(),
    }, "*");
  }, [submitted]);

  const handleSubmit = () => {
    playSound("submit");
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.9); opacity:0.5; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
        @keyframes whiteflash { 0% { opacity:0; } 100% { opacity:1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes rowpulse { 0%,100% { background:transparent; } 50% { background:#DCFCE7; } }
        @keyframes badgeFade { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-whiteflash { animation: whiteflash 0.3s ease; }
        .hk-spinner { width: 34px; height: 34px; border-radius: 50%; border: 4px solid #E2E8F0; border-top-color: #7C3AED; animation: spin 0.7s linear infinite; }
        .hk-row-pulse { animation: rowpulse 0.5s ease; }
        .hk-badge-bad { position: absolute; right: 8px; top: 6px; background: #fff; color: #DC2626; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; animation: badgeFade 0.25s ease; }
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

      <div style={{ background: "linear-gradient(135deg,#4C1D95,#1E293B 55%,#0F172A)", color: "#fff", padding: "32px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.35),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>📡 SUBTOPIC 4.1.1 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>⚛️ Why React Exists</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>Newspaper vs news ticker — feel the difference.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <Stepper index={sceneIdx} />

        <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            {sceneIdx === 0 && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>📰 Old websites — every click reloads everything</div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>Click the button and watch the RIGHT panel closely.</div>
                <RunButton onClick={runOld} disabled={oldStep >= 0 && oldStep < 5}>Mark Ravi as Inactive →</RunButton>
                {oldStep >= 5 && (
                  <div style={{ marginTop: 18, animation: "slideIn 0.4s ease" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Header reloaded ❌</span>
                      <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Nav reloaded ❌</span>
                      <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Footer reloaded ❌</span>
                      <span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>Only 1 row actually changed ✓</span>
                    </div>
                    <Callout icon="📰" variant="tip">
                      The whole page was re-downloaded from the server — just to change one row.<br /><br />
                      <strong>Like buying a new newspaper to read one updated headline.</strong>
                    </Callout>
                    <RunButton onClick={() => { playSound("tick"); setSceneIdx(1); }}>See React instead →</RunButton>
                  </div>
                )}
              </div>
            )}

            {sceneIdx === 1 && (
              <Scene2 onNext={() => setSceneIdx(2)} playSound={playSound} run={runReact} done={reactWaySeen} />
            )}

            {sceneIdx === 2 && (
              <Scene3
                onNext={() => setSceneIdx(3)} playSound={playSound}
                componentSeen={componentSeen}
                phase={scene3Phase} setPhase={setScene3Phase}
                runFlow={runFlow} flowStep={flowStep}
              />
            )}

            {sceneIdx === 3 && (
              <CheckPhase
                playSound={playSound}
                quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers}
                attempts={attempts} setAttempts={setAttempts}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
              />
            )}
          </div>

          <div className="split-right" style={{ flex: "1 1 380px", minWidth: 0, position: "sticky", top: 16 }}>
            <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
              {sceneIdx === 0 && <StageOld current={oldCurrent} raviStatus={oldStatus} />}
              {sceneIdx === 1 && <StageReact pulsing={pulsing} raviStatus={reactStatus} />}
              {sceneIdx === 2 && scene3Phase === "lego" && <StageLego activeLego={activeLego} onTap={tapLego} />}
              {sceneIdx === 2 && scene3Phase === "flow" && <StageFlow flowStep={flowStep} />}
              {sceneIdx === 3 && (
                <Stage caption="🎉 You now understand why React exists">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, flex: 1 }}>
                    <div style={{ fontSize: 46 }}>⚛️</div>
                    <div style={{ fontSize: 13, color: "#64748B", textAlign: "center", maxWidth: 260 }}>
                      React updates only what changed. Components are LEGO blocks. Your Spring Boot + MySQL stack is ready and waiting.
                    </div>
                  </div>
                </Stage>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
