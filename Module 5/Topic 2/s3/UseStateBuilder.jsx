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

// ─── CODE BLOCK ──────────────────────────────────────────────────────────────
function CodeBlock({ children, style, border }) {
  return (
    <div className="hk-card" style={{
      background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 14,
      fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.85, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "The Problem", icon: "🧊" },
  { label: "useState", icon: "🖊️" },
  { label: "onClick", icon: "👆" },
  { label: "Never Direct", icon: "🚫" },
  { label: "Interactive Card", icon: "🎛️" },
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
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #DDD6FE" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>{done ? "✓" : s.icon}</div>
                <div style={{ marginTop: 5, fontSize: 9, fontWeight: 700, textAlign: "center", color: done ? "#059669" : active ? "#1E293B" : "#94A3B8" }}>{s.label}</div>
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
        fontFamily: "monospace", fontSize: 14, padding: "2px 6px", outline: "none"
      }}
    />
  );
}
function BlankCard({ children, correct, wrong }) {
  return (
    <div className={`hk-card${correct ? " hk-pop" : wrong ? " hk-shake" : ""}`} style={{
      background: "linear-gradient(180deg,#1E293B,#0F172A)", color: "#E2E8F0", borderRadius: 12,
      padding: 16, fontFamily: "monospace", fontSize: 13.5, lineHeight: 1.85,
      border: correct ? "2px solid #10B981" : "2px solid #334155",
      boxShadow: correct ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s ease"
    }}>{children}</div>
  );
}

function RunButton({ onClick, children, disabled, variant = "primary" }) {
  const bg = variant === "danger" ? "linear-gradient(135deg,#DC2626,#991B1B)"
    : variant === "success" ? "linear-gradient(135deg,#10B981,#059669)"
    : variant === "gold" ? "linear-gradient(135deg,#F59E0B,#D97706)"
    : "linear-gradient(135deg,#7C3AED,#2563EB)";
  return (
    <button onClick={onClick} disabled={disabled} className="hk-btn" style={{
      padding: "12px 22px", borderRadius: 12, border: "none",
      background: disabled ? "#CBD5E1" : bg, color: "#fff", fontWeight: 800, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 6px 16px rgba(124,58,237,0.3)"
    }}>{children}</button>
  );
}

// ─── STAGE — right panel wrapper ────────────────────────────────────────────
function Stage({ children, caption, label }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>⚛️</span> LIVE INTERACTIVE PREVIEW
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, background: "#F1F5F9",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 320,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 22
      }}>
        {children}
      </div>
      <div style={{ minHeight: 34, marginTop: 10, textAlign: "center" }}>
        {label && (
          <div key={label} className="hk-pop" style={{
            display: "inline-block", fontSize: 12, fontWeight: 800, color: "#065F46",
            background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 999, padding: "6px 14px", marginBottom: 6
          }}>{label}</div>
        )}
        {caption && <div key={"c" + caption} style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{caption}</div>}
      </div>
    </div>
  );
}

