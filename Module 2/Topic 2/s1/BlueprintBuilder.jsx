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
          pointerEvents: "none"
        }}>{text}</span>
      )}
    </span>
  );
}

// ─── DOT ─────────────────────────────────────────────────────────────────────
function Dot() {
  const [glow, setGlow] = useState(false);
  return (
    <Tip text="dot = belonging to">
      <span style={{ color: glow ? "#F0ABFC" : "#E879F9", textShadow: glow ? "0 0 8px #E879F9" : "none", transition: "all 0.2s" }}
        onMouseEnter={() => setGlow(true)} onMouseLeave={() => setGlow(false)}>.</span>
    </Tip>
  );
}

// ─── ID CARD ─────────────────────────────────────────────────────────────────
function BlankCard({ onAdd }) {
  return (
    <div style={{
      width: 180, minHeight: 240, border: "2px dashed #D1D5DB", borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", background: "#F9FAFB", transition: "all 0.2s"
    }} onClick={onAdd}>
      <div style={{ textAlign: "center", color: "#9CA3AF" }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>+</div>
        <div style={{ fontSize: 12 }}>Create ID Card</div>
      </div>
    </div>
  );
}

function TemplateCard() {
  return (
    <div style={{
      width: 200, background: "#fff", borderRadius: 12,
      border: "2px solid #D1D5DB", outline: "1px solid #D1D5DB", outlineOffset: 3,
      padding: 16, boxShadow: "0 2px 12px #0001", opacity: 0.9
    }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%", background: "#E5E7EB",
          margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px dashed #9CA3AF"
        }}>
          <span style={{ fontSize: 20 }}>📷</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: 1 }}>HATCHKOD COLLEGE</div>
      </div>
      {["Name", "Roll No", "Department", "Year"].map(f => (
        <div key={f} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>{f}</div>
          <div style={{ height: 20, background: "#F3F4F6", borderRadius: 4, border: "1px dashed #D1D5DB" }} />
        </div>
      ))}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed #D1D5DB", fontSize: 9, color: "#9CA3AF", textAlign: "center" }}>
        TEMPLATE — no data yet
      </div>
    </div>
  );
}

