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

// ─── FIXED HTML — pre-written from 4.0.1, Ravi only writes CSS here ─────────
const CARD_HTML = `<div class="member-card">
  <h2>Ravi Kumar</h2>
  <div class="card-row">
    <div>Basic Plan</div>
    <div class="badge active">Active</div>
  </div>
  <button class="save-btn">Edit Member</button>
</div>`;

const TWO_BUTTON_HTML = `<button class="save-btn">Save Member</button>
<button class="delete-btn">Delete Member</button>`;

const FINAL_CSS = `.member-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px auto;
  max-width: 360px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 12px 0;
}

h2 {
  color: #1A3C6E;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.active {
  background-color: #DCFCE7;
  color: #166534;
}

.save-btn {
  background-color: #E8622A;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
}`;

// ─── LIVE RENDER — srcdoc iframe combining HTML + CSS ───────────────────────
function renderCard(html, css) {
  return `<html><head><style>
    body { font-family: system-ui; padding: 16px; margin: 0; background: #F9FAFB; }
    ${css}
  </style></head><body>${html}</body></html>`;
}

function LiveRender({ html, css, label, url = "yourgym.html" }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#7C3AED", letterSpacing: 1, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🌐</span> LIVE RENDER — HTML + CSS
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
          }}>{url}</span>
        </div>
        <div style={{ minHeight: 260 }}>
          <iframe
            srcDoc={renderCard(html, css)}
            title="CSS Preview"
            style={{ border: "none", width: "100%", height: 260, background: "#fff" }}
            sandbox="allow-same-origin"
          />
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
      {!title && icon && <span style={{ fontSize: 16, marginRight: 8 }}>{icon}</span>}
      {children}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "CSS Syntax", icon: "🧵" },
  { label: "Colour", icon: "🎨" },
  { label: "Spacing", icon: "🧥" },
  { label: "Shape", icon: "🔲" },
  { label: "Classes", icon: "🏷️" },
  { label: "Flexbox + Card", icon: "🧩" },
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

// ─── CSS BLANK — one property blank inside a selector block ────────────────
function CSSBlank({ selector, value, onChange, correct, wrong, placeholder, valueLiteral, comment, useDropdown, dropdownOptions, extraLines }) {
  return (
    <div className={`hk-card${correct ? " hk-pop" : wrong ? " hk-shake" : ""}`} style={{
      background: "linear-gradient(180deg,#1E293B,#0F172A)", color: "#E2E8F0", borderRadius: 12,
      padding: 18, fontFamily: "monospace", fontSize: 15,
      border: correct ? "2px solid #10B981" : "2px solid #334155",
      boxShadow: correct ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s ease"
    }}>
      <div><span style={{ color: "#FBBF24" }}>{selector}</span> {"{"}</div>
      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        {useDropdown ? (
          <select value={value} onChange={e => onChange(e.target.value)} style={{
            background: correct ? "#134E4A" : "#1E293B", color: correct ? "#4ADE80" : "#F1F5F9",
            border: correct ? "1px solid #10B981" : "1px solid #64748B", borderRadius: 5,
            fontFamily: "monospace", fontSize: 15, padding: "2px 6px", outline: "none"
          }}>
            <option value="">[ choose ]</option>
            {dropdownOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            size={Math.max(placeholder.length, value.length, 5)}
            style={{
              background: correct ? "#134E4A" : "#1E293B", color: correct ? "#4ADE80" : "#F1F5F9",
              border: correct ? "1px dashed #10B981" : "1px dashed #64748B", borderRadius: 5,
              fontFamily: "monospace", fontSize: 15, padding: "2px 6px", outline: "none"
            }}
          />
        )}
        <span>: {valueLiteral}</span>
        {correct && <span style={{ marginLeft: 6 }}>✅</span>}
      </div>
      {extraLines && extraLines.map((l, i) => (
        <div key={i} style={{ paddingLeft: 24, color: "#94A3B8" }}>{l}</div>
      ))}
      <div>{"}"}</div>
      {comment && <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 8 }}>💬 {comment}</div>}
    </div>
  );
}

// ─── CODE BLOCK — static, no blanks ──────────────────────────────────────────
function CodeBlock({ children, style }) {
  return (
    <div className="hk-card" style={{
      background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16,
      fontFamily: "monospace", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap", ...style
    }}>
      {children}
    </div>
  );
}

// ─── RANGE SLIDER ────────────────────────────────────────────────────────────
function RangeSlider({ label, value, min, max, onChange, unit = "px" }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
        {label}: <strong>{value}{unit}</strong>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#7C3AED" }} />
    </div>
  );
}