// ─── WHITEBOARD VISUAL ───────────────────────────────────────────────────────
function Whiteboard({ text, size = "normal" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        position: "relative", overflow: "hidden", background: "#fff", border: "8px solid #94A3B8",
        borderRadius: 10, padding: size === "small" ? "14px 18px" : "22px 28px",
        boxShadow: "0 8px 20px rgba(15,23,42,0.15)", minWidth: size === "small" ? 140 : 200
      }}>
        <div key={text} className="hk-pop" style={{
          fontFamily: "monospace", fontWeight: 800, color: "#1E3A8A",
          fontSize: size === "small" ? 16 : 22, minHeight: size === "small" ? 20 : 28
        }}>{text || "…"}</div>
        <div key={"wipe" + text} className="hk-wipe" style={{ position: "absolute", inset: 0, background: "#fff" }} />
      </div>
      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 6, fontWeight: 700 }}>🖊️ the whiteboard (useState)</div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span style={{
      background: active ? "#DCFCE7" : "#FEE2E2", color: active ? "#166534" : "#991B1B",
      borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800, transition: "all 0.3s ease"
    }}>{status}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound }) {
  const [flash, setFlash] = useState(false);
  const [tried, setTried] = useState(false);
  const clickStatic = () => {
    playSound("warn");
    setTried(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧊 The problem — clicking changes nothing</div>

      <div className="hk-card" style={{ borderRadius: 14, border: "1px solid #E2E8F0", padding: 18, marginBottom: 14, background: "#fff" }}>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Click the button below:</div>
        <div style={{ maxWidth: 260, margin: "0 auto", background: "#F9FAFB", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1A3C6E" }}>Ravi Kumar</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", margin: "8px 0" }}>
            <span style={{ fontSize: 12, color: "#374151" }}>Basic</span>
            <StatusBadge status="Active" />
          </div>
          <button onClick={clickStatic} className={flash ? "hk-shake" : ""} style={{
            marginTop: 8, padding: "8px 16px", borderRadius: 8, border: "none",
            background: flash ? "#FCA5A5" : "#E2E8F0", color: flash ? "#7F1D1D" : "#374151", fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>Mark Inactive</button>
          {tried && <div className="hk-pop" style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: "#DC2626" }}>Nothing changed ❌</div>}
        </div>
      </div>

      <CodeBlock style={{ marginBottom: 14 }}>
        <div>const MemberCard = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>let status = "Active"; <span style={{ color: "#94A3B8" }}>{"// normal variable — not state"}</span></div>
        <div style={{ marginTop: 8, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span&gt;{"{status}"}&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={"{() => {"}</div>
        <div style={{ paddingLeft: 48 }}>status = "Inactive"; <span style={{ color: "#94A3B8" }}>{"// changes in memory..."}</span></div>
        <div style={{ paddingLeft: 48, color: "#94A3B8" }}>{"// ...but React doesn't know. Screen stays the same."}</div>
        <div style={{ paddingLeft: 36 }}>{"}}>"}</div>
        <div style={{ paddingLeft: 48 }}>Mark Inactive</div>
        <div style={{ paddingLeft: 36 }}>&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </CodeBlock>
      <div style={{ fontSize: 12.5, color: "#374151", marginBottom: 14 }}>
        status changes to "Inactive" in memory. But React does not know. Screen stays frozen.
      </div>

      <Callout icon="✍️" title="The whiteboard analogy" variant="tip">
        A normal variable is writing in the air. Gone immediately. Nobody sees it.<br /><br />
        React's screen watches a whiteboard. When the whiteboard changes — screen updates automatically.<br /><br />
        <strong>useState is the whiteboard.</strong>
      </Callout>

      <RunButton onClick={() => { playSound("tick"); onNext(); }}>Give it memory →</RunButton>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — useState SYNTAX
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "useState";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🖊️ useState — the whiteboard</div>

      <CodeBlock style={{ marginBottom: 10 }}>
        <div>import {"{ useState }"} from 'react';</div>
      </CodeBlock>
      <Callout icon="📦" variant="info">
        <code>{"{ useState }"}</code> — import this specific tool from React. Same import pattern as <code>JpaRepository</code> in Java. Must appear at the top of the file.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const MemberCard = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>
          const [status, setStatus] = <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="useState" width={14} />
          {correct ? '("Active");' : ";"}
        </div>
        <div style={{ marginTop: 8, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span&gt;{"{status}"}&lt;/span&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Which function creates a state variable? (You just imported it)
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          The function is <strong>useState</strong>. <code>useState('Active')</code> creates the whiteboard with "Active" written on it.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="🍱" title="Array destructuring — you know this" variant="info">
            <code>const [status, setStatus] = useState()</code><br /><br />
            useState returns an ARRAY with two items: <code>[currentValue, setterFunction]</code>.<br /><br />
            You learned array destructuring in 4.0.3 — this is the same pattern.<br />
            <code>[status]</code> = item at index 0 &nbsp;·&nbsp; <code>[setStatus]</code> = item at index 1
          </Callout>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 8 }}>
              const [<span style={{ color: "#2563EB", fontWeight: 800 }}>status</span>, <span style={{ color: "#D97706", fontWeight: 800 }}>setStatus</span>] = useState(<span style={{ color: "#16A34A", fontWeight: 800 }}>"Active"</span>);
            </div>
            <div style={{ fontSize: 11.5, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ color: "#2563EB" }}>● status → what is written now</span>
              <span style={{ color: "#D97706" }}>● setStatus → the marker</span>
              <span style={{ color: "#16A34A" }}>● "Active" → first thing written</span>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand useState
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Make it clickable →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — onClick
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "onClick";
  const [checked, setChecked] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  // REAL useState — this is genuinely the "whiteboard" the lesson describes
  const [status, setStatus] = useState("Active");
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const toggle = () => {
    setStatus(s => s === "Active" ? "Inactive" : "Active");
    setToggled(true);
    playSound("correct");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>👆 onClick — run code when clicked</div>

      <Callout icon="👆" variant="tip">
        <code>onClick</code> is a JSX prop. You pass a function to it — that function runs when the element is clicked.<br /><br />
        <code>onClick={"{someFunction}"}</code> or inline: <code>onClick={"{() => doSomething()}"}</code>
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const MemberCard = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [status, setStatus] = useState("Active");</div>
        <div style={{ marginTop: 8, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span&gt;{"{status}"}&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>
          &lt;button <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="onClick" width={9} />={'{() => setStatus("Inactive")}'}&gt;
        </div>
        <div style={{ paddingLeft: 48 }}>Mark Inactive</div>
        <div style={{ paddingLeft: 36 }}>&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 What JSX prop makes a button run code when clicked? <span style={{ color: "#94A3B8" }}>(camelCase — O capital, C capital)</span>
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          The prop is <strong>onClick</strong> — camelCase. Not <code>onclick</code> (HTML). In JSX — always camelCase for event handlers.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1A3C6E", marginBottom: 8 }}>Ravi Kumar</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#374151" }}>Basic</span>
              <StatusBadge status={status} />
            </div>
            <RunButton onClick={toggle} variant={status === "Active" ? "danger" : "success"}>
              {status === "Active" ? "Mark Inactive" : "Mark Active"}
            </RunButton>
            {toggled && <div className="hk-pop" style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: "#059669" }}>IT UPDATED. ✅ React saw the whiteboard change. No reload.</div>}
          </div>

          <CodeBlock style={{ marginBottom: 10 }}>
            <div>
              onClick={"{() => "}<span style={{ color: "#FBBF24" }}>setStatus</span>{'("Inactive")}'}
            </div>
            <div style={{ color: "#94A3B8", marginTop: 4 }}>{"↑ arrow function, runs on click     ↑ calls setter, writes on whiteboard"}</div>
          </CodeBlock>

          <button onClick={() => setShowEvents(s => !s)} style={{ background: "none", border: "none", color: "#2563EB", fontSize: 12.5, cursor: "pointer", padding: 0, marginBottom: 8 }}>
            {showEvents ? "▾" : "▸"} Event names reference
          </button>
          {showEvents && (
            <CodeBlock style={{ marginBottom: 14, fontSize: 11.5 }}>
              <div>onClick — click</div>
              <div>onChange — input value changes</div>
              <div>onSubmit — form submitted</div>
              <div>onMouseOver — mouse hovers</div>
              <div style={{ color: "#94A3B8", marginTop: 6 }}>All camelCase in React. You'll mostly use onClick and onChange.</div>
            </CodeBlock>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} disabled={!toggled} onChange={() => { if (!checked && toggled) { playSound("correct"); setChecked(true); } }} />
            My button updates the badge
          </label>
          {!toggled && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Click the button above first ↑</div>}
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>The golden rule →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — NEVER ASSIGN DIRECTLY
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone }) {
  const [choice, setChoice] = useState(null);
  const choose = (opt) => {
    setChoice(opt);
    if (opt === "B") { playSound("correct"); setDone(true); }
    else playSound("warn");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🚫 Always use the setter — never assign directly</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>❌ WRONG</div>
          <CodeBlock border="#DC2626">
            <div>status = "Inactive";</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{"// writes on paper — private"}</div>
            <div style={{ color: "#94A3B8" }}>{"// React does not see this"}</div>
            <div style={{ color: "#94A3B8" }}>{"// screen stays frozen"}</div>
          </CodeBlock>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 4 }}>✅ CORRECT</div>
          <CodeBlock border="#10B981">
            <div>setStatus("Inactive");</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{"// writes on whiteboard — public"}</div>
            <div style={{ color: "#94A3B8" }}>{"// React sees this"}</div>
            <div style={{ color: "#94A3B8" }}>{"// screen updates"}</div>
          </CodeBlock>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 180px", background: "#FEF2F2", border: "2px solid #FECACA", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>📝</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#7F1D1D", marginTop: 6 }}>Paper — private</div>
          <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4 }}>👁️‍🗨️ React: "I can't see this ❌"</div>
        </div>
        <div style={{ flex: "1 1 180px", background: "#F0FDF4", border: "2px solid #BBF7D0", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🖊️</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginTop: 6 }}>Whiteboard — visible</div>
          <div style={{ fontSize: 11, color: "#16A34A", marginTop: 4 }}>👁️ React: "I see this — updating ✅"</div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🤔 The gym owner's plan changes from Basic to Premium. Which code is correct?</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <button onClick={() => choose("A")} className="hk-btn" style={{
          padding: "10px 16px", borderRadius: 10, fontFamily: "monospace", fontSize: 13,
          border: choice === "A" ? "2px solid #DC2626" : "2px solid #E2E8F0", background: choice === "A" ? "#FEF2F2" : "#fff",
          animation: choice === "A" ? "shakeX 0.4s ease" : "none"
        }}>plan = "Premium"; {choice === "A" && "❌"}</button>
        <button onClick={() => choose("B")} className="hk-btn" style={{
          padding: "10px 16px", borderRadius: 10, fontFamily: "monospace", fontSize: 13,
          border: choice === "B" ? "2px solid #059669" : "2px solid #E2E8F0", background: choice === "B" ? "#ECFDF5" : "#fff",
          animation: choice === "B" ? "popIn 0.35s ease" : "none"
        }}>setPlan("Premium"); {choice === "B" && "✅"}</button>
      </div>
      {choice === "A" && <Callout icon="🚫" variant="danger" shake>Never assign directly. React cannot see that. Use the setter: <code>setPlan('Premium')</code></Callout>}

      {done && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, marginBottom: 8 }}>Common pattern — toggle between two values:</div>
          <CodeBlock style={{ marginBottom: 14 }}>
            <div>const [active, setActive] = useState(true);</div>
            <div style={{ marginTop: 6, color: "#94A3B8" }}>{"// toggle:"}</div>
            <div>onClick={"{() => setActive(!active)}"}</div>
            <div style={{ color: "#94A3B8" }}>{"// !active = opposite of current value"}</div>
            <div style={{ color: "#94A3B8" }}>{"// true → false → true → false"}</div>
          </CodeBlock>
          <RunButton onClick={() => { playSound("tick"); onNext(); }}>Build your interactive card →</RunButton>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — FULL INTERACTIVE CARD + PAYOFF
