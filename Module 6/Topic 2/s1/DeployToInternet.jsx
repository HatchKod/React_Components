import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .dp-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .dp-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1240px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1240px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(13,148,136,0.12); color: #0D9488; }
  .p-pill.active { background: #0D9488; color: #fff; }
  .p-line { width: 14px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #0D9488; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1240px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.7; }
  .teal-card { background: #F0FDFA; border: 1.5px solid #99F6E4; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #115E59; font-size: 0.88rem; line-height: 1.7; }

  .code-block { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.7; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .code-comment { color: #64748B; }
  .code-blank-done { color: #6EE7B7; font-weight: 700; }

  .env-list { background: #0B0F19; border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.76rem; line-height: 2; color: #94A3B8; }
  .env-list .k { color: #FDE047; }
  .env-list .v { color: #6EE7B7; }
  .env-list .note { color: #64748B; font-style: italic; }

  .blank-panel { background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .blank-label { color: #FDE68A; font-size: 0.8rem; margin-bottom: 10px; line-height: 1.6; }
  .blank-input-row { display: flex; gap: 8px; }
  .blank-text-input { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 0.82rem; flex: 1; }
  .blank-submit-btn { background: #0D9488; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .blank-feedback { margin-top: 8px; font-size: 0.78rem; }
  .blank-feedback.wrong { color: #FCA5A5; }

  .compare-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; font-size: 0.76rem; margin: 12px 0; }
  .compare-table td { padding: 10px 12px; font-family: 'Fira Code', monospace; border-radius: 0 8px 8px 0; }
  .compare-row-before td { background: #FEF2F2; color: #991B1B; border-left: 4px solid #DC2626; }
  .compare-row-after td { background: #F0FDF4; color: #14532D; border-left: 4px solid #16A34A; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #F0FDFA; color: #115E59; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .btn { background: #0D9488; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }

  .domain-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .domain-btn { padding: 10px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  .domain-btn.selected { background: #0D9488; border-color: #0D9488; color: #fff; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #F0FDFA; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
  .url-input { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; font-family: 'Fira Code', monospace; font-size: 0.82rem; margin-top: 6px; }
  .url-input:focus { border-color: #0D9488; outline: none; }
  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #0D9488; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .reveal-strip { max-width: 1240px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 440px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px; text-align: center; }

  /* envelope / letter animation */
  .letter-stage { display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .envelope-row { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .env-step { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #F8FAFC; min-width: 76px; transition: all 0.3s; }
  .env-step.lit { border-color: #0D9488; background: #F0FDFA; }
  .env-step-icon { font-size: 1.4rem; }
  .env-step-lbl { font-size: 0.6rem; font-weight: 700; color: #64748B; text-align: center; }
  .env-arrow { color: #CBD5E1; font-size: 1rem; }
  .globe-note { font-size: 0.8rem; color: #0D9488; font-weight: 700; text-align: center; }

  /* deployment status list */
  .deploy-status-list { display: flex; flex-direction: column; gap: 8px; }
  .deploy-status-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: #F8FAFC; font-size: 0.8rem; color: #94A3B8; transition: all 0.3s; }
  .deploy-status-item.building { background: #FFFBEB; color: #92400E; }
  .deploy-status-item.done { background: #F0FDF4; color: #14532D; font-weight: 700; }
  .status-spinner { width: 14px; height: 14px; border: 2px solid #FDE68A; border-top-color: #F59E0B; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* three-tier architecture */
  .tier-stage { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .tier-box { width: 100%; max-width: 260px; text-align: center; padding: 12px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #F8FAFC; font-size: 0.78rem; color: #64748B; transition: all 0.35s; }
  .tier-box.lit { border-color: #0D9488; background: #F0FDFA; color: #115E59; box-shadow: 0 0 0 4px rgba(13,148,136,0.1); }
  .tier-box-title { font-weight: 800; font-size: 0.82rem; }
  .tier-box-sub { font-size: 0.68rem; margin-top: 2px; }
  .tier-connector { width: 2px; height: 18px; background: #E2E8F0; }
  .tier-connector.lit-conn { background: #5EEAD4; }
  .cloud-badge { text-align: center; font-size: 0.7rem; color: #94A3B8; margin-bottom: 4px; }

  /* env var flow */
  .envvar-flow { display: flex; flex-direction: column; gap: 6px; }
  .envvar-node { padding: 10px 14px; border-radius: 8px; background: #F8FAFC; border: 1.5px solid #E2E8F0; font-family: 'Fira Code', monospace; font-size: 0.72rem; color: #64748B; text-align: center; transition: all 0.3s; }
  .envvar-node.lit { background: #F0FDFA; border-color: #0D9488; color: #115E59; font-weight: 700; }
  .envvar-arrow-down { text-align: center; color: #CBD5E1; }
  .devprod-row { display: flex; gap: 8px; margin-top: 14px; }
  .devprod-col { flex: 1; text-align: center; padding: 10px; border-radius: 8px; font-size: 0.7rem; }
  .devprod-col.local { background: #F1F5F9; color: #64748B; }
  .devprod-col.live { background: #F0FDFA; color: #115E59; border: 1.5px solid #99F6E4; }

  /* browser mockup */
  .browser-mock { border: 1.5px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
  .browser-topbar { background: #F1F5F9; padding: 8px 12px; display: flex; align-items: center; gap: 8px; }
  .browser-dot { width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1; }
  .browser-url-bar { flex: 1; background: #fff; border-radius: 6px; padding: 4px 10px; font-family: 'Fira Code', monospace; font-size: 0.68rem; color: #0D9488; font-weight: 700; }
  .browser-body { padding: 20px; text-align: center; background: linear-gradient(135deg, #F0FDFA, #fff); }
  .browser-world-note { font-size: 0.72rem; color: #64748B; margin-top: 10px; }

  .url-moment-card { background: linear-gradient(135deg, #F0FDF4, #FFFFFF); border: 1px solid #86EFAC; border-radius: 16px; padding: 28px; text-align: center; max-width: 1240px; margin: 20px auto 0; }
  .url-line { font-size: 0.98rem; color: #14532D; line-height: 1.9; opacity: 0; animation: fadeInUp 0.4s ease forwards; }
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
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      const osc = (freq, start, dur, wave = 'sine') => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      if (type === 'add') { osc(220, 0, 0.15); osc(440, 0.05, 0.15); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); }
      else if (type === 'correct') { [523,659,784].forEach((f,i) => osc(f, i*0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === 'warn') { osc(330, 0, 0.2); osc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === 'tick') { osc(800, 0, 0.05, 'triangle'); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); }
      else if (type === 'reveal') { [523,659,784,1047].forEach((f,i) => osc(f, i*0.12, 0.2)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6); }
      else if (type === 'submit') { osc(392, 0, 0.4); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); }
    } catch (e) {}
  }, []);
  return { play, muted };
}

function CopyBlock({ code, children }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    try { navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code-block">
      <button className="copy-btn" onClick={doCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
      {children}
    </div>
  );
}

const STEPS = ['Backend Deploy', 'MySQL on Railway', 'React Env Var', 'Frontend Deploy', 'Live Test'];

export default function DeployToInternet() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(m => !m); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1);
  const [step, setStep] = useState(1);

  const railRef = useRef(null);
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) { isFirstStepRender.current = false; return; }
    if (railRef.current) railRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Step 1 ──
  const [step1Done, setStep1Done] = useState(false);
  const [buildStage, setBuildStage] = useState(0); // 0 none, 1 dockerfile found, 2 building, 3 container, 4 url
  function advanceBuild() {
    play('tick');
    setBuildStage(s => {
      const next = Math.min(s + 1, 4);
      if (next === 4) play('correct');
      return next;
    });
  }
  function toggleStep1() {
    if (!step1Done) { play('add'); setBuildStage(4); setTimeout(() => setStep(2), 400); }
    setStep1Done(d => !d);
  }

  // ── Step 2 ──
  const [step2Done, setStep2Done] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  function toggleStep2() {
    if (!step2Done) { play('add'); setDbConnected(true); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: REACT_APP_API_URL blank ──
  const [envInput, setEnvInput] = useState('');
  const [envCorrect, setEnvCorrect] = useState(false);
  const [envWrong, setEnvWrong] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  function submitEnv() {
    if (envInput.trim().toUpperCase() === 'REACT_APP_API_URL') {
      setEnvCorrect(true); setEnvWrong(false); play('add');
    } else {
      setEnvWrong(true); play('warn');
    }
  }
  function toggleStep3() {
    if (!step3Done) { play('add'); setTimeout(() => setStep(4), 400); }
    setStep3Done(d => !d);
  }

  // ── Step 4 ──
  const [step4Done, setStep4Done] = useState(false);
  function toggleStep4() {
    if (!step4Done) { play('correct'); setTimeout(() => setStep(5), 400); }
    setStep4Done(d => !d);
  }

  // ── Step 5: 5 tests ──
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(false);
  const [t4, setT4] = useState(false);
  const [t5, setT5] = useState(false);
  function toggleT(setter, val, sound) { if (!val) play(sound); setter(v => !v); }
  const allTestsDone = t1 && t2 && t3 && t4 && t5;

  const allDoneFiredRef = useRef(false);
  const [urlMomentLines, setUrlMomentLines] = useState(0);
  useEffect(() => {
    if (allTestsDone && !allDoneFiredRef.current) {
      allDoneFiredRef.current = true;
      play('correct');
      let c = 0;
      const iv = setInterval(() => { c += 1; setUrlMomentLines(c); if (c >= 9) clearInterval(iv); }, 420);
      setTimeout(() => play('reveal'), 800);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [backendUrl, setBackendUrl] = useState('');
  const [frontendUrl, setFrontendUrl] = useState('');

  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsDone && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 6) clearInterval(iv); }, 480);
      }, 4600);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() {
    play('tick');
    setPhase(2);
    // Carry over the URLs already saved in Phase 1 instead of making the
    // learner retype URLs they just entered.
    if (backendUrl.trim()) setP2BackendUrl(backendUrl);
    if (frontendUrl.trim()) setP2FrontendUrl(frontendUrl);
  }

  // ── Phase 2 ──
  const [domain, setDomain] = useState(null);
  const [backendTasks, setBackendTasks] = useState({ deployed: false, envVars: false, mysqlConnected: false, urlObtained: false });
  const [reactTasks, setReactTasks] = useState({ envFile: false, fetchUpdated: false, corsUpdated: false, deployed: false, urlObtained: false });
  const [testTasks, setTestTasks] = useState({ login: false, membersList: false, addMember: false, aiFeature: false, someoneOpened: false });
  const [p2BackendUrl, setP2BackendUrl] = useState('');
  const [p2FrontendUrl, setP2FrontendUrl] = useState('');
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleGroup(setGroup, key) { setGroup(g => { const nv = !g[key]; if (nv) play('add'); return { ...g, [key]: nv }; }); }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const allBackendTasks = Object.values(backendTasks).every(Boolean);
  const allReactTasks = Object.values(reactTasks).every(Boolean);
  const allTestTasks = Object.values(testTasks).every(Boolean);
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = domain && allBackendTasks && allReactTasks && allTestTasks && p2BackendUrl.trim() && p2FrontendUrl.trim() && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t2-s1-deploy-to-internet',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            step1: { backendDeployed: step1Done },
            step2: { mysqlConnected: step2Done },
            step3: { reactAppApiUrlBlank: envInput, envFileCreated: step3Done, fetchCallsUpdated: step3Done, corsUpdated: step3Done },
            step4: { frontendDeployed: step4Done },
            step5: { loginWorks: t1, addMemberWorks: t3, aiWorks: t4, someoneElseOpened: t5 },
          },
          phase2: {
            backendUrl: p2BackendUrl,
            frontendUrl: p2FrontendUrl,
            allThreeTiersLive: allBackendTasks && allReactTasks,
            someoneOpenedUrl: testTasks.someoneOpened,
            committedChanges: committed,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dp-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Deploy to Railway — Get a Live URL</h1>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 1 — Spring Boot on Railway</h2>
                  <div className="amber-card">
                    Push to GitHub = pack the envelope.<br />
                    Railway reads Dockerfile = write the address.<br />
                    Railway builds + runs = post office delivers.<br />
                    URL = letter arrives.
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Step 1: Go to railway.app</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Sign up or login with GitHub.</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Step 2: New project</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Click: New Project → Deploy from GitHub repo → Select your Spring Boot repo → Deploy Now</p>
                  <button className="btn" style={{ background: '#fff', color: '#0D9488', border: '1.5px solid #99F6E4' }} onClick={advanceBuild} disabled={buildStage >= 4}>
                    {buildStage === 0 ? 'Watch Railway build →' : buildStage < 4 ? 'Next stage →' : '✓ Build complete'}
                  </button>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Step 3: Wait for build</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Railway reads your Dockerfile. Builds the image. Starts the container. Build takes 2-5 minutes. Watch the build logs.</p>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Step 4: Your backend URL</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>After successful build — Railway assigns a URL: <code>yourapp-production.up.railway.app</code>. Copy this URL. You need it for React.</p>

                  <div className="blue-card">
                    <b>Environment variables</b><br /><br />
                    Railway cannot access your application.properties. Add these in Railway dashboard: Settings → Variables → Add
                  </div>
                  <div className="env-list">
                    <span className="k">SPRING_DATASOURCE_URL</span> <span className="note">→ add in next step (MySQL)</span><br />
                    <span className="k">SPRING_DATASOURCE_USERNAME</span> = <span className="v">root</span><br />
                    <span className="k">SPRING_DATASOURCE_PASSWORD</span> <span className="note">→ add in next step (MySQL)</span><br />
                    <span className="k">GEMINI_API_KEY</span> = <span className="v">your key</span><br />
                    <span className="k">JWT_SECRET</span> = <span className="v">your secret key</span><br />
                    <span className="k">JWT_EXPIRATION</span> = <span className="v">86400000</span>
                  </div>

                  <div className={`checkbox-row${step1Done ? ' checked' : ''}`} onClick={toggleStep1}>
                    <input type="checkbox" checked={step1Done} readOnly />
                    ✅ Spring Boot deployed — I have a Railway URL
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 2 — Database in the cloud</h2>
                  <p style={{ fontSize: '0.85rem' }}>In your Railway project:</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Click: New → Database → MySQL<br /><br />
                    Railway creates a MySQL database. Takes about 30 seconds.<br /><br />
                    Then: click the MySQL service → Variables tab → copy these values:
                  </p>
                  <div className="env-list">
                    <span className="k">MYSQL_URL</span> <span className="note">→ goes to SPRING_DATASOURCE_URL</span><br />
                    <span className="k">MYSQL_USER</span> <span className="note">→ goes to SPRING_DATASOURCE_USERNAME</span><br />
                    <span className="k">MYSQL_PASSWORD</span> <span className="note">→ goes to SPRING_DATASOURCE_PASSWORD</span>
                  </div>

                  <div className="amber-card">
                    Railway gives MYSQL_URL as:<br />
                    <code>mysql://user:password@host:port/railway</code><br /><br />
                    Spring Boot needs JDBC format:<br />
                    <code>jdbc:mysql://host:port/railway</code><br /><br />
                    Replace mysql:// with jdbc:mysql://
                  </div>

                  <p style={{ fontSize: '0.85rem' }}>In your Spring Boot Railway service: Settings → Variables. Add:</p>
                  <CopyBlock code={`SPRING_DATASOURCE_URL=jdbc:mysql://[host from Railway]/railway\nSPRING_DATASOURCE_USERNAME=root\nSPRING_DATASOURCE_PASSWORD=[password from Railway]`}>
                    SPRING_DATASOURCE_URL=jdbc:mysql://[host from Railway]/railway{'\n'}
                    SPRING_DATASOURCE_USERNAME=root{'\n'}
                    SPRING_DATASOURCE_PASSWORD=[password from Railway]
                  </CopyBlock>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Railway restarts your container. Spring Boot connects to cloud MySQL. JPA creates your tables automatically.</p>

                  <div className="teal-card">
                    Your Railway MySQL is empty. Register a user and add members through your live app after deployment. Or use a migration tool later.
                  </div>

                  <div className={`checkbox-row${step2Done ? ' checked' : ''}`} onClick={toggleStep2}>
                    <input type="checkbox" checked={step2Done} readOnly />
                    ✅ Railway MySQL connected — backend restarts without error
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 3 — Point React to the live backend</h2>
                  <div className="amber-card">
                    Your React code says: 'http://localhost:8080'<br /><br />
                    On the internet — localhost means the user's laptop. Not Railway.<br /><br />
                    Fix: use an environment variable that changes based on where React is running.
                  </div>

                  <p style={{ fontSize: '0.85rem' }}>Create a .env file in your React project root:</p>
                  <CopyBlock code={`REACT_APP_API_URL=https://yourapp.up.railway.app`}>
                    {envCorrect ? <span className="code-blank-done">REACT_APP_API_URL</span> : '[___]'}=https://yourapp.up.railway.app{'\n'}
                    <span className="code-comment">// ↑ must start with REACT_APP</span>
                  </CopyBlock>

                  {!envCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">Create React App only exposes variables that start with REACT_APP_. What should you name your API URL variable?</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="REACT_APP_API_URL" value={envInput} onChange={e => { setEnvInput(e.target.value); setEnvWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitEnv}>Check</button>
                      </div>
                      {envWrong && <div className="blank-feedback wrong">Must start with REACT_APP_. Without the prefix — React ignores the variable.</div>}
                    </div>
                  )}

                  {envCorrect && (
                    <>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Add .env to .gitignore: <code>echo '.env' &gt;&gt; .gitignore</code>
                      </p>

                      <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Update fetch calls — in every component that uses fetch:</p>
                      <table className="compare-table">
                        <tbody>
                          <tr className="compare-row-before"><td>await fetch('http://localhost:8080/gym/members')</td></tr>
                          <tr className="compare-row-after"><td>const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';{'\n'}await fetch(`${'{API}'}/gym/members`)</td></tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        || 'http://localhost:8080' = fallback for local development. On Railway: uses the env var. On your laptop: uses localhost.
                      </p>

                      <div className="blue-card">
                        <b>CORS update needed</b><br /><br />
                        Your Spring Boot @CrossOrigin allows localhost:3000. Add your Railway frontend URL:
                        <CopyBlock code={`@CrossOrigin(origins = {\n  "http://localhost:3000",\n  "https://your-frontend.up.railway.app"\n})`}>
                          @CrossOrigin(origins = {'{'}{'\n'}
                          {'  '}"http://localhost:3000",{'\n'}
                          {'  '}"https://your-frontend.up.railway.app"{'\n'}
                          {'}'})
                        </CopyBlock>
                      </div>

                      <div className={`checkbox-row${step3Done ? ' checked' : ''}`} onClick={toggleStep3}>
                        <input type="checkbox" checked={step3Done} readOnly />
                        ✅ .env created — React fetch calls updated — CORS updated
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 4 — React on Railway</h2>
                  <p style={{ fontSize: '0.85rem' }}>Same process as backend:</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Railway → New Project → Deploy from GitHub repo → Select React repo → Deploy Now</p>

                  <div className="blue-card">
                    In React Railway service: Settings → Variables. Add:
                    <CopyBlock code={`REACT_APP_API_URL=https://your-backend.up.railway.app`}>
                      REACT_APP_API_URL=https://your-backend.up.railway.app
                    </CopyBlock>
                    (Use your actual backend URL)
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Frontend URL</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>After build: Railway assigns frontend URL: <code>your-frontend.up.railway.app</code>. This is the URL your gym owner opens.</p>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Build time</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>React build takes 3-5 minutes. Railway runs npm install and npm run build automatically. Then nginx serves the built files.</p>

                  <div className={`checkbox-row${step4Done ? ' checked' : ''}`} onClick={toggleStep4}>
                    <input type="checkbox" checked={step4Done} readOnly />
                    ✅ React deployed — I have a frontend URL
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Test the live app</h2>

                  {[
                    ['Open your frontend URL in browser. Login screen appears.', '✅ Login screen loads from live URL', t1, () => toggleT(setT1, t1, 'add')],
                    ['Register a new account. Login with it.', '✅ Register and login work', t2, () => toggleT(setT2, t2, 'add')],
                    ['Add a member. See them in the list.', '✅ Add member works — data saved in Railway MySQL', t3, () => toggleT(setT3, t3, 'correct')],
                    ['Open the AI feature. Get a suggestion for a member.', '✅ AI feature works on live URL', t4, () => toggleT(setT4, t4, 'correct')],
                    ['Send the URL to someone. They open it on their phone.', '✅ Friend or family member opened my URL', t5, () => toggleT(setT5, t5, 'correct')],
                  ].map(([instr, label, val, fn], i) => (
                    <div key={label}>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Test {i + 1}:</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>{instr}</p>
                      <div className={`checkbox-row${val ? ' checked' : ''}`} onClick={fn}>
                        <input type="checkbox" checked={val} readOnly />
                        {label}
                      </div>
                    </div>
                  ))}

                  {urlMomentLines > 0 && (
                    <div className="url-moment-card" style={{ marginTop: 20 }}>
                      {['Your app is on the internet.', 'Not localhost. Not your laptop.', 'A real URL. Anyone can open it. On any device. Anywhere in the world.', 'Send it to your mom. She can open it.', 'Send it to your gym owner. They can use it.', 'That URL is yours.', 'You built what is behind it.', 'Every line of it.'].map((line, i) => (
                        urlMomentLines >= i + 1 && <div key={line} className="url-line" style={{ animationDelay: `${i * 0.05}s`, fontWeight: i === 5 || i === 6 ? 700 : 400 }}>{line}</div>
                      ))}
                    </div>
                  )}

                  {urlMomentLines >= 8 && (
                    <div className="teal-card" style={{ marginTop: 16 }}>
                      <p style={{ fontWeight: 700, marginBottom: 8 }}>Save these URLs — you will need them for the Deploy v3 gate.</p>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Backend:</label>
                      <input className="url-input" placeholder="https://yourapp-production.up.railway.app" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} />
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 10, display: 'block' }}>Frontend:</label>
                      <input className="url-input" placeholder="https://your-frontend.up.railway.app" value={frontendUrl} onChange={e => setFrontendUrl(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {revealCount > 0 && (
                <div className="reveal-strip">
                  <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
                  {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>Railway</b> → reads Dockerfile from GitHub — builds, runs, gives URL</span></div>}
                  {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>Environment variables</b> → replace application.properties on the server</span></div>}
                  {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>Railway MySQL</b> → cloud database — connection string from Railway</span></div>}
                  {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>REACT_APP_ prefix</b> → required for CRA env vars — process.env.REACT_APP_API_URL</span></div>}
                  {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>.env</b> → local env vars — never commit to GitHub</span></div>}
                  {revealCount >= 6 && <div className="reveal-line-item">✅ <span><b>{"|| 'http://localhost:8080'"}</b> → fallback for development — same code works locally and live</span></div>}
                  {revealCount >= 6 && (
                    <>
                      <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                        Your app is live. Real URL. Anyone can open it.<br /><br />
                        Next — show it to your business owner. Their reaction is your real grade.
                      </p>
                      <button className="btn" onClick={goToPhase2}>Deploy YOUR project →</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT STAGE */}
            <div className="right-col">
              <div className="sticky-panel">
                <StagePanel
                  step={step} buildStage={buildStage} dbConnected={dbConnected}
                  envCorrect={envCorrect} step4Done={step4Done}
                  t1={t1} t2={t2} t3={t3} t4={t4} t5={t5} allTestsDone={allTestsDone}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ gridTemplateColumns: '1fr', maxWidth: 900 }}>
          <div className="card">
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Deploy YOUR project</h2>

            <div className="domain-row">
              {['Gym', 'Hotel', 'Mess', 'Chai'].map(d => (
                <button key={d} className={`domain-btn${domain === d ? ' selected' : ''}`} onClick={() => setDomain(d)}>{d}</button>
              ))}
            </div>

            {domain && (
              <>
                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — Backend</h3>
                {[['deployed', 'Spring Boot deployed to Railway'], ['envVars', 'Environment variables added'], ['mysqlConnected', 'Railway MySQL connected'], ['urlObtained', 'Backend URL obtained']].map(([key, label]) => (
                  <label key={key} className={`task-item${backendTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={backendTasks[key]} onChange={() => toggleGroup(setBackendTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — React</h3>
                {[['envFile', '.env file created with Railway backend URL'], ['fetchUpdated', 'All fetch calls updated with API variable'], ['corsUpdated', 'CORS updated with Railway frontend URL'], ['deployed', 'React deployed to Railway'], ['urlObtained', 'Frontend URL obtained']].map(([key, label]) => (
                  <label key={key} className={`task-item${reactTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={reactTasks[key]} onChange={() => toggleGroup(setReactTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — Live test</h3>
                {[['login', 'Login works on live URL'], ['membersList', 'Members list loads'], ['addMember', 'Add member works'], ['aiFeature', 'AI feature works'], ['someoneOpened', 'Someone else opened the URL']].map(([key, label]) => (
                  <label key={key} className={`task-item${testTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={testTasks[key]} onChange={() => toggleGroup(setTestTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 — Save URLs</h3>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Backend URL:</label>
                <input className="url-input" placeholder="https://yourapp-production.up.railway.app" value={p2BackendUrl} onChange={e => setP2BackendUrl(e.target.value)} />
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 10, display: 'block' }}>Frontend URL:</label>
                <input className="url-input" placeholder="https://your-frontend.up.railway.app" value={p2FrontendUrl} onChange={e => setP2FrontendUrl(e.target.value)} />

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 5 — Commit env changes</h3>
                <CopyBlock code={`git add .\ngit commit -m "add env vars for Railway deployment"\ngit push origin main`}>
                  git add .{'\n'}git commit -m "add env vars{'\n'}{'  '}for Railway deployment"{'\n'}git push origin main
                </CopyBlock>
                <label className={`task-item${committed ? ' checked' : ''}`}>
                  <input type="checkbox" checked={committed} onChange={toggleCommitted} />
                  ✅ Committed and pushed
                </label>

                {allBackendTasks && allReactTasks && allTestTasks && committed && p2BackendUrl.trim() && p2FrontendUrl.trim() && (
                  <>
                    <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                      In one sentence — why do we use environment variables instead of hardcoding the Railway URL directly in React code?
                    </p>
                    <textarea
                      className="reflection-box"
                      placeholder="We use environment variables so the same React code works both locally (using localhost:8080) and in production (using the Railway URL) without changing any code - just the .env file changes between environments..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      onPaste={e => e.preventDefault()}
                    />
                    <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                    <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                      {submitted ? 'Submitted ✅' : 'App is live — show to owner next →'}
                    </button>

                    {submitted && (
                      <div style={{ marginTop: 16, padding: 16, background: '#F0FDFA', borderRadius: 8, color: '#115E59' }}>
                        <b>Live on the internet. 🌐</b><br /><br />
                        ✅ Spring Boot on Railway<br />
                        ✅ React on Railway<br />
                        ✅ MySQL on Railway<br />
                        ✅ All three features work live<br />
                        ✅ Someone opened your URL<br /><br />
                        Next — 5.2.2.<br /><br />
                        Show the live app to your business owner. Watch their reaction. That reaction is your grade.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StagePanel({ step, buildStage, dbConnected, envCorrect, step4Done, t1, t2, t3, t4, t5, allTestsDone }) {
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'GitHub → Railway → Live URL'}
        {step === 2 && 'Database in the cloud'}
        {step === 3 && 'Environment variable flow'}
        {step === 4 && 'Three services on Railway'}
        {step === 5 && 'Your app, in the world'}
      </div>

      {step === 1 && (
        <div className="letter-stage">
          <div className="envelope-row">
            <div className={`env-step${buildStage >= 1 ? ' lit' : ''}`}><span className="env-step-icon">📦</span><span className="env-step-lbl">GitHub<br />repo</span></div>
            <span className="env-arrow">→</span>
            <div className={`env-step${buildStage >= 2 ? ' lit' : ''}`}><span className="env-step-icon">✉️</span><span className="env-step-lbl">Railway<br />reads</span></div>
            <span className="env-arrow">→</span>
            <div className={`env-step${buildStage >= 3 ? ' lit' : ''}`}><span className="env-step-icon">🚚</span><span className="env-step-lbl">Builds +<br />runs</span></div>
            <span className="env-arrow">→</span>
            <div className={`env-step${buildStage >= 4 ? ' lit' : ''}`}><span className="env-step-icon">🌍</span><span className="env-step-lbl">URL<br />arrives</span></div>
          </div>

          <div className="deploy-status-list" style={{ width: '100%', maxWidth: 300 }}>
            <div className={`deploy-status-item${buildStage >= 1 ? ' done' : ''}`}>{buildStage >= 1 ? '✅' : '⬜'} Dockerfile found</div>
            <div className={`deploy-status-item${buildStage === 2 ? ' building' : buildStage >= 3 ? ' done' : ''}`}>
              {buildStage === 2 ? <span className="status-spinner" /> : buildStage >= 3 ? '✅' : '⬜'} {buildStage === 2 ? 'Building...' : 'Container started'}
            </div>
            <div className={`deploy-status-item${buildStage >= 4 ? ' done' : ''}`}>{buildStage >= 4 ? '✅' : '⬜'} URL: yourapp.railway.app</div>
          </div>
          {buildStage >= 4 && <div className="globe-note">Accessible anywhere 🌐</div>}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '2.2rem' }}>🗄️</div>
          <div className={`envvar-node${dbConnected ? ' lit' : ''}`} style={{ maxWidth: 240 }}>Railway MySQL → Spring Boot</div>
          {dbConnected && <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.82rem' }}>Connection established ✅</div>}
          {dbConnected && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="envvar-node lit">users ✅</div>
              <div className="envvar-node lit">gym_member ✅</div>
            </div>
          )}
          {dbConnected && <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>(JPA creates them automatically)</div>}
        </div>
      )}

      {step === 3 && (
        <>
          <div className="envvar-flow">
            <div className="envvar-node lit">.env file</div>
            <div className="envvar-arrow-down">↓</div>
            <div className={`envvar-node${envCorrect ? ' lit' : ''}`}>REACT_APP_API_URL</div>
            <div className="envvar-arrow-down">↓</div>
            <div className={`envvar-node${envCorrect ? ' lit' : ''}`}>process.env.REACT_APP_API_URL</div>
            <div className="envvar-arrow-down">↓</div>
            <div className={`envvar-node${envCorrect ? ' lit' : ''}`}>{'fetch(`${API}/gym/members`)'}</div>
            <div className="envvar-arrow-down">↓</div>
            <div className={`envvar-node${envCorrect ? ' lit' : ''}`}>Railway backend URL ✅</div>
          </div>
          <div className="devprod-row">
            <div className="devprod-col local">Local<br />localhost:8080</div>
            <div className="devprod-col live">Railway<br />yourapp.railway.app</div>
          </div>
        </>
      )}

      {step === 4 && (
        <div className="tier-stage">
          <div className={`tier-box${step4Done ? ' lit' : ''}`}>
            <div className="tier-box-title">Spring Boot backend</div>
            <div className="tier-box-sub">yourapp.railway.app {step4Done ? '✅' : ''}</div>
          </div>
          <div className={`tier-connector${step4Done ? ' lit-conn' : ''}`} />
          <div className={`tier-box${step4Done ? ' lit' : ''}`}>
            <div className="tier-box-title">React frontend</div>
            <div className="tier-box-sub">yourfrontend.railway.app {step4Done ? '✅' : ''}</div>
          </div>
          <div className={`tier-connector${step4Done ? ' lit-conn' : ''}`} />
          <div className={`tier-box${step4Done ? ' lit' : ''}`}>
            <div className="tier-box-title">MySQL database</div>
            <div className="tier-box-sub">Railway managed {step4Done ? '✅' : ''}</div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="browser-mock">
          <div className="browser-topbar">
            <div className="browser-dot" /><div className="browser-dot" /><div className="browser-dot" />
            <div className="browser-url-bar">yourapp.up.railway.app</div>
          </div>
          <div className="browser-body">
            <div style={{ fontSize: '1.6rem' }}>🔐</div>
            <div style={{ fontWeight: 800, marginTop: 6, color: '#0D9488' }}>Login Screen</div>
            <div className="browser-world-note">This is what the world sees</div>
            {allTestsDone && (
              <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[t1, t2, t3, t4, t5].map((v, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, background: v ? 'rgba(16,185,129,0.15)' : '#F1F5F9', color: v ? '#16A34A' : '#94A3B8' }}>Test {i + 1} {v ? '✓' : ''}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
