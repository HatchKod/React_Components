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

// ─── MOCK "SPRING BOOT" AUTH — one fixed valid pair ─────────────────────────
const VALID_USER = "gymowner";
const VALID_PASS = "gym123";
function mockAuth(username, password) {
  const ok = username === VALID_USER && password === VALID_PASS;
  return ok
    ? { token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnb...MOCK" }
    : { error: "Invalid username or password" };
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
      fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Controlled Input", icon: "☎️" },
  { label: "Form Submit", icon: "📝" },
  { label: "POST Request", icon: "📮" },
  { label: "Token + App", icon: "🔑" },
  { label: "Full Flow Test", icon: "🚀" },
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
      padding: 16, fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.8,
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
function Stage({ children, caption }) {
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
        {caption && <div key={caption} style={{ fontSize: 12, color: "#64748B" }}>{caption}</div>}
      </div>
    </div>
  );
}

// ─── REAL CONTROLLED LOGIN INPUTS (shared across slots) ─────────────────────
function LoginInputs({ username, setUsername, password, setPassword, showPassword = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 220 }}>
      <input
        type="text" placeholder="Username" value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }}
      />
      {showPassword && (
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — CONTROLLED INPUTS
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound, done, setDone, username, setUsername }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "e.target.value";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>☎️ Controlled inputs — React tracks every keystroke</div>

      <Callout icon="☎️" title="The telephone operator analogy" variant="tip">
        A telephone operator sits at a switchboard. Every word the caller speaks — the operator writes it down. Real-time. Perfectly in sync.<br /><br />
        A controlled input works the same. Every keystroke → state updates. React always knows exactly what is in the input.
      </Callout>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>UNCONTROLLED (HTML)</div>
          <CodeBlock border="#DC2626" style={{ fontSize: 11 }}>
            <div>&lt;input type="text" /&gt;</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{'React: "I don\'t know what is'}</div>
            <div style={{ color: "#94A3B8" }}>{'typed until submit ❌"'}</div>
          </CodeBlock>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 4 }}>CONTROLLED (React)</div>
          <CodeBlock border="#10B981" style={{ fontSize: 11 }}>
            <div>&lt;input value={"{username}"}</div>
            <div style={{ paddingLeft: 12 }}>onChange={"{(e) =>"}</div>
            <div style={{ paddingLeft: 24 }}>setUsername(e.target.value){"}"}</div>
            <div>/&gt;</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{'React: "I know every character'}</div>
            <div style={{ color: "#94A3B8" }}>{'as it is typed ✅"'}</div>
          </CodeBlock>
        </div>
      </div>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const [username, setUsername] = useState("");</div>
        <div style={{ marginTop: 8 }}>&lt;input</div>
        <div style={{ paddingLeft: 12 }}>type="text"</div>
        <div style={{ paddingLeft: 12 }}>placeholder="Username"</div>
        <div style={{ paddingLeft: 12 }}>value={"{username}"}</div>
        <div style={{ paddingLeft: 12 }}>onChange={"{(e) => "}</div>
        <div style={{ paddingLeft: 24 }}>
          setUsername(<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="e.target.value" width={14} />)
        </div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div>/&gt;</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 e is the event object, e.target is the input element, e.target.value is the current text. What goes in setUsername()?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          <code>e.target.value</code> reads the current text in the input. <code>setUsername(e.target.value)</code> updates state with each keystroke.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — type below, watch the state update live on the right</div>
            <LoginInputs username={username} setUsername={(v) => { setUsername(v); playSound("tick"); }} showPassword={false} />
          </div>

          <Callout icon="🔍" title="e.target.value breakdown" variant="info">
            <code>e</code> → event (browser sends this on change)<br />
            <code>e.target</code> → the input element<br />
            <code>e.target.value</code> → text currently in input
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand controlled inputs
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Handle form submit →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — FORM SUBMIT
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone, username, setUsername, password, setPassword, onSubmitTest }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = /^e\.preventDefault\(\)?;?$/.test(value.trim());
  const [checked, setChecked] = useState(false);
  const [reloadFlash, setReloadFlash] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!correct) {
      // simulate what would happen WITHOUT preventDefault in real HTML: full reload wipes the typed state
      setReloadFlash(true);
      setUsername("");
      setPassword("");
      playSound("warn");
      setTimeout(() => setReloadFlash(false), 500);
    } else {
      setSubmitOk(true);
      playSound("correct");
      setTimeout(() => setSubmitOk(false), 1200);
    }
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📝 onSubmit — handle the form</div>

      <Callout icon="⚠️" variant="danger">
        If you put a <code>button type='submit'</code> in a form — clicking it reloads the entire page. Browser default behaviour. React cannot stop it... unless you call <strong>e.preventDefault()</strong>.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const handleLogin = async (e) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>
          <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="e.preventDefault()" width={17} />;
        </div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// what stops the page from reloading?"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>setLoading(true);</div>
        <div style={{ paddingLeft: 12 }}>setError(null);</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// ... fetch will go here"}</div>
        <div>{"};"}</div>
        <div style={{ marginTop: 8, color: "#94A3B8" }}>{"// In JSX:"}</div>
        <div>&lt;form onSubmit={"{handleLogin}"}&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;input ... /&gt;</div>
        <div style={{ paddingLeft: 12 }}>&lt;button type="submit"&gt;Login&lt;/button&gt;</div>
        <div>&lt;/form&gt;</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Browser reloads the page when a form is submitted. What method stops this?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          <code>e.preventDefault()</code> stops the browser from reloading. Always call this first in onSubmit handlers.
        </Callout>
      )}

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, margin: "14px 0", position: "relative", overflow: "hidden" }}>
        {reloadFlash && <div className="hk-whiteflash" style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#DC2626" }}>🔄 Page reloaded — state wiped ❌</div>}
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — type something, then hit submit</div>
        <form onSubmit={handleTestSubmit}>
          <LoginInputs username={username} setUsername={setUsername} password={password} setPassword={setPassword} />
          <button type="submit" style={{ marginTop: 8, padding: "8px 16px", borderRadius: 8, border: "none", background: "#1E293B", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Submit</button>
        </form>
        {submitOk && <div className="hk-pop" style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: "#059669" }}>✅ Submitted — no reload, state preserved!</div>}
        {!correct && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>Without the blank filled — submitting will wipe what you typed (simulating a real reload).</div>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 4 }}>✅ onSubmit on form</div>
          <CodeBlock border="#10B981" style={{ fontSize: 11 }}>
            <div>&lt;form onSubmit={"{handleLogin}"}&gt;</div>
            <div style={{ paddingLeft: 12 }}>&lt;button type="submit"&gt;Login&lt;/button&gt;</div>
            <div>&lt;/form&gt;</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{"Enter key works too ✅"}</div>
          </CodeBlock>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>❌ onClick on button only</div>
          <CodeBlock border="#DC2626" style={{ fontSize: 11 }}>
            <div>&lt;button onClick={"{handleLogin}"}&gt;</div>
            <div style={{ paddingLeft: 12 }}>Login</div>
            <div>&lt;/button&gt;</div>
            <div style={{ color: "#94A3B8", marginTop: 6 }}>{"Enter key ignored ❌"}</div>
          </CodeBlock>
        </div>
      </div>

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            I understand e.preventDefault()
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>POST Request →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — POST REQUEST
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone, username, password, sendPost, postState }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "JSON.stringify";
  const [cardIndex, setCardIndex] = useState(0);
  const [cardsDone, setCardsDone] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const HEADER_CARDS = [
    { title: "Content-Type", body: <>Content-Type: application/json<br /><br />Tells Spring Boot: "the body I am sending is JSON." Without this — Spring Boot sees the body as plain text and cannot parse it. <code>@RequestBody</code> needs this header to work.</> },
    { title: "JSON.stringify()", body: <>{'{ username: "ravi", password: "..." }'}<br />↓ JSON.stringify<br />{'\'{"username":"ravi","password":"..."}\''}<br /><br />Object → text string. Network only carries text. JSON.stringify handles the conversion.</> },
  ];
  const nextCard = () => {
    playSound("tick");
    if (cardIndex >= HEADER_CARDS.length - 1) setCardsDone(true);
    else setCardIndex(i => i + 1);
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📮 POST with JSON body — send credentials to Spring Boot</div>

      <Callout icon="🔄" variant="tip">
        You know GET — reads data. <strong>POST</strong> — sends data to the server. Login sends username + password. POST is the right method.
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const response = await fetch(</div>
        <div style={{ paddingLeft: 12 }}>"http://localhost:8080/auth/login",</div>
        <div style={{ paddingLeft: 12 }}>{"{"}</div>
        <div style={{ paddingLeft: 24 }}>method: "POST",</div>
        <div style={{ paddingLeft: 24 }}>headers: {"{"}</div>
        <div style={{ paddingLeft: 36 }}>"Content-Type": "application/json"</div>
        <div style={{ paddingLeft: 24 }}>{"},"}</div>
        <div style={{ paddingLeft: 24 }}>
          body: <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="JSON.stringify" width={14} />({"{"}
        </div>
        <div style={{ paddingLeft: 36 }}>username: username,</div>
        <div style={{ paddingLeft: 36 }}>password: password</div>
        <div style={{ paddingLeft: 24 }}>{"})"}</div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div>);</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 fetch sends text over the network. Your object must become a JSON text string. Which function converts it?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          <code>JSON.stringify</code> converts your JavaScript object to a JSON string that can travel over the network.
        </Callout>
      )}

      {correct && !cardsDone && (
        <div className="hk-pop" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, marginBottom: 6 }}>CONCEPT {cardIndex + 1} / {HEADER_CARDS.length}</div>
          <Callout icon="📨" title={HEADER_CARDS[cardIndex].title} variant="info">{HEADER_CARDS[cardIndex].body}</Callout>
          <button onClick={nextCard} className="hk-btn" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            {cardIndex >= HEADER_CARDS.length - 1 ? "Got it →" : "Next →"}
          </button>
        </div>
      )}

      {cardsDone && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock style={{ marginBottom: 10 }}>
            <div>const data = await response.json();</div>
            <div style={{ marginTop: 6 }}>if (data.token) {"{"}</div>
            <div style={{ paddingLeft: 12 }}>onLogin(data.token); <span style={{ color: "#94A3B8" }}>{"// success"}</span></div>
            <div>{"} else {"}</div>
            <div style={{ paddingLeft: 12 }}>setError(data.error || "Login failed");</div>
            <div>{"}"}</div>
          </CodeBlock>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>
              🧪 TRY IT — send your typed username/password (from Slot 1 & 2) as a real POST
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Currently typed: <strong>{username || "(empty)"}</strong> / <strong>{password ? "•".repeat(password.length) : "(empty)"}</strong></div>
            <RunButton onClick={() => { playSound("tick"); sendPost(); }} disabled={postState === "sending"}>{postState === "sending" ? "Sending..." : "Send POST →"}</RunButton>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            POST request with JSON body understood
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Token + App →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — TOKEN + APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone, token, simulateReceiveToken }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "!token";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🔑 Store the token — show the right screen</div>

      <Callout icon="💾" title="Where to store the JWT token?" variant="tip">
        <strong>Option 1: localStorage</strong> → survives browser close, BUT vulnerable to attacks.<br />
        <strong>Option 2: React state (useState)</strong> → safe from attacks, BUT gone on page refresh — ✅ right choice for your first app.<br /><br />
        We store in App component state. Pass as prop to components that need it.
      </Callout>

      <Callout icon="🌳" title="Lift state up" variant="info">
        LoginScreen has the token. MembersList needs the token. But siblings cannot share directly in React.<br /><br />
        Solution: lift state up. Store token in App (parent). Both children get it as prop.
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "monospace", fontSize: 12 }}>
          App (token here)<br />
          ↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘<br />
          LoginScreen &nbsp; MembersList<br />
          (calls onLogin) &nbsp; (receives token prop)
        </div>
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const App = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [token, setToken] = useState(null);</div>
        <div style={{ marginTop: 8, paddingLeft: 12 }}>
          if (<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="!token" width={7} />) {"{"}
        </div>
        <div style={{ paddingLeft: 24 }}>return (&lt;LoginScreen onLogin={"{setToken}"} /&gt;);</div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>return &lt;MembersList token={"{token}"} /&gt;;</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Show login screen when there is NO token. What condition checks "token does not exist"?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          <code>!token</code> means "token is null/empty". If no token → show login. If token exists → show members.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="🎁" title="The onLogin prop" variant="info">
            <code>onLogin={"{setToken}"}</code><br /><br />
            Parent passes its setter as a prop. Child calls it with the token. Parent's state updates. App re-renders with the token. MembersList appears.<br /><br />
            In LoginScreen: <code>onLogin(data.token)</code> → same as calling <code>setToken(data.token)</code> → App's token state updates → App re-renders → !token is now false → MembersList shows.
          </Callout>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — simulate onLogin(token) being called</div>
            <RunButton onClick={() => { playSound("correct"); simulateReceiveToken(); }} disabled={!!token} variant="success">
              {token ? "Token received ✅" : "Simulate receiving a token"}
            </RunButton>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            App component logic understood
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Full Flow Test →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — FULL FLOW TEST
// ═══════════════════════════════════════════════════════════════════════════
const SAMPLE_MEMBERS = [
  { id: 1, name: "Ravi Kumar", plan: "Basic", isActive: true },
  { id: 2, name: "Suresh", plan: "Premium", isActive: true },
  { id: 3, name: "Priya", plan: "Basic", isActive: false },
];
const MOMENT_LINES = [
  "The gym owner opens the browser. Types their username and password. Clicks Login.",
  "React sends credentials to Spring Boot. Spring Boot checks the BCrypt hash. JWT token issued.",
  "React receives the token. Stores it. Fetches member data.",
  "Members appear on screen.",
  "No Postman. No hardcoded token. No manual steps.",
  "Just — open browser, login, see data. That is your app working."
];