// ═══════════════════════════════════════════════════════════════════════════
const SWIGGY_STEPS = ["Preparing", "Out for delivery", "Delivered"];
function SwiggyStatusStrip({ play }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!play) return;
    const t1 = setTimeout(() => setStep(1), 500);
    const t2 = setTimeout(() => setStep(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [play]);
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
      {SWIGGY_STEPS.map((s, i) => (
        <div key={s} style={{
          padding: "6px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 800,
          background: step >= i ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#E2E8F0",
          color: step >= i ? "#fff" : "#94A3B8", transition: "all 0.3s ease"
        }}>{s}</div>
      ))}
    </div>
  );
}

const PAYOFF_LINES = [
  "Your gym member card is interactive.",
  "No page reload. No server request. No refreshing.",
  "Just React reading the whiteboard. Just the badge changing. Just that one thing.",
  "This is exactly how Swiggy's order status updates: Preparing → Out for delivery → Delivered.",
  "Same pattern. Same useState.",
  "React. Working. Real."
];

function Slot5({ onNext, playSound, cardName, cardPlan }) {
  const [status, setStatus] = useState("Active");
  const [memberPlan, setMemberPlan] = useState(cardPlan || "Basic");
  const [toggleCount, setToggleCount] = useState(0);
  const [upgraded, setUpgraded] = useState(false);
  const [payoffStarted, setPayoffStarted] = useState(false);
  const [payoffLine, setPayoffLine] = useState(-1);
  const timers = useRef([]);

  const toggleStatus = () => {
    setStatus(s => s === "Active" ? "Inactive" : "Active");
    setToggleCount(c => c + 1);
    playSound("add");
    if (!payoffStarted) startPayoff();
  };
  const upgrade = () => {
    setMemberPlan("Premium");
    setUpgraded(true);
    playSound("correct");
    if (!payoffStarted) startPayoff();
  };

  const startPayoff = () => {
    setPayoffStarted(true);
    timers.current.push(setTimeout(() => playSound("correct"), 300));
    timers.current.push(setTimeout(() => playSound("reveal"), 900));
    PAYOFF_LINES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setPayoffLine(i), 1000 + i * 550));
    });
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const interacted = toggleCount > 0 || upgraded;

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🎛️ Put it together — full interactive card</div>

      <CodeBlock style={{ fontSize: 11, marginBottom: 14 }}>
        <div>import {"{ useState }"} from 'react';</div>
        <div style={{ marginTop: 8 }}>const MemberCard = ({"{ name, plan }"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [status, setStatus] = useState("Active");</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// whiteboard — starts Active"}</div>
        <div style={{ paddingLeft: 12, marginTop: 6 }}>const [memberPlan, setMemberPlan] = useState(plan);</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// separate whiteboard, starts with the prop value"}</div>
        <div style={{ marginTop: 8, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="member-card"&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h2&gt;{"{name}"}&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span&gt;{"{memberPlan}"}&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span className={'{status === "Active" ? "badge active" : "badge inactive"}'}&gt;{"{status}"}&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={'{() => setStatus(status === "Active" ? "Inactive" : "Active")}'}&gt;Toggle Status&lt;/button&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={'{() => setMemberPlan("Premium")}'}&gt;Upgrade to Premium&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
        <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Use it:"}</div>
        <div>&lt;MemberCard name="Ravi Kumar" plan="Basic" /&gt;</div>
      </CodeBlock>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#1A3C6E" }}>{cardName || "Ravi Kumar"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", margin: "8px 0 14px" }}>
          <span style={{ fontSize: 13, color: memberPlan === "Premium" ? "#B45309" : "#374151", fontWeight: memberPlan === "Premium" ? 800 : 400, transition: "all 0.3s ease" }}>{memberPlan}</span>
          <StatusBadge status={status} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <RunButton onClick={toggleStatus}>Toggle Status</RunButton>
          <RunButton onClick={upgrade} variant="gold" disabled={upgraded}>{upgraded ? "Upgraded ✅" : "Upgrade to Premium"}</RunButton>
        </div>
        {toggleCount > 0 && <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 10 }}>Toggled {toggleCount} time{toggleCount === 1 ? "" : "s"}</div>}
      </div>

      {payoffLine >= 0 && (
        <div className="hk-wobble-in" style={{
          background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
          padding: 20, boxShadow: "0 10px 24px rgba(16,185,129,0.2)", marginBottom: 14
        }}>
          {PAYOFF_LINES.map((line, i) => (
            <div key={i} className={payoffLine >= i ? "hk-pop" : ""} style={{
              opacity: payoffLine >= i ? 1 : 0, height: payoffLine >= i ? "auto" : 0, overflow: "hidden",
              fontSize: 13.5, fontWeight: i === PAYOFF_LINES.length - 1 ? 800 : 600, color: "#065F46", marginBottom: 8
            }}>{line}</div>
          ))}
          <SwiggyStatusStrip play={payoffLine >= 3} />
        </div>
      )}

      {!interacted && <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center" }}>👆 Click a button on the card above to see the payoff</div>}

      {payoffLine >= PAYOFF_LINES.length - 1 && (
        <RunButton onClick={() => { playSound("tick"); onNext(); }}>Phase 1 complete →</RunButton>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🖊️ useState(initial)", "creates state — whiteboard with starting value"],
    ["🍱 const [value, setter]", "array destructuring — value reads, setter writes"],
    ["✍️ setter(newValue)", "writes on whiteboard — React sees it, re-renders"],
    ["🚫 Never value = x", "paper (private) — React cannot see direct assignment"],
    ["👆 onClick", "event handler — runs arrow function when clicked"],
    ["🖊️🖊️ Multiple useState", "multiple whiteboards — one per piece of memory"],
    ["🔁 !value", "toggle — opposite of current value"],
    ["🎁 Initial value from props", "useState(propValue) — start with the passed-in value"],
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
      <div style={{ marginTop: 18, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.9, fontWeight: 700, background: "#fff", borderRadius: 12, padding: 18, border: "1px dashed #F59E0B" }}>
        Your component has memory. It can change. It can respond. It is interactive.<br /><br />
        HTML — structure ✅ &nbsp; CSS — appearance ✅ &nbsp; JavaScript — behaviour ✅<br />
        React component — reusable ✅ &nbsp; useState — interactive ✅<br /><br />
        Next — Topic 2. Connect to your Spring Boot API.<br />
        Real data. From MySQL. On screen.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", field1: "name", field2: "plan", states: ["Active", "Inactive"], starter:
`const MemberCard = ({ name, plan }) => {
  const [status, setStatus] = useState("Active");

  return (
    <div className="member-card">
      <h2>{name}</h2>
      <p>{plan}</p>
      <span>{status}</span>
      <button onClick={() =>
        setStatus(status === "Active" ? "Inactive" : "Active")
      }>
        Toggle Status
      </button>
    </div>
  );
};` },
  hotel: { icon: "🏨", label: "Hotel", field1: "number", field2: "type", states: ["Available", "Occupied"], starter:
`const RoomCard = ({ number, type }) => {
  const [status, setStatus] = useState("Available");
  // toggle: Available ↔ Occupied
};` },
  mess: { icon: "🍱", label: "Mess", field1: "day", field2: "menu", states: ["Serving", "Done"], starter:
`const MealCard = ({ day, menu }) => {
  const [serving, setServing] = useState(true);
  // toggle: Serving ↔ Done
};` },
  chai: { icon: "☕", label: "Chai", field1: "orderNum", field2: "items", states: ["Pending", "Ready"], starter:
`const OrderCard = ({ orderNum, items }) => {
  const [ready, setReady] = useState(false);
  // toggle: Pending → Ready
};` },
};

function Phase2Left({ domain, setDomain, code, setCode, f1, setF1, f2, setF2, status, setStatus, toggled, setToggled, toggleCount, setToggleCount, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const d = domain ? DOMAINS[domain] : null;
  const ready = d && f1.trim() && f2.trim() && toggled;

  const chooseDomain = (key) => {
    playSound("tick");
    const dd = DOMAINS[key];
    setDomain(key);
    setCode(dd.starter);
    setF1(""); setF2("");
    setStatus(dd.states[0]); setToggled(false); setToggleCount(0);
  };

  const toggle = () => {
    const dd = DOMAINS[domain];
    setStatus(s => s === dd.states[0] ? dd.states[1] : dd.states[0]);
    setToggled(true);
    setToggleCount(c => c + 1);
    playSound("add");
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🎛️ Make YOUR domain card interactive</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, fill in the details, then click to toggle its state.</div>

      {!submitted && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {Object.entries(DOMAINS).map(([key, dd]) => (
              <button key={key} onClick={() => chooseDomain(key)} className="hk-domain-btn" style={{
                padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                border: domain === key ? "2px solid #7C3AED" : "2px solid #E2E8F0",
                background: domain === key ? "linear-gradient(135deg,#F5F3FF,#EDE9FE)" : "#fff",
                color: domain === key ? "#5B21B6" : "#1E293B",
                boxShadow: domain === key ? "0 4px 14px rgba(124,58,237,0.2)" : "none", transition: "all 0.15s ease"
              }}>{dd.icon} {dd.label}</button>
            ))}
          </div>

          {d && (
            <>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                onPaste={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
                spellCheck={false}
                style={{
                  width: "100%", minHeight: 180, background: "#1E293B", color: "#E2E8F0",
                  fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.7, padding: 14,
                  border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 14
                }}
              />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <input value={f1} onChange={e => setF1(e.target.value)} placeholder={d.field1}
                  style={{ flex: "1 1 120px", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }} />
                <input value={f2} onChange={e => setF2(e.target.value)} placeholder={d.field2}
                  style={{ flex: "1 1 120px", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, color: "#059669", fontWeight: 700 }}>✅ useState added to component</span>
                <span style={{ fontSize: 12.5, color: toggled ? "#059669" : "#94A3B8", fontWeight: 700 }}>{toggled && "✅"} onClick button updates state</span>
                <span style={{ fontSize: 12.5, color: toggled ? "#059669" : "#94A3B8", fontWeight: 700 }}>{toggled && "✅"} Clicking button changes what shows on screen</span>
              </div>

              <Callout icon="⭐" title="Optional stretch" variant="tip">
                Add a second state variable — a counter for how many times status was toggled. <code>setToggleCount(toggleCount + 1)</code> on each click.
                {toggleCount > 0 && <div style={{ marginTop: 6, fontWeight: 800 }}>You've toggled {toggleCount} time{toggleCount === 1 ? "" : "s"} already — that's the counter in action! ⭐</div>}
              </Callout>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — why do we use useState instead of a normal JavaScript variable to store values in React?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="We use useState because when a state variable changes React knows to re-render the component and update the screen, whereas a normal variable change is invisible to React and the screen stays frozen..."
                  style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 13.5, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
                  {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
                </div>
              </div>

              <RunButton onClick={onSubmit} disabled={!ready || !reflectionOk}>Component is interactive — fetch real data next →</RunButton>
              {!ready && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>Fill in both fields and click the toggle button on the right at least once.</div>}
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>⚡ useState is working.</div>
          <div style={{ fontSize: 13.5, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ useState creates the whiteboard<br />
            ✅ Setter writes on the whiteboard<br />
            ✅ React sees the change<br />
            ✅ Screen updates — no reload<br />
            ✅ onClick triggers the update<br /><br />
            Topic 1 complete. HTML. CSS. JavaScript. Components. useState.<br /><br />
            Topic 2 — connect to Spring Boot.<br /><br />
            Right now your component has hardcoded data.<br />
            Next — fetch from your actual MySQL database. Real gym members. Real data. On screen.
          </div>
        </div>
      )}
    </div>
  );
}

function DomainCard({ f1, f2, status, states }) {
  const active = status === states[0];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 18, width: "100%", maxWidth: 240, boxShadow: "0 4px 14px rgba(15,23,42,0.1)" }}>
      <h2 style={{ color: "#1A3C6E", fontSize: 17, fontWeight: 800, margin: "0 0 8px" }}>{f1 || "…"}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12.5, color: "#374151" }}>{f2 || "…"}</span>
        <span style={{
          background: active ? "#DCFCE7" : "#FEE2E2", color: active ? "#166534" : "#991B1B",
          borderRadius: 20, padding: "3px 10px", fontSize: 10.5, fontWeight: 800, transition: "all 0.3s ease"
        }}>{status}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function UseStateBuilder() {
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
  const [slot2Done, setSlot2Done] = useState(false);
  const [slot3Done, setSlot3Done] = useState(false);
  const [slot4Done, setSlot4Done] = useState(false);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [code, setCode] = useState("");
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const [domainStatus, setDomainStatus] = useState("");
  const [domainToggled, setDomainToggled] = useState(false);
  const [toggleCount, setToggleCount] = useState(0);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t1-s3-use-state-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { problemUnderstood: true },
          slot2: { useStateBlank: "useState" },
          slot3: { onClickBlank: "onClick", buttonWorked: true },
          slot4: { neverDirectQuestion: "B", setterRuleUnderstood: true },
          slot5: { toggleWorks: true, upgradeWorks: true, interactiveCardComplete: true }
        },
        phase2: {
          domainSelected: domain,
          stateVariableAdded: true,
          onClickWorks: domainToggled,
          screenUpdates: domainToggled,
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

  const d = domain ? DOMAINS[domain] : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.9); opacity:0.5; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
        @keyframes wipeFade { 0% { opacity:1; } 100% { opacity:0; } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-wipe { animation: wipeFade 0.25s ease forwards; pointer-events: none; }
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
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🖊️ SUBTOPIC 4.1.3 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>⚛️ useState — Giving Components Memory</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>The whiteboard that makes React interactive.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} />
              {slot >= 2 && <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done} />}
              {slot >= 3 && <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done} />}
              {slot >= 4 && <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done} />}
              {slot >= 5 && !showReveal && <Slot5 onNext={() => setShowReveal(true)} playSound={playSound} cardName="Ravi Kumar" cardPlan="Basic" />}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }} className="hk-btn hk-pulse" style={{
                  marginTop: 20, padding: "16px 32px", background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff",
                  border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, display: "block", width: "100%"
                }}>🚀 Build for YOUR project →</button>
              )}
            </div>

            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                {slot === 1 && (
                  <Stage caption="No memory — clicking does nothing" label="">
                    <div style={{ fontSize: 48 }}>🧊</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>A frozen component — try the demo on the left</div>
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption={slot2Done ? '{status} reads the whiteboard → shows "Active"' : "👈 Fill in the blank to create the whiteboard"}>
                    <Whiteboard text={slot2Done ? "Active" : ""} />
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption={slot3Done ? "Click the card's button — the whiteboard really updates" : "👈 Fill in the onClick blank"}>
                    <div style={{ fontSize: 40 }}>👆</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Your interactive card appears on the left once correct</div>
                  </Stage>
                )}
                {slot === 4 && (
                  <Stage caption="Setter = whiteboard (visible). Direct assign = paper (invisible).">
                    <div style={{ fontSize: 40 }}>🖊️ vs 📝</div>
                  </Stage>
                )}
                {slot === 5 && (
                  <Stage caption="Everything you learned, combined into one real component">
                    <div style={{ fontSize: 40 }}>🎛️</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Your fully interactive card is on the left — try both buttons!</div>
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
                domain={domain} setDomain={setDomain}
                code={code} setCode={setCode}
                f1={f1} setF1={setF1} f2={f2} setF2={setF2}
                status={domainStatus} setStatus={setDomainStatus}
                toggled={domainToggled} setToggled={setDomainToggled}
                toggleCount={toggleCount} setToggleCount={setToggleCount}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={domain ? "Click to toggle — real useState, updating live" : "👈 Pick a domain to begin"}>
                  {domain ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                      <DomainCard f1={f1} f2={f2} status={domainStatus || d.states[0]} states={d.states} />
                      <RunButton onClick={() => {
                        setDomainStatus(s => (s || d.states[0]) === d.states[0] ? d.states[1] : d.states[0]);
                        setDomainToggled(true);
                        setToggleCount(c => c + 1);
                        playSound("add");
                      }}>Toggle</RunButton>
                    </div>
                  ) : (
                    <div style={{ color: "#94A3B8", fontSize: 13 }}>(your card will appear here)</div>
                  )}
                </Stage>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
