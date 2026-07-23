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
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", G = "#4ADE80", P = "#E879F9", GR = "#94A3B8";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <Tip text="Same as the class name - always. How Java knows it's a constructor."><span style={{ color: Y, fontWeight: 700 }}>{t}</span></Tip>; }
function th(t) { return <Tip text="The object being created right now."><span style={{ color: P, fontWeight: 700 }}>{t}</span></Tip>; }
function pm(t) { return <span style={{ color: O }}>{t}</span>; }
function nw(t) { return <Tip text="Calls the constructor. Creates a fresh object from the blueprint."><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function dotTh(field) { return <>{th("this")}<span style={{ color: GR }}>.</span>{pm(field)}</>; }

// ─── COOKIE VISUALS ──────────────────────────────────────────────────────────
function PersonShape({ color = "#94A3B8", size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="28" r="18" fill="none" stroke={color} strokeWidth="6" />
      <path d="M20 92 C20 60 35 48 50 48 C65 48 80 60 80 92" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function CookieCard({ title, rows, blank, color = "#3B82F6" }) {
  return (
    <div style={{
      width: 150, flexShrink: 0, background: blank ? "#F1F5F9" : "#FFFBEB",
      border: `2px solid ${blank ? "#CBD5E1" : color}`, borderRadius: 14,
      padding: 12, boxShadow: blank ? "none" : `0 4px 14px ${color}22`,
      animation: "slideIn 0.4s ease"
    }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <PersonShape color={blank ? "#CBD5E1" : color} size={44} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textAlign: "center", color: blank ? "#94A3B8" : color, marginBottom: 6 }}>{title}</div>
      {rows.map(([label, val]) => (
        <div key={label} style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 9, color: "#94A3B8" }}>{label}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: blank ? "#9CA3AF" : "#1F2937" }}>
            {blank ? <span style={{ fontStyle: "italic" }}>{val}</span> : val}
          </div>
        </div>
      ))}
    </div>
  );
}

function Cutter({ label, stamping, active, color = "#334155" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        transition: "transform 0.4s ease",
        transform: stamping ? "translateY(20px)" : "translateY(0)"
      }}>
        <svg width="70" height="70" viewBox="0 0 100 100">
          <circle cx="50" cy="28" r="18" fill="none" stroke={active ? color : "#94A3B8"} strokeWidth="7" />
          <path d="M20 92 C20 60 35 48 50 48 C65 48 80 60 80 92" fill="none" stroke={active ? color : "#94A3B8"} strokeWidth="7" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{
        width: 90, height: 14, background: "#D6B98C", borderRadius: 4, margin: "2px auto 0",
        transform: stamping ? "scaleY(0.7)" : "scaleY(1)", transition: "transform 0.3s ease"
      }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Tray({ cookies, emptyLabel }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 8 }}>TRAY</div>
      <div style={{
        display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8,
        background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 12, padding: 12,
        minHeight: 150
      }}>
        {cookies.length === 0 && (
          <div style={{ color: "#94A3B8", fontSize: 12, padding: "40px 12px" }}>{emptyLabel}</div>
        )}
        {cookies.map((c, i) => <CookieCard key={i} {...c} />)}
      </div>
    </div>
  );
}

// ─── THIS-KEYWORD EXPLAINER ──────────────────────────────────────────────────
function ThisExplainer() {
  return (
    <div style={{
      marginTop: 16, background: "#FDF4FF", border: "1px solid #F0ABFC", borderRadius: 12,
      padding: 16, animation: "slideIn 0.4s ease"
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#86198F", marginBottom: 10 }}>THE this KEYWORD - SIDE BY SIDE</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 14, color: P, fontWeight: 700 }}>this.name</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>the field on the object</div>
        </div>
        <div style={{ fontSize: 20, color: "#A855F7" }}>=</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 14, color: O, fontWeight: 700 }}>name</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>the parameter passed in</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "#701A75", lineHeight: 1.7, textAlign: "center" }}>
        When <code>new GymMember("Ravi", 21)</code> is called:<br />
        the <span style={{ color: O, fontWeight: 700 }}>name</span> parameter = "Ravi" &nbsp;→&nbsp; <span style={{ color: P, fontWeight: 700 }}>this.name</span> field gets "Ravi"<br />
        If both were just called <code>name</code>, Java couldn't tell them apart -
        <span style={{ color: P, fontWeight: 700 }}> this.</span> removes the confusion.
      </div>
    </div>
  );
}

