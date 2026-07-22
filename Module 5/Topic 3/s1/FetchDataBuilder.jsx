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
      fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap",
      border: border ? `2px solid ${border}` : "1px solid #334155", ...style
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "useEffect", icon: "🧑‍💼" },
  { label: "CORS Fix", icon: "🔓" },
  { label: "Fetch + States", icon: "📦" },
  { label: "Render Data", icon: "🧾" },
  { label: "Full Stack Moment", icon: "🔗" },
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
function Blank({ value, onChange, correct, placeholder, width, useDropdown, dropdownOptions }) {
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
        <span style={{ fontSize: 14 }}>⚛️</span> LIVE PREVIEW
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

// ─── SAMPLE DATA (simulated Spring Boot response) ───────────────────────────
const SAMPLE_MEMBERS = [
  { id: 1, name: "Ravi Kumar", plan: "Basic", isActive: true },
  { id: 2, name: "Suresh", plan: "Premium", isActive: true },
  { id: 3, name: "Priya", plan: "Basic", isActive: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — useEffect
// ═══════════════════════════════════════════════════════════════════════════
function NewEmployeeStory({ step }) {
  const captions = ["Day 1 — sits at desk (component renders)", "Settled in — walks to get documents (useEffect fires)", "Returns with documents (data loaded)"];
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", height: 90, width: 220, margin: "0 auto" }}>
        <div style={{ position: "absolute", left: 10, top: 20, fontSize: 26 }}>🪑</div>
        <div style={{ position: "absolute", right: 10, top: 20, fontSize: 26 }}>🗄️</div>
        <div className={step >= 0 ? "hk-walk" : ""} key={step} style={{
          position: "absolute", top: 16, fontSize: 30,
          left: step === 0 ? 20 : step === 1 ? 90 : 160,
          transition: "left 0.8s ease"
        }}>{step >= 2 ? "🧑‍💼📄" : "🧑‍💼"}</div>
      </div>
      <div key={"cap" + step} className="hk-pop" style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginTop: 6 }}>{captions[step] || captions[0]}</div>
    </div>
  );
}

