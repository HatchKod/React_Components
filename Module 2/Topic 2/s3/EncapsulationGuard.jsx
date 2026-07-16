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
function cn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function mn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function fd(t) { return <span style={{ color: O }}>{t}</span>; }
function val(t) { return <span style={{ color: G }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function privateTip(t) { return <Tip text="Only this class can access — locked from outside"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function publicTip(t) { return <Tip text="Anyone can call this — no restriction"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function returnTip(t) { return <Tip text="Give this value back to whoever called"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function voidTip(t) { return <Tip text="Does something, gives nothing back"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }

// ─── BODYGUARD SVG ───────────────────────────────────────────────────────────
function Bodyguard({ state = "sitting" }) {
  // states: sitting | standing | window
  const standing = state !== "sitting";
  return (
    <div style={{
      transform: standing ? "translateY(0)" : "translateY(4px)",
      opacity: standing ? 1 : 0.7,
      transition: "transform 0.4s ease, opacity 0.4s ease",
      textAlign: "center"
    }}>
      <svg width="80" height="90" viewBox="0 0 100 110">
        <circle cx="50" cy="24" r="16" fill="none" stroke="#334155" strokeWidth="6" />
        {standing ? (
          <>
            <path d="M50 40 L50 78" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 50 L20 44" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 50 L80 44" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 78 L32 104" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 78 L68 104" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M50 40 L50 74" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 46 L34 60" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 46 L66 60" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 74 L38 100" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 74 L62 100" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

function Clipboard({ text }) {
  return (
    <div style={{
      display: "inline-block", background: "#fff", border: "2px solid #92400E",
      borderRadius: 6, padding: "6px 10px", marginTop: 6, animation: "slideIn 0.3s ease"
    }}>
      <div style={{ fontSize: 9, color: "#92400E", fontWeight: 700, marginBottom: 2 }}>CHECK:</div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#78350F" }}>{text || "—"}</div>
    </div>
  );
}

// ─── DABBA (field box) ───────────────────────────────────────────────────────
function Dabba({ label, locked, value, testFlash }) {
  return (
    <div style={{
      position: "relative", width: 84, background: "#E5E7EB", border: "2px solid #9CA3AF",
      borderRadius: 8, padding: "10px 6px", textAlign: "center",
      animation: testFlash === "shake" ? "shake 0.3s" : testFlash === "open" ? "slideIn 0.3s ease" : "none"
    }}>
      {locked && (
        <div style={{ position: "absolute", top: -10, right: -6, fontSize: 16, animation: "popIn 0.3s ease" }}>🔒</div>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{label}</div>
      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, minHeight: 16 }}>{value ?? "—"}</div>
    </div>
  );
}

// ─── TRAVELER — the animated attempt walking through the zones ──────────────
// type: "pass" (walks all the way down to the dabba), "blocked" (stopped and
// bounced back at the bodyguard), "read" (value floats up from the dabba out)
function Traveler({ id, type, value, onArrive }) {
  const startTop = type === "read" ? 92 : 4;
  const endTop = type === "pass" ? 92 : type === "blocked" ? 44 : 4;
  const [top, setTop] = useState(startTop);
  const [shake, setShake] = useState(false);
  const [pop, setPop] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setTop(startTop);
    setShake(false);
    setPop(false);
    setFading(false);
    const t1 = setTimeout(() => setTop(endTop), 40);
    const t2 = setTimeout(() => { setPop(true); if (type === "blocked") setShake(true); }, 40 + 850);
    const holdFor = 550;
    const t3 = setTimeout(() => setFading(true), 40 + 850 + holdFor);
    const t4 = setTimeout(() => onArrive && onArrive(), 40 + 850 + holdFor + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const icon = type === "blocked" ? "🚫" : type === "read" ? "👁️" : "🏃";
  const glow = type === "blocked" ? "#F87171" : type === "read" ? "#60A5FA" : "#34D399";

  return (
    <div style={{
      position: "absolute", left: "50%", top: top + "%",
      transform: `translate(-50%, -50%) scale(${pop ? 1.5 : 1})${shake ? " translateX(4px)" : ""}`,
      transition: "top 0.85s cubic-bezier(.34,1.2,.64,1), transform 0.25s ease",
      opacity: fading ? 0 : 1, animation: shake ? "shake 0.35s" : "none",
      fontSize: 44, zIndex: 20, pointerEvents: "none",
      filter: `drop-shadow(0 0 10px ${glow})`
    }}>
      {type === "read"
        ? <span style={{ background: "#1E3A8A", color: "#DBEAFE", padding: "6px 14px", borderRadius: 20, fontSize: 20, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(30,58,138,0.5)" }}>{value}</span>
        : icon}
    </div>
  );
}

// ─── FLASH + STAMP — big, unmissable feedback on every attempt ──────────────
function FlashOverlay({ id, color }) {
  return (
    <div key={id} style={{
      position: "absolute", inset: 0, background: color, opacity: 0,
      animation: "flashFade 0.7s ease-out", borderRadius: 16, pointerEvents: "none", zIndex: 3
    }} />
  );
}

function StatusStamp({ id, type }) {
  const map = {
    pass: { text: "PASSED THROUGH ✅", color: "#059669" },
    blocked: { text: "BLOCKED 🚫", color: "#DC2626" },
    read: { text: "VALUE READ 👁️", color: "#1D4ED8" },
  };
  const { text, color } = map[type] || map.pass;
  return (
    <div key={id} style={{
      position: "absolute", top: "44%", left: "50%",
      transform: "translate(-50%, -50%) rotate(-6deg)",
      fontSize: 22, fontWeight: 900, color, background: "#fff",
      border: `4px solid ${color}`, borderRadius: 14, padding: "10px 20px",
      zIndex: 25, animation: "stampPop 1.3s ease forwards",
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)", whiteSpace: "nowrap", letterSpacing: 0.5
    }}>{text}</div>
  );
}

// ─── PHASE 1 — SLOT 1 ────────────────────────────────────────────────────────
function Slot1({ onNext, playSound, onAttempt, breakValue, setBreakValue, result, setResult, locked, slot, fireTravel }) {
  const [input, setInput] = useState("");
  const [attempted, setAttempted] = useState(false);

  const tryBreak = () => {
    const n = Number(input);
    if (input === "" || isNaN(n)) return;
    setBreakValue(n);
    setAttempted(true);
    onAttempt(n);
    if (locked) {
      playSound("warn"); setResult("blocked"); fireTravel("blocked", n);
    } else if (n < 0) {
      playSound("warn"); setResult("neg"); fireTravel("pass", n);
    } else {
      playSound("tick"); setResult("pos"); fireTravel("pass", n);
    }
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>See the problem — public fields</div>
      <div style={{ color: "#64748B", marginBottom: 10, fontSize: 13 }}>Read this class. Notice — nothing protects these fields.</div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("String")}{" "}{fd("name")};{"  "}{cm("// anyone can touch directly")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("int")}{" "}{fd("age")};{"   "}{cm("// anyone can touch directly")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("String")}{" "}{fd("plan")};{"  "}{cm("// anyone can touch directly")}</div>
        <div>{"}"}</div>
      </div>

      <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7F1D1D", marginBottom: 8 }}>
          Try to break it — right now try setting age to something ridiculous:
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="-500"
            style={{ width: 100, padding: "8px 10px", borderRadius: 8, border: "1px solid #FCA5A5", fontSize: 14 }} />
          <button onClick={tryBreak}
            style={{ padding: "8px 16px", background: "#7F1D1D", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Set age directly →
          </button>
        </div>

        {result === "neg" && (
          <div style={{ marginTop: 14, background: "#7F1D1D", color: "#FECACA", borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.8, animation: "slideIn 0.4s ease" }}>
            age = {breakValue} ✅ Accepted!<br /><br />
            Your class accepted this with zero complaint. No check. No protection.<br />
            A gym member with age {breakValue} now exists in your system.<br /><br />
            <strong>This is the problem with public fields.</strong>
          </div>
        )}
        {result === "pos" && (
          <div style={{ marginTop: 14, background: "#166534", color: "#BBF7D0", borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.8, animation: "slideIn 0.4s ease" }}>
            age = {breakValue} accepted.<br />
            This time it happens to be valid. But nothing stopped you typing -500.<br />
            Same code. No protection either way.
          </div>
        )}
        {result === "blocked" && (
          <div style={{ marginTop: 14, background: "#0F172A", color: "#E2E8F0", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, animation: "slideIn 0.4s ease" }}>
            ravi.age = {breakValue} ❌<br />
            <span style={{ color: "#F87171" }}>Cannot access private field from outside.</span><br />
            <span style={{ color: "#F87171" }}>The bodyguard blocked it — watch the right panel.</span>
          </div>
        )}
      </div>

      {attempted && slot === 1 && (
        <button onClick={() => { playSound("correct"); onNext(); }}
          style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          I see the problem →
        </button>
      )}
      {locked && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
          Fields are locked now — try clicking "Set age directly" again above and watch what happens on the right.
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1 — SLOT 2 ────────────────────────────────────────────────────────
function Slot2({ onNext, playSound, privacy, setPrivacy, breakValue, result }) {
  const fields = ["name", "age", "plan"];
  const types = { name: "String", age: "int", plan: "String" };
  const allPrivate = fields.every(f => privacy[f] === "private");
  const [dinged, setDinged] = useState(false);
  const [wrongRow, setWrongRow] = useState(null);

  const choose = (f, v) => {
    setPrivacy(p => ({ ...p, [f]: v }));
    if (v === "private") { playSound("add"); setWrongRow(null); }
    else { playSound("warn"); setWrongRow(f); }
  };

  useEffect(() => {
    if (allPrivate && !dinged) { playSound("correct"); setDinged(true); }
  }, [allPrivate]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Step 1 — Lock each field</div>
      <div style={{ color: "#64748B", marginBottom: 14, fontSize: 13 }}>Choose the access modifier that locks each field.</div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2.2 }}>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        {fields.map(f => (
          <div key={f} style={{ paddingLeft: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select value={privacy[f] || ""} onChange={e => choose(f, e.target.value)}
                style={{
                  background: privacy[f] === "private" ? "#134E4A" : "#0F172A",
                  color: privacy[f] === "private" ? "#4ADE80" : "#F1F5F9",
                  border: `1px solid ${wrongRow === f ? "#F87171" : "#475569"}`, borderRadius: 6,
                  fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
                }}>
                <option value="">[ ___ ]</option>
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
              <span>{kw(types[f])}{" "}{fd(f)};</span>
              {privacy[f] === "private" && <span>{" "}{cm("// locked 🔒")}</span>}
            </div>
            {wrongRow === f && privacy[f] !== "private" && (
              <div style={{ fontSize: 11, color: "#F87171", marginTop: 2 }}>
                public leaves it unprotected. Try private — this is the lock.
              </div>
            )}
          </div>
        ))}
        <div>{"}"}</div>
      </div>

      {allPrivate && (
        <div style={{ marginTop: 14, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, padding: 12, fontSize: 13, color: "#065F46", animation: "slideIn 0.4s ease" }}>
          🔒 All three fields are locked. Scroll up and click <strong>"Set age directly →"</strong> again — watch the bodyguard stop it this time.
        </div>
      )}

      {allPrivate && (
        <button onClick={() => { playSound("tick"); onNext(); }}
          style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Now add the door →
        </button>
      )}
    </div>
  );
}

// ─── PHASE 1 — SLOT 3 ────────────────────────────────────────────────────────
const CHECK_OPTIONS = [
  { label: "Only allow if age > 0", value: "newAge > 0" },
  { label: "Only allow if name is not empty", value: "!newName.isEmpty()" },
  { label: "Only allow if plan is not null", value: "newPlan != null" },
  { label: "Write my own check...", value: "__custom__" },
];

function Slot3({ onDone, playSound, getter, setGetter, setter, setSetter }) {
  const [returnWrong, setReturnWrong] = useState(false);

  const getterOk = getter.returnType === "int" && /^get/.test(getter.methodName) && getter.methodName.length > 3;
  const [getterDinged, setGetterDinged] = useState(false);
  useEffect(() => { if (getterOk && !getterDinged) { playSound("add"); setGetterDinged(true); } }, [getterOk]);

  const chooseReturn = (v) => {
    setGetter(g => ({ ...g, returnType: v }));
    if (v !== "int") { playSound("warn"); setReturnWrong(true); }
    else setReturnWrong(false);
  };

  const checkExpr = setter.checkOption === "__custom__" ? setter.customCheck : (CHECK_OPTIONS.find(o => o.value === setter.checkOption)?.value || "");
  const setterOk = /^set/.test(setter.methodName) && setter.methodName.length > 3 && checkExpr.trim().length > 0;
  const [setterDinged, setSetterDinged] = useState(false);
  useEffect(() => { if (setterOk && !setterDinged) { playSound("add"); setSetterDinged(true); } }, [setterOk]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Step 2 — Add a controlled door</div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>GETTER — let people READ the age</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {publicTip("public")}
          <select value={getter.returnType} onChange={e => chooseReturn(e.target.value)}
            style={{
              background: getter.returnType === "int" ? "#1E3A8A" : "#0F172A", color: getter.returnType === "int" ? "#93C5FD" : "#F1F5F9",
              border: `1px solid ${returnWrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }}>
            <option value="">[ type ]</option>
            <option value="String">String</option>
            <option value="int">int</option>
            <option value="boolean">boolean</option>
            <option value="void">void</option>
          </select>
          <input value={getter.methodName} onChange={e => setGetter(g => ({ ...g, methodName: e.target.value }))} placeholder="getAge"
            style={{
              width: 100, background: getterOk ? "#134E4A" : "#0F172A", color: getterOk ? "#4ADE80" : "#F1F5F9",
              border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} />
          <span>() {"{"}</span>
        </div>
        <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// always: 'get' + field name, capital"}</div>
        {returnWrong && <div style={{ paddingLeft: 24, color: "#F87171", fontSize: 11 }}>What type is age? Choose that type.</div>}
        {getterOk && <div style={{ paddingLeft: 24 }}>{kw("return")}{" "}{fd("age")};</div>}
        {getterOk && <div>{"}"}</div>}
      </div>
      {getterOk && (
        <div style={{ marginTop: 10, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 13 }}>
          {publicTip("public")}{" "}{kw("int")}{" "}{mn(getter.methodName)}(){" {  "}{cm("// anyone can READ age")}<br />
          <span style={{ paddingLeft: 24 }}>{kw("return")}{" "}{fd("age")};{"        "}{cm("// give back the age value")}</span><br />
          {"}"}
        </div>
      )}

      {getterOk && (
        <div style={{ marginTop: 26, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>SETTER — let people UPDATE the age, with a check</div>
          <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {publicTip("public")}
              {voidTip("void")}
              <input value={setter.methodName} onChange={e => setSetter(s => ({ ...s, methodName: e.target.value }))} placeholder="setAge"
                style={{
                  width: 100, background: setterOk ? "#134E4A" : "#0F172A", color: setterOk ? "#4ADE80" : "#F1F5F9",
                  border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
                }} />
              <span>({kw("int")} {fd("newAge")}) {"{"}</span>
            </div>
            <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// always: 'set' + field name, capital"}</div>

            <div style={{ paddingLeft: 24, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginBottom: 4 }}>What check should protect this field?</div>
              <select value={setter.checkOption} onChange={e => { setSetter(s => ({ ...s, checkOption: e.target.value })); }}
                style={{ background: "#0F172A", color: "#F1F5F9", border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 12, padding: "4px 8px", maxWidth: 260 }}>
                <option value="">[ choose a check ]</option>
                {CHECK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {setter.checkOption === "__custom__" && (
                <input value={setter.customCheck} onChange={e => setSetter(s => ({ ...s, customCheck: e.target.value }))} placeholder="e.g. newAge > 0"
                  style={{ display: "block", marginTop: 6, width: 220, background: "#0F172A", color: "#F1F5F9", border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 12, padding: "4px 8px" }} />
              )}
            </div>

            {setterOk && (
              <>
                <div style={{ paddingLeft: 24, marginTop: 8 }}>{kw("if")} ({checkExpr}) {"{  "}{cm("// bodyguard checks")}</div>
                <div style={{ paddingLeft: 48 }}>{fd("age")}{" = "}{fd("newAge")};{"  "}{cm("// valid — let through")}</div>
                <div style={{ paddingLeft: 24 }}>{"}"}{"  "}{cm("// invalid — blocked silently")}</div>
              </>
            )}
            <div>{"}"}</div>
          </div>
        </div>
      )}

      {getterOk && setterOk && (
        <button onClick={() => { playSound("correct"); onDone(); }}
          style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Build the full class →
        </button>
      )}
    </div>
  );
}

// ─── PHASE 1 — ASSEMBLED CLASS + TEST ────────────────────────────────────────
function AssembledClass({ getter, setter, checkExpr, onDone, playSound, ageValue, setAgeValue, fireTravel }) {
  const [neg, setNeg] = useState(false);
  const [pos, setPos] = useState(false);
  const [got, setGot] = useState(false);

  const testNeg = () => { setNeg(true); playSound("warn"); fireTravel("blocked", -500); };
  const testPos = () => { setPos(true); setAgeValue(21); playSound("correct"); fireTravel("pass", 21); };
  const testGet = () => { setGot(true); playSound("tick"); fireTravel("read", ageValue ?? 21); };

  useEffect(() => {
    if (neg && pos && got) onDone({ negativeBlocked: true, positiveAllowed: true, getterWorked: true });
  }, [neg, pos, got]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Your class — fully assembled</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("name")};{"  "}{cm("// locked — bodyguard on duty")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("int")}{" "}{fd("age")};{"   "}{cm("// locked — bodyguard on duty")}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("plan")};{"  "}{cm("// locked — bodyguard on duty")}</div>
        <div style={{ height: 8 }} />
        <div style={{ paddingLeft: 24 }}>{kw("public")}{" "}{kw("int")}{" "}{mn(getter.methodName)}(){" {   "}{cm("// reading window for age")}</div>
        <div style={{ paddingLeft: 48 }}>{kw("return")}{" "}{fd("age")};</div>
        <div style={{ paddingLeft: 24 }}>{"}"}</div>
        <div style={{ height: 8 }} />
        <div style={{ paddingLeft: 24 }}>{kw("public")}{" "}{kw("void")}{" "}{mn(setter.methodName)}({kw("int")} {fd("newAge")}) {" {  "}{cm("// controlled door for age")}</div>
        <div style={{ paddingLeft: 48 }}>{kw("if")} ({checkExpr}) {" {            "}{cm("// bodyguard checks")}</div>
        <div style={{ paddingLeft: 72 }}>{fd("age")}{" = "}{fd("newAge")};{"            "}{cm("// valid — through")}</div>
        <div style={{ paddingLeft: 48 }}>{"}"}</div>
        <div style={{ paddingLeft: 24 }}>{"}"}</div>
        <div>{"}"}</div>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1 }}>TEST YOUR BODYGUARD</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={testNeg} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #F87171", background: neg ? "#FEF2F2" : "#fff", color: "#7F1D1D", fontWeight: 700, cursor: "pointer" }}>
          {setter.methodName}(-500)
        </button>
        <button onClick={testPos} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #34D399", background: pos ? "#ECFDF5" : "#fff", color: "#065F46", fontWeight: 700, cursor: "pointer" }}>
          {setter.methodName}(21)
        </button>
        <button onClick={testGet} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #60A5FA", background: got ? "#EFF6FF" : "#fff", color: "#1E3A8A", fontWeight: 700, cursor: "pointer" }}>
          {getter.methodName}()
        </button>
      </div>

      {neg && <div style={{ marginTop: 10, fontSize: 13, color: "#DC2626" }}>❌ Blocked — the bodyguard checked the clipboard and shook their head.</div>}
      {pos && <div style={{ marginTop: 6, fontSize: 13, color: "#059669" }}>✅ Allowed — age is now {ageValue}.</div>}
      {got && <div style={{ marginTop: 6, fontSize: 13, color: "#2563EB" }}>👁️ getAge() returned {ageValue ?? 21} through the reading window.</div>}
    </div>
  );
}

// ─── PHASE 1 REVEAL ──────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["Encapsulation", "hiding fields, controlling access through methods"],
    ["private", "locks a field — only this class can touch it"],
    ["public", "opens a method to anyone"],
    ["Getter", "the reading window — get + field name"],
    ["Setter", "the controlled door — set + field name + a check inside"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => {
      setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 450);
    });
    setTimeout(() => { onDone(); }, 400 + items.length * 450 + 200);
  }, []);
  return (
    <div style={{ background: "#FFFBEB", borderLeft: "3px solid #F59E0B", border: "2px solid #F59E0B", borderRadius: 14, padding: 26, marginTop: 8, animation: "slideIn 0.5s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 18, textAlign: "center" }}>Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✓" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" → "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 18, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.8, fontWeight: 700 }}>
        This pattern is what your project's database connection will require.<br />
        Your class is now ready for Module 2.
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ────────────────────────────────────────────────────
function Phase1Visual({ slot, privacy, breakValue, result, testResults, travel, ageDabbaValue }) {
  const fields = ["name", "age", "plan"];
  const anyPrivate = fields.some(f => privacy[f] === "private");
  const allPrivate = fields.every(f => privacy[f] === "private");
  const bgState = slot >= 4 ? "window" : allPrivate ? "standing" : "sitting";
  const bgAlert = travel && travel.type === "blocked";

  const flashColor = travel?.type === "blocked" ? "rgba(220,38,38,0.28)" : travel?.type === "read" ? "rgba(37,99,235,0.22)" : "rgba(5,150,105,0.24)";

  return (
    <div style={{ position: "relative", minHeight: 460, overflow: "hidden", borderRadius: 14 }}>
      <div style={{ background: "#EFF6FF", borderRadius: 10, padding: 12, marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", letterSpacing: 1, marginBottom: 6 }}>OUTSIDE WORLD</div>
        <div style={{ fontSize: 12, color: "#374151" }}>
          {slot === 1 && result ? `trying to set age = ${breakValue}` : slot >= 4 ? "testing the class" : "no attempt yet"}
        </div>
      </div>

      <div style={{ background: bgAlert ? "#FEF2F2" : "#FFFBEB", transition: "background 0.3s", borderRadius: 10, padding: 14, marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#92400E", letterSpacing: 1, marginBottom: 6 }}>THE BODYGUARD</div>
        <Bodyguard state={bgState} />
        <div style={{ fontSize: 11, color: "#78350F", marginTop: 6, fontWeight: 600 }}>
          {bgState === "sitting" && "Walk right in 🚶"}
          {bgState === "standing" && "Show me what you need 🛑"}
          {bgState === "window" && "At the window with a clipboard 📋"}
        </div>
        {slot >= 4 && testResults?.checkExpr && <Clipboard text={testResults.checkExpr} />}
      </div>

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>CLASS FIELDS</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Dabba label="name" locked={privacy.name === "private"} value={anyPrivate ? "🔒" : null} />
          <Dabba label="age" locked={privacy.age === "private"} value={ageDabbaValue}
            testFlash={travel?.type === "blocked" ? "shake" : travel?.type === "pass" ? "open" : null} />
          <Dabba label="plan" locked={privacy.plan === "private"} value={anyPrivate ? "🔒" : null} />
        </div>
      </div>

      {travel && <FlashOverlay key={"flash" + travel.id} id={travel.id} color={flashColor} />}
      {travel && <Traveler key={travel.id} id={travel.id} type={travel.type} value={travel.value} />}
      {travel && <StatusStamp key={"stamp" + travel.id} id={travel.id} type={travel.type} />}
    </div>
  );
}

// ─── PHASE 2 PARSING ─────────────────────────────────────────────────────────
function splitMethods(code) {
  const headerRe = /public\s+[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*\{/g;
  const starts = [];
  let m;
  while ((m = headerRe.exec(code))) starts.push(m.index);
  return starts.map((s, i) => code.substring(s, i + 1 < starts.length ? starts[i + 1] : code.length));
}

function parsePhase2(code) {
  const clsMatch = code.match(/class\s+(\w+)\s*\{/);
  const className = clsMatch ? clsMatch[1] : "";

  const fieldRe = /private\s+(String|int|boolean|double|long|float)\s+(\w+)\s*;/g;
  const privateFields = [];
  let fm;
  while ((fm = fieldRe.exec(code))) privateFields.push({ type: fm[1], name: fm[2] });

  const publicFieldRe = /(?:^|\n)\s*public\s+(String|int|boolean|double|long|float)\s+(\w+)\s*;/g;
  let hasPublicField = publicFieldRe.test(code);

  const chunks = splitMethods(code);
  const getters = [];
  const setters = [];
  chunks.forEach(chunk => {
    const getterM = chunk.match(/public\s+(String|int|boolean|double|long|float)\s+(get\w+)\s*\(\s*\)/);
    if (getterM && /return/.test(chunk)) getters.push(getterM[2]);
    const setterM = chunk.match(/public\s+void\s+(set\w+)\s*\(([^)]*)\)/);
    if (setterM) {
      const hasCheck = /\bif\s*\(/.test(chunk);
      setters.push({ name: setterM[1], check: hasCheck ? (chunk.match(/if\s*\(([^)]*)\)/) || [])[1] : "", hasCheck });
    }
  });

  return {
    className,
    privateFields,
    hasPublicField,
    getters,
    setters,
    fieldsLocked: privateFields.length,
    gettersCount: getters.length,
    settersWithCheckCount: setters.filter(s => s.hasCheck).length,
  };
}

const PHASE2_STARTER = `// Add encapsulation to YOUR project class
// Step 1: make all fields private
class ________ {
    private String ________;  // locked
    private int ________;     // locked
    private String ________;  // locked
    private boolean ________; // locked
}

// Step 2: getters — reading windows
public String get________() { // read ________
    return ________;
}

public int get________() {    // read ________
    return ________;
}

// Step 3: setters — controlled doors
public void set________(String new________) {
    if (________ != null && !________.isEmpty()) {  // check not empty
        ________ = new________;
    }
}

public void set________(int new________) {
    if (________ > 0) {         // check valid number
        ________ = new________;
    }
}`;

// ─── PHASE 2 LEFT ────────────────────────────────────────────────────────────
function Phase2Left({ code, setCode, reflection, setReflection, onSubmit, submitted, parsed }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.fieldsLocked >= 3 && !parsed.hasPublicField && parsed.gettersCount >= 2 && parsed.settersWithCheckCount >= 1 && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Protect YOUR project's class</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Finish locking the fields and adding the reading windows and controlled doors.</div>

      {!submitted && (
        <>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onPaste={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 260, background: "#1E293B", color: "#E2E8F0",
              fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
              border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
            }}
          />

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              In one sentence — what would happen to your app's data if you didn't have encapsulation?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="Without encapsulation, someone could set age to a bad value and my app would..."
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
            <span style={{ color: parsed.fieldsLocked >= 3 ? "#10B981" : "#94A3B8" }}>{parsed.fieldsLocked >= 3 ? "✓" : "○"} fields private ({parsed.fieldsLocked})</span>
            <span style={{ color: parsed.gettersCount >= 2 ? "#10B981" : "#94A3B8" }}>{parsed.gettersCount >= 2 ? "✓" : "○"} getters ({parsed.gettersCount})</span>
            <span style={{ color: parsed.settersWithCheckCount >= 1 ? "#10B981" : "#94A3B8" }}>{parsed.settersWithCheckCount >= 1 ? "✓" : "○"} setters with check ({parsed.settersWithCheckCount})</span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My class has a bodyguard now →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 16, padding: 28, animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>Your project's class is protected. 🛡️</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9 }}>
            Every field is private.<br />
            Getters let people read safely.<br />
            Setters check before allowing changes.<br /><br />
            In a later module — when you connect your class to a database — this pattern is exactly what makes that connection work.<br /><br />
            <strong>Your bodyguard is in place.</strong><br /><br />
            Next — make your class even more powerful. One class inheriting from another. Writing less code by reusing what already exists.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ────────────────────────────────────────────────────
function Phase2Visual({ parsed }) {
  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 16, filter: "grayscale(1)", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 6 }}>Phase 1 bodyguard</div>
        <Bodyguard state="standing" />
      </div>

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 12, color: "#374151", lineHeight: 2 }}>
          {parsed.fieldsLocked} fields locked 🔒<br />
          {parsed.gettersCount} getters added 👁️<br />
          {parsed.settersWithCheckCount} setters with checks added 🛡️
        </div>
        {parsed.fieldsLocked >= 3 && parsed.gettersCount >= 2 && parsed.settersWithCheckCount >= 1 && (
          <div style={{ marginTop: 10, fontWeight: 700, color: "#059669" }}>Your class is protected.</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
        {parsed.privateFields.slice(0, 4).map((f, i) => <Dabba key={i} label={f.name} locked value="🔒" />)}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EncapsulationGuard() {
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

  // slot 1
  const [breakValue, setBreakValue] = useState(null);
  const [result, setResult] = useState(null);
  const [breakAttempted, setBreakAttempted] = useState(false);

  // animated traveler — the attempt walking through the zones on the right
  const [travel, setTravel] = useState(null);
  const [ageDabbaValue, setAgeDabbaValue] = useState(null);
  const travelIdRef = useRef(0);
  const fireTravel = (type, value) => {
    travelIdRef.current += 1;
    setTravel({ id: travelIdRef.current, type, value });
    if (type === "pass") setAgeDabbaValue(value);
  };

  // slot 2
  const [privacy, setPrivacy] = useState({ name: "", age: "", plan: "" });
  const allPrivate = ["name", "age", "plan"].every(f => privacy[f] === "private");

  // slot 3
  const [getter, setGetter] = useState({ returnType: "", methodName: "" });
  const [setter, setSetter] = useState({ methodName: "", checkOption: "", customCheck: "" });
  const checkExpr = setter.checkOption === "__custom__" ? setter.customCheck : (CHECK_OPTIONS.find(o => o.value === setter.checkOption)?.value || "");

  const [testResults, setTestResults] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  // phase 2
  const [code, setCode] = useState(PHASE2_STARTER);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parsed = parsePhase2(code);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m1-t2-s2-encapsulation-guard",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          breakAttempted,
          breakValue: breakValue == null ? "" : String(breakValue),
          fieldsSetToPrivate: Object.keys(privacy).filter(f => privacy[f] === "private"),
          getterBuilt: { returnType: getter.returnType, methodName: getter.methodName },
          setterBuilt: { methodName: setter.methodName, checkWritten: checkExpr },
          bodyguardTestResults: testResults || { negativeBlocked: false, positiveAllowed: false, getterWorked: false }
        },
        phase2: {
          className: parsed.className,
          privateFields: parsed.privateFields,
          getters: parsed.getters,
          setters: parsed.setters,
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
        @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
        @keyframes flashFade { 0% { opacity:0.55; } 100% { opacity:0; } }
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
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.2.2 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Encapsulation Guard</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>A bodyguard who checks before allowing access</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1
                onNext={() => setSlot(2)}
                playSound={playSound}
                onAttempt={() => setBreakAttempted(true)}
                breakValue={breakValue} setBreakValue={setBreakValue}
                result={result} setResult={setResult}
                locked={allPrivate} slot={slot} fireTravel={fireTravel}
              />
              {slot >= 2 && (
                <Slot2
                  onNext={() => setSlot(3)}
                  playSound={playSound}
                  privacy={privacy} setPrivacy={setPrivacy}
                  breakValue={breakValue} result={result}
                />
              )}
              {slot >= 3 && (
                <Slot3
                  onDone={() => setSlot(4)}
                  playSound={playSound}
                  getter={getter} setGetter={setGetter}
                  setter={setter} setSetter={setSetter}
                />
              )}
              {slot >= 4 && !showReveal && (
                <AssembledClass
                  getter={getter} setter={setter} checkExpr={checkExpr}
                  playSound={playSound}
                  ageValue={ageDabbaValue} setAgeValue={setAgeDabbaValue}
                  fireTravel={fireTravel}
                  onDone={(res) => { setTestResults({ ...res, checkExpr }); setShowReveal(true); playSound("correct"); }}
                />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now protect YOUR project's class →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase1Visual slot={slot} privacy={privacy} breakValue={breakValue} result={result} testResults={testResults} travel={travel} ageDabbaValue={ageDabbaValue} />
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
                parsed={parsed}
              />
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase2Visual parsed={parsed} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
