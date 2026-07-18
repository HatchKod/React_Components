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
    else if (type === "remove") { play(440, 0, 0.05); play(220, 0.05, 0.05); fade(0, 0.1); }
    else if (type === "correct") { play(523, 0, 0.1); play(659, 0.1, 0.1); play(784, 0.2, 0.1); fade(0, 0.3); }
    else if (type === "submit") { play(392, 0, 0.4); fade(0.1, 0.3); }
    else if (type === "warn") { play(330, 0, 0.1); play(277, 0.1, 0.1); fade(0, 0.2); }
    else if (type === "reveal") { play(523, 0, 0.1); play(659, 0.1, 0.1); play(784, 0.2, 0.1); play(1047, 0.3, 0.2); fade(0, 0.5); }
    else if (type === "tick") { play(800, 0, 0.05, "triangle"); fade(0, 0.05); }
  };
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(v => !v)}>
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)",
          background: "#1E293B", color: "#F8FAFC", fontSize: 11, padding: "4px 8px",
          borderRadius: 6, whiteSpace: "nowrap", zIndex: 100, boxShadow: "0 2px 8px #0004",
          pointerEvents: "none", maxWidth: 240, textAlign: "center"
        }}>{text}</span>
      )}
    </span>
  );
}

// ─── CODE COLOR HELPERS ──────────────────────────────────────────────────────
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", G = "#4ADE80", GR = "#6B7280";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function exc(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function ev(t) { return <span style={{ color: O }}>{t}</span>; }
function str(t) { return <span style={{ color: G }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function tryTip(t) { return <Tip text="Attempt this - if it fails, go straight to catch"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function catchTip(t) { return <Tip text="Handle the failure here - app continues after"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function finallyTip(t) { return <Tip text="Always runs - whether try worked or catch ran"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function parseIntTip(t) { return <Tip text="Converts String to int - throws Exception if not a number"><span style={{ color: Y, fontWeight: 700 }}>{t}</span></Tip>; }

// ─── FLASH + STAMP ────────────────────────────────────────────────────────────
function FlashOverlay({ id, color }) {
  return <div key={id} style={{ position: "absolute", inset: 0, background: color, opacity: 0, animation: "flashFade 0.7s ease-out", borderRadius: 16, pointerEvents: "none", zIndex: 3 }} />;
}
function StatusStamp({ id, text, color }) {
  return (
    <div key={id} style={{
      position: "absolute", top: "38%", left: "50%", transform: "translate(-50%, -50%) rotate(-6deg)",
      fontSize: 18, fontWeight: 900, color, background: "#fff", border: `4px solid ${color}`,
      borderRadius: 14, padding: "8px 16px", zIndex: 25, animation: "stampPop 1.2s ease forwards",
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)", whiteSpace: "nowrap"
    }}>{text}</div>
  );
}

// ─── BUILDING - the gym building with windows ────────────────────────────────
function Building({ runId, mode }) {
  // mode: "idle" | "good" | "crash" | "recovering"
  const [flickerOn, setFlickerOn] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [strike, setStrike] = useState(false);
  const [recoverStep, setRecoverStep] = useState(0); // windows come back one at a time

  useEffect(() => {
    setShowGenerator(false);
    setShaking(false);
    setFlickerOn(true);
    setStrike(false);
    setRecoverStep(0);
    if (mode === "crash") {
      setStrike(true);
      setTimeout(() => setShaking(true), 60);
      setTimeout(() => setFlickerOn(false), 90);
      setTimeout(() => setStrike(false), 380);
    }
    if (mode === "recovering") {
      const seq = [false, true, false, true, false];
      seq.forEach((v, i) => setTimeout(() => setFlickerOn(v), i * 130));
      const genAt = seq.length * 130 + 80;
      setTimeout(() => setShowGenerator(true), genAt);
      [1, 2, 3, 4, 5, 6].forEach((n, i) => setTimeout(() => setRecoverStep(n), genAt + 120 + i * 90));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, mode]);

  const windows = [0, 1, 2, 3, 4, 5];
  const windowLit = (i) => {
    if (mode === "good") return true;
    if (mode === "recovering") return showGenerator ? recoverStep > i : flickerOn;
    return false;
  };

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <div style={{
        fontSize: 30, marginBottom: 4, transition: "color 0.3s ease",
        color: mode === "crash" ? "#DC2626" : mode === "recovering" && !flickerOn ? "#DC2626" : "#F59E0B",
        animation: mode === "crash" ? "flicker 0.15s 3" : "none"
      }}>⚡</div>

      <div style={{
        display: "inline-block", position: "relative",
        animation: shaking ? "shake 0.4s" : "none"
      }}>
        {strike && (
          <svg width="120" height="100" viewBox="0 0 120 100" style={{ position: "absolute", top: -60, left: 0, animation: "strikeFlash 0.35s ease-out forwards" }}>
            <polyline points="60,-40 48,10 62,10 40,60" fill="none" stroke="#FDE047" strokeWidth="4" strokeLinejoin="round" />
          </svg>
        )}
        <svg width="120" height="100" viewBox="0 0 120 100">
          <rect x="10" y="20" width="100" height="78" fill="#94A3B8" stroke="#64748B" strokeWidth="2" />
          <polygon points="5,20 60,2 115,20" fill="#475569" />
          <rect x="52" y="70" width="16" height="28" fill="#334155" />
          {windows.map((w, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            const lit = windowLit(i);
            return (
              <rect key={w} x={22 + col * 30} y={32 + row * 32} width="18" height="18"
                fill={lit ? "#FEF3C7" : "#1E293B"} stroke="#334155" strokeWidth="1"
                style={{ transition: `fill 0.25s ease ${mode === "recovering" ? i * 0.03 : 0}s` }} />
            );
          })}
        </svg>
        {mode === "crash" && (
          <div style={{ position: "absolute", top: -6, right: -6, fontSize: 28, animation: "popIn 0.3s ease" }}>❌</div>
        )}
        {showGenerator && (
          <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 22, animation: "popIn 0.3s ease" }}>🔋</div>
        )}
      </div>

      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: mode === "crash" ? "#DC2626" : mode === "good" ? "#059669" : mode === "recovering" ? "#059669" : "#94A3B8" }}>
        {mode === "crash" && "CRASHED"}
        {mode === "good" && "Running ✅"}
        {mode === "recovering" && (showGenerator ? "Running ✅" : "recovering...")}
        {mode === "idle" && "waiting..."}
      </div>

      <Heartbeat mode={mode} runId={runId} recovering={mode === "recovering" && !showGenerator} />
    </div>
  );
}

