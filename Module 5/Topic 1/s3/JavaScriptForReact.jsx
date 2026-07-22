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
    else if (type === "pop") { play(660, 0, 0.06, "square"); fade(0, 0.08); }
    else if (type === "whoosh") { play(300, 0, 0.15, "sawtooth"); play(500, 0.08, 0.12); fade(0, 0.25); }
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
      borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 12.5, lineHeight: 1.6, color: v.color, ...style
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 10.5,
          letterSpacing: 0.6, marginBottom: 6, color: v.accent, textTransform: "uppercase"
        }}>
          <span style={{ fontSize: 15 }}>{icon}</span>{title}
        </div>
      )}
      {!title && icon && <span style={{ fontSize: 15, marginRight: 8 }}>{icon}</span>}
      {children}
    </div>
  );
}

// ─── CODE BLOCK — static ─────────────────────────────────────────────────────
function CodeBlock({ children, style, faded }) {
  return (
    <div className="hk-card" style={{
      background: faded ? "#334155" : "#1E293B", color: faded ? "#94A3B8" : "#E2E8F0",
      borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 12.5,
      lineHeight: 1.8, whiteSpace: "pre-wrap", opacity: faded ? 0.75 : 1, ...style
    }}>
      {children}
    </div>
  );
}

// ─── JAVA VS JS COMPARISON — compact ─────────────────────────────────────────
function JavaVsJs({ java, js }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginBottom: 10 }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", marginBottom: 4 }}>☕ JAVA</div>
        <CodeBlock faded>{java}</CodeBlock>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#7C3AED", flex: "0 0 auto" }}>→</div>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#FBBF24", marginBottom: 4 }}>🟨 JAVASCRIPT</div>
        <CodeBlock style={{ border: "1px solid #FBBF24" }}>{js}</CodeBlock>
      </div>
    </div>
  );
}

// ─── STAGE — the animated right-panel "story" wrapper ───────────────────────
function Stage({ children, caption }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🎬</span> THE STORY
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 12, background: "linear-gradient(180deg,#0F172A,#1E293B)",
        boxShadow: "0 6px 20px rgba(15,23,42,0.15)", overflow: "hidden", minHeight: 300,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative"
      }}>
        {children}
      </div>
      {caption && (
        <div key={caption} className="hk-pop" style={{
          marginTop: 10, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#065F46",
          background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 999, padding: "6px 14px"
        }}>{caption}</div>
      )}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "const/let", icon: "📦" },
  { label: "Arrow fn", icon: "🏹" },
  { label: "Template", icon: "📝" },
  { label: "Destructure", icon: "🍱" },
  { label: ".map()", icon: "🎢" },
  { label: "async/await", icon: "🛵" },
  { label: "React Ready", icon: "⚛️" },
];
function ProgressBar({ slot }) {
  const pct = Math.max(0, Math.min(100, ((slot - 1) / (STEPS.length - 1)) * 100));
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 17, left: 17, right: 17, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
        <div style={{
          position: "absolute", top: 17, left: 17, height: 4, borderRadius: 2,
          width: `calc(${pct}% - ${pct === 0 ? 0 : 34 * (pct / 100)}px)`,
          background: "linear-gradient(90deg,#7C3AED,#2563EB)", transition: "width 0.5s ease"
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const done = stepNum < slot;
            const active = stepNum === slot;
            return (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                <div className={active ? "hk-pulse" : ""} style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 14, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #DDD6FE" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {done ? "✓" : s.icon}
                </div>
                <div style={{
                  marginTop: 5, fontSize: 9, fontWeight: 700, textAlign: "center",
                  color: done ? "#059669" : active ? "#1E293B" : "#94A3B8"
                }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BLANK — inline fill-in token ────────────────────────────────────────────
function Blank({ value, onChange, correct, placeholder, useDropdown, dropdownOptions, width }) {
  if (useDropdown) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: correct ? "#134E4A" : "#1E293B", color: correct ? "#4ADE80" : "#F1F5F9",
        border: correct ? "1px solid #10B981" : "1px solid #64748B", borderRadius: 5,
        fontFamily: "monospace", fontSize: 14, padding: "2px 6px", outline: "none"
      }}>
        <option value="">[ choose ]</option>
        {dropdownOptions.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
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
    }}>
      {children}
    </div>
  );
}

// ─── TYPED-VALUE INPUT — for personalising the story ────────────────────────
function TypedInput({ label, value, onChange, placeholder, width = 140 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 700, color: "#374151" }}>
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width, padding: "8px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "monospace" }} />
    </label>
  );
}

