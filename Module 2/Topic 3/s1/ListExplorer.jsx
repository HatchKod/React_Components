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
const B = "#60A5FA", Y = "#FACC15", O = "#FB923C", G = "#4ADE80", P = "#E879F9", GR = "#6B7280";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <span style={{ color: B, fontWeight: 700 }}>{t}</span>; }
function mth(t) { return <span style={{ color: Y, fontWeight: 700 }}>{t}</span>; }
function fd(t) { return <span style={{ color: O }}>{t}</span>; }
function str(t) { return <span style={{ color: G }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function ang(t) { return <span style={{ color: P }}>{t}</span>; }
function listTip(t) { return <Tip text="A flexible collection - grows and shrinks as needed"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function arrayListTip(t) { return <Tip text="Most common List type - use this by default"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }

// ─── FLASH + STAMP ────────────────────────────────────────────────────────────
function FlashOverlay({ id, color }) {
  return <div key={id} style={{ position: "absolute", inset: 0, background: color, opacity: 0, animation: "flashFade 0.7s ease-out", borderRadius: 16, pointerEvents: "none", zIndex: 3 }} />;
}
function StatusStamp({ id, text, color }) {
  return (
    <div key={id} style={{
      position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%) rotate(-6deg)",
      fontSize: 18, fontWeight: 900, color, background: "#fff", border: `4px solid ${color}`,
      borderRadius: 14, padding: "8px 16px", zIndex: 25, animation: "stampPop 1.2s ease forwards",
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)", whiteSpace: "nowrap"
    }}>{text}</div>
  );
}

// ─── QUEUE PILL (a person in the queue) ───────────────────────────────────────
const AVATAR_COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F43F5E", "#14B8A6", "#FB923C"];
function colorForName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Pill({ name, pos, glowType, removing }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 320);
    return () => clearTimeout(t);
  }, []);
  const color = colorForName(name);
  const ring = glowType === "get" ? "59,130,246" : glowType === "loop" ? "139,92,246" : null;

  return (
    <div style={{
      position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center",
      marginRight: 16, flexShrink: 0,
      animation: removing
        ? "fadeOutRight 0.4s ease forwards"
        : !entered
          ? "slideInRight 0.3s ease"
          : "idleBob 2.6s ease-in-out infinite"
    }}>
      {glowType === "get" && (
        <div style={{
          position: "absolute", top: -42, left: "50%", transform: "translateX(-50%)",
          background: "#1E3A8A", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px",
          borderRadius: 8, whiteSpace: "nowrap", animation: "popIn 0.25s ease", zIndex: 5
        }}>"{name}" ↓</div>
      )}
      <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 3 }}>{pos}</div>
      <div style={{
        width: 42, height: 42, borderRadius: "50%", background: color, display: "flex",
        alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16,
        border: "2px solid #fff",
        boxShadow: ring ? `0 0 0 5px rgba(${ring},0.4)` : "0 2px 5px rgba(0,0,0,0.15)",
        transform: glowType ? "scale(1.18)" : "scale(1)", transition: "all 0.25s ease"
      }}>{name.charAt(0).toUpperCase()}</div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "#1E293B", marginTop: 4, maxWidth: 68,
        textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
      }}>{name}</div>
    </div>
  );
}

// ─── QUEUE VISUAL - the canteen line ──────────────────────────────────────────
function Queue({ items, getPos, sweepIndex, empty }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        background: "linear-gradient(180deg,#EFF6FF,#DBEAFE)", border: "2px solid #BFDBFE",
        borderRadius: "6px 18px 18px 6px", padding: "16px 20px 20px", minHeight: 100,
        overflowX: "auto", position: "relative"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 14, flexShrink: 0 }}>
          <div style={{ fontSize: 28 }}>🍽️</div>
          <div style={{ fontSize: 8, color: "#1E3A8A", fontWeight: 800, letterSpacing: 0.5 }}>COUNTER</div>
        </div>
        <div style={{ width: 3, alignSelf: "stretch", background: "#93C5FD", marginRight: 16, borderRadius: 2, flexShrink: 0 }} />

        {empty && <div style={{ color: "#94A3B8", fontSize: 13, alignSelf: "center" }}>- empty - waiting for the first person -</div>}
        {items.map((it, i) => (
          <Pill key={it.id} name={it.name} pos={i} glowType={getPos === i ? "get" : sweepIndex === i ? "loop" : null} removing={it.removing} />
        ))}
        <div style={{ marginLeft: 6, fontSize: 26, color: "#60A5FA", alignSelf: "center" }}>→</div>
      </div>
      <div style={{
        position: "absolute", top: -12, right: 4, background: "#3B82F6", color: "#fff",
        borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700
      }}>{items.filter(i => !i.removing).length} items</div>
    </div>
  );
}

