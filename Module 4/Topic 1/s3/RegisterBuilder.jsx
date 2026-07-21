import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .rb-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 20px 16px 60px; color: #1E293B; line-height: 1.5; }
  .rb-root * { box-sizing: border-box; }
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

  /* ── MAIN STAGE: machine + table always visible, big ── */
  .stage-wrap { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }
  @media(max-width: 980px) { .stage-wrap { grid-template-columns: 1fr; } }

  /* left rail: thin, scrollable, one step's code/question visible */
  .rail-col { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; max-height: 80vh; overflow-y: auto; position: sticky; top: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
  @media(max-width: 980px) { .rail-col { position: static; max-height: none; } }
  .rail-step-title { font-size: 1.02rem; font-weight: 800; color: #1E293B; margin: 0 0 10px; }
  .rail-prose { font-size: 0.82rem; color: #64748B; line-height: 1.7; margin-bottom: 12px; }
  .rail-prose b { color: #1E293B; }

  .mini-analogy { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #78350F; line-height: 1.6; margin-bottom: 12px; }
  .mini-blue { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #1E40AF; line-height: 1.6; margin-bottom: 12px; }
  .mini-green { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #14532D; line-height: 1.6; margin-bottom: 12px; }

  .rail-code { background: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.8rem; line-height: 1.7; color: #E2E8F0; margin: 8px 0; overflow-x: auto; white-space: pre-wrap; position: relative; }
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

  .rail-tf-row { display: flex; gap: 8px; margin: 10px 0; }
  .rail-tf-btn { flex: 1; padding: 9px; border-radius: 7px; font-weight: 800; border: 1.5px solid #E2E8F0; background: #fff; color: #1E293B; cursor: pointer; font-size: 0.8rem; }
  .rail-tf-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .rail-tf-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }

  .rail-btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 0.85rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .rail-btn:disabled { background: #CBD5E1; color: #94A3B8; cursor: not-allowed; }
  .rail-btn.green { background: #16A34A; }
  .rail-check { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.8rem; color: #1E293B; }
  .rail-check.checked { background: #F0FDF4; color: #14532D; }
  .rail-check input { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
  .replay-mini { background: none; border: 1.5px solid #E2E8F0; color: #64748B; border-radius: 16px; padding: 3px 10px; font-size: 0.66rem; font-weight: 700; cursor: pointer; margin-left: 8px; }
  .replay-mini:hover { border-color: #3B82F6; color: #2563EB; }

  /* ── THE MACHINE (right, big stage) ── */
  .machine-col { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px 24px; min-height: 560px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
  .machine-stage-label { text-align: center; font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }

  .grinder-stage { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; padding: 20px 0 30px; }
  @media(max-width: 600px) { .grinder-stage { gap: 12px; } }
  .g-item { text-align: center; }
  .g-lbl { font-size: 0.72rem; color: #64748B; margin-top: 10px; font-family: monospace; }
  .grain-big { width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #D97706, #92400E); margin: 0 auto; transition: transform 0.6s ease, opacity 0.6s ease; box-shadow: 0 4px 14px rgba(180,83,9,0.4); }
  .grain-big.entered { transform: translateX(80px) scale(0.2); opacity: 0; }
  .machine-body-wrap { position: relative; }
  .machine-svg { filter: drop-shadow(0 6px 18px rgba(0,0,0,0.4)); }
  .gear-spin { transform-origin: 50px 50px; }
  .gear-spin.spinning { animation: gearSpin 0.8s linear; }
  @keyframes gearSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .machine-glow { filter: drop-shadow(0 0 0 rgba(59,130,246,0)); transition: filter 0.4s ease; }
  .machine-glow.active { filter: drop-shadow(0 0 16px rgba(59,130,246,0.5)); }
  .powder-big-wrap { display: flex; gap: 4px; justify-content: center; min-height: 24px; opacity: 0; transition: opacity 0.4s ease; flex-wrap: wrap; width: 70px; }
  .powder-big-wrap.shown { opacity: 1; }
  .powder-big-dot { width: 5px; height: 5px; border-radius: 50%; background: #94A3B8; animation: scatterOut 0.5s ease; }
  @keyframes scatterOut { from { transform: scale(0) translateY(-14px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  .g-arrow { font-size: 1.4rem; color: #334155; }

  .grinder-btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 6px; }
  .grinder-action-btn { background: #1E293B; color: #E2E8F0; border: 1.5px solid #334155; border-radius: 8px; padding: 9px 18px; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
  .grinder-action-btn:hover:not(:disabled) { border-color: #3B82F6; }
  .grinder-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .grinder-action-btn.danger { border-color: rgba(220,38,38,0.4); color: #FCA5A5; }
  .reverse-fail-note { text-align: center; color: #FCA5A5; font-size: 0.76rem; margin-top: 8px; font-family: monospace; }
  @keyframes xPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
  .reverse-x { display: inline-block; animation: xPop 0.3s ease; color: #DC2626; font-weight: 900; margin-left: 6px; }

  /* live MySQL table - the payoff surface, always visible, updates as user progresses */
  .live-table-wrap { border-radius: 12px; overflow: hidden; border: 1px solid #1F2937; margin-top: 8px; background: #0B0F19; }
  .live-table-head { display: flex; align-items: center; padding: 10px 14px; background: #111827; border-bottom: 1px solid #1F2937; }
  .live-table-title { font-size: 0.72rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; }
  .live-table-badge { margin-left: auto; font-size: 0.66rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; }
  .live-table-badge.waiting { background: rgba(100,116,139,0.15); color: #94A3B8; }
  .live-table-badge.protected-b { background: rgba(16,185,129,0.15); color: #6EE7B7; }
  table.live-mysql { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.78rem; }
  table.live-mysql th { background: #111827; color: #475569; text-align: left; padding: 8px 12px; font-weight: 700; text-transform: uppercase; font-size: 0.62rem; border-bottom: 1px solid #1F2937; }
  table.live-mysql td { padding: 10px 12px; color: #CBD5E1; border-bottom: 1px solid #161C2C; transition: background 0.4s, color 0.4s; }
  .live-empty-row td { text-align: center; color: #475569; font-style: italic; padding: 22px; }
  .pw-cell-hash { color: #6EE7B7; font-weight: 700; }
  .pw-cell-hash.pulse { animation: pwPulse 1.4s ease; }
  @keyframes pwPulse { 0%,100% { background: transparent; } 40% { background: rgba(16,185,129,0.25); } }
  .plain-crossed { color: #F87171; text-decoration: line-through; font-size: 0.68rem; margin-left: 8px; }
  .row-fly-in { animation: rowFlyIn 0.5s ease; }
  @keyframes rowFlyIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

  /* bean/autowired mini-visual embedded in machine stage */
  .bean-flow-stage { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; padding: 10px 0 20px; }
  .bean-box { flex: 1; min-width: 110px; max-width: 150px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 10px; text-align: center; font-size: 0.72rem; color: #64748B; transition: all 0.4s ease; }
  .bean-box.glow { background: #EFF6FF; border-color: #3B82F6; color: #1E40AF; box-shadow: 0 0 16px rgba(59,130,246,0.2); }
  .bean-box-icon { font-size: 1.8rem; margin-bottom: 6px; }
  .bean-arrow { font-size: 1.2rem; color: #CBD5E1; }

  /* door stage (SecurityConfig) */
  .door-stage { display: flex; align-items: center; justify-content: center; gap: 30px; padding: 16px 0 24px; flex-wrap: wrap; }
  .door-shape-big { width: 90px; height: 130px; border-radius: 8px; border: 2.5px solid #DC2626; background: #FEF2F2; display: flex; align-items: center; justify-content: center; font-size: 2rem; transition: all 0.5s ease; position: relative; }
  .door-shape-big.opened { border-color: #10B981; background: #F0FDF4; }
  @keyframes doorFlashRed { 0%,100% { box-shadow: none; } 50% { box-shadow: 0 0 0 5px rgba(220,38,38,0.3); } }
  .door-shape-big.flashing { animation: doorFlashRed 0.8s ease 2; }
  .door-lbl-big { font-size: 0.74rem; color: #64748B; margin-top: 10px; text-align: center; font-family: monospace; }
  .door-status-big { font-size: 0.68rem; font-weight: 800; margin-top: 2px; text-align: center; }
  .door-status-big.open-txt { color: #16A34A; }
  .door-status-big.locked-txt { color: #DC2626; }
  @keyframes attackerBounceBig { 0% { transform: translateX(-50px); } 45% { transform: translateX(10px); } 60% { transform: translateX(-8px); } 100% { transform: translateX(-50px); opacity: 0.5; } }
  .attacker-bounce-big { position: absolute; left: -40px; top: 50%; transform: translateY(-50%); font-size: 1.6rem; animation: attackerBounceBig 1.4s ease-in-out infinite; }
  .knock-401-tag { position: absolute; top: -14px; right: -10px; background: #FEE2E2; color: #DC2626; font-size: 0.6rem; font-weight: 800; padding: 2px 7px; border-radius: 8px; }
  .knock-200-tag { position: absolute; top: -14px; right: -10px; background: #DCFCE7; color: #16A34A; font-size: 0.6rem; font-weight: 800; padding: 2px 7px; border-radius: 8px; animation: xPop 0.3s ease; }

  /* register flow stage */
  .regflow-stage { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0 22px; flex-wrap: wrap; }
  .regflow-node { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 0.72rem; color: #64748B; text-align: center; min-width: 90px; transition: all 0.3s; }
  .regflow-node.lit { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .regflow-arrow { color: #CBD5E1; font-size: 1.1rem; }

  .payoff-banner { text-align: center; margin-top: 18px; padding: 16px; border-radius: 10px; background: linear-gradient(135deg, #F0FDF4, #FFFFFF); border: 1px solid #86EFAC; }
  .payoff-line { font-size: 0.86rem; color: #14532D; opacity: 0; animation: fadeInUp 0.4s ease forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .reveal-strip { max-width: 1280px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.88rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }

  .qcheck-note-r { font-size: 0.76rem; margin-top: 8px; padding: 8px 10px; border-radius: 7px; }
  .qcheck-note-r.wrong { background: #FEF2F2; color: #991B1B; }
  .qcheck-note-r.correct { background: #F0FDF4; color: #14532D; }

  /* Phase 2 */
  .phase2-wrap { max-width: 900px; margin: 20px auto 0; background: #fff; color: #1E293B; border-radius: 16px; padding: 28px; }
  .domain-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .domain-btn { padding: 10px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  .domain-btn.selected { background: #3B82F6; border-color: #3B82F6; color: #fff; }
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

const STEPS = ['BCrypt', 'User', '@Bean', 'Config', 'Register', 'Test'];

const DOMAINS = [
  { key: 'Gym', label: '🏋️ Gym' },
  { key: 'Mess', label: '🍱 Mess' },
  { key: 'Hotel', label: '🏨 Hotel' },
  { key: 'Chai', label: '☕ Chai' },
  { key: 'Other', label: '🏪 Other' },
];

const DOMAIN_OWNER_USERNAME = {
  Gym: 'gymowner',
  Mess: 'messowner',
  Hotel: 'hotelowner',
  Chai: 'chaiowner',
  Other: 'owner',
};

const DOMAIN_NOTES = {
  Gym: 'Your users table stores login accounts (gymowner, members who log in). Separate from gym_member table which stores business data. users = who can log in, gym_member = what the business tracks.',
  Mess: 'Your users table stores login accounts (mess owner, staff who log in). Separate from mess_member table which stores business data. users = who can log in, mess_member = what the business tracks.',
  Hotel: 'Your users table stores login accounts (hotel owner, staff who log in). Separate from hotel_room table which stores business data. users = who can log in, hotel_room = what the business tracks.',
  Chai: 'Your users table stores login accounts (chai shop owner, staff who log in). Separate from chai_order table which stores business data. users = who can log in, chai_order = what the business tracks.',
  Other: 'Your users table stores login accounts for whoever manages your app. Separate from your business-data table. users = who can log in, your domain table = what the business tracks.',
};

export default function RegisterBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1);
  const [step, setStep] = useState(1); // 1..6, drives both the rail content and the machine stage

  const railRef = useRef(null);
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) { isFirstStepRender.current = false; return; }
    if (railRef.current) railRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Step 1: BCrypt grinder ──
  const [ground, setGround] = useState(false);
  const [grinding, setGrinding] = useState(false);
  const [reversedTried, setReversedTried] = useState(false);
  const [tfAnswer, setTfAnswer] = useState(null);

  function doGrind() {
    setGrinding(true);
    play('add');
    setTimeout(() => { setGround(true); setGrinding(false); }, 800);
  }
  function regrind() {
    setGround(false);
    setReversedTried(false);
    setGrinding(true);
    play('add');
    setTimeout(() => { setGround(true); setGrinding(false); }, 800);
  }
  function tryReverse() {
    setReversedTried(true);
    play('warn');
  }
  function answerTF(val) {
    if (tfAnswer) return;
    setTfAnswer(val);
    if (val === 'false') play('correct'); else play('warn');
  }
  function buildIt() { play('tick'); setStep(2); }

  // ── Step 2: User entity ──
  const [passwordType, setPasswordType] = useState(null);
  const [step2Done, setStep2Done] = useState(false);
  function answerPasswordType(val) {
    if (passwordType === 'String') return;
    setPasswordType(val);
    if (val === 'String') play('add'); else play('warn');
  }
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  // ── Step 3: @Bean ──
  const [beanAnswer, setBeanAnswer] = useState(null);
  const [beanFlowAnim, setBeanFlowAnim] = useState(false);
  function answerBean(val) {
    if (beanAnswer === '@Bean') return;
    setBeanAnswer(val);
    if (val === '@Bean') { play('correct'); setBeanFlowAnim(true); }
    else play('warn');
  }
  function replayBean() {
    setBeanFlowAnim(false);
    setTimeout(() => setBeanFlowAnim(true), 50);
    play('tick');
  }
  function goToSecurityConfig() { play('tick'); setStep(4); }

  // ── Step 4: SecurityConfig ──
  const [permitAllInput, setPermitAllInput] = useState('');
  const [permitAllCorrect, setPermitAllCorrect] = useState(false);
  const [permitAllWrong, setPermitAllWrong] = useState(false);
  const [configCardIdx, setConfigCardIdx] = useState(0);
  const [step4Done, setStep4Done] = useState(false);

  function submitPermitAll() {
    if (permitAllInput.trim().toLowerCase() === 'permitall') {
      setPermitAllCorrect(true);
      setPermitAllWrong(false);
      play('add');
      setConfigCardIdx(1);
    } else {
      setPermitAllWrong(true);
      play('warn');
    }
  }
  function nextConfigCard() { play('tick'); setConfigCardIdx(i => i + 1); }
  function toggleStep4() {
    if (!step4Done) { play('add'); setTimeout(() => setStep(5), 400); }
    setStep4Done(d => !d);
  }

  // ── Step 5: Register endpoint ──
  const [encodeAnswer, setEncodeAnswer] = useState(null);
  const [step5Done, setStep5Done] = useState(false);
  const [traceKey, setTraceKey] = useState(0);
  function answerEncode(val) {
    if (encodeAnswer === 'encode') return;
    setEncodeAnswer(val);
    if (val === 'encode') play('add'); else play('warn');
  }
  function toggleStep5() {
    if (!step5Done) { play('add'); setTimeout(() => setStep(6), 400); }
    setStep5Done(d => !d);
  }

  // ── Step 6: Test + payoff ──
  const [test1Done, setTest1Done] = useState(false);
  const [test2Done, setTest2Done] = useState(false);
  const [payoffLines, setPayoffLines] = useState(0);
  function toggleTest1() { if (!test1Done) play('add'); setTest1Done(d => !d); }
  const payoffFiredRef = useRef(false);
  function toggleTest2() {
    if (!test2Done) {
      play('correct');
      if (!payoffFiredRef.current) {
        payoffFiredRef.current = true;
        setTimeout(() => play('reveal'), 1000);
        let c = 0;
        const iv = setInterval(() => { c += 1; setPayoffLines(c); if (c >= 8) clearInterval(iv); }, 500);
      }
    }
    setTest2Done(d => !d);
  }

  const phase1Complete = test1Done && test2Done;
  const phase1CompleteFiredRef = useRef(false);
  useEffect(() => {
    if (phase1Complete && !phase1CompleteFiredRef.current) {
      phase1CompleteFiredRef.current = true;
      setTimeout(() => play('correct'), 300);
    }
  }, [phase1Complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (phase1Complete && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let c = 0;
        const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 7) clearInterval(iv); }, 500);
      }, 900);
    }
  }, [phase1Complete]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [domain, setDomain] = useState(null);
  const [files, setFiles] = useState({ user: false, repo: false, config: false, controller: false });
  const [tested, setTested] = useState({ registerWorks: false, hashConfirmed: false });
  const [committed, setCommitted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleFile(key) { setFiles(f => { const nv = !f[key]; if (nv) play('add'); return { ...f, [key]: nv }; }); }
  const bothTestedFiredRef = useRef(false);
  function toggleTested(key) {
    setTested(t => {
      const nv = { ...t, [key]: !t[key] };
      if (nv.registerWorks && nv.hashConfirmed && !bothTestedFiredRef.current) { bothTestedFiredRef.current = true; play('correct'); }
      else if (!t[key]) play('add');
      return nv;
    });
  }
  function toggleCommitted() { if (!committed) play('add'); setCommitted(c => !c); }

  const allFilesCreated = files.user && files.repo && files.config && files.controller;
  const allTested = tested.registerWorks && tested.hashConfirmed;
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = domain && allFilesCreated && allTested && committed && sentences >= 1;

  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t1-s3-register-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { bcryptAnalogy: true, trueOrFalse: tfAnswer },
            slot2: { passwordTypeBlank: passwordType, filesCreated: step2Done },
            slot3: { beanVsAutowired: beanAnswer, beanUnderstanding: beanAnswer === '@Bean' },
            slot4: { permitAllBlank: permitAllInput, configCreated: step4Done },
            slot5: { encodeBlank: encodeAnswer, controllerCreated: step5Done },
            slot6: { registerWorks: test1Done, mysqlShowsHash: test2Done },
          },
          phase2: {
            domainSelected: domain,
            allFilesCreated,
            registerTested: tested.registerWorks,
            hashConfirmed: tested.hashConfirmed,
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
    <div className="rb-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>The BCrypt Lab - Register Endpoint</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      {phase === 1 && (
        <>
          <div className="rail-track">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ color: '#334155' }}>-</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={`rail-dot${step > i + 1 ? ' done' : step === i + 1 ? ' active' : ''}`} />
                  <span className={`rail-lbl${step > i + 1 ? ' done-lbl' : step === i + 1 ? ' active-lbl' : ''}`}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="stage-wrap">
            {/* ── LEFT: thin rail, one step's teaching content ── */}
            <div className="rail-col" ref={railRef}>

              {step === 1 && (
                <>
                  <h2 className="rail-step-title">Never store a plain password.</h2>
                  <p className="rail-prose">Type a password into the grinder on the right and watch what MySQL actually stores.</p>
                  <div className="grinder-btn-row" style={{ flexDirection: 'column' }}>
                    <button className="grinder-action-btn" disabled={ground || grinding} onClick={doGrind}>{ground ? 'Ground ✅' : 'Grind it →'}</button>
                    {ground && <button className="grinder-action-btn danger" onClick={tryReverse}>Try to reverse →</button>}
                    {ground && <button className="grinder-action-btn" onClick={regrind}>↻ watch again</button>}
                  </div>
                  {reversedTried && <div className="reverse-fail-note">powder ⇢ grain <span className="reverse-x">✕</span><br />Cannot reverse. Ever.</div>}

                  {ground && (
                    <>
                      <div className="mini-green" style={{ marginTop: 14 }}>
                        MySQL stores only the powder. If someone breaks in, they find '$2a$10$...' - not 'gym@123'. Your users are safe.
                      </div>
                      <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B' }}>True or false: BCrypt can reverse a hash back to the original password.</p>
                      <div className="rail-tf-row">
                        <button className={`rail-tf-btn${tfAnswer === 'true' ? ' wrong' : ''}`} disabled={!!tfAnswer} onClick={() => answerTF('true')}>TRUE</button>
                        <button className={`rail-tf-btn${tfAnswer === 'false' ? ' correct' : ''}`} disabled={!!tfAnswer} onClick={() => answerTF('false')}>FALSE</button>
                      </div>
                      {tfAnswer === 'true' && <div className="qcheck-note-r wrong">False - BCrypt is one-way. Once ground, cannot un-grind.</div>}
                      {tfAnswer === 'false' && <div className="qcheck-note-r correct">Correct. One-way only. That is what makes it safe.</div>}
                      {tfAnswer === 'false' && <button className="rail-btn" onClick={buildIt}>Build it →</button>}
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="rail-step-title">Step 1 - The User class</h2>
                  <p className="rail-prose">Same @Entity pattern you know from GymMember.</p>
                  <CopyBlock code={`@Entity\n@Table(name = "users")\npublic class User {\n\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n    private String username;\n    private String password;\n}`}>
                    <span className="rc-tag">@Entity</span>{'\n'}<span className="rc-tag">@Table</span>(name = "users"){'\n'}
                    public class User {'{'}{'\n\n'}
                    {'    '}<span className="rc-tag">@Id</span>{'\n'}{'    '}<span className="rc-tag">@GeneratedValue</span>(...){'\n'}
                    {'    '}private Long id;{'\n\n'}
                    {'    '}private String username;{'\n'}
                    {'    '}private {passwordType === 'String' ? <span className="rc-blank-done">String</span> : '[___]'} password;{'\n'}
                    {passwordType === 'String' && <span className="rc-comment">    {'    '}// BCrypt hash - never plain{'\n'}</span>}
                    {'}'}
                  </CopyBlock>

                  {passwordType !== 'String' && (
                    <div className="rail-blank">
                      <div className="rail-blank-q">BCrypt hashes are text. What Java type holds text?</div>
                      <div className="rail-opts">
                        {['String', 'int', 'Long', 'boolean'].map(opt => (
                          <button key={opt} className={`rail-opt-btn${passwordType === opt && opt !== 'String' ? ' wrong' : ''}`} onClick={() => answerPasswordType(opt)}>{opt}</button>
                        ))}
                      </div>
                      {passwordType && passwordType !== 'String' && <div className="rail-feedback wrong">BCrypt hashes are text strings. The type is String.</div>}
                    </div>
                  )}

                  {passwordType === 'String' && (
                    <>
                      <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B' }}>UserRepository - familiar pattern:</p>
                      <CopyBlock code={`public interface UserRepository extends JpaRepository<User, Long> {\n}`}>
                        public interface UserRepository{'\n'}{'    '}extends JpaRepository{'<User, Long>'} {'{'}{'\n'}{'}'}{'\n'}
                        <span className="rc-comment">// same pattern as GymMemberRepository</span>
                      </CopyBlock>
                      <label className={`rail-check${step2Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={step2Done} onChange={toggleStep2} />
                        ✅ User.java + UserRepository.java created
                      </label>
                    </>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="rail-step-title">@Bean - the restaurant that creates what @Autowired delivers</h2>
                  <div className="mini-blue">
                    @Autowired = Zomato delivers the object. But who prepares the food? <b>@Bean is the restaurant.</b><br /><br />
                    <b>@Bean creates. @Autowired delivers.</b>
                  </div>
                  <CopyBlock code={`@Bean\npublic BCryptPasswordEncoder passwordEncoder() {\n    return new BCryptPasswordEncoder();\n}`}>
                    <span className="rc-tag">@Bean</span>{'\n'}
                    public BCryptPasswordEncoder passwordEncoder() {'{'}{'\n'}
                    {'    '}return new BCryptPasswordEncoder();{'\n'}{'}'}
                  </CopyBlock>
                  <p className="rail-prose">Without @Bean → Spring Boot doesn't know this object exists. @Autowired would fail. With @Bean → created once, available everywhere.</p>

                  <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B' }}>Which creates the object?</p>
                  <div className="rail-opts">
                    <button className={`rail-opt-btn${beanAnswer === '@Bean' ? ' correct' : ''}`} disabled={beanAnswer === '@Bean'} onClick={() => answerBean('@Bean')}>@BEAN</button>
                    <button className={`rail-opt-btn${beanAnswer === '@Autowired' ? ' wrong' : ''}`} disabled={beanAnswer === '@Bean'} onClick={() => answerBean('@Autowired')}>@AUTOWIRED</button>
                  </div>
                  {beanAnswer === '@Autowired' && <div className="rail-feedback wrong">@Autowired delivers. @Bean creates. Restaurant cooks → Zomato delivers.</div>}
                  {beanAnswer === '@Bean' && <div className="rail-feedback correct">Correct. @Bean creates. @Autowired delivers. <button className="replay-mini" onClick={replayBean}>↻ replay</button></div>}
                  {beanAnswer === '@Bean' && <button className="rail-btn" onClick={goToSecurityConfig}>Use @Bean in SecurityConfig →</button>}
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="rail-step-title">Step 2 - Open the register door</h2>
                  <div className="mini-analogy">
                    Spring Security locks everything, including /auth/register. Ravi tries to register → 401 ❌<br /><br />
                    Cannot register without logging in. Cannot log in without registering. Fix: open /auth/** to everyone.
                  </div>
                  <CopyBlock code={`@Configuration\npublic class SecurityConfig {\n\n    @Bean\n    public BCryptPasswordEncoder passwordEncoder() {\n        return new BCryptPasswordEncoder();\n    }\n\n    @Bean\n    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n        http\n            .csrf(csrf -> csrf.disable())\n            .authorizeHttpRequests(auth -> auth\n                .requestMatchers("/auth/**").permitAll()\n                .anyRequest().authenticated()\n            );\n        return http.build();\n    }\n}`}>
                    <span className="rc-tag">@Configuration</span>{'\n'}<span className="rc-comment">// settings, read on startup</span>{'\n'}
                    public class SecurityConfig {'{'}{'\n\n'}
                    {'    '}...passwordEncoder() @Bean...{'\n\n'}
                    {'    '}<span className="rc-tag">@Bean</span> filterChain(...) {'{'}{'\n'}
                    {'        '}.csrf(csrf -&gt; csrf.disable()){'\n'}
                    <span className="rc-comment">        {'    '}// not needed for JSON APIs{'\n'}</span>
                    {'        '}.requestMatchers("/auth/**").{permitAllCorrect ? <span className="rc-blank-done">permitAll</span> : '[___]'}(){'\n'}
                    {'        '}.anyRequest().authenticated(){'\n'}{'    '}{'}'}{'\n'}{'}'}
                  </CopyBlock>

                  {!permitAllCorrect && (
                    <div className="rail-blank">
                      <div className="rail-blank-q">/auth/ paths should be open to everyone. Which method allows this? (permit = allow, All = everyone)</div>
                      <div className="rail-input-row">
                        <input className="rail-text-input" placeholder="permitAll" value={permitAllInput} onChange={e => { setPermitAllInput(e.target.value); setPermitAllWrong(false); }} />
                        <button className="rail-submit-btn" onClick={submitPermitAll}>Check</button>
                      </div>
                      {permitAllWrong && <div className="rail-feedback wrong">The method is permitAll() - allows everyone to reach this path.</div>}
                    </div>
                  )}

                  {configCardIdx === 1 && (
                    <div className="mini-blue">
                      <b>csrf().disable()</b> - CSRF protection is for browser forms. Your app sends JSON via Postman - not web forms. Safe to disable here.
                      <button className="rail-btn" onClick={nextConfigCard}>Next →</button>
                    </div>
                  )}
                  {configCardIdx === 2 && (
                    <div className="mini-blue">
                      <code>/auth/**.permitAll()</code> → open to everyone ✅<br /><code>.anyRequest().authenticated()</code> → everything else still locked 🔒
                      <button className="rail-btn" onClick={nextConfigCard}>Next →</button>
                    </div>
                  )}
                  {configCardIdx === 3 && (
                    <div className="mini-blue">
                      <b>SecurityFilterChain</b> is the rulebook for the security guard: "These doors anyone can enter. All other doors - show your card."
                      <button className="rail-btn" onClick={() => { play('tick'); setConfigCardIdx(4); }}>Got it →</button>
                    </div>
                  )}
                  {configCardIdx >= 4 && (
                    <label className={`rail-check${step4Done ? ' checked' : ''}`}>
                      <input type="checkbox" checked={step4Done} onChange={toggleStep4} />
                      ✅ SecurityConfig.java created
                    </label>
                  )}
                </>
              )}

              {step === 5 && (
                <>
                  <h2 className="rail-step-title">Step 3 - The Register endpoint</h2>
                  <div className="mini-blue">
                    @RequestMapping("/auth") on the class → every method gets /auth as a prefix. @PostMapping("/register") → /auth/register.
                  </div>
                  <CopyBlock code={`@RestController\n@RequestMapping("/auth")\npublic class AuthController {\n\n    @Autowired\n    private UserRepository userRepository;\n\n    @Autowired\n    private BCryptPasswordEncoder passwordEncoder;\n\n    @PostMapping("/register")\n    public String register(@RequestBody User user) {\n        String hashed = passwordEncoder.encode(user.getPassword());\n        user.setPassword(hashed);\n        userRepository.save(user);\n        return "Registered: " + user.getUsername();\n    }\n}`}>
                    <span className="rc-tag">@RestController</span>{'\n'}<span className="rc-tag">@RequestMapping</span>("/auth"){'\n'}
                    public class AuthController {'{'}{'\n\n'}
                    {'    '}...userRepository, passwordEncoder @Autowired...{'\n\n'}
                    {'    '}<span className="rc-tag">@PostMapping</span>("/register"){'\n'}
                    {'    '}public String register(...) {'{'}{'\n'}
                    {'        '}String hashed = passwordEncoder.{encodeAnswer === 'encode' ? <span className="rc-blank-done">encode</span> : '[___]'}(user.getPassword());{'\n'}
                    {'        '}user.setPassword(hashed);{'\n'}
                    {'        '}userRepository.save(user);{'\n'}
                    {'        '}return "Registered: " + user.getUsername();{'\n'}
                    {'    '}{'}'}{'\n'}{'}'}
                  </CopyBlock>

                  {encodeAnswer !== 'encode' && (
                    <div className="rail-blank">
                      <div className="rail-blank-q">encode() grinds. matches() compares (login, 3.1.4). Which one grinds before saving?</div>
                      <div className="rail-opts">
                        {['encode', 'matches', 'hash', 'save'].map(opt => (
                          <button key={opt} className={`rail-opt-btn${encodeAnswer === opt && opt !== 'encode' ? ' wrong' : ''}`} onClick={() => answerEncode(opt)}>{opt}</button>
                        ))}
                      </div>
                      {encodeAnswer && encodeAnswer !== 'encode' && <div className="rail-feedback wrong">encode() is the grinder. matches() checks - that's 3.1.4.</div>}
                    </div>
                  )}

                  {encodeAnswer === 'encode' && (
                    <>
                      <button className="replay-mini" onClick={() => { setTraceKey(k => k + 1); play('tick'); }}>↻ replay flow</button>
                      <label className={`rail-check${step5Done ? ' checked' : ''}`} style={{ marginTop: 12 }}>
                        <input type="checkbox" checked={step5Done} onChange={toggleStep5} />
                        ✅ AuthController.java created
                      </label>
                    </>
                  )}
                </>
              )}

              {step === 6 && (
                <>
                  <h2 className="rail-step-title">Test - see BCrypt in MySQL</h2>
                  <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B' }}>Test 1 - Register in Postman:</p>
                  <CopyBlock code={`POST localhost:8080/auth/register\n\n{\n  "username": "gymowner",\n  "password": "gym@123"\n}`}>
                    POST /auth/register{'\n\n'}{'{'}{'\n'}{'  '}"username": "gymowner",{'\n'}{'  '}"password": "gym@123"{'\n'}{'}'}
                  </CopyBlock>
                  <p className="rail-prose">Expected: "Registered: gymowner" - no 401, because /auth/** is now open.</p>
                  <label className={`rail-check${test1Done ? ' checked' : ''}`}>
                    <input type="checkbox" checked={test1Done} onChange={toggleTest1} />
                    ✅ Register returned "Registered: gymowner"
                  </label>

                  {test1Done && (
                    <>
                      <p className="rail-prose" style={{ fontWeight: 700, color: '#1E293B', marginTop: 16 }}>Test 2 - THE PAYOFF (check MySQL):</p>
                      <CopyBlock code={`mysql -u root -p\nUSE gymapp;\nSELECT * FROM users;`}>
                        mysql -u root -p{'\n'}USE gymapp;{'\n'}SELECT * FROM users;
                      </CopyBlock>
                      <label className={`rail-check${test2Done ? ' checked' : ''}`}>
                        <input type="checkbox" checked={test2Done} onChange={toggleTest2} />
                        ✅ MySQL shows hash - not plain password
                      </label>
                    </>
                  )}

                  {revealCount > 0 && (
                    <p className="rail-prose" style={{ marginTop: 14 }}>Scroll down for what you just learned →</p>
                  )}
                </>
              )}
            </div>

            {/* ── RIGHT: the machine, always big, always live ── */}
            <div className="machine-col">
              <div className="machine-stage-label">
                {step === 1 && 'The Grinder - plain password in, hash out'}
                {step === 2 && 'users table structure'}
                {step === 3 && '@Bean creates → @Autowired delivers'}
                {step === 4 && 'Security doors'}
                {step === 5 && 'Register request flow'}
                {step === 6 && 'Live users table'}
              </div>

              {step === 1 && (
                <>
                  <div className="grinder-stage">
                    <div className="g-item">
                      <div className={`grain-big${ground ? ' entered' : ''}`} />
                      <div className="g-lbl">"gym@123"</div>
                    </div>
                    <div className="g-arrow">→</div>
                    <div className="g-item machine-body-wrap">
                      <svg className={`machine-svg machine-glow${grinding ? ' active' : ''}`} width="200" height="200" viewBox="0 0 100 100">
                        <rect x="18" y="18" width="64" height="64" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                        <g className={`gear-spin${grinding ? ' spinning' : ''}`}>
                          <circle cx="50" cy="50" r="18" fill="#334155" />
                          <path d="M50 28 L55 38 L45 38 Z" fill="#64748B" />
                          <path d="M50 72 L55 62 L45 62 Z" fill="#64748B" />
                          <path d="M28 50 L38 45 L38 55 Z" fill="#64748B" />
                          <path d="M72 50 L62 45 L62 55 Z" fill="#64748B" />
                        </g>
                      </svg>
                      <div className="g-lbl">BCrypt</div>
                    </div>
                    <div className="g-arrow">→</div>
                    <div className="g-item">
                      <div className={`powder-big-wrap${ground ? ' shown' : ''}`}>{[...Array(9)].map((_, i) => <span key={i} className="powder-big-dot" style={{ animationDelay: `${i * 0.04}s` }} />)}</div>
                      <div className="g-lbl">{ground ? '$2a$10$xJt8aZ...' : '?'}</div>
                    </div>
                  </div>
                  <LiveUsersTable rows={[]} showEmpty />
                </>
              )}

              {step === 2 && (
                <LiveUsersTable rows={[]} showEmpty structureOnly />
              )}

              {step === 3 && (
                <div className="bean-flow-stage">
                  <div className={`bean-box${beanFlowAnim ? ' glow' : ''}`}><div className="bean-box-icon">🍳</div>Kitchen (@Bean) prepares BCryptPasswordEncoder</div>
                  <div className="bean-arrow">→</div>
                  <div className={`bean-box${beanFlowAnim ? ' glow' : ''}`} style={{ transitionDelay: '0.25s' }}><div className="bean-box-icon">🌱</div>Spring Boot holds it</div>
                  <div className="bean-arrow">→</div>
                  <div className={`bean-box${beanFlowAnim ? ' glow' : ''}`} style={{ transitionDelay: '0.5s' }}><div className="bean-box-icon">🛵</div>Delivery (@Autowired) → AuthController</div>
                </div>
              )}

              {step === 4 && (
                <div className="door-stage">
                  <div className="g-item">
                    <div className={`door-shape-big${permitAllCorrect ? ' opened' : ' flashing'}`} style={{ position: 'relative' }}>
                      {!permitAllCorrect && <span className="attacker-bounce-big">🧑‍💼</span>}
                      {permitAllCorrect ? '🔓' : '🔒'}
                      {permitAllCorrect ? <span className="knock-200-tag">200</span> : <span className="knock-401-tag">401</span>}
                    </div>
                    <div className="door-lbl-big">/auth/**</div>
                    <div className={`door-status-big${permitAllCorrect ? ' open-txt' : ' locked-txt'}`}>{permitAllCorrect ? 'Open to all' : 'Locked'}</div>
                  </div>
                  <div className="g-item">
                    <div className="door-shape-big">🔒</div>
                    <div className="door-lbl-big">/gym/**</div>
                    <div className="door-status-big locked-txt">Requires auth</div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="regflow-stage" key={traceKey}>
                  <div className="regflow-node">📮 Postman</div>
                  <div className="regflow-arrow">→</div>
                  <div className={`regflow-node${encodeAnswer === 'encode' ? ' lit' : ''}`}>⚙️ encode()</div>
                  <div className="regflow-arrow">→</div>
                  <div className={`regflow-node${encodeAnswer === 'encode' ? ' lit' : ''}`}>$2a$10$...</div>
                  <div className="regflow-arrow">→</div>
                  <div className="regflow-node">🗄️ users table</div>
                </div>
              )}

              {step === 6 && (
                <>
                  <LiveUsersTable
                    rows={test1Done ? [{ id: 1, username: 'gymowner', hash: '$2a$10$xJt8aZ...', plain: 'gym@123' }] : []}
                    showEmpty={!test1Done}
                    pulse={test2Done}
                  />
                  {payoffLines > 0 && (
                    <div className="payoff-banner">
                      {['See the password column?', "'$2a$10$...'", "Not 'gym@123'.", 'The BCrypt powder.', 'Irreversible.', 'If someone breaks into MySQL - they find only powder.', "They cannot get back to 'gym@123'.", 'Your users are protected. 🔒'].map((line, i) => (
                        payoffLines >= i + 1 && <div key={line} className="payoff-line" style={{ animationDelay: `${i * 0.05}s`, fontWeight: i === 7 ? 700 : 400 }}>{line}</div>
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
              {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>BCrypt</b> → one-way grinder - plain password in, hash out, cannot reverse</span></div>}
              {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>encode()</b> → grinds plain password → BCrypt hash</span></div>}
              {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>@Bean</b> → creates an object and registers it with Spring Boot</span></div>}
              {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>@Autowired</b> → delivers what @Bean created</span></div>}
              {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>@Configuration</b> → this class has Spring Boot settings</span></div>}
              {revealCount >= 6 && <div className="reveal-line-item">✅ <span><b>permitAll()</b> → this path open to all - no authentication needed</span></div>}
              {revealCount >= 7 && <div className="reveal-line-item">✅ <span><b>@RequestMapping("/auth")</b> → class-level URL prefix - all endpoints start with /auth</span></div>}
              {revealCount >= 7 && (
                <>
                  <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                    Register is working. Passwords are BCrypt protected.<br /><br />
                    @Bean creates the grinder. @Autowired delivers it. SecurityConfig opens the door.<br /><br />
                    Next - Login. matches() checks the password. Users prove who they are.
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
          <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Add Register to YOUR project</h2>

          <div className="domain-row">
            {DOMAINS.map(d => (
              <button key={d.key} className={`domain-btn${domain === d.key ? ' selected' : ''}`} onClick={() => setDomain(d.key)}>{d.label}</button>
            ))}
          </div>

          {domain && <div className="p2-blue">{DOMAIN_NOTES[domain]}</div>}

          {domain && (
            <>
              <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 - Files created</h3>
              {[
                ['user', 'User.java (@Entity, username, password fields, no-arg constructor, getters/setters)'],
                ['repo', 'UserRepository.java (extends JpaRepository<User, Long>)'],
                ['config', 'SecurityConfig.java (@Bean BCryptPasswordEncoder + permitAll for /auth/**)'],
                ['controller', 'AuthController.java (register endpoint with encode())'],
              ].map(([key, label]) => (
                <label key={key} className={`task-item${files[key] ? ' checked' : ''}`}>
                  <input type="checkbox" checked={files[key]} onChange={() => toggleFile(key)} />
                  {label}
                </label>
              ))}

              <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 - Tested</h3>
              <label className={`task-item${tested.registerWorks ? ' checked' : ''}`}>
                <input type="checkbox" checked={tested.registerWorks} onChange={() => toggleTested('registerWorks')} />
                POST /auth/register works - got "Registered: [username]"
              </label>
              <label className={`task-item${tested.hashConfirmed ? ' checked' : ''}`}>
                <input type="checkbox" checked={tested.hashConfirmed} onChange={() => toggleTested('hashConfirmed')} />
                MySQL shows $2a$10$ hash - not plain password
              </label>

              {(tested.registerWorks || tested.hashConfirmed) && (
                <LiveUsersTable
                  rows={tested.hashConfirmed ? [{ id: 1, username: DOMAIN_OWNER_USERNAME[domain], hash: '$2a$10$xJt8aZ...', plain: `${domain.toLowerCase()}@123` }] : []}
                  showEmpty={!tested.hashConfirmed}
                  pulse={tested.hashConfirmed}
                />
              )}

              <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 - Commit</h3>
              <CopyBlock code={`git add .\ngit commit -m "add User entity, SecurityConfig, and Register endpoint with BCrypt"\ngit push origin main`} cls="p2-code" btnCls="p2-copy">
                git add .{'\n'}git commit -m "add User entity, SecurityConfig,{'\n'}{'  '}and Register endpoint with BCrypt"{'\n'}git push origin main
              </CopyBlock>
              <label className={`task-item${committed ? ' checked' : ''}`}>
                <input type="checkbox" checked={committed} onChange={toggleCommitted} />
                ✅ Committed and pushed
              </label>

              {allFilesCreated && allTested && committed && (
                <>
                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                    In one sentence - explain the difference between @Bean and @Autowired.
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="@Bean creates the object and registers it with Spring Boot (like a restaurant preparing food), while @Autowired delivers that object to wherever it is needed (like Zomato delivering it)..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                  <button className="btn green" style={{ width: '100%', marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Submitted ✅' : 'Register working - build Login next →'}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                      <b>Register complete. 🔒</b><br /><br />
                      {['User entity - users table in MySQL', 'BCrypt - passwords hashed', '@Bean created the grinder', '@Autowired delivered it', 'SecurityConfig - /auth/** open', 'Register endpoint working'].map((line, i) => (
                        <div key={line} style={{ animation: 'fadeInUp 0.4s ease backwards', animationDelay: `${i * 0.15}s` }}>
                          <span className="check-pop" style={{ animationDelay: `${i * 0.15}s` }}>✅</span> {line}
                        </div>
                      ))}
                      <br />
                      Next - 3.1.4.<br />
                      The Login endpoint. matches() checks the password. User proves who they are.
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LiveUsersTable({ rows, showEmpty, structureOnly, pulse }) {
  return (
    <div className="live-table-wrap">
      <div className="live-table-head">
        <span className="live-table-title">users table</span>
        <span className={`live-table-badge ${pulse ? 'protected-b' : 'waiting'}`}>{pulse ? 'Protected ✅' : 'live'}</span>
      </div>
      <table className="live-mysql">
        <thead><tr><th>id</th><th>username</th><th>password</th></tr></thead>
        <tbody>
          {structureOnly && (
            <tr><td>-</td><td>-</td><td style={{ color: '#475569', fontStyle: 'italic' }}>(BCrypt hash)</td></tr>
          )}
          {showEmpty && !structureOnly && (
            <tr className="live-empty-row"><td colSpan="3">(waiting for data)</td></tr>
          )}
          {rows.map(r => (
            <tr key={r.id} className="row-fly-in">
              <td>{r.id}</td>
              <td>{r.username}</td>
              <td className={pulse ? 'pw-cell-hash pulse' : 'pw-cell-hash'}>
                {r.hash}
                {pulse && <span className="plain-crossed">{r.plain}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
