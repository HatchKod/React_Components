import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .jwt-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .jwt-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #1E293B; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }

  .scene-strip { display: flex; align-items: center; justify-content: center; gap: 6px; max-width: 1200px; margin: 0 auto 24px; flex-wrap: wrap; }
  .s-pill { padding: 7px 14px; border-radius: 20px; font-size: 0.74rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .s-pill.done { background: rgba(16,185,129,0.12); color: #16A34A; }
  .s-pill.active { background: #3B82F6; color: #fff; }
  .s-line { width: 20px; height: 2px; background: #E2E8F0; }
  .s-line.done { background: #16A34A; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1200px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.7; }
  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.7; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.7; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }

  /* Scene 1 — basic auth repetition */
  .repeat-row { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #78350F; padding: 8px 12px; background: #FFFBEB; border-radius: 8px; margin-bottom: 6px; font-family: monospace; }
  .repeat-counter { text-align: center; font-weight: 800; color: #92400E; margin-top: 10px; font-size: 0.85rem; }

  /* Three-part accordion (scene 3) */
  .part-tap-row { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; }
  .part-tap-btn { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #fff; cursor: pointer; font-weight: 700; font-size: 0.85rem; text-align: left; transition: all 0.2s; }
  .part-tap-btn.tapped-header { border-color: #3B82F6; background: #EFF6FF; }
  .part-tap-btn.tapped-payload { border-color: #10B981; background: #F0FDF4; }
  .part-tap-btn.tapped-signature { border-color: #F59E0B; background: #FFFBEB; }
  .part-tap-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .part-explain { font-size: 0.82rem; color: #475569; padding: 10px 14px; margin: -4px 0 4px; line-height: 1.7; animation: fadeInUp 0.3s ease; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .part-explain code { background: #1E293B; color: #E2E8F0; padding: 6px 10px; border-radius: 6px; display: block; margin: 6px 0; font-size: 0.76rem; white-space: pre-wrap; }

  /* Scene 4 — stolen card comparison */
  .stolen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 14px 0; }
  @media(max-width:600px) { .stolen-grid { grid-template-columns: 1fr; } }
  .stolen-col { border-radius: 10px; padding: 14px 16px; font-size: 0.82rem; line-height: 1.7; }
  .stolen-col.danger { background: #FEF2F2; border-left: 4px solid #DC2626; color: #7F1D1D; }
  .stolen-col.safe { background: #F0FDF4; border-left: 4px solid #16A34A; color: #14532D; }
  .stolen-title { font-weight: 800; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }

  .before-after-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 14px 0; }
  @media(max-width:600px) { .before-after-grid { grid-template-columns: 1fr; } }
  .ba-col { border-radius: 10px; padding: 14px 16px; font-size: 0.78rem; line-height: 1.8; font-family: monospace; background: #F8FAFC; border: 1px solid #E2E8F0; }
  .ba-col.after-col { opacity: 0.85; }
  .ba-title { font-weight: 800; font-family: system-ui, sans-serif; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; color: #64748B; }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #1E293B; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; transition: all 0.2s; }
  .opt-btn:hover { border-color: #94A3B8; }
  .opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .qcheck-note { font-size: 0.82rem; margin-top: 8px; padding: 10px 12px; border-radius: 8px; }
  .qcheck-note.wrong { background: #FEF2F2; color: #991B1B; }
  .qcheck-note.correct { background: #F0FDF4; color: #14532D; }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  /* ── THE LIVING CARD (right side, persistent object that transforms) ── */
  .card-stage { background: #fff; border-radius: 16px; padding: 28px 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .card-stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center; }

  .flip-outer { perspective: 1200px; width: 100%; max-width: 340px; }
  .flip-inner { position: relative; transition: transform 0.35s cubic-bezier(.4,.2,.2,1), opacity 0.35s ease; transform-style: preserve-3d; }
  .flip-inner.flipping { transform: rotateY(90deg); opacity: 0; }

  /* Scene 1: repeating request stub */
  .stub-card { border: 2px dashed #FCD34D; border-radius: 12px; padding: 18px; background: #FFFBEB; text-align: center; }
  .stub-row { font-family: monospace; font-size: 0.72rem; color: #92400E; padding: 6px 0; }
  .stub-warn { color: #DC2626; font-weight: 800; font-size: 0.78rem; margin-top: 8px; }

  /* Scene 2: membership card */
  .membership-card { border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); background: #fff; animation: cardFlipIn 0.6s ease; }
  @keyframes cardFlipIn { from { transform: rotateY(90deg); opacity: 0; } to { transform: rotateY(0deg); opacity: 1; } }
  .mc-header-bar { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: #fff; padding: 14px 18px; font-weight: 800; font-size: 1rem; }
  .mc-body { padding: 16px 18px; }
  .mc-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 6px 0; border-bottom: 1px dashed #E2E8F0; color: #475569; }
  .mc-row:last-of-type { border-bottom: none; }
  .mc-row b { color: #1E293B; }
  .mc-stamp { text-align: center; margin-top: 10px; }
  .mc-stamp-badge { display: inline-block; border: 2px solid #16A34A; color: #16A34A; font-weight: 800; font-size: 0.72rem; padding: 4px 14px; border-radius: 20px; transform: rotate(-6deg); }
  .mc-label-tag { font-size: 0.62rem; color: #94A3B8; text-align: center; margin-top: 4px; }

  .flow-mini { display: flex; flex-direction: column; gap: 6px; margin-top: 16px; width: 100%; max-width: 340px; }
  .flow-mini-step { font-size: 0.72rem; color: #64748B; padding: 6px 10px; background: #F8FAFC; border-radius: 6px; opacity: 0; animation: fadeInUp 0.35s ease forwards; }

  /* Scene 3: JWT string + fan panels */
  .jwt-string-row { display: flex; align-items: center; justify-content: center; gap: 2px; font-family: monospace; font-size: 0.7rem; font-weight: 700; flex-wrap: wrap; padding: 14px; background: #0F172A; border-radius: 10px; width: 100%; max-width: 340px; }
  .jwt-seg { padding: 4px 4px; border-radius: 4px; transition: all 0.3s; }
  .jwt-seg.header-seg { color: #93C5FD; }
  .jwt-seg.payload-seg { color: #6EE7B7; }
  .jwt-seg.signature-seg { color: #FCD34D; }
  .jwt-seg.dim { opacity: 0.3; }
  .jwt-seg.glow-header { background: rgba(59,130,246,0.25); box-shadow: 0 0 10px rgba(59,130,246,0.5); }
  .jwt-seg.glow-payload { background: rgba(16,185,129,0.25); box-shadow: 0 0 10px rgba(16,185,129,0.5); }
  .jwt-seg.glow-signature { background: rgba(245,158,11,0.25); box-shadow: 0 0 10px rgba(245,158,11,0.5); }
  .jwt-dot { color: #64748B; }

  .decoded-panel { width: 100%; max-width: 340px; margin-top: 14px; border-radius: 10px; padding: 14px; font-family: monospace; font-size: 0.76rem; line-height: 1.7; animation: fadeInUp 0.3s ease; }
  .decoded-panel.header-panel { background: rgba(59,130,246,0.08); border: 1.5px solid #3B82F6; color: #1E40AF; }
  .decoded-panel.payload-panel { background: rgba(16,185,129,0.08); border: 1.5px solid #10B981; color: #14532D; }
  .decoded-panel.signature-panel { background: rgba(245,158,11,0.08); border: 1.5px solid #F59E0B; color: #78350F; }

  .base64-note { width: 100%; max-width: 340px; margin-top: 14px; background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 12px 14px; font-size: 0.76rem; color: #1E40AF; line-height: 1.6; animation: fadeInUp 0.4s ease; }

  /* Scene 4: expiry clock */
  .expiry-clock-wrap { text-align: center; }
  .expiry-svg { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.08)); }
  @keyframes tickRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .clock-hand-min { transform-origin: 50px 50px; animation: tickRotate 4s linear infinite; }
  .expiry-lbl { margin-top: 10px; font-size: 0.82rem; font-weight: 700; color: #16A34A; }

  .celebration-card { background: linear-gradient(135deg, #FBEAF0, #FFFFFF); border-radius: 16px; padding: 24px; text-align: center; max-width: 900px; margin: 20px auto 0; }
  .celebration-card b { font-size: 1.1rem; }
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

const SCENES = ['Problem', 'Membership Card', 'Three Parts', 'Expiry + Usage'];

// Scene 2 match-the-label check: which real JWT term does each card label represent.
const S2_CORRECT = {
  'Member + expiry': 'PAYLOAD',
  'Stamp: Verified': 'SIGNATURE',
  '🏋️ Card type': 'HEADER',
};
const S2_PARTS = ['HEADER', 'PAYLOAD', 'SIGNATURE'];

export default function JWTIntro() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [scene, setScene] = useState(1);
  const railRef = useRef(null);
  const isFirstSceneRender = useRef(true);
  useEffect(() => {
    if (isFirstSceneRender.current) { isFirstSceneRender.current = false; return; }
    if (railRef.current) railRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scene]);

  // ── Scene 1: quick check before advancing ──
  const [s1Answer, setS1Answer] = useState(null);
  function answerS1(val) {
    if (s1Answer === 'card') return;
    setS1Answer(val);
    play(val === 'card' ? 'correct' : 'warn');
  }
  function toScene2() { play('tick'); setScene(2); }

  const cardIssuedFiredRef = useRef(false);
  useEffect(() => {
    if (scene === 2 && !cardIssuedFiredRef.current) {
      cardIssuedFiredRef.current = true;
      setTimeout(() => play('correct'), 600);
    }
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scene 2: match each card label to its real JWT part before advancing ──
  const [s2Matched, setS2Matched] = useState({});
  function matchS2(label, part) {
    play(part === S2_CORRECT[label] ? 'correct' : 'warn');
    if (part === S2_CORRECT[label]) setS2Matched(m => ({ ...m, [label]: true }));
  }
  const s2AllMatched = Object.keys(S2_CORRECT).every(k => s2Matched[k]);
  function toScene3() { play('tick'); setScene(3); }

  // ── Scene 3: three tappable parts ──
  const [tapped, setTapped] = useState({ header: false, payload: false, signature: false });
  function tapPart(key) {
    play('tick');
    setTapped(t => ({ ...t, [key]: true }));
  }
  const allTapped = tapped.header && tapped.payload && tapped.signature;
  const allTappedFiredRef = useRef(false);
  useEffect(() => {
    if (allTapped && !allTappedFiredRef.current) {
      allTappedFiredRef.current = true;
      play('correct');
    }
  }, [allTapped]); // eslint-disable-line react-hooks/exhaustive-deps
  const [activePart, setActivePart] = useState(null);
  function selectPart(key) {
    tapPart(key);
    setActivePart(key);
  }
  function toScene4() { play('tick'); setScene(4); }

  // ── Understanding check ──
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

  const allCorrect = q1 === 'B' && q2 === 'B' && q3 === 'B';
  const allCorrectFiredRef = useRef(false);
  useEffect(() => {
    if (allCorrect && !allCorrectFiredRef.current) {
      allCorrectFiredRef.current = true;
      play('correct');
    }
  }, [allCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = allTapped && allCorrect && sentences >= 1;

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
        exerciseId: 'm4-t2-s1-jwt-intro',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            membershipCardUnderstood: true,
            threePartsTapped: { header: tapped.header, payload: tapped.payload, signature: tapped.signature },
            q1, q2, q3,
            attemptsPerQ: attempts.map(a => a + 1),
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="jwt-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>What JWT Is</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      <div className="scene-strip">
        {SCENES.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className={`s-line${scene > i ? ' done' : ''}`} />}
            <div className={`s-pill${scene > i + 1 ? ' done' : scene === i + 1 ? ' active' : ''}`}>{label}</div>
          </React.Fragment>
        ))}
      </div>

      <div className="layout">
        <div className="left-col" ref={railRef}>

          {/* SCENE 1 */}
          {scene === 1 && (
            <div className="card">
              <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>The problem you already know.</h2>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '10px 0' }}>gymowner → GET /gym/members + username + password, sent again, and again, and again.</p>
              {[1, 2, 3].map(i => (
                <div key={i} className="repeat-row">gymowner → GET /gym/members + username + password</div>
              ))}
              <div className="repeat-counter">3 requests. 3 times username/password sent. Same every time.</div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 16, textAlign: 'center' }}>What if you showed credentials once and got a card instead?</p>

              <div className="q-card" style={{ marginTop: 4 }}>
                <p className="q-title" style={{ fontSize: '0.85rem' }}>Quick check: what's the actual problem with sending username/password on every request?</p>
                {[
                  ['pw', "Passwords are too long to type"],
                  ['card', "The password travels across the network every single time - more chances to leak it"],
                  ['slow', "It makes the app run slower"],
                ].map(([val, label]) => (
                  <button key={val} className={`opt-btn${s1Answer === val ? (val === 'card' ? ' correct' : ' wrong') : ''}`} onClick={() => answerS1(val)}>{label}</button>
                ))}
                {s1Answer && s1Answer !== 'card' && <div className="qcheck-note wrong">Not quite - re-read the requests above. What is repeated, over and over, on the wire?</div>}
              </div>

              <button className="btn" disabled={s1Answer !== 'card'} onClick={toScene2}>{s1Answer === 'card' ? '→' : 'Answer the check above first'}</button>
            </div>
          )}

          {/* SCENE 2 */}
          {scene === 2 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800 }}>JWT — the gym membership card</h2>
              <p className="rail-prose" style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Three labels on the card (right) point to real JWT parts. Match each label to its part:
              </p>

              <div className="q-card" style={{ padding: '14px 16px' }}>
                {Object.keys(S2_CORRECT).map(label => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 6 }}>
                      "{label}" {s2Matched[label] && <span style={{ color: '#16A34A' }}>✓ {S2_CORRECT[label]}</span>}
                    </div>
                    {!s2Matched[label] && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {S2_PARTS.map(part => (
                          <button key={part} className="opt-btn" style={{ width: 'auto', display: 'inline-block', marginBottom: 0, padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => matchS2(label, part)}>{part}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {s2AllMatched && (
                <>
                  <div className="blue-card">
                    Step 1: gymowner logs in (POST /auth/login)<br />
                    Step 2: Server creates membership card (JWT token)<br />
                    Step 3: Card handed to gymowner<br /><br />
                    Step 4: gymowner shows card at door (GET /gym/members + token)<br />
                    Step 5: Door reads card → lets in
                  </div>
                  <div className="green-card">
                    Login once. Get the card (JWT token). Show the card on every request. Never send username/password again.
                  </div>
                </>
              )}
              <button className="btn" disabled={!s2AllMatched} onClick={toScene3}>{s2AllMatched ? "Show me the card's three parts →" : 'Match all three labels first'}</button>
            </div>
          )}

          {/* SCENE 3 */}
          {scene === 3 && (
            <div className="card">
              <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>JWT has three parts — like a college bus pass</h2>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '10px 0' }}>Tap each part to expand its explanation.</p>

              <div className="part-tap-row">
                <button className={`part-tap-btn${tapped.header ? ' tapped-header' : ''}`} onClick={() => selectPart('header')}>
                  <span className="part-tap-dot" style={{ background: '#3B82F6' }} /> Part 1 — Header
                </button>
                {activePart === 'header' && (
                  <div className="part-explain">
                    JWT Header:
                    <code>{'{ "alg": "HS256", "typ": "JWT" }'}</code>
                    Tells the server: "This token was created using algorithm HS256." Like the college name on the bus pass — identifies the type.
                  </div>
                )}

                <button className={`part-tap-btn${tapped.payload ? ' tapped-payload' : ''}`} onClick={() => selectPart('payload')}>
                  <span className="part-tap-dot" style={{ background: '#10B981' }} /> Part 2 — Payload (Details)
                </button>
                {activePart === 'payload' && (
                  <div className="part-explain">
                    JWT Payload:
                    <code>{'{ "username": "gymowner", "expiry": "2025-12-31" }'}</code>
                    The actual data inside the token. Who this belongs to. When it expires. Like your name and expiry date on the bus pass.
                  </div>
                )}

                <button className={`part-tap-btn${tapped.signature ? ' tapped-signature' : ''}`} onClick={() => selectPart('signature')}>
                  <span className="part-tap-dot" style={{ background: '#F59E0B' }} /> Part 3 — Signature
                </button>
                {activePart === 'signature' && (
                  <div className="part-explain">
                    JWT Signature: created using Header + Payload + Secret Key.<br /><br />
                    Your server has a secret key — a string only it knows. The signature is proof that nobody tampered with the token. If someone changes the payload — the signature breaks. Server rejects it. Like the principal's stamp — hard to fake.
                  </div>
                )}
              </div>

              {allTapped && (
                <>
                  <div className="blue-card">
                    Each part is Base64 encoded — that is why it looks like random characters. But real information is inside. The server can read it all.
                  </div>
                  <button className="btn" onClick={toScene4}>Why does the token expire? →</button>
                </>
              )}
            </div>
          )}

          {/* SCENE 4 */}
          {scene === 4 && (
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800 }}>Why tokens expire — and how your app uses them</h2>

              <div className="stolen-grid">
                <div className="stolen-col danger">
                  <div className="stolen-title">No expiry</div>
                  Card stolen → used forever ❌<br />
                  "Stolen card = permanent access"
                </div>
                <div className="stolen-col safe">
                  <div className="stolen-title">With expiry</div>
                  Card stolen → usable only briefly ✅<br />
                  "Expires in 24 hours. Stolen card becomes useless."
                </div>
              </div>

              <div className="blue-card">
                JWT tokens expire — usually 1 hour, 24 hours, or 7 days. After expiry → user logs in again. Gets a fresh token.<br /><br />
                Short expiry = safer. Long expiry = more convenient. You choose based on your app.
              </div>

              <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '16px 0 6px' }}>How it fits your app</p>
              <div className="before-after-grid">
                <div className="ba-col">
                  <div className="ba-title">Before (right now)</div>
                  POST /auth/login<br />→ "Login successful: gymowner"
                </div>
                <div className="ba-col after-col">
                  <div className="ba-title">After (Topic 2)</div>
                  POST /auth/login<br />→ {'{'} "token": "eyJhbGci..." {'}'}<br /><br />
                  GET /gym/members<br />Authorization: Bearer eyJhbGci...<br />→ members list ✅
                </div>
              </div>

              <div className="amber-card">
                'Authorization: Bearer [token]' is the standard way to carry a JWT token with a request.<br /><br />
                Bearer means: "I am carrying this token." Spring Security reads this header on every request and verifies the token.
              </div>

              <div className="q-card" style={{ marginTop: 16 }}>
                <p className="q-title">Q1: What is in the JWT payload?</p>
                {[['A', 'The encryption algorithm'], ['B', 'The username and expiry time'], ['C', "The server's secret key"], ['D', 'The HTTP method']].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q1 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(1, k, 'B', setQ1, q1)}>{k}) {label}</button>
                ))}
                {q1 && q1 !== 'B' && <div className="qcheck-note wrong">The payload contains the data — username and expiry time.</div>}
                {q1 === 'B' && <div className="qcheck-note correct">Correct!</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q2: Why does a JWT have a signature?</p>
                {[['A', 'To encrypt the username'], ['B', 'To prove the token was not tampered with'], ['C', 'To store the password'], ['D', 'To connect to MySQL']].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q2 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(2, k, 'B', setQ2, q2)}>{k}) {label}</button>
                ))}
                {q2 && q2 !== 'B' && <div className="qcheck-note wrong">The signature proves nobody tampered with the token.</div>}
                {q2 === 'B' && <div className="qcheck-note correct">Correct!</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q3: Why do JWT tokens expire?</p>
                {[['A', 'Because Spring Security requires it'], ['B', 'So stolen tokens become useless after a short time'], ['C', 'Because MySQL cannot store them'], ['D', 'To force users to register again']].map(([k, label]) => (
                  <button key={k} className={`opt-btn${q3 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(3, k, 'B', setQ3, q3)}>{k}) {label}</button>
                ))}
                {q3 && q3 !== 'B' && <div className="qcheck-note wrong">Short expiry means a stolen token becomes useless quickly.</div>}
                {q3 === 'B' && <div className="qcheck-note correct">Correct!</div>}
              </div>

              {allCorrect && (
                <div className="q-card">
                  <h4 style={{ margin: '0 0 8px' }}>Reflection</h4>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                    Using the gym membership card analogy — explain in one sentence what a JWT token is and when you use it.
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="A JWT token is like a gym membership card — you register once, log in once, and the server gives you a token that you show on every request instead of sending your username and password each time..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                  <button className="btn green" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Submitted ✅' : 'I understand JWT — add it to my app next →'}
                  </button>
                </div>
              )}

              {submitted && (
                <div className="celebration-card">
                  <b>JWT is clear. 🎫</b><br /><br />
                  Login once. Get a token. Show the token.<br />
                  Token carries your identity. Server verifies it. Expires for safety.<br /><br />
                  Next — 3.2.2.<br />
                  Add JWT to your Spring Boot app.<br />
                  Login returns a real token. Endpoints verify it on every request.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="right-col">
          <div className="sticky-panel">
            <LivingCard scene={scene} tapped={tapped} activePart={activePart} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LivingCard({ scene, tapped, activePart }) {
  // physically flip the card 90deg as `scene` changes, then unflip revealing
  // the new scene's content — sells the "one persistent object transforming"
  // illusion instead of an abrupt content swap.
  const [flipping, setFlipping] = useState(false);
  const [renderedScene, setRenderedScene] = useState(scene);
  const isFirstSceneRender = useRef(true);
  useEffect(() => {
    if (isFirstSceneRender.current) { isFirstSceneRender.current = false; setRenderedScene(scene); return; }
    if (scene === renderedScene) return;
    setFlipping(true);
    const t1 = setTimeout(() => { setRenderedScene(scene); setFlipping(false); }, 350);
    return () => clearTimeout(t1);
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card-stage">
      <div className="card-stage-label">
        {renderedScene === 1 && 'Repeated credentials'}
        {renderedScene === 2 && 'Your gym membership card'}
        {renderedScene === 3 && 'The three parts, live'}
        {renderedScene === 4 && 'Expiry — the safety valve'}
      </div>

      {renderedScene === 1 && (
        <div className="flip-outer">
          <div className={`flip-inner${flipping ? ' flipping' : ''}`}>
            <div className="stub-card">
              <div className="stub-row">→ GET /gym/members</div>
              <div className="stub-row">+ username + password</div>
              <div className="stub-row" style={{ opacity: 0.6 }}>→ GET /gym/members</div>
              <div className="stub-row" style={{ opacity: 0.6 }}>+ username + password</div>
              <div className="stub-row" style={{ opacity: 0.3 }}>→ GET /gym/members</div>
              <div className="stub-row" style={{ opacity: 0.3 }}>+ username + password</div>
              <div className="stub-warn">Same credentials, every time ⚠️</div>
            </div>
          </div>
        </div>
      )}

      {renderedScene === 2 && (
        <div className="flip-outer">
          <div className={`flip-inner${flipping ? ' flipping' : ''}`}>
            <div className="membership-card">
              <div className="mc-header-bar">🏋️ SAIFIT GYM</div>
              <div className="mc-body">
                <div className="mc-row"><span>Member</span><b>gymowner</b></div>
                <div className="mc-row"><span>Valid until</span><b>2025-12-31</b></div>
                <div className="mc-row"><span>Card ID</span><b>#1042</b></div>
                <div className="mc-stamp"><span className="mc-stamp-badge">✓ Verified</span></div>
              </div>
            </div>
            <div className="mc-label-tag">🏋️ Card type = HEADER · Member+expiry = PAYLOAD · Stamp = SIGNATURE</div>
            <div className="flow-mini">
              {['Login → server creates card', 'Card handed to gymowner', 'gymowner shows card at door', 'Door reads card → lets in ✅'].map((t, i) => (
                <div key={t} className="flow-mini-step" style={{ animationDelay: `${i * 0.25}s` }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {renderedScene === 3 && (
        <div className="flip-outer">
          <div className={`flip-inner${flipping ? ' flipping' : ''}`}>
            <div className="jwt-string-row">
              <span className={`jwt-seg header-seg${activePart === 'header' ? ' glow-header' : activePart ? ' dim' : ''}`}>eyJhbGci...</span>
              <span className="jwt-dot">.</span>
              <span className={`jwt-seg payload-seg${activePart === 'payload' ? ' glow-payload' : activePart ? ' dim' : ''}`}>eyJ1c2Vy...</span>
              <span className="jwt-dot">.</span>
              <span className={`jwt-seg signature-seg${activePart === 'signature' ? ' glow-signature' : activePart ? ' dim' : ''}`}>SflKxwRJ...</span>
            </div>

            {activePart === 'header' && (
              <div className="decoded-panel header-panel">{'{ "alg": "HS256", "typ": "JWT" }'}</div>
            )}
            {activePart === 'payload' && (
              <div className="decoded-panel payload-panel">{'{ "username": "gymowner", "exp": "2025-12-31" }'}</div>
            )}
            {activePart === 'signature' && (
              <div className="decoded-panel signature-panel">Header + Payload + Secret Key<br />→ SflKxwRJ_SmoothieScramble...</div>
            )}

            {tapped.header && tapped.payload && tapped.signature && (
              <div className="base64-note">Each part is Base64 encoded — that's why it looks like random characters. Real information is inside. The server can read it all.</div>
            )}
          </div>
        </div>
      )}

      {renderedScene === 4 && (
        <div className="flip-outer expiry-clock-wrap">
          <div className={`flip-inner${flipping ? ' flipping' : ''}`}>
            <svg className="expiry-svg" width="120" height="120" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="#F0FDF4" stroke="#16A34A" strokeWidth="3" />
              <line x1="50" y1="50" x2="50" y2="24" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
              <g className="clock-hand-min"><line x1="50" y1="50" x2="70" y2="50" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" /></g>
              <circle cx="50" cy="50" r="3" fill="#16A34A" />
            </svg>
            <div className="expiry-lbl">Valid: 24 hours</div>
            <div className="before-after-grid" style={{ marginTop: 18, maxWidth: 320 }}>
              <div className="ba-col"><div className="ba-title">Stolen, no expiry</div>Used forever ❌</div>
              <div className="ba-col"><div className="ba-title">Stolen, expires</div>Useless in 24h ✅</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