// ─── ANALOGY INTRO ───────────────────────────────────────────────────────────
function AnalogyIntro() {
  const rows = [
    ["🔧 Cutter shape", "class GymMember", "The metal shape - designed once, reused forever"],
    ["👋 Pressing it down", "new GymMember(...)", "The action that triggers the stamp"],
    ["⚙️ The press mechanism", "the constructor", "Runs the instant you press - fills the dough with details"],
    ["🍪 The cookie that pops out", "the object (ravi)", "One real, filled-in thing - never the same as the cutter"],
  ];
  return (
    <div style={{
      background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12,
      padding: 18, marginBottom: 20
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0C4A6E", marginBottom: 10 }}>
        THE ANALOGY - a cookie cutter has three parts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(([label, code, desc]) => (
          <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#075985", minWidth: 190 }}>{label}</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, background: "#0C4A6E", color: "#BAE6FD", padding: "2px 8px", borderRadius: 6 }}>{code}</span>
            <span style={{ fontSize: 13, color: "#374151" }}>{desc}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#0C4A6E", fontWeight: 600 }}>
        Same cutter shape every time. A different, freshly-filled cookie every time you press.
      </div>
    </div>
  );
}

// ─── PHASE 1 - SLOT 1 ────────────────────────────────────────────────────────
function Slot1({ onNext, playSound }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <AnalogyIntro />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>What happens when you write new?</div>
      <div style={{ color: "#64748B", marginBottom: 10, fontSize: 13 }}>Read this code first - don't run it in your head yet, just notice what's missing.</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div>{cn("GymMember")}{" "}{pm("ravi")}{" = "}{nw("new")}{" "}{cn("GymMember")}{"();"}</div>
        <div style={{ color: GR, fontSize: 11 }}>{"// ↑ but what are ravi's values?"}</div>
        <div style={{ color: GR, fontSize: 11 }}>{"// name? age? plan?"}</div>
        <div style={{ color: GR, fontSize: 11 }}>{"// all null/zero - nobody set them up"}</div>
        <div style={{ marginTop: 10 }}>{kw("System")}<span style={{ color: GR }}>.</span>{pm("out")}<span style={{ color: GR }}>.</span>{pm("println")}({pm("ravi")}<span style={{ color: GR }}>.</span>{pm("getName")}());</div>
        <div style={{ color: "#F87171" }}>{"// → null"}</div>
        <div style={{ marginTop: 10 }}>{cn("GymMember")}{" "}{pm("suresh")}{" = "}{nw("new")}{" "}{cn("GymMember")}{"();"}</div>
        <div>{kw("System")}<span style={{ color: GR }}>.</span>{pm("out")}<span style={{ color: GR }}>.</span>{pm("println")}({pm("suresh")}<span style={{ color: GR }}>.</span>{pm("getName")}());</div>
        <div style={{ color: "#F87171" }}>{"// → null"}</div>
      </div>
      <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 16, fontSize: 14, color: "#7F1D1D", lineHeight: 1.8 }}>
        Two objects. Both blank.<br />
        No name. No age. No plan.<br /><br />
        Someone needs to set up each new object when it is created.<br />
        <strong>That someone is the constructor.</strong>
      </div>
      <button onClick={() => { playSound("tick"); onNext(); }}
        style={{
          marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff",
          border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer"
        }}>Add the constructor →</button>
    </div>
  );
}

// ─── PHASE 1 - SLOT 2 ────────────────────────────────────────────────────────
function Slot2({ onNext, playSound, onB1, onAllOk }) {
  const [b1, setB1] = useState("");
  const [b1Wrong, setB1Wrong] = useState(false);
  const [b1Void, setB1Void] = useState(false);
  const [b2, setB2] = useState("");
  const [b2Wrong, setB2Wrong] = useState(false);
  const [b3, setB3] = useState("");
  const [b3Wrong, setB3Wrong] = useState(false);
  const [doneSound, setDoneSound] = useState(false);

  const b1ok = b1 === "public";
  const b2ok = b2.trim().toLowerCase() === "this";
  const b3ok = b3.trim().toLowerCase() === "this";
  const allOk = b1ok && b2ok && b3ok;

  const checkB1 = (v) => {
    setB1(v);
    if (v === "public") { setB1Wrong(false); setB1Void(false); playSound("add"); }
    else { setB1Wrong(true); setB1Void(v === "void"); playSound("warn"); }
  };
  const checkB2 = (e) => {
    const v = e.target.value;
    setB2(v);
    if (v.trim().toLowerCase() === "this") { setB2Wrong(false); playSound("add"); }
    else if (v.length > 0) setB2Wrong(true);
  };
  const checkB3 = (e) => {
    const v = e.target.value;
    setB3(v);
    if (v.trim().toLowerCase() === "this") { setB3Wrong(false); playSound("add"); }
    else if (v.length > 0) setB3Wrong(true);
  };

  useEffect(() => {
    if (allOk && !doneSound) { playSound("correct"); setDoneSound(true); }
  }, [allOk]);

  useEffect(() => { onB1 && onB1(b1ok); }, [b1ok]);
  useEffect(() => { onAllOk && onAllOk(b2ok && b3ok); }, [b2ok, b3ok]);

  return (
    <div style={{ marginBottom: 32, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>The constructor - runs every time new is called</div>
      <div style={{ color: "#64748B", marginBottom: 14, fontSize: 13 }}>Fill in the three blanks.</div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{pm("name")};</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("int")}{" "}{pm("age")};</div>
        <div style={{ height: 8 }} />

        <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <select value={b1} onChange={e => checkB1(e.target.value)}
            style={{
              background: b1ok ? "#134E4A" : "#0F172A", color: b1ok ? "#4ADE80" : "#F1F5F9",
              border: `1px solid ${b1Wrong ? "#F87171" : "#475569"}`, borderRadius: 6,
              fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }}>
            <option value="">[ ___ ]</option>
            <option value="public">public</option>
            <option value="private">private</option>
            <option value="void">void</option>
            <option value="static">static</option>
          </select>
          <span>{cn("GymMember")}(</span>{kw("String")}{" "}{pm("name")}, {kw("int")}{" "}{pm("age")}{") {"}
        </div>
        <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"// ↑ blank 1: access modifier"}</div>
        {b1Wrong && (
          <div style={{ paddingLeft: 48, color: "#F87171", fontSize: 11, maxWidth: 480 }}>
            {b1Void
              ? "Constructors NEVER have a return type. Not void. Not String. Nothing. Just the class name directly. Try public."
              : "Constructors are usually public - so any code can create objects. Try public."}
          </div>
        )}

        <div style={{ paddingLeft: 24, marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <input value={b2} onChange={checkB2} placeholder="this"
            style={{
              width: 56, background: b2ok ? "#3B0764" : "#0F172A", color: b2ok ? P : "#F1F5F9",
              border: `1px solid ${b2Wrong ? "#F87171" : "#475569"}`, borderRadius: 6,
              fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} />
          <span>.{pm("name")}{" = "}{pm("name")};</span>
        </div>
        <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"// ↑ blank 2: what refers to the object?"}</div>
        {b2Wrong && <div style={{ paddingLeft: 48, color: "#F87171", fontSize: 11 }}>The keyword is: this - it refers to the object being created right now.</div>}

        <div style={{ paddingLeft: 24, marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <input value={b3} onChange={checkB3} placeholder="this"
            style={{
              width: 56, background: b3ok ? "#3B0764" : "#0F172A", color: b3ok ? P : "#F1F5F9",
              border: `1px solid ${b3Wrong ? "#F87171" : "#475569"}`, borderRadius: 6,
              fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} />
          <span>.{pm("age")}{" = "}{pm("age")};</span>
        </div>
        <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"// ↑ blank 3: same answer"}</div>
        {b3Wrong && <div style={{ paddingLeft: 48, color: "#F87171", fontSize: 11 }}>Same keyword - this.</div>}

        <div>{"}"}</div>
        <div>{"}"}</div>
      </div>

      {allOk && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "#374151" }}>Full constructor:</div>
          <div style={{ marginTop: 8, background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <Tip text="Same as the class name - always. No return type - never."><div>{kw("public")}{" "}{cn("GymMember")}(String name, int age) {"{"}</div></Tip>
            <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ same name as class - always"}</div>
            <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ no return type - never"}</div>
            <div style={{ paddingLeft: 24 }}>{dotTh("name")}{" = "}{pm("name")};</div>
            <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"//   ↑           ↑"}</div>
            <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"//   field       parameter"}</div>
            <div style={{ paddingLeft: 24 }}>{dotTh("age")}{" = "}{pm("age")};</div>
            <div>{"}"}</div>
          </div>

          <ThisExplainer />

          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{
              marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>Now use the constructor →</button>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1 - SLOT 3 ────────────────────────────────────────────────────────
function Slot3({ onDone, playSound, onTaskA, onChecked }) {
  const [taskA, setTaskA] = useState("");
  const [taskAOk, setTaskAOk] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkTaskA = (e) => {
    const v = e.target.value;
    setTaskA(v);
    const ok = /new/i.test(v) && /GymMember/i.test(v);
    if (ok && !taskAOk) { playSound("add"); }
    setTaskAOk(ok);
  };

  const onCheckbox = () => {
    if (!checked) { setChecked(true); playSound("correct"); }
    else setChecked(false);
  };

  useEffect(() => {
    if (taskAOk && checked) onDone();
  }, [taskAOk, checked]);

  useEffect(() => { onTaskA && onTaskA(taskAOk); }, [taskAOk]);
  useEffect(() => { onChecked && onChecked(checked); }, [checked]);

  return (
    <div style={{ marginBottom: 32, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Create real objects + the blank constructor</div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>TASK A - USE THE CONSTRUCTOR</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span>{cn("GymMember")}{" "}{pm("ravi")}{" = "}</span>
          <input value={taskA} onChange={checkTaskA} placeholder="new GymMember"
            style={{
              width: 140, background: taskAOk ? "#1E3A8A" : "#0F172A", color: taskAOk ? "#93C5FD" : "#F1F5F9",
              border: `1px solid ${taskAOk ? "#3B82F6" : "#475569"}`, borderRadius: 6,
              fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} /><span>(</span>
        </div>
        <div style={{ paddingLeft: 48, color: GR, fontSize: 11 }}>{"// ↑ blank: how to create - new keyword + class name"}</div>
        <div style={{ paddingLeft: 24 }}>{cm('"Ravi",')}{"  "}{cm("// name parameter")}</div>
        <div style={{ paddingLeft: 24 }}>{cm("21,")}{"     "}{cm("// age parameter")}</div>
        <div style={{ paddingLeft: 24 }}>{cm('"Basic"')}{" "}{cm("// plan parameter")}</div>
        <div>);</div>
      </div>

      {taskAOk && (
        <div style={{ marginTop: 12, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, animation: "slideIn 0.4s ease" }}>
          <div>{cn("GymMember")}{" "}{pm("ravi")}{" = "}{nw("new")}{" "}{cn("GymMember")}("Ravi", 21, "Basic");</div>
          <div style={{ color: "#4ADE80", marginTop: 6 }}>{"// ravi.name = \"Ravi\" ✅"}</div>
          <div style={{ color: "#4ADE80" }}>{"// ravi.age = 21 ✅"}</div>
          <div style={{ color: "#4ADE80" }}>{"// ravi.plan = \"Basic\" ✅"}</div>
        </div>
      )}

      {taskAOk && (
        <div style={{ marginTop: 28, animation: "slideIn 0.4s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>TASK B - NO-ARG CONSTRUCTOR</div>
          <div style={{ background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 10, padding: 16, fontSize: 14, color: "#713F12", lineHeight: 1.8, marginBottom: 12 }}>
            Some tools that connect your class to external systems need to create a blank object first - then fill the fields one by one.<br /><br />
            For this to work - you need a <strong>no-argument constructor</strong>.<br /><br />
            Add this alongside your existing constructor - both in the same class.
          </div>

          <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{pm("name")};</div>
            <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("int")}{" "}{pm("age")};</div>
            <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{pm("plan")};</div>
            <div style={{ height: 8 }} />
            <div style={{ paddingLeft: 24, color: GR }}>{"// no-arg - creates blank object"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("public")}{" "}{cn("GymMember")}() {"{ }"}</div>
            <div style={{ height: 8 }} />
            <div style={{ paddingLeft: 24, color: GR }}>{"// with parameters - creates real object"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("public")}{" "}{cn("GymMember")}(</div>
            <div style={{ paddingLeft: 48 }}>{kw("String")}{" "}{pm("name")}, {kw("int")}{" "}{pm("age")}, {kw("String")}{" "}{pm("plan")}</div>
            <div style={{ paddingLeft: 24 }}>{") {"}</div>
            <div style={{ paddingLeft: 48 }}>{dotTh("name")}{" = "}{pm("name")};</div>
            <div style={{ paddingLeft: 48 }}>{dotTh("age")}{" = "}{pm("age")};</div>
            <div style={{ paddingLeft: 48 }}>{dotTh("plan")}{" = "}{pm("plan")};</div>
            <div style={{ paddingLeft: 24 }}>{"}"}</div>
            <div>{"}"}</div>
          </div>

          <div style={{ marginTop: 12, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: 14, fontSize: 13, color: "#0C4A6E", lineHeight: 1.7 }}>
            Java picks the right constructor based on what you pass:<br />
            <code>new GymMember()</code> → no-arg<br />
            <code>new GymMember("Ravi", 21, "Basic")</code> → with params
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={onCheckbox} style={{ width: 18, height: 18 }} />
            ✅ I understand both constructors
          </label>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1 REVEAL ──────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["Constructor", "setup method that runs when new is called - same name as class, no return type"],
    ["this", "refers to the object being created right now"],
    ["this.name", "the field on the object"],
    ["no-arg constructor", "no parameters - creates blank object"],
    ["Constructor overloading", "two constructors, different parameters, Java picks the right one"],
    ["new", "calls the constructor - creates a fresh object from the blueprint"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => {
      setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 400 + i * 450);
    });
    setTimeout(() => { playSound("correct"); onDone(); }, 400 + items.length * 450 + 300);
  }, []);
  return (
    <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 14, padding: 28, marginTop: 8, animation: "slideIn 0.5s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 20, textAlign: "center" }}>Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✓" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" - "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 20, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.8, fontWeight: 700 }}>
        Every object is created by a constructor. Every new call runs it.<br /><br />
        <span style={{ fontWeight: 400 }}>
          Your GymMember class now has both - a constructor with parameters for creating real members,
          and a no-arg constructor for tools that need a blank object first.
        </span>
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ────────────────────────────────────────────────────
function Phase1Visual({ slot, b1ok, b2b3ok, taskAOk, checked }) {
  const cookies = [];
  if (taskAOk) cookies.push({ title: "Ravi", color: "#3B82F6", rows: [["Name", '"Ravi"'], ["Age", "21"], ["Plan", '"Basic"']] });
  if (taskAOk) cookies.push({ title: "Suresh", color: "#10B981", rows: [["Name", '"Suresh"'], ["Age", "24"], ["Plan", '"Premium"']] });
  if (checked) cookies.push({ title: "blank", blank: true, color: "#94A3B8", rows: [["Name", "null"], ["Age", "0"], ["Plan", "null"]] });

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 1 }}>THE COOKIE CUTTER</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 10 }}>
        <Cutter label="GymMember class (blueprint)" active={true} stamping={slot === 3} />
      </div>
      <div style={{
        display: "flex", justifyContent: "center", gap: 14, marginBottom: 18,
        fontSize: 10, color: "#94A3B8", flexWrap: "wrap"
      }}>
        <span>🔧 shape = class</span>
        <span>⚙️ press = constructor</span>
        <span>🍪 cookie = object</span>
      </div>

      {slot === 1 && (
        <div style={{ background: "#F1F5F9", border: "1px dashed #CBD5E1", borderRadius: 10, padding: 16, textAlign: "center", fontSize: 13, color: "#64748B" }}>
          Pressing the cutter into the dough...<br />but cookies come out blank.<br />
          <span style={{ fontStyle: "italic" }}>No name label on them. Empty fields.</span>
        </div>
      )}

      {slot === 2 && (
        <div style={{ background: "#F1F5F9", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>Filling in the press mechanism:</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, fontSize: 12 }}>
            <div style={{ color: b1ok ? "#10B981" : "#CBD5E1", fontWeight: 700 }}>{b1ok ? "✓ public" : "○ access modifier"}</div>
            <div style={{ color: b2b3ok ? "#10B981" : "#CBD5E1", fontWeight: 700 }}>{b2b3ok ? "✓ this wired" : "○ this → field"}</div>
          </div>
          {b2b3ok && (
            <div style={{ marginTop: 14, fontSize: 12, color: "#701A75", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <span style={{ color: O, fontFamily: "monospace" }}>parameter</span>
              <span>→</span>
              <span style={{ color: P, fontFamily: "monospace" }}>this.field</span>
            </div>
          )}
        </div>
      )}

      {slot === 3 && (
        <Tray
          cookies={cookies}
          emptyLabel="Press the cutter - objects will appear here"
        />
      )}

      {slot === 3 && cookies.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#64748B", textAlign: "center" }}>
          Different cookies. Same cutter.
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 DOMAIN DATA ─────────────────────────────────────────────────────
const DOMAINS = {
  "🏋️ Gym": {
    cls: "GymMember", color: "#3B82F6",
    fields: [["String", "name"], ["int", "age"], ["String", "plan"], ["boolean", "isActive"]],
    sample: ['"Ravi"', "21", '"Basic"', "true"],
  },
  "🍱 Mess": {
    cls: "MealRecord", color: "#10B981",
    fields: [["String", "studentName"], ["String", "mealType"], ["String", "date"], ["boolean", "attended"]],
    sample: ['"Ravi"', '"Lunch"', '"2024-01-15"', "true"],
  },
  "🏨 Hotel": {
    cls: "HotelRoom", color: "#8B5CF6",
    fields: [["int", "roomNumber"], ["String", "guestName"], ["boolean", "isOccupied"], ["String", "checkInDate"]],
    sample: ["101", '"Ravi"', "true", '"2024-01-15"'],
  },
  "☕ Chai": {
    cls: "Order", color: "#F59E0B",
    fields: [["String", "customerName"], ["String", "item"], ["int", "quantity"], ["boolean", "isServed"]],
    sample: ['"Ravi"', '"Cutting Chai"', "2", "false"],
  },
  "🏪 Other": {
    cls: "ShopItem", color: "#EC4899",
    fields: [["String", "itemName"], ["int", "price"], ["int", "quantity"], ["boolean", "inStock"]],
    sample: ['"Notebook"', "50", "100", "true"],
  },
};

function starterCode(d) {
  const params = d.fields.map(([t, n]) => `    ${t} ${n}`).join(",\n");
  const assigns = d.fields.map(([, n]) => `    this.${n} = ${n};`).join("\n");
  const sample = d.sample.join(", ");
  return `// Add to your ${d.cls} class:

// no-arg constructor
public ${d.cls}() { }

// constructor with your fields
public ${d.cls}(
${params}
) {
${assigns}
}

// create a real object:
${d.cls} obj1 = new ${d.cls}(
    ${sample}
);`;
}

function parseCode(code, cls) {
  const ctorRe = new RegExp(`public\\s+${cls}\\s*\\(([^)]*)\\)`, "g");
  let m, hasNoArg = false, hasParam = false, paramFields = [];
  while ((m = ctorRe.exec(code))) {
    const inner = m[1].trim();
    if (inner === "") hasNoArg = true;
    else {
      hasParam = true;
      paramFields = inner.split(",").map(p => p.trim().split(/\s+/).pop()).filter(Boolean);
    }
  }
  const newMatches = code.match(new RegExp(`new\\s+${cls}\\s*\\(\\s*[^)]+\\)`, "g")) || [];
  const thisMatches = code.match(/this\.\w+\s*=/g) || [];
  return {
    hasNoArgConstructor: hasNoArg,
    hasParamConstructor: hasParam,
    paramConstructorFields: paramFields,
    thisUsedCorrectly: thisMatches.length >= paramFields.length && paramFields.length > 0,
    objectCreated: newMatches.length > 0,
    objectsCreatedCount: newMatches.length,
  };
}

// ─── PHASE 2 LEFT ────────────────────────────────────────────────────────────
function Phase2Left({ domain, setDomain, code, setCode, reflection, setReflection, onSubmit, submitted, parsed }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.hasNoArgConstructor && parsed.hasParamConstructor && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Add constructor to YOUR project class</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Pick your domain, then finish the code.</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {Object.keys(DOMAINS).map(d => (
          <button key={d} onClick={() => { setDomain(d); setCode(starterCode(DOMAINS[d])); }}
            style={{
              padding: "8px 16px", borderRadius: 22, border: `2px solid ${domain === d ? DOMAINS[d].color : "#E2E8F0"}`,
              background: domain === d ? DOMAINS[d].color : "#fff", color: domain === d ? "#fff" : "#374151",
              fontWeight: 600, fontSize: 13, cursor: "pointer"
            }}>{d}</button>
        ))}
      </div>

      {domain && !submitted && (
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
              In one sentence - what is the difference between this.name and name inside a constructor?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="this.name refers to the field on the object being created. name is the parameter passed in from new GymMember('Ravi'...). Without this, Java cannot tell them apart because..."
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

          <div style={{ marginTop: 12, display: "flex", gap: 10, fontSize: 12 }}>
            <span style={{ color: parsed.hasNoArgConstructor ? "#10B981" : "#94A3B8" }}>{parsed.hasNoArgConstructor ? "✓" : "○"} no-arg constructor</span>
            <span style={{ color: parsed.hasParamConstructor ? "#10B981" : "#94A3B8" }}>{parsed.hasParamConstructor ? "✓" : "○"} param constructor</span>
            <span style={{ color: parsed.objectCreated ? "#10B981" : "#94A3B8" }}>{parsed.objectCreated ? "✓" : "○"} object created</span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My class has both constructors →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)", border: "2px solid #10B981", borderRadius: 16, padding: 28, textAlign: "center", animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 28, marginBottom: 14 }}>🍪</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#064E3B", marginBottom: 16 }}>Your domain class is now complete. ✅</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9, textAlign: "left" }}>
            <strong>A constructor with parameters:</strong> creates real objects from values.<br /><br />
            <strong>A no-arg constructor:</strong> creates blank objects for tools that need to fill fields later.<br /><br />
            Both of these will be used when you connect to a database in Module 2.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ────────────────────────────────────────────────────
function Phase2Visual({ domain, parsed, code }) {
  const d = domain ? DOMAINS[domain] : null;
  const cookies = [];
  if (d && parsed.objectCreated) {
    for (let i = 0; i < Math.min(parsed.objectsCreatedCount, 4); i++) {
      cookies.push({
        title: `${d.cls} #${i + 1}`, color: d.color,
        rows: d.fields.slice(0, 3).map(([, n]) => [n, d.sample[d.fields.findIndex(f => f[1] === n)]]),
      });
    }
  }
  if (d && parsed.hasNoArgConstructor) {
    cookies.push({ title: "blank", blank: true, color: "#94A3B8", rows: d.fields.slice(0, 3).map(([t, n]) => [n, t === "boolean" ? "false" : t === "int" ? "0" : "null"]) });
  }

  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 16, filter: "grayscale(1)" }}>
        <div style={{ fontSize: 10, color: "#94A3B8", textAlign: "center", marginBottom: 6 }}>Phase 1 cookies (Ravi / Suresh)</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <CookieCard title="Ravi" color="#3B82F6" rows={[["Name", '"Ravi"'], ["Age", "21"]]} />
          <CookieCard title="Suresh" color="#10B981" rows={[["Name", '"Suresh"'], ["Age", "24"]]} />
        </div>
      </div>

      {!domain && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Pick a domain on the left to start stamping your own objects.</div>}

      {domain && (
        <>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <Cutter label={`${d.cls} class (blueprint)`} active={true} stamping={parsed.objectCreated} color={d.color} />
          </div>
          <Tray cookies={cookies} emptyLabel="Finish the constructors - objects will stamp out here" />
          <div style={{ marginTop: 14, background: "#0F172A", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 12, color: "#94A3B8" }}>
            <div>Objects created: <span style={{ color: "#4ADE80" }}>{parsed.objectsCreatedCount}</span></div>
            <div>Fields set: <span style={{ color: "#4ADE80" }}>{parsed.paramConstructorFields.join(", ") || "-"}</span></div>
            <div>No-arg: <span style={{ color: parsed.hasNoArgConstructor ? "#4ADE80" : "#F87171" }}>{parsed.hasNoArgConstructor ? "✅" : "❌"}</span></div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ConstructorBuilder() {
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

  // slot2 state needed by right visual
  const [b1ok, setB1ok] = useState(false);
  const [b2b3ok, setB2b3ok] = useState(false);
  const [taskAOk, setTaskAOk] = useState(false);
  const [checked, setChecked] = useState(false);

  const [revealDone, setRevealDone] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  // phase 2
  const [domain, setDomain] = useState(null);
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const parsed = domain ? parseCode(code, DOMAINS[domain].cls) : {
    hasNoArgConstructor: false, hasParamConstructor: false, paramConstructorFields: [],
    thisUsedCorrectly: false, objectCreated: false, objectsCreatedCount: 0
  };

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m2-t2-s2-constructor-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          accessModifier: "public",
          thisKeyword: "this",
          newKeywordUsed: "new GymMember",
          noArgUnderstood: true,
          bothConstructorsUnderstood: true
        },
        phase2: {
          domainSelected: domain,
          hasNoArgConstructor: parsed.hasNoArgConstructor,
          hasParamConstructor: parsed.hasParamConstructor,
          paramConstructorFields: parsed.paramConstructorFields,
          thisUsedCorrectly: parsed.thisUsedCorrectly,
          objectCreated: parsed.objectCreated,
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
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        textarea, input { font-family: inherit; }
      `}</style>

      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      <div style={{ background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", padding: "32px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.2.1b · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Constructor Builder</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>The cookie cutter presses out a fresh cookie every time</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} />
              {slot >= 2 && (
                <Slot2
                  onNext={() => setSlot(3)}
                  playSound={playSound}
                  onB1={setB1ok}
                  onAllOk={setB2b3ok}
                />
              )}
              {slot >= 3 && (
                <Slot3
                  onDone={() => { if (!showReveal) setShowReveal(true); }}
                  playSound={playSound}
                  onTaskA={setTaskAOk}
                  onChecked={setChecked}
                />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now update YOUR project class →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase1Visual slot={slot} b1ok={b1ok} b2b3ok={b2b3ok} taskAOk={taskAOk} checked={checked} />
              </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Phase2Left
                domain={domain} setDomain={setDomain}
                code={code} setCode={setCode}
                reflection={reflection} setReflection={setReflection}
                onSubmit={handleSubmit} submitted={submitted}
                parsed={parsed}
              />
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase2Visual domain={domain} parsed={parsed} code={code} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
