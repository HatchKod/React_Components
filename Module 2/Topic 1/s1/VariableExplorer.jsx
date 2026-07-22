import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
  .ve-root { font-family: system-ui,-apple-system,sans-serif; background:#F9FAFB; min-height:100vh; padding:24px 16px; text-align:left; }
  .ve-root * { box-sizing:border-box; }
  .card { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); padding:24px; margin-bottom:24px; }
  .split-layout { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; margin-top:16px; }
  @media(max-width:800px){ .split-layout { grid-template-columns:1fr; } }
  .split-left, .split-right { min-width:0; }
  .dabba-row { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin:24px 0; }
  @media(max-width:500px){ .dabba-row { flex-direction:column; align-items:center; } }
  .dabba-wrap { display:flex; flex-direction:column; align-items:center; position:relative; width:120px; }
  @keyframes floatUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .badge { border-radius:20px; padding:4px 12px; font-size:0.75rem; font-weight:600; margin-top:8px; }
  .badge-string { background:#DBEAFE; color:#1D4ED8; }
  .badge-int { background:#FEF3C7; color:#B45309; }
  .badge-double { background:#FCE7F3; color:#9D174D; }
  .badge-boolean { background:#DCFCE7; color:#166534; }
  .code-line { background:#1E293B; color:#E2E8F0; border-radius:8px; padding:10px 14px; font-family:'Courier New',monospace;
    font-size:0.78rem; margin-top:8px; width:100%; max-width:100%; }
  .kw { color:#60A5FA; } .str { color:#4ADE80; } .num { color:#FB923C; } .cm { color:#6B7280; }
  .tap-hint { font-size:0.7rem; color:#9CA3AF; margin-top:4px; }
  .pattern-box { background:#F0FDF4; border:1px solid #86EFAC; border-radius:8px; padding:16px; margin-top:16px;
    animation:floatUp 0.4s ease; }
  .pattern-box pre { font-family:'Courier New',monospace; font-size:0.85rem; color:#1E293B; white-space:pre-wrap; margin:8px 0; }
  input, select, textarea { width:100%; border:1.5px solid #E2E8F0; border-radius:8px; padding:10px 12px;
    font-size:0.95rem; font-family:inherit; outline:none; transition:border 0.2s; }
  input:focus, select:focus, textarea:focus { border-color:#F59E0B; }
  input:disabled, select:disabled { background:#F3F4F6; color:#9CA3AF; }
  .hint-warn { color:#B45309; font-size:0.8rem; margin-top:4px; }
  .hint-ok { color:#16A34A; font-size:0.8rem; margin-top:4px; }
  .btn { background:#F59E0B; color:#fff; border:none; border-radius:8px; padding:12px 24px;
    font-size:1rem; font-weight:700; cursor:pointer; transition:background 0.2s; }
  .btn:hover { background:#D97706; }
  .btn:disabled { background:#D1D5DB; cursor:not-allowed; }
  .btn-outline { background:transparent; color:#F59E0B; border:2px solid #F59E0B; border-radius:8px;
    padding:10px 20px; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .btn-outline:hover { background:#FEF3C7; }
  .full-code { background:#1E293B; color:#E2E8F0; border-radius:8px; padding:20px; font-family:'Courier New',monospace;
    font-size:0.82rem; position:relative; line-height:1.7; overflow-x:auto; }
  .copy-btn { position:absolute; top:10px; right:10px; background:#334155; color:#E2E8F0; border:none;
    border-radius:6px; padding:4px 10px; font-size:0.75rem; cursor:pointer; }
  .copy-btn:hover { background:#475569; }
  .tooltip-wrap { position:relative; display:inline; cursor:pointer; }
  .tooltip-inner { position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
    background:#1E293B; color:#fff; border-radius:6px; padding:6px 10px; font-size:0.75rem;
    max-width:200px; white-space:normal; text-align:center; z-index:100; pointer-events:none;
    animation:floatUp 0.2s ease; line-height:1.4; width:max-content; max-width:200px; }
  .reveal-card { background:#FFFBEB; border-left:3px solid #F59E0B; border-radius:8px; padding:16px 20px; }
  .reveal-line { animation:floatUp 0.4s ease; display:flex; align-items:center; gap:8px; margin:8px 0; }
  .editor-area { background:#1E293B; border-radius:8px; padding:16px; }
  .editor-area textarea { background:transparent; border:none; color:#E2E8F0; font-family:'Courier New',monospace;
    font-size:0.9rem; min-height:150px; resize:vertical; outline:none; width:100%; }
  .plain-area { background:#F8FAFC; border-radius:8px; padding:16px; margin-top:12px; }
  .mute-btn { position:fixed; top:16px; right:16px; background:#fff; border:1.5px solid #E2E8F0;
    border-radius:8px; padding:6px 12px; cursor:pointer; z-index:200; font-size:1rem; box-shadow:0 2px 6px rgba(0,0,0,0.08); }
  .section-divider { border:none; border-top:2px solid #E2E8F0; margin:32px 0; }
  .success-card { background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:12px; padding:24px; margin-top:16px; }
  .type-example { font-size:0.8rem; color:#6B7280; margin-top:4px; font-style:italic; }
  label { font-size:0.9rem; font-weight:600; color:#374151; display:block; margin-bottom:6px; margin-top:14px; }
  h1 { font-size:1.6rem; font-weight:800; color:#1E293B; margin:0 0 6px; }
  h2 { font-size:1.25rem; font-weight:700; color:#1E293B; margin:0 0 6px; }
  h3 { font-size:1.05rem; font-weight:700; color:#1E293B; margin:0 0 4px; }
  p { color:#4B5563; line-height:1.6; margin:6px 0; }
  .sentence-counter { font-size:0.8rem; color:#6B7280; margin-top:4px; transition:color 0.3s; }
  .sentence-counter.ok { color:#16A34A; font-weight:600; }
  .toggle-bool { display:flex; gap:8px; margin-top:4px; }
  .toggle-bool button { padding:8px 20px; border-radius:8px; border:1.5px solid #E2E8F0;
    cursor:pointer; font-size:0.9rem; background:#fff; }
  .toggle-bool button.active { background:#DCFCE7; border-color:#16A34A; color:#166534; font-weight:700; }
  .slot-card { background:#F8FAFC; border-radius:10px; padding:16px 18px; margin-bottom:14px; }
  .slot-row { display:flex; gap:12px; }
  @media(max-width:500px){ .slot-row { flex-direction:column; } }
  .slot-input-group { flex:1; min-width:0; }
  .slot-input-group label { margin-top:0; }
  .locked-slot-line { display:flex; align-items:center; gap:8px; font-weight:700; color:#166534; margin-bottom:4px; font-size:0.85rem; }
  .dabba-shelf { display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:flex-end;
    min-height:170px; padding:12px; }
  .dabba-name-tag { background:#1E293B; color:#fff; font-size:0.72rem; font-weight:700; padding:3px 10px;
    border-radius:12px; margin-bottom:6px; white-space:nowrap; }
  .complete-tick { position:absolute; top:-6px; right:-6px; background:#16A34A; color:#fff; width:22px; height:22px;
    border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700;
    z-index:5; box-shadow:0 2px 4px rgba(0,0,0,0.2); }
  .shelf-hint { color:#9CA3AF; font-size:0.85rem; text-align:center; }
`;

const TOOLTIPS = {
  "System.out.println": "Java's mouth - prints anything to the screen",
  "public static void main": "Front door - every Java program starts here",
  "public class": "The program's container - everything lives inside here",
};

function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
    >
      {children}
      {show && <span className="tooltip-inner">{TOOLTIPS[label]}</span>}
    </span>
  );
}

const TYPE_COLORS = {
  String: { body: "#DBEAFE", border: "#1D4ED8", lid: "#BFDBFE" },
  int: { body: "#FEF3C7", border: "#B45309", lid: "#FDE68A" },
  double: { body: "#FCE7F3", border: "#9D174D", lid: "#FBCFE8" },
  boolean: { body: "#DCFCE7", border: "#166534", lid: "#BBF7D0" },
};

function LiveDabba({ type, name, value, complete, dim }) {
  if (!type) return null;
  const c = TYPE_COLORS[type];
  const hasName = !!(name && name.trim());
  const hasValue = !!(value !== undefined && value !== null && String(value).trim() !== "");
  const displayValue = type === "String" ? `"${value}"` : `${value}`;
  return (
    <div className="dabba-wrap" style={{ opacity: dim ? 0.3 : 1 }}>
      {hasName && <div className="dabba-name-tag">{name}</div>}
      <div style={{ position: "relative" }}>
        {complete && <span className="complete-tick">✓</span>}
        <svg width="100" height="130" viewBox="0 0 100 130" style={{ overflow: "visible" }}>
          <ellipse
            cx="50" cy="18" rx="42" ry="12" fill={c.lid} stroke={c.border} strokeWidth="2"
            style={{
              transformOrigin: "50px 12px",
              transform: hasValue ? "rotateX(-120deg)" : "rotateX(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
          <rect x="8" y="18" width="84" height="100" rx="6" fill={c.body} stroke={c.border} strokeWidth="2" />
          <ellipse cx="50" cy="118" rx="42" ry="10" fill={c.body} stroke={c.border} strokeWidth="2" />
          {hasValue && (
            <g
              style={{
                transform: hasValue ? "translateY(0px)" : "translateY(50px)",
                transition: "transform 0.4s ease",
              }}
            >
              <rect x="14" y="58" width="72" height="28" rx="6" fill="#fff" opacity="0.95" />
              <text x="50" y="77" textAnchor="middle" fontWeight="700" fontSize="12" fill="#1E293B" fontFamily="system-ui">
                {displayValue}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

const TYPE_OPTS = [
  { value: "String", label: "String - for words (names, plans, cities)" },
  { value: "int", label: "int - for whole numbers (age, count, room no)" },
  { value: "double", label: "double - for decimal numbers (price, fees)" },
  { value: "boolean", label: "boolean - for true/false (isBooked, isActive)" },
];

const TYPE_EXAMPLES = {
  String: 'e.g. "Sai Fitness" or "Basic Plan"',
  int: "e.g. 21 or 101",
  double: "e.g. 1500.50",
  boolean: "true or false",
};

const VALUE_PLACEHOLDERS = {
  String: "e.g. Sai Fitness",
  int: "e.g. 21",
  double: "e.g. 1500.50",
  boolean: "",
};

function useSounds() {
  const muted = useRef(false);
  const setMuted = (v) => { muted.current = v; };

  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      const makeOsc = (freq, start, dur, wave = "sine") => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };

      if (type === "add") {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.connect(gain);
        o.frequency.setValueAtTime(220, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      } else if (type === "remove") {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.connect(gain);
        o.frequency.setValueAtTime(440, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.1);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } else if (type === "correct") {
        [523, 659, 784].forEach((f, i) => makeOsc(f, i * 0.1, 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      } else if (type === "submit") {
        makeOsc(392, 0, 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      } else if (type === "warn") {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.connect(gain);
        o.frequency.setValueAtTime(330, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(277, ctx.currentTime + 0.2);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      } else if (type === "reveal") {
        [523, 659, 784, 1047].forEach((f, i) => makeOsc(f, i * 0.12, 0.12));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      } else if (type === "tick") {
        makeOsc(800, 0, 0.05, "triangle");
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      }
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {}
  }, []);

  return { play, setMuted, muted };
}

function validateName(name) {
  if (!name) return null;
  if (/\s/.test(name)) return "space";
  if (/^[A-Z]/.test(name)) return "capital";
  return "ok";
}

function isSlotComplete(slot) {
  if (!slot.type || !slot.name) return false;
  if (validateName(slot.name) !== "ok") return false;
  if (slot.type === "boolean") return slot.boolTouched;
  return slot.value.trim() !== "";
}

function CodeLine({ type, name, value }) {
  if (!type) {
    return (
      <div className="code-line" style={{ color: "#94A3B8", fontStyle: "italic" }}>
        Select a type to start building this line...
      </div>
    );
  }
  const comment =
    type === "String" ? "dabba for words" :
    type === "int" ? "dabba for numbers" :
    type === "double" ? "dabba for decimals" : "dabba for yes/no";
  const valueNode =
    type === "String" ? <span className="str">"{value || "value"}"</span> :
    (type === "int" || type === "double") ? <span className="num">{value || "0"}</span> :
    <span className="kw">{value || "true"}</span>;
  return (
    <div className="code-line">
      <span className="kw">{type}</span> {name || "name"} = {valueNode}; <span className="cm">// {comment}</span>
    </div>
  );
}

function SlotRow({ index, slot, hint, locked, ready, onType, onName, onValue, onBoolToggle, onConfirm }) {
  if (locked) {
    return (
      <div className="slot-card">
        <div className="locked-slot-line">✓ Slot {index + 1} complete</div>
        <CodeLine type={slot.type} name={slot.name} value={slot.value} />
      </div>
    );
  }
  return (
    <div className="slot-card">
      <h3>Variable slot {index + 1}</h3>
      <div className="slot-row">
        <div className="slot-input-group">
          <label>Type</label>
          <select value={slot.type} onChange={(e) => onType(e.target.value)}>
            <option value="">Select a type...</option>
            {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {slot.type && <div className="type-example">{TYPE_EXAMPLES[slot.type]}</div>}
        </div>
        <div className="slot-input-group">
          <label>Name</label>
          <input placeholder="e.g. gymName" value={slot.name} onChange={(e) => onName(e.target.value)} />
          {hint === "space" && <div className="hint-warn">⚠️ No spaces. Try camelCase.</div>}
          {hint === "capital" && <div className="hint-warn">⚠️ Start with a small letter.</div>}
          {hint === "ok" && <div className="hint-ok">✓ Looks good</div>}
        </div>
        <div className="slot-input-group">
          <label>Value</label>
          {slot.type === "boolean" ? (
            <div className="toggle-bool">
              <button className={slot.value === "true" ? "active" : ""} onClick={() => onBoolToggle("true")}>true</button>
              <button className={slot.value === "false" ? "active" : ""} onClick={() => onBoolToggle("false")}>false</button>
            </div>
          ) : (
            <input
              placeholder={VALUE_PLACEHOLDERS[slot.type] || "Enter a value"}
              value={slot.value}
              onChange={(e) => onValue(e.target.value)}
              disabled={!slot.type}
            />
          )}
        </div>
      </div>
      <CodeLine type={slot.type} name={slot.name} value={slot.value} />
      {ready && (
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={onConfirm}>
            {index < 2 ? "Confirm & next slot →" : "Confirm slot →"}
          </button>
        </div>
      )}
    </div>
  );
}

function FullProgram({ vars }) {
  const [copied, setCopied] = useState(false);
  const fmtVal = (v) => (v.type === "String" ? `"${v.value}"` : v.value);
  const code = `// the program's name ↓
public class MyFirstProgram {

    // front door - Java starts here ↓
    public static void main(String[] args) {

        // your dabbas ↓
${vars.map((v) => `        ${v.type} ${v.name} = ${fmtVal(v)};`).join("\n")}

        // Java's mouth - speaks to terminal ↓
${vars.map((v) => `        System.out.println("${v.name} = " + ${v.name});`).join("\n")}

    } // close front door

} // close program`;

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const L = ({ i = 0, children }) => (
    <div style={{ paddingLeft: `${i * 2}ch`, lineHeight: "1.75", whiteSpace: "pre" }}>{children}</div>
  );
  const valJSX = (v) =>
    v.type === "String" ? <><span className="str">"{v.value}"</span></> :
    v.type === "boolean" ? <span className="kw">{v.value}</span> :
    <span className="num">{v.value}</span>;

  return (
    <div className="full-code" style={{ fontFamily: "'Courier New',Consolas,monospace", fontSize: "0.85rem" }}>
      <button className="copy-btn" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
      <L><span className="cm">{"// the program's name ↓"}</span></L>
      <L><Tooltip label="public class"><span className="kw">public class</span></Tooltip>{" MyFirstProgram {"}</L>
      <L>&nbsp;</L>
      <L i={1}><span className="cm">{"// front door - Java starts here ↓"}</span></L>
      <L i={1}><Tooltip label="public static void main"><span className="kw">public static void main</span></Tooltip>{"("}<span className="kw">String</span>{"[] args) {"}</L>
      <L>&nbsp;</L>
      <L i={2}><span className="cm">{"// your dabbas ↓"}</span></L>
      {vars.map((v, i) => (
        <L key={i} i={2}><span className="kw">{v.type}</span>{` ${v.name} = `}{valJSX(v)}{";"}</L>
      ))}
      <L>&nbsp;</L>
      <L i={2}><span className="cm">{"// Java's mouth - speaks to terminal ↓"}</span></L>
      {vars.map((v, i) => (
        <L key={i} i={2}><Tooltip label="System.out.println"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{`"${v.name} = " + ${v.name}`}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
      ))}
      <L>&nbsp;</L>
      <L i={1}>{"} "}<span className="cm">{"// close front door"}</span></L>
      <L>&nbsp;</L>
      <L>{"} "}<span className="cm">{"// close program"}</span></L>
    </div>
  );
}

const REVEAL_LINES = [
  ["Variable", "a dabba with a name"],
  ["Data Type", "the label saying what fits inside"],
  ["System.out.println", "Java's mouth - speaks to screen"],
  ["public static void main", "the front door - starts here"],
];

function parseProjectVars(code) {
  const lines = code.split("\n");
  const result = [];
  const seen = new Set();
  const lineRe = /\b(String|int|double|boolean)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?);?\s*(?:\/\/.*)?$/;
  for (const line of lines) {
    const m = line.match(lineRe);
    if (!m) continue;
    const [, type, name, rawVal] = m;
    if (seen.has(name) || validateName(name) !== "ok") continue;
    let value = rawVal.trim();
    if (type === "String") value = value.replace(/^["']|["']$/g, "");
    if (!value) continue;
    seen.add(name);
    result.push({ type, name, value });
  }
  return result;
}

const emptySlot = () => ({ type: "", name: "", value: "", boolTouched: false });

export default function VariableExplorer() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const { play, setMuted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);

  // Phase 1 - guided slots
  const [slots, setSlots] = useState([emptySlot(), emptySlot(), emptySlot()]);
  const [completed, setCompleted] = useState([false, false, false]);
  const [visibleCount, setVisibleCount] = useState(1);
  const [nameHints, setNameHints] = useState([null, null, null]);
  const [showPattern, setShowPattern] = useState(false);
  const [showFullProg, setShowFullProg] = useState(false);
  const [revealLines, setRevealLines] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  // Section 2 - free project
  const [editorCode, setEditorCode] = useState("");
  const [plainText, setPlainText] = useState("");
  const [editorHint, setEditorHint] = useState(null);
  const [projectVars, setProjectVars] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showSection2, setShowSection2] = useState(false);

  const allSlotsComplete = completed.every(Boolean);

  useEffect(() => {
    if (allSlotsComplete && !showPattern) {
      play("correct");
      setShowPattern(true);
    }
  }, [allSlotsComplete]);

  const handleConfirmSlot = (i) => {
    play("add");
    setCompleted((prev) => prev.map((c, idx) => (idx === i ? true : c)));
    if (i < 2) setVisibleCount((v) => Math.max(v, i + 2));
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setMuted(next);
  };

  const updateSlot = (i, patch) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const handleType = (i, val) => updateSlot(i, { type: val, value: "", boolTouched: false });
  const handleName = (i, val) => {
    updateSlot(i, { name: val });
    const vld = validateName(val);
    if (vld === "space" || vld === "capital") play("warn");
    setNameHints((prev) => prev.map((h, idx) => (idx === i ? vld : h)));
  };
  const handleValue = (i, val) => updateSlot(i, { value: val });
  const handleBoolToggle = (i, val) => updateSlot(i, { value: val, boolTouched: true });

  const handleShowFull = () => {
    play("tick");
    setShowFullProg(true);
    setTimeout(() => {
      play("reveal");
      setShowReveal(true);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        play("tick");
        setRevealLines(count);
        if (count >= REVEAL_LINES.length) clearInterval(interval);
      }, 450);
    }, 400);
  };

  const countSentences = (text) => {
    if (!text.trim()) return 0;
    return (text.match(/[.!?]+/g) || []).length;
  };

  const handleEditorChange = (e) => {
    const v = e.target.value;
    setEditorCode(v);
    const lines = v.split("\n");
    let hint = null;
    for (const line of lines) {
      const m = line.match(/\b(String|int|double|boolean)\s+([a-zA-Z_]\S*\s+\S)/);
      if (m) { hint = "space"; break; }
      const m2 = line.match(/\b(String|int|double|boolean)\s+([A-Z])/);
      if (m2) { hint = "capital"; break; }
    }
    if (hint) play("warn");
    setEditorHint(hint);
    setProjectVars(parseProjectVars(v));
  };

  const sentences = countSentences(plainText);
  const canSubmit = editorCode.trim() && sentences >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    play("submit");
    setSubmitted(true);
  };

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m2-t1-s1-variable-explorer",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        editorCode,
        reflectionText: plainText,
        projectVars,
      },
      metadata: { subtopicId, taskId },
      completedAt: new Date().toISOString(),
    }, "*");
  }, [submitted]);

  const fullProgVars = slots.map((s) => ({ type: s.type, name: s.name, value: s.value }));

  return (
    <>
      <style>{STYLE}</style>
      <button className="mute-btn" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
      <div className="ve-root">

        {/* ===== PHASE 1 - GUIDED ===== */}
        <div className="card">
          <h1>Every variable is a dabba with a name 🫙</h1>
          <p>Fill in each variable slot on the left. Watch your dabba come to life on the right.</p>

          <div className="split-layout">
            <div className="split-left">
              {slots.slice(0, visibleCount).map((s, i) => (
                <SlotRow
                  key={i}
                  index={i}
                  slot={s}
                  hint={nameHints[i]}
                  locked={completed[i]}
                  ready={!completed[i] && isSlotComplete(s)}
                  onType={(v) => handleType(i, v)}
                  onName={(v) => handleName(i, v)}
                  onValue={(v) => handleValue(i, v)}
                  onBoolToggle={(v) => handleBoolToggle(i, v)}
                  onConfirm={() => handleConfirmSlot(i)}
                />
              ))}
            </div>
            <div className="split-right">
              <div className="dabba-shelf">
                {slots.slice(0, visibleCount).map((s, i) => (
                  <LiveDabba key={i} type={s.type} name={s.name} value={s.value} complete={completed[i]} />
                ))}
                {!slots[0].type && <p className="shelf-hint">Pick a type in Slot 1 to see your first dabba appear here.</p>}
              </div>
            </div>
          </div>

          {showPattern && (
            <div className="pattern-box">
              <p style={{ fontWeight: 700, marginBottom: 8 }}>See the pattern?</p>
              <pre>  [Type] [name] = [value];</pre>
              <p style={{ margin: "8px 0 4px" }}><strong>Type</strong> → what kind of dabba</p>
              <p style={{ margin: "4px 0" }}><strong>Name</strong> → what the dabba is called</p>
              <p style={{ margin: "4px 0" }}><strong>Value</strong> → what is stored inside</p>
              <p style={{ marginTop: 12, fontWeight: 600 }}>That is all a variable is. Every time. No exceptions.</p>
            </div>
          )}
        </div>

        {/* ===== YOUR PROGRAM ===== */}
        {showPattern && (
          <div className="card">
            <h2>Your 3 variables 🎉</h2>
            <p>Those three lines? You just wrote real Java code.</p>

            {!showFullProg && (
              <button className="btn-outline" style={{ marginTop: 16 }} onClick={handleShowFull}>
                See it all in one program →
              </button>
            )}

            {showFullProg && (
              <>
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>Your complete Java program:</h3>
                  <FullProgram vars={fullProgVars} />
                </div>

                <div className="card" style={{ marginTop: 20, background: "#FEF3C7", border: "1px solid #F59E0B" }}>
                  <h3>Try this in VS Code:</h3>
                  <p>Copy this into VS Code. Change the values to YOUR details - your name, age, city, and your variable.</p>
                  <p>Save the file as <strong>MyFirstProgram.java</strong></p>
                  <p>In the VS Code terminal, type:</p>
                  <div className="full-code" style={{ marginTop: 8, padding: "10px 16px" }}>
                    <div><span className="str">javac MyFirstProgram.java</span></div>
                    <div><span className="str">java MyFirstProgram</span></div>
                  </div>
                  <p style={{ marginTop: 10 }}>See your details appear. That is YOUR first Java program. Running. Real.</p>
                </div>
              </>
            )}

            {showReveal && (
              <div className="reveal-card" style={{ marginTop: 20 }}>
                <h2 style={{ marginBottom: 12 }}>You just learned 4 Java concepts 🎉</h2>
                {REVEAL_LINES.slice(0, revealLines).map(([term, def], i) => (
                  <div key={i} className="reveal-line">
                    <span style={{ fontSize: "1.1rem" }}>✓</span>
                    <span><strong>{term}</strong> → {def}</span>
                  </div>
                ))}
                {revealLines >= REVEAL_LINES.length && (
                  <p style={{ marginTop: 16, fontWeight: 700, fontSize: "1.05rem", textAlign: "center" }}>
                    Every Java program you write for the next 8 weeks uses all four of these.<br />
                    You already understand them.
                  </p>
                )}
              </div>
            )}

            {showReveal && revealLines >= REVEAL_LINES.length && !showSection2 && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button className="btn" onClick={() => setShowSection2(true)}>
                  Continue to your project task →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PHASE 2 - FREE PROJECT ===== */}
        {showSection2 && (
          <>
            <hr className="section-divider" />
            <div className="card">
              <h2>Connect this to YOUR project 🏗️</h2>
              <p>Think about the main thing your app manages.</p>
              <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "14px 16px", margin: "12px 0" }}>
                <p style={{ margin: "4px 0" }}>Gym app → manages gym members</p>
                <p style={{ margin: "4px 0" }}>Hotel app → manages hotel rooms</p>
                <p style={{ margin: "4px 0" }}>Mess app → manages meal records</p>
                <p style={{ margin: "4px 0" }}>Chai shop → manages orders</p>
              </div>
              <p>What are the <strong>3 most important details</strong> about that main thing?</p>
              <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "12px 16px", margin: "10px 0" }}>
                <p style={{ margin: "4px 0" }}>For a gym member it might be:</p>
                <p style={{ margin: "4px 0" }}>→ <code>String memberName = "Ravi";</code></p>
                <p style={{ margin: "4px 0" }}>→ <code>int memberAge = 21;</code></p>
                <p style={{ margin: "4px 0" }}>→ <code>String memberPlan = "Basic";</code></p>
              </div>
              <p>Write <strong>3 variables</strong> for YOUR project's main thing - in correct Java syntax.</p>
              <div style={{ background: "#FEF3C7", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Words → <code>String</code> &nbsp;|&nbsp; Whole numbers → <code>int</code> &nbsp;|&nbsp;
                  Decimals → <code>double</code> &nbsp;|&nbsp; Yes/No → <code>boolean</code><br />
                  No spaces in variable names. Start with small letter. Use camelCase → <code>memberName</code>
                </p>
              </div>
              <p style={{ marginTop: 12, fontWeight: 600 }}>Your own thinking only. No copying. No ChatGPT.</p>
            </div>

            <div className="card">
              <div className="split-layout">
                <div className="split-left">
                  <h3>Write your 3 variables here:</h3>
                  <div className="editor-area">
                    <textarea
                      value={editorCode}
                      onChange={handleEditorChange}
                      onPaste={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      placeholder={"// Write your 3 project variables below\n// Replace the blanks with real values\n\nString __________ = '__________';  // stores the ____\nint __________ = 0;                // stores the ____\nString __________ = '__________';  // stores the ____"}
                      style={{ color: editorCode ? "#E2E8F0" : "#6B7280" }}
                    />
                  </div>
                  {editorHint === "space" && <div className="hint-warn">⚠️ Variable names cannot have spaces.</div>}
                  {editorHint === "capital" && <div className="hint-warn">⚠️ Start variable names with a small letter.</div>}

                  <div className="plain-area" style={{ marginTop: 16 }}>
                    <h3>In plain words:</h3>
                    <p style={{ fontSize: "0.9rem" }}>In one sentence - what does each variable store about your project's main thing? Write it like you are explaining to a friend.</p>
                    <textarea
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      placeholder={"memberName stores the name of each gym member.\nmemberAge stores how old they are.\nmemberPlan stores which plan they joined on."}
                      style={{ minHeight: 100, marginTop: 8 }}
                    />
                    <div className={`sentence-counter ${sentences >= 1 ? "ok" : ""}`}>
                      {sentences} sentence{sentences !== 1 ? "s" : ""} written {sentences >= 1 ? "✓" : ""}
                    </div>
                  </div>

                  {canSubmit && !submitted && (
                    <div style={{ marginTop: 20 }}>
                      <button className="btn" onClick={handleSubmit}>
                        These are my first project variables →
                      </button>
                    </div>
                  )}

                  {submitted && (
                    <div className="success-card" style={{ marginTop: 20 }}>
                      <h2 style={{ marginBottom: 12 }}>Your first project code is written. 🎯</h2>
                      <p>Those 3 variables?</p>
                      <p>In <strong>subtopic 1.2.1</strong> - they become the fields inside your Java class.</p>
                      <p>In <strong>Module 2</strong> - Spring Boot reads that class and creates your database table.</p>
                      <p>In <strong>Module 4</strong> - React displays those values on your app's screen.</p>
                      <p style={{ marginTop: 14, fontWeight: 700, fontSize: "1.05rem" }}>
                        Every line you write from here builds directly on what you just wrote.<br /><br />
                        This is not a tutorial exercise.<br />
                        This is your actual project starting.
                      </p>
                    </div>
                  )}
                </div>

                <div className="split-right">
                  <h3 style={{ opacity: 0.6 }}>Phase 1 dabbas</h3>
                  <div className="dabba-shelf">
                    {slots.map((s, i) => (
                      <LiveDabba key={i} type={s.type} name={s.name} value={s.value} complete={completed[i]} dim />
                    ))}
                  </div>
                  <h3 style={{ marginTop: 12 }}>Your project dabbas</h3>
                  <div className="dabba-shelf">
                    {projectVars.map((v, i) => (
                      <LiveDabba key={v.name + i} type={v.type} name={v.name} value={v.value} complete={true} />
                    ))}
                    {projectVars.length === 0 && (
                      <p className="shelf-hint">Write a valid variable on the left to see it appear here.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
