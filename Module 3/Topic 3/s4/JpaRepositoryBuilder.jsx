import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   SOUND ENGINE
───────────────────────────────────────────── */
function useSound() {
  const ctx = useRef(null);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  };

  const play = useCallback((type) => {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      const presets = {
        tick:    { type: "sine",     freq: 660,  dur: 0.08, vol: 0.25 },
        add:     { type: "triangle", freq: 880,  dur: 0.18, vol: 0.30 },
        correct: { type: "sine",     freq: 1046, dur: 0.25, vol: 0.28 },
        warn:    { type: "sawtooth", freq: 220,  dur: 0.20, vol: 0.20 },
        forge:   { type: "square",   freq: 110,  dur: 0.12, vol: 0.15 },
        payoff:  { type: "sine",     freq: 1318, dur: 0.40, vol: 0.30 },
      };

      const p = presets[type] || presets.tick;
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, ac.currentTime);
      gain.gain.setValueAtTime(p.vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + p.dur);
      osc.start();
      osc.stop(ac.currentTime + p.dur);
    } catch (_) {}
  }, []);

  return play;
}

/* ─────────────────────────────────────────────
   PROGRESS PILL BAR
───────────────────────────────────────────── */
const SLOTS = [
  { id: 1, label: "Pain" },
  { id: 2, label: "Interface" },
  { id: 3, label: "JpaRepository" },
  { id: 4, label: "@Autowired" },
  { id: 5, label: "Replace" },
  { id: 6, label: "Payoff" },
  { id: 7, label: "Your Project" },
];

function ProgressBar({ active }) {
  return (
    <div style={{
      display: "flex", gap: "6px", alignItems: "center",
      padding: "12px 20px", background: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0", flexWrap: "wrap",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {SLOTS.map((s, i) => {
        const done = s.id < active;
        const current = s.id === active;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 14px", borderRadius: "20px",
              background: done ? "rgba(16,185,129,0.12)" : current ? "#3B82F6" : "#F1F5F9",
              border: `1px solid ${done ? "#22c55e" : current ? "#3b82f6" : "#E2E8F0"}`,
              fontSize: "12px", fontWeight: 600,
              color: done ? "#16A34A" : current ? "#fff" : "#94A3B8",
              transition: "all 0.3s ease",
              transform: current ? "scale(1.08)" : "scale(1)",
              boxShadow: current ? "0 0 12px rgba(59,130,246,0.3)" : "none",
            }}>
              {done ? "✓ " : `${s.id}. `}{s.label}
            </div>
            {i < SLOTS.length - 1 && (
              <span style={{ color: "#CBD5E1", fontSize: "16px" }}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SLOT WRAPPER
───────────────────────────────────────────── */
function SlotShell({ title, subtitle, left, right }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", flex: 1,
      minHeight: 0, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
      }}>
        <div style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
          {subtitle}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>
          {title}
        </div>
      </div>

      {/* Split */}
      <div style={{
        display: "flex", flex: 1, minHeight: 0, overflow: "hidden",
      }}>
        <div style={{
          flex: 1, padding: "24px", overflowY: "auto",
          borderRight: "1px solid #E2E8F0", background: "#F9FAFB",
        }}>
          {left}
        </div>
        <div style={{
          width: "360px", minWidth: "280px", padding: "24px",
          overflowY: "auto", background: "#F1F5F9",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          {right}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CODE BLOCK
───────────────────────────────────────────── */
function CodeBlock({ lines, highlight = [], flash = [] }) {
  return (
    <pre style={{
      background: "#0a0c10", border: "1px solid #1e2330",
      borderRadius: "10px", padding: "16px", margin: 0,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "13px", lineHeight: "1.7", overflowX: "auto",
    }}>
      {lines.map((line, i) => {
        const isHighlight = highlight.includes(i);
        const isFlash = flash.includes(i);
        return (
          <div key={i} style={{
            padding: "1px 6px", borderRadius: "4px",
            background: isFlash ? "rgba(239,68,68,0.25)" :
                        isHighlight ? "rgba(59,130,246,0.18)" : "transparent",
            borderLeft: isHighlight ? "3px solid #3b82f6" :
                        isFlash ? "3px solid #ef4444" : "3px solid transparent",
            transition: "all 0.3s ease",
          }}>
            <span style={{ color: colorize(line) }} dangerouslySetInnerHTML={{ __html: syntaxColor(line) }} />
          </div>
        );
      })}
    </pre>
  );
}

function colorize() { return "inherit"; }

function syntaxColor(line) {
  return line
    .replace(/\b(public|private|interface|class|extends|implements|void|return|new|import|List|String|Long|int|boolean|null)\b/g,
      '<span style="color:#c792ea">$1</span>')
    .replace(/\b(JpaRepository|GymMemberRepository|GymMember|GymMemberController|Optional)\b/g,
      '<span style="color:#82aaff">$1</span>')
    .replace(/\b(@Autowired|@RestController|@GetMapping|@PostMapping|@DeleteMapping|@PathVariable|@RequestBody|@Id|@GeneratedValue|@Entity)\b/g,
      '<span style="color:#c3e88d">$1</span>')
    .replace(/"[^"]*"/g, '<span style="color:#f78c6c">$&</span>')
    .replace(/\/\/.*/g, '<span style="color:#546e7a;font-style:italic">$&</span>')
    .replace(/\b\d+L?\b/g, '<span style="color:#f78c6c">$&</span>');
}

/* ─────────────────────────────────────────────
   BLANK INPUT
───────────────────────────────────────────── */
function BlankInput({ placeholder, hint, answer, onCorrect, onWrong, play }) {
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  const [attempts, setAttempts] = useState(0);

  const check = () => {
    const v = val.trim().toLowerCase();
    const a = answer.toLowerCase();
    if (v === a) {
      setStatus("correct");
      play("correct");
      onCorrect && onCorrect();
    } else {
      setStatus("wrong");
      setAttempts(p => p + 1);
      play("warn");
      onWrong && onWrong();
      setTimeout(() => setStatus("idle"), 1200);
    }
  };

  const borderCol = status === "correct" ? "#22c55e" : status === "wrong" ? "#ef4444" : "#CBD5E1";
  const glow = status === "correct" ? "0 0 0 3px rgba(34,197,94,0.15)" :
               status === "wrong" ? "0 0 0 3px rgba(239,68,68,0.15)" : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "12px", color: "#64748B" }}>{hint}</div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={val}
          onChange={e => { setVal(e.target.value); setStatus("idle"); }}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder={placeholder}
          disabled={status === "correct"}
          style={{
            flex: 1, background: "#FFFFFF", border: `1.5px solid ${borderCol}`,
            borderRadius: "8px", padding: "9px 14px", color: "#1E293B",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "14px",
            outline: "none", transition: "all 0.2s", boxShadow: glow,
          }}
        />
        {status !== "correct" && (
          <button onClick={check} style={{
            background: "#3B82F6", border: "none", borderRadius: "8px",
            padding: "9px 16px", color: "#fff", cursor: "pointer",
            fontSize: "13px", fontWeight: 700,
          }}>Check</button>
        )}
        {status === "correct" && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            color: "#16A34A", fontSize: "13px", fontWeight: 700, padding: "9px 12px",
          }}>✓ Correct!</div>
        )}
      </div>
      {status === "wrong" && attempts > 1 && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA",
          borderRadius: "8px", padding: "10px 14px", color: "#991B1B", fontSize: "13px",
        }}>
          Hint: the answer is <strong style={{ color: "#DC2626" }}>{answer}</strong>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRUE/FALSE BUTTON PAIR
