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
  { label: "First Component", icon: "🪪" },
  { label: "JSX Rules", icon: "📐" },
  { label: "{} Curly Braces", icon: "🪟" },
  { label: "Props", icon: "🎁" },
  { label: "Reuse + Payoff", icon: "🧩" },
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

// ─── BLANK — inline fill-in token ────────────────────────────────────────────
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
        <span style={{ fontSize: 14 }}>⚛️</span> LIVE RENDER — REACT
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 14, background: "#F1F5F9",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 300,
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
        {caption && (
          <div key={"c" + caption} style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{caption}</div>
        )}
      </div>
    </div>
  );
}

// ─── THE ACTUAL "STUDENT'S COMPONENT" — real JSX, real React render ─────────
function MemberCard({ name, plan, status, showRow, showButton, plainTextMode }) {
  const badgeStyle = status === "Active"
    ? { background: "#DCFCE7", color: "#166534" }
    : { background: "#FEE2E2", color: "#991B1B" };
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: 20, maxWidth: 260, width: "100%",
      boxShadow: "0 4px 14px rgba(15,23,42,0.1)", fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h2 style={{ color: "#1A3C6E", fontSize: 19, fontWeight: 800, margin: "0 0 10px" }}>
        {plainTextMode ? "name" : name}
      </h2>
      {showRow ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: "#374151" }}>{plan}</span>
          {status && (
            <span style={{ ...badgeStyle, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>{status}</span>
          )}
        </div>
      ) : (
        <p style={{ margin: "4px 0", fontSize: 13, color: "#374151" }}>{plan}</p>
      )}
      {showButton && (
        <button style={{ marginTop: 12, background: "#E8622A", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700 }}>Edit</button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — FIRST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound, done, setDone, name, setName }) {
  const [wrong, setWrong] = useState(false);
  const trimmed = name.trim();
  const correct = trimmed.length > 0 && /^[A-Z][A-Za-z0-9]*$/.test(trimmed);
  const attempted = trimmed.length > 0;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); setTimeout(() => playSound("correct"), 400); }
    else if (attempted && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🪪 Your first React component</div>

      <Callout icon="🖨️" title="The ID card stamp analogy" variant="tip">
        One ID card stamp. Different student data each time. Different card printed each time.<br /><br />
        <strong>Component = the stamp. Props = the student's data. Output = the printed card.</strong>
      </Callout>

      <Callout icon="🚀" variant="success">
        What you're about to write is <strong>real React</strong> — the same pattern developers use building Swiggy, PhonePe, and YouTube. Let's go.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>
          const <Blank value={name} onChange={v => { setName(v); setWrong(false); }} correct={correct} placeholder="MemberCard" width={12} /> = () =&gt; {"{"}
        </div>
        <div style={{ paddingLeft: 12, marginTop: 6, color: "#94A3B8" }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h2&gt;Ravi Kumar&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Basic Plan&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>);</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Name your component — must start with a <strong>capital letter</strong>. It shows a gym member card. Type: MemberCard
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          Component names MUST start with a capital letter. React uses this to tell components apart from regular HTML tags. Try: <strong>MemberCard</strong>
        </Callout>
      )}

      <Callout icon="🔤" title="Why capital letter?" variant="info">
        <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ background: "#E2E8F0", color: "#374151", borderRadius: 8, padding: "8px 14px", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>&lt;div&gt; <span style={{ fontSize: 10, fontWeight: 400 }}>→ HTML tag</span></div>
          <div style={{ background: "#DBEAFE", color: "#1E3A8A", borderRadius: 8, padding: "8px 14px", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>&lt;MemberCard&gt; <span style={{ fontSize: 10, fontWeight: 400 }}>→ Component</span></div>
        </div>
        The capital letter is how React tells them apart.<br />
        <code>&lt;memberCard&gt;</code> would be treated as an unknown HTML tag — wrong. Always capital first letter.
      </Callout>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            My first component is running
          </label>
          {checked && (
            <RunButton onClick={() => { playSound("tick"); onNext(); }}>JSX rules →</RunButton>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — JSX RULES
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone }) {
  const [choice, setChoice] = useState(null);
  const choose = (opt) => {
    setChoice(opt);
    if (opt === "B") { playSound("correct"); setDone(true); }
    else playSound("warn");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📐 JSX — two rules you must know</div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Rule 1 — one outer element</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>❌ WRONG</div>
          <CodeBlock border="#DC2626">
            <div>return (</div>
            <div style={{ paddingLeft: 12 }}>&lt;h2&gt;Ravi&lt;/h2&gt;</div>
            <div style={{ paddingLeft: 12 }}>&lt;p&gt;Basic&lt;/p&gt;</div>
            <div>);</div>
          </CodeBlock>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 4 }}>✅ CORRECT</div>
          <CodeBlock border="#10B981">
            <div>return (</div>
            <div style={{ paddingLeft: 12 }}>&lt;div&gt;</div>
            <div style={{ paddingLeft: 24 }}>&lt;h2&gt;Ravi&lt;/h2&gt;</div>
            <div style={{ paddingLeft: 24 }}>&lt;p&gt;Basic&lt;/p&gt;</div>
            <div style={{ paddingLeft: 12 }}>&lt;/div&gt;</div>
            <div>);</div>
          </CodeBlock>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "#64748B", marginBottom: 12 }}>Two elements at top level → React error. Wrapped in one div → one outer container.</div>

      <Callout icon="❓" title="Why?" variant="info">
        JSX compiles to JavaScript functions. A function can only return ONE thing. Multiple top-level elements = multiple return values = error.<br /><br />
        Always wrap in one <code>&lt;div&gt;</code> or <code>&lt;&gt;</code> (empty tag — Fragment).
      </Callout>

      <CodeBlock style={{ marginBottom: 14 }}>
        <div>return (</div>
        <div style={{ paddingLeft: 12 }}>&lt;&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;h2&gt;Ravi&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;p&gt;Basic&lt;/p&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;/&gt;</div>
        <div>);</div>
        <div style={{ color: "#94A3B8", marginTop: 6 }}>{"// <> </> = Fragment — wraps without adding a div"}</div>
      </CodeBlock>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Rule 2 — JSX is JavaScript</div>
      <Callout icon="🔡" variant="tip">
        HTML uses lowercase: <code>class=</code>. JSX uses camelCase for most things: <code>className=</code> (from 4.0.2), <code>onClick=</code> (not onclick), <code>onChange=</code> (not onchange).
      </Callout>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🤔 Which is correct in JSX?</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <button onClick={() => choose("A")} className="hk-btn" style={{
          padding: "10px 16px", borderRadius: 10, fontFamily: "monospace", fontSize: 13,
          border: choice === "A" ? "2px solid #DC2626" : "2px solid #E2E8F0",
          background: choice === "A" ? "#FEF2F2" : "#fff",
          animation: choice === "A" ? "shakeX 0.4s ease" : "none"
        }}>&lt;div class="card"&gt; {choice === "A" && "❌"}</button>
        <button onClick={() => choose("B")} className="hk-btn" style={{
          padding: "10px 16px", borderRadius: 10, fontFamily: "monospace", fontSize: 13,
          border: choice === "B" ? "2px solid #059669" : "2px solid #E2E8F0",
          background: choice === "B" ? "#ECFDF5" : "#fff",
          animation: choice === "B" ? "popIn 0.35s ease" : "none"
        }}>&lt;div className="card"&gt; {choice === "B" && "✅"}</button>
      </div>
      {choice === "A" && <Callout icon="🚫" variant="danger" shake>className — always in React. class is for HTML files. JSX uses className.</Callout>}

      {done && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <RunButton onClick={() => { playSound("tick"); onNext(); }}>Curly braces →</RunButton>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — CURLY BRACES
// ═══════════════════════════════════════════════════════════════════════════
function WindowInWall({ open }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(3, 22px)", gap: 3, width: 220, margin: "0 auto 12px" }}>
      {Array.from({ length: 15 }).map((_, i) => {
        const isWindow = i === 6 || i === 7;
        return (
          <div key={i} style={{
            background: isWindow ? (open ? "#134E4A" : "#78350F") : "#B45309",
            border: "1px solid #92400E", borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, color: isWindow ? "#4ADE80" : "transparent", fontWeight: 800, fontFamily: "monospace",
            transition: "background 0.3s ease"
          }}>{isWindow && i === 6 ? (open ? "{name}" : "🧱") : ""}</div>
        );
      })}
    </div>
  );
}

