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
const B = "#60A5FA", G = "#4ADE80", O = "#FB923C", P = "#E879F9", GR = "#6B7280";
function kw(t) { return <span style={{ color: B }}>{t}</span>; }
function cn(t) { return <span style={{ color: B, fontWeight: 700 }}>{t}</span>; }
function mth(t) { return <span style={{ color: "#FACC15", fontWeight: 700 }}>{t}</span>; }
function keyC(t) { return <span style={{ color: "#22C55E" }}>{t}</span>; }
function valC(t) { return <span style={{ color: O }}>{t}</span>; }
function str(t) { return <span style={{ color: G }}>{t}</span>; }
function cm(t) { return <span style={{ color: GR }}>{t}</span>; }
function ang(t) { return <span style={{ color: P }}>{t}</span>; }
function mapTip(t) { return <Tip text="Stores pairs — key connects to value. Look up by name, not position."><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }
function hashMapTip(t) { return <Tip text="Most common Map — use by default"><span style={{ color: B, fontWeight: 700 }}>{t}</span></Tip>; }

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

// ─── CONTACT ROW (one key → value pair) ───────────────────────────────────────
const AVATAR_COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F43F5E", "#14B8A6", "#FB923C"];
function colorForName(name) {
  let h = 0;
  for (let i = 0; i < String(name).length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function valueColor(v) {
  return /^-?\d+(\.\d+)?$/.test(String(v).trim()) ? "#059669" : "#3B82F6";
}

function ContactRow({ pair, state, rowRef }) {
  // state: null | "get" | "beam" | "found" | "notfound"
  const bg = state === "get" ? "#EFF6FF" : state === "found" ? "#ECFDF5" : state === "beam" ? "#EFF6FF" : state === "notfound" ? "#FEF2F2" : "#fff";
  const avatarColor = colorForName(pair.key);
  return (
    <div ref={rowRef} style={{
      position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderBottom: "1px solid #F3F4F6", background: bg,
      transition: "background 0.4s ease", animation: "slideInRight 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: avatarColor, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13,
            border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
          }}>{pair.key.charAt(0).toUpperCase()}</div>
          <div style={{ position: "absolute", bottom: -3, right: -3, fontSize: 11 }}>🔑</div>
        </div>
        <span style={{ fontWeight: 700, color: "#1E293B", fontSize: 14 }}>{pair.key}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#CBD5E1", fontSize: 12 }}>→</span>
        <div style={{ fontWeight: 700, fontSize: 14, color: valueColor(pair.value), position: "relative" }}>
          {pair.oldValue != null && (
            <span style={{ color: "#DC2626", textDecoration: "line-through", marginRight: 8, opacity: 0.7, animation: "popIn 0.3s ease" }}>{pair.oldValue}</span>
          )}
          <span style={pair.oldValue != null ? { animation: "popIn 0.35s ease" } : {}}>{pair.value}</span>
        </div>
      </div>

      {state === "found" && <div style={{ position: "absolute", right: -8, top: -8, fontSize: 14, animation: "popIn 0.3s ease" }}>✅</div>}
      {state === "notfound" && <div style={{ position: "absolute", right: -8, top: -8, fontSize: 14, animation: "popIn 0.3s ease" }}>❌</div>}
    </div>
  );
}

function GetBubble({ top, value }) {
  return (
    <div style={{
      position: "absolute", left: "100%", top: top - 4, marginLeft: 10, zIndex: 10,
      animation: "popIn 0.25s ease", whiteSpace: "nowrap"
    }}>
      <div style={{
        position: "absolute", left: -9, top: 10, width: 0, height: 0,
        borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "9px solid #1E3A8A"
      }} />
      <div style={{ background: "#1E3A8A", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
        {value}
      </div>
    </div>
  );
}

function ContactList({ pairs, mapName, keyType, valueType, getKey, scanState, sizePulse, empty }) {
  const rowRefs = useRef([]);
  const containerRef = useRef(null);
  const [bubbleTop, setBubbleTop] = useState(null);
  const [beamRect, setBeamRect] = useState(null);
  const getIndex = pairs.findIndex(p => p.key === getKey);

  useEffect(() => {
    if (getIndex >= 0 && rowRefs.current[getIndex] && containerRef.current) {
      const rowRect = rowRefs.current[getIndex].getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setBubbleTop(rowRect.top - containerRect.top);
    } else {
      setBubbleTop(null);
    }
  }, [getKey, pairs.length]);

  useEffect(() => {
    const idx = scanState && scanState.index;
    if (idx != null && rowRefs.current[idx] && containerRef.current) {
      const rowRect = rowRefs.current[idx].getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setBeamRect({ top: rowRect.top - containerRect.top, height: rowRect.height });
    } else {
      setBeamRect(null);
    }
  }, [scanState && scanState.index, pairs.length]);

  return (
    <div style={{ position: "relative" }}>
      {(keyType || valueType) && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1E40AF", borderRadius: 12, padding: "2px 8px" }}>📦 java.util.Map</span>
          <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1E40AF", borderRadius: 12, padding: "2px 8px" }}>📦 java.util.HashMap</span>
        </div>
      )}
      <div ref={containerRef} style={{ position: "relative", background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ background: "#1E293B", color: "#fff", padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>
          {mapName || "yourMap"} <span style={{ fontWeight: 400, color: "#94A3B8" }}>Map&lt;{keyType || "?"}, {valueType || "?"}&gt;</span>
        </div>
        {empty && <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>— empty — no pairs yet —</div>}
        {pairs.map((p, i) => (
          <ContactRow key={p.key} pair={p} rowRef={el => (rowRefs.current[i] = el)}
            state={getKey === p.key ? "get" : scanState && scanState.index === i ? "beam" : scanState && scanState.doneIndex === i ? (scanState.found ? "found" : null) : (scanState && scanState.allShake && !scanState.found ? "notfound" : null)} />
        ))}
        {beamRect && (
          <div style={{
            position: "absolute", left: 0, right: 0, background: "rgba(59,130,246,0.14)",
            borderTop: "2px solid #3B82F6", borderBottom: "2px solid #3B82F6",
            top: beamRect.top, height: beamRect.height, transition: "top 0.14s linear", pointerEvents: "none"
          }} />
        )}
      </div>
      <div key={sizePulse || 0} style={{
        position: "absolute", top: -12, right: 4, background: "#3B82F6", color: "#fff",
        borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700,
        animation: sizePulse ? "popIn 0.35s ease" : "none"
      }}>{pairs.length} pairs</div>

      {bubbleTop != null && <GetBubble top={bubbleTop} value={pairs[getIndex]?.value} />}
    </div>
  );
}

// ─── SLOT 1 — the List-can't-connect problem ─────────────────────────────────
function Slot1({ onNext, playSound, onTry, tried }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>A List can't connect two things.</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ color: GR }}>{"// a List of plan names"}</div>
        <div>{cn("List")}{ang("<")}{kw("String")}{ang(">")} plans = {kw("new")} {cn("ArrayList")}{ang("<>()")};</div>
        <div>plans.{mth("add")}({str('"Basic"')});</div>
        <div>plans.{mth("add")}({str('"Premium"')});</div>
        <div>plans.{mth("add")}({str('"Annual"')});</div>
        <div style={{ height: 6 }} />
        <div style={{ color: GR }}>{"// but where is the price?"}</div>
        <div style={{ color: GR }}>{"// how does \"Basic\" connect to 500?"}</div>
        <div style={{ color: GR }}>{"// a List has no way to store that connection."}</div>
      </div>

      {!tried && (
        <button onClick={onTry}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Try to get Basic's price →
        </button>
      )}

      {tried && (
        <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 14, fontSize: 13, color: "#7F1D1D", lineHeight: 1.7, animation: "slideIn 0.4s ease" }}>
          The List has the names. But it has no idea what price goes with each name.<br /><br />
          A List stores items — not pairs. You need something that connects one thing to another.
        </div>
      )}
      {tried && (
        <button onClick={() => { playSound("tick"); onNext(); }}
          style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Show me Map →
        </button>
      )}
    </div>
  );
}

// ─── SLOT 2 — create a Map ────────────────────────────────────────────────────
function Slot2({ onNext, playSound }) {
  const [keyType, setKeyType] = useState("");
  const [valType, setValType] = useState("");
  const [keyWrong, setKeyWrong] = useState(false);
  const [valWrong, setValWrong] = useState(false);
  const [dinged, setDinged] = useState(false);
  const ok = keyType === "String" && valType === "Integer";

  const chooseKey = (v) => {
    setKeyType(v);
    if (v === "String") setKeyWrong(false);
    else { setKeyWrong(true); playSound("warn"); }
  };
  const chooseVal = (v) => {
    setValType(v);
    if (v === "Integer") setValWrong(false);
    else { setValWrong(true); playSound("warn"); }
  };
  useEffect(() => { if (ok && !dinged) { playSound("correct"); setDinged(true); } }, [ok]);

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Map — every key connects to one value</div>
      <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {mapTip("Map")}{ang("<")}
          <select value={keyType} onChange={e => chooseKey(e.target.value)}
            style={{ background: keyType === "String" ? "#134E4A" : "#0F172A", color: keyType === "String" ? "#4ADE80" : "#F1F5F9", border: `1px solid ${keyWrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }}>
            <option value="">key type</option>
            <option value="String">String</option>
            <option value="Integer">Integer</option>
          </select>
          {ang(",")}
          <select value={valType} onChange={e => chooseVal(e.target.value)}
            style={{ background: valType === "Integer" ? "#134E4A" : "#0F172A", color: valType === "Integer" ? "#4ADE80" : "#F1F5F9", border: `1px solid ${valWrong ? "#F87171" : "#475569"}`, borderRadius: 6, fontFamily: "monospace", fontSize: 13, padding: "2px 6px" }}>
            <option value="">value type</option>
            <option value="String">String</option>
            <option value="Integer">Integer</option>
            <option value="Double">Double</option>
          </select>
          {ang(">")} planPrices = {kw("new")} {hashMapTip("HashMap")}{ang("<>()")};
        </div>
        <div style={{ color: GR, fontSize: 11, marginTop: 4 }}>{"// key type, value type"}</div>
        {keyWrong && <div style={{ color: "#F87171", fontSize: 11 }}>Plan names are words — try String for key</div>}
        {valWrong && <div style={{ color: "#F87171", fontSize: 11 }}>Prices are whole numbers — try Integer for value</div>}
      </div>

      {ok && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 12, background: "#0F172A", color: "#E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 1.9 }}>
            <div style={{ color: GR }}>{"// import at top"}</div>
            <div>{kw("import")} java.util.{mapTip("Map")};{"  "}{cm("// Map type")}</div>
            <div>{kw("import")} java.util.{hashMapTip("HashMap")};{"  "}{cm("// HashMap creator")}</div>
            <div style={{ height: 6 }} />
            <div>{mapTip("Map")}{ang("<")}{kw("String")}{ang(",")} {kw("Integer")}{ang(">")} planPrices = {kw("new")} {hashMapTip("HashMap")}{ang("<>()")};</div>
            <div style={{ color: GR, fontSize: 11 }}>{"// plan name -> price amount"}</div>
          </div>
          <button onClick={() => { playSound("tick"); onNext(); }}
            style={{ marginTop: 14, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Now add pairs →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SLOT 3 — put / get / containsKey / size ─────────────────────────────────
function Slot3({ onDone, playSound, pairs, putAll, getKey, runGet, checkRecord, runCheck, sizeChecked, runSize }) {
  const [keys, setKeys] = useState(["", "", ""]);
  const [vals, setVals] = useState(["", "", ""]);
  const [added, setAdded] = useState(false);
  const [getChoice, setGetChoice] = useState("");
  const [checkInput, setCheckInput] = useState("");

  const allFilled = keys.every(k => k.trim()) && vals.every(v => v.trim() && !isNaN(Number(v)));

  const doAdd = () => {
    setAdded(true);
    putAll(keys.map((k, i) => ({ key: k.trim(), value: Number(vals[i]) })));
  };
  const doGet = (v) => { setGetChoice(v); if (v) runGet(v); };
  const doCheck = () => { if (checkInput.trim()) runCheck(checkInput.trim()); };

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Four things you can do with a Map</div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 14, marginBottom: 6 }}>PUT — planPrices.put()</div>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <input value={keys[i]} disabled={added} onChange={e => { const c = [...keys]; c[i] = e.target.value; setKeys(c); }}
            placeholder="plan name e.g. Basic"
            style={{ width: 140, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
          <span style={{ color: "#94A3B8" }}>→</span>
          <input value={vals[i]} disabled={added} onChange={e => { const c = [...vals]; c[i] = e.target.value; setVals(c); }}
            placeholder="price e.g. 500" type="number"
            style={{ width: 100, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>Gym: Basic/Premium/Annual · Hotel: Standard/Deluxe/Suite · Mess: Monthly/Weekly/Daily</div>
      {!added && (
        <button onClick={doAdd} disabled={!allFilled}
          style={{ padding: "8px 18px", background: allFilled ? "#1E293B" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: allFilled ? "pointer" : "default" }}>
          Add all pairs →
        </button>
      )}
      {added && (
        <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
          {keys.map((k, i) => <div key={i}>planPrices.{mth("put")}({str(`"${k}"`)}, {valC(vals[i])});{"  "}{cm(`// ${k} → ${vals[i]}`)}</div>)}
        </div>
      )}

      {pairs.length >= 3 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>GET — planPrices.get(key)</div>
          <select value={getChoice} onChange={e => doGet(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}>
            <option value="">Which plan?</option>
            {pairs.map(p => <option key={p.key} value={p.key}>{p.key}</option>)}
          </select>
          {getKey && (
            <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, color: "#1E3A8A" }}>
              planPrices.{mth("get")}({str(`"${getKey}"`)}); {cm(`// → ${pairs.find(p => p.key === getKey)?.value}`)}
            </div>
          )}
        </>
      )}

      {getKey && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>CONTAINSKEY — check if a plan exists</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={checkInput} onChange={e => setCheckInput(e.target.value)} placeholder="type any plan name to check"
              style={{ width: 200, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
            <button onClick={doCheck} disabled={!checkInput.trim()}
              style={{ padding: "8px 18px", background: checkInput.trim() ? "#1E293B" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: checkInput.trim() ? "pointer" : "default" }}>
              Check →
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>try one that exists and one that doesn't</div>
          {checkRecord && (
            <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, color: checkRecord.found ? "#059669" : "#DC2626" }}>
              planPrices.{mth("containsKey")}({str(`"${checkRecord.key}"`)}); {cm(`// → ${checkRecord.found}`)}
            </div>
          )}
        </>
      )}

      {checkRecord && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>SIZE — planPrices.size()</div>
          <div style={{ background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12 }}>
            planPrices.{mth("size")}(); {cm(`// how many pairs? → ${pairs.length}`)}
          </div>
          {!sizeChecked && (
            <button onClick={() => { runSize(); playSound("tick"); }}
              style={{ marginTop: 8, padding: "8px 18px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Run it →
            </button>
          )}
          {sizeChecked && <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 13, color: "#2563EB" }}>→ {pairs.length}</div>}
        </>
      )}

      {sizeChecked && (
        <button onClick={() => { playSound("tick"); onDone(); }}
          style={{ marginTop: 16, padding: "12px 24px", background: "#1E293B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Now try the unique key rule →
        </button>
      )}
    </div>
  );
}