function Slot1({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "useEffect";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧑‍💼 useEffect — once you're settled in, do this</div>

      <Callout icon="🧑‍💼" title="The new employee analogy" variant="tip">
        A new employee joins the company.<br /><br />
        <strong>Day 1</strong> — they sit at their desk. Component renders.<br /><br />
        Once settled in — they go get their documents. <strong>useEffect runs.</strong><br /><br />
        "After you appear on screen — do this one thing." That is useEffect.
      </Callout>

      <CodeBlock style={{ marginBottom: 10 }}>
        <div>import {"{ useState, useEffect }"} from 'react';</div>
        <div style={{ color: "#94A3B8" }}>{"// import both — they work together"}</div>
      </CodeBlock>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const MembersList = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [members, setMembers] = useState([]);</div>
        <div style={{ marginTop: 8 }}>
          <Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="useEffect" width={12} />(() =&gt; {"{"}
        </div>
        <div style={{ paddingLeft: 12 }}>loadMembers(); <span style={{ color: "#94A3B8" }}>{"// fetch the data"}</span></div>
        <div>{"}, []);"} <span style={{ color: "#94A3B8" }}>{"// [] = run once when loaded"}</span></div>
        <div style={{ color: "#94A3B8" }}>{"// ... rest of component"}</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Which React hook runs code after the component first appears on screen?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>
          The hook is <strong>useEffect</strong>. <code>useEffect(() =&gt; {"{ ... }"}, [])</code> runs once after component loads.
        </Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>The dependency array — three variants:</div>
          <CodeBlock style={{ marginBottom: 14, fontSize: 11.5 }}>
            <div><span style={{ color: "#4ADE80" }}>useEffect(() =&gt; {"{...}"}, [])</span> <span style={{ color: "#94A3B8" }}>{"→ once, when component loads"}</span></div>
            <div style={{ marginTop: 6 }}>useEffect(() =&gt; {"{...}"}, [memberId]) <span style={{ color: "#94A3B8" }}>{"→ when memberId changes"}</span></div>
            <div style={{ marginTop: 6 }}>useEffect(() =&gt; {"{...}"}) <span style={{ color: "#94A3B8" }}>{"→ after every render (avoid this)"}</span></div>
            <div style={{ marginTop: 8, color: "#4ADE80", fontWeight: 700 }}>For loading data — always [ ]</div>
          </CodeBlock>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand useEffect and the dependency array
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Fix CORS first →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — CORS FIX
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, corsAdded, setCorsAdded }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCommonError, setShowCommonError] = useState(false);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🔓 CORS — tell Spring Boot to accept React's requests</div>

      <Callout icon="⚠️" variant="danger">
        React (port 3000) → calls → Spring Boot (port 8080)<br /><br />
        <strong>Browser: "DIFFERENT PORTS ⚠️ Cross-origin request blocked ❌"</strong><br /><br />
        Your browser blocks this by default — a security feature. React and Spring Boot are on different ports, so the browser sees this as potentially dangerous.
      </Callout>

      <Callout icon="🌐" title="What is CORS?" variant="info">
        CORS = Cross-Origin Resource Sharing.<br /><br />
        "Origin" = protocol + domain + port. <code>localhost:3000 ≠ localhost:8080</code> — different origins = browser blocks.<br /><br />
        You need Spring Boot to say: "localhost:3000 is allowed. Let it through." <code>@CrossOrigin</code> does this.
      </Callout>

      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Option 1 — quick fix (add to controller):</div>
      <CodeBlock style={{ marginBottom: 10 }}>
        <div>{"@CrossOrigin(origins = \"http://localhost:3000\")"}</div>
        <div>@RestController</div>
        <div>public class GymController {"{"}</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// your code unchanged"}</div>
        <div>{"}"}</div>
      </CodeBlock>
      <div style={{ fontSize: 11.5, color: "#64748B", marginBottom: 14 }}>Add this to EVERY controller. Simple. Works immediately.</div>

      <button onClick={() => setShowAdvanced(s => !s)} style={{ background: "none", border: "none", color: "#2563EB", fontSize: 12.5, cursor: "pointer", padding: 0, marginBottom: 8 }}>
        {showAdvanced ? "▾" : "▸"} Advanced option — global fix (SecurityConfig)
      </button>
      {showAdvanced && (
        <CodeBlock style={{ marginBottom: 14, fontSize: 11 }}>
          <div>{"@Bean"}</div>
          <div>public SecurityFilterChain filterChain(HttpSecurity http) {"{"}</div>
          <div style={{ paddingLeft: 12 }}>http.cors(cors -&gt; cors.configurationSource(request -&gt; {"{"}</div>
          <div style={{ paddingLeft: 24 }}>var config = new CorsConfiguration();</div>
          <div style={{ paddingLeft: 24 }}>config.setAllowedOrigins(List.of("http://localhost:3000"));</div>
          <div style={{ paddingLeft: 24 }}>config.setAllowedMethods(List.of("GET","POST","PUT","DELETE"));</div>
          <div style={{ paddingLeft: 24 }}>return config;</div>
          <div style={{ paddingLeft: 12 }}>{"}));"}</div>
          <div style={{ paddingLeft: 12, color: "#94A3B8" }}>{"// ... rest of security config"}</div>
          <div>{"}"}</div>
          <div style={{ marginTop: 6, color: "#94A3B8" }}>{"// Configure once — applies everywhere. Better for larger apps."}</div>
        </CodeBlock>
      )}

      <Callout icon="✅" title="What to do now" variant="success">
        Add <code>@CrossOrigin</code> to your GymController right now.<br /><br />
        Stop your Spring Boot server. Add the annotation. Restart the server.<br /><br />
        Now React can talk to it.
      </Callout>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
        <input type="checkbox" checked={corsAdded} onChange={() => { if (!corsAdded) { playSound("add"); setCorsAdded(true); } }} />
        @CrossOrigin added to my controller — Spring Boot restarted
      </label>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setShowCommonError(s => !s)} style={{ background: "none", border: "none", color: "#2563EB", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
          {showCommonError ? "▾" : "▸"} Still getting a CORS error?
        </button>
        {showCommonError && (
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.8 }}>
            → Check the port matches: 3000<br />
            → Check the annotation is above @RestController<br />
            → Restart Spring Boot after adding
          </div>
        )}
      </div>

      {corsAdded && (
        <div style={{ marginTop: 16 }}>
          <RunButton onClick={() => { playSound("tick"); onNext(); }}>Fetch + States →</RunButton>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — FETCH + THREE STATES
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value === "true";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📦 Three state variables — always together</div>

      <Callout icon="📦" title="The package deal" variant="tip">
        Every data-loading component needs three state variables. Always. Package deal.<br /><br />
        <strong>data</strong> → the members list &nbsp; <strong>loading</strong> → is it still arriving? &nbsp; <strong>error</strong> → did something go wrong?
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>const [members, setMembers] = useState([]); <span style={{ color: "#94A3B8" }}>{"// data — starts empty"}</span></div>
        <div style={{ marginTop: 6 }}>
          const [loading, setLoading] = useState(<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} useDropdown dropdownOptions={["true", "false", "null", "0"]} />);
        </div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 When component first loads — before data arrives — are we loading? loading starts as:
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake>loading starts as <strong>true</strong> — we ARE loading before data arrives.</Callout>
      )}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <CodeBlock style={{ marginBottom: 10 }}>
            <div>const [members, setMembers] = useState([]); <span style={{ color: "#94A3B8" }}>{"// empty array"}</span></div>
            <div>const [loading, setLoading] = useState(true); <span style={{ color: "#94A3B8" }}>{"// loading = yes"}</span></div>
            <div>const [error, setError] = useState(null); <span style={{ color: "#94A3B8" }}>{"// no error yet"}</span></div>
          </CodeBlock>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>The fetch function:</div>
          <CodeBlock style={{ marginBottom: 10, fontSize: 11 }}>
            <div style={{ color: "#94A3B8" }}>{"// Temporary token — replaced in 4.2.2"}</div>
            <div>const token = "paste-your-jwt-token-here";</div>
            <div style={{ marginTop: 8 }}>const loadMembers = async () =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>try {"{"}</div>
            <div style={{ paddingLeft: 24 }}>setLoading(true);</div>
            <div style={{ paddingLeft: 24 }}>const response = await fetch(</div>
            <div style={{ paddingLeft: 36 }}>"http://localhost:8080/gym/members",</div>
            <div style={{ paddingLeft: 36 }}>{'{ headers: { "Authorization": "Bearer " + token } }'}</div>
            <div style={{ paddingLeft: 24 }}>);</div>
            <div style={{ paddingLeft: 24 }}>const data = await response.json();</div>
            <div style={{ paddingLeft: 24 }}>setMembers(data);</div>
            <div style={{ paddingLeft: 12 }}>{"} catch (err) {"}</div>
            <div style={{ paddingLeft: 24 }}>setError("Could not load members. Is your server running?");</div>
            <div style={{ paddingLeft: 12 }}>{"} finally {"}</div>
            <div style={{ paddingLeft: 24 }}>setLoading(false); <span style={{ color: "#94A3B8" }}>{"// always runs — success or fail"}</span></div>
            <div style={{ paddingLeft: 12 }}>{"}"}</div>
            <div>{"};"}</div>
          </CodeBlock>

          <Callout icon="🔑" title="Token note" variant="tip">
            <code>const token = 'paste-your-jwt-token-here'</code><br /><br />
            For now — manually paste a JWT token from Postman (login and copy the token).<br /><br />
            In 4.2.2 — we build a proper login screen that handles this automatically. This is temporary scaffolding.
          </Callout>

          <Callout icon="🏁" title="finally, in one sentence" variant="info">
            <code>finally {"{ setLoading(false) }"}</code> runs whether success or failure — either way, loading is done.
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            loadMembers function created
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Render Data →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — RENDER DATA (conditional rendering)
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, done, setDone, previewState, setPreviewState }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim() === "map";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const preview = (s) => {
    setPreviewState(s);
    playSound(s === "loading" ? "tick" : s === "error" ? "warn" : "correct");
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧾 Show loading, error, and data</div>

      <Callout icon="🔀" variant="tip">
        React can show different things based on state.<br /><br />
        if loading → show loading message &nbsp;·&nbsp; if error → show error message &nbsp;·&nbsp; if data → show the list
      </Callout>

      <BlankCard correct={correct} wrong={wrong && !correct}>
        <div>return (</div>
        <div style={{ paddingLeft: 12 }}>&lt;div className="members-list"&gt;</div>
        <div style={{ paddingLeft: 24, marginTop: 6 }}>{"{loading && ("}</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Loading members...&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>{")}"}</div>
        <div style={{ paddingLeft: 24, marginTop: 6 }}>{"{error && ("}</div>
        <div style={{ paddingLeft: 36 }}>&lt;p className="error"&gt;{"{error}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>{")}"}</div>
        <div style={{ paddingLeft: 24, marginTop: 6 }}>{"{!loading && !error && ("}</div>
        <div style={{ paddingLeft: 36 }}>&lt;div&gt;</div>
        <div style={{ paddingLeft: 48 }}>
          {"{members."}<Blank value={value} onChange={v => { setValue(v); setWrong(false); }} correct={correct} placeholder="map" width={5} />{"((member) => ("}
        </div>
        <div style={{ paddingLeft: 60 }}>&lt;div key={"{member.id}"} className="member-row"&gt;</div>
        <div style={{ paddingLeft: 72 }}>&lt;h3&gt;{"{member.name}"}&lt;/h3&gt;</div>
        <div style={{ paddingLeft: 72 }}>&lt;p&gt;{"{member.plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 60 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 48 }}>{"))}"}</div>
        <div style={{ paddingLeft: 36 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 24 }}>{")}"}</div>
        <div style={{ paddingLeft: 12 }}>&lt;/div&gt;</div>
        <div>);</div>
      </BlankCard>
      <div style={{ fontSize: 12.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 To render each member as a div — which array method do you use?
      </div>
      {wrong && !correct && <Callout icon="🚫" variant="danger" shake>.map() transforms each member into a JSX element.</Callout>}

      {correct && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <Callout icon="&&" title="The && operator" variant="info">
            <code>{"{loading && <p>Loading...</p>}"}</code><br /><br />
            <code>&&</code> in JSX = "if this is true, show this." If loading is true → shows the p. If loading is false → shows nothing.<br /><br />
            Same as <code>if (loading) {"{ return <p>...</p> }"}</code> — just shorter.
          </Callout>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>🧪 Preview all three states on the right:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <button onClick={() => preview("loading")} className="hk-btn" style={{ padding: "8px 14px", borderRadius: 8, border: previewState === "loading" ? "2px solid #7C3AED" : "1px solid #E2E8F0", background: previewState === "loading" ? "#F5F3FF" : "#fff", fontSize: 12.5, fontWeight: 700 }}>⏳ Loading</button>
            <button onClick={() => preview("error")} className="hk-btn" style={{ padding: "8px 14px", borderRadius: 8, border: previewState === "error" ? "2px solid #DC2626" : "1px solid #E2E8F0", background: previewState === "error" ? "#FEF2F2" : "#fff", fontSize: 12.5, fontWeight: 700 }}>❌ Error</button>
            <button onClick={() => preview("data")} className="hk-btn" style={{ padding: "8px 14px", borderRadius: 8, border: previewState === "data" ? "2px solid #10B981" : "1px solid #E2E8F0", background: previewState === "data" ? "#F0FDF4" : "#fff", fontSize: 12.5, fontWeight: 700 }}>✅ Data</button>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            Render logic complete
          </label>
          {checked && <RunButton onClick={() => { playSound("tick"); onNext(); }}>Full Stack Moment →</RunButton>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — FULL STACK MOMENT
// ═══════════════════════════════════════════════════════════════════════════
const PIPELINE_STEPS = [
  { label: "useEffect fires", icon: "🧑‍💼" },
  { label: "fetch() + JWT", icon: "📡" },
  { label: "Spring Boot @GetMapping", icon: "☕" },
  { label: "JpaRepository → MySQL", icon: "🗄️" },
  { label: "rows → JSON", icon: "📨" },
  { label: "setMembers(data)", icon: "🖊️" },
  { label: ".map() renders", icon: "🧾" },
];
const MOMENT_LINES = [
  "Your members are on screen.",
  "They came from MySQL. Through Spring Boot. Through a JWT check. Fetched by React. Rendered as cards.",
  "React → Spring Boot → MySQL → back to React → on your screen.",
  "This is the full stack.",
  "Swiggy does this for every restaurant, every menu item, every order.",
  "You just built the same thing."
];

function Slot5({ onDone, playSound, pipelineStep, setPipelineStep, rendered, setRendered }) {
  const [checklist, setChecklist] = useState({ boot: false, mysql: false, cors: false, member: false, token: false });
  const [threeChecks, setThreeChecks] = useState({ running: false, spinner: false, data: false });
  const [momentLine, setMomentLine] = useState(-1);
  const timers = useRef([]);

  const runPipeline = () => {
    setPipelineStep(0);
    setRendered(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    PIPELINE_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => { setPipelineStep(i); playSound("tick"); }, i * 450));
    });
    timers.current.push(setTimeout(() => { setRendered(true); playSound("correct"); }, PIPELINE_STEPS.length * 450 + 200));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const allChecked = threeChecks.running && threeChecks.spinner && threeChecks.data;
  useEffect(() => {
    if (allChecked && momentLine === -1) {
      playSound("correct");
      setTimeout(() => playSound("reveal"), 400);
      MOMENT_LINES.forEach((_, i) => {
        timers.current.push(setTimeout(() => setMomentLine(i), 600 + i * 500));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const toggleCheck = (key) => {
    setThreeChecks(c => ({ ...c, [key]: !c[key] }));
  };

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🔗 Connect it all — real data on screen</div>

      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Before running — confirm:</div>
      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        {[
          ["boot", "Spring Boot server running"],
          ["mysql", "MySQL running"],
          ["cors", "@CrossOrigin added to controller"],
          ["member", "At least one member in database"],
          ["token", "JWT token from Postman pasted into token variable"],
        ].map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 6 }}>
            <input type="checkbox" checked={checklist[key]} onChange={() => setChecklist(c => ({ ...c, [key]: !c[key] }))} />
            {label}
          </label>
        ))}
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Full component (copy this into your project):</div>
      <CodeBlock style={{ marginBottom: 14, fontSize: 10.5, maxHeight: 320, overflowY: "auto" }}>
        <div>import {"{ useState, useEffect }"} from 'react';</div>
        <div style={{ marginTop: 6 }}>const token = "paste-your-jwt-here"; <span style={{ color: "#94A3B8" }}>{"// ← paste token from Postman"}</span></div>
        <div style={{ marginTop: 6 }}>const MembersList = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>const [members, setMembers] = useState([]);</div>
        <div style={{ paddingLeft: 12 }}>const [loading, setLoading] = useState(true);</div>
        <div style={{ paddingLeft: 12 }}>const [error, setError] = useState(null);</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>useEffect(() =&gt; {"{ loadMembers(); }, []);"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>const loadMembers = async () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 24 }}>try {"{"}</div>
        <div style={{ paddingLeft: 36 }}>setLoading(true);</div>
        <div style={{ paddingLeft: 36 }}>const response = await fetch("http://localhost:8080/gym/members", {"{"}</div>
        <div style={{ paddingLeft: 48 }}>{'headers: { "Authorization": "Bearer " + token }'}</div>
        <div style={{ paddingLeft: 36 }}>{"});"}</div>
        <div style={{ paddingLeft: 36 }}>const data = await response.json();</div>
        <div style={{ paddingLeft: 36 }}>setMembers(data);</div>
        <div style={{ paddingLeft: 24 }}>{"} catch (err) {"}</div>
        <div style={{ paddingLeft: 36 }}>setError("Server not reachable. Check Spring Boot.");</div>
        <div style={{ paddingLeft: 24 }}>{"} finally { setLoading(false); }"}</div>
        <div style={{ paddingLeft: 12 }}>{"};"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>if (loading) return &lt;p&gt;Loading...&lt;/p&gt;;</div>
        <div style={{ paddingLeft: 12 }}>if (error) return &lt;p&gt;{"{error}"}&lt;/p&gt;;</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="members-list"&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h2&gt;Gym Members&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 36 }}>{"{members.map((member) => ("}</div>
        <div style={{ paddingLeft: 48 }}>&lt;div key={"{member.id}"} className="member-card"&gt;</div>
        <div style={{ paddingLeft: 60 }}>&lt;h3&gt;{"{member.name}"}&lt;/h3&gt;</div>
        <div style={{ paddingLeft: 60 }}>&lt;p&gt;{"{member.plan}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 60 }}>&lt;span className={'{member.isActive ? "badge active" : "badge inactive"}'}&gt;</div>
        <div style={{ paddingLeft: 72 }}>{'{member.isActive ? "Active" : "Inactive"}'}</div>
        <div style={{ paddingLeft: 60 }}>&lt;/span&gt;</div>
        <div style={{ paddingLeft: 48 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 36 }}>{"))}"}</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
        <div style={{ marginTop: 6 }}>export default MembersList;</div>
      </CodeBlock>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>
        Copy this into your React project. Paste your JWT token. Open the browser. Your members from MySQL will appear on screen.
      </div>

      <Callout icon="🎬" variant="neutral">
        This playground can't reach your real Spring Boot server — so here's a <strong>simulation</strong> of exactly what will happen when you run this on your machine.
      </Callout>
      <RunButton onClick={() => { playSound("tick"); runPipeline(); }}>▶ Simulate the full stack pipeline</RunButton>

      {rendered && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Now confirm what you saw:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={threeChecks.running} onChange={() => toggleCheck("running")} />
              Component running in browser
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={threeChecks.spinner} onChange={() => toggleCheck("spinner")} />
              Loading spinner appeared briefly
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={threeChecks.data} onChange={() => toggleCheck("data")} />
              Real members from MySQL visible
            </label>
          </div>
        </div>
      )}

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
    ["🧑‍💼 useEffect(() => fn, [])", "run fn once after component loads"],
    ["📋 [] dependency array", "empty = once, [value] = when value changes"],
    ["🔓 CORS", "browser security — @CrossOrigin allows React's port"],
    ["📦 Three states", "data/loading/error — always together"],
    ["📡 fetch() + Authorization header", "calls Spring Boot with JWT token"],
    ["🏁 finally", "runs whether try or catch — always setLoading(false) here"],
    ["🔀 {loading && ...}", "conditional render — show if loading is true"],
    ["🔗 Full stack chain", "React → Spring Boot → MySQL → back → screen"],
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
        Real data. From MySQL. On screen. In a browser.<br /><br />
        The full stack is connected.<br /><br />
        Next — 4.2.2. Replace the hardcoded token with a real login screen.<br />
        User types credentials. React sends to Spring Boot. JWT received. Stored. Used automatically.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", endpoint: "GET /gym/members", itemLabel: "member", data: SAMPLE_MEMBERS },
  hotel: { icon: "🏨", label: "Hotel", endpoint: "GET /hotel/rooms", itemLabel: "room", data: [
    { id: 1, name: "Room 101", plan: "Standard", isActive: true },
    { id: 2, name: "Room 102", plan: "Deluxe", isActive: true },
    { id: 3, name: "Room 103", plan: "Standard", isActive: false },
  ] },
  mess: { icon: "🍱", label: "Mess", endpoint: "GET /mess/meals", itemLabel: "meal", data: [
    { id: 1, name: "Monday Lunch", plan: "Dal Rice Sambar", isActive: true },
    { id: 2, name: "Tuesday Lunch", plan: "Chapati Sabzi", isActive: true },
    { id: 3, name: "Wednesday Lunch", plan: "Curd Rice", isActive: false },
  ] },
  chai: { icon: "☕", label: "Chai", endpoint: "GET /chai/orders", itemLabel: "order", data: [
    { id: 1, name: "Order #41", plan: "2x Cutting Chai", isActive: true },
    { id: 2, name: "Order #42", plan: "1x Masala Chai", isActive: true },
    { id: 3, name: "Order #43", plan: "3x Cutting Chai", isActive: false },
  ] },
};

function Phase2Left({ domain, setDomain, fetchState, setFetchState, reflection, setReflection, onSubmit, submitted, playSound, tasks, setTasks }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const d = domain ? DOMAINS[domain] : null;
  const dataOnScreen = fetchState === "data";
  const timers = useRef([]);

  const chooseDomain = (key) => {
    playSound("tick");
    setDomain(key);
    setFetchState("idle");
  };

  const runFetch = () => {
    setFetchState("loading");
    playSound("tick");
    timers.current.push(setTimeout(() => { setFetchState("data"); playSound("correct"); }, 1200));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggleTask = (group, key) => setTasks(t => ({ ...t, [group]: { ...t[group], [key]: !t[group][key] } }));

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📡 Fetch YOUR domain data</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, confirm your setup, then simulate the fetch.</div>

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
              <CodeBlock style={{ marginBottom: 14 }}>{d.endpoint}</CodeBlock>

              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>TASK 1 — Spring Boot ready</div>
              {["@CrossOrigin on controller", "Spring Boot running", "At least 2 items in database", "JWT token obtained from Postman"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.springBoot[i]} onChange={() => toggleTask("springBoot", i)} />{label}
                </label>
              ))}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginTop: 10, marginBottom: 6 }}>TASK 2 — React component</div>
              {["useEffect added", "Three state variables", "fetch() with Authorization header", ".map() renders each item"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.react[i]} onChange={() => toggleTask("react", i)} />{label}
                </label>
              ))}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginTop: 10, marginBottom: 6 }}>TASK 3 — Working</div>
              {["Loading spinner appears", "Real data appears on screen", "Items from MySQL visible"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks.working[i]} onChange={() => toggleTask("working", i)} />{label}
                </label>
              ))}

              <RunButton onClick={runFetch} disabled={fetchState === "loading"}>{dataOnScreen ? "Run again ↻" : "▶ Simulate fetch"}</RunButton>

              <div style={{ marginTop: 16, marginBottom: 4 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Commit your work:</div>
                <CodeBlock style={{ fontSize: 11 }}>
                  <div>git add .</div>
                  <div>git commit -m "connect React to Spring Boot — fetch {d.itemLabel}s"</div>
                  <div>git push origin main</div>
                </CodeBlock>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — what does useEffect with [] do and why do we need it to fetch data?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="useEffect with [] runs once after the component first appears on screen — we need it to fetch data because we cannot make network requests during render, only after the component has mounted..."
                  style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 13.5, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: 11.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
                  {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
                </div>
              </div>

              <RunButton onClick={onSubmit} disabled={!dataOnScreen || !reflectionOk}>Data loading — build login screen next →</RunButton>
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>🔗 Full stack connected.</div>
          <div style={{ fontSize: 13.5, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ useEffect fires after mount<br />
            ✅ CORS allows React's port<br />
            ✅ fetch() calls Spring Boot<br />
            ✅ JWT token sent in header<br />
            ✅ MySQL data appears on screen<br /><br />
            Next — 4.2.2.<br /><br />
            Right now token is hardcoded.<br />
            Build a login form. User types credentials. POST to /auth/login. Receive JWT token. Store it. Use it automatically on every request.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PREVIEW COMPONENTS ──────────────────────────────────────────────────────
function MemberRow({ m }) {
  return (
    <div className="hk-card-in" style={{
      background: "#fff", borderRadius: 10, padding: 12, width: "100%", maxWidth: 240,
      boxShadow: "0 3px 10px rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#1A3C6E" }}>{m.name}</div>
        <div style={{ fontSize: 11.5, color: "#64748B" }}>{m.plan}</div>
      </div>
      <span style={{
        background: m.isActive ? "#DCFCE7" : "#FEE2E2", color: m.isActive ? "#166534" : "#991B1B",
        borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 800
      }}>{m.isActive ? "Active" : "Inactive"}</span>
    </div>
  );
}

function LoadingSpinnerBox() {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="hk-spinner" />
      <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 10, fontWeight: 700 }}>Loading members...</div>
    </div>
  );
}
function ErrorBox() {
  return (
    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 16, textAlign: "center", maxWidth: 260 }}>
      <div style={{ fontSize: 24 }}>⚠️</div>
      <div style={{ fontSize: 12.5, color: "#7F1D1D", fontWeight: 700, marginTop: 6 }}>Could not load members.</div>
      <div style={{ fontSize: 11, color: "#991B1B", marginTop: 4 }}>Is your server running?</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function FetchDataBuilder() {
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
  const [corsAdded, setCorsAdded] = useState(false);
  const [slot3Done, setSlot3Done] = useState(false);
  const [slot4Done, setSlot4Done] = useState(false);
  const [previewState, setPreviewState] = useState("loading");
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [pipelineRendered, setPipelineRendered] = useState(false);

  const [newEmployeeStep, setNewEmployeeStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setNewEmployeeStep(s => (s + 1) % 3), 1200);
    return () => clearInterval(iv);
  }, []);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [fetchState, setFetchState] = useState("idle");
  const [tasks, setTasks] = useState({ springBoot: {}, react: {}, working: {} });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t2-s1-fetch-data-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { useEffectBlank: "useEffect" },
          slot2: { corsAdded: true },
          slot3: { loadingInitialBlank: "true" },
          slot4: { mapBlank: "map" },
          slot5: { componentRunning: true, loadingSpinnerSeen: true, realDataVisible: true }
        },
        phase2: {
          domainSelected: domain,
          corsAdded: true,
          useEffectAdded: true,
          threeStatesAdded: true,
          realDataOnScreen: fetchState === "data",
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(14px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
        .hk-spinner { width: 34px; height: 34px; border-radius: 50%; border: 4px solid #E2E8F0; border-top-color: #7C3AED; animation: spin 0.7s linear infinite; margin: 0 auto; }
        .hk-card-in { animation: cardIn 0.4s ease both; }
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
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>🔗 SUBTOPIC 4.2.1 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>📡 useEffect + fetch</div>
          <div style={{ fontSize: 14, color: "#DDD6FE" }}>Load real data from your Spring Boot API.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done} />
              {slot >= 2 && <Slot2 onNext={() => setSlot(3)} playSound={playSound} corsAdded={corsAdded} setCorsAdded={setCorsAdded} />}
              {slot >= 3 && <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done} />}
              {slot >= 4 && <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done} previewState={previewState} setPreviewState={setPreviewState} />}
              {slot >= 5 && !showReveal && (
                <Slot5
                  onDone={() => setShowReveal(true)} playSound={playSound}
                  pipelineStep={pipelineStep} setPipelineStep={setPipelineStep}
                  rendered={pipelineRendered} setRendered={setPipelineRendered}
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
                  <Stage caption="Component renders → useEffect fires → data loads">
                    <NewEmployeeStory step={newEmployeeStep} />
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption={corsAdded ? "Allowed: localhost:3000 ✅" : "Blocked by browser ❌"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: "#334155", color: "#fff", borderRadius: 10, padding: "14px 16px", fontSize: 11, fontWeight: 800, textAlign: "center" }}>⚛️<br />React<br /><span style={{ fontWeight: 400 }}>:3000</span></div>
                      <div style={{ fontSize: 24 }}>{corsAdded ? "✅" : "🚫"}</div>
                      <div style={{ background: "#334155", color: "#fff", borderRadius: 10, padding: "14px 16px", fontSize: 11, fontWeight: 800, textAlign: "center" }}>☕<br />Spring Boot<br /><span style={{ fontWeight: 400 }}>:8080</span></div>
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 12 }}>Same laptop, different ports</div>
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption="The three-state package, always together">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 220 }}>
                      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 10, fontSize: 12, fontFamily: "monospace" }}>members: []</div>
                      <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: 10, fontSize: 12, fontFamily: "monospace" }}>loading: true</div>
                      <div style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 8, padding: 10, fontSize: 12, fontFamily: "monospace" }}>error: null</div>
                    </div>
                  </Stage>
                )}
                {slot === 4 && (
                  <Stage caption={`Previewing: ${previewState}`}>
                    {previewState === "loading" && <LoadingSpinnerBox />}
                    {previewState === "error" && <ErrorBox />}
                    {previewState === "data" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
                        {SAMPLE_MEMBERS.map(m => <MemberRow key={m.id} m={m} />)}
                      </div>
                    )}
                  </Stage>
                )}
                {slot === 5 && <Slot5FullStackStage pipelineStep={pipelineStep} rendered={pipelineRendered} />}
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                domain={domain} setDomain={setDomain}
                fetchState={fetchState} setFetchState={setFetchState}
                tasks={tasks} setTasks={setTasks}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                <Stage caption={domain ? (fetchState === "data" ? "Fetched — real data on screen ✅" : fetchState === "loading" ? "Fetching..." : "Ready to fetch") : "👈 Pick a domain to begin"}>
                  {!domain && <div style={{ color: "#94A3B8", fontSize: 13 }}>(your data will appear here)</div>}
                  {domain && fetchState === "idle" && <div style={{ fontSize: 40 }}>💤</div>}
                  {domain && fetchState === "loading" && <LoadingSpinnerBox />}
                  {domain && fetchState === "data" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
                      {d.data.map(m => <MemberRow key={m.id} m={m} />)}
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

// ─── SLOT 5 RIGHT-PANEL PIPELINE — driven by lifted parent state ────────────
function Slot5FullStackStage({ pipelineStep, rendered }) {
  if (rendered) {
    return (
      <Stage caption="Real members from MySQL, rendered as cards ✅">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", alignItems: "center" }}>
          {SAMPLE_MEMBERS.map((m, i) => (
            <div key={m.id} className="hk-card-in" style={{ animationDelay: `${i * 0.15}s`, width: "100%", display: "flex", justifyContent: "center" }}>
              <MemberRow m={m} />
            </div>
          ))}
        </div>
      </Stage>
    );
  }
  if (pipelineStep >= 0) {
    return (
      <Stage caption={PIPELINE_STEPS[pipelineStep]?.label}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 260 }}>
          {PIPELINE_STEPS.map((s, i) => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
              background: pipelineStep >= i ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
              color: pipelineStep >= i ? "#fff" : "#94A3B8", transition: "all 0.3s ease",
              transform: pipelineStep === i ? "scale(1.03)" : "scale(1)"
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </Stage>
    );
  }
  return (
    <Stage caption="Click 'Simulate the full stack pipeline' on the left">
      <div style={{ fontSize: 46 }}>🔗</div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>React → Spring Boot → MySQL → back → your screen</div>
    </Stage>
  );
}
