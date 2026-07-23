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
function CodeLine({ children, indent = 0, active }) {
  return (
    <div style={{
      paddingLeft: indent * 12, transition: "background 0.25s ease, color 0.25s ease",
      background: active ? "rgba(124,58,237,0.28)" : "transparent",
      color: active ? "#E9D5FF" : undefined, borderRadius: active ? 4 : 0,
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Good vs Bad", icon: "🩺" },
  { label: "HTTP Status", icon: "📡" },
  { label: "Validation", icon: "✅" },
  { label: "Empty State", icon: "📭" },
  { label: "Error Card", icon: "🗂️" },
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
                <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, textAlign: "center", color: done ? "#059669" : active ? "#1E293B" : "#94A3B8" }}>{s.label}</div>
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

// ─── STAGE — right panel wrapper ────────────────────────────────────────────
function Stage({ children, caption, label = "LIVE INTERACTIVE PREVIEW" }) {
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

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN DATA — status codes, messages, colors
// ═══════════════════════════════════════════════════════════════════════════
const STATUS_INFO = {
  401: {
    color: "#F59E0B", bg: "#FEF3C7", border: "#FDE68A", label: "401 Unauthorized",
    cause: "JWT token expired → user must login again",
    bad: "Error: 401",
    good: "Session expired. Please login again.",
  },
  404: {
    color: "#EA580C", bg: "#FEF0E6", border: "#FED7AA", label: "404 Not Found",
    cause: "Member deleted by someone else",
    bad: "Error: 404 Not Found",
    good: "Member not found. They may have been removed.",
  },
  400: {
    color: "#CA8A04", bg: "#FEFCE8", border: "#FEF08A", label: "400 Bad Request",
    cause: "Invalid data sent to the server",
    bad: "Error: 400 Bad Request",
    good: "Invalid details. Please check all fields.",
  },
  500: {
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "500 Internal Server Error",
    cause: "Spring Boot crashed while processing the request",
    bad: "Error: 500 Internal Server Error",
    good: "Server error. Please try again in a moment.",
  },
  network: {
    color: "#64748B", bg: "#F9FAFB", border: "#E2E8F0", label: "Network Error",
    cause: "No connection at all → Spring Boot not running",
    bad: "NetworkError: Failed to fetch at XMLHttpRequest.send (chrome-extension://...)",
    good: "Could not connect to server. Check that your Spring Boot app is running on port 8080.",
  },
};
const STATUS_ORDER = [401, 404, 400, 500, "network"];

// getErrorMessage — the actual helper, used live by the simulator
function getErrorMessage(status) {
  if (status === 401) return "Session expired. Please login again.";
  if (status === 404) return "Not found. Try refreshing the page.";
  if (status === 500) return "Server error. Try again in a moment.";
  if (status === "network") return "Could not connect to server. Check that your Spring Boot app is running on port 8080.";
  return "Something went wrong. Please try again.";
}

// ─── ERROR CARD — the reusable, consistent component being taught ──────────
function ErrorCard({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="hk-pop" style={{
      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
      padding: "12px 16px", color: "#991B1B", display: "flex", alignItems: "center",
      gap: 12, margin: "8px 0", width: "100%", boxSizing: "border-box"
    }}>
      <span style={{ fontSize: 17 }}>⚠️</span>
      <p style={{ margin: 0, flex: 1, fontSize: 14, lineHeight: 1.5 }}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#991B1B", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>✕</button>
      )}
    </div>
  );
}

// ─── DOCTOR CARD ─────────────────────────────────────────────────────────────
function DoctorCard({ good }) {
  return (
    <div className="hk-card hk-pop" style={{
      background: good ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${good ? "#BBF7D0" : "#FECACA"}`,
      borderRadius: 14, padding: 18, width: "100%", maxWidth: 320, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: good ? "#16A34A" : "#DC2626", marginBottom: 10, letterSpacing: 0.4 }}>
        {good ? "👩‍⚕️ GOOD DOCTOR" : "👨‍⚕️ BAD DOCTOR"}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: good ? "#166534" : "#7F1D1D", marginBottom: 14, fontStyle: "italic" }}>
        {good
          ? "“You're a little anaemic. Take these iron tablets with food for three months. You'll feel better soon.”"
          : "“Your haemoglobin is 9.2 g/dL with microcytic hypochromic indices and elevated TIBC.”"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
        <span style={{ fontSize: 22 }}>{good ? "😊" : "😰"}</span>
        <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
          {good ? "“OK — I can do that.”" : "“What does that mean? Is it serious? What do I do?”"}
        </span>
      </div>
    </div>
  );
}

function ErrorCompareCard({ good }) {
  const info = { bad: STATUS_INFO.network.bad, good: STATUS_INFO.network.good };
  return (
    <div className="hk-card hk-pop" style={{
      background: good ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${good ? "#BBF7D0" : "#FECACA"}`,
      borderRadius: 14, padding: 18, width: "100%", maxWidth: 320, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: good ? "#16A34A" : "#DC2626", marginBottom: 10, letterSpacing: 0.4 }}>
        {good ? "✅ GOOD ERROR" : "❌ BAD ERROR"}
      </div>
      <div style={{
        fontFamily: good ? "inherit" : "monospace", fontSize: good ? 14 : 12.5,
        lineHeight: 1.7, color: good ? "#166534" : "#7F1D1D", marginBottom: 14,
        background: good ? "transparent" : "#1E293B", padding: good ? 0 : 10, borderRadius: good ? 0 : 8,
      }}>
        {good ? `⚠️ ${info.good}` : info.bad}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
        <span style={{ fontSize: 22 }}>{good ? "😊" : "😰"}</span>
        <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
          {good ? "“Oh — I need to start the server.”" : "“Something is broken. I don't know what to do.”"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — GOOD VS BAD MESSAGES
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound, done, setDone, mode, setMode }) {
  const [quiz, setQuiz] = useState(null); // 'A' | 'B' | null
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (quiz === "B" && !done) { playSound("correct"); setDone(true); }
    else if (quiz === "A") playSound("warn");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🩺 Error messages that help, not frighten</div>

      <Callout icon="🩺" title="The doctor analogy" variant="info">
        Two doctors. Same diagnosis. Very different bedside manner.
        <br /><br />
        A <strong>bad doctor</strong> reads out lab values. A <strong>good doctor</strong> tells you what it means and what to do.
        <br /><br />
        <strong>Error messages work the same way.</strong> Toggle the panel on the right — same situation, two very different responses.
      </Callout>

      <Callout icon="⚖️" variant="tip">
        Same problem. One helps. One frightens.
        <br />
        <strong>Your app should always sound like the good doctor.</strong>
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 10 }}>🤔 Quick check — which is a better error message?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setQuiz("A")} className="hk-btn" style={{
            textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "monospace", fontSize: 14,
            border: quiz === "A" ? "2px solid #DC2626" : "1px solid #E2E8F0", background: quiz === "A" ? "#FEF2F2" : "#fff", color: "#1E293B"
          }}>A) "Error 401: Unauthorized" {quiz === "A" && "❌"}</button>
          <button onClick={() => setQuiz("B")} className="hk-btn" style={{
            textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "monospace", fontSize: 14,
            border: quiz === "B" ? "2px solid #16A34A" : "1px solid #E2E8F0", background: quiz === "B" ? "#F0FDF4" : "#fff", color: "#1E293B"
          }}>B) "Session expired. Please login again." {quiz === "B" && "✅"}</button>
        </div>
        {quiz === "A" && (
          <Callout icon="🚫" variant="danger" shake style={{ marginTop: 12, marginBottom: 0 }}>
            The user does not know what 401 means. Tell them what to <strong>DO</strong>.
          </Callout>
        )}
        {quiz === "B" && (
          <Callout icon="✅" variant="success" style={{ marginTop: 12, marginBottom: 0 }}>
            Tells the user what happened <strong>and</strong> what to do next.
          </Callout>
        )}
      </div>

      {done && (
        <div className="hk-slide-in">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("correct"); setChecked(true); } }} />
            I understand — good errors say what happened AND what to do
          </label>
          {checked && <div style={{ marginTop: 12 }}><RunButton onClick={() => { playSound("tick"); onNext(); }}>Handle HTTP errors →</RunButton></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — HTTP STATUS CODES
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, done, setDone, statusStep, setStatusStep, activeStatus, setActiveStatus }) {
  const [blankValue, setBlankValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const blankCorrect = blankValue.trim() === "status";
  const [checked, setChecked] = useState(false);

  const currentCode = STATUS_ORDER[statusStep];
  const info = STATUS_INFO[currentCode];
  const allStatusesSeen = statusStep >= STATUS_ORDER.length - 1;

  useEffect(() => { setActiveStatus(currentCode); }, [currentCode, setActiveStatus]);

  useEffect(() => {
    if (blankCorrect && !done) { playSound("add"); setDone(true); }
    else if (blankValue && !blankCorrect) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankCorrect]);

  const advanceStatus = () => {
    playSound("tick");
    if (statusStep < STATUS_ORDER.length - 1) setStatusStep(s => s + 1);
    else setStatusStep(s => s + 1); // move past last into helper section
  };

  const inHelperSection = statusStep >= STATUS_ORDER.length;

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>📡 Friendly messages for each error type</div>

      {!inHelperSection && (
        <div key={currentCode} className="hk-slide-in">
          <div style={{ fontSize: 13, fontWeight: 800, color: "#94A3B8", marginBottom: 6 }}>STATUS {statusStep + 1} OF {STATUS_ORDER.length}</div>
          <Callout icon="📡" title={info.label} variant="neutral" style={{ borderLeftColor: info.color }}>
            → {info.cause}
          </Callout>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ flex: "1 1 200px", background: "#1E293B", borderRadius: 10, padding: 12, fontFamily: "monospace", fontSize: 13, color: "#F87171" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", marginBottom: 4 }}>BAD</div>
              {info.bad}
            </div>
            <div style={{ flex: "1 1 200px", background: "#134E4A", borderRadius: 10, padding: 12, fontFamily: "monospace", fontSize: 13, color: "#4ADE80" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6EE7B7", marginBottom: 4 }}>GOOD</div>
              {info.good}
            </div>
          </div>

          {currentCode === 401 ? (
            <>
              <CodeBlock style={{ marginBottom: 10 }}>
                <div>if (response.status === 401) {"{"}</div>
                <div style={{ paddingLeft: 12 }}>onLogout();</div>
                <div style={{ paddingLeft: 12 }}>return;</div>
                <div>{"}"}</div>
              </CodeBlock>
              <Callout icon="🔑" title="The onLogout pattern" variant="tip">
                401 = token expired.<br />
                Call <code>onLogout()</code> → clears the token → login screen appears automatically.
                <br /><br />
                <code>onLogout()</code> is a prop from App. Calling it sets <code>token</code> to <code>null</code>. App shows the login screen. User logs in again. Fresh token. Everything works.
              </Callout>
            </>
          ) : currentCode === "network" ? (
            <CodeBlock style={{ marginBottom: 10 }}>
              <div>{"} catch (err) {"}</div>
              <div style={{ paddingLeft: 12 }}>setError(getErrorMessage("network"));</div>
              <div>{"}"}</div>
            </CodeBlock>
          ) : (
            <CodeBlock style={{ marginBottom: 10 }}>
              <div>if (response.status === {typeof currentCode === "number" ? currentCode : `"${currentCode}"`}) {"{"}</div>
              <div style={{ paddingLeft: 12 }}>setError("{info.good}");</div>
              <div>{"}"}</div>
            </CodeBlock>
          )}

          <RunButton onClick={advanceStatus}>{allStatusesSeen ? "Got it →" : "Next →"}</RunButton>
        </div>
      )}

      {inHelperSection && (
        <div className="hk-slide-in">
          <Callout icon="🧩" variant="info">
            Five statuses, five <code>if</code> blocks — that's repetitive. One helper function handles all of them:
          </Callout>

          <BlankCard correct={blankCorrect} wrong={wrong && !blankCorrect}>
            <div>const getErrorMessage = (<Blank value={blankValue} onChange={v => { setBlankValue(v); setWrong(false); }} correct={blankCorrect} placeholder="status" width={7} />) =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12, marginTop: 4 }}>if (status === 401)</div>
            <div style={{ paddingLeft: 24 }}>return "Session expired. Please login again.";</div>
            <div style={{ paddingLeft: 12, marginTop: 4 }}>if (status === 404)</div>
            <div style={{ paddingLeft: 24 }}>return "Not found. Try refreshing the page.";</div>
            <div style={{ paddingLeft: 12, marginTop: 4 }}>if (status === 500)</div>
            <div style={{ paddingLeft: 24 }}>return "Server error. Try again in a moment.";</div>
            <div style={{ paddingLeft: 12, marginTop: 4 }}>return "Something went wrong. Please try again.";</div>
            <div>{"};"}</div>
          </BlankCard>
          <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
            💡 This function receives the HTTP status code. What parameter name?
          </div>
          {wrong && !blankCorrect && (
            <Callout icon="🚫" variant="danger" shake>
              Pass the HTTP status number — <code>getErrorMessage(response.status)</code>.
            </Callout>
          )}

          {blankCorrect && (
            <div className="hk-slide-in">
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6, marginTop: 4 }}>Using it:</div>
              <CodeBlock style={{ marginBottom: 14 }}>
                <div>if (!response.ok) {"{"}</div>
                <div style={{ paddingLeft: 12 }}>setError(getErrorMessage(response.status));</div>
                <div style={{ paddingLeft: 12 }}>return;</div>
                <div>{"}"}</div>
              </CodeBlock>

              <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🧪 TRY IT — click a status card on the right</div>
                <div style={{ fontSize: 13.5, color: "#374151" }}>
                  getErrorMessage({typeof activeStatus === "number" ? activeStatus : `"${activeStatus}"`}) → <span style={{ fontFamily: "monospace", color: "#059669", fontWeight: 700 }}>"{getErrorMessage(activeStatus)}"</span>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
                <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
                ✅ HTTP error messages understood
              </label>
              {checked && <div style={{ marginTop: 12 }}><RunButton onClick={() => { playSound("tick"); onNext(); }}>Catch errors before they reach the server →</RunButton></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — FORM VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
function validateMember(name, age) {
  if (!name.trim()) return "Member name is required.";
  if (!age || age < 1 || age > 120) return "Please enter a valid age between 1 and 120.";
  return null;
}

function Slot3({ onNext, playSound, done, setDone }) {
  const [blankValue, setBlankValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const blankCorrect = blankValue.trim() === "name";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (blankCorrect && !done) { playSound("add"); setDone(true); }
    else if (blankValue && !blankCorrect) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankCorrect]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>✅ Catch errors before they reach the server</div>

      <Callout icon="⏱️" title="Why validate before sending?" variant="info">
        <strong>Option A — no validation:</strong> user submits empty name → request sent to Spring Boot → Spring Boot returns 400 → error shown. 3 steps. Slow.
        <br /><br />
        <strong>Option B — validation first:</strong> user submits empty name → error shown immediately. 1 step. Instant.
      </Callout>

      <BlankCard correct={blankCorrect} wrong={wrong && !blankCorrect}>
        <div>const validate = () =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12 }}>if (!<Blank value={blankValue} onChange={v => { setBlankValue(v); setWrong(false); }} correct={blankCorrect} placeholder="name" width={5} />.trim()) {"{"}</div>
        <div style={{ paddingLeft: 24 }}>setError("Member name is required.");</div>
        <div style={{ paddingLeft: 24 }}>return false;</div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div style={{ paddingLeft: 12 }}>if (!age || age &lt; 1 || age &gt; 120) {"{"}</div>
        <div style={{ paddingLeft: 24 }}>setError("Please enter a valid age between 1 and 120.");</div>
        <div style={{ paddingLeft: 24 }}>return false;</div>
        <div style={{ paddingLeft: 12 }}>{"}"}</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>return true; {"// all good"}</div>
        <div>{"};"}</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 The first required field is the member's name. What variable holds it?
      </div>
      {wrong && !blankCorrect && (
        <Callout icon="🚫" variant="danger" shake>
          Validate the name field first — <code>if (!name.trim())</code> checks if name is empty or just spaces.
        </Callout>
      )}

      {blankCorrect && (
        <div className="hk-slide-in">
          <CodeBlock style={{ marginBottom: 10 }}>
            <div>const handleAdd = async (e) =&gt; {"{"}</div>
            <div style={{ paddingLeft: 12 }}>e.preventDefault();</div>
            <div style={{ paddingLeft: 12, color: "#94A3B8" }}>setError(null); {"// clear previous error"}</div>
            <div style={{ marginTop: 6, paddingLeft: 12 }}>if (!validate()) return; <span style={{ color: "#94A3B8" }}>{"// stop here if invalid"}</span></div>
            <div style={{ paddingLeft: 12, color: "#94A3B8", marginTop: 6 }}>{"// ...fetch continues only if valid"}</div>
            <div>{"};"}</div>
          </CodeBlock>

          <Callout icon="✂️" title=".trim() explained" variant="tip">
            <code>name.trim()</code> removes leading and trailing spaces.
            <br /><br />
            <code>'   '</code> → <code>''</code> → empty ← caught ✅ &nbsp;&nbsp; <code>' Ravi '</code> → <code>'Ravi'</code> → valid ✅
            <br /><br />
            Without <code>trim()</code>, <code>'   '</code> passes the <code>!name</code> check because it is not technically empty. <code>trim()</code> catches spaces-only input.
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            ✅ Validation added to add form
          </label>
          {checked && <div style={{ marginTop: 12 }}><RunButton onClick={() => { playSound("tick"); onNext(); }}>Handle empty state →</RunButton></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════
const DOMAIN_EMPTY = {
  gym: "No members yet. Add your first member.",
  hotel: "No rooms listed. Add your first room.",
  mess: "No meals scheduled. Add today's menu.",
  chai: "No orders yet. Waiting for orders.",
};

function Slot4({ onNext, playSound, done, setDone }) {
  const [blankValue, setBlankValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const blankCorrect = blankValue.trim() === "length";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (blankCorrect && !done) { playSound("add"); setDone(true); }
    else if (blankValue && !blankCorrect) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankCorrect]);

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>📭 No data yet — say so kindly</div>

      <Callout icon="❓" title="Zero members in the database" variant="info">
        What does the gym owner see? <code>[]</code> — an empty list. No message. Looks broken.
        <br /><br />
        Is the app working? Did something go wrong? <strong>The owner does not know.</strong>
      </Callout>

      <BlankCard correct={blankCorrect} wrong={wrong && !blankCorrect}>
        <div>if (members.<Blank value={blankValue} onChange={v => { setBlankValue(v); setWrong(false); }} correct={blankCorrect} placeholder="length" width={7} /> === 0) {"{"}</div>
        <div style={{ paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="empty-state"&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;h3&gt;No members yet&lt;/h3&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;Add your first member to get started.&lt;/p&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={"{goToAdd}"}&gt;Add First Member →&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"}"}</div>
        <div style={{ marginTop: 4, color: "#94A3B8" }}>{"// else — members exist:"}</div>
        <div>return &lt;div&gt;{"{members.map(...)}"}&lt;/div&gt;;</div>
      </BlankCard>
      <div style={{ fontSize: 14.5, color: "#374151", marginTop: 8, marginBottom: 4 }}>
        💡 Which array property gives the count of items? <span style={{ color: "#94A3B8" }}>(hint: members.length === 0 means the array is empty)</span>
      </div>
      {wrong && !blankCorrect && (
        <Callout icon="🚫" variant="danger" shake>
          <code>members.length</code> returns the count of members. <code>0</code> means the list is empty.
        </Callout>
      )}

      {blankCorrect && (
        <div className="hk-slide-in">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ flex: "1 1 220px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#16A34A", marginBottom: 6 }}>✅ A GOOD EMPTY STATE</div>
              <div style={{ fontSize: 13.5, color: "#166534", lineHeight: 1.7 }}>Tells user there is no data. Explains it is normal, not broken. Gives a next action.</div>
            </div>
            <div style={{ flex: "1 1 220px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#DC2626", marginBottom: 6 }}>❌ A BAD EMPTY STATE</div>
              <div style={{ fontSize: 13.5, color: "#7F1D1D", lineHeight: 1.7 }}>Just shows an empty list. No message. User thinks app is broken.</div>
            </div>
          </div>

          <Callout icon="🌐" title="Domain-specific empty states" variant="tip">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13.5 }}>
              <div>🏋️ GYM — "{DOMAIN_EMPTY.gym}"</div>
              <div>🏨 HOTEL — "{DOMAIN_EMPTY.hotel}"</div>
              <div>🍱 MESS — "{DOMAIN_EMPTY.mess}"</div>
              <div>☕ CHAI — "{DOMAIN_EMPTY.chai}"</div>
            </div>
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={() => { if (!checked) { playSound("add"); setChecked(true); } }} />
            ✅ Empty state added to members list
          </label>
          {checked && <div style={{ marginTop: 12 }}><RunButton onClick={() => { playSound("tick"); onNext(); }}>Build the error card →</RunButton></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — ERROR CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const CHECKLIST_GROUPS = [
  { key: "list", title: "MembersList", items: ["catch block + getErrorMessage", "Empty state when 0 members"] },
  { key: "login", title: "LoginScreen", items: ["401 handled + friendly message", "Network error handled"] },
  { key: "add", title: "AddMemberForm", items: ["Validation before fetch", "catch block + friendly message"] },
  { key: "detail", title: "MemberDetail", items: ["404 on view (member deleted)", "401 on update/delete", "ErrorCard shown on errors"] },
];

function Slot5({ onDone, playSound, done, setDone }) {
  const [checks, setChecks] = useState({});
  const allChecked = CHECKLIST_GROUPS.every(g => g.items.every((_, i) => checks[`${g.key}-${i}`]));

  useEffect(() => {
    if (allChecked && !done) { playSound("correct"); setDone(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const toggle = (k) => setChecks(c => ({ ...c, [k]: !c[k] }));

  return (
    <div style={{ marginBottom: 24, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>🗂️ One consistent error card — everywhere</div>

      <Callout icon="🎨" title="Consistency" variant="info">
        Right now your errors might look different everywhere. A consistent error card: same look, same feel. User always knows it is an error.
      </Callout>

      <CodeBlock style={{ marginBottom: 10 }}>
        <div>{"// Reusable error card:"}</div>
        <div>const ErrorCard = ({"{"} message, onDismiss {"}"}) =&gt; {"{"}</div>
        <div style={{ paddingLeft: 12, color: "#94A3B8" }}>if (!message) return null; {"// show nothing if no error"}</div>
        <div style={{ marginTop: 6, paddingLeft: 12 }}>return (</div>
        <div style={{ paddingLeft: 24 }}>&lt;div className="error-card"&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;span&gt;⚠️&lt;/span&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;p&gt;{"{message}"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 36 }}>&lt;button onClick={"{onDismiss}"}&gt;✕&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;/div&gt;</div>
        <div style={{ paddingLeft: 12 }}>);</div>
        <div>{"};"}</div>
      </CodeBlock>

      <CodeBlock style={{ marginBottom: 10, fontSize: 13 }}>
        <div>.error-card {"{"}</div>
        <div style={{ paddingLeft: 12 }}>background: #FEF2F2;</div>
        <div style={{ paddingLeft: 12 }}>border: 1px solid #FECACA;</div>
        <div style={{ paddingLeft: 12 }}>border-radius: 8px;</div>
        <div style={{ paddingLeft: 12 }}>padding: 12px 16px;</div>
        <div style={{ paddingLeft: 12 }}>color: #991B1B;</div>
        <div style={{ paddingLeft: 12 }}>display: flex; align-items: center; gap: 12px;</div>
        <div style={{ paddingLeft: 12 }}>margin: 8px 0;</div>
        <div>{"}"}</div>
      </CodeBlock>

      <Callout icon="📌" variant="tip">
        <code>{'<ErrorCard message={error} onDismiss={() => setError(null)} />'}</code>
        <br /><br />
        Place this wherever you have an error state. Same card. Same look. Every screen.
      </Callout>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Complete error handling checklist — go through each component:</div>
        {CHECKLIST_GROUPS.map(g => (
          <div key={g.key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>{g.title}</div>
            {g.items.map((label, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 4 }}>
                <input type="checkbox" checked={!!checks[`${g.key}-${i}`]} onChange={() => toggle(`${g.key}-${i}`)} />
                {label}
              </label>
            ))}
          </div>
        ))}
      </div>

      {allChecked && (
        <div className="hk-slide-in">
          <RunButton onClick={() => { playSound("tick"); onDone(); }}>Finish Phase 1 →</RunButton>
        </div>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🩺 Good error message", "what happened + what to do next — never raw technical codes"],
    ["🧩 getErrorMessage(status)", "friendly message per HTTP code"],
    ["🔑 401 → onLogout()", "clears token, login screen appears"],
    ["✅ validate() before fetch", "catch obvious errors instantly — save a network round trip"],
    ["📭 members.length === 0", "show empty state with a next action"],
    ["🗂️ ErrorCard component", "one consistent error look — reused across the entire app"],
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
        Your app handles errors kindly.<br /><br />
        The gym owner always knows what happened and what to do.<br /><br />
        Next — 4.3.3.<br />
        Show your app to a real person. Deploy v2. React + Spring Boot. Running. Connected. Live.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const PHASE2_GROUPS = [
  { key: "list", title: "COMPONENT 1 — Your data list", items: ["catch block with friendly message", "getErrorMessage(status) added", "401 calls onLogout", "Empty state when 0 items"] },
  { key: "form", title: "COMPONENT 2 — Add form", items: ["validate() function", "At least 2 field validations", "catch block + friendly message", "Error cleared on new submit"] },
  { key: "detail", title: "COMPONENT 3 — Detail screen", items: ["404 handled — \"item not found\"", "401 handled — logs out", "catch block on edit/delete"] },
  { key: "card", title: "COMPONENT 4 — Error card", items: ["ErrorCard component created", "Used in at least 2 components", "Consistent look everywhere"] },
];

function Phase2Left({ tasks, setTasks, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const allTasksDone = PHASE2_GROUPS.every(g => g.items.every((_, i) => !!tasks[g.key]?.[i]));

  const toggleTask = (group, i) => {
    setTasks(t => ({ ...t, [group]: { ...t[group], [i]: !t[group]?.[i] } }));
    playSound("tick");
  };

  return (
    <div>
      <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>⚠️ Add error handling to YOUR entire app</div>
      <div style={{ color: "#64748B", fontSize: 15, marginBottom: 16 }}>Go through each component in your own project, then check off each task below.</div>

      {!submitted && (
        <>
          {PHASE2_GROUPS.map(g => (
            <div key={g.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#64748B", marginBottom: 6 }}>{g.title}</div>
              {g.items.map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, cursor: "pointer", marginBottom: 4 }}>
                  <input type="checkbox" checked={!!tasks[g.key]?.[i]} onChange={() => toggleTask(g.key, i)} />{label}
                </label>
              ))}
            </div>
          ))}

          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>Commit:</div>
          <CodeBlock style={{ fontSize: 13, marginBottom: 16 }}>
            <div>git add .</div>
            <div>git commit -m "add error handling — friendly messages everywhere"</div>
            <div>git push origin main</div>
          </CodeBlock>

          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8 }}>
              In one sentence — what should every error message tell the user?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="Every error message should tell the user what went wrong in plain language and what they should do next — not show raw technical error codes that only developers understand..."
              style={{ width: "100%", minHeight: 90, padding: 12, borderRadius: 10, border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 15, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
            />
            <div style={{ fontSize: 13.5, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4, marginBottom: 14 }}>
              {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
            </div>
          </div>

          <RunButton onClick={onSubmit} disabled={!allTasksDone || !reflectionOk}>Errors handled kindly — show to real person next →</RunButton>
          {!allTasksDone && <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>Check off every task above first.</div>}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{ background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 12, textAlign: "center" }}>⚠️✅ Error handling complete.</div>
          <div style={{ fontSize: 15, color: "#065F46", lineHeight: 1.9, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ Friendly messages for every error<br />
            ✅ 401 logs user out automatically<br />
            ✅ Form validation before fetch<br />
            ✅ Empty state with next action<br />
            ✅ Consistent error card everywhere<br /><br />
            Next — 4.3.3.<br />
            Your app is ready. Show it to someone real. Watch them use it without your help. That is the real test.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT SIDE — THE SIMULATOR (shared, drives each slot's live preview)
// ═══════════════════════════════════════════════════════════════════════════
function DoctorErrorStage({ mode, setMode, playSound }) {
  const good = mode === "good";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", background: "#E2E8F0", borderRadius: 999, padding: 4 }}>
        <button onClick={() => { setMode("bad"); playSound("tick"); }} className="hk-btn" style={{
          padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13,
          background: !good ? "#1E293B" : "transparent", color: !good ? "#fff" : "#64748B"
        }}>😰 Bad</button>
        <button onClick={() => { setMode("good"); playSound("tick"); }} className="hk-btn" style={{
          padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13,
          background: good ? "#16A34A" : "transparent", color: good ? "#fff" : "#64748B"
        }}>😊 Good</button>
      </div>
      <DoctorCard key={"d" + mode} good={good} />
      <div style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8" }}>↓ SAME PATTERN ↓</div>
      <ErrorCompareCard key={"e" + mode} good={good} />
    </div>
  );
}

function StatusStack({ statusStep, activeStatus, setActiveStatus, playSound }) {
  const visible = STATUS_ORDER.slice(0, Math.min(statusStep + 1, STATUS_ORDER.length));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 340 }}>
      {visible.map(code => {
        const info = STATUS_INFO[code];
        const active = code === activeStatus;
        return (
          <div key={code} onClick={() => { setActiveStatus(code); playSound("tick"); }} className="hk-pop hk-btn" style={{
            cursor: "pointer", background: info.bg, border: `2px solid ${active ? info.color : info.border}`,
            borderRadius: 10, padding: "10px 14px", boxShadow: active ? `0 0 0 3px ${info.color}33` : "none", transition: "all 0.2s ease"
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: info.color, marginBottom: 3 }}>{info.label}</div>
            <div style={{ fontSize: 13, color: "#1E293B" }}>{info.good}</div>
          </div>
        );
      })}
      <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4 }}>User sees friendly. Not raw code.</div>
    </div>
  );
}

function ValidationDemo({ playSound }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    const msg = validateMember(name, Number(age));
    if (msg) { setError(msg); playSound("warn"); return; }
    setError(null);
    setRequestCount(c => c + 1);
    playSound("correct");
  };

  return (
    <div style={{ width: "100%", maxWidth: 300 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginBottom: 10 }}>ADD MEMBER — live validation</div>
      <div className="hk-card" style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(15,23,42,0.08)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>NAME</div>
        <input value={name} onChange={e => { setName(e.target.value); if (submitted) setError(validateMember(e.target.value, Number(age))); }}
          placeholder="e.g. Ravi"
          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>AGE</div>
        <input value={age} onChange={e => { setAge(e.target.value); if (submitted) setError(validateMember(name, Number(e.target.value))); }}
          placeholder="e.g. 24" type="number"
          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
        {error && <ErrorCard message={error} onDismiss={() => setError(null)} />}
        {!error && submitted && <Callout icon="✅" variant="success" style={{ marginBottom: 10, padding: "10px 14px" }}>Valid — request sent (no network call needed to catch this).</Callout>}
        <RunButton onClick={submit} variant={error ? "danger" : "success"}>Submit →</RunButton>
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 10, textAlign: "center" }}>
        Real network requests made: <strong style={{ color: "#1E293B" }}>{requestCount}</strong> — invalid submits never touch the server.
      </div>
    </div>
  );
}

function EmptyStateDemo({ playSound }) {
  const [members, setMembers] = useState([
    { id: 1, name: "Suresh", plan: "Premium" },
    { id: 2, name: "Priya", plan: "Basic" },
  ]);
  const empty = members.length === 0;
  const removeAll = () => { setMembers([]); playSound("warn"); };
  const addBack = () => { setMembers([{ id: 1, name: "Suresh", plan: "Premium" }, { id: 2, name: "Priya", plan: "Basic" }]); playSound("add"); };

  return (
    <div style={{ width: "100%", maxWidth: 300 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <RunButton small variant="ghost" onClick={empty ? addBack : removeAll}>{empty ? "↺ Add members back" : "🗑️ Remove all members"}</RunButton>
      </div>
      {empty ? (
        <div className="hk-pop" style={{ background: "#fff", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 26, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1E293B", marginBottom: 4 }}>No members yet</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>Add your first member to get started.</div>
          <RunButton onClick={addBack}>Add First Member →</RunButton>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map(m => (
            <div key={m.id} className="hk-card" style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", boxShadow: "0 3px 10px rgba(15,23,42,0.06)" }}>
              <strong style={{ color: "#1A3C6E" }}>{m.name}</strong> <span style={{ color: "#64748B", fontSize: 13 }}>· {m.plan}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SIM_ACTIONS = [
  { key: "network", label: "📡 Network down", desc: "Cannot connect to server. Check that your Spring Boot app is running on port 8080." },
  { key: "401", label: "🔑 401 expired", desc: "Session expired. Please login again." },
  { key: "empty", label: "📭 Empty list", desc: null },
  { key: "formfail", label: "📝 Empty form submit", desc: "Member name is required." },
];

function FullSimulator({ playSound }) {
  const [active, setActive] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);

  const run = (key) => {
    playSound(key === "401" ? "warn" : "tick");
    setActive(key);
    if (key === "401") setTimeout(() => setLoggedOut(true), 700);
    else setLoggedOut(false);
  };
  const reset = () => { setActive(null); setLoggedOut(false); playSound("tick"); };

  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
        {SIM_ACTIONS.map(a => (
          <button key={a.key} onClick={() => run(a.key)} className="hk-btn" style={{
            padding: "7px 11px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
            border: active === a.key ? "2px solid #7C3AED" : "1px solid #E2E8F0",
            background: active === a.key ? "#F5F3FF" : "#fff", color: active === a.key ? "#5B21B6" : "#1E293B"
          }}>{a.label}</button>
        ))}
      </div>

      {loggedOut ? (
        <div className="hk-wobble-in" style={{ background: "#fff", borderRadius: 14, padding: 24, textAlign: "center", boxShadow: "0 6px 18px rgba(15,23,42,0.08)" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Login screen</div>
          <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 12 }}>onLogout() cleared the token — you're back here automatically.</div>
          <RunButton small onClick={reset}>Reset simulator</RunButton>
        </div>
      ) : active === "empty" ? (
        <div className="hk-pop" style={{ background: "#fff", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>📭</div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>No members yet</div>
          <RunButton small onClick={() => {}}>Add First Member →</RunButton>
        </div>
      ) : active ? (
        <div>
          <ErrorCard message={SIM_ACTIONS.find(a => a.key === active)?.desc} onDismiss={reset} />
          <div style={{ textAlign: "center", marginTop: 8 }}><RunButton small variant="ghost" onClick={reset}>Reset</RunButton></div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ n: "Suresh", p: "Premium" }, { n: "Priya", p: "Basic" }].map(m => (
            <div key={m.n} className="hk-card" style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", boxShadow: "0 3px 10px rgba(15,23,42,0.06)" }}>
              <strong style={{ color: "#1A3C6E" }}>{m.n}</strong> <span style={{ color: "#64748B", fontSize: 13 }}>· {m.p}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 6 }}>Click a scenario above to see it handled.</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ErrorHandlerBuilder() {
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
  const [slot5Done, setSlot5Done] = useState(false);

  // shared state that both left blanks and the right simulator read/drive
  const [doctorMode, setDoctorMode] = useState("bad");
  const [statusStep, setStatusStep] = useState(0);
  const [activeStatus, setActiveStatus] = useState(401);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [tasks, setTasks] = useState({ list: {}, form: {}, detail: {}, card: {} });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m5-t4-s2-error-handler-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 5,
      maxScore: 5,
      answers: {
        phase1: {
          slot1: { goodVsBadQ: "B" },
          slot2: { statusBlank: "status", fiveStatusesUnderstood: true },
          slot3: { nameBlank: "name", validationAdded: true },
          slot4: { lengthBlank: "length", emptyStateAdded: true },
          slot5: { allComponentsChecked: true, errorCardCreated: true },
        },
        phase2: {
          listErrorHandled: true,
          formValidated: true,
          detailErrorHandled: true,
          errorCardUsed: true,
          committedToGitHub: true,
          reflectionText: reflection,
        },
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
          <div style={{ fontSize: 13.5, color: "#C4B5FD", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>⚠️ SUBTOPIC 4.3.2 · HATCHKOD</div>
          <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 6 }}>🩺 Error Handling — Kind Messages, Every Time</div>
          <div style={{ fontSize: 15.5, color: "#DDD6FE" }}>Same problem. One response helps. The other frightens.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={slot1Done} setDone={setSlot1Done} mode={doctorMode} setMode={setDoctorMode} />
              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={slot2Done} setDone={setSlot2Done}
                  statusStep={statusStep} setStatusStep={setStatusStep} activeStatus={activeStatus} setActiveStatus={setActiveStatus} />
              )}
              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound} done={slot3Done} setDone={setSlot3Done} />
              )}
              {slot >= 4 && (
                <Slot4 onNext={() => setSlot(5)} playSound={playSound} done={slot4Done} setDone={setSlot4Done} />
              )}
              {slot >= 5 && !showReveal && (
                <Slot5 onDone={() => setShowReveal(true)} playSound={playSound} done={slot5Done} setDone={setSlot5Done} />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }} className="hk-btn hk-pulse" style={{
                  marginTop: 20, padding: "16px 32px", background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff",
                  border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, display: "block", width: "100%"
                }}>Add error handling to YOUR project →</button>
              )}
            </div>

            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
                {slot === 1 && (
                  <Stage caption="Same situation. Different response.">
                    <DoctorErrorStage mode={doctorMode} setMode={setDoctorMode} playSound={playSound} />
                  </Stage>
                )}
                {slot === 2 && (
                  <Stage caption="Click any card — the helper on the left shows its output">
                    <StatusStack statusStep={statusStep} activeStatus={activeStatus} setActiveStatus={setActiveStatus} playSound={playSound} />
                  </Stage>
                )}
                {slot === 3 && (
                  <Stage caption="Try submitting empty, spaces-only, or a bad age">
                    <ValidationDemo playSound={playSound} />
                  </Stage>
                )}
                {slot === 4 && (
                  <Stage caption="Toggle members on and off — watch the empty state appear">
                    <EmptyStateDemo playSound={playSound} />
                  </Stage>
                )}
                {(slot === 5 || showReveal) && (
                  <Stage caption="Click a scenario — same ErrorCard, every time">
                    <FullSimulator playSound={playSound} />
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
                <Stage caption="Your complete app — every error handled kindly">
                  <FullSimulator playSound={playSound} />
                </Stage>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