// ─── SLOT 4 — unique key rule ─────────────────────────────────────────────────
function Slot4({ onDone, playSound, pairs, runReplace, replaceRecord }) {
  const [newPrice, setNewPrice] = useState("");
  const targetKey = pairs[0]?.key || "";

  const doReplace = () => {
    if (!newPrice.trim() || isNaN(Number(newPrice))) return;
    runReplace(targetKey, Number(newPrice));
  };

  return (
    <div style={{ marginBottom: 26, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>One key — one value. Always.</div>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 10 }}>
        What happens if you put <strong>{targetKey}</strong> again with a different price?
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" placeholder="e.g. 800"
          style={{ width: 120, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
        <button onClick={doReplace} disabled={!newPrice.trim()}
          style={{ padding: "8px 18px", background: newPrice.trim() ? "#1E293B" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: newPrice.trim() ? "pointer" : "default" }}>
          Put it →
        </button>
      </div>

      {replaceRecord && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ marginTop: 12, background: "#1E293B", color: "#E2E8F0", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
            {cm("// putting an existing key again")}<br />
            planPrices.{mth("put")}({str(`"${replaceRecord.key}"`)}, {valC(replaceRecord.newValue)}); {cm("// → replaces the old value")}<br />
            planPrices.{mth("get")}({str(`"${replaceRecord.key}"`)}); {cm(`// → ${replaceRecord.newValue} — old value is gone`)}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
            {replaceRecord.key} now has the new price. The old price is gone.<br />
            Every key is unique in a Map. Same key again = replace, not add.
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
    ["Map", "stores pairs — every key connects to one value"],
    ["HashMap", "most common Map — use this by default"],
    [".put(key, value)", "add one pair"],
    [".get(key)", "get the value for this key — instant, no searching"],
    [".containsKey(key)", "does this key exist?"],
    [".size()", "how many pairs in the Map"],
    ["Unique keys", "same key again = replaces old value"],
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
      <div style={{ marginTop: 14, background: "#fff", border: "1px solid #FDE68A", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 700, color: "#1E293B", borderRight: "1px solid #FDE68A", background: "#F8FAFC" }}>List</div>
          <div style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 700, color: "#1E293B", background: "#F8FAFC" }}>Map</div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: 10, fontSize: 12, color: "#374151", borderRight: "1px solid #FDE68A" }}>items in sequence</div>
          <div style={{ flex: 1, padding: 10, fontSize: 12, color: "#374151" }}>pairs by name</div>
        </div>
      </div>
      <div style={{ marginTop: 16, textAlign: "center", color: "#78350F", fontSize: 13, lineHeight: 1.8, fontWeight: 700 }}>
        Different tools. Different jobs. Both essential.
      </div>
    </div>
  );
}

