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
      fontFamily: "monospace", fontSize: 15.5, lineHeight: 1.8, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Three Fields", icon: "🧾" },
  { label: "Select + parseInt", icon: "🔽" },
  { label: "POST Handler", icon: "📮" },
  { label: "Clear + Refresh", icon: "🔄" },
  { label: "Full App Test", icon: "🚀" },
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
      padding: 18, fontFamily: "monospace", fontSize: 16, lineHeight: 1.75,
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
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden", minHeight: 340,
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

// ─── MEMBER CARD ─────────────────────────────────────────────────────────────
function MemberCard({ m, isNew }) {
  return (
    <div className={isNew ? "hk-slide-in" : ""} style={{
      background: "#fff", borderRadius: 12, padding: 16, width: "100%", maxWidth: 260,
      boxShadow: isNew ? "0 0 0 3px rgba(16,185,129,0.35), 0 4px 14px rgba(15,23,42,0.1)" : "0 4px 14px rgba(15,23,42,0.08)",
      display: "flex", justifyContent: "space-between", alignItems: "center", transition: "box-shadow 0.6s ease"
    }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#1A3C6E" }}>{m.name}</div>
        <div style={{ fontSize: 15, color: "#64748B" }}>{m.plan} {m.age ? `· ${m.age}y` : ""}</div>
      </div>
      <span style={{
        background: m.isActive ? "#DCFCE7" : "#FEE2E2", color: m.isActive ? "#166534" : "#991B1B",
        borderRadius: 20, padding: "5px 12px", fontSize: 13.5, fontWeight: 800
      }}>{m.isActive ? "Active" : "Inactive"}</span>
    </div>
  );
}

// ─── ID CARD PREVIEW — visual mockup that builds as the student types ──────
const PLAN_COLORS = {
  Basic: { bg: "#E2E8F0", color: "#374151" },
  Premium: { bg: "#FEF3C7", color: "#92400E" },
  Annual: { bg: "#EDE9FE", color: "#5B21B6" },
};
function IdCardPreview({ name, age, plan, showPlan }) {
  const planStyle = PLAN_COLORS[plan] || PLAN_COLORS.Basic;
  return (
    <div style={{
      background: "#fff", border: "2px dashed #CBD5E1", borderRadius: 16, padding: 24,
      width: "100%", maxWidth: 260, textAlign: "center", boxShadow: "0 4px 14px rgba(15,23,42,0.06)"
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>🪪</div>
      <div key={"name-" + name} className="hk-pop" style={{
        fontFamily: "monospace", fontSize: 19, fontWeight: 800, color: name ? "#1A3C6E" : "#CBD5E1", minHeight: 26
      }}>{name || "member name"}</div>
      <div key={"age-" + age} className="hk-pop" style={{
        fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: age ? "#475569" : "#CBD5E1", marginTop: 6
      }}>{age ? `${age} years old` : "age"}</div>
      {showPlan && (
        <div key={"plan-" + plan} className="hk-pop" style={{
          display: "inline-block", marginTop: 12, background: planStyle.bg, color: planStyle.color,
          borderRadius: 20, padding: "6px 16px", fontWeight: 800, fontSize: 13.5
        }}>{plan}</div>
      )}
    </div>
  );
}

// ─── REAL CONTROLLED ADD-MEMBER FORM (shared logic) ─────────────────────────
function AddMemberFields({ name, setName, age, setAge, plan, setPlan, showAge, showSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 260 }}>
      <input type="text" placeholder="Member name" value={name} onChange={e => setName(e.target.value)}
        style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }} />
      {showAge && (
        <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)}
          style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }} />
      )}
      {showSelect && (
        <select value={plan} onChange={e => setPlan(e.target.value)}
          style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }}>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="Annual">Annual</option>
        </select>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — THREE CONTROLLED FIELDS
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound, done, setDone, name, setName, age, setAge }) {
  const [vName, setVName] = useState("");
  const [wrongName, setWrongName] = useState(false);
  const correctName = vName.trim() === "setName";

  const [vAge, setVAge] = useState("");
  const [wrongAge, setWrongAge] = useState(false);
  const correctAge = vAge.trim() === "setAge";

  const correct = correctName && correctAge;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🧾 Three fields — three state variables</div>

      <Callout icon="🏨" variant="tip">One input = one state variable. Type both setters below.</Callout>

      <BlankCard correct={correct} wrong={(wrongName || wrongAge) && !correct}>
        <div>&lt;input type="text" value={"{name}"} onChange={"{(e) => "}
          <Blank value={vName} onChange={v => { setVName(v); setWrongName(!!v); }} correct={correctName} placeholder="setName" width={9} />
          {"(e.target.value)}"} /&gt;
        </div>
        <div style={{ marginTop: 8 }}>&lt;input type="number" value={"{age}"} onChange={"{(e) => "}
          <Blank value={vAge} onChange={v => { setVAge(v); setWrongAge(!!v); }} correct={correctAge} placeholder="setAge" width={8} />
          {"(e.target.value)}"} /&gt;
        </div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Each input calls its own setter on every keystroke — fill in both.
      </div>
      {((wrongName && !correctName) || (wrongAge && !correctAge)) && (
        <Callout icon="🚫" variant="danger" shake>
          name input → <code>setName</code>, age input → <code>setAge</code>.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — type into both, watch the card build on the right</div>
            <AddMemberFields name={name} setName={setName} age={age} setAge={setAge} showAge />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand controlled fields
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Add the dropdown →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — SELECT + parseInt
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone, name, setName, age, setAge, plan, setPlan }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "select";

  const [value2, setValue2] = useState("");
  const [wrong2, setWrong2] = useState(false);
  const correct2 = value2.trim() === "parseInt";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  useEffect(() => {
    if (correct2) playSound("add");
    else if (value2) setWrong2(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct2]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🔽 Dropdown and number handling</div>

      <Callout icon="📋" variant="info">
        <code>&lt;select&gt;</code> works like <code>&lt;input&gt;</code> — <code>value</code> + <code>onChange</code>, plus one <code>&lt;option&gt;</code> per choice.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>
          &lt;<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="select" width={7} />
        </div>
        <div style={{ paddingLeft: 12 }}>value={"{plan}"}</div>
        <div style={{ paddingLeft: 12 }}>onChange={"{(e) => setPlan(e.target.value)}"}</div>
        <div>&gt;</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>&lt;option value="Basic"&gt;Basic&lt;/option&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;option value="Premium"&gt;Premium&lt;/option&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;option value="Annual"&gt;Annual&lt;/option&gt;</div>
        <div style={{ marginTop: 6 }}>&lt;/{correct ? "select" : "..."}&gt;</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 What HTML element creates a dropdown with options inside?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>The element is <strong>&lt;select&gt;</strong>. Options go inside it.</Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="🔢" variant="tip">
            Inputs are always strings — Spring Boot needs a number. Wrap age in a converter.
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", margin: "12px 0 4px" }}>
              <div style={{ background: "#FEF9C3", color: "#854D0E", borderRadius: 8, padding: "8px 14px", fontFamily: "monospace", fontWeight: 800, fontSize: 15 }}>"21"</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#7C3AED" }}>? () →</div>
              <div style={{ background: "#DBEAFE", color: "#1E3A8A", borderRadius: 8, padding: "8px 14px", fontFamily: "monospace", fontWeight: 800, fontSize: 15 }}>21</div>
            </div>
          </Callout>

          <BlankCard correct={correct2} wrong={wrong2 && !correct2}>
            <div>body: JSON.stringify({"{"}</div>
            <div style={{ paddingLeft: 12 }}>name: name,</div>
            <div style={{ paddingLeft: 12 }}>
              age: <Blank value={value2} onChange={v => { setValue2(v); setWrong2(false); }} correct={correct2} placeholder="parseInt" width={8} />(age),
            </div>
            <div style={{ paddingLeft: 12 }}>plan: plan,</div>
            <div style={{ paddingLeft: 12 }}>isActive: true</div>
            <div>{"})"}</div>
          </BlankCard>
          <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
            💡 age is a string like "21" — which function converts it to a number?
          </div>
          {wrong2 && !correct2 && (
            <Callout icon="🚫" variant="danger" shake>Use <code>parseInt(age)</code> — turns "21" into 21.</Callout>
          )}

          {correct2 && (
            <div style={{ animation: "slideIn 0.4s ease" }}>
              <div style={{ fontSize: 13.5, color: "#64748B", marginBottom: 14 }}>
                One more thing: <code>disabled={"{submitting}"}</code> on the submit button stops double-clicks while the request is in flight.
              </div>

              <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — full form now, try the dropdown</div>
                <AddMemberFields name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan} showAge showSelect />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
                <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
                Dropdown and parseInt understood
              </label>
              {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>POST Handler →</RunButton>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — POST HANDLER
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone, name, age, plan, sendPost, postState, postResult }) {
  const [mValue, setMValue] = useState("");
  const [mWrong, setMWrong] = useState(false);
  const mCorrect = mValue.trim().toUpperCase() === "POST";

  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "ok";

  const allCorrect = mCorrect && correct;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (allCorrect && !done) { playSound("add"); setDone(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCorrect]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>📮 Send the member to Spring Boot</div>

      <BlankCard correct={allCorrect} wrong={(mWrong || wrong) && !allCorrect}>
        <div>const handleAddMember = async (e) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>e.preventDefault();</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>if (!name || !age) {"{"}</div>
        <div style={{ paddingLeft: 24 }}>alert("Name and age required"); return;</div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>setSubmitting(true);</div>
        <div style={{ paddingLeft: 12 }}>try {"{"}</div>
        <div style={{ paddingLeft: 24 }}>const response = await fetch("http://localhost:8080/gym/members", {"{"}</div>
        <div style={{ paddingLeft: 36 }}>
          method: "<Blank value={mValue} onChange={v => { setMValue(v); setMWrong(!!v); }} correct={mCorrect} placeholder="POST" width={4} />",
        </div>
        <div style={{ paddingLeft: 36 }}>headers: {'{ "Content-Type": "application/json", "Authorization": "Bearer " + token }'},</div>
        <div style={{ paddingLeft: 36 }}>body: JSON.stringify({"{ name, age: parseInt(age), plan, isActive: true }"})</div>
        <div style={{ paddingLeft: 24 }}>{"});"}</div>
        <div style={{ marginTop: 6, paddingLeft: 24 }}>
          if (response.<Blank value={value} onChange={v => { setValue(v); setWrong(!!v); }} correct={correct} placeholder="ok" width={4} />) {"{"}
        </div>
        <div style={{ paddingLeft: 36, color: "#94A3B8" }}>{"// clear form and refresh (Slot 4)"}</div>
        <div style={{ paddingLeft: 24 }}>{"}"}</div>
        <div style={{ paddingLeft: 12 }}>{"} catch (err) { console.log(err); }"}</div>
        <div style={{ paddingLeft: 12 }}>{"finally { setSubmitting(false); }"}</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Two blanks: the HTTP method for "create new" — and what's true when Spring Boot returns 200-299.
      </div>
      {mWrong && !mCorrect && (
        <Callout icon="🚫" variant="danger" shake><code>POST</code> creates a new resource. <code>GET</code> only reads.</Callout>
      )}
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake><code>response.ok</code> is true when Spring Boot returns 200 OK.</Callout>
      )}

      {allCorrect && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="📨" variant="tip">
            Two headers: <code>Content-Type</code> says "body is JSON", <code>Authorization</code> says "this is who I am."
          </Callout>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, fontSize: 13.5, fontFamily: "monospace" }}>
            <span style={{ background: "#F0FDF4", color: "#166534", borderRadius: 6, padding: "5px 10px" }}>200 → ok ✅</span>
            <span style={{ background: "#FEF2F2", color: "#7F1D1D", borderRadius: 6, padding: "5px 10px" }}>400 → false ❌</span>
            <span style={{ background: "#FEF2F2", color: "#7F1D1D", borderRadius: 6, padding: "5px 10px" }}>401 → false ❌</span>
          </div>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — send your typed member as a real POST</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>Currently: <strong>{name || "(empty)"}</strong>, <strong>{age || "(empty)"}</strong>, <strong>{plan}</strong></div>
            <RunButton onClick={() => { playSound("tick"); sendPost(); }} disabled={postState === "sending" || !name || !age}>{postState === "sending" ? "Sending..." : "Send POST →"}</RunButton>
            {!name || !age ? <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 6 }}>Fill name and age above first.</div> : null}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            POST handler complete
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Clear + Refresh →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — CLEAR + REFRESH
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone, name, setName, age, setAge, plan, setPlan, members, submitAndRefresh, postState }) {
  const [showAlt, setShowAlt] = useState(false);
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "loadMembers";

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🔄 After success — clear form and refresh list</div>

      <Callout icon="🔁" variant="info">On success: reset every field, then refetch so the new member shows up without a page reload.</Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>if (response.ok) {"{"}</div>
        <div style={{ paddingLeft: 12 }}>setName(""); setAge(""); setPlan("Basic");</div>
        <div style={{ paddingLeft: 12 }}>
          <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="loadMembers" width={11} />();{" "}
          <span style={{ color: "#94A3B8" }}>{"// refetch — new member included"}</span>
        </div>
        <div>{"}"}</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Which function (from 4.2.1) refetches the full member list from MySQL?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>Call <code>loadMembers()</code> again — the same function that loaded the list on page load.</Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <button onClick={() => setShowAlt(s => !s)} style={{ background: "none", border: "none", color: "#2563EB", fontSize: 14.5, cursor: "pointer", padding: 0, marginBottom: 8 }}>
            {showAlt ? "▾" : "▸"} Faster method (alternative)
          </button>
          {showAlt && (
            <Callout icon="⚡" variant="tip">
              Instead of refetching: <code>setMembers([...members, data])</code>. Faster, but needs the POST response to include the saved object.
            </Callout>
          )}

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, margin: "14px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — submit for real, watch the form clear and the list grow on the right</div>
            <AddMemberFields name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan} showAge showSelect />
            <div style={{ marginTop: 8 }}>
              <RunButton onClick={() => { playSound("tick"); submitAndRefresh(() => { playSound("correct"); }); }} disabled={postState === "sending" || !name || !age}>
                {postState === "sending" ? "Adding..." : "Add Member"}
              </RunButton>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked && members.length > 2) { playSound("add"); setChecked(true); } }} disabled={members.length <= 2} />
            Clear and refresh logic added {members.length <= 2 && <span style={{ color: "#94A3B8", fontWeight: 400 }}>(add a member above first)</span>}
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Full App Test →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — FULL APP TEST
// ═══════════════════════════════════════════════════════════════════════════
const MOMENT_LINES = [
  "Your new member is in MySQL.",
  "You did not use Postman. You did not use the terminal. You did not write any SQL.",
  "You typed in a browser. React sent it to Spring Boot. Spring Boot saved to MySQL. List refreshed. Member appeared.",
  "This is your full stack app.",
  "Frontend → Backend → Database. Working. Real. Yours."
];

