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
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", P = "#E879F9", GR = "#6B7280", GREEN = "#3B6D11";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function mn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function fd(t) { return <span style={{ color: O }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function extendsTip(t) { return <Tip text="Gets everything from this class - fields and methods, all of it"><span style={{ color: "#3B82F6", fontWeight: 800 }}>{t}</span></Tip>; }
function superTip(t) { return <Tip text="Refers to the parent class from inside the child"><span style={{ color: P, fontWeight: 700 }}>{t}</span></Tip>; }
function parentTip(t) { return <Tip text="The general blueprint - others can extend from it"><span style={{ color: Y, fontWeight: 700 }}>{t}</span></Tip>; }
function childTip(t) { return <Tip text="Extends the parent - gets everything + adds more"><span style={{ color: Y, fontWeight: 700 }}>{t}</span></Tip>; }

// ─── FLASH + STAMP - big, unmissable feedback ────────────────────────────────
function FlashOverlay({ id, color }) {
  return <div key={id} style={{ position: "absolute", inset: 0, background: color, opacity: 0, animation: "flashFade 0.7s ease-out", borderRadius: 16, pointerEvents: "none", zIndex: 3 }} />;
}
function StatusStamp({ id, text, color }) {
  return (
    <div key={id} style={{
      position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%) rotate(-6deg)",
      fontSize: 20, fontWeight: 900, color, background: "#fff", border: `4px solid ${color}`,
      borderRadius: 14, padding: "10px 18px", zIndex: 25, animation: "stampPop 1.3s ease forwards",
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)", whiteSpace: "nowrap", letterSpacing: 0.5
    }}>{text}</div>
  );
}

