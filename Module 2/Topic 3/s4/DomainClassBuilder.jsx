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

// ─── CODE COLOR HELPERS ──────────────────────────────────────────────────────
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", G = "#4ADE80", P = "#E879F9", GR = "#6B7280";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function mn(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function fd(t) { return <span style={{ color: O }}>{t}</span>; }
function str(t) { return <span style={{ color: G }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function ang(t) { return <span style={{ color: P }}>{t}</span>; }

// ─── CONCEPT PILL — tap target beside a code line ────────────────────────────
function Pill({ label, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
      border: `1px solid ${done ? "#65832E" : "#C0DD97"}`, background: done ? "#EAF3DE" : "#F7FBF0",
      color: done ? "#3B6D11" : "#65832E", cursor: "pointer", whiteSpace: "nowrap"
    }}>{done ? "✓ " : ""}{label}</button>
  );
}

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

// ─── PHASE 1 — CONCEPT CHECKLIST ─────────────────────────────────────────────
const CONCEPT_ORDER = [
  ["vars", "Variables + Data Types (1.1.1)"],
  ["ifelse", "if/else (1.1.2)"],
  ["forloop", "for loop (1.1.3)"],
  ["methods", "Methods (1.1.4)"],
  ["classobj", "Class + Object (1.2.1)"],
  ["encap", "Encapsulation (1.2.2)"],
  ["list", "List (1.3.1)"],
  ["trycatch", "try/catch (1.3.3)"],
];

