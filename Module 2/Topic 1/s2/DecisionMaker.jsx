import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
  .dm-root { font-family:system-ui,-apple-system,sans-serif; background:#F9FAFB; min-height:100vh; padding:24px 16px 48px; text-align:left; }
  .dm-root * { box-sizing:border-box; }
  .dm-wrap { max-width:1100px; margin:0 auto; }

  /* Card */
  .dm-card { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); padding:24px; margin-bottom:24px; }

  /* Split layout */
  .dm-split { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; margin-top:16px; }
  @media(max-width:800px){ .dm-split { grid-template-columns:1fr; } }
  .dm-split-left, .dm-split-right { min-width:0; }

  /* Mute */
  .dm-mute { position:fixed; top:16px; right:16px; background:#fff; border:1.5px solid #E2E8F0;
    border-radius:8px; padding:6px 12px; cursor:pointer; z-index:200; font-size:1rem;
    box-shadow:0 2px 6px rgba(0,0,0,0.08); }

  /* Toggle */
  .dm-toggle-wrap { display:flex; align-items:center; gap:16px; justify-content:center; margin:16px 0; flex-wrap:wrap; }
  .dm-toggle-track { width:64px; height:32px; border-radius:16px; background:#D1D5DB; cursor:pointer;
    position:relative; transition:background 0.3s ease; flex-shrink:0; border:none; }
  .dm-toggle-track.on { background:#3B82F6; }
  .dm-toggle-thumb { width:26px; height:26px; border-radius:50%; background:#fff; position:absolute;
    top:3px; left:3px; transition:transform 0.3s ease; box-shadow:0 1px 4px rgba(0,0,0,0.25); }
  .dm-toggle-track.on .dm-toggle-thumb { transform:translateX(32px); }
  .dm-toggle-lbl { font-size:0.88rem; font-weight:600; min-width:60px; }
  .dm-toggle-lbl-left { text-align:right; color:#9CA3AF; }
  .dm-toggle-lbl-left.active { color:#1D4ED8; }
  .dm-toggle-lbl-right { text-align:left; color:#9CA3AF; }
  .dm-toggle-lbl-right.active { color:#1D4ED8; }

  /* Sky visual */
  .dm-sky { border-radius:10px; height:80px; display:flex; align-items:center; justify-content:center;
    margin:12px 0; position:relative; overflow:hidden; transition:background 0.4s; }
  .dm-sky-sun { background:linear-gradient(135deg,#93C5FD,#FDE68A); }
  .dm-sky-rain { background:linear-gradient(135deg,#94A3B8,#64748B); }
  .dm-sky-neutral { background:#F1F5F9; }

  /* Rain drops */
  .dm-drop { position:absolute; width:2px; border-radius:1px; background:rgba(147,210,255,0.85);
    animation:dmRain linear infinite; }
  @keyframes dmRain { from{transform:translateY(-20px);opacity:1} to{transform:translateY(90px);opacity:0} }

  /* Variable display pill */
  .dm-var { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:8px 14px;
    font-family:'Courier New',monospace; font-size:0.82rem; color:#374151; margin:8px 0;
    text-align:center; }

  /* Code block */
  .dm-code { background:#1E293B; color:#E2E8F0; border-radius:10px; padding:16px 20px;
    font-family:'Courier New',monospace; font-size:0.8rem; line-height:1.85; margin:14px 0;
    overflow-x:auto; white-space:pre-wrap; }
  .dm-kw  { color:#60A5FA; }
  .dm-val { color:#FB923C; }
  .dm-str { color:#4ADE80; }
  .dm-cm  { color:#6B7280; }

  /* Flash effect on changing value */
  .dm-flash { background:#FEF08A; color:#1E293B; border-radius:3px; padding:0 3px;
    transition:background 0.5s, color 0.5s; }
  .dm-flash.faded { background:transparent; color:#FB923C; }

  /* Tooltip */
  .dm-tip { position:relative; display:inline; cursor:pointer; }
  .dm-tip-box { position:absolute; bottom:calc(100% + 7px); left:50%; transform:translateX(-50%);
    background:#1E293B; color:#fff; border-radius:6px; padding:6px 10px; font-size:0.72rem;
    max-width:190px; width:max-content; white-space:normal; text-align:center; z-index:100;
    pointer-events:none; line-height:1.4; animation:dmFade 0.2s ease; }
  @keyframes dmFade { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  /* Result box */
  .dm-result { border-radius:10px; padding:16px 20px; text-align:center; transition:background 0.35s, opacity 0.3s, transform 0.3s; margin-top:10px; opacity:0.5; }
  .dm-result-active { opacity:1; transform:scale(1.02); box-shadow:0 2px 10px rgba(0,0,0,0.08); }
  .dm-result-main { font-size:1.05rem; font-weight:700; margin-bottom:6px; }
  .dm-result-sub { font-size:0.78rem; color:#6B7280; }

  /* Completion */
  .dm-completion { background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:12px;
    padding:24px; margin-bottom:24px; animation:dmSlide 0.4s ease; }
  @keyframes dmSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  /* Form */
  .dm-fg { margin-bottom:16px; }
  .dm-lbl { font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:6px; display:block; }
  .dm-input { width:100%; border:1.5px solid #E2E8F0; border-radius:8px; padding:10px 12px;
    font-size:0.95rem; font-family:inherit; outline:none; transition:border 0.2s; }
  .dm-input:focus { border-color:#3B82F6; }
  .dm-input:disabled { background:#F3F4F6; color:#6B7280; font-weight:700; }
  textarea.dm-input { resize:vertical; }
  .dm-pills { display:flex; gap:10px; margin:6px 0; }
  .dm-pill { flex:1; padding:12px 16px; border-radius:20px; border:2px solid #E2E8F0;
    font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.2s; background:#fff; }
  .dm-pill-t.sel { background:#3B82F6; color:#fff; border-color:#3B82F6; }
  .dm-pill-f.sel { background:#6B7280; color:#fff; border-color:#6B7280; }
  .dm-hint-warn { color:#B45309; font-size:0.8rem; margin-top:4px; }
  .dm-hint-ok { color:#16A34A; font-size:0.8rem; margin-top:4px; }
  .dm-hint-sub { font-size:0.75rem; color:#9CA3AF; margin-top:4px; display:block; }

  /* Guided slots */
  .dm-slot { background:#F8FAFC; border-radius:10px; padding:18px; margin-bottom:16px; }
  .dm-slot-row { display:flex; gap:12px; }
  @media(max-width:600px){ .dm-slot-row { flex-direction:column; } }
  .dm-slot-group { flex:1; min-width:0; }
  .dm-locked-line { font-weight:700; color:#166534; font-size:0.85rem; margin-bottom:6px; }
  .dm-shelf-hint { color:#9CA3AF; font-size:0.85rem; text-align:center; padding:20px 0; }
  .dm-big-label { background:#1E293B; color:#fff; font-size:1.1rem; font-weight:800; text-align:center;
    padding:10px 18px; border-radius:10px; margin-bottom:12px; }

  /* Reveal */
  .dm-reveal { background:#FFFBEB; border-left:3px solid #F59E0B; border-radius:8px;
    padding:20px 24px; margin-top:20px; animation:dmFade 0.4s ease; }
  .dm-rline { animation:dmFade 0.4s ease; display:flex; align-items:flex-start; gap:10px;
    margin:10px 0; font-size:0.95rem; line-height:1.5; }

  /* Section 2 editor */
  .dm-editor { background:#1E293B; border-radius:8px; padding:16px; margin-bottom:12px; }
  .dm-editor textarea { background:transparent; border:none; color:#E2E8F0;
    font-family:'Courier New',monospace; font-size:0.88rem; min-height:190px; resize:vertical;
    outline:none; width:100%; line-height:1.7; }
  .dm-editor textarea::placeholder { color:#475569; }
  .dm-plain-area textarea { width:100%; border:1.5px solid #E2E8F0; border-radius:8px;
    padding:10px 12px; font-size:0.95rem; font-family:inherit; outline:none;
    transition:border 0.2s; min-height:80px; resize:vertical; }
  .dm-plain-area textarea:focus { border-color:#F59E0B; }
  .dm-counter { font-size:0.78rem; color:#9CA3AF; margin-top:4px; }
  .dm-counter.ok { color:#16A34A; }

  /* Domain scene */
  .dm-domain-pills { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
  .dm-domain-pill { border-radius:16px; padding:6px 12px; font-size:0.78rem; font-weight:600;
    border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; transition:all 0.2s; }
  .dm-domain-pill.sel { background:#3B82F6; color:#fff; border-color:#3B82F6; }
  .dm-domain-scene { background:#F8FAFC; border-radius:10px; padding:18px; text-align:center; margin-bottom:10px; }
  .dm-domain-icon { font-size:2rem; margin-bottom:6px; }
  .dm-domain-name { font-weight:700; color:#1E293B; margin-bottom:8px; }

  /* Buttons */
  .dm-btn { border:none; border-radius:8px; padding:12px 24px; font-size:1rem; font-weight:700;
    cursor:pointer; transition:background 0.2s; width:100%; margin-top:12px; }
  .dm-btn-amber { background:#F59E0B; color:#fff; }
  .dm-btn-amber:hover:not(:disabled) { background:#D97706; }
  .dm-btn-blue { background:#3B82F6; color:#fff; }
  .dm-btn-blue:hover:not(:disabled) { background:#2563EB; }
  .dm-btn:disabled { background:#D1D5DB; color:#9CA3AF; cursor:not-allowed; }

  /* Success */
  .dm-success { background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:12px;
    padding:24px; margin-top:16px; animation:dmSlide 0.5s ease; }

  /* Divider */
  .dm-hr { border:none; border-top:2px solid #E2E8F0; margin:32px 0; }

  /* Preview label */
  .dm-prev-lbl { font-size:0.78rem; color:#6B7280; text-align:center; margin-bottom:6px;
    font-weight:600; text-transform:uppercase; letter-spacing:0.06em; }

  @media(max-width:520px){
    .dm-code { font-size:0.72rem; }
    .dm-pills { flex-direction:column; }
  }
`;

/* ─── Sound ────────────────────────────────────────────── */
function buildSound() {
  let ctx = null;
  function ctx_() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freqs, dur, type = "sine", maxGain = 0.28) {
    try {
      const c = ctx_();
      const g = c.createGain();
      g.connect(c.destination);
      g.gain.setValueAtTime(maxGain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      const o = c.createOscillator();
      o.type = type;
      o.connect(g);
      o.frequency.setValueAtTime(freqs[0], c.currentTime);
      freqs.forEach((f, i) => {
        const t = c.currentTime + (i / Math.max(freqs.length - 1, 1)) * dur * 0.85;
        o.frequency.setValueAtTime(f, t);
      });
      o.start(c.currentTime);
      o.stop(c.currentTime + dur);
    } catch (_) {}
  }
  return {
    tick:    () => tone([800], 0.05, "triangle"),
    correct: () => tone([523, 659, 784], 0.3, "sine"),
    submit:  () => tone([392], 0.4, "sine"),
    reveal:  () => tone([523, 659, 784, 1047], 0.5, "sine"),
    add:     () => tone([220, 440], 0.15, "sine"),
    remove:  () => tone([440, 220], 0.10, "sine"),
    warn:    () => tone([330, 277], 0.2, "sine"),
  };
}

/* ─── Tooltip ──────────────────────────────────────────── */
function Tip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="dm-tip"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(v => !v)}
    >
      {children}
      {show && <span className="dm-tip-box">{text}</span>}
    </span>
  );
}

/* ─── Toggle ───────────────────────────────────────────── */
function Toggle({ on, onToggle, leftLabel, rightLabel }) {
  return (
    <div className="dm-toggle-wrap">
      <span className={`dm-toggle-lbl dm-toggle-lbl-left${!on ? " active" : ""}`}>{leftLabel}</span>
      <button
        className={`dm-toggle-track${on ? " on" : ""}`}
        onClick={onToggle}
        aria-pressed={on}
        aria-label="Toggle switch"
      >
        <div className="dm-toggle-thumb" />
      </button>
      <span className={`dm-toggle-lbl dm-toggle-lbl-right${on ? " active" : ""}`}>{rightLabel}</span>
    </div>
  );
}

/* ─── Rain drops ───────────────────────────────────────── */
function RainDrops() {
  return (
    <>
      {[12, 27, 45, 62, 79].map((left, i) => (
        <div
          key={i}
          className="dm-drop"
          style={{
            left: `${left}%`,
            height: `${10 + i * 3}px`,
            animationDelay: `${i * 0.13}s`,
            animationDuration: `${0.5 + i * 0.07}s`,
          }}
        />
      ))}
    </>
  );
}

/* ─── Value span (flashes yellow on change) ────────────── */
function FlashVal({ value, flash }) {
  return (
    <span className={`dm-flash${flash ? "" : " faded"}`} style={{ fontFamily: "inherit" }}>
      {value}
    </span>
  );
}

function validateName(name) {
  if (!name) return null;
  if (/\s/.test(name)) return "space";
  if (/^[A-Z]/.test(name)) return "capital";
  return "ok";
}

/* ─── Boolean declaration code line ────────────────────── */
function BoolCode({ name, value }) {
  return (
    <div className="dm-code">
      <Tip text="Holds only true or false - yes or no"><span className="dm-kw">boolean</span></Tip>
      {" "}{name || "name"}{" = "}<span className="dm-val">{value || "?"}</span>{"; "}
      <span className="dm-cm">// yes/no dabba</span>
    </div>
  );
}

/* ─── if/else code block ───────────────────────────────── */
function IfElseCode({ name, trueMsg, falseMsg }) {
  const n = name || "condition";
  const tMsg = trueMsg || "...";
  const fMsg = falseMsg || "...";
  return (
    <div className="dm-code">
      <div>
        <Tip text="Checks if something is true"><span className="dm-kw">if</span></Tip>
        {" ("}{n}{") "}
        <Tip text="Curly braces - groups code that belongs together"><span>{"{"}</span></Tip>
        {"   "}<span className="dm-cm">// IF true...</span>
      </div>
      <div>{"    System.out.println("}<span className="dm-str">"{tMsg}"</span>{");"}</div>
      <div>
        <Tip text="Curly braces - groups code that belongs together"><span>{"}"}</span></Tip>
        {" "}
        <Tip text="What to do if it is NOT true"><span className="dm-kw">else</span></Tip>
        {" "}
        <Tip text="Curly braces - groups code that belongs together"><span>{"{"}</span></Tip>
        {"   "}<span className="dm-cm">// OTHERWISE...</span>
      </div>
      <div>{"    System.out.println("}<span className="dm-str">"{fMsg}"</span>{");"}</div>
      <div>{"}"}</div>
    </div>
  );
}

const DOMAIN_SCENES = {
  gym:   { icon: "🏋️", label: "Gym",       trueLabel: "Slot Booked",     falseLabel: "Slot Free" },
  hotel: { icon: "🏨", label: "Hotel",     trueLabel: "Room Occupied",   falseLabel: "Room Free" },
  mess:  { icon: "🍽️", label: "Mess",      trueLabel: "Checked In",      falseLabel: "Not Checked In" },
  chai:  { icon: "☕", label: "Chai shop", trueLabel: "Order Served",    falseLabel: "Order Pending" },
  other: { icon: "📋", label: "Other",     trueLabel: "Status: Active",  falseLabel: "Status: Inactive" },
};

function DomainScene({ domain, name, value, flash }) {
  const d = DOMAIN_SCENES[domain];
  return (
    <div className="dm-domain-scene">
      <div className="dm-domain-icon">{d.icon}</div>
      <div className="dm-domain-name">{name || "your variable"}</div>
      <div className="dm-var">
        <span className="dm-kw">boolean </span>{name || "____"}{" = "}
        <FlashVal value={value || "?"} flash={flash} />;
      </div>
    </div>
  );
}

function parseDecision(code) {
  const boolM = code.match(/\bboolean\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(true|false)/);
  const msgs = [...code.matchAll(/println\(\s*['"]([^'"]*)['"]\s*\)/g)].map((m) => m[1]);
  return {
    name: boolM ? boolM[1] : "",
    value: boolM ? boolM[2] : "",
    trueMsg: msgs[0] || "",
    falseMsg: msgs[1] || "",
  };
}

/* ─── Main component ───────────────────────────────────── */
export default function DecisionMaker() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const soundRef = useRef(null);
  const [muted, setMuted] = useState(false);

  const play = useCallback((type) => {
    if (muted) return;
    if (!soundRef.current) soundRef.current = buildSound();
    soundRef.current[type]?.();
  }, [muted]);

  /* ── Phase 1 - guided ── */
  const [slot1Name, setSlot1Name] = useState("");
  const [slot1Value, setSlot1Value] = useState("");
  const [slot1Locked, setSlot1Locked] = useState(false);
  const [nameHint, setNameHint] = useState(null);
  const [flash1, setFlash1] = useState(false);
  const [trueMsg1, setTrueMsg1] = useState("");
  const [falseMsg1, setFalseMsg1] = useState("");
  const [hasFlipped, setHasFlipped] = useState(false);
  const [phase1Complete, setPhase1Complete] = useState(false);
  const [phase, setPhase] = useState(1);

  const slot1Ready = !!slot1Name.trim() && validateName(slot1Name) === "ok" && (slot1Value === "true" || slot1Value === "false");
  const slot2Filled = !!trueMsg1.trim() && !!falseMsg1.trim();

  const phase1FiredRef = useRef(false);
  useEffect(() => {
    if (slot1Locked && slot2Filled && hasFlipped && !phase1FiredRef.current) {
      phase1FiredRef.current = true;
      play("correct");
      setPhase1Complete(true);
    }
  }, [slot1Locked, slot2Filled, hasFlipped, play]);

  function handleNameChange(v) {
    setSlot1Name(v);
    const vld = validateName(v);
    if (vld === "space" || vld === "capital") play("warn");
    setNameHint(vld);
  }

  function handleConfirmSlot1() {
    play("add");
    setSlot1Locked(true);
  }

  function handleFlip1() {
    play("tick");
    setSlot1Value((v) => (v === "true" ? "false" : "true"));
    setHasFlipped(true);
    setFlash1(true);
    setTimeout(() => setFlash1(false), 550);
  }

  /* ── Reveal card ── */
  const [revealCount, setRevealCount] = useState(0);
  const [revealShown, setRevealShown] = useState(false);
  const revealFiredRef = useRef(false);

  useEffect(() => {
    if (phase1Complete && !revealFiredRef.current) {
      revealFiredRef.current = true;
      play("reveal");
      setRevealShown(true);
      [0, 1, 2].forEach((i) => {
        setTimeout(() => {
          setRevealCount(i + 1);
          play("tick");
        }, (i + 1) * 500);
      });
    }
  }, [phase1Complete, play]);

  /* ── Phase 2 - free project ── */
  const [domain, setDomain] = useState("other");
  const [code2, setCode2] = useState("");
  const [editorHint, setEditorHint] = useState(null);
  const [proj, setProj] = useState({ name: "", value: "", trueMsg: "", falseMsg: "" });
  const [projFlash, setProjFlash] = useState(false);
  const [plain2, setPlain2] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleEditorChange(e) {
    const v = e.target.value;
    setCode2(v);
    const lines = v.split("\n");
    let hint = null;
    for (const line of lines) {
      const m = line.match(/\bboolean\s+([a-zA-Z_]\S*\s+\S)/);
      if (m) { hint = "space"; break; }
      const m2 = line.match(/\bboolean\s+([A-Z])/);
      if (m2) { hint = "capital"; break; }
    }
    if (hint) play("warn");
    setEditorHint(hint);
    setProj((prev) => {
      const parsed = parseDecision(v);
      if (parsed.value && parsed.value !== prev.value) {
        setProjFlash(true);
        setTimeout(() => setProjFlash(false), 550);
      }
      return parsed;
    });
  }

  function handleProjToggle() {
    play("tick");
    setProj((p) => ({ ...p, value: p.value === "true" ? "false" : "true" }));
    setProjFlash(true);
    setTimeout(() => setProjFlash(false), 550);
  }

  const sentences = plain2.trim().split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  const canSubmit = code2.trim().length > 0 && sentences >= 1;

  function handleSubmit() {
    play("submit");
    setSubmitted(true);
  }

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m2-t1-s2-decision-maker",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        code: code2,
        reflectionText: plain2,
        sentenceCount: sentences,
      },
      metadata: { subtopicId, taskId },
      completedAt: new Date().toISOString(),
    }, "*");
  }, [submitted]);

  return (
    <div className="dm-root">
      <style>{STYLE}</style>

      <button className="dm-mute" onClick={() => setMuted((m) => !m)} aria-label="Toggle sound">
        {muted ? "🔇" : "🔊"}
      </button>

      <div className="dm-wrap">

        {/* ══════════════════════════════════════
            PHASE 1 - GUIDED
        ══════════════════════════════════════ */}
        <div className="dm-card">
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1E293B", margin: "0 0 4px" }}>
            Teach the computer to decide 🧠
          </h1>
          <p style={{ color: "#6B7280", margin: "0 0 8px", fontSize: "0.9rem" }}>
            Fill in your yes/no dabba and your if/else on the left. Watch Java decide, live, on the right.
          </p>

          <div className="dm-split">
            <div className="dm-split-left">

              {/* Slot 1 - boolean */}
              {!slot1Locked ? (
                <div className="dm-slot">
                  <h3 style={{ margin: "0 0 12px", fontWeight: 700 }}>Step 1 - Your boolean</h3>
                  <div className="dm-slot-row">
                    <div className="dm-slot-group">
                      <label className="dm-lbl">Type</label>
                      <input className="dm-input" value="boolean" disabled />
                    </div>
                    <div className="dm-slot-group">
                      <label className="dm-lbl">Name</label>
                      <input
                        className="dm-input"
                        placeholder="e.g. isRaining"
                        value={slot1Name}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                      {nameHint === "space" && <div className="dm-hint-warn">⚠️ No spaces. Try camelCase.</div>}
                      {nameHint === "capital" && <div className="dm-hint-warn">⚠️ Start with a small letter.</div>}
                      {nameHint === "ok" && <div className="dm-hint-ok">✓ Looks good</div>}
                      <span className="dm-hint-sub">Start with 'is' - isBooked, isOpen</span>
                    </div>
                    <div className="dm-slot-group">
                      <label className="dm-lbl">Value</label>
                      <div className="dm-pills">
                        <button className={`dm-pill dm-pill-t${slot1Value === "true" ? " sel" : ""}`} onClick={() => setSlot1Value("true")}>TRUE</button>
                        <button className={`dm-pill dm-pill-f${slot1Value === "false" ? " sel" : ""}`} onClick={() => setSlot1Value("false")}>FALSE</button>
                      </div>
                    </div>
                  </div>
                  <BoolCode name={slot1Name} value={slot1Value} />
                  {slot1Ready && (
                    <button className="dm-btn dm-btn-blue" onClick={handleConfirmSlot1}>Confirm & continue →</button>
                  )}
                </div>
              ) : (
                <div className="dm-slot">
                  <div className="dm-locked-line">✓ Boolean confirmed</div>
                  <BoolCode name={slot1Name} value={slot1Value} />
                </div>
              )}

              {/* Slot 2 - if/else */}
              {slot1Locked && (
                <div className="dm-slot">
                  <h3 style={{ margin: "0 0 12px", fontWeight: 700 }}>Step 2 - Your if/else</h3>
                  <div className="dm-fg">
                    <label className="dm-lbl">If TRUE - what should happen?</label>
                    <textarea
                      className="dm-input"
                      rows={2}
                      placeholder="e.g. Umbrella theesuko anna! ☔"
                      value={trueMsg1}
                      onChange={(e) => setTrueMsg1(e.target.value)}
                    />
                  </div>
                  <div className="dm-fg">
                    <label className="dm-lbl">If FALSE - what should happen?</label>
                    <textarea
                      className="dm-input"
                      rows={2}
                      placeholder="e.g. Umbrella avsarame ledu. ☀️"
                      value={falseMsg1}
                      onChange={(e) => setFalseMsg1(e.target.value)}
                    />
                  </div>
                  <IfElseCode name={slot1Name} trueMsg={trueMsg1} falseMsg={falseMsg1} />
                </div>
              )}
            </div>

            <div className="dm-split-right">
              {!slot1Name.trim() ? (
                <p className="dm-shelf-hint">Fill in your boolean's name to see it come alive here.</p>
              ) : (
                <div className="dm-big-label">{slot1Name}</div>
              )}

              {(slot1Value === "true" || slot1Value === "false") && (
                <>
                  <div className={`dm-sky ${slot1Value === "true" ? "dm-sky-rain" : "dm-sky-sun"}`}>
                    {slot1Value === "true" ? <><RainDrops /><span style={{ fontSize: "2rem", zIndex: 1 }}>🌧️</span></> : <span style={{ fontSize: "2.2rem" }}>☀️</span>}
                  </div>
                  <Toggle on={slot1Value === "true"} onToggle={handleFlip1} leftLabel="FALSE" rightLabel="TRUE" />
                  <div className="dm-var">
                    <span className="dm-kw" style={{ fontFamily: "Courier New,monospace" }}>boolean </span>
                    <span style={{ fontFamily: "Courier New,monospace" }}>{slot1Name} = </span>
                    <FlashVal value={slot1Value} flash={flash1} />
                    <span style={{ fontFamily: "Courier New,monospace" }}>;</span>
                  </div>
                </>
              )}

              {trueMsg1.trim() && (
                <div className={`dm-result${slot1Value === "true" ? " dm-result-active" : ""}`} style={{ background: "#ECFDF5" }}>
                  <div className="dm-result-main">{trueMsg1}</div>
                  <div className="dm-result-sub">if block runs when TRUE</div>
                </div>
              )}
              {falseMsg1.trim() && (
                <div className={`dm-result${slot1Value === "false" ? " dm-result-active" : ""}`} style={{ background: "#F3F4F6" }}>
                  <div className="dm-result-main">{falseMsg1}</div>
                  <div className="dm-result-sub">else block runs when FALSE</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Completion message ── */}
        {phase1Complete && (
          <div className="dm-completion">
            <p style={{ fontWeight: 800, fontSize: "1rem", color: "#166534", margin: "0 0 10px" }}>
              You just watched Java decide based on your condition.
            </p>
            <p style={{ color: "#374151", lineHeight: 1.8, margin: 0 }}>
              Flip the toggle - code changes.<br />
              Code changes - result changes.<br />
              <strong>That is if/else.</strong>
            </p>

            {revealShown && (
              <div className="dm-reveal">
                <p style={{ fontWeight: 800, fontSize: "1rem", color: "#92400E", margin: "0 0 10px" }}>
                  You just learned 3 more Java concepts 🎉
                </p>
                {revealCount >= 1 && (
                  <div className="dm-rline">
                    <span>✅</span>
                    <span><strong style={{ color: "#60A5FA" }}>boolean</strong>{" → a dabba that holds only true or false"}</span>
                  </div>
                )}
                {revealCount >= 2 && (
                  <div className="dm-rline">
                    <span>✅</span>
                    <span><strong style={{ color: "#60A5FA" }}>if/else</strong>{" → how Java makes decisions"}</span>
                  </div>
                )}
                {revealCount >= 3 && (
                  <div className="dm-rline">
                    <span>✅</span>
                    <span><strong style={{ color: "#60A5FA" }}>{"{ } curly braces"}</strong>{" → groups code that belongs together - everything inside belongs together"}</span>
                  </div>
                )}
                {revealCount >= 3 && (
                  <p style={{ fontWeight: 700, textAlign: "center", margin: "16px 0 0", color: "#1E293B", lineHeight: 1.8 }}>
                    These three - boolean, if/else, curly braces -<br />
                    appear in EVERY Java program ever written.<br />
                    Including yours.
                  </p>
                )}
              </div>
            )}

            {revealCount >= 3 && phase === 1 && (
              <button className="dm-btn dm-btn-amber" onClick={() => setPhase(2)}>
                Now use this for YOUR project →
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            PHASE 2 - FREE PROJECT
        ══════════════════════════════════════ */}
        {phase === 2 && (
          <>
            <hr className="dm-hr" />

            <div className="dm-card">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1E293B", margin: "0 0 16px" }}>
                Your project's first real decision 🧠
              </h2>

              <div style={{ background: "#F8FAFC", borderRadius: "8px", padding: "16px", marginBottom: "20px", lineHeight: 1.75, color: "#374151", fontSize: "0.9rem" }}>
                <p style={{ margin: "0 0 10px" }}>Every app makes decisions constantly.</p>
                <p style={{ margin: "0 0 10px" }}>
                  Think of the ONE most important decision your neighbourhood app needs to make.
                </p>
                <p style={{ margin: "0 0 10px", color: "#6B7280" }}>
                  Gym → Is this slot available or not?<br />
                  Hotel → Is this room free or occupied?<br />
                  Mess → Has this student eaten today or not?<br />
                  Chai shop → Is this order served or pending?
                </p>
                <p style={{ margin: "0 0 10px" }}>Write the if/else code for that decision.</p>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>Rules:</p>
                <ul style={{ margin: "0 0 10px", paddingLeft: "20px" }}>
                  <li>Start with a boolean variable</li>
                  <li>Use if/else - not just if</li>
                  <li>Add a comment on every line explaining what it does</li>
                  <li>Use Telugu or English in your println messages - whatever feels natural</li>
                </ul>
                <p style={{ margin: "0 0 10px" }}>
                  Then below your code - write one sentence:<br />
                  <em>'This decision matters for my app because...'</em>
                </p>
                <p style={{ margin: 0, fontWeight: 600, color: "#1E293B" }}>
                  Your own code and words only. No copying. No ChatGPT.<br />
                  This exact logic will live inside your Spring Boot API in Module 2.
                </p>
              </div>

              {!submitted ? (
                <div className="dm-split">
                  <div className="dm-split-left">
                    <div className="dm-editor">
                      <textarea
                        value={code2}
                        onChange={handleEditorChange}
                        onPaste={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        spellCheck={false}
                        placeholder={
                          "// your project's decision\n" +
                          "// Step 1: your boolean\n" +
                          "boolean __________ = true;\n\n" +
                          "// Step 2: your if/else\n" +
                          "if (__________) {\n" +
                          "    System.out.println('__________');\n" +
                          "} else {\n" +
                          "    System.out.println('__________');\n" +
                          "}"
                        }
                      />
                    </div>
                    {editorHint === "space" && <div className="dm-hint-warn">⚠️ Variable names cannot have spaces.</div>}
                    {editorHint === "capital" && <div className="dm-hint-warn">⚠️ Start variable names with a small letter.</div>}
                    {proj.name && (
                      <div className="dm-var">
                        <span className="dm-kw" style={{ fontFamily: "Courier New,monospace" }}>boolean </span>
                        <span style={{ fontFamily: "Courier New,monospace" }}>{proj.name} = </span>
                        <FlashVal value={proj.value || "?"} flash={projFlash} />
                        <span style={{ fontFamily: "Courier New,monospace" }}>;</span>
                      </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <label className="dm-lbl" style={{ fontSize: "0.9rem" }}>
                        In one sentence - why does this decision matter for your business owner?
                      </label>
                      <div className="dm-plain-area">
                        <textarea
                          value={plain2}
                          onChange={(e) => setPlain2(e.target.value)}
                          onPaste={(e) => e.preventDefault()}
                          placeholder="This decision matters because without it, my app cannot tell users whether..."
                          rows={3}
                        />
                      </div>
                      <div className={`dm-counter${sentences >= 1 ? " ok" : ""}`}>
                        {sentences === 0 ? "0 sentences" : `${sentences} sentence${sentences > 1 ? "s" : ""} ✓`}
                      </div>
                    </div>

                    <button className="dm-btn dm-btn-amber" disabled={!canSubmit} onClick={handleSubmit}>
                      My first decision is written →
                    </button>
                  </div>

                  <div className="dm-split-right">
                    <p className="dm-prev-lbl">Phase 1 recap</p>
                    <div style={{ opacity: 0.3, pointerEvents: "none" }}>
                      {(slot1Value === "true" || slot1Value === "false") && (
                        <div className={`dm-sky ${slot1Value === "true" ? "dm-sky-rain" : "dm-sky-sun"}`}>
                          {slot1Value === "true" ? <><RainDrops /><span style={{ fontSize: "2rem", zIndex: 1 }}>🌧️</span></> : <span style={{ fontSize: "2.2rem" }}>☀️</span>}
                        </div>
                      )}
                    </div>

                    <p className="dm-prev-lbl" style={{ marginTop: 16 }}>Your project</p>
                    <div className="dm-domain-pills">
                      {Object.entries(DOMAIN_SCENES).map(([key, d]) => (
                        <button
                          key={key}
                          className={`dm-domain-pill${domain === key ? " sel" : ""}`}
                          onClick={() => setDomain(key)}
                        >
                          {d.icon} {d.label}
                        </button>
                      ))}
                    </div>

                    {!proj.name ? (
                      <p className="dm-shelf-hint">Write a valid boolean on the left to see your scene appear here.</p>
                    ) : (
                      <>
                        <DomainScene domain={domain} name={proj.name} value={proj.value} flash={projFlash} />
                        {proj.value && (
                          <Toggle on={proj.value === "true"} onToggle={handleProjToggle} leftLabel="FALSE" rightLabel="TRUE" />
                        )}
                        {proj.trueMsg && (
                          <div className={`dm-result${proj.value === "true" ? " dm-result-active" : ""}`} style={{ background: "#ECFDF5" }}>
                            <div className="dm-result-main">{proj.trueMsg}</div>
                            <div className="dm-result-sub">if block runs when TRUE</div>
                          </div>
                        )}
                        {proj.falseMsg && (
                          <div className={`dm-result${proj.value === "false" ? " dm-result-active" : ""}`} style={{ background: "#F3F4F6" }}>
                            <div className="dm-result-main">{proj.falseMsg}</div>
                            <div className="dm-result-sub">else block runs when FALSE</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dm-success">
                  <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#166534", margin: "0 0 12px" }}>
                    Your app can now make decisions. 🧠
                  </p>
                  <p style={{ color: "#374151", lineHeight: 1.75, margin: "0 0 10px" }}>
                    That boolean and if/else you just wrote?
                  </p>
                  <p style={{ color: "#374151", lineHeight: 1.75, margin: "0 0 10px" }}>
                    In <strong>Module 2</strong> - your Spring Boot API will run this exact check
                    every time a user asks "is this slot available?"
                  </p>
                  <p style={{ color: "#374151", lineHeight: 1.75, margin: "0 0 10px" }}>
                    In <strong>Module 4</strong> - React will read that response and show the right
                    message on screen automatically.
                  </p>
                  <p style={{ fontWeight: 700, color: "#1E293B", margin: 0 }}>
                    Next - teach the computer to repeat things. Loops and methods.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