// ─── PERSON FIGURE - the hostel student / warden character ──────────────────
// The same base body every time (that's the inheritance) - a warden just has
// extra gear layered on top: cap (gained the base identity), whistle + badge
// (own extras only a warden has).
function PersonFigure({ size = 66, color = "#3B6D11", cap, whistle, badge, faded, glow }) {
  return (
    <div style={{
      textAlign: "center",
      filter: glow ? `drop-shadow(0 0 10px ${glow})` : "none",
      opacity: faded ? 0.35 : 1,
      transition: "filter 0.3s ease, opacity 0.4s ease"
    }}>
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
        {cap && (
          <g style={{ animation: "popIn 0.4s ease" }}>
            <path d="M24 24 Q50 2 76 24 L76 30 L24 30 Z" fill="#78350F" />
            <rect x="44" y="6" width="12" height="8" rx="2" fill="#78350F" />
          </g>
        )}
        <circle cx="50" cy="32" r="18" fill="none" stroke={color} strokeWidth="6" />
        <path d="M22 112 C22 74 36 62 50 62 C64 62 78 74 78 112" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
        {whistle && (
          <g style={{ animation: "popIn 0.4s ease" }}>
            <path d="M50 58 L50 74" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="50" cy="80" r="6" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
          </g>
        )}
        {badge && (
          <g style={{ animation: "popIn 0.4s ease" }}>
            <rect x="60" y="66" width="13" height="13" rx="2" fill="#FACC15" stroke="#92400E" strokeWidth="1.5" transform="rotate(15 66 72)" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── INHERITANCE ARROW ────────────────────────────────────────────────────────
function InheritanceArrow({ isExtends }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (isExtends) {
      setDrawn(false);
      const t = setTimeout(() => setDrawn(true), 50);
      return () => clearTimeout(t);
    }
    setDrawn(false);
  }, [isExtends]);

  return (
    <div style={{ position: "relative", height: 68 }}>
      <svg width="100%" height="68" viewBox="0 0 320 68" style={{ overflow: "visible" }} preserveAspectRatio="none">
        <defs>
          <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={isExtends ? GREEN : "#DC2626"} />
          </marker>
        </defs>
        {isExtends ? (
          <path d="M10 34 Q160 -4 310 34" fill="none" stroke={GREEN} strokeWidth="3" markerEnd="url(#arrowHead)"
            style={{ strokeDasharray: 420, strokeDashoffset: drawn ? 0 : 420, transition: "stroke-dashoffset 0.7s ease" }} />
        ) : (
          <path d="M10 34 Q160 -4 310 34" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="7 7" markerEnd="url(#arrowHead)" />
        )}
      </svg>
      <div style={{
        position: "absolute", top: isExtends ? 2 : 18, left: "50%", transform: "translateX(-50%)",
        fontSize: 12, fontWeight: 800, color: isExtends ? GREEN : "#DC2626",
        background: "#fff", padding: "1px 10px", borderRadius: 8, whiteSpace: "nowrap", transition: "color 0.3s"
      }}>{isExtends ? "extends" : "3 duplicate lines"}</div>
    </div>
  );
}

// ─── PHASE 1 - SLOT 1 ────────────────────────────────────────────────────────
function Slot1({ onNext, playSound }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>See the problem - copy-paste fields</div>
      <div style={{ color: "#64748B", marginBottom: 10, fontSize: 13 }}>Two classes. Read both carefully.</div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ color: GR }}>{"// first class"}</div>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("name")};</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("int")}{" "}{fd("age")};</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("plan")};</div>
        <div>{"}"}</div>
        <div style={{ height: 10 }} />
        <div style={{ color: GR }}>{"// second class - notice anything?"}</div>
        <div>{kw("class")}{" "}{cn("AdminUser")}{" {"}</div>
        <div style={{ paddingLeft: 24, background: "#450A0A", borderLeft: "3px solid #DC2626", padding: "2px 8px" }}>
          ⚠️ {kw("private")}{" "}{kw("String")}{" "}{fd("name")};{"  "}<span style={{ color: "#FCA5A5" }}>{"// ← copied from GymMember"}</span>
        </div>
        <div style={{ paddingLeft: 24, background: "#450A0A", borderLeft: "3px solid #DC2626", padding: "2px 8px" }}>
          ⚠️ {kw("private")}{" "}{kw("int")}{" "}{fd("age")};{"   "}<span style={{ color: "#FCA5A5" }}>{"// ← copied from GymMember"}</span>
        </div>
        <div style={{ paddingLeft: 24, background: "#450A0A", borderLeft: "3px solid #DC2626", padding: "2px 8px" }}>
          ⚠️ {kw("private")}{" "}{kw("String")}{" "}{fd("plan")};{"  "}<span style={{ color: "#FCA5A5" }}>{"// ← copied from GymMember"}</span>
        </div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("role")};{"  "}{cm("// new")}</div>
        <div>{"}"}</div>
      </div>

      <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 16, fontSize: 13, color: "#7F1D1D", lineHeight: 1.8 }}>
        ⚠️ These 3 lines are exact copies from GymMember.<br /><br />
        If GymMember ever changes - AdminUser must change too. Manually. Every time.<br /><br />
        <strong>This is the copy-paste problem.</strong>
      </div>
      <div style={{ marginTop: 10, display: "inline-block", background: "#7F1D1D", color: "#FECACA", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
        3 duplicate lines
      </div>

      <div>
        <button onClick={() => { playSound("tick"); onNext(); }}
          style={{ marginTop: 16, display: "block", padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          There is a better way →
        </button>
      </div>
    </div>
  );
}

// ─── PHASE 1 - SLOT 2 ────────────────────────────────────────────────────────
function Slot2({ onNext, playSound }) {
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [dinged, setDinged] = useState(false);
  const ok = input.trim().toLowerCase() === "extends";

  const check = (v) => {
    setInput(v);
    if (v.trim().toLowerCase() === "extends") { setWrong(false); }
    else if (v.length > 0) { setWrong(true); playSound("warn"); }
  };

  useEffect(() => {
    if (ok && !dinged) { playSound("correct"); setDinged(true); }
  }, [ok]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Step 1 - Tell Java that AdminUser IS a GymMember</div>
      <div style={{ color: "#64748B", marginBottom: 14, fontSize: 13 }}>Fill in the blank.</div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span>{kw("class")}{" "}{cn("AdminUser")}</span>
          <input value={input} onChange={e => check(e.target.value)} placeholder="type the keyword"
            style={{
              width: 130, background: ok ? "#134E4A" : "#0F172A", color: ok ? "#4ADE80" : "#F1F5F9",
              border: `1px solid ${wrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} />
          <span>{cn("GymMember")}{" {"}</span>
        </div>
        <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ fill this in"}</div>
        {wrong && <div style={{ paddingLeft: 24, color: "#F87171", fontSize: 11, maxWidth: 420 }}>The keyword is 'extends' - it means this class gets everything from GymMember</div>}
        <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// one word that means 'I have everything GymMember has'"}</div>
        <div style={{ height: 6 }} />
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("role")};{"   "}{cm("// only admins have this")}</div>
        <div>{"}"}</div>
      </div>

      {ok && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 14, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
            <div>{kw("class")}{" "}{cn("AdminUser")}{" "}{extendsTip("extends")}{" "}{cn("GymMember")}{" {"}</div>
            <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ gets EVERYTHING from GymMember automatically"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("role")};{"   "}{cm("// only admins have this")}</div>
            <div>{"}"}</div>
          </div>
          <div style={{ marginTop: 10, display: "inline-block", background: "#134E4A", color: "#4ADE80", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
            0 duplicate lines ✅
          </div>
          <div style={{ marginTop: 12, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: 14, fontSize: 13, color: "#0C4A6E", lineHeight: 1.8 }}>
            AdminUser now has name, age, and plan from GymMember - without copying them.<br /><br />
            Change GymMember → AdminUser updates too. Automatically. Always.
          </div>
          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Now add admin's extra powers →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1 - SLOT 3 ────────────────────────────────────────────────────────
function Slot3({ onDone, playSound, field, setField, methodName, setMethodName }) {
  const [fieldDinged, setFieldDinged] = useState(false);
  const [methodDinged, setMethodDinged] = useState(false);
  const fieldOk = field.type && field.name.trim().length > 0;
  const methodOk = methodName.trim().length > 1;

  useEffect(() => { if (fieldOk && !fieldDinged) { playSound("add"); setFieldDinged(true); } }, [fieldOk]);
  useEffect(() => { if (methodOk && !methodDinged) { playSound("add"); setMethodDinged(true); } }, [methodOk]);

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Step 2 - Add what ONLY admins have</div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>EXTRA FIELD</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>AdminUser has one extra field that GymMember doesn't:</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {kw("private")}
          <select value={field.type} onChange={e => setField(f => ({ ...f, type: e.target.value }))}
            style={{ background: field.type ? "#1E3A8A" : "#0F172A", color: field.type ? "#93C5FD" : "#F1F5F9", border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }}>
            <option value="">[ type ]</option>
            <option value="String">String</option>
            <option value="int">int</option>
            <option value="boolean">boolean</option>
          </select>
          <input value={field.name} onChange={e => setField(f => ({ ...f, name: e.target.value }))} placeholder="e.g. role"
            style={{ width: 110, background: fieldOk ? "#134E4A" : "#0F172A", color: fieldOk ? "#4ADE80" : "#F1F5F9", border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }} />
          <span>;{"  "}{cm("// only admin has this")}</span>
        </div>
        <div style={{ color: GR, fontSize: 11, marginTop: 4 }}>{"// what extra detail does only an admin have?"}</div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 22, marginBottom: 8 }}>EXTRA METHOD</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>AdminUser can do one thing GymMember cannot:</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {cm("// only admin can do this")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {kw("public")}{" "}{kw("void")}
          <input value={methodName} onChange={e => setMethodName(e.target.value)} placeholder="e.g. addNewMember"
            style={{ width: 140, background: methodOk ? "#134E4A" : "#0F172A", color: methodOk ? "#4ADE80" : "#F1F5F9", border: "1px solid #475569", borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }} />
          <span>({kw("String")} {fd("item")}) {"{"}</span>
        </div>
        <div style={{ paddingLeft: 24 }}>{kw("System")}<span style={{ color: GR }}>.</span>out<span style={{ color: GR }}>.</span>println(</div>
        <div style={{ paddingLeft: 48 }}>"Admin action: " + {fd("item")}</div>
        <div style={{ paddingLeft: 24 }}>);</div>
        <div>{"}"}</div>
        <div style={{ color: GR, fontSize: 11, marginTop: 4 }}>{"// what can only an admin DO? starts with a verb"}</div>
      </div>

      {fieldOk && methodOk && (
        <button onClick={() => { playSound("correct"); onDone(); }}
          style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Build the full class →
        </button>
      )}
    </div>
  );
}

// ─── PHASE 1 - ASSEMBLED + DEMO ───────────────────────────────────────────────
function AssembledDemo({ field, methodName, onDone, playSound }) {
  const [ran, setRan] = useState(false);
  const run = () => {
    setRan(true);
    playSound("correct");
    setTimeout(() => playSound("correct"), 150);
    onDone();
  };

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Your full hierarchy - assembled</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
        <div style={{ color: GR }}>{"// parent - common blueprint"}</div>
        <div>{kw("class")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("name")};</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("int")}{" "}{fd("age")};</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw("String")}{" "}{fd("plan")};</div>
        <div style={{ paddingLeft: 24, color: GR }}>{"// getters and setters..."}</div>
        <div>{"}"}</div>
        <div style={{ height: 10 }} />
        <div style={{ color: GR }}>{"// child - gets everything above + adds more"}</div>
        <div>{kw("class")}{" "}{cn("AdminUser")}{" "}{extendsTip("extends")}{" "}{cn("GymMember")}{" {"}</div>
        <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ inherits all of GymMember"}</div>
        <div style={{ paddingLeft: 24 }}>{kw("private")}{" "}{kw(field.type)}{" "}{fd(field.name)};</div>
        <div style={{ paddingLeft: 24 }}>{kw("public")}{" "}{kw("void")}{" "}{mn(methodName)}({kw("String")} {fd("item")}) {"{"}</div>
        <div style={{ paddingLeft: 48 }}>{kw("System")}.out.println(<span>"Admin: " + {fd("item")}</span>);</div>
        <div style={{ paddingLeft: 24 }}>{"}"}</div>
        <div>{"}"}</div>
        <div style={{ height: 10 }} />
        <div style={{ color: GR }}>{"// create and use an admin"}</div>
        <div>{cn("AdminUser")}{" "}{fd("owner")}{" = "}{kw("new")}{" "}{cn("AdminUser")}();</div>
        <div>{fd("owner")}.setName(<span style={{ color: "#4ADE80" }}>"Suresh"</span>);{"  "}{cm("// from GymMember - inherited")}</div>
        <div>{fd("owner")}.setAge(<span style={{ color: "#4ADE80" }}>35</span>);{"      "}{cm("// from GymMember - inherited")}</div>
        <div>{fd("owner")}.set{field.name.charAt(0).toUpperCase() + field.name.slice(1)}(...);{"  "}{cm("// own field")}</div>
        <div>{fd("owner")}.{methodName}(<span style={{ color: "#4ADE80" }}>"item"</span>);{"  "}{cm("// own method")}</div>
      </div>

      <button onClick={run} disabled={ran}
        style={{ marginTop: 14, padding: "12px 24px", background: ran ? "#94A3B8" : "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: ran ? "default" : "pointer" }}>
        See it work →
      </button>

      {ran && (
        <div style={{ marginTop: 12, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 13, animation: "slideIn 0.4s ease" }}>
          <div style={{ color: "#4ADE80" }}>Owner used GymMember's setName: ✅</div>
          <div style={{ color: "#4ADE80" }}>Owner used GymMember's setAge: ✅</div>
          <div style={{ color: "#4ADE80" }}>Owner used own {field.name}: ✅</div>
          <div style={{ color: "#4ADE80" }}>Owner used own {methodName}: ✅</div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1 REVEAL ──────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["Inheritance", "child gets everything from parent automatically"],
    ["extends", "the keyword that creates the parent-child relationship"],
    ["Parent class", "the general blueprint (GymMember)"],
    ["Child class", "extends parent, adds its own extras (AdminUser)"],
    ["super", "a way to refer to the parent from inside the child"],
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
    <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 14, padding: 26, marginTop: 8, animation: "slideIn 0.5s ease" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 18, textAlign: "center" }}>Phase 1 complete 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✓" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" → "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 18, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.8, fontWeight: 700 }}>
        Write common things once in parent. Every child gets them for free.<br />
        Add only what is unique in the child.<br /><br />
        This is inheritance.
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ─────────────────────────────────────────────────────
function ParentCard({ glow }) {
  return (
    <div style={{ flex: "1 1 45%", minWidth: 130, background: "#F3F8ED", border: `2px solid ${GREEN}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: GREEN, marginBottom: 4, textAlign: "center" }}>{parentTip("GymMember")}<br /><span style={{ fontWeight: 400, fontSize: 10 }}>(Parent)</span></div>
      <PersonFigure color={GREEN} glow={glow ? "#3B6D11" : null} />
      <div style={{ fontSize: 10, fontWeight: 700, color: "#3B6D11", textAlign: "center", marginBottom: 8 }}>🎓 the Student</div>
      {["name", "age", "plan"].map(f => (
        <div key={f} style={{ fontSize: 12, color: "#374151", padding: "4px 6px", marginBottom: 4, background: "#fff", borderRadius: 6 }}>🔒 {f}</div>
      ))}
    </div>
  );
}

function ChildCard({ slot, field, methodName, revealedCount, ranDemo, glow }) {
  const solid = slot >= 2;
  return (
    <div style={{
      flex: "1 1 45%", minWidth: 130, background: solid ? "#FFFDF5" : "#fff",
      border: `2px ${solid ? "solid" : "dashed"} ${solid ? "#CA8A04" : "#CBD5E1"}`,
      borderRadius: 12, padding: 14, transition: "border 0.3s, background 0.3s"
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#92400E", marginBottom: 4, textAlign: "center" }}>{childTip("AdminUser")}<br /><span style={{ fontWeight: 400, fontSize: 10 }}>(Child)</span></div>
      <PersonFigure color="#92400E" faded={slot === 1} cap={slot >= 2} whistle={slot >= 3 && methodName && methodName.trim().length > 1}
        badge={slot >= 3 && !!field.name} glow={glow ? "#B45309" : null} />
      <div style={{ fontSize: 10, fontWeight: 700, color: "#92400E", textAlign: "center", marginBottom: 8 }}>
        {slot === 1 ? "still just a copy-paste student" : "👮 the Warden"}
      </div>

      {slot === 1 && (
        <>
          {["name (copy)", "age (copy)", "plan (copy)"].map(f => (
            <div key={f} style={{ fontSize: 11, color: "#7F1D1D", padding: "4px 6px", marginBottom: 4, background: "#FEF2F2", borderLeft: "3px solid #DC2626", borderRadius: 4 }}>⚠️ {f}</div>
          ))}
          <div style={{ fontSize: 12, color: "#374151", padding: "4px 6px", background: "#fff", borderRadius: 6 }}>role (own)</div>
        </>
      )}

      {slot >= 2 && (
        <>
          {["name", "age", "plan"].slice(0, revealedCount).map(f => (
            <div key={f} style={{ fontSize: 11, color: "#3B6D11", padding: "4px 6px", marginBottom: 4, background: "#EAF3DE", borderRadius: 6, animation: "slideIn 0.3s ease" }}>
              ✓ Gets {f} from GymMember <span style={{ fontSize: 9, color: "#65832E" }}>↑ from parent</span>
            </div>
          ))}
          {slot >= 3 && field.name && (
            <div style={{ fontSize: 12, color: "#92400E", padding: "4px 6px", marginTop: 6, marginBottom: 4, background: "#fff", borderRadius: 6, border: "1px solid #FDE68A", animation: "popIn 0.3s ease" }}>
              ⭐ {field.name} <span style={{ fontSize: 9, color: "#B45309" }}>(own - not inherited)</span>
            </div>
          )}
          {slot >= 3 && methodName && methodName.trim().length > 1 && (
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 20, padding: "4px 12px", marginTop: 4, animation: "popIn 0.3s ease" }}>
              ⚡ {methodName} <span style={{ fontWeight: 400 }}>- own method</span>
            </div>
          )}
        </>
      )}

      {ranDemo && (
        <div style={{ marginTop: 12, borderTop: "1px dashed #CBD5E1", paddingTop: 10, fontSize: 11, color: "#374151", lineHeight: 1.8 }}>
          👤 owner = new AdminUser()<br />
          owner.setName() → <span style={{ color: GREEN, fontWeight: 700 }}>parent ⬅</span><br />
          owner.setAge() → <span style={{ color: GREEN, fontWeight: 700 }}>parent ⬅</span><br />
          owner.{field.name || "ownField"} → <span style={{ color: "#92400E", fontWeight: 700 }}>child ⭐</span><br />
          owner.{methodName || "ownMethod"}() → <span style={{ color: "#92400E", fontWeight: 700 }}>child ⭐</span>
        </div>
      )}
    </div>
  );
}

function Phase1Visual({ slot, field, methodName, extendsOk, revealedCount, ranDemo, pulse, demoHighlight }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ParentCard glow={demoHighlight === "parent"} />
        <ChildCard slot={slot} field={field} methodName={methodName} revealedCount={revealedCount} ranDemo={ranDemo} glow={demoHighlight === "child"} />
      </div>
      <InheritanceArrow isExtends={extendsOk} />
      {pulse && <FlashOverlay key={"f" + pulse.id} id={pulse.id} color={pulse.color} />}
      {pulse && <StatusStamp key={"s" + pulse.id} id={pulse.id} text={pulse.text} color={pulse.stampColor} />}
    </div>
  );
}

// ─── PHASE 2 PARSING ──────────────────────────────────────────────────────────
function findClasses(code) {
  const re = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
  const out = [];
  let m;
  while ((m = re.exec(code))) out.push({ name: m[1], extendsName: m[2] || null, start: m.index, bodyStart: re.lastIndex });
  return out;
}
function bodyOf(code, classes, i) {
  const start = classes[i].bodyStart;
  const end = i + 1 < classes.length ? classes[i + 1].start : code.length;
  return code.slice(start, end);
}
function fieldsIn(body) {
  const re = /private\s+(String|int|boolean|double|long|float)\s+(\w+)\s*;/g;
  const out = [];
  let m;
  while ((m = re.exec(body))) out.push({ type: m[1], name: m[2] });
  return out;
}
function methodsIn(body) {
  const re = /public\s+void\s+(\w+)\s*\(/g;
  const out = [];
  let m;
  while ((m = re.exec(body))) out.push(m[1]);
  return out;
}

function parsePhase2(code) {
  const classes = findClasses(code);
  const childIdx = classes.findIndex(c => c.extendsName);
  const parentIdx = classes.findIndex((c, i) => !c.extendsName && (childIdx === -1 || i !== childIdx));

  const parent = parentIdx >= 0 ? classes[parentIdx] : null;
  const child = childIdx >= 0 ? classes[childIdx] : null;

  const parentFields = parent ? fieldsIn(bodyOf(code, classes, parentIdx)) : [];
  const childBody = child ? bodyOf(code, classes, childIdx) : "";
  const childOwnFields = child ? fieldsIn(childBody) : [];
  const childOwnMethods = child ? methodsIn(childBody) : [];

  return {
    parentName: parent ? parent.name : "",
    parentFields,
    childName: child ? child.name : "",
    childExtends: child ? child.extendsName : "",
    childOwnFields,
    childOwnMethods,
  };
}

const PHASE2_STARTER = `// Step 1: your parent class
// (the class you already built in 1.2.1/1.2.2)
class ________ {
    private String ________;
    private int ________;
    private String ________;
    private boolean ________;
    // getters and setters...
}

// Step 2: your child class
// who in your domain is a more specific version?
// Gym: AdminUser extends GymMember
// Hotel: ManagerRoom extends HotelRoom
// Mess: MessAdmin extends MealRecord
class ________ extends ________ {
    // only this type has these:
    private String ________;  // own field

    // only this type can do this:
    public void ________(String item) {
        System.out.println("________: " + item);
    }
}

// Step 3: create one object and use both
________ object1 = new ________();`;

// ─── PHASE 2 LEFT ──────────────────────────────────────────────────────────────
function Phase2Left({ code, setCode, reflection, setReflection, onSubmit, submitted, parsed }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.parentFields.length >= 1 && parsed.childExtends && parsed.childExtends === parsed.parentName &&
    parsed.childOwnFields.length >= 1 && parsed.childOwnMethods.length >= 1 && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Build YOUR project's hierarchy</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Finish the parent class, then the child class that extends it.</div>

      {!submitted && (
        <>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onPaste={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 280, background: "#1E293B", color: "#E2E8F0",
              fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
              border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
            }}
          />

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              In one sentence - what does your child class get from the parent automatically?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="My AdminUser automatically gets name, age, and plan from GymMember without me having to..."
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
            <span style={{ color: parsed.parentFields.length >= 1 ? "#10B981" : "#94A3B8" }}>{parsed.parentFields.length >= 1 ? "✓" : "○"} parent fields ({parsed.parentFields.length})</span>
            <span style={{ color: parsed.childExtends && parsed.childExtends === parsed.parentName ? "#10B981" : "#94A3B8" }}>{parsed.childExtends && parsed.childExtends === parsed.parentName ? "✓" : "○"} extends parent</span>
            <span style={{ color: parsed.childOwnFields.length >= 1 ? "#10B981" : "#94A3B8" }}>{parsed.childOwnFields.length >= 1 ? "✓" : "○"} own fields ({parsed.childOwnFields.length})</span>
            <span style={{ color: parsed.childOwnMethods.length >= 1 ? "#10B981" : "#94A3B8" }}>{parsed.childOwnMethods.length >= 1 ? "✓" : "○"} own methods ({parsed.childOwnMethods.length})</span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My hierarchy is built →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 16, padding: 28, animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>Your hierarchy is built. 🌳</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9 }}>
            {parsed.childName || "Your child class"} extends {parsed.parentName || "your parent class"} - every parent field and method comes along automatically.<br /><br />
            You only wrote what's unique to the child.<br /><br />
            <strong>Zero duplicate code.</strong><br /><br />
            Next - a later module will show tools that connect your classes to a database, using exactly this hierarchy.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase2Visual({ parsed }) {
  const hasExtends = parsed.childExtends && parsed.childExtends === parsed.parentName && parsed.parentName;
  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 14, filter: "grayscale(1)", display: "flex", gap: 8, justifyContent: "center" }}>
        <div style={{ fontSize: 10, color: "#94A3B8" }}>Phase 1 hierarchy (GymMember → AdminUser)</div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 45%", minWidth: 130, background: "#F3F8ED", border: `2px solid ${GREEN}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: GREEN, marginBottom: 4, textAlign: "center" }}>{parsed.parentName || "Parent"}</div>
          <PersonFigure color={GREEN} size={54} />
          {parsed.parentFields.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#374151", padding: "4px 6px", marginBottom: 4, background: "#fff", borderRadius: 6 }}>🔒 {f.name}</div>
          ))}
          {parsed.parentFields.length === 0 && <div style={{ fontSize: 11, color: "#94A3B8" }}>Add fields on the left</div>}
        </div>

        <div style={{
          flex: "1 1 45%", minWidth: 130, background: hasExtends ? "#FFFDF5" : "#fff",
          border: `2px ${hasExtends ? "solid" : "dashed"} ${hasExtends ? "#CA8A04" : "#CBD5E1"}`, borderRadius: 12, padding: 14, transition: "border 0.3s"
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#92400E", marginBottom: 4, textAlign: "center" }}>{parsed.childName || "Child"}</div>
          <PersonFigure color="#92400E" size={54} faded={!hasExtends} cap={hasExtends} whistle={parsed.childOwnMethods.length > 0} badge={parsed.childOwnFields.length > 0} />
          {hasExtends && parsed.parentFields.map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: "#3B6D11", padding: "4px 6px", marginBottom: 4, background: "#EAF3DE", borderRadius: 6 }}>✓ {f.name} <span style={{ fontSize: 9 }}>↑ from parent</span></div>
          ))}
          {parsed.childOwnFields.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#92400E", padding: "4px 6px", marginBottom: 4, background: "#fff", border: "1px solid #FDE68A", borderRadius: 6 }}>⭐ {f.name} <span style={{ fontSize: 9 }}>own</span></div>
          ))}
          {parsed.childOwnMethods.map((m, i) => (
            <div key={i} style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 20, padding: "4px 12px", marginTop: 4, marginRight: 4 }}>⚡ {m}</div>
          ))}
        </div>
      </div>

      <InheritanceArrow isExtends={hasExtends} />

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 14, marginTop: 8, fontSize: 12, color: "#374151", lineHeight: 1.9 }}>
        Parent fields: {parsed.parentFields.length}<br />
        Child inherits: {hasExtends ? parsed.parentFields.length : 0} (all of them) {hasExtends ? "✅" : ""}<br />
        Child adds: {parsed.childOwnFields.length} own field{parsed.childOwnFields.length === 1 ? "" : "s"}<br />
        Child adds: {parsed.childOwnMethods.length} own method{parsed.childOwnMethods.length === 1 ? "" : "s"}<br />
        <strong>Zero duplicate code.</strong>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function InheritanceBuilder() {
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
  const extendsOk = slot >= 2;

  const [field, setField] = useState({ type: "", name: "" });
  const [methodName, setMethodName] = useState("");

  const [revealedCount, setRevealedCount] = useState(0);
  const revealStarted = useRef(false);
  useEffect(() => {
    if (extendsOk && !revealStarted.current) {
      revealStarted.current = true;
      [1, 2, 3].forEach((n, i) => {
        setTimeout(() => { setRevealedCount(n); playSound("tick"); }, 300 + i * 350);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extendsOk]);

  const [pulse, setPulse] = useState(null);
  const pulseIdRef = useRef(0);
  const firePulse = (text, color, stampColor) => {
    pulseIdRef.current += 1;
    setPulse({ id: pulseIdRef.current, text, color, stampColor });
  };
  useEffect(() => {
    if (extendsOk) firePulse("EXTENDS! 🔗", "rgba(59,109,17,0.22)", GREEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extendsOk]);

  const [ranDemo, setRanDemo] = useState(false);
  const [demoHighlight, setDemoHighlight] = useState(null);
  const runDemoHighlights = () => {
    const steps = ["parent", "parent", "child", "child", null];
    steps.forEach((step, i) => setTimeout(() => setDemoHighlight(step), i * 500));
  };
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
      exerciseId: "m2-t2-s4-inheritance-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          extendsKeywordTyped: true,
          parentClass: "GymMember",
          childClass: "AdminUser",
          extraFieldAdded: { type: field.type, name: field.name },
          extraMethodAdded: methodName,
          inheritanceDemoRun: ranDemo
        },
        phase2: {
          parentClassName: parsed.parentName,
          parentFields: parsed.parentFields,
          childClassName: parsed.childName,
          childInheritsFrom: parsed.childExtends,
          childOwnFields: parsed.childOwnFields,
          childOwnMethods: parsed.childOwnMethods,
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
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.2.3 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Inheritance Builder</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>A hostel warden is still a hostel student - just with extra powers</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} />
              {slot >= 2 && <Slot2 onNext={() => setSlot(3)} playSound={playSound} />}
              {slot >= 3 && (
                <Slot3
                  onDone={() => setSlot(4)}
                  playSound={playSound}
                  field={field} setField={setField}
                  methodName={methodName} setMethodName={setMethodName}
                />
              )}
              {slot >= 4 && !showReveal && (
                <AssembledDemo
                  field={field} methodName={methodName} playSound={playSound}
                  onDone={() => { setRanDemo(true); runDemoHighlights(); setShowReveal(true); firePulse("IT WORKS! ✅", "rgba(37,99,235,0.2)", "#1D4ED8"); }}
                />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now build YOUR project's hierarchy →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, minHeight: 380 }}>
                <Phase1Visual slot={slot} field={field} methodName={methodName} extendsOk={extendsOk} revealedCount={revealedCount} ranDemo={ranDemo} pulse={pulse} demoHighlight={demoHighlight} />
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
