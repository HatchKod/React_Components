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

// ─── Tiffin Box (List Visual) ─────────────────────────────────────────────────
function TiffinBox({ members, activeIndex, completedIndices = [], vertical = false }) {
  return (
    <div style={{ width: "100%" }}>
      {/* dabba label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 16, color: "#1E293B" }}>
          <span style={{ color: "#E879F9" }}>[</span>
          members
          <span style={{ color: "#E879F9" }}>]</span>
        </span>
        <span style={{ fontSize: 12, color: "#64748B" }}>- the list dabba</span>
      </div>

      {/* compartments */}
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          gap: 4,
          background: "#F1F5F9",
          border: "2px solid #CBD5E1",
          borderRadius: 12,
          padding: 8,
        }}
      >
        {members.map((name, idx) => {
          const isActive = idx === activeIndex;
          const isDone = completedIndices.includes(idx);
          return (
            <div key={idx} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
                {idx}
              </div>
              <div
                style={{
                  background: isDone ? "#ECFDF5" : "#FFFFFF",
                  borderRadius: 8,
                  padding: "10px 6px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  color: isDone ? "#059669" : "#1E293B",
                  border: `2px solid ${isActive ? "#3B82F6" : isDone ? "#6EE7B7" : "#E2E8F0"}`,
                  boxShadow: isActive ? "0 0 0 3px #3B82F6" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {isDone ? "✓ " : ""}{name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Annotated Loop Code ──────────────────────────────────────────────────────
function AnnotatedCode({ muted }) {
  const kw = { color: "#60A5FA" };         // keywords
  const str = { color: "#4ADE80" };        // strings
  const num = { color: "#FB923C" };        // numbers
  const cmt = { color: "#6B7280", fontStyle: "italic" }; // comments
  const brk = { color: "#E879F9" };        // brackets []

  const TT = ({ children, tip }) => (
    <Tooltip text={tip}>
      <span
        style={{
          borderBottom: "1px dashed #94A3B8",
          cursor: "help",
          display: "inline",
        }}
      >
        {children}
      </span>
    </Tooltip>
  );

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
      }}
    >
      <span style={cmt}>{"// [] means this dabba holds a LIST of Strings"}</span>{"\n"}
      <TT tip="A list dabba - holds multiple Strings">
        <span style={kw}>String</span>
        <span style={brk}>[]</span>
      </TT>
      {" members = "}
      <span style={brk}>{"{"}</span>
      <span style={str}>"Ravi"</span>, <span style={str}>"Suresh"</span>, <span style={str}>"Priya"</span>, <span style={str}>"Anitha"</span>
      <span style={brk}>{"}"}</span>
      {";"}
      {"\n\n"}
      <span style={cmt}>{"// the loop - runs once for every member"}</span>{"\n"}
      <TT tip="Runs the code inside { } for every item">
        <span style={kw}>for</span>
      </TT>
      {" ("}
      <TT tip="Counter - starts at 0, not 1">
        <span style={kw}>int</span>{" i = "}<span style={num}>0</span>
      </TT>
      {";"}{" "}
      <span style={cmt}>{"// start counter at 0"}</span>{"\n     "}
      <TT tip="Stop when counter reaches the end">
        {"i < members."}
        <TT tip="Total number of items in the list">
          <span style={{ color: "#F472B6" }}>length</span>
        </TT>
      </TT>
      {";"}{" "}
      <span style={cmt}>{"// keep going while i < total members"}</span>{"\n     "}
      <TT tip="Add 1 to counter after each round">
        {"i++"}
      </TT>
      {")"}{" "}
      <span style={cmt}>{"// add 1 to i after each round"}</span>{" {"}
      {"\n\n    System.out.println("}
      <TT tip="Get the item at this position in the list">
        <span style={str}>{"members["}</span>
        <span style={num}>{"i"}</span>
        <span style={str}>{"]"}</span>
      </TT>
      {"); "}
      <span style={cmt}>{"// speak member at position i"}</span>
      {"\n\n"}<span style={brk}>{"}"}</span>
      {" "}
      <span style={cmt}>{"// loop ends - all members processed"}</span>
    </pre>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoopVisualizer() {
  const members = ["Ravi", "Suresh", "Priya", "Anitha"];

  const [muted, setMuted] = useState(false);
  const [showPartB, setShowPartB] = useState(false);
  const [showPartC, setShowPartC] = useState(false);
  const [animStep, setAnimStep] = useState(-1); // -1 = not started
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealLines, setRevealLines] = useState([]);
  const [sliderVal, setSliderVal] = useState(4);
  const [showSection2, setShowSection2] = useState(false);
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showLoopComplete, setShowLoopComplete] = useState(false);
  const autoRef = useRef(null);

  const totalSteps = members.length; // 4

  // completed indices = all steps before current
  const completedIndices = animStep >= 0
    ? Array.from({ length: animStep }, (_, i) => i)
    : [];

  const activeIndex = (animStep >= 0 && animStep < totalSteps) ? animStep : -1;

  const stepExplanations = [
    {
      line1: "i = 0 → members[0] = Ravi ✓",
      line2: "Now i++ → i becomes 1",
      line3: "Is 1 < 4? Yes → keep going",
    },
    {
      line1: "i = 1 → members[1] = Suresh ✓",
      line2: "Now i++ → i becomes 2",
      line3: "Is 2 < 4? Yes → keep going",
    },
    {
      line1: "i = 2 → members[2] = Priya ✓",
      line2: "Now i++ → i becomes 3",
      line3: "Is 3 < 4? Yes → keep going",
    },
    {
      line1: "i = 3 → members[3] = Anitha ✓",
      line2: "Now i++ → i becomes 4",
      line3: "Is 4 < 4? No → STOP",
    },
  ];

  const nextStep = useCallback(() => {
    setAnimStep((prev) => {
      const next = prev + 1;
      if (next < totalSteps) {
        playSound("tick", muted);
        return next;
      } else {
        // loop complete
        playSound("correct", muted);
        setShowLoopComplete(true);
        return totalSteps; // sentinel
      }
    });
  }, [muted, totalSteps]);

  // auto play
  useEffect(() => {
    if (isAutoPlaying && animStep < totalSteps && !showLoopComplete) {
      autoRef.current = setTimeout(() => {
        nextStep();
      }, 1400);
    } else if (animStep >= totalSteps) {
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(autoRef.current);
  }, [isAutoPlaying, animStep, nextStep, totalSteps, showLoopComplete]);

  const resetAnim = () => {
    clearTimeout(autoRef.current);
    setAnimStep(-1);
    setIsAutoPlaying(false);
    setShowLoopComplete(false);
  };

  // reveal card lines one by one
  useEffect(() => {
    if (!showReveal) return;
    playSound("reveal", muted);
    const lines = [
      { icon: "📦", bold: "Array (String[])", rest: " → a list dabba that holds multiple items" },
      { icon: "🔁", bold: "for loop", rest: " → go through every item in the list automatically" },
      { icon: "📍", bold: "Array Index (members[i])", rest: " → get one item by its position" },
    ];
    lines.forEach((l, i) => {
      setTimeout(() => {
        setRevealLines((prev) => [...prev, l]);
        playSound("tick", muted);
      }, i * 500);
    });
    setTimeout(() => setShowSection2(true), lines.length * 500 + 300);
  }, [showReveal]); // eslint-disable-line react-hooks/exhaustive-deps

  const sliderStops = [4, 10, 50, 100, 1000];
  const sliderIndex = sliderStops.indexOf(sliderVal) === -1 ? 0 : sliderStops.indexOf(sliderVal);

  const handleSlider = (e) => {
    const idx = parseInt(e.target.value);
    const val = sliderStops[idx];
    if (val === 1000 && sliderVal !== 1000) playSound("correct", muted);
    setSliderVal(val);
  };

  const handleSubmit = () => {
    if (!code.trim() || !reflection.trim()) {
      playSound("warn", muted);
      return;
    }
    playSound("submit", muted);
    setSubmitted(true);
  };

  // ─── render helpers ───────────────────────────────────────────────────────

  const kw = { color: "#60A5FA", fontFamily: "monospace" };
  const str = { color: "#4ADE80", fontFamily: "monospace" };
  const num = { color: "#FB923C", fontFamily: "monospace" };
  const cmt = { color: "#6B7280", fontStyle: "italic", fontFamily: "monospace" };
  const brk = { color: "#E879F9", fontFamily: "monospace" };

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

      {/* ═══════════════ SECTION 1 ═══════════════ */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 0" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, margin: 0, color: "#1E293B" }}>
            Do this for every item - automatically ♾️
          </h1>
          <p style={{ color: "#64748B", marginTop: 8, fontSize: 16 }}>
            See exactly how a loop works - step by step, one item at a time.
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
            Subtopic 1.1.3 - Loops
          </div>
        </div>

        {/* ── PART A: The Problem ── */}
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
            The Problem 🤔
          </h2>

          {/* two-col cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Without a loop */}
            <div
              style={{
                background: "#FFF5F5",
                border: "2px solid #FCA5A5",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                Without a loop 😰
              </div>
              <pre
                style={{
                  background: "#1E293B",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#F1F5F9",
                  margin: 0,
                  lineHeight: 1.7,
                  overflowX: "auto",
                }}
              >
                <span style={str}>System</span>.out.println(<span style={str}>"Ravi"</span>);{"\n"}
                <span style={str}>System</span>.out.println(<span style={str}>"Suresh"</span>);{"\n"}
                <span style={str}>System</span>.out.println(<span style={str}>"Priya"</span>);{"\n"}
                <span style={str}>System</span>.out.println(<span style={str}>"Anitha"</span>);{"\n"}
                <span style={cmt}>// ...what if 100 members?</span>
              </pre>
              <div
                style={{
                  marginTop: 10,
                  background: "#FEE2E2",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#DC2626",
                  fontWeight: 600,
                }}
              >
                4 members = 4 lines<br />
                100 members = 100 lines 😰
              </div>
            </div>

            {/* With a loop */}
            <div
              style={{
                background: "#F0FDF4",
                border: "2px solid #86EFAC",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                With a loop 😎
              </div>
              <pre
                style={{
                  background: "#1E293B",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#F1F5F9",
                  margin: 0,
                  lineHeight: 1.7,
                  overflowX: "auto",
                }}
              >
                <span style={kw}>for</span> (...) {"{"}{"\n"}
                {"    "}System.out.println(<span style={str}>members[i]</span>);{"\n"}
                {"}"}
              </pre>
              <div
                style={{
                  marginTop: 10,
                  background: "#DCFCE7",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#16A34A",
                  fontWeight: 600,
                }}
              >
                4 members = same loop<br />
                100 members = same loop<br />
                1000 members = same loop 😎
              </div>
            </div>
          </div>

          {/* CTA button */}
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
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Show me how the loop works →
              </button>
            </div>
          )}
        </div>

        {/* ── PART B: The List ── */}
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
              Step 1 - Create your list
            </h2>
            <p style={{ color: "#64748B", marginTop: 4, marginBottom: 20, fontSize: 15 }}>
              Before the loop, you need a list.
            </p>

            <TiffinBox members={members} activeIndex={-1} completedIndices={[]} />

            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#64748B",
                background: "#F8FAFC",
                padding: "8px 12px",
                borderRadius: 8,
                borderLeft: "3px solid #3B82F6",
              }}
            >
              Position starts at <strong>0 - not 1</strong>. This is how Java counts. Always.
            </p>

            {/* The Java code for this list */}
            <div style={{ marginTop: 20 }}>
              <pre
                style={{
                  background: "#1E293B",
                  borderRadius: 10,
                  padding: "16px 18px",
                  fontFamily: "monospace",
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: "#F1F5F9",
                  margin: 0,
                  overflowX: "auto",
                }}
              >
                <span style={cmt}>{"// [] means this dabba holds a LIST of Strings"}</span>{"\n"}
                <Tooltip text="A list dabba - holds multiple Strings">
                  <span
                    style={{
                      borderBottom: "1px dashed #94A3B8",
                      cursor: "help",
                    }}
                  >
                    <span style={kw}>String</span>
                    <span style={brk}>[]</span>
                  </span>
                </Tooltip>
                {" members = "}
                <span style={brk}>{"{"}</span>
                <span style={str}>"Ravi"</span>, <span style={str}>"Suresh"</span>,{" "}
                <span style={str}>"Priya"</span>, <span style={str}>"Anitha"</span>
                <span style={brk}>{"}"}</span>
                {";"}
              </pre>
            </div>

            {!showPartC && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>
                  Now - the loop 👇
                </p>
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
                  Show me the loop →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PART C: Loop Step by Step ── */}
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
              Step 2 - The loop runs for each item
            </h2>
            <p style={{ color: "#64748B", margin: "0 0 20px", fontSize: 15 }}>
              Every line of the loop is explained below. Hover any keyword for more.
            </p>

            <AnnotatedCode muted={muted} />

            <p style={{ textAlign: "center", fontWeight: 700, fontSize: 17, marginTop: 24, marginBottom: 16 }}>
              ▶ Run the loop - watch it step by step
            </p>

            {/* controls */}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <button
                onClick={() => {
                  resetAnim();
                  setTimeout(() => {
                    setAnimStep(0);
                    setIsAutoPlaying(true);
                    playSound("tick", muted);
                  }, 60);
                }}
                style={{
                  background: "#10B981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ▶ Run
              </button>
              <button
                onClick={() => {
                  if (animStep < 0) {
                    setAnimStep(0);
                    playSound("tick", muted);
                  } else {
                    nextStep();
                  }
                }}
                disabled={animStep >= totalSteps}
                style={{
                  background: animStep >= totalSteps ? "#CBD5E1" : "#3B82F6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: animStep >= totalSteps ? "not-allowed" : "pointer",
                }}
              >
                ⏭ Next step
              </button>
              <button
                onClick={resetAnim}
                style={{
                  background: "#F1F5F9",
                  color: "#334155",
                  border: "2px solid #CBD5E1",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ↺ Reset
              </button>
            </div>

            {/* animation panels */}
            <div
              className="anim-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 12,
                alignItems: "start",
              }}
            >
              {/* LEFT: list */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>
                  LIST (members)
                </div>
                <TiffinBox
                  members={members}
                  activeIndex={activeIndex}
                  completedIndices={completedIndices}
                  vertical={false}
                />
              </div>

              {/* CENTER: counter + arrow */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 30,
                }}
              >
                {/* counter */}
                <div
                  style={{
                    background: "#1E293B",
                    color: showLoopComplete ? "#EF4444" : "#60A5FA",
                    borderRadius: 10,
                    padding: "8px 16px",
                    fontFamily: "monospace",
                    fontSize: 20,
                    fontWeight: 800,
                    minWidth: 70,
                    textAlign: "center",
                    transition: "all 0.3s",
                  }}
                >
                  i = {showLoopComplete ? totalSteps : animStep < 0 ? 0 : animStep}
                </div>
                {showLoopComplete && (
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textAlign: "center" }}>
                    loop stopped
                  </div>
                )}
                {/* arrow */}
                {activeIndex >= 0 && !showLoopComplete && (
                  <svg width="40" height="24" viewBox="0 0 40 24">
                    <defs>
                      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#8B5CF6" />
                      </marker>
                    </defs>
                    <line
                      x1="0" y1="12" x2="34" y2="12"
                      stroke="#8B5CF6"
                      strokeWidth="2.5"
                      markerEnd="url(#arrowhead)"
                      strokeDasharray="40"
                      strokeDashoffset="0"
                    />
                  </svg>
                )}
              </div>

              {/* RIGHT: output */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>
                  OUTPUT
                </div>
                <div
                  style={{
                    background: "#1E293B",
                    borderRadius: 10,
                    padding: 12,
                    minHeight: 80,
                    fontFamily: "monospace",
                    fontSize: 14,
                  }}
                >
                  {members.slice(0, animStep < 0 ? 0 : animStep + (showLoopComplete ? 0 : 1)).map((name, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: "#4ADE80",
                        padding: "2px 0",
                        animation: "fadeInUp 0.3s ease",
                      }}
                    >
                      ✅ {name}
                    </div>
                  ))}
                  {animStep < 0 && (
                    <div style={{ color: "#475569", fontSize: 12 }}>Output will appear here...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Step explanation */}
            {animStep >= 0 && animStep < totalSteps && !showLoopComplete && (
              <div
                style={{
                  background: "#F1F5F9",
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginTop: 16,
                  fontSize: 14,
                  lineHeight: 1.7,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <div>
                  <span style={{ fontFamily: "monospace", color: "#1E293B", fontWeight: 600 }}>
                    {stepExplanations[animStep].line1}
                  </span>
                </div>
                <div style={{ color: "#64748B" }}>{stepExplanations[animStep].line2}</div>
                <div style={{ color: "#64748B" }}>{stepExplanations[animStep].line3}</div>
              </div>
            )}

            {/* Loop complete card */}
            {showLoopComplete && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "2px solid #6EE7B7",
                  borderRadius: 12,
                  padding: "20px 22px",
                  marginTop: 20,
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, color: "#059669", marginBottom: 10 }}>
                  ✅ Loop complete!
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.8, color: "#065F46" }}>
                  Loop ran <strong>4 times</strong>.<br />
                  Printed <strong>4 names</strong>.<br />
                  From <strong>ONE instruction</strong> inside the loop.<br /><br />
                  Change members to have 100 names -<br />
                  same loop runs <strong>100 times automatically</strong>.
                </div>

                {/* PART D: Power demo */}
                {!showReveal && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>
                      What if you had more members? 💪
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {sliderStops.map((s) => (
                        <span key={s} style={{ fontSize: 12, color: "#64748B", minWidth: 28, textAlign: "center" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={sliderIndex}
                      onChange={handleSlider}
                      style={{ width: "100%", accentColor: "#3B82F6" }}
                    />
                    <div
                      style={{
                        marginTop: 12,
                        padding: "10px 14px",
                        background: "#FFFFFF",
                        borderRadius: 8,
                        fontSize: 15,
                        color: "#1E293B",
                        fontWeight: 600,
                      }}
                    >
                      Loop would run <span style={{ color: "#3B82F6" }}>{sliderVal}</span> times.
                      You write the same <span style={{ color: "#7C3AED" }}>3 lines</span> of code.
                      {sliderVal === 1000 && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "12px 16px",
                            background: "#FFFBEB",
                            border: "2px solid #F59E0B",
                            borderRadius: 8,
                            fontSize: 15,
                            animation: "fadeIn 0.4s ease",
                          }}
                        >
                          <strong>1,000 members.</strong><br />
                          Same loop.<br />
                          Same 3 lines.<br /><br />
                          <strong>This is why developers use loops. ♾️</strong>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        playSound("reveal", muted);
                        setShowReveal(true);
                      }}
                      style={{
                        marginTop: 18,
                        background: "#F59E0B",
                        color: "#1E293B",
                        border: "none",
                        borderRadius: 10,
                        padding: "12px 24px",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                      }}
                    >
                      See what you just learned 🎉
                    </button>
                  </div>
                )}

                {/* Reveal card */}
                {showReveal && (
                  <div
                    style={{
                      marginTop: 24,
                      background: "#FFFBEB",
                      borderLeft: "3px solid #F59E0B",
                      borderRadius: 10,
                      padding: "20px 22px",
                      animation: "fadeIn 0.4s ease",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>
                      3 new concepts - all connected 🎉
                    </div>
                    {revealLines.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          marginBottom: 10,
                          animation: "fadeInUp 0.4s ease",
                          fontSize: 15,
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{line.icon}</span>
                        <span>
                          <strong>{line.bold}</strong>
                          {line.rest}
                        </span>
                      </div>
                    ))}
                    {revealLines.length === 3 && (
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
                        Every list in your neighbourhood app<br />
                        will be handled by a loop exactly like this.<br /><br />
                        Your member list. Your room list.<br />
                        Your meal list. <strong>All of them.</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ SECTION 2 ═══════════════ */}
        {showSection2 && (
          <div
            style={{
              marginTop: 32,
              animation: "fadeIn 0.5s ease",
            }}
          >
            {/* Divider heading */}
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
              Write your project's first loop 💪
            </h2>

            {/* domain reminder */}
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 20,
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              <strong>Your app works with a list:</strong><br />
              🏋️ Gym → list of members<br />
              🏨 Hotel → list of rooms<br />
              🍱 Mess → list of meals<br />
              ☕ Chai shop → list of orders
            </div>

            {/* task card */}
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
              <strong>Write TWO things:</strong>
              <ol style={{ marginTop: 10, paddingLeft: 20 }}>
                <li style={{ marginBottom: 10 }}>
                  An <strong>array with 3 real items</strong> from YOUR neighbourhood project.<br />
                  <span style={{ color: "#64748B", fontSize: 14 }}>
                    Use actual names - real members, real room numbers, real meal names.
                    Not 'item1', 'item2'. Real values.
                  </span>
                </li>
                <li>
                  A <strong>for loop</strong> that goes through that array and prints each item.<br />
                  <span style={{ color: "#64748B", fontSize: 14 }}>
                    Add a comment on EVERY line explaining what it does.
                  </span>
                </li>
              </ol>

              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginTop: 12,
                  fontSize: 14,
                  fontFamily: "monospace",
                  lineHeight: 1.9,
                  color: "#334155",
                }}
              >
                <span style={brk}>[]</span> means list dabba<br />
                Start counting from <span style={num}>0</span><br />
                <span style={kw}>i++</span> means add 1 each round<br />
                members[<span style={num}>i</span>] gets item at position i
              </div>

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
                Your own code only. No copying. No ChatGPT. Use real data from your project.
              </div>
            </div>

            {/* code editor */}
            {!submitted && (
              <>
                <div
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: "18px 18px 14px",
                    marginBottom: 16,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
                      YourLoop.java
                    </span>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    placeholder={`// Step 1: your list\n// [] means this holds multiple items\nString[] __________ = {"___", "___", "___"};\n\n// Step 2: your loop\nfor (int i = 0;              // start at 0\n     i < __________.length;  // while less than total\n     i++) {                  // add 1 each round\n    \n    // speak the item at position i\n    System.out.println(__________[i]);\n}`}
                    style={{
                      width: "100%",
                      minHeight: 220,
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

                {/* reflection textarea */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      fontSize: 15,
                      marginBottom: 8,
                    }}
                  >
                    In one sentence - what does your loop go through and what does it do for each item?
                  </label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    placeholder="My loop goes through every [member/room/meal] in my list and prints..."
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
                      transition: "border-color 0.2s",
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

                {/* submit */}
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
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    My first loop is written →
                  </button>
                </div>
              </>
            )}

            {/* success card */}
            {submitted && (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "2px solid #6EE7B7",
                  borderRadius: 16,
                  padding: "28px 24px",
                  textAlign: "center",
                  animation: "fadeIn 0.5s ease",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔁</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#059669", margin: "0 0 16px" }}>
                  Your first loop is written.
                </h3>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.9,
                    color: "#065F46",
                    maxWidth: 520,
                    margin: "0 auto",
                  }}
                >
                  That array and loop you just wrote?<br /><br />
                  In <strong>Module 2</strong> - Spring Boot will use a loop exactly like this to go through
                  every record in your MySQL database and send them all back to React.<br /><br />
                  In <strong>Module 4</strong> - React will loop through that list and show each item on screen.<br /><br />
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      background: "#1E293B",
                      color: "#F1F5F9",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    Next - methods.<br />Write code once. Use it anywhere.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Global animations ─── */}
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
          .anim-grid {
            grid-template-columns: 1fr !important;
          }
          .anim-grid > *:nth-child(2) {
            display: none;
          }
        }
        textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