// ─── PHASE 1 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase1Visual({ slot, tried, pairs, mapName, keyType, valueType, getKey, scanState, sizePulse, pulse }) {
  return (
    <div style={{ position: "relative", minHeight: 300 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>YOUR MAP — LIVE</div>

      {slot === 1 && (
        <div style={{ textAlign: "center" }}>
          {tried && <div style={{ fontSize: 20, color: "#3B82F6", animation: "popIn 0.3s ease" }}>🔍 looking for Basic's price...</div>}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
            {["Basic", "Premium", "Annual"].map(n => (
              <div key={n} style={{
                position: "relative", padding: "8px 14px", background: "#fff",
                border: `1px solid ${tried && n === "Basic" ? "#DC2626" : "#CBD5E1"}`, borderRadius: 20, fontSize: 13,
                animation: tried && n === "Basic" ? "shake 0.4s" : "none"
              }}>
                {n}
                {tried && n === "Basic" && (
                  <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: 18, animation: "popIn 0.3s ease 0.35s both" }}>❓</div>
                )}
              </div>
            ))}
          </div>
          {tried && (
            <div style={{ marginTop: 24, fontSize: 12, color: "#DC2626", fontWeight: 700, animation: "popIn 0.3s ease 0.5s both" }}>no price found — a List doesn't store that connection</div>
          )}
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>List — items only, no connections</div>
        </div>
      )}

      {slot >= 2 && (
        <ContactList pairs={pairs} mapName={mapName} keyType={keyType} valueType={valueType} getKey={getKey} scanState={scanState} sizePulse={sizePulse} empty={pairs.length === 0} />
      )}

      {pulse && <FlashOverlay key={"f" + pulse.id} id={pulse.id} color={pulse.color} />}
      {pulse && <StatusStamp key={"s" + pulse.id} id={pulse.id} text={pulse.text} color={pulse.stampColor} />}
    </div>
  );
}