function RunButton({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="hk-btn" style={{
      padding: "10px 20px", borderRadius: 999, border: "none",
      background: disabled ? "#CBD5E1" : "linear-gradient(135deg,#7C3AED,#2563EB)",
      color: "#fff", fontWeight: 800, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 6px 16px rgba(124,58,237,0.3)"
    }}>{children}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — const AND let — THE DABBA STORY
// ═══════════════════════════════════════════════════════════════════════════
function Dabba({ label, value, sealed, swap, kind }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className={swap ? "hk-dabba-swap" : ""} style={{
        position: "relative", width: 110, height: 100, margin: "0 auto",
        background: kind === "const" ? "#312E81" : "#1E3A8A",
        border: `2px solid ${kind === "const" ? "#818CF8" : "#60A5FA"}`,
        borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: sealed ? "0 0 0 6px rgba(129,140,248,0.15)" : "none", transition: "box-shadow 0.3s ease"
      }}>
        <div className={sealed ? "hk-lid-shut" : ""} style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 22
        }}>{kind === "const" ? (sealed ? "🔒" : "🔓") : "🔓"}</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, padding: 8, wordBreak: "break-word" }}>
          {value || "…"}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#CBD5E1", marginTop: 8 }}>{label}</div>
    </div>
  );
}