// ─── HEARTBEAT - vital signs of the app ───────────────────────────────────────
function Heartbeat({ mode, runId }) {
  const alive = mode === "good" || (mode === "recovering");
  const flat = mode === "crash" || mode === "idle";
  const beatShape = "0,17 14,17 20,4 26,30 32,4 38,17 62,17 68,4 74,30 80,4 86,17 100,17";
  return (
    <div style={{ marginTop: 10, background: "#0F172A", borderRadius: 8, padding: "5px 8px", overflow: "hidden" }}>
      <svg width="100%" height="26" viewBox="0 0 100 34" preserveAspectRatio="none">
        {flat ? (
          <polyline points="0,17 100,17" fill="none" stroke="#DC2626" strokeWidth="2" />
        ) : (
          <g style={{ animation: "heartScroll 1.1s linear infinite" }}>
            <polyline points={beatShape} fill="none" stroke="#4ADE80" strokeWidth="2" />
            <polyline points={beatShape} fill="none" stroke="#4ADE80" strokeWidth="2" transform="translate(100,0)" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── OUTPUT TERMINAL ──────────────────────────────────────────────────────────
function Terminal({ runId, lines }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    lines.forEach((_, i) => setTimeout(() => setCount(c => Math.max(c, i + 1)), i * 260));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  return (
    <div style={{ background: "#0F172A", borderRadius: 10, padding: 12, marginTop: 12, minHeight: 70, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
      {lines.length === 0 && <div style={{ color: "#475569" }}>- run a test to see output -</div>}
      {lines.slice(0, count).map((l, i) => (
        <div key={i} style={{ color: l.color, animation: "slideIn 0.25s ease", fontWeight: l.bold ? 700 : 400 }}>{l.text}</div>
      ))}
    </div>
  );
}

// ─── SLOT 1 - the crash without protection ───────────────────────────────────
function Slot1({ onNext, playSound, onGood, onBad, badTested }) {
  const [output, setOutput] = useState([]);
  const [runId, setRunId] = useState(0);

  const runGood = () => {
    setRunId(id => id + 1);
    setOutput([{ text: "Age saved: 21", color: "#4ADE80" }, { text: "App still running... ✅", color: "#4ADE80", bold: true }]);
    playSound("correct");
    onGood();
  };
  const runBad = () => {
    setRunId(id => id + 1);
    setOutput([
      { text: "❌ NumberFormatException!", color: "#FCD34D" },
      { text: "App CRASHED.", color: "#F87171" },
      { text: "Server stopped.", color: "#F87171" },
      { text: "Nobody can use this app until a developer restarts it.", color: "#F87171" }
    ]);
    playSound("warn");
    setTimeout(() => playSound("warn"), 200);
    onBad();
  };

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>What happens without protection?</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ color: GR }}>{"// no protection - dangerous"}</div>
        <div>{kw("String")} userInput = {str('"twenty one"')};{"  "}{cm("// bad input")}</div>
        <div>{kw("int")} age = {parseIntTip("Integer.parseInt")}(userInput);{"  "}{cm("// convert to number")}</div>
        <div>{kw("System")}.out.println({str('"Age saved: "')} + age);</div>
        <div>{kw("System")}.out.println({str('"App still running... ✅"')});</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={runGood} style={{ padding: "10px 16px", background: "#065F46", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Run with good input (21) →
        </button>
        <button onClick={runBad} style={{ padding: "10px 16px", background: "#7F1D1D", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Run with bad input (twenty one) →
        </button>
      </div>

      <Terminal runId={runId} lines={output} />

      {badTested && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
            One bad input. Entire app down. This is why try/catch exists.
          </div>
          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Now protect it →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 2 - add try/catch ───────────────────────────────────────────────────
function Slot2({ onNext, playSound }) {
  const [b1, setB1] = useState("");
  const [b2, setB2] = useState("");
  const [b1Wrong, setB1Wrong] = useState(false);
  const [b2Wrong, setB2Wrong] = useState(false);
  const [dinged1, setDinged1] = useState(false);
  const [dinged2, setDinged2] = useState(false);
  const ok1 = b1.trim().toLowerCase() === "try";
  const ok2 = b2.trim().toLowerCase() === "catch";

  const check1 = (v) => { setB1(v); if (v.trim().toLowerCase() === "try") setB1Wrong(false); else if (v.length > 0) { setB1Wrong(true); playSound("warn"); } };
  const check2 = (v) => { setB2(v); if (v.trim().toLowerCase() === "catch") setB2Wrong(false); else if (v.length > 0) { setB2Wrong(true); playSound("warn"); } };

  useEffect(() => { if (ok1 && !dinged1) { playSound("add"); setDinged1(true); } }, [ok1]);
  useEffect(() => { if (ok2 && !dinged2) { playSound("add"); setDinged2(true); } }, [ok2]);
  useEffect(() => { if (ok1 && ok2) playSound("correct"); }, [ok1, ok2]);

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Wrap the risky code in try/catch</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <input value={b1} onChange={e => check1(e.target.value)} placeholder="first keyword"
            style={{ width: 90, background: ok1 ? "#134E4A" : "#0F172A", color: ok1 ? "#4ADE80" : "#F1F5F9", border: `1px solid ${b1Wrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }} />
          <span>{"{"}</span>
        </div>
        <div style={{ color: GR, fontSize: 11 }}>{"// the block where you ATTEMPT something"}</div>
        {b1Wrong && <div style={{ color: "#F87171", fontSize: 11 }}>The block where you attempt something risky is called...?</div>}
        <div style={{ paddingLeft: 24, marginTop: 4 }}>{cm("// attempt this")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("int")} age = {parseIntTip("Integer.parseInt")}(userInput);</div>
        <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({str('"Age saved: "')} + age);</div>
        <div style={{ height: 6 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span>{"} "}</span>
          <input value={b2} onChange={e => check2(e.target.value)} placeholder="second keyword"
            style={{ width: 90, background: ok2 ? "#134E4A" : "#0F172A", color: ok2 ? "#4ADE80" : "#F1F5F9", border: `1px solid ${b2Wrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }} />
          <span>({exc("Exception")} {ev("e")}) {"{"}</span>
        </div>
        <div style={{ color: GR, fontSize: 11 }}>{"// the block that CATCHES the problem"}</div>
        {b2Wrong && <div style={{ color: "#F87171", fontSize: 11 }}>The block that catches failures is called...?</div>}
        <div style={{ paddingLeft: 24, marginTop: 4 }}>{cm("// handle failure")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({str('"Please enter a number."')});</div>
        <div>{"}"}</div>
      </div>

      {ok1 && ok2 && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 12, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
            <div>{tryTip("try")} {"{"}{"  "}{cm("// attempt this")}</div>
            <div style={{ paddingLeft: 24 }}>{kw("int")} age = {parseIntTip("Integer.parseInt")}(userInput);{"  "}{cm("// risky - might fail")}</div>
            <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({str('"Age saved: "')} + age);{"  "}{cm("// only runs if try works")}</div>
            <div>{"} "}{catchTip("catch")} ({exc("Exception")} {ev("e")}) {"{  "}{cm("// if try fails - come here")}</div>
            <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({str('"Please enter a number."')});{"  "}{cm("// friendly message")}</div>
            <div>{"}"}</div>
            <div>{kw("System")}.out.println({str('"App still running. ✅"')});{"  "}{cm("// always runs - no crash")}</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>Now test it with bad input →</div>
          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Test your protection →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 3 - test the protection ─────────────────────────────────────────────
function Slot3({ onDone, playSound, onGood, onBad, goodTested, badTested }) {
  const [output, setOutput] = useState([]);
  const [runId, setRunId] = useState(0);

  const runGood = () => {
    setRunId(id => id + 1);
    setOutput([{ text: "Age saved: 21", color: "#4ADE80" }, { text: "App still running. ✅", color: "#4ADE80", bold: true }]);
    playSound("correct");
    onGood();
  };
  const runBad = () => {
    setRunId(id => id + 1);
    setOutput([{ text: "Please enter a number.", color: "#FCD34D" }, { text: "App still running. ✅", color: "#4ADE80", bold: true }]);
    playSound("warn");
    setTimeout(() => playSound("correct"), 250);
    onBad();
  };

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Test your protection</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={runGood} style={{ padding: "10px 16px", background: "#065F46", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Run with good input (21) →
        </button>
        <button onClick={runBad} style={{ padding: "10px 16px", background: "#7F1D1D", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Run with bad input (twenty one) →
        </button>
      </div>

      <Terminal runId={runId} lines={output} />

      {badTested && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#374151", animation: "slideIn 0.4s ease" }}>
          Bad input caught. App kept running.<br /><br />
          Without try/catch: crash. With try/catch: graceful recovery. That is the difference.
        </div>
      )}

      {goodTested && badTested && (
        <button onClick={() => { playSound("correct"); onDone(); }}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          See the finally block →
        </button>
      )}
    </div>
  );
}

// ─── FINALLY BONUS ────────────────────────────────────────────────────────────
function FinallyBonus({ onDone, playSound }) {
  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Bonus: the finally block</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div>{tryTip("try")} {"{"}</div>
        <div style={{ paddingLeft: 24, color: GR }}>{"// attempt"}</div>
        <div>{"} "}{catchTip("catch")} ({exc("Exception")} {ev("e")}) {"{"}</div>
        <div style={{ paddingLeft: 24, color: GR }}>{"// handle failure"}</div>
        <div>{"} "}{finallyTip("finally")} {"{"}</div>
        <div style={{ paddingLeft: 24, color: GR }}>{"// this ALWAYS runs -"}</div>
        <div style={{ paddingLeft: 24, color: GR }}>{"// whether try worked or catch ran"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({str('"Attempt finished."')});{"  "}{cm("// always prints")}</div>
        <div>{"}"}</div>
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
        finally runs no matter what. Use it to clean up after a try/catch - always.
      </div>
      <button onClick={() => { playSound("correct"); onDone(); }}
        style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        See the summary →
      </button>
    </div>
  );
}

// ─── REVEAL ───────────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["Exception", "an unexpected problem that stops your code"],
    ["try { }", "attempt this - if it fails, go to catch"],
    ["catch (Exception e) { }", "handle the failure here - app continues after this"],
    ["finally { }", "always runs - success or failure"],
    ["Integer.parseInt()", "converts String to int - throws Exception if not a number"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 350 + i * 380));
    setTimeout(() => onDone(), 350 + items.length * 380 + 200);
  }, []);
  return (
    <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 14, padding: 24, marginTop: 8, animation: "slideIn 0.5s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 16, textAlign: "center" }}>Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 16, marginTop: 1 }}>{ticked.includes(i) ? "✓" : "○"}</span>
          <div style={{ fontSize: 13 }}><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" → "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 16, textAlign: "center", color: "#78350F", fontSize: 13, lineHeight: 1.8, fontWeight: 700 }}>
        One bad input without try/catch = crash.<br />
        One bad input with try/catch = friendly message + app keeps running.<br /><br />
        This is what separates a student project from a professional app.
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase1Visual({ buildingMode, runId, pulse }) {
  return (
    <div style={{ position: "relative", minHeight: 260 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>YOUR APP - LIVE</div>
      <Building runId={runId} mode={buildingMode} />
      {pulse && <FlashOverlay key={"f" + pulse.id} id={pulse.id} color={pulse.color} />}
      {pulse && <StatusStamp key={"s" + pulse.id} id={pulse.id} text={pulse.text} color={pulse.stampColor} />}
    </div>
  );
}

// ─── PHASE 2 PARSING ──────────────────────────────────────────────────────────
function parsePhase2(code) {
  const tryMatch = code.match(/try\s*\{([\s\S]*?)\}\s*catch/);
  const catchMatch = code.match(/catch\s*\(\s*Exception\s+\w+\s*\)\s*\{([\s\S]*?)\}(\s*finally|\s*$|\s*\n)/);
  const finallyMatch = code.match(/finally\s*\{([\s\S]*?)\}/);

  const tryBody = tryMatch ? tryMatch[1].trim() : "";
  const catchBody = catchMatch ? catchMatch[1].trim() : "";
  const finallyBody = finallyMatch ? finallyMatch[1].trim() : "";

  const hasParseInt = /Integer\.parseInt/.test(tryBody);
  const msgMatch = catchBody.match(/println\(\s*['"]([^'"]*)['"]/);
  const catchMessage = msgMatch ? msgMatch[1].trim() : "";
  const catchMessageValid = catchMessage.length > 0 && !/^_+$/.test(catchMessage);

  return {
    hasTry: !!tryMatch, tryBody, hasParseInt,
    hasCatch: !!catchMatch, catchBody, catchMessage, catchMessageValid,
    hasFinally: !!finallyMatch, finallyBody
  };
}

const PHASE2_STARTER = `// YOUR PROJECT -- try/catch

// Think of something in your app
// that could receive bad input:
// Gym: age input, fee input
// Hotel: room number input
// Mess: meal count input

// Wrap risky code in try/catch
try {
    // attempt this risky operation
    int amount = Integer.parseInt(________); // user's input
    System.out.println("Saved: " + amount);

} catch (Exception e) {
    // handle failure with a friendly message
    System.out.println("________"); // your helpful message
} finally {
    // optional: always runs
    System.out.println("Attempt complete.");
}

System.out.println("App still running. ✅");`;

// ─── PHASE 2 LEFT ──────────────────────────────────────────────────────────────
function Phase2Left({ code, setCode, reflection, setReflection, onSubmit, submitted, parsed, testResults, runValid, runInvalid }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.hasTry && parsed.hasCatch && parsed.catchMessageValid &&
    testResults.validInputRan && testResults.invalidInputCaught && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Protect YOUR project</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Finish the try/catch, then test both paths.</div>

      {!submitted && (
        <>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onPaste={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 300, background: "#1E293B", color: "#E2E8F0",
              fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
              border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
            }}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button onClick={runValid} style={{ padding: "8px 16px", background: "#065F46", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Test with valid input →
            </button>
            <button onClick={runInvalid} style={{ padding: "8px 16px", background: "#7F1D1D", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Test with invalid input →
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              In one sentence - describe one place in your project where bad input could cause a crash, and how try/catch will protect it.
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="In my gym app, a user might type letters in the fee field. Without try/catch this would..."
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

          <div style={{ marginTop: 12, display: "flex", gap: 10, fontSize: 12, flexWrap: "wrap" }}>
            <span style={{ color: parsed.hasTry ? "#10B981" : "#94A3B8" }}>{parsed.hasTry ? "✓" : "○"} try block</span>
            <span style={{ color: parsed.hasCatch ? "#10B981" : "#94A3B8" }}>{parsed.hasCatch ? "✓" : "○"} catch block</span>
            <span style={{ color: parsed.catchMessageValid ? "#10B981" : "#94A3B8" }}>{parsed.catchMessageValid ? "✓" : "○"} friendly message</span>
            <span style={{ color: testResults.validInputRan && testResults.invalidInputCaught ? "#10B981" : "#94A3B8" }}>{testResults.validInputRan && testResults.invalidInputCaught ? "✓" : "○"} both tested</span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My project is protected →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 16, padding: 28, animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>Your app is protected. 🔋</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9 }}>
            Bad input no longer crashes your app - it gets caught and handled with a friendly message.<br /><br />
            Your app keeps running no matter what a user types.<br /><br />
            In a later module, you'll protect even more risky operations this same way.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase2Visual({ parsed, buildingMode, runId }) {
  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 12, filter: "grayscale(1)", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
        Phase 1 app (already protected)
      </div>

      <div style={{ background: "#EFF6FF", borderLeft: "3px solid #3B82F6", borderRadius: 8, padding: 10, marginBottom: 8, opacity: parsed.hasTry ? 1 : 0.4, transition: "opacity 0.3s" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>try {"{ }"}</div>
        {parsed.hasTry && <div style={{ fontSize: 11, color: "#1E3A8A" }}>{parsed.hasParseInt ? "attempting a risky conversion..." : "ready"}</div>}
      </div>
      <div style={{ background: "#FFF7ED", borderLeft: "3px solid #F59E0B", borderRadius: 8, padding: 10, marginBottom: 8, opacity: parsed.hasCatch ? 1 : 0.4, transition: "opacity 0.3s" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>catch (Exception e) {"{ }"}</div>
        {parsed.catchMessageValid && <div style={{ fontSize: 11, color: "#78350F" }}>"{parsed.catchMessage}"</div>}
      </div>
      {parsed.hasFinally && (
        <div style={{ background: "#F0FDF4", borderLeft: "3px solid #10B981", borderRadius: 8, padding: 10, marginBottom: 12, animation: "slideIn 0.3s ease" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>finally {"{ }"}</div>
          <div style={{ fontSize: 11, color: "#065F46" }}>always runs ✅</div>
        </div>
      )}

      <Building runId={runId} mode={buildingMode} />
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TryCatchGuard() {
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

  // slot 1 - crash demo
  const [goodTestedNoProtect, setGoodTestedNoProtect] = useState(false);
  const [badTestedNoProtect, setBadTestedNoProtect] = useState(false);

  // slot 3 - protected demo
  const [goodTestedProtect, setGoodTestedProtect] = useState(false);
  const [badTestedProtect, setBadTestedProtect] = useState(false);

  const [buildingMode, setBuildingMode] = useState("idle");
  const [buildingRunId, setBuildingRunId] = useState(0);

  const [pulse, setPulse] = useState(null);
  const pulseIdRef = useRef(0);
  const firePulse = (text, color, stampColor) => {
    pulseIdRef.current += 1;
    setPulse({ id: pulseIdRef.current, text, color, stampColor });
  };

  const [showFinally, setShowFinally] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const runBuilding = (mode) => {
    setBuildingRunId(id => id + 1);
    setBuildingMode(mode);
  };

  // phase 2
  const [code, setCode] = useState(PHASE2_STARTER);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [testResults, setTestResults] = useState({ validInputRan: false, invalidInputCaught: false });
  const [p2BuildingMode, setP2BuildingMode] = useState("idle");
  const [p2RunId, setP2RunId] = useState(0);
  const parsed = parsePhase2(code);

  const runValid = () => {
    setP2RunId(id => id + 1);
    setP2BuildingMode("good");
    setTestResults(t => ({ ...t, validInputRan: true }));
    playSound("correct");
  };
  const runInvalid = () => {
    setP2RunId(id => id + 1);
    setP2BuildingMode(parsed.hasTry && parsed.hasCatch ? "recovering" : "crash");
    setTestResults(t => ({ ...t, invalidInputCaught: true }));
    if (parsed.hasTry && parsed.hasCatch) { playSound("warn"); setTimeout(() => playSound("correct"), 250); }
    else { playSound("warn"); setTimeout(() => playSound("warn"), 200); }
  };

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m1-t3-s3-try-catch-guard",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          crashWithoutTryCatchSeen: badTestedNoProtect,
          badInputTestedWithout: badTestedNoProtect,
          tryKeywordTyped: "try",
          catchKeywordTyped: "catch",
          goodInputTestedWith: goodTestedProtect,
          badInputTestedWith: badTestedProtect,
          finallyBlockSeen: showFinally
        },
        phase2: {
          tryBlockContent: parsed.tryBody,
          catchMessage: parsed.catchMessage,
          finallyWritten: parsed.hasFinally,
          testResults,
          fullCode: code,
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
        @keyframes popIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
        @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
        @keyframes flicker { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes strikeFlash { 0% { opacity:1; } 60% { opacity:0.8; } 100% { opacity:0; } }
        @keyframes heartScroll { from { transform:translateX(0); } to { transform:translateX(-100px); } }
        @keyframes flashFade { 0% { opacity:0.5; } 100% { opacity:0; } }
        @keyframes stampPop {
          0% { opacity:0; transform:translate(-50%,-50%) rotate(-6deg) scale(0.3); }
          15% { opacity:1; transform:translate(-50%,-50%) rotate(-6deg) scale(1.25); }
          28% { transform:translate(-50%,-50%) rotate(-6deg) scale(1); }
          78% { opacity:1; }
          100% { opacity:0; transform:translate(-50%,-50%) rotate(-6deg) scale(0.92); }
        }
        textarea, input, select { font-family: inherit; }
      `}</style>

      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      <div style={{ background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", padding: "32px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.3.3 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Try/Catch Guard</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>The backup generator that keeps your app running</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1
                onNext={() => setSlot(2)} playSound={playSound}
                onGood={() => { setGoodTestedNoProtect(true); runBuilding("good"); }}
                onBad={() => { setBadTestedNoProtect(true); runBuilding("crash"); firePulse("CRASHED! 💥", "rgba(220,38,38,0.22)", "#DC2626"); }}
                badTested={badTestedNoProtect}
              />
              {slot >= 2 && <Slot2 onNext={() => setSlot(3)} playSound={playSound} />}
              {slot >= 3 && (
                <Slot3
                  onDone={() => setShowFinally(true)} playSound={playSound}
                  onGood={() => { setGoodTestedProtect(true); runBuilding("good"); }}
                  onBad={() => { setBadTestedProtect(true); runBuilding("recovering"); firePulse("CAUGHT! 🔋", "rgba(16,185,129,0.2)", "#059669"); }}
                  goodTested={goodTestedProtect} badTested={badTestedProtect}
                />
              )}
              {showFinally && !showReveal && <FinallyBonus onDone={() => setShowReveal(true)} playSound={playSound} />}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now protect YOUR project →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, minHeight: 320 }}>
                <Phase1Visual buildingMode={buildingMode} runId={buildingRunId} pulse={pulse} />
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                code={code} setCode={setCode}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                parsed={parsed} testResults={testResults}
                runValid={runValid} runInvalid={runInvalid}
              />
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase2Visual parsed={parsed} buildingMode={p2BuildingMode} runId={p2RunId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
