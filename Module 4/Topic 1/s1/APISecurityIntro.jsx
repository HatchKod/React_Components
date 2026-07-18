import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }
  .btn.green { background: #16A34A; }
  .btn.green:hover { background: #15803D; }

  /* Layout: left attacker console, right live dashboard */
  .attack-layout { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; max-width: 1200px; margin: 0 auto; align-items: start; }
  @media(max-width:960px) { .attack-layout { grid-template-columns: 1fr; } }
  .attack-left, .attack-right { min-width: 0; }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }

  /* Attacker scenario card */
  .scenario-card { background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; color: #7F1D1D; font-size: 0.9rem; line-height: 1.7; }
  .scenario-title { font-weight: 800; color: #991B1B; margin-bottom: 6px; font-size: 1rem; }

  /* Attack buttons */
  .attack-btn { display: flex; align-items: stretch; width: 100%; text-align: left; border: none; border-radius: 10px;
    background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; margin-bottom: 12px; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s; padding: 0; }
  .attack-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
  .attack-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .attack-btn.flashing { animation: dangerFlash 0.4s ease; }
  @keyframes dangerFlash { 0%,100% { background: #fff; } 50% { background: #FEE2E2; } }
  .attack-badge { flex: 0 0 74px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.78rem; color: #fff; letter-spacing: 0.03em; }
  .attack-badge.get { background: #16A34A; }
  .attack-badge.delete { background: #DC2626; }
  .attack-badge.post { background: #2563EB; }
  .attack-badge.put { background: #EA580C; }
  .attack-body { flex: 1; padding: 14px 16px; }
  .attack-url { font-family: 'Courier New', monospace; font-size: 0.85rem; font-weight: 700; color: #1E293B; }
  .attack-desc { font-size: 0.8rem; color: #64748B; margin-top: 2px; }
  .attack-lock-note { font-size: 0.72rem; color: #94A3B8; margin-top: 2px; font-style: italic; }

  .attack-outcome { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 14px 16px; margin: -4px 0 16px; font-size: 0.85rem; color: #78350F; line-height: 1.7; animation: slideIn 0.3s ease; }
  .attack-outcome.blocked { background: #F0FDF4; border-left-color: #16A34A; color: #14532D; }

  /* Attack 5 summary */
  .summary-card { background: #FEF2F2; border: 2px solid #DC2626; border-radius: 14px; padding: 22px; margin-bottom: 20px; animation: slideIn 0.4s ease; }
  .summary-title { font-weight: 900; color: #991B1B; font-size: 1.05rem; margin-bottom: 12px; }
  .summary-list { color: #7F1D1D; font-size: 0.92rem; line-height: 2; margin: 0 0 14px; }

  /* === RIGHT SIDE: live hacker dashboard === */
  .dash-shell { background: #0B0F19; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.35); border: 1px solid #1E293B; }
  .dash-topbar { background: #111827; padding: 10px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1F2937; }
  .dash-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dash-dot.r { background: #EF4444; } .dash-dot.y { background: #F59E0B; } .dash-dot.g { background: #10B981; }
  .dash-title { color: #94A3B8; font-size: 0.75rem; font-weight: 700; margin-left: 8px; font-family: monospace; }
  .dash-status-pill { margin-left: auto; font-size: 0.68rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .dash-status-pill.open { background: rgba(239,68,68,0.15); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.4); }
  .dash-status-pill.locked { background: rgba(16,185,129,0.15); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.4); }

  .dash-body { display: grid; grid-template-columns: 1fr; gap: 0; }

  /* Door / gate strip */
  .gate-strip { padding: 14px 18px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #1F2937; background: #0F1523; }
  .gate-icon-wrap { flex: 0 0 auto; }
  .gate-label { flex: 1; font-family: monospace; font-size: 0.78rem; color: #94A3B8; }
  .gate-label b { color: #E2E8F0; }
  .gate-badge { flex: 0 0 auto; font-size: 0.68rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
  .gate-badge.danger { background: rgba(239,68,68,0.15); color: #FCA5A5; }
  .gate-badge.safe { background: rgba(16,185,129,0.15); color: #6EE7B7; }

  /* Terminal (live typing console) */
  .term-wrap { padding: 16px 18px; border-bottom: 1px solid #1F2937; min-height: 150px; }
  .term-label { color: #64748B; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .term-body { font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.8rem; line-height: 1.7; color: #4ADE80; white-space: pre-wrap; word-break: break-word; min-height: 90px; }
  .term-idle { color: #475569; font-style: italic; }
  .term-cursor { display: inline-block; width: 7px; height: 14px; background: #4ADE80; margin-left: 2px; animation: blink 0.9s step-end infinite; vertical-align: middle; }
  @keyframes blink { 50% { opacity: 0; } }
  .term-status-line { margin-top: 8px; font-weight: 800; }
  .term-status-line.ok200 { color: #4ADE80; }
  .term-status-line.blocked401 { color: #F87171; }

  /* 401 bubble */
  .bubble-401 { display: inline-block; background: rgba(239,68,68,0.12); border: 1.5px solid #EF4444; color: #FCA5A5;
    border-radius: 10px; padding: 8px 14px; margin-top: 10px; font-family: monospace; font-size: 0.78rem; animation: popBounce 0.4s ease; }
  @keyframes popBounce { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }

  /* Database grid */
  .db-wrap { padding: 16px 18px; }
  .db-label-row { display: flex; align-items: center; margin-bottom: 8px; }
  .db-label { color: #64748B; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
  .db-counter { margin-left: auto; font-family: monospace; font-size: 0.72rem; color: #94A3B8; }
  .db-table-scroll { overflow-x: auto; border-radius: 8px; border: 1px solid #1F2937; }
  .db-table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.76rem; }
  .db-table th { background: #111827; color: #64748B; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.65rem; border-bottom: 1px solid #1F2937; }
  .db-table td { padding: 8px 10px; color: #CBD5E1; border-bottom: 1px solid #161C2C; transition: background 0.3s, color 0.3s; }
  .db-row-exposed td { background: rgba(250,204,21,0.14); }
  .db-row-deleted { animation: rowFadeOut 0.6s ease forwards; }
  @keyframes rowFadeOut { to { opacity: 0; transform: scaleY(0); } }
  .db-row-fake td { background: rgba(239,68,68,0.16); color: #FCA5A5; }
  .db-cell-tampered { background: rgba(251,146,60,0.22) !important; color: #FDBA74 !important; font-weight: 700; }
  .db-protected-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: rgba(16,185,129,0.14); border: 1px solid rgba(16,185,129,0.4); color: #6EE7B7; font-size: 0.72rem; font-weight: 700; padding: 5px 12px; border-radius: 20px; }

  /* Threat log sidebar (below dashboard) */
  .threat-log { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 18px 20px; margin-top: 20px; }
  .threat-log-title { font-weight: 800; font-size: 0.85rem; color: #991B1B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .threat-empty { color: #94A3B8; font-style: italic; font-size: 0.85rem; text-align: center; padding: 20px 0; }
  .threat-entry { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px dashed #FECACA; animation: slideIn 0.3s ease; }
  .threat-entry:last-child { border-bottom: none; }
  .threat-entry.blocked { border-bottom-color: #BBF7D0; }
  .threat-num { flex: 0 0 22px; height: 22px; border-radius: 50%; background: #DC2626; color: #fff; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .threat-entry.blocked .threat-num { background: #16A34A; }
  .threat-text { font-size: 0.82rem; color: #374151; line-height: 1.5; }
  .threat-text b { color: #1E293B; }

  /* Spring Security points */
  .point-card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 28px; text-align: center; max-width: 560px; margin: 0 auto; }
  .point-icon { font-size: 3rem; margin-bottom: 12px; }
  .point-title { font-weight: 800; font-size: 1.15rem; margin-bottom: 14px; color: #1E293B; }
  .point-body { color: #374151; font-size: 0.95rem; line-height: 1.8; text-align: left; }
  .point-dots { display: flex; justify-content: center; gap: 6px; margin-top: 20px; }
  .point-dot { width: 8px; height: 8px; border-radius: 50%; background: #E2E8F0; }
  .point-dot.active { background: #3B82F6; }

  /* Transition banners */
  .banner-green { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 14px; padding: 22px; margin-bottom: 20px; text-align: center; color: #14532D; font-size: 0.98rem; line-height: 1.8; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .banner-green b { color: #166534; }

  /* Reveal + task */
  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; padding: 24px; margin-top: 20px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .reveal-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.95rem; animation: slideIn 0.4s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .q-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #1E293B; }
  .opt-btn { display: block; width: 100%; text-align: left; padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600;
    cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; margin-bottom: 8px; transition: all 0.2s; }
  .opt-btn:hover { border-color: #94A3B8; }
  .opt-btn.correct { background: #F0FDF4; border-color: #16A34A; color: #14532D; }
  .opt-btn.wrong { background: #FEF2F2; border-color: #DC2626; color: #7F1D1D; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .task-wrap { max-width: 900px; margin: 24px auto 0; }
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
    } catch(e) {}
  }, []);
  return { play, muted };
}

// ─── Live-typing terminal line ───────────────────────────────────────────
// Renders `text` character-by-character to feel like a real console stream,
// re-triggering whenever `runId` changes (even if text is identical).
function useTypewriter(text, runId, speed = 14) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setShown(''); setDone(true); return; }
    setShown('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, runId, speed]);
  return { shown, done };
}

// ─── Initial + mutable database state ────────────────────────────────────
const INITIAL_ROWS = [
  { id: 1, name: 'Ravi', age: 21, plan: 'Basic', isActive: true },
  { id: 2, name: 'Priya', age: 22, plan: 'Premium', isActive: true },
  { id: 3, name: 'Kiran', age: 25, plan: 'Annual', isActive: true },
];

const ATTACKS = [
  {
    id: 'get', method: 'GET', color: 'get',
    url: '/gym/members',
    desc: 'see everyone’s data',
    responseTerm: 'GET /gym/members\n→ 200 OK\n\n[\n  { "id":1, "name":"Ravi", "age":21, "plan":"Basic" },\n  { "id":2, "name":"Priya", "age":22, "plan":"Premium" },\n  { "id":3, "name":"Kiran", "age":25, "plan":"Annual" }\n]',
    responseTermBlocked: 'GET /gym/members\n→ 401 Unauthorized\n\n{ "error": "Full authentication is required" }',
    outcome: 'All 3 members. Full details - name, age, membership plan. You didn’t log in. You didn’t need to. In a real gym, this is personal data of 200+ people. Exposed to anyone.',
    outcomeBlocked: 'Blocked before it reached the database. The server demanded proof of identity first - you had none.',
    threat: 'Read <b>all member records</b> - no login required.',
    dbEffect: 'expose',
  },
  {
    id: 'delete', method: 'DELETE', color: 'delete',
    url: '/gym/members/1',
    desc: 'delete Ravi’s record',
    responseTerm: 'DELETE /gym/members/1\n→ 200 OK\n\n"Deleted: 1"',
    responseTermBlocked: 'DELETE /gym/members/1\n→ 401 Unauthorized\n\n{ "error": "Full authentication is required" }',
    outcome: 'Ravi is deleted. Gone from the database. No warning, no confirmation. You were never asked for a password. The gym owner doesn’t know. Real member data - gone.',
    outcomeBlocked: 'The DELETE never touched the database. Ravi’s record is untouched.',
    threat: '<b>Deleted Ravi’s record</b> - permanently, with zero confirmation.',
    dbEffect: 'delete',
  },
  {
    id: 'post', method: 'POST', color: 'post',
    url: '/gym/members',
    desc: 'add a fake member',
    responseTerm: 'POST /gym/members\nBody: { "name":"FAKE_USER", "age":0, "plan":"HACKED", "isActive":true }\n→ 200 OK\n\n{ "id":4, "name":"FAKE_USER", "plan":"HACKED" }',
    responseTermBlocked: 'POST /gym/members\n→ 401 Unauthorized\n\n{ "error": "Full authentication is required" }',
    outcome: 'A fake member with plan ‘HACKED’ is now in the gym’s database. In a real system, billing, reports, everything downstream is now wrong. Corrupt data. Real damage.',
    outcomeBlocked: 'The fake record never made it in. The database has exactly the members it should.',
    threat: 'Injected a <b>fake member</b> with plan "HACKED" into the database.',
    dbEffect: 'inject',
  },
  {
    id: 'put', method: 'PUT', color: 'put',
    url: '/gym/members/2',
    desc: 'change Priya’s plan for free',
    responseTerm: 'PUT /gym/members/2\nBody: { "name":"Priya", "age":22, "plan":"Annual", "isActive":true }\n→ 200 OK',
    responseTermBlocked: 'PUT /gym/members/2\n→ 401 Unauthorized\n\n{ "error": "Full authentication is required" }',
    outcome: 'Priya just got upgraded to the Annual plan - for free. The gym owner loses money. Priya doesn’t know. Business data tampered. No one was stopped.',
    outcomeBlocked: 'Priya’s plan stays exactly as it was. The tamper attempt never reached the row.',
    threat: '<b>Tampered with Priya’s plan</b> - upgraded her for free, silently.',
    dbEffect: 'tamper',
  },
];

export default function APISecurityIntro() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  const [phase, setPhase] = useState(1); // 1 = attack, 2 = fix, 3 = task
  const [attackStep, setAttackStep] = useState(0); // how many attacks unlocked (0..4), 4 = summary shown
  const [activeAttackId, setActiveAttackId] = useState(null);
  const [flashingId, setFlashingId] = useState(null);
  const [termRunId, setTermRunId] = useState(0);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [rowEffect, setRowEffect] = useState(null); // { type, rowId }
  const [threatLog, setThreatLog] = useState([]);
  const [gateOpen, setGateOpen] = useState(true);
  const [bubble401, setBubble401] = useState(null); // { key }

  const currentAttack = activeAttackId ? ATTACKS.find(a => a.id === activeAttackId) : null;
  const isReplay = phase >= 2;
  const termText = currentAttack ? (isReplay ? currentAttack.responseTermBlocked : currentAttack.responseTerm) : '';
  const { shown: termShown, done: termDone } = useTypewriter(termText, termRunId, 10);

  function runAttack(attack) {
    setActiveAttackId(attack.id);
    setFlashingId(attack.id);
    setTermRunId(k => k + 1);
    setTimeout(() => setFlashingId(null), 400);

    if (!isReplay) {
      play('warn');
      // apply the real database mutation
      setTimeout(() => {
        if (attack.dbEffect === 'expose') {
          setRowEffect({ type: 'expose' });
          setTimeout(() => setRowEffect(null), 900);
        } else if (attack.dbEffect === 'delete') {
          setRowEffect({ type: 'delete', rowId: 1 });
          setTimeout(() => {
            setRows(r => r.filter(x => x.id !== 1));
            setRowEffect(null);
          }, 550);
        } else if (attack.dbEffect === 'inject') {
          setRows(r => [...r, { id: 4, name: 'FAKE_USER', age: 0, plan: 'HACKED', isActive: true, fake: true }]);
        } else if (attack.dbEffect === 'tamper') {
          setRowEffect({ type: 'tamper', rowId: 2 });
          setRows(r => r.map(x => x.id === 2 ? { ...x, plan: 'Annual' } : x));
        }
      }, 350);
      setThreatLog(log => [...log, { text: attack.threat, blocked: false }]);
      setTimeout(() => setAttackStep(s => Math.max(s, ATTACKS.findIndex(a => a.id === attack.id) + 1)), 700);
    } else {
      // replay: blocked
      setTimeout(() => {
        play('correct');
        setBubble401({ key: Date.now() });
        setThreatLog(log => [...log, { text: `${attack.method} ${attack.url} - blocked by Spring Security.`, blocked: true }]);
        setTimeout(() => setBubble401(null), 2000);
      }, 500);
      setReplayDone(s => new Set([...s, attack.id]));
    }
  }

  const [replayDone, setReplayDone] = useState(new Set());

  const allAttacksDone = attackStep >= 4;
  const allReplaysDone = replayDone.size >= ATTACKS.length;

  const summaryFiredRef = useRef(false);
  useEffect(() => {
    if (allAttacksDone && !summaryFiredRef.current) {
      summaryFiredRef.current = true;
      setTimeout(() => play('warn'), 400);
    }
  }, [allAttacksDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const allReplaysFiredRef = useRef(false);
  useEffect(() => {
    if (allReplaysDone && !allReplaysFiredRef.current) {
      allReplaysFiredRef.current = true;
      play('correct');
    }
  }, [allReplaysDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToFix() {
    play('tick');
    setPhase(2);
    setGateOpen(true);
    setActiveAttackId(null);
  }

  // ── Spring Security 3-point explainer ──
  const [pointIndex, setPointIndex] = useState(0); // 0,1,2 -> 3 = done, replay unlocked
  function nextPoint() {
    play('tick');
    if (pointIndex >= 2) {
      setPointIndex(3);
      setGateOpen(false); // lock the door visually
    } else {
      setPointIndex(i => i + 1);
    }
  }

  const showReplay = pointIndex >= 3;

  // ── Reveal card ──
  const [revealCount, setRevealCount] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allReplaysDone && !revealFiredRef.current) {
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
  }, [allReplaysDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Task: 3 questions + reflection ──
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [attempts, setAttempts] = useState([0, 0, 0]);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function answerQ(qNum, val, correctVal, setter, current) {
    if (current === correctVal) return;
    setter(val);
    if (val === correctVal) {
      play('correct');
    } else {
      play('warn');
      setAttempts(a => { const n = [...a]; n[qNum - 1] += 1; return n; });
    }
  }

  const allCorrect = q1 === 'C' && q2 === 'B' && q3 === 'B';
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
        exerciseId: 'm3-t1-s1-api-security-intro',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            attacksPerformed: { getAll: true, deleteOne: true, postFake: true, putTamper: true },
            dangerUnderstood: true,
          },
          phase2: {
            springSecurityPoints: [1, 2, 3],
            replayAttacksBlocked: allReplaysDone,
          },
          task: { q1, q2, q3, attemptsPerQ: attempts.map(a => a + 1), reflectionText: reflection },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // helper: which attack is "next" to unlock in phase 1
  const nextIdx = attackStep; // 0..3 index of next available attack; 4 => all done

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>API Security Intro</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      {phase === 1 && (
        <div className="attack-layout">
          {/* ── LEFT: attacker console ── */}
          <div className="attack-left">
            <div className="card">
              <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>You are the attacker.</h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Your friend gave you this URL. You’ve never logged in. You have no password. Try these requests and see what happens.
              </p>

              <div className="scenario-card">
                <div className="scenario-title">The setup</div>
                Imagine you’re not Ravi - you’re a stranger in Ravi’s college. You overheard the gym API URL.
                You have Postman open. You’ve never registered. You have no credentials.
                <br /><br />
                <strong>Let’s see what you can do.</strong>
              </div>

              {ATTACKS.map((a, i) => {
                const locked = i > nextIdx;
                const isDone = i < nextIdx || (i === nextIdx && activeAttackId === a.id);
                return (
                  <div key={a.id}>
                    <button
                      className={`attack-btn${flashingId === a.id ? ' flashing' : ''}`}
                      disabled={locked}
                      onClick={() => !locked && runAttack(a)}
                    >
                      <div className={`attack-badge ${a.color}`}>{a.method}</div>
                      <div className="attack-body">
                        <div className="attack-url">{a.url}</div>
                        <div className="attack-desc">{a.desc}</div>
                        {locked && <div className="attack-lock-note">Complete previous attack first</div>}
                      </div>
                    </button>
                    {activeAttackId === a.id && termDone && (
                      <div className="attack-outcome">{a.outcome}</div>
                    )}
                  </div>
                );
              })}

              {allAttacksDone && (
                <div className="summary-card">
                  <div className="summary-title">What a stranger with your URL can do RIGHT NOW:</div>
                  <div className="summary-list">
                    ❌ Read all member data<br />
                    ❌ Delete any record<br />
                    ❌ Add fake records<br />
                    ❌ Change real records
                  </div>
                  <p style={{ color: '#7F1D1D', fontSize: '0.9rem', margin: '0 0 16px' }}>
                    Without logging in. Without a password. Without any permission.<br />
                    <strong>This is not a hypothetical risk. This is your API right now.</strong>
                  </p>
                  <button className="btn" style={{ background: '#DC2626', width: '100%' }} onClick={goToFix}>See the fix →</button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: live dashboard ── */}
          <div className="attack-right">
            <DashboardPanel
              gateOpen={gateOpen}
              currentAttack={currentAttack}
              termShown={termShown}
              termDone={termDone}
              isReplay={false}
              rows={rows}
              rowEffect={rowEffect}
              bubble401={bubble401}
            />
            <ThreatLog entries={threatLog} />
          </div>
        </div>
      )}

      {phase === 2 && (
        <>
          <div className="banner-green">
            There is a fix. <b>One dependency.</b><br />
            Your entire API locks down. Every endpoint protected. No request gets through without proving who it is.<br />
            It is called <b>Spring Security</b>.
          </div>

          {!showReplay && (
            <div className="point-card">
              {pointIndex === 0 && (
                <>
                  <div className="point-icon">🔒</div>
                  <div className="point-title">Spring Security - lock on every door</div>
                  <div className="point-body">
                    <b>Before Spring Security:</b> Your API door is open. Anyone walks in.<br /><br />
                    <b>After Spring Security:</b> Every door is locked by default.<br /><br />
                    Not one endpoint. Not some endpoints. <b>EVERY endpoint. All of them. Automatically.</b>
                  </div>
                </>
              )}
              {pointIndex === 1 && (
                <>
                  <div className="point-icon">🪪</div>
                  <div className="point-title">You decide who gets a key</div>
                  <div className="point-body">
                    Gym owner → key to everything.<br />
                    Registered member → key to their own data.<br />
                    Stranger → no key. Door stays locked.<br /><br />
                    You write the rules. Spring Security enforces them.
                  </div>
                </>
              )}
              {pointIndex === 2 && (
                <>
                  <div className="point-icon">📦</div>
                  <div className="point-title">How to add it</div>
                  <div className="point-body">
                    One new line in <code>pom.xml</code>. That is all you add.<br /><br />
                    Spring Security reads your app, locks every endpoint, and waits for you to configure who gets in.<br /><br />
                    You’ll do this in the next subtopic.
                  </div>
                </>
              )}
              <button className="btn" style={{ marginTop: 20, width: '100%' }} onClick={nextPoint}>
                {pointIndex < 2 ? 'Next →' : 'I understand →'}
              </button>
              <div className="point-dots">
                {[0,1,2].map(i => <div key={i} className={`point-dot${i <= pointIndex ? ' active' : ''}`} />)}
              </div>
            </div>
          )}

          {showReplay && (
            <div className="attack-layout">
              <div className="attack-left">
                <div className="card">
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800 }}>Same attacks. Spring Security active.</h2>
                  <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 16px' }}>Try each request again - watch what happens now.</p>

                  {ATTACKS.map((a) => {
                    const done = replayDone.has(a.id);
                    return (
                      <button
                        key={a.id}
                        className={`attack-btn${flashingId === a.id ? ' flashing' : ''}`}
                        disabled={done}
                        onClick={() => !done && runAttack(a)}
                      >
                        <div className={`attack-badge ${a.color}`}>{a.method}</div>
                        <div className="attack-body">
                          <div className="attack-url">{a.url}</div>
                          <div className="attack-desc">{done ? 'Blocked ✅' : a.desc}</div>
                        </div>
                      </button>
                    );
                  })}

                  {allReplaysDone && (
                    <div className="attack-outcome blocked" style={{ marginTop: 8 }}>
                      Every attack blocked. Every endpoint locked. Same stranger. Same URL. Spring Security active. <b>Zero damage.</b>
                    </div>
                  )}
                </div>
              </div>

              <div className="attack-right">
                <DashboardPanel
                  gateOpen={false}
                  currentAttack={currentAttack}
                  termShown={termShown}
                  termDone={termDone}
                  isReplay={true}
                  rows={rows}
                  rowEffect={null}
                  bubble401={bubble401}
                  protectedBadge={allReplaysDone}
                />
                <ThreatLog entries={threatLog} />
              </div>
            </div>
          )}

          {revealCount > 0 && (
            <div className="reveal-card">
              <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>What you just learned</h3>
              {revealCount >= 1 && <div className="reveal-line">✅ <span><b>Authentication</b> → proving who you are - "I am Ravi, gym owner"</span></div>}
              {revealCount >= 2 && <div className="reveal-line">✅ <span><b>Authorization</b> → what you’re allowed to do - "Ravi can access everything, members only their own"</span></div>}
              {revealCount >= 3 && <div className="reveal-line">✅ <span><b>Endpoint</b> → each URL on your API - currently all unprotected</span></div>}
              {revealCount >= 4 && <div className="reveal-line">✅ <span><b>Spring Security</b> → one dependency - locks every endpoint</span></div>}
              {revealCount >= 5 && <div className="reveal-line">✅ <span><b>401 Unauthorized</b> → "prove who you are first"</span></div>}
              {revealCount >= 6 && <div className="reveal-line">✅ <span><b>403 Forbidden</b> → "I know who you are, but you can’t access this"</span></div>}
              {revealCount >= 6 && (
                <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.8 }}>
                  Your API is open right now. Any stranger with your URL can read, delete, and corrupt your data.<br />
                  Next subtopic - one dependency. Every door locks.
                </p>
              )}
            </div>
          )}

          {revealCount >= 6 && (
            <div className="task-wrap">
              <div className="card">
                <h2 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 800 }}>Understanding check</h2>

                <div className="q-card">
                  <p className="q-title">Q1: What can a stranger do to your API RIGHT NOW without logging in?</p>
                  {[
                    ['A', 'Nothing - APIs are protected by default'],
                    ['B', 'Only read data - not change it'],
                    ['C', 'Read, delete, add, and change any data - with no restriction'],
                    ['D', 'Only add data - not delete'],
                  ].map(([k, label]) => (
                    <button key={k} className={`opt-btn${q1 === k ? (k === 'C' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(1, k, 'C', setQ1, q1)}>{k}) {label}</button>
                  ))}
                  {q1 && q1 !== 'C' && <div style={{ color: '#B45309', fontSize: '0.82rem', marginTop: 6 }}>Try again - remember what you just did as the attacker.</div>}
                </div>

                <div className="q-card">
                  <p className="q-title">Q2: What does Spring Security do when you first add it?</p>
                  {[
                    ['A', 'Locks only the DELETE endpoints'],
                    ['B', 'Locks every endpoint automatically - nothing gets through without proving who you are'],
                    ['C', 'Locks only endpoints you configure'],
                    ['D', 'Creates a login page automatically'],
                  ].map(([k, label]) => (
                    <button key={k} className={`opt-btn${q2 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(2, k, 'B', setQ2, q2)}>{k}) {label}</button>
                  ))}
                </div>

                <div className="q-card">
                  <p className="q-title">Q3: What is the difference between Authentication and Authorization?</p>
                  {[
                    ['A', 'They are the same thing'],
                    ['B', 'Authentication = proving who you are. Authorization = what you’re allowed to do after proving it'],
                    ['C', 'Authorization = proving who you are. Authentication = what you can access'],
                    ['D', 'Authentication is for APIs. Authorization is for databases'],
                  ].map(([k, label]) => (
                    <button key={k} className={`opt-btn${q3 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(3, k, 'B', setQ3, q3)}>{k}) {label}</button>
                  ))}
                </div>

                {allCorrect && (
                  <>
                    <h4 style={{ margin: '20px 0 8px' }}>Reflection</h4>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                      In one sentence - using the open shop analogy, explain why your API needs Spring Security.
                    </p>
                    <textarea
                      className="reflection-box"
                      placeholder="My API is like a shop with the door unlocked at night - anyone who knows the URL can walk in and read, delete, or corrupt my data. Spring Security is the lock because..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      onPaste={e => e.preventDefault()}
                    />
                    <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                    <button className="btn green" style={{ width: '100%', marginTop: 16, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                      {submitted ? 'Submitted ✅' : 'I understand the risk - let’s add the lock →'}
                    </button>

                    {submitted && (
                      <div style={{ marginTop: 16, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46' }}>
                        <b>The problem is clear. 🔒</b><br /><br />
                        Next - one dependency. You add <code>spring-boot-starter-security</code> to pom.xml.<br />
                        Every endpoint locks automatically. Then you configure who gets in - and how.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Live hacker-style dashboard: gate strip + terminal + DB grid ─────────
function DashboardPanel({ gateOpen, currentAttack, termShown, termDone, isReplay, rows, rowEffect, bubble401, protectedBadge }) {
  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <div className="dash-dot r" /><div className="dash-dot y" /><div className="dash-dot g" />
        <span className="dash-title">gym-api :: live traffic monitor</span>
        <span className={`dash-status-pill ${gateOpen ? 'open' : 'locked'}`}>{gateOpen ? 'unprotected' : 'locked'}</span>
      </div>

      <div className="dash-body">
        <div className="gate-strip">
          <div className="gate-icon-wrap">
            <GateIcon open={gateOpen} />
          </div>
          <div className="gate-label">
            <b>Your API gateway</b><br />
            {gateOpen ? 'no security check - every request passes straight through' : 'Spring Security active - identity required'}
          </div>
          <div className={`gate-badge ${gateOpen ? 'danger' : 'safe'}`}>{gateOpen ? '❌ open' : '✅ locked'}</div>
        </div>

        <div className="term-wrap">
          <div className="term-label">Response stream</div>
          <div className="term-body">
            {!currentAttack ? (
              <span className="term-idle">waiting for a request...</span>
            ) : (
              <>
                {termShown}
                {!termDone && <span className="term-cursor" />}
              </>
            )}
            {bubble401 && (
              <div className="bubble-401" key={bubble401.key}>
                401 Unauthorized<br />You need to prove who you are first.
              </div>
            )}
          </div>
        </div>

        <div className="db-wrap">
          <div className="db-label-row">
            <span className="db-label">gym_member table</span>
            <span className="db-counter">rows: {rows.length}</span>
          </div>
          <div className="db-table-scroll">
            <table className="db-table">
              <thead>
                <tr><th>id</th><th>name</th><th>age</th><th>plan</th><th>active</th></tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const isExposed = rowEffect?.type === 'expose';
                  const isDeleting = rowEffect?.type === 'delete' && rowEffect.rowId === r.id;
                  const isTampered = rowEffect?.type === 'tamper' && rowEffect.rowId === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={`${isExposed ? 'db-row-exposed' : ''} ${isDeleting ? 'db-row-deleted' : ''} ${r.fake ? 'db-row-fake' : ''}`}
                    >
                      <td>{r.id}</td>
                      <td>{r.name}{r.fake && ' ⚠️'}</td>
                      <td>{r.age}</td>
                      <td className={isTampered ? 'db-cell-tampered' : ''}>{r.plan}</td>
                      <td>{String(r.isActive)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {protectedBadge && <div className="db-protected-badge">✅ Data protected - no changes got through</div>}
        </div>
      </div>
    </div>
  );
}

function GateIcon({ open }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <rect x="8" y="8" width="36" height="36" rx="4" fill="none" stroke={open ? '#EF4444' : '#10B981'} strokeWidth="2.5" />
      {open ? (
        <path d="M26 8 L44 12 L44 44 L26 44 Z" fill="rgba(239,68,68,0.12)" stroke="#EF4444" strokeWidth="2" />
      ) : (
        <>
          <rect x="8" y="8" width="36" height="36" rx="4" fill="rgba(16,185,129,0.1)" />
          <circle cx="26" cy="26" r="7" fill="none" stroke="#10B981" strokeWidth="2.5" />
          <rect x="23" y="26" width="6" height="9" rx="1.5" fill="#10B981" />
        </>
      )}
    </svg>
  );
}

// ─── Threat log: an accumulating "rap sheet" of every exploit performed ───
function ThreatLog({ entries }) {
  return (
    <div className="threat-log">
      <div className="threat-log-title">🧾 Threat log</div>
      {entries.length === 0 ? (
        <div className="threat-empty">No requests sent yet.</div>
      ) : (
        entries.map((e, i) => (
          <div className={`threat-entry${e.blocked ? ' blocked' : ''}`} key={i}>
            <div className="threat-num">{e.blocked ? '✓' : i + 1}</div>
            <div className="threat-text" dangerouslySetInnerHTML={{ __html: e.text }} />
          </div>
        ))
      )}
    </div>
  );
}
