import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .ty-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .ty-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1280px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(8,145,178,0.12); color: #0891B2; }
  .p-pill.active { background: #0891B2; color: #fff; }
  .p-line { width: 14px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #0891B2; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1280px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.9rem; line-height: 1.8; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.75; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.75; }

  /* cricket selector */
  .selector-scene { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 14px 0; flex-wrap: wrap; }
  .selector-player { flex: 1; min-width: 130px; border-radius: 10px; padding: 12px; text-align: center; border: 1.5px solid #E2E8F0; background: #F8FAFC; transition: all 0.3s; }
  .selector-player.picked { border-color: #16A34A; background: #F0FDF4; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
  .selector-player-emoji { font-size: 1.6rem; }
  .selector-bubble { font-size: 0.68rem; color: #64748B; margin-top: 6px; font-style: italic; }
  .selector-scorecard { font-family: 'Fira Code', monospace; font-size: 0.64rem; color: #14532D; margin-top: 6px; text-align: left; background: #DCFCE7; border-radius: 6px; padding: 6px 8px; }
  .selector-mid { font-size: 1.6rem; }
  .selector-arrow-note { text-align: center; font-weight: 800; color: #16A34A; font-size: 0.82rem; margin-top: 4px; }

  /* student vs developer */
  .compare-cols { display: flex; gap: 12px; margin: 14px 0; flex-wrap: wrap; }
  .compare-col { flex: 1; min-width: 220px; border-radius: 10px; padding: 14px 16px; }
  .compare-col.student { background: #FEF2F2; border: 1.5px solid #FECACA; }
  .compare-col.developer { background: #F0FDF4; border: 1.5px solid #86EFAC; }
  .compare-col-title { font-weight: 800; font-size: 0.8rem; margin-bottom: 8px; }
  .compare-col.student .compare-col-title { color: #991B1B; }
  .compare-col.developer .compare-col-title { color: #14532D; }
  .compare-line { font-size: 0.78rem; margin-bottom: 6px; color: #334155; }
  .compare-tag { display: block; font-size: 0.66rem; font-weight: 700; margin-top: 2px; }
  .compare-col.student .compare-tag { color: #DC2626; }
  .compare-col.developer .compare-tag { color: #16A34A; }
  .compare-verdict { text-align: center; font-weight: 800; font-size: 0.88rem; color: #0891B2; margin-top: 6px; }

  /* script builder */
  .fill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  @media(max-width:700px) { .fill-grid { grid-template-columns: 1fr; } }
  .fill-field { display: flex; flex-direction: column; gap: 4px; }
  .fill-field.full { grid-column: 1 / -1; }
  .fill-label { font-size: 0.76rem; font-weight: 700; color: #475569; }
  .fill-input { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; font-size: 0.84rem; font-family: inherit; }
  .fill-input:focus { border-color: #0891B2; outline: none; }
  .fill-input.lit { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8,145,178,0.12); }

  .script-output { background: #1E293B; color: #E2E8F0; border-radius: 10px; padding: 16px 18px; margin: 12px 0; font-size: 0.85rem; line-height: 1.9; white-space: pre-wrap; }
  .script-output .hl { color: #5EEAD4; font-weight: 700; }
  .timer-badge { display: inline-block; background: #F0FDFA; color: #0891B2; border: 1.5px solid #99F6E4; border-radius: 20px; padding: 6px 14px; font-weight: 800; font-size: 0.78rem; margin-top: 8px; }

  .practice-textarea { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.9rem; font-family: inherit; resize: vertical; min-height: 90px; outline: none; }
  .practice-textarea:focus { border-color: #0891B2; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #ECFEFF; color: #0E7490; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  /* Q&A cards */
  .qa-nav { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
  .qa-tab { padding: 6px 12px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; font-size: 0.72rem; color: #94A3B8; }
  .qa-tab.active { border-color: #0891B2; color: #0891B2; background: #ECFEFF; }
  .qa-tab.qa-seen::after { content: ' ✓'; }
  .qa-card { border-radius: 14px; padding: 20px 22px; background: #F8FAFC; border: 2px solid #E2E8F0; animation: qaIn 0.35s ease; }
  .qa-card.bonus-card { background: #FEF3C7; border-color: #FCD34D; }
  @keyframes qaIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .qa-question { font-size: 1.02rem; font-weight: 800; color: #0F172A; margin: 0 0 12px; }
  .qa-model-label { font-size: 0.7rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .qa-model-answer { font-size: 0.85rem; color: #334155; line-height: 1.75; background: #fff; border-radius: 8px; padding: 12px 14px; border: 1.5px solid #E2E8F0; margin-bottom: 10px; white-space: pre-wrap; }
  .qa-why { font-size: 0.78rem; color: #0891B2; font-weight: 600; margin-bottom: 10px; white-space: pre-wrap; }
  .qa-your-label { font-size: 0.76rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
  .qa-your-textarea { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; font-size: 0.84rem; font-family: inherit; resize: vertical; min-height: 80px; }
  .qa-your-textarea:focus { border-color: #0891B2; outline: none; }
  .qa-nav-btns { display: flex; justify-content: space-between; margin-top: 16px; }
  .qa-nav-btn { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 16px; font-weight: 700; cursor: pointer; font-size: 0.82rem; }
  .qa-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .wrong-right { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
  .wr-line { border-radius: 8px; padding: 10px 12px; font-size: 0.82rem; }
  .wr-line.wrong { background: #FEF2F2; color: #991B1B; border-left: 3px solid #DC2626; }
  .wr-line.right { background: #F0FDF4; color: #14532D; border-left: 3px solid #16A34A; }

  .prep-item { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 16px; margin: 12px 0; background: #FAFAFA; }
  .prep-item-title { font-weight: 800; font-size: 0.9rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }

  .btn { background: #0891B2; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }

  .gate-card { background: linear-gradient(135deg, #FFFBEB, #FFF); border: 1.5px solid #FDE68A; border-radius: 14px; padding: 20px 22px; margin-top: 18px; }
  .gate-title { font-weight: 800; font-size: 1rem; color: #92400E; margin: 0 0 12px; }
  .gate-item { display: flex; align-items: center; gap: 10px; padding: 8px 4px; font-size: 0.85rem; }
  .gate-item.gate-done { color: #92400E; font-weight: 700; }
  .gate-item.gate-current { color: #0891B2; font-weight: 800; background: rgba(8,145,178,0.08); border-radius: 6px; }
  .gate-item.gate-pending { color: #A8A29E; }
  .gate-progress-note { text-align: center; margin-top: 12px; font-weight: 800; color: #0891B2; font-size: 0.88rem; }

  .reveal-strip { max-width: 1280px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 24px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 460px; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 18px; text-align: center; }

  .dual-scene { display: flex; flex-direction: column; gap: 14px; }
  .interview-scene { border-radius: 10px; padding: 14px; text-align: center; }
  .interview-scene.gray-scene { background: #F1F5F9; border: 1.5px solid #E2E8F0; }
  .interview-scene.green-scene { background: #F0FDF4; border: 1.5px solid #86EFAC; }
  .scene-row { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .scene-emoji { font-size: 1.8rem; }
  .scene-speech { font-size: 0.68rem; color: #94A3B8; font-style: italic; margin-top: 6px; }
  .green-scene .scene-speech { color: #16A34A; font-weight: 700; }
  .scene-caption { font-size: 0.72rem; font-weight: 700; color: #64748B; margin-top: 6px; }
  .callback-note { text-align: center; font-weight: 800; color: #0891B2; font-size: 0.84rem; margin-top: 6px; }

  .script-preview-panel { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-top: 10px; font-size: 0.78rem; color: #475569; line-height: 1.7; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }

  .chat-sim { display: flex; flex-direction: column; gap: 10px; }
  .chat-bubble { max-width: 88%; padding: 10px 14px; border-radius: 14px; font-size: 0.78rem; line-height: 1.6; animation: fadeInUp 0.35s ease; }
  .chat-bubble.q-bubble { align-self: flex-start; background: #E2E8F0; color: #334155; border-radius: 14px 14px 14px 4px; }
  .chat-bubble.a-bubble { align-self: flex-end; background: #CFFAFE; color: #0E7490; border-radius: 14px 14px 4px 14px; white-space: pre-wrap; }

  .prep-checklist-visual { display: flex; flex-direction: column; gap: 8px; }
  .prep-check-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #94A3B8; padding: 8px 10px; border-radius: 8px; background: #F8FAFC; }
  .prep-check-item.prep-done { color: #0E7490; font-weight: 700; background: #ECFEFF; }
  .ready-badge { text-align: center; margin-top: 10px; font-weight: 800; color: #16A34A; font-size: 0.88rem; }

  .journey-timeline { display: flex; flex-direction: column; gap: 10px; }
  .journey-step { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; background: #F8FAFC; }
  .journey-step-emoji { font-size: 1.3rem; }
  .journey-step-label { font-size: 0.78rem; font-weight: 700; color: #475569; }
  .journey-arrow-down { text-align: center; color: #CBD5E1; }
  .journey-caption { text-align: center; font-weight: 700; font-size: 0.84rem; color: #0891B2; margin-top: 10px; line-height: 1.6; }

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

const QUESTIONS = [
  {
    key: 'howLong',
    q: '"How long did it take?"',
    model: "About 8 weeks — one week planning, two weeks Java backend, one week auth, two weeks React, final weeks AI and deployment.",
    why: "Shows you know your own timeline.\nShows the program was structured.\nShows you understand the components.",
  },
  {
    key: 'hardestPart',
    q: '"What was the hardest part?"',
    model: "JWT authentication. Specifically the JwtFilter — it intercepts every request, validates the token, and writes to SecurityContextHolder. Once I understood that flow it clicked. Also CORS — React and Spring Boot on different ports blocked each other until I added @CrossOrigin.",
    why: "Shows a specific technical challenge.\nShows you understand what you built.\nShows you worked through it.",
  },
  {
    key: 'codeShow',
    q: '"Can I see the code?"',
    model: "Yes — here is the GitHub: [link]. The key files are:\nJwtFilter.java — the token interceptor\nAIService.java — the Gemini integration\nGymController.java — the main API\n\nThe frontend has a LoginScreen component and a MemberDetail component with the AI button.",
    why: "Shows you know your own code.\nShows you can navigate your repo.\nShows you built real components.",
  },
];

const STEPS = ['Student vs Developer', '60-Second Script', 'Follow-Up Answers', 'Pre-Interview Prep'];

export default function TellMeAboutYourself() {
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

  // ── STEP 1 ──
  const [selectorPicked, setSelectorPicked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSelectorPicked(true), 900);
    return () => clearTimeout(t);
  }, []);
  function goToStep2() { play('tick'); setStep(2); }

  // ── STEP 2: Script builder ──
  const [fields, setFields] = useState({
    yourName: '', domain: '', businessType: '', ownerProblem: '', appDoes: '',
    liveUrl: '', aiFeature: '', role: '',
  });
  const [focusedField, setFocusedField] = useState('');
  function updateField(key, val) { setFields(f => ({ ...f, [key]: val })); }

  const scriptComplete = Object.values(fields).every(v => v.trim().length > 0);
  const scriptGeneratedRef = useRef(false);
  useEffect(() => {
    if (scriptComplete && !scriptGeneratedRef.current) { scriptGeneratedRef.current = true; play('correct'); }
  }, [scriptComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatedScript = useMemo(() => {
    const f = fields;
    return `My name is ${f.yourName || '[name]'}.

I recently built a full stack ${f.domain || '[domain]'} app for a real ${f.businessType || '[business]'} near my college.

The owner was ${f.ownerProblem || '[manual problem]'}. I built an app that lets them ${f.appDoes || '[what it does]'}. The app is live right now at ${f.liveUrl || '[URL]'}.

I built it with Java Spring Boot for the backend, React for the frontend, MySQL for the database, and I integrated Google Gemini AI for personalised ${f.aiFeature || '[feature]'}.

I am looking for a ${f.role || '[role]'} position where I can build things that solve real problems.`;
  }, [fields]);

  const [ownWordsAnswer, setOwnWordsAnswer] = useState('');
  const [step2Practiced, setStep2Practiced] = useState(false);
  function toggleStep2Practiced() {
    if (!step2Practiced) play('correct');
    setStep2Practiced(v => !v);
  }
  const canGoStep3 = scriptComplete && ownWordsAnswer.trim().length > 0 && step2Practiced;
  function goToStep3() { play('tick'); setStep(3); }

  // ── STEP 3: Follow-up answers ──
  const [qaIdx, setQaIdx] = useState(0); // 0-2 questions, 3 = bonus
  const [qaSeen, setQaSeen] = useState({ 0: true });
  // Left blank rather than pre-filled with the model answer - otherwise a
  // learner could pass this whole step without writing a single original word.
  const [yourAnswers, setYourAnswers] = useState({ howLong: '', hardestPart: '', codeShow: '' });
  function updateYourAnswer(key, val) { setYourAnswers(a => ({ ...a, [key]: val })); }
  function nextQa() {
    play('tick');
    setQaIdx(i => {
      const next = Math.min(i + 1, 3);
      setQaSeen(s => ({ ...s, [next]: true }));
      return next;
    });
  }
  function prevQa() { play('tick'); setQaIdx(i => Math.max(i - 1, 0)); }
  const allQaSeen = [0,1,2,3].every(i => qaSeen[i]);

  const [followUpReady, setFollowUpReady] = useState(false);
  function toggleFollowUpReady() {
    if (!followUpReady) play('add');
    setFollowUpReady(v => !v);
  }
  function goToStep4() { play('tick'); setStep(4); }

  // ── STEP 4: Pre-interview prep ──
  const [prepUrl, setPrepUrl] = useState(fields.liveUrl);
  const [prepUrlChecked, setPrepUrlChecked] = useState(false);
  const [prepGithub, setPrepGithub] = useState('');
  const [prepGithubChecked, setPrepGithubChecked] = useState(false);
  const [prepOneSentenceChecked, setPrepOneSentenceChecked] = useState(false);

  function toggleUrlChecked() { if (!prepUrlChecked) play('add'); setPrepUrlChecked(v => !v); }
  function toggleGithubChecked() { if (!prepGithubChecked) play('add'); setPrepGithubChecked(v => !v); }
  function toggleOneSentenceChecked() { if (!prepOneSentenceChecked) play('add'); setPrepOneSentenceChecked(v => !v); }

  const allPrepDone = prepUrlChecked && prepGithubChecked && prepOneSentenceChecked;
  const prepFiredRef = useRef(false);
  useEffect(() => { if (allPrepDone && !prepFiredRef.current) { prepFiredRef.current = true; play('correct'); } }, [allPrepDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [finalMemoryAnswer, setFinalMemoryAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  const canSubmit = allPrepDone && finalMemoryAnswer.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    play('submit');
    setSubmitted(true);
    setTimeout(() => {
      play('reveal');
      let c = 0;
      const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 5) clearInterval(iv); }, 450);
    }, 300);
  }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t2-s5-tell-me-about-yourself',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            step1: { comparisonUnderstood: selectorPicked },
            step2: { scriptGenerated: scriptComplete, scriptInOwnWords: ownWordsAnswer, practisedOnce: step2Practiced },
            step3: {
              howLongAnswer: yourAnswers.howLong,
              hardestPartAnswer: yourAnswers.hardestPart,
              codeShowAnswer: yourAnswers.codeShow,
              iDontKnowUnderstood: allQaSeen,
            },
            step4: {
              urlReady: prepUrlChecked,
              githubReady: prepGithub,
              oneSentenceReady: prepOneSentenceChecked,
              finalAnswerFromMemory: finalMemoryAnswer,
            },
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ty-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Tell Me About Yourself</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

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
              <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Two answers. Same person. Different results.</h2>

              <div className="amber-card">
                A selector is choosing for the state team.<br /><br />
                Player 1: "I love cricket. I practise every day. Very dedicated."<br /><br />
                Player 2: "87 in last Ranji. Three 50+ scores. 78% strike rate. Here is my scorecard."<br /><br />
                Selector picks Player 2. Every time.<br /><br />
                <b>Evidence beats claims. Specific beats vague.</b>
              </div>

              <div className="selector-scene">
                <div className={`selector-player${selectorPicked ? '' : ''}`}>
                  <div className="selector-player-emoji">🏏</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>Player 1</div>
                  <div className="selector-bubble">"I love cricket. Very dedicated."</div>
                </div>
                <div className="selector-mid">👔</div>
                <div className={`selector-player${selectorPicked ? ' picked' : ''}`}>
                  <div className="selector-player-emoji">🏆</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>Player 2</div>
                  <div className="selector-scorecard">87 runs · 3× 50+ · 78% SR</div>
                </div>
              </div>
              {selectorPicked && <div className="selector-arrow-note">Selector picks Player 2 ✅</div>}

              <div className="compare-cols">
                <div className="compare-col student">
                  <div className="compare-col-title">Student answer</div>
                  <div className="compare-line">"My name is Ravi Kumar.<span className="compare-tag">❌ Just education</span></div>
                  <div className="compare-line">I did my B.Tech from XYZ College.</div>
                  <div className="compare-line">I have studied Java and web technologies.<span className="compare-tag">❌ Claims — not evidence</span></div>
                  <div className="compare-line">I am a hardworking student and quick learner."<span className="compare-tag">❌ Everyone says this</span></div>
                  <div className="compare-tag" style={{ marginTop: 6 }}>❌ Nothing memorable</div>
                </div>
                <div className="compare-col developer">
                  <div className="compare-col-title">Developer answer</div>
                  <div className="compare-line">"My name is Ravi Kumar.</div>
                  <div className="compare-line">I built a gym app for a real gym near my college — live at [URL].<span className="compare-tag">✅ What you built</span></div>
                  <div className="compare-line">Stack: Spring Boot, React, MySQL, JWT, Gemini AI.<span className="compare-tag">✅ Specific technologies</span></div>
                  <div className="compare-line">Looking for a full stack role."<span className="compare-tag">✅ Clear intent</span></div>
                  <div className="compare-tag" style={{ marginTop: 6 }}>✅ Evidence — live proof</div>
                </div>
              </div>
              <div className="compare-verdict">SAME PERSON. Different answer. Different result.</div>

              <button className="btn" onClick={goToStep2}>Build your 60-second answer →</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Your 60-second script</h2>

              <div className="fill-grid">
                <div className="fill-field"><span className="fill-label">Your name</span><input className={`fill-input${focusedField === 'yourName' ? ' lit' : ''}`} placeholder="Ravi Kumar" value={fields.yourName} onFocus={() => setFocusedField('yourName')} onChange={e => updateField('yourName', e.target.value)} /></div>
                <div className="fill-field"><span className="fill-label">Your domain</span><input className={`fill-input${focusedField === 'domain' ? ' lit' : ''}`} placeholder="gym management" value={fields.domain} onFocus={() => setFocusedField('domain')} onChange={e => updateField('domain', e.target.value)} /></div>
                <div className="fill-field"><span className="fill-label">Business type</span><input className={`fill-input${focusedField === 'businessType' ? ' lit' : ''}`} placeholder="gym" value={fields.businessType} onFocus={() => setFocusedField('businessType')} onChange={e => updateField('businessType', e.target.value)} /></div>
                <div className="fill-field"><span className="fill-label">Owner's manual problem</span><input className={`fill-input${focusedField === 'ownerProblem' ? ' lit' : ''}`} placeholder="managed 200 members using paper registers" value={fields.ownerProblem} onFocus={() => setFocusedField('ownerProblem')} onChange={e => updateField('ownerProblem', e.target.value)} /></div>
                <div className="fill-field full"><span className="fill-label">What your app lets them do</span><input className={`fill-input${focusedField === 'appDoes' ? ' lit' : ''}`} placeholder="manage all members from their phone, track plans, get AI suggestions" value={fields.appDoes} onFocus={() => setFocusedField('appDoes')} onChange={e => updateField('appDoes', e.target.value)} /></div>
                <div className="fill-field"><span className="fill-label">Your live URL</span><input className={`fill-input${focusedField === 'liveUrl' ? ' lit' : ''}`} placeholder="yourapp.railway.app" value={fields.liveUrl} onFocus={() => setFocusedField('liveUrl')} onChange={e => updateField('liveUrl', e.target.value)} /></div>
                <div className="fill-field"><span className="fill-label">AI feature</span><input className={`fill-input${focusedField === 'aiFeature' ? ' lit' : ''}`} placeholder="workout suggestions for each member" value={fields.aiFeature} onFocus={() => setFocusedField('aiFeature')} onChange={e => updateField('aiFeature', e.target.value)} /></div>
                <div className="fill-field full"><span className="fill-label">Role you want</span><input className={`fill-input${focusedField === 'role' ? ' lit' : ''}`} placeholder="full stack developer" value={fields.role} onFocus={() => setFocusedField('role')} onChange={e => updateField('role', e.target.value)} /></div>
              </div>

              <div className="script-output">{generatedScript}</div>
              <div className="timer-badge">⏱ Reading time: ~60 seconds</div>

              <div className="blue-card">
                Record yourself saying this. Voice note on your phone.<br /><br />
                Listen back.<br />
                Too fast? Slow down.<br />
                Unclear? Simplify.<br />
                3 practice rounds minimum.
              </div>

              <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 16 }}>Write your answer in your own words (no copy-paste):</p>
              <textarea
                className="practice-textarea"
                placeholder="My name is..."
                value={ownWordsAnswer}
                onChange={e => setOwnWordsAnswer(e.target.value)}
                onPaste={e => e.preventDefault()}
              />

              <div className={`checkbox-row${step2Practiced ? ' checked' : ''}`} onClick={toggleStep2Practiced}>
                <input type="checkbox" checked={step2Practiced} readOnly />
                ✅ Script written — practised at least once
              </div>

              <button className="btn" style={{ opacity: canGoStep3 ? 1 : 0.5 }} disabled={!canGoStep3} onClick={goToStep3}>
                {canGoStep3 ? 'Next — follow-up questions →' : 'Fill in the script and practice to continue'}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card">
              <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800 }}>Three questions you will be asked</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px' }}>Read the model answer. Edit it to match your own experience.</p>

              <div className="qa-nav">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`qa-tab${i === qaIdx ? ' active' : ''}${qaSeen[i] ? ' qa-seen' : ''}`}>{i < 3 ? `Q${i + 1}` : 'Bonus'}</div>
                ))}
              </div>

              {qaIdx < 3 ? (
                <div className="qa-card" key={QUESTIONS[qaIdx].key}>
                  <div className="qa-question">{QUESTIONS[qaIdx].q}</div>
                  <div className="qa-model-label">Model answer</div>
                  <div className="qa-model-answer">{QUESTIONS[qaIdx].model}</div>
                  <div className="qa-why">Why this answer works:{'\n'}{QUESTIONS[qaIdx].why}</div>
                  <div className="qa-your-label">Now write it in your own words:</div>
                  <textarea
                    className="qa-your-textarea"
                    placeholder="Type your own version here - don't just copy the model answer above..."
                    value={yourAnswers[QUESTIONS[qaIdx].key]}
                    onChange={e => updateYourAnswer(QUESTIONS[qaIdx].key, e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  {qaIdx === 2 && (
                    <>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: 10 }}>GitHub URL — have it open before the interview:</p>
                      <input className="fill-input" style={{ width: '100%' }} placeholder="https://github.com/you/backend" value={prepGithub} onChange={e => setPrepGithub(e.target.value)} />
                    </>
                  )}
                </div>
              ) : (
                <div className="qa-card bonus-card">
                  <div className="qa-question">"I do not know" — the honest answer</div>
                  <div className="wrong-right">
                    <div className="wr-line wrong">WRONG: "I do not know."</div>
                    <div className="wr-line right">RIGHT: "I have not used that specifically — but based on [what I know], I would approach it by [logical guess]. Is that close?"</div>
                  </div>
                  <div className="qa-why">
                    Shows: logical thinking.{'\n'}Shows: honesty without defeat.{'\n'}Shows: you can learn anything.
                  </div>
                </div>
              )}

              {qaIdx < 3 && yourAnswers[QUESTIONS[qaIdx].key].trim().length < 15 && (
                <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 700, marginTop: 6 }}>Write at least a short sentence in your own words to continue.</div>
              )}
              <div className="qa-nav-btns">
                <button className="qa-nav-btn" onClick={prevQa} disabled={qaIdx === 0}>← Previous</button>
                {qaIdx < 3
                  ? <button className="qa-nav-btn" onClick={nextQa} disabled={yourAnswers[QUESTIONS[qaIdx].key].trim().length < 15}>Next →</button>
                  : <button className="qa-nav-btn" onClick={nextQa}>Got it →</button>}
              </div>

              {allQaSeen && (
                <div className={`checkbox-row${followUpReady ? ' checked' : ''}`} onClick={toggleFollowUpReady}>
                  <input type="checkbox" checked={followUpReady} readOnly />
                  ✅ Follow-up answers ready
                </div>
              )}

              <button className="btn" style={{ opacity: followUpReady ? 1 : 0.5 }} disabled={!followUpReady} onClick={goToStep4}>
                {followUpReady ? 'Next — pre-interview prep →' : 'Read all questions and confirm to continue'}
              </button>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Before every interview — three things</h2>

              <div className="prep-item">
                <div className="prep-item-title">📱 Item 1 — Open your live URL</div>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Before the call starts: open your Railway URL. Make sure it loads. Login and confirm it works. Be ready to share your screen.
                </p>
                <input className="fill-input" style={{ width: '100%' }} value={prepUrl} onChange={e => setPrepUrl(e.target.value)} placeholder="https://yourapp.up.railway.app" />
                <div className={`checkbox-row${prepUrlChecked ? ' checked' : ''}`} onClick={toggleUrlChecked}>
                  <input type="checkbox" checked={prepUrlChecked} readOnly />
                  ✅ URL open and working
                </div>
              </div>

              <div className="prep-item">
                <div className="prep-item-title">🗂 Item 2 — Open your GitHub</div>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>Open your backend repo. Know where these files are:</p>
                <div className="script-output" style={{ margin: '8px 0', fontFamily: "'Fira Code', monospace", fontSize: '0.76rem' }}>
{`src/.../security/JwtFilter.java
src/.../ai/AIService.java
src/.../controller/[Domain]Controller.java`}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B' }}>If they ask to see the code — you navigate instantly.</p>
                <input className="fill-input" style={{ width: '100%' }} value={prepGithub} onChange={e => setPrepGithub(e.target.value)} placeholder="https://github.com/you/backend" />
                <div className={`checkbox-row${prepGithubChecked ? ' checked' : ''}`} onClick={toggleGithubChecked}>
                  <input type="checkbox" checked={prepGithubChecked} readOnly />
                  ✅ GitHub open — key files located
                </div>
              </div>

              <div className="prep-item">
                <div className="prep-item-title">💬 Item 3 — Your one-sentence answer</div>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>If asked anything you cannot answer in depth — say this:</p>
                <div className="script-output" style={{ margin: '8px 0' }}>
                  "I built and deployed a full stack app with JWT auth and AI integration. I am still learning [X] but I have solid fundamentals in the full stack."
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B' }}>This is not weakness. This is honest confidence. Every developer says this about something.</p>
                <div className={`checkbox-row${prepOneSentenceChecked ? ' checked' : ''}`} onClick={toggleOneSentenceChecked}>
                  <input type="checkbox" checked={prepOneSentenceChecked} readOnly />
                  ✅ One-sentence answer memorised
                </div>
              </div>

              {allPrepDone && (
                <>
                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Final reflection</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 8px' }}>
                    Write your complete "tell me about yourself" answer one more time — from memory, not the template:
                  </p>
                  <textarea
                    className="practice-textarea"
                    placeholder="My name is..."
                    value={finalMemoryAnswer}
                    onChange={e => setFinalMemoryAnswer(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />

                  <button className="btn" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Submitted ✅' : 'Interview ready — final gate next →'}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 16, padding: 16, background: '#ECFEFF', borderRadius: 8, color: '#0E7490' }}>
                      <b>Interview ready. 👔</b><br /><br />
                      ✅ 60-second script written<br />
                      ✅ Follow-up answers prepared<br />
                      ✅ Live URL ready<br />
                      ✅ GitHub ready<br />
                      ✅ One-sentence fallback ready<br /><br />
                      You are not a student anymore.<br />
                      You are a developer who shipped something real for a real person.<br /><br />
                      Lead with that. Every time.
                    </div>
                  )}

                  {submitted && (
                    <div className="gate-card">
                      <div className="gate-title">🔒 Deploy v3 gate</div>
                      <div className="gate-item gate-done">✅ Live URL</div>
                      <div className="gate-item gate-done">✅ AI live</div>
                      <div className="gate-item gate-done">✅ Owner saw app</div>
                      <div className="gate-item gate-done">✅ Demo recorded</div>
                      <div className="gate-item gate-current">✅ README done ← this</div>
                      <div className="gate-item gate-pending">⬜ GitHub clean commits</div>
                      <div className="gate-item gate-pending">⬜ Mentor review</div>
                      <div className="gate-progress-note">5/7 complete — two more to earn</div>
                    </div>
                  )}

                  {revealCount > 0 && (
                    <div className="reveal-strip">
                      <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>Phase 1 complete</h3>
                      {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>Evidence beats claims</b> → "I built X" beats "I am passionate about Y"</span></div>}
                      {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>60-second script</b> → name + built + URL + stack + want</span></div>}
                      {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>Hardest part answer</b> → specific technical challenge — JWT / SecurityContextHolder / CORS</span></div>}
                      {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>"I have not used that but..."</b> → honest, logical, not defeated</span></div>}
                      {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>Open URLs before interview</b> → app and GitHub ready instantly</span></div>}
                      {revealCount >= 5 && (
                        <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.9 }}>
                          You are no longer a student.<br />
                          You are a developer.<br /><br />
                          You built something real. For a real person. It is live on the internet.<br /><br />
                          Lead with that.<br /><br />
                          Topic 2 complete.<br />
                          Topic 3 — the final gate.<br />
                          Module 5 complete.
                        </p>
                      )}
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
              step={step} selectorPicked={selectorPicked} generatedScript={generatedScript} scriptComplete={scriptComplete}
              qaIdx={qaIdx} yourAnswers={yourAnswers} allQaSeen={allQaSeen}
              prepUrlChecked={prepUrlChecked} prepGithubChecked={prepGithubChecked} prepOneSentenceChecked={prepOneSentenceChecked} allPrepDone={allPrepDone}
              submitted={submitted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StagePanel({ step, selectorPicked, generatedScript, scriptComplete, qaIdx, yourAnswers, allQaSeen, prepUrlChecked, prepGithubChecked, prepOneSentenceChecked, allPrepDone, submitted }) {
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'Which one gets the callback?'}
        {step === 2 && 'Your scorecard'}
        {step === 3 && 'Interview simulation'}
        {step === 4 && !submitted && 'Pre-interview checklist'}
        {step === 4 && submitted && 'From paper to production'}
      </div>

      {step === 1 && (
        <div className="dual-scene">
          <div className="interview-scene gray-scene">
            <div className="scene-row">
              <span className="scene-emoji">🧑‍💼</span>
              <span className="scene-emoji">🎓</span>
            </div>
            <div className="scene-speech">"I am a hardworking student and quick learner..."</div>
            <div className="scene-caption">Student — vague, uncertain</div>
          </div>
          <div className={`interview-scene green-scene${selectorPicked ? '' : ''}`}>
            <div className="scene-row">
              <span className="scene-emoji">🧑‍💼</span>
              <span className="scene-emoji">👨‍💻</span>
            </div>
            <div className="scene-speech">"Live at yourapp.railway.app — here, let me show you."</div>
            <div className="scene-caption">Developer — confident, showing proof</div>
          </div>
          {selectorPicked && <div className="callback-note">The developer gets the callback ✅</div>}
        </div>
      )}

      {step === 2 && (
        <>
          <div className="script-preview-panel">{generatedScript}</div>
          <div className="timer-badge" style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>⏱ ~60 seconds</div>
          {scriptComplete && <p style={{ textAlign: 'center', fontWeight: 800, color: '#0891B2', marginTop: 10 }}>This is your scorecard ✅</p>}
        </>
      )}

      {step === 3 && (
        <div className="chat-sim">
          {[0,1,2].filter(i => i <= qaIdx || qaIdx === 3).map(i => (
            <React.Fragment key={i}>
              <div className="chat-bubble q-bubble">{QUESTIONS[i].q}</div>
              <div className="chat-bubble a-bubble">{yourAnswers[QUESTIONS[i].key]}</div>
            </React.Fragment>
          ))}
          {qaIdx === 3 && (
            <>
              <div className="chat-bubble q-bubble">"Have you used Kubernetes?"</div>
              <div className="chat-bubble a-bubble">"I have not used that specifically — but based on Docker, I would approach it by containerizing each service. Is that close?"</div>
            </>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: 6 }}>Practice saying each answer out loud — not just reading</p>
        </div>
      )}

      {step === 4 && !submitted && (
        <>
          <div className="prep-checklist-visual">
            <div className={`prep-check-item${prepUrlChecked ? ' prep-done' : ''}`}>{prepUrlChecked ? '✅' : '📱'} Live URL ready</div>
            <div className={`prep-check-item${prepGithubChecked ? ' prep-done' : ''}`}>{prepGithubChecked ? '✅' : '🗂'} GitHub ready</div>
            <div className={`prep-check-item${prepOneSentenceChecked ? ' prep-done' : ''}`}>{prepOneSentenceChecked ? '✅' : '💬'} One-sentence fallback ready</div>
          </div>
          {allPrepDone && <div className="ready-badge">Ready ✅</div>}
        </>
      )}

      {step === 4 && submitted && (
        <>
          <div className="journey-timeline">
            <div className="journey-step"><span className="journey-step-emoji">📝</span><span className="journey-step-label">Week 1 — Paper sketch</span></div>
            <div className="journey-arrow-down">↓</div>
            <div className="journey-step"><span className="journey-step-emoji">💻</span><span className="journey-step-label">Weeks 2-4 — Code</span></div>
            <div className="journey-arrow-down">↓</div>
            <div className="journey-step"><span className="journey-step-emoji">☁️</span><span className="journey-step-label">Week 5 — Deploy</span></div>
            <div className="journey-arrow-down">↓</div>
            <div className="journey-step"><span className="journey-step-emoji">👔</span><span className="journey-step-label">Week 6 — Interview ready</span></div>
          </div>
          <div className="journey-caption">From paper to production.<br />From student to developer.<br />That is your story. Tell it.</div>

          <div className="gate-stage-bolt-row">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className={`gate-stage-bolt${n <= 5 ? ' gold' : ''}`}>{n}</div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#0891B2', marginTop: 8 }}>5/7 bolts lit — two more to earn</p>
        </>
      )}
    </div>
  );
}
