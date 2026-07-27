import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .dv-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .dv-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1280px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(220,38,38,0.12); color: #DC2626; }
  .p-pill.active { background: #DC2626; color: #fff; }
  .p-line { width: 14px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #DC2626; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1280px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.9rem; line-height: 1.8; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.75; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.75; }
  .purple-card { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #4C1D95; font-size: 0.88rem; line-height: 1.75; }

  /* cricket highlight animation */
  .cricket-strip { display: flex; justify-content: center; gap: 6px; margin: 14px 0; flex-wrap: wrap; }
  .cricket-ball { font-size: 1.3rem; opacity: 0.25; transition: all 0.4s; }
  .cricket-ball.hit { opacity: 1; animation: sixHit 0.6s ease; }
  @keyframes sixHit { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-14px) scale(1.3); } 100% { transform: translateY(0) scale(1); } }
  .cricket-score { text-align: center; font-weight: 800; color: #B45309; font-size: 0.85rem; margin-top: 4px; }

  /* timeline blocks */
  .timeline-blocks { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0; }
  .tblock { flex: 1; min-width: 90px; padding: 8px 6px; border-radius: 8px; text-align: center; cursor: pointer; border: 1.5px solid #E2E8F0; background: #F8FAFC; transition: all 0.2s; }
  .tblock.expanded-active { border-color: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
  .tblock.filled { background: #FEF2F2; border-color: #FCA5A5; }
  .tblock.ai-block { background: #F5F3FF; border-color: #DDD6FE; }
  .tblock.ai-block.filled { background: #EDE9FE; border-color: #A78BFA; }
  .tblock-time { font-size: 0.62rem; font-weight: 800; color: #94A3B8; }
  .tblock-name { font-size: 0.7rem; font-weight: 700; color: #475569; margin-top: 2px; }

  .block-detail { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 16px; margin: 12px 0; background: #FAFAFA; }
  .block-detail.ai-detail { background: #F5F3FF; border-color: #DDD6FE; }
  .block-detail-title { font-weight: 800; font-size: 0.9rem; margin-bottom: 8px; color: #1E293B; }
  .block-line { font-family: 'Fira Code', monospace; background: #F1F5F9; border-radius: 6px; padding: 10px 12px; font-size: 0.78rem; color: #334155; margin-bottom: 10px; white-space: pre-wrap; }
  .fill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
  @media(max-width:700px) { .fill-grid { grid-template-columns: 1fr; } }
  .fill-field { display: flex; flex-direction: column; gap: 4px; }
  .fill-field.full { grid-column: 1 / -1; }
  .fill-label { font-size: 0.74rem; font-weight: 700; color: #475569; }
  .fill-input { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 10px; font-size: 0.82rem; font-family: inherit; }
  .fill-input:focus { border-color: #DC2626; outline: none; }
  .fill-textarea { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 7px 10px; font-size: 0.82rem; font-family: inherit; resize: vertical; min-height: 50px; }
  .block-note { font-size: 0.76rem; color: #78716C; font-style: italic; margin-top: 6px; }

  .script-output { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; margin: 12px 0; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.9; white-space: pre-wrap; max-height: 320px; overflow-y: auto; }
  .copy-btn { background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 6px 14px; font-size: 0.75rem; font-weight: 700; cursor: pointer; margin-top: 8px; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #FEF2F2; color: #B91C1C; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .tool-card { border-radius: 10px; padding: 16px 18px; margin: 12px 0; }
  .tool-recommended { background: #F0FDF4; border: 2px solid #86EFAC; }
  .tool-badge { display: inline-block; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; background: #16A34A; color: #fff; margin-bottom: 8px; }
  .tool-title { font-weight: 800; font-size: 1rem; margin-bottom: 8px; }
  .tool-steps { font-size: 0.82rem; color: #14532D; line-height: 1.9; white-space: pre-wrap; }

  .alt-toggle { background: #F5F5F4; border: 1.5px solid #E7E5E4; border-radius: 10px; padding: 12px 16px; margin-top: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 0.85rem; color: #44403C; }
  .alt-body { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-top: 6px; }
  .alt-tool { margin-bottom: 12px; }
  .alt-tool-name { font-weight: 700; font-size: 0.84rem; color: #334155; margin-bottom: 4px; }
  .alt-tool-steps { font-size: 0.78rem; color: #64748B; line-height: 1.7; white-space: pre-wrap; font-family: 'Fira Code', monospace; }

  .tip-nav { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
  .tip-tab { padding: 6px 12px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; font-size: 0.74rem; color: #94A3B8; }
  .tip-tab.active { border-color: #DC2626; color: #DC2626; background: #FEF2F2; }
  .tip-tab.tip-seen::after { content: ' ✓'; }
  .tip-card { border-radius: 14px; padding: 20px 22px; background: #EFF6FF; border: 2px solid #BFDBFE; animation: tipIn 0.35s ease; }
  @keyframes tipIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  .tip-title { font-size: 1.05rem; font-weight: 800; margin: 0 0 10px; color: #1E3A8A; }
  .tip-text { font-size: 0.88rem; line-height: 1.85; color: #1E40AF; white-space: pre-wrap; }
  .tip-nav-btns { display: flex; justify-content: space-between; margin-top: 16px; }
  .tip-nav-btn { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .tip-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .checklist-item { display: flex; align-items: center; gap: 10px; margin-top: 8px; padding: 10px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-size: 0.84rem; font-weight: 600; color: #334155; }
  .checklist-item.checked { background: #FEF2F2; color: #B91C1C; font-weight: 700; }
  .checklist-item input { width: 16px; height: 16px; flex-shrink: 0; }

  .demo-link-input { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-family: 'Fira Code', monospace; font-size: 0.84rem; margin-top: 8px; }
  .demo-link-input:focus { border-color: #DC2626; outline: none; }

  .btn { background: #DC2626; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }

  .gate-card { background: linear-gradient(135deg, #FFFBEB, #FFF); border: 1.5px solid #FDE68A; border-radius: 14px; padding: 20px 22px; margin-top: 18px; }
  .gate-title { font-weight: 800; font-size: 1rem; color: #92400E; margin: 0 0 12px; }
  .gate-item { display: flex; align-items: center; gap: 10px; padding: 8px 4px; font-size: 0.85rem; }
  .gate-item.gate-done { color: #92400E; font-weight: 700; }
  .gate-item.gate-current { color: #DC2626; font-weight: 800; background: rgba(220,38,38,0.08); border-radius: 6px; }
  .gate-item.gate-pending { color: #A8A29E; }
  .gate-progress-note { text-align: center; margin-top: 12px; font-weight: 800; color: #DC2626; font-size: 0.88rem; }

  .reveal-strip { max-width: 1280px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 460px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px; text-align: center; }

  .vid-timeline { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
  .vid-block { flex: 1; min-width: 70px; height: 54px; border-radius: 6px; background: #F1F5F9; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800; color: #94A3B8; transition: all 0.35s; }
  .vid-block.vfilled { background: #FEE2E2; color: #B91C1C; }
  .vid-block.vfilled.ai-vfilled { background: #DDD6FE; color: #5B21B6; }
  .vid-block-time { font-size: 0.55rem; opacity: 0.8; }
  .vid-duration-note { text-align: center; font-weight: 800; color: #16A34A; font-size: 0.82rem; margin-top: 8px; }

  .script-preview-panel { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-top: 14px; font-size: 0.76rem; color: #475569; line-height: 1.7; white-space: pre-wrap; max-height: 220px; overflow-y: auto; }

  .laptop-visual { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .laptop-screen { width: 100%; max-width: 260px; aspect-ratio: 16/10; background: linear-gradient(135deg,#F0FDFA,#fff); border: 3px solid #1E293B; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; color: #94A3B8; font-size: 0.7rem; font-weight: 700; }
  .cam-corner { position: absolute; bottom: 8px; right: 8px; width: 44px; height: 44px; border-radius: 50%; background: #1E293B; border: 2px solid #475569; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
  .laptop-base { width: 80%; max-width: 208px; height: 8px; background: #334155; border-radius: 0 0 6px 6px; }

  .loom-mockup { border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-top: 14px; width: 100%; }
  .loom-topbar { background: #6366F1; color: #fff; padding: 8px 14px; font-weight: 800; font-size: 0.76rem; }
  .loom-body { padding: 14px; text-align: center; }
  .loom-btn { background: #6366F1; color: #fff; border: none; border-radius: 20px; padding: 8px 20px; font-weight: 700; font-size: 0.78rem; }
  .loom-status { font-size: 0.72rem; color: #64748B; margin-top: 8px; font-weight: 700; }

  .rec-checklist-visual { display: flex; flex-direction: column; gap: 6px; }
  .rec-check-item { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: #94A3B8; }
  .rec-check-item.rec-done { color: #16A34A; font-weight: 700; }

  .timer-visual { text-align: center; margin: 14px 0; }
  .timer-display { font-family: 'Fira Code', monospace; font-size: 1.8rem; font-weight: 800; color: #DC2626; }
  .cut-animation { text-align: center; font-size: 1.3rem; font-weight: 900; color: #16A34A; margin-top: 8px; animation: fadeInUp 0.4s ease; }

  .final-timeline { display: flex; flex-wrap: wrap; gap: 4px; }
  .final-block { flex: 1; min-width: 70px; padding: 10px 4px; border-radius: 8px; text-align: center; background: #FEE2E2; color: #991B1B; font-size: 0.62rem; font-weight: 800; }
  .final-block.ai-final { background: #DDD6FE; color: #5B21B6; }
  .final-block-time { font-size: 0.58rem; opacity: 0.75; margin-top: 2px; }

  .gate-stage-bolt-row { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
  .gate-stage-bolt { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; background: #F1F0EE; color: #A8A29E; transition: all 0.3s; }
  .gate-stage-bolt.gold { background: linear-gradient(135deg, #FDE68A, #F59E0B); color: #78350F; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }
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

const BLOCKS = [
  { key: 'b1', time: '0:00-0:30', name: 'Intro' },
  { key: 'b2', time: '0:30-1:00', name: 'The App' },
  { key: 'b3', time: '1:00-1:30', name: 'Core Feature' },
  { key: 'b4', time: '1:30-2:00', name: 'Manage' },
  { key: 'b5', time: '2:00-2:30', name: 'AI Feature', ai: true },
  { key: 'b6', time: '2:30-3:00', name: 'Closing' },
];

const TIPS = [
  { title: 'Practice once before recording.', text: "Not to memorise.\nJust to make sure:\nApp loads ✅\nLogin works ✅\nYou know what to click ✅" },
  { title: 'Use real-looking data.', text: "Add member named 'Suresh Kumar' not 'Test123'.\nUse plan 'Basic' not 'aaa'.\n\nThe demo looks professional with real-looking data." },
  { title: 'Speak slowly.', text: "When nervous — people speak fast.\nSlow down. Pause.\n\nLet each feature land before moving to the next.\n\nSilence is fine." },
  { title: 'AI feature at exactly 2:00.', text: "Build to it.\nLet the viewer see normal features first.\n\nAt 2:00 — click the button.\nLet the response load.\nLet them read it.\n\nThis is your six sixes moment." },
  { title: 'Do not edit.', text: "One clean take > edited video.\n\nIf you make a small mistake — keep going.\nThe viewer will not notice.\nStopping and restarting adds more nervousness." },
];

const CHECKLIST_ITEMS = [
  ['script', 'Script in front of me'],
  ['appOpen', 'App open in browser (live URL — not localhost)'],
  ['loggedIn', 'Logged in to the app'],
  ['realData', 'Real member data visible'],
  ['toolReady', 'Loom/QuickTime ready'],
  ['micWorking', 'Microphone working'],
  ['quiet', 'Quiet environment'],
  ['practiced', 'Practiced once'],
];

const STEPS = ['Script', 'Tools + Tips', 'Record', 'Add Link'];

export default function DemoVideoBuilder() {
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

  // ── cricket highlight animation ──
  const [ballsHit, setBallsHit] = useState(0);
  useEffect(() => {
    if (ballsHit >= 6) return;
    const t = setTimeout(() => setBallsHit(b => b + 1), 500);
    return () => clearTimeout(t);
  }, [ballsHit]);

  // ── STEP 1: Script ──
  const [expandedBlock, setExpandedBlock] = useState('b1');
  const [fields, setFields] = useState({
    yourName: '', domain: '', city: '', manualProcess: '',
    items: '',
  });
  const [blockFilled, setBlockFilled] = useState({ b1: false, b2: false, b3: false, b4: false, b5: false, b6: false });

  function updateField(key, val) { setFields(f => ({ ...f, [key]: val })); }

  function toggleBlock(key) {
    play('tick');
    setExpandedBlock(k => {
      const next = k === key ? '' : key;
      if (['b3', 'b4', 'b5', 'b6'].includes(next)) setReadOnlyBlockOpenedAt(Date.now());
      return next;
    });
  }

  const b1Ready = fields.yourName.trim() && fields.domain.trim() && fields.city.trim() && fields.manualProcess.trim().length > 5;
  const b2Ready = fields.items.trim().length > 1;

  useEffect(() => { setBlockFilled(bf => ({ ...bf, b1: !!b1Ready })); }, [b1Ready]);
  useEffect(() => { setBlockFilled(bf => ({ ...bf, b2: !!b2Ready })); }, [b2Ready]);

  // Blocks 3/4/5/6 are pure read-only script lines with nothing to type, so
  // "Got it" is the only completion signal available - but a short dwell
  // delay stops it from being satisfied by an instant click before the
  // block's content has even had a moment to be read.
  const [readOnlyBlockOpenedAt, setReadOnlyBlockOpenedAt] = useState(null);
  const [readOnlyBlockReady, setReadOnlyBlockReady] = useState(false);
  useEffect(() => {
    setReadOnlyBlockReady(false);
    if (!readOnlyBlockOpenedAt) return;
    const t = setTimeout(() => setReadOnlyBlockReady(true), 1800);
    return () => clearTimeout(t);
  }, [readOnlyBlockOpenedAt]);

  function markBlockSeen(key) {
    setBlockFilled(bf => { if (bf[key]) return bf; play('tick'); return { ...bf, [key]: true }; });
  }

  const filledCount = Object.values(blockFilled).filter(Boolean).length;
  const allBlocksFilled = filledCount === 6;

  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  function generateScript() {
    play('correct');
    const domain = fields.domain || '[domain]';
    const items = fields.items || '[items]';
    const script = `[0:00-0:30] INTRODUCTION
"My name is ${fields.yourName || '[name]'}. I built a ${domain} app for a real business near my college in ${fields.city || '[city]'}. The owner was ${fields.manualProcess || '[manual process]'}. Here is what I built."

[0:30-1:00] THE APP
Open live URL. Login.
"This is the app. I can see all ${items} from any device."

[1:00-1:30] CORE FEATURE
Add a new item.
"Adding takes 10 seconds. Goes to MySQL. Permanent."

[1:30-2:00] MANAGE
Open one item. Edit. Save.
"Owner can update instantly. No paper. No phone calls."

[2:00-2:30] AI FEATURE ✨
Click AI button. Wait for response. Let it breathe. Do not rush.
"This is AI. Google Gemini generates a personalised suggestion. The owner has never seen this before."

[2:30-3:00] CLOSING
Tech stack. Live URL. GitHub.
"Built with Java Spring Boot, React, MySQL, JWT, Gemini. Live at ${fields.yourName ? 'my URL' : '[your URL]'}. Code at GitHub: [link]. My name is ${fields.yourName || '[name]'}."`;
    setGeneratedScript(script);
    setScriptGenerated(true);
  }

  const [practicedOnce, setPracticedOnce] = useState(false);
  function togglePracticed() {
    if (!practicedOnce) play('add');
    setPracticedOnce(p => !p);
  }

  function goToStep2() { play('tick'); setStep(2); }

  // ── STEP 2: Tools + Tips ──
  const [toolChosen, setToolChosen] = useState('Loom');
  const [altOpen, setAltOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [tipsSeen, setTipsSeen] = useState({ 0: true });
  function nextTip() {
    play('tick');
    setTipIdx(i => {
      const next = Math.min(i + 1, TIPS.length - 1);
      setTipsSeen(s => ({ ...s, [next]: true }));
      return next;
    });
  }
  function prevTip() { play('tick'); setTipIdx(i => Math.max(i - 1, 0)); }
  const allTipsSeen = TIPS.every((_, i) => tipsSeen[i]);

  const [tipsUnderstood, setTipsUnderstood] = useState(false);
  function toggleTipsUnderstood() {
    if (!tipsUnderstood) play('add');
    setTipsUnderstood(t => !t);
  }

  function goToStep3() { play('tick'); setStep(3); }

  // ── STEP 3: Record ──
  const [checklist, setChecklist] = useState({ script: false, appOpen: false, loggedIn: false, realData: false, toolReady: false, micWorking: false, quiet: false, practiced: false });
  function toggleChecklist(key) {
    setChecklist(c => { const nv = { ...c, [key]: !c[key] }; if (nv[key]) play('tick'); return nv; });
  }
  const allChecklistDone = Object.values(checklist).every(Boolean);
  const checklistFiredRef = useRef(false);
  useEffect(() => { if (allChecklistDone && !checklistFiredRef.current) { checklistFiredRef.current = true; play('correct'); } }, [allChecklistDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [readyToRecord, setReadyToRecord] = useState(false);
  function pressReadyToRecord() { play('tick'); setReadyToRecord(true); }

  const [demoRecorded, setDemoRecorded] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [linkSaved, setLinkSaved] = useState(false);
  function toggleDemoRecorded() {
    if (!demoRecorded) play('tick');
    setDemoRecorded(d => !d);
  }
  function toggleLinkSaved() {
    if (!linkSaved && demoLink.trim().length > 5) { play('correct'); setLinkSaved(true); }
    else if (linkSaved) setLinkSaved(false);
  }

  function goToStep4() { play('tick'); setStep(4); }

  // ── STEP 4: Add link to README ──
  const [readmeChecks, setReadmeChecks] = useState({ linkAdded: false, linkedin: false, interviews: false, gateSubmission: false, committed: false });
  function toggleReadmeCheck(key) {
    setReadmeChecks(r => { const nv = { ...r, [key]: !r[key] }; if (nv[key]) play('add'); return nv; });
  }
  const linkAddedAndCommitted = readmeChecks.linkAdded && readmeChecks.committed;
  const allReadmeChecks = Object.values(readmeChecks).every(Boolean);

  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allReadmeChecks && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 5) clearInterval(iv); }, 450);
      }, 300);
    }
  }, [allReadmeChecks]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [p2Recorded, setP2Recorded] = useState(false);
  const [p2Link, setP2Link] = useState('');
  const [p2Committed, setP2Committed] = useState(false);
  const [reflection, setReflection] = useState('');
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const [submitted, setSubmitted] = useState(false);

  function toggleP2Recorded() { if (!p2Recorded) play('add'); setP2Recorded(v => !v); }
  function toggleP2Committed() { if (!p2Committed) play('add'); setP2Committed(v => !v); }

  const canSubmit = p2Recorded && p2Link.trim().length > 5 && p2Committed && sentences >= 1;
  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t2-s4-demo-video-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            step1: { scriptGenerated, practisedOnce: practicedOnce, scriptContent: generatedScript },
            step2: { toolChosen, fiveTipsUnderstood: tipsUnderstood },
            step3: { allChecklistItems: allChecklistDone, demoRecorded, demoLink },
            step4: { linkAddedToReadme: readmeChecks.linkAdded, committed: readmeChecks.committed },
          },
          phase2: {
            demoRecorded: p2Recorded,
            demoLink: p2Link,
            committedToGitHub: p2Committed,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMinutes = (filledCount * 0.5).toFixed(1);

  return (
    <div className="dv-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Record Your 3-Minute Demo</h1>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>The 3-minute highlight reel</h2>

                  <div className="amber-card">
                    Nobody watches all 50 overs to understand a match.<br />
                    They watch the highlights.<br /><br />
                    Six sixes. Hat-trick. Winning run.<br /><br />
                    Your demo is the highlight reel.<br />
                    Not architecture discussions. Not debugging sessions.<br /><br />
                    The features working. The AI responding. The app looking real.<br /><br />
                    <b>3 minutes.</b>
                  </div>

                  <div className="cricket-strip">
                    {[0,1,2,3,4,5].map(i => (
                      <span key={i} className={`cricket-ball${ballsHit > i ? ' hit' : ''}`}>🏏</span>
                    ))}
                  </div>
                  {ballsHit >= 6 && <div className="cricket-score">Six sixes. That is a highlight reel.</div>}

                  <div className="timeline-blocks">
                    {BLOCKS.map(b => (
                      <div
                        key={b.key}
                        className={`tblock${b.ai ? ' ai-block' : ''}${expandedBlock === b.key ? ' expanded-active' : ''}${blockFilled[b.key] ? ' filled' : ''}`}
                        onClick={() => toggleBlock(b.key)}
                      >
                        <div className="tblock-time">{b.time}</div>
                        <div className="tblock-name">{b.ai ? '✨ ' : ''}{b.name}</div>
                      </div>
                    ))}
                  </div>

                  {expandedBlock === 'b1' && (
                    <div className="block-detail">
                      <div className="block-detail-title">Block 1 — 0:00-0:30 — Introduction</div>
                      <div className="block-line">"My name is [name]. I built a [domain] app for a real [business] near my college in [city]. The [owner] was [manual process]. Here is what I built."</div>
                      <div className="fill-grid">
                        <div className="fill-field"><span className="fill-label">Your name</span><input className="fill-input" value={fields.yourName} onChange={e => updateField('yourName', e.target.value)} /></div>
                        <div className="fill-field"><span className="fill-label">Domain</span><input className="fill-input" placeholder="gym / hotel / mess / chai" value={fields.domain} onChange={e => updateField('domain', e.target.value)} /></div>
                        <div className="fill-field"><span className="fill-label">City</span><input className="fill-input" value={fields.city} onChange={e => updateField('city', e.target.value)} /></div>
                        <div className="fill-field full"><span className="fill-label">Manual process</span><textarea className="fill-textarea" placeholder="tracking members on paper" value={fields.manualProcess} onChange={e => updateField('manualProcess', e.target.value)} /></div>
                      </div>
                      <div className="block-note">Practice saying this 30 seconds. Not longer.</div>
                    </div>
                  )}

                  {expandedBlock === 'b2' && (
                    <div className="block-detail">
                      <div className="block-detail-title">Block 2 — 0:30-1:00 — The App</div>
                      <div className="block-line">Open live URL. Login.{'\n'}"This is the app. I can see all [items] from any device."</div>
                      <div className="fill-grid">
                        <div className="fill-field"><span className="fill-label">Items</span><input className="fill-input" placeholder="members / rooms / meals / orders" value={fields.items} onChange={e => updateField('items', e.target.value)} /></div>
                      </div>
                    </div>
                  )}

                  {expandedBlock === 'b3' && (
                    <div className="block-detail">
                      <div className="block-detail-title">Block 3 — 1:00-1:30 — Core Feature</div>
                      <div className="block-line">Add a new [item].{'\n'}"Adding takes 10 seconds. Goes to MySQL. Permanent."</div>
                      {!blockFilled.b3 && <button className="btn" style={{ marginTop: 10, opacity: readOnlyBlockReady ? 1 : 0.5 }} disabled={!readOnlyBlockReady} onClick={() => markBlockSeen('b3')}>{readOnlyBlockReady ? 'Got it →' : 'Reading...'}</button>}
                    </div>
                  )}

                  {expandedBlock === 'b4' && (
                    <div className="block-detail">
                      <div className="block-detail-title">Block 4 — 1:30-2:00 — Manage</div>
                      <div className="block-line">Open one [item]. Edit. Save.{'\n'}"Owner can update instantly. No paper. No phone calls."</div>
                      {!blockFilled.b4 && <button className="btn" style={{ marginTop: 10, opacity: readOnlyBlockReady ? 1 : 0.5 }} disabled={!readOnlyBlockReady} onClick={() => markBlockSeen('b4')}>{readOnlyBlockReady ? 'Got it →' : 'Reading...'}</button>}
                    </div>
                  )}

                  {expandedBlock === 'b5' && (
                    <div className="block-detail ai-detail">
                      <div className="block-detail-title">Block 5 — 2:00-2:30 — AI Feature ✨</div>
                      <div className="block-line">Click AI button. Wait for response. [Let it breathe. Do not rush.]{'\n'}"This is AI. Google Gemini generates a personalised suggestion. The owner has never seen this before."</div>
                      <div className="purple-card" style={{ margin: '10px 0 0' }}>
                        🌟 This is the wow moment. Do not rush past it.<br />
                        Let the AI response load. Let the viewer read it.<br />
                        A few seconds of silence here is fine.
                      </div>
                      {!blockFilled.b5 && <button className="btn" style={{ marginTop: 10, opacity: readOnlyBlockReady ? 1 : 0.5 }} disabled={!readOnlyBlockReady} onClick={() => markBlockSeen('b5')}>{readOnlyBlockReady ? 'Got it →' : 'Reading...'}</button>}
                    </div>
                  )}

                  {expandedBlock === 'b6' && (
                    <div className="block-detail">
                      <div className="block-detail-title">Block 6 — 2:30-3:00 — Closing</div>
                      <div className="block-line">Tech stack. Live URL. GitHub.{'\n'}"Built with Java Spring Boot, React, MySQL, JWT, Gemini. Live at [your URL]. Code at GitHub: [link]. My name is [name]."</div>
                      {!blockFilled.b6 && <button className="btn" style={{ marginTop: 10, opacity: readOnlyBlockReady ? 1 : 0.5 }} disabled={!readOnlyBlockReady} onClick={() => markBlockSeen('b6')}>{readOnlyBlockReady ? 'Got it →' : 'Reading...'}</button>}
                    </div>
                  )}

                  <button className="btn" style={{ background: '#fff', color: '#DC2626', border: '1.5px solid #FCA5A5', opacity: allBlocksFilled ? 1 : 0.5 }} disabled={!allBlocksFilled} onClick={generateScript}>
                    {allBlocksFilled ? 'Generate my script →' : `Fill in all 6 blocks to continue (${filledCount}/6)`}
                  </button>

                  {scriptGenerated && (
                    <>
                      <div className="script-output">{generatedScript}</div>
                      <button className="copy-btn" onClick={() => { try { navigator.clipboard.writeText(generatedScript); } catch (e) {} play('tick'); }}>Copy script</button>

                      <div className={`checkbox-row${practicedOnce ? ' checked' : ''}`} onClick={togglePracticed}>
                        <input type="checkbox" checked={practicedOnce} readOnly />
                        ✅ Script written — I have practised it once
                      </div>

                      <button className="btn" style={{ opacity: practicedOnce ? 1 : 0.5 }} disabled={!practicedOnce} onClick={goToStep2}>
                        {practicedOnce ? 'Next — tools + tips →' : 'Confirm you practised to continue'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>How to record + five tips for a good demo</h2>

                  <div className="tool-card tool-recommended" onClick={() => { setToolChosen('Loom'); play('tick'); }}>
                    <span className="tool-badge">Recommended</span>
                    <div className="tool-title">🎥 Loom</div>
                    <div className="tool-steps">{`Free. Screen + camera. Shareable link instantly.
How to use:
1. Go to loom.com
2. Create free account
3. Install Chrome extension
4. Click Loom button
5. Screen + Camera mode
6. Record
7. Get shareable link`}</div>
                  </div>

                  <div className="alt-toggle" onClick={() => { setAltOpen(o => !o); play('tick'); }}>
                    <span>Other recording options</span>
                    <span>{altOpen ? '▲' : '▼'}</span>
                  </div>
                  {altOpen && (
                    <div className="alt-body">
                      <div className="alt-tool" onClick={() => setToolChosen('QuickTime')} style={{ cursor: 'pointer' }}>
                        <div className="alt-tool-name">🍎 Mac QuickTime</div>
                        <div className="alt-tool-steps">{`File → New Screen Recording
Arrow → choose microphone
Record → File → Save`}</div>
                      </div>
                      <div className="alt-tool" onClick={() => setToolChosen('Xbox Game Bar')} style={{ cursor: 'pointer' }}>
                        <div className="alt-tool-name">🪟 Windows Game Bar</div>
                        <div className="alt-tool-steps">{`Win + G to open
Win + Alt + R to start
Saves to Videos/Captures/`}</div>
                      </div>
                      <div className="alt-tool" onClick={() => setToolChosen('OBS Studio')} style={{ cursor: 'pointer' }}>
                        <div className="alt-tool-name">🎬 OBS Studio</div>
                        <div className="alt-tool-steps">Free. More control. Saves as MP4. Good if Loom does not work.</div>
                      </div>
                    </div>
                  )}

                  <h3 style={{ fontSize: '1rem', margin: '22px 0 10px' }}>Five tips</h3>
                  <div className="tip-nav">
                    {TIPS.map((t, i) => (
                      <div key={i} className={`tip-tab${i === tipIdx ? ' active' : ''}${tipsSeen[i] ? ' tip-seen' : ''}`}>Tip {i + 1}</div>
                    ))}
                  </div>

                  <div className="tip-card" key={tipIdx}>
                    <div className="tip-title">{TIPS[tipIdx].title}</div>
                    <div className="tip-text">{TIPS[tipIdx].text}</div>
                  </div>

                  <div className="tip-nav-btns">
                    <button className="tip-nav-btn" onClick={prevTip} disabled={tipIdx === 0}>← Previous</button>
                    {tipIdx < TIPS.length - 1
                      ? <button className="tip-nav-btn" onClick={nextTip}>Next →</button>
                      : <button className="tip-nav-btn" onClick={nextTip}>Got it →</button>}
                  </div>

                  {allTipsSeen && (
                    <div className={`checkbox-row${tipsUnderstood ? ' checked' : ''}`} onClick={toggleTipsUnderstood}>
                      <input type="checkbox" checked={tipsUnderstood} readOnly />
                      ✅ I understand the five tips
                    </div>
                  )}

                  <button className="btn" style={{ opacity: tipsUnderstood ? 1 : 0.5 }} disabled={!tipsUnderstood} onClick={goToStep3}>
                    {tipsUnderstood ? 'Next — record it →' : 'Read all tips and confirm to continue'}
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Record it</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Before pressing record:</p>

                  {CHECKLIST_ITEMS.map(([key, label]) => (
                    <div key={key} className={`checklist-item${checklist[key] ? ' checked' : ''}`} onClick={() => toggleChecklist(key)}>
                      <input type="checkbox" checked={checklist[key]} readOnly />
                      {label}
                    </div>
                  ))}

                  {allChecklistDone && !readyToRecord && (
                    <button className="btn" onClick={pressReadyToRecord}>Ready to record →</button>
                  )}

                  {readyToRecord && (
                    <>
                      <div className="blue-card">
                        Press record. Follow your script.<br /><br />
                        0:00 — Introduction<br />
                        0:30 — Open app, login<br />
                        1:00 — Add member<br />
                        1:30 — Edit member<br />
                        2:00 — AI feature (wow!)<br />
                        2:30 — Closing<br /><br />
                        Stop at 3:00.
                      </div>

                      <div className="green-card">
                        If you are happy with it — done. If not — record again. Usually the second take is much better.
                      </div>

                      <div className={`checkbox-row${demoRecorded ? ' checked' : ''}`} onClick={toggleDemoRecorded}>
                        <input type="checkbox" checked={demoRecorded} readOnly />
                        I recorded the video
                      </div>

                      {demoRecorded && (
                        <>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Paste your demo link here:</p>
                          <input className="demo-link-input" placeholder="https://loom.com/share/... or YouTube link" value={demoLink} onChange={e => setDemoLink(e.target.value)} />
                          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 6 }}>This link goes in your README and your LinkedIn.</p>

                          <div className={`checkbox-row${linkSaved ? ' checked' : ''}`} onClick={toggleLinkSaved} style={{ opacity: demoLink.trim().length > 5 ? 1 : 0.5 }}>
                            <input type="checkbox" checked={linkSaved} readOnly />
                            ✅ Demo recorded — link saved
                          </div>

                          <button className="btn" style={{ opacity: linkSaved ? 1 : 0.5 }} disabled={!linkSaved} onClick={goToStep4}>
                            {linkSaved ? 'Next — add link to README →' : 'Save your link to continue'}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Add demo link to README</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Open your backend README.md. Add this section after the Live App link:</p>

                  <div className="script-output" style={{ maxHeight: 'none' }}>
{`## 🎬 Demo Video
[Watch 3-minute demo](${demoLink || 'your-demo-link'})`}
                  </div>
                  <button className="copy-btn" onClick={() => { try { navigator.clipboard.writeText(`## 🎬 Demo Video\n[Watch 3-minute demo](${demoLink || 'your-demo-link'})`); } catch (e) {} play('tick'); }}>Copy snippet</button>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 16 }}>Also add to:</p>
                  {[
                    ['linkedin', 'LinkedIn profile — featured section'],
                    ['interviews', 'Keep link handy for interviews'],
                    ['gateSubmission', 'Will paste it in the gate submission'],
                  ].map(([key, label]) => (
                    <div key={key} className={`checkbox-row${readmeChecks[key] ? ' checked' : ''}`} onClick={() => toggleReadmeCheck(key)}>
                      <input type="checkbox" checked={readmeChecks[key]} readOnly />
                      {label}
                    </div>
                  ))}

                  <div className="blue-card">
                    <b>Commit:</b>
                    <div style={{ background: '#1E293B', color: '#6EE7B7', borderRadius: 6, padding: '10px 12px', marginTop: 8, fontFamily: "'Fira Code', monospace", fontSize: '0.76rem', whiteSpace: 'pre-wrap' }}>
{`git add README.md
git commit -m "add demo video link to README"
git push origin main`}
                    </div>
                  </div>

                  <div className={`checkbox-row${readmeChecks.linkAdded ? ' checked' : ''}`} onClick={() => toggleReadmeCheck('linkAdded')}>
                    <input type="checkbox" checked={readmeChecks.linkAdded} readOnly />
                    ✅ Demo link in README
                  </div>
                  <div className={`checkbox-row${readmeChecks.committed ? ' checked' : ''}`} onClick={() => toggleReadmeCheck('committed')}>
                    <input type="checkbox" checked={readmeChecks.committed} readOnly />
                    ✅ Committed and pushed
                  </div>

                  {linkAddedAndCommitted && (
                    <div className="gate-card">
                      <div className="gate-title">🔒 Deploy v3 gate</div>
                      <div className="gate-item gate-done">✅ Live URL accessible</div>
                      <div className="gate-item gate-done">✅ AI feature working live</div>
                      <div className="gate-item gate-done">✅ Business owner saw live app</div>
                      <div className="gate-item gate-current">✅ Demo recorded ← this</div>
                      <div className="gate-item gate-pending">⬜ README complete</div>
                      <div className="gate-item gate-pending">⬜ GitHub clean commits</div>
                      <div className="gate-item gate-pending">⬜ Mentor review done</div>
                      <div className="gate-progress-note">4/7 complete — two more to go</div>
                    </div>
                  )}

                  {revealCount > 0 && (
                    <div className="reveal-strip">
                      <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>Phase 1 complete</h3>
                      {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>3 minutes</b> → highlight reel — not 50 overs</span></div>}
                      {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>Script structure</b> → intro → app → feature → manage → AI → close</span></div>}
                      {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>AI feature at 2:00</b> → build to the wow moment — let the response breathe</span></div>}
                      {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>Loom</b> → free, instant link, screen + camera</span></div>}
                      {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>"Let me show you"</b> → three words that beat three minutes of describing</span></div>}
                      {revealCount >= 5 && (
                        <>
                          <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.9 }}>
                            You have a demo video.<br /><br />
                            When an employer asks about your project — you play the video.<br /><br />
                            Next — 5.2.5.<br />
                            Answer "tell me about yourself" like a developer.<br /><br />
                            Not a student.<br />
                            A developer who built something real.
                          </p>
                          <button className="btn" onClick={goToPhase2}>Demo done →</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT STAGE */}
            <div className="right-col">
              <div className="sticky-panel">
                <StagePanel
                  step={step} blockFilled={blockFilled} totalMinutes={totalMinutes} allBlocksFilled={allBlocksFilled}
                  generatedScript={generatedScript} scriptGenerated={scriptGenerated}
                  checklist={checklist} allChecklistDone={allChecklistDone} readyToRecord={readyToRecord} demoRecorded={demoRecorded} linkSaved={linkSaved}
                  toolChosen={toolChosen}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ maxWidth: 900 }}>
          <div className="card">
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Record YOUR demo</h2>

            <div className="amber-card">
              Use the script and tips from Phase 1 to record your own project's 3-minute demo.
            </div>

            <div className={`checkbox-row${p2Recorded ? ' checked' : ''}`} onClick={toggleP2Recorded}>
              <input type="checkbox" checked={p2Recorded} readOnly />
              ✅ I recorded my demo video
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 14 }}>Demo link:</p>
            <input className="demo-link-input" placeholder="https://loom.com/share/..." value={p2Link} onChange={e => setP2Link(e.target.value)} />

            <div className={`checkbox-row${p2Committed ? ' checked' : ''}`} onClick={toggleP2Committed}>
              <input type="checkbox" checked={p2Committed} readOnly />
              ✅ Link added to README and committed
            </div>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
              In one sentence — why does "showing" your project in a video work better than describing it in words?
            </p>
            <textarea
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: 14, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', minHeight: 90, outline: 'none' }}
              placeholder="Showing the project working live proves it is real and functional instead of just claiming it works, which is much more convincing to someone who has never seen the code..."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onPaste={e => e.preventDefault()}
            />
            <div className={`word-count${sentences >= 1 ? ' ok' : ''}`} style={{ textAlign: 'right', fontSize: '0.8rem', color: sentences >= 1 ? '#16A34A' : '#94A3B8', marginTop: 6, fontWeight: 600 }}>{sentences} / 1 sentence minimum</div>

            <button className="btn" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
              {submitted ? 'Submitted ✅' : 'Demo done — next module →'}
            </button>

            {submitted && (
              <div style={{ marginTop: 16, padding: 16, background: '#FEF2F2', borderRadius: 8, color: '#991B1B' }}>
                <b>Demo complete. 🎬</b><br /><br />
                Next — 5.2.5.<br />
                Answer "tell me about yourself" like a developer.<br /><br />
                This video becomes your answer when an employer asks: "tell me about your project."<br /><br />
                You show it. You do not just describe it.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StagePanel({ step, blockFilled, totalMinutes, allBlocksFilled, generatedScript, scriptGenerated, checklist, allChecklistDone, readyToRecord, demoRecorded, linkSaved, toolChosen }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (step !== 3 || !readyToRecord) return;
    if (elapsed >= 180) return;
    const t = setTimeout(() => setElapsed(e => e + 15), 350);
    return () => clearTimeout(t);
  }, [step, readyToRecord, elapsed]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'Your 3-minute timeline'}
        {step === 2 && 'Recording setup'}
        {step === 3 && 'Recording status'}
        {step === 4 && 'Complete demo timeline'}
      </div>

      {step === 1 && (
        <>
          <div className="vid-timeline">
            {BLOCKS.map(b => (
              <div key={b.key} className={`vid-block${blockFilled[b.key] ? ' vfilled' : ''}${b.ai ? ' ai-vfilled' : ''}`}>
                <div>{b.ai ? '✨' : ''}{b.name}</div>
                <div className="vid-block-time">{b.time}</div>
              </div>
            ))}
          </div>
          {allBlocksFilled ? <div className="vid-duration-note">✅ Perfect length — 3:00</div> : <div className="vid-duration-note" style={{ color: '#94A3B8' }}>{totalMinutes} / 3.0 min filled</div>}
          {scriptGenerated && <div className="script-preview-panel">{generatedScript}</div>}
        </>
      )}

      {step === 2 && (
        <div className="laptop-visual">
          <div className="laptop-screen">
            App on screen
            <div className="cam-corner">🙂</div>
          </div>
          <div className="laptop-base" />
          <p style={{ fontSize: '0.74rem', color: '#94A3B8', textAlign: 'center' }}>Screen shows: app<br />Corner shows: you explaining</p>

          <div className="loom-mockup">
            <div className="loom-topbar">🎥 Loom</div>
            <div className="loom-body">
              <button className="loom-btn">Start recording</button>
              <div className="loom-status">Get link instantly ✅</div>
            </div>
          </div>
          {toolChosen !== 'Loom' && <p style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>Selected: {toolChosen}</p>}
        </div>
      )}

      {step === 3 && (
        <>
          <div className="rec-checklist-visual">
            {CHECKLIST_ITEMS.map(([key, label]) => (
              <div key={key} className={`rec-check-item${checklist[key] ? ' rec-done' : ''}`}>
                {checklist[key] ? '✅' : '⬜'} {label}
              </div>
            ))}
          </div>

          {readyToRecord && (
            <div className="timer-visual">
              <div className="timer-display">{timerLabel}</div>
              {elapsed >= 180 && <div className="cut-animation">🎬 Cut!</div>}
            </div>
          )}
          {demoRecorded && linkSaved && <div className="cut-animation" style={{ marginTop: 4 }}>✅ Demo saved</div>}
        </>
      )}

      {step === 4 && (
        <>
          <div className="final-timeline">
            {BLOCKS.map(b => (
              <div key={b.key} className={`final-block${b.ai ? ' ai-final' : ''}`}>
                {b.ai ? '✨ ' : ''}{b.name}
                <div className="final-block-time">{b.time}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#5B21B6', marginTop: 10 }}>The wow moment is at 2:00 ✅</p>

          <div className="gate-stage-bolt-row">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className={`gate-stage-bolt${n <= 4 ? ' gold' : ''}`}>{n}</div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#DC2626', marginTop: 8 }}>4/7 bolts lit</p>
        </>
      )}
    </div>
  );
}