function ConceptChecklist({ tapped }) {
  const allDone = CONCEPT_ORDER.every(([k]) => tapped[k]);
  return (
    <div style={{ marginTop: 16, background: "#F9FAFB", border: `2px solid ${allDone ? "#10B981" : "#E5E7EB"}`, borderRadius: 12, padding: 16, transition: "border 0.3s" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Concepts used in this class:</div>
      {CONCEPT_ORDER.map(([k, label]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13 }}>
          <span style={{ color: tapped[k] ? "#10B981" : "#CBD5E1", fontWeight: 700, fontSize: 15, transition: "transform 0.2s", transform: tapped[k] ? "scale(1.15)" : "scale(1)" }}>{tapped[k] ? "✅" : "☐"}</span>
          <span style={{ color: tapped[k] ? "#1E293B" : "#94A3B8" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PHASE 1 — THE COMPLETE EXAMPLE CLASS ────────────────────────────────────
function Phase1Code({ tapped, tap, playSound }) {
  const mark = (k, e) => { tap(k); if (e) e.currentTarget.blur(); };
  return (
    <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
      <div>{kw("import")} java.util.List;</div>
      <div>{kw("import")} java.util.ArrayList;</div>
      <div style={{ height: 8 }} />
      <div>{kw("public class")} {cn("GymMember")} {"{"}</div>

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("private")} {kw("String")} {fd("name")};</span>
        <Pill label="Encapsulation" done={tapped.encap} onClick={(e) => mark("encap", e)} />
        <Pill label="Variables" done={tapped.vars} onClick={(e) => mark("vars", e)} />
      </div>
      <div style={{ paddingLeft: 24 }}>{kw("private")} {kw("int")} {fd("age")};</div>
      <div style={{ paddingLeft: 24 }}>{kw("private")} {kw("String")} {fd("plan")};</div>
      <div style={{ paddingLeft: 24 }}>{kw("private")} {kw("boolean")} {fd("isActive")};</div>
      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("private")} {kw("List")}{ang("<")}{kw("String")}{ang(">")} {fd("bookings")};</span>
        <Pill label="List" done={tapped.list} onClick={(e) => mark("list", e)} />
      </div>
      <div style={{ height: 8 }} />

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {cn("GymMember")}({kw("String")} name, {kw("int")} age, {kw("String")} plan) {"{"}</span>
        <Pill label="Constructor" done={tapped.classobj} onClick={(e) => mark("classobj", e)} />
      </div>
      <div style={{ paddingLeft: 48 }}>{kw("this")}.{fd("name")} = name;</div>
      <div style={{ paddingLeft: 48 }}>{kw("this")}.{fd("age")} = age;</div>
      <div style={{ paddingLeft: 48 }}>{kw("this")}.{fd("plan")} = plan;</div>
      <div style={{ paddingLeft: 48 }}>{kw("this")}.{fd("isActive")} = {kw("true")};</div>
      <div style={{ paddingLeft: 48 }}>{kw("this")}.{fd("bookings")} = {kw("new")} {kw("ArrayList")}{ang("<>()")};</div>
      <div style={{ paddingLeft: 24 }}>{"}"}</div>
      <div style={{ height: 8 }} />

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {kw("String")} {mn("getName")}() {"{ "}{kw("return")} {fd("name")}; {"}"}</span>
        <Pill label="Getter" done={tapped.encap} onClick={(e) => mark("encap", e)} />
      </div>
      <div style={{ paddingLeft: 24 }}>{kw("public")} {kw("int")} {mn("getAge")}() {"{ "}{kw("return")} {fd("age")}; {"}"}</div>
      <div style={{ height: 8 }} />

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {kw("void")} {mn("setAge")}({kw("int")} newAge) {"{"}</span>
        <Pill label="Setter with check" done={tapped.encap} onClick={(e) => mark("encap", e)} />
      </div>
      <div style={{ paddingLeft: 48 }}>{kw("if")} (newAge {">"} 0) {fd("age")} = newAge;</div>
      <div style={{ paddingLeft: 24 }}>{"}"}</div>
      <div style={{ paddingLeft: 24 }}>{kw("public")} {kw("void")} {mn("setPlan")}({kw("String")} newPlan) {"{ "}{fd("plan")} = newPlan; {"}"}</div>
      <div style={{ height: 8 }} />

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {kw("void")} {mn("bookSlot")}({kw("String")} slot) {"{"}</span>
        <Pill label="Method" done={tapped.methods} onClick={(e) => mark("methods", e)} />
      </div>
      <div style={{ paddingLeft: 48, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("try")} {"{ "}{fd("bookings")}.add(slot); {"}"} {kw("catch")} ({cn("Exception")} e) {"{ "}{cm("// handle it")} {"}"}</span>
        <Pill label="try/catch" done={tapped.trycatch} onClick={(e) => mark("trycatch", e)} />
      </div>
      <div style={{ paddingLeft: 24 }}>{"}"}</div>

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {kw("void")} {mn("cancelSlot")}({kw("String")} slot) {"{"}</span>
        <Pill label="if/else" done={tapped.ifelse} onClick={(e) => mark("ifelse", e)} />
      </div>
      <div style={{ paddingLeft: 48 }}>{kw("if")} ({fd("bookings")}.size() == 0) {"{ "}{kw("return")}; {"}"}</div>
      <div style={{ paddingLeft: 48 }}>{fd("bookings")}.remove(slot);</div>
      <div style={{ paddingLeft: 24 }}>{"}"}</div>

      <div style={{ paddingLeft: 24, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <span>{kw("public")} {kw("void")} {mn("showBookings")}() {"{"}</span>
        <Pill label="for-each loop" done={tapped.forloop} onClick={(e) => mark("forloop", e)} />
      </div>
      <div style={{ paddingLeft: 48 }}>{kw("for")} ({kw("String")} b : {fd("bookings")}) {"{ "}{kw("System")}.out.println(b); {"}"}</div>
      <div style={{ paddingLeft: 24 }}>{"}"}</div>
      <div>{"}"}</div>
    </div>
  );
}

// ─── CLASS DIAGRAM ─────────────────────────────────────────────────────────
function DiagramRow({ icon, name, type, glow }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px",
      background: glow ? "#EFF6FF" : "transparent", borderRadius: 6, transition: "background 0.4s ease"
    }}>
      <span style={{ fontSize: 12 }}>{icon} <span style={{ fontWeight: 600, color: "#1E293B" }}>{name}</span></span>
      {type && <span style={{ fontSize: 10, color: "#94A3B8" }}>{type}</span>}
    </div>
  );
}

function ClassDiagram({ className, fields, methods, complete, hasList, hasTryCatch }) {
  return (
    <div style={{
      position: "relative", background: "#fff", borderRadius: 12, overflow: "hidden",
      border: `2px solid ${complete ? "#10B981" : "#E5E7EB"}`, boxShadow: complete ? "0 0 0 4px rgba(16,185,129,0.15)" : "0 2px 10px rgba(0,0,0,0.06)",
      transition: "border 0.4s ease, box-shadow 0.4s ease"
    }}>
      {complete && <div style={{ position: "absolute", top: 8, right: 8, background: "#10B981", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>Complete ✅</div>}
      <div style={{ background: "#FACC15", color: "#78350F", fontWeight: 800, fontSize: 14, padding: "8px 14px", textAlign: "center" }}>{className || "YourClass"}</div>
      <div style={{ background: "#F9FAFB", padding: "8px 4px", borderBottom: "1px solid #F3F4F6" }}>
        {fields.length === 0 && <div style={{ padding: "6px 12px", fontSize: 11, color: "#94A3B8" }}>no fields yet</div>}
        {fields.map((f, i) => (
          <DiagramRow key={i} icon={f.isList ? "🔒📋" : "🔒"} name={f.name} type={f.type} glow={f.glow} />
        ))}
      </div>
      <div style={{ padding: "8px 4px" }}>
        {methods.length === 0 && <div style={{ padding: "6px 12px", fontSize: 11, color: "#94A3B8" }}>no methods yet</div>}
        {methods.map((m, i) => (
          <DiagramRow key={i} icon={m.badge ? `${m.icon} 🛡️` : m.icon} name={m.name} type={null} glow={m.glow} />
        ))}
      </div>
      {hasList && <div style={{ padding: "4px 12px", fontSize: 10, color: "#3B82F6" }}>📋 uses a List</div>}
      {hasTryCatch && <div style={{ padding: "0 12px 8px", fontSize: 10, color: "#F59E0B" }}>🛡️ protected by try/catch</div>}
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase1Visual({ tapped, pulse }) {
  const fields = [
    { name: "name", type: "String", glow: tapped.encap || tapped.vars },
    { name: "age", type: "int", glow: tapped.encap || tapped.vars },
    { name: "plan", type: "String", glow: tapped.encap || tapped.vars },
    { name: "isActive", type: "boolean", glow: tapped.encap || tapped.vars },
    { name: "bookings", type: "List", isList: true, glow: tapped.list },
  ];
  const methods = [
    { icon: "🔧", name: "GymMember()", glow: tapped.classobj },
    { icon: "👁️", name: "getName()", glow: tapped.encap },
    { icon: "👁️", name: "getAge()", glow: tapped.encap },
    { icon: "🛡️", name: "setAge(int)", glow: tapped.encap },
    { icon: "🛡️", name: "setPlan(String)", glow: tapped.encap },
    { icon: "⚡", name: "bookSlot(String)", glow: tapped.methods || tapped.trycatch, badge: tapped.trycatch },
    { icon: "⚡", name: "cancelSlot(String)", glow: tapped.ifelse },
    { icon: "⚡", name: "showBookings()", glow: tapped.forloop },
  ];
  const complete = CONCEPT_ORDER.every(([k]) => tapped[k]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>THE CLASS DIAGRAM</div>
      <ClassDiagram className="GymMember" fields={fields} methods={methods} complete={complete} hasList hasTryCatch />
      {pulse && <FlashOverlay key={"f" + pulse.id} id={pulse.id} color={pulse.color} />}
      {pulse && <StatusStamp key={"s" + pulse.id} id={pulse.id} text={pulse.text} color={pulse.stampColor} />}
    </div>
  );
}

// ─── PHASE 2 — DOMAIN STARTERS ────────────────────────────────────────────────
const DOMAINS = {
  "🏋️ Gym": `import java.util.List;
import java.util.ArrayList;

public class GymMember {

    // Step 1: private fields
    // (what does every gym member have?)


    // Step 2: constructor
    // (how is a new member created?)


    // Step 3: getters
    // (what details can others read?)


    // Step 4: setters with checks
    // (what can be changed, with validation?)


    // Step 5: at least one method
    // (what action can a member perform?)

}`,
  "🏨 Hotel": `import java.util.List;
import java.util.ArrayList;

public class HotelRoom {

    // Step 1: private fields
    // (what does every room have?)


    // Step 2: constructor


    // Step 3: getters


    // Step 4: setters with checks


    // Step 5: at least one method
    // (what action can happen with a room?)

}`,
  "🍱 Mess": `public class MealRecord {

    // Step 1: private fields
    // (what does every meal record have?)


    // Step 2: constructor


    // Step 3: getters and setters


    // Step 4: at least one method

}`,
  "☕ Chai Shop": `public class ChaiOrder {

    // Step 1: private fields


    // Step 2: constructor


    // Step 3: getters and setters


    // Step 4: at least one method

}`,
  "🏪 Other": `public class __________ {

    // your fields, constructor,
    // getters, setters, methods

}`,
};

// ─── PHASE 2 PARSING ──────────────────────────────────────────────────────────
function splitMethods(code) {
  const headerRe = /public\s+[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*\{/g;
  const starts = [];
  let m;
  while ((m = headerRe.exec(code))) starts.push({ index: m.index, header: m[0] });
  return starts.map((s, i) => ({ header: s.header, body: code.substring(s.index, i + 1 < starts.length ? starts[i + 1].index : code.length) }));
}

function parsePhase2(code) {
  const clsMatch = code.match(/public\s+class\s+(\w+)/);
  const className = clsMatch && clsMatch[1] !== "__________" ? clsMatch[1] : "";

  const fieldRe = /private\s+(String|int|boolean|double|long|float|List(?:<\w+>)?)\s+(\w+)\s*;/g;
  const fields = [];
  let fm;
  while ((fm = fieldRe.exec(code))) fields.push({ type: fm[1], name: fm[2], isList: /^List/.test(fm[1]) });

  const chunks = splitMethods(code);
  let hasConstructor = false;
  const getters = [], setters = [], methods = [];

  chunks.forEach(({ header, body }) => {
    const ctorMatch = className && header.match(new RegExp(`public\\s+${className}\\s*\\(`));
    const getterMatch = header.match(/public\s+(String|int|boolean|double|long|float)\s+(get\w+)\s*\(\s*\)/);
    const setterMatch = header.match(/public\s+void\s+(set\w+)\s*\(([^)]*)\)/);
    const methodMatch = header.match(/public\s+(?:void|String|int|boolean|double|long|float)\s+(\w+)\s*\(/);

    if (ctorMatch) hasConstructor = true;
    else if (getterMatch) getters.push(getterMatch[2]);
    else if (setterMatch) setters.push({ name: setterMatch[1], hasCheck: /\bif\s*\(/.test(body) });
    else if (methodMatch) methods.push(methodMatch[1]);
  });

  const hasTryCatch = /\btry\s*\{/.test(code) && /\bcatch\s*\(/.test(code);
  const hasList = fields.some(f => f.isList) || /\bList\s*</.test(code);

  return { className, fields, hasConstructor, getters, setters, methods, hasTryCatch, hasList };
}

// ─── CHECKLIST (PHASE 2) ──────────────────────────────────────────────────────
function checklistState(parsed) {
  return {
    fields: parsed.fields.length >= 4,
    ctor: parsed.hasConstructor,
    getters: parsed.getters.length >= 2,
    setters: parsed.setters.some(s => s.hasCheck),
    methods: parsed.methods.length >= 1,
    trycatch: parsed.hasTryCatch,
  };
}
const CHECKLIST_LABELS = [
  ["fields", "At least 4 private fields"],
  ["ctor", "A constructor"],
  ["getters", "At least 2 getters"],
  ["setters", "At least 1 setter with a check"],
  ["methods", "At least 1 method (not a getter/setter)"],
  ["trycatch", "try/catch used somewhere"],
];

// ─── CELEBRATION CARD ──────────────────────────────────────────────────────
function CelebrationCard({ playSound }) {
  const items = [
    "You understand variables, conditions, loops, and methods",
    "You can write a Java class with encapsulation and inheritance",
    "You can store data in List and Map",
    "You can protect your app with try/catch",
    "You wrote a complete domain class for YOUR neighbourhood project",
    "You've committed real code to GitHub",
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => setTimeout(() => { setTicked(p => [...p, i]); playSound("tick"); }, 300 + i * 300));
    setTimeout(() => playSound("correct"), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ background: "linear-gradient(135deg,#EAF3DE,#ECFDF5)", borderRadius: 20, padding: "40px 28px", textAlign: "center", animation: "slideIn 0.6s ease" }}>
      <div style={{ fontSize: 40, marginBottom: 8, animation: "popIn 0.5s ease" }}>🎉</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#1E293B", marginBottom: 6 }}>Module 1 Complete.</div>
      <div style={{ fontSize: 14, color: "#374151", marginBottom: 18 }}>Look at what you built this week:</div>
      <div style={{ textAlign: "left", maxWidth: 480, margin: "0 auto" }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s" }}>
            <span style={{ color: "#10B981", fontWeight: 700, fontSize: 16 }}>{ticked.includes(i) ? "✅" : "○"}</span>
            <span style={{ fontSize: 14, color: "#1E293B" }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, fontSize: 14, color: "#065F46", lineHeight: 1.9, fontWeight: 700 }}>
        This is not a certificate. This is real Java. Written by you. For a real project.<br /><br />
        <span style={{ fontWeight: 400 }}>
          In Module 2 — your class gets connected to a database. Every field you wrote becomes a column in a database table.
          Every object you create becomes a row in that table.
        </span><br /><br />
        You are ready.
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DomainClassBuilder() {
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

  // phase 1
  const [tapped, setTapped] = useState({});
  const allTappedRef = useRef(false);
  const [pulse, setPulse] = useState(null);
  const pulseIdRef = useRef(0);
  const firePulse = (text, color, stampColor) => {
    pulseIdRef.current += 1;
    setPulse({ id: pulseIdRef.current, text, color, stampColor });
  };
  const tap = (k) => {
    setTapped(prev => (prev[k] ? prev : { ...prev, [k]: true }));
    playSound("tick");
  };
  useEffect(() => {
    const allDone = CONCEPT_ORDER.every(([k]) => tapped[k]);
    if (allDone && !allTappedRef.current) {
      allTappedRef.current = true;
      playSound("correct");
      firePulse("ALL EXPLORED! 🎓", "rgba(16,185,129,0.2)", "#059669");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tapped]);
  const allConceptsTapped = CONCEPT_ORDER.every(([k]) => tapped[k]);

  // phase 2
  const [domain, setDomain] = useState("");
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parsed = parsePhase2(code);
  const checklist = checklistState(parsed);
  const checklistDoneRef = useRef({});
  const allChecklistRef = useRef(false);

  useEffect(() => {
    CHECKLIST_LABELS.forEach(([k]) => {
      if (checklist[k] && !checklistDoneRef.current[k]) {
        checklistDoneRef.current[k] = true;
        playSound("add");
      }
      if (!checklist[k]) checklistDoneRef.current[k] = false;
    });
    const allDone = CHECKLIST_LABELS.every(([k]) => checklist[k]);
    if (allDone && !allChecklistRef.current) {
      allChecklistRef.current = true;
      playSound("correct");
    } else if (!allDone) {
      allChecklistRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const chooseDomain = (d) => {
    setDomain(d);
    setCode(DOMAINS[d]);
    playSound("tick");
  };

  const sentenceCount = reflection.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length;
  const reflectionOk = sentenceCount >= 2;
  const allChecklistDone = CHECKLIST_LABELS.every(([k]) => checklist[k]);
  const canSubmit = allChecklistDone && reflectionOk;

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type: "HK_RESULT",
      version: "1",
      exerciseId: "m1-t3-s4-domain-class-builder",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          allConceptsTapped,
          conceptsExplored: Object.keys(tapped)
        },
        phase2: {
          domainSelected: domain,
          className: parsed.className,
          privateFields: parsed.fields.map(f => ({ type: f.type, name: f.name })),
          hasConstructor: parsed.hasConstructor,
          getters: parsed.getters,
          setters: parsed.setters.map(s => s.name),
          methods: parsed.methods,
          hasTryCatch: parsed.hasTryCatch,
          hasList: parsed.hasList,
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

  const diagramFields = parsed.fields.map(f => ({ name: f.name, type: f.type, isList: f.isList, glow: true }));
  const diagramMethods = [
    ...(parsed.hasConstructor ? [{ icon: "🔧", name: `${parsed.className || "Class"}()`, glow: true }] : []),
    ...parsed.getters.map(g => ({ icon: "👁️", name: `${g}()`, glow: true })),
    ...parsed.setters.map(s => ({ icon: "🛡️", name: `${s.name}()`, glow: true, badge: false })),
    ...parsed.methods.map(m => ({ icon: "⚡", name: `${m}()`, glow: true, badge: parsed.hasTryCatch })),
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
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
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.3.4 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Domain Class Builder</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>Everything from Module 1, in one class — yours</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>The complete GymMember class</div>
              <div style={{ color: "#64748B", marginBottom: 14, fontSize: 13 }}>Everything from Module 1, in one place. Tap each pill to see which concept it uses.</div>
              <Phase1Code tapped={tapped} tap={tap} playSound={playSound} />
              <ConceptChecklist tapped={tapped} />
              {allConceptsTapped && (
                <div style={{ animation: "slideIn 0.4s ease" }}>
                  <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: "#065F46", textAlign: "center" }}>
                    You understand every part of this class.
                  </div>
                  <button onClick={() => { playSound("tick"); setPhase(2); }}
                    style={{
                      marginTop: 14, padding: "14px 32px", background: "#1E293B", color: "#fff",
                      border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                      cursor: "pointer", display: "block", width: "100%"
                    }}>Now write one for YOUR project →</button>
                </div>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <Phase1Visual tapped={tapped} pulse={pulse} />
              </div>
            </div>
          </div>
        )}

        {phase === 2 && !submitted && (
          <div>
            <div style={{ background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: 14, padding: 22, marginBottom: 24, fontSize: 14, color: "#374151", lineHeight: 1.8 }}>
              <strong style={{ color: "#1E293B", fontSize: 16 }}>Now it is your turn.</strong><br /><br />
              Everything you see in GymMember — write it for YOUR neighbourhood project.<br />
              Your class. Your fields. Your methods. Your domain. Your first real code.<br /><br />
              Take your time. Every line should make sense to you. If a line doesn't make sense — delete it and rewrite it in a way that does.
            </div>

            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 480px", minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>My project is for:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {Object.keys(DOMAINS).map(d => (
                    <button key={d} onClick={() => chooseDomain(d)}
                      style={{
                        padding: "8px 16px", borderRadius: 22, border: `2px solid ${domain === d ? "#1E293B" : "#E2E8F0"}`,
                        background: domain === d ? "#1E293B" : "#fff", color: domain === d ? "#fff" : "#374151",
                        fontWeight: 600, fontSize: 13, cursor: "pointer"
                      }}>{d}</button>
                  ))}
                </div>

                {domain && (
                  <>
                    <textarea
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      onPaste={e => e.preventDefault()}
                      onContextMenu={e => e.preventDefault()}
                      spellCheck={false}
                      style={{
                        width: "100%", minHeight: 350, background: "#1E293B", color: "#E2E8F0",
                        fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
                        border: "none", borderRadius: 10, resize: "vertical", outline: "none", boxSizing: "border-box"
                      }}
                    />

                    <div style={{ marginTop: 16, background: "#F9FAFB", border: `2px solid ${allChecklistDone ? "#10B981" : "#E5E7EB"}`, borderRadius: 12, padding: 16, transition: "border 0.3s" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Your class so far:</div>
                      {CHECKLIST_LABELS.map(([k, label]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: checklist[k] ? "#10B981" : "#CBD5E1", fontWeight: 700, fontSize: 15, transition: "transform 0.2s", transform: checklist[k] ? "scale(1.15)" : "scale(1)" }}>{checklist[k] ? "✅" : "☐"}</span>
                          <span style={{ color: checklist[k] ? "#1E293B" : "#94A3B8" }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                        In 2-3 sentences — explain your class as if you are telling the business owner what you built for their business.
                      </div>
                      <textarea
                        value={reflection}
                        onChange={e => setReflection(e.target.value)}
                        onPaste={e => e.preventDefault()}
                        placeholder="I built a GymMember class that represents each member in your gym. It stores their name, age, and plan, and can book or cancel a slot..."
                        style={{
                          width: "100%", minHeight: 100, padding: 12, borderRadius: 10,
                          border: `2px solid ${reflectionOk ? "#10B981" : "#E2E8F0"}`, fontSize: 14,
                          resize: "vertical", boxSizing: "border-box", outline: "none"
                        }}
                      />
                      <div style={{ fontSize: 12, color: reflectionOk ? "#10B981" : "#94A3B8", marginTop: 4 }}>
                        {sentenceCount} sentence{sentenceCount === 1 ? "" : "s"} {reflectionOk ? "✓" : "(minimum 2 sentences)"}
                      </div>
                    </div>

                    <button onClick={handleSubmit} disabled={!canSubmit}
                      style={{
                        marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
                        color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                        cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
                      }}>My domain class is written — Module 1 complete →</button>
                  </>
                )}
              </div>

              <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
                <div style={{ opacity: 0.3, marginBottom: 12, filter: "grayscale(1)" }}>
                  <ClassDiagram className="GymMember" fields={[{ name: "name", type: "String" }, { name: "bookings", type: "List", isList: true }]}
                    methods={[{ icon: "⚡", name: "bookSlot()" }]} complete={false} hasList hasTryCatch />
                </div>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, marginTop: 12 }}>
                  <ClassDiagram className={parsed.className} fields={diagramFields} methods={diagramMethods}
                    complete={allChecklistDone} hasList={parsed.hasList} hasTryCatch={parsed.hasTryCatch} />
                  <div style={{ marginTop: 14, fontSize: 12, color: "#374151", lineHeight: 1.9 }}>
                    Fields: <strong>{parsed.fields.length}</strong> private<br />
                    Methods: <strong>{parsed.getters.length + parsed.setters.length + parsed.methods.length}</strong><br />
                    Protected by try/catch: <strong>{parsed.hasTryCatch ? "yes" : "no"}</strong><br /><br />
                    {allChecklistDone && <span style={{ color: "#059669", fontWeight: 700 }}>This class is ready for Module 2.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 2 && submitted && <CelebrationCard playSound={playSound} />}
      </div>
    </div>
  );
}
