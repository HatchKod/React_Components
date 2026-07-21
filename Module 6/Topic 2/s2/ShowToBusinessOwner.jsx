import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .sb-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #FAF9F7; min-height: 100vh; padding: 24px 16px 60px; color: #292524; line-height: 1.5; }
  .sb-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1240px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #57534E; border: 1.5px solid #E7E5E4; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #A8A29E; }

  .milestone-banner { max-width: 1240px; margin: 0 auto 24px; text-align: center; padding: 6px; }
  .milestone-banner .eyebrow { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #B45309; }

  .section-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1240px; margin: 0 auto 24px; flex-wrap: wrap; }
  .s-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; background: #F1F0EE; color: #A8A29E; }
  .s-pill.done { background: rgba(180,83,9,0.12); color: #B45309; }
  .s-pill.active { background: #B45309; color: #fff; }
  .s-line { width: 14px; height: 2px; background: #E7E5E4; }
  .s-line.done { background: #B45309; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1240px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .viva-card { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); border: 1.5px solid #FDE68A; border-radius: 12px; padding: 20px 22px; margin: 14px 0; color: #78350F; font-size: 0.92rem; line-height: 1.9; }
  .viva-card b { color: #92400E; }

  .prep-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; padding: 14px; border-radius: 10px; background: #FAFAF9; border: 1.5px solid #F1F0EE; cursor: pointer; transition: all 0.2s; }
  .prep-item.checked { background: #FFFBEB; border-color: #FDE68A; }
  .prep-item > input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
  .prep-item-title { font-weight: 700; font-size: 0.88rem; color: #292524; }
  .prep-item-note { font-size: 0.78rem; color: #78716C; font-style: italic; margin-top: 3px; }
  .prep-item-input { width: 100%; margin-top: 8px; border: 1.5px solid #E7E5E4; border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; font-family: inherit; }
  .prep-item-input:focus { border-color: #B45309; outline: none; }

  .script-toggle { background: #F5F5F4; border: 1.5px solid #E7E5E4; border-radius: 10px; padding: 12px 16px; margin-top: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 0.85rem; color: #44403C; }
  .script-body { background: #1C1917; color: #E7E5E4; border-radius: 10px; padding: 18px 20px; margin-top: 8px; font-size: 0.85rem; line-height: 2; font-style: italic; white-space: pre-wrap; }
  .script-body .show-cue { color: #FBBF24; font-style: normal; font-weight: 700; }
  .script-time { text-align: right; font-size: 0.75rem; color: #78716C; margin-top: 10px; font-weight: 700; font-style: normal; }

  .rule-nav { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .rule-tab { padding: 8px 14px; border-radius: 20px; border: 1.5px solid #E7E5E4; background: #fff; font-weight: 700; font-size: 0.78rem; cursor: pointer; color: #78716C; }
  .rule-tab.active { border-color: #B45309; color: #B45309; background: #FFFBEB; }
  .rule-tab.seen::after { content: ' ✓'; }

  .rule-card { border-radius: 14px; padding: 22px 24px; animation: flipIn 0.4s ease; position: relative; overflow: hidden; }
  @keyframes flipIn { from { opacity: 0; transform: rotateY(-8deg) translateX(12px); } to { opacity: 1; transform: rotateY(0) translateX(0); } }
  .rule-card.rule1 { background: #F0FDF4; border: 2px solid #86EFAC; }
  .rule-card.rule2 { background: #EFF6FF; border: 2px solid #BFDBFE; }
  .rule-card.rule3 { background: #FEF3C7; border: 2px solid #FCD34D; }
  .rule-card.rule4 { background: #F5F3FF; border: 2px solid #DDD6FE; }
  .rule-card.critical { box-shadow: 0 0 0 4px rgba(180,83,9,0.15); }
  .rule-badge { display: inline-block; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; background: rgba(0,0,0,0.08); margin-bottom: 10px; }
  .rule-badge.critical-badge { background: #B45309; color: #fff; }
  .rule-title { font-size: 1.1rem; font-weight: 800; margin: 0 0 10px; }
  .rule-text { font-size: 0.9rem; line-height: 1.8; white-space: pre-wrap; }
  .rule-text b { font-weight: 800; }
  .rule-nav-btns { display: flex; justify-content: space-between; margin-top: 16px; }
  .rule-nav-btn { background: #fff; border: 1.5px solid #E7E5E4; border-radius: 8px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .rule-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .notebook-label { font-weight: 700; font-size: 0.85rem; margin: 16px 0 6px; color: #292524; }
  .notebook-textarea { width: 100%; border: 1.5px solid #E7E5E4; border-radius: 10px; padding: 12px 14px; font-size: 0.88rem; font-family: inherit; resize: vertical; min-height: 72px; outline: none; }
  .notebook-textarea:focus { border-color: #B45309; }
  .single-input { width: 100%; border: 1.5px solid #E7E5E4; border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; outline: none; }
  .single-input:focus { border-color: #B45309; }

  .reaction-block { margin-top: 20px; padding: 16px; background: #FAFAF9; border-radius: 10px; text-align: center; }
  .reaction-emoji { font-size: 2.6rem; display: inline-block; animation: reactionPop 0.3s cubic-bezier(.34,1.56,.64,1); }
  @keyframes reactionPop { 0% { transform: scale(0.4) rotate(-8deg); opacity: 0; } 60% { transform: scale(1.15) rotate(4deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  .reaction-slider { width: 100%; margin-top: 12px; accent-color: #B45309; }
  .reaction-caption { font-size: 0.85rem; font-weight: 700; color: #57534E; margin-top: 6px; transition: color 0.2s; }

  .whatsapp-bubble { background: #DCF8C6; border-radius: 12px 12px 4px 12px; padding: 16px 18px; margin-top: 12px; font-size: 0.86rem; line-height: 1.7; color: #1B2E1B; position: relative; }
  .whatsapp-wrap { background: #E5DDD5; border-radius: 14px; padding: 16px; margin-top: 10px; }
  .whatsapp-editable { width: 100%; background: #DCF8C6; border: none; border-radius: 12px 12px 4px 12px; padding: 16px 18px; font-size: 0.86rem; line-height: 1.7; color: #1B2E1B; font-family: inherit; resize: vertical; min-height: 120px; outline: none; }
  .whatsapp-copy-btn { margin-top: 10px; background: #25D366; color: #fff; border: none; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.8rem; cursor: pointer; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #FFFBEB; color: #92400E; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .gate-card { background: linear-gradient(135deg, #FFFBEB, #FFF); border: 1.5px solid #FDE68A; border-radius: 14px; padding: 20px 22px; margin-top: 18px; }
  .gate-title { font-weight: 800; font-size: 1rem; color: #92400E; margin: 0 0 12px; }
  .gate-item { display: flex; align-items: center; gap: 10px; padding: 8px 4px; font-size: 0.85rem; }
  .gate-item.gate-done { color: #92400E; font-weight: 700; }
  .gate-item.gate-current { color: #B45309; font-weight: 800; background: rgba(180,83,9,0.08); border-radius: 6px; }
  .gate-item.gate-pending { color: #A8A29E; }
  .gate-progress-note { text-align: center; margin-top: 12px; font-weight: 800; color: #B45309; font-size: 0.88rem; }

  .reflection-box { width: 100%; border: 1.5px solid #E7E5E4; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 110px; outline: none; }
  .reflection-box:focus { border-color: #B45309; }
  .word-count { text-align: right; font-size: 0.8rem; color: #A8A29E; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }
  .blank-feedback-warn { font-size: 0.8rem; color: #B91C1C; background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 8px; padding: 10px 12px; margin-top: 14px; }

  .btn { background: #B45309; color: #fff; border: none; border-radius: 8px; padding: 13px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .btn:disabled { background: #D6D3D1; cursor: not-allowed; }

  .completion-card { margin-top: 18px; padding: 22px; background: linear-gradient(135deg, #FFFBEB, #F0FDF4); border-radius: 12px; border: 1.5px solid #FDE68A; }
  .completion-line { font-size: 0.94rem; color: #292524; line-height: 1.9; opacity: 0; animation: fadeInUp 0.4s ease forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 460px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px; text-align: center; }

  .scene-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .scene-table { position: relative; width: 100%; max-width: 300px; height: 150px; }
  .scene-person { position: absolute; bottom: 0; width: 64px; text-align: center; font-size: 2.4rem; transition: all 0.4s; }
  .scene-person.ravi { left: 4px; }
  .scene-person.owner { right: 4px; }
  .scene-person-label { font-size: 0.62rem; font-weight: 700; color: #78716C; margin-top: 2px; }
  .scene-person.engaged { transform: scale(1.12); }
  .scene-owner-mood { font-size: 2.4rem; transition: all 0.4s; }
  .scene-table-surface { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 150px; height: 60px; background: #E7E5E4; border-radius: 50%; }
  .scene-phone { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 34px; height: 58px; background: #1C1917; border-radius: 6px; border: 2px solid #44403C; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.4s; }
  .scene-phone.glow { box-shadow: 0 0 0 6px rgba(180,83,9,0.18), 0 4px 10px rgba(0,0,0,0.2); }
  .scene-phone-screen { width: 26px; height: 48px; background: linear-gradient(135deg,#F0FDFA,#fff); border-radius: 3px; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; }

  .scene-timeline { display: flex; align-items: center; gap: 6px; width: 100%; max-width: 300px; }
  .scene-tl-step { flex: 1; text-align: center; padding: 8px 4px; border-radius: 8px; background: #F5F5F4; font-size: 0.66rem; font-weight: 700; color: #A8A29E; transition: all 0.3s; }
  .scene-tl-step.tl-active { background: #FFFBEB; color: #B45309; border: 1.5px solid #FDE68A; }
  .scene-tl-step.tl-done { background: #FEF3C7; color: #92400E; }
  .scene-tl-arrow { color: #D6D3D1; font-size: 0.75rem; }

  .demo-order-stage { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .demo-order-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; background: #FAFAF9; border: 1.5px solid #F1F0EE; font-size: 0.8rem; font-weight: 700; color: #78716C; }
  .demo-order-item.last-item { background: linear-gradient(90deg, #F5F3FF, #FFFBEB); border: 1.5px solid #DDD6FE; color: #6D28D9; font-weight: 800; }
  .demo-order-num { font-size: 1.1rem; }

  .notebook-visual { background: #FFFEF7; border: 1.5px solid #E7E5E4; border-radius: 8px; padding: 18px; box-shadow: 2px 3px 8px rgba(0,0,0,0.06); width: 100%; background-image: repeating-linear-gradient(#FFFEF7 0px, #FFFEF7 27px, #E7E5E4 28px); }
  .notebook-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
  .notebook-tab { font-size: 0.66rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; background: #F1F0EE; color: #A8A29E; }
  .notebook-tab.filled { background: #FEF3C7; color: #92400E; }
  .notebook-line { font-size: 0.72rem; color: #57534E; min-height: 28px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .notebook-line-empty { color: #D6D3D1; font-style: italic; }

  .gate-stage-bolt-row { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
  .gate-stage-bolt { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; background: #F1F0EE; color: #A8A29E; transition: all 0.3s; }
  .gate-stage-bolt.gold { background: linear-gradient(135deg, #FDE68A, #F59E0B); color: #78350F; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }
  .gate-stage-bolt.current-pulse { animation: boltPulse 1.4s ease infinite; }
  @keyframes boltPulse { 0%,100% { box-shadow: 0 0 0 3px rgba(245,158,11,0.2); } 50% { box-shadow: 0 0 0 7px rgba(245,158,11,0.35); } }
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

const RULES = [
  { key: 'rule1', cls: 'rule1', badge: 'Rule 1', critical: true, title: 'Let them try', text: "After showing once — hand them the phone.\nSay: 'You try it.'\n\n" + "Watch. Do not help.\nDo not point.\n\n" + "Where they hesitate = what needs to improve." },
  { key: 'rule2', cls: 'rule2', badge: 'Rule 2', critical: false, title: 'Do not defend', text: "If they say something does not work well:\n\n" + "Say: 'Thank you. I will improve that.'\n\n" + "Do not explain why you built it that way.\nThey care about what it does for them." },
  { key: 'rule3', cls: 'rule3', badge: 'Rule 3', critical: false, title: 'Ask one question', text: "'Is there one thing this app would need to make it something you would actually use every day?'\n\n" + "Write down the answer.\nExactly as they say it.\nThis is gold." },
  { key: 'rule4', cls: 'rule4', badge: 'Rule 4', critical: true, title: 'Show AI last', text: "Build to the wow moment.\n\n" + "Show basic features first.\nSave the AI suggestion for the last thing you show.\n\n" + "Let them be surprised." },
];

const REACTION_EMOJI = ['😐', '🙂', '😊', '😄', '🤩'];
const REACTION_LABEL = ['Neutral', 'Mild interest', 'Pleased', 'Delighted', 'Amazed'];

export default function ShowToBusinessOwner() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(m => !m); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1); // milestone stays phase 1; sections act as sub-progress
  const [section, setSection] = useState(1); // 1 before, 2 during, 3 after

  const railRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (railRef.current) railRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [section]);

  // ── SECTION 1: Preparation ──
  const [prep, setPrep] = useState({ fullFlowTested: false, demoOrderPrepared: false, screenshotsReady: false, notebookReady: false });
  const [oneSentence, setOneSentence] = useState('');
  const [scriptOpen, setScriptOpen] = useState(false);
  const prepFiredRef = useRef(false);

  function togglePrep(key) {
    setPrep(p => {
      const nv = { ...p, [key]: !p[key] };
      if (nv[key]) play('add'); else play('tick');
      return nv;
    });
  }

  const oneSentenceReady = oneSentence.trim().length >= 8;
  const allPrepDone = prep.fullFlowTested && prep.demoOrderPrepared && prep.screenshotsReady && prep.notebookReady && oneSentenceReady;

  useEffect(() => {
    if (allPrepDone && !prepFiredRef.current) { prepFiredRef.current = true; play('correct'); }
  }, [allPrepDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToDuring() { play('tick'); setSection(2); }

  // ── SECTION 2: During — four rules, one at a time ──
  const [ruleIdx, setRuleIdx] = useState(0);
  const [seenRules, setSeenRules] = useState({ rule1: true });
  function nextRule() {
    play('tick');
    setRuleIdx(i => {
      const next = Math.min(i + 1, RULES.length - 1);
      setSeenRules(s => ({ ...s, [RULES[next].key]: true }));
      return next;
    });
  }
  function prevRule() { play('tick'); setRuleIdx(i => Math.max(i - 1, 0)); }
  const allRulesSeen = RULES.every(r => seenRules[r.key]);

  function goToAfter() { play('tick'); setSection(3); }

  // ── SECTION 3: After ──
  const [liked, setLiked] = useState('');
  const [confused, setConfused] = useState('');
  const [askedFor, setAskedFor] = useState('');
  const [oneThing, setOneThing] = useState('');
  const [reactionScore, setReactionScore] = useState(3);
  const lastReactionSound = useRef(3);

  function handleReactionChange(v) {
    const val = Number(v);
    setReactionScore(val);
    if (val !== lastReactionSound.current) {
      lastReactionSound.current = val;
      if (val <= 2) play('warn');
      else if (val >= 4) play('correct');
      else play('tick');
    }
  }

  const [thankYouMsg, setThankYouMsg] = useState(
    "Thank you for your time today.\nShowing you what I built was the most important part of this program.\nYour feedback means a lot.\nI will keep improving the app."
  );
  const [copied, setCopied] = useState(false);
  function copyThankYou() {
    try { navigator.clipboard.writeText(thankYouMsg); } catch (e) {}
    setCopied(true); play('tick');
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    if (askedFor.trim().length > 3) {
      setThankYouMsg(prev => {
        const base = "Thank you for your time today.\nShowing you what I built was the most important part of this program.\n";
        return base + `Your feedback on ${askedFor.trim()} means a lot.\nI will keep improving the app.`;
      });
    }
  }, [askedFor]);

  const [meeting, setMeeting] = useState({ meetingHappened: false, ownerSawLiveUrl: false, ownerUsedApp: false, feedbackWritten: false });
  const meetingFiredRef = useRef(false);
  function toggleMeeting(key) {
    setMeeting(m => {
      const nv = { ...m, [key]: !m[key] };
      if (nv[key]) play('add'); else play('tick');
      return nv;
    });
  }
  const allMeetingDone = meeting.meetingHappened && meeting.ownerSawLiveUrl && meeting.ownerUsedApp && meeting.feedbackWritten;

  useEffect(() => {
    if (allMeetingDone && !meetingFiredRef.current) {
      meetingFiredRef.current = true;
      play('correct');
      setTimeout(() => play('reveal'), 300);
    }
  }, [allMeetingDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const feedbackWrittenReal = liked.trim().length >= 4 && confused.trim().length >= 4 && askedFor.trim().length >= 4 && oneThing.trim().length >= 2;

  const [reflection, setReflection] = useState('');
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;

  const [submitted, setSubmitted] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  const canSubmit = allPrepDone && allMeetingDone && feedbackWrittenReal && sentences >= 2;

  function handleSubmit() {
    if (!canSubmit) return;
    play('submit');
    setSubmitted(true);
    let c = 0;
    const iv = setInterval(() => { c += 1; setRevealCount(c); if (c >= 8) clearInterval(iv); }, 420);
  }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t2-s2-show-to-business-owner',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            preparation: {
              fullFlowTested: prep.fullFlowTested,
              demoOrderPrepared: prep.demoOrderPrepared,
              screenshotsReady: prep.screenshotsReady,
              notebookReady: prep.notebookReady,
              oneSentenceReady: oneSentence,
            },
            meeting: {
              meetingHappened: meeting.meetingHappened,
              ownerSawLiveUrl: meeting.ownerSawLiveUrl,
              ownerUsedApp: meeting.ownerUsedApp,
              feedbackWritten: meeting.feedbackWritten,
            },
            feedback: {
              liked, confused, askedFor, oneThing,
              reactionScore,
            },
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sb-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Show the Live App to Your Business Owner</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      <div className="milestone-banner">
        <div className="eyebrow">Milestone · No new code</div>
      </div>

      <div className="section-strip">
        <div className={`s-pill${section > 1 ? ' done' : section === 1 ? ' active' : ''}`}>Before</div>
        <div className={`s-line${section > 1 ? ' done' : ''}`} />
        <div className={`s-pill${section > 2 ? ' done' : section === 2 ? ' active' : ''}`}>During</div>
        <div className={`s-line${section > 2 ? ' done' : ''}`} />
        <div className={`s-pill${section === 3 ? ' active' : ''}`}>After</div>
      </div>

      <div className="layout">
        <div className="left-col" ref={railRef}>

          {section === 1 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800 }}>Prepare — five things before you walk in</h2>

              <div className="viva-card">
                A viva exam is not about what you wrote on paper.<br />
                It is about whether you understood what you wrote.<br /><br />
                <b>This meeting is your viva.</b><br /><br />
                The code is your preparation.<br />
                The meeting is the exam.<br />
                The owner's reaction is your grade.
              </div>

              <div className={`prep-item${prep.fullFlowTested ? ' checked' : ''}`} onClick={() => togglePrep('fullFlowTested')}>
                <input type="checkbox" checked={prep.fullFlowTested} readOnly />
                <div>
                  <div className="prep-item-title">Tested full flow on live URL (login, add, edit, AI feature)</div>
                  <div className="prep-item-note">No surprises during the demo.</div>
                </div>
              </div>

              <div className={`prep-item${prep.demoOrderPrepared ? ' checked' : ''}`} onClick={() => togglePrep('demoOrderPrepared')}>
                <input type="checkbox" checked={prep.demoOrderPrepared} readOnly />
                <div>
                  <div className="prep-item-title">Prepared demo order: Members list → Add member → Detail → AI feature (save this last)</div>
                  <div className="prep-item-note">Tell the story. Problem first.</div>
                </div>
              </div>

              <div className={`prep-item${prep.screenshotsReady ? ' checked' : ''}`} onClick={() => togglePrep('screenshotsReady')}>
                <input type="checkbox" checked={prep.screenshotsReady} readOnly />
                <div>
                  <div className="prep-item-title">Screenshots ready as backup</div>
                  <div className="prep-item-note">If internet fails — you still have something to show.</div>
                </div>
              </div>

              <div className={`prep-item${prep.notebookReady ? ' checked' : ''}`} onClick={() => togglePrep('notebookReady')}>
                <input type="checkbox" checked={prep.notebookReady} readOnly />
                <div>
                  <div className="prep-item-title">Notebook or notes app ready</div>
                  <div className="prep-item-note">Write down everything the owner says.</div>
                </div>
              </div>

              <div className={`prep-item${oneSentenceReady ? ' checked' : ''}`} style={{ cursor: 'default' }}>
                <input type="checkbox" checked={oneSentenceReady} readOnly />
                <div style={{ width: '100%' }}>
                  <div className="prep-item-title">One-sentence app description ready</div>
                  <input
                    className="prep-item-input"
                    placeholder="My app is a gym management app that lets you manage all your members from your phone."
                    value={oneSentence}
                    onChange={e => setOneSentence(e.target.value)}
                  />
                </div>
              </div>

              <div className="script-toggle" onClick={() => { setScriptOpen(o => !o); play('tick'); }}>
                <span>📜 Demo script — practice this</span>
                <span>{scriptOpen ? '▲' : '▼'}</span>
              </div>
              {scriptOpen && (
                <div className="script-body">
                  "Before this app — you had to <span className="show-cue">[what they did manually]</span>. It took time and things could get lost.{'\n\n'}
                  Now — open this link on your phone. <span className="show-cue">[show members list]</span> All your members are here.{'\n\n'}
                  You can add a new member. <span className="show-cue">[show add form]</span>{'\n\n'}
                  Click any member to see their details. <span className="show-cue">[show detail screen]</span>{'\n\n'}
                  And this is the special part — <span className="show-cue">[show AI feature]</span> The app can suggest a personalised workout for each member.{'\n\n'}
                  All from your phone. Anywhere. Free."
                  <div className="script-time">⏱ Under 3 minutes</div>
                </div>
              )}

              <button className="btn" style={{ opacity: allPrepDone ? 1 : 0.5 }} disabled={!allPrepDone} onClick={goToDuring}>
                {allPrepDone ? "Ready — walk into the meeting →" : 'Complete all 5 items to continue'}
              </button>
            </div>
          )}

          {section === 2 && (
            <div className="card">
              <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>During — four rules</h2>
              <p style={{ fontSize: '0.85rem', color: '#78716C', margin: '0 0 16px' }}>Read each rule before you open the app.</p>

              <div className="rule-nav">
                {RULES.map((r, i) => (
                  <div key={r.key} className={`rule-tab${i === ruleIdx ? ' active' : ''}${seenRules[r.key] ? ' seen' : ''}`}>{r.badge}</div>
                ))}
              </div>

              <div className={`rule-card ${RULES[ruleIdx].cls}${RULES[ruleIdx].critical ? ' critical' : ''}`} key={RULES[ruleIdx].key}>
                <span className={`rule-badge${RULES[ruleIdx].critical ? ' critical-badge' : ''}`}>
                  {RULES[ruleIdx].critical ? '⭐ Most important — ' : ''}{RULES[ruleIdx].badge}
                </span>
                <div className="rule-title">{RULES[ruleIdx].title}</div>
                <div className="rule-text">{RULES[ruleIdx].text}</div>
              </div>

              <div className="rule-nav-btns">
                <button className="rule-nav-btn" onClick={prevRule} disabled={ruleIdx === 0}>← Previous</button>
                {ruleIdx < RULES.length - 1
                  ? <button className="rule-nav-btn" onClick={nextRule}>Next rule →</button>
                  : <span />}
              </div>

              <button className="btn" style={{ opacity: allRulesSeen ? 1 : 0.5, marginTop: 20 }} disabled={!allRulesSeen} onClick={goToAfter}>
                {allRulesSeen ? 'Meeting done — capture what happened →' : 'Read all 4 rules to continue'}
              </button>
            </div>
          )}

          {section === 3 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800 }}>After — capture everything</h2>
              <p style={{ fontSize: '0.85rem', color: '#78716C' }}>Write down what happened:</p>

              <div className="notebook-label">What they liked</div>
              <textarea className="notebook-textarea" placeholder="They liked..." value={liked} onChange={e => setLiked(e.target.value)} />

              <div className="notebook-label">What confused them</div>
              <textarea className="notebook-textarea" placeholder="They were confused by..." value={confused} onChange={e => setConfused(e.target.value)} />

              <div className="notebook-label">What they asked for</div>
              <textarea className="notebook-textarea" placeholder="They asked if we could add..." value={askedFor} onChange={e => setAskedFor(e.target.value)} />

              <div className="notebook-label">Their one thing</div>
              <input className="single-input" placeholder="The one thing they said..." value={oneThing} onChange={e => setOneThing(e.target.value)} />

              <div className="reaction-block">
                <div className="reaction-emoji" key={reactionScore}>{REACTION_EMOJI[reactionScore - 1]}</div>
                <input type="range" min="1" max="5" step="1" className="reaction-slider" value={reactionScore} onChange={e => handleReactionChange(e.target.value)} />
                <div className="reaction-caption">Their reaction: {REACTION_LABEL[reactionScore - 1]}</div>
              </div>

              <div className="notebook-label" style={{ marginTop: 22 }}>Send this after the meeting</div>
              <div className="whatsapp-wrap">
                <textarea className="whatsapp-editable" value={thankYouMsg} onChange={e => setThankYouMsg(e.target.value)} />
                <button className="whatsapp-copy-btn" onClick={copyThankYou}>{copied ? '✓ Copied' : '📋 Copy — send to owner'}</button>
              </div>

              <h3 style={{ fontSize: '1rem', margin: '22px 0 4px' }}>Meeting completion</h3>
              {[
                ['meetingHappened', 'Meeting happened'],
                ['ownerSawLiveUrl', 'Owner saw the live URL'],
                ['ownerUsedApp', 'Owner used the app (even briefly)'],
                ['feedbackWritten', 'Feedback written down'],
              ].map(([key, label]) => (
                <div key={key} className={`checkbox-row${meeting[key] ? ' checked' : ''}`} onClick={() => toggleMeeting(key)}>
                  <input type="checkbox" checked={meeting[key]} readOnly />
                  {label}
                </div>
              ))}

              {allMeetingDone && (
                <div className="gate-card">
                  <div className="gate-title">🔒 Deploy v3 gate</div>
                  <div className="gate-item gate-done">✅ Live URL accessible</div>
                  <div className="gate-item gate-done">✅ AI feature working live</div>
                  <div className="gate-item gate-current">✅ Business owner saw live app ← this</div>
                  <div className="gate-item gate-pending">⬜ Demo video recorded (5.2.4)</div>
                  <div className="gate-item gate-pending">⬜ README complete (5.2.3)</div>
                  <div className="gate-item gate-pending">⬜ GitHub clean commits</div>
                  <div className="gate-item gate-pending">⬜ Mentor review done</div>
                  <div className="gate-progress-note">Gate item 3 complete ✅ — three more to go</div>
                </div>
              )}

              {allMeetingDone && (
                <>
                  <h3 style={{ fontSize: '1rem', margin: '22px 0 6px' }}>Reflection</h3>
                  <p style={{ color: '#78716C', fontSize: '0.88rem', margin: '0 0 8px' }}>
                    In 2 sentences — what was the owner's reaction and what is the one thing you will improve based on their feedback?
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="The owner's reaction was [reaction] — they were [impressed/curious/engaged] especially by the AI feature. Based on their feedback I will improve [specific thing] because they said [what they said]..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 2 ? ' ok' : ''}`}>{sentences} / 2 sentences minimum</div>

                  {!feedbackWrittenReal && (
                    <div className="blank-feedback-warn">Fill in all four notebook fields above (What they liked / What confused them / What they asked for / Their one thing) before you can submit.</div>
                  )}

                  <button className="btn" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Submitted ✅' : 'Owner has seen the app — write README next →'}
                  </button>

                  {revealCount > 0 && (
                    <div className="completion-card">
                      {revealCount >= 1 && <div className="completion-line">🤝 <b>The meeting happened.</b></div>}
                      {revealCount >= 2 && <div className="completion-line" style={{ animationDelay: '0.1s' }}>The owner saw what you built.</div>}
                      {revealCount >= 3 && <div className="completion-line" style={{ animationDelay: '0.2s' }}>Whatever their reaction — positive or constructive — you did something most developers never do.</div>}
                      {revealCount >= 4 && <div className="completion-line" style={{ animationDelay: '0.3s' }}>You built something real for a real person.</div>}
                      {revealCount >= 5 && <div className="completion-line" style={{ animationDelay: '0.4s' }}>You showed it to them. You got real feedback.</div>}
                      {revealCount >= 6 && <div className="completion-line" style={{ animationDelay: '0.5s', fontWeight: 700 }}>That is what professional developers do.</div>}
                      {revealCount >= 7 && <div className="completion-line" style={{ animationDelay: '0.6s', fontWeight: 800 }}>That is what you did.</div>}
                      {revealCount >= 8 && <div className="completion-line" style={{ animationDelay: '0.7s', marginTop: 10 }}>Next — 5.2.3. Write your README. Tell your story.</div>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT STAGE */}
        <div className="right-col">
          <div className="sticky-panel">
            <StagePanel
              section={section}
              ruleIdx={section === 2 ? ruleIdx : -1}
              reactionScore={reactionScore}
              liked={liked} confused={confused} oneThing={oneThing}
              meeting={meeting} allMeetingDone={allMeetingDone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StagePanel({ section, ruleIdx, reactionScore, liked, confused, oneThing, meeting, allMeetingDone }) {
  const ownerMood = section === 1 ? '🙂' : section === 2 ? (ruleIdx >= 3 ? '🤩' : ruleIdx >= 0 ? '😊' : '🙂') : REACTION_EMOJI[reactionScore - 1];
  const phoneGlow = section === 2 && ruleIdx >= 3;

  return (
    <div className="stage-card">
      <div className="stage-label">
        {section === 1 && 'Before you walk in'}
        {section === 2 && 'Demo order — build to the wow moment'}
        {section === 3 && 'Feedback notebook + deploy gate'}
      </div>

      {(section === 1 || section === 2) && (
        <div className="scene-wrap">
          <div className="scene-table">
            <div className="scene-table-surface" />
            <div className={`scene-phone${phoneGlow ? ' glow' : ''}`}>
              <div className="scene-phone-screen">{section === 2 && ruleIdx >= 3 ? '✨' : '📱'}</div>
            </div>
            <div className="scene-person ravi">
              <div>🧑‍💻</div>
              <div className="scene-person-label">Ravi</div>
            </div>
            <div className={`scene-person owner${section === 2 && ruleIdx >= 1 ? ' engaged' : ''}`}>
              <div className="scene-owner-mood">{ownerMood}</div>
              <div className="scene-person-label">Owner</div>
            </div>
          </div>

          <div className="scene-timeline">
            <div className={`scene-tl-step${section === 1 ? ' tl-active' : ' tl-done'}`}>Before</div>
            <div className="scene-tl-arrow">→</div>
            <div className={`scene-tl-step${section === 2 ? ' tl-active' : section > 2 ? ' tl-done' : ''}`}>During</div>
            <div className="scene-tl-arrow">→</div>
            <div className={`scene-tl-step${section === 3 ? ' tl-active' : ''}`}>After</div>
          </div>

          {section === 2 && (
            <div className="demo-order-stage">
              {[
                ['1️⃣', 'Members list'],
                ['2️⃣', 'Add member'],
                ['3️⃣', 'Member detail'],
                ['4️⃣', '✨ AI feature (last — wow)'],
              ].map(([num, label], i) => (
                <div key={label} className={`demo-order-item${i === 3 ? ' last-item' : ''}`}>
                  <span className="demo-order-num">{num}</span> {label}
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6D28D9', fontWeight: 700, marginTop: 4 }}>Build to the wow moment</div>
            </div>
          )}
        </div>
      )}

      {section === 3 && (
        <>
          <div className="notebook-visual">
            <div className="notebook-tabs">
              <span className={`notebook-tab${liked.trim().length > 3 ? ' filled' : ''}`}>What worked</span>
              <span className={`notebook-tab${confused.trim().length > 3 ? ' filled' : ''}`}>What to fix</span>
              <span className={`notebook-tab${oneThing.trim().length > 1 ? ' filled' : ''}`}>One thing</span>
            </div>
            <div className={`notebook-line${!liked.trim() ? ' notebook-line-empty' : ''}`}>{liked.trim() || 'They liked...'}</div>
            <div className={`notebook-line${!confused.trim() ? ' notebook-line-empty' : ''}`}>{confused.trim() || 'They were confused by...'}</div>
            <div className={`notebook-line${!oneThing.trim() ? ' notebook-line-empty' : ''}`}>{oneThing.trim() || 'The one thing they said...'}</div>
          </div>

          <div className="gate-stage-bolt-row">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className={`gate-stage-bolt${n <= 2 ? ' gold' : n === 3 ? (allMeetingDone ? ' gold' : ' current-pulse gold') : ''}`}>
                {n}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#B45309', marginTop: 8 }}>
            {allMeetingDone ? '3/7 complete — four more to earn' : '2/7 complete — meeting in progress'}
          </div>
        </>
      )}
    </div>
  );
}
