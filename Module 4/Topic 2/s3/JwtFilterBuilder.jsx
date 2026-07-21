import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .jfb-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .jfb-root * { box-sizing: border-box; }
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

  .blank-panel { background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .blank-label { color: #FDE68A; font-size: 0.8rem; margin-bottom: 10px; line-height: 1.6; }
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
  .btn.secondary { background: #fff; color: #DC2626; border: 1.5px solid #FECACA; }

  .config-card-single { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 14px 0; font-size: 0.86rem; line-height: 1.8; animation: cardSlideIn 0.4s ease; }
  @keyframes cardSlideIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }

  .substring-visual { display: flex; align-items: center; justify-content: center; gap: 2px; font-family: monospace; font-size: 0.9rem; font-weight: 700; margin: 12px 0; flex-wrap: wrap; }
  .substring-char { padding: 4px 6px; border-radius: 4px; }
  .substring-char.cut-part { background: #FEE2E2; color: #DC2626; }
  .substring-char.keep-part { background: #F0FDF4; color: #16A34A; }
  .substring-note { text-align: center; font-size: 0.78rem; color: #64748B; margin-top: 6px; }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin: 20px auto; max-width: 1200px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; animation: slideIn 0.4s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 22px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 440px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; text-align: center; }

  /* festival scene */
  .festival-zones { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; position: relative; min-height: 140px; }
  .festival-zone { flex: 1; text-align: center; }
  .fz-title { font-size: 0.66rem; color: #94A3B8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
  .fz-icon-big { font-size: 2rem; }
  .fz-sub { font-size: 0.62rem; color: #64748B; margin-top: 4px; }
  .gate-visual { width: 50px; height: 66px; border-radius: 6px; border: 2px solid #94A3B8; background: #F8FAFC; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.4s; }
  .gate-visual.open-gate { border-color: #16A34A; background: #ECFDF5; }

  @keyframes walkToGate { 0% { transform: translateX(-30px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
  .walker { animation: walkToGate 0.6s ease forwards; }
  @keyframes bounceBack { 0% { transform: translateX(0); } 50% { transform: translateX(10px); } 100% { transform: translateX(-20px); opacity: 0.5; } }
  .bounced { animation: bounceBack 0.8s ease forwards; }

  .notepad { background: #FFFDF5; border: 1.5px solid #E5C97A; border-radius: 6px; padding: 10px 12px 10px 22px; position: relative; margin-top: 10px; font-family: monospace; font-size: 0.68rem; color: #78350F; min-height: 40px; }
  .notepad::before { content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px; width: 2px; background-image: radial-gradient(circle, #C9A227 2px, transparent 2px); background-size: 100% 10px; }
  .notepad-line { opacity: 0; animation: typeIn 0.5s ease forwards; }
  @keyframes typeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .notepad-empty { color: #B0A080; font-style: italic; }

  .bubble-401-mini { display: inline-block; background: rgba(239,68,68,0.12); color: #DC2626; font-size: 0.7rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; margin-top: 8px; animation: slideIn 0.3s ease; }

  /* filter chain vertical (slot 2) */
  .fchain-vert { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .fchain-box { width: 100%; max-width: 260px; border-radius: 8px; padding: 10px 14px; text-align: center; font-family: monospace; font-size: 0.72rem; background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #64748B; transition: all 0.3s; }
  .fchain-box.active-box { border-color: #3B82F6; background: #EFF6FF; color: #1E40AF; font-weight: 700; }
  .fchain-arrow { color: #CBD5E1; font-size: 1rem; }
  .fchain-substeps { font-size: 0.64rem; color: #94A3B8; margin-top: 4px; text-align: left; }
  .fchain-substeps div.lit-sub { color: #16A34A; font-weight: 700; }

  /* filter pipeline horizontal (slot 3) */
  .fpipe-row { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
  .fpipe-box { flex: 1; min-width: 90px; border-radius: 8px; padding: 10px 8px; text-align: center; font-family: monospace; font-size: 0.68rem; background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #64748B; }
  .fpipe-box.first-box { border-color: #16A34A; background: #F0FDF4; color: #14532D; font-weight: 700; }
  .fpipe-arrow { font-size: 1rem; color: #94A3B8; }
  .stateless-note { text-align: center; margin-top: 14px; font-size: 0.76rem; color: #64748B; }

  /* full flow pipeline (slot 4) */
  .fullflow-row { display: flex; flex-direction: column; gap: 6px; }
  .fullflow-step { padding: 8px 12px; border-radius: 6px; background: #F8FAFC; font-size: 0.72rem; color: #64748B; transition: all 0.3s; }
  .fullflow-step.green-step { background: #F0FDF4; color: #14532D; font-weight: 700; }

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

const STEPS = ['Festival Guard Analogy', 'JwtFilter', 'SecurityConfig', 'Test'];
const BEARER_CHARS = ['B', 'e', 'a', 'r', 'e', 'r', ' '];

export default function JwtFilterBuilder() {
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

  // ── Step 1: festival analogy ──
  const [gateEvent, setGateEvent] = useState(null); // { type: 'with'|'without', key }
  const gateKeyRef = useRef(0);
  const [withSeen, setWithSeen] = useState(false);
  const [withoutSeen, setWithoutSeen] = useState(false);

  function runWithToken() {
    gateKeyRef.current += 1;
    setGateEvent({ type: 'with', key: gateKeyRef.current });
    setWithSeen(true);
    play('correct');
  }
  function runWithoutToken() {
    gateKeyRef.current += 1;
    setGateEvent({ type: 'without', key: gateKeyRef.current });
    setWithoutSeen(true);
    play('warn');
  }
  function buildGuard() { play('tick'); setStep(2); }

  // ── Step 2: JwtFilter ──
  const [part2Idx, setPart2Idx] = useState('A'); // A, B, C
  const [authHeaderInput, setAuthHeaderInput] = useState('');
  const [authHeaderCorrect, setAuthHeaderCorrect] = useState(false);
  const [authHeaderWrong, setAuthHeaderWrong] = useState(false);
  const [showSubstring, setShowSubstring] = useState(false);
  const [offsetTried, setOffsetTried] = useState(null);
  const [explainIdx, setExplainIdx] = useState(0); // 0 none, 1 = SecurityContextHolder, 2 = UPAT, 3 = done
  const [step2Done, setStep2Done] = useState(false);

  function toPartB() { play('tick'); setPart2Idx('B'); }
  function submitAuthHeader() {
    const norm = authHeaderInput.trim().replace(/['"]/g, '');
    if (norm.toLowerCase() === 'authorization') {
      setAuthHeaderCorrect(true);
      setAuthHeaderWrong(false);
      play('add');
      setTimeout(() => { setShowSubstring(true); play('tick'); }, 300);
    } else {
      setAuthHeaderWrong(true);
      play('warn');
    }
  }
  function toPartC() { play('tick'); setPart2Idx('C'); }
  function nextExplain1() { play('tick'); setExplainIdx(2); }
  function gotItExplain2() { play('tick'); setExplainIdx(3); }
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: SecurityConfig ──
  const [statelessInput, setStatelessInput] = useState('');
  const [statelessCorrect, setStatelessCorrect] = useState(false);
  const [statelessWrong, setStatelessWrong] = useState(false);
  const [secCardIdx, setSecCardIdx] = useState(0); // 0 none, 1 stateless card, 2 addFilterBefore card, 3 done
  const [step3Done, setStep3Done] = useState(false);

  function submitStateless() {
    if (statelessInput.trim().toUpperCase() === 'STATELESS') {
      setStatelessCorrect(true);
      setStatelessWrong(false);
      play('add');
      setSecCardIdx(1);
    } else {
      setStatelessWrong(true);
      play('warn');
    }
  }
  function nextSecCard1() { play('tick'); setSecCardIdx(2); }
  function gotItSecCard2() { play('tick'); setSecCardIdx(3); }
  function toggleStep3() {
    if (!step3Done) { play('add'); setTimeout(() => setStep(4), 400); }
    setStep3Done(d => !d);
  }

  // ── Step 4: three tests ──
  const [testIdx, setTestIdx] = useState(1);
  const [test1Done, setTest1Done] = useState(false);
  const [test2Done, setTest2Done] = useState(false);
  const [test3Done, setTest3Done] = useState(false);

  function toggleTest1() { if (!test1Done) play('add'); setTest1Done(d => !d); }
  function nextTest2() { play('tick'); setTestIdx(2); }
  function toggleTest2() { if (!test2Done) play('correct'); setTest2Done(d => !d); }
  function nextTest3() { play('tick'); setTestIdx(3); }
  function toggleTest3() { if (!test3Done) play('correct'); setTest3Done(d => !d); }

  const allTestsDone = test1Done && test2Done && test3Done;
  const allTestsFiredRef = useRef(false);
  const [successLines, setSuccessLines] = useState(0);
  useEffect(() => {
    if (allTestsDone && !allTestsFiredRef.current) {
      allTestsFiredRef.current = true;
      play('correct');
      let c = 0;
      const iv = setInterval(() => { c += 1; setSuccessLines(c); if (c >= 5) clearInterval(iv); }, 400);
      setTimeout(() => play('reveal'), 1000);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsDone && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 8) clearInterval(iv); }, 450);
      }, 3200);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [filterFile, setFilterFile] = useState(false);
  const [configTasks, setConfigTasks] = useState({ autowired: false, stateless: false, addBefore: false });
  const [flowTasks, setFlowTasks] = useState({ loginToken: false, withToken: false, withoutToken: false });
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleFilterFile() { if (!filterFile) play('add'); setFilterFile(f => !f); }
  function toggleConfigTask(key) { setConfigTasks(f => { const nv = !f[key]; if (nv) play('add'); return { ...f, [key]: nv }; }); }
  const allFlowFiredRef = useRef(false);
  function toggleFlowTask(key) {
    setFlowTasks(f => {
      const nv = { ...f, [key]: !f[key] };
      if (nv.loginToken && nv.withToken && nv.withoutToken && !allFlowFiredRef.current) { allFlowFiredRef.current = true; play('correct'); }
      else if (!f[key]) play('add');
      return nv;
    });
  }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const configAllDone = configTasks.autowired && configTasks.stateless && configTasks.addBefore;
  const flowAllDone = flowTasks.loginToken && flowTasks.withToken && flowTasks.withoutToken;
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = filterFile && configAllDone && flowAllDone && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t2-s3-jwt-filter-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { withTokenUnderstood: withSeen, withoutTokenUnderstood: withoutSeen },
            slot2: { authorizationHeaderBlank: authHeaderInput, securityContextUnderstood: explainIdx >= 2, usernamePasswordTokenUnderstood: explainIdx >= 3, jwtFilterCreated: step2Done },
            slot3: { statelessBlank: statelessInput, securityConfigUpdated: step3Done },
            slot4: { loginGetToken: test1Done, accessWithToken: test2Done, accessWithoutToken: test3Done },
          },
          phase2: {
            jwtFilterCreated: filterFile,
            securityConfigUpdated: configAllDone,
            fullFlowTested: flowAllDone,
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
    <div className="jfb-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>JwtFilter + SecurityConfig Wiring</h1>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>The checkpoint guard</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Three zones: gymowner at the entrance, JwtFilter as the checkpoint guard, and the /gym/members controller inside the festival.</p>

                  <button className="btn" onClick={runWithToken}>See what happens with a valid token →</button>
                  <button className="btn secondary" onClick={runWithoutToken}>See what happens without token →</button>

                  <div className="amber-card">
                    JwtFilter is the checkpoint guard.<br /><br />
                    Every request passes through it.<br /><br />
                    Has token → validate → write on Spring Security's notepad → request reaches controller.<br /><br />
                    No token → nothing written → Spring Security blocks with 401.
                  </div>

                  {withSeen && withoutSeen && (
                    <button className="btn" onClick={buildGuard}>Build the guard →</button>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 1 — Read the wristband</h2>

                  {part2Idx === 'A' && (
                    <>
                      <CopyBlock code={`@Component\npublic class JwtFilter extends OncePerRequestFilter {\n\n    @Autowired\n    private JwtUtil jwtUtil;\n    // doFilterInternal below...\n}`}>
                        <span className="code-tag">@Component</span>{'\n'}public class JwtFilter{'\n'}{'    '}extends OncePerRequestFilter {'{'}{'\n\n'}
                        {'    '}<span className="code-tag">@Autowired</span>{'\n'}{'    '}private JwtUtil jwtUtil;{'\n'}
                        <span className="code-comment">    // doFilterInternal below...{'\n'}</span>{'}'}
                      </CopyBlock>
                      <div className="blue-card">
                        OncePerRequestFilter — a Spring class. When you extend it, Spring Boot automatically runs your filter once for every HTTP request.<br /><br />
                        You override doFilterInternal() to add your logic.
                      </div>
                      <button className="btn" onClick={toPartB}>Next →</button>
                    </>
                  )}

                  {part2Idx === 'B' && (
                    <>
                      <CopyBlock code={`@Override\nprotected void doFilterInternal(\n    HttpServletRequest request,\n    HttpServletResponse response,\n    FilterChain filterChain\n) throws Exception {\n\n    String header = request.getHeader("Authorization");\n}`}>
                        <span className="code-tag">@Override</span>{'\n'}
                        protected void doFilterInternal({'\n'}
                        {'    '}HttpServletRequest request,{'\n'}
                        {'    '}HttpServletResponse response,{'\n'}
                        {'    '}FilterChain filterChain{'\n'}
                        ) throws Exception {'{'}{'\n\n'}
                        {'    '}String header = request.getHeader({authHeaderCorrect ? <span className="code-blank-done">"Authorization"</span> : '[___]'});{'\n'}
                        {'}'}
                      </CopyBlock>

                      {!authHeaderCorrect && (
                        <div className="blank-panel">
                          <div className="blank-label">The JWT token is sent in which HTTP header?</div>
                          <div className="blank-input-row">
                            <input className="blank-text-input" placeholder='"Authorization"' value={authHeaderInput} onChange={e => { setAuthHeaderInput(e.target.value); setAuthHeaderWrong(false); }} />
                            <button className="blank-submit-btn" onClick={submitAuthHeader}>Check</button>
                          </div>
                          {authHeaderWrong && <div className="blank-feedback wrong">The header is 'Authorization'. Format: Authorization: Bearer [token]</div>}
                        </div>
                      )}

                      {authHeaderCorrect && showSubstring && (
                        <>
                          <div className="config-card-single">
                            Before we tell you the answer — try it yourself. header = "Bearer eyJhbGci..." Pick an offset for substring(n):
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                              {[0, 6, 7, 8].map(n => (
                                <button key={n} className={`blank-opt-btn${offsetTried === n ? (n === 7 ? ' correct' : ' wrong') : ''}`} onClick={() => { setOffsetTried(n); play(n === 7 ? 'add' : 'warn'); }}>substring({n})</button>
                              ))}
                            </div>
                            {offsetTried !== null && (
                              <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                → "{'Bearer eyJhbGci...'.slice(offsetTried)}"
                                {offsetTried === 7 ? <span style={{ color: '#16A34A', fontWeight: 700 }}> ✅ clean token</span> : <span style={{ color: '#DC2626', fontWeight: 700 }}> ❌ {offsetTried < 7 ? 'still has leftover "Bearer" text' : 'cut into the token itself'}</span>}
                              </div>
                            )}
                          </div>
                          <div className="config-card-single">
                            "Authorization: Bearer eyJhbGci..." — "Bearer " (7 characters) is removed: header.substring(7) → "eyJhbGci..."
                          </div>
                          <div className="substring-visual">
                            {BEARER_CHARS.map((c, i) => (
                              <span key={i} className="substring-char cut-part">{c === ' ' ? '·' : c}</span>
                            ))}
                            <span className="substring-char keep-part">eyJhbGci...</span>
                          </div>
                          <div className="substring-note">substring(7) removes the red part</div>
                          <CopyBlock code={`if (header != null && header.startsWith("Bearer ")) {\n\n    String token = header.substring(7);\n    // "Bearer eyJhbGci..." → "eyJhbGci..."\n}`}>
                            if (header != null && header.startsWith("Bearer ")) {'{'}{'\n\n'}
                            {'    '}String token = header.substring(7);{'\n'}
                            <span className="code-comment">    // "Bearer eyJhbGci..." → "eyJhbGci..."{'\n'}</span>{'}'}
                          </CopyBlock>
                          <button className="btn" onClick={toPartC}>Next →</button>
                        </>
                      )}
                    </>
                  )}

                  {part2Idx === 'C' && (
                    <>
                      <CopyBlock code={`try {\n    String username = jwtUtil.validateToken(token);\n\n    SecurityContextHolder.getContext().setAuthentication(\n        new UsernamePasswordAuthenticationToken(username, null, null)\n    );\n} catch (Exception e) {\n    // token invalid or expired — do nothing\n    // Spring Security returns 401 automatically\n}\n\nfilterChain.doFilter(request, response);\n// always pass to next step`}>
                        try {'{'}{'\n'}
                        {'    '}String username = jwtUtil.validateToken(token);{'\n'}
                        <span className="code-comment">    {'    '}// genuine? not expired? returns username{'\n'}    {'    '}// throws exception if invalid{'\n\n'}</span>
                        {'    '}SecurityContextHolder{'\n'}{'        '}.getContext(){'\n'}{'        '}.setAuthentication({'\n'}
                        {'            '}new UsernamePasswordAuthenticationToken({'\n'}{'                '}username, null, null{'\n'}{'            '}){'\n'}{'        '});{'\n'}
                        <span className="code-comment">    // ↑ write on Spring Security's notepad: "username is verified"{'\n'}</span>
                        {'}'} catch (Exception e) {'{'}{'\n'}
                        <span className="code-comment">    // token invalid or expired{'\n'}    // do nothing — Spring Security returns 401 automatically{'\n'}</span>
                        {'}'}{'\n\n'}
                        filterChain.doFilter(request, response);{'\n'}
                        <span className="code-comment">// ↑ always pass to next step — Spring Security decides what to do</span>
                      </CopyBlock>

                      {explainIdx === 0 && (
                        <div className="config-card-single">
                          <b>SecurityContextHolder</b><br /><br />
                          Spring Security's visitor log. Stores who is verified for THIS request. Cleared automatically when the request ends.<br /><br />
                          setAuthentication(...) writes on the log.
                          <button className="btn" onClick={nextExplain1}>Next →</button>
                        </div>
                      )}
                      {explainIdx === 2 && (
                        <div className="config-card-single">
                          <b>UsernamePasswordAuthenticationToken</b><br /><br />
                          The official form that says "this username is verified."<br /><br />
                          Parameter 1: username (who is verified). Parameter 2: null (no password needed — token already proved it). Parameter 3: null (no roles yet).
                          <button className="btn" onClick={gotItExplain2}>Got it →</button>
                        </div>
                      )}

                      {explainIdx >= 3 && (
                        <label className={`checkbox-row${step2Done ? ' checked' : ''}`}>
                          <input type="checkbox" checked={step2Done} onChange={toggleStep2} />
                          ✅ JwtFilter.java created
                        </label>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 2 — Wire the filter in</h2>
                  <div className="amber-card">
                    JwtFilter exists. But Spring Security does not use it yet.<br /><br />
                    You need to tell SecurityConfig: "Run JwtFilter on every request before your default authentication."
                  </div>

                  <CopyBlock code={`@Autowired\nprivate JwtFilter jwtFilter;\n\n@Bean\npublic SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n    http\n        .csrf(csrf -> csrf.disable())\n        .authorizeHttpRequests(auth -> auth\n            .requestMatchers("/auth/**").permitAll()\n            .anyRequest().authenticated()\n        )\n        .sessionManagement(s -> s\n            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)\n        )\n        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);\n    return http.build();\n}`}>
                    <span className="code-tag">@Autowired</span>{'\n'}private JwtFilter jwtFilter;{'\n\n'}
                    <span className="code-tag">@Bean</span>{'\n'}public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {'{'}{'\n'}
                    {'    '}http{'\n'}
                    {'        '}.csrf(csrf -&gt; csrf.disable()){'\n'}
                    {'        '}.authorizeHttpRequests(...){'\n'}
                    {'        '}.sessionManagement(s -&gt; s{'\n'}
                    {'            '}.sessionCreationPolicy(SessionCreationPolicy.{statelessCorrect ? <span className="code-blank-done">STATELESS</span> : '[___]'}){'\n'}
                    {'        '}){'\n'}
                    <span className="code-comment">        // ↑ blank: which policy means no sessions?{'\n'}</span>
                    {'        '}.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);{'\n'}
                    {'    '}return http.build();{'\n'}{'}'}
                  </CopyBlock>

                  {!statelessCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">JWT apps do not use sessions. Each request proves itself with a token. What session policy name means no sessions? (state-LESS = no sessions stored)</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="STATELESS" value={statelessInput} onChange={e => { setStatelessInput(e.target.value); setStatelessWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitStateless}>Check</button>
                      </div>
                      {statelessWrong && <div className="blank-feedback wrong">The policy is STATELESS — no sessions stored. Every request uses a token.</div>}
                    </div>
                  )}

                  {secCardIdx === 1 && (
                    <div className="config-card-single">
                      <b>sessionManagement().STATELESS</b><br /><br />
                      No sessions stored on the server. Sessions = server remembers you between requests (like cookies).<br /><br />
                      JWT apps don't need this. Each request carries its own proof (the token).<br /><br />
                      Stateless = lighter, scalable, the standard for REST APIs.
                      <button className="btn" onClick={nextSecCard1}>Next →</button>
                    </div>
                  )}
                  {secCardIdx === 2 && (
                    <div className="config-card-single">
                      <b>addFilterBefore()</b><br /><br />
                      Run JwtFilter BEFORE Spring Security's default authentication filter.<br /><br />
                      This way — when Spring Security checks who is making the request, our filter has already written "gymowner" on the notepad. Spring Security sees the notepad and lets gymowner through.
                      <button className="btn" onClick={gotItSecCard2}>Got it →</button>
                    </div>
                  )}
                  {secCardIdx >= 3 && (
                    <label className={`checkbox-row${step3Done ? ' checked' : ''}`}>
                      <input type="checkbox" checked={step3Done} onChange={toggleStep3} />
                      ✅ SecurityConfig updated
                    </label>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Test — token works on every request</h2>

                  {testIdx === 1 && (
                    <>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>Test 1 — Login and get token</p>
                      <CopyBlock code={`POST localhost:8080/auth/login\n\n{\n  "username": "gymowner",\n  "password": "gym@123"\n}`}>
                        POST /auth/login{'\n\n'}{'{'}{'\n'}{'  '}"username": "gymowner",{'\n'}{'  '}"password": "gym@123"{'\n'}{'}'}
                      </CopyBlock>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Expected: {'{'} "token": "eyJhbGci..." {'}'} — copy this token.</p>
                      <label className={`checkbox-row${test1Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test1Done} onChange={toggleTest1} />
                        ✅ Got token from login
                      </label>
                      {test1Done && <button className="btn" onClick={nextTest2}>Next test →</button>}
                    </>
                  )}

                  {testIdx === 2 && (
                    <>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>Test 2 — Access with token</p>
                      <div className="blue-card">
                        GET localhost:8080/gym/members<br /><br />
                        Postman — Headers tab:<br />
                        Key: Authorization<br />
                        Value: Bearer [paste token here]
                      </div>
                      <div className="green-card">
                        JwtFilter ran. Read the Authorization header. Validated the token. Wrote 'gymowner' on notepad. Spring Security let it through.<br /><br />
                        No username and password sent. Just the token. ✅
                      </div>
                      <label className={`checkbox-row${test2Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test2Done} onChange={toggleTest2} />
                        ✅ Members list with JWT token
                      </label>
                      {test2Done && <button className="btn" onClick={nextTest3}>Next test →</button>}
                    </>
                  )}

                  {testIdx === 3 && (
                    <>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>Test 3 — Access without token</p>
                      <div className="blue-card">GET localhost:8080/gym/members<br />No Authorization header.</div>
                      <div className="green-card">
                        JwtFilter ran. No Authorization header found. Nothing written on notepad. Spring Security sees empty notepad. Returns 401.<br /><br />
                        The stranger is blocked. ✅
                      </div>
                      <label className={`checkbox-row${test3Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test3Done} onChange={toggleTest3} />
                        ✅ 401 without token
                      </label>
                    </>
                  )}

                  {successLines > 0 && (
                    <div className="config-card-single" style={{ background: 'linear-gradient(to bottom, #fff, #ECFDF5)', borderLeft: '4px solid #10B981' }}>
                      {successLines >= 1 && <div style={{ animation: 'slideIn 0.4s ease', fontWeight: 700 }}>Complete JWT flow working. 🎫</div>}
                      {successLines >= 2 && <div style={{ animation: 'slideIn 0.4s ease' }}>Login → get token ✅</div>}
                      {successLines >= 3 && <div style={{ animation: 'slideIn 0.4s ease' }}>Token → access data ✅</div>}
                      {successLines >= 4 && <div style={{ animation: 'slideIn 0.4s ease' }}>No token → 401 ✅</div>}
                      {successLines >= 5 && <div style={{ animation: 'slideIn 0.4s ease' }}>No username/password on every request. Just the token. Your API is secure AND efficient.</div>}
                    </div>
                  )}
                </div>
              )}

              {revealCount > 0 && (
                <div className="reveal-card">
                  <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
                  {revealCount >= 1 && <div className="reveal-line">✅ <span><b>OncePerRequestFilter</b> → runs your filter once per request — extend it, override doFilterInternal</span></div>}
                  {revealCount >= 2 && <div className="reveal-line">✅ <span><b>request.getHeader("Authorization")</b> → reads Authorization header from incoming request</span></div>}
                  {revealCount >= 3 && <div className="reveal-line">✅ <span><b>header.substring(7)</b> → removes "Bearer " — leaves just the token string</span></div>}
                  {revealCount >= 4 && <div className="reveal-line">✅ <span><b>SecurityContextHolder</b> → Spring Security's visitor log — stores who is verified this request</span></div>}
                  {revealCount >= 5 && <div className="reveal-line">✅ <span><b>UsernamePasswordAuthenticationToken</b> → official verified stamp — "this username is authenticated"</span></div>}
                  {revealCount >= 6 && <div className="reveal-line">✅ <span><b>filterChain.doFilter()</b> → always pass request to next step</span></div>}
                  {revealCount >= 7 && <div className="reveal-line">✅ <span><b>addFilterBefore()</b> → run our filter before Spring's default filter</span></div>}
                  {revealCount >= 8 && <div className="reveal-line">✅ <span><b>STATELESS</b> → no sessions — each request proves itself with token</span></div>}
                  {revealCount >= 8 && (
                    <>
                      <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                        JwtFilter reads the wristband. Writes on the security notepad. Spring Security trusts the notepad.<br /><br />
                        Register. Login. Get token. Use token on every request.<br /><br />
                        Topic 2 complete.<br /><br />
                        One subtopic left — test the full JWT flow end to end.
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
                  step={step} gateEvent={gateEvent}
                  authHeaderCorrect={authHeaderCorrect} showSubstring={showSubstring} explainIdx={explainIdx}
                  statelessCorrect={statelessCorrect} secCardIdx={secCardIdx}
                  testIdx={testIdx} test1Done={test1Done} test2Done={test2Done} test3Done={test3Done}
                  allTestsDone={allTestsDone}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ gridTemplateColumns: '1fr', maxWidth: 900 }}>
          <div className="card">
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Add JwtFilter to YOUR project</h2>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — JwtFilter file</h3>
            <label className={`task-item${filterFile ? ' checked' : ''}`}>
              <input type="checkbox" checked={filterFile} onChange={toggleFilterFile} />
              JwtFilter.java created (extends OncePerRequestFilter, reads Authorization header, validates with JwtUtil, writes on SecurityContextHolder)
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — SecurityConfig updated</h3>
            <label className={`task-item${configTasks.autowired ? ' checked' : ''}`}>
              <input type="checkbox" checked={configTasks.autowired} onChange={() => toggleConfigTask('autowired')} />
              @Autowired JwtFilter added
            </label>
            <label className={`task-item${configTasks.stateless ? ' checked' : ''}`}>
              <input type="checkbox" checked={configTasks.stateless} onChange={() => toggleConfigTask('stateless')} />
              sessionManagement().STATELESS added
            </label>
            <label className={`task-item${configTasks.addBefore ? ' checked' : ''}`}>
              <input type="checkbox" checked={configTasks.addBefore} onChange={() => toggleConfigTask('addBefore')} />
              addFilterBefore(jwtFilter, ...) added
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — Test complete flow</h3>
            <label className={`task-item${flowTasks.loginToken ? ' checked' : ''}`}>
              <input type="checkbox" checked={flowTasks.loginToken} onChange={() => toggleFlowTask('loginToken')} />
              Login returns token
            </label>
            <label className={`task-item${flowTasks.withToken ? ' checked' : ''}`}>
              <input type="checkbox" checked={flowTasks.withToken} onChange={() => toggleFlowTask('withToken')} />
              GET /[domain]/[items] with token → data returned
            </label>
            <label className={`task-item${flowTasks.withoutToken ? ' checked' : ''}`}>
              <input type="checkbox" checked={flowTasks.withoutToken} onChange={() => toggleFlowTask('withoutToken')} />
              GET /[domain]/[items] without token → 401
            </label>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 — Commit</h3>
            <CopyBlock code={`git add .\ngit commit -m "add JwtFilter — JWT token protects all endpoints"\ngit push origin main`}>
              git add .{'\n'}git commit -m "add JwtFilter —{'\n'}{'  '}JWT token protects all endpoints"{'\n'}git push origin main
            </CopyBlock>
            <label className={`task-item${committed ? ' checked' : ''}`}>
              <input type="checkbox" checked={committed} onChange={toggleCommitted} />
              ✅ Committed and pushed
            </label>

            {filterFile && configAllDone && flowAllDone && committed && (
              <>
                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                  In one sentence — what does SecurityContextHolder do and why does JwtFilter write to it?
                </p>
                <textarea
                  className="reflection-box"
                  placeholder="SecurityContextHolder is Spring Security's visitor log that stores who is verified for the current request — JwtFilter writes the username to it after validating the token so Spring Security knows to let the request through..."
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  onPaste={e => e.preventDefault()}
                />
                <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                  {submitted ? 'Submitted ✅' : 'JWT filter working — test full flow next →'}
                </button>

                {submitted && (
                  <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                    <b>JwtFilter complete. 🔒</b><br /><br />
                    ✅ Reads Authorization header<br />
                    ✅ Validates token with JwtUtil<br />
                    ✅ Writes to SecurityContextHolder<br />
                    ✅ SecurityConfig wired — stateless<br />
                    ✅ Full JWT flow working<br /><br />
                    Next — 3.2.4.<br />
                    Test the complete flow end to end. Module 3 complete.
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

function StagePanel({ step, gateEvent, authHeaderCorrect, showSubstring, explainIdx, statelessCorrect, secCardIdx, testIdx, test1Done, test2Done, test3Done, allTestsDone }) {
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'The festival checkpoint'}
        {step === 2 && 'JwtFilter — step by step'}
        {step === 3 && 'Filter chain + stateless'}
        {step === 4 && 'Full JWT flow, live'}
      </div>

      {step === 1 && (
        <FestivalScene gateEvent={gateEvent} />
      )}

      {step === 2 && (
        <div className="fchain-vert">
          <div className={`fchain-box${true ? ' active-box' : ''}`}>REQUEST arrives<br /><span style={{ fontSize: '0.62rem' }}>Authorization: Bearer eyJ...</span></div>
          <div className="fchain-arrow">↓</div>
          <div className={`fchain-box${authHeaderCorrect ? ' active-box' : ''}`}>
            Step 1 — Read header
            {showSubstring && <div className="fchain-substeps"><div className="lit-sub">"Bearer " removed → token isolated</div></div>}
          </div>
          <div className="fchain-arrow">↓</div>
          <div className={`fchain-box${explainIdx >= 1 ? ' active-box' : ''}`}>Step 2 — Validate<br /><span style={{ fontSize: '0.62rem' }}>{explainIdx >= 1 ? '"gymowner" returned ✅' : 'jwtUtil.validateToken()'}</span></div>
          <div className="fchain-arrow">↓</div>
          <div className={`fchain-box${explainIdx >= 2 ? ' active-box' : ''}`}>
            Step 3 — Write notepad
            <div className="notepad" style={{ marginTop: 8 }}>
              {explainIdx >= 2 ? <div className="notepad-line">gymowner — verified ✓</div> : <div className="notepad-empty">(empty)</div>}
            </div>
          </div>
          <div className="fchain-arrow">↓</div>
          <div className={`fchain-box${explainIdx >= 3 ? ' active-box' : ''}`}>Step 4 — filterChain.doFilter()<br /><span style={{ fontSize: '0.62rem' }}>continues to controller</span></div>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="fpipe-row">
            <div className="fpipe-box first-box">JwtFilter<br /><span style={{ fontSize: '0.6rem' }}>runs first</span></div>
            <div className="fpipe-arrow">→</div>
            <div className="fpipe-box">Spring Security<br /><span style={{ fontSize: '0.6rem' }}>reads notepad</span></div>
            <div className="fpipe-arrow">→</div>
            <div className="fpipe-box">Controller</div>
          </div>
          {statelessCorrect && (
            <div className="stateless-note">
              No session cookie stored.<br />
              Request ends → notepad cleared.<br />
              Next request must have token again.
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <>
          {testIdx === 1 && !test1Done && (
            <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.82rem', padding: '30px 0' }}>Login to see the token appear here.</div>
          )}
          {test1Done && testIdx === 1 && (
            <div className="config-card-single" style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.72rem' }}>
              eyJhbGciOiJIUzI1NiJ9...<br /><span style={{ color: '#94A3B8', fontFamily: 'system-ui' }}>Copy this</span>
            </div>
          )}
          {testIdx === 2 && (
            <div className="fchain-vert">
              <div className="fchain-box active-box">Authorization: Bearer eyJ...</div>
              <div className="fchain-arrow">↓</div>
              <div className="fchain-box active-box">JwtFilter reads it</div>
              <div className="fchain-arrow">↓</div>
              <div className="notepad"><div className="notepad-line">gymowner — verified ✓</div></div>
              <div className="fchain-arrow">↓</div>
              <div className="fchain-box active-box" style={{ borderColor: '#16A34A', background: '#F0FDF4', color: '#14532D' }}>Members list returned ✅</div>
            </div>
          )}
          {testIdx === 3 && (
            <div className="fchain-vert">
              <div className="fchain-box">No Authorization header</div>
              <div className="fchain-arrow">↓</div>
              <div className="fchain-box">JwtFilter: nothing to read</div>
              <div className="fchain-arrow">↓</div>
              <div className="notepad"><div className="notepad-empty">(empty)</div></div>
              <div className="fchain-arrow">↓</div>
              <div className="bubble-401-mini">401 — Blocked ✅</div>
            </div>
          )}

          {allTestsDone && (
            <div className="fullflow-row" style={{ marginTop: 16 }}>
              {['Login → token', 'Token → Authorization header', 'JwtFilter reads → validates', 'Notepad written → Spring Security', 'Controller responds'].map(s => (
                <div key={s} className="fullflow-step green-step">{s} ✅</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FestivalScene({ gateEvent }) {
  const isWith = gateEvent?.type === 'with';
  const isWithout = gateEvent?.type === 'without';
  return (
    <div>
      <div className="festival-zones" key={gateEvent?.key || 'idle'}>
        <div className="festival-zone">
          <div className="fz-title">Entrance</div>
          <div className={`fz-icon-big${gateEvent ? ' walker' : ''}`}>{isWithout ? '🕵️' : '🧑'}</div>
          <div className="fz-sub">{isWith ? '🎫 JWT token' : isWithout ? 'no token' : 'gymowner'}</div>
        </div>
        <div className="festival-zone">
          <div className="fz-title">Checkpoint</div>
          <div className={`gate-visual${isWith ? ' open-gate' : ''}`}>{isWith ? '🔓' : '🔒'}</div>
          <div className="fz-sub">JwtFilter</div>
          <div className="notepad">
            {isWith && <div className="notepad-line">gymowner — verified ✓</div>}
            {isWithout && <div className="notepad-empty">(empty)</div>}
            {!gateEvent && <div className="notepad-empty">Visitor Log</div>}
          </div>
          {isWithout && <div className="bubble-401-mini">401</div>}
        </div>
        <div className="festival-zone">
          <div className="fz-title">Festival</div>
          <div className="fz-icon-big">🎪</div>
          <div className="fz-sub">/gym/members controller</div>
        </div>
      </div>
    </div>
  );
}
