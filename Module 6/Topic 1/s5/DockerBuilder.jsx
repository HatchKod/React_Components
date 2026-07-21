import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .dk-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .dk-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1240px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1240px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(37,99,235,0.12); color: #2563EB; }
  .p-pill.active { background: #2563EB; color: #fff; }
  .p-line { width: 16px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #2563EB; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1240px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.7; }
  .gold-card { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); border: 1.5px solid #FCD34D; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }

  .code-block { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.7; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .code-comment { color: #64748B; }
  .dk-from { color: #60A5FA; font-weight: 700; }
  .dk-workdir { color: #4ADE80; font-weight: 700; }
  .dk-copy { color: #FB923C; font-weight: 700; }
  .dk-entrypoint { color: #C084FC; font-weight: 700; }
  .code-blank-done { color: #6EE7B7; font-weight: 700; }

  .terminal-block { background: #0B0F19; border: 1px solid #1F2937; color: #4ADE80; border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.8; margin: 10px 0; overflow-x: auto; white-space: pre-wrap; position: relative; }
  .term-prompt { color: #64748B; }
  .term-output { color: #94A3B8; }

  .blank-panel { background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .blank-label { color: #FDE68A; font-size: 0.8rem; margin-bottom: 10px; line-height: 1.6; }
  .blank-input-row { display: flex; gap: 8px; }
  .blank-text-input { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 0.82rem; flex: 1; }
  .blank-submit-btn { background: #2563EB; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .blank-feedback { margin-top: 8px; font-size: 0.78rem; }
  .blank-feedback.wrong { color: #FCA5A5; }

  .explain-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin: 10px 0; font-size: 0.85rem; line-height: 1.7; color: #374151; }
  .explain-card b { color: #1E293B; }
  .explain-card.from-c { border-left: 4px solid #60A5FA; }
  .explain-card.workdir-c { border-left: 4px solid #4ADE80; }
  .explain-card.copy-c { border-left: 4px solid #FB923C; }
  .explain-card.entrypoint-c { border-left: 4px solid #C084FC; }

  .collapsible { margin-top: 10px; }
  .collapsible-head { display: flex; align-items: center; justify-content: space-between; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #991B1B; }
  .collapsible-body { padding: 12px 14px; font-size: 0.85rem; color: #7F1D1D; line-height: 1.8; background: #FFF5F5; border-radius: 0 0 8px 8px; border: 1px solid #FECACA; border-top: none; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #EFF6FF; color: #1E40AF; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .btn { background: #2563EB; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }

  .file-tree { background: #0B0F19; border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.76rem; color: #94A3B8; line-height: 1.9; }
  .file-tree .hl { color: #FDE047; font-weight: 700; background: rgba(250,204,21,0.1); border-radius: 3px; padding: 0 4px; }

  .domain-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .domain-btn { padding: 10px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  .domain-btn.selected { background: #2563EB; border-color: #2563EB; color: #fff; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #EFF6FF; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #2563EB; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .reveal-strip { max-width: 1240px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 440px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px; text-align: center; }

  /* animated tiffin box */
  .tiffin-stage { display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .tiffin-svg-wrap { position: relative; }
  .tiffin-word { font-family: 'Fira Code', monospace; font-size: 0.8rem; color: #64748B; text-align: center; }
  .tiffin-word b { color: #2563EB; }
  .tiffin-sequence-row { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .tiffin-seq-step { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #F8FAFC; min-width: 70px; transition: all 0.3s; }
  .tiffin-seq-step.lit { border-color: #2563EB; background: #EFF6FF; }
  .tiffin-seq-icon { font-size: 1.4rem; }
  .tiffin-seq-lbl { font-size: 0.62rem; font-weight: 700; color: #64748B; text-align: center; }
  .tiffin-seq-arrow { color: #CBD5E1; font-size: 1rem; }

  .location-row { display: flex; justify-content: center; gap: 16px; margin-top: 10px; }
  .location-chip { font-size: 0.72rem; color: #94A3B8; font-weight: 700; padding: 4px 10px; border-radius: 10px; background: #F1F5F9; }

  /* dockerfile line-by-line preview */
  .dockerfile-preview { background: #0B0F19; border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.76rem; line-height: 2; }
  .dfp-line { opacity: 0.3; transition: opacity 0.3s; }
  .dfp-line.lit { opacity: 1; }
  .dfp-line .k-from { color: #60A5FA; font-weight: 700; }
  .dfp-line .k-workdir { color: #4ADE80; font-weight: 700; }
  .dfp-line .k-copy { color: #FB923C; font-weight: 700; }
  .dfp-line .k-entrypoint { color: #C084FC; font-weight: 700; }
  .dfp-line .k-rest { color: #CBD5E1; }

  /* build/run pipeline */
  .buildrun-row { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin: 14px 0; }
  .br-node { flex: 1; min-width: 90px; text-align: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 10px; font-size: 0.72rem; color: #64748B; transition: all 0.35s; }
  .br-node.lit { background: #EFF6FF; border-color: #2563EB; color: #1E40AF; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
  .br-node-icon { font-size: 1.4rem; margin-bottom: 4px; }
  .br-arrow { color: #CBD5E1; font-size: 1.1rem; }

  /* port bridge diagram */
  .port-bridge-row { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 16px 0; }
  .port-box { flex: 1; max-width: 130px; text-align: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 10px; font-size: 0.72rem; color: #64748B; }
  .port-box.lit { border-color: #16A34A; background: #F0FDF4; color: #14532D; }
  .bridge-track { flex: 0 0 60px; height: 3px; background: #E2E8F0; position: relative; border-radius: 2px; }
  .bridge-track.flowing { background: #86EFAC; }
  @keyframes packetTravel { 0% { left: -6px; opacity: 0; } 15% { opacity: 1; } 100% { left: 100%; opacity: 0.3; } }
  .packet-dot { position: absolute; top: -3.5px; width: 10px; height: 10px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 8px #16A34A; animation: packetTravel 0.9s ease-in-out infinite; }

  /* two-stage funnel */
  .funnel-stage { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .funnel-box { border-radius: 10px; padding: 14px 20px; text-align: center; font-size: 0.78rem; font-weight: 700; transition: all 0.4s; }
  .funnel-box.stage1 { background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #64748B; width: 220px; }
  .funnel-box.stage2 { background: #F0FDF4; border: 1.5px solid #86EFAC; color: #14532D; width: 140px; }
  .funnel-arrow-down { color: #CBD5E1; font-size: 1.2rem; }
  .funnel-note { font-size: 0.7rem; color: #94A3B8; text-align: center; margin-top: 6px; }

  /* two containers side by side */
  .containers-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .container-box { flex: 1; min-width: 160px; border-radius: 12px; padding: 16px; text-align: center; }
  .container-box.backend { background: #EFF6FF; border: 1.5px solid #BFDBFE; }
  .container-box.frontend { background: #F0FDF4; border: 1.5px solid #86EFAC; }
  .container-box-title { font-weight: 800; font-size: 0.85rem; margin-bottom: 4px; }
  .container-box.backend .container-box-title { color: #1E40AF; }
  .container-box.frontend .container-box-title { color: #14532D; }
  .container-box-port { font-family: 'Fira Code', monospace; font-size: 0.72rem; color: #64748B; margin-bottom: 8px; }
  .running-badge { display: inline-block; font-size: 0.62rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(16,185,129,0.15); color: #16A34A; }

  .wow-card { background: linear-gradient(135deg, #FFFBEB, #FFFFFF); border: 1px solid #FDE68A; border-radius: 16px; padding: 28px; text-align: center; max-width: 1240px; margin: 20px auto 0; }
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

function CopyBlock({ code, children, cls = 'code-block' }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    try { navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={cls}>
      <button className="copy-btn" onClick={doCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
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

const STEPS = ['Install Docker', 'Spring Boot Dockerfile', 'Build + Run', 'React Dockerfile', 'Both Running'];

const DOMAINS = [
  { key: 'Gym', label: '🏋️ Gym' }, { key: 'Hotel', label: '🏨 Hotel' },
  { key: 'Mess', label: '🍱 Mess' }, { key: 'Chai', label: '☕ Chai' },
];

export default function DockerBuilder() {
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

  // ── Step 1: simulated terminal run of docker --version ──
  const [versionChecked, setVersionChecked] = useState(false);
  function runVersionCheck() {
    if (versionChecked) return;
    play('tick');
    setVersionChecked(true);
  }

  // ── Step 1 ──
  const [step1Done, setStep1Done] = useState(false);
  function toggleStep1() {
    if (!step1Done) { play('add'); setTimeout(() => setStep(2), 400); }
    setStep1Done(d => !d);
  }

  // ── Step 2: COPY blank + 4 cards ──
  const [copyInput, setCopyInput] = useState('');
  const [copyCorrect, setCopyCorrect] = useState(false);
  const [copyWrong, setCopyWrong] = useState(false);
  const [cardsSeen, setCardsSeen] = useState({ from: false, workdir: false, copy: false, entrypoint: false });
  const [step2Done, setStep2Done] = useState(false);

  function submitCopy() {
    if (copyInput.trim().toUpperCase() === 'COPY') {
      setCopyCorrect(true); setCopyWrong(false); play('add');
    } else {
      setCopyWrong(true); play('warn');
    }
  }
  function seeCard(key) {
    setCardsSeen(c => ({ ...c, [key]: true }));
    play('tick');
  }
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: maven build + docker build/run ──
  const [mavenDone, setMavenDone] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [brStage, setBrStage] = useState(0); // 0 none, 1 building, 2 image, 3 running, 4 container
  function toggleMaven() {
    if (!mavenDone) { play('add'); setBrStage(1); }
    setMavenDone(d => !d);
  }
  function advanceBrStage() { play('tick'); setBrStage(s => Math.min(s + 1, 4)); }
  function toggleStep3() {
    if (!step3Done) { play('correct'); setBrStage(4); setTimeout(() => setStep(4), 500); }
    setStep3Done(d => !d);
  }

  // ── Step 4 ──
  const [funnelStage, setFunnelStage] = useState(0); // 0 none, 1 node, 2 nginx
  const [step4Done, setStep4Done] = useState(false);
  function advanceFunnel() { play('tick'); setFunnelStage(s => Math.min(s + 1, 2)); }
  function toggleStep4() {
    if (!step4Done) { play('add'); setFunnelStage(2); setTimeout(() => setStep(5), 400); }
    setStep4Done(d => !d);
  }

  // ── Step 5 ──
  const [test1, setTest1] = useState(false);
  const [test2, setTest2] = useState(false);
  const [test3, setTest3] = useState(false);
  function toggleTest(setter, val) { if (!val) play('add'); setter(v => !v); }
  const allTestsDone = test1 && test2 && test3;

  const allDoneFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsDone && !allDoneFiredRef.current) {
      allDoneFiredRef.current = true;
      play('correct');
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
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 7) clearInterval(iv); }, 480);
      }, 900);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [domain, setDomain] = useState(null);
  const [installTasks, setInstallTasks] = useState({ dockerInstalled: false, versionWorks: false });
  const [backendTasks, setBackendTasks] = useState({ dockerfile: false, mvnBuild: false, dockerBuild: false, dockerRun: false, postmanWorks: false });
  const [frontendTasks, setFrontendTasks] = useState({ dockerfile: false, dockerBuild: false, dockerRun: false, browserWorks: false });
  const [bothTasks, setBothTasks] = useState({ bothRunning: false, reactConnects: false, loginWorks: false });
  const [commitTasks, setCommitTasks] = useState({ backendCommitted: false, frontendCommitted: false });
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleGroup(setGroup, key) { setGroup(g => { const nv = !g[key]; if (nv) play('add'); return { ...g, [key]: nv }; }); }

  const allInstall = Object.values(installTasks).every(Boolean);
  const allBackend = Object.values(backendTasks).every(Boolean);
  const allFrontend = Object.values(frontendTasks).every(Boolean);
  const allBoth = Object.values(bothTasks).every(Boolean);
  const allCommit = Object.values(commitTasks).every(Boolean);
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = domain && allInstall && allBackend && allFrontend && allBoth && allCommit && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t1-s5-docker-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            step1: { dockerInstalled: step1Done },
            step2: { copyBlank: copyInput, dockerfileCreated: step2Done },
            step3: { mavenBuildSuccess: mavenDone, dockerContainerWorks: step3Done },
            step4: { reactDockerfileCreated: step4Done, reactContainerWorks: step4Done },
            step5: { bothRunning: test1, reactVisible: test2, postmanWorks: test3 },
          },
          phase2: {
            dockerInstalled: allInstall,
            springBootContainerised: allBackend,
            reactContainerised: allFrontend,
            bothRunning: allBoth,
            dockerfilesCommitted: allCommit,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const allCardsSeen = cardsSeen.from && cardsSeen.workdir && cardsSeen.copy && cardsSeen.entrypoint;

  return (
    <div className="dk-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Docker Basics — Containerise Both Apps</h1>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 1 — Install Docker</h2>
                  <div className="amber-card">
                    Your app needs to run on a server that is not your laptop. Different OS. Different Java. Different everything.<br /><br />
                    Docker puts your app in a tiffin box.<br /><br />
                    Tiffin works anywhere. Same food. Same taste. Whatever kitchen you are in.
                  </div>
                  <div className="blue-card">
                    <b>Dockerfile</b> → build → <b>Image</b> → run → <b>Container</b><br /><br />
                    Dockerfile = the packing recipe<br />
                    Image = the sealed tiffin box<br />
                    Container = the opened tiffin being eaten from<br /><br />
                    docker build = packs the tiffin<br />
                    docker run = opens and eats
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Mac:</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Download Docker Desktop. Install. Start Docker Desktop. Wait for the whale icon in menu bar.</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Windows:</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Download Docker Desktop. Install (requires WSL2). Start Docker Desktop. Wait for the whale icon in taskbar.</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Linux:</p>
                  <CopyBlock code={`sudo apt-get install docker.io\nsudo systemctl start docker\nsudo usermod -aG docker $USER`}>
                    sudo apt-get install docker.io{'\n'}sudo systemctl start docker{'\n'}sudo usermod -aG docker $USER{'\n'}<span className="code-comment"># log out and back in after</span>
                  </CopyBlock>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Verify installation — open terminal:</p>
                  <CopyBlock code={`docker --version`}>docker --version</CopyBlock>
                  <button className="btn" style={{ background: '#fff', color: '#1E293B', border: '1.5px solid #E2E8F0', width: '100%', marginBottom: 10 }} onClick={runVersionCheck}>
                    {versionChecked ? '↻ Run again' : '▶ Run docker --version'}
                  </button>
                  {versionChecked && (
                    <div className="terminal-block">
                      $ docker --version{'\n'}
                      Docker version 24.0.7, build afdd53b
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Expected: Docker version 24.x.x, build xxx</p>

                  <Collapsible title="Cannot connect to Docker daemon">
                    Docker Desktop is not running. Start it from Applications/Start Menu.
                  </Collapsible>

                  <div className={`checkbox-row${step1Done ? ' checked' : ''}`} onClick={toggleStep1}>
                    <input type="checkbox" checked={step1Done} readOnly />
                    ✅ Docker installed — docker --version works
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 2 — The Spring Boot recipe</h2>
                  <p style={{ fontSize: '0.85rem' }}>In your Spring Boot project — create a file called: <b>Dockerfile</b> (no extension, capital D). In the ROOT of the project. Same level as pom.xml.</p>

                  <div className="file-tree">
                    gymapp-backend/{'\n'}
                    ├── src/{'\n'}
                    ├── pom.xml{'\n'}
                    ├── <span className="hl">Dockerfile ← here (new)</span>{'\n'}
                    └── .gitignore
                  </div>

                  <CopyBlock code={`FROM eclipse-temurin:17-jdk-alpine\nWORKDIR /app\nCOPY target/*.jar app.jar\nENTRYPOINT ["java", "-jar", "app.jar"]`}>
                    <span className="code-comment"># Start from Java 17{'\n'}</span>
                    <span className="dk-from">FROM</span> eclipse-temurin:17-jdk-alpine{'\n\n'}
                    <span className="code-comment"># Where files go inside{'\n'}</span>
                    <span className="dk-workdir">WORKDIR</span> /app{'\n\n'}
                    <span className="code-comment"># Copy built jar into container{'\n'}</span>
                    {copyCorrect ? <span className="dk-copy">COPY</span> : <span className="code-blank-done" style={{ color: '#FCD34D' }}>[___]</span>} target/*.jar app.jar{'\n\n'}
                    <span className="code-comment"># Run when container starts{'\n'}</span>
                    <span className="dk-entrypoint">ENTRYPOINT</span> ["java", "-jar", "app.jar"]
                  </CopyBlock>

                  <div className="explain-card from-c" onClick={() => seeCard('from')} style={{ cursor: 'pointer' }}>
                    <b>FROM eclipse-temurin:17-jdk-alpine</b><br />
                    Start from a base image that already has Java 17 installed. You do not install Java yourself. Someone already made a "Java 17 tiffin" — you use it.
                  </div>
                  <div className="explain-card workdir-c" onClick={() => seeCard('workdir')} style={{ cursor: 'pointer' }}>
                    <b>WORKDIR /app</b><br />
                    Create a folder called /app inside the container. All subsequent commands run here.
                  </div>

                  {!copyCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">Which Dockerfile instruction copies files from your laptop into the container?</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="COPY" value={copyInput} onChange={e => { setCopyInput(e.target.value); setCopyWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitCopy}>Check</button>
                      </div>
                      {copyWrong && <div className="blank-feedback wrong">The instruction is COPY. COPY source destination.</div>}
                    </div>
                  )}

                  {copyCorrect && (
                    <div className="explain-card copy-c" onClick={() => seeCard('copy')} style={{ cursor: 'pointer' }}>
                      <b>COPY target/*.jar app.jar</b><br />
                      Copy your jar file into the container. Rename it to app.jar.
                    </div>
                  )}
                  {copyCorrect && (
                    <div className="explain-card entrypoint-c" onClick={() => seeCard('entrypoint')} style={{ cursor: 'pointer' }}>
                      <b>ENTRYPOINT ["java", "-jar", "app.jar"]</b><br />
                      When someone starts this container — run this command. Same as typing "java -jar app.jar" in terminal. Just automated.
                    </div>
                  )}

                  {copyCorrect && allCardsSeen && (
                    <div className={`checkbox-row${step2Done ? ' checked' : ''}`} onClick={toggleStep2}>
                      <input type="checkbox" checked={step2Done} readOnly />
                      ✅ Dockerfile created in Spring Boot project root
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 3 — Pack the tiffin and open it</h2>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Part A — Build the jar first:</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Before building the Docker image — build the Spring Boot jar:</p>
                  <CopyBlock code={`./mvnw clean package -DskipTests`}>
                    ./mvnw clean package -DskipTests{'\n'}<span className="code-comment"># Windows: mvnw.cmd clean package -DskipTests</span>
                  </CopyBlock>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Wait for: BUILD SUCCESS — creates target/gymapp-...jar</p>
                  <div className={`checkbox-row${mavenDone ? ' checked' : ''}`} onClick={toggleMaven}>
                    <input type="checkbox" checked={mavenDone} readOnly />
                    ✅ Maven build succeeded
                  </div>

                  {mavenDone && (
                    <>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 16 }}>Part B — Docker build and run:</p>
                      <CopyBlock code={`docker build -t gymapp-backend .`}>
                        <span className="code-comment"># Build image (pack the tiffin){'\n'}</span>
                        docker build -t gymapp-backend .
                      </CopyBlock>
                      <CopyBlock code={`docker run -p 8080:8080 \\\n  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/gymapp \\\n  -e SPRING_DATASOURCE_USERNAME=root \\\n  -e SPRING_DATASOURCE_PASSWORD=yourpassword \\\n  gymapp-backend`}>
                        <span className="code-comment"># Run with database connection{'\n'}</span>
                        docker run -p 8080:8080 \{'\n'}
                        {'  '}-e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/gymapp \{'\n'}
                        {'  '}-e SPRING_DATASOURCE_USERNAME=root \{'\n'}
                        {'  '}-e SPRING_DATASOURCE_PASSWORD=yourpassword \{'\n'}
                        {'  '}gymapp-backend
                      </CopyBlock>

                      <div className="explain-card">
                        <b>-t gymapp-backend</b> → name the image. Like labelling your tiffin.
                      </div>
                      <div className="explain-card">
                        <b>-p 8080:8080</b> → Request comes to laptop:8080. Bridge carries it to container:8080. Container processes it. Response comes back.
                      </div>
                      <div className="explain-card">
                        <b>-e KEY=VALUE</b> → Environment variable. Overrides application.properties. Container cannot access your application.properties directly. These -e flags replace those values.
                      </div>
                      <div className="explain-card">
                        <b>host.docker.internal</b> → means "my laptop" from inside the container. Container asks: "Where is MySQL?" Answer: host.docker.internal:3306 = your laptop's port 3306.<br /><br />
                        ⚠️ Linux only: replace host.docker.internal with your laptop's actual IP address (run: ifconfig or hostname -I).
                      </div>

                      <div className="green-card">
                        Open Postman. GET http://localhost:8080/gym/members<br />
                        Same as before — but now running in Docker. ✅
                      </div>

                      <Collapsible title="Port 8080 already in use">
                        Stop your regular Spring Boot server. Only run Docker OR Spring Boot, not both.
                      </Collapsible>
                      <Collapsible title="Connection refused to MySQL">
                        Replace host.docker.internal with your laptop's actual IP.
                      </Collapsible>
                      <Collapsible title="No such file: target/*.jar">
                        Run mvnw clean package first.
                      </Collapsible>

                      <div className={`checkbox-row${step3Done ? ' checked' : ''}`} onClick={toggleStep3}>
                        <input type="checkbox" checked={step3Done} readOnly />
                        ✅ Docker container running — Postman request works
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Step 4 — Containerise React</h2>
                  <div className="blue-card">
                    The React Dockerfile has two stages. It uses nginx — a web server.<br /><br />
                    You do not need to understand every line right now.<br /><br />
                    Copy it exactly. It works. You will understand more when you study nginx later.<br /><br />
                    For now — trust the recipe.
                  </div>

                  <CopyBlock code={`FROM node:18-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/build /usr/share/nginx/html\nEXPOSE 80`}>
                    <span className="code-comment"># Stage 1 — Build React app{'\n'}</span>
                    <span className="dk-from">FROM</span> node:18-alpine AS build{'\n'}
                    <span className="dk-workdir">WORKDIR</span> /app{'\n'}
                    <span className="dk-copy">COPY</span> package*.json ./{'\n'}
                    RUN npm install{'\n'}
                    <span className="dk-copy">COPY</span> . .{'\n'}
                    RUN npm run build{'\n\n'}
                    <span className="code-comment"># Stage 2 — Serve with nginx{'\n'}</span>
                    <span className="dk-from">FROM</span> nginx:alpine{'\n'}
                    <span className="dk-copy">COPY</span> --from=build /app/build /usr/share/nginx/html{'\n'}
                    EXPOSE 80
                  </CopyBlock>

                  <p style={{ fontSize: '0.85rem' }}>Create this Dockerfile in your React project root:</p>
                  <div className="file-tree">
                    gymapp-frontend/{'\n'}
                    ├── src/{'\n'}
                    ├── package.json{'\n'}
                    ├── <span className="hl">Dockerfile ← here</span>{'\n'}
                    └── .gitignore
                  </div>

                  <button className="btn" style={{ background: '#fff', color: '#2563EB', border: '1.5px solid #BFDBFE' }} onClick={advanceFunnel}>
                    {funnelStage === 0 ? 'See the two stages →' : funnelStage === 1 ? 'See the final image →' : '✓ Both stages shown'}
                  </button>

                  <div className="explain-card" style={{ marginTop: 12 }}>
                    <b>Stage 1:</b> npm install + npm run build creates the optimised React files.<br /><br />
                    <b>Stage 2:</b> nginx serves those files as a fast web server.<br /><br />
                    Final image only has Stage 2. Stage 1 is thrown away. Smaller final image.
                  </div>

                  <CopyBlock code={`docker build -t gymapp-frontend .\ndocker run -p 3000:80 gymapp-frontend`}>
                    docker build -t gymapp-frontend .{'\n'}
                    docker run -p 3000:80 gymapp-frontend
                  </CopyBlock>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>-p 3000:80 → your laptop's 3000 → nginx's 80 inside container</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Open browser: http://localhost:3000 — your React app, served by Docker.</p>

                  <div className={`checkbox-row${step4Done ? ' checked' : ''}`} onClick={toggleStep4}>
                    <input type="checkbox" checked={step4Done} readOnly />
                    ✅ React Dockerfile created and container running
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Both apps in Docker</h2>

                  <div className="explain-card">
                    <b>Backend container:</b><br />
                    docker run -p 8080:8080 gymapp-backend → Spring Boot + Gemini AI → localhost:8080
                  </div>
                  <div className="explain-card">
                    <b>Frontend container:</b><br />
                    docker run -p 3000:80 gymapp-frontend → React app → localhost:3000
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Both apps running in Docker. Your laptop is running two self-contained boxes.<br /><br />
                    In 5.2.1 — you move these boxes to a cloud server. The cloud server runs the same boxes. Same commands. Different machine.
                  </p>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Commit your Dockerfiles:</p>
                  <CopyBlock code={`git add Dockerfile\ngit commit -m "add Dockerfile for Spring Boot"\ngit push`}>
                    <span className="code-comment"># in backend repo{'\n'}</span>
                    git add Dockerfile{'\n'}git commit -m "add Dockerfile for Spring Boot"{'\n'}git push
                  </CopyBlock>
                  <CopyBlock code={`git add Dockerfile\ngit commit -m "add Dockerfile for React"\ngit push`}>
                    <span className="code-comment"># in frontend repo{'\n'}</span>
                    git add Dockerfile{'\n'}git commit -m "add Dockerfile for React"{'\n'}git push
                  </CopyBlock>

                  {[
                    ['Both containers running locally', test1, () => toggleTest(setTest1, test1)],
                    ['React app visible at localhost:3000', test2, () => toggleTest(setTest2, test2)],
                    ['Postman works against Docker Spring Boot at localhost:8080', test3, () => toggleTest(setTest3, test3)],
                  ].map(([label, val, fn]) => (
                    <div key={label} className={`checkbox-row${val ? ' checked' : ''}`} onClick={fn}>
                      <input type="checkbox" checked={val} readOnly />
                      {label}
                    </div>
                  ))}

                  {allTestsDone && (
                    <div className="gold-card">
                      Your apps are containerised.<br /><br />
                      Next — 5.2.1. Deploy to the internet. A real server in the cloud runs your Docker containers.<br /><br />
                      Your gym owner gets a URL they can open on their phone.
                    </div>
                  )}
                </div>
              )}

              {revealCount > 0 && (
                <div className="reveal-strip">
                  <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
                  {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>Dockerfile</b> → packing recipe — FROM, WORKDIR, COPY, ENTRYPOINT</span></div>}
                  {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>docker build -t name .</b> → creates image from Dockerfile</span></div>}
                  {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>docker run -p host:container</b> → starts container, maps ports</span></div>}
                  {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>Image</b> → the sealed tiffin — runs identically anywhere</span></div>}
                  {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>Container</b> → the opened tiffin — running instance of image</span></div>}
                  {revealCount >= 6 && <div className="reveal-line-item">✅ <span><b>-e KEY=VALUE</b> → environment variable — overrides application.properties</span></div>}
                  {revealCount >= 7 && <div className="reveal-line-item">✅ <span><b>host.docker.internal</b> → "my laptop" from inside container</span></div>}
                  {revealCount >= 7 && (
                    <>
                      <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                        Your apps are in boxes. The boxes run anywhere.<br /><br />
                        Same box. Same app. Cloud server. Your friend's laptop. Any computer in the world.<br /><br />
                        Topic 1 complete.<br /><br />
                        Topic 2 — ship it to the internet. Real URL. Your mom can open it.
                      </p>
                      <button className="btn" onClick={goToPhase2}>Containerise YOUR project →</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT STAGE */}
            <div className="right-col">
              <div className="sticky-panel">
                <StagePanel
                  step={step} cardsSeen={cardsSeen} copyCorrect={copyCorrect}
                  mavenDone={mavenDone} brStage={brStage} advanceBrStage={advanceBrStage}
                  step3Done={step3Done} funnelStage={funnelStage} step4Done={step4Done}
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
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Containerise YOUR project</h2>

            <div className="domain-row">
              {DOMAINS.map(d => (
                <button key={d.key} className={`domain-btn${domain === d.key ? ' selected' : ''}`} onClick={() => setDomain(d.key)}>{d.label}</button>
              ))}
            </div>

            {domain && (
              <>
                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — Install</h3>
                {[['dockerInstalled', 'Docker Desktop installed'], ['versionWorks', 'docker --version works']].map(([key, label]) => (
                  <label key={key} className={`task-item${installTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={installTasks[key]} onChange={() => toggleGroup(setInstallTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — Spring Boot</h3>
                {[['dockerfile', 'Dockerfile created in root'], ['mvnBuild', 'mvnw clean package succeeds'], ['dockerBuild', `docker build -t ${domain.toLowerCase()}-backend .`], ['dockerRun', 'docker run works with -e flags'], ['postmanWorks', 'Postman confirms working']].map(([key, label]) => (
                  <label key={key} className={`task-item${backendTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={backendTasks[key]} onChange={() => toggleGroup(setBackendTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — React</h3>
                {[['dockerfile', 'Dockerfile created in root'], ['dockerBuild', `docker build -t ${domain.toLowerCase()}-frontend .`], ['dockerRun', 'docker run -p 3000:80 works'], ['browserWorks', 'Browser shows React app']].map(([key, label]) => (
                  <label key={key} className={`task-item${frontendTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={frontendTasks[key]} onChange={() => toggleGroup(setFrontendTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 — Both running</h3>
                {[['bothRunning', 'Both containers running'], ['reactConnects', 'React connects to Spring Boot'], ['loginWorks', 'Login and members list work']].map(([key, label]) => (
                  <label key={key} className={`task-item${bothTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={bothTasks[key]} onChange={() => toggleGroup(setBothTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 5 — Commit</h3>
                {[['backendCommitted', 'Backend Dockerfile committed'], ['frontendCommitted', 'Frontend Dockerfile committed']].map(([key, label]) => (
                  <label key={key} className={`task-item${commitTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={commitTasks[key]} onChange={() => toggleGroup(setCommitTasks, key)} />
                    {label}
                  </label>
                ))}

                {allInstall && allBackend && allFrontend && allBoth && allCommit && (
                  <>
                    <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                      In one sentence — what is the difference between a Docker image and a Docker container?
                    </p>
                    <textarea
                      className="reflection-box"
                      placeholder="A Docker image is the sealed tiffin box - the packaged app ready to run anywhere - while a Docker container is the opened tiffin box being eaten from - the running instance of that image..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      onPaste={e => e.preventDefault()}
                    />
                    <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                    <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                      {submitted ? 'Submitted ✅' : 'Apps containerised — deploy to internet next →'}
                    </button>

                    {submitted && (
                      <div style={{ marginTop: 16, padding: 16, background: '#EFF6FF', borderRadius: 8, color: '#1E3A8A' }}>
                        <b>Apps containerised. 📦</b><br /><br />
                        ✅ Spring Boot in Docker<br />
                        ✅ React in Docker<br />
                        ✅ Both running locally<br />
                        ✅ Dockerfiles committed<br /><br />
                        Topic 1 complete.<br /><br />
                        Topic 2 — deploy.<br /><br />
                        Your Docker containers move from your laptop to a cloud server. Same containers. Different machine. Real URL.<br /><br />
                        The gym owner opens it on their phone.
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

function StagePanel({ step, cardsSeen, copyCorrect, mavenDone, brStage, advanceBrStage, step3Done, funnelStage, step4Done, allTestsDone }) {
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'The tiffin box journey'}
        {step === 2 && 'The recipe, line by line'}
        {step === 3 && 'Pack the tiffin, then open it'}
        {step === 4 && 'React — the two-stage tiffin'}
        {step === 5 && 'Two tiffins, side by side'}
      </div>

      {step === 1 && (
        <div className="tiffin-stage">
          <svg width="90" height="100" viewBox="0 0 90 100">
            <rect x="15" y="20" width="60" height="70" rx="8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.5" />
            <rect x="20" y="10" width="50" height="16" rx="6" fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
            <circle cx="45" cy="8" r="4" fill="#2563EB" />
            <line x1="15" y1="45" x2="75" y2="45" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
            <line x1="15" y1="67" x2="75" y2="67" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <div className="tiffin-sequence-row">
            <div className="tiffin-seq-step lit"><span className="tiffin-seq-icon">📝</span><span className="tiffin-seq-lbl">Recipe<br />Dockerfile</span></div>
            <span className="tiffin-seq-arrow">→</span>
            <div className="tiffin-seq-step"><span className="tiffin-seq-icon">📦</span><span className="tiffin-seq-lbl">Pack<br />build</span></div>
            <span className="tiffin-seq-arrow">→</span>
            <div className="tiffin-seq-step"><span className="tiffin-seq-icon">🚚</span><span className="tiffin-seq-lbl">Ship<br />Image</span></div>
            <span className="tiffin-seq-arrow">→</span>
            <div className="tiffin-seq-step"><span className="tiffin-seq-icon">🍱</span><span className="tiffin-seq-lbl">Eat<br />Container</span></div>
          </div>
          <div className="location-row">
            <span className="location-chip">📍 Hostel</span>
            <span className="location-chip">📍 Library</span>
            <span className="location-chip">📍 Cloud</span>
          </div>
          <div className="tiffin-word">Same tiffin. <b>Any kitchen.</b></div>
        </div>
      )}

      {step === 2 && (
        <div className="dockerfile-preview">
          <div className={`dfp-line lit`}><span className="k-from">FROM</span> <span className="k-rest">eclipse-temurin:17-jdk-alpine</span></div>
          <div className={`dfp-line${cardsSeen.workdir || cardsSeen.from ? ' lit' : ''}`}><span className="k-workdir">WORKDIR</span> <span className="k-rest">/app</span></div>
          <div className={`dfp-line${copyCorrect ? ' lit' : ''}`}><span className="k-copy">COPY</span> <span className="k-rest">target/*.jar app.jar</span></div>
          <div className={`dfp-line${cardsSeen.entrypoint ? ' lit' : ''}`}><span className="k-entrypoint">ENTRYPOINT</span> <span className="k-rest">["java", "-jar", "app.jar"]</span></div>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
            {copyCorrect && cardsSeen.from && cardsSeen.workdir && cardsSeen.entrypoint ? 'Recipe written ✅' : 'Click each explanation on the left →'}
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="buildrun-row">
            <div className={`br-node${brStage >= 1 ? ' lit' : ''}`}><div className="br-node-icon">📝</div>Dockerfile + jar</div>
            <span className="br-arrow">→</span>
            <div className={`br-node${brStage >= 2 ? ' lit' : ''}`}><div className="br-node-icon">📦</div>docker build</div>
            <span className="br-arrow">→</span>
            <div className={`br-node${brStage >= 3 ? ' lit' : ''}`}><div className="br-node-icon">🚚</div>Image</div>
            <span className="br-arrow">→</span>
            <div className={`br-node${brStage >= 4 ? ' lit' : ''}`}><div className="br-node-icon">🍱</div>Container</div>
          </div>
          {mavenDone && brStage < 4 && (
            <button className="btn" style={{ background: '#fff', color: '#2563EB', border: '1.5px solid #BFDBFE' }} onClick={advanceBrStage}>Advance the build →</button>
          )}

          {brStage >= 3 && (
            <div className="port-bridge-row" style={{ marginTop: 18 }}>
              <div className={`port-box${brStage >= 4 ? ' lit' : ''}`}>Laptop<br />:8080</div>
              <div className={`bridge-track${brStage >= 4 ? ' flowing' : ''}`}>
                {brStage >= 4 && <span className="packet-dot" />}
              </div>
              <div className={`port-box${brStage >= 4 ? ' lit' : ''}`}>Container<br />:8080</div>
            </div>
          )}
          {brStage >= 4 && <div style={{ textAlign: 'center', fontWeight: 800, color: '#16A34A', fontSize: '0.82rem', marginTop: 8 }}>Container running ✅</div>}
        </>
      )}

      {step === 4 && (
        <div className="funnel-stage">
          <div className={`funnel-box stage1`} style={{ opacity: funnelStage >= 1 ? 1 : 0.4, borderColor: funnelStage >= 1 ? '#60A5FA' : '#E2E8F0' }}>
            Stage 1: Node<br /><span style={{ fontWeight: 400, fontSize: '0.68rem' }}>npm install → npm run build</span>
          </div>
          <div className="funnel-arrow-down">↓</div>
          <div className={`funnel-box stage2`} style={{ opacity: funnelStage >= 2 ? 1 : 0.4, borderColor: funnelStage >= 2 ? '#16A34A' : '#E2E8F0' }}>
            Stage 2: nginx<br /><span style={{ fontWeight: 400, fontSize: '0.68rem' }}>serves build/ files</span>
          </div>
          {funnelStage >= 2 && <div className="funnel-note">Final image = Stage 2 only. Lean image ✅</div>}
        </div>
      )}

      {step === 5 && (
        <>
          <div className="containers-row">
            <div className="container-box backend">
              <div className="container-box-title">gymapp-backend</div>
              <div className="container-box-port">:8080 · Spring Boot · MySQL + Gemini</div>
              <span className="running-badge">Running ✅</span>
            </div>
            <div className="container-box frontend">
              <div className="container-box-title">gymapp-frontend</div>
              <div className="container-box-port">:3000 · React + nginx</div>
              <span className="running-badge">Running ✅</span>
            </div>
          </div>
          {allTestsDone && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: '#78350F', fontWeight: 700 }}>
              Both running locally ✅ Ready to deploy to cloud ☁️
            </div>
          )}
        </>
      )}
    </div>
  );
}
