import { useState, useEffect, useRef, useCallback } from "react";

// ─── Sound Engine ────────────────────────────────────────────────────────────
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

function playSound(type, muted) {
  if (muted) return;
  const ctx = createAudioContext();
  if (!ctx) return;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.connect(ctx.destination);

  const play = (freq, startT, dur, shape = "sine") => {
    const o = ctx.createOscillator();
    o.type = shape;
    o.connect(g);
    if (Array.isArray(freq)) {
      o.frequency.setValueAtTime(freq[0], ctx.currentTime + startT);
      o.frequency.linearRampToValueAtTime(freq[1], ctx.currentTime + startT + dur);
    } else {
      o.frequency.setValueAtTime(freq, ctx.currentTime + startT);
    }
    o.start(ctx.currentTime + startT);
    o.stop(ctx.currentTime + startT + dur);
  };

  const fade = (endT) => {
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + endT);
  };

  switch (type) {
    case "tick":
      play(800, 0, 0.05, "triangle");
      fade(0.05);
      break;
    case "add":
      play([220, 440], 0, 0.15, "sine");
      fade(0.15);
      break;
    case "remove":
      play([440, 220], 0, 0.1, "sine");
      fade(0.1);
      break;
    case "correct":
      play(523, 0, 0.1);
      play(659, 0.1, 0.1);
      play(784, 0.2, 0.1);
      fade(0.3);
      break;
    case "submit":
      play(392, 0, 0.4, "sine");
      fade(0.4);
      break;
    case "warn":
      play([330, 277], 0, 0.2, "sine");
      fade(0.2);
      break;
    case "reveal":
      play(523, 0, 0.1);
      play(659, 0.1, 0.1);
      play(784, 0.2, 0.1);
      play(1047, 0.3, 0.2);
      fade(0.5);
      break;
    default:
      break;
  }
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block", cursor: "help" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((v) => !v)}
    >
      {children}
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1E293B",
            color: "#F1F5F9",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

const TT = ({ children, tip }) => (
  <Tooltip text={tip}>
    <span style={{ borderBottom: "1px dashed #94A3B8", cursor: "help", display: "inline" }}>
      {children}
    </span>
  </Tooltip>
);

// shared syntax colors
const kw = { color: "#60A5FA", fontFamily: "monospace" };   // static, void, String, int, boolean
const nm = { color: "#FACC15", fontFamily: "monospace" };   // method name
const pr = { color: "#FB923C", fontFamily: "monospace" };   // parameter name
const str = { color: "#4ADE80", fontFamily: "monospace" };  // strings
const cmt = { color: "#6B7280", fontStyle: "italic", fontFamily: "monospace" }; // comments

