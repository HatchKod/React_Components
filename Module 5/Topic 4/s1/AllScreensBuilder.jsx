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

// ─── CODE BLOCK ──────────────────────────────────────────────────────────────
function CodeBlock({ children, style, border }) {
  return (
    <div className="hk-card" style={{
      background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16,
      fontFamily: "monospace", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Navigation", icon: "🧭" },
  { label: "View Details", icon: "👀" },
  { label: "Edit + Delete", icon: "✏️" },
  { label: "Complete App", icon: "🚀" },
];
function ProgressBar({ slot }) {
  const pct = Math.max(0, Math.min(100, ((slot - 1) / (STEPS.length - 1)) * 100));
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 17, left: 17, right: 17, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 17, left: 17, height: 4, borderRadius: 2, width: `calc(${pct}% - ${pct === 0 ? 0 : 34 * (pct / 100)}px)`, background: "linear-gradient(90deg,#7C3AED,#2563EB)", transition: "width 0.5s ease" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {STEPS.map((s, i) => {
            const stepNum = i + 1, done = stepNum < slot, active = stepNum === slot;
            return (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                <div className={active ? "hk-pulse" : ""} style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #DDD6FE" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>{done ? "✓" : s.icon}</div>
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, textAlign: "center", color: done ? "#059669" : active ? "#1E293B" : "#94A3B8" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BLANK ───────────────────────────────────────────────────────────────────
function Blank({ value, onChange, correct, placeholder, width }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      size={width || Math.max(placeholder.length, value.length, 3)}
      style={{
        background: correct ? "#134E4A" : "#1E293B", color: correct ? "#4ADE80" : "#F1F5F9",
        border: correct ? "1px dashed #10B981" : "1px dashed #64748B", borderRadius: 5,
        fontFamily: "monospace", fontSize: 15.5, padding: "3px 7px", outline: "none"
      }}
    />
  );
}
function BlankCard({ children, correct, wrong }) {
  return (
    <div className={`hk-card${correct ? " hk-pop" : wrong ? " hk-shake" : ""}`} style={{
      background: "linear-gradient(180deg,#1E293B,#0F172A)", color: "#E2E8F0", borderRadius: 12,
      padding: 18, fontFamily: "monospace", fontSize: 15, lineHeight: 1.75,
      border: correct ? "2px solid #10B981" : "2px solid #334155",
      boxShadow: correct ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s ease"
    }}>{children}</div>
  );
}

function RunButton({ onClick, children, disabled, variant = "primary" }) {
  const bg = variant === "danger" ? "linear-gradient(135deg,#DC2626,#991B1B)"
    : variant === "success" ? "linear-gradient(135deg,#10B981,#059669)"
    : "linear-gradient(135deg,#7C3AED,#2563EB)";
  return (
    <button onClick={onClick} disabled={disabled} className="hk-btn" style={{
      padding: "13px 24px", borderRadius: 12, border: "none",
      background: disabled ? "#CBD5E1" : bg, color: "#fff", fontWeight: 800, fontSize: 15.5,
      cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 6px 16px rgba(124,58,237,0.3)"
    }}>{children}</button>
  );
}

// ─── STAGE — right panel wrapper ────────────────────────────────────────────
function Stage({ children, caption }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14.5, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>⚛️</span> LIVE INTERACTIVE PREVIEW
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, background: "#F1F5F9",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 360,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24
      }}>
        {children}
      </div>
      <div style={{ minHeight: 38, marginTop: 12, textAlign: "center" }}>
        {caption && <div key={caption} style={{ fontSize: 15.5, fontWeight: 600, color: "#475569" }}>{caption}</div>}
      </div>
    </div>
  );
}

// ─── PAPER SKETCH — hand-drawn style SVG, four boxes on ruled paper ─────────
function PaperSketch({ scale = 1, highlight = null }) {
  const W = 240 * scale, H = 180 * scale;
  const box = (name) => highlight === name
    ? { stroke: "#7C3AED", fill: "#F5F3FF", strokeWidth: 3 }
    : { stroke: "#475569", fill: "none", strokeWidth: 2.2 };
  return (
    <svg width={W} height={H} viewBox="0 0 240 180" style={{ filter: "drop-shadow(0 6px 14px rgba(15,23,42,0.12))" }}>
      <rect x="0" y="0" width="240" height="180" rx="6" fill="#FFFDF6" stroke="#E7E0C9" strokeWidth="1" />
      {[...Array(7)].map((_, i) => (
        <line key={i} x1="10" x2="230" y1={22 + i * 21} y2={22 + i * 21} stroke="#EFE9D0" strokeWidth="1" />
      ))}
      <g transform="rotate(-3 60 45)">
        <rect x="18" y="18" width="84" height="54" rx="3" {...box("login")} />
        <text x="60" y="49" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#334155" fontWeight="700">LOGIN</text>
      </g>
      <g transform="rotate(2 180 45)">
        <rect x="138" y="18" width="84" height="54" rx="3" {...box("list")} />
        <text x="180" y="49" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#334155" fontWeight="700">LIST</text>
      </g>
      <g transform="rotate(2 60 130)">
        <rect x="18" y="103" width="84" height="54" rx="3" {...box("add")} />
        <text x="60" y="134" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#334155" fontWeight="700">ADD</text>
      </g>
      <g transform="rotate(-2 180 130)">
        <rect x="138" y="103" width="84" height="54" rx="3" {...box("detail")} />
        <text x="180" y="130" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#334155" fontWeight="700">DETAIL</text>
      </g>
    </svg>
  );
}

// ─── NAV FLOW DIAGRAM ────────────────────────────────────────────────────────
function pillStyle() {
  return { background: "#1E293B", color: "#4ADE80", borderRadius: 999, padding: "5px 14px", fontFamily: "monospace", fontWeight: 800, fontSize: 13 };
}
function NavFlowDiagram() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={pillStyle()}>list</span>
        <div style={{ textAlign: "center", fontSize: 11, color: "#7C3AED", fontWeight: 800 }}>
          — click View →<br /><span style={{ fontFamily: "monospace", color: "#64748B", fontWeight: 700 }}>setScreen("detail")</span>
        </div>
        <span style={pillStyle()}>detail</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={pillStyle()}>detail</span>
        <div style={{ textAlign: "center", fontSize: 11, color: "#7C3AED", fontWeight: 800 }}>
          — click ← Back →<br /><span style={{ fontFamily: "monospace", color: "#64748B", fontWeight: 700 }}>setScreen("list")</span>
        </div>
        <span style={pillStyle()}>list</span>
      </div>
    </div>
  );
}

// ─── SPREAD OPERATOR VISUAL ──────────────────────────────────────────────────
function SpreadVisual({ planOverride = "Premium" }) {
  const shown = planOverride.trim() || "Premium";
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center", margin: "12px 0 4px" }}>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: "10px 14px", fontFamily: "monospace", fontSize: 13.5 }}>
        {"{...member, plan: '"}{shown}{"'}"}
      </div>
      <div style={{ fontSize: 18, color: "#7C3AED", fontWeight: 800 }}>→</div>
      <div style={{ background: "#0F172A", color: "#94A3B8", borderRadius: 10, padding: "10px 14px", fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.9 }}>
        <div>{"{"}</div>
        <div style={{ paddingLeft: 12 }}>id: 1, <span style={{ color: "#64748B" }}>{"// ...member"}</span></div>
        <div style={{ paddingLeft: 12 }}>name: "Ravi", <span style={{ color: "#64748B" }}>{"// ...member"}</span></div>
        <div style={{ paddingLeft: 12 }}>age: 21, <span style={{ color: "#64748B" }}>{"// ...member"}</span></div>
        <div style={{ paddingLeft: 12, color: "#FDE68A", fontWeight: 800 }}>plan: "{shown}", <span style={{ color: "#D97706" }}>{"// overridden"}</span></div>
        <div style={{ paddingLeft: 12 }}>isActive: true <span style={{ color: "#64748B" }}>{"// ...member"}</span></div>
        <div>{"}"}</div>
      </div>
    </div>
  );
}

// ─── MEMBER LIST + DETAIL — the real live mini-app in the right panel ───────
const PLAN_OPTIONS = ["Basic", "Premium", "Annual"];

function StatusBadge({ isActive }) {
  return (
    <span style={{
      background: isActive ? "#DCFCE7" : "#FEE2E2", color: isActive ? "#166534" : "#991B1B",
      borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 800
    }}>{isActive ? "Active" : "Inactive"}</span>
  );
}

function ListScreen({ members, onView, showView }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {members.length === 0 && <div style={{ color: "#94A3B8", fontSize: 14.5, textAlign: "center" }}>No members left.</div>}
      {members.map(m => (
        <div key={m.id} className="hk-card" style={{
          background: "#fff", borderRadius: 12, padding: 14, width: "100%",
          boxShadow: "0 4px 14px rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap"
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1A3C6E" }}>{m.name}</div>
            <div style={{ fontSize: 13.5, color: "#64748B" }}>{m.plan} · {m.age}y</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge isActive={m.isActive} />
            {showView && (
              <button onClick={() => onView(m)} className="hk-btn" style={{
                padding: "7px 12px", borderRadius: 8, border: "1px solid #C4B5FD", background: "#F5F3FF",
                color: "#5B21B6", fontWeight: 800, fontSize: 12.5, cursor: "pointer"
              }}>View Details</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailScreen({ member, onBack, onSave, onDelete, editable }) {
  const [plan, setPlan] = useState(member.plan);
  const [isActive, setIsActive] = useState(member.isActive);
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <button onClick={onBack} className="hk-btn" style={{
        background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px",
        fontSize: 13, fontWeight: 700, color: "#1E293B", cursor: "pointer", marginBottom: 12
      }}>← Back to List</button>

      <div className="hk-card" style={{ background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 6px 18px rgba(15,23,42,0.08)" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#1A3C6E", marginBottom: 4 }}>{member.name}</div>
        <div style={{ fontSize: 14, color: "#64748B", marginBottom: 12 }}>Age: {member.age}</div>

        {!editable && (
          <>
            <div style={{ fontSize: 14.5, marginBottom: 6 }}>Plan: <strong>{member.plan}</strong></div>
            <div style={{ fontSize: 14.5 }}>Status: <StatusBadge isActive={member.isActive} /></div>
          </>
        )}

        {editable && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>PLAN</div>
            <select value={plan} onChange={e => setPlan(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}>
              {PLAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 14 }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              Active member
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <RunButton variant="success" onClick={() => onSave(plan, isActive)}>Save Changes</RunButton>
              <RunButton variant="danger" onClick={() => onDelete(member)}>Delete Member</RunButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound, done, setDone, screen, setScreen }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "screen";
  const [checked, setChecked] = useState(false);
  const [typedScreen, setTypedScreen] = useState("");
  const knownScreens = ["login", "list", "add", "detail"];

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🧭 Switch screens with useState</div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <PaperSketch />
      </div>
      <div style={{ textAlign: "center", fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
        Your Week 1 sketch. Each box = one React component. Today — all four are real.
      </div>

      <Callout icon="🧭" title="No React Router needed" variant="info">
        React Router is the professional navigation tool for React apps. But for your first app — one state variable is enough.
        <br /><br />
        <code>currentScreen</code> = which screen shows. Change it = navigate. Same <code>useState</code> you already know.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div style={{ color: "#94A3B8" }}>{"// In App component:"}</div>
        <div>
          const [<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="screen" width={7} />, setScreen] = useState("list");
        </div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 What do we call this state variable — the one that tracks which screen to show?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          Name it <code>screen</code> — it holds the current screen name.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock style={{ marginBottom: 14 }}>
            <div>const [screen, setScreen] = useState("list");</div>
            <div>const [selectedMember, setSelectedMember] = useState(null);</div>
            <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Navigate to detail:"}</div>
            <div>const goToDetail = (member) =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>setSelectedMember(member);</div>
            <div style={{ paddingLeft: 12 }}>setScreen("detail");</div>
            <div>{"};"}</div>
            <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Navigate back:"}</div>
            <div>const goToList = () =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>setSelectedMember(null);</div>
            <div style={{ paddingLeft: 12 }}>setScreen("list");</div>
            <div>{"};"}</div>
            <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Which screen to show:"}</div>
            <div>if (screen === "list") {"{"}</div>
            <div style={{ paddingLeft: 12 }}>return &lt;MembersList onViewMember={"{goToDetail}"} /&gt;;</div>
            <div>{"}"}</div>
            <div>if (screen === "detail") {"{"}</div>
            <div style={{ paddingLeft: 12 }}>return &lt;MemberDetail member={"{selectedMember}"} onBack={"{goToList}"} /&gt;;</div>
            <div>{"}"}</div>
          </CodeBlock>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — type a screen name, run it for real</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={typedScreen}
                onChange={e => setTypedScreen(e.target.value)}
                placeholder="detail"
                style={{ fontFamily: "monospace", padding: "9px 11px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14, width: 130 }}
              />
              <RunButton onClick={() => { const t = typedScreen.trim().toLowerCase(); if (t) { setScreen(t); playSound("tick"); } }}>Run setScreen() →</RunButton>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#64748B", marginTop: 8 }}>
              setScreen("{typedScreen || "???"}")
            </div>
            <div style={{ fontSize: 12.5, marginTop: 6, color: knownScreens.includes(screen) ? "#059669" : "#D97706", fontWeight: 700 }}>
              {knownScreens.includes(screen)
                ? `→ the "${screen}" box lights up on the sketch on the right ✅`
                : `→ no box named "${screen}" on the sketch — try login, list, add, or detail`}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand screen-based navigation
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Build the detail screen →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — VIEW DETAILS
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone, selectedMember }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "onBack";
  const [checked, setChecked] = useState(false);
  const [fieldName, setFieldName] = useState("");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>👀 Click a member — see their details</div>

      <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Part A — add a View button to the list:</div>
      <CodeBlock style={{ marginBottom: 10 }}>
        <div>{"{members.map((member) => ("}</div>
        <div style={{ paddingLeft: 12 }}>&lt;div key={"{member.id}"} className="member-card"&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;h3&gt;{"{member.name}"}&lt;/h3&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;p&gt;{"{member.plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;button onClick={"{() => onViewMember(member)}"}&gt;</div>
        <div style={{ paddingLeft: 36 }}>View Details</div>
        <div style={{ paddingLeft: 24 }}>&lt;/button&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;/div&gt;</div>
        <div>{"))}"}</div>
      </CodeBlock>
      <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
        <code>onViewMember(member)</code> passes the clicked member up to App. App stores it in <code>selectedMember</code> and switches to the "detail" screen.
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Part B — the MemberDetail component:</div>
      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const MemberDetail = ({"{"} token, member, <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="onBack" width={7} /> {"}"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={"{onBack}"}&gt;← Back to List&lt;/button&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h2&gt;{"{member.name}"}&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Age: {"{member.age}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Plan: {"{member.plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Status: {'{member.isActive ? "Active" : "Inactive"}'}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 What prop is the function that returns to the list?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          <code>onBack</code> is the function prop that navigates back to the list — same pattern as <code>onLogin</code> in 4.2.2.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="🧪" variant="tip">
            Click "View Details" on any member on the right. The detail screen appears with their full data and a working "← Back" button.
          </Callout>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — add your own field to the detail screen</div>
            <div style={{ fontFamily: "monospace", fontSize: 15, color: "#1E293B" }}>
              &lt;p&gt;{"{member."}
              <input
                value={fieldName}
                onChange={e => setFieldName(e.target.value)}
                placeholder="plan"
                style={{ fontFamily: "monospace", border: "1px dashed #94A3B8", borderRadius: 4, padding: "1px 6px", fontSize: 15, width: 80, outline: "none" }}
              />
              {"}"}&lt;/p&gt;
            </div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
              {(() => {
                const key = fieldName.trim();
                if (!key) return "Type a property name — try name, age, plan, or isActive.";
                if (!selectedMember) return "→ click View Details on the right first, then this shows a real value.";
                if (key in selectedMember) return `→ renders: ${String(selectedMember[key])} ✅`;
                return `→ renders: undefined — no "${key}" field on member (try name, age, plan, isActive)`;
              })()}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            ✅ View Details working — navigates to detail screen
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Edit and Delete →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — EDIT AND DELETE
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "...";
  const [checked, setChecked] = useState(false);
  const [planOverride, setPlanOverride] = useState("Premium");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>✏️ Edit plan and delete member</div>

      <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Part A — save changes with PUT:</div>
      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const [plan, setPlan] = useState(member.plan);</div>
        <div>const [isActive, setIsActive] = useState(member.isActive);</div>
        <div style={{ marginTop: 8 }}>const handleUpdate = async () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>await fetch(</div>
        <div style={{ paddingLeft: 24 }}>{'`http://localhost:8080/gym/members/${member.id}`'},</div>
        <div style={{ paddingLeft: 24 }}>{"{"}</div>
        <div style={{ paddingLeft: 36 }}>method: "PUT",</div>
        <div style={{ paddingLeft: 36 }}>headers: {'{ "Content-Type": "application/json", "Authorization": "Bearer " + token }'},</div>
        <div style={{ paddingLeft: 36 }}>body: JSON.stringify({"{"}</div>
        <div style={{ paddingLeft: 48 }}>
          <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="..." width={4} />member,
        </div>
        <div style={{ paddingLeft: 48, color: "#94A3B8" }}>{"// copy all existing fields"}</div>
        <div style={{ paddingLeft: 48 }}>plan: plan,</div>
        <div style={{ paddingLeft: 48 }}>isActive: isActive</div>
        <div style={{ paddingLeft: 36 }}>{"})"}</div>
        <div style={{ paddingLeft: 24 }}>{"}"}</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div style={{ paddingLeft: 12 }}>onBack();</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Copy all existing member fields, then override the changed ones. What operator spreads an object?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          The spread operator is <code>...</code> — <code>{"{...member}"}</code> copies all properties, then you override what changed.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — type your own override value</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontFamily: "monospace", fontSize: 14 }}>
              <span>{"{...member, plan: '"}</span>
              <input
                value={planOverride}
                onChange={e => setPlanOverride(e.target.value)}
                placeholder="Premium"
                style={{ fontFamily: "monospace", border: "1px dashed #94A3B8", borderRadius: 4, padding: "1px 6px", fontSize: 14, width: 100, outline: "none" }}
              />
              <span>{"'}"}</span>
            </div>
          </div>

          <Callout icon="📋" variant="info">
            Copy all, change only what needed — watch the object below update as you type:
            <SpreadVisual planOverride={planOverride} />
          </Callout>

          <CodeBlock style={{ marginBottom: 10 }}>
            <div>&lt;label&gt;</div>
            <div style={{ paddingLeft: 12 }}>&lt;input</div>
            <div style={{ paddingLeft: 24 }}>type="checkbox"</div>
            <div style={{ paddingLeft: 24 }}>checked={"{isActive}"}</div>
            <div style={{ paddingLeft: 24 }}>onChange={"{(e) => setIsActive(e.target.checked)}"}</div>
            <div style={{ paddingLeft: 12 }}>/&gt;</div>
            <div style={{ paddingLeft: 12 }}>Active member</div>
            <div>&lt;/label&gt;</div>
          </CodeBlock>
          <Callout icon="☑️" title="Checkboxes are different" variant="tip">
            Checkboxes use <code>checked={"{value}"}</code>, not <code>value={"{}"}</code>. And <code>e.target.checked</code>, not <code>e.target.value</code>.
            <br /><br />
            Inputs and selects use <code>value</code>. Checkboxes use <code>checked</code>.
          </Callout>

          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6, marginTop: 4 }}>Part B — delete, with a confirmation:</div>
          <CodeBlock style={{ marginBottom: 10 }}>
            <div>const handleDelete = async () =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>const ok = window.confirm(</div>
            <div style={{ paddingLeft: 24 }}>{'`Delete ${member.name}? This cannot be undone.`'}</div>
            <div style={{ paddingLeft: 12 }}>);</div>
            <div style={{ paddingLeft: 12 }}>if (!ok) return;</div>
            <div style={{ marginTop: 6, paddingLeft: 12 }}>await fetch(</div>
            <div style={{ paddingLeft: 24 }}>{'`http://localhost:8080/gym/members/${member.id}`'},</div>
            <div style={{ paddingLeft: 24 }}>{'{ method: "DELETE", headers: { "Authorization": "Bearer " + token } }'}</div>
            <div style={{ paddingLeft: 12 }}>);</div>
            <div style={{ paddingLeft: 12 }}>onBack();</div>
            <div>{"};"}</div>
          </CodeBlock>
          <Callout icon="⚠️" title="window.confirm() — always confirm first" variant="danger">
            A built-in browser dialog: <em>"Delete Ravi Kumar? This cannot be undone."</em> [Cancel] [OK]
            <br /><br />
            Returns <code>true</code> if OK, <code>false</code> if Cancel. No library needed. Simple. Effective.
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            ✅ Edit and Delete working
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Complete App →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — COMPLETE APP
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", built: ["Members list", "Add member", "Member detail (edit/delete)"], extra: "Any other screen from your sketch?" },
  hotel: { icon: "🏨", label: "Hotel", built: ["Rooms list", "Add room", "Room detail (edit/delete)"], extra: "Booking screen?" },
  mess: { icon: "🍱", label: "Mess", built: ["Meals list", "Add meal", "Meal detail (edit/delete)"], extra: "Attendance screen?" },
  chai: { icon: "☕", label: "Chai", built: ["Orders list", "Add order", "Order detail (edit/delete)"], extra: "Order history?" },
};

function Slot4({ onDone, playSound, members }) {
  const [screens, setScreens] = useState({ login: false, list: false, add: false, detail: false });
  const allFour = screens.login && screens.list && screens.add && screens.detail;
  const toggleScreen = (k) => setScreens(s => {
    const next = { ...s, [k]: !s[k] };
    if (!s[k] && next.login && next.list && next.add && next.detail) playSound("correct");
    return next;
  });

  const [domain, setDomain] = useState("");
  const [extraScreenName, setExtraScreenName] = useState("");
  const [extraScreens, setExtraScreens] = useState([]);
  const d = domain ? DOMAINS[domain] : null;

  const [matchChecked, setMatchChecked] = useState(false);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🚀 Your complete gym app</div>

      <Callout icon="📋" variant="info">Compare to your paper sketch. Check each screen you have built:</Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {[
          ["login", "Login screen — credentials → JWT token"],
          ["list", "Members list — all members from MySQL"],
          ["add", "Add member — form → POST → appears in list"],
          ["detail", "Member detail — view, edit, delete"],
        ].map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
            <input type="checkbox" checked={screens[key]} onChange={() => toggleScreen(key)} />
            {label}
          </label>
        ))}
      </div>

      {allFour && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Does your app need more screens? Check your paper sketch:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.entries(DOMAINS).map(([key, dd]) => (
              <button key={key} onClick={() => { setDomain(key); setExtraScreens([]); setExtraScreenName(""); playSound("tick"); }} className="hk-domain-btn" style={{
                padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                border: domain === key ? "2px solid #7C3AED" : "2px solid #E2E8F0",
                background: domain === key ? "linear-gradient(135deg,#F5F3FF,#EDE9FE)" : "#fff",
                color: domain === key ? "#5B21B6" : "#1E293B",
                boxShadow: domain === key ? "0 4px 14px rgba(124,58,237,0.2)" : "none", transition: "all 0.15s ease"
              }}>{dd.icon} {dd.label}</button>
            ))}
          </div>

          {d && (
            <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              {d.built.map((b, i) => (
                <div key={i} style={{ fontSize: 14.5, color: "#059669", fontWeight: 700, marginBottom: 6 }}>✅ {b}</div>
              ))}
              <div style={{ fontSize: 14, color: "#374151", marginTop: 8, marginBottom: 6 }}>💭 {d.extra}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={extraScreenName}
                  onChange={e => setExtraScreenName(e.target.value)}
                  placeholder="type a screen name..."
                  style={{ flex: "1 1 160px", padding: "9px 11px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
                />
                <RunButton onClick={() => {
                  const v = extraScreenName.trim();
                  if (v) { setExtraScreens(list => [...list, v]); setExtraScreenName(""); playSound("add"); }
                }}>Add →</RunButton>
              </div>
              {extraScreens.map((s, i) => (
                <div key={i} className="hk-pop" style={{ fontSize: 14, color: "#5B21B6", fontWeight: 700, marginTop: 8 }}>🆕 {s} — build it with the same patterns</div>
              ))}
            </div>
          )}

          <Callout icon="🛠️" variant="tip">
            If a screen from your sketch is not built yet — use the same patterns. Component that returns JSX. <code>useState</code> for data.
            <code>fetch</code> for API calls. <code>onBack</code> prop to navigate. You know all the patterns. Apply them.
          </Callout>

          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>From paper to screen:</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <PaperSketch scale={0.75} />
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Week 1 — paper sketch</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 180, height: 135, borderRadius: 10, border: "6px solid #1E293B", background: "#F1F5F9",
                display: "flex", flexDirection: "column", gap: 6, padding: 10, boxShadow: "0 6px 14px rgba(15,23,42,0.15)"
              }}>
                {members.slice(0, 2).map(m => (
                  <div key={m.id} style={{ background: "#fff", borderRadius: 6, padding: "5px 8px", fontSize: 9.5, fontWeight: 700, color: "#1A3C6E", boxShadow: "0 2px 6px rgba(15,23,42,0.08)" }}>
                    {m.name} <span style={{ color: "#64748B", fontWeight: 500 }}>· {m.plan}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Today — your running app</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
            From paper to screen. Week 1 to now. Your plan became real.
          </div>

          <CodeBlock style={{ fontSize: 13, marginBottom: 16 }}>
            <div>git add .</div>
            <div>git commit -m "all screens complete — navigation, detail, edit, delete"</div>
            <div>git push origin main</div>
          </CodeBlock>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={matchChecked} onChange={() => { if (!matchChecked) { playSound("correct"); setMatchChecked(true); onDone(); } }} />
            ✅ All screens complete — matches my paper sketch
          </label>
        </div>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🧭 currentScreen state", "simple navigation — no React Router needed"],
    ["🎯 goToDetail(member)", "store selected member, switch screen"],
    ["⬅️ onBack prop", "function to return — same pattern as onLogin"],
    ["✏️ method: PUT", "update existing record — id in URL template literal"],
    ["📋 {...member, field}", "spread + override — copy all, change what needed"],
    ["☑️ e.target.checked", "checkbox value — not e.target.value"],
    ["⚠️ window.confirm()", "built-in confirmation — no library needed"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => { setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 300); });
    setTimeout(() => onDone(), 400 + items.length * 300 + 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="hk-wobble-in" style={{
      background: "linear-gradient(180deg,#FFFBEB,#FEF3C7)", border: "2px solid #F59E0B", borderRadius: 16,
      padding: 26, marginTop: 8, boxShadow: "0 10px 30px rgba(245,158,11,0.25)"
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#92400E", marginBottom: 18, textAlign: "center" }}>🎉 Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} className={ticked.includes(i) ? "hk-pop" : ""} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✅" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" → "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 18, textAlign: "center", color: "#78350F", fontSize: 15.5, lineHeight: 1.9, fontWeight: 700, background: "#fff", borderRadius: 12, padding: 18, border: "1px dashed #F59E0B" }}>
        Four screens. All working.<br />
        Login, list, add, detail. Navigate between them. View, edit, delete.<br /><br />
        Your paper sketch is real.<br /><br />
        Next — 4.3.2.<br />
        What happens when something goes wrong?<br />
        Error messages that help, not frighten.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const TASK_GROUPS = [
  { key: "nav", title: "TASK 1 — Navigation", items: ["currentScreen state in App", "goToDetail function", "goToList function", "if/else rendering by screen"] },
  { key: "view", title: "TASK 2 — View button on list", items: ["View Details button on each card", "onViewMember prop passed down", "Clicking navigates to detail"] },
  { key: "detail", title: "TASK 3 — Detail screen", items: ["Shows member's full data", "← Back button works", "Edit fields (plan/status)", "Save Changes (PUT request)", "Delete (confirm + DELETE request)"] },
  { key: "all", title: "TASK 4 — All screens from sketch", items: ["All screens from Week 1 sketch built", "Navigation between all of them"] },
];

function Phase2Left({ tasks, setTasks, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const allTasksDone = TASK_GROUPS.every(g => g.items.every((_, i) => !!tasks[g.key]?.[i]));

  const toggleTask = (group, i) => {
    setTasks(t => ({ ...t, [group]: { ...t[group], [i]: !t[group]?.[i] } }));
    playSound("tick");
  };

  return (
    <div>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>📱 Complete YOUR app's screens</div>
      <div style={{ color: "#64748B", fontSize: 15, marginBottom: 16 }}>Work through your own project, then check off each task below.</div>

      {!submitted && (
        <>
          {TASK_GROUPS.map(g => (
            <div key={g.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>{g.title}</div>
              {g.items.map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks[g.key]?.[i]} onChange={() => toggleTask(g.key, i)} />{label}
                </label>
              ))}
            </div>
          ))}

          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>TASK 5 — Commit:</div>
          <CodeBlock style={{ fontSize: 13, marginBottom: 16 }}>
            <div>git add .</div>
            <div>git commit -m "all screens complete"</div>
            <div>git push origin main</div>
          </CodeBlock>

          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8 }}>
              In one sentence — why did we use a currentScreen state variable instead of React Router for navigation?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="We used currentScreen state because it uses the same useState pattern we already know, and for a small app with four screens it is simpler than installing and learning a new routing library..."
              style={{ width: "100%", minHeight: 90, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 15, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
            />
            <div style={{ fontSize: 13.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
              {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
            </div>
          </div>

          <RunButton onClick={onSubmit} disabled={!allTasksDone || !reflectionOk}>All screens done — handle errors next →</RunButton>
          {!allTasksDone && <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>Check off every task above first.</div>}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>📱 All screens complete.</div>
          <div style={{ fontSize: 15, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ Login screen<br />
            ✅ Members list<br />
            ✅ Add member form<br />
            ✅ Member detail — view/edit/delete<br />
            ✅ Navigation between all screens<br />
            ✅ Matches your paper sketch<br /><br />
            Next — 4.3.2. Error handling.<br />
            What happens when the server is down? When the network fails? When the user types wrong input?<br /><br />
            A good app tells the user kindly — not with raw errors.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const SEED_MEMBERS = [
  { id: 1, name: "Suresh", plan: "Premium", age: 28, isActive: true },
  { id: 2, name: "Priya", plan: "Basic", age: 24, isActive: false },
  { id: 3, name: "Ravi Kumar", plan: "Basic", age: 21, isActive: true },
];

export default function AllScreensBuilder() {
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

  const [phase, setPhase] = useState(1);
  const [slot, setSlot] = useState(1);
  const [slot1Done, setSlot1Done] = useState(false);
  const [slot2Done, setSlot2Done] = useState(false);
  const [slot3Done, setSlot3Done] = useState(false);

  // shared live mini-app state — the actual list/detail navigation being taught
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [screen, setScreen] = useState("list");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const selectedMember = members.find(m => m.id === selectedMemberId) || null;

  const goToDetail = (member) => { setSelectedMemberId(member.id); setScreen("detail"); playSound("tick"); };
  const goToList = () => { setScreen("list"); setSelectedMemberId(null); };

  const handleSave = (plan, isActive) => {
    setMembers(ms => ms.map(m => m.id === selectedMemberId ? { ...m, plan, isActive } : m));
    playSound("correct");
    goToList();
  };
  const handleDelete = (member) => {
    const ok = window.confirm(`Delete ${member.name}? This cannot be undone.`);
    if (!ok) return;
    setMembers(ms => ms.filter(m => m.id !== member.id));
    playSound("warn");
    goToList();
  };

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [tasks, setTasks] = useState({ nav: {}, view: {}, detail: {}, all: {} });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t3-s1-all-screens-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { screenBlank: "screen" },
          slot2: { onBackBlank: "onBack", viewDetailsWorks: true },
          slot3: { spreadBlank: "...", editWorks: true, deleteWorks: true },
          slot4: { allFourScreens: true, matchesPaperSketch: true }
        },
        phase2: {
          navigationBuilt: true,
          viewButtonAdded: true,
          detailScreenBuilt: true,
          allScreensComplete: true,
          committedToGitHub: true,
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
        @keyframes slideInRight { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-slide-in { animation: slideInRight 0.5s ease; }
        .hk-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hk-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .hk-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(30,41,59,0.28); }
        .hk-btn:active:not(:disabled) { transform: translateY(0); }
        .hk-domain-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 18px rgba(15,23,42,0.12); }
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
          <div style={{ fontSize: 13.5, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🧭 SUBTOPIC 4.3.1 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>📱 All Screens — Navigation, Detail, Edit, Delete</div>
          <div style={{ fontSize: 15.5, color: "#DDD6FE" }}>Ravi's paper sketch from Week 1 becomes real screens.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done} screen={screen} setScreen={setScreen} />
              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done} selectedMember={selectedMember} />
              )}
              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done} />
              )}
              {slot >= 4 && !showReveal && (
                <Slot4 onDone={() => setShowReveal(true)} playSound={playSound} members={members} />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }} className="hk-btn hk-pulse" style={{
                  marginTop: 20, padding: "16px 32px", background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff",
                  border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, display: "block", width: "100%"
                }}>Build YOUR detail screen →</button>
              )}
            </div>

            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                {slot === 1 && (
                  <Stage caption={`Current screen: "${screen}" — type on the left, or click below`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", width: "100%" }}>
                      <PaperSketch scale={0.9} highlight={screen} />
                      <NavFlowDiagram />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setScreen("detail")} className="hk-btn" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #C4B5FD", background: screen === "detail" ? "#EDE9FE" : "#fff", color: "#5B21B6", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>setScreen("detail")</button>
                        <button onClick={() => setScreen("list")} className="hk-btn" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #C4B5FD", background: screen === "list" ? "#EDE9FE" : "#fff", color: "#5B21B6", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>setScreen("list")</button>
                      </div>
                    </div>
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption={(screen === "list" || !selectedMember) ? "Click View Details on any member" : "Detail screen — click ← Back to List"}>
                    {(screen === "list" || !selectedMember)
                      ? <ListScreen members={members} onView={goToDetail} showView />
                      : <DetailScreen key={selectedMember.id} member={selectedMember} onBack={goToList} editable={false} onSave={() => {}} onDelete={() => {}} />}
                  </Stage>
                )}
                {(slot === 3 || slot === 4) && (
                  <Stage caption={(screen === "list" || !selectedMember) ? "Members list — updates live" : "Change plan, toggle active, save or delete"}>
                    {(screen === "list" || !selectedMember)
                      ? <ListScreen members={members} onView={goToDetail} showView />
                      : <DetailScreen key={selectedMember.id} member={selectedMember} onBack={goToList} editable onSave={handleSave} onDelete={handleDelete} />}
                  </Stage>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                tasks={tasks} setTasks={setTasks}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={(screen === "list" || !selectedMember) ? "Your complete app — members list" : "Your complete app — member detail"}>
                  {(screen === "list" || !selectedMember)
                    ? <ListScreen members={members} onView={goToDetail} showView />
                    : <DetailScreen key={selectedMember.id} member={selectedMember} onBack={goToList} editable onSave={handleSave} onDelete={handleDelete} />}
                </Stage>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