// ─── PHASE 2 PARSING ──────────────────────────────────────────────────────────
function parsePhase2(code) {
  const declMatch = code.match(/Map\s*<\s*(\w+)\s*,\s*(\w+)\s*>\s+(\w+)\s*=\s*new\s+HashMap\s*<>\s*\(\s*\)/);
  const keyType = declMatch ? declMatch[1] : "";
  const valueType = declMatch ? declMatch[2] : "";
  const mapName = declMatch ? declMatch[3] : "";

  const putRe = /\.put\(\s*"([^"]*)"\s*,\s*"?([^",)]*)"?\s*\)/g;
  const pairs = [];
  let m;
  while ((m = putRe.exec(code))) if (m[1].trim()) pairs.push({ key: m[1].trim(), value: m[2].trim() });

  const getKeys = [];
  const getRe = /\.get\(\s*"([^"]*)"\s*\)/g;
  while ((m = getRe.exec(code))) getKeys.push(m[1]);

  const containsKeys = [];
  const ckRe = /\.containsKey\(\s*"([^"]*)"\s*\)/g;
  while ((m = ckRe.exec(code))) containsKeys.push(m[1]);

  const sizeUsed = /\.size\(\)/.test(code);

  const operationsUsed = [];
  if (pairs.length) operationsUsed.push("put");
  if (getKeys.length) operationsUsed.push("get");
  if (containsKeys.length) operationsUsed.push("containsKey");
  if (sizeUsed) operationsUsed.push("size");

  return { keyType, valueType, mapName, pairs, getKeys, containsKeys, sizeUsed, operationsUsed };
}