───────────────────────────────────────────── */
function TrueFalse({ correct, trueMsg, falseMsg, play }) {
  const [picked, setPicked] = useState(null);
  const isTrue = correct === true;

  const pick = (val) => {
    setPicked(val);
    play(val === correct ? "correct" : "warn");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        {["True", "False"].map((label) => {
          const val = label === "True";
          const chosen = picked === val;
          const right = val === correct;
          const color = chosen ? (right ? "#22c55e" : "#ef4444") : "#E2E8F0";
          return (
            <button key={label} onClick={() => pick(val)} disabled={picked !== null} style={{
              flex: 1, padding: "12px", borderRadius: "10px",
              background: chosen ? (right ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "#FFFFFF",
              border: `2px solid ${color}`,
              color: chosen ? (right ? "#16A34A" : "#DC2626") : "#64748B",
              cursor: picked ? "default" : "pointer", fontSize: "15px", fontWeight: 700,
              transition: "all 0.2s",
            }}>{label}</button>
          );
        })}
      </div>
      {picked !== null && (
        <div style={{
          background: picked === correct ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${picked === correct ? "#86EFAC" : "#FECACA"}`,
          borderRadius: "10px", padding: "12px 16px",
          color: picked === correct ? "#166534" : "#991B1B",
          fontSize: "13px", lineHeight: 1.6,
        }}>
          {picked === correct ? (correct === true ? trueMsg : falseMsg) : (correct === true ? falseMsg : trueMsg)}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RIGHT PANEL VISUAL CARD
───────────────────────────────────────────── */
function VisualCard({ children, glow = "#3b82f6" }) {
  return (
    <div style={{
      background: "#FFFFFF", border: `1px solid rgba(${hexToRgb(glow)},0.35)`,
      borderRadius: "14px", padding: "18px",
      boxShadow: `0 2px 10px rgba(${hexToRgb(glow)},0.08)`,
    }}>
      {children}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

/* ═══════════════════════════════════════════
   SLOT 1 - FEEL THE PAIN
═══════════════════════════════════════════ */
function Slot1({ onAdvance, play }) {
  const [restartCount, setRestartCount] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [dataLost, setDataLost] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const doRestart = () => {
    setFlashing(true);
    play("warn");
    setTimeout(() => {
      setDataLost(true);
      setRestartCount(p => p + 1);
      setFlashing(false);
      setShowMsg(true);
    }, 700);
  };

  const listLines = dataLost
    ? ["members = []  // ← everything gone"]
    : [
        "private List<GymMember> members =",
        "    new ArrayList<>();",
        "",
        "// POST → saved here",
        "// Restart → GONE",
      ];

  return (
    <SlotShell
      subtitle="Slot 1 of 6 - Feel the Pain"
      title="One last time - then never again."
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p style={{ color: "#64748B", lineHeight: 1.8, margin: 0 }}>
            Your controller is still using a <code style={{ color: "#A855F7" }}>List</code> to store members.
            Every time the server restarts - data is lost. Watch what happens.
          </p>

          <CodeBlock
            lines={listLines}
            flash={flashing ? [0, 1] : dataLost ? [0] : []}
            highlight={!dataLost && !flashing ? [0, 1] : []}
          />

          {restartCount > 0 && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: "10px", padding: "14px 18px",
              color: "#991B1B", fontSize: "13px", lineHeight: 1.7,
            }}>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
                Data lost {restartCount} time{restartCount > 1 ? "s" : ""} in this module
              </div>
              POST members. Restart. Gone. Every single time.
              <br /><br />
              <strong style={{ color: "#1E293B" }}>One step fixes this forever.</strong>
              <br />
              But first - a two-minute concept you need to understand.
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={doRestart} style={{
              background: "#FEF2F2", border: "1px solid #ef4444",
              borderRadius: "10px", padding: "12px 22px",
              color: "#DC2626", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              transition: "all 0.2s",
            }}>⟳ Restart simulation</button>

            {restartCount > 0 && (
              <button onClick={() => { play("tick"); onAdvance(); }} style={{
                background: "#3B82F6", border: "none",
                borderRadius: "10px", padding: "12px 22px",
                color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              }}>Show me →</button>
            )}
          </div>
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <VisualCard glow="#ef4444">
            <div style={{ fontSize: "12px", color: "#DC2626", fontWeight: 700, marginBottom: "12px", letterSpacing: "1px" }}>YOUR LIST</div>
            <div style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: "8px",
              padding: "14px", fontFamily: "monospace", fontSize: "13px",
              minHeight: "80px", display: "flex", flexDirection: "column", gap: "4px",
              transition: "all 0.4s",
            }}>
              {dataLost ? (
                <div style={{ color: "#F87171" }}>[] - empty</div>
              ) : (
                <>
                  <div style={{ color: "#82aaff" }}>📄 Alice (id: 1)</div>
                  <div style={{ color: "#82aaff" }}>📄 Bob (id: 2)</div>
                  <div style={{ color: "#82aaff" }}>📄 Priya (id: 3)</div>
                </>
              )}
            </div>
            <div style={{
              marginTop: "10px", textAlign: "center",
              color: dataLost ? "#DC2626" : "#64748B", fontSize: "13px", fontWeight: 600,
            }}>
              {dataLost ? "❌ Lost after restart" : "3 members saved"}
            </div>
          </VisualCard>

          <VisualCard glow="#22c55e">
            <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginBottom: "12px", letterSpacing: "1px" }}>AFTER THIS SUBTOPIC</div>
            <div style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: "8px",
              padding: "14px", fontFamily: "monospace", fontSize: "13px",
              minHeight: "80px", opacity: 0.4, filter: "blur(1px)",
              display: "flex", flexDirection: "column", gap: "4px",
            }}>
              <div style={{ color: "#82aaff" }}>📄 Alice (id: 1)</div>
              <div style={{ color: "#82aaff" }}>📄 Bob (id: 2)</div>
              <div style={{ color: "#82aaff" }}>📄 Priya (id: 3)</div>
            </div>
            <div style={{ marginTop: "10px", textAlign: "center", color: "#16A34A", fontSize: "13px", fontWeight: 600 }}>
              ✅ Still there after restart
            </div>
            <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "11px", marginTop: "4px" }}>
              (coming soon)
            </div>
          </VisualCard>

          {restartCount > 0 && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: "10px", padding: "12px 14px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#DC2626" }}>{restartCount}</div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>restart{restartCount > 1 ? "s" : ""} - data gone each time</div>
            </div>
          )}
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   SLOT 2 - INTERFACE
═══════════════════════════════════════════ */
function Slot2({ onAdvance, play }) {
  const [animated, setAnimated] = useState(false);
  const [blankDone, setBlankDone] = useState(false);
  const [tfDone, setTfDone] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [methodsVisible, setMethodsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(t);
  }, []);

  const codeLines = blankDone
    ? [
        "public interface GymMemberRepository {",
        "//       ↑",
        "//       order slip - no code inside",
        "}",
      ]
    : [
        "public [___] GymMemberRepository {",
        "//      ↑",
        "//      what keyword is an order slip?",
        "}",
      ];

  return (
    <SlotShell
      subtitle="Slot 2 of 6 - Interface"
      title="Interface - the order slip"
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Analogy scene */}
          <div style={{
            background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "24px",
          }}>
            <div style={{ fontSize: "13px", color: "#60A5FA", fontWeight: 700, marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>
              The Dhaba Analogy
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "12px", flexWrap: "wrap",
            }}>
              {/* Customer */}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🧑‍💻</div>
                <div style={{ color: "#82aaff", fontWeight: 700, fontSize: "13px" }}>Your Controller</div>
                <div style={{ color: "#94A3B8", fontSize: "11px" }}>gives the slip</div>
              </div>

              {/* Arrow → slip */}
              <div style={{
                flex: 2, textAlign: "center",
                transform: animated ? "translateX(0)" : "translateX(-20px)",
                opacity: animated ? 1 : 0,
                transition: "all 0.6s ease",
              }}>
                <div style={{
                  background: "#0F172A", border: "2px dashed #3b82f6", borderRadius: "10px",
                  padding: "12px 16px", display: "inline-block", textAlign: "left",
                  fontSize: "12px", color: "#c3e88d", fontFamily: "monospace",
                  lineHeight: 1.8,
                }}>
                  <div style={{ color: "#F1F5F9", fontWeight: 700, marginBottom: "6px" }}>📋 ORDER SLIP</div>
                  ● save a member<br/>
                  ● find all members<br/>
                  ● delete a member
                  <div style={{ marginTop: "8px", color: "#94A3B8", fontStyle: "italic", fontSize: "11px" }}>
                    Just a list. No cooking inside.
                  </div>
                </div>
              </div>

              {/* Kitchen */}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🏗️</div>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "13px" }}>Spring Boot</div>
                <div style={{ color: "#94A3B8", fontSize: "11px" }}>writes all the code</div>
                {animated && (
                  <div style={{
                    marginTop: "8px", opacity: methodsVisible ? 1 : 0,
                    transition: "opacity 0.5s",
                    fontSize: "11px", color: "#86efac", lineHeight: 1.7,
                  }}>
                    save() ✓<br/>findAll() ✓<br/>deleteById() ✓
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => { setMethodsVisible(true); play("tick"); }} style={{
              marginTop: "16px", background: "#0F172A", border: "1px solid #334155",
              borderRadius: "8px", padding: "8px 16px", color: "#CBD5E1", cursor: "pointer",
              fontSize: "12px", width: "100%",
            }}>
              ▶ Spring Boot reads the slip and writes the code
            </button>
          </div>

          <div style={{
            background: "#EFF6FF", border: "1px solid #BFDBFE",
            borderRadius: "10px", padding: "14px 18px", color: "#1E40AF", fontSize: "13px", lineHeight: 1.7,
          }}>
            <strong style={{ color: "#1E293B" }}>Interface = order slip.</strong> Lists what exists. No code.
            Spring Boot reads it and writes all the cooking code.
          </div>

          <button onClick={() => { setShowCode(true); play("tick"); }} style={{
            background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "10px",
            padding: "12px 20px", color: "#475569", cursor: "pointer", fontSize: "13px",
            textAlign: "left",
          }}>Now see it in Java →</button>

          {showCode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <CodeBlock lines={codeLines} highlight={blankDone ? [0] : [0]} />

              {!blankDone && (
                <div style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
                }}>
                  <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "10px", lineHeight: 1.6 }}>
                    A class has code inside. This just lists methods. What is the Java keyword?
                  </div>
                  <BlankInput
                    placeholder="interface"
                    hint="the order slip keyword"
                    answer="interface"
                    play={play}
                    onCorrect={() => setBlankDone(true)}
                    onWrong={() => {}}
                  />
                </div>
              )}

              {blankDone && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{
                    background: "#F0FDF4", border: "1px solid #86EFAC",
                    borderRadius: "10px", padding: "12px 16px",
                  }}>
                    <div style={{ color: "#16A34A", fontWeight: 700, marginBottom: "10px" }}>✓ Quick Check</div>
                    <div style={{ color: "#1E293B", fontSize: "14px", marginBottom: "12px" }}>
                      True or false: An interface has code inside its methods.
                    </div>
                    <TrueFalse
                      correct={false}
                      play={play}
                      trueMsg="False - interface has NO code. It is just a list of method names. Spring Boot writes the code."
                      falseMsg="✓ Correct. No code inside. Spring Boot reads the list and fills in all the logic."
                    />
                  </div>
                  <button onClick={() => { play("tick"); onAdvance(); }} style={{
                    background: "#3B82F6", border: "none", borderRadius: "10px",
                    padding: "13px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
                  }}>Next: JpaRepository →</button>
                </div>
              )}
            </div>
          )}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <VisualCard glow="#3b82f6">
            <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, marginBottom: "12px" }}>INTERFACE CONTRACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["save(member)", "findAll()", "findById(id)", "deleteById(id)"].map((m, i) => (
                <div key={i} style={{
                  background: "#1E293B", borderRadius: "8px", padding: "9px 14px",
                  fontSize: "12px", fontFamily: "monospace", color: "#c3e88d",
                  border: "1px solid #334155",
                  opacity: methodsVisible ? 1 : 0.3,
                  transform: methodsVisible ? "translateX(0)" : "translateX(-10px)",
                  transition: `all 0.3s ease ${i * 0.1}s`,
                }}>
                  ✓ {m}
                </div>
              ))}
            </div>
          </VisualCard>

          <VisualCard glow="#c792ea">
            <div style={{ fontSize: "12px", color: "#A855F7", fontWeight: 700, marginBottom: "10px" }}>CLASS vs INTERFACE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: "#F8FAFC", borderRadius: "8px", padding: "10px 14px", border: "1px solid #E2E8F0" }}>
                <div style={{ color: "#A855F7", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Class</div>
                <div style={{ color: "#64748B", fontSize: "12px" }}>Has code. Does the cooking itself.</div>
              </div>
              <div style={{ background: "#EFF6FF", borderRadius: "8px", padding: "10px 14px", border: "1px solid #3b82f6" }}>
                <div style={{ color: "#3b82f6", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Interface</div>
                <div style={{ color: "#64748B", fontSize: "12px" }}>Just the slip. Spring Boot cooks.</div>
              </div>
            </div>
          </VisualCard>
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   SLOT 3 - JpaRepository
═══════════════════════════════════════════ */
function Slot3({ onAdvance, play }) {
  const [reveal1, setReveal1] = useState(false);
  const [reveal2, setReveal2] = useState(false);
  const [blankDone, setBlankDone] = useState(false);

  const codeLines = blankDone
    ? [
        "public interface GymMemberRepository",
        "    extends JpaRepository<GymMember, Long> {",
        "//              ↑           ↑        ↑",
        "//         pre-printed   entity    id type",
        "//         slip          class",
        "}",
        "",
        "// That's the entire file.",
        "// Zero methods written.",
        "// Spring Boot fills them all.",
      ]
    : [
        "public interface GymMemberRepository",
        "    extends [___________]<GymMember, Long> {",
        "//              ↑",
        "//         the pre-printed order slip",
        "}",
      ];

  return (
    <SlotShell
      subtitle="Slot 3 of 6 - JpaRepository"
      title="JpaRepository - the pre-printed slip"
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p style={{ color: "#64748B", lineHeight: 1.8, margin: 0 }}>
            Writing <code style={{ color: "#A855F7" }}>GymMemberRepository</code> from scratch would mean listing every method yourself.
            There's a shortcut: <strong style={{ color: "#1E293B" }}>extend JpaRepository</strong>. It's a pre-printed slip - all common operations already listed.
          </p>

          <div style={{
            background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", color: "#c792ea", fontWeight: 700, marginBottom: "14px" }}>The angle brackets &lt; &gt;</div>
            <div style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.7, marginBottom: "14px" }}>
              JpaRepository needs to know two things - tap each to reveal:
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => { setReveal1(true); play("tick"); }} style={{
                flex: 1, background: reveal1 ? "rgba(130,170,255,0.12)" : "#0F172A",
                border: `1px solid ${reveal1 ? "#82aaff" : "#334155"}`,
                borderRadius: "10px", padding: "14px",
                color: reveal1 ? "#82aaff" : "#94A3B8", cursor: "pointer",
                transition: "all 0.3s", textAlign: "left",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}>GymMember</div>
                {reveal1 && <div style={{ fontSize: "12px", marginTop: "6px", color: "#CBD5E1", lineHeight: 1.5 }}>
                  Which table? Your entity class.<br/>JPA knows to use the gym_member table.
                </div>}
                {!reveal1 && <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>tap to reveal</div>}
              </button>
              <button onClick={() => { setReveal2(true); play("tick"); }} style={{
                flex: 1, background: reveal2 ? "rgba(195,232,141,0.12)" : "#0F172A",
                border: `1px solid ${reveal2 ? "#c3e88d" : "#334155"}`,
                borderRadius: "10px", padding: "14px",
                color: reveal2 ? "#c3e88d" : "#94A3B8", cursor: "pointer",
                transition: "all 0.3s", textAlign: "left",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}>Long</div>
                {reveal2 && <div style={{ fontSize: "12px", marginTop: "6px", color: "#CBD5E1", lineHeight: 1.5 }}>
                  What type is the id? Long.<br/>Matches @Id field in GymMember.
                </div>}
                {!reveal2 && <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>tap to reveal</div>}
              </button>
            </div>
          </div>

          <CodeBlock lines={codeLines} highlight={blankDone ? [1, 2, 3, 4] : [1, 2, 3]} />

          {!blankDone && (
            <div style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
            }}>
              <div style={{ color: "#64748B", fontSize: "13px", marginBottom: "10px" }}>
                The pre-printed slip name - extends what?
              </div>
              <BlankInput
                placeholder="JpaRepository"
                hint="the pre-printed standard slip"
                answer="JpaRepository"
                play={play}
                onCorrect={() => setBlankDone(true)}
              />
            </div>
          )}

          {blankDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "#F0FDF4", border: "1px solid #86EFAC",
                borderRadius: "10px", padding: "14px 18px", color: "#166534", fontSize: "13px", lineHeight: 1.7,
              }}>
                ✓ That's the entire file. Zero methods written. Spring Boot gives you save, findAll, findById, deleteById - all for free.
              </div>
              <button onClick={() => { play("tick"); onAdvance(); }} style={{
                background: "#3B82F6", border: "none", borderRadius: "10px",
                padding: "13px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              }}>Next: @Autowired →</button>
            </div>
          )}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <VisualCard glow="#c792ea">
            <div style={{ fontSize: "12px", color: "#A855F7", fontWeight: 700, marginBottom: "12px" }}>FREE METHODS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                ["save(m)", "Store or update a member"],
                ["findAll()", "Get every member"],
                ["findById(id)", "Get one by id"],
                ["deleteById(id)", "Remove one"],
                ["count()", "How many total?"],
                ["existsById(id)", "Does this id exist?"],
              ].map(([name, desc], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#1E293B", borderRadius: "7px", padding: "8px 12px",
                  border: "1px solid #334155",
                }}>
                  <code style={{ color: "#c3e88d", fontSize: "12px" }}>{name}</code>
                  <span style={{ color: "#94A3B8", fontSize: "11px" }}>{desc}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#64748B", textAlign: "center" }}>
              Zero SQL. Zero methods you write.
            </div>
          </VisualCard>

          <VisualCard glow="#3b82f6">
            <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, marginBottom: "10px" }}>EXTENDS = INHERITANCE</div>
            <div style={{ color: "#64748B", fontSize: "12px", lineHeight: 1.6 }}>
              Your interface gets everything JpaRepository already has. Like inheriting a pre-filled order slip instead of writing from scratch.
            </div>
          </VisualCard>
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   SLOT 4 - @Autowired
═══════════════════════════════════════════ */
function Slot4({ onAdvance, play }) {
  const [showDelivery, setShowDelivery] = useState(false);
  const [blankDone, setBlankDone] = useState(false);

  const codeLines = blankDone
    ? [
        "@RestController",
        "public class GymMemberController {",
        "",
        "    @Autowired",
        "    // ↑ Spring Boot delivers the repository",
        "    // You don't create it. It arrives.",
        "    private GymMemberRepository repo;",
        "",
        "    // repo is ready to use ✓",
        "}",
      ]
    : [
        "@RestController",
        "public class GymMemberController {",
        "",
        "    [_________]",
        "    // ↑ magic delivery keyword",
        "    private GymMemberRepository repo;",
        "}",
      ];

  return (
    <SlotShell
      subtitle="Slot 4 of 6 - @Autowired"
      title="@Autowired - Zomato auto delivery"
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", color: "#f78c6c", fontWeight: 700, marginBottom: "14px" }}>The Zomato Analogy</div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px" }}>🧑‍💻</div>
                <div style={{ color: "#CBD5E1", fontSize: "12px", marginTop: "4px" }}>Your Controller</div>
                <div style={{ color: "#94A3B8", fontSize: "11px" }}>hungry - needs repo</div>
              </div>
              <div style={{
                flex: 1, textAlign: "center",
                transform: showDelivery ? "translateX(0)" : "translateX(-20px)",
                opacity: showDelivery ? 1 : 0,
                transition: "all 0.5s ease",
              }}>
                <div style={{ fontSize: "28px" }}>🛵</div>
                <div style={{ color: "#f78c6c", fontSize: "12px", fontWeight: 700 }}>Spring Boot</div>
                <div style={{ color: "#94A3B8", fontSize: "11px" }}>delivers automatically</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px" }}>📦</div>
                <div style={{ color: "#82aaff", fontSize: "12px", marginTop: "4px" }}>GymMemberRepository</div>
                <div style={{ color: "#94A3B8", fontSize: "11px" }}>hot and ready</div>
              </div>
            </div>
            <button onClick={() => { setShowDelivery(true); play("tick"); }} style={{
              marginTop: "16px", background: "#0F172A", border: "1px solid #334155",
              borderRadius: "8px", padding: "9px 16px", color: "#CBD5E1", cursor: "pointer",
              fontSize: "12px", width: "100%",
            }}>
              ▶ Order arrives!
            </button>
          </div>

          <div style={{
            background: "#FFF7ED", border: "1px solid #FDBA74",
            borderRadius: "10px", padding: "14px 18px", color: "#7C2D12", fontSize: "13px", lineHeight: 1.7,
          }}>
            You don't write <code style={{ color: "#A855F7" }}>new GymMemberRepository()</code>.
            You just write <code style={{ color: "#16A34A" }}>@Autowired</code> and Spring Boot delivers a ready instance.
            No beans. No context. Just: <strong style={{ color: "#1E293B" }}>Spring Boot delivers it.</strong>
          </div>

          <CodeBlock lines={codeLines} highlight={blankDone ? [3, 4, 5] : [3, 4]} />

          {!blankDone && (
            <div style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
            }}>
              <div style={{ color: "#64748B", fontSize: "13px", marginBottom: "10px" }}>
                The Zomato auto-delivery annotation:
              </div>
              <BlankInput
                placeholder="@Autowired"
                hint="starts with @ - Spring Boot delivers the repo"
                answer="@Autowired"
                play={play}
                onCorrect={() => setBlankDone(true)}
              />
            </div>
          )}

          {blankDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "#F0FDF4", border: "1px solid #86EFAC",
                borderRadius: "10px", padding: "14px 18px", color: "#166534", fontSize: "13px", lineHeight: 1.7,
              }}>
                ✓ Spring Boot sees @Autowired and delivers a ready-to-use GymMemberRepository. No new keyword. No setup.
              </div>
              <button onClick={() => { play("tick"); onAdvance(); }} style={{
                background: "#3B82F6", border: "none", borderRadius: "10px",
                padding: "13px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              }}>Next: Replace the List →</button>
            </div>
          )}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <VisualCard glow="#f78c6c">
            <div style={{ fontSize: "12px", color: "#EA580C", fontWeight: 700, marginBottom: "12px" }}>BEFORE @Autowired</div>
            <pre style={{ margin: 0, background: "#1E293B", borderRadius: "8px", padding: "12px", fontFamily: "monospace", fontSize: "12px", color: "#F87171", lineHeight: 1.7 }}>
{`// Can you even create it?
GymMemberRepository repo =
  new GymMemberRepository();
// ❌ No constructor.
// Interface has no new.`}
            </pre>
          </VisualCard>
          <VisualCard glow="#22c55e">
            <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginBottom: "12px" }}>WITH @Autowired</div>
            <pre style={{ margin: 0, background: "#1E293B", borderRadius: "8px", padding: "12px", fontFamily: "monospace", fontSize: "12px", color: "#86efac", lineHeight: 1.7 }}>
{`@Autowired
private GymMemberRepository repo;

// ✓ Spring Boot created it.
// ✓ Delivered here.
// ✓ Ready to use immediately.`}
            </pre>
          </VisualCard>
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   SLOT 5 - REPLACE (Path Variable + Operations)
═══════════════════════════════════════════ */
function Slot5({ onAdvance, play }) {
  const [pathStep, setPathStep] = useState(false);
  const [pathDone, setPathDone] = useState(false);
  const [opsDone, setOpsDone] = useState(false);

  const pathLines = [
    "// BEFORE - id was called memberId:",
    "@DeleteMapping(\"/members/{memberId}\")",
    "public void deleteMember(",
    "    @PathVariable Long memberId) {",
    "    repo.deleteById(memberId);",
    "}",
    "",
    "// AFTER - name matches variable: id",
    "@DeleteMapping(\"/members/{id}\")",
    "public void deleteMember(",
    "    @PathVariable Long id) {",
    "    repo.deleteById(id);",
    "}",
  ];

  const fullController = [
    "@RestController",
    "public class GymMemberController {",
    "",
    "    @Autowired",
    "    private GymMemberRepository repo;",
    "",
    "    @GetMapping(\"/members\")",
    "    public List<GymMember> getAll() {",
    "        return repo.findAll();",
    "    }",
    "",
    "    @PostMapping(\"/members\")",
    "    public GymMember add(",
    "            @RequestBody GymMember m) {",
    "        return repo.save(m);",
    "    }",
    "",
    "    @DeleteMapping(\"/members/{id}\")",
    "    public void delete(",
    "            @PathVariable Long id) {",
    "        repo.deleteById(id);",
    "    }",
    "}",
  ];

  return (
    <SlotShell
      subtitle="Slot 5 of 6 - Replace"
      title="Replace the List - one change at a time"
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Path variable section */}
          <div style={{
            background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", color: "#c3e88d", fontWeight: 700, marginBottom: "12px" }}>
              🔑 Path Variable - name must match
            </div>
            <div style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.7, marginBottom: "14px" }}>
              The name inside <code style={{ color: "#f78c6c" }}>{"{"} {"}"}</code> in the URL <strong style={{ color: "#F1F5F9" }}>must exactly match</strong> the <code style={{ color: "#c3e88d" }}>@PathVariable</code> parameter name.
              This slot covers just that - nothing else.
            </div>

            {!pathStep && (
              <button onClick={() => { setPathStep(true); play("tick"); }} style={{
                background: "#0F172A", border: "1px solid #334155", borderRadius: "8px",
                padding: "10px 16px", color: "#CBD5E1", cursor: "pointer", fontSize: "12px", width: "100%",
              }}>
                ▶ Show me the rename
              </button>
            )}

            {pathStep && (
              <>
                <CodeBlock lines={pathLines} highlight={[1, 2, 3, 8, 9, 10]} />
                <div style={{
                  marginTop: "12px", background: "#0F172A", border: "1px solid #334155",
                  borderRadius: "8px", padding: "12px 14px", color: "#CBD5E1", fontSize: "13px", lineHeight: 1.6,
                }}>
                  <code style={{ color: "#f78c6c" }}>{"{id}"}</code> in the URL ↔ <code style={{ color: "#c3e88d" }}>Long id</code> in the method.
                  They must be the same word. That's it.
                </div>

                {!pathDone && (
                  <div style={{ marginTop: "12px" }}>
                    <TrueFalse
                      correct={false}
                      play={play}
                      trueMsg="Actually false - they must match exactly. {memberId} ↔ Long memberId. {id} ↔ Long id."
                      falseMsg="✓ Correct. The name in {} and the parameter name must be identical. Spring Boot maps them by name."
                    />
                  </div>
                )}

                <button onClick={() => { setPathDone(true); play("tick"); }} style={{
                  marginTop: "12px", background: "#0F172A", border: "1px solid #22c55e",
                  borderRadius: "8px", padding: "10px 16px", color: "#4ADE80",
                  cursor: "pointer", fontSize: "12px", width: "100%",
                }}>
                  Got it - show full controller →
                </button>
              </>
            )}
          </div>

          {pathDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                fontSize: "13px", color: "#3b82f6", fontWeight: 700, marginBottom: "2px",
              }}>Complete Controller - List is gone. MySQL is in.</div>
              <CodeBlock lines={fullController} highlight={[3, 4, 8, 14, 18, 19, 20, 21]} />

              <button onClick={() => { setOpsDone(true); play("add"); onAdvance(); }} style={{
                background: "#3B82F6", border: "none", borderRadius: "10px",
                padding: "13px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              }}>I see it - show me the payoff →</button>
            </div>
          )}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <VisualCard glow="#c3e88d">
            <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginBottom: "12px" }}>WHAT CHANGED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { before: "new ArrayList<>()", after: "@Autowired repo", color: "#82aaff" },
                { before: "members.add(m)", after: "repo.save(m)", color: "#4ADE80" },
                { before: "return members", after: "return repo.findAll()", color: "#4ADE80" },
                { before: "members.remove(i)", after: "repo.deleteById(id)", color: "#4ADE80" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#1E293B", borderRadius: "8px", padding: "9px 12px", border: "1px solid #334155" }}>
                  <div style={{ color: "#F87171", fontSize: "11px", fontFamily: "monospace", textDecoration: "line-through", opacity: 0.7 }}>
                    {item.before}
                  </div>
                  <div style={{ color: item.color, fontSize: "11px", fontFamily: "monospace", marginTop: "3px" }}>
                    → {item.after}
                  </div>
                </div>
              ))}
            </div>
          </VisualCard>

          <VisualCard glow="#3b82f6">
            <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, marginBottom: "10px" }}>ZERO SQL WRITTEN</div>
            <div style={{ color: "#64748B", fontSize: "12px", lineHeight: 1.6 }}>
              Every repo call translates to SQL behind the scenes. You wrote Java. JPA spoke SQL. You never saw it.
            </div>
          </VisualCard>
        </div>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   SLOT 6 - PAYOFF