function Slot5({ onDone, playSound, username, setUsername, password, setPassword, flowState, runFlowSubmit, resetFlow }) {
  const [steps, setSteps] = useState({ s1: true, s2: false, s3: false, s4: false, s5: false });
  const [momentLine, setMomentLine] = useState(-1);
  const timers = useRef([]);
  const triedWrongRef = useRef(false);

  useEffect(() => {
    if (flowState.status === "error" && !triedWrongRef.current) {
      triedWrongRef.current = true;
      setSteps(s => ({ ...s, s2: true }));
      playSound("add");
    }
    if (flowState.status === "success") {
      setSteps(s => ({ ...s, s3: true, s4: true }));
      timers.current.push(setTimeout(() => setSteps(s => ({ ...s, s5: true })), 500));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState.status]);

  const allDone = Object.values(steps).every(Boolean);
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
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🚀 Test the complete login flow</div>

      <CodeBlock style={{ fontSize: 10.5, marginBottom: 10, maxHeight: 260, overflowY: "auto" }}>
        <div>{"// LoginScreen.jsx"}</div>
        <div>const LoginScreen = ({"{ onLogin }"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [username, setUsername] = useState("");</div>
        <div style={{ paddingLeft: 12 }}>const [password, setPassword] = useState("");</div>
        <div style={{ paddingLeft: 12 }}>const [error, setError] = useState(null);</div>
        <div style={{ paddingLeft: 12 }}>const [loading, setLoading] = useState(false);</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>const handleLogin = async (e) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 24 }}>e.preventDefault();</div>
        <div style={{ paddingLeft: 24 }}>setLoading(true); setError(null);</div>
        <div style={{ paddingLeft: 24 }}>try {"{"}</div>
        <div style={{ paddingLeft: 36 }}>const response = await fetch("http://localhost:8080/auth/login", {"{"}</div>
        <div style={{ paddingLeft: 48 }}>method: "POST",</div>
        <div style={{ paddingLeft: 48 }}>headers: {'{ "Content-Type": "application/json" }'},</div>
        <div style={{ paddingLeft: 48 }}>body: JSON.stringify({"{ username, password }"})</div>
        <div style={{ paddingLeft: 36 }}>{"});"}</div>
        <div style={{ paddingLeft: 36 }}>const data = await response.json();</div>
        <div style={{ paddingLeft: 36 }}>if (data.token) onLogin(data.token);</div>
        <div style={{ paddingLeft: 36 }}>else setError(data.error || "Login failed");</div>
        <div style={{ paddingLeft: 24 }}>{"} catch (err) { setError(\"Server not reachable.\"); }"}</div>
        <div style={{ paddingLeft: 24 }}>{"finally { setLoading(false); }"}</div>
        <div style={{ paddingLeft: 12 }}>{"};"}</div>
        <div style={{ marginTop: 6 }}>{"};"}</div>
        <div style={{ marginTop: 6 }}>{"// App.jsx"}</div>
        <div>const App = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [token, setToken] = useState(null);</div>
        <div style={{ paddingLeft: 12 }}>if (!token) return &lt;LoginScreen onLogin={"{setToken}"} /&gt;;</div>
        <div style={{ paddingLeft: 12 }}>return &lt;MembersList token={"{token}"} /&gt;;</div>
        <div>{"};"}</div>
      </CodeBlock>

      <Callout icon="🔑" variant="tip">
        Try it for real below. Hint: valid login is <code>{VALID_USER}</code> / <code>{VALID_PASS}</code> — but try a wrong one first to see the error!
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {flowState.status !== "success" ? (
          <form onSubmit={runFlowSubmit}>
            <LoginInputs username={username} setUsername={setUsername} password={password} setPassword={setPassword} />
            <button type="submit" disabled={flowState.status === "loading"} style={{
              marginTop: 8, padding: "9px 18px", borderRadius: 8, border: "none",
              background: flowState.status === "loading" ? "#CBD5E1" : "#1E293B", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer"
            }}>{flowState.status === "loading" ? "Logging in..." : "Login"}</button>
            {flowState.status === "error" && <div className="hk-pop" style={{ marginTop: 8, fontSize: 12, color: "#DC2626", fontWeight: 700 }}>❌ {flowState.error}</div>}
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#059669", fontWeight: 800, marginBottom: 10 }}>✅ Logged in — MembersList loaded</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SAMPLE_MEMBERS.map((m, i) => (
                <div key={m.id} className="hk-card-in" style={{ animationDelay: `${i * 0.12}s`, background: "#fff", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{m.plan}</div>
                  </div>
                  <span style={{ alignSelf: "center", background: m.isActive ? "#DCFCE7" : "#FEE2E2", color: m.isActive ? "#166534" : "#991B1B", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 800 }}>{m.isActive ? "Active" : "Inactive"}</span>
                </div>
              ))}
            </div>
            <button onClick={resetFlow} style={{ marginTop: 10, background: "none", border: "none", color: "#2563EB", fontSize: 11.5, cursor: "pointer" }}>↻ Log out and try again</button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {[
          ["s1", "Login screen shows"],
          ["s2", "Wrong credentials show error"],
          ["s3", "No error — login button works"],
          ["s4", "Members list loads after login"],
          ["s5", "Real MySQL data on screen — no hardcoded token"],
        ].map(([key, label]) => (
          <div key={key} style={{ fontSize: 12.5, fontWeight: 700, color: steps[key] ? "#059669" : "#94A3B8" }}>{steps[key] ? "✅" : "○"} {label}</div>
        ))}
      </div>

      {momentLine >= 0 && (
        <div className="hk-wobble-in" style={{
          background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
          padding: 20, boxShadow: "0 10px 24px rgba(16,185,129,0.2)", marginBottom: 14
        }}>
          {MOMENT_LINES.map((line, i) => (
            <div key={i} className={momentLine >= i ? "hk-pop" : ""} style={{
              opacity: momentLine >= i ? 1 : 0, height: momentLine >= i ? "auto" : 0, overflow: "hidden",
              fontSize: 13.5, fontWeight: i === MOMENT_LINES.length - 1 ? 800 : 600, color: "#065F46", marginBottom: 8
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
    ["☎️ Controlled input", "value + onChange — React tracks every keystroke"],
    ["🔍 e.target.value", "current text in the input field"],
    ["🛑 e.preventDefault()", "stops browser page reload on submit"],
    ["📮 method: POST", "sends data (not reads)"],
    ["📨 Content-Type: application/json", "tells Spring Boot body is JSON"],
    ["🔄 JSON.stringify()", "object → JSON text string"],
    ["🎁 onLogin prop", "child calls parent's setter — state lifts up"],
    ["🔑 !token routing", "no token = login screen, token = members list"],
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
        Login screen built. JWT flow complete. No hardcoded tokens.<br /><br />
        Next — 4.2.3. Add a new member form.<br />
        User fills form. React POSTs to Spring Boot. Member appears in MySQL. List updates.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", role: "gym owner", list: "members list", data: SAMPLE_MEMBERS },
  hotel: { icon: "🏨", label: "Hotel", role: "hotel manager", list: "rooms list", data: [
    { id: 1, name: "Room 101", plan: "Standard", isActive: true },
    { id: 2, name: "Room 102", plan: "Deluxe", isActive: true },
    { id: 3, name: "Room 103", plan: "Standard", isActive: false },
  ] },
  mess: { icon: "🍱", label: "Mess", role: "mess supervisor", list: "meals list", data: [
    { id: 1, name: "Monday Lunch", plan: "Dal Rice", isActive: true },
    { id: 2, name: "Tuesday Lunch", plan: "Chapati Sabzi", isActive: true },
    { id: 3, name: "Wednesday Lunch", plan: "Curd Rice", isActive: false },
  ] },
  chai: { icon: "☕", label: "Chai", role: "shop owner", list: "orders list", data: [
    { id: 1, name: "Order #41", plan: "2x Cutting Chai", isActive: true },
    { id: 2, name: "Order #42", plan: "1x Masala Chai", isActive: true },
    { id: 3, name: "Order #43", plan: "3x Cutting Chai", isActive: false },
  ] },
};

function Phase2Left({ domain, setDomain, username, setUsername, password, setPassword, flowState, runFlowSubmit, resetFlow, tasks, setTasks, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const d = domain ? DOMAINS[domain] : null;
  const fullFlowTested = flowState.status === "success";

  const chooseDomain = (key) => {
    playSound("tick");
    setDomain(key);
    resetFlow();
  };

  const toggleTask = (group, key) => setTasks(t => ({ ...t, [group]: { ...t[group], [key]: !t[group][key] } }));

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🔐 Build YOUR login screen</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, confirm your tasks, then test the real flow.</div>

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
              <Callout icon="🔐" variant="info">
                Login for: <strong>{d.role}</strong> &nbsp;·&nbsp; API: <code>POST /auth/login</code> &nbsp;·&nbsp; After login: show {d.list}
              </Callout>

              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>TASK 1 — LoginScreen component</div>
              {["Two controlled inputs (username + password)", "onSubmit with e.preventDefault()", "POST to /auth/login with JSON body", "onLogin called with token on success", "Error shown on failure"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.login[i]} onChange={() => toggleTask("login", i)} />{label}
                </label>
              ))}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginTop: 10, marginBottom: 6 }}>TASK 2 — App component</div>
              {["token state (starts null)", "!token → show LoginScreen", "token → show data list component"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.app[i]} onChange={() => toggleTask("app", i)} />{label}
                </label>
              ))}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginTop: 10, marginBottom: 6 }}>TASK 3 — data list updated</div>
              {["Remove hardcoded token", "Accept token as prop", "Use prop token in fetch header"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.list[i]} onChange={() => toggleTask("list", i)} />{label}
                </label>
              ))}

              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginTop: 14, marginBottom: 6 }}>TASK 4 — test the flow for real:</div>
              <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
                {flowState.status !== "success" ? (
                  <form onSubmit={runFlowSubmit}>
                    <LoginInputs username={username} setUsername={setUsername} password={password} setPassword={setPassword} />
                    <button type="submit" disabled={flowState.status === "loading"} style={{
                      marginTop: 8, padding: "9px 18px", borderRadius: 8, border: "none",
                      background: flowState.status === "loading" ? "#CBD5E1" : "#1E293B", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer"
                    }}>{flowState.status === "loading" ? "Logging in..." : "Login"}</button>
                    {flowState.status === "error" && <div className="hk-pop" style={{ marginTop: 8, fontSize: 12, color: "#DC2626", fontWeight: 700 }}>❌ {flowState.error}</div>}
                    <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 6 }}>Hint: {VALID_USER} / {VALID_PASS}</div>
                  </form>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#059669", fontWeight: 800 }}>✅ Logged in — {d.list} loaded for {d.label}</div>
                )}
              </div>

              <div style={{ marginTop: 4, marginBottom: 4 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Commit your work:</div>
                <CodeBlock style={{ fontSize: 11 }}>
                  <div>git add .</div>
                  <div>git commit -m "add login screen — JWT stored in App state"</div>
                  <div>git push origin main</div>
                </CodeBlock>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — why do we use a controlled input instead of reading the form value on submit?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="We use controlled inputs because React needs to know the username and password values at every keystroke to validate, disable buttons, or show live feedback — not just when the form submits..."
                  style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 13.5, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
                  {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
                </div>
              </div>

              <RunButton onClick={onSubmit} disabled={!fullFlowTested || !reflectionOk}>Login working — add member form next →</RunButton>
              {!fullFlowTested && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>Log in successfully above first.</div>}
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>🔐 Login screen complete.</div>
          <div style={{ fontSize: 13.5, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ Controlled inputs — React tracks typing<br />
            ✅ e.preventDefault() — no page reload<br />
            ✅ POST with JSON — credentials sent<br />
            ✅ JWT received and stored<br />
            ✅ {d.list} loads automatically<br />
            ✅ No hardcoded tokens anywhere<br /><br />
            Next — 4.2.3. The add member form.<br /><br />
            {d.role[0].toUpperCase() + d.role.slice(1)} fills a form. React POSTs to the API. New item saved to MySQL. List refreshes. Item appears.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function LoginScreenBuilder() {
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

  // shared controlled-input state, lifted so every slot's right/left panels stay in sync
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [postState, setPostState] = useState("idle"); // idle | sending | done
  const [postResult, setPostResult] = useState(null);
  const postTimer = useRef(null);

  const sendPost = () => {
    setPostState("sending");
    setPostResult(null);
    postTimer.current = setTimeout(() => {
      const result = mockAuth(username, password);
      setPostResult(result);
      setPostState("done");
      playSound(result.token ? "correct" : "warn");
    }, 900);
  };
  useEffect(() => () => clearTimeout(postTimer.current), []);

  const simulateReceiveToken = () => {
    setToken(postResult?.token || mockAuth(VALID_USER, VALID_PASS).token);
  };

  // Slot5 / Phase2 real flow state
  const [flowState, setFlowState] = useState({ status: "idle", error: null });
  const flowTimer = useRef(null);
  const runFlowSubmit = (e) => {
    e.preventDefault();
    setFlowState({ status: "loading", error: null });
    flowTimer.current = setTimeout(() => {
      const result = mockAuth(username, password);
      if (result.token) {
        setFlowState({ status: "success", error: null });
        playSound("correct");
      } else {
        setFlowState({ status: "error", error: result.error });
        playSound("warn");
      }
    }, 700);
  };
  const resetFlow = () => { setFlowState({ status: "idle", error: null }); setUsername(""); setPassword(""); };
  useEffect(() => () => clearTimeout(flowTimer.current), []);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [tasks, setTasks] = useState({ login: {}, app: {}, list: {} });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t2-s2-login-screen-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { eTargetValueBlank: "e.target.value" },
          slot2: { preventDefaultBlank: "e.preventDefault" },
          slot3: { jsonStringifyBlank: "JSON.stringify", contentTypeUnderstood: true },
          slot4: { tokenConditionBlank: "!token", liftStateUnderstood: true },
          slot5: { loginShows: true, wrongCredsShowError: true, loginWorks: true, membersListLoads: true, realDataVisible: true }
        },
        phase2: {
          domainSelected: domain,
          loginScreenBuilt: true,
          appComponentUpdated: true,
          membersListUpdated: true,
          fullFlowTested: flowState.status === "success",
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
        @keyframes whiteflash { 0%,100% { opacity:0; } 50% { opacity:1; } }
        @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-card-in { animation: cardIn 0.4s ease both; }
        .hk-whiteflash { animation: whiteflash 0.5s ease; }
        .hk-spinner { width: 30px; height: 30px; border-radius: 50%; border: 4px solid #E2E8F0; border-top-color: #7C3AED; animation: spin 0.7s linear infinite; }
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
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🔐 SUBTOPIC 4.2.2 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>🔑 Login Screen + JWT</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>Type it. Submit it. Watch the real flow.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done} username={username} setUsername={setUsername} />
              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done}
                  username={username} setUsername={setUsername} password={password} setPassword={setPassword} />
              )}
              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done}
                  username={username} password={password} sendPost={sendPost} postState={postState} />
              )}
              {slot >= 4 && (
                <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done}
                  token={token} simulateReceiveToken={simulateReceiveToken} />
              )}
              {slot >= 5 && !showReveal && (
                <Slot5
                  onDone={() => setShowReveal(true)} playSound={playSound}
                  username={username} setUsername={setUsername} password={password} setPassword={setPassword}
                  flowState={flowState} runFlowSubmit={runFlowSubmit} resetFlow={resetFlow}
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
                  <Stage caption="Type on the left — state updates here, live">
                    <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16, width: "100%", maxWidth: 240, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>username state</div>
                      <div key={username} className="hk-pop" style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#1E3A8A", minHeight: 22 }}>"{username}"</div>
                    </div>
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption="Fill the blank, then submit again — no reload this time">
                    <div style={{ fontSize: 40 }}>📝</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Submit the form on the left and watch what happens to the typed values</div>
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption={postState === "idle" ? "Click Send POST on the left" : postState === "sending" ? "Sending to Spring Boot..." : postResult?.token ? "Token received ✅" : "Login failed ❌"}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 260, fontFamily: "monospace", fontSize: 11 }}>
                      <div style={{ background: "#1E293B", color: "#4ADE80", borderRadius: 8, padding: 10 }}>
                        {JSON.stringify({ username, password: password ? "•".repeat(password.length) : "" })}
                      </div>
                      <div style={{ textAlign: "center", color: "#7C3AED" }}>↓ POST /auth/login</div>
                      {postState === "sending" && <div className="hk-spinner" style={{ margin: "0 auto" }} />}
                      {postState === "done" && (
                        <div className={`hk-pop`} style={{ background: postResult.token ? "#134E4A" : "#7F1D1D", color: postResult.token ? "#4ADE80" : "#FCA5A5", borderRadius: 8, padding: 10 }}>
                          {postResult.token ? `{ "token": "${postResult.token.slice(0, 24)}..." }` : `{ "error": "${postResult.error}" }`}
                        </div>
                      )}
                    </div>
                  </Stage>
                )}
                {slot === 4 && (
                  <Stage caption={token ? "App re-rendered → MembersList shows" : "App renders → LoginScreen shows"}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>App component</div>
                      <div style={{
                        padding: "16px 24px", borderRadius: 12, fontWeight: 800, fontSize: 13,
                        background: token ? "linear-gradient(135deg,#10B981,#059669)" : "#334155", color: "#fff", transition: "all 0.4s ease"
                      }}>{token ? "🧾 MembersList" : "🔐 LoginScreen"}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "monospace" }}>token = {token ? `"${token.slice(0, 14)}..."` : "null"}</div>
                    </div>
                  </Stage>
                )}
                {slot === 5 && (
                  <Stage caption={flowState.status === "success" ? "Full flow complete ✅" : "Follow along on the left"}>
                    <div style={{ fontSize: 40 }}>{flowState.status === "success" ? "🎉" : "🔐"}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Login screen → JWT → MembersList, all in one real flow</div>
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
                username={username} setUsername={setUsername} password={password} setPassword={setPassword}
                flowState={flowState} runFlowSubmit={runFlowSubmit} resetFlow={resetFlow}
                tasks={tasks} setTasks={setTasks}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={domain ? (flowState.status === "success" ? "Real login flow — data on screen ✅" : "Log in on the left to see data") : "👈 Pick a domain to begin"}>
                  {!domain && <div style={{ color: "#94A3B8", fontSize: 13 }}>(your data will appear here)</div>}
                  {domain && flowState.status !== "success" && <div style={{ fontSize: 40 }}>🔐</div>}
                  {domain && flowState.status === "success" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
                      {DOMAINS[domain].data.map((m, i) => (
                        <div key={m.id} className="hk-card-in" style={{ animationDelay: `${i * 0.12}s`, width: "100%", maxWidth: 240, background: "#fff", borderRadius: 10, padding: 12, boxShadow: "0 3px 10px rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: "#1A3C6E" }}>{m.name}</div>
                            <div style={{ fontSize: 11.5, color: "#64748B" }}>{m.plan}</div>
                          </div>
                          <span style={{ alignSelf: "center", background: m.isActive ? "#DCFCE7" : "#FEE2E2", color: m.isActive ? "#166534" : "#991B1B", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 800 }}>{m.isActive ? "Active" : "Inactive"}</span>
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
