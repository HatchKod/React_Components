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
  .progress-step-label { margin-top: 6px; font-size: 0.66rem; font-weight: 700; text-align: center; color: #94A3B8; }
  .progress-step-label.on { color: #1E293B; }

  .split-layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: stretch; max-width: 1160px; margin: 0 auto; }
  @media(max-width:900px) { .split-layout { grid-template-columns: 1fr; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 24px; margin-bottom: 20px; }
  .card-header { font-size: 1.2rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; }
  .card-sub { color: #64748B; font-size: 0.86rem; margin: 0 0 18px 0; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 10px; padding: 13px 22px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s; width: 100%; text-align: center; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }
  .btn.green:hover { background: #15803D; }
  .btn.ghost { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; }

  .code-block { background: #0F172A; border-radius: 10px; padding: 14px; font-family: 'Fira Code','Courier New',monospace; font-size: 0.74rem; line-height: 1.7; overflow-x: auto; margin: 12px 0; }
  .code-line { white-space: pre; padding: 1px 6px; border-radius: 4px; color: #94A3B8; }
  .code-line.same { background: rgba(16,185,129,0.16); color: #6EE7B7; font-weight: 700; }
  .code-line.dim { color: #64748B; }

  .blank-input { background: #1E293B; color: #FCD34D; border: 1.5px dashed #F59E0B; border-radius: 6px; padding: 3px 8px; font-family: monospace; font-size: 0.78rem; outline: none; width: 90px; }
  .blank-input.correct { background: #134E4A; color: #6EE7B7; border-color: #10B981; border-style: solid; }
  .blank-hint { font-size: 0.78rem; color: #64748B; margin-top: 8px; }
  .blank-wrong { color: #B45309; font-size: 0.8rem; margin-top: 8px; font-weight: 600; }

  .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; font-size: 0.88rem; color: #374151; cursor: pointer; }
  .checklist-item input { margin-top: 3px; width: 16px; height: 16px; flex-shrink: 0; }

  .callout { border-radius: 12px; padding: 16px 18px; margin: 14px 0; font-size: 0.86rem; line-height: 1.8; }
  .callout.info { background: #EFF6FF; border-left: 4px solid #2563EB; color: #1E3A8A; }
  .callout.tip { background: #FFFBEB; border-left: 4px solid #D97706; color: #78350F; }
  .callout.success { background: #F0FDF4; border-left: 4px solid #16A34A; color: #14532D; }
  .callout-title { font-weight: 800; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

  .arg-legend { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
  .arg-chip { flex: 1; min-width: 90px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 0.74rem; text-align: center; }
  .arg-chip b { display: block; font-family: monospace; color: #4338CA; font-size: 0.8rem; margin-bottom: 3px; }

  .domain-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 16px; }
  .domain-tab { padding: 9px 14px; border-radius: 10px; border: 2px solid #E2E8F0; background: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
  .domain-tab.active { border-color: #7C3AED; background: linear-gradient(135deg,#F5F3FF,#EDE9FE); color: #5B21B6; }

  .ref-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 10px 0; }
  .ref-table td { padding: 6px 8px; border-bottom: 1px solid #F1F5F9; }
  .ref-table td:first-child { font-family: monospace; color: #B45309; font-weight: 700; }
  .ref-table td:last-child { font-family: monospace; color: #15803D; font-weight: 700; }

  .postman-card { background: #0F172A; border-radius: 12px; padding: 16px; margin-top: 10px; }
  .postman-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .postman-method { background: #16A34A; color: #fff; font-weight: 800; font-size: 0.68rem; padding: 3px 10px; border-radius: 6px; }
  .postman-url { font-family: monospace; font-size: 0.72rem; color: #94A3B8; word-break: break-all; }
  .postman-section-label { color: #64748B; font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin: 10px 0 6px; }
  .postman-body { font-family: monospace; font-size: 0.76rem; color: #6EE7B7; white-space: pre; }

  .wow-card { background: linear-gradient(180deg,#F0FDF4,#DCFCE7); border: 2px solid #16A34A; border-radius: 16px; padding: 26px; margin: 16px 0; }
  .wow-line { font-size: 0.95rem; color: #14532D; text-align: center; margin-bottom: 12px; animation: slideIn 0.4s ease; line-height: 1.7; }
  .wow-line b { color: #065F46; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin-top: 6px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; animation: slideIn 0.4s ease; }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  /* Right panel shell */
  .viz-panel { background: #fff; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 20px; }
  .viz-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #64748B; margin-bottom: 14px; text-align: center; }

  /* Chain flow (Slot 1 + Slot 4 right) */
  .chain-list { display: flex; flex-direction: column; }
  .chain-node { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 0.78rem; font-weight: 700; color: #64748B; transition: all 0.35s ease; }
  .chain-node.active { background: linear-gradient(135deg,#EEF2FF,#E0E7FF); border-color: #7C3AED; color: #4338CA; transform: scale(1.02); box-shadow: 0 4px 10px rgba(124,58,237,0.15); }
  .chain-connector { width: 2px; height: 14px; background: #E2E8F0; margin-left: 25px; }
  .chain-icon { width: 32px; height: 32px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; border: 1px solid #E2E8F0; }
  .thinking-dots { display: inline-block; animation: thinkBlink 1.2s ease-in-out infinite; }
  @keyframes thinkBlink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

  /* JSON <-> Java mapping (Slot 2 right) */
  .map-row { display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 0.76rem; margin-bottom: 8px; }
  .map-json { flex: 1; background: #0F172A; color: #6EE7B7; border-radius: 8px; padding: 8px 10px; text-align: center; }
  .map-java { flex: 1; background: #0F172A; color: #FCD34D; border-radius: 8px; padding: 8px 10px; text-align: center; }
  .map-eq { color: #94A3B8; font-weight: 800; font-size: 0.8rem; }

  /* Matryoshka (Slot 3 right) */
  .doll-stack { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .doll { border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.68rem; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 2px solid rgba(255,255,255,0.35); text-align: center; padding: 6px; }
  .doll.locked { opacity: 0.32; cursor: not-allowed; filter: grayscale(0.5); }
  .doll.done { opacity: 0.5; transform: scale(0.92); }
  .doll.current { animation: dollPulse 1.4s ease-in-out infinite; }
  .doll.final { background: linear-gradient(180deg,#FBBF24,#16A34A) !important; }
  @keyframes dollPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
  .doll-content-box { margin-top: 14px; background: #0F172A; border-radius: 10px; padding: 14px; font-family: monospace; font-size: 0.76rem; color: #94A3B8; text-align: center; animation: popIn 0.3s ease; }
  .doll-answer-box { margin-top: 14px; background: linear-gradient(180deg,#F0FDF4,#DCFCE7); border: 2px solid #16A34A; border-radius: 12px; padding: 16px; text-align: center; color: #14532D; font-weight: 700; animation: popIn 0.4s ease; font-size: 0.86rem; }

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

const PROGRESS_STEPS = ["@Service + RestTemplate", "Build Request Body", "Extract Response", "Controller + Test"];

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

// ─── Chain flow visual (Slot 1 + Slot 4 right) ─────────────────────────────
function ChainFlow({ nodes, activeIndex }) {
  return (
    <div className="chain-list">
      {nodes.map((n, i) => (
        <div key={i}>
          <div className={`chain-node${i === activeIndex ? " active" : ""}`}>
            <div className="chain-icon">{n.icon}</div>
            <div>{n.label}{n.thinking && i === activeIndex ? <span className="thinking-dots"> ...</span> : ""}</div>
          </div>
          {i < nodes.length - 1 && <div className="chain-connector" />}
        </div>
      ))}
    </div>
  );
}

// ─── Domain reference data (Slot 4) ────────────────────────────────────────
const DOMAINS = {
  gym: { icon: "💪", label: "Gym", route: "/gym/ai", role: "You are a friendly fitness coach.", fields: [{ java: "name", sample: "Ravi" }, { java: "age", sample: "21" }, { java: "plan", sample: "Basic" }] },
  hotel: { icon: "🏨", label: "Hotel", route: "/hotel/ai", role: "You are a friendly concierge.", fields: [{ java: "guestName", sample: "Priya" }, { java: "roomType", sample: "Deluxe" }, { java: "nights", sample: "3" }] },
  mess: { icon: "🍱", label: "Mess", route: "/mess/ai", role: "You are a nutritionist.", fields: [{ java: "todayMeal", sample: "Dal Rice Sambar" }] },
  chai: { icon: "☕", label: "Chai Stall", route: "/chai/ai", role: "You are a friendly tea shop owner.", fields: [{ java: "customerName", sample: "Suresh" }, { java: "order", sample: "2x Cutting Chai" }] },
};

// ─── Matryoshka dolls (Slot 3 right) ───────────────────────────────────────
const DOLLS = [
  { label: "candidates", size: 66, content: "candidates = [ {...} ]" },
  { label: "firstCandidate", size: 58, content: "firstCandidate = { content: {...} }" },
  { label: "content", size: 50, content: "content = { parts: [...] }" },
  { label: "parts", size: 42, content: "parts = [ {...} ]" },
  { label: "firstPart", size: 34, content: 'firstPart = { text: "..." }' },
  { label: "text", size: 26, content: null },
];
const DOLL_COLORS = ["#78350F", "#92400E", "#B45309", "#C2760C", "#D97706", "#EA9A0C"];

export default function GeminiEndpointBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get("subtopicId");
  const taskId = params.get("taskId");

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1);
  const [slot, setSlot] = useState(1);
  const goSlot = (n) => { play("tick"); setSlot(n); };

  // Slot 1
  const [serviceBlank, setServiceBlank] = useState("");
  const [serviceBlankChecked, setServiceBlankChecked] = useState(false);
  const serviceCorrect = serviceBlank.trim().replace(/^@/, "") === "Service";
  const [serviceUnderstood, setServiceUnderstood] = useState(false);
  const [chainIndex, setChainIndex] = useState(0);
  useEffect(() => {
    if (slot !== 1) return;
    const iv = setInterval(() => setChainIndex((i) => (i + 1) % 6), 1000);
    return () => clearInterval(iv);
  }, [slot]);

  const checkServiceBlank = () => {
    if (serviceCorrect) { setServiceBlankChecked(true); play("add"); }
    else play("warn");
  };

  // Slot 2
  const [reqBlank, setReqBlank] = useState("");
  const [reqBlankChecked, setReqBlankChecked] = useState(false);
  const reqCorrect = reqBlank.trim().replace(/"/g, "") === "text";
  const [requestBuilt, setRequestBuilt] = useState(false);

  const checkReqBlank = () => {
    if (reqCorrect) { setReqBlankChecked(true); play("add"); }
    else play("warn");
  };

  // Slot 3
  const [getBlank, setGetBlank] = useState("");
  const [getBlankChecked, setGetBlankChecked] = useState(false);
  const getCorrect = getBlank.trim() === "get";
  const [tryCatchAdded, setTryCatchAdded] = useState(false);
  const [dollLevel, setDollLevel] = useState(0);
  const openNextDoll = () => {
    if (dollLevel >= 6) return;
    setDollLevel((l) => l + 1);
    if (dollLevel + 1 === 6) play("reveal");
    else play("tick");
  };

  const checkGetBlank = () => {
    if (getCorrect) { setGetBlankChecked(true); play("add"); }
    else play("warn");
  };

  // Slot 4
  const [domainKey, setDomainKey] = useState("gym");
  const domain = DOMAINS[domainKey];
  const [task4List, setTask4List] = useState([false, false, false]);
  const toggleTask4 = (i) => setTask4List((arr) => {
    const next = [...arr];
    next[i] = !next[i];
    return next;
  });
  const allThree = task4List.every(Boolean);

  const [wowRevealed, setWowRevealed] = useState(false);
  const [wowCount, setWowCount] = useState(0);
  const wowFiredRef = useRef(false);
  const [ph1Revealed, setPh1Revealed] = useState(false);
  const [ph1Count, setPh1Count] = useState(0);
  const [finalShown, setFinalShown] = useState(false);

  useEffect(() => {
    if (!allThree || wowFiredRef.current) return;
    wowFiredRef.current = true;
    play("correct");
    setWowRevealed(true);

    // Chained interval/timeout reveal sequence - all timer IDs are tracked so
    // the cleanup function below can cancel every pending step if the
    // component unmounts mid-sequence, instead of letting orphaned timers
    // keep firing setState calls after unmount.
    const timers = [];
    let c = 0;
    const iv = setInterval(() => {
      c += 1;
      setWowCount(c);
      if (c >= 5) {
        clearInterval(iv);
        play("reveal");
        const t1 = setTimeout(() => {
          setPh1Revealed(true);
          let d = 0;
          const iv2 = setInterval(() => {
            d += 1;
            setPh1Count(d);
            if (d < 7) play("tick");
            if (d >= 7) {
              clearInterval(iv2);
              const t2 = setTimeout(() => setFinalShown(true), 400);
              timers.push(t2);
            }
          }, 380);
          timers.push(iv2);
        }, 900);
        timers.push(t1);
      }
    }, 550);
    timers.push(iv);

    return () => timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
  }, [allThree]); // eslint-disable-line react-hooks/exhaustive-deps

  const goPhase2 = () => { play("tick"); setPhase(2); };

  const gymSample = domain.fields.reduce((acc, f) => { acc[f.java] = f.sample; return acc; }, {});
  const postmanBodyPreview = "{\n" + domain.fields.map((f) => `  "${f.java}": "${f.sample}"`).join(",\n") + "\n}";

  // Phase 2
  const [task1, setTask1] = useState([false, false]);
  const [task2, setTask2] = useState([false, false, false, false, false]);
  const [task3, setTask3] = useState([false, false, false, false, false]);
  const [task4b, setTask4b] = useState([false, false, false]);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTask = (setter, idx) => setter((arr) => {
    const next = [...arr];
    next[idx] = !next[idx];
    play(next[idx] ? "add" : "tick");
    return next;
  });

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const canSubmit = task1.every(Boolean) && task2.every(Boolean) && task3.every(Boolean) && task4b.every(Boolean) && sentences >= 1;

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
        exerciseId: "m6-t1-s3-gemini-endpoint-builder",
        exerciseType: "interactive",
        status: "completed", score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { serviceBlank: "Service" },
            slot2: { textBlank: '"text"' },
            slot3: { getBlank: "get", tryCatchAdded },
            slot4: { controllerCreated: task4List[0], springBootRestarted: task4List[1], postmanReturnsAI: task4List[2] },
          },
          phase2: {
            restTemplateBeanAdded: task1.every(Boolean),
            aiServiceCreated: task2.every(Boolean),
            aiControllerCreated: task3.every(Boolean),
            postmanTested: task4b.every(Boolean),
            committedToGitHub: true,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, "*");
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const chainNodesSlot1 = [
    { icon: "⚛️", label: "React" },
    { icon: "🎛️", label: "AIController" },
    { icon: "⚙️", label: "AIService (@Service)" },
    { icon: "📡", label: "RestTemplate" },
    { icon: "✨", label: "Gemini API" },
    { icon: "⚛️", label: "Back to React" },
  ];
  const chainNodesSlot4 = [
    { icon: "⚛️", label: "React (coming in 6.2.1)" },
    { icon: "🎛️", label: "AIController builds prompt" },
    { icon: "⚙️", label: "AIService -> RestTemplate" },
    { icon: "✨", label: "Gemini", thinking: true },
    { icon: "✅", label: "Your app thinks" },
  ];
  const [chainIndex4, setChainIndex4] = useState(0);
  useEffect(() => {
    if (!(phase === 1 && slot === 4)) return;
    const iv = setInterval(() => setChainIndex4((i) => (i + 1) % chainNodesSlot4.length), 1100);
    return () => clearInterval(iv);
  }, [phase, slot]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Gemini Endpoint Builder</h1>
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
              <h2 className="card-header">The AI service - one class, one job</h2>

              <Callout title="@Service" variant="info">
                @Service - same as @Component.<br /><br />
                @Component = shared tool. @Service = shared tool that does business logic.<br /><br />
                Spring Boot creates one instance. @Autowired delivers it anywhere.<br /><br />
                Use @Service for classes that do real work: call APIs, process data, apply business rules.
              </Callout>

              <Callout title="RestTemplate" variant="tip">
                You use fetch() in React to call your Spring Boot.<br /><br />
                Spring Boot needs to call Gemini the same way.<br /><br />
                RestTemplate is Spring Boot's fetch() - automated inside Java.
              </Callout>

              <div className="code-block">
                <div className="code-line dim">// Add to SecurityConfig.java:</div>
                <div className="code-line same">@Bean</div>
                <div className="code-line">public RestTemplate restTemplate() {"{"}</div>
                <div className="code-line">&nbsp;&nbsp;return new RestTemplate();</div>
                <div className="code-line">{"}"}</div>
                <div className="code-line dim">// @Bean creates it, @Autowired delivers it to AIService</div>
              </div>

              <div className="code-block">
                <div className="code-line" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  @
                  <input
                    className={`blank-input${serviceBlankChecked ? " correct" : ""}`}
                    placeholder="Service"
                    value={serviceBlank}
                    disabled={serviceBlankChecked}
                    onChange={(e) => setServiceBlank(e.target.value)}
                  />
                </div>
                <div className="code-line">public class AIService {"{"}</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">&nbsp;&nbsp;@Autowired</div>
                <div className="code-line">&nbsp;&nbsp;private RestTemplate restTemplate;</div>
                <div className="code-line">&nbsp;&nbsp;@Value("$&#123;gemini.api.key&#125;")</div>
                <div className="code-line">&nbsp;&nbsp;private String apiKey;</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">&nbsp;&nbsp;public String getSuggestion(String prompt) {"{"}</div>
                <div className="code-line dim">&nbsp;&nbsp;&nbsp;&nbsp;// call Gemini here</div>
                <div className="code-line">&nbsp;&nbsp;{"}"}</div>
                <div className="code-line">{"}"}</div>
              </div>
              <div className="blank-hint">What annotation marks a class as a Spring Boot service component?</div>
              {!serviceBlankChecked && (
                <button className="btn ghost" style={{ marginTop: 10 }} onClick={checkServiceBlank}>Check</button>
              )}
              {serviceBlank && !serviceCorrect && !serviceBlankChecked && (
                <div className="blank-wrong">The annotation is @Service. Same as @Component but signals this is a service.</div>
              )}

              {serviceBlankChecked && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <label className="checklist-item">
                    <input type="checkbox" checked={serviceUnderstood} onChange={() => { setServiceUnderstood(!serviceUnderstood); play("add"); }} />
                    ✅ AIService created with @Service and RestTemplate
                  </label>
                  <button className="btn" style={{ marginTop: 12, opacity: serviceUnderstood ? 1 : 0.5 }} disabled={!serviceUnderstood} onClick={() => goSlot(2)}>
                    Next - build request body →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 1 && slot === 2 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Build the request - Map.of + List.of</h2>

              <Callout title="Connection to 6.1.2" variant="info">
                You designed this structure in 6.1.2:<br />
                <code>&#123; contents: [&#123; parts: [&#123; text: '...' &#125;] &#125;] &#125;</code><br /><br />
                In Java - build it with Map.of and List.of. Same tools from Module 1.
              </Callout>

              <div className="code-block">
                <div className="code-line">String url =</div>
                <div className="code-line">&nbsp;&nbsp;"https://generativelanguage..."</div>
                <div className="code-line">&nbsp;&nbsp;+ "?key=" + apiKey;</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">Map&lt;String, Object&gt; body = Map.of(</div>
                <div className="code-line">&nbsp;&nbsp;"contents", List.of(</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;Map.of("parts", List.of(</div>
                <div className="code-line" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Map.of(
                  <input
                    className={`blank-input${reqBlankChecked ? " correct" : ""}`}
                    placeholder='"text"'
                    value={reqBlank}
                    disabled={reqBlankChecked}
                    onChange={(e) => setReqBlank(e.target.value)}
                  />
                  , prompt)
                </div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;))</div>
                <div className="code-line">&nbsp;&nbsp;)</div>
                <div className="code-line">);</div>
              </div>
              <div className="blank-hint">What key holds the prompt text inside parts? (contents -&gt; parts -&gt; this key holds your prompt)</div>
              {!reqBlankChecked && (
                <button className="btn ghost" style={{ marginTop: 10 }} onClick={checkReqBlank}>Check</button>
              )}
              {reqBlank && !reqCorrect && !reqBlankChecked && (
                <div className="blank-wrong">The key is 'text'. Map.of('text', prompt) puts your prompt in the right place.</div>
              )}

              {reqBlankChecked && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.85rem", margin: "16px 0 6px" }}>Same structure. JSON uses &#123;&#125; and []. Java uses Map.of() and List.of().</p>
                  <div className="code-block">
                    <div className="code-line dim">// JSON (from 6.1.2):</div>
                    <div className="code-line">&#123; "contents": [&#123; "parts": [&#123; "text": "your prompt" &#125;] &#125;] &#125;</div>
                  </div>
                  <div className="code-block">
                    <div className="code-line dim">// Java:</div>
                    <div className="code-line same">Map.of("contents", List.of(Map.of("parts", List.of(</div>
                    <div className="code-line same">&nbsp;&nbsp;Map.of("text", prompt)))))</div>
                  </div>

                  <div className="code-block">
                    <div className="code-line">Map response = restTemplate.postForObject(</div>
                    <div className="code-line">&nbsp;&nbsp;url,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#64748B" }}>// POST to here</span></div>
                    <div className="code-line">&nbsp;&nbsp;body,&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#64748B" }}>// send this</span></div>
                    <div className="code-line">&nbsp;&nbsp;Map.class&nbsp;&nbsp;<span style={{ color: "#64748B" }}>// expect a Map back</span></div>
                    <div className="code-line">);</div>
                    <div className="code-line dim">// Jackson converts JSON -&gt; Map automatically</div>
                  </div>

                  <div className="arg-legend">
                    <div className="arg-chip"><b>url</b>WHERE to POST</div>
                    <div className="arg-chip"><b>body</b>WHAT to send</div>
                    <div className="arg-chip"><b>Map.class</b>WHAT type comes back</div>
                  </div>

                  <label className="checklist-item">
                    <input type="checkbox" checked={requestBuilt} onChange={() => { setRequestBuilt(!requestBuilt); play("add"); }} />
                    ✅ Request body built
                  </label>
                  <button className="btn" style={{ marginTop: 12, opacity: requestBuilt ? 1 : 0.5 }} disabled={!requestBuilt} onClick={() => goSlot(3)}>
                    Next - extract response →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 1 && slot === 3 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Open the matryoshka - find the answer</h2>
              <p style={{ color: "#374151" }}>Six nesting dolls. Open each one to find the answer inside.</p>

              <div className="code-block">
                <div className="code-line">List candidates = (List) response.get("candidates");</div>
                <div className="code-line">Map firstCandidate = (Map) candidates.get(0);</div>
                <div className="code-line">Map content = (Map) firstCandidate.get("content");</div>
                <div className="code-line">List parts = (List) content.get("parts");</div>
                <div className="code-line">Map firstPart = (Map) parts.get(0);</div>
                <div className="code-line" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  return (String) firstPart.
                  <input
                    className={`blank-input${getBlankChecked ? " correct" : ""}`}
                    style={{ width: 60 }}
                    placeholder="get"
                    value={getBlank}
                    disabled={getBlankChecked}
                    onChange={(e) => setGetBlank(e.target.value)}
                  />
                  ("text");
                </div>
              </div>
              <div className="blank-hint">To get the "text" value from a Map - what method do you call? (same method used on all the lines above)</div>
              {!getBlankChecked && (
                <button className="btn ghost" style={{ marginTop: 10 }} onClick={checkGetBlank}>Check</button>
              )}
              {getBlank && !getCorrect && !getBlankChecked && (
                <div className="blank-wrong">Map.get('key') retrieves a value by key. firstPart.get('text') gets the text string.</div>
              )}

              {getBlankChecked && (
                <div style={{ animation: "slideIn 0.3s" }}>
                  <div style={{ fontSize: "0.85rem", color: "#374151", background: "#F8FAFC", borderRadius: 10, padding: 14, margin: "14px 0" }}>
                    <b>Line 1</b> candidates list - open outer doll<br />
                    <b>Line 2</b> first candidate - pick first option<br />
                    <b>Line 3</b> content - open next doll<br />
                    <b>Line 4</b> parts list - another array<br />
                    <b>Line 5</b> first part - pick first<br />
                    <b>Line 6</b> text - the actual answer ✅
                  </div>

                  <div className="code-block">
                    <div className="code-line">public String getSuggestion(String prompt) {"{"}</div>
                    <div className="code-line">&nbsp;&nbsp;try {"{"}</div>
                    <div className="code-line dim">&nbsp;&nbsp;&nbsp;&nbsp;// ... all the code above</div>
                    <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;return (String) firstPart.get("text");</div>
                    <div className="code-line">&nbsp;&nbsp;{"}"} catch (Exception e) {"{"}</div>
                    <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;return "Could not get AI suggestion. Please try again.";</div>
                    <div className="code-line">&nbsp;&nbsp;{"}"}</div>
                    <div className="code-line">{"}"}</div>
                  </div>
                  <p style={{ color: "#374151", fontSize: "0.86rem" }}>AI can fail. Rate limits. Network issues. Bad API key. Always wrap. Always have a fallback.</p>

                  <label className="checklist-item">
                    <input type="checkbox" checked={tryCatchAdded} onChange={() => { setTryCatchAdded(!tryCatchAdded); play("add"); }} />
                    ✅ Response extraction and try/catch added
                  </label>
                  <button className="btn" style={{ marginTop: 12, opacity: tryCatchAdded ? 1 : 0.5 }} disabled={!tryCatchAdded} onClick={() => goSlot(4)}>
                    Next - controller + test →
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 1 && slot === 4 && !wowRevealed && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">The AI controller - build prompt with real data</h2>

              <div className="code-block">
                <div className="code-line">@RestController</div>
                <div className="code-line">@RequestMapping("/gym/ai")</div>
                <div className="code-line">@CrossOrigin(origins = "http://localhost:3000")</div>
                <div className="code-line">public class AIController {"{"}</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">&nbsp;&nbsp;@Autowired</div>
                <div className="code-line">&nbsp;&nbsp;private AIService aiService;</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">&nbsp;&nbsp;@PostMapping("/suggest")</div>
                <div className="code-line">&nbsp;&nbsp;public String suggest(@RequestBody Map&lt;String, String&gt; request) {"{"}</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;String name = request.get("name");</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;String plan = request.get("plan");</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;String age = request.get("age");</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line dim">&nbsp;&nbsp;&nbsp;&nbsp;// Build prompt with real data:</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;String prompt = "You are a friendly fitness coach. "</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ "Suggest a 3-exercise workout for "</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ name + ", age " + age</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ ", on the " + plan + " plan. "</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ "Under 60 words. Encouraging.";</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">&nbsp;&nbsp;&nbsp;&nbsp;return aiService.getSuggestion(prompt);</div>
                <div className="code-line">&nbsp;&nbsp;{"}"}</div>
                <div className="code-line">{"}"}</div>
              </div>
              <p style={{ color: "#374151", fontSize: "0.86rem" }}>
                Map&lt;String, String&gt; request - receives any JSON object from React as key-value pairs. Simple. Flexible.
              </p>

              <h4 style={{ margin: "18px 0 8px" }}>Your actual prompt from 6.1.2 goes here</h4>
              <div className="domain-tabs">
                {Object.entries(DOMAINS).map(([key, d]) => (
                  <button key={key} className={`domain-tab${domainKey === key ? " active" : ""}`} onClick={() => { play("tick"); setDomainKey(key); }}>
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>
              <p style={{ color: "#64748B", fontSize: "0.84rem" }}>Replace each &#123;placeholder&#125; with Java string concatenation:</p>
              <table className="ref-table">
                <tbody>
                  {domain.fields.map((f) => (
                    <tr key={f.java}><td>&#123;{f.java}&#125;</td><td>{f.java} +</td></tr>
                  ))}
                </tbody>
              </table>

              <Callout title="Test in Postman" variant="success">
                Restart Spring Boot. Open Postman.
              </Callout>
              <div className="postman-card">
                <div className="postman-bar">
                  <span className="postman-method">POST</span>
                  <span className="postman-url">http://localhost:8080{domain.route}/suggest</span>
                </div>
                <div className="postman-section-label">Headers</div>
                <div className="postman-body">Authorization: Bearer [your token]{"\n"}Content-Type: application/json</div>
                <div className="postman-section-label">Body</div>
                <div className="postman-body">{postmanBodyPreview}</div>
                <div className="postman-section-label">Expected response</div>
                <div className="postman-body" style={{ color: "#94A3B8" }}>"Hey {gymSample[domain.fields[0].java]}! Here's your workout: 15 squats, 10 push-ups (knees OK!), 30-sec plank. Do 2 rounds. You've got this! 💪"</div>
              </div>

              <label className="checklist-item">
                <input type="checkbox" checked={task4List[0]} onChange={() => { toggleTask4(0); play("add"); }} />
                AIController created - {domain.route}/suggest endpoint
              </label>
              <label className="checklist-item">
                <input type="checkbox" checked={task4List[1]} onChange={() => { toggleTask4(1); play("add"); }} />
                Spring Boot restarted
              </label>
              <label className="checklist-item">
                <input type="checkbox" checked={task4List[2]} onChange={() => { toggleTask4(2); play("add"); }} />
                Postman returns real AI-generated text
              </label>
            </div>
          )}

          {phase === 1 && slot === 4 && wowRevealed && !ph1Revealed && (
            <div className="wow-card" style={{ animation: "slideIn 0.3s" }}>
              {wowCount >= 1 && <div className="wow-line"><b>Your Spring Boot just called Gemini.</b></div>}
              {wowCount >= 2 && <div className="wow-line">You sent member data. Gemini thought about it. Gemini wrote a workout plan. Spring Boot returned it.</div>}
              {wowCount >= 3 && <div className="wow-line"><b>This is AI in your application.</b></div>}
              {wowCount >= 4 && <div className="wow-line">Not magic. Just a REST call.</div>}
              {wowCount >= 5 && <div className="wow-line">Show this to the gym owner. Watch their face.</div>}
            </div>
          )}

          {phase === 1 && ph1Revealed && (
            <div className="reveal-card" style={{ animation: "slideIn 0.3s" }}>
              <h2 style={{ margin: "0 0 20px 0", color: "#92400E", textAlign: "center" }}>🎉 Phase 1 complete 🎉</h2>
              {ph1Count >= 1 && <div className="reveal-line">✅ <span><b>@Service</b> - same as @Component - for service classes with logic</span></div>}
              {ph1Count >= 2 && <div className="reveal-line">✅ <span><b>RestTemplate</b> - Spring Boot's HTTP client - postForObject(url, body, type)</span></div>}
              {ph1Count >= 3 && <div className="reveal-line">✅ <span><b>Map.of + List.of</b> - build nested JSON structure in Java</span></div>}
              {ph1Count >= 4 && <div className="reveal-line">✅ <span><b>postForObject</b> - POST request - JSON response converted to Map</span></div>}
              {ph1Count >= 5 && <div className="reveal-line">✅ <span><b>Matryoshka extraction</b> - candidates -&gt; content -&gt; parts -&gt; text</span></div>}
              {ph1Count >= 6 && <div className="reveal-line">✅ <span><b>try/catch in AI service</b> - always - AI can fail - return friendly fallback</span></div>}
              {ph1Count >= 7 && <div className="reveal-line">✅ <span><b>@RequestBody Map&lt;String, String&gt;</b> - receive any JSON as key-value pairs</span></div>}

              {finalShown && (
                <>
                  <p style={{ textAlign: "center", fontWeight: 700, color: "#1E293B", lineHeight: 1.9, marginTop: 16 }}>
                    Your Spring Boot calls Gemini. Your app thinks.<br /><br />
                    Topic 1 complete.<br /><br />
                    Topic 2 - show this on screen. Deploy to the internet. Real URL.<br />
                    The gym owner opens it on their phone.
                  </p>
                  <button className="btn" onClick={goPhase2}>Build for YOUR project →</button>
                </>
              )}
            </div>
          )}

          {phase === 2 && (
            <div className="card" style={{ animation: "slideIn 0.3s" }}>
              <h2 className="card-header">Build YOUR AI endpoint</h2>

              <div className="domain-tabs">
                {Object.entries(DOMAINS).map(([key, d]) => (
                  <button key={key} className={`domain-tab${domainKey === key ? " active" : ""}`} onClick={() => { play("tick"); setDomainKey(key); }}>
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>

              <h4 style={{ margin: "16px 0 4px" }}>Task 1 - Setup</h4>
              {["RestTemplate @Bean added to SecurityConfig", "AIService.java created with @Service"].map((t, i) => (
                <label className="checklist-item" key={i}><input type="checkbox" checked={task1[i]} onChange={() => toggleTask(setTask1, i)} />{t}</label>
              ))}

              <h4 style={{ margin: "16px 0 4px" }}>Task 2 - AIService</h4>
              {["getSuggestion(String prompt) method", "Request body built with Map.of + List.of", "restTemplate.postForObject() call", "Matryoshka extraction", "try/catch with fallback"].map((t, i) => (
                <label className="checklist-item" key={i}><input type="checkbox" checked={task2[i]} onChange={() => toggleTask(setTask2, i)} />{t}</label>
              ))}

              <h4 style={{ margin: "16px 0 4px" }}>Task 3 - AIController</h4>
              {["AIController.java created", `@RequestMapping("${domain.route}")`, '@PostMapping("/suggest") method', "Prompt built with member data", "Returns aiService.getSuggestion()"].map((t, i) => (
                <label className="checklist-item" key={i}><input type="checkbox" checked={task3[i]} onChange={() => toggleTask(setTask3, i)} />{t}</label>
              ))}

              <h4 style={{ margin: "16px 0 4px" }}>Task 4 - Test</h4>
              {["Spring Boot restarted", "Postman call returns AI text", "Tried with different member data - different AI responses"].map((t, i) => (
                <label className="checklist-item" key={i}><input type="checkbox" checked={task4b[i]} onChange={() => toggleTask(setTask4b, i)} />{t}</label>
              ))}

              <div className="code-block">
                <div className="code-line dim">// Commit:</div>
                <div className="code-line">git add .</div>
                <div className="code-line">git commit -m "add Gemini AI endpoint - one feature that thinks"</div>
                <div className="code-line">git push origin main</div>
              </div>

              <h4 style={{ margin: "20px 0 8px" }}>Reflection</h4>
              <p style={{ color: "#64748B", fontSize: "0.9rem", margin: "0 0 8px" }}>
                In one sentence - what does restTemplate.postForObject() do?
              </p>
              <textarea
                className="reflection-box"
                placeholder="restTemplate.postForObject() sends a POST request to a URL with a request body and automatically converts the JSON response into a Java Map that we can then parse to extract Gemini's answer..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
              <div className={`word-count${sentences >= 1 ? " ok" : ""}`}>{sentences} / 1 sentence minimum</div>

              <button className="btn green" style={{ marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                {submitted ? "Submitted ✅" : "AI endpoint working - show it on screen next →"}
              </button>

              {submitted && (
                <div style={{ marginTop: 16, padding: 16, background: "#F0FDF4", borderRadius: 8, color: "#065F46", textAlign: "center" }}>
                  <b>AI is in your app. 🤖</b><br /><br />
                  ✅ @Service AIService<br />
                  ✅ RestTemplate calls Gemini<br />
                  ✅ Request built correctly<br />
                  ✅ Matryoshka extraction works<br />
                  ✅ try/catch protects the app<br />
                  ✅ AIController builds real prompt<br />
                  ✅ Postman returns AI text<br /><br />
                  Topic 1 complete.<br /><br />
                  Next - Topic 2.<br />
                  6.2.1: Show AI on React screen.<br />
                  6.2.2: Docker - app in a box.<br />
                  6.2.3: Deploy - real URL.<br /><br />
                  The gym owner opens your app on their phone.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT - sticky visual ── */}
        <div>
          <div style={{ position: "sticky", top: 24 }}>
            {phase === 1 && slot === 1 && (
              <div key="slot1" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">🔗 The call chain</div>
                <ChainFlow nodes={chainNodesSlot1} activeIndex={chainIndex} />
              </div>
            )}

            {phase === 1 && slot === 2 && (
              <div key="slot2" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">🔀 JSON ↔ Java</div>
                <div className="map-row"><div className="map-json">&#123; &#125;</div><span className="map-eq">↔</span><div className="map-java">Map.of()</div></div>
                <div className="map-row"><div className="map-json">[ ]</div><span className="map-eq">↔</span><div className="map-java">List.of()</div></div>
                <div className="map-row"><div className="map-json">"key": "value"</div><span className="map-eq">↔</span><div className="map-java">"key", value</div></div>
                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#64748B", marginTop: 12, marginBottom: 0 }}>Same nested structure. Different syntax.</p>
              </div>
            )}

            {phase === 1 && slot === 3 && (
              <div key="slot3" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">🪆 Open the dolls</div>
                <div className="doll-stack">
                  {DOLLS.map((d, i) => {
                    const level = i + 1;
                    const state = level === dollLevel + 1 ? "current" : level <= dollLevel ? "done" : "locked";
                    const isFinal = level === 6;
                    return (
                      <div
                        key={i}
                        className={`doll${state ? " " + state : ""}${isFinal && dollLevel >= 6 ? " final" : ""}`}
                        style={{ width: d.size, height: d.size * 0.82, background: `linear-gradient(180deg, ${DOLL_COLORS[i]}, ${DOLL_COLORS[i]}CC)` }}
                        onClick={() => level === dollLevel + 1 && openNextDoll()}
                      >
                        {level <= dollLevel ? "✓" : level}
                      </div>
                    );
                  })}
                </div>
                {dollLevel > 0 && dollLevel < 6 && (
                  <div className="doll-content-box">{DOLLS[dollLevel - 1].content}</div>
                )}
                {dollLevel >= 6 && (
                  <div className="doll-answer-box">
                    ✅ "Hey Ravi! Here's your workout: 15 squats, 10 push-ups, 30-sec plank..."
                  </div>
                )}
                {dollLevel < 6 && <p style={{ textAlign: "center", fontSize: "0.76rem", color: "#94A3B8", marginTop: 10 }}>Click the glowing doll to open it.</p>}
              </div>
            )}

            {phase === 1 && slot === 4 && (
              <div key="slot4" className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">📶 Full call animation</div>
                <ChainFlow nodes={chainNodesSlot4} activeIndex={chainIndex4} />
                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#64748B", marginTop: 12, marginBottom: 0 }}>Your app thinks ✅</p>
              </div>
            )}

            {phase === 2 && (
              <div className="viz-panel" style={{ animation: "slideIn 0.35s ease" }}>
                <div className="viz-title">📶 Your endpoint, live</div>
                <ChainFlow nodes={chainNodesSlot4} activeIndex={chainIndex4} />
                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#64748B", marginTop: 12, marginBottom: 0 }}>
                  {domain.route}/suggest - your feature that thinks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