function Slot3({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "{name}";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🪟 {"{}"} — let JavaScript through</div>

      <Callout icon="🧱" title="Window in a wall" variant="tip">
        <WindowInWall open={correct} />
        <div style={{ textAlign: "center" }}>
          JSX is a wall of HTML. <strong>{"{}"}</strong> is a window. JavaScript passes through the window.
        </div>
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const name = "Ravi Kumar";</div>
        <div>const plan = "Basic";</div>
        <div style={{ marginTop: 8 }}>const MemberCard = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="member-card"&gt;</div>
        <div style={{ paddingLeft: 36 }}>
          &lt;h2&gt;<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="{name}" width={8} />&lt;/h2&gt;
        </div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;{"{plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Wrap the variable name in curly braces so React uses the JavaScript value. Type: {"{name}"}
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          Wrap with curly braces: <strong>{"{name}"}</strong>. Without {"{}"}: React shows the word "name" as plain text. With {"{}"}: React uses the variable.
        </Callout>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
        <div style={{ flex: "1 1 160px", background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#64748B" }}>&lt;h2&gt;name&lt;/h2&gt;</div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>→ shows plain text</div>
          <div style={{ fontWeight: 800, marginTop: 6 }}>name</div>
        </div>
        <div style={{ flex: "1 1 160px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 12, textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#166534" }}>&lt;h2&gt;{"{name}"}&lt;/h2&gt;</div>
          <div style={{ fontSize: 11, color: "#16A34A", marginTop: 4 }}>→ shows the variable</div>
          <div style={{ fontWeight: 800, marginTop: 6, color: "#166534" }}>Ravi Kumar</div>
        </div>
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Any JS expression works inside {"{}"}:</div>
          <CodeBlock style={{ marginBottom: 14 }}>
            <div>&lt;p&gt;{"{plan.toUpperCase()}"}&lt;/p&gt; <span style={{ color: "#94A3B8" }}>{"// → BASIC"}</span></div>
            <div>&lt;p&gt;{"{2 + 2}"}&lt;/p&gt; <span style={{ color: "#94A3B8" }}>{"// → 4"}</span></div>
            <div>&lt;p&gt;{'{active ? "Active" : "Inactive"}'}&lt;/p&gt; <span style={{ color: "#94A3B8" }}>{"// → Active"}</span></div>
          </CodeBlock>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand {"{}"}
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Props →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — PROPS
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "name";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🎁 Props — different data each time</div>

      <Callout icon="❓" variant="danger">
        Right now — MemberCard always shows Ravi Kumar. What about Suresh? Priya?<br /><br />
        You cannot write a separate component for every member. That defeats the purpose.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div style={{ color: "#94A3B8" }}>{"// Using the component:"}</div>
        <div>
          &lt;MemberCard <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="name" width={5} />="Suresh"
        </div>
        <div style={{ paddingLeft: 60 }}>plan="Premium" /&gt;</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 To pass the member's name into MemberCard — what prop name do you use? <span style={{ color: "#94A3B8" }}>(matches what you read inside the component)</span>
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>name= passes the member's name. <code>&lt;MemberCard name='Suresh' /&gt;</code></Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock style={{ marginBottom: 10 }}>
            <div style={{ color: "#94A3B8" }}>{"// Component RECEIVES props:"}</div>
            <div>const MemberCard = (props) =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>return (</div>
            <div style={{ paddingLeft: 24 }}>&lt;div className="member-card"&gt;</div>
            <div style={{ paddingLeft: 36 }}>&lt;h2&gt;{"{props.name}"}&lt;/h2&gt;</div>
            <div style={{ paddingLeft: 36 }}>&lt;p&gt;{"{props.plan}"}&lt;/p&gt;</div>
            <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
            <div style={{ paddingLeft: 12 }}>);</div>
            <div>{"};"}</div>
            <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Parent PASSES props:"}</div>
            <div>&lt;MemberCard name="Suresh" plan="Premium" /&gt;</div>
          </CodeBlock>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14, marginBottom: 14, fontFamily: "monospace", fontSize: 11.5, textAlign: "center" }}>
            &lt;MemberCard name="Suresh" plan="Premium" /&gt;<br />
            <span style={{ color: "#7C3AED" }}>↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓</span><br />
            props.name → "Suresh" &nbsp;&nbsp; props.plan → "Premium"
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>The destructuring shortcut:</div>
          <CodeBlock style={{ marginBottom: 8 }}>
            <div style={{ color: "#94A3B8" }}>{"// Instead of props.name:"}</div>
            <div>const MemberCard = ({"{ name, plan }"}) =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>return (</div>
            <div style={{ paddingLeft: 24 }}>&lt;div className="member-card"&gt;</div>
            <div style={{ paddingLeft: 36 }}>&lt;h2&gt;{"{name}"}&lt;/h2&gt;</div>
            <div style={{ paddingLeft: 36 }}>&lt;p&gt;{"{plan}"}&lt;/p&gt;</div>
            <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
            <div style={{ paddingLeft: 12 }}>);</div>
            <div>{"};"}</div>
          </CodeBlock>
          <div style={{ fontSize: 11.5, color: "#64748B", marginBottom: 14 }}>
            Same as: <code>const {"{ name, plan }"} = props;</code> — you learned this in 4.0.3. Most React code uses this style.
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand props
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>One component, three cards →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — REUSE + PAYOFF
// ═══════════════════════════════════════════════════════════════════════════
const THREE_MEMBERS = [
  { name: "Ravi Kumar", plan: "Basic", status: "Active" },
  { name: "Suresh", plan: "Premium", status: "Active" },
  { name: "Priya", plan: "Basic", status: "Inactive" },
];
const PAYOFF_LINES = [
  "One component definition. Three different outputs.",
  "You wrote MemberCard once. You can use it 200 times — once for every gym member.",
  "When the design changes — you update ONE component. All 200 cards update.",
  "This is why React exists."
];
function Slot5({ onNext, playSound, cardsShown, setCardsShown }) {
  const [payoffLine, setPayoffLine] = useState(-1);
  const timers = useRef([]);

  const runCards = () => {
    setCardsShown(true);
    playSound("correct");
    timers.current.push(setTimeout(() => playSound("reveal"), 1000));
    PAYOFF_LINES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setPayoffLine(i), 1400 + i * 500));
    });
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧩 One component. Three cards.</div>

      <Callout icon="🏋️" variant="tip">
        Your gym has three members. Write MemberCard THREE times. Each with different props.
      </Callout>

      <CodeBlock style={{ fontSize: 11.5, marginBottom: 14 }}>
        <div style={{ color: "#94A3B8" }}>{"// One component definition:"}</div>
        <div>const MemberCard = ({"{ name, plan, status }"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="member-card"&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h2&gt;{"{name}"}&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;div className="card-row"&gt;</div>
        <div style={{ paddingLeft: 48 }}>&lt;p&gt;{"{plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 48 }}>&lt;span className={'{status === "Active" ? "badge active" : "badge inactive"}'}&gt;</div>
        <div style={{ paddingLeft: 60 }}>{"{status}"}</div>
        <div style={{ paddingLeft: 48 }}>&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
        <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// Three uses:"}</div>
        <div>&lt;MemberCard name="Ravi Kumar" plan="Basic" status="Active" /&gt;</div>
        <div>&lt;MemberCard name="Suresh" plan="Premium" status="Active" /&gt;</div>
        <div>&lt;MemberCard name="Priya" plan="Basic" status="Inactive" /&gt;</div>
      </CodeBlock>

      <Callout icon="🔀" title="The ternary expression" variant="info">
        <div style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: "#2563EB", fontWeight: 800 }}>status === 'Active'</span> ?{" "}
          <span style={{ color: "#16A34A", fontWeight: 800 }}>'badge active'</span> :{" "}
          <span style={{ color: "#DC2626", fontWeight: 800 }}>'badge inactive'</span>
        </div>
        <code>condition ? if-true : if-false</code> — same as Java's ternary: <code>status.equals('Active') ? ... : ...</code>. Used inside {"{}"} for dynamic className.
      </Callout>

      {!cardsShown && <RunButton onClick={runCards}>Render three cards →</RunButton>}

      {payoffLine >= 0 && (
        <div className="hk-wobble-in" style={{
          marginTop: 18, background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981",
          borderRadius: 16, padding: 20, boxShadow: "0 10px 24px rgba(16,185,129,0.2)"
        }}>
          {PAYOFF_LINES.map((line, i) => (
            <div key={i} className={payoffLine >= i ? "hk-pop" : ""} style={{
              opacity: payoffLine >= i ? 1 : 0, height: payoffLine >= i ? "auto" : 0, overflow: "hidden",
              fontSize: 14, fontWeight: i === PAYOFF_LINES.length - 1 ? 800 : 600, color: "#065F46",
              marginBottom: 10, transition: "opacity 0.3s ease"
            }}>{line}</div>
          ))}
        </div>
      )}

      {payoffLine >= PAYOFF_LINES.length - 1 && (
        <div style={{ marginTop: 16 }}>
          <RunButton onClick={() => { playSound("tick"); onNext(); }}>Phase 1 complete →</RunButton>
        </div>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🧩 Component", "function that returns JSX — name always starts capital"],
    ["📐 JSX", "HTML-like syntax inside JavaScript return()"],
    ["1️⃣ One outer element", "JSX must have ONE root element"],
    ["🪟 {}", "window in the HTML wall — JavaScript passes through"],
    ["🎁 Props", 'data passed into a component — <Card name="Ravi" />'],
    ["📖 props.name / {name}", "read the prop inside component"],
    ["♻️ Reusability", "one component, many uses, different data each time"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => { setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 320); });
    setTimeout(() => onDone(), 400 + items.length * 320 + 200);
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
        You just wrote a real React component.<br />One stamp. Three cards.<br /><br />
        Next — 4.1.3. useState.<br />
        Your component needs memory. When the gym owner marks a member active — the card updates. No page reload.<br />
        That is useState.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", fields: ["name", "plan", "status"], statusOptions: ["Active", "Inactive"], starter:
`const MemberCard = ({ name, plan, status }) => {
  return (
    <div className="member-card">
      <h2>{name}</h2>
      <p>{plan}</p>
      <span>{status}</span>
      <button>Edit</button>
    </div>
  );
};` },
  hotel: { icon: "🏨", label: "Hotel", fields: ["number", "type", "status"], statusOptions: ["Available", "Occupied"], starter:
`const RoomCard = ({ number, type, status }) => {
  return (
    <div className="room-card">
      <h2>{number}</h2>
      <p>{type}</p>
      <span>{status}</span>
    </div>
  );
};` },
  mess: { icon: "🍱", label: "Mess", fields: ["day", "menu", "status"], statusOptions: ["Serving", "Closed"], starter:
`const MealCard = ({ day, menu, status }) => {
  return (
    <div className="meal-card">
      <h2>{day}</h2>
      <p>{menu}</p>
      <span>{status}</span>
    </div>
  );
};` },
  chai: { icon: "☕", label: "Chai", fields: ["orderNum", "items", "status"], statusOptions: ["Pending", "Ready"], starter:
`const OrderCard = ({ orderNum, items, status }) => {
  return (
    <div className="order-card">
      <h2>{orderNum}</h2>
      <p>{items}</p>
      <span>{status}</span>
    </div>
  );
};` },
  other: { icon: "🏪", label: "Other", fields: ["title", "detail", "status"], statusOptions: ["Active", "Inactive"], starter:
`const InfoCard = ({ title, detail, status }) => {
  return (
    <div className="info-card">
      <h2>{title}</h2>
      <p>{detail}</p>
      <span>{status}</span>
    </div>
  );
};` },
};

function GenericCard({ f1, f2, status, statusOptions }) {
  const active = status === statusOptions[0];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 18, width: "100%", maxWidth: 240, boxShadow: "0 4px 14px rgba(15,23,42,0.1)" }}>
      <h2 style={{ color: "#1A3C6E", fontSize: 17, fontWeight: 800, margin: "0 0 8px" }}>{f1 || "…"}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12.5, color: "#374151" }}>{f2 || "…"}</span>
        <span style={{
          background: active ? "#DCFCE7" : "#FEE2E2", color: active ? "#166534" : "#991B1B",
          borderRadius: 20, padding: "3px 10px", fontSize: 10.5, fontWeight: 800
        }}>{status}</span>
      </div>
    </div>
  );
}