═══════════════════════════════════════════ */
function Slot6({ play, onAdvance }) {
  const [step, setStep] = useState(0);
  const [particles, setParticles] = useState([]);

  const fireParticles = () => {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      color: ["#22c55e", "#3b82f6", "#c3e88d", "#f78c6c", "#82aaff"][Math.floor(Math.random() * 5)],
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 2000);
  };

  const steps = [
    { label: "POST /members", body: '{"name":"Ravi"}', result: "201 Created - saved to MySQL", color: "#22c55e" },
    { label: "Restart server", body: null, result: "Server came back up", color: "#f78c6c" },
    { label: "GET /members", body: null, result: '[ {"id":1, "name":"Ravi"} ] - STILL THERE ✅', color: "#22c55e" },
  ];

  const advance = () => {
    play(step < 2 ? "tick" : "payoff");
    if (step === 2) fireParticles();
    setStep(s => Math.min(s + 1, 3));
  };

  return (
    <SlotShell
      subtitle="Slot 6 of 6 - Payoff"
      title="You wrote zero SQL - JPA handled it."
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
          {/* Particles */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
            {particles.map(p => (
              <div key={p.id} style={{
                position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                width: "8px", height: "8px", borderRadius: "50%",
                background: p.color, animation: "floatUp 2s ease-out forwards",
              }} />
            ))}
          </div>

          <div style={{
            background: "#F0FDF4", border: "1px solid #86EFAC",
            borderRadius: "14px", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", color: "#16A34A", fontWeight: 700, marginBottom: "16px" }}>
              Proof - watch data survive a restart
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{
                  background: "#1E293B", borderRadius: "10px", padding: "14px",
                  border: `1px solid ${i < step ? s.color : "#334155"}`,
                  opacity: i <= step ? 1 : 0.3,
                  transform: i <= step ? "translateX(0)" : "translateX(-10px)",
                  transition: "all 0.4s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: s.body ? "6px" : 0 }}>
                    <code style={{ color: i < step ? s.color : "#94A3B8", fontSize: "13px", fontWeight: 700 }}>
                      {i < step ? "✓" : `${i + 1}.`} {s.label}
                    </code>
                    {i < step && <span style={{ color: s.color, fontSize: "12px" }}>done</span>}
                  </div>
                  {s.body && i <= step - 1 && (
                    <div style={{ color: "#f78c6c", fontSize: "12px", fontFamily: "monospace", marginBottom: "4px" }}>{s.body}</div>
                  )}
                  {i < step && (
                    <div style={{ color: "#94A3B8", fontSize: "12px", marginTop: "4px" }}>{s.result}</div>
                  )}
                </div>
              ))}
            </div>

            {step < 3 && (
              <button onClick={advance} style={{
                marginTop: "16px", background: "#3B82F6", border: "none",
                borderRadius: "10px", padding: "13px 20px",
                color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700, width: "100%",
              }}>
                {step === 0 ? "▶ Step 1: POST a member" :
                 step === 1 ? "▶ Step 2: Restart server" :
                              "▶ Step 3: GET members again"}
              </button>
            )}

            {step >= 3 && (
              <div style={{
                marginTop: "20px", textAlign: "center",
                background: "#DCFCE7", border: "1px solid #4ADE80",
                borderRadius: "12px", padding: "24px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#16A34A", marginBottom: "8px" }}>
                  Data survived the restart!
                </div>
                <div style={{ color: "#166534", fontSize: "14px", lineHeight: 1.7 }}>
                  You wrote zero SQL.<br/>
                  JPA + MySQL handled every operation.<br/>
                  <strong style={{ color: "#14532D" }}>This is JpaRepository in action.</strong>
                </div>
                <button onClick={() => { play("payoff"); onAdvance(); }} style={{
                  marginTop: "18px", background: "#16A34A", border: "none",
                  borderRadius: "10px", padding: "13px 20px",
                  color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700, width: "100%",
                }}>
                  Do this for YOUR project →
                </button>
              </div>
            )}
          </div>

          {step >= 3 && (
            <div style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "18px",
            }}>
              <div style={{ fontSize: "13px", color: "#F1F5F9", fontWeight: 700, marginBottom: "12px" }}>What you used. What it means.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  ["interface", "Order slip - lists methods, no code"],
                  ["JpaRepository", "Pre-printed slip - all ops included"],
                  ["@Autowired", "Spring Boot delivers the repo for you"],
                  ["{id} ↔ Long id", "Path variable name must match"],
                  ["repo.save()", "INSERT/UPDATE - you wrote zero SQL"],
                  ["repo.findAll()", "SELECT all - you wrote zero SQL"],
                ].map(([term, meaning], i) => (
                  <div key={i} style={{
                    display: "flex", gap: "12px",
                    background: "#0F172A", borderRadius: "8px", padding: "9px 14px",
                    border: "1px solid #334155",
                  }}>
                    <code style={{ color: "#c3e88d", fontSize: "12px", minWidth: "140px" }}>{term}</code>
                    <span style={{ color: "#94A3B8", fontSize: "12px" }}>{meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <VisualCard glow="#22c55e">
            <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginBottom: "12px" }}>MySQL TABLE</div>
            <div style={{
              background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", padding: "12px",
              fontFamily: "monospace", fontSize: "11px", color: "#94A3B8", lineHeight: 2,
            }}>
              <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #334155", paddingBottom: "6px", marginBottom: "6px", color: "#F1F5F9", fontWeight: 700 }}>
                <span style={{ width: "40px" }}>id</span>
                <span>name</span>
              </div>
              {step >= 1 && (
                <div style={{ display: "flex", gap: "20px", color: "#86efac" }}>
                  <span style={{ width: "40px" }}>1</span>
                  <span>Ravi</span>
                </div>
              )}
              {step < 1 && (
                <div style={{ color: "#64748B" }}>- empty -</div>
              )}
            </div>
            <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748B" }}>
              gym_member table - created by JPA
            </div>
          </VisualCard>

          <VisualCard glow="#3b82f6">
            <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, marginBottom: "10px" }}>SERVER LIFECYCLE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {["Boot → connect", "Request → JPA queries MySQL", "Restart → MySQL keeps data", "Boot again → data still there"].map((t, i) => (
                <div key={i} style={{
                  color: i < step ? "#16A34A" : "#94A3B8", fontSize: "12px",
                  display: "flex", gap: "8px", alignItems: "center",
                }}>
                  <span>{i < step ? "✓" : "○"}</span> {t}
                </div>
              ))}
            </div>
          </VisualCard>
        </div>
      }
    />
  );
}