function Slot1({ onNext, playSound, done, setDone, onSeal, onUpdatePlan }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value === "const";
  const [checked, setChecked] = useState(false);

  const [nameVal, setNameVal] = useState("Ravi");
  const [planVal, setPlanVal] = useState("Basic");
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const seal = () => {
    playSound("pop");
    setSealed(true);
    onSeal(nameVal || "Ravi");
  };
  const updatePlan = () => {
    playSound("whoosh");
    onUpdatePlan(planVal || "Basic");
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>📦 Variables — without types</div>

      <JavaVsJs
        java={<>
          <div>String name = "Ravi";</div>
          <div>int age = 21;</div>
        </>}
        js={<>
          <div>const name = "Ravi";</div>
          <div>const age = 21;</div>
        </>}
      />
      <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 14 }}>No String. No int. JavaScript figures out the type — you just say const.</div>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — type your own values, watch the story on the right</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="const name =" value={nameVal} onChange={setNameVal} placeholder="Ravi" />
          <RunButton onClick={seal}>Seal it 🔒</RunButton>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
          <TypedInput label="let plan =" value={planVal} onChange={setPlanVal} placeholder="Basic" />
          <RunButton onClick={updatePlan}>Update it 🔓</RunButton>
        </div>
        {sealed && (
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
            Try sealing again with a different name — const won't let it change once set.
          </div>
        )}
      </div>

      <div style={{ marginTop: 4 }}>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div style={{ color: "#94A3B8" }}>// Ravi's gym member details</div>
          <div>
            <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} useDropdown dropdownOptions={["const", "let", "var", "String"]} />
            {" "}memberId = 1; <span style={{ color: "#94A3B8" }}>// never changes</span>
          </div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 memberId never changes. Which keyword?
        </div>
        {wrong && !correct && (
          <Callout icon="🚫" variant="danger" shake>memberId never changes — use <strong>const</strong>.</Callout>
        )}
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="⚛️" variant="tip">In React — use const almost always. You'll meet the exception, useState, in 4.1.3.</Callout>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand const vs let
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Arrow functions →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — ARROW FUNCTIONS — THE MACHINE STORY
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone, onRun }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "=>";
  const [checked, setChecked] = useState(false);
  const [nameVal, setNameVal] = useState("ravi");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const run = () => {
    playSound("whoosh");
    onRun(nameVal || "ravi");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>🏹 Functions — the shorter way</div>

      <JavaVsJs
        java={<>
          <div>public String greet(String name) {"{"}</div>
          <div style={{ paddingLeft: 12 }}>return "Hello " + name;</div>
          <div>{"}"}</div>
        </>}
        js={<>
          <div>const greet = (name) =&gt; "Hello " + name;</div>
        </>}
      />
      <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 14 }}>No public. No void. Just: name → value.</div>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — feed the machine a name</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="shout(" value={nameVal} onChange={setNameVal} placeholder="ravi" />
          <RunButton onClick={run}>Run shout() →</RunButton>
        </div>
      </div>

      <div style={{ marginTop: 4 }}>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div>
            const shout = (name) {" "}
            <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="=>" width={4} />
            {" "}name.toUpperCase();
          </div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 What goes between the parameter and the function body?
        </div>
        {wrong && !correct && <Callout icon="🚫" variant="danger" shake>The arrow is <strong>{"=>"}</strong>.</Callout>}
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock>
            <div style={{ color: "#94A3B8" }}>// one-line vs multi-line — both valid</div>
            <div>const getName = (member) =&gt; member.name; <span style={{ color: "#94A3B8" }}>// one-line</span></div>
          </CodeBlock>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand arrow functions
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Template literals →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — TEMPLATE LITERALS — THE TYPEWRITER STORY
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone, onRun }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value === "`";
  const [checked, setChecked] = useState(false);
  const [nameVal, setNameVal] = useState("Ravi");
  const [planVal, setPlanVal] = useState("Basic");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const run = () => {
    playSound("whoosh");
    onRun(nameVal || "Ravi", planVal || "Basic");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>📝 Strings with variables inside</div>

      <JavaVsJs
        java={<div>String msg = "Hello " + name + "!";</div>}
        js={<div>const msg = <span style={{ color: "#4ADE80" }}>`</span>Hello {"${name}"}!<span style={{ color: "#4ADE80" }}>`</span>;</div>}
      />

      <Callout icon="⚠️" title="The backtick is NOT a quote" variant="tip">
        <code style={{ background: "#1E293B", color: "#4ADE80", padding: "1px 6px", borderRadius: 4 }}>`</code> — usually top-left on your keyboard, beside 1, below Esc. Quotes don't work here.
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — type your own name & plan</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="name =" value={nameVal} onChange={setNameVal} placeholder="Ravi" />
          <TypedInput label="plan =" value={planVal} onChange={setPlanVal} placeholder="Basic" />
          <RunButton onClick={run}>Assemble message →</RunButton>
        </div>
      </div>

      <div style={{ marginTop: 4 }}>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div>
            const message = <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="`" width={2} />
            Hello {"${name}"}, plan {"${plan}"}{correct ? "`" : ""};
          </div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 Type the backtick character to open the template literal.
        </div>
        {wrong && !correct && <Callout icon="🚫" variant="danger" shake>Use the backtick: <code>`</code> — not a quote.</Callout>}
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 12, color: "#374151", margin: "8px 0" }}>No + operators. Variables go directly inside — {"${ }"} wraps any expression.</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand template literals
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Destructuring →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — DESTRUCTURING — THE TIFFIN POP STORY
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone, onRun }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "name";
  const [checked, setChecked] = useState(false);
  const [nameVal, setNameVal] = useState("Ravi");
  const [planVal, setPlanVal] = useState("Basic");
  const [ageVal, setAgeVal] = useState("21");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const run = () => {
    playSound("pop");
    onRun(nameVal || "Ravi", planVal || "Basic", ageVal || "21");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>🍱 Unpack objects at once</div>

      <CodeBlock>
        <div style={{ color: "#94A3B8" }}>// old way — one by one:</div>
        <div>const name = member.name; const plan = member.plan;</div>
        <div style={{ marginTop: 6, color: "#4ADE80" }}>const {"{ name, plan }"} = member; <span style={{ color: "#94A3B8" }}>// at once ✅</span></div>
      </CodeBlock>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, margin: "14px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — fill the tiffin box, then destructure it</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="name" value={nameVal} onChange={setNameVal} placeholder="Ravi" width={90} />
          <TypedInput label="plan" value={planVal} onChange={setPlanVal} placeholder="Basic" width={90} />
          <TypedInput label="age" value={ageVal} onChange={setAgeVal} placeholder="21" width={60} />
          <RunButton onClick={run}>Destructure →</RunButton>
        </div>
      </div>

      <div>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div>const member = {"{ name: \"Ravi\", plan: \"Basic\", age: 21 };"}</div>
          <div style={{ marginTop: 6 }}>
            const {"{ "}
            <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="name" />
            , plan {"}"} = member;
          </div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 To get the name property from member — what goes in the blank?
        </div>
        {wrong && !correct && <Callout icon="🚫" variant="danger" shake>Write the property name: <strong>name</strong>.</Callout>}
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand destructuring
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              .map() →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — .map() — THE CONVEYOR RUN STORY
// ═══════════════════════════════════════════════════════════════════════════
function Slot5({ onNext, playSound, done, setDone, onRun }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "map";
  const [checked, setChecked] = useState(false);
  const [listVal, setListVal] = useState("Ravi, Suresh, Priya");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const run = () => {
    playSound("whoosh");
    const names = listVal.split(",").map(s => s.trim()).filter(Boolean);
    onRun(names.length ? names : ["Ravi", "Suresh", "Priya"]);
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>🎢 .map() — transform every item</div>

      <JavaVsJs
        java={<>
          <div>for (int i=0; i&lt;members.size(); i++) {"{"}</div>
          <div style={{ paddingLeft: 12 }}>print(members.get(i).name);</div>
          <div>{"}"}</div>
        </>}
        js={<div>members.map((m) =&gt; m.name)</div>}
      />

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — type member names, comma-separated</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="members =" value={listVal} onChange={setListVal} placeholder="Ravi, Suresh, Priya" width={220} />
          <RunButton onClick={run}>Run .map() →</RunButton>
        </div>
      </div>

      <div>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div>const names = members.<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="map" />((m) =&gt; m.name);</div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 Which array method transforms every item?
        </div>
        {wrong && !correct && <Callout icon="🚫" variant="danger" shake>The method is <strong>.map()</strong>.</Callout>}
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock>
            <div>members.map((m) =&gt; (</div>
            <div style={{ paddingLeft: 12 }}>&lt;div key={"{m.id}"}&gt;{"{m.name}"}&lt;/div&gt;</div>
            <div>))</div>
          </CodeBlock>
          <Callout icon="🔑" variant="info" style={{ marginTop: 8 }}>key={"{m.id}"} — React needs a unique key per item. Always use the database id.</Callout>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand .map()
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              async/await →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 6 — fetch + async/await — THE SWIGGY ROAD STORY
// ═══════════════════════════════════════════════════════════════════════════
const ASYNC_CARDS = [
  { title: "async", body: "Marks a function as \"this function contains waiting.\" Required whenever you use await." },
  { title: "await", body: "Pauses this line until the response arrives." },
  { title: "try/catch", body: "Same as Java. Network can fail — always wrap fetch in try/catch." },
  { title: "response.json()", body: "Converts the server's raw text into a JavaScript object. Await it too — conversion takes a moment." },
];

function Slot6({ onNext, playSound, done, setDone, onRun }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "async";
  const [cardIndex, setCardIndex] = useState(0);
  const [cardsDone, setCardsDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const [nameVal, setNameVal] = useState("Ravi");

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const nextCard = () => {
    playSound("tick");
    if (cardIndex >= ASYNC_CARDS.length - 1) setCardsDone(true);
    else setCardIndex(i => i + 1);
  };

  const run = () => {
    playSound("whoosh");
    onRun(nameVal || "Ravi");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>🛵 Calling your Spring Boot API</div>

      <Callout icon="🛵" title="Swiggy analogy" variant="tip">
        fetch() places the order · await pauses until it arrives · response.json() unpacks the food.
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>🧪 TRY IT — order a member record</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TypedInput label="member name =" value={nameVal} onChange={setNameVal} placeholder="Ravi" />
          <RunButton onClick={run}>Send request →</RunButton>
        </div>
      </div>

      <div>
        <BlankCard correct={correct} wrong={wrong && !correct}>
          <div>const loadMembers = <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="async" /> () =&gt; {"{"}</div>
          <div style={{ paddingLeft: 12 }}>try {"{"}</div>
          <div style={{ paddingLeft: 24 }}>const response = await fetch(url);</div>
          <div style={{ paddingLeft: 24 }}>const data = await response.json();</div>
          <div style={{ paddingLeft: 12 }}>{"} catch (e) { console.log(e); }"}</div>
          <div>{"};"}</div>
        </BlankCard>
        <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
          💡 A function that uses await must be marked with what keyword?
        </div>
        {wrong && !correct && <Callout icon="🚫" variant="danger" shake>The keyword is <strong>async</strong>.</Callout>}
      </div>

      {correct && !cardsDone && (
        <div className="hk-pop" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, marginBottom: 6 }}>CONCEPT {cardIndex + 1} / {ASYNC_CARDS.length}</div>
          <Callout icon="🔎" title={ASYNC_CARDS[cardIndex].title} variant="info">{ASYNC_CARDS[cardIndex].body}</Callout>
          <button onClick={nextCard} className="hk-btn"
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            {cardIndex >= ASYNC_CARDS.length - 1 ? "Got it →" : "Next →"}
          </button>
        </div>
      )}

      {cardsDone && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand async/await
          </label>
          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 14, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              See a full React component →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 7 — REACT COMPONENT PREVIEW + CONNECT-THE-DOTS + QUIZ
// ═══════════════════════════════════════════════════════════════════════════
function KnownLabel({ known, active }) {
  return (
    <span className={active ? "hk-pop" : ""} style={{
      display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 800, borderRadius: 6,
      padding: "1px 6px", background: known ? "#065F46" : "#78350F", color: known ? "#6EE7B7" : "#FDE68A",
      outline: active ? "2px solid #FBBF24" : "none"
    }}>{known ? "✅ known" : "⬜ 4.1.3"}</span>
  );
}

const QUIZ = [
  { q: "In JavaScript — what keyword declares a variable that cannot change?", options: [["A", "let"], ["B", "const"], ["C", "String"], ["D", "var"]], correct: "B" },
  { q: "What does await do in a network request?", options: [["A", "Sends the request faster"], ["B", "Pauses the function until the response arrives"], ["C", "Cancels the request if slow"], ["D", "Converts the response to JSON"]], correct: "B" },
  { q: "What does .map() do to an array?", options: [["A", "Finds one item in the array"], ["B", "Removes items from the array"], ["C", "Transforms every item and returns a new array"], ["D", "Sorts the array"]], correct: "C" },
];

function Slot7({ playSound, reactRead, setReactRead, quizAnswers, setQuizAnswers, reflection, setReflection, onSubmit, submitted, activeConcept }) {
  const allCorrect = QUIZ.every((item, i) => quizAnswers[i] === item.correct);
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const [allCorrectPlayed, setAllCorrectPlayed] = useState(false);

  const answerQuiz = (i, opt) => {
    setQuizAnswers(prev => ({ ...prev, [i]: opt }));
    playSound(opt === QUIZ[i].correct ? "correct" : "warn");
  };

  useEffect(() => {
    if (allCorrect && !allCorrectPlayed) { playSound("correct"); setAllCorrectPlayed(true); }
  }, [allCorrect]);

  const ackRead = () => {
    if (!reactRead) { playSound("reveal"); setReactRead(true); }
  };

  const CONCEPT_KEYS = ["const", "arrow", "async", "await", "json", "trycatch", "map", "key"];
  const isActive = (key) => activeConcept === key;

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>⚛️ Read this — you understand it</div>

      <Callout icon="🎉" variant="success">Here's a real React component. You haven't learned React yet — but read the JavaScript inside.</Callout>

      <CodeBlock style={{ fontSize: 11.5 }}>
        <div>const MembersList = () =&gt; {"{"} <KnownLabel known active={isActive("const")} /></div>
        <div style={{ paddingLeft: 14, marginTop: 4 }}>const [members, setMembers] = useState([]); <KnownLabel known={false} /></div>
        <div style={{ marginTop: 8, paddingLeft: 14 }}>const loadMembers = async () =&gt; {"{"} <KnownLabel known active={isActive("async")} /></div>
        <div style={{ paddingLeft: 28 }}>try {"{"} <KnownLabel known active={isActive("trycatch")} /></div>
        <div style={{ paddingLeft: 42 }}>const response = await fetch(url); <KnownLabel known active={isActive("await")} /></div>
        <div style={{ paddingLeft: 42 }}>const data = await response.json(); <KnownLabel known active={isActive("json")} /></div>
        <div style={{ paddingLeft: 42 }}>setMembers(data); <KnownLabel known={false} /></div>
        <div style={{ paddingLeft: 28 }}>{"} catch (error) { console.log(error); }"}</div>
        <div style={{ paddingLeft: 14 }}>{"};"}</div>
        <div style={{ marginTop: 8, paddingLeft: 14 }}>return (</div>
        <div style={{ paddingLeft: 28 }}>&lt;div className="list"&gt;</div>
        <div style={{ paddingLeft: 42 }}>{"{members.map((m) => ("} <KnownLabel known active={isActive("map")} /></div>
        <div style={{ paddingLeft: 56 }}>&lt;div key={"{m.id}"}&gt;{"{m.name}"}&lt;/div&gt; <KnownLabel known active={isActive("key")} /></div>
        <div style={{ paddingLeft: 42 }}>)){"}"}</div>
        <div style={{ paddingLeft: 28 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 14 }}>);</div>
        <div>{"};"}</div>
      </CodeBlock>

      {!reactRead && (
        <button onClick={ackRead} className="hk-btn"
          style={{ marginTop: 12, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
          Trace the connections →
        </button>
      )}

      {reactRead && (
        <div className="hk-pop">
          <Callout icon="🏆" variant="success" style={{ textAlign: "center", fontWeight: 700 }}>
            8 / 10 concepts known ✅ — only useState + setMembers are new (4.1.3).
          </Callout>

          <div style={{ fontSize: 15, fontWeight: 800, margin: "16px 0 10px" }}>✍️ Understanding check</div>
          {QUIZ.map((item, i) => (
            <div key={i} className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Q{i + 1}. {item.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {item.options.map(([key, label]) => {
                  const picked = quizAnswers[i] === key;
                  const isCorrect = key === item.correct;
                  return (
                    <button key={key} onClick={() => answerQuiz(i, key)} className="hk-btn"
                      style={{
                        textAlign: "left", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: picked ? (isCorrect ? "2px solid #059669" : "2px solid #DC2626") : "1px solid #E2E8F0",
                        background: picked ? (isCorrect ? "#ECFDF5" : "#FEF2F2") : "#fff",
                        animation: picked ? (isCorrect ? "popIn 0.35s ease" : "shakeX 0.4s ease") : "none"
                      }}>
                      {key}) {label} {picked && (isCorrect ? "✅" : "❌")}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allCorrect && (
            <div style={{ animation: "slideIn 0.4s ease" }}>
              <Callout icon="🎉" variant="success">All 3 correct! Reflection unlocked.</Callout>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
                In one sentence — what is the difference between const and let?
              </div>
              <textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                onPaste={e => e.preventDefault()}
                placeholder="const declares a variable whose value cannot be reassigned (like a sealed dabba), while let declares a variable that can be changed later..."
                style={{
                  width: "100%", minHeight: 80, padding: 12, borderRadius: 10,
                  border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 13.5,
                  resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit"
                }}
              />
              <div style={{ fontSize: 11.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4 }}>
                {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
              </div>
              {!submitted && (
                <button onClick={onSubmit} disabled={!reflectionOk} className="hk-btn"
                  style={{
                    marginTop: 14, padding: "14px 32px",
                    background: reflectionOk ? "linear-gradient(135deg,#1E293B,#334155)" : "#CBD5E1",
                    color: "#fff", border: "none", borderRadius: 12, fontSize: 15.5, fontWeight: 700,
                    cursor: reflectionOk ? "pointer" : "not-allowed", display: "block", width: "100%"
                  }}>JavaScript is ready — let's build React →</button>
              )}
            </div>
          )}

          {submitted && (
            <div className="hk-wobble-in" style={{
              background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
              padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)", marginTop: 14
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>⚡ JavaScript is clear.</div>
              <div style={{ fontSize: 13.5, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 14, border: "1px dashed #10B981" }}>
                ✅ const/let ✅ Arrow functions ✅ Template literals<br />
                ✅ Destructuring ✅ .map() ✅ async/await + fetch<br /><br />
                Topic 0 complete. HTML ✅ CSS ✅ JavaScript ✅<br /><br />
                Now — React. Topic 1 starts with 4.1.1.<br />
                Next — components. JSX. useState. Your gym app gets its face.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT PANEL "STAGE" STORIES — animated, reacting to typed values
// ═══════════════════════════════════════════════════════════════════════════

function Stage1({ sealedName, sealed, storedPlan, swap }) {
  return (
    <Stage caption={sealed ? "const is locked — try changing it, it won't budge 🔒" : "type a name on the left, then seal it"}>
      <div style={{ display: "flex", gap: 28 }}>
        <Dabba label="const name" value={sealed ? sealedName : ""} sealed={sealed} kind="const" />
        <Dabba label="let plan" value={storedPlan} swap={swap} kind="let" />
      </div>
    </Stage>
  );
}

function Stage2({ runId, inputName, resultName }) {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (!runId) return;
    setPhase("in");
    const t1 = setTimeout(() => setPhase("out"), 500);
    return () => clearTimeout(t1);
  }, [runId]);
  return (
    <Stage caption={phase === "out" ? `shout("${inputName}") → "${resultName}"` : "type a name and run shout()"}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className={phase === "in" || phase === "out" ? "hk-slide-in" : ""} style={{
          background: "#334155", color: "#E2E8F0", borderRadius: 10, padding: "10px 16px", fontFamily: "monospace", fontSize: 13, opacity: phase === "idle" ? 0.3 : 1
        }}>{inputName || "name"}</div>
        <div style={{ fontSize: 20 }}>→</div>
        <div style={{
          background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff", borderRadius: 12,
          padding: "16px 20px", fontWeight: 800, fontSize: 13, boxShadow: "0 6px 16px rgba(124,58,237,0.35)"
        }}>=&gt;</div>
        <div style={{ fontSize: 20 }}>→</div>
        <div className={phase === "out" ? "hk-pop" : ""} style={{
          background: "#134E4A", color: "#4ADE80", borderRadius: 10, padding: "10px 16px", fontFamily: "monospace", fontSize: 13,
          opacity: phase === "out" ? 1 : 0.2
        }}>{phase === "out" ? resultName : "?"}</div>
      </div>
    </Stage>
  );
}

function Stage3({ runId, name, plan, done }) {
  const [text, setText] = useState("");
  const full = `Hello ${name}, your plan is ${plan}`;
  useEffect(() => {
    if (!runId) return;
    let i = 0;
    setText("");
    const iv = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  return (
    <Stage caption={text === full ? "assembled — no + operators needed" : "type name & plan, then assemble"}>
      <div style={{
        background: "#1E293B", color: "#4ADE80", borderRadius: 10, padding: "18px 22px",
        fontFamily: "monospace", fontSize: 15, minHeight: 30, border: "1px solid #334155"
      }}>
        "{text}<span style={{ opacity: text.length < full.length && runId ? 1 : 0 }}>▊</span>"
      </div>
    </Stage>
  );
}

function Stage4({ runId, name, plan, age }) {
  const [popped, setPopped] = useState(false);
  useEffect(() => {
    if (!runId) return;
    setPopped(false);
    const t = setTimeout(() => setPopped(true), 300);
    return () => clearTimeout(t);
  }, [runId]);
  return (
    <Stage caption={popped ? "name & plan taken — age left behind, ignored" : "fill the tiffin box and destructure it"}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ position: "relative", width: 150, height: 100 }}>
          <svg width="150" height="100" viewBox="0 0 150 100">
            <rect x="6" y="6" width="138" height="88" rx="12" fill="#292524" stroke="#B45309" strokeWidth="3" />
            <line x1="54" y1="10" x2="54" y2="90" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="100" y1="10" x2="100" y2="90" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
          <div style={{ position: "absolute", top: 38, left: 8, width: 44, textAlign: "center", fontSize: 11, color: popped ? "#78350F" : "#FDE68A", fontWeight: 800, transition: "opacity 0.3s", opacity: popped ? 0.25 : 1 }}>{name}</div>
          <div style={{ position: "absolute", top: 38, left: 55, width: 44, textAlign: "center", fontSize: 11, color: popped ? "#78350F" : "#FDE68A", fontWeight: 800, transition: "opacity 0.3s", opacity: popped ? 0.25 : 1 }}>{plan}</div>
          <div style={{ position: "absolute", top: 38, left: 101, width: 44, textAlign: "center", fontSize: 11, color: "#FDE68A", fontWeight: 800 }}>{age}</div>
        </div>
        <div style={{ fontSize: 20, color: "#7C3AED" }}>→</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className={popped ? "hk-pop" : ""} style={{
            background: "#134E4A", color: "#4ADE80", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700,
            opacity: popped ? 1 : 0.15
          }}>name = "{name}" ✅</div>
          <div className={popped ? "hk-pop" : ""} style={{
            background: "#134E4A", color: "#4ADE80", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700,
            opacity: popped ? 1 : 0.15, animationDelay: "0.1s"
          }}>plan = "{plan}" ✅</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>age: ignored</div>
        </div>
      </div>
    </Stage>
  );
}

function Stage5({ runId, names }) {
  const [stage, setStage] = useState(-1);
  useEffect(() => {
    if (!runId) return;
    setStage(-1);
    names.forEach((_, i) => {
      setTimeout(() => setStage(i), 250 * (i + 1));
    });
  }, [runId]);
  return (
    <Stage caption={stage >= names.length - 1 ? "every item transformed — nothing skipped" : "type names, then run .map()"}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {names.map((n, i) => (
            <div key={n + i} style={{
              background: "#334155", color: "#CBD5E1", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700,
              opacity: i <= stage ? 0.3 : 1, transition: "opacity 0.3s"
            }}>📦 {n}</div>
          ))}
        </div>
        <div className={stage >= 0 && stage < names.length ? "hk-pulse" : ""} style={{
          background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff", borderRadius: 10,
          padding: "14px 16px", fontSize: 12, fontWeight: 800
        }}>⚙️ .map()</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {names.map((n, i) => (
            <div key={n + i} className={i <= stage ? "hk-pop" : ""} style={{
              background: "#DDD6FE", color: "#5B21B6", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700,
              opacity: i <= stage ? 1 : 0
            }}>&lt;div&gt;{n}&lt;/div&gt;</div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

function Stage6({ runId, name }) {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!runId) return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [runId]);
  const steps = [
    { icon: "📱", label: "Order placed", sub: "fetch(...)" },
    { icon: "⏳", label: "Waiting...", sub: "await" },
    { icon: "🛵", label: "Delivered ✅", sub: "response.json()" },
  ];
  return (
    <Stage caption={step === 2 ? `data → { name: "${name}" } arrived` : "type a name, send the request"}>
      <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center", padding: "12px 10px", borderRadius: 12, minWidth: 88,
              background: step >= i ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#334155",
              color: step >= i ? "#fff" : "#64748B", transition: "all 0.3s ease",
              transform: step === i ? "scale(1.08)" : "scale(1)",
              boxShadow: step === i ? "0 6px 16px rgba(124,58,237,0.4)" : "none"
            }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {step >= 0 && (
          <div className="hk-bike" key={runId} style={{ position: "absolute", top: -26, fontSize: 22 }}>🛵💨</div>
        )}
      </div>
    </Stage>
  );
}

function Stage7({ activeConcept, onDone }) {
  const dots = [
    { key: "const", icon: "📦", label: "const" },
    { key: "arrow", icon: "🏹", label: "arrow" },
    { key: "async", icon: "🛵", label: "async" },
    { key: "await", icon: "⏳", label: "await" },
    { key: "json", icon: "📨", label: ".json()" },
    { key: "trycatch", icon: "🧯", label: "try/catch" },
    { key: "map", icon: "🎢", label: ".map()" },
    { key: "key", icon: "🔑", label: "key" },
  ];
  const [litCount, setLitCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const idxRef = useRef(0);

  const play = (setActive) => {
    setPlaying(true);
    idxRef.current = 0;
    setLitCount(0);
    const tick = () => {
      idxRef.current += 1;
      setLitCount(idxRef.current);
      setActive(dots[idxRef.current - 1]?.key);
      if (idxRef.current < dots.length) {
        setTimeout(tick, 420);
      } else {
        setTimeout(() => { setActive(null); onDone && onDone(); }, 500);
      }
    };
    setTimeout(tick, 300);
  };

  return { play, litCount, dots, playing };
}

function ConnectDots({ litCount, dots, onPlay, playing }) {
  const w = 320, h = 260;
  const positions = dots.map((_, i) => {
    const angle = (i / dots.length) * Math.PI * 2 - Math.PI / 2;
    const r = 95;
    return { x: w / 2 + r * Math.cos(angle), y: h / 2 + r * Math.sin(angle) };
  });
  return (
    <Stage caption={litCount >= dots.length ? "✨ every concept connects into one component" : "trace how each concept fits together"}>
      <div style={{ position: "relative", width: w, height: h }}>
        <svg width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }}>
          {positions.map((p, i) => {
            if (i === 0) return null;
            const prev = positions[i - 1];
            const drawn = litCount > i;
            return (
              <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
                stroke={drawn ? "#7C3AED" : "#334155"} strokeWidth={2}
                style={{ transition: "stroke 0.3s ease" }} />
            );
          })}
        </svg>
        {dots.map((d, i) => {
          const p = positions[i];
          const lit = litCount > i;
          return (
            <div key={d.key} className={lit ? "hk-pop" : ""} style={{
              position: "absolute", left: p.x - 22, top: p.y - 22, width: 44, height: 44,
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: lit ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#334155",
              fontSize: 18, boxShadow: lit ? "0 4px 12px rgba(124,58,237,0.4)" : "none", transition: "background 0.3s ease"
            }}>
              {d.icon}
              <div style={{ position: "absolute", top: 46, fontSize: 8, fontWeight: 800, color: lit ? "#DDD6FE" : "#64748B", whiteSpace: "nowrap" }}>{d.label}</div>
            </div>
          );
        })}
        {litCount >= dots.length && (
          <div className="hk-pop" style={{
            position: "absolute", top: h / 2 - 16, left: w / 2 - 40, width: 80, textAlign: "center",
            fontSize: 22
          }}>⚛️✨</div>
        )}
      </div>
      {!playing && litCount === 0 && (
        <button onClick={onPlay} className="hk-btn" style={{
          marginTop: 12, padding: "10px 20px", borderRadius: 999, border: "none",
          background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff", fontWeight: 800, fontSize: 13
        }}>▶ Trace the connections</button>
      )}
    </Stage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function JavaScriptForReact() {
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
  const [constDone, setConstDone] = useState(false);
  const [arrowDone, setArrowDone] = useState(false);
  const [templateDone, setTemplateDone] = useState(false);
  const [destructureDone, setDestructureDone] = useState(false);
  const [mapDone, setMapDone] = useState(false);
  const [asyncDone, setAsyncDone] = useState(false);

  const [reactRead, setReactRead] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Stage story state (right panel), driven by typed values + Run buttons
  const [s1, setS1] = useState({ sealedName: "", sealed: false, storedPlan: "Basic", swap: 0 });
  const [s2, setS2] = useState({ runId: 0, inputName: "", resultName: "" });
  const [s3, setS3] = useState({ runId: 0, name: "Ravi", plan: "Basic" });
  const [s4, setS4] = useState({ runId: 0, name: "Ravi", plan: "Basic", age: "21" });
  const [s5, setS5] = useState({ runId: 0, names: ["Ravi", "Suresh", "Priya"] });
  const [s6, setS6] = useState({ runId: 0, name: "Ravi" });
  const [activeConcept, setActiveConcept] = useState(null);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t0-s3-javascript-for-react",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { constBlank: "const" },
          slot2: { arrowBlank: "=>" },
          slot3: { backtickBlank: "`" },
          slot4: { destructureBlank: "name" },
          slot5: { mapBlank: "map" },
          slot6: { asyncBlank: "async" },
          slot7: { reactComponentRead: true, q1: quizAnswers[0], q2: quizAnswers[1], q3: quizAnswers[2] }
        },
        reflection: { text: reflection }
      },
      metadata: { subtopicId, taskId },
      completedAt: new Date().toISOString(),
    }, "*");
  }, [submitted]);

  const handleSubmit = () => {
    playSound("submit");
    setSubmitted(true);
  };

  const stage7 = Stage7({ activeConcept, onDone: () => {} });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.9); opacity:0.5; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
        @keyframes lidShut { 0% { transform:translateX(-50%) rotate(0deg); } 50% { transform:translateX(-50%) rotate(-15deg) scale(1.3); } 100% { transform:translateX(-50%) rotate(0deg); } }
        @keyframes dabbaSwap { 0% { transform:scale(1); } 40% { transform:scale(0.85) rotate(-3deg); } 70% { transform:scale(1.08) rotate(2deg); } 100% { transform:scale(1); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bikeMove { 0% { left:0%; opacity:1; } 45% { left:45%; } 55% { left:45%; } 100% { left:95%; opacity:1; } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-lid-shut { animation: lidShut 0.5s ease; }
        .hk-dabba-swap { animation: dabbaSwap 0.5s ease; }
        .hk-slide-in { animation: slideInLeft 0.4s ease; }
        .hk-bike { animation: bikeMove 1.8s ease forwards; }
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
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      <div style={{ background: "linear-gradient(135deg,#4C1D95,#1E293B 55%,#0F172A)", color: "#fff", padding: "32px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.35),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>⚡ SUBTOPIC 4.0.3 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>🟨 JavaScript for React</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>7 concepts. Type it yourself — watch the story unfold.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <ProgressBar slot={slot} />

        <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={constDone} setDone={setConstDone}
              onSeal={(name) => setS1(s => ({ ...s, sealedName: name, sealed: true }))}
              onUpdatePlan={(plan) => setS1(s => ({ ...s, storedPlan: plan, swap: s.swap + 1 }))} />
            {slot >= 2 && (
              <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={arrowDone} setDone={setArrowDone}
                onRun={(name) => { setS2({ runId: Date.now(), inputName: name, resultName: name.toUpperCase() }); }} />
            )}
            {slot >= 3 && (
              <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={templateDone} setDone={setTemplateDone}
                onRun={(name, plan) => setS3({ runId: Date.now(), name, plan })} />
            )}
            {slot >= 4 && (
              <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={destructureDone} setDone={setDestructureDone}
                onRun={(name, plan, age) => setS4({ runId: Date.now(), name, plan, age })} />
            )}
            {slot >= 5 && (
              <Slot5 onNext={() => setSlot(6)} playSound={playSound} done={mapDone} setDone={setMapDone}
                onRun={(names) => setS5({ runId: Date.now(), names })} />
            )}
            {slot >= 6 && (
              <Slot6 onNext={() => setSlot(7)} playSound={playSound} done={asyncDone} setDone={setAsyncDone}
                onRun={(name) => setS6({ runId: Date.now(), name })} />
            )}
            {slot >= 7 && (
              <Slot7
                playSound={playSound}
                reactRead={reactRead} setReactRead={setReactRead}
                quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                activeConcept={activeConcept}
              />
            )}
          </div>

          <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
            {slot === 1 && <Stage1 sealedName={s1.sealedName} sealed={s1.sealed} storedPlan={s1.storedPlan} swap={s1.swap} />}
            {slot === 2 && <Stage2 runId={s2.runId} inputName={s2.inputName} resultName={s2.resultName} />}
            {slot === 3 && <Stage3 runId={s3.runId} name={s3.name} plan={s3.plan} />}
            {slot === 4 && <Stage4 runId={s4.runId} name={s4.name} plan={s4.plan} age={s4.age} />}
            {slot === 5 && <Stage5 runId={s5.runId} names={s5.names} />}
            {slot === 6 && <Stage6 runId={s6.runId} name={s6.name} />}
            {slot === 7 && (
              <ConnectDots
                litCount={stage7.litCount}
                dots={stage7.dots}
                playing={stage7.playing}
                onPlay={() => { playSound("reveal"); stage7.play(setActiveConcept); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
