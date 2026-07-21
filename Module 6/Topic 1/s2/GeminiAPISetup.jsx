import { useState, useEffect, useRef, useCallback } from "react";

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1160px; margin-left: auto; margin-right: auto; }

  /* Progress bar */
  .progress-wrap { max-width: 1160px; margin: 0 auto 24px; position: relative; }
  .progress-track { position: absolute; top: 18px; left: 18px; right: 18px; height: 4px; background: #E2E8F0; border-radius: 2px; }
  .progress-fill { position: absolute; top: 18px; left: 18px; height: 4px; border-radius: 2px; background: linear-gradient(90deg,#7C3AED,#2563EB); transition: width 0.4s ease; }
  .progress-steps { display: flex; justify-content: space-between; position: relative; }
  .progress-step { display: flex; flex-direction: column; align-items: center; flex: 1 1 0; min-width: 0; }
  .progress-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; background: #F1F5F9; color: #94A3B8; border: 3px solid transparent; transition: all 0.3s ease; z-index: 1; }
  .progress-dot.active { background: linear-gradient(135deg,#7C3AED,#2563EB); color: #fff; border-color: #DDD6FE; box-shadow: 0 4px 14px rgba(124,58,237,0.35); }
  .progress-dot.done { background: #10B981; color: #fff; }
  .progress-step-label { margin-top: 6px; font-size: 0.68rem; font-weight: 700; text-align: center; color: #94A3B8; }
  .progress-step-label.on { color: #1E293B; }

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
  .btn.ghost { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; }

  .step-list { counter-reset: step; margin: 14px 0; }
  .step-item { display: flex; gap: 12px; margin-bottom: 14px; }
  .step-num { flex: 0 0 28px; height: 28px; border-radius: 50%; background: #EEF2FF; color: #4338CA; font-weight: 800; font-size: 0.82rem; display: flex; align-items: center; justify-content: center; }
  .step-body { flex: 1; font-size: 0.9rem; color: #374151; }
  .step-body b { color: #1E293B; }
  .step-body a { color: #2563EB; font-weight: 700; word-break: break-all; }

  .code-block { background: #0F172A; border-radius: 10px; padding: 14px; font-family: 'Fira Code','Courier New',monospace; font-size: 0.76rem; line-height: 1.75; overflow-x: auto; }
  .code-line { white-space: pre; padding: 1px 6px; border-radius: 4px; color: #94A3B8; }
  .code-line.same { background: rgba(16,185,129,0.16); color: #6EE7B7; font-weight: 700; }
  .code-line.blank { background: rgba(245,158,11,0.16); color: #FCD34D; font-weight: 700; }

  .blank-input { background: #1E293B; color: #FCD34D; border: 1.5px dashed #F59E0B; border-radius: 6px; padding: 3px 8px; font-family: monospace; font-size: 0.78rem; outline: none; width: 90px; }
  .blank-input.correct { background: #134E4A; color: #6EE7B7; border-color: #10B981; border-style: solid; }
  .blank-hint { font-size: 0.78rem; color: #64748B; margin-top: 8px; }
  .blank-wrong { color: #B45309; font-size: 0.8rem; margin-top: 8px; font-weight: 600; }

  .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; font-size: 0.9rem; color: #374151; cursor: pointer; }
  .checklist-item input { margin-top: 3px; width: 16px; height: 16px; flex-shrink: 0; }

  .callout { border-radius: 12px; padding: 16px 18px; margin: 14px 0; font-size: 0.88rem; line-height: 1.8; }
  .callout.info { background: #EFF6FF; border-left: 4px solid #2563EB; color: #1E3A8A; }
  .callout.tip { background: #FFFBEB; border-left: 4px solid #D97706; color: #78350F; }
  .callout.success { background: #F0FDF4; border-left: 4px solid #16A34A; color: #14532D; }
  .callout-title { font-weight: 800; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

  .key-input-row { display: flex; align-items: center; gap: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; margin: 12px 0; }
  .key-input-row input { flex: 1; border: none; background: transparent; outline: none; font-family: monospace; font-size: 0.85rem; }
  .not-sent-badge { font-size: 0.76rem; color: #166534; background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 8px 12px; margin: -6px 0 12px; animation: slideIn 0.3s; }

  /* Nesting visual (Slot 2 right) */
  .nest-box { background: linear-gradient(180deg,#B45309,#92400E); border-radius: 14px; padding: 22px; cursor: pointer; color: #FFFBEB; text-align: center; transition: all 0.2s; }
  .nest-box-label { font-weight: 800; font-size: 0.9rem; margin-bottom: 4px; }
  .nest-box-sub { font-size: 0.72rem; opacity: 0.85; }
  .nest-envelope { background: #fff; border: 2px dashed #B45309; border-radius: 10px; padding: 18px; margin-top: 14px; cursor: pointer; text-align: center; color: #92400E; transition: all 0.2s; }
  .nest-envelope-label { font-weight: 800; font-size: 0.85rem; margin-bottom: 4px; }
  .nest-letter { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px; margin-top: 12px; font-family: monospace; font-size: 0.78rem; color: #78350F; }
  .nest-hint { text-align: center; font-size: 0.74rem; color: #94A3B8; margin-top: 10px; }

  /* Request/response stacked (Slot 3 right) */
  .req-res-box { background: #0F172A; border-radius: 10px; padding: 14px; font-family: monospace; font-size: 0.75rem; color: #94A3B8; line-height: 1.8; }
  .req-res-title { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; margin-bottom: 8px; text-align: center; }

  /* Vague vs specific (Slot 4 right) */
  .compare-col { border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .compare-col.vague { background: #F1F5F9; border: 1.5px solid #CBD5E1; }
  .compare-col.specific { background: #F0FDF4; border: 1.5px solid #86EFAC; }
  .compare-label { font-weight: 800; font-size: 0.78rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  .compare-col.vague .compare-label { color: #64748B; }
  .compare-col.specific .compare-label { color: #15803D; }
  .compare-prompt { font-family: monospace; font-size: 0.76rem; background: rgba(0,0,0,0.04); border-radius: 8px; padding: 10px; margin-bottom: 10px; }
  .compare-response { font-size: 0.8rem; line-height: 1.6; }
  .compare-col.vague .compare-response { color: #64748B; font-style: italic; }
  .compare-col.specific .compare-response { color: #14532D; }
  .compare-verdict { text-align: center; font-size: 0.78rem; font-weight: 700; margin-top: 6px; }

  /* Slot 1 right: MakerSuite + properties mockup */
  .mock-browser { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(15,23,42,0.08); background: #fff; }
  .mock-browser-bar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: linear-gradient(180deg,#F1F5F9,#E2E8F0); border-bottom: 1px solid #E2E8F0; }
  .mock-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .mock-url { margin-left: 8px; font-size: 10px; color: #64748B; background: #fff; border: 1px solid #E2E8F0; border-radius: 6px; padding: 2px 10px; flex: 1; }
  .mock-body { padding: 20px; text-align: center; }

  .props-file { background: #0F172A; border-radius: 10px; padding: 14px; margin-top: 14px; font-family: monospace; font-size: 0.78rem; color: #6EE7B7; }
  .props-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: rgba(16,185,129,0.14); border: 1px solid rgba(16,185,129,0.4); color: #16A34A; font-size: 0.72rem; font-weight: 700; padding: 5px 12px; border-radius: 20px; }

  /* Domain prompt builder */
  .domain-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 16px; }
  .domain-tab { padding: 9px 14px; border-radius: 10px; border: 2px solid #E2E8F0; background: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
  .domain-tab.active { border-color: #7C3AED; background: linear-gradient(135deg,#F5F3FF,#EDE9FE); color: #5B21B6; }
  .builder-blank { display: inline-block; min-width: 90px; border: none; border-bottom: 2px solid #7C3AED; background: #F5F3FF; color: #5B21B6; font-weight: 700; font-family: monospace; font-size: 0.85rem; padding: 2px 6px; outline: none; margin: 0 2px; }
  .builder-preview { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px; margin-top: 14px; font-family: monospace; font-size: 0.82rem; line-height: 1.8; }
  .builder-preview .filled { color: #6EE7B7; font-weight: 700; }
  .builder-preview .empty { color: #64748B; font-style: italic; }

  .postman-card { background: #0F172A; border-radius: 12px; padding: 16px; margin-top: 4px; }
  .postman-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .postman-method { background: #16A34A; color: #fff; font-weight: 800; font-size: 0.68rem; padding: 3px 10px; border-radius: 6px; }
  .postman-url { font-family: monospace; font-size: 0.7rem; color: #94A3B8; word-break: break-all; }
  .postman-section-label { color: #64748B; font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin: 10px 0 6px; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin-top: 6px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.92rem; animation: slideIn 0.4s ease; }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  /* Right-panel visual polish */
  .viz-panel { background: #fff; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 20px; }
  .viz-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #64748B; margin-bottom: 14px; text-align: center; }

  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.35); } 50% { box-shadow: 0 0 0 9px rgba(37,99,235,0); } }
  .mock-create-btn { animation: pulseGlow 2s ease-in-out infinite; transition: all 0.2s; }
  .mock-create-btn.done { animation: none; background: #16A34A !important; }
  .key-reveal { animation: popIn 0.35s ease; }

  .nest-box:hover, .nest-envelope:hover { transform: scale(1.015); }
  .nest-box:active, .nest-envelope:active { transform: scale(0.98); }
  .nest-box, .nest-envelope { transition: transform 0.15s ease; }
  .nest-path { text-align: center; font-family: monospace; font-size: 0.8rem; margin-top: 12px; color: #CBD5E1; }
  .nest-path-seg { color: #4338CA; font-weight: 700; }
  .nest-path-seg.gold { color: #F59E0B; font-weight: 800; }

  .req-res-connector { position: relative; height: 44px; display: flex; align-items: center; justify-content: center; margin: 4px 0; }
  .req-res-connector-line { position: absolute; left: 4px; right: 4px; top: 50%; height: 2px; background: repeating-linear-gradient(90deg,#CBD5E1 0 6px, transparent 6px 11px); transform: translateY(-50%); }
  .req-res-connector-dot { position: absolute; top: 50%; width: 7px; height: 7px; border-radius: 50%; background: #2563EB; transform: translateY(-50%); animation: dotTravel 2.4s ease-in-out infinite; }
  @keyframes dotTravel { 0% { left: 4px; opacity: 0; } 8% { opacity: 1; } 46% { left: calc(50% - 16px); opacity: 1; } 50% { opacity: 0; } 54% { left: calc(50% + 16px); opacity: 0; } 62% { opacity: 1; } 100% { left: calc(100% - 10px); opacity: 0; } }
  .req-res-spark { position: relative; z-index: 2; background: #fff; padding: 0 10px; font-size: 24px; animation: sparkPulse 1.8s ease-in-out infinite; }
  @keyframes sparkPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
  .match-key { display: inline-block; animation: matchGlow 2s ease-in-out infinite; border-radius: 3px; }
  @keyframes matchGlow { 0%,100% { text-shadow: 0 0 0 rgba(110,231,183,0); } 50% { text-shadow: 0 0 8px rgba(110,231,183,0.75); } }

  .viz-vs-badge { width: 32px; height: 32px; border-radius: 50%; background: #1E293B; color: #fff; font-size: 0.66rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: -18px auto -18px; position: relative; z-index: 2; box-shadow: 0 2px 6px rgba(0,0,0,0.18); }
  .compare-col.vague { animation: shakeSoft 0.5s ease 0.1s both; }
  .compare-col.specific { animation: slideIn 0.4s ease 0.2s both, winGlow 2.4s ease-in-out 0.7s infinite; }
  @keyframes shakeSoft { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  @keyframes winGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.14); } }

  .rule-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 700; padding: 5px 10px; border-radius: 20px; background: #F1F5F9; color: #94A3B8; margin: 3px 4px 3px 0; transition: all 0.25s ease; }
  .rule-chip.on { background: rgba(16,185,129,0.14); color: #16A34A; animation: popIn 0.3s ease; }
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
      if (type === "add") { makeOsc(220, 0, 0.08); makeOsc(440, 0.07, 0.08); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); }
      else if (type === "correct") { [523, 659, 784].forEach((f, i) => makeOsc(f, i * 0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
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

const PROGRESS_STEPS = ["API Key", "Request Format", "Response Format", "Design Prompt"];

function ProgressBar({ slot }) {
  const pct = Math.max(0, Math.min(100, ((slot - 1) / (PROGRESS_STEPS.length - 1)) * 100));
  return (
    <div className="progress-wrap">
      <div className="progress-track" />
      <div className="progress-fill" style={{ width: `calc(${pct}% - ${pct === 0 ? 0 : 36 * (pct / 100)}px)` }} />
      <div className="progress-steps">
        {PROGRESS_STEPS.map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < slot;
          const active = stepNum === slot;
          return (
            <div className="progress-step" key={label}>
              <div className={`progress-dot${done ? " done" : active ? " active" : ""}`}>{done ? "✓" : stepNum}</div>
              <div className={`progress-step-label${done || active ? " on" : ""}`}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Domain prompt templates (Slot 4) ──────────────────────────────────────
const DOMAINS = {
  gym: {
    icon: "💪", label: "Gym",
    role: "You are a friendly fitness coach.",
    fields: [
      { key: "workout", placeholder: "simple 3-exercise" },
      { key: "age", placeholder: "21" },
      { key: "plan", placeholder: "Basic" },
      { key: "words", placeholder: "60" },
    ],
    build: (v) => `You are a friendly fitness coach. Suggest a ${v.workout || "[workout type]"} workout plan for a ${v.age || "[age]"}-year-old gym member on the ${v.plan || "[plan]"} plan. Keep it encouraging and under ${v.words || "[word limit]"} words.`,
  },
  hotel: {
    icon: "🏨", label: "Hotel",
    role: "You are a friendly concierge.",
    fields: [
      { key: "room", placeholder: "Deluxe" },
      { key: "nights", placeholder: "3" },
      { key: "words", placeholder: "50" },
    ],
    build: (v) => `You are a friendly concierge. Write a welcome note for a guest in a ${v.room || "[room type]"} room staying for ${v.nights || "[nights]"} nights. Warm, professional, under ${v.words || "[word limit]"} words.`,
  },
  mess: {
    icon: "🍱", label: "Mess",
    role: "You are a nutritionist.",
    fields: [
      { key: "meal", placeholder: "Dal Rice Sambar" },
      { key: "words", placeholder: "40" },
    ],
    build: (v) => `You are a nutritionist. Suggest tomorrow's mess menu based on today's meal: ${v.meal || "[today's meal]"}. Balanced, student-friendly, under ${v.words || "[word limit]"} words.`,
  },
  chai: {
    icon: "☕", label: "Chai Stall",
    role: "You are a friendly tea shop owner.",
    fields: [
      { key: "order", placeholder: "2x Cutting Chai" },
    ],
    build: (v) => `You are a friendly tea shop owner. Write a thank you note for a customer who ordered ${v.order || "[order]"}. Warm, brief, under 30 words.`,
  },
};

export default function GeminiAPISetup() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1); // 1 = guided slots, 2 = free project
  const [slot, setSlot] = useState(1);

  // Slot 1 - API key
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keyAdded, setKeyAdded] = useState(false);

  // Slot 2 - request format blank
  const [reqBlank, setReqBlank] = useState("");
  const [reqBlankChecked, setReqBlankChecked] = useState(false);
  const reqCorrect = reqBlank.trim().replace(/"/g, "") === "text";
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [requestUnderstood, setRequestUnderstood] = useState(false);

  // Slot 3 - response format blank
  const [resBlank, setResBlank] = useState("");
  const [resBlankChecked, setResBlankChecked] = useState(false);
  const resCorrect = resBlank.trim().replace(/"/g, "") === "text";
  const [responseUnderstood, setResponseUnderstood] = useState(false);

  // Slot 4 - domain prompt builder
  const [domainKey, setDomainKey] = useState("gym");
  const [fieldValues, setFieldValues] = useState({});
  const domain = DOMAINS[domainKey];
  const allFieldsFilled = domain.fields.every((f) => (fieldValues[f.key] || "").trim().length > 0);
  const generatedPrompt = domain.build(fieldValues);
  const [postmanTested, setPostmanTested] = useState(false);
  const promptComplete = allFieldsFilled && postmanTested;

  const setField = (key, value) => setFieldValues((v) => ({ ...v, [key]: value }));

  const checkReqBlank = () => {
    if (reqCorrect) { setReqBlankChecked(true); play("add"); }
    else play("warn");
  };
  const checkResBlank = () => {
    if (resCorrect) { setResBlankChecked(true); play("add"); }
    else play("warn");
  };

  const goSlot = (n) => { play("tick"); setSlot(n); };

  // Reveal sequence (phase 1 complete)
  const [revealed, setRevealed] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  const triggerReveal = () => {
    play("correct");
    setRevealed(true);
    if (revealFiredRef.current) return;
    revealFiredRef.current = true;
    play("reveal");
    let c = 0;
    const iv = setInterval(() => {
      c += 1;
      setRevealCount(c);
      if (c < 6) play("tick");
      if (c >= 6) clearInterval(iv);
    }, 450);
  };

  const goPhase2 = () => { play("tick"); setPhase(2); };

  // Phase 2 - free project
  const [task1, setTask1] = useState([false, false, false]);
  const [task2, setTask2] = useState([false, false]);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [task4, setTask4] = useState([false, false, false]);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTask = (setter, idx) => setter((arr) => {
    const next = [...arr];
    next[idx] = !next[idx];
    play(next[idx] ? "add" : "tick");
    return next;
  });

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const canSubmit = task1.every(Boolean) && task2.every(Boolean) && finalPrompt.trim().length > 0 && task4.every(Boolean) && sentences >= 1;

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
        exerciseId: "m6-t1-s2-gemini-api-setup",
        exerciseType: "interactive",
        status: "completed", score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { apiKeyAdded: keyAdded },
            slot2: { textBlank: '"text"' },
            slot3: { responseTextBlank: "text", candidatesUnderstood: responseUnderstood },
            slot4: { promptWritten: generatedPrompt, testedInPostman: postmanTested },
          },
          phase2: {
            apiKeyCreated: task1.every(Boolean),
            formatUnderstood: task2.every(Boolean),
            promptFinal: finalPrompt,
            testedInPostman: task4.every(Boolean),
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
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Gemini API Setup</h1>
        <button className="btn ghost" style={{ width: "auto", padding: "8px 16px" }} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      {phase === 1 && <ProgressBar slot={slot} />}

      <div className="split-layout">
        {/* ── LEFT ── */}
        <div>
          {phase === 1 && slot === 1 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Step 1 - Get your Gemini key</h2>

              <div className="step-list">
                <div className="step-item">
                  <div className="step-num">1</div>
                  <div className="step-body">Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer">makersuite.google.com/app/apikey</a></div>
                </div>
                <div className="step-item">
                  <div className="step-num">2</div>
                  <div className="step-body">Sign in with your Google account. The same account you use for Gmail or YouTube.</div>
                </div>
                <div className="step-item">
                  <div className="step-num">3</div>
                  <div className="step-body">Click <b>"Create API Key"</b>. Select "Create in new project" OR select an existing project, then click Create API key in existing project.</div>
                </div>
                <div className="step-item">
                  <div className="step-num">4</div>
                  <div className="step-body">Your key looks like <b>AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx</b>. Copy it. Do not close the tab yet.</div>
                </div>
              </div>

              <div className="code-block">
                <div className="code-line" style={{ color: "#64748B" }}>// Add to application.properties:</div>
                <div className="code-line same">gemini.api.key=AIzaSyD-xxxxxxxx...</div>
              </div>

              <Callout title="Security reminder" variant="tip">
                ⚠️ application.properties must be in .gitignore.<br /><br />
                Your Gemini key = money. If pushed to GitHub, someone can use it.<br /><br />
                Check .gitignore has: <b>application.properties</b>
              </Callout>

              <div className="code-block">
                <div className="code-line same">@Value("$&#123;gemini.api.key&#125;")</div>
                <div className="code-line">private String geminiApiKey;</div>
                <div className="code-line" style={{ color: "#64748B" }}>// same @Value pattern you used for JWT config</div>
              </div>
              <p style={{ color: "#374151", fontSize: "0.88rem" }}>You have used @Value before. Same pattern. Different property.</p>

              <div className="key-input-row">
                <span style={{ fontSize: 18 }}>🔑</span>
                <input
                  type="password"
                  placeholder="AIzaSyD-... (stays in your browser only)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              {apiKeyInput.length > 0 && (
                <div className="not-sent-badge">
                  🔒 Not sent anywhere - this field has no submit action, no network request. It's here so you can practice the exact string you'll paste into application.properties, nothing more.
                </div>
              )}

              <label className="checklist-item">
                <input type="checkbox" checked={keyAdded} onChange={() => { setKeyAdded(!keyAdded); play("add"); }} />
                ✅ API key created and added to application.properties
              </label>

              <button className="btn" style={{ marginTop: 12, opacity: keyAdded ? 1 : 0.5 }} disabled={!keyAdded} onClick={() => goSlot(2)}>
                Next - request format →
              </button>
            </div>
          )}

          {phase === 1 && slot === 2 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">What to send - the request format</h2>

              <Callout title="The letter-in-envelope-in-box analogy" variant="info">
                📦 The box = <code>contents</code> array<br />
                ✉️ The envelope = the message object<br />
                📝 The letter = <code>text</code> (your prompt)<br /><br />
                contents is the box. The message object is the envelope. text is the letter inside.
              </Callout>

              <div className="code-block">
                <div className="code-line">&#123;</div>
                <div className="code-line">&nbsp;&nbsp;"contents": [</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"parts": [</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
                <div className="code-line" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <input
                    className={`blank-input${reqBlankChecked ? " correct" : ""}`}
                    placeholder='"text"'
                    value={reqBlank}
                    disabled={reqBlankChecked}
                    onChange={(e) => setReqBlank(e.target.value)}
                  />
                  : "your prompt here"
                </div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                <div className="code-line">&nbsp;&nbsp;]</div>
                <div className="code-line">&#125;</div>
              </div>
              <div className="blank-hint">The actual prompt text goes in which key? (the innermost key - where your question lives)</div>
              {!reqBlankChecked && (
                <button className="btn ghost" style={{ marginTop: 10 }} onClick={checkReqBlank}>Check</button>
              )}
              {reqBlank && !reqCorrect && !reqBlankChecked && (
                <div className="blank-wrong">The key is "text". contents[0].parts[0].text = your prompt.</div>
              )}

              {reqBlankChecked && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.82rem", color: "#4338CA", fontWeight: 700, margin: "16px 0" }}>
                    contents → [0] → parts → [0] → text
                  </div>
                  <p style={{ color: "#64748B", fontSize: "0.85rem", textAlign: "center" }}>Your prompt goes here ↑</p>

                  <div className="code-block">
                    <div className="code-line" style={{ color: "#64748B" }}>// GYM example:</div>
                    <div className="code-line same">"text": "You are a friendly fitness coach. Suggest a</div>
                    <div className="code-line same">simple workout for a 21-year-old on a Basic plan.</div>
                    <div className="code-line same">Under 50 words."</div>
                  </div>

                  <label className="checklist-item">
                    <input type="checkbox" checked={requestUnderstood} onChange={() => { setRequestUnderstood(!requestUnderstood); play("add"); }} />
                    ✅ Request format understood
                  </label>

                  <button className="btn" style={{ marginTop: 12, opacity: requestUnderstood ? 1 : 0.5 }} disabled={!requestUnderstood} onClick={() => goSlot(3)}>
                    Next - response format →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 1 && slot === 3 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">What comes back - the response format</h2>
              <p style={{ color: "#374151" }}>
                Gemini sends back the same nesting idea. Instead of "contents" it uses "candidates". Instead of your text it has Gemini's answer.
              </p>

              <div className="code-block">
                <div className="code-line">&#123;</div>
                <div className="code-line">&nbsp;&nbsp;"candidates": [</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"content": &#123;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"parts": [</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
                <div className="code-line same">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"text": "Here is your workout..."</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                <div className="code-line">&nbsp;&nbsp;]</div>
                <div className="code-line">&#125;</div>
              </div>

              <div className="code-block" style={{ marginTop: 12 }}>
                <div className="code-line">data.candidates[0]</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;.content</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;.parts[0]</div>
                <div className="code-line" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  &nbsp;&nbsp;&nbsp;.
                  <input
                    className={`blank-input${resBlankChecked ? " correct" : ""}`}
                    placeholder="text"
                    value={resBlank}
                    disabled={resBlankChecked}
                    onChange={(e) => setResBlank(e.target.value)}
                  />
                </div>
                <div className="code-line" style={{ color: "#64748B" }}>// same key as in the request - where is the answer?</div>
              </div>
              {!resBlankChecked && (
                <button className="btn ghost" style={{ marginTop: 10 }} onClick={checkResBlank}>Check</button>
              )}
              {resBlank && !resCorrect && !resBlankChecked && (
                <div className="blank-wrong">text - same key as in the request. candidates[0].content.parts[0].text</div>
              )}

              {resBlankChecked && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <Callout title="Why candidates[0]" variant="info">
                    Gemini can return multiple candidate answers. candidates[0] = the first one. That is always the one you use. You will not see multiple candidates with default settings.
                  </Callout>

                  <div style={{ display: "flex", gap: 12, fontSize: "0.82rem", fontFamily: "monospace", marginBottom: 16 }}>
                    <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 8, padding: 10 }}>
                      <b>Request:</b><br />contents[0].parts[0].text<br /><span style={{ color: "#64748B" }}>→ YOUR prompt</span>
                    </div>
                    <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 8, padding: 10 }}>
                      <b>Response:</b><br />candidates[0].content.parts[0].text<br /><span style={{ color: "#64748B" }}>→ Gemini's answer</span>
                    </div>
                  </div>

                  <label className="checklist-item">
                    <input type="checkbox" checked={responseUnderstood} onChange={() => { setResponseUnderstood(!responseUnderstood); play("add"); }} />
                    ✅ Response format understood
                  </label>

                  <button className="btn" style={{ marginTop: 12, opacity: responseUnderstood ? 1 : 0.5 }} disabled={!responseUnderstood} onClick={() => goSlot(4)}>
                    Next - design your prompt →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 1 && slot === 4 && !revealed && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Write a prompt that gets a useful answer</h2>

              <Callout title="4 rules for a good prompt" variant="info">
                1. Give Gemini a <b>ROLE</b> - "You are a friendly coach"<br />
                2. Give <b>CONTEXT</b> - age, plan, domain details<br />
                3. Set <b>CONSTRAINTS</b> - word limit, tone, format<br />
                4. Ask for exactly what you need - "3 exercises" not "some exercises"
              </Callout>

              <h4 style={{ margin: "18px 0 8px" }}>Write your prompt now</h4>
              <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "0 0 10px" }}>This goes in your Spring Boot code.</p>

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

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14, fontSize: "0.88rem", lineHeight: 2 }}>
                <b>{domain.role}</b><br />
                {domainKey === "gym" && (
                  <>Suggest a <input className="builder-blank" style={{ width: 140 }} placeholder={domain.fields[0].placeholder} value={fieldValues.workout || ""} onChange={(e) => setField("workout", e.target.value)} /> workout plan for a <input className="builder-blank" style={{ width: 50 }} placeholder={domain.fields[1].placeholder} value={fieldValues.age || ""} onChange={(e) => setField("age", e.target.value)} />-year-old gym member on the <input className="builder-blank" style={{ width: 80 }} placeholder={domain.fields[2].placeholder} value={fieldValues.plan || ""} onChange={(e) => setField("plan", e.target.value)} /> plan. Keep it encouraging and under <input className="builder-blank" style={{ width: 50 }} placeholder={domain.fields[3].placeholder} value={fieldValues.words || ""} onChange={(e) => setField("words", e.target.value)} /> words.</>
                )}
                {domainKey === "hotel" && (
                  <>Write a welcome note for a guest in a <input className="builder-blank" style={{ width: 100 }} placeholder={domain.fields[0].placeholder} value={fieldValues.room || ""} onChange={(e) => setField("room", e.target.value)} /> room staying for <input className="builder-blank" style={{ width: 50 }} placeholder={domain.fields[1].placeholder} value={fieldValues.nights || ""} onChange={(e) => setField("nights", e.target.value)} /> nights. Warm, professional, under <input className="builder-blank" style={{ width: 50 }} placeholder={domain.fields[2].placeholder} value={fieldValues.words || ""} onChange={(e) => setField("words", e.target.value)} /> words.</>
                )}
                {domainKey === "mess" && (
                  <>Suggest tomorrow's mess menu based on today's meal: <input className="builder-blank" style={{ width: 150 }} placeholder={domain.fields[0].placeholder} value={fieldValues.meal || ""} onChange={(e) => setField("meal", e.target.value)} />. Balanced, student-friendly, under <input className="builder-blank" style={{ width: 50 }} placeholder={domain.fields[1].placeholder} value={fieldValues.words || ""} onChange={(e) => setField("words", e.target.value)} /> words.</>
                )}
                {domainKey === "chai" && (
                  <>Write a thank you note for a customer who ordered <input className="builder-blank" style={{ width: 150 }} placeholder={domain.fields[0].placeholder} value={fieldValues.order || ""} onChange={(e) => setField("order", e.target.value)} />. Warm, brief, under 30 words.</>
                )}
              </div>

              <div className="builder-preview">
                <span style={{ color: "#64748B" }}>// generated prompt</span><br />
                <span className={allFieldsFilled ? "filled" : "empty"}>{generatedPrompt}</span>
              </div>

              <Callout title="Test in Postman before coding" variant="success">
                Before writing Java code, test your prompt in Postman. See the actual response. Know what comes back. Then build the parser.
              </Callout>

              <div className="postman-card">
                <div className="postman-bar">
                  <span className="postman-method">POST</span>
                  <span className="postman-url">generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY</span>
                </div>
                <div className="postman-section-label">Body</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#6EE7B7" }}>
                  &#123; "contents": [&#123; "parts": [&#123; "text": "
                  {allFieldsFilled ? generatedPrompt.slice(0, 60) + "..." : "..."}
                  " &#125;] &#125;] &#125;
                </div>
              </div>

              <label className="checklist-item" style={{ marginTop: 10 }}>
                <input type="checkbox" checked={postmanTested} onChange={() => { setPostmanTested(!postmanTested); play("add"); }} />
                ✅ My prompt written and tested in Postman
              </label>

              <button className="btn green" style={{ marginTop: 12, opacity: promptComplete ? 1 : 0.5 }} disabled={!promptComplete} onClick={triggerReveal}>
                Phase 1 complete →
              </button>
            </div>
          )}

          {phase === 1 && revealed && (
            <div className="reveal-card" style={{ animation: "slideIn 0.3s" }}>
              <h2 style={{ margin: "0 0 20px 0", color: "#92400E", textAlign: "center" }}>🎉 Phase 1 complete 🎉</h2>
              {revealCount >= 1 && <div className="reveal-line">✅ <span><b>Gemini API key</b> - Google AI Studio + @Value in Spring Boot</span></div>}
              {revealCount >= 2 && <div className="reveal-line">✅ <span><b>contents[0].parts[0].text</b> - where your prompt goes</span></div>}
              {revealCount >= 3 && <div className="reveal-line">✅ <span><b>candidates[0].content.parts[0].text</b> - where Gemini's answer lives</span></div>}
              {revealCount >= 4 && <div className="reveal-line">✅ <span><b>Role + context + constraints</b> - three ingredients of a good prompt</span></div>}
              {revealCount >= 5 && <div className="reveal-line">✅ <span><b>Test in Postman first</b> - see the response before writing parser</span></div>}
              {revealCount >= 6 && <div className="reveal-line">✅ <span><b>application.properties</b> - gemini.api.key never on GitHub</span></div>}

              {revealCount >= 6 && (
                <>
                  <p style={{ textAlign: "center", fontWeight: 700, color: "#1E293B", lineHeight: 1.9, marginTop: 16 }}>
                    Format understood. Prompt designed. Tested in Postman.<br /><br />
                    Next - 6.1.3.<br />
                    Build the Spring Boot endpoint. Call Gemini. Return the answer to React.
                  </p>
                  <button className="btn" onClick={goPhase2}>Build for YOUR project →</button>
                </>
              )}
            </div>
          )}

          {phase === 2 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Set up Gemini for YOUR project</h2>

              <h4 style={{ margin: "16px 0 4px" }}>Task 1 - API key</h4>
              {["API key created at makersuite", "Added to application.properties", "application.properties in .gitignore"].map((t, i) => (
                <label className="checklist-item" key={i}>
                  <input type="checkbox" checked={task1[i]} onChange={() => toggleTask(setTask1, i)} />{t}
                </label>
              ))}

              <h4 style={{ margin: "16px 0 4px" }}>Task 2 - Understand format</h4>
              {["I can write the request JSON with contents/parts/text", "I know the answer is at candidates[0].content.parts[0].text"].map((t, i) => (
                <label className="checklist-item" key={i}>
                  <input type="checkbox" checked={task2[i]} onChange={() => toggleTask(setTask2, i)} />{t}
                </label>
              ))}

              <h4 style={{ margin: "16px 0 4px" }}>Task 3 - Write your prompt</h4>
              <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "0 0 8px" }}>
                Include: a role for Gemini, specific context from your domain, and a word limit or format constraint.
              </p>
              <textarea
                className="reflection-box"
                placeholder="Write your final prompt here: You are a friendly fitness coach. Suggest a..."
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
              />

              <h4 style={{ margin: "16px 0 4px" }}>Task 4 - Test in Postman</h4>
              {["Tested my prompt in Postman", "Got a response from Gemini", "The response is useful for my feature"].map((t, i) => (
                <label className="checklist-item" key={i}>
                  <input type="checkbox" checked={task4[i]} onChange={() => toggleTask(setTask4, i)} />{t}
                </label>
              ))}

              <h4 style={{ margin: "20px 0 8px" }}>Reflection</h4>
              <p style={{ color: "#64748B", fontSize: "0.9rem", margin: "0 0 8px" }}>
                In one sentence - what is the difference between a vague prompt and a specific prompt?
              </p>
              <textarea
                className="reflection-box"
                placeholder="A vague prompt gives Gemini no context so it returns a generic answer, while a specific prompt with a role, context, and constraints gets a directly useful answer tailored to my domain..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
              <div className={`word-count${sentences >= 1 ? " ok" : ""}`}>{sentences} / 1 sentence minimum</div>

              <button className="btn green" style={{ marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                {submitted ? "Submitted ✅" : "Prompt tested - build the endpoint next →"}
              </button>

              {submitted && (
                <div style={{ marginTop: 16, padding: 16, background: "#F0FDF4", borderRadius: 8, color: "#065F46", textAlign: "center" }}>
                  <b>Gemini setup complete. 🤖</b><br /><br />
                  ✅ API key in application.properties<br />
                  ✅ Request format understood<br />
                  ✅ Response format understood<br />
                  ✅ Prompt designed and tested<br /><br />
                  Next - 6.1.3.<br />
                  One new Spring Boot endpoint. Calls Gemini with your prompt. Returns the AI answer.<br /><br />
                  React displays it. Gym owner sees it. Says wow.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT - sticky visual ── */}
        <div>
          <div style={{ position: "sticky", top: 24 }}>
            {phase === 1 && slot === 1 && (
              <div key="slot1" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">🔑 Google AI Studio preview</div>
                <div className="mock-browser">
                  <div className="mock-browser-bar">
                    <span className="mock-dot" style={{ background: "#F87171" }} />
                    <span className="mock-dot" style={{ background: "#FBBF24" }} />
                    <span className="mock-dot" style={{ background: "#34D399" }} />
                    <span className="mock-url">makersuite.google.com/app/apikey</span>
                  </div>
                  <div className="mock-body">
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Google AI Studio</div>
                    <div className={`mock-create-btn${apiKeyInput ? " done" : ""}`} style={{ background: "#2563EB", color: "#fff", borderRadius: 8, padding: "10px 18px", display: "inline-block", fontWeight: 700, fontSize: 13 }}>
                      {apiKeyInput ? "✓ Key created" : "+ Create API Key"}
                    </div>
                    <div key={apiKeyInput ? "has-key" : "no-key"} className={apiKeyInput ? "key-reveal" : ""} style={{ marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "#1E293B", background: "#F1F5F9", borderRadius: 6, padding: "8px 12px" }}>
                      {apiKeyInput ? apiKeyInput.slice(0, 10) + "..." : "AIzaSyD-XXXX-XXXX"}
                    </div>
                  </div>
                </div>
                <div className="props-file">
                  application.properties<br />
                  gemini.api.key={apiKeyInput ? apiKeyInput.slice(0, 10) + "..." : "AIzaSyD-..."}
                </div>
                <div className={`props-tag${apiKeyInput ? " key-reveal" : ""}`}>🔒 Secret - never commit</div>
              </div>
            )}

            {phase === 1 && slot === 2 && (
              <div key="slot2" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">📦 Click to unpack the request</div>
                <div className="nest-box" onClick={() => setEnvelopeOpen(!envelopeOpen)}>
                  <div className="nest-box-label">📦 contents [ ]</div>
                  <div className="nest-box-sub">click to {envelopeOpen ? "close" : "open"} the box</div>
                  {envelopeOpen && (
                    <div className="nest-envelope" style={{ animation: "slideIn 0.3s ease" }} onClick={(e) => { e.stopPropagation(); setLetterOpen(!letterOpen); }}>
                      <div className="nest-envelope-label">✉️ parts [ ]</div>
                      <div style={{ fontSize: "0.7rem" }}>click to {letterOpen ? "close" : "open"} the envelope</div>
                      {letterOpen && (
                        <div className="nest-letter" style={{ animation: "popIn 0.3s ease" }}>📝 text: "{reqBlankChecked ? "You are a friendly fitness coach..." : "your prompt here"}"</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="nest-path">
                  <span className="nest-path-seg">contents</span>
                  {envelopeOpen && <> → <span className="nest-path-seg">parts</span></>}
                  {letterOpen && <> → <span className="nest-path-seg gold">text</span></>}
                </div>
                <div className="nest-hint">contents is the box. The message object is the envelope. text is the letter inside.</div>
              </div>
            )}

            {phase === 1 && slot === 3 && (
              <div key="slot3" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">🔄 Request ↔ Response</div>
                <div className="req-res-box">
                  <div className="req-res-title">📤 Request</div>
                  contents<br />&nbsp;&nbsp;parts<br />&nbsp;&nbsp;&nbsp;&nbsp;<span className="match-key" style={{ color: "#6EE7B7", fontWeight: 700 }}>text</span>: "your prompt"
                </div>
                <div className="req-res-connector">
                  <div className="req-res-connector-line" />
                  <div className="req-res-connector-dot" />
                  <div className="req-res-spark">✨</div>
                </div>
                <div className="req-res-box">
                  <div className="req-res-title">📥 Response</div>
                  candidates<br />&nbsp;&nbsp;content<br />&nbsp;&nbsp;&nbsp;&nbsp;parts<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="match-key" style={{ color: "#6EE7B7", fontWeight: 700 }}>text</span>: "answer"
                </div>
                <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748B", marginTop: 14, marginBottom: 0 }}>Same nesting idea. Different wrapper names.</p>
              </div>
            )}

            {phase === 1 && slot === 4 && (
              <div key="slot4" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">⚖️ Prompt quality</div>
                <div className="compare-col vague">
                  <div className="compare-label">❌ Vague prompt</div>
                  <div className="compare-prompt">"Suggest a workout"</div>
                  <div className="compare-response">"A workout typically involves cardiovascular exercise and strength training. You should consult a fitness professional..."</div>
                  <div className="compare-verdict" style={{ color: "#64748B" }}>Generic. Not useful.</div>
                </div>
                <div className="viz-vs-badge">VS</div>
                <div className="compare-col specific">
                  <div className="compare-label">✅ Specific prompt</div>
                  <div className="compare-prompt">"You are a friendly fitness coach. Suggest a simple 3-exercise workout for: Age: 21, Plan: Basic. Keep it encouraging. Under 60 words."</div>
                  <div className="compare-response">"You've got this! Try: 10 squats, 10 knee push-ups, and a 20-second plank. Do 3 rounds with 1 min rest. Perfect for beginners - you'll feel stronger every week! 💪"</div>
                  <div className="compare-verdict" style={{ color: "#15803D" }}>Specific. Useful. Impressive.</div>
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className="card" style={{ margin: 0, animation: "slideIn 0.35s ease" }}>
                <h3 style={{ marginTop: 0 }}>Your prompt so far</h3>
                <div className="builder-preview">
                  <span className={finalPrompt ? "filled" : "empty"}>{finalPrompt || "// nothing written yet"}</span>
                </div>
                <div style={{ marginTop: 14 }}>
                  <span className={`rule-chip${/you are/i.test(finalPrompt) ? " on" : ""}`}>{/you are/i.test(finalPrompt) ? "✓" : "○"} Role</span>
                  <span className={`rule-chip${finalPrompt.replace(/you are[^.]*\./i, "").trim().length > 15 ? " on" : ""}`}>{finalPrompt.replace(/you are[^.]*\./i, "").trim().length > 15 ? "✓" : "○"} Context</span>
                  <span className={`rule-chip${/\bunder\b|\blimit\b|\bwords?\b/i.test(finalPrompt) ? " on" : ""}`}>{/\bunder\b|\blimit\b|\bwords?\b/i.test(finalPrompt) ? "✓" : "○"} Constraint</span>
                  <div style={{ marginTop: 10, fontSize: "0.82rem", color: "#64748B" }}>Check your prompt against the 4 rules before testing in Postman.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