// ─── PADDING / MARGIN DIAGRAM — puffy coat / personal space ────────────────
function PaddingMarginDiagram({ padding = 20, margin = 16 }) {
  return (
    <div style={{ textAlign: "center", padding: 8 }}>
      <div style={{
        display: "inline-block", background: "#FDBA74", border: "2px dashed #EA580C",
        borderRadius: 20, padding: Math.max(margin, 8), transition: "padding 0.3s ease"
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#9A3412", marginBottom: 6 }}>
          🧍 margin — personal space
        </div>
        <div style={{
          background: "#93C5FD", border: "2px dashed #2563EB", borderRadius: 14,
          padding: Math.max(padding, 8), transition: "padding 0.3s ease"
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#1E3A8A", marginBottom: 6 }}>
            🧥 padding — puffy coat
          </div>
          <div style={{ background: "#fff", borderRadius: 8, padding: 12, fontWeight: 800, color: "#1E293B", fontSize: 13 }}>
            content
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FLEX COMPARISON — stacked vs side by side ──────────────────────────────
function FlexCompareVisual() {
  const chips = ["Ravi Kumar", "Basic Plan", "Edit"];
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", marginBottom: 8 }}>WITHOUT FLEX</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
          {chips.map(c => (
            <div key={c} style={{ background: "#E2E8F0", color: "#374151", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>{c}</div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 6 }}>stacked — each on its own line</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#7C3AED" }}>→</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", marginBottom: 8 }}>display: flex</div>
        <div style={{ display: "flex", gap: 6, background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: 10 }}>
          {chips.map(c => (
            <div key={c} style={{ background: "#DDD6FE", color: "#5B21B6", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>{c}</div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#7C3AED", marginTop: 6 }}>side by side — one row</div>
      </div>
    </div>
  );
}

// ─── TAILOR SVG ──────────────────────────────────────────────────────────────
function TailorFigure({ after }) {
  return (
    <div className="hk-wobble-in" style={{ textAlign: "center" }}>
      <svg width="90" height="130" viewBox="0 0 90 130">
        <circle cx="45" cy="24" r="16" fill={after ? "#FBBF24" : "#E2E8F0"} stroke={after ? "#B45309" : "#94A3B8"} strokeWidth="3" />
        <rect x="22" y="42" width="46" height="60" rx="10"
          fill={after ? "#7C3AED" : "#F1F5F9"} stroke={after ? "#5B21B6" : "#94A3B8"} strokeWidth="3" />
        <rect x="30" y="106" width="14" height="20" rx="4" fill={after ? "#1E293B" : "#CBD5E1"} />
        <rect x="46" y="106" width="14" height="20" rx="4" fill={after ? "#1E293B" : "#CBD5E1"} />
      </svg>
      <div style={{ fontSize: 11, fontWeight: 800, color: after ? "#5B21B6" : "#94A3B8", marginTop: 4 }}>
        {after ? "styled 🎨" : "plain"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 1 — CSS SYNTAX
// ═══════════════════════════════════════════════════════════════════════════
function Slot1({ onNext, playSound }) {
  const [showAfter, setShowAfter] = useState(false);
  const toggle = () => { playSound("tick"); setShowAfter(v => !v); };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧵 How CSS works — one pattern</div>

      <Callout icon="🪡" title="CSS is the tailor" variant="tip">
        You have the HTML skeleton. Plain. Unstyled.<br /><br />
        <strong>CSS is the tailor.</strong><br /><br />
        Same structure. CSS gives it colour, spacing, and shape.<br /><br />
        One pattern. Used for everything.
      </Callout>

      <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "center", margin: "18px 0" }}>
        <TailorFigure after={false} />
        <div style={{ fontSize: 22, color: "#7C3AED" }}>→</div>
        <TailorFigure after={true} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📐 The one CSS pattern:</div>
      <CodeBlock>
        <div><span style={{ color: "#FBBF24" }}>selector</span> {"{"}</div>
        <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>property</span>: <span style={{ color: "#4ADE80" }}>value</span>;</div>
        <div>{"}"}</div>
      </CodeBlock>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, fontSize: 12 }}>
        <div style={{ color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "6px 10px" }}>
          <strong style={{ color: "#FBBF24" }}>selector</strong> → which element to style
        </div>
        <div style={{ color: "#1E3A8A", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "6px 10px" }}>
          <strong style={{ color: "#2563EB" }}>property</strong> → what to change
        </div>
        <div style={{ color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "6px 10px" }}>
          <strong style={{ color: "#16A34A" }}>value</strong> → what to set it to
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={toggle} className="hk-btn" style={{
          padding: "10px 20px", borderRadius: 999, border: "2px solid #7C3AED",
          background: showAfter ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#fff",
          color: showAfter ? "#fff" : "#7C3AED", fontWeight: 800, fontSize: 13, marginBottom: 12
        }}>
          {showAfter ? "👀 Showing: AFTER CSS" : "👀 Showing: BEFORE CSS"} — tap to toggle
        </button>
        <div className="hk-card" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0" }}>
          <LiveRender html={CARD_HTML} css={showAfter ? FINAL_CSS : ""} label={showAfter ? "This is where you are going 🎯" : "Plain HTML — same as end of 4.0.1"} />
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#374151", marginTop: 16, marginBottom: 4 }}>
        You add CSS one step at a time. Start with colour →
      </div>
      <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
        style={{ marginTop: 4, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
        Add colour →
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 2 — COLOUR
// ═══════════════════════════════════════════════════════════════════════════
function Slot2({ onNext, playSound, colorDone, setColorDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim().toLowerCase() === "color";
  const [buttonRevealed, setButtonRevealed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !colorDone) {
      playSound("add");
      setColorDone(true);
      setTimeout(() => { setButtonRevealed(true); playSound("correct"); }, 700);
    } else if (value && !correct) {
      setWrong(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const tickCheckbox = () => {
    if (!checked) { playSound("add"); setChecked(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🎨 Colour — text and background</div>

      <CSSBlank
        selector="h2"
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        placeholder="color"
        valueLiteral="#1A3C6E;"
        comment="text colour — dark blue"
        extraLines={correct ? [] : undefined}
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 What CSS property sets the colour of text? <span style={{ color: "#94A3B8" }}>(hint: American spelling — no "u")</span>
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The property is <strong>color</strong> — American spelling, no "u".
        </Callout>
      )}

      {correct && (
        <div style={{ marginTop: 14, animation: "slideIn 0.4s ease" }}>
          <CodeBlock>
            <div><span style={{ color: "#FBBF24" }}>.member-card</span> {"{"}</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>background-color</span>: <span style={{ color: "#4ADE80" }}>white</span>;</div>
            <div>{"}"}</div>
          </CodeBlock>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <div className="hk-card" style={{ flex: "1 1 160px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ color: "#1A3C6E", fontWeight: 800, fontSize: 15 }}>Ravi Kumar</div>
              <div style={{ fontSize: 11, color: "#2563EB", marginTop: 6 }}>color = text colour</div>
            </div>
            <div className="hk-card" style={{ flex: "1 1 160px", background: "#E8622A", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Edit Member</div>
              <div style={{ fontSize: 11, color: "#FEF3E2", marginTop: 6 }}>background-color = fill colour</div>
            </div>
          </div>

          <Callout icon="🔢" title="What is #1A3C6E?" variant="info" style={{ marginTop: 14 }}>
            A precise colour code. Every colour has one.<br /><br />
            You do not need to memorise them. Copy from designs. Or use a colour picker.<br /><br />
            Basic colour names also work in CSS: <code>red</code>, <code>blue</code>, <code>white</code>, <code>black</code>.
          </Callout>
        </div>
      )}

      {buttonRevealed && (
        <div style={{ marginTop: 14, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Now the button gets colour too — read and see it apply:</div>
          <CodeBlock>
            <div><span style={{ color: "#FBBF24" }}>button</span> {"{"}</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>background-color</span>: <span style={{ color: "#4ADE80" }}>#E8622A</span>;</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>color</span>: <span style={{ color: "#4ADE80" }}>white</span>;</div>
            <div>{"}"}</div>
          </CodeBlock>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={tickCheckbox} />
            My card has colour
          </label>

          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Add spacing →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 3 — SPACING
// ═══════════════════════════════════════════════════════════════════════════
function Slot3({ onNext, playSound, paddingDone, setPaddingDone }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value === "padding";
  const [marginRevealed, setMarginRevealed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (correct && !paddingDone) {
      playSound("add");
      setPaddingDone(true);
      setTimeout(() => setMarginRevealed(true), 700);
    } else if (value && !correct) {
      setWrong(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const tickCheckbox = () => {
    if (!checked) { playSound("add"); setChecked(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧥 Spacing — padding and margin</div>

      <Callout icon="🧍" title="The puffy coat analogy" variant="tip">
        <PaddingMarginDiagram padding={correct ? 20 : 8} margin={marginRevealed ? 16 : 8} />
        <div style={{ marginTop: 12 }}>
          <strong>padding</strong> = puffy coat. Makes YOU bigger from inside.<br />
          <strong>margin</strong> = personal space. Keeps OTHERS away from you.
        </div>
      </Callout>

      <CSSBlank
        selector=".member-card"
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        useDropdown
        dropdownOptions={["padding", "margin", "spacing", "border"]}
        valueLiteral="20px;"
        comment="space inside the card, between content and edge"
        extraLines={["background-color: white;"]}
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 Which property adds space INSIDE an element — between the content and the element's edge?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          <strong>padding</strong> adds space inside. <strong>margin</strong> adds space outside.
        </Callout>
      )}

      {marginRevealed && (
        <div style={{ marginTop: 14, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Now margin — space OUTSIDE the card:</div>
          <CodeBlock>
            <div><span style={{ color: "#FBBF24" }}>.member-card</span> {"{"}</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>padding</span>: <span style={{ color: "#4ADE80" }}>20px</span>;</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>margin</span>: <span style={{ color: "#4ADE80" }}>16px auto</span>;</div>
            <div style={{ paddingLeft: 24, color: "#94A3B8" }}>{"/* 16px top/bottom, auto = centred horizontally */"}</div>
            <div>{"}"}</div>
          </CodeBlock>

          <Callout icon="📏" variant="neutral" style={{ marginTop: 12 }}>
            <div style={{ textAlign: "center", fontFamily: "monospace" }}>
              margin ← [ padding [ content ] padding ] → margin
            </div>
            <div style={{ marginTop: 8, textAlign: "center" }}>
              <strong>Padding: inside. Margin: outside. Always.</strong>
            </div>
          </Callout>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={tickCheckbox} />
            My card has spacing
          </label>

          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Add shape →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 4 — SHAPE
// ═══════════════════════════════════════════════════════════════════════════
function Slot4({ onNext, playSound, radiusDone, setRadiusDone, radiusValue, setRadiusValue }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim().toLowerCase() === "border-radius";
  const [fontRevealed, setFontRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    if (correct && !radiusDone) {
      playSound("add");
      setRadiusDone(true);
      setTimeout(() => setFontRevealed(true), 700);
    } else if (value && !correct) {
      setWrong(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const onSlide = (v) => {
    setRadiusValue(v);
    const now = Date.now();
    if (now - lastTick.current > 250) { playSound("tick"); lastTick.current = now; }
  };

  const tickCheckbox = () => {
    if (!checked) { playSound("add"); setChecked(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🔲 Shape — corners, size, weight</div>

      <CSSBlank
        selector=".member-card"
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        placeholder="border-radius"
        valueLiteral="12px;"
        comment="0px = sharp · 12px = gently rounded · 50% = circle"
        extraLines={["padding: 20px;"]}
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 What property rounds the corners?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The property is <strong>border-radius</strong>.
        </Callout>
      )}

      {radiusDone && (
        <div style={{ marginTop: 14, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🎚️ Try different values:</div>
          <RangeSlider label="border-radius" value={radiusValue} min={0} max={50} onChange={onSlide} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <div style={{
              width: 100, height: 70, background: "#7C3AED", borderRadius: radiusValue,
              transition: "border-radius 0.15s ease", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800
            }}>{radiusValue}px</div>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 6 }}>
            0px square · 12px gently rounded (use this) · 50px pill shape
          </div>
        </div>
      )}

      {fontRevealed && (
        <div style={{ marginTop: 18, animation: "slideIn 0.4s ease" }}>
          <CodeBlock>
            <div><span style={{ color: "#FBBF24" }}>h2</span> {"{"}</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>font-size</span>: <span style={{ color: "#4ADE80" }}>20px</span>; <span style={{ color: "#94A3B8" }}>{"/* text size */"}</span></div>
            <div>{"}"}</div>
          </CodeBlock>
          <div style={{ fontSize: 12, color: "#374151", margin: "8px 0" }}>px = pixels. Bigger number = bigger text.</div>
          <CodeBlock>
            <div><span style={{ color: "#FBBF24" }}>h2</span> {"{"}</div>
            <div style={{ paddingLeft: 24 }}><span style={{ color: "#60A5FA" }}>font-weight</span>: <span style={{ color: "#4ADE80" }}>bold</span>; <span style={{ color: "#94A3B8" }}>{"/* thick text */"}</span></div>
            <div>{"}"}</div>
          </CodeBlock>
          <div style={{ fontSize: 12, color: "#374151", marginTop: 8 }}>
            bold or normal. Or a number: 700 = bold, 400 = normal.
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={tickCheckbox} />
            My card has rounded corners
          </label>

          {checked && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Add classes →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 5 — CLASSES + className
// ═══════════════════════════════════════════════════════════════════════════
function Slot5({ onNext, playSound, understood, setUnderstood }) {
  const [choice, setChoice] = useState(null);

  const choose = (opt) => {
    setChoice(opt);
    if (opt === "B") { playSound("correct"); }
    else playSound("warn");
  };

  const tickCheckbox = () => {
    if (!understood) { playSound("correct"); setUnderstood(true); }
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🏷️ Classes — style specific elements</div>

      <Callout icon="❓" title="The problem" variant="danger">
        Two buttons. Different colours. How do you style them differently?
        <CodeBlock style={{ marginTop: 10 }}>
          <div>&lt;button&gt;Save&lt;/button&gt;</div>
          <div>&lt;button&gt;Delete&lt;/button&gt;</div>
        </CodeBlock>
        <div style={{ marginTop: 8 }}>
          <code>button {"{ background-color: green; }"}</code> → BOTH buttons go green ❌
        </div>
      </Callout>

      <Callout icon="✅" title="The solution — classes" variant="success">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 6 }}>HTML</div>
        <CodeBlock style={{ background: "#1E293B" }}>
          <div>&lt;button <span style={{ color: "#4ADE80" }}>class="save-btn"</span>&gt;Save&lt;/button&gt;</div>
          <div>&lt;button <span style={{ color: "#F87171" }}>class="delete-btn"</span>&gt;Delete&lt;/button&gt;</div>
        </CodeBlock>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", margin: "10px 0 6px" }}>CSS</div>
        <CodeBlock style={{ background: "#1E293B" }}>
          <div><span style={{ color: "#4ADE80" }}>.save-btn</span> {"{"} background-color: #10B981; {"}"}</div>
          <div><span style={{ color: "#F87171" }}>.delete-btn</span> {"{"} background-color: #EF4444; {"}"}</div>
        </CodeBlock>
      </Callout>

      <Callout icon="•" title="The dot, explained" variant="info">
        In CSS — a dot before the name means "target a class."<br /><br />
        <code>.save-btn</code> → targets <code>class='save-btn'</code><br />
        <code>.delete-btn</code> → targets <code>class='delete-btn'</code><br /><br />
        Without the dot: <code>save-btn {"{ }"}</code> → CSS looks for an HTML tag called "save-btn" — which does not exist.
      </Callout>

      <div className="hk-card" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", marginBottom: 8 }}>
        <LiveRender
          html={TWO_BUTTON_HTML}
          css=".save-btn{background-color:#10B981;color:white;padding:10px 20px;border-radius:8px;border:none;font-size:0.9rem;margin-right:10px;} .delete-btn{background-color:#EF4444;color:white;padding:10px 20px;border-radius:8px;border:none;font-size:0.9rem;}"
          label="Different classes → different styles ✅"
        />
      </div>

      <Callout icon="⚠️" title="THE MOST IMPORTANT RULE IN THIS SUBTOPIC" variant="tip" style={{ borderWidth: 2, boxShadow: "0 8px 24px rgba(217,119,6,0.15)" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4 }}>HTML</div>
            <CodeBlock style={{ background: "#1E293B", fontSize: 13 }}>class='save-btn'</CodeBlock>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 20 }}>→</div>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4 }}>React (JSX)</div>
            <CodeBlock style={{ background: "#1E293B", fontSize: 13, border: "2px solid #10B981" }}>className='save-btn'</CodeBlock>
          </div>
        </div>
        Always. Every time. No exceptions.<br /><br />
        Why? <code>class</code> is a reserved word in JavaScript — it already means something (you used it in Java!). React uses <code>className</code> to avoid the conflict.<br /><br />
        If you write "class" in React — it gives a warning. Always <strong>className</strong>.
      </Callout>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🤔 Complete this React button tag:</div>
      <CodeBlock style={{ marginBottom: 10 }}>
        &lt;button [___]='save-btn'&gt;Save&lt;/button&gt;
      </CodeBlock>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[["A", "class"], ["B", "className"], ["C", "style"], ["D", "id"]].map(([key, label]) => (
          <button key={key} onClick={() => choose(key)} className="hk-btn"
            style={{
              padding: "10px 16px", borderRadius: 10, fontFamily: "monospace", fontSize: 14,
              border: choice === key ? (key === "B" ? "2px solid #059669" : "2px solid #DC2626") : "2px solid #E2E8F0",
              background: choice === key ? (key === "B" ? "#ECFDF5" : "#FEF2F2") : "#fff",
              animation: choice === key ? (key === "B" ? "popIn 0.35s ease" : "shakeX 0.4s ease") : "none"
            }}>
            {key}) {label} {choice === key && (key === "B" ? "✅" : "❌")}
          </button>
        ))}
      </div>
      {choice && choice !== "B" && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 10 }}>
          In React — always <strong>className</strong>, not class. This is the rule.
        </Callout>
      )}
      {choice === "B" && (
        <Callout icon="🎉" variant="success" style={{ marginTop: 10 }}>
          Correct. Always className in React.
        </Callout>
      )}

      {choice === "B" && (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={understood} onChange={tickCheckbox} />
            I understand className in React
          </label>

          {understood && (
            <button onClick={() => { playSound("tick"); onNext(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "12px 24px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              Add flexbox →
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLOT 6 — FLEXBOX + FINAL CARD
// ═══════════════════════════════════════════════════════════════════════════
function Slot6({ onDone, playSound, displayDone, setDisplayDone, gapValue, setGapValue, radiusValue, cardChecked, setCardChecked }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const correct = value.trim().toLowerCase() === "display";
  const [flexApplied, setFlexApplied] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [revealedAfterOnce, setRevealedAfterOnce] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    if (correct && !displayDone) {
      playSound("add");
      setDisplayDone(true);
      setTimeout(() => { setFlexApplied(true); playSound("correct"); }, 500);
    } else if (value && !correct) {
      setWrong(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const onGapSlide = (v) => {
    setGapValue(v);
    const now = Date.now();
    if (now - lastTick.current > 250) { playSound("tick"); lastTick.current = now; }
  };

  const toggleAfter = () => {
    const next = !showAfter;
    setShowAfter(next);
    if (next && !revealedAfterOnce) { playSound("reveal"); setRevealedAfterOnce(true); }
    else playSound("tick");
  };

  const tickCheckbox = () => {
    if (!cardChecked) { playSound("correct"); setCardChecked(true); }
  };

  const liveCss = `.member-card{background-color:white;border-radius:${radiusValue}px;padding:20px;margin:16px auto;max-width:360px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
h2{color:#1A3C6E;font-size:20px;font-weight:bold;margin:0 0 8px 0;}
button{background-color:#E8622A;color:white;padding:10px 20px;border-radius:8px;border:none;font-size:0.9rem;}
.badge{padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:bold;display:inline-block;}
.active{background-color:#DCFCE7;color:#166534;}
${flexApplied ? `.card-row{display:flex;gap:${gapValue}px;align-items:center;margin:12px 0;}` : ""}`;

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>🧩 Flexbox — side by side</div>

      <Callout icon="↔️" title="Stacked vs side by side" variant="info">
        <FlexCompareVisual />
        <div style={{ marginTop: 10 }}>
          <strong>display: flex</strong> makes children line up horizontally.
        </div>
      </Callout>

      <CSSBlank
        selector=".card-row"
        value={value}
        onChange={v => { setValue(v); setWrong(false); }}
        correct={correct}
        wrong={wrong && !correct}
        placeholder="display"
        valueLiteral="flex;"
        comment='display: flex — two words working together'
        extraLines={["gap: 12px;", "align-items: center;"]}
      />
      <div style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 4 }}>
        💡 What CSS property switches a container to flex layout?
      </div>
      {wrong && !correct && (
        <Callout icon="🚫" variant="danger" shake style={{ marginTop: 8 }}>
          The property is <strong>display</strong>. <code>display: flex</code>
        </Callout>
      )}

      {flexApplied && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🎚️ Try different gap values:</div>
          <RangeSlider label="gap" value={gapValue} min={0} max={32} onChange={onGapSlide} />
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>gap = space between flex children</div>
        </div>
      )}

      <div className="hk-card" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", marginTop: 18 }}>
        <LiveRender html={CARD_HTML} css={liveCss} label={flexApplied ? "Card row is now side by side ✅" : "Card row still stacked"} />
      </div>

      {flexApplied && (
        <div style={{ marginTop: 20, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🪄 Final card assembly — all CSS combined:</div>
          <CodeBlock style={{ fontSize: 12 }}>{FINAL_CSS}</CodeBlock>
          <div style={{ fontSize: 12, color: "#374151", marginTop: 8 }}>
            All CSS applied together. Same HTML from 4.0.1. Completely different appearance.
          </div>

          <button onClick={toggleAfter} className="hk-btn" style={{
            marginTop: 16, padding: "12px 24px", borderRadius: 999, border: "2px solid #7C3AED",
            background: showAfter ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "#fff",
            color: showAfter ? "#fff" : "#7C3AED", fontWeight: 800, fontSize: 14
          }}>
            {showAfter ? "Show Before" : "Show After"}
          </button>

          <div className="hk-card hk-pop" key={showAfter ? "after" : "before"} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", marginTop: 12 }}>
            <LiveRender html={CARD_HTML} css={showAfter ? FINAL_CSS : ""} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={cardChecked} onChange={tickCheckbox} />
            My card looks like a real app
          </label>

          {cardChecked && (
            <button onClick={() => { playSound("correct"); onDone(); }} className="hk-btn"
              style={{ marginTop: 16, padding: "14px 28px", background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, display: "block", width: "100%" }}>
              Finish Phase 1 🎉
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["🧵 selector { property: value; }", "one CSS pattern — used for everything"],
    ["🎨 color", "text colour"],
    ["🪣 background-color", "fill colour"],
    ["🧥 padding", "space inside element — puffy coat"],
    ["🧍 margin", "space outside element — personal space"],
    ["🔲 border-radius", "rounds corners"],
    ["🧩 display: flex", "children side by side"],
    ["🏷️ className", "React's class — always className in JSX, never class"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => {
      setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 320);
    });
    setTimeout(() => { onDone(); }, 400 + items.length * 320 + 200);
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
        Same HTML from 4.0.1.<br />
        CSS added.<br />
        Completely different appearance.<br /><br />
        The skeleton has its clothes. 👕<br /><br />
        Next — 4.0.3.<br />
        JavaScript for React.<br />
        7 concepts.<br />
        The language that makes your card interactive.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2 — FREE PROJECT
// ═══════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  gym: { icon: "🏋️", label: "Gym", html:
`<div class="member-card">
  <h2>Member Name</h2>
  <div class="card-row">
    <div>Basic Plan</div>
    <div class="badge active">Active</div>
  </div>
  <button class="save-btn">Edit Member</button>
</div>` },
  hotel: { icon: "🏨", label: "Hotel", html:
`<div class="member-card">
  <h2>Room 101</h2>
  <div class="card-row">
    <div>Standard</div>
    <div class="badge active">Available</div>
  </div>
  <button class="save-btn">Book Room</button>
</div>` },
  mess: { icon: "🍱", label: "Mess", html:
`<div class="member-card">
  <h2>Monday Lunch</h2>
  <div class="card-row">
    <div>Dal Rice Sambar</div>
    <div class="badge active">Serving</div>
  </div>
  <button class="save-btn">Mark Attendance</button>
</div>` },
  chai: { icon: "☕", label: "Chai", html:
`<div class="member-card">
  <h2>Order #42</h2>
  <div class="card-row">
    <div>2x Cutting Chai</div>
    <div class="badge active">Pending</div>
  </div>
  <button class="save-btn">Mark Ready</button>
</div>` },
  other: { icon: "🏪", label: "Other", html:
`<div class="member-card">
  <h2>Title</h2>
  <div class="card-row">
    <div>Detail one</div>
    <div class="badge active">Active</div>
  </div>
  <button class="save-btn">Action</button>
</div>` },
};

const PHASE2_BASE_CSS = `.member-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 360px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 12px 0;
}

h2 {
  color: #1A3C6E;
  font-size: 20px;
  font-weight: bold;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.active {
  background-color: #DCFCE7;
  color: #166534;
}

.save-btn {
  background-color: #E8622A;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
}`;

function replaceInBlock(css, selectorEsc, prop, newValue) {
  const re = new RegExp(`(${selectorEsc}\\s*\\{[^}]*?${prop}\\s*:\\s*)[^;]+;`);
  if (re.test(css)) return css.replace(re, `$1${newValue};`);
  return css;
}

function Phase2Left({ domain, setDomain, html, setHtml, css, setCss, cardBg, setCardBg, headingColor, setHeadingColor, buttonColor, setButtonColor, radius, setRadius, padding, setPadding, reflection, setReflection, onSubmit, submitted, cardLooksGood, setCardLooksGood, playSound }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 1 && reflection.trim().length > 0;
  const [typingTick, setTypingTick] = useState(0);

  const chooseDomain = (key) => {
    setDomain(key);
    setHtml(DOMAINS[key].html);
    setCss(PHASE2_BASE_CSS);
    playSound("tick");
  };

  const onCssChange = (v) => {
    setCss(v);
    if (Math.random() < 0.15) playSound("tick");
  };

  const updateCardBg = (v) => { setCardBg(v); setCss(c => replaceInBlock(c, "\\.member-card", "background-color", v)); };
  const updateHeadingColor = (v) => { setHeadingColor(v); setCss(c => replaceInBlock(c, "h2", "color", v)); };
  const updateButtonColor = (v) => { setButtonColor(v); setCss(c => replaceInBlock(c, "\\.save-btn", "background-color", v)); };
  const updateRadius = (v) => { setRadius(v); setCss(c => replaceInBlock(c, "\\.member-card", "border-radius", `${v}px`)); };
  const updatePadding = (v) => { setPadding(v); setCss(c => replaceInBlock(c, "\\.member-card", "padding", `${v}px`)); };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🎨 Add CSS to YOUR domain card</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, then style the card freely.</div>

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

          {domain && (
            <>
              <div className="hk-card" style={{ background: "#F9FAFB", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>🖌️ QUICK CUSTOMISE</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                  <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    Card background
                    <input type="color" value={cardBg} onChange={e => updateCardBg(e.target.value)} style={{ width: 48, height: 32, border: "none", borderRadius: 6, cursor: "pointer" }} />
                  </label>
                  <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    Heading colour
                    <input type="color" value={headingColor} onChange={e => updateHeadingColor(e.target.value)} style={{ width: 48, height: 32, border: "none", borderRadius: 6, cursor: "pointer" }} />
                  </label>
                  <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    Button colour
                    <input type="color" value={buttonColor} onChange={e => updateButtonColor(e.target.value)} style={{ width: 48, height: 32, border: "none", borderRadius: 6, cursor: "pointer" }} />
                  </label>
                </div>
                <RangeSlider label="Border radius" value={radius} min={0} max={20} onChange={updateRadius} />
                <RangeSlider label="Padding" value={padding} min={8} max={32} onChange={updatePadding} />
              </div>

              <textarea
                value={css}
                onChange={e => onCssChange(e.target.value)}
                onPaste={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
                spellCheck={false}
                style={{
                  width: "100%", minHeight: 240, background: "#1E293B", color: "#E2E8F0",
                  fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
                  border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
                }}
              />
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
                Modify the CSS. Try different colours. Try different border-radius. Make it yours.
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={cardLooksGood} onChange={() => { if (!cardLooksGood) { playSound("correct"); setCardLooksGood(true); } }} />
                My card looks good
              </label>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  In one sentence — what is the difference between padding and margin?
                </div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  placeholder="Padding adds space inside an element between the content and its edge (like a puffy coat making you bigger), while margin adds space outside the element pushing other elements away (like personal space)..."
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

              <button onClick={onSubmit} disabled={!cardLooksGood || !reflectionOk} className="hk-btn"
                style={{
                  marginTop: 16, padding: "14px 32px",
                  background: (cardLooksGood && reflectionOk) ? "linear-gradient(135deg,#1E293B,#334155)" : "#CBD5E1",
                  color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                  cursor: (cardLooksGood && reflectionOk) ? "pointer" : "not-allowed", display: "block", width: "100%"
                }}>CSS is clear — JavaScript next →</button>
            </>
          )}
        </>
      )}

      {submitted && (
        <div className="hk-wobble-in" style={{
          background: "linear-gradient(180deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981", borderRadius: 16,
          padding: 28, boxShadow: "0 10px 30px rgba(16,185,129,0.2)"
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>🎨 The clothes are on. 🎉</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 2, background: "#fff", borderRadius: 12, padding: 16, border: "1px dashed #10B981" }}>
            ✅ color + background-color<br />
            ✅ padding (inside) + margin (outside)<br />
            ✅ border-radius — rounded corners<br />
            ✅ Classes — .class-name {"{ }"}<br />
            ✅ className — always in React<br />
            ✅ display: flex — side by side<br /><br />
            Next — 4.0.3.<br />
            JavaScript for React.<br /><br />
            7 concepts.<br />
            const, arrow functions, map, fetch, async/await.<br /><br />
            After that — React itself.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CSSIntro() {
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

  const [colorDone, setColorDone] = useState(false);
  const [paddingDone, setPaddingDone] = useState(false);
  const [radiusDone, setRadiusDone] = useState(false);
  const [radiusValue, setRadiusValue] = useState(12);
  const [classNameUnderstood, setClassNameUnderstood] = useState(false);
  const [displayDone, setDisplayDone] = useState(false);
  const [gapValue, setGapValue] = useState(12);
  const [cardChecked, setCardChecked] = useState(false);

  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const [domain, setDomain] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [cardBg, setCardBg] = useState("#ffffff");
  const [headingColor, setHeadingColor] = useState("#1a3c6e");
  const [buttonColor, setButtonColor] = useState("#e8622a");
  const [radius, setRadius] = useState(12);
  const [padding, setPadding] = useState(20);
  const [cardLooksGood, setCardLooksGood] = useState(false);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m4-t0-s2-css-intro",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          slot1: { beforeAfterSeen: true },
          slot2: { colorBlank: "color" },
          slot3: { paddingBlank: "padding" },
          slot4: { borderRadiusBlank: "border-radius" },
          slot5: { classNameQuestion: "B", classNameUnderstood },
          slot6: { displayBlank: "display", finalCardRendered: true }
        },
        phase2: {
          domainSelected: domain,
          cssWritten: css,
          cardLooksGood,
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
        @keyframes popIn { 0% { transform:scale(0.94); } 50% { transform:scale(1.02); } 100% { transform:scale(1); } }
        @keyframes shakeX { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(6px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
        @keyframes wobbleIn { 0% { opacity:0; transform:rotate(-6deg) scale(0.85); } 60% { opacity:1; transform:rotate(2deg) scale(1.03); } 100% { transform:rotate(0deg) scale(1); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.45); } 70% { box-shadow:0 0 0 10px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }
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

      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }} className="hk-btn"
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      <div style={{ background: "linear-gradient(135deg,#4C1D95,#1E293B 55%,#0F172A)", color: "#fff", padding: "36px 24px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.35),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "#C4B5FD", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>🎨 SUBTOPIC 4.0.2 · HATCHKOD</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>👕 CSS — The Clothes</div>
          <div style={{ fontSize: 15, color: "#DDD6FE" }}>Same HTML. CSS adds colour, spacing, and shape.</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && <ProgressBar slot={slot} />}

        {phase === 1 && (
          <div className="split-panel" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} />

              {slot >= 2 && (
                <Slot2 onNext={() => setSlot(3)} playSound={playSound} colorDone={colorDone} setColorDone={setColorDone} />
              )}

              {slot >= 3 && (
                <Slot3 onNext={() => setSlot(4)} playSound={playSound} paddingDone={paddingDone} setPaddingDone={setPaddingDone} />
              )}

              {slot >= 4 && (
                <Slot4 onNext={() => setSlot(5)} playSound={playSound}
                  radiusDone={radiusDone} setRadiusDone={setRadiusDone}
                  radiusValue={radiusValue} setRadiusValue={setRadiusValue} />
              )}

              {slot >= 5 && (
                <Slot5 onNext={() => setSlot(6)} playSound={playSound}
                  understood={classNameUnderstood} setUnderstood={setClassNameUnderstood} />
              )}

              {slot >= 6 && !showReveal && (
                <Slot6
                  playSound={playSound}
                  displayDone={displayDone} setDisplayDone={setDisplayDone}
                  gapValue={gapValue} setGapValue={setGapValue}
                  radiusValue={radiusValue}
                  cardChecked={cardChecked} setCardChecked={setCardChecked}
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
                  }}>🚀 Style YOUR project →</button>
              )}
            </div>

            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
              }}>
                {slot === 5 ? (
                  <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                    See the two-button demo in the editor on the left →
                  </div>
                ) : slot === 1 ? (
                  <LiveRender html={CARD_HTML} css="" label="Starting here ↓" />
                ) : (
                  <LiveRender
                    html={CARD_HTML}
                    css={`.member-card{background-color:white;${paddingDone ? "padding:20px;" : ""}${paddingDone ? "margin:16px auto;" : ""}${radiusDone ? `border-radius:${radiusValue}px;` : ""}}
h2{${colorDone ? "color:#1A3C6E;" : ""}${radiusDone ? "font-size:20px;font-weight:bold;" : ""}}
button{${colorDone ? "background-color:#E8622A;color:white;" : ""}}
.badge{padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:bold;display:inline-block;}
.active{background-color:#DCFCE7;color:#166534;}
${slot >= 6 && displayDone ? `.card-row{display:flex;gap:${gapValue}px;align-items:center;margin:12px 0;}` : ""}`}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="split-panel" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                domain={domain} setDomain={setDomain}
                html={html} setHtml={setHtml}
                css={css} setCss={setCss}
                cardBg={cardBg} setCardBg={setCardBg}
                headingColor={headingColor} setHeadingColor={setHeadingColor}
                buttonColor={buttonColor} setButtonColor={setButtonColor}
                radius={radius} setRadius={setRadius}
                padding={padding} setPadding={setPadding}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                cardLooksGood={cardLooksGood} setCardLooksGood={setCardLooksGood}
                playSound={playSound}
              />
            </div>
            <div className="split-right" style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div className="hk-card" style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
              }}>
                <LiveRender html={html || CARD_HTML} css={css} label={domain ? "Your card rendering live ✅" : ""} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
