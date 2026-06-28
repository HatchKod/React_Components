import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
  .ve-root { font-family: system-ui,-apple-system,sans-serif; background:#F9FAFB; min-height:100vh; padding:24px 16px; text-align:left; }
  .ve-root * { box-sizing:border-box; }
  .card { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); padding:24px; margin-bottom:24px; }
  .dabba-row { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin:24px 0; }
  @media(max-width:500px){ .dabba-row { flex-direction:column; align-items:center; } }
  .dabba-wrap { display:flex; flex-direction:column; align-items:center; position:relative; width:120px; }
  .bubble { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.15); padding:8px 14px;
    font-size:1.2rem; color:#1E293B; font-weight:700; margin-bottom:8px;
    animation:floatUp 0.3s ease; position:relative; }
  .bubble::after { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
    width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:8px solid #fff; }
  @keyframes floatUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .badge { border-radius:20px; padding:4px 12px; font-size:0.75rem; font-weight:600; margin-top:8px; }
  .badge-string { background:#DBEAFE; color:#1D4ED8; }
  .badge-int { background:#FEF3C7; color:#B45309; }
  .badge-double { background:#FCE7F3; color:#9D174D; }
  .badge-boolean { background:#DCFCE7; color:#166534; }
  .code-line { background:#1E293B; color:#E2E8F0; border-radius:8px; padding:10px 14px; font-family:'Courier New',monospace;
    font-size:0.78rem; margin-top:8px; width:100%; max-width:240px; }
  .kw { color:#60A5FA; } .str { color:#4ADE80; } .num { color:#FB923C; } .cm { color:#6B7280; }
  .tap-hint { font-size:0.7rem; color:#9CA3AF; margin-top:4px; }
  .pattern-box { background:#F0FDF4; border:1px solid #86EFAC; border-radius:8px; padding:16px; margin-top:16px;
    animation:floatUp 0.4s ease; }
  .pattern-box pre { font-family:'Courier New',monospace; font-size:0.85rem; color:#1E293B; white-space:pre-wrap; margin:8px 0; }
  input, select, textarea { width:100%; border:1.5px solid #E2E8F0; border-radius:8px; padding:10px 12px;
    font-size:0.95rem; font-family:inherit; outline:none; transition:border 0.2s; }
  input:focus, select:focus, textarea:focus { border-color:#F59E0B; }
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
`;

const TOOLTIPS = {
  "System.out.println": "Java's mouth — prints anything to the screen",
  "public static void main": "Front door — every Java program starts here",
  "public class": "The program's container — everything lives inside here",
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

function SteelDabba({ label, value, type, isOpen, onClick }) {
  const bodyColor = "#FEF3C7";
  const border = "#B45309";
  const lid = "#FDE68A";
  return (
    <div className="dabba-wrap">
      {isOpen && (
        <div className="bubble">{type === "String" ? `"${value}"` : `${value}`}</div>
      )}
      <svg
        width="100"
        height="130"
        viewBox="0 0 100 130"
        style={{ cursor: "pointer", overflow: "visible" }}
        onClick={onClick}
      >
        {/* lid */}
        <ellipse
          cx="50" cy="18" rx="42" ry="12" fill={lid} stroke={border} strokeWidth="2"
          style={{
            transformOrigin: "50px 12px",
            transform: isOpen ? "rotateX(-120deg)" : "rotateX(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
        {/* body */}
        <rect x="8" y="18" width="84" height="100" rx="6" fill={bodyColor} stroke={border} strokeWidth="2" />
        {/* bottom ellipse */}
        <ellipse cx="50" cy="118" rx="42" ry="10" fill={bodyColor} stroke={border} strokeWidth="2" />
        {/* label strip */}
        <rect x="18" y="50" width="64" height="30" rx="4" fill="#fff" />
        <text x="50" y="70" textAnchor="middle" fontWeight="700" fontSize="13" fill="#1E293B" fontFamily="system-ui">{label}</text>
      </svg>
      {!isOpen && <span className="tap-hint">Tap to open</span>}
    </div>
  );
}

const DABBAS = [
  { label: "name", value: "Ravi", type: "String" },
  { label: "age", value: 21, type: "int" },
  { label: "city", value: "Karimnagar", type: "String" },
];

const CODE_LINES = [
  <>
    <span className="kw">String</span> name = <span className="str">"Ravi"</span>; <span className="cm">// dabba for words</span>
  </>,
  <>
    <span className="kw">int</span> age = <span className="num">21</span>; <span className="cm">// dabba for numbers</span>
  </>,
  <>
    <span className="kw">String</span> city = <span className="str">"Karimnagar"</span>; <span className="cm">// dabba for words</span>
  </>,
];

const TYPE_OPTS = [
  { value: "String", label: "String — for words (names, plans, cities)" },
  { value: "int", label: "int — for whole numbers (age, count, room no)" },
  { value: "double", label: "double — for decimal numbers (price, fees)" },
  { value: "boolean", label: "boolean — for true/false (isBooked, isActive)" },
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

function CodeLine({ type, name, value }) {
  const val = type === "String" ? `"${value}"` : value;
  return (
    <div className="code-line" style={{ maxWidth: "100%", marginTop: 8 }}>
      <span className="kw">{type}</span> {name} = {type === "String" ? <span className="str">"{value}"</span> : type === "int" || type === "double" ? <span className="num">{value}</span> : <span className="kw">{value}</span>}; <span className="cm">// {type === "String" ? "dabba for words" : type === "int" ? "dabba for numbers" : type === "double" ? "dabba for decimals" : "dabba for yes/no"}</span>
    </div>
  );
}

function FullProgram({ custom }) {
  const [copied, setCopied] = useState(false);
  const customVal = custom.type === "String" ? `"${custom.value}"` : custom.value;
  const code = `// the program's name ↓
public class MyFirstProgram {

    // front door — Java starts here ↓
    public static void main(String[] args) {

        // your dabbas ↓
        String name = "Ravi";         // dabba: words
        int age = 21;                 // dabba: numbers
        String city = "Karimnagar";   // dabba: words
        ${custom.type} ${custom.name} = ${customVal}; // your dabba

        // Java's mouth — speaks to terminal ↓
        System.out.println("My name is " + name);
        System.out.println("My age is " + age);
        System.out.println("I am from " + city);
        System.out.println("${custom.name} = " + ${custom.name});

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
  const customValJSX = custom.type === "String"
    ? <><span className="str">"{custom.value}"</span></>
    : custom.type === "boolean"
    ? <span className="kw">{custom.value}</span>
    : <span className="num">{custom.value}</span>;

  return (
    <div className="full-code" style={{ fontFamily: "'Courier New',Consolas,monospace", fontSize: "0.85rem" }}>
      <button className="copy-btn" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
      <L><span className="cm">{"// the program's name ↓"}</span></L>
      <L><Tooltip label="public class"><span className="kw">public class</span></Tooltip>{" MyFirstProgram {"}</L>
      <L>&nbsp;</L>
      <L i={1}><span className="cm">{"// front door — Java starts here ↓"}</span></L>
      <L i={1}><Tooltip label="public static void main"><span className="kw">public static void main</span></Tooltip>{"("}<span className="kw">String</span>{"[] args) {"}</L>
      <L>&nbsp;</L>
      <L i={2}><span className="cm">{"// your dabbas ↓"}</span></L>
      <L i={2}><span className="kw">String</span>{" name = "}<span className="str">"Ravi"</span>{";"}<span className="cm">{"         // dabba: words"}</span></L>
      <L i={2}><span className="kw">int</span>{" age = "}<span className="num">21</span>{";"}<span className="cm">{"                 // dabba: numbers"}</span></L>
      <L i={2}><span className="kw">String</span>{" city = "}<span className="str">"Karimnagar"</span>{";"}<span className="cm">{"   // dabba: words"}</span></L>
      <L i={2}><span className="kw">{custom.type}</span>{` ${custom.name} = `}{customValJSX}{";"}<span className="cm">{" // your dabba"}</span></L>
      <L>&nbsp;</L>
      <L i={2}><span className="cm">{"// Java's mouth — speaks to terminal ↓"}</span></L>
      <L i={2}><Tooltip label="System.out.println"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"My name is \" + name"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
      <L i={2}><Tooltip label="System.out.println"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"My age is \" + age"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
      <L i={2}><Tooltip label="System.out.println"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"I am from \" + city"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
      <L i={2}><Tooltip label="System.out.println"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{`"${custom.name} = " + ${custom.name}`}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
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
  ["System.out.println", "Java's mouth — speaks to screen"],
  ["public static void main", "the front door — starts here"],
];

export default function VariableExplorer() {
  const { play, setMuted, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const [opened, setOpened] = useState([false, false, false]);
  const [showPattern, setShowPattern] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create your own dabba
  const [cType, setCType] = useState("");
  const [cName, setCName] = useState("");
  const [cValue, setCValue] = useState("");
  const [boolVal, setBoolVal] = useState("true");
  const [nameHint, setNameHint] = useState(null);
  const [customDabba, setCustomDabba] = useState(null);
  const [showFullProg, setShowFullProg] = useState(false);
  const [revealLines, setRevealLines] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  // Section 2
  const [editorCode, setEditorCode] = useState("");
  const [plainText, setPlainText] = useState("");
  const [editorHint, setEditorHint] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSection2, setShowSection2] = useState(false);

  const allOpen = opened.every(Boolean);

  useEffect(() => {
    if (allOpen && !showPattern) {
      play("correct");
      setShowPattern(true);
      setTimeout(() => setShowCreateForm(true), 600);
    }
  }, [allOpen]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setMuted(next);
  };

  const openDabba = (i) => {
    if (opened[i]) return;
    play("add");
    setOpened((prev) => { const n = [...prev]; n[i] = true; return n; });
  };

  const nameValidation = validateName(cName);
  const effectiveValue = cType === "boolean" ? boolVal : cValue;
  const canCreate = cType && cName && nameValidation === "ok" && (cType === "boolean" ? true : cValue.trim());

  const handleNameChange = (e) => {
    const v = e.target.value;
    setCName(v);
    const vld = validateName(v);
    if (vld === "space" || vld === "capital") play("warn");
    setNameHint(vld);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    play("correct");
    setCustomDabba({ type: cType, name: cName, value: effectiveValue });
  };

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
    // Check for space in variable name
    const lines = v.split("\n");
    for (const line of lines) {
      const m = line.match(/\b(String|int|double|boolean)\s+([a-zA-Z_]\S*\s+\S)/);
      if (m) { play("warn"); setEditorHint("space"); return; }
      const m2 = line.match(/\b(String|int|double|boolean)\s+([A-Z])/);
      if (m2) { play("warn"); setEditorHint("capital"); return; }
    }
    setEditorHint(null);
  };

  const sentences = countSentences(plainText);
  const canSubmit = editorCode.trim() && sentences >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    play("submit");
    setSubmitted(true);
  };

  return (
    <>
      <style>{STYLE}</style>
      <button className="mute-btn" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
      <div className="ve-root">

        {/* ===== SECTION 1 ===== */}
        <div className="card">
          <h1>Every variable is a dabba with a name 🫙</h1>
          <p>Click each dabba to see what is inside. Then create your own.</p>

          <div className="dabba-row">
            {DABBAS.map((d, i) => (
              <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <SteelDabba {...d} isOpen={opened[i]} onClick={() => openDabba(i)} />
                {opened[i] && (
                  <>
                    <span className={`badge badge-${d.type.toLowerCase()}`}>
                      {d.type === "String" ? "String — holds words" : "int — holds numbers"}
                    </span>
                    <div className="code-line">{CODE_LINES[i]}</div>
                  </>
                )}
              </div>
            ))}
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

        {/* ===== PART B ===== */}
        {showCreateForm && !customDabba && (
          <div className="card">
            <h2>Now make your own dabba 🫙</h2>
            <p>Think about your project. What detail do you want to store?</p>

            <label>What type?</label>
            <select value={cType} onChange={(e) => { setCType(e.target.value); setCValue(""); }}>
              <option value="">Select a type...</option>
              {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {cType && <div className="type-example">{TYPE_EXAMPLES[cType]}</div>}

            <label>Name your dabba</label>
            <input
              placeholder="e.g. gymName"
              value={cName}
              onChange={handleNameChange}
            />
            {nameHint === "space" && <div className="hint-warn">⚠️ No spaces allowed. Try: gymName instead of gym name</div>}
            {nameHint === "capital" && <div className="hint-warn">⚠️ Start with small letter. Try: gymName instead of GymName</div>}
            {nameHint === "ok" && <div className="hint-ok">✓ Looks good</div>}

            <label>What goes inside?</label>
            {cType === "boolean" ? (
              <div className="toggle-bool">
                <button className={boolVal === "true" ? "active" : ""} onClick={() => setBoolVal("true")}>true</button>
                <button className={boolVal === "false" ? "active" : ""} onClick={() => setBoolVal("false")}>false</button>
              </div>
            ) : (
              <input
                placeholder={VALUE_PLACEHOLDERS[cType] || "Enter a value"}
                value={cValue}
                onChange={(e) => setCValue(e.target.value)}
                disabled={!cType}
              />
            )}

            <div style={{ marginTop: 20 }}>
              <button className="btn" disabled={!canCreate} onClick={handleCreate}>Create my dabba →</button>
            </div>
          </div>
        )}

        {/* ===== CUSTOM DABBA RESULT ===== */}
        {customDabba && (
          <div className="card">
            <h2>Your dabba 🎉</h2>
            <div className="dabba-row">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <SteelDabba
                  label={customDabba.name}
                  value={customDabba.value}
                  type={customDabba.type}
                  isOpen={true}
                  onClick={() => {}}
                />
                <span className={`badge badge-${customDabba.type.toLowerCase()}`}>
                  {customDabba.type}
                </span>
                <CodeLine type={customDabba.type} name={customDabba.name} value={customDabba.value} />
              </div>
            </div>
            <div className="pattern-box" style={{ marginTop: 12 }}>
              <p style={{ fontWeight: 700 }}>You just created a Java variable.</p>
              <p>That line of code is yours. You wrote it. 🎉</p>
            </div>

            {!showFullProg && (
              <button className="btn-outline" style={{ marginTop: 16 }} onClick={handleShowFull}>
                See it all in one program →
              </button>
            )}

            {/* ===== PART C ===== */}
            {showFullProg && (
              <>
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>Your complete Java program:</h3>
                  <FullProgram custom={customDabba} />
                </div>

                <div className="card" style={{ marginTop: 20, background: "#FEF3C7", border: "1px solid #F59E0B" }}>
                  <h3>Try this in VS Code:</h3>
                  <p>Copy this into VS Code. Change the values to YOUR details — your name, age, city, and your variable.</p>
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

            {/* ===== REVEAL CARD ===== */}
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

        {/* ===== SECTION 2 ===== */}
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
              <p>Write <strong>3 variables</strong> for YOUR project's main thing — in correct Java syntax.</p>
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
              {/* Code editor */}
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

              {/* Plain words */}
              <div className="plain-area" style={{ marginTop: 16 }}>
                <h3>In plain words:</h3>
                <p style={{ fontSize: "0.9rem" }}>In one sentence — what does each variable store about your project's main thing? Write it like you are explaining to a friend.</p>
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
                  <p>In <strong>subtopic 1.2.1</strong> — they become the fields inside your Java class.</p>
                  <p>In <strong>Module 2</strong> — Spring Boot reads that class and creates your database table.</p>
                  <p>In <strong>Module 4</strong> — React displays those values on your app's screen.</p>
                  <p style={{ marginTop: 14, fontWeight: 700, fontSize: "1.05rem" }}>
                    Every line you write from here builds directly on what you just wrote.<br /><br />
                    This is not a tutorial exercise.<br />
                    This is your actual project starting.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