// ─── SLOT 1 - the array problem ──────────────────────────────────────────────
function Slot1({ onNext, playSound, onSee, boxesFilled, errorShown }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Arrays have one problem.</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ color: GR }}>{"// array - size is fixed forever"}</div>
        <div>{kw("String")}[] {fd("members")} = {kw("new")} {kw("String")}[3];{"  "}{cm("// exactly 3 slots")}</div>
        <div>{fd("members")}[0] = {str('"Ravi"')};</div>
        <div>{fd("members")}[1] = {str('"Suresh"')};</div>
        <div>{fd("members")}[2] = {str('"Priya"')};</div>
        <div style={{ height: 6 }} />
        <div style={{ color: GR }}>{"// try to add a 4th member..."}</div>
        <div>{fd("members")}[3] = {str('"Anitha"')};{"  "}{cm("// ← what happens?")}</div>
      </div>

      {!boxesFilled && (
        <button onClick={() => { onSee(); }}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          See what happens →
        </button>
      )}

      {errorShown && (
        <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 14, fontSize: 13, color: "#7F1D1D", lineHeight: 1.7, animation: "slideIn 0.4s ease" }}>
          <strong>ArrayIndexOutOfBoundsException!</strong><br />
          Your array has exactly 3 slots. Anitha has no place to go.<br /><br />
          Real gyms get new members every day. An array can't handle that.
        </div>
      )}
      {errorShown && (
        <button onClick={() => { playSound("tick"); onNext(); }}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Show me a better way →
        </button>
      )}
    </div>
  );
}

