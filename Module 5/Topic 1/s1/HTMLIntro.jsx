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

// ─── LIVE RENDER - srcdoc iframe, no styling beyond a base font ─────────────
function renderHTML(html) {
  return `<html><body style="font-family: system-ui; padding: 16px; margin: 0;">${html}</body></html>`;
}

function LiveRender({ html, label }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🌐</span> LIVE RENDER - ACTUAL HTML
      </div>
      <div style={{
        border: "1px solid #E2E8F0", borderRadius: 12, background: "#fff",
        boxShadow: "0 6px 20px rgba(15,23,42,0.08)", overflow: "hidden"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
          background: "linear-gradient(180deg,#F1F5F9,#E2E8F0)", borderBottom: "1px solid #E2E8F0"
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
          <span style={{
            marginLeft: 10, fontSize: 10, color: "#64748B", background: "#fff",
            border: "1px solid #E2E8F0", borderRadius: 6, padding: "2px 10px", flex: 1
          }}>yourgym.html</span>
        </div>
        <div style={{ minHeight: 260, position: "relative" }}>
          {!html && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", color: "#94A3B8", fontSize: 13, textAlign: "center", padding: 16
            }}>
              👻 (your HTML will appear here)
            </div>
          )}
          {html && (
            <iframe
              srcDoc={renderHTML(html)}
              title="HTML Preview"
              style={{ border: "none", width: "100%", height: 260, background: "#fff" }}
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>
      {label && (
        <div key={label} className="hk-pop" style={{
          marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 800, color: "#065F46", background: "#D1FAE5",
          border: "1px solid #6EE7B7", borderRadius: 999, padding: "6px 14px"
        }}>{label}</div>
      )}
    </div>
  );
}

