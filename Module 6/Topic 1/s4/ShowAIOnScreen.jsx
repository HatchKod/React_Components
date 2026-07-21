import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .sai-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .sai-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1240px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: all 0.2s; }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 6px; max-width: 1240px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 7px 14px; border-radius: 20px; font-size: 0.74rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(109,40,217,0.12); color: #6D28D9; }
  .p-pill.active { background: #6D28D9; color: #fff; }
  .p-line { width: 20px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #6D28D9; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1240px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.7; }
  .purple-card { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #5B21B6; font-size: 0.88rem; line-height: 1.7; }

  .code-block { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.65; margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: #334155; color: #E2E8F0; border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
  .code-comment { color: #64748B; } .code-tag { color: #93C5FD; } .code-blank-done { color: #6EE7B7; font-weight: 700; }

  .blank-panel { background: #0F172A; border: 1.5px solid #334155; border-radius: 10px; padding: 14px 16px; margin: 10px 0; }
  .blank-label { color: #FDE68A; font-size: 0.8rem; margin-bottom: 10px; line-height: 1.6; }
  .blank-opts { display: flex; gap: 8px; flex-wrap: wrap; }
  .blank-opt-btn { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 16px; font-family: monospace; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
  .blank-opt-btn:hover { border-color: #94A3B8; }
  .blank-opt-btn.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #6EE7B7; }
  .blank-opt-btn.wrong { background: rgba(239,68,68,0.2); border-color: #DC2626; color: #FCA5A5; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  .blank-input-row { display: flex; gap: 8px; }
  .blank-text-input { background: #1E293B; color: #E2E8F0; border: 1.5px solid #475569; border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 0.82rem; flex: 1; }
  .blank-submit-btn { background: #6D28D9; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .blank-feedback { margin-top: 8px; font-size: 0.78rem; }
  .blank-feedback.wrong { color: #FCA5A5; }
  .blank-feedback.correct { color: #6EE7B7; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #F5F3FF; color: #5B21B6; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; transition: all 0.2s; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.purple { background: linear-gradient(135deg, #667eea, #764ba2); }
  .btn.purple:hover { filter: brightness(1.08); }
  .btn.green { background: #16A34A; }

  .compare-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; font-size: 0.78rem; margin: 12px 0; }
  .compare-table td { padding: 12px 14px; font-family: 'Fira Code', monospace; font-weight: 600; border-radius: 0 8px 8px 0; }
  .compare-row-json td { background: #FEF2F2; color: #991B1B; border-left: 4px solid #DC2626; }
  .compare-row-text td { background: #F0FDF4; color: #14532D; border-left: 4px solid #16A34A; }

  /* three-state toggle demo */
  .state-toggle-row { display: flex; gap: 8px; margin: 14px 0; }
  .state-toggle-btn { flex: 1; padding: 9px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; border: 1.5px solid #E2E8F0; background: #fff; cursor: pointer; color: #64748B; }
  .state-toggle-btn.on { background: #6D28D9; border-color: #6D28D9; color: #fff; }

  /* pre-wrap demo */
  .prewrap-demo-box { background: #1E293B; color: #CBD5E1; border-radius: 10px; padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.78rem; margin: 10px 0; min-height: 90px; }
  .prewrap-demo-box.pretty { white-space: pre-wrap; color: #E2E8F0; }
  .prewrap-toggle-row { display: flex; gap: 8px; margin: 10px 0; }
  .prewrap-toggle-btn { flex: 1; padding: 8px; border-radius: 8px; font-weight: 700; font-size: 0.76rem; border: 1.5px solid #E2E8F0; background: #fff; cursor: pointer; }
  .prewrap-toggle-btn.on { background: #F5F3FF; border-color: #6D28D9; color: #6D28D9; }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #F5F3FF; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
  .domain-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .domain-btn { padding: 10px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  .domain-btn.selected { background: #6D28D9; border-color: #6D28D9; color: #fff; }
  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #6D28D9; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .reveal-strip { max-width: 1240px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE: realistic phone/app screen mockup ── */
  .phone-frame { background: #0F172A; border-radius: 28px; padding: 14px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); max-width: 380px; margin: 0 auto; }
  .phone-screen { background: #fff; border-radius: 18px; overflow: hidden; min-height: 340px; display: flex; flex-direction: column; }
  .phone-topbar { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 18px 20px 22px; position: relative; overflow: hidden; }
  .phone-topbar::after { content: ''; position: absolute; top: -30%; right: -10%; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%); }
  .phone-topbar-label { font-size: 0.65rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 4px; }
  .phone-member-name { font-size: 1.3rem; font-weight: 800; }
  .phone-member-sub { font-size: 0.82rem; opacity: 0.9; margin-top: 4px; }
  .phone-body { padding: 18px 20px; flex: 1; display: flex; flex-direction: column; }
  .fake-btn-row { display: flex; gap: 10px; margin-bottom: 18px; }
  .fake-btn { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.78rem; font-weight: 700; background: #F1F5F9; color: #64748B; }
  .fake-btn.danger { background: #FEF2F2; color: #DC2626; }
  .phone-divider { border: none; border-top: 1px dashed #E2E8F0; margin: 14px 0; }

  .ai-empty-hint { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; padding: 20px; border: 1.5px dashed #E9D5FF; border-radius: 12px; background: repeating-linear-gradient(135deg, #FDFCFF, #FDFCFF 10px, #FAF5FF 10px, #FAF5FF 20px); }
  .ai-empty-icon { font-size: 1.8rem; opacity: 0.5; animation: emptyFloat 2.4s ease-in-out infinite; }
  @keyframes emptyFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .ai-empty-text { font-size: 0.76rem; color: #A78BFA; font-weight: 600; text-align: center; }

  .ai-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 13px 24px; border-radius: 10px; cursor: pointer; font-size: 0.92rem; font-weight: 700; width: 100%; transition: transform 0.2s, box-shadow 0.2s, background 0.3s; box-shadow: 0 4px 14px rgba(118,75,162,0.3); position: relative; overflow: hidden; }
  .ai-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(118,75,162,0.4); }
  .ai-btn:disabled { opacity: 0.85; cursor: not-allowed; transform: none; background: linear-gradient(135deg, #8b7fd4, #9b7fbf); }
  .ai-btn.idle-glow { animation: idleGlow 2.2s ease-in-out infinite; }
  @keyframes idleGlow { 0%,100% { box-shadow: 0 4px 14px rgba(118,75,162,0.3); } 50% { box-shadow: 0 4px 22px rgba(118,75,162,0.55); } }
  .ai-btn .btn-label-fade { display: inline-flex; align-items: center; gap: 6px; animation: labelFadeIn 0.25s ease; }
  @keyframes labelFadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  .ai-btn .thinking-text { display: inline-flex; align-items: center; gap: 6px; }
  .robot-pulse { display: inline-block; animation: robotPulse 0.7s ease-in-out infinite; }
  @keyframes robotPulse { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.25) rotate(-6deg); } }
  .thinking-dots span { animation: dotFade 1s ease-in-out infinite; opacity: 0.3; }
  .thinking-dots span:nth-child(2) { animation-delay: 0.15s; }
  .thinking-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotFade { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
  .ai-btn-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: shimmerSweep 1.4s linear infinite; }
  @keyframes shimmerSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

  .error-card { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 0.85rem; animation: cardPop 0.35s ease; }

  .suggestion-card { background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px; padding: 16px; margin-top: 14px; animation: cardPop 0.5s cubic-bezier(.34,1.56,.64,1); transform-origin: top center; }
  @keyframes cardPop { 0% { opacity: 0; transform: scale(0.85) translateY(-10px); } 60% { opacity: 1; transform: scale(1.03) translateY(2px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
  .suggestion-card h4 { color: #6D28D9; margin: 0 0 8px 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 6px; }
  .suggestion-card .sparkle-icon { display: inline-block; animation: sparkleSpin 0.6s ease; }
  @keyframes sparkleSpin { from { transform: rotate(-180deg) scale(0); } to { transform: rotate(0deg) scale(1); } }
  .suggestion-card p { margin: 0; font-size: 0.9rem; color: #1E293B; }

  .phone-body-transition { transition: opacity 0.2s ease; }

  /* ── live pipeline card above the phone: Button → Spring Boot → Gemini → Screen ── */
  .pipeline-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 18px 16px 14px; max-width: 380px; margin: 0 auto 16px; border: 1px solid #F1F5F9; transition: border-color 0.3s, box-shadow 0.3s; }
  .pipeline-card.card-lit { border-color: #DDD6FE; box-shadow: 0 4px 20px rgba(139,92,246,0.15); }
  .pipeline-title { text-align: center; font-size: 0.65rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
  .pipeline-strip { display: flex; align-items: center; justify-content: center; gap: 2px; }
  .pipe-node { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .pipe-node-icon { width: 46px; height: 46px; border-radius: 50%; background: #F8FAFC; border: 2px solid #E2E8F0; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; transition: all 0.35s ease; position: relative; }
  .pipe-node-icon.lit { background: #F5F3FF; border-color: #8B5CF6; box-shadow: 0 0 0 5px rgba(139,92,246,0.15); transform: scale(1.05); }
  .pipe-node-icon.lit.active-pulse { animation: pipeNodePulse 0.9s ease-in-out infinite; }
  @keyframes pipeNodePulse { 0%,100% { box-shadow: 0 0 0 5px rgba(139,92,246,0.15); transform: scale(1.05); } 50% { box-shadow: 0 0 0 9px rgba(139,92,246,0.3); transform: scale(1.12); } }
  .pipe-node-icon.done { background: #F0FDF4; border-color: #10B981; box-shadow: 0 0 0 5px rgba(16,185,129,0.15); animation: nodeDoneBounce 0.5s cubic-bezier(.34,1.56,.64,1); }
  @keyframes nodeDoneBounce { 0% { transform: scale(0.7); } 60% { transform: scale(1.18); } 100% { transform: scale(1.05); } }
  .pipe-node-label { font-size: 0.6rem; font-weight: 800; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.03em; text-align: center; transition: color 0.3s; }
  .pipe-node-label.lit-lbl { color: #6D28D9; }
  .pipe-connector { flex: 0 0 24px; height: 3px; border-radius: 2px; background: #F1F5F9; margin-bottom: 22px; position: relative; overflow: visible; transition: background 0.3s ease; }
  .pipe-connector.flowing { background: #C4B5FD; }
  @keyframes pulseTravelPipe { 0% { left: -4px; opacity: 0; } 15% { opacity: 1; } 100% { left: 100%; opacity: 0.2; } }
  .pipe-travel-dot { position: absolute; top: -3.5px; width: 10px; height: 10px; border-radius: 50%; background: #8B5CF6; box-shadow: 0 0 10px #8B5CF6; animation: pulseTravelPipe 0.7s ease-in-out infinite; }

  .stage-label-under { text-align: center; font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 14px; transition: color 0.3s; }
  .stage-label-under.pulsing { color: #6D28D9; animation: labelPulse 1s ease-in-out infinite; }
  @keyframes labelPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
  .live-badge { display: inline-block; margin-left: 6px; font-size: 0.62rem; background: rgba(16,185,129,0.12); color: #16A34A; padding: 2px 8px; border-radius: 10px; font-weight: 800; animation: badgePop 0.3s ease; }
  @keyframes badgePop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .wow-card { background: linear-gradient(135deg, #F5F3FF, #FFFFFF); border: 1px solid #DDD6FE; border-radius: 16px; padding: 28px; text-align: center; max-width: 1240px; margin: 20px auto 0; }
  .wow-line { font-size: 0.98rem; color: #4C1D95; line-height: 1.9; opacity: 0; animation: fadeInUp 0.4s ease forwards; }
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

const STEPS = ['Three States', 'Fetch AI', 'Display Result', 'Full Demo'];

const DOMAINS = [
  { key: 'Gym', label: '🏋️ Gym', btn: '✨ Get Workout Suggestion', member: 'Ravi Kumar', sub: 'Basic Plan · Active', suggestion: "Hey Ravi! Here's your workout:\n• 15 squats\n• 10 push-ups\n• 20-sec plank\nDo 2 rounds! 💪" },
  { key: 'Hotel', label: '🏨 Hotel', btn: '✨ Get Welcome Message', member: 'Priya Sharma', sub: 'Deluxe Room 204', suggestion: "Welcome Priya! 🌸\nYour room is ready with a city view.\nBreakfast is served 7-10 AM.\nEnjoy your stay!" },
  { key: 'Mess', label: '🍱 Mess', btn: '✨ Get Menu Suggestion', member: 'Arjun Reddy', sub: 'Monthly Plan · Veg', suggestion: "Today's pick for Arjun:\n• Dal Tadka\n• Jeera Rice\n• Salad + Papad\nHigh protein, light on the stomach! 🥗" },
  { key: 'Chai', label: '☕ Chai', btn: '✨ Get Thank You Note', member: 'Meera Iyer', sub: '12th Order · Regular', suggestion: "Thank you Meera! ☕\nYour 12th chai with us -\nthat's loyalty we love.\nNext one's on the house!" },
];

export default function ShowAIOnScreen() {
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

  // ── Step 1: three states demo ──
  const [demoState, setDemoState] = useState('idle'); // idle | loading | result
  const [aiErrorInput, setAiErrorInput] = useState('');
  const [aiErrorCorrect, setAiErrorCorrect] = useState(false);
  const [aiErrorWrong, setAiErrorWrong] = useState(false);

  function cycleDemoState(target) {
    setDemoState(target);
    play('tick');
  }
  function submitAiErrorBlank() {
    if (aiErrorInput.trim().toLowerCase() === 'aierror') {
      setAiErrorCorrect(true); setAiErrorWrong(false); play('add');
    } else {
      setAiErrorWrong(true); play('warn');
    }
  }
  function toStep2() { play('tick'); setStep(2); }

  // ── Step 2: fetch blank ──
  const [textAnswer, setTextAnswer] = useState(null);
  const [step2Done, setStep2Done] = useState(false);
  function answerText(val) {
    if (textAnswer === 'text') return;
    setTextAnswer(val);
    if (val === 'text') play('add'); else play('warn');
  }
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: whiteSpace blank + pre-wrap toggle ──
  const [whiteSpaceInput, setWhiteSpaceInput] = useState('');
  const [whiteSpaceCorrect, setWhiteSpaceCorrect] = useState(false);
  const [whiteSpaceWrong, setWhiteSpaceWrong] = useState(false);
  const [prewrapOn, setPrewrapOn] = useState(false);
  const [prewrapPrediction, setPrewrapPrediction] = useState(null);
  const [step3Done, setStep3Done] = useState(false);

  function submitWhiteSpace() {
    if (whiteSpaceInput.trim() === 'whiteSpace') {
      setWhiteSpaceCorrect(true); setWhiteSpaceWrong(false); play('add');
    } else {
      setWhiteSpaceWrong(true); play('warn');
    }
  }
  function toggleStep3() {
    if (!step3Done) { play('add'); setTimeout(() => setStep(4), 400); }
    setStep3Done(d => !d);
  }

  // ── Step 4: full live demo ──
  const [suggestion, setSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0);
  const [fetchCount, setFetchCount] = useState(0);

  const currentMember = DOMAINS[0]; // Gym default for the live demo stage

  function getSuggestion() {
    setAiLoading(true);
    setAiError(null);
    setSuggestion(''); // clear old result before fetching new one
    play('tick');
    setTimeout(() => {
      setSuggestion(currentMember.suggestion);
      setAiLoading(false);
      setFetchCount(c => c + 1);
      play('correct');
    }, 1400 + Math.random() * 500);
  }

  const [test1, setTest1] = useState(false);
  const [test2, setTest2] = useState(false);
  const [test3, setTest3] = useState(false);
  const [test4, setTest4] = useState(false);

  function toggleTest(setter, val) {
    if (!val) play('add');
    setter(v => !v);
  }

  const allTestsDone = test1 && test2 && test3 && test4;
  const allTestsFiredRef = useRef(false);
  const [wowLines, setWowLines] = useState(0);
  useEffect(() => {
    if (allTestsDone && !allTestsFiredRef.current) {
      allTestsFiredRef.current = true;
      play('correct');
      let c = 0;
      const iv = setInterval(() => { c += 1; setWowLines(c); if (c >= 8) clearInterval(iv); }, 450);
      setTimeout(() => play('reveal'), 900);
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
      }, 4200);
    }
  }, [allTestsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [domain, setDomain] = useState(null);
  const [stateVars, setStateVars] = useState({ suggestion: false, aiLoading: false, aiError: false });
  const [fetchTasks, setFetchTasks] = useState({ postCall: false, textNotJson: false, tryCatch: false, clearFirst: false });
  const [jsxTasks, setJsxTasks] = useState({ button: false, disabled: false, thinkingToggle: false, prewrapCard: false, errorShown: false });
  const [testTasks, setTestTasks] = useState({ appears: false, loading: false, suggestionAppears: false, differentMembers: false });
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleGroup(setGroup, key) { setGroup(g => { const nv = !g[key]; if (nv) play('add'); return { ...g, [key]: nv }; }); }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const allStateVars = Object.values(stateVars).every(Boolean);
  const allFetchTasks = Object.values(fetchTasks).every(Boolean);
  const allJsxTasks = Object.values(jsxTasks).every(Boolean);
  const allTestTasks = Object.values(testTasks).every(Boolean);
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = domain && allStateVars && allFetchTasks && allJsxTasks && allTestTasks && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t1-s4-show-ai-on-screen',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { aiErrorBlank: aiErrorInput },
            slot2: { textBlank: textAnswer, responseDotTextUnderstood: textAnswer === 'text' },
            slot3: { whiteSpaceBlank: whiteSpaceInput, prewrapDemoSeen: prewrapOn },
            slot4: { buttonAppears: test1, thinkingShows: test2, suggestionAppears: test3, differentMembersTest: test4 },
          },
          phase2: {
            domainSelected: domain,
            threeStatesAdded: allStateVars,
            fetchFunctionAdded: allFetchTasks,
            jsxAdded: allJsxTasks,
            fullFlowWorks: allTestTasks,
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
    <div className="sai-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Show AI on the React Screen</h1>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Three states - idle, thinking, result</h2>
                  <div className="amber-card">
                    The gym owner clicks a button. Behind the scenes - Spring Boot calls Gemini, gets the answer.<br /><br />
                    The owner sees only the result. Like a prescription - clean, clear, useful. They never see the doctor's thought process.
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Click through the states on the right →</p>
                  <div className="state-toggle-row">
                    <button className={`state-toggle-btn${demoState === 'idle' ? ' on' : ''}`} onClick={() => cycleDemoState('idle')}>Idle</button>
                    <button className={`state-toggle-btn${demoState === 'loading' ? ' on' : ''}`} onClick={() => cycleDemoState('loading')}>Loading</button>
                    <button className={`state-toggle-btn${demoState === 'result' ? ' on' : ''}`} onClick={() => cycleDemoState('result')}>Result</button>
                  </div>

                  <CopyBlock code={`const [suggestion, setSuggestion] = useState("");\nconst [aiLoading, setAiLoading] = useState(false);\nconst [aiError, setAiError] = useState(null);`}>
                    const [suggestion, setSuggestion] = useState("");{'\n'}
                    const [aiLoading, setAiLoading] = useState(false);{'\n'}
                    const [{whiteSpaceCorrect || aiErrorCorrect ? '' : ''}{aiErrorCorrect ? <span className="code-blank-done">aiError</span> : '[___]'}, setAiError] = useState(null);{'\n'}
                    <span className="code-comment">// ↑ what do we call the error state?</span>
                  </CopyBlock>

                  {!aiErrorCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">We already have an 'error' state for member data. This is specifically for the AI call. What should we name it?</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="aiError" value={aiErrorInput} onChange={e => { setAiErrorInput(e.target.value); setAiErrorWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitAiErrorBlank}>Check</button>
                      </div>
                      {aiErrorWrong && <div className="blank-feedback wrong">Name it aiError - distinguishes it from other error states in the same component.</div>}
                    </div>
                  )}

                  {aiErrorCorrect && (
                    <>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Three separate state variables. One for each piece of AI data. Same pattern as loading/error from 4.2.1.
                      </p>
                      <button className="btn purple" onClick={toStep2}>Build the fetch →</button>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Call your Spring Boot AI endpoint</h2>
                  <div className="blue-card">
                    <b>response.json()</b> → expects {'{ }'} - use for objects, arrays<br />
                    <b>response.text()</b> → expects plain text - use for a string, like your AI answer<br /><br />
                    Your Spring Boot returns a String. Not JSON. Use response.text().
                  </div>

                  <CopyBlock code={`const getSuggestion = async () => {\n  setAiLoading(true);\n  setAiError(null);\n  setSuggestion(""); // clear old result\n\n  try {\n    const response = await fetch(\n      "http://localhost:8080/gym/ai/suggest",\n      {\n        method: "POST",\n        headers: {\n          "Content-Type": "application/json",\n          "Authorization": "Bearer " + token\n        },\n        body: JSON.stringify({\n          name: member.name,\n          age: String(member.age),\n          plan: member.plan\n        })\n      }\n    );\n    const text = await response.text();\n    setSuggestion(text);\n  } catch (err) {\n    setAiError("Could not get suggestion. Try again.");\n  } finally {\n    setAiLoading(false);\n  }\n};`}>
                    const getSuggestion = async () ={'>'} {'{'}{'\n'}
                    {'  '}setAiLoading(true);{'\n'}
                    {'  '}setAiError(null);{'\n'}
                    {'  '}setSuggestion(""); <span className="code-comment">// clear old result</span>{'\n\n'}
                    {'  '}try {'{'}{'\n'}
                    {'    '}const response = await fetch({'\n'}
                    {'      '}"http://localhost:8080/gym/ai/suggest",{'\n'}
                    {'      '}{'{'} method: "POST", headers: {'{'}...{'}'}, body: JSON.stringify({'{'}...{'}'}) {'}'}{'\n'}
                    {'    '});{'\n'}
                    {'    '}const text = await response.{textAnswer === 'text' ? <span className="code-blank-done">text</span> : '[___]'}();{'\n'}
                    <span className="code-comment">    {'    '}// ↑ plain text, not JSON{'\n'}</span>
                    {'    '}setSuggestion(text);{'\n'}
                    {'  '}{'}'} catch (err) {'{'}{'\n'}
                    {'    '}setAiError("Could not get suggestion. Try again.");{'\n'}
                    {'  '}{'}'} finally {'{'}{'\n'}
                    {'    '}setAiLoading(false);{'\n'}
                    {'  '}{'}'}{'\n'}
                    {'}'};
                  </CopyBlock>

                  {textAnswer !== 'text' && (
                    <div className="blank-panel">
                      <div className="blank-label">Your AI endpoint returns plain text - not JSON. Which response method reads plain text?</div>
                      <div className="blank-opts">
                        {['text', 'json', 'string', 'data'].map(opt => (
                          <button key={opt} className={`blank-opt-btn${textAnswer === opt && opt !== 'text' ? ' wrong' : ''}`} onClick={() => answerText(opt)}>{opt}</button>
                        ))}
                      </div>
                      {textAnswer && textAnswer !== 'text' && <div className="blank-feedback wrong">response.text() reads plain text. response.json() reads JSON objects. Your AI returns plain text.</div>}
                    </div>
                  )}

                  {textAnswer === 'text' && (
                    <>
                      <div className="purple-card">
                        <b>String(member.age)</b> converts the age number to a string. Your Spring Boot @RequestBody Map&lt;String, String&gt; expects all values as strings.
                      </div>
                      <div className="green-card">
                        Always clear the old suggestion before fetching a new one. Otherwise - old text stays visible while new one loads.
                      </div>
                      <div className={`checkbox-row${step2Done ? ' checked' : ''}`} onClick={toggleStep2}>
                        <input type="checkbox" checked={step2Done} readOnly />
                        ✅ getSuggestion function added to MemberDetail
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Show the suggestion - white-space: pre-wrap</h2>

                  <CopyBlock code={`<button onClick={getSuggestion} disabled={aiLoading} className="ai-btn">\n  {aiLoading ? "🤖 Thinking..." : "✨ Get AI Suggestion"}\n</button>`}>
                    &lt;button onClick={'{getSuggestion}'} disabled={'{aiLoading}'} className="ai-btn"{'>'}{'\n'}
                    {'  '}{'{'}aiLoading ? "🤖 Thinking..." : "✨ Get AI Suggestion"{'}'}{'\n'}
                    &lt;/button{'>'}
                  </CopyBlock>

                  <CopyBlock code={`{suggestion && (\n  <div className="suggestion-card">\n    <h4>AI Suggestion</h4>\n    <p style={{ whiteSpace: "pre-wrap" }}>\n      {suggestion}\n    </p>\n  </div>\n)}`}>
                    {'{'}suggestion &amp;&amp; ({'\n'}
                    {'  '}&lt;div className="suggestion-card"{'>'}{'\n'}
                    {'    '}&lt;h4{'>'}AI Suggestion&lt;/h4{'>'}{'\n'}
                    {'    '}&lt;p style={'{{'} {whiteSpaceCorrect ? <span className="code-blank-done">whiteSpace</span> : '[___]'}: "pre-wrap" {'}}'}{'>'}{'\n'}
                    <span className="code-comment">      {'    '}// ↑ which CSS property preserves line breaks?{'\n'}</span>
                    {'      '}{'{'}suggestion{'}'}{'\n'}
                    {'    '}&lt;/p{'>'}{'\n'}
                    {'  '}&lt;/div{'>'}{'\n'}
                    {')'}{'}'}
                  </CopyBlock>

                  {!whiteSpaceCorrect && (
                    <div className="blank-panel">
                      <div className="blank-label">To preserve AI line breaks in React inline styles - use camelCase: white-space → whiteSpace. What goes in style={'{{ }}'}?</div>
                      <div className="blank-input-row">
                        <input className="blank-text-input" placeholder="whiteSpace" value={whiteSpaceInput} onChange={e => { setWhiteSpaceInput(e.target.value); setWhiteSpaceWrong(false); }} />
                        <button className="blank-submit-btn" onClick={submitWhiteSpace}>Check</button>
                      </div>
                      {whiteSpaceWrong && <div className="blank-feedback wrong">In React inline styles - CSS properties use camelCase. white-space → whiteSpace</div>}
                    </div>
                  )}

                  {whiteSpaceCorrect && (
                    <>
                      {!prewrapPrediction ? (
                        <div className="blank-panel" style={{ marginTop: 16 }}>
                          <div className="blank-label">Predict: the AI's raw text has real "\n" line breaks in it. By default, does a React &lt;p&gt; tag show those line breaks, or squash them onto one line?</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="prewrap-toggle-btn" onClick={() => { setPrewrapPrediction('shows'); play('warn'); }}>Shows the line breaks</button>
                            <button className="prewrap-toggle-btn" onClick={() => { setPrewrapPrediction('squashes'); play('add'); }}>Squashes onto one line</button>
                          </div>
                        </div>
                      ) : (
                        <div className="blank-feedback" style={{ color: prewrapPrediction === 'squashes' ? '#16A34A' : '#DC2626', fontWeight: 700, marginTop: 12 }}>
                          {prewrapPrediction === 'squashes' ? '✅ Right — ' : '❌ Not quite — '}
                          By default HTML collapses whitespace, so every "\n" becomes a single space. That's why the AI's formatting disappears unless you explicitly ask React to preserve it.
                        </div>
                      )}

                      {prewrapPrediction && (
                        <>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 16 }}>Same text. Two ways. Toggle to see the difference →</p>
                          <div className="prewrap-toggle-row">
                            <button className={`prewrap-toggle-btn${!prewrapOn ? ' on' : ''}`} onClick={() => { setPrewrapOn(false); play('tick'); }}>Without pre-wrap</button>
                            <button className={`prewrap-toggle-btn${prewrapOn ? ' on' : ''}`} onClick={() => { setPrewrapOn(true); play('tick'); }}>With pre-wrap</button>
                          </div>
                          <div className={`prewrap-demo-box${prewrapOn ? ' pretty' : ''}`}>
                            {prewrapOn
                              ? "Hey Ravi! Here's your workout:\n• 15 squats\n• 10 push-ups\n• 20-sec plank\nDo 2 rounds! 💪"
                              : "Hey Ravi! Here's your workout: • 15 squats • 10 push-ups • 20-sec plank Do 2 rounds! 💪"}
                          </div>
                          {prewrapOn && <div className="blank-feedback correct">With pre-wrap ✅ - clearly better.</div>}
                        </>
                      )}

                      <div className="amber-card" style={{ marginTop: 14 }}>
                        <code>{'{aiError && <p className="error-card">{aiError}</p>}'}</code><br />
                        Same error card pattern from 4.3.2.
                      </div>

                      <div className={`checkbox-row${step3Done ? ' checked' : ''}`} onClick={toggleStep3}>
                        <input type="checkbox" checked={step3Done} readOnly />
                        ✅ Button and suggestion card added to JSX
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Click the button - see AI on screen</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Make sure Spring Boot is running. Open your React app. Navigate to a member's detail screen. Click "✨ Get AI Suggestion" on the right - it's live.
                  </p>

                  <CopyBlock code={`.ai-btn {\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 1rem;\n}\n.ai-btn:disabled { opacity: 0.7; cursor: not-allowed; }\n\n.suggestion-card {\n  background: #F5F3FF;\n  border: 1px solid #DDD6FE;\n  border-radius: 12px;\n  padding: 16px;\n  margin-top: 12px;\n}\n.suggestion-card h4 { color: #6D28D9; margin: 0 0 8px 0; }`}>
                    .ai-btn {'{'} background: linear-gradient(135deg, #667eea, #764ba2); color: white; ... {'}'}{'\n'}
                    .ai-btn:disabled {'{'} opacity: 0.7; cursor: not-allowed; {'}'}{'\n\n'}
                    .suggestion-card {'{'} background: #F5F3FF; border: 1px solid #DDD6FE; ... {'}'}{'\n'}
                    .suggestion-card h4 {'{'} color: #6D28D9; {'}'}
                  </CopyBlock>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>The AI button is purple - it stands out from regular buttons. The owner knows this is special.</p>

                  {[
                    ['Button appears on member detail screen', test1, () => toggleTest(setTest1, test1)],
                    ['"🤖 Thinking..." shows while loading', test2, () => toggleTest(setTest2, test2)],
                    ['AI suggestion appears in purple card', test3, () => toggleTest(setTest3, test3)],
                    ['Different members get different suggestions', test4, () => toggleTest(setTest4, test4)],
                  ].map(([label, val, fn]) => (
                    <div key={label} className={`checkbox-row${val ? ' checked' : ''}`} onClick={fn}>
                      <input type="checkbox" checked={val} readOnly />
                      {label}
                    </div>
                  ))}

                  {wowLines > 0 && (
                    <div className="wow-card" style={{ marginTop: 20 }}>
                      {['The gym owner clicks a button.', 'Words appear. Personalised. Thoughtful.', 'Written specifically for this member. Right now.', 'The owner did not type a prompt.', 'They did not know about Gemini. They did not see any code.', 'They just clicked a button.', 'That is what good software does. It makes powerful things feel simple.', 'Your app does that now.'].map((line, i) => (
                        wowLines >= i + 1 && <div key={line} className="wow-line" style={{ animationDelay: `${i * 0.05}s`, fontWeight: i === 5 || i === 7 ? 700 : 400 }}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {revealCount > 0 && (
                <div className="reveal-strip">
                  <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
                  {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>response.text()</b> → plain text response - not JSON, not an object</span></div>}
                  {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>whiteSpace: "pre-wrap"</b> → preserves AI line breaks - makes response readable</span></div>}
                  {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>disabled={'{aiLoading}'}</b> → prevents double-click while thinking</span></div>}
                  {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>setSuggestion("")</b> before fetch → clears old result before new call</span></div>}
                  {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>Three AI states</b> → idle / thinking / result - same useState pattern</span></div>}
                  {revealCount >= 5 && (
                    <>
                      <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                        AI is on screen. The user never sees the code. They see the suggestion.<br /><br />
                        Next - 5.1.5. Docker. Your app in a box that runs on any computer in the world. The first step to deployment.
                      </p>
                      <button className="btn purple" onClick={goToPhase2}>Add to YOUR project →</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: live phone-screen stage ── */}
            <div className="right-col">
              <div className="sticky-panel">
                <PhoneStage
                  step={step} demoState={demoState}
                  suggestion={suggestion} aiLoading={aiLoading} aiError={aiError}
                  getSuggestion={getSuggestion} fetchCount={fetchCount}
                  textAnswer={textAnswer} whiteSpaceCorrect={whiteSpaceCorrect}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ gridTemplateColumns: '1fr', maxWidth: 900 }}>
          <div className="card">
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Add AI to YOUR detail screen</h2>

            <div className="domain-row">
              {DOMAINS.map(d => (
                <button key={d.key} className={`domain-btn${domain === d.key ? ' selected' : ''}`} onClick={() => setDomain(d.key)}>{d.label}</button>
              ))}
            </div>

            {domain && (
              <div className="purple-card">
                Your button label: <b>"{DOMAINS.find(d => d.key === domain).btn}"</b>
              </div>
            )}

            {domain && (
              <>
                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 - State variables</h3>
                {[['suggestion', 'suggestion state added'], ['aiLoading', 'aiLoading state added'], ['aiError', 'aiError state added']].map(([key, label]) => (
                  <label key={key} className={`task-item${stateVars[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={stateVars[key]} onChange={() => toggleGroup(setStateVars, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 - getSuggestion function</h3>
                {[['postCall', `fetch POST to /${domain.toLowerCase()}/ai/suggest`], ['textNotJson', 'response.text() (not .json())'], ['tryCatch', 'try/catch/finally'], ['clearFirst', 'setSuggestion("") before fetch']].map(([key, label]) => (
                  <label key={key} className={`task-item${fetchTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={fetchTasks[key]} onChange={() => toggleGroup(setFetchTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 - JSX</h3>
                {[['button', 'AI button added'], ['disabled', 'disabled={aiLoading} on button'], ['thinkingToggle', '"Thinking..." vs label toggle'], ['prewrapCard', 'suggestion card with whiteSpace pre-wrap'], ['errorShown', 'aiError shown if error']].map(([key, label]) => (
                  <label key={key} className={`task-item${jsxTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={jsxTasks[key]} onChange={() => toggleGroup(setJsxTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 - Test</h3>
                {[['appears', 'Button appears on detail screen'], ['loading', 'Loading state visible'], ['suggestionAppears', 'AI suggestion appears'], ['differentMembers', 'Different members → different suggestions']].map(([key, label]) => (
                  <label key={key} className={`task-item${testTasks[key] ? ' checked' : ''}`}>
                    <input type="checkbox" checked={testTasks[key]} onChange={() => toggleGroup(setTestTasks, key)} />
                    {label}
                  </label>
                ))}

                <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Commit</h3>
                <CopyBlock code={`git add .\ngit commit -m "show AI suggestion on member detail screen"\ngit push origin main`}>
                  git add .{'\n'}git commit -m "show AI suggestion{'\n'}{'  '}on member detail screen"{'\n'}git push origin main
                </CopyBlock>
                <label className={`task-item${committed ? ' checked' : ''}`}>
                  <input type="checkbox" checked={committed} onChange={toggleCommitted} />
                  ✅ Committed and pushed
                </label>

                {allStateVars && allFetchTasks && allJsxTasks && allTestTasks && committed && (
                  <>
                    <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                      In one sentence - why do we use response.text() instead of response.json() for the AI endpoint?
                    </p>
                    <textarea
                      className="reflection-box"
                      placeholder="We use response.text() because our Spring Boot AI endpoint returns a plain String (the AI's suggestion), not a JSON object, so response.json() would fail to parse it correctly..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      onPaste={e => e.preventDefault()}
                    />
                    <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                    <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                      {submitted ? 'Submitted ✅' : 'AI on screen - Docker next →'}
                    </button>

                    {submitted && (
                      <div style={{ marginTop: 16, padding: 16, background: '#F5F3FF', borderRadius: 8, color: '#4C1D95' }}>
                        <b>AI is visible. 🤖✨</b><br /><br />
                        ✅ Button on detail screen<br />
                        ✅ Loading state shows thinking<br />
                        ✅ AI suggestion appears in card<br />
                        ✅ white-space preserves formatting<br />
                        ✅ Different members, different answers<br /><br />
                        Next - 5.1.5. Docker.<br /><br />
                        Right now your app only runs on your laptop.<br />
                        Docker puts it in a box. That box runs on any computer in the world. The first step to a real URL.
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

function PhoneStage({ step, demoState, suggestion, aiLoading, aiError, getSuggestion, fetchCount, textAnswer, whiteSpaceCorrect }) {
  // Step 1: driven by demoState toggle. Steps 2-3: static preview. Step 4: fully live.
  const isLive = step === 4;
  const showLoading = step === 1 ? demoState === 'loading' : aiLoading;
  const showResult = step === 1 ? demoState === 'result' : !!suggestion;
  const isIdle = step === 1 ? demoState === 'idle' : (!showLoading && !showResult);
  // a stable-but-changing key so React remounts the button label + card on every
  // state flip, guaranteeing the pop/fade animations actually replay each time
  const stateKey = step === 1 ? demoState : (showLoading ? 'loading' : showResult ? 'result' : 'idle');

  // which pipeline node is "active" right now — this is what makes each state
  // visually distinct instead of reusing the same static phone every time
  const nodes = [
    { key: 'button', icon: '👆', label: 'Button' },
    { key: 'spring', icon: '☕', label: 'Spring Boot' },
    { key: 'gemini', icon: '✨', label: 'Gemini' },
    { key: 'screen', icon: '📱', label: 'Screen' },
  ];
  // how far the pipeline has lit up: 0 = only the button, 2 = through Gemini (mid-flight), 3 = all the way to the screen
  const litUpTo = isIdle ? 0 : showLoading ? 2 : showResult ? 3 : -1;

  return (
    <div>
      <div className={`pipeline-card${!isIdle || litUpTo > 0 ? ' card-lit' : ''}`}>
        <div className="pipeline-title">The request's journey</div>
        <div className="pipeline-strip" key={`pipe-${stateKey}-${fetchCount}`}>
          {nodes.map((n, i) => (
            <React.Fragment key={n.key}>
              {i > 0 && (
                <div className={`pipe-connector${i <= litUpTo ? ' flowing' : ''}`}>
                  {showLoading && (i === 1 || i === 2) && <span className="pipe-travel-dot" style={{ animationDelay: i === 2 ? '0.3s' : '0s' }} />}
                </div>
              )}
              <div className="pipe-node">
                <div className={`pipe-node-icon${i <= litUpTo ? ' lit' : ''}${showLoading && (i === 1 || i === 2) ? ' active-pulse' : ''}${showResult && i === 3 ? ' done' : ''}`}>
                  {n.icon}
                </div>
                <div className={`pipe-node-label${i <= litUpTo ? ' lit-lbl' : ''}`}>{n.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="phone-frame">
        <div className="phone-screen">
          <div className="phone-topbar">
            <div className="phone-topbar-label">Member Detail</div>
            <div className="phone-member-name">Ravi Kumar</div>
            <div className="phone-member-sub">Basic Plan · Active</div>
          </div>
          <div className="phone-body">
            <div className="fake-btn-row">
              <div className="fake-btn">Save Changes</div>
              <div className="fake-btn danger">Delete</div>
            </div>
            <hr className="phone-divider" />

            <button
              key={`btn-${stateKey}`}
              className={`ai-btn${isIdle ? ' idle-glow' : ''}`}
              disabled={showLoading}
              onClick={() => {
                if (step === 1) return; // step 1 driven by toggle buttons only
                if (isLive) getSuggestion();
              }}
            >
              {showLoading && <span className="ai-btn-shimmer" />}
              {showLoading ? (
                <span className="thinking-text">
                  <span className="robot-pulse">🤖</span> Thinking
                  <span className="thinking-dots"><span>.</span><span>.</span><span>.</span></span>
                </span>
              ) : (
                <span className="btn-label-fade">✨ Get AI Suggestion</span>
              )}
            </button>

            {aiError && <div className="error-card">{aiError}</div>}

            {showResult && (
              <div key={`card-${stateKey}-${fetchCount}`} className="suggestion-card">
                <h4><span className="sparkle-icon">🤖</span> AI Suggestion</h4>
                <p style={{ whiteSpace: (step >= 3 ? (whiteSpaceCorrect || step === 4 ? 'pre-wrap' : 'normal') : 'pre-wrap') }}>
                  {step === 1
                    ? "Hey Ravi! Here's your workout:\n• 15 squats\n• 10 push-ups\n• 20-sec plank\nYou've got this! 💪"
                    : suggestion || "Hey Ravi! Here's your workout:\n• 15 squats\n• 10 push-ups\n• 20-sec plank\nYou've got this! 💪"}
                </p>
              </div>
            )}

            {isIdle && !aiError && (
              <div className="ai-empty-hint">
                <span className="ai-empty-icon">💭</span>
                <span className="ai-empty-text">No suggestion yet — click the button above</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`stage-label-under${showLoading ? ' pulsing' : ''}`}>
        {step === 1 && (demoState === 'idle' ? '● Idle — waiting for owner to click' : demoState === 'loading' ? '⏳ Loading — Gemini is thinking' : '✅ Result — suggestion is on screen')}
        {step === 2 && 'fetch → Spring Boot → Gemini → response.text()'}
        {step === 3 && 'Same card, formatted with pre-wrap'}
        {step === 4 && <>This button actually works<span className="live-badge">LIVE{fetchCount > 0 ? ` · ${fetchCount} calls` : ''}</span></>}
      </div>
    </div>
  );
}