function FilledCard({ data, index, domainColor }) {
  const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
  const c = domainColor || colors[index % colors.length];
  return (
    <div style={{
      width: 180, background: "#FFFBEB", borderRadius: 12,
      border: `2px solid ${c}`, padding: 14,
      boxShadow: `0 4px 16px ${c}22`, animation: "slideIn 0.4s ease"
    }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: c + "22",
          margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${c}`
        }}>
          <span style={{ fontSize: 18 }}>👤</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: c, letterSpacing: 1 }}>HATCHKOD COLLEGE</div>
      </div>
      {[["Name", data.name], ["Roll No", data.rollNo], ["Department", data.department], ["Year", data.year]].map(([l, v]) => (
        <div key={l} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: "#6B7280" }}>{l}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937", borderBottom: `1px solid ${c}44`, paddingBottom: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function CardForm({ onSubmit, index }) {
  const [form, setForm] = useState({ name: "", rollNo: "", department: "CSE", year: "1" });
  return (
    <div style={{
      background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10,
      padding: 14, width: 200, animation: "slideIn 0.3s ease"
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Student {index + 1} details</div>
      {[["Name", "name", "text"], ["Roll No", "rollNo", "text"]].map(([label, key, type]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 3 }}>{label}</div>
          <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12, boxSizing: "border-box" }} />
        </div>
      ))}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 3 }}>Department</div>
        <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
          style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}>
          {["CSE", "ECE", "Mech", "Civil"].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 3 }}>Year</div>
        <select value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
          style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}>
          {["1", "2", "3", "4"].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>
      <button onClick={() => form.name && form.rollNo && onSubmit(form)}
        style={{
          width: "100%", padding: "8px 0", background: "#3B82F6", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>Print this ID card →</button>
    </div>
  );
}

// ─── CODE BLOCK ──────────────────────────────────────────────────────────────
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", G = "#4ADE80", P = "#E879F9", GR = "#6B7280";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <Tip text="Blueprint name — always starts with capital"><span style={{ color: Y }}>{t}</span></Tip>; }
function fn(t) { return <span style={{ color: O }}>{t}</span>; }
function sv(t) { return <span style={{ color: G }}>"{t}"</span>; }
function num(t) { return <span style={{ color: O }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }

function CollegeClassCode({ s1, s2 }) {
  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
      <div>{cm("// the blueprint — defined once")}</div>
      <div>
        <Tip text="The keyword that starts a blueprint">{kw("class")}</Tip>{" "}
        <Tip text="Blueprint name — always starts with capital">{cn("CollegeStudent")}</Tip>{" {"}
      </div>
      <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"//    ↑"}</div>
      <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"//    capital first letter — always for class names"}</div>
      <div style={{ marginTop: 8, paddingLeft: 24 }}>
        <Tip text="A space for data — like a blank on a form">{kw("String")}{" "}{fn("name")}</Tip>;{" "}{cm("// space for name")}
      </div>
      <div style={{ paddingLeft: 24 }}>{kw("String")}{" "}{fn("rollNo")}; {cm("// space for roll number")}</div>
      <div style={{ paddingLeft: 24 }}>{kw("String")}{" "}{fn("department")}; {cm("// space for department")}</div>
      <div style={{ paddingLeft: 24 }}>{kw("int")}{" "}{fn("year")}; {cm("// space for year")}</div>
      <div>{"}"} {cm("// blueprint ends here")}</div>

      {s1 && (
        <>
          <div style={{ marginTop: 16, color: GR }}>{"// create real student 1 from blueprint"}</div>
          <div>
            <Tip text="ravi is of type GymMember — like saying 'this is a GymMember'">{cn("CollegeStudent")}</Tip>{" "}
            {fn("student1")}{" = "}
            <Tip text="Create a new real object from the blueprint">{kw("new")}</Tip>{" "}
            {cn("CollegeStudent")}{"();"}
          </div>
          <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"//             ↑               ↑"}</div>
          <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"//             name of         create new real object"}</div>
          <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"//             this object"}</div>
          <div style={{ marginTop: 8 }}>{fn("student1")}<Dot />{fn("name")}{" = "}{sv(s1.name)}; {cm("// fill name")}</div>
          <div>{fn("student1")}<Dot />{fn("rollNo")}{" = "}{sv(s1.rollNo)}; {cm("// fill roll no")}</div>
          <div>{fn("student1")}<Dot />{fn("department")}{" = "}{sv(s1.department)}; {cm("// fill dept")}</div>
          <div>{fn("student1")}<Dot />{fn("year")}{" = "}{num(s1.year)}; {cm("// fill year")}</div>
        </>
      )}
      {s2 && (
        <>
          <div style={{ marginTop: 16, color: GR }}>{"// create real student 2 from blueprint"}</div>
          <div>{cn("CollegeStudent")}{" "}{fn("student2")}{" = "}{kw("new")}{" "}{cn("CollegeStudent")}{"();"}</div>
          <div style={{ marginTop: 8 }}>{fn("student2")}<Dot />{fn("name")}{" = "}{sv(s2.name)};</div>
          <div>{fn("student2")}<Dot />{fn("rollNo")}{" = "}{sv(s2.rollNo)};</div>
          <div>{fn("student2")}<Dot />{fn("department")}{" = "}{sv(s2.department)};</div>
          <div>{fn("student2")}<Dot />{fn("year")}{" = "}{num(s2.year)};</div>
        </>
      )}
    </div>
  );
}

// ─── DOMAIN DATA ─────────────────────────────────────────────────────────────
const DOMAINS = {
  "🏋️ Gym": {
    cls: "GymMember", color: "#3B82F6",
    fields: [
      ["String", "name", "space for member's name"],
      ["int", "age", "space for member's age"],
      ["String", "phone", "space for phone number"],
      ["String", "plan", "space for membership plan"],
    ],
    objs: [
      { n: "member1", vals: [["name", `"Ravi"`, "fill in name"], ["age", "21", "fill in age"], ["phone", `"9876543210"`, "fill in phone"], ["plan", `"Basic"`, "fill in plan"]] },
      { n: "member2", vals: [["name", `"Suresh"`, ""], ["age", "24", ""], ["phone", `"9988776655"`, ""], ["plan", `"Premium"`, ""]] },
    ],
    prints: [["member1", "name", "Ravi"], ["member1", "plan", "Basic"], ["member2", "name", "Suresh"], ["member2", "plan", "Premium"]],
    comment: "blueprint for every gym member",
  },
  "🍱 Mess": {
    cls: "MealRecord", color: "#10B981",
    fields: [
      ["String", "studentName", "space for student name"],
      ["String", "mealType", "space: Breakfast/Lunch/Dinner"],
      ["String", "date", "space for the date"],
      ["boolean", "attended", "space: did they eat? yes/no"],
    ],
    objs: [
      { n: "record1", vals: [["studentName", `"Ravi"`, "fill name"], ["mealType", `"Lunch"`, "fill meal"], ["date", `"2024-01-15"`, "fill date"], ["attended", "true", "fill attended"]] },
      { n: "record2", vals: [["studentName", `"Suresh"`, ""], ["mealType", `"Dinner"`, ""], ["date", `"2024-01-15"`, ""], ["attended", "false", ""]] },
    ],
    prints: [["record1", "studentName", "Ravi"], ["record1", "mealType", "Lunch"], ["record2", "studentName", "Suresh"], ["record2", "attended", "false"]],
    comment: "blueprint for every meal record",
  },
  "🏨 Hotel": {
    cls: "HotelRoom", color: "#8B5CF6",
    fields: [
      ["int", "roomNumber", "space for room number"],
      ["String", "guestName", "space for guest name"],
      ["boolean", "isOccupied", "space: is room taken? yes/no"],
      ["String", "checkInDate", "space for check-in date"],
    ],
    objs: [
      { n: "room1", vals: [["roomNumber", "101", "fill room number"], ["guestName", `"Ravi"`, "fill guest"], ["isOccupied", "true", "fill occupied"], ["checkInDate", `"2024-01-15"`, "fill date"]] },
      { n: "room2", vals: [["roomNumber", "102", ""], ["guestName", `"Suresh"`, ""], ["isOccupied", "false", ""], ["checkInDate", `"2024-01-16"`, ""]] },
    ],
    prints: [["room1", "guestName", "Ravi"], ["room1", "isOccupied", "true"], ["room2", "roomNumber", "102"], ["room2", "guestName", "Suresh"]],
    comment: "blueprint for every hotel room",
  },
  "☕ Chai Shop": {
    cls: "Order", color: "#F59E0B",
    fields: [
      ["String", "customerName", "space for customer name"],
      ["String", "item", "space for what they ordered"],
      ["int", "quantity", "space for how many"],
      ["boolean", "isServed", "space: served yet? yes/no"],
    ],
    objs: [
      { n: "order1", vals: [["customerName", `"Ravi"`, "fill name"], ["item", `"Cutting Chai"`, "fill item"], ["quantity", "2", "fill qty"], ["isServed", "false", "fill served"]] },
      { n: "order2", vals: [["customerName", `"Suresh"`, ""], ["item", `"Masala Chai"`, ""], ["quantity", "1", ""], ["isServed", "true", ""]] },
    ],
    prints: [["order1", "customerName", "Ravi"], ["order1", "item", "Cutting Chai"], ["order2", "customerName", "Suresh"], ["order2", "isServed", "true"]],
    comment: "blueprint for every order",
  },
  "🏪 Other": {
    cls: "ShopItem", color: "#EC4899",
    fields: [
      ["String", "itemName", "space for item name"],
      ["int", "price", "space for price"],
      ["int", "quantity", "space for stock count"],
      ["boolean", "inStock", "space: available? yes/no"],
    ],
    objs: [
      { n: "item1", vals: [["itemName", `"Notebook"`, "fill name"], ["price", "50", "fill price"], ["quantity", "100", "fill qty"], ["inStock", "true", "fill stock"]] },
      { n: "item2", vals: [["itemName", `"Pen"`, ""], ["price", "10", ""], ["quantity", "500", ""], ["inStock", "true", ""]] },
    ],
    prints: [["item1", "itemName", "Notebook"], ["item1", "price", "50"], ["item2", "itemName", "Pen"], ["item2", "quantity", "500"]],
    comment: "blueprint for every shop item",
  },
};

function DomainClassCode({ domain }) {
  const d = DOMAINS[domain];
  if (!d) return null;
  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
      <div>{cm(`// ${d.comment}`)}</div>
      <div>{kw("class")}{" "}{cn(d.cls)}{" {"}</div>
      {d.fields.map(([type, name, comment]) => (
        <div key={name} style={{ paddingLeft: 24 }}>
          {kw(type)}{" "}{fn(name)}; {cm(`// ${comment}`)}
        </div>
      ))}
      <div>{"}"}</div>

      <div style={{ marginTop: 16 }}>
        {d.objs.map((obj, i) => (
          <div key={i} style={{ borderLeft: `3px solid #8B5CF6`, paddingLeft: 12, marginBottom: 16 }}>
            <div>{cm(`// create real ${d.cls.toLowerCase()} ${i + 1}`)}</div>
            <div>{cn(d.cls)}{" "}{fn(obj.n)}{" = "}{kw("new")}{" "}{cn(d.cls)}{"();"}
              {" "}{cm("// new real object")}
            </div>
            {obj.vals.map(([field, val, c]) => (
              <div key={field}>
                {fn(obj.n)}<Dot />{fn(field)}{" = "}<span style={{ color: isNaN(val) && val !== "true" && val !== "false" ? G : O }}>{val}</span>;
                {c ? <>{" "}{cm(`// ${c}`)}</> : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {cm("// print using dot notation")}
        {d.prints.map(([obj, field, out]) => (
          <div key={`${obj}.${field}`}>
            {kw("System")}<Dot />{fn("out")}<Dot />{fn("println")}({fn(obj)}<Dot />{fn(field)}); {cm(`// ${out}`)}
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputPreview({ domain }) {
  const d = DOMAINS[domain];
  if (!d) return null;
  return (
    <div style={{ background: "#0F172A", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, marginTop: 12 }}>
      {d.prints.map(([obj, field, out], i) => (
        <div key={i} style={{ color: "#4ADE80", animation: `fadeIn 0.3s ${i * 0.15}s both` }}>{out}</div>
      ))}
    </div>
  );
}

// ─── REVEAL CARD ─────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["Class", "the blueprint — defined once, used unlimited times"],
    ["Object", "one real thing made from the blueprint"],
    ["Field", "a space for data inside the class"],
    ["Dot notation (.)", "connects object to its field — 'belonging to'"],
    ["Instantiation (new)", "creating a new real object from the blueprint"],
  ];
  const [ticked, setTicked] = useState([]);
  useEffect(() => {
    playSound("reveal");
    items.forEach((_, i) => {
      setTimeout(() => {
        setTicked(p => [...p, i]);
        playSound("tick");
      }, 400 + i * 500);
    });
    setTimeout(onDone, 400 + items.length * 500 + 400);
  }, []);
  return (
    <div style={{
      background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 14,
      padding: 28, marginTop: 32, animation: "slideIn 0.5s ease"
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 20, textAlign: "center" }}>5 new Java concepts 🎉</div>
      {items.map(([term, def], i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12,
          opacity: ticked.includes(i) ? 1 : 0.2, transition: "opacity 0.4s"
        }}>
          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18, marginTop: 1 }}>{ticked.includes(i) ? "✓" : "○"}</span>
          <div><span style={{ fontWeight: 700, color: "#1E293B" }}>{term}</span>{" — "}<span style={{ color: "#374151" }}>{def}</span></div>
        </div>
      ))}
      <div style={{ marginTop: 20, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.7 }}>
        <strong>In Module 2 — every database table in your Spring Boot app will be a class exactly like this.</strong><br />
        Spring Boot reads your GymMember class and creates the GymMembers table in MySQL automatically.<br /><br />
        You just wrote the foundation of your database.
      </div>
    </div>
  );
}

// ─── CODE EDITOR (syntax highlight via spans) ─────────────────────────────────
const PLACEHOLDER = `// Step 1: your blueprint
class __________ {        // blueprint name — capital first
//    ↑ your class name

    String __________;    // space for ___
    int __________;       // space for ___
    String __________;    // space for ___
    boolean __________;   // space for yes/no: ___

} // blueprint ends

// Step 2: first real object
__________ object1 = new __________(); // new real ___
object1.__________ = '__________';     // fill ___
object1.__________ = 0;               // fill ___

// Step 3: second real object
__________ object2 = new __________();
object2.__________ = '__________';

// Step 4: print using dot notation
System.out.println(object1.__________); // object1's ___
System.out.println(object2.__________); // object2's ___`;

function CodeEditor({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onPaste={e => e.preventDefault()}
      onContextMenu={e => e.preventDefault()}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      style={{
        width: "100%", minHeight: 360, background: "#1E293B", color: "#E2E8F0",
        fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16,
        border: "none", borderRadius: 10, resize: "vertical", outline: "none",
        boxSizing: "border-box"
      }}
    />
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BlueprintBuilder() {
  const [muted, setMuted] = useState(false);
  const soundRef = useRef(null);
  const playSound = (t) => {
    try {
      if (!soundRef.current) soundRef.current = createSound(muted);
      if (muted) return;
      soundRef.current(t);
    } catch (_) {}
  };

  // ID cards
  const [cards, setCards] = useState([]); // [{name,rollNo,department,year}]
  const [showForm, setShowForm] = useState(null); // 0 or 1

  // Section 1 phases
  const [showJava, setShowJava] = useState(false);
  const [showDomain, setShowDomain] = useState(false);
  const [domain, setDomain] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  // Section 2
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reflectionError, setReflectionError] = useState(false);

  const bothCardsDone = cards.length >= 2;

  useEffect(() => {
    if (bothCardsDone) {
      playSound("correct");
      setTimeout(() => { setShowJava(true); playSound("tick"); }, 1200);
    }
  }, [bothCardsDone]);

  useEffect(() => {
    if (showJava) setTimeout(() => setShowDomain(true), 1000);
  }, [showJava]);

  const handleAddCard = (data) => {
    const idx = cards.length;
    setCards(p => [...p, data]);
    setShowForm(null);
    playSound("add");
    if (idx === 1) {
      // both done — handled by useEffect
    }
  };

  const handleDomain = (d) => {
    setDomain(d);
    playSound("tick");
    setTimeout(() => { setShowReveal(true); }, 800);
  };

  const handleSubmit = () => {
    if (reflection.trim().split(/\s+/).length < 5) {
      setReflectionError(true);
      playSound("warn");
      return;
    }
    setReflectionError(false);
    playSound("submit");
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* Mute */}
      <button onClick={() => { setMuted(m => !m); soundRef.current = null; }}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#1E293B", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18
        }}>{muted ? "🔇" : "🔊"}</button>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1E293B,#334155)", color: "#fff", padding: "32px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.2.1 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Blueprint Builder</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>Class = Blueprint &nbsp;·&nbsp; Object = Real Thing</div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        {/* ── SECTION 1 ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#64748B", marginBottom: 4 }}>SECTION 1</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>One blueprint. Unlimited real things. 📋</div>
          <div style={{ color: "#64748B" }}>Understand the idea first. Then see it in Java.</div>
        </div>

        {/* ── PART A ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 20 }}>PART A — THE ID CARD ANALOGY</div>

          <div style={{
            display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start"
          }}>
            {/* Left — Template */}
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>The Template (Blueprint)</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>Designed once</div>
              <TemplateCard />
              <div style={{ marginTop: 12, fontSize: 12, color: "#6B7280", maxWidth: 220 }}>
                This is the <strong>TEMPLATE</strong> — the <strong>BLUEPRINT</strong><br />
                No real data yet. Just the spaces.
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  background: "#1E293B", color: "#fff", fontSize: 11,
                  fontFamily: "monospace", padding: "4px 10px", borderRadius: 6
                }}>class CollegeStudent {"{ }"}</span>
              </div>
            </div>

            {/* Right — Real cards */}
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Real ID Cards (Objects)</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>Made from the template</div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Card 0 */}
                <div>
                  {cards[0]
                    ? <FilledCard data={cards[0]} index={0} />
                    : showForm === 0
                      ? <CardForm index={0} onSubmit={handleAddCard} />
                      : <BlankCard onAdd={() => setShowForm(0)} />
                  }
                  {cards[0] && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ background: "#1E293B", color: "#fff", fontSize: 10, fontFamily: "monospace", padding: "3px 8px", borderRadius: 6 }}>
                        CollegeStudent student1 = new CollegeStudent();
                      </span>
                    </div>
                  )}
                </div>

                {/* Card 1 — only show after card 0 exists */}
                {cards[0] && (
                  <div>
                    {cards[1]
                      ? <FilledCard data={cards[1]} index={1} />
                      : showForm === 1
                        ? <CardForm index={1} onSubmit={handleAddCard} />
                        : <BlankCard onAdd={() => setShowForm(1)} />
                    }
                    {cards[1] && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ background: "#1E293B", color: "#fff", fontSize: 10, fontFamily: "monospace", padding: "3px 8px", borderRadius: 6 }}>
                          CollegeStudent student2 = new CollegeStudent();
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {bothCardsDone && (
            <div style={{
              marginTop: 28, background: "#F0FDF4", border: "1px solid #86EFAC",
              borderRadius: 12, padding: 20, textAlign: "center", animation: "slideIn 0.5s ease"
            }}>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: "#14532D" }}>
                <strong>Same template (Class).</strong> Different details (Objects).<br />
                One blueprint. Two real ID cards.<br />
                <span style={{ color: "#166534" }}>200 students → 200 ID cards. Same one template. Every time.</span>
              </div>
            </div>
          )}
        </div>

        {/* ── PART B ── */}
        {showJava && (
          <div style={{ marginBottom: 40, animation: "slideIn 0.6s ease" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 16 }}>PART B — THE SAME IDEA IN JAVA</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Now — the same idea in Java</div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 340px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Step 1 — The Blueprint (Class):</div>
                <CollegeClassCode s1={null} s2={null} />
              </div>
              <div style={{ flex: "1 1 340px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Step 2 — Real Objects:</div>
                <CollegeClassCode s1={cards[0]} s2={cards[1]} />
              </div>
            </div>

            <div style={{ marginTop: 20, background: "#FAF5FF", border: "1px solid #C4B5FD", borderRadius: 10, padding: 18, fontSize: 14, color: "#4C1D95", lineHeight: 1.8 }}>
              The class appeared <strong>ONCE</strong>. The objects appeared as many times as you need.<br />
              Change <code>CollegeStudent</code> to <code>GymMember</code>. Change name/rollNo/dept/year to name/age/phone/plan.<br />
              <strong>That is your project's first class.</strong>
            </div>
          </div>
        )}

        {/* ── PART C ── */}
        {showDomain && (
          <div style={{ marginBottom: 40, animation: "slideIn 0.5s ease" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginBottom: 16 }}>PART C — YOUR PROJECT'S CLASS</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Now for YOUR project 🏗️</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {Object.keys(DOMAINS).map(d => (
                <button key={d} onClick={() => handleDomain(d)}
                  style={{
                    padding: "10px 18px", borderRadius: 24, border: `2px solid ${domain === d ? DOMAINS[d].color : "#E2E8F0"}`,
                    background: domain === d ? DOMAINS[d].color : "#fff", color: domain === d ? "#fff" : "#374151",
                    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}>{d}</button>
              ))}
            </div>

            {domain && (
              <div style={{ animation: "slideIn 0.4s ease" }}>
                <DomainClassCode domain={domain} />

                <div style={{ marginTop: 16, background: "#0F172A", borderRadius: 10, padding: 16 }}>
                  <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8 }}>Output</div>
                  <OutputPreview domain={domain} />
                </div>

                <div style={{ marginTop: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 18, fontSize: 14, color: "#374151", lineHeight: 1.8 }}>
                  Two objects. Same blueprint. Each has their own details.<br />
                  Access any detail with dot notation.<br />
                  <code style={{ color: "#8B5CF6" }}>{DOMAINS[domain].objs[0].n}.{DOMAINS[domain].fields[0][1]}</code> →{" "}
                  {DOMAINS[domain].objs[0].vals[0][1].replace(/"/g, "")}'s {DOMAINS[domain].fields[0][1]}<br />
                  <strong>200 members → 200 objects. One class. Always.</strong>
                </div>

                {!showReveal && setTimeout(() => setShowReveal(true), 600) && null}
              </div>
            )}

            {showReveal && !revealDone && (
              <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />
            )}
            {revealDone && (
              <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 14, padding: 28, marginTop: 32 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#92400E", marginBottom: 16, textAlign: "center" }}>5 new Java concepts 🎉</div>
                {[
                  ["Class", "the blueprint — defined once, used unlimited times"],
                  ["Object", "one real thing made from the blueprint"],
                  ["Field", "a space for data inside the class"],
                  ["Dot notation (.)", "connects object to its field — 'belonging to'"],
                  ["Instantiation (new)", "creating a new real object from the blueprint"],
                ].map(([t, d]) => (
                  <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>✓</span>
                    <div><strong>{t}</strong> — {d}</div>
                  </div>
                ))}
                <div style={{ marginTop: 20, textAlign: "center", color: "#78350F", fontSize: 14, lineHeight: 1.7 }}>
                  <strong>In Module 2 — every database table in your Spring Boot app will be a class exactly like this.</strong><br />
                  Spring Boot reads your GymMember class and creates the GymMembers table in MySQL automatically.<br /><br />
                  You just wrote the foundation of your database.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 2 ── */}
        {revealDone && (
          <div style={{ marginTop: 48, animation: "slideIn 0.6s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#64748B", marginBottom: 4 }}>SECTION 2</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Write YOUR project's first class 📋</div>

            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 24, marginBottom: 24, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 12px" }}>You just saw the GymMember class.</p>
              <p style={{ margin: "0 0 12px" }}>Now write <strong>YOUR</strong> project's class — for YOUR neighbourhood business.</p>
              <div style={{ margin: "16px 0" }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Write:</div>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  <li style={{ marginBottom: 8 }}>The class with at least 4 fields<br />
                    <span style={{ color: "#6B7280", fontSize: 13 }}>Words → <code>String</code> &nbsp; Whole numbers → <code>int</code> &nbsp; True/False → <code>boolean</code></span>
                  </li>
                  <li style={{ marginBottom: 8 }}>TWO objects from that class — use real names</li>
                  <li>Print at least 2 fields from each object using dot notation</li>
                </ol>
              </div>
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 12, fontSize: 13, color: "#991B1B" }}>
                Add a comment on every single line. Your own code only. No copying. No ChatGPT.
              </div>
            </div>

            {!submitted ? (
              <>
                <CodeEditor value={code} onChange={setCode} />

                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    In one sentence — what does your class represent in your neighbourhood business?
                  </div>
                  <textarea
                    value={reflection}
                    onChange={e => { setReflection(e.target.value); setReflectionError(false); }}
                    onPaste={e => e.preventDefault()}
                    placeholder="My [ClassName] class represents each [member/room/meal/order] in my [business name] app. It stores..."
                    style={{
                      width: "100%", minHeight: 80, padding: 12, borderRadius: 10,
                      border: `2px solid ${reflectionError ? "#EF4444" : reflection.trim().split(/\s+/).length >= 5 ? "#10B981" : "#E2E8F0"}`,
                      fontSize: 14, resize: "vertical", boxSizing: "border-box", outline: "none"
                    }}
                  />
                  <div style={{ fontSize: 12, color: reflection.trim().split(/\s+/).length >= 5 ? "#10B981" : "#94A3B8", marginTop: 4 }}>
                    {reflection.trim().split(/\s+/).filter(Boolean).length} words {reflection.trim().split(/\s+/).length >= 5 ? "✓" : "(minimum 1 sentence)"}
                  </div>
                </div>

                <button onClick={handleSubmit}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>My first class is written →</button>
              </>
            ) : (
              <div style={{
                background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)", border: "2px solid #10B981",
                borderRadius: 16, padding: 32, animation: "slideIn 0.5s ease", textAlign: "center"
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>🏗️</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 20 }}>
                  Your first Java class is written.
                </div>
                <div style={{ fontSize: 15, color: "#065F46", lineHeight: 2 }}>
                  That class you just wrote?<br /><br />
                  In Module 2 — you will add <code style={{ background: "#D1FAE5", padding: "2px 6px", borderRadius: 4 }}>@Entity</code> above it.<br />
                  Spring Boot will read it and <strong>create your MySQL database table automatically.</strong><br /><br />
                  Your field names become your <strong>table columns</strong>.<br />
                  Your objects become your <strong>table rows</strong>.<br /><br />
                  One class. Your entire database structure defined.<br /><br />
                  <strong>Next — make your class smarter.<br />
                  Private fields. Public getters.<br />
                  The pattern Spring Boot needs.</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