/* ─────────────────────────────────────────────
   SLOT 7 - APPLY TO YOUR PROJECT + SUBMIT
───────────────────────────────────────────── */
const DOMAINS = {
  Gym: { entity: "GymMember", repo: "GymMemberRepository", table: "gym_member" },
  Hotel: { entity: "Room", repo: "RoomRepository", table: "room" },
  Mess: { entity: "MessEntry", repo: "MessEntryRepository", table: "mess_entry" },
  Chai: { entity: "ChaiOrder", repo: "ChaiOrderRepository", table: "chai_order" },
};

function Slot7({ play, onSubmit }) {
  const [domain, setDomain] = useState(null);
  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false, c4: false });
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggle(key) {
    setChecks(c => { const nv = !c[key]; if (nv) play("add"); return { ...c, [key]: nv }; });
  }

  const d = domain ? DOMAINS[domain] : null;
  const allChecked = Object.values(checks).every(Boolean);
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = domain && allChecked && sentences >= 1 && !submitted;

  function handleSubmit() {
    if (!canSubmit) return;
    play("payoff");
    setSubmitted(true);
    onSubmit({ domain, checks, reflection });
  }

  return (
    <SlotShell
      subtitle="Slot 7 of 7 - Apply to your project"
      title="Do this for YOUR project."
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.keys(DOMAINS).map(name => (
              <button key={name} onClick={() => { setDomain(name); play("tick"); }} style={{
                padding: "10px 18px", borderRadius: "20px",
                border: `1.5px solid ${domain === name ? "#3B82F6" : "#E2E8F0"}`,
                background: domain === name ? "#3B82F6" : "#FFFFFF",
                color: domain === name ? "#fff" : "#475569",
                fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
              }}>{name}</button>
            ))}
          </div>

          {d && (
            <>
              <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontWeight: 700, color: "#16A34A", fontSize: "13px", marginBottom: 8 }}>Your repository:</div>
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#166534" }}>
                  public interface {d.repo} extends JpaRepository&lt;{d.entity}, Long&gt; {"{}"}
                </code>
              </div>

              {[
                ["c1", `Created ${d.repo} extending JpaRepository<${d.entity}, Long>`],
                ["c2", `@Autowired ${d.repo} into my controller`],
                ["c3", "Replaced List<> logic with repo.save() / findAll() / findById() / deleteById()"],
                ["c4", "Restarted server and confirmed data survives - it's still in MySQL"],
              ].map(([key, label]) => (
                <label key={key} onClick={() => toggle(key)} style={{
                  display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
                  background: checks[key] ? "rgba(22,163,74,0.08)" : "#FFFFFF",
                  border: `1px solid ${checks[key] ? "#16A34A" : "#E2E8F0"}`,
                  borderRadius: "10px", padding: "12px 14px",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: checks[key] ? "#16A34A" : "transparent",
                    border: `2px solid ${checks[key] ? "#16A34A" : "#CBD5E1"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 900,
                  }}>{checks[key] && "✓"}</div>
                  <span style={{ fontSize: "13px", color: checks[key] ? "#166534" : "#475569", fontWeight: 600 }}>{label}</span>
                </label>
              ))}

              {allChecked && (
                <div style={{ animation: "floatUp 0.01s" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                    In one sentence - why does JpaRepository save you from writing SQL yourself?
                  </div>
                  <textarea
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                    placeholder="JpaRepository saves me from writing SQL because..."
                    style={{
                      width: "100%", minHeight: 80, border: "1.5px solid #E2E8F0",
                      borderRadius: 10, padding: 12, fontFamily: "inherit", fontSize: 13,
                      resize: "vertical", outline: "none",
                    }}
                  />
                  <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: sentences >= 1 ? "#16A34A" : "#94A3B8", marginTop: 4 }}>
                    {sentences} / 1 sentence minimum
                  </div>

                  <button onClick={handleSubmit} disabled={!canSubmit} style={{
                    marginTop: 16, width: "100%", padding: "14px",
                    background: canSubmit ? "#16A34A" : "#CBD5E1",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontWeight: 800, fontSize: 14, cursor: canSubmit ? "pointer" : "not-allowed",
                  }}>
                    {submitted ? "Completed ✅" : "My project uses JpaRepository →"}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 16, padding: 18, background: "#DCFCE7", border: "1px solid #4ADE80", borderRadius: 12, color: "#166534", fontSize: 13, lineHeight: 1.7 }}>
                      <b style={{ color: "#14532D" }}>Persistence complete. 🎉</b><br />
                      Your data survives restarts forever now.<br />
                      Next module - authentication and securing your API.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      }
      right={
        <VisualCard glow="#3b82f6">
          <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, marginBottom: "10px" }}>YOUR STACK</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              ["Domain", domain || "-"],
              ["Entity", d?.entity || "-"],
              ["Repository", d?.repo || "-"],
              ["Table", d?.table || "-"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#94A3B8" }}>{k}</span>
                <span style={{ color: "#1E293B", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </VisualCard>
      }
    />
  );
}

/* ═══════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════ */
export default function JpaRepositoryBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const [slot, setSlot] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [finalPayload, setFinalPayload] = useState(null);
  const play = useSound();

  const advance = () => setSlot(s => Math.min(s + 1, 7));

  function handleFinalSubmit(payload) {
    setFinalPayload(payload);
    setSubmitted(true);
  }

  // Fire HK_RESULT exactly once, gated on `submitted` flipping true - matches
  // the mandated useEffect pattern instead of posting inline from the click
  // handler above.
  useEffect(() => {
    if (!submitted || !finalPayload) return;
    try {
      window.parent.postMessage({
        type: "HK_RESULT",
        version: "1",
        exerciseId: "m3-t3-s4-jpa-repository-builder",
        exerciseType: "interactive",
        status: "completed",
        score: 3, maxScore: 3,
        answers: {
          phase1: { completedAllSlots: true },
          phase2: { domainSelected: finalPayload.domain, checks: finalPayload.checks, reflectionText: finalPayload.reflection },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, "*");
    } catch (e) {}
  }, [submitted, finalPayload]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "#F9FAFB",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#1E293B",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(0); opacity: 0; }
        }
        button:hover { opacity: 0.88; }
      `}</style>

      <ProgressBar active={slot} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        {slot === 1 && <Slot1 onAdvance={advance} play={play} />}
        {slot === 2 && <Slot2 onAdvance={advance} play={play} />}
        {slot === 3 && <Slot3 onAdvance={advance} play={play} />}
        {slot === 4 && <Slot4 onAdvance={advance} play={play} />}
        {slot === 5 && <Slot5 onAdvance={advance} play={play} />}
        {slot === 6 && <Slot6 play={play} onAdvance={advance} />}
        {slot === 7 && <Slot7 play={play} onSubmit={handleFinalSubmit} />}
      </div>
    </div>
  );
}