function Phase2Left({ domain, setDomain, code, setCode, rows, setRows, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const d = domain ? DOMAINS[domain] : null;
  const allFilled = d && rows.every(r => r[d.fields[0]] && r[d.fields[1]]);

  const chooseDomain = (key) => {
    playSound("tick");
    setDomain(key);
    setCode(DOMAINS[key].starter);
    const dd = DOMAINS[key];
    setRows([
      { [dd.fields[0]]: "", [dd.fields[1]]: "", [dd.fields[2]]: dd.statusOptions[0] },
      { [dd.fields[0]]: "", [dd.fields[1]]: "", [dd.fields[2]]: dd.statusOptions[0] },
      { [dd.fields[0]]: "", [dd.fields[1]]: "", [dd.fields[2]]: dd.statusOptions[1] },
    ]);
  };

  const updateRow = (i, field, val) => {
    setRows(rs => rs.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🏗️ Build YOUR domain component</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, then fill in three different instances.</div>

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

          {domain && (
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

              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>✍️ THREE INSTANCES — different data each time</div>
              {rows.map((row, i) => (
                <div key={i} className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12, marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", width: 18 }}>#{i + 1}</span>
                  <input value={row[d.fields[0]]} onChange={e => updateRow(i, d.fields[0], e.target.value)} placeholder={d.fields[0]}
                    style={{ flex: "1 1 100px", padding: "7px 10px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12.5 }} />
                  <input value={row[d.fields[1]]} onChange={e => updateRow(i, d.fields[1], e.target.value)} placeholder={d.fields[1]}
                    style={{ flex: "1 1 100px", padding: "7px 10px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12.5 }} />
                  <select value={row[d.fields[2]]} onChange={e => updateRow(i, d.fields[2], e.target.value)}
                    style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 12.5 }}>
                    {d.statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 12.5, color: d ? "#059669" : "#94A3B8", fontWeight: 700 }}>{d && "✅"} Component defined with 3 props</span>
                <span style={{ fontSize: 12.5, color: allFilled ? "#059669" : "#94A3B8", fontWeight: 700 }}>{allFilled && "✅"} Component used 3 times with different data</span>
                <span style={{ fontSize: 12.5, color: allFilled ? "#059669" : "#94A3B8", fontWeight: 700 }}>{allFilled && "✅"} All three cards visible on the right</span>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — what is the benefit of using props in a React component?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="Props allow the same component to show different data each time it is used — so I only need to write MemberCard once but can render it for every member in the gym..."
                  style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 13.5, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
                  {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
                </div>
              </div>

              <RunButton onClick={onSubmit} disabled={!allFilled || !reflectionOk}>Components working — add memory next →</RunButton>
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>🧩 Components are real.</div>
          <div style={{ fontSize: 13.5, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ Function that returns JSX<br />
            ✅ Capital letter name<br />
            ✅ One outer element<br />
            ✅ {"{}"} lets JavaScript through<br />
            ✅ Props pass data in<br />
            ✅ One component — many uses<br /><br />
            Next — 4.1.3. useState.<br /><br />
            Right now your component is static — it never changes.<br />
            useState gives it memory. Click a button — card updates. No reload. Just React updating exactly what changed.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ComponentsBuilder() {
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

  const [componentName, setComponentName] = useState("");
  const [slot1Done, setSlot1Done] = useState(false);
  const [slot2Done, setSlot2Done] = useState(false);
  const [slot3Done, setSlot3Done] = useState(false);
  const [slot4Done, setSlot4Done] = useState(false);
  const [cardsShown, setCardsShown] = useState(false);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [code, setCode] = useState("");
  const [rows, setRows] = useState([]);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const d = domain ? DOMAINS[domain] : null;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m5-t2-s2-components-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { componentName, startsWithCapital: true },
          slot2: { classNameQuestion: "B" },
          slot3: { curlyBracesBlank: "{name}" },
          slot4: { propNameBlank: "name", propsUnderstood: true },
          slot5: { threeCardsRendered: true, reuseUnderstood: true }
        },
        phase2: {
          domainSelected: domain,
          componentCode: code,
          propsUsed: d ? d.fields : [],
          threeInstancesRendered: true,
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
        @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-card-in { animation: cardIn 0.45s ease both; }
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
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🧩 SUBTOPIC 4.1.2 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>⚛️ Components &amp; Props</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>Your first real React component.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done} name={componentName} setName={setComponentName} />
              {slot >= 2 && <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done} />}
              {slot >= 3 && <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done} />}
              {slot >= 4 && <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done} />}
              {slot >= 5 && !showReveal && <Slot5 onNext={() => { setShowReveal(true); }} playSound={playSound} cardsShown={cardsShown} setCardsShown={setCardsShown} />}
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
                  <Stage label={slot1Done ? "MemberCard component ✅" : ""} caption={slot1Done ? "Your first React component ✅ Real React. Running live." : "👈 Fill in the blank to render your component"}>
                    {slot1Done ? <MemberCard name="Ravi Kumar" plan="Basic Plan" /> : <div style={{ color: "#94A3B8", fontSize: 13 }}>(component will appear here)</div>}
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption={slot2Done ? "className applied — this is what's actually rendering" : "👈 Answer the question on the left"}>
                    <MemberCard name="Ravi Kumar" plan="Basic Plan" />
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption={slot3Done ? '"Ravi Kumar" — the real variable value, not the word "name"' : "👈 Fill the curly-brace blank"}>
                    <MemberCard name="Ravi Kumar" plan="Basic" plainTextMode={!slot3Done} />
                  </Stage>
                )}
                {slot === 4 && (
                  <Stage label={slot4Done ? "props.name = \"Suresh\" ✅" : ""} caption={slot4Done ? "Different data, same component — that's props" : "👈 Fill in the prop name on the left"}>
                    <MemberCard name={slot4Done ? "Suresh" : "?"} plan={slot4Done ? "Premium" : "?"} plainTextMode={false} />
                  </Stage>
                )}
                {slot === 5 && (
                  <Stage caption={cardsShown ? "Same component. Three different renders." : "👈 Click Render three cards"}>
                    {cardsShown ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", alignItems: "center" }}>
                        {THREE_MEMBERS.map((m, i) => (
                          <div key={m.name} className="hk-card-in" style={{ animationDelay: `${i * 0.2}s`, width: "100%", display: "flex", justifyContent: "center" }}>
                            <MemberCard name={m.name} plan={m.plan} status={m.status} showRow />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "#94A3B8", fontSize: 13 }}>(three cards will appear here)</div>
                    )}
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
                rows={rows} setRows={setRows}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={domain ? "Three instances of your component, live" : "👈 Pick a domain to begin"}>
                  {domain ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", alignItems: "center" }}>
                      {rows.map((r, i) => (
                        <div key={i} className="hk-card-in" style={{ animationDelay: `${i * 0.15}s`, width: "100%", display: "flex", justifyContent: "center" }}>
                          <GenericCard f1={r[d.fields[0]]} f2={r[d.fields[1]]} status={r[d.fields[2]]} statusOptions={d.statusOptions} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#94A3B8", fontSize: 13 }}>(your cards will appear here)</div>
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
