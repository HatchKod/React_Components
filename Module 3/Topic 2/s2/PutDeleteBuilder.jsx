import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .split-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; max-width: 1100px; margin: 0 auto; }
  .split-layout > .split-right-col { align-self: stretch; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:900px) {
    .split-layout { grid-template-columns: 1fr; }
    .sticky-panel { position: static; }
  }

  .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 24px; border-left: 4px solid transparent; transition: all 0.3s; }
  .card.active { border-left-color: #3B82F6; box-shadow: 0 8px 24px rgba(59,130,246,0.15); }
  .card.complete { border-left-color: #10B981; }
  .card-header { font-size: 1.25rem; font-weight: 700; margin: 0 0 16px 0; color: #1E293B; }
  .step-counter { font-size: 0.8rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-block; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #9CA3AF; cursor: not-allowed; }
  .btn.green { background: #10B981; }
  .btn.green:hover { background: #059669; }
  .btn.orange { background: #F97316; }
  .btn.orange:hover { background: #EA580C; }

  /* Code blocks */
  .code-block { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; margin: 12px 0; position: relative; overflow-x: auto; }
  .ck { color: #60A5FA; }
  .ca { color: #E879F9; }
  .cs { color: #4ADE80; }
  .cc { color: #9CA3AF; }
  .cy { color: #FACC15; }
  .co { color: #FB923C; }
  .cpv { color: #E879F9; }

  /* Blanks */
  .blank-wrap { display: inline-block; margin: 0 4px; }
  .blank-input { background: #334155; color: white; border: 1.5px solid #64748B; padding: 3px 10px; border-radius: 4px; font-family: inherit; font-size: inherit; width: 150px; outline: none; }
  .blank-correct { border-color: #10B981 !important; background: rgba(16,185,129,0.15) !important; }
  .blank-wrong { border-color: #EF4444 !important; animation: shake 0.3s; }

  /* Path variable URL builder */
  .url-builder { background: #1E293B; border-radius: 10px; padding: 16px 18px; font-family: monospace; font-size: 1rem; margin: 12px 0; overflow-x: auto; white-space: nowrap; }
  .url-var { color: #8B5CF6; font-weight: 700; }
  .url-typed { color: #4ADE80; font-weight: 700; }
  .url-input-row { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
  .url-text-input { flex: 1; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; font-family: monospace; font-size: 0.95rem; outline: none; }
  .url-text-input:focus { border-color: #8B5CF6; }

  /* CRUD table */
  .crud-table { width: 100%; border-collapse: collapse; margin: 16px 0; overflow-x: auto; display: block; }
  .crud-table thead, .crud-table tbody { display: table; width: 100%; table-layout: fixed; }
  .crud-table th { text-align: left; font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 2px solid #E2E8F0; }
  .crud-table td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; font-size: 0.88rem; }
  .method-badge { font-weight: 800; padding: 3px 10px; border-radius: 4px; font-size: 0.78rem; display: inline-block; }
  .badge-get { background: #DCFCE7; color: #166534; }
  .badge-post { background: #DBEAFE; color: #1E40AF; }
  .badge-put { background: #FEF3C7; color: #92400E; }
  .badge-delete { background: #FEE2E2; color: #991B1B; }
  @media(max-width:600px) { .crud-table { font-size: 0.8rem; } }

  /* Postman test cards */
  .test-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
  .test-card.confirmed { border-color: #86EFAC; background: #F0FDF4; }
  .test-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap; font-family: monospace; font-size: 0.85rem; }
  .test-expected { color: #64748B; font-size: 0.82rem; margin-top: 4px; }

  /* Route cards */
  .route-card { padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: monospace; font-size: 0.85rem; animation: popIn 0.3s; position: relative; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .route-card.get { background: #F0FDF4; border-left: 4px solid #10B981; }
  .route-card.post { background: #EFF6FF; border-left: 4px solid #3B82F6; }
  .route-card.put { background: #FFFBEB; border-left: 4px solid #F97316; }
  .route-card.delete { background: #FEF2F2; border-left: 4px solid #EF4444; }
  .badge-pathvar { background: #8B5CF6; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 700; }

  .amber-note { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .amber-note-title { font-weight: 700; color: #92400E; margin-bottom: 8px; }
  .info-note { background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; padding: 16px; margin: 12px 0; font-size: 0.95rem; color: #1E40AF; }

  .progress-strip { display: flex; align-items: center; max-width: 1100px; margin: 0 auto 24px; gap: 4px; }
  .progress-step { flex: 1; display: flex; align-items: center; gap: 8px; }
  .progress-dot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 800; background: #E2E8F0; color: #94A3B8; flex-shrink: 0; transition: all 0.3s; }
  .progress-dot.done { background: #10B981; color: white; }
  .progress-dot.active { background: #3B82F6; color: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.2); }
  .progress-label { font-size: 0.72rem; font-weight: 700; color: #94A3B8; white-space: nowrap; }
  .progress-label.done { color: #10B981; }
  .progress-label.active { color: #3B82F6; }
  .progress-line { flex: 1; height: 2px; background: #E2E8F0; }
  .progress-line.done { background: #10B981; }

  .checkbox-label { display: flex; align-items: center; gap: 12px; font-weight: 600; cursor: pointer; padding: 14px; background: #F8FAFC; border-radius: 8px; border: 1.5px solid #E2E8F0; margin-bottom: 8px; font-size: 1rem; }
  .checkbox-label input { width: 20px; height: 20px; cursor: pointer; accent-color: #10B981; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 24px; margin-top: 24px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 1rem; animation: slideIn 0.4s; }

  .free-editor { width: 100%; min-height: 260px; background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.85rem; border: none; outline: none; resize: vertical; line-height: 1.5; }
  .free-editor:focus { box-shadow: 0 0 0 2px #3B82F6; }
  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 1rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; margin-top: 10px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #10B981; }

  .warn-msg { background: #FFFBEB; color: #D97706; padding: 10px 14px; border-radius: 8px; border-left: 4px solid #F59E0B; font-weight: 600; font-size: 0.9rem; margin-bottom: 12px; animation: shake 0.3s; }
  .domain-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .domain-pill { padding: 8px 16px; border-radius: 20px; background: #F1F5F9; border: 1.5px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s; }

  .stat-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 0.9rem; }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .stat-row:last-child { margin-bottom: 0; }

  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  /* === CARD CATALOG SCENE (library index-card drawer) === */
  .cat-scene-wrap {
    background: linear-gradient(160deg, #FFF8ED 0%, #FEF0DC 40%, #FCE7C8 100%);
    border: 2px solid #B45309;
    border-radius: 14px;
    padding: 0 0 6px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(146,64,14,0.18), inset 0 0 40px rgba(253,211,151,0.25);
    position: relative;
  }
  .cat-header {
    background: linear-gradient(180deg, #78350F 0%, #5C2A0B 60%, #4A2108 100%);
    padding: 10px 14px 12px;
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
    border-bottom: 3px solid #2E1503;
    box-shadow: 0 3px 8px rgba(46,21,3,0.4);
  }
  .cat-header-label {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.95rem; font-weight: 700; color: #FEF3C7;
    letter-spacing: 0.1em; text-transform: uppercase;
    flex: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .cat-inmem-badge {
    background: rgba(254,243,199,0.18); border: 1px solid rgba(254,243,199,0.35);
    color: #FDE68A; font-size: 0.65rem; padding: 3px 8px; border-radius: 8px;
    font-weight: 600; letter-spacing: 0.06em;
  }
  .librarian-wrap { position: relative; display: flex; align-items: flex-end; }
  .librarian-idle { animation: librarianSway 1.8s ease-in-out infinite; display: inline-block; }
  @keyframes librarianSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  .librarian-search { animation: librarianSearch 1.1s ease forwards; display: inline-block; }
  @keyframes librarianSearch {
    0%   { transform: translateX(0) rotate(0deg); }
    25%  { transform: translateX(-3px) rotate(-6deg); }
    50%  { transform: translateX(3px) rotate(6deg); }
    75%  { transform: translateX(-2px) rotate(-3deg); }
    100% { transform: translateX(0) rotate(0deg); }
  }
  .cat-drawer-icon { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .cat-drawer-tier {
    background: linear-gradient(135deg, #D6B98C, #B8935C);
    border: 1.5px solid #8B6A3F; border-radius: 2px; position: relative;
    width: 22px; height: 8px;
  }
  .cat-drawer-tier::after {
    content: ''; position: absolute; left: 50%; top: 50%;
    transform: translate(-50%,-50%); width: 4px; height: 4px;
    background: #FDE68A; border-radius: 50%;
  }

  .cat-drawer {
    position: relative; margin: 10px 10px 6px;
    background: #FFFCF5; border: 1.5px solid #D6B98C; border-radius: 8px; overflow: hidden;
    box-shadow: inset 0 0 12px rgba(214,185,140,0.3), 0 2px 6px rgba(146,64,14,0.1);
    z-index: 1;
  }
  .cat-drawer-title-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-bottom: 1.5px solid #E9D5B0;
  }
  .cat-drawer-title {
    font-family: 'Georgia', serif; font-weight: 700; font-size: 0.8rem;
    color: #78350F; text-transform: uppercase; letter-spacing: 0.1em;
  }
  .cat-card-row {
    display: flex; align-items: center; padding: 6px 12px;
    gap: 8px; position: relative; min-height: 34px;
    border-bottom: 1px dashed #E9D5B0;
  }
  .cat-card-tab {
    background: #FEF3C7; border: 1.5px solid #D97706; border-radius: 4px;
    padding: 4px 10px; font-family: 'Georgia', serif; font-size: 0.85rem;
    color: #1C1917; flex: 1; position: relative;
    box-shadow: 1px 2px 3px rgba(120,53,15,0.15);
  }
  .cat-card-tab.spotlit { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.2); background: #F5F3FF; }
  .cat-card-num { font-family: 'Georgia', serif; font-size: 0.65rem; color: #B45309; font-weight: 700; min-width: 16px; }
  .cat-empty-state { font-family: 'Georgia', serif; font-size: 0.82rem; font-style: italic; color: #92400E; text-align: center; padding: 20px 16px; opacity: 0.7; }

  .cat-card-updating { animation: cardEditGlow 0.9s ease forwards; }
  @keyframes cardEditGlow {
    0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
    30%  { box-shadow: 0 0 0 4px rgba(249,115,22,0.35); }
    100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  }
  .cat-pencil { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); font-size: 14px; animation: pencilEdit 0.9s ease forwards; }
  @keyframes pencilEdit {
    0%   { opacity: 0; transform: translateY(-50%) translateX(14px) rotate(0deg); }
    20%  { opacity: 1; }
    50%  { transform: translateY(-50%) translateX(0px) rotate(-15deg); }
    80%  { transform: translateY(-50%) translateX(2px) rotate(10deg); }
    100% { opacity: 0; transform: translateY(-50%) translateX(0px) rotate(0deg); }
  }
  .cat-card-sliding-out { animation: cardSlideOut 0.7s cubic-bezier(.4,0,.6,1) forwards; }
  @keyframes cardSlideOut {
    0%   { opacity: 1; transform: translateX(0); max-height: 60px; }
    60%  { opacity: 0.4; transform: translateX(260px) rotate(4deg); max-height: 60px; }
    100% { opacity: 0; transform: translateX(260px) rotate(4deg); max-height: 0; }
  }
  .cat-old-name { text-decoration: line-through; color: #9CA3AF; margin-right: 6px; }
  .cat-new-name { color: #16A34A; font-weight: 700; }

  .cat-drawer-shake { animation: drawerShake 0.5s ease; }
  @keyframes drawerShake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }
  .cat-pulled-stamp {
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%) rotate(-15deg); z-index: 12;
    border: 3px solid #DC2626; border-radius: 6px; padding: 4px 10px;
    background: rgba(254,226,226,0.9); animation: catStamp 2s ease forwards;
    transform-origin: center center;
  }
  .cat-pulled-text { font-family: 'Georgia', serif; font-size: 0.85rem; font-weight: 700; color: #DC2626; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.85; }
  @keyframes catStamp {
    0%   { opacity: 0; transform: translate(-50%,-50%) rotate(-15deg) scale(2); }
    15%  { opacity: 1; transform: translate(-50%,-50%) rotate(-13deg) scale(0.95); }
    20%  { transform: translate(-50%,-50%) rotate(-15deg) scale(1); }
    75%  { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%,-50%) rotate(-17deg) scale(0.9); }
  }

  .cat-info-banner {
    margin: 6px 10px; padding: 6px 10px; border-radius: 6px;
    font-size: 0.75rem; font-weight: 700; text-align: center;
    animation: catBannerSlide 2s ease forwards; position: relative; z-index: 1;
  }
  .cat-info-banner.put-banner    { background: #FEF3C7; border: 1.5px solid #FBBF24; color: #92400E; }
  .cat-info-banner.delete-banner { background: #FEE2E2; border: 1.5px solid #FCA5A5; color: #991B1B; }
  @keyframes catBannerSlide {
    0%   { opacity: 0; transform: translateY(-6px); }
    10%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(-4px); }
  }
`;

// Library index-card catalog: a librarian icon searches for the specific
// card matching the typed/updated name, PUT edits it in place with a pencil
// flourish, DELETE slides the card fully out of the drawer.
// `event` is a one-shot { type, key }: 'put' | 'delete'.
function CatalogScene({ items, event, targetName, updatedName, wasRestarted }) {
  const isPut = event?.type === 'put';
  const isDelete = event?.type === 'delete';
  const removingName = isDelete ? targetName : '';

  return (
    <div className="cat-scene-wrap">
      <div className="cat-header">
        <div className="librarian-wrap">
          <span className={isPut || isDelete ? 'librarian-search' : 'librarian-idle'} key={(isPut || isDelete) ? event.key : 'idle'} style={{ fontSize: 22, lineHeight: 1, display: 'block' }}>
            🧑‍💼
          </span>
        </div>
        <div className="cat-drawer-icon">
          <div className="cat-drawer-tier" />
          <div className="cat-drawer-tier" />
          <div className="cat-drawer-tier" />
        </div>
        <span className="cat-header-label">Member Card Catalog</span>
        <span className="cat-inmem-badge">In-memory</span>
      </div>

      <div className={`cat-drawer${isDelete ? ' cat-drawer-shake' : ''}`} key={isDelete ? `dr-${event.key}` : 'dr'} style={{ minHeight: 120 }}>
        <div className="cat-drawer-title-row">
          <span style={{ fontSize: 13 }}>🗂️</span>
          <span className="cat-drawer-title">Members - A to Z</span>
        </div>

        {isDelete && (
          <div key={`stamp-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <div className="cat-pulled-stamp">
              <span className="cat-pulled-text">Pulled</span>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cat-empty-state">
            {wasRestarted ? '🔄 memory cleared - server restarted' : 'No member cards filed yet'}
          </div>
        ) : (
          items.map((name, i) => {
            const isTarget = isPut && name === updatedName;
            const isBeingRemoved = removingName && name === removingName;
            return (
              <div className="cat-card-row" key={name + i}>
                <span className="cat-card-num">#{i + 1}</span>
                <div
                  className={`cat-card-tab${isTarget ? ' cat-card-updating spotlit' : ''}${isBeingRemoved ? ' cat-card-sliding-out' : ''}`}
                >
                  {isTarget && targetName !== updatedName ? (
                    <span><span className="cat-old-name">{targetName}</span><span className="cat-new-name">{updatedName}</span></span>
                  ) : name}
                  {isTarget && <span className="cat-pencil">✏️</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isPut && (
        <div key={`pb-${event.key}`} className="cat-info-banner put-banner">
          ✏️ PUT request → found the card by name and edited it in place
        </div>
      )}
      {isDelete && (
        <div key={`db-${event.key}`} className="cat-info-banner delete-banner">
          🗑️ DELETE request → the card was pulled out of the drawer
        </div>
      )}
    </div>
  );
}

// Plays a sound exactly once, the first time `condition` becomes true.
// Replaces the repeated "const xRef = useRef(false); useEffect(() => { if (cond && !xRef.current) {...} }, [cond])"
// boilerplate that was duplicated per-gate throughout this file.
function usePlayOnceWhen(condition, play, sound) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (condition && !firedRef.current) {
      firedRef.current = true;
      play(sound);
    }
  }, [condition]); // eslint-disable-line react-hooks/exhaustive-deps
}

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

const DOMAIN_MAP = {
  Gym: ['members', 'member', 'gym'],
  Hotel: ['rooms', 'room', 'hotel'],
  Mess: ['menu', 'item', 'mess'],
  Chai: ['orders', 'order', 'chai'],
};

export default function PutDeleteBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

  // Phase / slot tracking
  const [slot, setSlot] = useState(1);
  const [phase, setPhase] = useState(1);

  const slotRefs = useRef({});
  const isFirstSlotRender = useRef(true);
  useEffect(() => {
    if (isFirstSlotRender.current) { isFirstSlotRender.current = false; return; }
    const el = slotRefs.current[slot];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }, [slot]);

  const isFirstPhaseRender = useRef(true);
  useEffect(() => {
    if (isFirstPhaseRender.current) { isFirstPhaseRender.current = false; return; }
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 350);
  }, [phase]);

  // Register starting state - carried over from 2.2.1
  const [register, setRegister] = useState(['Ravi', 'Suresh', 'Priya']);

  // one-shot scene animation: { type: 'put'|'delete', key: number }
  const [sceneEvent, setSceneEvent] = useState(null);
  const sceneEventKeyRef = useRef(0);
  const fireSceneEvent = (type) => { sceneEventKeyRef.current += 1; setSceneEvent({ type, key: sceneEventKeyRef.current }); };

  // Slot 1 - path variable concept
  const [pathDemoRevealed, setPathDemoRevealed] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [spotlightName, setSpotlightName] = useState('');

  function handleRevealPathDemo() {
    play('correct');
    setPathDemoRevealed(true);
  }

  function handleTypedNameChange(v) {
    setTypedName(v);
    if (v.trim()) play('tick');
    const match = register.find(m => m.toLowerCase() === v.trim().toLowerCase());
    setSpotlightName(match || '');
  }

  // Slot 2 - PUT blanks
  const [putB1, setPutB1] = useState(''); // @PutMapping
  const [putB2, setPutB2] = useState(''); // @PathVariable
  const [putB3, setPutB3] = useState(''); // -1
  const [putB1Status, setPutB1Status] = useState(null);
  const [putB2Status, setPutB2Status] = useState(null);
  const [putB3Status, setPutB3Status] = useState(null);

  const handlePutB1 = (v) => { setPutB1(v); if (v.trim() === '@PutMapping') { setPutB1Status(true); play('add'); } else if (v) setPutB1Status(null); };
  const checkPutB1 = () => { if (putB1.trim() !== '@PutMapping') { setPutB1Status(false); play('warn'); } };
  const handlePutB2 = (v) => { setPutB2(v); if (v.trim() === '@PathVariable') { setPutB2Status(true); play('add'); } else if (v) setPutB2Status(null); };
  const checkPutB2 = () => { if (putB2.trim() !== '@PathVariable') { setPutB2Status(false); play('warn'); } };
  const handlePutB3 = (v) => { setPutB3(v); if (v.trim() === '-1') { setPutB3Status(true); play('add'); } else if (v) setPutB3Status(null); };
  const checkPutB3 = () => { if (putB3.trim() !== '-1') { setPutB3Status(false); play('warn'); } };

  const putAllCorrect = putB1Status === true && putB2Status === true && putB3Status === true;
  usePlayOnceWhen(putAllCorrect, play, 'correct');

  // Slot 3 - DELETE blanks
  const [delB1, setDelB1] = useState('');
  const [delB2, setDelB2] = useState('');
  const [delB1Status, setDelB1Status] = useState(null);
  const [delB2Status, setDelB2Status] = useState(null);

  const handleDelB1 = (v) => { setDelB1(v); if (v.trim() === '@DeleteMapping') { setDelB1Status(true); play('add'); } else if (v) setDelB1Status(null); };
  const checkDelB1 = () => { if (delB1.trim() !== '@DeleteMapping') { setDelB1Status(false); play('warn'); } };
  const handleDelB2 = (v) => { setDelB2(v); if (v.trim() === '@PathVariable') { setDelB2Status(true); play('add'); } else if (v) setDelB2Status(null); };
  const checkDelB2 = () => { if (delB2.trim() !== '@PathVariable') { setDelB2Status(false); play('warn'); } };

  const delAllCorrect = delB1Status === true && delB2Status === true;
  usePlayOnceWhen(delAllCorrect, play, 'correct');

  // Postman test checkboxes (4)
  const [test1, setTest1] = useState(false); // POST + GET
  const [test2, setTest2] = useState(false); // PUT
  const [test3, setTest3] = useState(false); // DELETE
  const [test4, setTest4] = useState(false); // final GET empty
  const allTestsConfirmed = test1 && test2 && test3 && test4;

  function checkTest1() {
    if (test1) return;
    setTest1(true);
    play('add');
  }
  function checkTest2() {
    if (!test1 || test2) return;
    setTest2(true);
    play('tick');
    fireSceneEvent('put');
    setRegister(r => r.map(n => n === 'Ravi' ? 'Ravi Kumar' : n));
  }
  function checkTest3() {
    if (!test2 || test3) return;
    setTest3(true);
    play('remove');
    fireSceneEvent('delete');
    setTimeout(() => {
      setRegister(r => r.filter(n => n !== 'Ravi Kumar'));
    }, 700);
  }
  function checkTest4() {
    if (!test3 || test4) return;
    setTest4(true);
    play('add');
  }

  usePlayOnceWhen(allTestsConfirmed, play, 'correct');

  // Idempotency mini-demo: calling DELETE on the same name twice has the same
  // end result both times (member stays gone) - unlike POST, which would add a
  // duplicate each time. This is a real, separate REST concept from the four
  // verbs above and isn't covered anywhere else in the flow.
  const [idempotentClicks, setIdempotentClicks] = useState(0);
  function repeatDelete() {
    if (idempotentClicks >= 2) return;
    play(idempotentClicks === 0 ? 'remove' : 'tick');
    setIdempotentClicks(c => c + 1);
  }

  // Reveal card
  const [revealLines, setRevealLines] = useState(0);
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsConfirmed && !revealFiredRef.current) {
      revealFiredRef.current = true;
      setTimeout(() => {
        play('reveal');
        let count = 0;
        const intv = setInterval(() => {
          count++;
          setRevealLines(count);
          if (count < 7) play('tick');
          if (count >= 7) clearInterval(intv);
        }, 550);
      }, 800);
    }
  }, [allTestsConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2 - free project
  const [domain, setDomain] = useState(null);
  const [freeCode, setFreeCode] = useState('');
  const [templateCode, setTemplateCode] = useState('');
  const [p2c1, setP2c1] = useState(false);
  const [p2c2, setP2c2] = useState(false);
  const [p2c3, setP2c3] = useState(false);
  const [p2c4, setP2c4] = useState(false);
  const [p2c5, setP2c5] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [parsedGet, setParsedGet] = useState(null);
  const [parsedPost, setParsedPost] = useState(null);
  const [parsedPut, setParsedPut] = useState(null);
  const [parsedDelete, setParsedDelete] = useState(null);

  function handleDomain(d) {
    setDomain(d);
    const [items, item, path] = DOMAIN_MAP[d] || ['items', 'item', 'app'];
    const Item = item.charAt(0).toUpperCase() + item.slice(1);
    const Items = items.charAt(0).toUpperCase() + items.slice(1);
    const generated =
`// existing - from 2.2.1
@GetMapping("/${path}/${items}")
public List<String> get${Items}() {
    return ${items};
}

@PostMapping("/${path}/${items}")
public String add${Item}(@RequestBody String name) {
    ${items}.add(name);
    return "${Item} added: " + name;
}

// ADD THESE - PUT and DELETE:

@PutMapping("/${path}/${items}/{oldName}")
public String update${Item}(
    @PathVariable String oldName,
    @RequestBody String newName
) {
    int index = ${items}.indexOf(oldName);
    if (index != -1) {
        ${items}.set(index, newName);
        return "Updated: " + oldName + " -> " + newName;
    }
    return "Not found: " + oldName;
}

@DeleteMapping("/${path}/${items}/{name}")
public String delete${Item}(@PathVariable String name) {
    boolean removed = ${items}.remove(name);
    if (removed) {
        return "Deleted: " + name;
    }
    return "Not found: " + name;
}`;
    setFreeCode(generated);
    setTemplateCode(generated);
    play('tick');
  }

  // Require the edit to actually change a real token (a path string, variable,
  // or method name) rather than any N-character diff, which could be satisfied
  // by adding junk whitespace or a stray character without touching real code.
  function extractTokens(code) {
    const paths = [...code.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    const idents = [...code.matchAll(/\b(?:String|int|boolean)\s+(\w+)/g)].map(m => m[1]);
    const methodNames = [...code.matchAll(/\b(?:public\s+\S+\s+)(\w+)\s*\(/g)].map(m => m[1]);
    return new Set([...paths, ...idents, ...methodNames]);
  }
  function codeHasRealEdit(current, template) {
    if (current.trim() === template.trim()) return false;
    const currentTokens = extractTokens(current);
    const templateTokens = extractTokens(template);
    for (const t of currentTokens) if (!templateTokens.has(t)) return true;
    for (const t of templateTokens) if (!currentTokens.has(t)) return true;
    return false;
  }
  const codeWasEdited = codeHasRealEdit(freeCode, templateCode);

  useEffect(() => {
    if (!freeCode) return;
    const gm = freeCode.match(/@GetMapping\("([^"]+)"\)/);
    const pm = freeCode.match(/@PostMapping\("([^"]+)"\)/);
    const pum = freeCode.match(/@PutMapping\("([^"]+)"\)/);
    const dm = freeCode.match(/@DeleteMapping\("([^"]+)"\)/);
    const hasPathVar = /@PathVariable/.test(freeCode);
    const prevGet = parsedGet?.path, prevPost = parsedPost?.path, prevPut = parsedPut?.path, prevDel = parsedDelete?.path;
    setParsedGet(gm ? { path: gm[1] } : null);
    setParsedPost(pm ? { path: pm[1] } : null);
    setParsedPut(pum ? { path: pum[1], pathVar: hasPathVar } : null);
    setParsedDelete(dm ? { path: dm[1], pathVar: hasPathVar } : null);
    if (gm && !prevGet) play('add');
    if (pm && !prevPost) play('add');
    if (pum && !prevPut) play('add');
    if (dm && !prevDel) play('add');
  }, [freeCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const allP2Checks = p2c1 && p2c2 && p2c3 && p2c4 && p2c5;
  const canSubmit = parsedPut && parsedDelete && codeWasEdited && allP2Checks && sentences >= 1;

  function handleP2Check(setter, current) {
    if (current) return;
    setter(true);
    play('add');
  }

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
        exerciseId: 'm3-t2-s2-put-delete-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            pathVariableConceptUnderstood: pathDemoRevealed,
            putBlanks: { putMappingAnnotation: putB1, pathVariableAnnotation: putB2, notFoundValue: putB3 },
            deleteBlanks: { deleteMappingAnnotation: delB1, pathVariableAnnotation: delB2 },
            postmanTests: { postWorking: test1, getWorking: test1, putWorking: test2, deleteWorking: test3 },
          },
          phase2: {
            domainSelected: domain,
            putEndpoint: { path: parsedPut?.path, pathVariableUsed: !!parsedPut?.pathVar },
            deleteEndpoint: { path: parsedDelete?.path, pathVariableUsed: !!parsedDelete?.pathVar },
            allCrudTested: allP2Checks,
            fullCode: freeCode,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch(e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>PUT + DELETE Builder</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      {phase === 1 && (
        <div className="progress-strip">
          {['Path variables', 'Build PUT', 'Build DELETE', 'Test all 4'].map((label, i) => {
            const stepNum = i + 1;
            const state = slot > stepNum ? 'done' : slot === stepNum ? 'active' : '';
            return (
              <div className="progress-step" key={label} style={{ flex: i === 3 ? '0 1 auto' : 1 }}>
                <div className={`progress-dot ${state}`}>{slot > stepNum ? '✓' : stepNum}</div>
                <span className={`progress-label ${state}`}>{label}</span>
                {i < 3 && <div className={`progress-line ${slot > stepNum ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>
      )}

      <div className="split-layout">
        {/* ── LEFT ── */}
        <div>
          {phase === 1 && (
            <>
              {/* SLOT 1 - path variable concept */}
              <div ref={el => slotRefs.current[1] = el} className={`card ${slot === 1 ? 'active' : 'complete'}`}>
                <div className="step-counter">Step 1 of 4</div>
                <h2 className="card-header">How does the server know WHICH one?</h2>

                <div className="code-block">
                  <span className="ck">GET</span>&nbsp;&nbsp;/gym/members&nbsp;&nbsp;&nbsp;&nbsp;<span className="cc">→ all members ✅ (no need to specify which)</span><br/>
                  <span className="co">PUT</span>&nbsp;&nbsp;/gym/members/???&nbsp;&nbsp;<span className="cc">→ update WHO? ❓</span><br/>
                  <span style={{ color: '#EF4444' }}>DELETE</span> /gym/members/???&nbsp;<span className="cc">→ delete WHO? ❓</span>
                </div>

                {!pathDemoRevealed ? (
                  <button className="btn" onClick={handleRevealPathDemo}>The identifier goes in the URL itself →</button>
                ) : (
                  <>
                    <div className="code-block" style={{ border: '1px solid #10B981' }}>
                      <span className="co">PUT</span>&nbsp;&nbsp;/gym/members/<span className="cpv">Ravi</span>&nbsp;&nbsp;<span className="cc">→ update Ravi ✅</span><br/>
                      <span style={{ color: '#EF4444' }}>DELETE</span> /gym/members/<span className="cpv">Ravi</span> <span className="cc">→ delete Ravi ✅</span>
                    </div>
                    <div className="info-note">
                      That <code>/Ravi</code> at the end of the URL? The server reads it and knows exactly which member you mean.<br/><br/>
                      In Spring Boot - you mark that variable part with curly braces: <code>/gym/members/{'{name}'}</code><br/>
                      fixed path stays the same, <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{'{name}'}</span> changes per request.<br/><br/>
                      Then <b>@PathVariable</b> captures it.
                    </div>

                    <div className="url-builder">
                      <span className="co">PUT</span> /gym/members/<span className="url-var">{'{'}</span>{typedName ? <span className="url-typed">{typedName}</span> : <span className="url-var">name</span>}<span className="url-var">{'}'}</span>
                    </div>
                    <div className="url-input-row">
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Type a member name:</span>
                      <input className="url-text-input" placeholder="Ravi" value={typedName} onChange={e => handleTypedNameChange(e.target.value)} />
                    </div>
                    {typedName.trim() && (
                      <div className="info-note" style={{ marginTop: 10 }}>
                        Your server will read '<b>{typedName}</b>' from the URL and know exactly who you are talking about.
                      </div>
                    )}

                    <button className="btn orange" style={{ marginTop: 16, width: '100%' }} onClick={() => { play('tick'); setSlot(2); }}>
                      Build PUT endpoint →
                    </button>
                  </>
                )}
              </div>

              {/* SLOT 2 - PUT */}
              {slot >= 2 && (
                <div ref={el => slotRefs.current[2] = el} className={`card ${slot === 2 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 2 of 4</div>
                  <h2 className="card-header">Update a specific member</h2>

                  <div className="code-block">
                    <div className="blank-wrap">
                      <input className={`blank-input ${putB1Status === true ? 'blank-correct' : putB1Status === false ? 'blank-wrong' : ''}`}
                        placeholder="@PutMapping" value={putB1} onChange={e => handlePutB1(e.target.value)} onBlur={checkPutB1} />
                    </div> <span className="cc">// blank 1 - annotation for PUT</span><br/>
                    <span className="ck">public</span> String updateMember(<br/>
                    &nbsp;&nbsp;<div className="blank-wrap">
                      <input className={`blank-input ${putB2Status === true ? 'blank-correct' : putB2Status === false ? 'blank-wrong' : ''}`}
                        placeholder="@PathVariable" value={putB2} onChange={e => handlePutB2(e.target.value)} onBlur={checkPutB2} />
                    </div> String oldName, <span className="cc">// blank 2 - from URL</span><br/>
                    &nbsp;&nbsp;<span className="ca">@RequestBody</span> String newName <span className="cc">// from request body</span><br/>
                    ) {"{"}<br/>
                    &nbsp;&nbsp;<span className="ck">int</span> index = members.<span className="cy">indexOf</span>(oldName);<br/>
                    &nbsp;&nbsp;<span className="ck">if</span> (index != <div className="blank-wrap">
                      <input className={`blank-input ${putB3Status === true ? 'blank-correct' : putB3Status === false ? 'blank-wrong' : ''}`}
                        placeholder="-1" style={{ width: 60 }} value={putB3} onChange={e => handlePutB3(e.target.value)} onBlur={checkPutB3} />
                    </div>) {"{"} <span className="cc">// blank 3</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;members.<span className="cy">set</span>(index, newName);<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Updated: "</span> + oldName + <span className="cs">" -&gt; "</span> + newName;<br/>
                    &nbsp;&nbsp;{"}"}<br/>
                    &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Not found: "</span> + oldName;<br/>
                    {"}"}
                  </div>

                  {putB1Status === false && <div className="warn-msg">Try @PutMapping - maps PUT requests to this method.</div>}
                  {putB2Status === false && <div className="warn-msg">Try @PathVariable - it reads the {'{oldName}'} from the URL.</div>}
                  {putB3Status === false && <div className="warn-msg">List.indexOf() returns -1 when the item is not in the list. You learned indexOf in 1.3.1!</div>}

                  {putAllCorrect && (
                    <div style={{ marginTop: 16, animation: 'slideIn 0.3s' }}>
                      <div className="code-block" style={{ border: '1px solid #10B981' }}>
                        <span className="ca">@PutMapping</span>(<span className="cs">"/gym/members/{'{oldName}'}"</span>) <span className="cc">// PUT request, {'{oldName}'} is variable</span><br/>
                        <span className="ck">public</span> String updateMember(<br/>
                        &nbsp;&nbsp;<span className="ca">@PathVariable</span> String oldName, <span className="cc">// read from URL</span><br/>
                        &nbsp;&nbsp;<span className="ca">@RequestBody</span> String newName <span className="cc">// read from body</span><br/>
                        ) {"{"}<br/>
                        &nbsp;&nbsp;<span className="ck">int</span> index = members.<span className="cy">indexOf</span>(oldName); <span className="cc">// find position</span><br/>
                        &nbsp;&nbsp;<span className="ck">if</span> (index != <span className="co">-1</span>) {"{"} <span className="cc">// if found</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;members.<span className="cy">set</span>(index, newName); <span className="cc">// replace</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Updated! ✅"</span>;<br/>
                        &nbsp;&nbsp;{"}"}<br/>
                        &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Not found ❌"</span>; <span className="cc">// if not in list</span><br/>
                        {"}"}
                      </div>
                      <button className="btn green" style={{ marginTop: 12, width: '100%' }} onClick={() => { play('tick'); setSlot(3); }}>
                        Now add DELETE →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SLOT 3 - DELETE */}
              {slot >= 3 && (
                <div ref={el => slotRefs.current[3] = el} className={`card ${slot === 3 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 3 of 4</div>
                  <h2 className="card-header">Remove a specific member</h2>

                  <div className="code-block">
                    <div className="blank-wrap">
                      <input className={`blank-input ${delB1Status === true ? 'blank-correct' : delB1Status === false ? 'blank-wrong' : ''}`}
                        placeholder="@DeleteMapping" value={delB1} onChange={e => handleDelB1(e.target.value)} onBlur={checkDelB1} />
                    </div> <span className="cc">// blank 1</span><br/>
                    <span className="ck">public</span> String deleteMember(<br/>
                    &nbsp;&nbsp;<div className="blank-wrap">
                      <input className={`blank-input ${delB2Status === true ? 'blank-correct' : delB2Status === false ? 'blank-wrong' : ''}`}
                        placeholder="@PathVariable" value={delB2} onChange={e => handleDelB2(e.target.value)} onBlur={checkDelB2} />
                    </div> String name <span className="cc">// blank 2 - from URL</span><br/>
                    ) {"{"}<br/>
                    &nbsp;&nbsp;<span className="ck">boolean</span> removed = members.<span className="cy">remove</span>(name);<br/>
                    &nbsp;&nbsp;<span className="ck">if</span> (removed) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Deleted: "</span> + name + <span className="cs">" ✅"</span>;<br/>
                    &nbsp;&nbsp;{"}"}<br/>
                    &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Not found: "</span> + name + <span className="cs">" ❌"</span>;<br/>
                    {"}"}
                  </div>

                  {delB1Status === false && <div className="warn-msg">Try @DeleteMapping - maps DELETE requests to this method.</div>}
                  {delB2Status === false && <div className="warn-msg">Same as in PUT - reads the {'{variable}'} from the URL.</div>}

                  {delAllCorrect && (
                    <div style={{ marginTop: 16, animation: 'slideIn 0.3s' }}>
                      <div className="code-block" style={{ border: '1px solid #10B981' }}>
                        <span className="ca">@DeleteMapping</span>(<span className="cs">"/gym/members/{'{name}'}"</span>) <span className="cc">// DELETE request, who to delete</span><br/>
                        <span className="ck">public</span> String deleteMember(<br/>
                        &nbsp;&nbsp;<span className="ca">@PathVariable</span> String name <span className="cc">// name from URL</span><br/>
                        ) {"{"}<br/>
                        &nbsp;&nbsp;<span className="ck">boolean</span> removed = members.<span className="cy">remove</span>(name); <span className="cc">// true if removed, false if not found</span><br/>
                        &nbsp;&nbsp;<span className="ck">if</span> (removed) {"{"}<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Deleted: "</span> + name + <span className="cs">" ✅"</span>;<br/>
                        &nbsp;&nbsp;{"}"}<br/>
                        &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Not found: "</span> + name + <span className="cs">" ❌"</span>;<br/>
                        {"}"}
                      </div>

                      <table className="crud-table">
                        <thead><tr><th>Method</th><th>URL</th><th>What it does</th></tr></thead>
                        <tbody>
                          <tr><td><span className="method-badge badge-get">GET</span></td><td>/gym/members</td><td>return list</td></tr>
                          <tr><td><span className="method-badge badge-post">POST</span></td><td>/gym/members</td><td>add member</td></tr>
                          <tr><td><span className="method-badge badge-put">PUT</span></td><td>/gym/members/{'{name}'}</td><td>update one</td></tr>
                          <tr><td><span className="method-badge badge-delete">DELETE</span></td><td>/gym/members/{'{name}'}</td><td>remove one</td></tr>
                        </tbody>
                      </table>

                      <button className="btn green" style={{ marginTop: 8, width: '100%' }} onClick={() => { play('tick'); setSlot(4); }}>
                        Test all four with Postman →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SLOT 4 - Postman testing all 4 */}
              {slot >= 4 && (
                <div ref={el => slotRefs.current[4] = el} className="card active" style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 4 of 4</div>
                  <h2 className="card-header">Test your complete CRUD with Postman</h2>
                  <p style={{ color: '#475569', margin: '0 0 16px' }}>Run each test in order - the register on the right updates live as you confirm.</p>

                  <div className={`test-card${test1 ? ' confirmed' : ''}`}>
                    <div className="test-row"><span className="method-badge badge-post">POST</span> localhost:8080/gym/members - body: "Ravi"</div>
                    <div className="test-row"><span className="method-badge badge-get">GET</span> localhost:8080/gym/members</div>
                    <div className="test-expected">Expected: ["Ravi", "Suresh", "Priya"]</div>
                    <label className="checkbox-label" style={{ marginTop: 10, marginBottom: 0 }}>
                      <input type="checkbox" checked={test1} onChange={checkTest1} />
                      ✅ POST and GET working
                    </label>
                  </div>

                  <div className={`test-card${test2 ? ' confirmed' : ''}`} style={{ opacity: test1 ? 1 : 0.5 }}>
                    <div className="test-row"><span className="method-badge badge-put">PUT</span> localhost:8080/gym/members/Ravi - body: "Ravi Kumar"</div>
                    <div className="test-expected">Expected: "Updated: Ravi -&gt; Ravi Kumar"</div>
                    <label className="checkbox-label" style={{ marginTop: 10, marginBottom: 0 }}>
                      <input type="checkbox" checked={test2} disabled={!test1} onChange={checkTest2} />
                      ✅ PUT updates correctly
                    </label>
                  </div>

                  <div className={`test-card${test3 ? ' confirmed' : ''}`} style={{ opacity: test2 ? 1 : 0.5 }}>
                    <div className="test-row"><span className="method-badge badge-delete">DELETE</span> localhost:8080/gym/members/Ravi Kumar</div>
                    <div className="test-expected">Expected: "Deleted: Ravi Kumar ✅"</div>
                    <label className="checkbox-label" style={{ marginTop: 10, marginBottom: 0 }}>
                      <input type="checkbox" checked={test3} disabled={!test2} onChange={checkTest3} />
                      ✅ DELETE removes correctly
                    </label>
                  </div>

                  <div className={`test-card${test4 ? ' confirmed' : ''}`} style={{ opacity: test3 ? 1 : 0.5 }}>
                    <div className="test-row"><span className="method-badge badge-get">GET</span> localhost:8080/gym/members</div>
                    <div className="test-expected">Expected: ["Suresh", "Priya"]</div>
                    <label className="checkbox-label" style={{ marginTop: 10, marginBottom: 0 }}>
                      <input type="checkbox" checked={test4} disabled={!test3} onChange={checkTest4} />
                      ✅ Final GET confirms the change
                    </label>
                  </div>

                  {test4 && (
                    <div className="info-note" style={{ marginTop: 16 }}>
                      <b>One more thing about DELETE:</b> what happens if you send the SAME delete request twice?
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                        <button className="btn orange" style={{ padding: '8px 16px', fontSize: '0.9rem' }} disabled={idempotentClicks >= 2} onClick={repeatDelete}>
                          {idempotentClicks === 0 ? 'DELETE /gym/members/Ravi Kumar' : idempotentClicks === 1 ? 'Send it again →' : 'Sent twice ✅'}
                        </button>
                        {idempotentClicks >= 1 && <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: idempotentClicks === 1 ? '#15803D' : '#92400E' }}>{idempotentClicks === 1 ? '"Deleted: Ravi Kumar ✅"' : '"Not found: Ravi Kumar ❌"'}</span>}
                      </div>
                      {idempotentClicks >= 2 && (
                        <div style={{ marginTop: 10, fontSize: '0.9rem' }}>
                          First call deletes them. Second call finds nothing to delete - but the end state is identical both times: <b>Ravi Kumar is gone</b>. That property is called <b>idempotent</b>. PUT and DELETE are idempotent. POST is not - calling it twice creates two members.
                        </div>
                      )}
                    </div>
                  )}

                  {allTestsConfirmed && revealLines > 0 && (
                    <div className="reveal-card" style={{ marginTop: 24, animation: 'slideIn 0.3s' }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#92400E' }}>You now have all four CRUD operations 🎉</h3>
                      {revealLines >= 1 && <div className="reveal-line">✅ <b>@PutMapping</b> → maps PUT request - update something existing</div>}
                      {revealLines >= 2 && <div className="reveal-line">✅ <b>@DeleteMapping</b> → maps DELETE request - remove something</div>}
                      {revealLines >= 3 && <div className="reveal-line">✅ <b>@PathVariable</b> → captures {'{variable}'} from the URL path</div>}
                      {revealLines >= 4 && <div className="reveal-line">✅ <b>{'{name}'} in path</b> → path parameter - variable part of URL</div>}
                      {revealLines >= 5 && <div className="reveal-line">✅ <b>-1 from indexOf</b> → item not found in the List</div>}
                      {revealLines >= 6 && <div className="reveal-line">✅ <b>boolean remove</b> → true if removed, false if not found</div>}
                      {revealLines >= 7 && <div className="reveal-line">✅ <b>CRUD</b> → Create (POST), Read (GET), Update (PUT), Delete (DELETE) - all four complete</div>}
                      {revealLines >= 7 && (
                        <div style={{ marginTop: 24, textAlign: 'center', animation: 'slideIn 0.3s' }}>
                          <h3 style={{ color: '#1E293B' }}>
                            You now have all four CRUD operations.<br/>Create. Read. Update. Delete.<br/>
                            Every app in the world is built on these four operations.<br/>Your gym app handles them all.
                          </h3>
                          <button className="btn green" style={{ padding: '16px 32px', fontSize: '1.1rem', marginTop: 20 }} onClick={() => { setPhase(2); play('tick'); }}>
                            Build YOUR complete CRUD →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {phase === 2 && (
            <div className="card active" style={{ animation: 'slideIn 0.3s' }}>
              <h2 className="card-header" style={{ fontSize: '1.5rem' }}>Complete CRUD for YOUR project</h2>
              <p style={{ color: '#64748B' }}>Add PUT and DELETE to your existing controller. Test all four operations.</p>

              {!domain ? (
                <div className="domain-pills">
                  <button className="domain-pill" onClick={() => handleDomain('Gym')}>🏋️ Gym</button>
                  <button className="domain-pill" onClick={() => handleDomain('Mess')}>🍱 Mess</button>
                  <button className="domain-pill" onClick={() => handleDomain('Hotel')}>🏨 Hotel</button>
                  <button className="domain-pill" onClick={() => handleDomain('Chai')}>☕ Chai</button>
                </div>
              ) : (
                <>
                  <div className="amber-note" style={{ marginBottom: 16 }}>
                    {domain === 'Gym' && "You already have GET and POST for /gym/members. Now add: PUT /gym/members/{name} → update a member's name. DELETE /gym/members/{name} → remove a member."}
                    {domain === 'Hotel' && "You already have GET and POST for /hotel/rooms. Now add: PUT /hotel/rooms/{name} → update a room. DELETE /hotel/rooms/{name} → remove a room."}
                    {domain === 'Mess' && "You already have GET and POST for /mess/menu. Now add: PUT /mess/menu/{name} → update a menu item. DELETE /mess/menu/{name} → remove a menu item."}
                    {domain === 'Chai' && "You already have GET and POST for /chai/orders. Now add: PUT /chai/orders/{name} → update an order. DELETE /chai/orders/{name} → remove an order."}
                  </div>
                  <textarea className="free-editor" value={freeCode} onChange={e => setFreeCode(e.target.value)} onPaste={e => e.preventDefault()} onContextMenu={e => e.preventDefault()} spellCheck="false" />
                  {!codeWasEdited && (
                    <div className="warn-msg" style={{ marginTop: 10 }}>
                      ✏️ This is the auto-filled starting point - before continuing, make a real change: rename a variable, change a path string, or rename a method. Adding stray characters won't count.
                    </div>
                  )}
                </>
              )}

              {domain && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Test all 4 operations with Postman:</h4>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c1} onChange={() => handleP2Check(setP2c1, p2c1)} disabled={!codeWasEdited} />POST 3 real items</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c2} onChange={() => handleP2Check(setP2c2, p2c2)} disabled={!p2c1} />GET → see all 3</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c3} onChange={() => handleP2Check(setP2c3, p2c3)} disabled={!p2c2} />PUT → update one</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c4} onChange={() => handleP2Check(setP2c4, p2c4)} disabled={!p2c3} />DELETE → remove one</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c5} onChange={() => handleP2Check(setP2c5, p2c5)} disabled={!p2c4} />GET → confirm updated/removed</label>

                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Reflection:</h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 8px 0' }}>
                      In one sentence - what does @PathVariable do and why do PUT and DELETE need it but POST and GET don't?
                    </p>
                    <textarea className="reflection-box" placeholder="@PathVariable reads the variable part from the URL path. PUT and DELETE need it because..." value={reflection} onChange={e => setReflection(e.target.value)} onPaste={e => e.preventDefault()} />
                    <div className={`word-count ${sentences >= 1 ? 'ok' : ''}`}>{sentences} / 1 sentence minimum</div>
                  </div>

                  <button className="btn green" style={{ width: '100%', padding: 16, fontSize: '1.1rem', marginTop: 24, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Completed ✅' : 'All 4 CRUD operations working →'}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 20, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46', animation: 'popIn 0.3s' }}>
                      <b>Your CRUD API is complete. 🎉</b><br/><br/>
                      ✅ POST - create<br/>✅ GET - read<br/>✅ PUT - update<br/>✅ DELETE - delete<br/><br/>
                      Four operations. One controller.<br/><br/>
                      But your data still lives in memory. Restart your server - everything gone.<br/><br/>
                      <b>Next - the most important subtopic of Module 2. Connect your server to MySQL. Data that never disappears. Your first real database.</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="split-right-col">
          <div className="sticky-panel">

            {/* Card catalog - illustrated, event-driven */}
            <div style={{ opacity: phase === 2 ? 0.3 : 1, transition: 'opacity 0.3s' }}>
              <CatalogScene
                items={register}
                event={sceneEvent}
                targetName={test2 || test3 ? 'Ravi' : spotlightName}
                updatedName="Ravi Kumar"
                wasRestarted={false}
              />
            </div>

            {/* CRUD route cards */}
            <div>
              {slot >= 1 && <div className="route-card get"><span className="method-badge badge-get">GET</span> /gym/members <span style={{ color: '#94A3B8' }}>→</span> getMembers()</div>}
              {slot >= 1 && <div className="route-card post"><span className="method-badge badge-post">POST</span> /gym/members <span style={{ color: '#94A3B8' }}>→</span> addMember()</div>}
              {slot >= 2 && putAllCorrect && (
                <div className="route-card put">
                  <span className="method-badge badge-put">PUT</span> /gym/members/<span style={{ color: '#8B5CF6' }}>{'{oldName}'}</span>
                  <span style={{ color: '#94A3B8' }}>→</span> updateMember() <span className="badge-pathvar">@PathVariable</span>
                </div>
              )}
              {slot >= 3 && delAllCorrect && (
                <div className="route-card delete">
                  <span className="method-badge badge-delete">DELETE</span> /gym/members/<span style={{ color: '#8B5CF6' }}>{'{name}'}</span>
                  <span style={{ color: '#94A3B8' }}>→</span> deleteMember() <span className="badge-pathvar">@PathVariable</span>
                </div>
              )}
              {phase === 2 && parsedGet && <div className="route-card get"><span className="method-badge badge-get">GET</span> {parsedGet.path}</div>}
              {phase === 2 && parsedPost && <div className="route-card post"><span className="method-badge badge-post">POST</span> {parsedPost.path}</div>}
              {phase === 2 && parsedPut && (
                <div className="route-card put">
                  <span className="method-badge badge-put">PUT</span> {parsedPut.path}
                  {parsedPut.pathVar && <span className="badge-pathvar">@PathVariable</span>}
                </div>
              )}
              {phase === 2 && parsedDelete && (
                <div className="route-card delete">
                  <span className="method-badge badge-delete">DELETE</span> {parsedDelete.path}
                  {parsedDelete.pathVar && <span className="badge-pathvar">@PathVariable</span>}
                </div>
              )}
            </div>

            {phase === 2 && (
              <div className="stat-box">
                <div className="stat-row"><span>Endpoints:</span><b>{[parsedGet, parsedPost, parsedPut, parsedDelete].filter(Boolean).length}</b></div>
                <div className="stat-row"><span>Complete CRUD:</span><b style={{ color: parsedGet && parsedPost && parsedPut && parsedDelete ? '#16A34A' : '#94A3B8' }}>{parsedGet && parsedPost && parsedPut && parsedDelete ? '✅' : '-'}</b></div>
                <div className="stat-row"><span>Path variables:</span><b style={{ color: parsedPut?.pathVar && parsedDelete?.pathVar ? '#16A34A' : '#94A3B8' }}>{parsedPut?.pathVar && parsedDelete?.pathVar ? '✅' : '-'}</b></div>
                <div className="stat-row"><span>Ready for database:</span><b style={{ color: allP2Checks ? '#16A34A' : '#94A3B8' }}>{allP2Checks ? '✅' : '-'}</b></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
