import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .jub-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .jub-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1200px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(16,185,129,0.12); color: #16A34A; }
  .p-pill.active { background: #3B82F6; color: #fff; }
  .p-line { width: 16px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #16A34A; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1200px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.7; }

  .code-block { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Courier New', monospace; font-size: 0.78rem; line-height: 1.65; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .code-comment { color: #64748B; }
  .code-tag { color: #93C5FD; }
  .code-blank-done { color: #6EE7B7; font-weight: 700; }

  .collapsible { margin-top: 14px; }
  .collapsible-head { display: flex; align-items: center; justify-content: space-between; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #991B1B; }
  .collapsible-body { padding: 12px 14px; font-size: 0.85rem; color: #7F1D1D; line-height: 1.8; background: #FFF5F5; border-radius: 0 0 8px 8px; border: 1px solid #FECACA; border-top: none; }

  .blank-panel { background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .blank-label { color: #FDE68A; font-size: 0.8rem; margin-bottom: 10px; line-height: 1.6; }
  .blank-opts { display: flex; gap: 8px; flex-wrap: wrap; }
  .blank-opt-btn { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 16px; font-family: monospace; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
  .blank-opt-btn:hover { border-color: #94A3B8; }
  .blank-opt-btn.correct { background: rgba(16,185,129,0.2); border-color: #16A34A; color: #6EE7B7; }
  .blank-opt-btn.wrong { background: rgba(239,68,68,0.2); border-color: #DC2626; color: #FCA5A5; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .blank-input-row { display: flex; gap: 8px; }
  .blank-text-input { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 0.82rem; flex: 1; }
  .blank-submit-btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .blank-feedback { margin-top: 8px; font-size: 0.78rem; }
  .blank-feedback.wrong { color: #FCA5A5; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #F0FDF4; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }

  .config-card-single { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 14px 0; font-size: 0.86rem; line-height: 1.8; animation: cardSlideIn 0.4s ease; }
  @keyframes cardSlideIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }

  .compare-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin: 10px 0; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
  .compare-table td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; }
  .compare-table tr:last-child td { border-bottom: none; }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #1E293B; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; transition: all 0.2s; }
  .opt-btn:hover { border-color: #94A3B8; }
  .opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }
  .qcheck-note { font-size: 0.82rem; margin-top: 8px; padding: 10px 12px; border-radius: 8px; }
  .qcheck-note.wrong { background: #FEF2F2; color: #991B1B; }
  .qcheck-note.correct { background: #F0FDF4; color: #14532D; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin: 20px auto; max-width: 1200px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; animation: slideIn 0.4s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  /* ── RIGHT SIDE STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 420px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; text-align: center; }

  /* ── Live circuit schematic — the JwtUtil blueprint board ── */
  .schematic-board { background: #0B1220; background-image: linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px); background-size: 18px 18px; border-radius: 12px; padding: 20px 16px; min-height: 300px; position: relative; }
  .sch-node { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sch-chip { border: 1.5px solid #334155; border-radius: 8px; padding: 10px 14px; background: #111827; color: #64748B; font-family: monospace; font-size: 0.7rem; text-align: center; min-width: 100px; transition: all 0.4s ease; }
  .sch-chip.powered { border-color: #10B981; color: #6EE7B7; background: rgba(16,185,129,0.08); box-shadow: 0 0 14px rgba(16,185,129,0.35); }
  .sch-chip.warning-chip { border-color: #F59E0B; color: #FCD34D; background: rgba(245,158,11,0.08); }
  .sch-node-lbl { font-size: 0.62rem; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }

  .sch-wire-row { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 10px 0; flex-wrap: wrap; }
  .sch-wire { width: 34px; height: 2px; background: #1F2937; position: relative; overflow: visible; }
  .sch-wire.live-wire { background: #10B981; }
  @keyframes pulseTravel { 0% { left: -6px; opacity: 0; } 15% { opacity: 1; } 100% { left: 100%; opacity: 1; } }
  .sch-pulse { position: absolute; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: #34D399; box-shadow: 0 0 8px #34D399; animation: pulseTravel 0.8s ease forwards; }

  .sch-row { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; }

  @keyframes plugSocket { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .sch-plug-in { animation: plugSocket 0.4s ease; }

  .sch-battery { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sch-battery-bars { display: flex; gap: 2px; }
  .sch-battery-bar { width: 5px; height: 14px; background: #1F2937; border-radius: 1px; }
  .sch-battery-bar.filled { background: #F59E0B; }

  .sch-status-line { text-align: center; margin-top: 14px; color: #10B981; font-weight: 800; font-size: 0.8rem; }

  /* jwt string */
  .jwt-string-row { display: flex; align-items: center; justify-content: center; gap: 2px; font-family: monospace; font-size: 0.68rem; font-weight: 700; flex-wrap: wrap; padding: 12px; background: #0F172A; border-radius: 10px; }

  .printer-chip { text-align: center; padding: 10px; margin-bottom: 8px; border-radius: 10px; background: #F8FAFC; border: 1.5px solid #E2E8F0; font-size: 0.72rem; font-weight: 700; color: #94A3B8; }
  .printer-chip.printing { animation: printerFlash 0.7s ease; background: #F0FDF4; border-color: #16A34A; color: #16A34A; }
  @keyframes printerFlash { 0% { transform: scale(0.95); opacity: 0.4; } 40% { transform: scale(1.03); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  .jwt-seg-h { color: #93C5FD; } .jwt-seg-p { color: #6EE7B7; } .jwt-seg-s { color: #FCD34D; }
  .jwt-dot { color: #64748B; }

  /* JWT.IO mockup */
  .jwtio-mock { border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-top: 14px; }
  .jwtio-top { background: #F1F5F9; padding: 8px 12px; font-size: 0.7rem; font-weight: 800; color: #64748B; }
  .jwtio-body { padding: 12px; font-family: monospace; font-size: 0.7rem; color: #475569; }
  .jwtio-decoded { background: #F0FDF4; border-radius: 6px; padding: 8px 10px; margin-top: 8px; color: #14532D; }

  .before-after-row { display: flex; flex-direction: column; gap: 10px; }
  .ba-box { border-radius: 10px; padding: 12px 14px; font-family: monospace; font-size: 0.72rem; }
  .ba-box.before-box { background: #FFFBEB; color: #92400E; }
  .ba-box.after-box { background: #F0FDF4; color: #14532D; border: 1.5px solid #86EFAC; }

  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #F0FDF4; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
`;

function useSounds() {
  const muted = useRef(false);
  const ctxRef = useRef(null);
  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      const makeOsc = (freq, start, dur, wave = 'sine') => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      if (type === 'add') { makeOsc(220, 0, 0.15); makeOsc(440, 0.05, 0.15); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); }
      else if (type === 'remove') { makeOsc(440, 0, 0.1); makeOsc(220, 0.05, 0.1); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); }
      else if (type === 'correct') { [523, 659, 784].forEach((f,i) => makeOsc(f, i*0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === 'warn') { makeOsc(330, 0, 0.2); makeOsc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === 'tick') { makeOsc(800, 0, 0.05, 'triangle'); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); }
      else if (type === 'reveal') { [523,659,784,1047].forEach((f,i) => makeOsc(f, i*0.12, 0.2)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6); }
      else if (type === 'submit') { makeOsc(392, 0, 0.4); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); }
    } catch (e) {}
  }, []);
  return { play, muted };
}

function CopyBlock({ code, children }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    try { navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code-block">
      <button className="copy-btn" onClick={doCopy}>{copied ? 'Copied!' : 'Copy'}</button>
      {children}
    </div>
  );
}

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="collapsible">
      <div className="collapsible-head" onClick={() => setOpen(o => !o)}>
        <span>⚠️ {title}</span><span>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

const STEPS = ['Dependencies', 'Secret Key', '@Component + @Value', 'JwtUtil', 'Login + Test'];

export default function JwtUtilBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1);
  const [step, setStep] = useState(1);

  const railRef = useRef(null);
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) { isFirstStepRender.current = false; return; }
    if (railRef.current) railRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Step 1: dependencies ──
  const [step1Done, setStep1Done] = useState(false);
  function toggleStep1() {
    if (!step1Done) { play('add'); setTimeout(() => setStep(2), 400); }
    setStep1Done(d => !d);
  }

  // ── Step 2: secret key ──
  const [step2Done, setStep2Done] = useState(false);
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: @Component + @Value ──
  const [conceptCardIdx, setConceptCardIdx] = useState(1); // 1 or 2
  const [valueAnswer, setValueAnswer] = useState(null);
  function nextConceptCard() { play('tick'); setConceptCardIdx(2); }
  function gotItConcept() { play('tick'); setConceptCardIdx(3); }
  function answerValueQ(val) {
    if (valueAnswer === 'B') return;
    setValueAnswer(val);
    if (val === 'B') play('correct'); else play('warn');
  }
  function toStep4() { play('tick'); setStep(4); }

  // ── Step 4: JwtUtil (signWith blank) ──
  const [signWithInput, setSignWithInput] = useState('');
  const [signWithCorrect, setSignWithCorrect] = useState(false);
  const [signWithWrong, setSignWithWrong] = useState(false);
  const [jwtUtilCardIdx, setJwtUtilCardIdx] = useState(0);
  const [step4Done, setStep4Done] = useState(false);

  function submitSignWith() {
    if (signWithInput.trim().toLowerCase() === 'signwith') {
      setSignWithCorrect(true);
      setSignWithWrong(false);
      play('add');
      setJwtUtilCardIdx(1);
    } else {
      setSignWithWrong(true);
      play('warn');
    }
  }
  function nextJwtUtilCard() { play('tick'); setJwtUtilCardIdx(i => i + 1); }
  function toggleStep4() {
    if (!step4Done) { play('add'); setTimeout(() => setStep(5), 400); }
    setStep4Done(d => !d);
  }

  // ── Step 5: login update + test ──
  const [generateAnswer, setGenerateAnswer] = useState(null);
  const [loginTokenDone, setLoginTokenDone] = useState(false);
  const [jwtIoDone, setJwtIoDone] = useState(false);
  const [printerRun, setPrinterRun] = useState(false);

  function answerGenerate(val) {
    if (generateAnswer === 'generateToken') return;
    setGenerateAnswer(val);
    if (val === 'generateToken') { play('add'); setPrinterRun(true); }
    else play('warn');
  }
  function toggleLoginToken() { if (!loginTokenDone) play('add'); setLoginTokenDone(d => !d); }
  const jwtIoFiredRef = useRef(false);
  function toggleJwtIo() {
    if (!jwtIoDone) {
      play('correct');
      if (loginTokenDone && !jwtIoFiredRef.current) {
        jwtIoFiredRef.current = true;
        setTimeout(() => play('reveal'), 1000);
      }
    }
    setJwtIoDone(d => !d);
  }

  const phase1Complete = loginTokenDone && jwtIoDone;
  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (phase1Complete && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 7) clearInterval(iv); }, 480);
      }, 1300);
    }
  }, [phase1Complete]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [files, setFiles] = useState({ deps: false, props: false, jwtUtil: false });
  const [loginTasks, setLoginTasks] = useState({ controller: false, autowired: false });
  const [tested, setTested] = useState({ tokenReturned: false, jwtioInspected: false });
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleFile(key) { setFiles(f => { const nv = !f[key]; if (nv) play('add'); return { ...f, [key]: nv }; }); }
  function toggleLoginTask(key) { setLoginTasks(f => { const nv = !f[key]; if (nv) play('add'); return { ...f, [key]: nv }; }); }
  const allTestedFiredRef = useRef(false);
  function toggleTested(key) {
    setTested(t => {
      const nv = { ...t, [key]: !t[key] };
      if (nv.tokenReturned && nv.jwtioInspected && !allTestedFiredRef.current) { allTestedFiredRef.current = true; play('correct'); }
      else if (!t[key]) play('add');
      return nv;
    });
  }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const allFilesCreated = files.deps && files.props && files.jwtUtil;
  const loginUpdated = loginTasks.controller && loginTasks.autowired;
  const tokenTested = tested.tokenReturned && tested.jwtioInspected;
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = allFilesCreated && loginUpdated && tokenTested && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t2-s2-jwt-util-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { dependenciesAdded: step1Done },
            slot2: { secretKeyAdded: step2Done },
            slot3: { componentUnderstood: conceptCardIdx >= 2, valueUnderstood: conceptCardIdx >= 3, valueQuestion: valueAnswer },
            slot4: { signWithBlank: signWithInput, jwtUtilCreated: step4Done },
            slot5: { generateTokenBlank: generateAnswer, loginReturnsToken: loginTokenDone, inspectedAtJwtIo: jwtIoDone },
          },
          phase2: {
            allFilesCreated,
            loginUpdated,
            tokenTested,
            committedToGitHub: committed,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="jub-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>JwtUtil + Login Returns Token</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      {phase === 1 && (
        <>
          <div className="progress-strip">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className={`p-line${step > i ? ' done' : ''}`} />}
                <div className={`p-pill${step > i + 1 ? ' done' : step === i + 1 ? ' active' : ''}`}>{label}</div>
              </React.Fragment>
            ))}
          </div>

          <div className="layout">
            <div className="left-col" ref={railRef}>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 1 — Add JWT library</h2>
                  <div className="amber-card">
                    Your college needs a card-printing machine to make ID cards. The machine does not come with your college building. You order it separately.<br /><br />
                    jjwt is that machine — ordered via pom.xml.
                  </div>
                  <CopyBlock code={`<dependency>\n  <groupId>io.jsonwebtoken</groupId>\n  <artifactId>jjwt-api</artifactId>\n  <version>0.11.5</version>\n</dependency>\n<dependency>\n  <groupId>io.jsonwebtoken</groupId>\n  <artifactId>jjwt-impl</artifactId>\n  <version>0.11.5</version>\n  <scope>runtime</scope>\n</dependency>\n<dependency>\n  <groupId>io.jsonwebtoken</groupId>\n  <artifactId>jjwt-jackson</artifactId>\n  <version>0.11.5</version>\n  <scope>runtime</scope>\n</dependency>`}>
                    <span className="code-comment">{'<!-- JWT library — all three needed -->'}</span>{'\n'}
                    <span className="code-tag">{'<dependency>'}</span>{'\n'}{'  '}io.jsonwebtoken / jjwt-api / 0.11.5{'\n'}<span className="code-tag">{'</dependency>'}</span>{'\n'}
                    <span className="code-tag">{'<dependency>'}</span>{'\n'}{'  '}io.jsonwebtoken / jjwt-impl / 0.11.5 (runtime){'\n'}<span className="code-tag">{'</dependency>'}</span>{'\n'}
                    <span className="code-tag">{'<dependency>'}</span>{'\n'}{'  '}io.jsonwebtoken / jjwt-jackson / 0.11.5 (runtime){'\n'}<span className="code-tag">{'</dependency>'}</span>
                  </CopyBlock>
                  <div className="blue-card">
                    Three dependencies — one library. They work together as a team.<br />
                    jjwt-api: the interface. jjwt-impl: the implementation. jjwt-jackson: JSON support.
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Add all three inside &lt;dependencies&gt; in pom.xml. Save. Maven downloads.</p>
                  <Collapsible title="BUILD FAILURE">
                    Check version is 0.11.5<br />Check inside &lt;dependencies&gt;<br />Check internet is on
                  </Collapsible>
                  <label className={`checkbox-row${step1Done ? ' checked' : ''}`}>
                    <input type="checkbox" checked={step1Done} onChange={toggleStep1} />
                    ✅ Three jjwt dependencies added — BUILD SUCCESS
                  </label>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 2 — The principal's stamp</h2>
                  <div className="amber-card">
                    The ID card office has a special stamp. Only they have it. Any card without this exact stamp is fake and rejected.<br /><br />
                    Your server's secret key is that stamp. Never share it. Never put it in GitHub.
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Open application.properties. Add two new lines:</p>
                  <CopyBlock code={`jwt.secret=mySecretKey1234567890ABCDEFGHIJKLMNOP\njwt.expiration=86400000`}>
                    <span className="code-comment">// secret key — never commit to GitHub{'\n'}</span>
                    jwt.secret=mySecretKey1234567890ABCDEFGHIJKLMNOP{'\n\n'}
                    <span className="code-comment">// expiry — 86400000ms = 24 hours{'\n'}</span>
                    jwt.expiration=86400000
                  </CopyBlock>
                  <div className="blue-card">
                    <b>jwt.secret</b> — The stamp. Minimum 32 characters. Use a long random string. Must never be shared publicly.<br /><br />
                    ⚠️ If you committed application.properties to GitHub earlier — check .gitignore.
                  </div>
                  <div className="blue-card">
                    <b>jwt.expiration</b> — How long a token is valid. 86400000 milliseconds = 24 hours. After 24 hours — user logs in again.
                  </div>
                  <label className={`checkbox-row${step2Done ? ' checked' : ''}`}>
                    <input type="checkbox" checked={step2Done} onChange={toggleStep2} />
                    ✅ Secret key and expiry added to application.properties
                  </label>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Two new annotations before building JwtUtil</h2>

                  {conceptCardIdx === 1 && (
                    <div className="config-card-single">
                      <b>@Component</b><br /><br />
                      You know @Bean — creates ONE object and registers it.<br /><br />
                      @Component marks an ENTIRE CLASS as a shared Spring Boot tool. Spring Boot automatically creates one instance of the class. @Autowired delivers it anywhere.<br /><br />
                      @Component is simpler for utility classes like JwtUtil. Use @Bean when you need more control. Use @Component when the class just needs to exist and be shared.
                      <CopyBlock code={`@Component  // whole class = shared tool\npublic class JwtUtil {\n    // any class can @Autowired this\n}`}>
                        <span className="code-tag">@Component</span> <span className="code-comment">// whole class = shared tool{'\n'}</span>
                        public class JwtUtil {'{'}{'\n'}{'    '}<span className="code-comment">// any class can @Autowired this{'\n'}</span>{'}'}
                      </CopyBlock>
                      <button className="btn" onClick={nextConceptCard}>Next →</button>
                    </div>
                  )}

                  {conceptCardIdx === 2 && (
                    <div className="config-card-single">
                      <b>@Value</b><br /><br />
                      application.properties is like a settings file for your app.<br /><br />
                      @Value reads one setting from it and puts the value into a field.<br /><br />
                      <code>@Value("${'{'}jwt.secret{'}'}")</code> ↑ reads jwt.secret from properties. The ${'{'}{'}'} syntax means: "look this up in application.properties."<br /><br />
                      Why use this instead of hardcoding? You can change the secret key without changing Java code. Just change the properties file.
                      <CopyBlock code={`@Value("\${jwt.secret}")\nprivate String secret;\n\n@Value("\${jwt.expiration}")\nprivate long expiration;`}>
                        <span className="code-tag">@Value</span>("$&#123;jwt.secret&#125;"){'\n'}private String secret;{'\n\n'}
                        <span className="code-tag">@Value</span>("$&#123;jwt.expiration&#125;"){'\n'}private long expiration;
                      </CopyBlock>
                      <button className="btn" onClick={gotItConcept}>Got it →</button>
                    </div>
                  )}

                  {conceptCardIdx === 3 && (
                    <div className="q-card">
                      <p className="q-title">What does @Value("${'{'}jwt.secret{'}'}") do?</p>
                      {[
                        ['A', 'Creates a new secret key'],
                        ['B', 'Reads jwt.secret from application.properties and stores it in the field'],
                        ['C', 'Encrypts the secret key'],
                        ['D', 'Connects to MySQL'],
                      ].map(([k, label]) => (
                        <button key={k} className={`opt-btn${valueAnswer === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerValueQ(k)}>{k}) {label}</button>
                      ))}
                      {valueAnswer && valueAnswer !== 'B' && <div className="qcheck-note wrong">@Value reads the value from application.properties into the field.</div>}
                      {valueAnswer === 'B' && <div className="qcheck-note correct">Correct!</div>}
                      {valueAnswer === 'B' && <button className="btn" onClick={toStep4}>Continue →</button>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 3 — Build the ID card printer</h2>
                  <div className="amber-card">
                    JwtUtil is the ID card office.<br /><br />
                    Two jobs: generateToken() → print the card. validateToken() → check if card is real. That is all it does.
                  </div>

                  <CopyBlock code={`@Component\npublic class JwtUtil {\n\n    @Value("\${jwt.secret}")\n    private String secret;\n    @Value("\${jwt.expiration}")\n    private long expiration;\n\n    private Key getKey() {\n        return Keys.hmacShaKeyFor(secret.getBytes());\n    }\n\n    public String generateToken(String username) {\n        return Jwts.builder()\n            .setSubject(username)\n            .setIssuedAt(new Date())\n            .setExpiration(new Date(System.currentTimeMillis() + expiration))\n            .signWith(getKey(), SignatureAlgorithm.HS256)\n            .compact();\n    }\n}`}>
                    <span className="code-tag">@Component</span>{'\n'}public class JwtUtil {'{'}{'\n\n'}
                    {'    '}...@Value secret, expiration...{'\n\n'}
                    {'    '}private Key getKey() {'{'}{'\n'}
                    {'        '}return Keys.hmacShaKeyFor(secret.getBytes());{'\n'}
                    <span className="code-comment">        {'    '}// converts secret string → signing key{'\n'}</span>
                    {'    '}{'}'}{'\n\n'}
                    <span className="code-comment">    // PRINT THE CARD{'\n'}</span>
                    {'    '}public String generateToken(String username) {'{'}{'\n'}
                    {'        '}return Jwts.builder(){'\n'}
                    {'            '}.setSubject(username) <span className="code-comment">// who this is for{'\n'}</span>
                    {'            '}.setIssuedAt(new Date()) <span className="code-comment">// created now{'\n'}</span>
                    {'            '}.setExpiration(new Date(System.currentTimeMillis() + expiration)){'\n'}
                    {'            '}.{signWithCorrect ? <span className="code-blank-done">signWith</span> : '[___]'}(getKey(), SignatureAlgorithm.HS256){'\n'}
                    {'            '}.compact(); <span className="code-comment">// build token string{'\n'}</span>
                    {'    '}{'}'}{'\n'}{'}'}
                  </CopyBlock>

                  {!signWithCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">The last step before .compact() is stamping the token with the secret key. What method stamps it? (sign = stamp, With = using the key)</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="signWith" value={signWithInput} onChange={e => { setSignWithInput(e.target.value); setSignWithWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitSignWith}>Check</button>
                      </div>
                      {signWithWrong && <div className="blank-feedback wrong">The method is signWith() — signs the token with the secret key. Like the principal's stamp.</div>}
                    </div>
                  )}

                  {signWithCorrect && (
                    <>
                      <CopyBlock code={`// CHECK IF CARD IS REAL\npublic String validateToken(String token) {\n    return Jwts.parserBuilder()\n        .setSigningKey(getKey())\n        .build()\n        .parseClaimsJws(token)\n        .getBody()\n        .getSubject();\n}`}>
                        <span className="code-comment">// CHECK IF CARD IS REAL{'\n'}</span>
                        public String validateToken(String token) {'{'}{'\n'}
                        {'    '}return Jwts.parserBuilder(){'\n'}
                        {'        '}.setSigningKey(getKey()) <span className="code-comment">// use our stamp{'\n'}</span>
                        {'        '}.build(){'\n'}
                        {'        '}.parseClaimsJws(token) <span className="code-comment">// verify stamp{'\n'}</span>
                        {'        '}.getBody(){'\n'}
                        {'        '}.getSubject(); <span className="code-comment">// return username{'\n'}</span>
                        <span className="code-comment">    // throws exception if fake or expired{'\n'}</span>
                        {'}'}
                      </CopyBlock>

                      {jwtUtilCardIdx === 1 && (
                        <div className="config-card-single">
                          <b>generateToken()</b><br /><br />
                          Sets username, issue time, expiry. Signs with secret key (signWith). .compact() builds the token string. Returns: 'eyJhbGci...'
                          <button className="btn" onClick={nextJwtUtilCard}>Next →</button>
                        </div>
                      )}
                      {jwtUtilCardIdx === 2 && (
                        <div className="config-card-single">
                          <b>validateToken()</b><br /><br />
                          Takes the token string. Uses secret key to verify signature. If stamp is wrong → exception → 401. If expired → exception → 401. If valid → returns username.
                          <button className="btn" onClick={() => { play('tick'); setJwtUtilCardIdx(3); }}>Got it →</button>
                        </div>
                      )}
                      {jwtUtilCardIdx >= 3 && (
                        <label className={`checkbox-row${step4Done ? ' checked' : ''}`}>
                          <input type="checkbox" checked={step4Done} onChange={toggleStep4} />
                          ✅ JwtUtil.java created
                        </label>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 4 — Login returns the real token</h2>
                  <div className="amber-card">
                    Login used to return: 'Login successful: gymowner'<br /><br />
                    Now it returns: {'{'} 'token': 'eyJhbGci...' {'}'}<br /><br />
                    Two small changes: Return type String → Map&lt;String, String&gt;. On success: return the token.
                  </div>

                  <CopyBlock code={`@Autowired\nprivate JwtUtil jwtUtil;\n\n@PostMapping("/login")\npublic Map<String, String> login(@RequestBody User loginRequest) {\n    Optional<User> found = userRepository.findByUsername(loginRequest.getUsername());\n    if (found.isEmpty()) return Map.of("error", "User not found");\n    boolean match = passwordEncoder.matches(loginRequest.getPassword(), found.get().getPassword());\n    if (!match) return Map.of("error", "Wrong password");\n    String token = jwtUtil.generateToken(found.get().getUsername());\n    return Map.of("token", token);\n}`}>
                    <span className="code-tag">@Autowired</span>{'\n'}private JwtUtil jwtUtil;{'\n\n'}
                    <span className="code-tag">@PostMapping</span>("/login"){'\n'}
                    public Map{'<String, String>'} login(...) {'{'}{'\n'}
                    {'    '}Optional{'<User>'} found = userRepository.findByUsername(...);{'\n'}
                    {'    '}if (found.isEmpty()) return Map.of("error", "User not found");{'\n'}
                    {'    '}boolean match = passwordEncoder.matches(...);{'\n'}
                    {'    '}if (!match) return Map.of("error", "Wrong password");{'\n'}
                    {'    '}String token = jwtUtil.{generateAnswer === 'generateToken' ? <span className="code-blank-done">generateToken</span> : '[___]'}(found.get().getUsername());{'\n'}
                    {'    '}return Map.of("token", token);{'\n'}{'}'}
                  </CopyBlock>

                  {generateAnswer !== 'generateToken' && (
                    <div className="blank-panel">
                      <div className="blank-label">JwtUtil has two methods. generateToken() → prints the card. validateToken() → checks the card. Which one creates a new token?</div>
                      <div className="blank-opts">
                        {['generateToken', 'validateToken', 'createToken', 'signToken'].map(opt => (
                          <button key={opt} className={`blank-opt-btn${generateAnswer === opt && opt !== 'generateToken' ? ' wrong' : ''}`} onClick={() => answerGenerate(opt)}>{opt}</button>
                        ))}
                      </div>
                      {generateAnswer && generateAnswer !== 'generateToken' && <div className="blank-feedback wrong">generateToken() creates the token. validateToken() checks it.</div>}
                    </div>
                  )}

                  {generateAnswer === 'generateToken' && (
                    <>
                      <div className="blue-card">
                        Map.of('token', token) creates a simple JSON response: {'{'} 'token': 'eyJhbGci...' {'}'}<br /><br />
                        Map.of('error', 'Wrong password') creates: {'{'} 'error': 'Wrong password' {'}'}<br /><br />
                        Spring Boot converts Map → JSON automatically — same as it does for List and domain objects.
                      </div>

                      <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Restart your server. Open Postman:</p>
                      <CopyBlock code={`POST localhost:8080/auth/login\n\n{\n  "username": "gymowner",\n  "password": "gym@123"\n}`}>
                        POST /auth/login{'\n\n'}{'{'}{'\n'}{'  '}"username": "gymowner",{'\n'}{'  '}"password": "gym@123"{'\n'}{'}'}
                      </CopyBlock>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Expected: {'{'} "token": "eyJhbGciOiJIUzI1NiJ9..." {'}'}</p>

                      <div className="green-card">
                        Copy the token. Open JWT.IO in your browser. Paste the token.<br /><br />
                        You will see it decoded:<br />
                        Header: {'{'} 'alg': 'HS256' {'}'}<br />
                        Payload: {'{'} 'sub': 'gymowner', 'iat': 1735..., 'exp': 1735... {'}'}<br /><br />
                        Your username is inside. The expiry is set. The signature is valid. ✅
                      </div>

                      <label className={`checkbox-row${loginTokenDone ? ' checked' : ''}`}>
                        <input type="checkbox" checked={loginTokenDone} onChange={toggleLoginToken} />
                        ✅ Login returns {'{'} "token": "eyJ..." {'}'}
                      </label>
                      <label className={`checkbox-row${jwtIoDone ? ' checked' : ''}`}>
                        <input type="checkbox" checked={jwtIoDone} onChange={toggleJwtIo} />
                        ✅ Inspected token at JWT.IO — saw my username in payload
                      </label>
                    </>
                  )}
                </div>
              )}

              {revealCount > 0 && (
                <div className="reveal-card">
                  <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
                  {revealCount >= 1 && <div className="reveal-line">✅ <span><b>jjwt</b> → JWT library for Java — generates and validates tokens</span></div>}
                  {revealCount >= 2 && <div className="reveal-line">✅ <span><b>@Component</b> → marks whole class as shared Spring Boot tool — @Autowired delivers it</span></div>}
                  {revealCount >= 3 && <div className="reveal-line">✅ <span><b>@Value("${'{'}key{'}'}")</b> → reads value from application.properties</span></div>}
                  {revealCount >= 4 && <div className="reveal-line">✅ <span><b>generateToken(username)</b> → creates signed JWT — username + expiry + secret stamp</span></div>}
                  {revealCount >= 5 && <div className="reveal-line">✅ <span><b>validateToken(token)</b> → verifies signature — returns username or throws exception</span></div>}
                  {revealCount >= 6 && <div className="reveal-line">✅ <span><b>Map.of("key", value)</b> → creates simple JSON response</span></div>}
                  {revealCount >= 7 && <div className="reveal-line">✅ <span><b>JWT.IO</b> → website to decode and inspect JWT tokens</span></div>}
                  {revealCount >= 7 && (
                    <>
                      <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                        Login now returns a real JWT token. The gym membership card is printed.<br /><br />
                        But your API still cannot read it.<br /><br />
                        Next — 3.2.3. JwtFilter reads the token on every request. After that — your full JWT flow is complete.
                      </p>
                      <button className="btn" onClick={goToPhase2}>Build for YOUR project →</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="right-col">
              <div className="sticky-panel">
                <StagePanel
                  step={step} conceptCardIdx={conceptCardIdx} valueAnswer={valueAnswer}
                  signWithCorrect={signWithCorrect} generateAnswer={generateAnswer}
                  loginTokenDone={loginTokenDone} jwtIoDone={jwtIoDone} printerRun={printerRun}
                  play={play}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ gridTemplateColumns: '1fr', maxWidth: 900 }}>
          <div className="card">
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Add JwtUtil to YOUR project</h2>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — Files and config</h3>
            <label className={`task-item${files.deps ? ' checked' : ''}`}>
              <input type="checkbox" checked={files.deps} onChange={() => toggleFile('deps')} />
              Three jjwt dependencies in pom.xml
            </label>
            <label className={`task-item${files.props ? ' checked' : ''}`}>
              <input type="checkbox" checked={files.props} onChange={() => toggleFile('props')} />
              jwt.secret and jwt.expiration in application.properties
            </label>
            <label className={`task-item${files.jwtUtil ? ' checked' : ''}`}>
              <input type="checkbox" checked={files.jwtUtil} onChange={() => toggleFile('jwtUtil')} />
              JwtUtil.java created (@Component, @Value, generateToken, validateToken)
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — Update login</h3>
            <label className={`task-item${loginTasks.controller ? ' checked' : ''}`}>
              <input type="checkbox" checked={loginTasks.controller} onChange={() => toggleLoginTask('controller')} />
              AuthController updated — login now returns Map with token
            </label>
            <label className={`task-item${loginTasks.autowired ? ' checked' : ''}`}>
              <input type="checkbox" checked={loginTasks.autowired} onChange={() => toggleLoginTask('autowired')} />
              @Autowired JwtUtil added to controller
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — Test</h3>
            <label className={`task-item${tested.tokenReturned ? ' checked' : ''}`}>
              <input type="checkbox" checked={tested.tokenReturned} onChange={() => toggleTested('tokenReturned')} />
              Login returns {'{'} "token": "eyJ..." {'}'}
            </label>
            <label className={`task-item${tested.jwtioInspected ? ' checked' : ''}`}>
              <input type="checkbox" checked={tested.jwtioInspected} onChange={() => toggleTested('jwtioInspected')} />
              Inspected at JWT.IO — my username visible in payload
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 — Commit</h3>
            <CopyBlock code={`git add .\ngit commit -m "add JwtUtil — login now returns JWT token"\ngit push origin main`}>
              git add .{'\n'}git commit -m "add JwtUtil — login now{'\n'}{'  '}returns JWT token"{'\n'}git push origin main
            </CopyBlock>
            <label className={`task-item${committed ? ' checked' : ''}`}>
              <input type="checkbox" checked={committed} onChange={toggleCommitted} />
              ✅ Committed and pushed
            </label>

            {allFilesCreated && loginUpdated && tokenTested && committed && (
              <>
                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                  In one sentence — what does generateToken() do and what information goes inside the token?
                </p>
                <textarea
                  className="reflection-box"
                  placeholder="generateToken() takes a username and creates a signed JWT token that contains the username, the issue time, and an expiry time — all stamped with the secret key so it cannot be tampered with..."
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                />
                <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                  {submitted ? 'Submitted ✅' : 'Login returns JWT — teach API to read it next →'}
                </button>

                {submitted && (
                  <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                    <b>JwtUtil is working. 🎫</b><br /><br />
                    ✅ Login returns real JWT token<br />
                    ✅ Token contains username + expiry<br />
                    ✅ Signed with secret key<br />
                    ✅ Verified at JWT.IO<br /><br />
                    Next — 3.2.3.<br />
                    JwtFilter reads the token on every request. Verifies it using validateToken(). Lets valid requests through. Blocks invalid ones with 401.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StagePanel({ step, conceptCardIdx, valueAnswer, signWithCorrect, generateAnswer, loginTokenDone, jwtIoDone, printerRun }) {
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'JwtUtil schematic — power source'}
        {step === 2 && 'JwtUtil schematic — battery installed'}
        {step === 3 && 'JwtUtil schematic — wiring junctions'}
        {step === 4 && 'JwtUtil schematic — the signing chip'}
        {step === 5 && 'Login before / after'}
      </div>

      {step === 1 && (
        <div className="schematic-board">
          <div className="sch-row">
            <div className="sch-node">
              <div className="sch-chip">spring-boot-starter-web</div>
              <div className="sch-node-lbl">installed</div>
            </div>
            <div className="sch-node">
              <div className="sch-chip">spring-security</div>
              <div className="sch-node-lbl">installed</div>
            </div>
          </div>
          <div className="sch-row" style={{ marginTop: 10 }}>
            <div className="sch-node">
              <div className="sch-chip">mysql-connector-j</div>
              <div className="sch-node-lbl">installed</div>
            </div>
            <div className="sch-node">
              <div className="sch-chip">spring-data-jpa</div>
              <div className="sch-node-lbl">installed</div>
            </div>
          </div>
          <div className="sch-row" style={{ marginTop: 16 }}>
            <div className="sch-node sch-plug-in" style={{ animationDelay: '0.1s' }}>
              <div className="sch-chip powered">jjwt-api</div>
              <div className="sch-node-lbl">plugged in — new</div>
            </div>
            <div className="sch-node sch-plug-in" style={{ animationDelay: '0.3s' }}>
              <div className="sch-chip powered">jjwt-impl</div>
              <div className="sch-node-lbl">plugged in — new</div>
            </div>
            <div className="sch-node sch-plug-in" style={{ animationDelay: '0.5s' }}>
              <div className="sch-chip powered">jjwt-jackson</div>
              <div className="sch-node-lbl">plugged in — new</div>
            </div>
          </div>
          <div className="sch-status-line">Power source ready ⚡</div>
        </div>
      )}

      {step === 2 && (
        <div className="schematic-board">
          <div className="sch-row">
            <div className="sch-battery">
              <div className="sch-battery-bars">
                <div className="sch-battery-bar filled" />
                <div className="sch-battery-bar filled" />
                <div className="sch-battery-bar filled" />
              </div>
              <div className="sch-chip warning-chip">jwt.secret</div>
              <div className="sch-node-lbl">the stamp — 32+ chars</div>
            </div>
            <div className="sch-wire live-wire"><span className="sch-pulse" style={{ animationDelay: '0.2s' }} /></div>
            <div className="sch-node">
              <div className="sch-chip powered">jwt.expiration</div>
              <div className="sch-node-lbl">86400000ms = 24h</div>
            </div>
          </div>
          <div className="sch-status-line">🔏 Principal's stamp wired in ✅</div>
        </div>
      )}

      {step === 3 && (
        <div className="schematic-board">
          {conceptCardIdx <= 2 ? (
            <div className="sch-row" style={{ flexDirection: 'column', gap: 14 }}>
              <div className="sch-node">
                <div className="sch-chip powered" style={{ minWidth: 160 }}>@Component<br /><span style={{ fontWeight: 400, fontSize: '0.65rem' }}>JwtUtil — one shared instance</span></div>
              </div>
              <div className="sch-wire live-wire" style={{ width: 2, height: 30 }}><span className="sch-pulse" style={{ animationDelay: '0.2s' }} /></div>
              <div className="sch-node">
                <div className="sch-chip">@Autowired</div>
                <div className="sch-node-lbl">AuthController taps in</div>
              </div>
            </div>
          ) : (
            <div className="sch-row">
              <div className="sch-node">
                <div className="sch-chip">application.properties<br /><span style={{ fontSize: '0.62rem' }}>jwt.secret=mySecretKey...</span></div>
              </div>
              <div className="sch-wire live-wire"><span className="sch-pulse" style={{ animationDelay: '0.2s' }} /></div>
              <div className="sch-node">
                <div className="sch-chip powered">@Value field<br /><span style={{ fontSize: '0.62rem' }}>private String secret;</span></div>
                <div className="sch-node-lbl">junction wired</div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="schematic-board">
          <div className="sch-row">
            <div className="sch-node">
              <div className="sch-chip">input<br /><span style={{ fontSize: '0.62rem' }}>"gymowner"</span></div>
            </div>
            <div className={`sch-wire${signWithCorrect ? ' live-wire' : ''}`}>{signWithCorrect && <span className="sch-pulse" style={{ animationDelay: '0.1s' }} />}</div>
            <div className="sch-node">
              <div className={`sch-chip${signWithCorrect ? ' powered' : ''}`}>signWith()<br /><span style={{ fontSize: '0.62rem' }}>stamps with secret</span></div>
            </div>
            <div className={`sch-wire${signWithCorrect ? ' live-wire' : ''}`}>{signWithCorrect && <span className="sch-pulse" style={{ animationDelay: '0.3s' }} />}</div>
            <div className="sch-node">
              <div className={`sch-chip${signWithCorrect ? ' powered' : ''}`}>output<br /><span style={{ fontSize: '0.62rem' }}>{signWithCorrect ? 'eyJhbGci...' : '?'}</span></div>
            </div>
          </div>
          {signWithCorrect && <div className="sch-status-line">generateToken() chip powered ⚡</div>}
        </div>
      )}

      {step === 5 && (
        <div className="before-after-row">
          <div className="ba-box before-box">POST /auth/login<br />→ "Login successful: gymowner"<br /><span style={{ opacity: 0.7 }}>(plain text — no token)</span></div>
          <div className="ba-box after-box">POST /auth/login<br />→ {'{'} "token": "eyJhbGci..." {'}'}<br /><span style={{ opacity: 0.8 }}>(real JWT — carry it)</span></div>

          {generateAnswer === 'generateToken' && (
            <>
              {printerRun && (
                <div className="printer-chip printing" key="printer-flash">🖨️ generateToken() printing your JWT...</div>
              )}
              <div className="jwt-string-row">
                <span className="jwt-seg-h">eyJhbGci...</span><span className="jwt-dot">.</span>
                <span className="jwt-seg-p">eyJ1c2Vy...</span><span className="jwt-dot">.</span>
                <span className="jwt-seg-s">SflKxwRJ...</span>
              </div>
              <div className="jwtio-mock">
                <div className="jwtio-top">jwt.io — decoded</div>
                <div className="jwtio-body">
                  Payload:
                  <div className="jwtio-decoded">{'{'} "sub": "gymowner", "iat": ..., "exp": ... {'}'}</div>
                  {jwtIoDone && <div style={{ color: '#16A34A', fontWeight: 700, marginTop: 6 }}>Your username is inside ✅</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