// ─── Security Guard SVG ───────────────────────────────────────────────────────
function GuardScene({ activePerson, stepIndex, passedCount }) {
  const people = ["Ravi", "Suresh", "Priya"];
  const steps = ["Check ID", "Note time", "Let in"];

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox="0 0 480 160" style={{ width: "100%", height: "auto" }}>
        {/* queue */}
        {people.map((name, i) => {
          const isPassed = i < passedCount;
          const isActive = i === activePerson;
          if (isPassed) return null;
          const baseX = 40 + i * 34;
          return (
            <g key={name} opacity={isActive ? 1 : 0.55}>
              <circle cx={baseX} cy="70" r="12" fill={isActive ? "#3B82F6" : "#CBD5E1"} />
              <rect x={baseX - 10} y="82" width="20" height="26" rx="6" fill={isActive ? "#3B82F6" : "#CBD5E1"} />
              <text x={baseX} y="122" fontSize="10" textAnchor="middle" fill="#334155" fontFamily="monospace">
                {name}
              </text>
            </g>
          );
        })}

        {/* gate */}
        <rect x="200" y="30" width="10" height="90" fill="#94A3B8" />
        <rect x="200" y="24" width="70" height="10" fill="#94A3B8" />
        <rect x="260" y="30" width="10" height="90" fill="#94A3B8" />

        {/* guard */}
        <circle cx="235" cy="60" r="13" fill="#7C3AED" />
        <rect x="222" y="73" width="26" height="34" rx="7" fill="#7C3AED" />
        <text x="235" y="135" fontSize="10" textAnchor="middle" fill="#334155" fontFamily="monospace">
          Guard
        </text>

        {/* sign */}
        <rect x="300" y="40" width="150" height="50" rx="6" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="375" y="58" fontSize="8" textAnchor="middle" fill="#92400E" fontWeight="700" fontFamily="monospace">
          Procedure:
        </text>
        <text x="375" y="70" fontSize="7.5" textAnchor="middle" fill="#92400E" fontFamily="monospace">
          Check ID → Note time → Let in
        </text>

        {/* inside area label */}
        <text x="430" y="130" fontSize="9" textAnchor="middle" fill="#94A3B8" fontFamily="monospace">
          inside
        </text>
      </svg>

      {/* step ticks */}
      {activePerson >= 0 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                background: i <= stepIndex ? "#ECFDF5" : "#F1F5F9",
                color: i <= stepIndex ? "#059669" : "#94A3B8",
                border: `1.5px solid ${i <= stepIndex ? "#6EE7B7" : "#E2E8F0"}`,
                transition: "all 0.2s",
              }}
            >
              {i <= stepIndex ? "✓ " : ""}
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Annotated Method Definition (Part C) ─────────────────────────────────────
function AnnotatedMethod() {
  return (
    <pre
      style={{
        background: "#1E293B",
        borderRadius: 10,
        padding: "18px 20px",
        fontFamily: "monospace",
        fontSize: 14,
        lineHeight: 1.9,
        overflowX: "auto",
        margin: 0,
        color: "#F1F5F9",
        borderLeft: "4px solid #8B5CF6",
      }}
    >
      <span style={cmt}>{"// write the procedure once — give it a name"}</span>
      {"\n"}
      <TT tip="Belongs to the class — you can call it directly">
        <span style={kw}>static</span>
      </TT>
      {" "}
      <TT tip="Does something but gives nothing back — no return value">
        <span style={kw}>void</span>
      </TT>
      {" "}
      <TT tip="The procedure's name — call this to run all the steps">
        <span style={nm}>welcomeMember</span>
      </TT>
      {"("}
      <TT tip="The information this method needs. Like giving the guard your ID.">
        <span style={kw}>String</span> <span style={pr}>name</span>
      </TT>
      {") {"}
      {"\n"}
      <span style={cmt}>{"// ↑        ↑    ↑          ↑"}</span>
      {"\n"}
      <span style={cmt}>{"// belongs  does the name   information it needs:"}</span>
      {"\n"}
      <span style={cmt}>{"// to class  nothing back    a String called name"}</span>
      {"\n\n"}
      <span style={cmt}>{"// step 1: greet them using their name"}</span>
      {"\n"}
      {"System.out.println("}
      <span style={str}>"Welcome, "</span>
      {" + name + "}
      <span style={str}>"! 👋"</span>
      {");"}
      {"\n"}
      <span style={cmt}>{"// step 2: confirm their membership"}</span>
      {"\n"}
      {"System.out.println("}
      <span style={str}>"Your membership is active. ✅"</span>
      {");"}
      {"\n"}
      <span style={cmt}>{"// step 3: motivate them"}</span>
      {"\n"}
      {"System.out.println("}
      <span style={str}>"Have a great workout! 💪"</span>
      {");"}
      {"\n"}
      {"} "}
      <span style={cmt}>{"// method ends — all 3 steps done"}</span>
    </pre>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MethodBuilder() {
  const [muted, setMuted] = useState(false);

  // Part A/B
  const [showPartB, setShowPartB] = useState(false);
  const [guardStep, setGuardStep] = useState(-1); // overall animation counter
  const [guardRunning, setGuardRunning] = useState(false);
  const guardTimer = useRef(null);

  // Part C
  const [showPartC, setShowPartC] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [calledNames, setCalledNames] = useState([]); // list of names called so far
  const glowTimer = useRef(null);

  // Part D
  const [showPartD, setShowPartD] = useState(false);
  const domain = "GYM";
  const actionOptions = [
    "Welcome a member",
    "Confirm a slot booking",
    "Show member details",
    "Send cancellation notice",
    "+ Write my own action",
  ];
  const [action, setAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [methodName, setMethodName] = useState("");
  const [paramChoice, setParamChoice] = useState("");
  const [printLines, setPrintLines] = useState("");
  const [built, setBuilt] = useState(false);
  const [liveName, setLiveName] = useState("");
  const [liveOutput, setLiveOutput] = useState([]);
  const [liveGlow, setLiveGlow] = useState(false);
  const [firstCallDone, setFirstCallDone] = useState(false);

  const [nameWarn, setNameWarn] = useState("");

  // Reveal
  const [showReveal, setShowReveal] = useState(false);
  const [revealLines, setRevealLines] = useState([]);

  // Part E
  const [showLoopPreview, setShowLoopPreview] = useState(false);

  // Section 2
  const [showSection2, setShowSection2] = useState(false);
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ── Guard animation (3 people × 3 steps) ──
  // guardStep encodes: person = floor(guardStep/3), step = guardStep%3
  const totalGuardSteps = 9; // 3 people * 3 steps
  const activePerson = guardStep < 0 ? -1 : Math.min(Math.floor(guardStep / 3), 2);
  const activeStepIdx = guardStep < 0 ? -1 : guardStep % 3;
  const passedCount = guardStep < 0 ? 0 : Math.min(Math.floor(guardStep / 3) + (activeStepIdx === 2 ? 0 : 0), 3);
  // A person is "passed" only once their 3 steps are done AND we've moved on
  const [passedPeople, setPassedPeople] = useState(0);
  const [guardDone, setGuardDone] = useState(false);

  const runGuard = () => {
    setGuardStep(0);
    setPassedPeople(0);
    setGuardDone(false);
    setGuardRunning(true);
    playSound("tick", muted);
  };

  useEffect(() => {
    if (!guardRunning) return;
    if (guardStep < 0) return;
    guardTimer.current = setTimeout(() => {
      const stepInPerson = guardStep % 3;
      if (stepInPerson === 2) {
        // finished this person's 3 steps
        setPassedPeople((p) => p + 1);
      }
      const next = guardStep + 1;
      if (next >= totalGuardSteps) {
        setGuardRunning(false);
        setGuardDone(true);
        playSound("correct", muted);
      } else {
        playSound("tick", muted);
        setGuardStep(next);
      }
    }, 700);
    return () => clearTimeout(guardTimer.current);
  }, [guardRunning, guardStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Part C: calling animation ──
  const callMethod = (name) => {
    setGlowing(true);
    playSound("tick", muted);
    clearTimeout(glowTimer.current);
    glowTimer.current = setTimeout(() => setGlowing(false), 500);
    setCalledNames((prev) => [...prev, name]);
    setTimeout(() => playSound("tick", muted), 150);
    setTimeout(() => playSound("tick", muted), 300);
    setTimeout(() => {
      if (calledNames.length === 2) playSound("correct", muted);
    }, 500);
  };

  // ── Reveal sequence ──
  useEffect(() => {
    if (!showReveal) return;
    playSound("reveal", muted);
    const lines = [
      { bold: "Method", rest: " → a named procedure — write once, call anywhere" },
      { bold: "Parameter", rest: " → the information a method needs to do its job" },
      { bold: "void", rest: " → does something, gives nothing back" },
    ];
    lines.forEach((l, i) => {
      setTimeout(() => {
        setRevealLines((prev) => [...prev, l]);
        playSound("tick", muted);
      }, i * 500);
    });
    setTimeout(() => {
      setRevealLines((prev) => [
        ...prev,
        { bold: "static", rest: " → belongs to the class — call it directly by name" },
      ]);
      playSound("tick", muted);
    }, lines.length * 500);
  }, [showReveal]); // eslint-disable-line react-hooks/exhaustive-deps

  const finalActionLabel = action === "+ Write my own action" ? customAction : action;

  const paramInfo = {
    "A name (String name)": { type: "String", param: "name", example: "Ravi" },
    "A number (int number)": { type: "int", param: "number", example: "12" },
    "A status — yes/no (boolean status)": { type: "boolean", param: "status", example: "true" },
    "Nothing — it works on its own": { type: "", param: "", example: "" },
  };

  const validateMethodName = (val) => {
    setMethodName(val);
    if (val.includes(" ")) {
      setNameWarn("No spaces — use camelCase, e.g. confirmBooking");
      playSound("warn", muted);
    } else if (val.length > 0 && val[0] === val[0].toUpperCase() && /[a-zA-Z]/.test(val[0])) {
      setNameWarn("Method names start lowercase — e.g. confirmBooking, not ConfirmBooking");
      playSound("warn", muted);
    } else {
      setNameWarn("");
    }
  };

  const allFilled =
    finalActionLabel.trim() &&
    methodName.trim() &&
    !nameWarn &&
    paramChoice &&
    printLines.trim().split("\n").filter((l) => l.trim()).length >= 2;

  const buildMethod = () => {
    if (!allFilled) return;
    playSound("correct", muted);
    setBuilt(true);
  };

  const pInfo = paramInfo[paramChoice] || { type: "", param: "", example: "" };
  const lines = printLines.split("\n").filter((l) => l.trim()).slice(0, 3);

  const callBuiltMethod = () => {
    if (!liveName.trim()) {
      playSound("warn", muted);
      return;
    }
    const substituted = lines.map((l) =>
      pInfo.param ? l.replaceAll(`[${pInfo.param}]`, liveName).replaceAll("[name]", liveName) : l
    );
    setLiveGlow(true);
    setTimeout(() => setLiveGlow(false), 500);
    setLiveOutput(substituted);
    setFirstCallDone(true);
    playSound("correct", muted);
  };

  const handleSubmit = () => {
    if (!code.trim() || !reflection.trim()) {
      playSound("warn", muted);
      return;
    }
    playSound("submit", muted);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#1E293B",
        paddingBottom: 80,
      }}
    >
      {/* Mute toggle */}
      <button
        onClick={() => setMuted((v) => !v)}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 200,
          background: "#1E293B",
          color: "#F1F5F9",
          border: "none",
          borderRadius: 8,
          padding: "8px 12px",
          cursor: "pointer",
          fontSize: 18,
        }}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 0" }}>
        {/* ═══════════════ SECTION 1 ═══════════════ */}

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, margin: 0, color: "#1E293B" }}>
            Write once. Use anywhere. 🔁
          </h1>
          <p style={{ color: "#64748B", marginTop: 8, fontSize: 16 }}>
            See why methods exist — and how calling one is like calling a procedure by name.
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 8,
              padding: "4px 14px",
              fontSize: 13,
              color: "#3B82F6",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            Subtopic 1.1.4 — Methods
          </div>
        </div>

        {/* ── PART A: Copy-paste problem ── */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "28px 24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>
            The copy-paste problem 🤔
          </h2>

          <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* Without a method */}
            <div style={{ background: "#FFF5F5", border: "2px solid #FCA5A5", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Without a method 😰</div>
              <pre
                style={{
                  background: "#1E293B",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontFamily: "monospace",
                  fontSize: 12.5,
                  color: "#F1F5F9",
                  margin: 0,
                  lineHeight: 1.7,
                  overflowX: "auto",
                }}
              >
                <span style={cmt}>{"// welcome Ravi — 3 lines"}</span>{"\n"}
                {"System.out.println("}<span style={str}>"Welcome, Ravi! 👋"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Membership active. ✅"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Great workout! 💪"</span>{");"}{"\n\n"}
                <span style={cmt}>{"// welcome Suresh — same 3 lines again"}</span>{"\n"}
                {"System.out.println("}<span style={str}>"Welcome, Suresh! 👋"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Membership active. ✅"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Great workout! 💪"</span>{");"}{"\n\n"}
                <span style={cmt}>{"// welcome Priya — same 3 lines AGAIN"}</span>{"\n"}
                {"System.out.println("}<span style={str}>"Welcome, Priya! 👋"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Membership active. ✅"</span>{");"}{"\n"}
                {"System.out.println("}<span style={str}>"Great workout! 💪"</span>{");"}
              </pre>
              <div style={{ marginTop: 10, background: "#FEE2E2", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#DC2626", fontWeight: 600, lineHeight: 1.6 }}>
                3 members = 9 lines<br />
                If message changes → change in 3 places<br />
                Miss one → bug in app 😰
              </div>
            </div>

            {/* With a method */}
            <div style={{ background: "#F0FDF4", border: "2px solid #86EFAC", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>With a method 😎</div>
              <pre
                style={{
                  background: "#1E293B",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontFamily: "monospace",
                  fontSize: 12.5,
                  color: "#F1F5F9",
                  margin: 0,
                  lineHeight: 1.7,
                  overflowX: "auto",
                }}
              >
                <span style={cmt}>{"// write once ↓"}</span>{"\n"}
                <span style={kw}>static</span> <span style={kw}>void</span> <span style={nm}>welcomeMember</span>{"("}<span style={kw}>String</span> <span style={pr}>name</span>{") {"}
                {"\n    System.out.println("}<span style={str}>"Welcome, "</span>+name+<span style={str}>"! 👋"</span>{");"}
                {"\n    System.out.println("}<span style={str}>"Membership active. ✅"</span>{");"}
                {"\n    System.out.println("}<span style={str}>"Great workout! 💪"</span>{");"}
                {"\n} "}
                {"\n\n"}
                <span style={cmt}>{"// call it 3 times ↓"}</span>{"\n"}
                <span style={nm}>welcomeMember</span>{"("}<span style={str}>"Ravi"</span>{");"}{"\n"}
                <span style={nm}>welcomeMember</span>{"("}<span style={str}>"Suresh"</span>{");"}{"\n"}
                <span style={nm}>welcomeMember</span>{"("}<span style={str}>"Priya"</span>{");"}
              </pre>
              <div style={{ marginTop: 10, background: "#DCFCE7", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#16A34A", fontWeight: 600, lineHeight: 1.6 }}>
                3 members = 3 calls<br />
                If message changes → change in 1 place<br />
                Zero bugs 😎
              </div>
            </div>
          </div>

          {!showPartB && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => {
                  playSound("tick", muted);
                  setShowPartB(true);
                }}
                style={{
                  background: "#3B82F6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px 28px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                }}
              >
                Show me how the method works →
              </button>
            </div>
          )}
        </div>

        {/* ── PART B: Guard analogy ── */}
        {showPartB && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              marginBottom: 24,
              animation: "fadeIn 0.4s ease",
            }}
          >
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
              The security guard 🛡️
            </h2>
            <p style={{ color: "#64748B", marginTop: 4, marginBottom: 20, fontSize: 15 }}>
              One procedure. Every person who enters gets the same steps.
            </p>

            <GuardScene activePerson={activePerson} stepIndex={activeStepIdx} passedCount={passedPeople} />

            <div style={{ textAlign: "center", marginTop: 16 }}>
              {!guardRunning && (
                <button
                  onClick={runGuard}
                  style={{
                    background: "#10B981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ▶ {guardDone ? "Run again" : "Run the guard"}
                </button>
              )}
            </div>

            {guardDone && (
              <div
                style={{
                  marginTop: 20,
                  background: "#F1F5F9",
                  borderRadius: 10,
                  padding: "16px 18px",
                  fontSize: 15,
                  lineHeight: 1.8,
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <strong>Same procedure. Different person. Every time.</strong>
                <br /><br />
                The guard did not invent a new procedure for each person.
                He has one procedure — and he runs it for whoever shows up.
                <br /><br />
                <strong>That is exactly what a method does.</strong>
              </div>
            )}

            {guardDone && !showPartC && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={() => {
                    playSound("tick", muted);
                    setShowPartC(true);
                  }}
                  style={{
                    background: "#7C3AED",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 28px",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                  }}
                >
                  Now show me in Java →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PART C: The method in Java ── */}
        {showPartC && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              marginBottom: 24,
              animation: "fadeIn 0.4s ease",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>
              The method — written once
            </h2>
            <p style={{ color: "#64748B", margin: "0 0 20px", fontSize: 15 }}>
              Hover any underlined word for an explanation.
            </p>

            <div
              style={{
                boxShadow: glowing ? "0 0 0 3px #3B82F6" : "none",
                borderRadius: 10,
                transition: "box-shadow 0.2s ease",
              }}
            >
              <AnnotatedMethod />
            </div>

            <h3 style={{ margin: "24px 0 10px", fontSize: 17, fontWeight: 700 }}>
              Call it — as many times as you want
            </h3>

            <pre
              style={{
                background: "#EFF6FF",
                borderRadius: 10,
                padding: "16px 18px",
                fontFamily: "monospace",
                fontSize: 14,
                lineHeight: 1.9,
                color: "#1E293B",
                margin: 0,
                overflowX: "auto",
              }}
            >
              <span style={{ ...cmt, color: "#94A3B8" }}>{"// call the method — pass in the name each time"}</span>
              {"\n"}
              <TT tip="Runs all the steps inside the method">
                <span style={nm}>welcomeMember</span>
              </TT>
              ({<span style={str}>"Ravi"</span>});{"   "}
              <span style={{ ...cmt, color: "#94A3B8" }}>{"// runs all 3 steps for Ravi"}</span>
              {"\n"}
              <span style={nm}>welcomeMember</span>({<span style={str}>"Suresh"</span>});{" "}
              <span style={{ ...cmt, color: "#94A3B8" }}>{"// runs all 3 steps for Suresh"}</span>
              {"\n"}
              <span style={nm}>welcomeMember</span>({<span style={str}>"Priya"</span>});{"  "}
              <span style={{ ...cmt, color: "#94A3B8" }}>{"// runs all 3 steps for Priya"}</span>
            </pre>

            {/* Live call demo */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Try it — call the method</div>
              <div className="call-demo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Ravi", "Suresh", "Priya"].map((name) => (
                    <button
                      key={name}
                      onClick={() => callMethod(name)}
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "monospace",
                        textAlign: "left",
                      }}
                    >
                      Call welcomeMember("{name}") →
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    background: "#1E293B",
                    borderRadius: 10,
                    padding: 12,
                    minHeight: 100,
                    fontFamily: "monospace",
                    fontSize: 13,
                  }}
                >
                  {calledNames.length === 0 && (
                    <div style={{ color: "#475569", fontSize: 12 }}>Output will appear here...</div>
                  )}
                  {calledNames.map((name, i) => (
                    <div key={i} style={{ marginBottom: 8, animation: "fadeInUp 0.3s ease" }}>
                      <div style={{ color: "#4ADE80" }}>Welcome, {name}! 👋</div>
                      <div style={{ color: "#4ADE80" }}>Your membership is active. ✅</div>
                      <div style={{ color: "#4ADE80" }}>Have a great workout! 💪</div>
                    </div>
                  ))}
                </div>
              </div>

              {calledNames.length === 3 && (
                <div
                  style={{
                    marginTop: 16,
                    background: "#F1F5F9",
                    borderRadius: 10,
                    padding: "14px 18px",
                    fontSize: 15,
                    lineHeight: 1.8,
                    animation: "fadeIn 0.4s ease",
                  }}
                >
                  <strong>3 calls. 9 lines of output.</strong><br />
                  The method ran 3 times. You wrote the steps only once.
                  <br /><br />
                  If the gym owner says change the message — you change it in ONE place.
                  All 3 calls update automatically.
                </div>
              )}
            </div>

            {calledNames.length === 3 && !showPartD && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={() => {
                    playSound("tick", muted);
                    setShowPartD(true);
                  }}
                  style={{
                    background: "#F59E0B",
                    color: "#1E293B",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 28px",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                  }}
                >
                  Now build YOUR project's method 🏗️
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PART D: Build your own ── */}
        {showPartD && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              marginBottom: 24,
              animation: "fadeIn 0.4s ease",
            }}
          >
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
              Now build YOUR project's method 🏗️
            </h2>
            <p style={{ color: "#64748B", margin: "4px 0 20px", fontSize: 15 }}>
              Think of one action your app does repeatedly.
            </p>

            {!built && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Q1 */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>
                    What does your method do?
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "2px solid #CBD5E1",
                      fontSize: 14,
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">Select an action ({domain})</option>
                    {actionOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {action === "+ Write my own action" && (
                    <input
                      value={customAction}
                      onChange={(e) => setCustomAction(e.target.value)}
                      placeholder="e.g. Show booking details"
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "2px solid #CBD5E1",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>

                {/* Q2 */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>
                    What should it be called?
                  </label>
                  <input
                    value={methodName}
                    onChange={(e) => validateMethodName(e.target.value)}
                    placeholder="e.g. confirmBooking"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `2px solid ${nameWarn ? "#F59E0B" : methodName ? "#10B981" : "#CBD5E1"}`,
                      fontSize: 14,
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ fontSize: 12, marginTop: 4, color: nameWarn ? "#B45309" : "#64748B" }}>
                    {nameWarn || (methodName ? "✓ Looks good" : "camelCase. Starts with a verb — show, confirm, welcome, print")}
                  </div>
                </div>

                {/* Q3 */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>
                    What information does it need?
                  </label>
                  <select
                    value={paramChoice}
                    onChange={(e) => setParamChoice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "2px solid #CBD5E1",
                      fontSize: 14,
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">Select</option>
                    <option>A name (String name)</option>
                    <option>A number (int number)</option>
                    <option>A status — yes/no (boolean status)</option>
                    <option>Nothing — it works on its own</option>
                  </select>
                </div>

                {/* Q4 */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>
                    What should it print? (2-3 lines)
                  </label>
                  <textarea
                    value={printLines}
                    onChange={(e) => setPrintLines(e.target.value)}
                    placeholder={"Line 1: Booking confirmed for [name]! ✅\nLine 2: See you at the gym tomorrow.\nLine 3: Reply if you need to cancel."}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "2px solid #CBD5E1",
                      fontSize: 14,
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={buildMethod}
                    disabled={!allFilled}
                    style={{
                      background: allFilled ? "#7C3AED" : "#CBD5E1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "14px 28px",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: allFilled ? "pointer" : "not-allowed",
                    }}
                  >
                    Build my method →
                  </button>
                </div>
              </div>
            )}

            {built && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  Your method — {finalActionLabel}
                </div>
                <pre
                  style={{
                    background: "#1E293B",
                    borderRadius: 10,
                    padding: "16px 18px",
                    fontFamily: "monospace",
                    fontSize: 13.5,
                    lineHeight: 1.9,
                    color: "#F1F5F9",
                    margin: 0,
                    overflowX: "auto",
                    borderLeft: "4px solid #8B5CF6",
                  }}
                >
                  <span style={cmt}>{`// write once — ${finalActionLabel}`}</span>
                  {"\n"}
                  <span style={kw}>static</span> <span style={kw}>void</span>{" "}
                  <span style={nm}>{methodName}</span>(
                  {pInfo.type && (
                    <>
                      <span style={kw}>{pInfo.type}</span> <span style={pr}>{pInfo.param}</span>
                    </>
                  )}
                  ) {"{"}
                  {"\n"}
                  <span style={cmt}>{"// ↑           ↑          ↑"}</span>
                  {"\n"}
                  <span style={cmt}>{"// belongs to  method     information"}</span>
                  {"\n"}
                  <span style={cmt}>{"// class       name       it needs"}</span>
                  {"\n\n"}
                  {lines.map((l, i) => (
                    <span key={i}>
                      <span style={cmt}>{`// line ${i + 1}`}</span>
                      {"\n"}
                      {"System.out.println("}
                      <span style={str}>"{l.replace(/^Line \d+:\s*/, "")}"</span>
                      {");"}
                      {"\n"}
                    </span>
                  ))}
                  {"} "}
                  <span style={cmt}>{"// method ends"}</span>
                </pre>

                <div style={{ fontWeight: 700, fontSize: 15, margin: "18px 0 8px" }}>
                  Call it — pass in real information
                </div>
                <pre
                  style={{
                    background: "#EFF6FF",
                    borderRadius: 10,
                    padding: "14px 18px",
                    fontFamily: "monospace",
                    fontSize: 13.5,
                    lineHeight: 1.8,
                    color: "#1E293B",
                    margin: 0,
                  }}
                >
                  <span style={{ ...cmt, color: "#94A3B8" }}>{"// call it — pass in real information"}</span>
                  {"\n"}
                  <span style={nm}>{methodName}</span>(
                  {pInfo.example && <span style={str}>"{pInfo.example}"</span>}
                  ); <span style={{ ...cmt, color: "#94A3B8" }}>{"// runs all steps"}</span>
                </pre>

                {/* Live call demo */}
                <div style={{ marginTop: 20, background: "#F8FAFC", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                    Enter a name to call with:
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      value={liveName}
                      onChange={(e) => setLiveName(e.target.value)}
                      placeholder="e.g. Ravi"
                      style={{
                        flex: "1 1 160px",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "2px solid #CBD5E1",
                        fontSize: 14,
                        fontFamily: "monospace",
                      }}
                    />
                    <button
                      onClick={callBuiltMethod}
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 18px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "monospace",
                      }}
                    >
                      Call {methodName}("{liveName || "..."}") →
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      background: liveGlow ? "#1E293B" : "#1E293B",
                      boxShadow: liveGlow ? "0 0 0 3px #3B82F6" : "none",
                      transition: "box-shadow 0.2s ease",
                      borderRadius: 10,
                      padding: 12,
                      minHeight: 80,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {liveOutput.length === 0 && (
                      <div style={{ color: "#475569", fontSize: 12 }}>Output will appear here...</div>
                    )}
                    {liveOutput.map((l, i) => (
                      <div key={i} style={{ color: "#4ADE80", animation: "fadeInUp 0.3s ease" }}>
                        {l.replace(/^Line \d+:\s*/, "")}
                      </div>
                    ))}
                  </div>

                  {firstCallDone && (
                    <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "#334155" }}>
                      <strong>Your method works. 🎯</strong><br />
                      Change the name — call it again. Same steps. Different information. Every time.
                    </div>
                  )}
                </div>

                {firstCallDone && !showReveal && (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <button
                      onClick={() => setShowReveal(true)}
                      style={{
                        background: "#F59E0B",
                        color: "#1E293B",
                        border: "none",
                        borderRadius: 10,
                        padding: "14px 28px",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      }}
                    >
                      See what you just learned 🎉
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reveal card */}
            {showReveal && (
              <div
                style={{
                  marginTop: 24,
                  background: "#FFFBEB",
                  border: "1px solid #F59E0B",
                  borderRadius: 12,
                  padding: "20px 22px",
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>
                  You just learned 3 more concepts 🎉
                </div>
                {revealLines.slice(0, 3).map((line, i) => (
                  <div key={i} style={{ marginBottom: 10, fontSize: 15, animation: "fadeInUp 0.4s ease" }}>
                    <strong>{line.bold}</strong>
                    {line.rest}
                  </div>
                ))}
                {revealLines.length >= 4 && (
                  <div style={{ marginTop: 4, marginBottom: 6, fontSize: 15, animation: "fadeInUp 0.4s ease" }}>
                    <strong>{revealLines[3].bold}</strong>
                    {revealLines[3].rest}
                  </div>
                )}
                {revealLines.length >= 4 && (
                  <div
                    style={{
                      marginTop: 16,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#92400E",
                      lineHeight: 1.8,
                      animation: "fadeIn 0.5s ease",
                    }}
                  >
                    Every action your neighbourhood app performs — booking a slot, welcoming a member,
                    confirming a room — will be a method exactly like this.
                  </div>
                )}
              </div>
            )}

            {/* ── PART E: loop + method preview ── */}
            {showReveal && revealLines.length >= 4 && (
              <div
                style={{
                  marginTop: 24,
                  border: "2px dashed #CBD5E1",
                  borderRadius: 12,
                  padding: "16px 18px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 12,
                    background: "#F1F5F9",
                    color: "#64748B",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                  }}
                >
                  Optional
                </div>
                <button
                  onClick={() => {
                    if (!showLoopPreview) playSound("tick", muted);
                    setShowLoopPreview((v) => !v);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 0,
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: showLoopPreview ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      fontSize: 14,
                    }}
                  >
                    ▶
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Curious? See loop + method together 👀</span>
                </button>
                <p style={{ color: "#64748B", fontSize: 13, margin: "6px 0 0 22px" }}>
                  Optional — only if you want to see what happens when you combine both.
                </p>

                {showLoopPreview && (
                  <div style={{ marginTop: 16, animation: "fadeIn 0.4s ease" }}>
                    <pre
                      style={{
                        background: "#1E293B",
                        borderRadius: 10,
                        padding: "16px 18px",
                        fontFamily: "monospace",
                        fontSize: 13,
                        lineHeight: 1.85,
                        color: "#F1F5F9",
                        margin: 0,
                        overflowX: "auto",
                      }}
                    >
                      <span style={cmt}>{"// your list"}</span>{"\n"}
                      <span style={kw}>String</span>[] members = {"{"}<span style={str}>"Ravi"</span>, <span style={str}>"Suresh"</span>, <span style={str}>"Priya"</span>{"}"};
                      {"\n\n"}
                      <span style={cmt}>{"// your method — written once"}</span>{"\n"}
                      <span style={kw}>static</span> <span style={kw}>void</span> <span style={nm}>welcomeMember</span>(<span style={kw}>String</span> <span style={pr}>name</span>) {"{"}
                      {"\n    System.out.println("}<span style={str}>"Welcome, "</span>+name+<span style={str}>"! 👋"</span>{");"}
                      {"\n    System.out.println("}<span style={str}>"Your membership is active. ✅"</span>{");"}
                      {"\n    System.out.println("}<span style={str}>"Have a great workout! 💪"</span>{");"}
                      {"\n}"}
                      {"\n\n"}
                      <span style={cmt}>{"// your loop — calls the method for each member"}</span>{"\n"}
                      <span style={kw}>for</span> (<span style={kw}>int</span> i = 0; i {"<"} members.length; i++) {"{"} <span style={cmt}>{"// for every member"}</span>
                      {"\n    "}<span style={nm}>welcomeMember</span>(members[i]); <span style={cmt}>{"// call method for this member"}</span>
                      {"\n}"}
                    </pre>

                    <div
                      style={{
                        marginTop: 12,
                        background: "#1E293B",
                        borderRadius: 10,
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#4ADE80",
                      }}
                    >
                      Welcome, Ravi! 👋<br />Your membership is active. ✅<br />Have a great workout! 💪<br />
                      Welcome, Suresh! 👋<br />Your membership is active. ✅<br />Have a great workout! 💪<br />
                      Welcome, Priya! 👋<br />Your membership is active. ✅<br />Have a great workout! 💪
                    </div>

                    <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.8, color: "#334155" }}>
                      3 members. 9 lines of output. Loop + Method.
                      <br />
                      You wrote the steps once. The loop called them 3 times.
                      <br /><br />
                      <strong>This is how real Java apps work.</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showReveal && revealLines.length >= 4 && !showSection2 && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button
                  onClick={() => {
                    playSound("tick", muted);
                    setShowSection2(true);
                  }}
                  style={{
                    background: "#7C3AED",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 28px",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                  }}
                >
                  Now write YOUR project's method 💪
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ SECTION 2 ═══════════════ */}
        {showSection2 && (
          <div style={{ marginTop: 8, animation: "fadeIn 0.5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#1E293B",
                  color: "#F1F5F9",
                  borderRadius: 10,
                  padding: "6px 20px",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 1,
                }}
              >
                SECTION 2
              </div>
            </div>

            <h2 style={{ textAlign: "center", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, margin: "0 0 20px" }}>
              Write YOUR project's first method 💪
            </h2>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "24px 22px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                marginBottom: 20,
                fontSize: 15,
                lineHeight: 1.9,
              }}
            >
              <p style={{ margin: "0 0 12px" }}>
                Think about one action your app does for each main item.
              </p>
              <div style={{ marginBottom: 12 }}>
                🏋️ Gym → welcome each member when they arrive<br />
                🏨 Hotel → confirm a guest's room booking<br />
                🍱 Mess → confirm a student's meal attendance<br />
                ☕ Chai shop → confirm each order is received
              </div>
              <p style={{ margin: "0 0 8px" }}>Write a method for that action.</p>
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                Start with <span style={kw}>static void</span><br />
                Give it a name that describes the action<br />
                Give it one parameter — the information it needs<br />
                Write 2-3 System.out.println lines inside<br />
                Add a comment on every line
              </div>
              <p style={{ margin: "12px 0 0" }}>
                Then write one sentence: <em>'I can reuse this method when...'</em>
              </p>
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#FFF7ED",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#92400E",
                  fontWeight: 600,
                }}
              >
                Your own code only. No copying. No ChatGPT.
              </div>
            </div>

            {!submitted && (
              <>
                <div style={{ background: "#1E293B", borderRadius: 14, padding: "18px 18px 14px", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
                      YourMethod.java
                    </span>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    placeholder={`// write your method once\n// static = belongs to class\n// void = does something, gives nothing back\nstatic void __________(String __________) {\n//          ↑ method name    ↑ parameter\n\n\n\n// what it does — step 1\nSystem.out.println('__________' + __________ + '__________');\n// step 2\nSystem.out.println('__________');\n// step 3\nSystem.out.println('__________');\n} // method ends\n\n// call it with a real value\n__________('__________'); // runs all steps`}
                    style={{
                      width: "100%",
                      minHeight: 260,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#4ADE80",
                      fontFamily: "monospace",
                      fontSize: 14,
                      lineHeight: 1.8,
                      resize: "vertical",
                      boxSizing: "border-box",
                      caretColor: "#F1F5F9",
                    }}
                    spellCheck={false}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                    In one sentence — when will you reuse this method in your project?
                  </label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    placeholder="I can reuse this method when..."
                    rows={3}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `2px solid ${reflection.trim().length > 0 ? "#10B981" : "#CBD5E1"}`,
                      padding: "12px 14px",
                      fontFamily: "inherit",
                      fontSize: 15,
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: reflection.trim().length > 0 ? "#10B981" : "#94A3B8",
                      fontWeight: 600,
                    }}
                  >
                    {reflection.trim().length > 0 ? "✓ Good" : "Minimum 1 sentence"}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      background: "#7C3AED",
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "16px 36px",
                      fontSize: 17,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                    }}
                  >
                    My first method is written →
                  </button>
                </div>
              </>
            )}

            {submitted && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "2px solid #10B981",
                  borderRadius: 16,
                  padding: "28px 24px",
                  textAlign: "center",
                  animation: "fadeIn 0.5s ease",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔁</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#059669", margin: "0 0 16px" }}>
                  Your first method is written. 🔁
                </h3>
                <div style={{ fontSize: 15, lineHeight: 1.9, color: "#065F46", maxWidth: 540, margin: "0 auto", textAlign: "left" }}>
                  You now know:<br />
                  ✓ Variable — dabba with a name<br />
                  ✓ Data Type — what kind fits inside<br />
                  ✓ Boolean — true or false<br />
                  ✓ if/else — computer makes decisions<br />
                  ✓ Curly braces — groups code together<br />
                  ✓ Array — list dabba with multiple items<br />
                  ✓ for loop — go through every item<br />
                  ✓ Array Index — get item by position<br />
                  ✓ Method — write once, call anywhere<br />
                  ✓ Parameter — information method needs<br />
                  ✓ void — does something, returns nothing<br />
                  ✓ static — belongs to class, call directly
                  <div style={{ textAlign: "center", marginTop: 16, fontWeight: 800 }}>
                    12 concepts. All understood.<br />
                    All connected to YOUR project.
                    <br /><br />
                    Topic 1 is complete.
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      background: "#1E293B",
                      color: "#F1F5F9",
                      borderRadius: 8,
                      padding: "12px 18px",
                      fontWeight: 700,
                      fontSize: 15,
                      textAlign: "center",
                    }}
                  >
                    Next — Topic 2.<br />
                    You learn to think in blueprints.<br />
                    Classes and objects.<br />
                    The way real Java developers think every day.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .split-grid { grid-template-columns: 1fr !important; }
          .call-demo { grid-template-columns: 1fr !important; }
        }
        textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