const PHASE2_STARTER = `// YOUR PROJECT — Map

// What pairs does your app need?
// Gym: plan name -> price
// Hotel: room type -> price per night
// Mess: meal name -> calories or price
// Chai: item name -> price

// Step 1: create your Map
Map<String, ________> ________ = new HashMap<>();

// Step 2: add real pairs from your domain
________.put("________", ________);
________.put("________", ________);
________.put("________", ________);

// Step 3: look up one value
System.out.println(________.get("________"));

// Step 4: check if a key exists
System.out.println(________.containsKey("________"));`;

// ─── PHASE 2 LEFT ──────────────────────────────────────────────────────────────
function Phase2Left({ code, setCode, reflection, setReflection, onSubmit, submitted, parsed }) {
  const words = reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionOk = words >= 5;
  const canSubmit = parsed.mapName && parsed.keyType && parsed.pairs.length >= 3 &&
    (parsed.getKeys.length > 0 || parsed.containsKeys.length > 0) && reflectionOk;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Use a Map in YOUR project</div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 16 }}>Finish creating and using your Map.</div>

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
              In one sentence — what pairs will your Map store, and why is a Map better than a List for this?
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder="My project uses a Map to connect plan name to price because I need to look up price by plan name and..."
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
            <span style={{ color: parsed.mapName ? "#10B981" : "#94A3B8" }}>{parsed.mapName ? "✓" : "○"} Map declared</span>
            <span style={{ color: parsed.pairs.length >= 3 ? "#10B981" : "#94A3B8" }}>{parsed.pairs.length >= 3 ? "✓" : "○"} pairs added ({parsed.pairs.length})</span>
            <span style={{ color: (parsed.getKeys.length > 0 || parsed.containsKeys.length > 0) ? "#10B981" : "#94A3B8" }}>
              {(parsed.getKeys.length > 0 || parsed.containsKeys.length > 0) ? "✓" : "○"} get/containsKey used
            </span>
          </div>

          <button onClick={onSubmit} disabled={!canSubmit}
            style={{
              marginTop: 16, padding: "14px 32px", background: canSubmit ? "#1E293B" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed", display: "block", width: "100%"
            }}>My Map is ready →</button>
        </>
      )}

      {submitted && (
        <div style={{ background: "#ECFDF5", border: "2px solid #10B981", borderRadius: 16, padding: 28, animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#064E3B", marginBottom: 14, textAlign: "center" }}>Your Map is live. 📇</div>
          <div style={{ fontSize: 14, color: "#065F46", lineHeight: 1.9 }}>
            {parsed.mapName || "Your Map"} connects every key straight to its value — instant lookup, no searching.<br /><br />
            List = items in sequence. Map = pairs by name.<br /><br />
            In a later module, data from a database will often arrive shaped exactly like this.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 2 RIGHT VISUAL ─────────────────────────────────────────────────────
function Phase2Visual({ parsed }) {
  const lastGet = parsed.getKeys.length ? parsed.getKeys[parsed.getKeys.length - 1] : null;
  return (
    <div>
      <div style={{ opacity: 0.3, marginBottom: 12, filter: "grayscale(1)", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
        Phase 1 Map (planPrices)
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, textAlign: "center" }}>
        Your project's Map — live
      </div>
      <ContactList pairs={parsed.pairs} mapName={parsed.mapName} keyType={parsed.keyType} valueType={parsed.valueType} getKey={lastGet} scanState={null} empty={parsed.pairs.length === 0} />

      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 14, marginTop: 12, fontSize: 12, color: "#374151", lineHeight: 1.9 }}>
        Map name: <strong>{parsed.mapName || "—"}</strong><br />
        Key type: <strong>{parsed.keyType || "—"}</strong><br />
        Value type: <strong>{parsed.valueType || "—"}</strong><br />
        Pairs: <strong>{parsed.pairs.length}</strong>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MapExplorer() {
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
  const [tried, setTried] = useState(false);
  const onTry = () => { setTried(true); playSound("warn"); };

  // slot 2 — map identity (fixed for phase 1 guided demo)
  const mapName = "planPrices";
  const keyType = "String";
  const valueType = "Integer";

  // shared map state
  const [pairs, setPairs] = useState([]);
  const [getKey, setGetKey] = useState(null);
  const [checkRecord, setCheckRecord] = useState(null);
  const [scanState, setScanState] = useState(null);
  const [sizeChecked, setSizeChecked] = useState(false);
  const [sizePulse, setSizePulse] = useState(0);
  const [replaceRecord, setReplaceRecord] = useState(null);

  const putAll = (newPairs) => {
    newPairs.forEach((p, i) => {
      setTimeout(() => {
        setPairs(prev => [...prev, p]);
        playSound("add");
      }, i * 220);
    });
  };
  const runGet = (key) => { setGetKey(key); playSound("correct"); };
  const runCheck = (key) => {
    const found = pairs.some(p => p.key.toLowerCase() === key.toLowerCase());
    const order = pairs.map((_, i) => i);
    order.forEach((idx, i) => setTimeout(() => setScanState({ index: idx, found: null }), i * 150));
    setTimeout(() => {
      setScanState({ index: null, doneIndex: found ? pairs.findIndex(p => p.key.toLowerCase() === key.toLowerCase()) : null, found, allShake: !found });
      setCheckRecord({ key, found });
      playSound(found ? "correct" : "warn");
    }, order.length * 150 + 100);
  };
  const runSize = () => { setSizeChecked(true); setSizePulse(p => p + 1); };
  const runReplace = (key, newValue) => {
    setPairs(prev => prev.map(p => p.key === key ? { ...p, oldValue: p.value, value: newValue } : p));
    playSound("tick");
    setReplaceRecord({ key, newValue });
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
      exerciseId: "m1-t3-s2-map-explorer",
      exerciseType: "interactive",
      status: "completed",
      score: 3,
      maxScore: 3,
      answers: {
        phase1: {
          listLimitationSeen: tried,
          mapKeyType: keyType,
          mapValueType: valueType,
          pairsAdded: pairs.map(p => ({ key: p.key, value: p.value })),
          getUsed: { key: getKey, result: getKey ? (pairs.find(p => p.key === getKey)?.value ?? "") : "" },
          containsKeyUsed: {
            existingKey: checkRecord && checkRecord.found ? checkRecord.key : "",
            nonExistingKey: checkRecord && !checkRecord.found ? checkRecord.key : ""
          },
          sizeChecked: pairs.length,
          uniqueKeyRuleSeen: !!replaceRecord,
          replacementValue: replaceRecord ? replaceRecord.newValue : ""
        },
        phase2: {
          mapKeyType: parsed.keyType,
          mapValueType: parsed.valueType,
          mapName: parsed.mapName,
          pairsAdded: parsed.pairs,
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
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
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
        <div style={{ fontSize: 12, color: "#94A3B8", letterSpacing: 2, marginBottom: 6 }}>SUBTOPIC 1.3.2 · HATCHKOD</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Map Explorer</div>
        <div style={{ fontSize: 15, color: "#CBD5E1" }}>The phone contact list — look up by name, not position</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {phase === 1 && (
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 480px", minWidth: 0 }}>
              <Slot1 onNext={() => { setSlot(2); }} playSound={playSound} onTry={onTry} tried={tried} />
              {slot >= 2 && <Slot2 onNext={() => { setSlot(3); firePulse("MAP CREATED! 📇", "rgba(37,99,235,0.2)", "#1D4ED8"); }} playSound={playSound} />}
              {slot >= 3 && (
                <Slot3
                  onDone={() => setSlot(4)} playSound={playSound}
                  pairs={pairs} putAll={putAll}
                  getKey={getKey} runGet={runGet}
                  checkRecord={checkRecord} runCheck={runCheck}
                  sizeChecked={sizeChecked} runSize={runSize}
                />
              )}
              {slot >= 4 && !showReveal && (
                <Slot4
                  onDone={() => { setShowReveal(true); firePulse("UNIQUE KEY! 🔑", "rgba(139,92,246,0.2)", "#7C3AED"); }}
                  playSound={playSound} pairs={pairs} runReplace={runReplace} replaceRecord={replaceRecord}
                />
              )}
              {showReveal && !revealDone && <RevealCard playSound={playSound} onDone={() => setRevealDone(true)} />}
              {revealDone && (
                <button onClick={() => { playSound("tick"); setPhase(2); }}
                  style={{
                    marginTop: 20, padding: "14px 32px", background: "#1E293B", color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "block", width: "100%"
                  }}>Now use Map in YOUR project →</button>
              )}
            </div>
            <div style={{ flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, minHeight: 340 }}>
                <Phase1Visual slot={slot} tried={tried} pairs={pairs} mapName={mapName} keyType={keyType} valueType={valueType} getKey={getKey} scanState={scanState} sizePulse={sizePulse} pulse={pulse} />
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