// ─── CALLOUT - colored icon card used for tips / analogies / feedback ───────
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
      borderRadius: 12, padding: "16px 18px", marginBottom: 14, fontSize: 13, lineHeight: 1.8, color: v.color, ...style
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 11,
          letterSpacing: 0.6, marginBottom: 8, color: v.accent, textTransform: "uppercase"
        }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </div>
      )}
      {!title && icon && (
        <span style={{ fontSize: 16, marginRight: 8 }}>{icon}</span>
      )}
      {children}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "First Tag", icon: "📝" },
  { label: "Headings", icon: "📏" },
  { label: "p + button", icon: "🔘" },
  { label: "input + span", icon: "⌨️" },
  { label: "Nesting", icon: "📦" },
  { label: "Member Card", icon: "🪪" },
];
function ProgressBar({ slot }) {
  const pct = Math.max(0, Math.min(100, ((slot - 1) / (STEPS.length - 1)) * 100));
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: 18, left: 18, right: 18, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
        <div style={{
          position: "absolute", top: 18, left: 18, height: 4, borderRadius: 2,
          width: `calc(${pct}% - ${pct === 0 ? 0 : 36 * (pct / 100)}px)`,
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
                  width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 16, fontWeight: 800, zIndex: 1,
                  background: done ? "#10B981" : active ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#F1F5F9",
                  color: done || active ? "#fff" : "#94A3B8",
                  border: active ? "3px solid #DDD6FE" : "3px solid transparent",
                  boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : done ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {done ? "✓" : s.icon}
                </div>
                <div style={{
                  marginTop: 6, fontSize: 10, fontWeight: 700, textAlign: "center",
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

// ─── BLANK INPUT - one blank per slot ───────────────────────────────────────
function BlankTag({ before, blank, value, onChange, correct, placeholder, after, comment, wrong }) {
  return (
    <div className={`hk-card${correct ? " hk-pop" : wrong ? " hk-shake" : ""}`} style={{
      background: "linear-gradient(180deg,#1E293B,#0F172A)", color: "#E2E8F0", borderRadius: 12,
      padding: 18, fontFamily: "monospace", fontSize: 15,
      border: correct ? "2px solid #10B981" : "2px solid #334155",
      boxShadow: correct ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s ease"
    }}>
      <div>
        {"<"}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          size={Math.max(placeholder.length, value.length, 3)}
          style={{
            background: correct ? "#134E4A" : "#1E293B",
            color: correct ? "#4ADE80" : "#F1F5F9",
            border: correct ? "1px dashed #10B981" : "1px dashed #64748B", borderRadius: 5,
            fontFamily: "monospace", fontSize: 15, padding: "2px 6px", outline: "none"
          }}
        />
        {">"}{blank.content}{"</"}
        <span style={{ color: correct ? "#4ADE80" : "#F1F5F9" }}>{correct ? value : ""}</span>
        {">"}
        {correct && <span style={{ marginLeft: 8 }}>✅</span>}
      </div>
      {comment && <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 8 }}>💬 {comment}</div>}
    </div>
  );
}

// ─── TIFFIN BOX SVG ──────────────────────────────────────────────────────────
function TiffinBox({ highlight }) {
  return (
    <div className="hk-wobble-in" style={{ textAlign: "center", filter: "drop-shadow(0 8px 16px rgba(180,83,9,0.25))" }}>
      <svg width="180" height="200" viewBox="0 0 180 200">
        <rect x="20" y="20" width="140" height="160" rx="14"
          fill={highlight === "outer" ? "#FDE68A" : "#FEF3C7"}
          stroke="#B45309" strokeWidth="4" />
        <rect x="34" y="36" width="112" height="36" rx="6"
          fill={highlight === "h2" ? "#FCD34D" : "#FFFBEB"} stroke="#B45309" strokeWidth="2" />
        <text x="90" y="58" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400E">h2</text>
        <rect x="34" y="82" width="112" height="36" rx="6"
          fill={highlight === "p" ? "#FCD34D" : "#FFFBEB"} stroke="#B45309" strokeWidth="2" />
        <text x="90" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400E">p</text>
        <rect x="34" y="128" width="112" height="36" rx="6"
          fill={highlight === "button" ? "#FCD34D" : "#FFFBEB"} stroke="#B45309" strokeWidth="2" />
        <text x="90" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400E">button</text>
        <text x="90" y="14" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">div (outer box)</text>
      </svg>
      <div style={{ fontSize: 11, color: "#92400E", fontWeight: 700 }}>🍱 the tiffin box, mapped to your card</div>
    </div>
  );
}

// ─── SLOT 1 - FIRST TAG ──────────────────────────────────────────────────────
function Slot1({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [firstRenderPlayed, setFirstRenderPlayed] = useState(false);
  const correct = value.trim().toLowerCase() === "h1";

  useEffect(() => {
    if (correct && !done) {
      playSound("add");
      setDone(true);
      if (!firstRenderPlayed) { playSound("tick"); setFirstRenderPlayed(true); }
    } else if (value && !correct) {
      setWrong(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📝 Your first HTML tag</div>

      <Callout icon="☕" title="From Java to HTML" variant="info">
        You have been writing Java for weeks.<br /><br />
        HTML is different.<br />
        No types. No semicolons after tags.<br />
        No public or private.<br /><br />
        You just describe what is on the page.<br /><br />
        Heading? Write the heading tag.<br />
        Button? Write the button tag.<br />
        Box? Write the box tag.<br /><br />
        <strong>That is it.</strong>
      </Callout>

      <Callout icon="🍱" title="The Tiffin Box Analogy" variant="tip">
        HTML is like a steel tiffin box.<br /><br />
        Each compartment holds one thing.<br />
        The outer box holds everything.<br /><br />
        Tags are the compartments.<br />
        They describe what is inside.
      </Callout>

      <BlankTag
        blank={{ content: "Welcome to SaiFit Gym" }}
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        placeholder="h1"
        comment="opening tag ... closing tag - what makes a big heading?"
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 The tag for the biggest heading is <strong>h1</strong>. Heading Level 1. Type it:
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The tag is h1 - Heading Level 1. Try: &lt;h1&gt;Welcome to SaiFit Gym&lt;/h1&gt;
        </Callout>
      )}

      {correct && (
        <div style={{ marginTop: 16, animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 14 }}>
            <span style={{ color: "#60A5FA" }}>&lt;h1&gt;</span> Welcome to SaiFit Gym <span style={{ color: "#60A5FA" }}>&lt;/h1&gt;</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginTop: 4, padding: "0 4px" }}>
            <span>↑ opens</span><span>content</span><span>closes (note the /) ↑</span>
          </div>
          <Callout icon="⚠️" variant="tip" style={{ marginTop: 10 }}>
            The / in the closing tag is important. Without it - HTML does not know where the heading ends.
          </Callout>
          <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
            style={{ marginTop: 4, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
            Add more headings →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 2 - HEADINGS ───────────────────────────────────────────────────────
function Slot2({ onNext, playSound, done, setDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim().toLowerCase() === "h2";

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📏 Headings - three sizes</div>

      <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 14, marginBottom: 12 }}>
        <div><span style={{ color: "#60A5FA" }}>&lt;h1&gt;</span>Welcome to SaiFit Gym<span style={{ color: "#60A5FA" }}>&lt;/h1&gt;</span></div>
      </div>

      <BlankTag
        blank={{ content: "Member Details" }}
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        placeholder="h2"
        comment="smaller than h1 - heading level 2"
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 h1 is the biggest. The next size down is <strong>h2</strong>. Heading Level 2. Type it:
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The next heading down is h2.
        </Callout>
      )}

      {correct && (
        <div style={{ marginTop: 16, animation: "slideIn 0.4s ease" }}>
          <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <div style={{ fontSize: 22 }}><span style={{ color: "#60A5FA" }}>&lt;h1&gt;</span>Biggest heading<span style={{ color: "#60A5FA" }}>&lt;/h1&gt;</span></div>
            <div style={{ fontSize: 17 }}><span style={{ color: "#60A5FA" }}>&lt;h2&gt;</span>Slightly smaller<span style={{ color: "#60A5FA" }}>&lt;/h2&gt;</span></div>
            <div style={{ fontSize: 14 }}><span style={{ color: "#60A5FA" }}>&lt;h3&gt;</span>Smaller again<span style={{ color: "#60A5FA" }}>&lt;/h3&gt;</span></div>
          </div>
          <Callout icon="📐" variant="neutral" style={{ marginTop: 10 }}>
            h1 = most important heading.<br />
            h2 = section heading.<br />
            h3 = sub-section.<br /><br />
            Use h1 once per page. Use h2 and h3 as needed.
          </Callout>
          <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
            style={{ marginTop: 4, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
            Add text and buttons →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 3 - p AND button ───────────────────────────────────────────────────
function Slot3({ onNext, playSound, pDone, setPDone, buttonDone, setButtonDone }) {
  const [pValue, setPValue] = useState("");
  const [pWrong, setPWrong] = useState(false);
  const pCorrect = pValue.trim().toLowerCase() === "p";

  const [bValue, setBValue] = useState("");
  const [bWrong, setBWrong] = useState(false);
  const bCorrect = bValue.trim().toLowerCase() === "button";

  useEffect(() => {
    if (pCorrect && !pDone) { playSound("add"); setPDone(true); }
    else if (pValue && !pCorrect) setPWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pCorrect]);

  useEffect(() => {
    if (bCorrect && !buttonDone) { playSound("add"); setButtonDone(true); }
    else if (bValue && !bCorrect) setBWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bCorrect]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🔘 Text and buttons</div>

      <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, marginBottom: 12, lineHeight: 2 }}>
        <div><span style={{ color: "#60A5FA" }}>&lt;h1&gt;</span>Welcome to SaiFit Gym<span style={{ color: "#60A5FA" }}>&lt;/h1&gt;</span></div>
        <div><span style={{ color: "#60A5FA" }}>&lt;h2&gt;</span>Member Details<span style={{ color: "#60A5FA" }}>&lt;/h2&gt;</span></div>
      </div>

      <BlankTag
        blank={{ content: "Name: Ravi Kumar" }}
        value={pValue}
        onChange={v => { setPValue(v); setPWrong(false); }}
        correct={pCorrect}
        wrong={pWrong && !pCorrect}
        placeholder="p"
        comment="paragraph - a block of text"
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 <strong>p</strong> stands for paragraph. It wraps a block of text. Type it:
      </div>
      {pWrong && !pCorrect && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The tag is p - paragraph.
        </Callout>
      )}

      {pCorrect && (
        <Callout icon="📄" variant="neutral" style={{ marginTop: 14, animation: "slideIn 0.4s ease" }}>
          p is a block of text. It sits on its own line. A new paragraph below the heading.<br /><br />
          You will use p everywhere - member details, plan info, any text on your app.
        </Callout>
      )}

      {pCorrect && (
        <div style={{ marginTop: 20, animation: "slideIn 0.4s ease" }}>
          <BlankTag
            blank={{ content: "Edit Member" }}
            value={bValue}
            onChange={v => { setBValue(v); setBWrong(false); }}
            correct={bCorrect}
            wrong={bWrong && !bCorrect}
            placeholder="button"
            comment="clickable button"
          />
          <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
            💡 What tag makes something you can click?
          </div>
          {bWrong && !bCorrect && (
            <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
              The tag is button.
            </Callout>
          )}
          {bCorrect && (
            <Callout icon="👀" variant="tip" style={{ marginTop: 10 }}>
              Notice - the button looks plain. No colour. No style. That is the skeleton. 4.0.2 gives it colour and shape.
            </Callout>
          )}
        </div>
      )}

      {pCorrect && bCorrect && (
        <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
          style={{ marginTop: 4, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
          Add input and span →
        </button>
      )}
    </div>
  );
}

// ─── SLOT 4 - input AND span ─────────────────────────────────────────────────
function Slot4({ onNext, playSound, inputDone, setInputDone, spanDone, setSpanDone }) {
  const [choice, setChoice] = useState(null);

  const choose = (opt) => {
    setChoice(opt);
    if (opt === "B") { playSound("correct"); setInputDone(true); }
    else playSound("warn");
  };

  const ackSpan = () => {
    if (!spanDone) { playSound("tick"); setSpanDone(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>⌨️ Text field and inline text</div>

      <Callout icon="📱" title="What is input?" variant="info">
        input is a text field. Where the user types something.<br /><br />
        Like the search box on Swiggy. Like the UPI PIN field on PhonePe.<br /><br />
        Every form in your gym app has inputs.
      </Callout>

      <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 14, marginBottom: 14 }}>
        <span style={{ color: "#60A5FA" }}>&lt;input /&gt;</span>
        <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 6 }}>
          💬 self-closing - note the / ... no closing tag needed ... input has no content inside
        </div>
      </div>

      <Callout icon="🔒" title="Self-closing, explained" variant="tip">
        Most tags have content inside: &lt;h1&gt;Some text&lt;/h1&gt;<br /><br />
        input has no content - the user types INTO it. So it closes itself: &lt;input /&gt;<br /><br />
        The / at the end means "I close myself here."
      </Callout>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🤔 Which is correct for an input?</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <button onClick={() => choose("A")} className="hk-btn"
          style={{
            padding: "12px 18px", borderRadius: 10, fontFamily: "monospace", fontSize: 14,
            border: choice === "A" ? "2px solid #DC2626" : "2px solid #E2E8F0",
            background: choice === "A" ? "#FEF2F2" : "#fff",
            animation: choice === "A" ? "shakeX 0.4s ease" : "none"
          }}>
          &lt;input&gt;&lt;/input&gt;
        </button>
        <button onClick={() => choose("B")} className="hk-btn"
          style={{
            padding: "12px 18px", borderRadius: 10, fontFamily: "monospace", fontSize: 14,
            border: choice === "B" ? "2px solid #059669" : "2px solid #E2E8F0",
            background: choice === "B" ? "#ECFDF5" : "#fff",
            animation: choice === "B" ? "popIn 0.35s ease" : "none"
          }}>
          &lt;input /&gt; {choice === "B" && "✅"}
        </button>
      </div>
      {choice === "A" && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 4 }}>
          input is self-closing. Write it as &lt;input /&gt;
        </Callout>
      )}

      {inputDone && (
        <div style={{ marginTop: 24, animation: "slideIn 0.4s ease" }}>
          <Callout icon="🏷️" title="What is span?" variant="info">
            span wraps a small piece of inline text.<br /><br />
            Unlike p which takes a full line - span sits INSIDE a line of text.<br /><br />
            Used for badges, labels, highlighted words.
          </Callout>

          <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, marginBottom: 12, lineHeight: 2 }}>
            <div><span style={{ color: "#60A5FA" }}>&lt;span&gt;</span>Active<span style={{ color: "#60A5FA" }}>&lt;/span&gt;</span></div>
            <div><span style={{ color: "#60A5FA" }}>&lt;span&gt;</span>Basic Plan<span style={{ color: "#60A5FA" }}>&lt;/span&gt;</span></div>
          </div>
          <div style={{ fontSize: 13, color: "#374151", marginBottom: 14 }}>
            These sit inline - on the same line as other elements. p sits on its own line. span shares a line.
          </div>

          <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>📊 p vs span</div>
            <div>This is a paragraph - takes its own full line</div>
            <div style={{ marginTop: 6 }}>This text has a <span style={{ background: "#FDE68A", padding: "1px 4px", borderRadius: 3 }}>highlighted word</span> inside it.</div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={spanDone} onChange={ackSpan} />
            I understand p vs span
          </label>
        </div>
      )}

      {inputDone && spanDone && (
        <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
          style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
          Now put it all together →
        </button>
      )}
    </div>
  );
}

// ─── SLOT 5 - NESTING ────────────────────────────────────────────────────────
function Slot5({ onNext, playSound, done, setDone, hoverPart, setHoverPart }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim().toLowerCase() === "div";
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (correct && !done) { playSound("add"); setDone(true); }
    else if (value && !correct) setWrong(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const ack = () => {
    if (!understood) { playSound("correct"); setUnderstood(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>📦 Nesting - boxes inside boxes</div>

      <div className={`hk-card${correct ? " hk-pop" : wrong ? " hk-shake" : ""}`} style={{
        background: "linear-gradient(180deg,#1E293B,#0F172A)", color: "#E2E8F0", borderRadius: 12, padding: 18, fontFamily: "monospace", fontSize: 14,
        border: correct ? "2px solid #10B981" : "2px solid #334155", boxShadow: correct ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s ease"
      }}>
        <div>
          {"<"}
          <input
            value={value}
            onChange={e => { setValue(e.target.value); setWrong(false); }}
            placeholder="div"
            size={4}
            style={{
              background: correct ? "#134E4A" : "#1E293B",
              color: correct ? "#4ADE80" : "#F1F5F9",
              border: correct ? "1px dashed #10B981" : "1px dashed #64748B", borderRadius: 5,
              fontFamily: "monospace", fontSize: 14, padding: "2px 6px", outline: "none"
            }}
          />
          {">"}
        </div>
        <div style={{ color: "#94A3B8", fontSize: 12, marginLeft: 8 }}>💬 the outer box tag</div>
        <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>&lt;h2&gt;</span>Ravi Kumar<span style={{ color: "#60A5FA" }}>&lt;/h2&gt;</span></div>
        <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>&lt;p&gt;</span>Basic Plan<span style={{ color: "#60A5FA" }}>&lt;/p&gt;</span></div>
        <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>&lt;button&gt;</span>Edit<span style={{ color: "#60A5FA" }}>&lt;/button&gt;</span></div>
        <div>{"</"}<span style={{ color: correct ? "#4ADE80" : "#F1F5F9" }}>{correct ? value : ""}</span>{">"}{correct && <span style={{ marginLeft: 8 }}>✅</span>}</div>
      </div>
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 The most common outer box in HTML is called <strong>div</strong>. Short for "division." Type it:
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The outer box tag is div - short for division.
        </Callout>
      )}

      {correct && (
        <div style={{ marginTop: 20, animation: "slideIn 0.4s ease" }}>
          <Callout icon="👉" title="Indentation, explained" variant="tip">
            Notice the spaces before the inner tags:
            <div className="hk-card" style={{ fontFamily: "monospace", background: "#1E293B", color: "#E2E8F0", borderRadius: 6, padding: 10, marginTop: 8 }}>
              <div>&lt;div&gt;</div>
              <div style={{ paddingLeft: 24 }}>&lt;h2&gt;Ravi Kumar&lt;/h2&gt;</div>
              <div style={{ paddingLeft: 24 }}>&lt;p&gt;Basic Plan&lt;/p&gt;</div>
              <div>&lt;/div&gt;</div>
            </div>
            <div style={{ marginTop: 8 }}>
              Those spaces (indentation) show what is inside what.<br /><br />
              HTML does not require them. But every developer uses them. Without them - nested HTML is impossible to read.<br /><br />
              <strong>Rule: add 2 spaces for each level of nesting.</strong>
            </div>
          </Callout>

          <div className="hk-card" style={{ marginTop: 14, background: "#1E293B", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <div style={{ borderLeft: "3px solid #60A5FA", paddingLeft: 8, color: "#E2E8F0" }}>&lt;div&gt; <span style={{ color: "#6B7280" }}>← level 1</span></div>
            <div style={{ borderLeft: "3px solid #4ADE80", paddingLeft: 8, marginLeft: 16, color: "#E2E8F0" }}>&lt;div&gt; <span style={{ color: "#6B7280" }}>← level 2</span></div>
            <div style={{ borderLeft: "3px solid #fff", paddingLeft: 8, marginLeft: 32, color: "#E2E8F0" }}>&lt;h2&gt;Ravi&lt;/h2&gt; <span style={{ color: "#6B7280" }}>← level 3</span></div>
            <div style={{ borderLeft: "3px solid #4ADE80", paddingLeft: 8, marginLeft: 16, color: "#E2E8F0" }}>&lt;/div&gt;</div>
            <div style={{ borderLeft: "3px solid #60A5FA", paddingLeft: 8, color: "#E2E8F0" }}>&lt;/div&gt;</div>
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
            🔁 div inside div - common in React. Each level indented 2 more spaces.
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={understood} onChange={ack} />
            I understand nesting and indentation
          </label>

          {understood && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Build the member card →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SLOT 6 - COMPLETE MEMBER CARD ───────────────────────────────────────────
function Slot6({ onDone, playSound, name, setName, plan, setPlan, status, setStatus, cardDone, setCardDone }) {
  const ack = () => {
    if (!cardDone) { playSound("correct"); setCardDone(true); playSound("correct"); onDone(); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>🪪 Build YOUR member card in HTML</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>
        Combine everything you learned. One complete member card. No styling yet - intentionally. Just the skeleton.
      </div>

      <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>✍️ Fill in your member details:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }} />
          <input value={plan} onChange={e => setPlan(e.target.value)} placeholder="e.g. Basic Plan"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }} />
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="hk-card" style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div>&lt;div&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;h2&gt;{name || "[their name]"}&lt;/h2&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;p&gt;Plan: {plan || "[their plan]"}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;p&gt;Status: {status}&lt;/p&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;button&gt;Edit Member&lt;/button&gt;</div>
        <div style={{ paddingLeft: 24 }}>&lt;input /&gt;</div>
        <div>&lt;/div&gt;</div>
      </div>

      <Callout icon="🦴" title="Ugly is OK" variant="success" style={{ marginTop: 16 }}>
        Your card looks plain. No colour. No spacing. Text just stacked on top of each other.<br /><br />
        <strong>This is correct.</strong><br /><br />
        This is the skeleton. The bones of your gym app.<br /><br />
        4.0.2 adds the clothes. Colours. Spacing. Rounded corners.<br /><br />
        But you cannot have clothes without a skeleton first.
      </Callout>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: (!name || !plan) ? "not-allowed" : "pointer", opacity: (!name || !plan) ? 0.5 : 1 }}>
        <input type="checkbox" checked={cardDone} onChange={ack} disabled={!name || !plan} />
        My member card has all the right tags
      </label>
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🧱 HTML", "describes structure - tags define what each element is"],
    ["📏 h1 / h2 / h3", "headings - three sizes, h1 biggest"],
    ["📄 p", "paragraph - sits on its own line"],
    ["🔘 button", "clickable element"],
    ["⌨️ input", "self-closing text field - user types into it"],
    ["🏷️ span", "inline text wrapper - shares a line with other elements"],
    ["📦 div", "the outer box - groups elements together"],
    ["🔁 nesting", "elements inside elements - indent 2 spaces per level"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => {
      setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 350);
    });
    setTimeout(() => { onDone(); }, 400 + items.length * 350 + 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="hk-wobble-in" style={{
      background: "linear-gradient(180deg,#FFFBEB,#FEF3C7)", border: "2px solid #F59E0B", borderRadius: 16,
      padding: 28, marginTop: 8, boxShadow: "0 10px 30px rgba(245,158,11,0.25)"
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#92400E", marginBottom: 20, textAlign: "center" }}>🎉 Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} className={ticked.includes(i) ? "hk-pop" : ""} style={{
          display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12,
          opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s"
        }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✅" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" → "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{
        marginTop: 20, textAlign: "center", color: "#78350F", fontSize: 15, lineHeight: 1.9, fontWeight: 700,
        background: "#fff", borderRadius: 12, padding: 18, border: "1px dashed #F59E0B"
      }}>
        🏆 You just wrote real HTML.<br /><br />
        The skeleton of your gym app.<br /><br />
        Next - 4.0.2.<br />
        CSS gives it colour and style.<br />
        The skeleton gets its clothes. 👕
      </div>
    </div>
  );
}

// ─── PHASE 2 - DOMAIN STARTERS ────────────────────────────────────────────────
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", starter:
`<div>
  <h2>Member Name</h2>
  <p>Plan: Basic</p>
  <p>Status: Active</p>
  <button>Edit Member</button>
  <input />
</div>` },
  hotel: { icon: "🏨", label: "Hotel", starter:
`<div>
  <h2>Room 101</h2>
  <p>Type: Standard</p>
  <p>Status: Available</p>
  <button>Book Room</button>
  <input />
</div>` },
  mess: { icon: "🍱", label: "Mess", starter:
`<div>
  <h2>Monday Lunch</h2>
  <p>Menu: Dal Rice Sambar</p>
  <p>Status: Serving</p>
  <button>Mark Attendance</button>
  <input />
</div>` },
  chai: { icon: "☕", label: "Chai", starter:
`<div>
  <h2>Order #42</h2>
  <p>Items: 2x Cutting Chai</p>
  <p>Status: Pending</p>
  <button>Mark Ready</button>
  <input />
</div>` },
  other: { icon: "🏪", label: "Other", starter:
`<div>
  <h2>Title</h2>
  <p>Detail one</p>
  <p>Status: Active</p>
  <button>Action</button>
  <input />
</div>` },
};

function Phase2Left({ domain, setDomain, code, setCode, reflection, setReflection, onSubmit, submitted, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const [showStretch, setShowStretch] = useState(false);

  const chooseDomain = (key) => {
    setDomain(key);
    setCode(DOMAINS[key].starter);
    playSound("tick");
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🚀 Write HTML for YOUR domain</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, then edit the HTML freely.</div>

      {!submitted && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {Object.entries(DOMAINS).map(([key, d]) => (
              <button key={key} onClick={() => chooseDomain(key)} className="hk-domain-btn"
                style={{
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                  border: domain === key ? "2px solid #7C3AED" : "2px solid #E2E8F0",
                  background: domain === key ? "linear-gradient(135deg,#F5F3FF,#EDE9FE)" : "#fff",
                  color: domain === key ? "#5B21B6" : "#1E293B",
                  boxShadow: domain === key ? "0 4px 14px rgba(124,58,237,0.2)" : "none",
                  transition: "all 0.15s ease"
                }}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onPaste={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 220, background: "#1E293B", color: "#E2E8F0",
              fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
              border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
            }}
          />
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
            Add more tags. Change the text. Try nesting a div inside a div. See what happens.
          </div>

          <div style={{ marginTop: 14 }}>
            <button onClick={() => setShowStretch(s => !s)}
              style={{ background: "none", border: "none", color: "#2563EB", fontSize: 13, cursor: "pointer", padding: 0 }}>
              {showStretch ? "▾" : "▸"} Optional extra - try a table
            </button>
            {showStretch && (
              <div style={{ marginTop: 8, background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12, lineHeight: 1.9 }}>
                <div>&lt;table&gt;</div>
                <div style={{ paddingLeft: 24 }}>&lt;tr&gt;</div>
                <div style={{ paddingLeft: 48 }}>&lt;th&gt;Name&lt;/th&gt;</div>
                <div style={{ paddingLeft: 48 }}>&lt;th&gt;Plan&lt;/th&gt;</div>
                <div style={{ paddingLeft: 24 }}>&lt;/tr&gt;</div>
                <div style={{ paddingLeft: 24 }}>&lt;tr&gt;</div>
                <div style={{ paddingLeft: 48 }}>&lt;td&gt;Ravi&lt;/td&gt;</div>
                <div style={{ paddingLeft: 48 }}>&lt;td&gt;Basic&lt;/td&gt;</div>
                <div style={{ paddingLeft: 24 }}>&lt;/tr&gt;</div>
                <div>&lt;/table&gt;</div>
                <div style={{ color: "#6B7280", marginTop: 8 }}>
                  tr = table row<br />th = table heading<br />td = table data cell
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              In one sentence - what does HTML do, and why does the unstyled version look plain?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="HTML describes the structure of the page using tags like div, h2, p, and button, but it has no colours or spacing because that is CSS's job - which we add in the next subtopic..."
              style={{
                width: "100%", minHeight: 90, padding: 12, borderRadius: 10,
                border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 14,
                resize: "vertical", boxSizing: "border-box", outline: "none"
              }}
            />
            <div style={{ fontSize: 12, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4 }}>
              {words} words {reflectionOk ? "✓" : "(minimum 1 sentence)"}
            </div>
          </div>

          <button onClick={onSubmit} disabled={!domain || !reflectionOk} className="hk-btn"
            style={{
              marginTop: 16, padding: "14px 32px",
              background: (domain && reflectionOk) ? "linear-gradient(135deg,#1E293B,#334155)" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: (domain && reflectionOk) ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>HTML is clear - add CSS next →</button>
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{
          background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
          padding: 28, boxShadow: "0 10px 30px rgba(16,185,129,0.2)"
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>🦴 Skeleton built. 🎉</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 2, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ div - outer box<br />
            ✅ h1/h2/h3 - headings<br />
            ✅ p - paragraphs<br />
            ✅ button - clickable<br />
            ✅ input - text field<br />
            ✅ span - inline text<br />
            ✅ Nesting - boxes inside boxes<br /><br />
            Next - 4.0.2.<br />
            CSS gives it colour. Spacing. Rounded corners.<br />
            Your card will look real. 👕
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HTMLIntro() {
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

  const [h1Done, setH1Done] = useState(false);
  const [h2Done, setH2Done] = useState(false);
  const [pDone, setPDone] = useState(false);
  const [buttonDone, setButtonDone] = useState(false);
  const [inputDone, setInputDone] = useState(false);
  const [spanDone, setSpanDone] = useState(false);
  const [divDone, setDivDone] = useState(false);
  const [cardDone, setCardDone] = useState(false);

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("Active");

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m5-t1-s1-html-intro",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { h1Blank: "h1" },
          slot2: { h2Blank: "h2" },
          slot3: { pBlank: "p", buttonBlank: "button" },
          slot4: { inputSelfClosing: "B", spanUnderstood: spanDone },
          slot5: { divBlank: "div", nestingUnderstood: divDone },
          slot6: { memberName: name, memberPlan: plan, memberStatus: status, cardComplete: cardDone }
        },
        phase2: {
          domainSelected: domain,
          htmlWritten: code,
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

  // build the live-render HTML for the right panel, slot by slot
  let liveHtml = "";
  if (phase === 1) {
    if (slot === 1 && h1Done) liveHtml = "<h1>Welcome to SaiFit Gym</h1>";
    if (slot === 2) {
      liveHtml = "<h1>Welcome to SaiFit Gym</h1>";
      if (h2Done) liveHtml += "<h2>Member Details</h2>";
    }
    if (slot === 3) {
      liveHtml = "<h1>Welcome to SaiFit Gym</h1><h2>Member Details</h2>";
      if (pDone) liveHtml += "<p>Name: Ravi Kumar</p>";
      if (buttonDone) liveHtml += "<button>Edit Member</button>";
    }
    if (slot === 4) {
      liveHtml = "<h1>Welcome to SaiFit Gym</h1><h2>Member Details</h2><p>Name: Ravi Kumar</p><button>Edit Member</button>";
      if (inputDone) liveHtml += "<input />";
      if (spanDone) liveHtml += "<p>This text has a <span>highlighted word</span> inside it.</p>";
    }
    if (slot === 5 && divDone) {
      liveHtml = "<div><h2>Ravi Kumar</h2><p>Basic Plan</p><button>Edit</button></div>";
    }
    if (slot >= 6) {
      liveHtml = `<div><h2>${name || "..."}</h2><p>Plan: ${plan || "..."}</p><p>Status: ${status}</p><button>Edit Member</button><input /></div>`;
    }
  } else if (phase === 2) {
    liveHtml = code;
  }

  const renderLabel = (() => {
    if (phase === 1) {
      if (slot === 1 && h1Done) return "First tag rendered ✅";
      if (slot === 2 && h2Done) return "Structure building ✅";
      if (slot === 3 && pDone && buttonDone) return "Structure building ✅";
      if (slot === 4 && inputDone && spanDone) return "Two more tags learned ✅";
      if (slot === 5 && divDone) return "All grouped ✅";
      if (slot >= 6) return "Skeleton complete ✅";
    }
    return "";
  })();

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.94); } 50% { transform:scale(1.02); } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
        @keyframes floatBadge { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        .hk-pop { animation: popIn 0.35s ease; }
        .hk-shake { animation: shakeX 0.4s ease; }
        .hk-wobble-in { animation: wobbleIn 0.6s ease; }
        .hk-pulse { animation: pulseRing 1.8s ease infinite; }
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

      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }}
        className="hk-btn"
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      <div style={{ background: "linear-gradient(135deg,#4C1D95,#1E293B 55%,#0F172A)", color: "#fff", padding: "36px 24px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.35),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>🚀 SUBTOPIC 4.0.1 · HATCHKOD</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>🧱 HTML - The Skeleton</div>
          <div style={{ fontSize: 15, color: "#DDD6FE" }}>Structure only. Zero CSS. This is the skeleton.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} done={h1Done} setDone={setH1Done} />

              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} done={h2Done} setDone={setH2Done} />
              )}

              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound}
                  pDone={pDone} setPDone={setPDone} buttonDone={buttonDone} setButtonDone={setButtonDone} />
              )}

              {slot >= 4 && (
                <Slot4 onNext={() => setSlot(5)} playSound={playSound}
                  inputDone={inputDone} setInputDone={setInputDone} spanDone={spanDone} setSpanDone={setSpanDone} />
              )}

              {slot >= 5 && (
                <Slot5 onNext={() => setSlot(6)} playSound={playSound} done={divDone} setDone={setDivDone} />
              )}

              {slot >= 6 && !showReveal && (
                <Slot6
                  playSound={playSound}
                  name={name} setName={setName}
                  plan={plan} setPlan={setPlan}
                  status={status} setStatus={setStatus}
                  cardDone={cardDone} setCardDone={setCardDone}
                  onDone={() => { setShowReveal(true); playSound("correct"); }}
                />
              )}

              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}

              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }} className="hk-btn hk-pulse"
                  style={{
                    marginTop: 20, padding: "16px 32px", background: "linear-gradient(135deg,#7C3AED,#2563EB)", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    display: "block", width: "100%"
                  }}>🚀 Build for YOUR project →</button>
              )}
            </div>

            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
              }}>
                <LiveRender html={liveHtml} label={renderLabel} />
                {slot === 5 && <div style={{ marginTop: 16 }}><TiffinBox /></div>}
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="split-panel" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                domain={domain} setDomain={setDomain}
                code={code} setCode={setCode}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
              }}>
                <LiveRender html={liveHtml} label={domain ? "Your HTML rendering live ✅" : ""} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