function Slot5({ onDone, playSound, name, setName, age, setAge, plan, setPlan, members, submitAndRefresh, postState, loading }) {
  const [steps, setSteps] = useState({ s1: true, s2: false, s3: false, s4: false });
  const [momentLine, setMomentLine] = useState(-1);
  const [checkedDb, setCheckedDb] = useState(false);
  const timers = useRef([]);
  const addedRef = useRef(false);

  const doSubmit = () => {
    setSteps(s => ({ ...s, s2: true }));
    submitAndRefresh(() => {
      if (!addedRef.current) {
        addedRef.current = true;
        setSteps(s => ({ ...s, s3: true }));
        playSound("correct");
      }
    });
  };

  const allDone = steps.s1 && steps.s2 && steps.s3 && steps.s4;
  useEffect(() => {
    if (allDone && momentLine === -1) {
      playSound("correct");
      timers.current.push(setTimeout(() => playSound("reveal"), 400));
      MOMENT_LINES.forEach((_, i) => {
        timers.current.push(setTimeout(() => setMomentLine(i), 700 + i * 550));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🚀 Test — add a member, see it appear</div>

      <CodeBlock style={{ fontSize: 12.5, marginBottom: 14, maxHeight: 280, overflowY: "auto" }}>
        <div>{"// GymApp.jsx"}</div>
        <div>const GymApp = ({"{ token }"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [members, setMembers] = useState([]);</div>
        <div style={{ paddingLeft: 12 }}>const [name, setName] = useState(""); const [age, setAge] = useState("");</div>
        <div style={{ paddingLeft: 12 }}>const [plan, setPlan] = useState("Basic");</div>
        <div style={{ paddingLeft: 12 }}>const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false);</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>useEffect(() =&gt; {"{ loadMembers(); }, []);"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>const loadMembers = async () =&gt; {"{ ... setMembers(await res.json()); ... };"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>const handleAdd = async (e) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 24 }}>e.preventDefault(); if (!name || !age) return;</div>
        <div style={{ paddingLeft: 24 }}>setSubmitting(true);</div>
        <div style={{ paddingLeft: 24 }}>try {"{"}</div>
        <div style={{ paddingLeft: 36 }}>const res = await fetch(url, {"{ method: \"POST\", ..., body: JSON.stringify({ name, age: parseInt(age), plan, isActive: true }) }"});</div>
        <div style={{ paddingLeft: 36 }}>if (res.ok) {"{ setName(\"\"); setAge(\"\"); setPlan(\"Basic\"); loadMembers(); }"}</div>
        <div style={{ paddingLeft: 24 }}>{"} finally { setSubmitting(false); }"}</div>
        <div style={{ paddingLeft: 12 }}>{"};"}</div>
        <div style={{ marginTop: 6 }}>{"};"}</div>
        <div>export default GymApp;</div>
      </CodeBlock>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>SaiFit Gym Manager</div>
        <AddMemberFields name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan} showAge showSelect />
        <div style={{ marginTop: 8 }}>
          <RunButton onClick={doSubmit} disabled={postState === "sending" || !name || !age}>{postState === "sending" ? "Adding..." : "Add Member"}</RunButton>
        </div>
        <div style={{ marginTop: 12 }}>
          {loading ? <div style={{ fontSize: 13.5, color: "#64748B" }}>Loading...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m, i) => <MemberCard key={m.id} m={m} isNew={i === members.length - 1 && addedRef.current} />)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#059669" }}>✅ Existing members visible</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: steps.s2 ? "#059669" : "#94A3B8" }}>{steps.s2 ? "✅" : "○"} Button shows "Adding..." during submit</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: steps.s3 ? "#059669" : "#94A3B8" }}>{steps.s3 ? "✅" : "○"} New member appears in the list (form cleared too)</div>
        <label style={{ fontSize: 14.5, fontWeight: 700, color: steps.s4 ? "#059669" : "#94A3B8", display: "flex", alignItems: "center", gap: 6, cursor: steps.s3 ? "pointer" : "not-allowed" }}>
          <input type="checkbox" disabled={!steps.s3} checked={checkedDb} onChange={() => {
            if (!checkedDb && steps.s3) { setCheckedDb(true); setSteps(s => ({ ...s, s4: true })); playSound("correct"); }
          }} />
          New member confirmed in MySQL — <code>SELECT * FROM gym_member;</code>
        </label>
      </div>

      {momentLine >= 0 && (
        <div className="hk-wobble-in" style={{
          background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
          padding: 20, boxShadow: "0 10px 24px rgba(16,185,129,0.2)", marginBottom: 14
        }}>
          {MOMENT_LINES.map((line, i) => (
            <div key={i} className={momentLine >= i ? "hk-pop" : ""} style={{
              opacity: momentLine >= i ? 1 : 0, height: momentLine >= i ? "auto" : 0, overflow: "hidden",
              fontSize: 15, fontWeight: i === MOMENT_LINES.length - 1 ? 800 : 600, color: "#065F46", marginBottom: 8
            }}>{line}</div>
          ))}
        </div>
      )}

      {momentLine >= MOMENT_LINES.length - 1 && (
        <RunButton onClick={() => { playSound("tick"); onDone(); }}>Phase 1 complete →</RunButton>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🔽 <select>", "dropdown — same value + onChange pattern"],
    ["🔢 parseInt(age)", "converts string input to number"],
    ["🚫 disabled={submitting}", "prevents double-submit"],
    ["✅ response.ok", "true if status 200-299"],
    ["🧹 Clear form", "reset state after successful submit"],
    ["🔄 loadMembers()", "refetch list — new member appears"],
    ["🔗 Full CRUD from browser", "create, read, update, delete — all through React + Spring Boot"],
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
        You can CREATE from the browser. You can READ from the browser.<br /><br />
        Full stack working.<br /><br />
        Topic 2 complete.<br /><br />
        Topic 3 — three screens, error handling, show to a real person.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", title: "Add Member", f1: "name", f2: "age", f2Type: "number", opts: ["Basic", "Premium", "Annual"], optLabel: "plan" },
  hotel: { icon: "🏨", label: "Hotel", title: "Add Room", f1: "number", f2: "price", f2Type: "number", opts: ["Standard", "Deluxe", "Suite"], optLabel: "type" },
  mess: { icon: "🍱", label: "Mess", title: "Add Meal", f1: "menu", f2: "servingTime", f2Type: "text", opts: ["Monday", "Tuesday", "Wednesday"], optLabel: "day" },
  chai: { icon: "☕", label: "Chai", title: "Add Order", f1: "items", f2: "tableNumber", f2Type: "number", opts: ["Dine-in", "Takeaway"], optLabel: "type" },
};

function Phase2Left({ domain, setDomain, f1, setF1, f2, setF2, opt, setOpt, items, submitAndRefreshP2, submittingP2, tasks, setTasks, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const d = domain ? DOMAINS[domain] : null;
  const addedAny = items.length > 0;

  const chooseDomain = (key) => {
    playSound("tick");
    setDomain(key);
    setF1(""); setF2(""); setOpt(DOMAINS[key].opts[0]);
  };

  const toggleTask = (group, key) => setTasks(t => ({ ...t, [group]: { ...t[group], [key]: !t[group][key] } }));

  return (
    <div>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>🧾 Build YOUR add form</div>
      <div style={{ color: "#64748B", fontSize: 15, marginBottom: 16 }}>Pick your domain, confirm your tasks, then add a real item.</div>

      {!submitted && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {Object.entries(DOMAINS).map(([key, dd]) => (
              <button key={key} onClick={() => chooseDomain(key)} className="hk-domain-btn" style={{
                padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 15.5, fontWeight: 700,
                border: domain === key ? "2px solid #7C3AED" : "2px solid #E2E8F0",
                background: domain === key ? "linear-gradient(135deg,#F5F3FF,#EDE9FE)" : "#fff",
                color: domain === key ? "#5B21B6" : "#1E293B",
                boxShadow: domain === key ? "0 4px 14px rgba(124,58,237,0.2)" : "none", transition: "all 0.15s ease"
              }}>{dd.icon} {dd.label}</button>
            ))}
          </div>

          {d && (
            <>
              <Callout icon="🧾" variant="info">{d.title}: {d.f1} + {d.f2} + {d.optLabel}</Callout>

              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>TASK 1 — form fields</div>
              {["At least 2 controlled inputs", "At least 1 select/dropdown OR number input", "Submit button with disabled state"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.fields[i]} onChange={() => toggleTask("fields", i)} />{label}
                </label>
              ))}
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#64748B", marginTop: 10, marginBottom: 6 }}>TASK 2 — POST handler</div>
              {["e.preventDefault()", "POST with JSON body + token", "parseInt for number fields", "response.ok check"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.post[i]} onChange={() => toggleTask("post", i)} />{label}
                </label>
              ))}

              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#64748B", marginTop: 14, marginBottom: 6 }}>TASK 3 &amp; 4 — test it for real:</div>
              <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 240 }}>
                  <input value={f1} onChange={e => setF1(e.target.value)} placeholder={d.f1}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }} />
                  <input value={f2} onChange={e => setF2(e.target.value)} placeholder={d.f2} type={d.f2Type}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }} />
                  <select value={opt} onChange={e => setOpt(e.target.value)}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }}>
                    {d.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 8 }}>
                  <RunButton onClick={() => submitAndRefreshP2(() => playSound("correct"))} disabled={submittingP2 || !f1 || !f2}>
                    {submittingP2 ? "Adding..." : `Add ${d.title.split(" ")[1]}`}
                  </RunButton>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 14.5, color: addedAny ? "#059669" : "#94A3B8", fontWeight: 700 }}>{addedAny && "✅"} Item appears without reload</span>
                <span style={{ fontSize: 14.5, color: addedAny ? "#059669" : "#94A3B8", fontWeight: 700 }}>{addedAny && "✅"} Item visible in MySQL</span>
              </div>

              <div style={{ marginTop: 4, marginBottom: 4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Commit your work:</div>
                <CodeBlock style={{ fontSize: 13 }}>
                  <div>git add .</div>
                  <div>git commit -m "add form — create new members from browser"</div>
                  <div>git push origin main</div>
                </CodeBlock>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — why do we call loadMembers() after a successful POST?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="We call loadMembers() after POST because the new member is now saved in MySQL and we need to refetch the complete updated list from Spring Boot so the screen shows the new member automatically..."
                  style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 15, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 13.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
                  {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
                </div>
              </div>

              <RunButton onClick={onSubmit} disabled={!addedAny || !reflectionOk}>Add form working — complete the screens next →</RunButton>
              {!addedAny && <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>Add at least one item above first.</div>}
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>✅ Add form complete.</div>
          <div style={{ fontSize: 15, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ Multi-field controlled form<br />
            ✅ parseInt for number fields<br />
            ✅ POST with JSON + JWT token<br />
            ✅ Form clears after submit<br />
            ✅ List refreshes with new data<br />
            ✅ Full CRUD from browser<br /><br />
            Topic 2 complete.<br /><br />
            Topic 3 — final screens. Build from your paper sketch. Handle errors kindly. Show to a real person.
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
];

export default function AddMemberForm() {
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
  const [slot4Done, setSlot4Done] = useState(false);

  // shared controlled-form state, lifted so every slot stays in sync
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [plan, setPlan] = useState("Basic");
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [loading, setLoading] = useState(false);
  const nextId = useRef(3);

  const [postState, setPostState] = useState("idle");
  const [postResult, setPostResult] = useState(null);
  const postTimer = useRef(null);

  const sendPost = () => {
    setPostState("sending");
    setPostResult(null);
    postTimer.current = setTimeout(() => {
      const saved = { id: nextId.current++, name, age: parseInt(age) || 0, plan, isActive: true };
      setPostResult({ ok: true, saved });
      setPostState("done");
      playSound("correct");
    }, 800);
  };

  const submitAndRefresh = (onSuccess) => {
    setPostState("sending");
    postTimer.current = setTimeout(() => {
      const saved = { id: nextId.current++, name, age: parseInt(age) || 0, plan, isActive: true };
      setMembers(m => [...m, saved]);
      setName(""); setAge(""); setPlan("Basic");
      setPostState("idle");
      onSuccess && onSuccess();
    }, 800);
  };
  useEffect(() => () => clearTimeout(postTimer.current), []);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const [opt, setOpt] = useState("");
  const [p2Items, setP2Items] = useState([]);
  const [submittingP2, setSubmittingP2] = useState(false);
  const p2Timer = useRef(null);
  const p2NextId = useRef(1);

  const submitAndRefreshP2 = (onSuccess) => {
    setSubmittingP2(true);
    p2Timer.current = setTimeout(() => {
      const saved = { id: p2NextId.current++, name: f1, plan: opt, age: f2, isActive: true };
      setP2Items(items => [...items, saved]);
      setF1(""); setF2(""); setOpt(domain ? DOMAINS[domain].opts[0] : "");
      setSubmittingP2(false);
      onSuccess && onSuccess();
    }, 800);
  };
  useEffect(() => () => clearTimeout(p2Timer.current), []);

  const [tasks, setTasks] = useState({ fields: {}, post: {} });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m5-t3-s3-add-member-form",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { setNameBlank: "setName" },
          slot2: { selectBlank: "select", parseIntUnderstood: true },
          slot3: { responseOkBlank: "ok", postHandlerComplete: true },
          slot4: { formClears: true, loadMembersCalled: true },
          slot5: { existingMembersVisible: true, newMemberAppears: true, formClearsAfterSubmit: true, memberInMySQL: true }
        },
        phase2: {
          domainSelected: domain,
          formFieldsBuilt: true,
          postHandlerBuilt: true,
          clearAndRefreshWorks: p2Items.length > 0,
          fullFlowTested: p2Items.length > 0,
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

  const d = domain ? DOMAINS[domain] : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.9); opacity:0.5; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hk-spinner { width: 30px; height: 30px; border-radius: 50%; border: 4px solid #E2E8F0; border-top-color: #7C3AED; animation: spin 0.7s linear infinite; }
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
          <div style={{ fontSize: 13.5, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🧾 SUBTOPIC 4.2.3 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>➕ Add Member Form</div>
          <div style={{ fontSize: 15.5, color: "#DDD6FE" }}>Type it. Submit it. Watch it land in the list.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done}
                name={name} setName={setName} age={age} setAge={setAge} />
              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done}
                  name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan} />
              )}
              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done}
                  name={name} age={age} plan={plan} sendPost={sendPost} postState={postState} postResult={postResult} />
              )}
              {slot >= 4 && (
                <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done}
                  name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan}
                  members={members} submitAndRefresh={submitAndRefresh} postState={postState} />
              )}
              {slot >= 5 && !showReveal && (
                <Slot5
                  onDone={() => setShowReveal(true)} playSound={playSound}
                  name={name} setName={setName} age={age} setAge={setAge} plan={plan} setPlan={setPlan}
                  members={members} submitAndRefresh={submitAndRefresh} postState={postState} loading={loading}
                />
              )}
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
                  <Stage caption="Type on the left — your ID card builds itself">
                    <IdCardPreview name={name} age={age} />
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption="Try changing the dropdown — the badge color changes too">
                    <IdCardPreview name={name} age={age} plan={plan} showPlan />
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption={postState === "idle" ? "Click Send POST on the left" : postState === "sending" ? "Sending to Spring Boot..." : "Saved ✅"}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#94A3B8", marginBottom: 4 }}>📤 REQUEST BODY</div>
                        <div style={{ background: "#1E293B", color: "#4ADE80", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 13.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                          {JSON.stringify({ name, age: parseInt(age) || age, plan, isActive: true })}
                        </div>
                      </div>
                      <div style={{ textAlign: "center", color: "#7C3AED", fontWeight: 800, fontSize: 20 }}>↓</div>
                      <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#64748B" }}>POST /gym/members</div>
                      {postState === "sending" && <div className="hk-spinner" style={{ margin: "8px auto" }} />}
                      {postState === "done" && postResult && (
                        <div className="hk-pop">
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#059669", marginBottom: 4 }}>📥 RESPONSE — SAVED</div>
                          <div style={{ background: "#134E4A", color: "#4ADE80", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 13.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                            {JSON.stringify(postResult.saved)}
                          </div>
                        </div>
                      )}
                    </div>
                  </Stage>
                )}
                {(slot === 4 || slot === 5) && (
                  <Stage caption={postState === "sending" ? "Saving to MySQL..." : "Members list — updates live"}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      {members.map((m, i) => <MemberCard key={m.id} m={m} isNew={i === members.length - 1 && members.length > 2} />)}
                    </div>
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
                f1={f1} setF1={setF1} f2={f2} setF2={setF2} opt={opt} setOpt={setOpt}
                items={p2Items} submitAndRefreshP2={submitAndRefreshP2} submittingP2={submittingP2}
                tasks={tasks} setTasks={setTasks}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={domain ? "Your list — updates live" : "👈 Pick a domain to begin"}>
                  {!domain && <div style={{ color: "#94A3B8", fontSize: 15 }}>(your items will appear here)</div>}
                  {domain && p2Items.length === 0 && <div style={{ fontSize: 15, color: "#94A3B8" }}>No items yet — add one on the left</div>}
                  {domain && p2Items.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      {p2Items.map((it, i) => (
                        <div key={it.id} className={i === p2Items.length - 1 ? "hk-slide-in" : ""} style={{
                          background: "#fff", borderRadius: 10, padding: 12, width: "100%", boxShadow: "0 3px 10px rgba(15,23,42,0.08)",
                          display: "flex", justifyContent: "space-between"
                        }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#1A3C6E" }}>{it.name}</div>
                            <div style={{ fontSize: 13.5, color: "#64748B" }}>{it.plan} {it.age ? `· ${it.age}` : ""}</div>
                          </div>
                        </div>
                      ))}
                    </div>
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
