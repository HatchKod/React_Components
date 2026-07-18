import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1160px; margin-left: auto; margin-right: auto; }
  .split-layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: stretch; max-width: 1160px; margin: 0 auto; }
  @media(max-width:900px) { .split-layout { grid-template-columns: 1fr; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 24px; margin-bottom: 20px; }
  .card-header { font-size: 1.25rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; }
  .card-sub { color: #64748B; font-size: 0.88rem; margin: 0 0 18px 0; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 10px; padding: 13px 22px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s; width: 100%; text-align: center; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }
  .btn.green:hover { background: #15803D; }
  .btn.red { background: #DC2626; }
  .btn.red:hover { background: #B91C1C; }
  .btn.ghost { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; }

  .step-row { display: flex; gap: 10px; margin: 16px 0; }
  .step-pill { flex: 1; background: #F1F5F9; border-radius: 10px; padding: 12px 10px; text-align: center; font-size: 0.78rem; font-weight: 700; color: #475569; }
  .step-pill .n { display: block; font-size: 1.1rem; margin-bottom: 4px; }

  /* Code comparison */
  .code-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0; }
  @media(max-width:640px) { .code-compare { grid-template-columns: 1fr; } }
  .code-col-title { font-weight: 800; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: #475569; }
  .code-block { background: #0F172A; border-radius: 10px; padding: 14px; font-family: 'Fira Code','Courier New',monospace; font-size: 0.74rem; line-height: 1.75; overflow-x: auto; }
  .code-line { white-space: pre; padding: 1px 6px; border-radius: 4px; color: #94A3B8; }
  .code-line.same { background: rgba(16,185,129,0.16); color: #6EE7B7; font-weight: 600; }
  .code-line.diff { background: rgba(245,158,11,0.16); color: #FCD34D; font-weight: 600; }

  .legend-row { display: flex; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 0.82rem; }
  .legend-item { display: flex; align-items: center; gap: 7px; font-weight: 600; color: #374151; }
  .legend-dot { width: 11px; height: 11px; border-radius: 3px; display: inline-block; flex-shrink: 0; }
  .legend-dot.same { background: #10B981; }
  .legend-dot.diff { background: #F59E0B; }

  .skeleton-block { background: #0F172A; border-radius: 12px; padding: 18px; font-family: monospace; font-size: 0.78rem; color: #94A3B8; line-height: 2; }
  .skeleton-same { color: #6EE7B7; font-weight: 700; }
  .skeleton-url-pill { display: inline-block; padding: 2px 8px; border-radius: 6px; background: rgba(245,158,11,0.18); color: #FCD34D; font-weight: 700; transition: opacity 0.35s ease; }
  .skeleton-caption { text-align: center; margin-top: 14px; font-size: 0.8rem; font-weight: 700; color: #64748B; }

  /* Consultant animation */
  .consultant-visual { position: relative; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 46px 20px 30px; min-height: 210px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; }
  .consultant-node { display: flex; flex-direction: column; align-items: center; width: 96px; z-index: 2; }
  .consultant-icon { font-size: 40px; background: #fff; width: 74px; height: 74px; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; }
  .consultant-label { font-size: 0.76rem; font-weight: 700; margin-top: 8px; color: #475569; text-align: center; }
  .consultant-wire { position: absolute; top: 50%; left: 12%; width: 76%; height: 3px; border-top: 3px dashed #CBD5E1; z-index: 1; transform: translateY(-50%); }
  .envelope { position: absolute; top: 50%; left: 18%; font-size: 26px; transform: translateY(-50%); z-index: 3; animation: envelopeTravel 3.6s ease-in-out infinite; }
  @keyframes envelopeTravel {
    0%   { left: 18%; opacity: 1; transform: translateY(-50%) rotate(0deg); }
    38%  { left: 80%; opacity: 1; transform: translateY(-50%) rotate(0deg); }
    42%  { opacity: 0; }
    50%  { left: 80%; opacity: 0; }
    54%  { opacity: 1; }
    92%  { left: 18%; opacity: 1; transform: translateY(-50%) rotate(180deg); }
    100% { left: 18%; opacity: 1; transform: translateY(-50%) rotate(180deg); }
  }
  .think-dots { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); font-size: 1.3rem; letter-spacing: 3px; opacity: 0; animation: thinkPulse 3.6s ease-in-out infinite; color: #94A3B8; }
  @keyframes thinkPulse { 0%,40% { opacity: 0; } 45%,88% { opacity: 1; } 92%,100% { opacity: 0; } }

  /* Flow diagram (Scene 3) */
  .flow-diagram { background: #0B0F19; border-radius: 16px; padding: 26px 18px; color: #E2E8F0; }
  .flow-title { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #64748B; margin-bottom: 16px; text-align: center; }
  .flow-row { display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 10px; }
  .flow-node { display: flex; flex-direction: column; align-items: center; width: 78px; }
  .flow-icon { font-size: 28px; background: #1E293B; width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #334155; }
  .flow-label { font-size: 0.65rem; margin-top: 6px; text-align: center; color: #94A3B8; font-weight: 700; }
  .flow-arrow-wrap { flex: 1; position: relative; height: 3px; margin: 0 2px 18px; }
  .flow-arrow { height: 3px; width: 100%; }
  .flow-arrow.wrong { background: repeating-linear-gradient(90deg, #EF4444 0 8px, transparent 8px 14px); }
  .flow-arrow.correct { background: #10B981; }
  .flow-arrow.idle { background: #334155; }
  .flow-arrow-label { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.62rem; font-weight: 800; white-space: nowrap; }
  .flow-key { font-size: 20px; }
  .flow-key.exposed { animation: keyFlash 0.7s ease infinite; }
  @keyframes keyFlash { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
  .flow-endpoint-box { margin-top: 14px; background: #1E293B; border: 1px dashed #10B981; border-radius: 10px; padding: 12px 14px; font-family: monospace; font-size: 0.74rem; color: #6EE7B7; text-align: center; animation: popIn 0.4s ease; }
  .flow-status { text-align: center; margin-top: 14px; font-size: 0.78rem; font-weight: 700; }
  .flow-status.wrong { color: #FCA5A5; }
  .flow-status.correct { color: #6EE7B7; }

  /* Domain / feature selector */
  .domain-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 16px; }
  .domain-tab { padding: 10px 16px; border-radius: 10px; border: 2px solid #E2E8F0; background: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
  .domain-tab.active { border-color: #7C3AED; background: linear-gradient(135deg,#F5F3FF,#EDE9FE); color: #5B21B6; }
  .feature-card { display: block; width: 100%; text-align: left; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; font-size: 0.88rem; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.15s; }
  .feature-card:hover { border-color: #7C3AED; background: #F5F3FF; }
  .feature-card.selected { border-color: #16A34A; background: #F0FDF4; color: #14532D; }
  .confirmed-card { background: linear-gradient(180deg,#F0FDF4,#DCFCE7); border: 2px solid #16A34A; border-radius: 14px; padding: 20px; margin-top: 6px; animation: popIn 0.4s ease; }

  .feature-visual-grid { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px; }
  .feature-visual-icon { width: 62px; height: 62px; border-radius: 14px; background: #F8FAFC; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; font-size: 28px; transition: all 0.2s; }
  .feature-visual-icon.active { border-color: #7C3AED; background: #F5F3FF; transform: translateY(-3px); }
  .starburst { text-align: center; font-size: 2.4rem; animation: burst 0.6s ease; margin: 4px 0; }
  @keyframes burst { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  .io-preview { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; font-size: 0.78rem; font-weight: 700; color: #475569; flex-wrap: wrap; }
  .io-box { background: #F1F5F9; border-radius: 8px; padding: 8px 14px; }
  .io-arrow { color: #94A3B8; }

  /* Callouts */
  .callout { border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; font-size: 0.9rem; line-height: 1.8; }
  .callout.info { background: #EFF6FF; border-left: 4px solid #2563EB; color: #1E3A8A; }
  .callout.tip { background: #FFFBEB; border-left: 4px solid #D97706; color: #78350F; }
  .callout.danger { background: #FEF2F2; border-left: 4px solid #DC2626; color: #7F1D1D; }
  .callout.success { background: #F0FDF4; border-left: 4px solid #16A34A; color: #14532D; }
  .callout-title { font-weight: 800; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

  /* Quiz */
  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #1E293B; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; transition: all 0.2s; }
  .opt-btn:hover { border-color: #94A3B8; }
  .opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
`;

function useSounds() {
  const muted = useRef(false);
  const ctxRef = useRef(null);
  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      const makeOsc = (freq, start, dur, wave = "sine") => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      if (type === "correct") { [523, 659, 784].forEach((f, i) => makeOsc(f, i * 0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === "warn") { makeOsc(330, 0, 0.2); makeOsc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === "tick") { makeOsc(800, 0, 0.05, "triangle"); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); }
      else if (type === "reveal") { [523, 659, 784, 1047].forEach((f, i) => makeOsc(f, i * 0.12, 0.2)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6); }
      else if (type === "submit") { makeOsc(392, 0, 0.4); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); }
    } catch (e) {}
  }, []);
  return { play, muted };
}

function Callout({ title, variant = "info", children }) {
  return (
    <div className={`callout ${variant}`}>
      {title && <div className="callout-title">{title}</div>}
      {children}
    </div>
  );
}

// ─── Scene 2 code comparison content ───────────────────────────────────────
const SPRING_LINES = [
  { t: "const response = await fetch(", k: "same" },
  { t: '  "http://localhost:8080/gym/members",', k: "diff" },
  { t: "  {", k: "plain" },
  { t: '    method: "GET",', k: "same" },
  { t: "    headers: {", k: "same" },
  { t: '      "Authorization":', k: "diff" },
  { t: '        "Bearer " + token', k: "diff" },
  { t: "    }", k: "plain" },
  { t: "  }", k: "plain" },
  { t: ");", k: "plain" },
  { t: "const data = await response.json();", k: "same" },
];

const GEMINI_LINES = [
  { t: "const response = await fetch(", k: "same" },
  { t: '  "https://...gemini-pro:generate"', k: "diff" },
  { t: '  + "?key=" + apiKey,', k: "diff" },
  { t: "  {", k: "plain" },
  { t: '    method: "POST",', k: "same" },
  { t: "    headers: {", k: "same" },
  { t: '      "Content-Type":', k: "plain" },
  { t: '        "application/json"', k: "plain" },
  { t: "    },", k: "plain" },
  { t: "    body: JSON.stringify({", k: "diff" },
  { t: "      contents: [{", k: "diff" },
  { t: "        parts: [{", k: "diff" },
  { t: '          text: "your question"', k: "diff" },
  { t: "        }]", k: "diff" },
  { t: "      }]", k: "diff" },
  { t: "    })", k: "diff" },
  { t: "  }", k: "plain" },
  { t: ");", k: "plain" },
  { t: "const data = await response.json();", k: "same" },
];

function CodeBlock({ lines }) {
  return (
    <div className="code-block">
      {lines.map((l, i) => (
        <div key={i} className={`code-line${l.k !== "plain" ? " " + l.k : ""}`}>{l.t}</div>
      ))}
    </div>
  );
}

// ─── Scene 4 domain / feature data ─────────────────────────────────────────
const DOMAINS = {
  gym: {
    icon: "💪", label: "Gym", subject: "a member",
    options: [
      { id: "a", text: "Suggest a workout plan for a member based on their age and current plan" },
      { id: "b", text: "Generate a personalised welcome message for a new member" },
      { id: "c", text: "Recommend if a member should upgrade their plan based on how long they have been on Basic" },
    ],
  },
  hotel: {
    icon: "🏨", label: "Hotel", subject: "a guest",
    options: [
      { id: "a", text: "Write a welcome note for a guest based on their room type and stay" },
      { id: "b", text: "Suggest local attractions for a guest based on their stay duration" },
    ],
  },
  mess: {
    icon: "🍱", label: "Mess", subject: "today's meal",
    options: [
      { id: "a", text: "Suggest tomorrow's menu based on what was served this week" },
      { id: "b", text: "Generate a nutrition summary for today's meal" },
    ],
  },
  chai: {
    icon: "☕", label: "Chai Stall", subject: "a customer",
    options: [
      { id: "a", text: "Generate a thank you message for a regular customer" },
      { id: "b", text: "Suggest a new item to add to the menu based on popular orders" },
    ],
  },
};

// ─── RIGHT VISUAL - Scene 1: consultant ────────────────────────────────────
function ConsultantVisual() {
  return (
    <div className="consultant-visual">
      <div className="think-dots">● ● ●</div>
      <div className="consultant-wire" />
      <div className="envelope">✉️</div>
      <div className="consultant-node">
        <div className="consultant-icon">💻</div>
        <div className="consultant-label">You (React)<br />"suggest a plan"</div>
      </div>
      <div className="consultant-node">
        <div className="consultant-icon" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>🧑‍💼</div>
        <div className="consultant-label">AI Consultant<br />(Gemini)</div>
      </div>
    </div>
  );
}

// ─── RIGHT VISUAL - Scene 2: same skeleton, different destination ─────────
function SkeletonVisual({ toggled }) {
  const url = toggled ? '"...gemini-pro:generate?key=..."' : '"localhost:8080/gym/members"';
  return (
    <div>
      <div className="skeleton-block">
        <div><span className="skeleton-same">await fetch</span>(</div>
        <div>&nbsp;&nbsp;<span className="skeleton-url-pill" key={toggled ? "g" : "s"}>{url}</span>,</div>
        <div>&nbsp;&nbsp;{"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="skeleton-same">method</span>: ...,</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="skeleton-same">headers</span>: {"{"} ... {"}"},</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;body: ... <span style={{ color: "#64748B" }}>// shape differs</span></div>
        <div>&nbsp;&nbsp;{"}"}</div>
        <div>);</div>
        <div><span className="skeleton-same">const data = await response.json();</span></div>
      </div>
      <div className="skeleton-caption">Same skeleton. Different destination.</div>
    </div>
  );
}

// ─── RIGHT VISUAL - Scene 3: flow diagram ──────────────────────────────────
function FlowVisual({ keyState }) {
  const wrong = keyState === 1;
  const correct = keyState === 2;
  return (
    <div className="flow-diagram">
      <div className="flow-title">{wrong ? "❌ Calling Gemini directly from React" : correct ? "✅ Calling Gemini through Spring Boot" : "Waiting..."}</div>

      {keyState !== 2 && (
        <div className="flow-row">
          <div className="flow-node">
            <div className="flow-icon">💻</div>
            <div className="flow-label">React</div>
          </div>
          <div className="flow-arrow-wrap">
            <div className={`flow-arrow-label ${wrong ? "" : ""}`} style={{ color: wrong ? "#FCA5A5" : "#475569" }}>
              {wrong ? "API key visible" : "?"}
            </div>
            <div className={`flow-arrow ${wrong ? "wrong" : "idle"}`} />
          </div>
          <div className="flow-node">
            <div className={`flow-icon flow-key${wrong ? " exposed" : ""}`}>{wrong ? "🔓" : "✨"}</div>
            <div className="flow-label">Gemini</div>
          </div>
        </div>
      )}

      {keyState === 2 && (
        <div className="flow-row">
          <div className="flow-node">
            <div className="flow-icon">💻</div>
            <div className="flow-label">React</div>
          </div>
          <div className="flow-arrow-wrap">
            <div className="flow-arrow-label" style={{ color: "#6EE7B7" }}>safe</div>
            <div className="flow-arrow correct" />
          </div>
          <div className="flow-node">
            <div className="flow-icon">🔒</div>
            <div className="flow-label">Spring Boot</div>
          </div>
          <div className="flow-arrow-wrap">
            <div className="flow-arrow-label" style={{ color: "#6EE7B7" }}>key here</div>
            <div className="flow-arrow correct" />
          </div>
          <div className="flow-node">
            <div className="flow-icon">✨</div>
            <div className="flow-label">Gemini</div>
          </div>
        </div>
      )}

      {wrong && <div className="flow-status wrong">Anyone can open dev tools and steal this key.</div>}
      {correct && <div className="flow-status correct">Your API key never leaves the server.</div>}
      {correct && <div className="flow-endpoint-box">POST /gym/ai/suggest-plan<br />one new endpoint - same pattern</div>}
    </div>
  );
}

// ─── RIGHT VISUAL - Scene 4: feature picker ────────────────────────────────
function FeatureVisual({ domainKey, selected }) {
  const d = DOMAINS[domainKey];
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22, textAlign: "center" }}>
      <div className="feature-visual-grid">
        {Object.entries(DOMAINS).map(([key, dm]) => (
          <div key={key} className={`feature-visual-icon${key === domainKey ? " active" : ""}`}>{dm.icon}</div>
        ))}
      </div>
      {!selected && <div style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600 }}>Pick one {d.label.toLowerCase()} feature and commit.</div>}
      {selected && (
        <>
          <div className="starburst">🎉</div>
          <div style={{ fontWeight: 800, color: "#16A34A", marginBottom: 6 }}>Your AI feature ✅</div>
          <div className="io-preview">
            <div className="io-box">Input: {d.subject}'s details</div>
            <div className="io-arrow">→</div>
            <div className="io-box">Output: AI-generated text</div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AIAPIIntro() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [scene, setScene] = useState(1);

  // Scene 2 - toggling URL destination
  const [urlToggled, setUrlToggled] = useState(false);
  useEffect(() => {
    if (scene !== 2) return;
    const iv = setInterval(() => setUrlToggled((t) => !t), 2200);
    return () => clearInterval(iv);
  }, [scene]);

  // Scene 3 - wrong/correct key demo
  const [keyState, setKeyState] = useState(0); // 0 idle, 1 wrong shown, 2 correct shown
  const showWrong = () => { play("warn"); setKeyState(1); };
  const showCorrect = () => { play("correct"); setKeyState(2); };

  // Scene 4 - domain + feature selection
  const [domainKey, setDomainKey] = useState("gym");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const pickFeature = (opt) => {
    play("correct");
    setSelectedFeature({ domainKey, optionId: opt.id, text: opt.text });
  };

  const goScene = (n) => { play("tick"); setScene(n); };

  // Understanding check
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const answerQ = (val, correctVal, setter, current) => {
    if (current === correctVal) return;
    setter(val);
    if (val === correctVal) play("correct");
    else play("warn");
  };

  const allCorrect = q1 === "B" && q2 === "B" && q3 === "C";
  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const canSubmit = allCorrect && sentences >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    play("submit");
    setSubmitted(true);
  };

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: "HK_RESULT", version: "1",
        exerciseId: "m6-t1-s1-ai-api-intro",
        exerciseType: "interactive",
        status: "completed", score: 3, maxScore: 3,
        answers: {
          phase1: {
            consultantUnderstood: true,
            sideBySeenComparison: true,
            springBootMiddlemanUnderstood: true,
            aiFeatureSelected: selectedFeature ? selectedFeature.text : null,
            q1, q2, q3,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, "*");
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>AI API Intro</h1>
        <button className="btn ghost" style={{ width: "auto", padding: "8px 16px" }} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      <div className="split-layout">
        {/* ── LEFT ── */}
        <div>
          {scene === 1 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">AI is just a very smart consultant</h2>
              <p style={{ color: "#374151" }}>
                This is all an AI API does.<br /><br />
                You send a question (prompt). AI thinks. Answer comes back (response).<br /><br />
                The question goes in the request body. The answer comes in the response.<br /><br />
                You pay a small fee per question. (Gemini has a free tier - you pay nothing for now.)
              </p>
              <div className="step-row">
                <div className="step-pill"><span className="n">1️⃣</span>You write a question</div>
                <div className="step-pill"><span className="n">2️⃣</span>Consultant thinks</div>
                <div className="step-pill"><span className="n">3️⃣</span>Answer comes back</div>
              </div>
              <button className="btn" onClick={() => goScene(2)}>See the code comparison →</button>
            </div>
          )}

          {scene === 2 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Your Spring Boot call vs Gemini call</h2>
              <p className="card-sub">Same pattern. Different URL.</p>

              <div className="code-compare">
                <div>
                  <div className="code-col-title">Your Spring Boot</div>
                  <CodeBlock lines={SPRING_LINES} />
                </div>
                <div>
                  <div className="code-col-title">Gemini AI</div>
                  <CodeBlock lines={GEMINI_LINES} />
                </div>
              </div>

              <div className="legend-row">
                <span className="legend-item"><span className="legend-dot same" /> await fetch() / method / headers / response.json()</span>
                <span className="legend-item"><span className="legend-dot diff" /> URL, body structure, auth (JWT vs API key)</span>
              </div>

              <p style={{ color: "#374151" }}>
                Same pattern. Different URL. Different body structure.<br /><br />
                You know this pattern. You have used it 20 times.<br /><br />
                <b>An AI API is just another endpoint.</b>
              </p>
              <button className="btn" onClick={() => goScene(3)}>Where does the call go? →</button>
            </div>
          )}

          {scene === 3 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Always call AI from Spring Boot - not React</h2>

              <Callout title="Why this matters" variant="tip">
                If you call Gemini from React: anyone who opens your app can see your API key in the browser's developer tools.<br /><br />
                API key = money. Exposed key = someone else uses your money.<br /><br />
                <b>Always keep API keys on the server.</b>
              </Callout>

              {keyState === 0 && (
                <button className="btn red" onClick={showWrong}>See what happens if React calls Gemini directly →</button>
              )}

              {keyState === 1 && (
                <div style={{ animation: "popIn 0.3s" }}>
                  <button className="btn green" onClick={showCorrect}>Now show me the correct way →</button>
                </div>
              )}

              {keyState === 2 && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <p style={{ color: "#374151" }}>
                    Your Spring Boot becomes the middleman.<br /><br />
                    React asks Spring Boot. Spring Boot asks Gemini. Gemini answers Spring Boot. Spring Boot answers React.<br /><br />
                    Your API key never leaves your server.
                  </p>
                  <div className="code-block" style={{ marginBottom: 16 }}>
                    <div className="code-line" style={{ color: "#64748B" }}>// New Spring Boot endpoint:</div>
                    <div className="code-line same">@PostMapping("/gym/ai/suggest-plan")</div>
                    <div className="code-line">public String suggestPlan(</div>
                    <div className="code-line">&nbsp;&nbsp;@RequestBody String memberName</div>
                    <div className="code-line">) {"{"}</div>
                    <div className="code-line" style={{ color: "#64748B" }}>&nbsp;&nbsp;// call Gemini here</div>
                    <div className="code-line" style={{ color: "#64748B" }}>&nbsp;&nbsp;// return AI's answer</div>
                    <div className="code-line">{"}"}</div>
                    <div className="code-line">&nbsp;</div>
                    <div className="code-line" style={{ color: "#64748B" }}>// React calls your endpoint -</div>
                    <div className="code-line" style={{ color: "#64748B" }}>// same as any other call:</div>
                    <div className="code-line same">const response = await fetch(</div>
                    <div className="code-line">&nbsp;&nbsp;"localhost:8080/gym/ai/suggest-plan",</div>
                    <div className="code-line">&nbsp;&nbsp;{"{"} method: "POST", ... {"}"}</div>
                    <div className="code-line">);</div>
                  </div>
                  <button className="btn" onClick={() => goScene(4)}>Pick your AI feature →</button>
                </div>
              )}
            </div>
          )}

          {scene === 4 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">One feature that makes the owner say wow</h2>

              <Callout title="What makes a good AI feature" variant="info">
                ✅ Solves a real problem the owner actually has<br />
                ✅ Cannot be done with simple if/else<br />
                ✅ Small enough to build in one session<br />
                ✅ Impressive when it works
              </Callout>

              <div className="domain-tabs">
                {Object.entries(DOMAINS).map(([key, d]) => (
                  <button
                    key={key}
                    className={`domain-tab${domainKey === key ? " active" : ""}`}
                    onClick={() => { play("tick"); setDomainKey(key); }}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>

              {DOMAINS[domainKey].options.map((opt) => (
                <button
                  key={opt.id}
                  className={`feature-card${selectedFeature?.domainKey === domainKey && selectedFeature?.optionId === opt.id ? " selected" : ""}`}
                  onClick={() => pickFeature(opt)}
                >
                  {opt.text} {selectedFeature?.domainKey === domainKey && selectedFeature?.optionId === opt.id ? "✅" : ""}
                </button>
              ))}

              {selectedFeature && (
                <div className="confirmed-card">
                  <b>✅ Your AI feature:</b><br />
                  {selectedFeature.text}
                  <p style={{ marginTop: 14, marginBottom: 0 }}>
                    This is what you will build in 6.1.3.<br />
                    One Spring Boot endpoint. One Gemini call. One impressive result.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── UNDERSTANDING CHECK - stays in the left column so the right visual keeps its sticky anchor ── */}
          {selectedFeature && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Understanding check</h2>

              <div className="q-card">
                <p className="q-title">Q1: Where should you make the Gemini API call from?</p>
                {[
                  ["A", "React component - faster to build"],
                  ["B", "Spring Boot endpoint - API key stays safe on server"],
                  ["C", "MySQL stored procedure"],
                  ["D", "GitHub Actions"],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q1 === k ? (k === "B" ? " correct" : " wrong") : ""}`} onClick={() => answerQ(k, "B", setQ1, q1)}>{k}) {label}</button>
                ))}
                {q1 && q1 !== "B" && <div style={{ color: "#B45309", fontSize: "0.82rem", marginTop: 6 }}>Always from Spring Boot. API key must never be in React code.</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q2: An AI API call uses which of these?</p>
                {[
                  ["A", "A completely different technology from fetch"],
                  ["B", "The same fetch/async/await pattern you already know"],
                  ["C", "WebSockets only"],
                  ["D", "MySQL queries"],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q2 === k ? (k === "B" ? " correct" : " wrong") : ""}`} onClick={() => answerQ(k, "B", setQ2, q2)}>{k}) {label}</button>
                ))}
              </div>

              <div className="q-card">
                <p className="q-title">Q3: What is a "prompt" in the context of an AI API?</p>
                {[
                  ["A", "A Spring Boot annotation"],
                  ["B", "A MySQL query"],
                  ["C", "The question or instruction you send to the AI"],
                  ["D", "The API key"],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q3 === k ? (k === "C" ? " correct" : " wrong") : ""}`} onClick={() => answerQ(k, "C", setQ3, q3)}>{k}) {label}</button>
                ))}
              </div>

              {allCorrect && (
                <>
                  <h4 style={{ margin: "20px 0 8px" }}>Reflection</h4>
                  <p style={{ color: "#64748B", fontSize: "0.9rem", margin: "0 0 8px" }}>
                    In one sentence - using the consultant analogy, explain what an AI API does.
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="An AI API is like a consultant you send a question (prompt) to in a REST call, and they send back an answer in the response using the same fetch/async/await pattern I already know..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 1 ? " ok" : ""}`}>{sentences} / 1 sentence minimum</div>

                  <button className="btn green" style={{ marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? "Submitted ✅" : "I understand AI APIs - pick my feature and build →"}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 16, padding: 16, background: "#F0FDF4", borderRadius: 8, color: "#065F46", textAlign: "center" }}>
                      <b>AI is just a REST call. 🤖</b><br /><br />
                      Same pattern you know. Different URL.<br /><br />
                      Next - 6.1.2. Get your Gemini API key. Understand the exact request and response format.<br /><br />
                      Then 6.1.3 - build it.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT - sticky visual, spans the full height of the left column (scenes + quiz) ── */}
        <div>
          <div style={{ position: "sticky", top: 24 }}>
            {scene === 1 && <ConsultantVisual />}
            {scene === 2 && <SkeletonVisual toggled={urlToggled} />}
            {scene === 3 && <FlowVisual keyState={keyState} />}
            {scene === 4 && <FeatureVisual domainKey={domainKey} selected={!!selectedFeature} />}
          </div>
        </div>
      </div>
    </div>
  );
}
