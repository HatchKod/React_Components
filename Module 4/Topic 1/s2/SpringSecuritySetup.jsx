import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .sss-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sss-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: white; color: #1E293B; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }

  /* progress pills */
  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 6px; max-width: 1200px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(16,185,129,0.12); color: #16A34A; }
  .p-pill.active { background: #3B82F6; color: #fff; }
  .p-line { width: 24px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #16A34A; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1200px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .step-card { background: #F8FAFC; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); padding: 22px; margin-bottom: 20px; border-left: 4px solid #CBD5E1; color: #94A3B8; pointer-events: none; filter: saturate(0.6); }
  .step-card.active { background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border-left-color: #3B82F6; color: #1E293B; pointer-events: auto; filter: none; }
  .step-card.complete { background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border-left-color: #16A34A; color: #1E293B; pointer-events: auto; filter: none; }

  .analogy-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .prep-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; color: #14532D; font-size: 0.88rem; line-height: 1.7; }
  .info-blue { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .win-green { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; color: #14532D; font-size: 0.88rem; line-height: 1.7; }
  .important-amber { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin-top: 16px; color: #78350F; font-size: 0.85rem; line-height: 1.7; }

  .code-block { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.82rem; line-height: 1.7; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .copy-btn:hover { background: #475569; }
  .code-tag { color: #93C5FD; }
  .code-comment { color: #64748B; }

  .tooltip-term { border-bottom: 1.5px dotted #3B82F6; cursor: help; position: relative; color: #1D4ED8; font-weight: 700; }
  .tooltip-term:hover .tooltip-box { display: block; }
  .tooltip-box { display: none; position: absolute; bottom: 130%; left: 0; background: #1E293B; color: #E2E8F0; padding: 10px 12px; border-radius: 8px; font-size: 0.75rem; width: 240px; z-index: 5; font-weight: 400; line-height: 1.5; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

  .collapsible { margin-top: 14px; }
  .collapsible-head { display: flex; align-items: center; justify-content: space-between; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #991B1B; }
  .collapsible-body { padding: 12px 14px; font-size: 0.85rem; color: #7F1D1D; line-height: 1.8; background: #FFF5F5; border-radius: 0 0 8px 8px; border: 1px solid #FECACA; border-top: none; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #F0FDF4; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .pw-input-wrap { margin: 12px 0; }
  .pw-input { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; font-size: 0.9rem; font-family: 'Fira Code', monospace; }
  .pw-hint { font-size: 0.76rem; color: #94A3B8; margin-top: 4px; }

  .console-block { background: #1E293B; border-radius: 10px; padding: 16px 18px; font-family: 'Fira Code', monospace; font-size: 0.8rem; color: #4ADE80; line-height: 1.9; margin: 12px 0; position: relative; }
  .console-pw-line { background: rgba(250,204,21,0.18); border-radius: 4px; padding: 2px 6px; color: #FDE047; font-weight: 700; }
  .console-pw-label { color: #FCA5A5; font-size: 0.7rem; font-weight: 800; margin-top: 6px; }

  .contrast-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 14px 0; }
  @media(max-width:600px) { .contrast-grid { grid-template-columns: 1fr; } }
  .contrast-col { border-radius: 10px; padding: 14px 16px; font-size: 0.82rem; line-height: 1.8; font-family: 'Fira Code', monospace; }
  .contrast-col.before { background: #F8FAFC; border-left: 4px solid #DC2626; color: #475569; }
  .contrast-col.after { background: #F0FDF4; border-left: 4px solid #16A34A; color: #14532D; }
  .contrast-title { font-weight: 800; font-family: system-ui, sans-serif; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }

  .postman-mock { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin: 12px 0; }
  .pm-url-row { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-family: 'Fira Code', monospace; font-size: 0.82rem; background: #F8FAFC; }
  .pm-method { background: #16A34A; color: #fff; font-weight: 800; padding: 3px 10px; border-radius: 6px; font-size: 0.72rem; }
  .pm-tabs { display: flex; gap: 0; border-bottom: 1px solid #E2E8F0; }
  .pm-tab { padding: 8px 16px; font-size: 0.78rem; font-weight: 700; color: #94A3B8; cursor: default; }
  .pm-tab.active { color: #3B82F6; border-bottom: 2px solid #3B82F6; }
  .pm-auth-body { padding: 14px 16px; }
  .pm-field-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .pm-field-label { font-size: 0.78rem; font-weight: 700; color: #64748B; width: 70px; }
  .pm-field-value { flex: 1; border: 1px solid #E2E8F0; border-radius: 6px; padding: 7px 10px; font-family: 'Fira Code', monospace; font-size: 0.82rem; background: #F8FAFC; }
  .pm-send-btn { background: #FF6C37; color: #fff; border: none; padding: 8px 22px; border-radius: 6px; font-weight: 800; font-size: 0.82rem; margin-top: 6px; }

  .response-preview { border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.82rem; margin: 12px 0; }
  .response-preview.status-401 { background: #1E293B; color: #F87171; }
  .response-preview.status-200 { background: #1E293B; color: #4ADE80; }

  .steps-list { font-size: 0.85rem; line-height: 2; color: #374151; margin: 10px 0; padding-left: 4px; }

  .summary-card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 24px; max-width: 1200px; margin: 20px auto; }
  .summary-list { font-size: 0.92rem; line-height: 2.1; color: #14532D; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin: 20px auto; max-width: 1200px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.92rem; animation: slideIn 0.4s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #1E293B; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; transition: all 0.2s; }
  .opt-btn:hover { border-color: #94A3B8; }
  .opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }

  /* ── Building visual (right side) ── */
  .bld-card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 20px; position: sticky; top: 24px; }
  @media(max-width:960px) { .bld-card { position: static; } }
  .bld-title { font-size: 0.78rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; }
  .bld-svg-wrap { position: relative; border-radius: 10px; transition: box-shadow 0.5s ease; }
  .bld-svg-wrap.bld-glow { box-shadow: 0 0 0 3px rgba(16,185,129,0.15), 0 0 24px rgba(16,185,129,0.25); animation: glowPulse 2.2s ease-in-out infinite; }
  @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.12), 0 0 18px rgba(16,185,129,0.18); } 50% { box-shadow: 0 0 0 3px rgba(16,185,129,0.22), 0 0 30px rgba(16,185,129,0.35); } }
  .door-locked-badge { transition: all 0.3s; }
  @keyframes lockPop { 0% { transform: scale(0.4) rotate(-15deg); opacity: 0; } 60% { transform: scale(1.15) rotate(4deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
  .lock-pop { animation: lockPop 0.4s cubic-bezier(.34,1.56,.64,1); transform-origin: center; }

  @keyframes techSlide { 0% { transform: translateX(-20px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(240px); opacity: 0; } }
  .tech-svg-walk { animation: techSlide 2.5s linear forwards; }

  .tech-wrap { display: flex; align-items: center; gap: 10px; margin-top: 14px; font-size: 0.82rem; color: #64748B; }
  @keyframes techWalk { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .tech-walk { animation: techWalk 0.6s ease; }
  @keyframes techSpin { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
  .tech-spin { display: inline-block; animation: techSpin 0.5s ease-in-out infinite; }

  .bld-status-badge { display: inline-block; margin-top: 12px; font-size: 0.78rem; font-weight: 800; padding: 5px 12px; border-radius: 20px; transition: background 0.3s, color 0.3s; }
  .bld-status-badge.open { background: rgba(239,68,68,0.12); color: #DC2626; }
  .bld-status-badge.secure { background: rgba(16,185,129,0.12); color: #16A34A; }
  @keyframes badgePop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
  .bld-glow-badge { animation: badgePop 0.4s ease; }

  .key-wrap { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 0.82rem; color: #78350F; background: #FFFBEB; border-radius: 8px; padding: 8px 12px; }
  @keyframes keyPop { 0% { transform: translateX(-12px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
  .key-pop { animation: keyPop 0.4s ease; }
  @keyframes consolePop { 0% { transform: translateY(-8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  .console-pop { animation: consolePop 0.4s ease; }

  .actor-anim-zone { position: relative; height: 70px; margin-top: 14px; background: #F8FAFC; border-radius: 8px; overflow: hidden; }
  @keyframes attackerBounce { 0% { transform: translateX(-40px); } 50% { transform: translateX(15px); } 70% { transform: translateX(-8px); } 100% { transform: translateX(-40px); opacity: 0.4; } }
  .attacker-bounce { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); animation: attackerBounce 1.1s ease forwards; font-size: 1.6rem; }
  @keyframes keyPersonEnter { 0% { transform: translateX(-40px); opacity: 0; } 60% { transform: translateX(20px); opacity: 1; } 100% { transform: translateX(45px); opacity: 1; } }
  .keyperson-enter { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); animation: keyPersonEnter 1s ease forwards; font-size: 1.6rem; }
  .bubble-401-mini { position: absolute; right: 8px; top: 6px; background: rgba(239,68,68,0.14); color: #DC2626; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 10px; animation: slideIn 0.3s ease; }
  .bubble-200-mini { position: absolute; right: 8px; top: 6px; background: rgba(16,185,129,0.14); color: #16A34A; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 10px; animation: slideIn 0.3s ease; }

  .q-highlight-note { margin-top: 14px; font-size: 0.78rem; color: #3B82F6; background: #EFF6FF; border-radius: 8px; padding: 8px 12px; animation: slideIn 0.3s ease; }
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

function CopyableCode({ children, code }) {
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
        <span>⚠️ {title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

const DOORS = [
  { id: 'get', method: 'GET', path: '/gym/members' },
  { id: 'post', method: 'POST', path: '/gym/members' },
  { id: 'put', method: 'PUT', path: '/gym/members/{id}' },
  { id: 'delete', method: 'DELETE', path: '/gym/members/{id}' },
];

const GENERATED_PASSWORD = '8f14e45f-ccde-4b5a-8c51-7e49d3b1e5c3';

export default function SpringSecuritySetup() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);
  const [pwInput, setPwInput] = useState('');

  const [actorEvent, setActorEvent] = useState(null); // { type: 'attacker'|'keyperson', key }
  const actorKeyRef = useRef(0);
  function fireActor(type) {
    actorKeyRef.current += 1;
    setActorEvent({ type, key: actorKeyRef.current });
  }

  const activeStep = step1Done ? (step2Done ? (step3Done ? (step4Done ? 5 : 4) : 3) : 2) : 1;
  const allStepsDone = step1Done && step2Done && step3Done && step4Done;

  const stepRefs = useRef({});
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) { isFirstStepRender.current = false; return; }
    const el = stepRefs.current[activeStep];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }, [activeStep]);

  function toggleStep1() {
    if (!step1Done) play('add');
    setStep1Done(d => !d);
  }
  function toggleStep2() {
    if (!step2Done) {
      if (pwInput.trim().length < 8) { play('warn'); return; }
      play('add');
    }
    setStep2Done(d => !d);
  }
  function toggleStep3() {
    if (!step3Done) {
      play('correct');
      fireActor('attacker');
    }
    setStep3Done(d => !d);
  }
  function toggleStep4() {
    if (!step4Done) {
      play('correct');
      fireActor('keyperson');
    }
    setStep4Done(d => !d);
  }

  const allDoneFiredRef = useRef(false);
  useEffect(() => {
    if (allStepsDone && !allDoneFiredRef.current) {
      allDoneFiredRef.current = true;
      setTimeout(() => play('correct'), 300);
    }
  }, [allStepsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reveal card ──
  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allStepsDone && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => {
          c += 1;
          setRevealCount(c);
          play('tick');
          if (c >= 6) clearInterval(iv);
        }, 500);
      }, 900);
    }
  }, [allStepsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Questions ──
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [attempts, setAttempts] = useState([0, 0, 0]);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function answerQ(qNum, val, correctVal, setter, current) {
    if (current === correctVal) return;
    setter(val);
    if (val === correctVal) play('correct');
    else {
      play('warn');
      setAttempts(a => { const n = [...a]; n[qNum - 1] += 1; return n; });
    }
  }

  const allCorrect = q1 === 'C' && q2 === 'C' && q3 === 'B';
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = revealCount >= 6 && allCorrect && sentences >= 1;

  function handleSubmit() {
    if (!canSubmit) return;
    play('submit');
    setSubmitted(true);
  }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t1-s2-spring-security-setup',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          setup: {
            dependencyAdded: true,
            serverRestarted: true,
            generatedPasswordFound: true,
            got401Confirmed: true,
            basicAuthWorked: true,
          },
          questions: { q1, q2, q3, attemptsPerQ: attempts.map(a => a + 1) },
          reflection: { text: reflection },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sss-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Adding Spring Security</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      <div className="progress-strip">
        <div className={`p-pill${activeStep > 1 ? ' done' : activeStep === 1 ? ' active' : ''}`}>1. Add Dependency</div>
        <div className={`p-line${step1Done ? ' done' : ''}`} />
        <div className={`p-pill${activeStep > 2 ? ' done' : activeStep === 2 ? ' active' : ''}`}>2. Restart</div>
        <div className={`p-line${step2Done ? ' done' : ''}`} />
        <div className={`p-pill${activeStep > 3 ? ' done' : activeStep === 3 ? ' active' : ''}`}>3. See 401</div>
        <div className={`p-line${step3Done ? ' done' : ''}`} />
        <div className={`p-pill${step4Done ? ' done' : activeStep === 4 ? ' active' : ''}`}>4. Test Login</div>
      </div>

      <div className="layout">
        <div className="left-col">

          {/* STEP 1 */}
          <div ref={el => stepRefs.current[1] = el} className={`step-card${step1Done ? ' complete' : activeStep === 1 ? ' active' : ''}`}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 1 - Add Spring Security</h2>
            <div className="analogy-card">
              A security company is about to install your building's system.<br /><br />
              One flip of the switch - every door locks.<br /><br />
              This dependency is that switch.
            </div>
            <p style={{ fontSize: '0.88rem', margin: '0 0 6px' }}>Open <code>pom.xml</code>. Find your <code>&lt;dependencies&gt;</code> section. Add this block inside it:</p>
            <CopyableCode code={`<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-security</artifactId>\n</dependency>`}>
              <span className="code-comment">{'<!-- Spring Security - locks every endpoint -->'}</span>{'\n'}
              <span className="code-tag">{'<dependency>'}</span>{'\n'}
              {'    '}<span className="code-tag">{'<groupId>'}</span>org.springframework.boot<span className="code-tag">{'</groupId>'}</span>{'\n'}
              {'    '}<span className="code-tag">{'<artifactId>'}</span>
              <span className="tooltip-term">spring-boot-starter-security
                <span className="tooltip-box">spring-boot-starter-security - the Spring Security package. Maven downloads it and Spring Boot activates it automatically.</span>
              </span>
              <span className="code-tag">{'</artifactId>'}</span>{'\n'}
              <span className="code-tag">{'</dependency>'}</span>
            </CopyableCode>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Save pom.xml. Maven downloads the dependency. Wait for: <b style={{ color: '#16A34A' }}>BUILD SUCCESS</b></p>

            <Collapsible title="BUILD FAILURE after adding">
              Check the tags are inside &lt;dependencies&gt;<br />
              Check no typos in groupId/artifactId<br />
              Check internet connection is on
            </Collapsible>

            <label className={`checkbox-row${step1Done ? ' checked' : ''}`}>
              <input type="checkbox" checked={step1Done} onChange={toggleStep1} />
              ✅ Dependency added, BUILD SUCCESS
            </label>
          </div>

          {/* STEP 2 */}
          {step1Done && (
          <div ref={el => stepRefs.current[2] = el} className={`step-card${step2Done ? ' complete' : activeStep === 2 ? ' active' : ''}`}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 2 - Restart and read the console carefully</h2>
            <div className="prep-card">
              Before you restart - something NEW will appear in your console.<br /><br />
              Do not panic when you see it. It is expected. It is Spring Boot giving you a temporary access card.
            </div>
            <p style={{ fontSize: '0.88rem' }}>Stop your server (Ctrl+C). Restart:</p>
            <CopyableCode code="./mvnw spring-boot:run">./mvnw spring-boot:run</CopyableCode>

            <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: '14px 0 4px' }}>In the console output - find this line:</p>
            <div className="console-block">
              Using generated security password:<br />
              <span className="console-pw-line">{GENERATED_PASSWORD}</span>
              <div className="console-pw-label">↑ THIS IS YOUR TEMPORARY PASSWORD</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Your password will be different - it is randomly generated.<br />
              <b>COPY IT NOW. Write it down.</b><br />
              It changes every restart. You need it for Step 4.
            </p>

            <div className="pw-input-wrap">
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Paste your generated password here (just for this subtopic - so we can help you test):</label>
              <input className="pw-input" type="text" placeholder="paste your password here" value={pwInput} onChange={e => setPwInput(e.target.value)} />
              <div className="pw-hint">from the console - the long string after "Using generated security password:"</div>
              {pwInput.trim().length > 0 && pwInput.trim().length < 8 && (
                <div className="pw-hint" style={{ color: '#DC2626', fontWeight: 700 }}>That's too short to be the real generated password - it's a long random string, not a word.</div>
              )}
            </div>

            <div className="important-amber">
              Default username is always: <b>user</b><br />
              Password: whatever appeared in console<br /><br />
              These are TEMPORARY. Real users come in 3.1.3.
            </div>

            <label className={`checkbox-row${step2Done ? ' checked' : ''}`} style={{ opacity: pwInput.trim().length >= 8 || step2Done ? 1 : 0.5 }}>
              <input type="checkbox" checked={step2Done} onChange={toggleStep2} disabled={pwInput.trim().length < 8 && !step2Done} />
              ✅ Server restarted - I found the generated password
            </label>
          </div>
          )}

          {/* STEP 3 */}
          {step2Done && (
          <div ref={el => stepRefs.current[3] = el} className={`step-card${step3Done ? ' complete' : activeStep === 3 ? ' active' : ''}`}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 3 - Your endpoints are now locked</h2>
            <p style={{ fontSize: '0.88rem' }}>Open Postman. Try the same request as before:</p>
            <CopyableCode code="GET http://localhost:8080/gym/members">GET http://localhost:8080/gym/members</CopyableCode>

            <div className="win-green">
              You will get this response:<br /><br />
              <b>401 Unauthorized</b><br /><br />
              This is GOOD. This is Spring Security working.<br />
              The stranger from 3.1.1 just hit a locked door.
            </div>

            <div className="response-preview status-401">
              Status: 401 Unauthorized<br />
              Body: (empty)
            </div>

            <div className="contrast-grid">
              <div className="contrast-col before">
                <div className="contrast-title">Before Spring Security</div>
                GET /gym/members<br />
                → 200 OK<br />
                → [all your members]<br />
                ❌ Anyone could see this
              </div>
              <div className="contrast-col after">
                <div className="contrast-title">After Spring Security</div>
                GET /gym/members<br />
                → 401 Unauthorized<br />
                → blocked<br />
                ✅ Locked
              </div>
            </div>

            <Collapsible title="Still getting 200 OK">
              Dependency not saved properly<br />
              Restart server again<br />
              Check pom.xml has the dependency
            </Collapsible>
            <Collapsible title="Cannot connect to server">
              Server not running<br />
              Check console for errors<br />
              Try restarting
            </Collapsible>

            <label className={`checkbox-row${step3Done ? ' checked' : ''}`}>
              <input type="checkbox" checked={step3Done} onChange={toggleStep3} />
              ✅ I see 401 Unauthorized in Postman
            </label>
          </div>
          )}

          {/* STEP 4 */}
          {step3Done && (
          <div ref={el => stepRefs.current[4] = el} className={`step-card${step4Done ? ' complete' : activeStep === 4 ? ' active' : ''}`}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 4 - Prove who you are</h2>
            <p style={{ fontSize: '0.88rem' }}>Same GET request in Postman. But this time - add credentials. In Postman:</p>

            <div className="postman-mock">
              <div className="pm-url-row"><span className="pm-method">GET</span> http://localhost:8080/gym/members</div>
              <div className="pm-tabs">
                <span className="pm-tab">Params</span>
                <span className="pm-tab active">Auth</span>
                <span className="pm-tab">Headers</span>
                <span className="pm-tab">Body</span>
              </div>
              <div className="pm-auth-body">
                <div className="pm-field-row"><span className="pm-field-label">Type</span><span className="pm-field-value">Basic Auth</span></div>
                <div className="pm-field-row"><span className="pm-field-label">Username</span><span className="pm-field-value">user</span></div>
                <div className="pm-field-row"><span className="pm-field-label">Password</span><span className="pm-field-value">{pwInput ? '•'.repeat(Math.min(pwInput.length, 20)) : '(your generated password)'}</span></div>
                <button className="pm-send-btn">Send</button>
              </div>
            </div>

            <div className="info-blue">
              <b>Basic Auth</b> = simplest proof of identity.<br /><br />
              Username + password sent with every request.<br />
              Spring Security checks them. Matches? Let through. Wrong? 401.
            </div>

            <div className="steps-list">
              1. Click the Auth tab in Postman<br />
              2. Change Type to Basic Auth<br />
              3. Username: user<br />
              4. Password: [your console password]<br />
              5. Click Send
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>What you will see:</p>
            <div className="response-preview status-200">
              Status: 200 OK<br />
              [Ravi, Priya, Kiran - full members list]
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              You proved who you are. Spring Security let you through.<br />
              Your data is back - but only for people with valid credentials.
            </p>

            <label className={`checkbox-row${step4Done ? ' checked' : ''}`}>
              <input type="checkbox" checked={step4Done} onChange={toggleStep4} />
              ✅ 200 OK with Basic Auth - my login works
            </label>

            <div className="important-amber">
              This is temporary setup.<br /><br />
              Problems with this approach:<br />
              → Password changes every restart<br />
              → Only one user (user)<br />
              → Real gym owners need their own accounts<br />
              → Real members need their own logins<br /><br />
              3.1.3 fixes all of this - Register and Login endpoints. Permanent accounts. Real passwords stored safely.
            </div>
          </div>
          )}

          {allStepsDone && (
            <div className="summary-card">
              <h3 style={{ margin: '0 0 14px' }}>What Spring Security did with one dependency:</h3>
              <div className="summary-list">
                ✅ Added security filter to every request<br />
                ✅ Required authentication before any endpoint responds<br />
                ✅ Created default user: 'user'<br />
                ✅ Generated temporary password<br />
                ✅ Created /login page
              </div>
              <p style={{ marginTop: 14, fontWeight: 700 }}>You wrote zero security code. Spring Boot did all of this automatically.</p>
            </div>
          )}

          {revealCount > 0 && (
            <div className="reveal-card">
              <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
              {revealCount >= 1 && <div className="reveal-line">✅ <span><b>spring-boot-starter-security</b> → adds security to every endpoint - one dependency, automatic</span></div>}
              {revealCount >= 2 && <div className="reveal-line">✅ <span><b>Security filter</b> → checks every request before it reaches your controller</span></div>}
              {revealCount >= 3 && <div className="reveal-line">✅ <span><b>401 Unauthorized</b> → "prove who you are first"</span></div>}
              {revealCount >= 4 && <div className="reveal-line">✅ <span><b>Basic Auth</b> → username + password sent with the request - temporary, replaced by JWT</span></div>}
              {revealCount >= 5 && <div className="reveal-line">✅ <span><b>Generated password</b> → Spring Boot's temporary card - changes every restart</span></div>}
              {revealCount >= 6 && <div className="reveal-line">✅ <span><b>Default user</b> → username: user - temporary, replaced by real users in 3.1.3</span></div>}
              {revealCount >= 6 && (
                <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                  Your API is locked. 🔒<br /><br />
                  No request gets through without valid credentials.<br />
                  The attacker from 3.1.1 is blocked.<br /><br />
                  Next - Register and Login. Real users. Permanent accounts.<br />
                  Your gym owner gets a real key.
                </p>
              )}
            </div>
          )}

          {revealCount >= 6 && (
            <>
              <div className="q-card">
                <p className="q-title">Q1: After adding Spring Security - what happens to ALL your endpoints?</p>
                {[
                  ['A', 'Only POST and DELETE are locked'],
                  ['B', 'Nothing changes automatically - you configure each endpoint manually'],
                  ['C', 'Every endpoint locks automatically - all require authentication'],
                  ['D', 'Only endpoints you mark with @Secured are locked'],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q1 === k ? (k === 'C' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(1, k, 'C', setQ1, q1)}>{k}) {label}</button>
                ))}
                {q1 && q1 !== 'C' && <div style={{ color: '#B45309', fontSize: '0.82rem', marginTop: 6 }}>Spring Security locks EVERY endpoint automatically - not just some.</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q2: What is the default username when Spring Security is first added?</p>
                {[
                  ['A', 'admin'],
                  ['B', 'root'],
                  ['C', 'user'],
                  ['D', 'spring'],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q2 === k ? (k === 'C' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(2, k, 'C', setQ2, q2)}>{k}) {label}</button>
                ))}
                {q2 && q2 !== 'C' && <div style={{ color: '#B45309', fontSize: '0.82rem', marginTop: 6 }}>The default username is always: user</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q3: The generated password in the console - when does it change?</p>
                {[
                  ['A', 'Every 24 hours'],
                  ['B', 'Every time the server restarts'],
                  ['C', 'It never changes'],
                  ['D', 'Every time someone logs in'],
                ].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q3 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(3, k, 'B', setQ3, q3)}>{k}) {label}</button>
                ))}
              </div>

              {allCorrect && (
                <div className="q-card">
                  <h4 style={{ margin: '0 0 8px' }}>Reflection</h4>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                    In one sentence - why is the generated password not suitable for a real application?
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="The generated password changes every time the server restarts, so real users would lose access every restart. A real app needs permanent accounts with fixed passwords..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                  <button className="btn green" style={{ width: '100%', marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Submitted ✅' : 'Spring Security is active - create real users now →'}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                      <b>Security is on. 🔒</b><br /><br />
                      Your API requires authentication. Every endpoint is protected.<br /><br />
                      Next - 3.1.3.<br />
                      You build Register and Login endpoints. Real users. Their own passwords. Stored safely in MySQL.<br /><br />
                      Your gym owner gets a real account. Your gym members get real accounts.<br />
                      The temporary card gets replaced with permanent ones.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="right-col">
          <BuildingPanel
            step1Done={step1Done} step2Done={step2Done} step3Done={step3Done} step4Done={step4Done}
            actorEvent={actorEvent} pwInput={pwInput}
            q1={q1} q2={q2} q3={q3}
            play={play}
          />
        </div>
      </div>
    </div>
  );
}

function BuildingPanel({ step1Done, step2Done, step3Done, step4Done, actorEvent, pwInput, q1, q2, q3, play }) {
  const allSecure = step1Done;

  // installing = true only during the brief technician-walk-in + lock-sequence window
  // right after step1 is first checked, so the locks visibly snap shut one by one
  // instead of appearing instantly.
  const [installing, setInstalling] = useState(false);
  const [lockedCount, setLockedCount] = useState(0);
  const installFiredRef = useRef(false);

  useEffect(() => {
    if (!step1Done) {
      // step unchecked — reset so re-checking replays the lock sequence
      installFiredRef.current = false;
      setLockedCount(0);
      setInstalling(false);
      return;
    }
    if (installFiredRef.current) return;
    installFiredRef.current = true;
    setInstalling(true);
    DOORS.forEach((_, i) => {
      setTimeout(() => {
        setLockedCount(c => c + 1);
        play('add');
      }, 500 + i * 350);
    });
    setTimeout(() => setInstalling(false), 500 + DOORS.length * 350 + 200);
  }, [step1Done]); // eslint-disable-line react-hooks/exhaustive-deps

  // one-shot actor animation: clears itself after the CSS animation finishes
  // so the icon doesn't sit rendered on screen forever.
  const [visibleActor, setVisibleActor] = useState(null);
  useEffect(() => {
    if (!actorEvent) return;
    setVisibleActor(actorEvent);
    const t = setTimeout(() => setVisibleActor(null), 1600);
    return () => clearTimeout(t);
  }, [actorEvent]);

  return (
    <div className="bld-card">
      <div className="bld-title">Live security system</div>

      <div className={`bld-svg-wrap${allSecure && !installing ? ' bld-glow' : ''}`}>
        <svg width="100%" height="150" viewBox="0 0 260 150">
          <rect x="20" y="20" width="220" height="120" rx="6" fill="#F9FAFB" stroke={allSecure ? '#16A34A' : '#CBD5E1'} strokeWidth="2.5" style={{ transition: 'stroke 0.4s' }} />
          {DOORS.map((d, i) => {
            const x = 40 + i * 55;
            const doorLocked = lockedCount > i;
            return (
              <g key={d.id}>
                <rect x={x} y="70" width="36" height="60" rx="3" fill={doorLocked ? '#ECFDF5' : '#F9FAFB'} stroke="#94A3B8" strokeWidth="1.5" style={{ transition: 'fill 0.3s' }} />
                {doorLocked && (
                  <g className="lock-pop" transform={`translate(${x + 18},${95})`}>
                    <rect x="-7" y="-2" width="14" height="11" rx="2" fill="#16A34A" />
                    <path d="M -4 -2 L -4 -8 A 4 4 0 0 1 4 -8 L 4 -2" fill="none" stroke="#16A34A" strokeWidth="2" />
                  </g>
                )}
                <text x={x + 18} y="145" fontSize="7" textAnchor="middle" fill="#64748B" fontFamily="monospace">{d.method}</text>
              </g>
            );
          })}
          {installing && (
            <g className="tech-svg-walk">
              <circle cx="0" cy="60" r="8" fill="#FBBF24" />
              <rect x="-6" y="66" width="12" height="18" rx="3" fill="#3B82F6" />
            </g>
          )}
        </svg>

        <div className="actor-anim-zone">
          {visibleActor?.type === 'attacker' && (
            <React.Fragment key={visibleActor.key}>
              <span className="attacker-bounce">🕵️</span>
              <span className="bubble-401-mini">401 Unauthorized</span>
            </React.Fragment>
          )}
          {visibleActor?.type === 'keyperson' && (
            <React.Fragment key={visibleActor.key}>
              <span className="keyperson-enter">🧑‍🔧🗝️</span>
              <span className="bubble-200-mini">200 OK</span>
            </React.Fragment>
          )}
          {!visibleActor && installing && (
            <div className="tech-wrap tech-walk" style={{ padding: '10px 12px' }}>
              <span className="tech-spin">🧑‍🔧🧰</span> Installing security system...
            </div>
          )}
          {!visibleActor && !installing && !step1Done && (
            <div className="tech-wrap" style={{ padding: '10px 12px' }}>
              <span>🧑‍🔧🧰</span> Waiting to install security system...
            </div>
          )}
          {!visibleActor && !installing && step1Done && (
            <div className="tech-wrap" style={{ padding: '10px 12px' }}>
              <span>✅</span> Security system installed - switch flipped.
            </div>
          )}
        </div>
      </div>

      <div className={`bld-status-badge ${allSecure ? 'secure' : 'open'}`}>
        {installing ? 'Locking doors…' : allSecure ? 'Security system installed ✅' : 'Unprotected - doors unlocked'}
      </div>

      {step2Done && (
        <div className="console-block console-pop" style={{ marginTop: 14 }}>
          Using generated security password:<br />
          <span className="console-pw-line">{pwInput ? '•'.repeat(Math.min(pwInput.length, 24)) : '(redacted)'}</span>
        </div>
      )}
      {step2Done && (
        <div className="key-wrap key-pop">🗝️ Temporary card issued</div>
      )}

      {step4Done && (
        <div className="bld-status-badge secure bld-glow-badge" style={{ marginTop: 10 }}>Protected ✅</div>
      )}

      {(q1 || q2 || q3) && (
        <div className="q-highlight-note">
          {q1 === 'C' && <div>Q1 ✓ - all 4 doors confirmed locked.</div>}
          {q2 === 'C' && <div>Q2 ✓ - key labeled "user".</div>}
          {q3 === 'B' && <div>Q3 ✓ - password resets every restart ⏱️.</div>}
        </div>
      )}
    </div>
  );
}