// ─── SLOT 2 - create a List ───────────────────────────────────────────────────
function Slot2({ onNext, playSound }) {
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [dinged, setDinged] = useState(false);
  const ok = input.trim() === "ArrayList";

  const check = (v) => {
    setInput(v);
    if (v.trim() === "ArrayList") setWrong(false);
    else if (v.length > 0) { setWrong(true); playSound("warn"); }
  };
  useEffect(() => { if (ok && !dinged) { playSound("correct"); setDinged(true); } }, [ok]);

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>List - the queue that manages itself</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {listTip("List")}{ang("<")}{kw("String")}{ang(">")} {fd("members")} = {kw("new")}{" "}
          <input value={input} onChange={e => check(e.target.value)} placeholder="the most common List type"
            style={{
              width: 130, background: ok ? "#134E4A" : "#0F172A", color: ok ? "#4ADE80" : "#F1F5F9",
              border: `1px solid ${wrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px"
            }} />
          {ang("<>()")};
        </div>
        <div style={{ color: GR, fontSize: 11, marginTop: 4 }}>{"// starts with Array..."}</div>
        {wrong && <div style={{ color: "#F87171", fontSize: 11, marginTop: 2 }}>The most common List type is ArrayList. Try that.</div>}
      </div>

      {ok && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 12, background: "#EFF6FF", borderLeft: "3px solid #3B82F6", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF", marginBottom: 6 }}>New: imports at the top of the file</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#1E3A8A", lineHeight: 1.8 }}>
              {kw("import")} java.util.{listTip("List")};{"  "}{cm("// the List tool")}<br />
              {kw("import")} java.util.{arrayListTip("ArrayList")};{"  "}{cm("// the ArrayList tool")}
            </div>
            <div style={{ fontSize: 11, color: "#374151", marginTop: 6 }}>
              <Tip text="Tells Java which package (folder) to find this tool in."><span style={{ fontWeight: 700 }}>import</span></Tip> = "bring this tool into my file." 📦 java.util is the folder.
            </div>
          </div>

          <div style={{ marginTop: 12, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
            {listTip("List")}{ang("<")}{kw("String")}{ang(">")} {fd("members")} = {kw("new")} {arrayListTip("ArrayList")}{ang("<>()")};
            <div style={{ color: GR, fontSize: 11 }}>{"// holds Strings - grows freely, no limit"}</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>Empty. No size limit. Ready for any number of members.</div>
          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Now add members →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 3 - add / size / get / remove ──────────────────────────────────────
function Slot3({ onDone, playSound, items, addAll, sizeChecked, runSize, getRecord, runGet, removedName, runRemove }) {
  const [names, setNames] = useState(["", "", "", ""]);
  const [added, setAdded] = useState(false);
  const [pos, setPos] = useState("");
  const [removeChoice, setRemoveChoice] = useState("");

  const allFilled = names.every(n => n.trim().length > 0);

  const doAdd = () => {
    setAdded(true);
    addAll(names.map(n => n.trim()));
  };
  const doGet = (v) => { setPos(v); if (v !== "") runGet(Number(v)); };
  const doRemove = () => { if (removeChoice) runRemove(removeChoice); };

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Four things you can do with a List</div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 14, marginBottom: 6 }}>ADD - members.add()</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {names.map((n, i) => (
          <input key={i} value={n} disabled={added} onChange={e => { const c = [...names]; c[i] = e.target.value; setNames(c); }}
            placeholder={["first member", "second member", "third member", "fourth member"][i]}
            style={{ width: 110, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>use real names - people from your neighbourhood</div>
      {!added && (
        <button onClick={doAdd} disabled={!allFilled}
          style={{ marginTop: 8, padding: "8px 18px", background: allFilled ? "#1E293B" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: allFilled ? "pointer" : "default" }}>
          Add them all →
        </button>
      )}
      {added && (
        <div style={{ marginTop: 8, background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
          {names.map((n, i) => <div key={i}>{fd("members")}.{mth("add")}({str(`"${n}"`)});{"  "}{cm(`// list grows - now ${i + 1}`)}</div>)}
        </div>
      )}
      {items.length >= 4 && <div style={{ fontSize: 12, color: "#059669", marginTop: 6 }}>List now has 4 members - no size limit hit.</div>}

      {items.length >= 4 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>SIZE - members.size()</div>
          <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12 }}>
            {kw("System")}.out.println({fd("members")}.{mth("size")}(){cm(" // count how many")});
          </div>
          {!sizeChecked && (
            <button onClick={() => { runSize(); playSound("tick"); }}
              style={{ marginTop: 8, padding: "8px 18px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Run it →
            </button>
          )}
          {sizeChecked && <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 13, color: "#2563EB" }}>→ {items.length}</div>}
        </>
      )}

      {sizeChecked && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>GET - members.get(i)</div>
          <select value={pos} onChange={e => doGet(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}>
            <option value="">Which position?</option>
            {items.map((it, i) => <option key={i} value={i}>{i} - {["first", "second", "third", "fourth"][i] || i}</option>)}
          </select>
          {getRecord && (
            <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, color: "#1E3A8A" }}>
              {fd("members")}.{mth("get")}({getRecord.position}); {cm(`// → "${getRecord.result}"`)}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Positions start at 0, not 1. Position 0 = first member.</div>
        </>
      )}

      {getRecord && !removedName && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>REMOVE - members.remove()</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>Remove one member - they left the gym.</div>
          <select value={removeChoice} onChange={e => setRemoveChoice(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}>
            <option value="">Which member?</option>
            {items.filter(i => !i.removing).map(it => <option key={it.id} value={it.name}>{it.name}</option>)}
          </select>
          <button onClick={doRemove} disabled={!removeChoice}
            style={{ marginLeft: 8, padding: "8px 18px", background: removeChoice ? "#7F1D1D" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: removeChoice ? "pointer" : "default" }}>
            Remove →
          </button>
        </>
      )}

      {removedName && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 8, background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
            {fd("members")}.{mth("remove")}({str(`"${removedName}"`)});{"  "}{cm("// remove this member from list")}<br />
            {fd("members")}.{mth("size")}(); {cm(`// → ${items.filter(i => !i.removing).length} (one less now)`)}
          </div>
          <button onClick={() => { playSound("tick"); onDone(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Now loop through them →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 4 - for-each loop ────────────────────────────────────────────────────
function Slot4({ onDone, playSound, items, runLoop, loopRan, loopOption, setLoopOption }) {
  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Go through every member - the easy way</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setLoopOption("for")}
          style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${loopOption === "for" ? "#1E293B" : "#E2E8F0"}`, background: loopOption === "for" ? "#1E293B" : "#fff", color: loopOption === "for" ? "#fff" : "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Show Option 1 (for)
        </button>
        <button onClick={() => setLoopOption("foreach")}
          style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${loopOption === "foreach" ? "#1E293B" : "#E2E8F0"}`, background: loopOption === "foreach" ? "#1E293B" : "#fff", color: loopOption === "foreach" ? "#fff" : "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Show Option 2 (for-each)
        </button>
      </div>

      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        {loopOption === "for" ? (
          <>
            <div style={{ color: GR }}>{"// the loop from subtopic 1.1.3"}</div>
            <div>{kw("for")} ({kw("int")} i = 0; i {"<"} {fd("members")}.{mth("size")}(); i++) {"{"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({fd("members")}.{mth("get")}(i));</div>
            <div>{"}"}</div>
          </>
        ) : (
          <>
            <div style={{ color: GR }}>{"// simpler - reads like plain English"}</div>
            <div>{kw("for")} ({kw("String")} {fd("member")} {ang(":")} {fd("members")}) {"{"}</div>
            <div style={{ paddingLeft: 24, color: GR, fontSize: 11 }}>{"// ↑ each item          ↑ the list"}</div>
            <div style={{ paddingLeft: 24 }}>{kw("System")}.out.println({fd("member")});</div>
            <div>{"}"}</div>
          </>
        )}
      </div>

      {!loopRan && (
        <button onClick={() => { runLoop(); }}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Run my loop →
        </button>
      )}

      {loopRan && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
            Loop went through all {items.filter(i => !i.removing).length} remaining members. Same loop works for 3 or 300 - members.size() handles the count.
          </div>
          <button onClick={() => { playSound("correct"); onDone(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            See the full picture →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── REVEAL ───────────────────────────────────────────────────────────────────
function RevealCard({ onDone, playSound }) {
  const items = [
    ["List", "a growing flexible collection - no fixed size ever"],
    ["ArrayList", "the most common List - use this by default"],
    [".add()", "put one item at the end"],
    [".get(i)", "get item at position i"],
    [".remove()", "delete an item"],
    [".size()", "count how many items"],
    ["for-each", "for (Type item : list) - simpler loop through every item"],
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
        In a later module - when your app gets data from a database, it comes back as a List just like this.<br />
        You just learned the tool that carries your app's data.
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ─────────────────────────────────────────────────────
function ArrayBox({ i, name, filled, error }) {
  return (
    <div style={{
      width: 74, height: 60, border: "2px solid #94A3B8", background: error ? "#FEF2F2" : "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      animation: error ? "shake 0.4s" : filled ? "popIn 0.3s ease" : "none",
      borderLeft: i === 0 ? "2px solid #94A3B8" : "none", marginLeft: i === 0 ? 0 : -2
    }}>
      {error ? <span style={{ fontSize: 22 }}>❌</span> : filled ? <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>🧍 {name}</span> : null}
    </div>
  );
}

function Phase1Visual({ slot, boxesFilled, errorShown, items, getPos, sweepIndex, sizeChecked, pulse }) {
  return (
    <div style={{ position: "relative", minHeight: 260 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>YOUR LIST - LIVE</div>

      {slot === 1 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex" }}>
            {[0, 1, 2, 3].map(i => (
              <ArrayBox key={i} i={i} name={["Ravi", "Suresh", "Priya"][i]} filled={boxesFilled && i < 3} error={errorShown && i === 3} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>Fixed - only 3 slots</div>
        </div>
      )}

      {slot >= 2 && (
        <>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1E40AF", borderRadius: 12, padding: "2px 8px" }}>📦 java.util.List</span>
            <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1E40AF", borderRadius: 12, padding: "2px 8px" }}>📦 java.util.ArrayList</span>
          </div>
          <Queue items={items} getPos={getPos} sweepIndex={sweepIndex} empty={items.length === 0} />
          <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 6 }}>List&lt;String&gt; members</div>
        </>
      )}

      {pulse && <FlashOverlay key={"f" + pulse.id} id={pulse.id} color={pulse.color} />}
      {pulse && <StatusStamp key={"s" + pulse.id} id={pulse.id} text={pulse.text} color={pulse.stampColor} />}
    </div>
  );
}

// ─── PHASE 2 PARSING ──────────────────────────────────────────────────────────
function parsePhase2(code) {
  const declMatch = code.match(/List\s*<\s*(\w+)\s*>\s+(\w+)\s*=\s*new\s+ArrayList\s*<>\s*\(\s*\)/);
  const listType = declMatch ? declMatch[1] : "";
  const listName = declMatch ? declMatch[2] : "";

  const addRe = /\.add\(\s*"([^"]*)"\s*\)/g;
  const items = [];
  let m;
  while ((m = addRe.exec(code))) if (m[1].trim()) items.push(m[1]);

  const getPositions = [];
  const getRe = /\.get\(\s*(\d+)\s*\)/g;
  while ((m = getRe.exec(code))) getPositions.push(Number(m[1]));

  const removeUsed = /\.remove\(/.test(code);
  const sizeUsed = /\.size\(\)/.test(code);
  const loopUsed = /for\s*\(\s*\w+\s+\w+\s*:\s*\w+\s*\)/.test(code);

  const operationsUsed = [];
  if (items.length) operationsUsed.push("add");
  if (getPositions.length) operationsUsed.push("get");
  if (removeUsed) operationsUsed.push("remove");
  if (sizeUsed) operationsUsed.push("size");
  if (loopUsed) operationsUsed.push("loop");

  return { listType, listName, items, getPositions, removeUsed, sizeUsed, loopUsed, operationsUsed };
}

const PHASE2_STARTER = `// YOUR PROJECT - List

// What list does your app need?
// Gym -> List of members
// Hotel -> List of rooms
// Mess -> List of menu items
// Chai -> List of orders

// Step 1: create your List
List<________> ________ = new ArrayList<>();

// Step 2: add real items from your domain
________.add("________"); // first real item
________.add("________"); // second
________.add("________"); // third

// Step 3: check size
System.out.println(________.size()); // how many?

// Step 4: get one item
System.out.println(________.get(0)); // first item

// Step 5: loop through all
for (________ item : ________) {
    System.out.println(item);
}`;

// ─── PHASE 2 LEFT ──────────────────────────────────────────────────────────────
function Phase2Left({ code, setCode, reflection, setReflection, onSubmit, submitted, parsed }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.listName && parsed.listType && parsed.items.length >= 3 &&
    (parsed.getPositions.length > 0 || parsed.removeUsed || parsed.loopUsed) && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Use a List in YOUR project</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Finish creating and using your List.</div>

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
              In one sentence - what will your project store in this List, and why is a List better than an array for it?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="My project will use a List to store members because the number changes over time and..."
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
            <span style={{ color: parsed.listName ? "#10B981" : "#94A3B8" }}>{parsed.listName ? "✓" : "○"} List declared</span>
            <span style={{ color: parsed.items.length >= 3 ? "#10B981" : "#94A3B8" }}>{parsed.items.length >= 3 ? "✓" : "○"} items added ({parsed.items.length})</span>
            <span style={{ color: (parsed.getPositions.length > 0 || parsed.removeUsed || parsed.loopUsed) ? "#10B981" : "#94A3B8" }}>
              {(parsed.getPositions.length > 0 || parsed.removeUsed || parsed.loopUsed) ? "✓" : "○"} get/remove/loop used
            </span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My List is ready →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 16, padding: 28, animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>Your List is live. 📋</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9 }}>
            {parsed.listName || "Your List"} will carry your project's data - growing and shrinking as needed.<br /><br />
            No fixed size. No overflow errors.<br /><br />
            In a later module, data from a database will arrive in exactly this shape.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase2Visual({ parsed }) {
  const queueItems = parsed.items.map((name, i) => ({ id: i, name, removing: false }));
  const lastGet = parsed.getPositions.length ? parsed.getPositions[parsed.getPositions.length - 1] : null;
  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 12, filter: "grayscale(1)", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
        Phase 1 List (members)
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, textAlign: "center" }}>
        Your project's List - live
      </div>
      <Queue items={queueItems} getPos={lastGet} sweepIndex={parsed.loopUsed ? -1 : null} empty={queueItems.length === 0} />

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 14, marginTop: 12, fontSize: 12, color: "#374151", lineHeight: 1.9 }}>
        List name: <strong>{parsed.listName || "-"}</strong><br />
        Type: <strong>{parsed.listType || "-"}</strong><br />
        Items: <strong>{queueItems.length}</strong>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ListExplorer() {
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

  // slot 1 - array problem
  const [boxesFilled, setBoxesFilled] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const seeArrayProblem = () => {
    setBoxesFilled(true);
    setTimeout(() => { setErrorShown(true); playSound("warn"); }, 500);
  };

  // shared list state
  const [items, setItems] = useState([]);
  const idRef = useRef(0);
  const [sizeChecked, setSizeChecked] = useState(false);
  const [getPos, setGetPos] = useState(null);
  const [getRecord, setGetRecord] = useState(null); // frozen {position, result} - survives later removals
  const [removedName, setRemovedName] = useState(null);
  const [loopOption, setLoopOption] = useState("foreach");
  const [sweepIndex, setSweepIndex] = useState(null);
  const [loopRan, setLoopRan] = useState(false);

  const addAll = (names) => {
    names.forEach((n, i) => {
      setTimeout(() => {
        idRef.current += 1;
        setItems(prev => [...prev, { id: idRef.current, name: n, removing: false }]);
        playSound("add");
      }, i * 220);
    });
  };
  const runSize = () => setSizeChecked(true);
  const runGet = (i) => {
    setGetPos(i);
    setGetRecord({ position: i, result: items[i]?.name || "" });
    playSound("tick");
  };
  const runRemove = (name) => {
    setGetPos(null); // positions shift after a removal - clear the live highlight, keep getRecord as history
    setItems(prev => prev.map(it => it.name === name ? { ...it, removing: true } : it));
    playSound("remove");
    setTimeout(() => {
      setItems(prev => prev.filter(it => it.name !== name));
      setRemovedName(name);
    }, 300);
  };
  const runLoop = () => {
    const remaining = items.filter(i => !i.removing);
    remaining.forEach((it, i) => {
      setTimeout(() => { setSweepIndex(i); playSound("tick"); }, i * 500);
    });
    setTimeout(() => { setSweepIndex(null); setLoopRan(true); playSound("correct"); }, remaining.length * 500 + 200);
  };

  const [pulse, setPulse] = useState(null);
  const pulseIdRef = useRef(0);
  const firePulse = (text, color, stampColor) => {
    pulseIdRef.current += 1;
    setPulse({ id: pulseIdRef.current, text, color, stampColor });
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
      exerciseId: "m1-t3-s1-list-explorer",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          arrayProblemSeen: errorShown,
          arrayListTyped: "ArrayList",
          membersAdded: items.map(i => i.name),
          sizeChecked: items.length,
          getUsed: { position: getRecord?.position ?? null, result: getRecord?.result || "" },
          memberRemoved: removedName,
          loopOptionChosen: loopOption,
          loopRanSuccessfully: loopRan
        },
        phase2: {
          listType: parsed.listType,
          listName: parsed.listName,
          itemsAdded: parsed.items,
          operationsUsed: parsed.operationsUsed,
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
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeOutRight { from { opacity:1; transform:translate(0,0) rotate(0deg); } to { opacity:0; transform:translate(26px,-6px) rotate(8deg); } }
        @keyframes idleBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
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
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.3.1 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>List Explorer</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>The canteen queue that grows as people join</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => setSlot(2)} playSound={playSound} onSee={seeArrayProblem} boxesFilled={boxesFilled} errorShown={errorShown} />
              {slot >= 2 && <Slot2 onNext={() => { setSlot(3); firePulse("LIST CREATED! 📋", "rgba(37,99,235,0.2)", "#1D4ED8"); }} playSound={playSound} />}
              {slot >= 3 && (
                <Slot3
                  onDone={() => setSlot(4)} playSound={playSound}
                  items={items} addAll={addAll}
                  sizeChecked={sizeChecked} runSize={runSize}
                  getRecord={getRecord} runGet={runGet}
                  removedName={removedName} runRemove={runRemove}
                />
              )}
              {slot >= 4 && !showReveal && (
                <Slot4
                  onDone={() => { setShowReveal(true); firePulse("LOOP DONE! ✅", "rgba(139,92,246,0.2)", "#7C3AED"); }}
                  playSound={playSound} items={items} runLoop={runLoop} loopRan={loopRan}
                  loopOption={loopOption} setLoopOption={setLoopOption}
                />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now use List in YOUR project →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, minHeight: 320 }}>
                <Phase1Visual slot={slot} boxesFilled={boxesFilled} errorShown={errorShown} items={items} getPos={getPos} sweepIndex={sweepIndex} sizeChecked={sizeChecked} pulse={pulse} />
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
