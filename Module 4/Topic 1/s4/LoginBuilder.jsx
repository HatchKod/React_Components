import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .lb-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 20px 16px 60px; color: #1E293B; line-height: 1.5; }
  .lb-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .header h1 { color: #1E293B; }
  .mute-btn { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }

  .rail-track { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1280px; margin: 0 auto 18px; flex-wrap: wrap; }
  .rail-dot { width: 10px; height: 10px; border-radius: 50%; background: #E2E8F0; transition: all 0.3s; }
  .rail-dot.done { background: #10B981; }
  .rail-dot.active { background: #3B82F6; width: 22px; border-radius: 6px; }
  .rail-lbl { font-size: 0.66rem; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 4px; }
  .rail-lbl.active-lbl { color: #2563EB; }
  .rail-lbl.done-lbl { color: #16A34A; }

  .stage-wrap { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }
  @media(max-width: 980px) { .stage-wrap { grid-template-columns: 1fr; } }

  .rail-col { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; max-height: 80vh; overflow-y: auto; position: sticky; top: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
  @media(max-width: 980px) { .rail-col { position: static; max-height: none; } }
  .rail-step-title { font-size: 1.02rem; font-weight: 800; color: #1E293B; margin: 0 0 10px; }
  .rail-prose { font-size: 0.82rem; color: #64748B; line-height: 1.7; margin-bottom: 12px; }
  .rail-prose b { color: #1E293B; }

  .mini-analogy { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #78350F; line-height: 1.6; margin-bottom: 12px; }
  .mini-blue { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #1E40AF; line-height: 1.6; margin-bottom: 12px; }
  .mini-green { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #14532D; line-height: 1.6; margin-bottom: 12px; }
  .mini-red { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #7F1D1D; line-height: 1.6; margin-bottom: 12px; }

  .rail-code { background: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; font-family: 'Courier New', monospace; font-size: 0.72rem; line-height: 1.65; color: #E2E8F0; margin: 8px 0; overflow-x: auto; white-space: pre-wrap; position: relative; }
  .rail-copy { position: absolute; top: 6px; right: 6px; background: #334155; color: #E2E8F0; border: none; border-radius: 5px; padding: 2px 8px; font-size: 0.62rem; cursor: pointer; }
  .rc-tag { color: #93C5FD; } .rc-comment { color: #64748B; } .rc-blank-done { color: #6EE7B7; font-weight: 700; }

  .rail-blank { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; margin: 8px 0; }
  .rail-blank-q { font-size: 0.76rem; color: #92400E; margin-bottom: 8px; line-height: 1.5; }
  .rail-opts { display: flex; gap: 6px; flex-wrap: wrap; }
  .rail-opt-btn { background: #fff; color: #1E293B; border: 1.5px solid #E2E8F0; border-radius: 6px; padding: 6px 12px; font-family: monospace; font-size: 0.74rem; font-weight: 700; cursor: pointer; }
  .rail-opt-btn:hover { border-color: #94A3B8; }
  .rail-opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .rail-opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  .rail-input-row { display: flex; gap: 6px; }
  .rail-text-input { background: #fff; color: #1E293B; border: 1.5px solid #E2E8F0; border-radius: 6px; padding: 7px 10px; font-family: monospace; font-size: 0.76rem; flex: 1; }
  .rail-submit-btn { background: #3B82F6; color: #fff; border: none; border-radius: 6px; padding: 7px 14px; font-weight: 700; cursor: pointer; font-size: 0.76rem; }
  .rail-feedback { margin-top: 6px; font-size: 0.72rem; }
  .rail-feedback.wrong { color: #DC2626; }
  .rail-feedback.correct { color: #16A34A; }

  .rail-btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 0.85rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .rail-btn:disabled { background: #CBD5E1; color: #94A3B8; cursor: not-allowed; }
  .rail-btn.green { background: #16A34A; }
  .rail-check { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.8rem; color: #1E293B; }
  .rail-check.checked { background: #F0FDF4; color: #14532D; }
  .rail-check input { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
  .replay-mini { background: none; border: 1.5px solid #E2E8F0; color: #64748B; border-radius: 16px; padding: 3px 10px; font-size: 0.66rem; font-weight: 700; cursor: pointer; margin-left: 8px; }
  .replay-mini:hover { border-color: #3B82F6; color: #2563EB; }

  .compare-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; font-size: 0.78rem; margin: 12px 0; }
  .compare-table td { padding: 12px 14px; font-family: monospace; font-weight: 600; border-radius: 0 8px 8px 0; }
  .compare-row-encode td { background: #EFF6FF; color: #1E40AF; border-left: 4px solid #3B82F6; }
  .compare-row-matches td { background: #F0FDF4; color: #14532D; border-left: 4px solid #16A34A; }

  /* ── STAGE: security checkpoint ── */
  .machine-col { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px 24px; min-height: 560px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
  .machine-stage-label { text-align: center; font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }

  /* contacts lookup (slot 1) */
  .contact-search-row { display: flex; gap: 8px; margin-bottom: 16px; }
  .contact-search-input { flex: 1; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; color: #1E293B; font-size: 0.85rem; }
  .contact-search-btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-weight: 700; cursor: pointer; font-size: 0.8rem; }
  .contact-search-btn.gray { background: #94A3B8; }
  .contact-btn-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 18px; flex-wrap: wrap; }

  .contact-card-result { border-radius: 10px; padding: 16px; margin-bottom: 14px; animation: fadeInUp 0.4s ease; }
  .contact-card-result.found { background: #F0FDF4; border: 1.5px solid #10B981; }
  .contact-card-result.notfound { background: #FEF2F2; border: 1.5px solid #DC2626; }
  .contact-name-row { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; font-weight: 700; color: #1E293B; }
  .contact-avatar { width: 36px; height: 36px; border-radius: 50%; background: #E2E8F0; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

  .optional-box { border: 2px dashed #E2E8F0; border-radius: 12px; padding: 18px; text-align: center; margin-top: 16px; transition: all 0.4s ease; }
  .optional-box.has-value { border-color: #10B981; border-style: solid; background: #F0FDF4; }
  .optional-box.empty-value { border-color: #DC2626; border-style: solid; background: #FEF2F2; }
  .optional-box-title { font-family: monospace; font-size: 0.78rem; color: #64748B; margin-bottom: 10px; font-weight: 700; }
  .optional-box-content { font-size: 0.82rem; color: #475569; }
  .optional-method-row { display: flex; justify-content: center; gap: 20px; margin-top: 12px; font-family: monospace; font-size: 0.72rem; }
  .optional-method-tag { padding: 4px 10px; border-radius: 6px; background: #F1F5F9; color: #64748B; }
  .optional-method-tag.lit { background: #DCFCE7; color: #16A34A; font-weight: 700; }

  /* findByUsername breakdown (slot 2) */
  .method-breakdown-row { display: flex; gap: 6px; justify-content: center; margin: 16px 0; flex-wrap: wrap; }
  .method-part { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 90px; }
  .method-part-word { font-family: monospace; font-weight: 800; color: #2563EB; font-size: 0.9rem; }
  .method-part-meaning { font-size: 0.65rem; color: #64748B; margin-top: 4px; }

  /* checkpoint gates (slot 3 + 4) — the core new concept */
  .checkpoint-stage { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 24px 0; flex-wrap: wrap; }
  @media(max-width: 700px) { .checkpoint-stage { flex-direction: column; } }
  .gate-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .gate-post { width: 120px; height: 150px; border-radius: 14px; border: 2.5px solid #E2E8F0; background: #F8FAFC; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; position: relative; transition: all 0.4s ease; }
  .gate-post.gate-pass { border-color: #10B981; background: #F0FDF4; }
  .gate-post.gate-fail { border-color: #DC2626; background: #FEF2F2; }
  @keyframes gateFlash { 0%,100% { box-shadow: none; } 50% { box-shadow: 0 0 0 5px rgba(220,38,38,0.3); } }
  .gate-post.gate-flash { animation: gateFlash 0.6s ease 2; }
  .gate-lbl { font-size: 0.74rem; color: #64748B; font-family: monospace; text-align: center; max-width: 130px; }
  .gate-connector { width: 30px; height: 2px; background: #E2E8F0; position: relative; }
  .gate-connector.lit { background: #10B981; }
  @keyframes badgeTravel { from { left: -20px; opacity: 0; } 20% { opacity: 1; } to { left: 100%; opacity: 1; } }
  .badge-travel-icon { position: absolute; top: -22px; font-size: 1.1rem; animation: badgeTravel 0.8s ease forwards; }

  .outcome-doors-row { display: flex; gap: 10px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
  .outcome-door { flex: 1; min-width: 100px; max-width: 140px; border-radius: 10px; padding: 12px 8px; text-align: center; font-size: 0.68rem; border: 1.5px solid #E2E8F0; background: #F8FAFC; color: #64748B; transition: all 0.4s ease; }
  .outcome-door.lit-gray { border-color: #94A3B8; background: #F1F5F9; color: #475569; }
  .outcome-door.lit-red { border-color: #DC2626; background: #FEF2F2; color: #991B1B; }
  .outcome-door.lit-green { border-color: #10B981; background: #F0FDF4; color: #14532D; }
  .outcome-door-icon { font-size: 1.4rem; margin-bottom: 4px; }

  .checkpoint-badge-lane { position: relative; height: 26px; }

  .payoff-banner { text-align: center; margin-top: 18px; padding: 16px; border-radius: 10px; background: linear-gradient(135deg, #F0FDF4, #FFFFFF); border: 1px solid #86EFAC; }
  .payoff-line { font-size: 0.86rem; color: #14532D; opacity: 0; animation: fadeInUp 0.4s ease forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .reveal-strip { max-width: 1280px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.88rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }

  .qcheck-note-r { font-size: 0.76rem; margin-top: 8px; padding: 8px 10px; border-radius: 7px; }
  .qcheck-note-r.wrong { background: #FEF2F2; color: #991B1B; }
  .qcheck-note-r.correct { background: #F0FDF4; color: #14532D; }

  /* test cards (slot 4 left rail) */
  .test-card-num { font-size: 0.68rem; font-weight: 800; color: #F59E0B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

  /* Phase 2 */
  .phase2-wrap { max-width: 900px; margin: 20px auto 0; background: #fff; color: #1E293B; border-radius: 16px; padding: 28px; }
  .p2-blue { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #F0FDF4; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
  .p2-code { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Courier New', monospace; font-size: 0.8rem; line-height: 1.7; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .p2-copy { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; color: #1E293B; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }
  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }
  .check-pop { display: inline-block; animation: checkPop 0.35s ease; }
  @keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
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

function CopyBlock({ code, children, cls = 'rail-code', btnCls = 'rail-copy' }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    try { navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={cls}>
      <button className={btnCls} onClick={doCopy}>{copied ? 'Copied!' : 'Copy'}</button>
      {children}
    </div>
  );
}

const STEPS = ['Optional', 'findByUsername + matches', 'Login Endpoint', 'Test 3 Cases'];

export default function LoginBuilder() {
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

  // ── Step 1: Optional (phone contact) ──
  const [searchResult, setSearchResult] = useState(null); // 'found' | 'notfound' | null
  const [getQAnswer, setGetQAnswer] = useState(null);

  function searchGymowner() {
    setSearchResult('found');
    play('correct');
  }
  function searchNobody() {
    setSearchResult('notfound');
    play('warn');
  }
  function answerGetQ(val) {
    if (getQAnswer === 'B') return;
    setGetQAnswer(val);
    if (val === 'B') play('correct'); else play('warn');
  }
  function buildIt() { play('tick'); setStep(2); }

  // ── Step 2: findByUsername + matches ──
  const [optionalBlankInput, setOptionalBlankInput] = useState('');
  const [optionalBlankCorrect, setOptionalBlankCorrect] = useState(false);
  const [optionalBlankWrong, setOptionalBlankWrong] = useState(false);
  const [showCompareCard, setShowCompareCard] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  function submitOptionalBlank() {
    if (optionalBlankInput.trim().toLowerCase() === 'optional') {
      setOptionalBlankCorrect(true);
      setOptionalBlankWrong(false);
      play('add');
      setTimeout(() => setShowCompareCard(true), 300);
    } else {
      setOptionalBlankWrong(true);
      play('warn');
    }
  }
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: Login endpoint ──
  const [matchesAnswer, setMatchesAnswer] = useState(null);
  const [outcomeCardIdx, setOutcomeCardIdx] = useState(0);
  const [step3Done, setStep3Done] = useState(false);
  const [predict1, setPredict1] = useState(null);
  const [predict2, setPredict2] = useState(null);

  function answerMatches(val) {
    if (matchesAnswer === 'matches') return;
    setMatchesAnswer(val);
    if (val === 'matches') { play('add'); setOutcomeCardIdx(1); }
    else play('warn');
  }
  function nextOutcomeCard() {
    play('tick');
    setOutcomeCardIdx(i => i + 1);
  }
  function toggleStep3() {
    if (!step3Done) { play('add'); setTimeout(() => setStep(4), 400); }
    setStep3Done(d => !d);
  }

  // ── Step 4: three test cases ──
  const [testIdx, setTestIdx] = useState(1); // which test card is shown (1,2,3)
  const [test1Done, setTest1Done] = useState(false);
  const [test2Done, setTest2Done] = useState(false);
  const [test3Done, setTest3Done] = useState(false);
  const [gateAnim, setGateAnim] = useState(null); // { key, path: 'success'|'wrongpw'|'notfound' }
  const gateAnimKeyRef = useRef(0);

  function fireGateAnim(path) {
    gateAnimKeyRef.current += 1;
    setGateAnim({ key: gateAnimKeyRef.current, path });
  }

  function toggleTest1() {
    if (!test1Done) {
      play('correct');
      fireGateAnim('success');
    }
    setTest1Done(d => !d);
  }
  function toggleTest2() {
    if (!test2Done) {
      play('warn');
      setTimeout(() => play('correct'), 350);
      fireGateAnim('wrongpw');
    }
    setTest2Done(d => !d);
  }
  function toggleTest3() {
    if (!test3Done) {
      play('warn');
      setTimeout(() => play('correct'), 350);
      fireGateAnim('notfound');
    }
    setTest3Done(d => !d);
  }
  function nextTest() { play('tick'); setTestIdx(i => i + 1); }

  const allTestsDone = test1Done && test2Done && test3Done;
  const [payoffLines, setPayoffLines] = useState(0);
  const payoffFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsDone && !payoffFiredRef.current) {
      payoffFiredRef.current = true;
      play('correct');
      setTimeout(() => play('reveal'), 1000);
      let c = 0;
      const iv = setInterval(() => { c += 1; setPayoffLines(c); if (c >= 7) clearInterval(iv); }, 400);
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
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 5) clearInterval(iv); }, 500);
      }, 3500);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [files, setFiles] = useState({ repo: false, controller: false });
  const [tested, setTested] = useState({ correct: false, wrong: false, unknown: false });
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleFile(key) { setFiles(f => { const nv = !f[key]; if (nv) play('add'); return { ...f, [key]: nv }; }); }
  const allTestedFiredRef = useRef(false);
  function toggleTested(key) {
    setTested(t => {
      const nv = { ...t, [key]: !t[key] };
      if (nv.correct && nv.wrong && nv.unknown && !allTestedFiredRef.current) { allTestedFiredRef.current = true; play('correct'); }
      else if (!t[key]) play('add');
      return nv;
    });
  }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const allFilesUpdated = files.repo && files.controller;
  const allCasesTested = tested.correct && tested.wrong && tested.unknown;
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = allFilesUpdated && allCasesTested && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t1-s4-login-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { optionalAnalogy: true, foundGetQuestion: getQAnswer, optionalUnderstood: getQAnswer === 'B' },
            slot2: { optionalBlank: optionalBlankInput, repoUpdated: step2Done },
            slot3: { matchesBlank: matchesAnswer, loginCreated: step3Done },
            slot4: { correctLoginWorks: test1Done, wrongPasswordBlocked: test2Done, unknownUserBlocked: test3Done },
          },
          phase2: {
            filesUpdated: allFilesUpdated,
            allThreeCasesTested: allCasesTested,
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
    <div className="lb-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>The Login Checkpoint</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      {phase === 1 && (
        <>
          <div className="rail-track">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ color: '#334155' }}>—</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={`rail-dot${step > i + 1 ? ' done' : step === i + 1 ? ' active' : ''}`} />
                  <span className={`rail-lbl${step > i + 1 ? ' done-lbl' : step === i + 1 ? ' active-lbl' : ''}`}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="stage-wrap">
            {/* ── LEFT RAIL ── */}
            <div className="rail-col" ref={railRef}>

              {step === 1 && (
                <>
                  <h2 className="rail-step-title">Optional — the contact that might not exist</h2>
                  <p className="rail-prose">Search your phone contacts on the right. Some names exist. Some don't. Watch what changes.</p>
                  <div className="contact-btn-row" style={{ flexDirection: 'column' }}>
                    <button className="contact-search-btn" onClick={searchGymowner}>Search "gymowner" →</button>
                    <button className="contact-search-btn gray" onClick={searchNobody}>Search "nobody" →</button>
                  </div>

                  {searchResult && (
                    <div className="mini-blue">
                      <b>Optional&lt;User&gt;</b> handles both outcomes.<br /><br />
                      <code>found.isEmpty()</code> → checks if nobody was found<br />
                      <code>found.get()</code> → gets the actual User object<br /><br />
                      Without Optional — if nobody found and you try to use the result, your app crashes. Optional makes it safe.
                    </div>
                  )}

                  {searchResult && (
                    <>
                      <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B' }}>What does found.get() do?</p>
                      <div className="rail-opts" style={{ flexDirection: 'column' }}>
                        {[['A', 'Checks if the user exists'], ['B', 'Gets the actual User object from the Optional'], ['C', 'Deletes the user'], ['D', 'Saves the user']].map(([k, label]) => (
                          <button key={k} className={`rail-opt-btn${getQAnswer === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerGetQ(k)}>{k}) {label}</button>
                        ))}
                      </div>
                      {getQAnswer && getQAnswer !== 'B' && <div className="rail-feedback wrong">found.get() unwraps the Optional. It gives you the actual User object.</div>}
                      {getQAnswer === 'B' && <div className="rail-feedback correct">Correct!</div>}
                      {getQAnswer === 'B' && <button className="rail-btn" onClick={buildIt}>Build it →</button>}
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="rail-step-title">Step 1 — Add findByUsername and understand matches()</h2>
                  <CopyBlock code={`public interface UserRepository extends JpaRepository<User, Long> {\n\n    Optional<User> findByUsername(String username);\n}`}>
                    public interface UserRepository{'\n'}
                    {'    '}extends JpaRepository{'<User, Long>'} {'{'}{'\n\n'}
                    {'    '}{optionalBlankCorrect ? <span className="rc-blank-done">Optional</span> : '[___]'}{'<User>'} findByUsername({'\n'}
                    <span className="rc-comment">    {'    '}// ↑ might not exist{'\n'}</span>
                    {'        '}String username{'\n'}
                    {'    '});{'\n'}{'}'}
                  </CopyBlock>

                  {!optionalBlankCorrect && (
                    <div className="rail-blank">
                      <div className="rail-blank-q">findByUsername might find a user — or might not. What wrapper type handles both? (the phone contact wrapper from Slot 1)</div>
                      <div className="rail-input-row">
                        <input className="rail-text-input" placeholder="Optional" value={optionalBlankInput} onChange={e => { setOptionalBlankInput(e.target.value); setOptionalBlankWrong(false); }} />
                        <button className="rail-submit-btn" onClick={submitOptionalBlank}>Check</button>
                      </div>
                      {optionalBlankWrong && <div className="rail-feedback wrong">The wrapper type is Optional.</div>}
                    </div>
                  )}

                  {optionalBlankCorrect && (
                    <div className="mini-blue">
                      JPA reads the method name:<br />
                      <code>find</code> → search, <code>By</code> → where condition, <code>Username</code> → on the username field<br /><br />
                      JPA generates the query. You write only the name. No SQL written by you.
                    </div>
                  )}

                  {showCompareCard && (
                    <>
                      <table className="compare-table">
                        <tbody>
                          <tr className="compare-row-encode"><td>encode("gym@123") → "$2a$10$..." — USE WHEN: saving password (register)</td></tr>
                          <tr className="compare-row-matches"><td>matches("gym@123", "$2a$10$...") → true/false — USE WHEN: checking password (login)</td></tr>
                        </tbody>
                      </table>
                      <p className="rail-prose">You already used encode() in 3.1.3. Now you use matches() here.</p>
                      <label className={`rail-check${step2Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={step2Done} onChange={toggleStep2} />
                        ✅ UserRepository updated with findByUsername
                      </label>
                    </>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="rail-step-title">Step 2 — The Login endpoint</h2>
                  <div className="mini-blue">Step 1: Find user by username. Step 2: Check if password matches. Step 3: Return the right response.</div>
                  <CopyBlock code={`@PostMapping("/login")\npublic String login(@RequestBody User loginRequest) {\n    Optional<User> found = userRepository.findByUsername(loginRequest.getUsername());\n\n    if (found.isEmpty()) {\n        return "User not found";\n    }\n    User existing = found.get();\n    boolean match = passwordEncoder.matches(loginRequest.getPassword(), existing.getPassword());\n    if (match) {\n        return "Login successful: " + existing.getUsername();\n    }\n    return "Wrong password";\n}`}>
                    <span className="rc-tag">@PostMapping</span>("/login"){'\n'}
                    public String login(...) {'{'}{'\n'}
                    {'    '}Optional{'<User>'} found = userRepository.findByUsername(...);{'\n\n'}
                    {'    '}if (found.isEmpty()) return "User not found";{'\n'}
                    {'    '}User existing = found.get();{'\n'}
                    {'    '}boolean match = passwordEncoder.{matchesAnswer === 'matches' ? <span className="rc-blank-done">matches</span> : '[___]'}(...);{'\n'}
                    {'    '}if (match) return "Login successful: " + existing.getUsername();{'\n'}
                    {'    '}return "Wrong password";{'\n'}{'}'}
                  </CopyBlock>

                  {matchesAnswer !== 'matches' && (
                    <div className="rail-blank">
                      <div className="rail-blank-q">This compares the typed password to the stored hash. encode() grinds. ___() compares.</div>
                      <div className="rail-opts">
                        {['encode', 'matches', 'compare', 'verify'].map(opt => (
                          <button key={opt} className={`rail-opt-btn${matchesAnswer === opt && opt !== 'matches' ? ' wrong' : ''}`} onClick={() => answerMatches(opt)}>{opt}</button>
                        ))}
                      </div>
                      {matchesAnswer && matchesAnswer !== 'matches' && <div className="rail-feedback wrong">matches() is the comparison. encode() is the grinder. For login — you compare.</div>}
                    </div>
                  )}

                  {outcomeCardIdx === 1 && (
                    <div className="mini-red">
                      <b>Someone tries to log in as 'nobody' — a username that doesn't exist.</b><br />
                      Which gate stops them?
                      {!predict1 ? (
                        <div className="rail-opts" style={{ marginTop: 8 }}>
                          {['Gate 1 — findByUsername', 'Gate 2 — matches()'].map(opt => (
                            <button key={opt} className={`rail-opt-btn${predict1 && predict1 !== opt ? ' wrong' : ''}`} onClick={() => { setPredict1(opt); play(opt.startsWith('Gate 1') ? 'add' : 'warn'); }}>{opt}</button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className={predict1.startsWith('Gate 1') ? 'rail-feedback' : 'rail-feedback wrong'} style={{ marginTop: 8 }}>
                            {predict1.startsWith('Gate 1') ? '✅ Right — ' : '❌ Not quite — '}
                            found.isEmpty() → true at Gate 1. Username not in MySQL → return 'User not found'. Gate 2 never even runs.
                          </div>
                          <button className="rail-btn" onClick={nextOutcomeCard}>Next →</button>
                        </>
                      )}
                    </div>
                  )}
                  {outcomeCardIdx === 2 && (
                    <div className="mini-red">
                      <b>'gymowner' exists, but they typed the wrong password.</b><br />
                      Which gate stops them?
                      {!predict2 ? (
                        <div className="rail-opts" style={{ marginTop: 8 }}>
                          {['Gate 1 — findByUsername', 'Gate 2 — matches()'].map(opt => (
                            <button key={opt} className={`rail-opt-btn${predict2 && predict2 !== opt ? ' wrong' : ''}`} onClick={() => { setPredict2(opt); play(opt.startsWith('Gate 2') ? 'add' : 'warn'); }}>{opt}</button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className={predict2.startsWith('Gate 2') ? 'rail-feedback' : 'rail-feedback wrong'} style={{ marginTop: 8 }}>
                            {predict2.startsWith('Gate 2') ? '✅ Right — ' : '❌ Not quite — '}
                            Gate 1 finds them fine (username exists). Gate 2 fails: matches() → false. Password does not match stored hash → return 'Wrong password'.
                          </div>
                          <button className="rail-btn" onClick={nextOutcomeCard}>Next →</button>
                        </>
                      )}
                    </div>
                  )}
                  {outcomeCardIdx === 3 && (
                    <div className="mini-green">
                      <b>matches() → true</b><br />Password matches stored hash → return 'Login successful: gymowner'
                      <button className="rail-btn" onClick={() => { play('tick'); setOutcomeCardIdx(4); }}>Got it →</button>
                    </div>
                  )}
                  {outcomeCardIdx >= 4 && (
                    <label className={`rail-check${step3Done ? ' checked' : ''}`}>
                      <input type="checkbox" checked={step3Done} onChange={toggleStep3} />
                      ✅ Login endpoint added to AuthController
                    </label>
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="rail-step-title">Test Login — three cases</h2>
                  <p className="rail-prose">Three tests. In order. One at a time.</p>

                  {testIdx === 1 && (
                    <>
                      <div className="test-card-num">Test 1 of 3 — Correct credentials</div>
                      <CopyBlock code={`POST /auth/login\n\n{\n  "username": "gymowner",\n  "password": "gym@123"\n}`}>
                        POST /auth/login{'\n\n'}{'{'}{'\n'}{'  '}"username": "gymowner",{'\n'}{'  '}"password": "gym@123"{'\n'}{'}'}
                      </CopyBlock>
                      <p className="rail-prose">Expected: "Login successful: gymowner"</p>
                      <div className="mini-green">matches() returned true. gymowner is verified. Login successful. ✅</div>
                      <label className={`rail-check${test1Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test1Done} onChange={toggleTest1} />
                        ✅ Correct login works
                      </label>
                      {test1Done && <button className="rail-btn" onClick={nextTest}>Next test →</button>}
                    </>
                  )}

                  {testIdx === 2 && (
                    <>
                      <div className="test-card-num">Test 2 of 3 — Wrong password</div>
                      <CopyBlock code={`POST /auth/login\n\n{\n  "username": "gymowner",\n  "password": "wrongpassword"\n}`}>
                        POST /auth/login{'\n\n'}{'{'}{'\n'}{'  '}"username": "gymowner",{'\n'}{'  '}"password": "wrongpassword"{'\n'}{'}'}
                      </CopyBlock>
                      <p className="rail-prose">Expected: "Wrong password"</p>
                      <div className="mini-red">matches() returned false. 'wrongpassword' grinds to a different powder. Does not match stored hash. Access denied. ✅</div>
                      <label className={`rail-check${test2Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test2Done} onChange={toggleTest2} />
                        ✅ Wrong password blocked
                      </label>
                      {test2Done && <button className="rail-btn" onClick={nextTest}>Next test →</button>}
                    </>
                  )}

                  {testIdx === 3 && (
                    <>
                      <div className="test-card-num">Test 3 of 3 — Unknown username</div>
                      <CopyBlock code={`POST /auth/login\n\n{\n  "username": "nobody",\n  "password": "gym@123"\n}`}>
                        POST /auth/login{'\n\n'}{'{'}{'\n'}{'  '}"username": "nobody",{'\n'}{'  '}"password": "gym@123"{'\n'}{'}'}
                      </CopyBlock>
                      <p className="rail-prose">Expected: "User not found"</p>
                      <div className="mini-red">found.isEmpty() returned true. 'nobody' is not in the users table. Cannot even reach matches(). Access denied. ✅</div>
                      <label className={`rail-check${test3Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test3Done} onChange={toggleTest3} />
                        ✅ Unknown user blocked
                      </label>
                    </>
                  )}

                  {allTestsDone && <p className="rail-prose" style={{ marginTop: 14 }}>Scroll down for what you just learned →</p>}
                </>
              )}
            </div>

            {/* ── RIGHT: the checkpoint stage ── */}
            <div className="machine-col">
              <div className="machine-stage-label">
                {step === 1 && 'Contacts — Optional<User>'}
                {step === 2 && 'findByUsername() breakdown'}
                {step === 3 && 'The checkpoint — how a login travels through'}
                {step === 4 && 'Live checkpoint — three outcomes'}
              </div>

              {step === 1 && (
                <>
                  {!searchResult && (
                    <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0' }}>Search a contact on the left to see it appear here.</div>
                  )}
                  {searchResult === 'found' && (
                    <div className="contact-card-result found">
                      <div className="contact-name-row"><div className="contact-avatar">👤</div>gymowner</div>
                      <div style={{ color: '#6EE7B7', fontSize: '0.78rem', marginTop: 8 }}>📞 account found</div>
                    </div>
                  )}
                  {searchResult === 'notfound' && (
                    <div className="contact-card-result notfound">
                      <div style={{ color: '#FCA5A5', fontSize: '0.85rem' }}>No results for 'nobody'</div>
                    </div>
                  )}
                  {searchResult && (
                    <div className={`optional-box ${searchResult === 'found' ? 'has-value' : 'empty-value'}`}>
                      <div className="optional-box-title">Optional&lt;User&gt;</div>
                      <div className="optional-box-content">{searchResult === 'found' ? '👤 User object inside' : 'empty — nothing inside'}</div>
                      <div className="optional-method-row">
                        <span className={`optional-method-tag${searchResult === 'notfound' ? ' lit' : ''}`}>isEmpty() → {searchResult === 'notfound' ? 'true' : 'false'}</span>
                        <span className={`optional-method-tag${searchResult === 'found' ? ' lit' : ''}`}>get() → {searchResult === 'found' ? 'User object ✅' : 'n/a'}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="method-breakdown-row">
                    <div className="method-part"><div className="method-part-word">find</div><div className="method-part-meaning">search</div></div>
                    <div className="method-part"><div className="method-part-word">By</div><div className="method-part-meaning">where condition</div></div>
                    <div className="method-part"><div className="method-part-word">Username</div><div className="method-part-meaning">on the field</div></div>
                  </div>
                  <table className="compare-table">
                    <tbody>
                      <tr className="compare-row-encode"><td>encode() → register path (done in 3.1.3)</td></tr>
                      <tr className="compare-row-matches"><td>matches() → login path (this subtopic)</td></tr>
                    </tbody>
                  </table>
                </>
              )}

              {step === 3 && (
                <div className="checkpoint-stage">
                  <div className="gate-col">
                    <div className={`gate-post${optionalBlankCorrect ? ' gate-pass' : ''}`}>🪪</div>
                    <div className="gate-lbl">Gate 1<br />findByUsername</div>
                  </div>
                  <div className="gate-connector" />
                  <div className="gate-col">
                    <div className={`gate-post${matchesAnswer === 'matches' ? ' gate-pass' : ''}`}>⚖️</div>
                    <div className="gate-lbl">Gate 2<br />matches()</div>
                  </div>
                  <div className="gate-connector" />
                  <div className="outcome-doors-row" style={{ flexDirection: 'column', gap: 6 }}>
                    <div className="outcome-door lit-gray"><div className="outcome-door-icon">🚫</div>User not found</div>
                    <div className="outcome-door lit-red"><div className="outcome-door-icon">❌</div>Wrong password</div>
                    <div className="outcome-door lit-green"><div className="outcome-door-icon">✅</div>Login successful</div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <>
                  <div className="checkpoint-stage" key={gateAnim?.key || 'idle'}>
                    <div className="gate-col">
                      <div className="checkpoint-badge-lane">
                        {gateAnim && <span className="badge-travel-icon">🪪</span>}
                      </div>
                      <div className={`gate-post gate-pass${gateAnim?.path === 'notfound' ? ' gate-fail gate-flash' : gateAnim ? ' gate-pass' : ''}`}>🪪</div>
                      <div className="gate-lbl">Gate 1<br />findByUsername</div>
                    </div>
                    <div className={`gate-connector${gateAnim && gateAnim.path !== 'notfound' ? ' lit' : ''}`} />
                    <div className="gate-col">
                      <div className={`gate-post${gateAnim?.path === 'success' ? ' gate-pass' : gateAnim?.path === 'wrongpw' ? ' gate-fail gate-flash' : ''}`}>⚖️</div>
                      <div className="gate-lbl">Gate 2<br />matches()</div>
                    </div>
                    <div className={`gate-connector${gateAnim?.path === 'success' ? ' lit' : ''}`} />
                    <div className="outcome-doors-row" style={{ flexDirection: 'column', gap: 6 }}>
                      <div className={`outcome-door${test3Done ? ' lit-gray' : ''}`}><div className="outcome-door-icon">🚫</div>User not found</div>
                      <div className={`outcome-door${test2Done ? ' lit-red' : ''}`}><div className="outcome-door-icon">❌</div>Wrong password</div>
                      <div className={`outcome-door${test1Done ? ' lit-green' : ''}`}><div className="outcome-door-icon">✅</div>Login successful</div>
                    </div>
                  </div>
                  {allTestsDone && (
                    <div style={{ textAlign: 'center', color: '#6EE7B7', fontSize: '0.82rem', fontWeight: 700, marginTop: 8 }}>All cases handled ✅</div>
                  )}
                  {payoffLines > 0 && (
                    <div className="payoff-banner">
                      {['Your Login handles:', '✅ Correct credentials → success', '✅ Wrong password → blocked', '✅ Unknown username → blocked', 'Three outcomes.', 'All handled cleanly.', 'No crashes. No security gaps.'].map((line, i) => (
                        payoffLines >= i + 1 && <div key={line} className="payoff-line" style={{ animationDelay: `${i * 0.05}s`, fontWeight: i === 0 || i === 6 ? 700 : 400 }}>{line}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {revealCount > 0 && (
            <div className="reveal-strip">
              <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
              {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>Optional&lt;User&gt;</b> → safe wrapper — user might exist or might not. isEmpty() checks, get() unwraps</span></div>}
              {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>findByUsername(name)</b> → JPA reads method name, generates query automatically</span></div>}
              {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>matches(typed, stored)</b> → BCrypt comparison — grinds typed, compares to stored hash, returns true or false</span></div>}
              {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>found.get()</b> → unwraps Optional — gets the actual User object</span></div>}
              {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>Three login outcomes</b> → user not found / wrong password / login successful</span></div>}
              {revealCount >= 5 && (
                <>
                  <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                    Register creates accounts. Login verifies them.<br /><br />
                    encode() protects on the way in. matches() checks on the way back.<br /><br />
                    Next — 3.1.5. Test the complete flow. Then — JWT. Login returns a token.
                  </p>
                  <button className="rail-btn" onClick={goToPhase2}>Build for YOUR project →</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {phase === 2 && (
        <div className="phase2-wrap">
          <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Add Login to YOUR project</h2>

          <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — Update files</h3>
          <label className={`task-item${files.repo ? ' checked' : ''}`}>
            <input type="checkbox" checked={files.repo} onChange={() => toggleFile('repo')} />
            UserRepository — findByUsername added
          </label>
          <label className={`task-item${files.controller ? ' checked' : ''}`}>
            <input type="checkbox" checked={files.controller} onChange={() => toggleFile('controller')} />
            AuthController — login endpoint added
          </label>

          <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — Test all three cases</h3>
          <label className={`task-item${tested.correct ? ' checked' : ''}`}>
            <input type="checkbox" checked={tested.correct} onChange={() => toggleTested('correct')} />
            Correct credentials work
          </label>
          <label className={`task-item${tested.wrong ? ' checked' : ''}`}>
            <input type="checkbox" checked={tested.wrong} onChange={() => toggleTested('wrong')} />
            Wrong password returns error
          </label>
          <label className={`task-item${tested.unknown ? ' checked' : ''}`}>
            <input type="checkbox" checked={tested.unknown} onChange={() => toggleTested('unknown')} />
            Unknown username returns error
          </label>

          <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — Commit</h3>
          <CopyBlock code={`git add .\ngit commit -m "add Login endpoint with Optional and matches()"\ngit push origin main`} cls="p2-code" btnCls="p2-copy">
            git add .{'\n'}git commit -m "add Login endpoint{'\n'}{'  '}with Optional and matches()"{'\n'}git push origin main
          </CopyBlock>
          <label className={`task-item${committed ? ' checked' : ''}`}>
            <input type="checkbox" checked={committed} onChange={toggleCommitted} />
            ✅ Committed and pushed
          </label>

          {allFilesUpdated && allCasesTested && committed && (
            <>
              <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                In one sentence — what is the difference between encode() and matches() in BCrypt?
              </p>
              <textarea
                className="reflection-box"
                placeholder="encode() grinds a plain password into a hash and is used when registering (saving to MySQL), while matches() compares a typed password to a stored hash and is used when logging in (checking without reversing)..."
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                onPaste={e => e.preventDefault()}
              />
              <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

              <button className="btn green" style={{ width: '100%', marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                {submitted ? 'Submitted ✅' : 'Login working — test the complete flow next →'}
              </button>

              {submitted && (
                <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                  <b>Login complete. ✅</b><br /><br />
                  {['findByUsername — JPA generates query', 'Optional — both cases handled safely', 'matches() — BCrypt comparison', 'Three outcomes — all clean'].map((line, i) => (
                    <div key={line} style={{ animation: 'fadeInUp 0.4s ease backwards', animationDelay: `${i * 0.15}s` }}>
                      <span className="check-pop" style={{ animationDelay: `${i * 0.15}s` }}>✅</span> {line}
                    </div>
                  ))}
                  <br />
                  Next — 3.1.5.<br />
                  Run the complete flow. Register → Login → access data. Confirm the stranger is still blocked.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
