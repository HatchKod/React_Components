import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .split-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; max-width: 1100px; margin: 0 auto; }
  @media(max-width:900px) { .split-layout { grid-template-columns: 1fr; } }

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
  .btn.purple { background: #8B5CF6; }
  .btn.purple:hover { background: #7C3AED; }

  /* Code blocks */
  .code-block { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.85rem; line-height: 1.6; margin: 12px 0; position: relative; overflow-x: auto; }
  .ck { color: #60A5FA; }
  .ca { color: #E879F9; }
  .cs { color: #4ADE80; }
  .cc { color: #9CA3AF; }
  .cy { color: #FACC15; }
  .co { color: #FB923C; }
  .clam { color: #E879F9; }

  /* Blanks */
  .blank-wrap { display: inline-block; margin: 0 4px; }
  .blank-input { background: #334155; color: white; border: 1.5px solid #64748B; padding: 3px 10px; border-radius: 4px; font-family: inherit; font-size: inherit; width: 150px; outline: none; }
  .blank-correct { border-color: #10B981 !important; background: rgba(16,185,129,0.15) !important; }
  .blank-wrong { border-color: #EF4444 !important; animation: shake 0.3s; }

  /* Before/After */
  .before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; align-items: stretch; }
  @media(max-width:700px) { .before-after { grid-template-columns: 1fr; } }
  .ba-card { border-radius: 12px; padding: 16px; }
  .ba-card.before { background: #FEF2F2; border: 1.5px solid #FECACA; }
  .ba-card.after { background: #F0FDF4; border: 1.5px solid #86EFAC; }
  .ba-title { font-weight: 800; font-size: 0.85rem; margin-bottom: 10px; }
  .ba-card.before .ba-title { color: #991B1B; }
  .ba-card.after .ba-title { color: #166534; }
  .ba-sub { font-size: 0.78rem; margin-top: 8px; color: #64748B; }
  .diff-hl-red { background: rgba(239,68,68,0.25); border-radius: 3px; padding: 0 3px; }
  .diff-hl-green { background: rgba(34,197,94,0.25); border-radius: 3px; padding: 0 3px; }

  .change-badge { display: flex; align-items: center; gap: 8px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 0.88rem; }

  /* JSON <-> Java conversion visual */
  .conv-wrap { display: flex; align-items: center; gap: 10px; }
  @media(max-width:700px) { .conv-wrap { flex-direction: column; } }
  .conv-box { flex: 1; border-radius: 10px; padding: 14px 16px; font-family: monospace; font-size: 0.82rem; min-width: 0; }
  .conv-json { background: #1E293B; color: #E2E8F0; }
  .conv-json .jk { color: #FB923C; }
  .conv-json .jv { color: #4ADE80; }
  .conv-java { background: #F9FAFB; border: 1.5px solid #E2E8F0; }
  .conv-java-title { color: #92400E; background: #FEF3C7; display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 800; margin-bottom: 8px; }
  .conv-field { color: #1E293B; }
  .conv-field .fname { color: #FB923C; font-weight: 700; }
  .conv-arrow { flex: 0 0 auto; text-align: center; color: #8B5CF6; font-weight: 800; font-size: 1.4rem; }
  @media(max-width:700px) { .conv-arrow { transform: rotate(90deg); } }
  .conv-arrow-label { font-size: 0.65rem; font-weight: 700; color: #8B5CF6; display: block; margin-top: 2px; }

  /* Object field pills (used inside filing-cabinet folders) */
  .obj-field { padding: 2px 8px; border-radius: 4px; background: #F8FAFC; }
  .obj-field.name { color: #1D4ED8; font-weight: 700; }
  .obj-field.num { color: #B45309; }
  .obj-field.str { color: #166534; }
  .obj-field.bool { color: #7C3AED; }

  /* CRUD table */
  .crud-table { width: 100%; border-collapse: collapse; margin: 16px 0; overflow-x: auto; display: block; }
  .crud-table thead, .crud-table tbody { display: table; width: 100%; table-layout: fixed; }
  .crud-table th { text-align: left; font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 2px solid #E2E8F0; }
  .crud-table td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; font-size: 0.86rem; }
  .method-badge { font-weight: 800; padding: 3px 10px; border-radius: 4px; font-size: 0.78rem; display: inline-block; }
  .badge-get { background: #DCFCE7; color: #166534; }
  .badge-post { background: #DBEAFE; color: #1E40AF; }
  .badge-put { background: #FEF3C7; color: #92400E; }
  .badge-delete { background: #FEE2E2; color: #991B1B; }
  @media(max-width:600px) { .crud-table { font-size: 0.78rem; } }

  /* Postman test cards */
  .test-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
  .test-card.confirmed { border-color: #86EFAC; background: #F0FDF4; }
  .test-json { background: #1E293B; color: #E2E8F0; border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 0.78rem; margin: 8px 0; overflow-x: auto; white-space: pre; }
  .test-json .jk { color: #FB923C; }
  .test-json .jv { color: #4ADE80; }

  /* Route cards */
  .route-card { padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: monospace; font-size: 0.82rem; animation: popIn 0.3s; position: relative; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .route-card.get { background: #F0FDF4; border-left: 4px solid #10B981; }
  .route-card.post { background: #EFF6FF; border-left: 4px solid #3B82F6; }
  .route-card.put { background: #FFFBEB; border-left: 4px solid #F97316; }
  .route-card.delete { background: #FEF2F2; border-left: 4px solid #EF4444; }

  .amber-note { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .amber-note-title { font-weight: 700; color: #92400E; margin-bottom: 8px; }
  .info-note { background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; padding: 16px; margin: 12px 0; font-size: 0.92rem; color: #1E40AF; }
  .purple-note { background: #F5F3FF; border-left: 4px solid #8B5CF6; border-radius: 8px; padding: 16px; margin: 12px 0; font-size: 0.92rem; color: #5B21B6; }

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

  .checkbox-label { display: flex; align-items: center; gap: 12px; font-weight: 600; cursor: pointer; padding: 14px; background: #F8FAFC; border-radius: 8px; border: 1.5px solid #E2E8F0; margin-bottom: 8px; font-size: 0.95rem; }
  .checkbox-label input { width: 20px; height: 20px; cursor: pointer; accent-color: #10B981; flex-shrink: 0; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 24px; margin-top: 24px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 0.98rem; animation: slideIn 0.4s; }

  .free-editor { width: 100%; min-height: 250px; background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.8rem; border: none; outline: none; resize: vertical; line-height: 1.5; }
  .free-editor:focus { box-shadow: 0 0 0 2px #3B82F6; }
  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 1rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; margin-top: 10px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #10B981; }

  .warn-msg { background: #FFFBEB; color: #D97706; padding: 10px 14px; border-radius: 8px; border-left: 4px solid #F59E0B; font-weight: 600; font-size: 0.9rem; margin-bottom: 12px; animation: shake 0.3s; }
  .domain-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .domain-pill { padding: 8px 16px; border-radius: 20px; background: #F1F5F9; border: 1.5px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s; }

  .stat-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 0.88rem; }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .stat-row:last-child { margin-bottom: 0; }

  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  /* === FILING CABINET SCENE (office dossiers - full JSON objects) === */
  .cab-scene-wrap {
    background: linear-gradient(160deg, #F1F5F9 0%, #E7ECF3 40%, #DCE3ED 100%);
    border: 2px solid #475569;
    border-radius: 14px;
    padding: 0 0 6px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(51,65,85,0.18), inset 0 0 40px rgba(203,213,225,0.3);
    position: relative;
  }
  .cab-header {
    background: linear-gradient(180deg, #334155 0%, #1E293B 60%, #0F172A 100%);
    padding: 10px 14px 12px;
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
    border-bottom: 3px solid #0B1220;
    box-shadow: 0 3px 8px rgba(11,18,32,0.4);
  }
  .cab-header-label {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.95rem; font-weight: 700; color: #E2E8F0;
    letter-spacing: 0.1em; text-transform: uppercase;
    flex: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .cab-inmem-badge {
    background: rgba(226,232,240,0.15); border: 1px solid rgba(226,232,240,0.3);
    color: #CBD5E1; font-size: 0.65rem; padding: 3px 8px; border-radius: 8px;
    font-weight: 600; letter-spacing: 0.06em;
  }
  .clerk-wrap { position: relative; display: flex; align-items: flex-end; }
  .clerk-idle { animation: clerkSway 2s ease-in-out infinite; display: inline-block; }
  @keyframes clerkSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  .clerk-active { animation: clerkWork 1s ease forwards; display: inline-block; }
  @keyframes clerkWork {
    0%   { transform: translateY(0) rotate(0deg); }
    25%  { transform: translateY(-2px) rotate(-8deg); }
    50%  { transform: translateY(0) rotate(6deg); }
    75%  { transform: translateY(-1px) rotate(-4deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  .cab-drawer-icon { display: flex; flex-direction: column; align-items: center; gap: 1.5px; }
  .cab-drawer-tier {
    background: linear-gradient(135deg, #94A3B8, #64748B);
    border: 1.5px solid #475569; border-radius: 2px; position: relative;
    width: 24px; height: 8px;
  }
  .cab-drawer-tier::after {
    content: ''; position: absolute; left: 50%; top: 50%;
    transform: translate(-50%,-50%); width: 6px; height: 3px;
    background: #E2E8F0; border-radius: 1px;
  }

  .cab-body {
    position: relative; margin: 10px 10px 6px;
    background: #FDFEFF; border: 1.5px solid #CBD5E1; border-radius: 8px; overflow: hidden;
    box-shadow: inset 0 0 12px rgba(203,213,225,0.35), 0 2px 6px rgba(51,65,85,0.1);
    z-index: 1;
  }
  .cab-body-title-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-bottom: 1.5px solid #E2E8F0;
  }
  .cab-body-title {
    font-family: 'Georgia', serif; font-weight: 700; font-size: 0.8rem;
    color: #334155; text-transform: uppercase; letter-spacing: 0.1em;
  }

  .cab-folder-row { padding: 6px 10px; position: relative; }
  .cab-folder {
    background: #FEF3C7; border: 1.5px solid #D97706; border-radius: 4px 8px 4px 4px;
    padding: 6px 10px; position: relative;
    box-shadow: 1px 3px 4px rgba(120,53,15,0.15);
  }
  .cab-folder::before {
    content: ''; position: absolute; top: -6px; left: 8px;
    width: 40%; height: 8px; background: #FEF3C7; border: 1.5px solid #D97706; border-bottom: none;
    border-radius: 4px 4px 0 0;
  }
  .cab-folder-updating { animation: folderGlow 0.9s ease forwards; }
  @keyframes folderGlow {
    0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
    30%  { box-shadow: 0 0 0 4px rgba(249,115,22,0.35); }
    100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  }
  .cab-folder-name { font-family: 'Georgia', serif; font-weight: 700; font-size: 0.82rem; color: #1C1917; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .cab-folder-fields { display: flex; flex-wrap: wrap; gap: 6px; }
  .cab-empty-state { font-family: 'Georgia', serif; font-size: 0.82rem; font-style: italic; color: #475569; text-align: center; padding: 20px 16px; opacity: 0.7; }

  .cab-folder-fly-in { animation: folderFlyIn 0.9s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes folderFlyIn {
    0%   { opacity: 0; transform: translateY(-16px) scale(0.85) rotate(-4deg); }
    60%  { opacity: 1; transform: translateY(2px) scale(1.03) rotate(1deg); }
    100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
  }
  .cab-folder-sliding-out { animation: folderSlideOut 0.7s cubic-bezier(.4,0,.6,1) forwards; }
  @keyframes folderSlideOut {
    0%   { opacity: 1; transform: translateX(0) rotate(0deg); max-height: 90px; }
    60%  { opacity: 0.4; transform: translateX(260px) rotate(6deg); max-height: 90px; }
    100% { opacity: 0; transform: translateX(260px) rotate(6deg); max-height: 0; }
  }
  .cab-pencil { position: absolute; top: -4px; right: 4px; font-size: 14px; animation: cabPencil 0.9s ease forwards; }
  @keyframes cabPencil {
    0%   { opacity: 0; transform: translateX(10px) rotate(0deg); }
    20%  { opacity: 1; }
    50%  { transform: translateX(0px) rotate(-15deg); }
    80%  { transform: translateX(2px) rotate(10deg); }
    100% { opacity: 0; transform: translateX(0px) rotate(0deg); }
  }
  .cab-field-old { text-decoration: line-through; color: #9CA3AF; margin-right: 4px; }
  .cab-field-new { color: #16A34A; font-weight: 700; }

  .cab-drawer-shake { animation: cabDrawerShake 0.5s ease; }
  @keyframes cabDrawerShake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }
  .cab-pulled-stamp {
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%) rotate(-15deg); z-index: 12;
    border: 3px solid #DC2626; border-radius: 6px; padding: 4px 10px;
    background: rgba(254,226,226,0.9); animation: cabStamp 2s ease forwards;
    transform-origin: center center;
  }
  .cab-pulled-text { font-family: 'Georgia', serif; font-size: 0.85rem; font-weight: 700; color: #DC2626; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.85; }
  @keyframes cabStamp {
    0%   { opacity: 0; transform: translate(-50%,-50%) rotate(-15deg) scale(2); }
    15%  { opacity: 1; transform: translate(-50%,-50%) rotate(-13deg) scale(0.95); }
    20%  { transform: translate(-50%,-50%) rotate(-15deg) scale(1); }
    75%  { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%,-50%) rotate(-17deg) scale(0.9); }
  }
  .cab-magnifier { position: absolute; top: 6px; left: 30px; font-size: 20px; z-index: 10; animation: cabMagnifierSweep 1.1s cubic-bezier(.34,1.2,.64,1) forwards; }
  @keyframes cabMagnifierSweep {
    0%   { opacity: 0; transform: translateX(0) translateY(10px) rotate(-20deg); }
    15%  { opacity: 1; transform: translateX(0) translateY(0) rotate(0deg); }
    60%  { opacity: 1; transform: translateX(220px) translateY(-4px) rotate(5deg); }
    85%  { opacity: 1; transform: translateX(240px) translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateX(250px) translateY(-8px) rotate(10deg); }
  }

  .cab-info-banner {
    margin: 6px 10px; padding: 6px 10px; border-radius: 6px;
    font-size: 0.75rem; font-weight: 700; text-align: center;
    animation: cabBannerSlide 2s ease forwards; position: relative; z-index: 1;
  }
  .cab-info-banner.post-banner   { background: #FEF3C7; border: 1.5px solid #FBBF24; color: #92400E; }
  .cab-info-banner.get-banner    { background: #DBEAFE; border: 1.5px solid #93C5FD; color: #1E40AF; }
  .cab-info-banner.put-banner    { background: #FEF3C7; border: 1.5px solid #FBBF24; color: #92400E; }
  .cab-info-banner.delete-banner { background: #FEE2E2; border: 1.5px solid #FCA5A5; color: #991B1B; }
  @keyframes cabBannerSlide {
    0%   { opacity: 0; transform: translateY(-6px); }
    10%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(-4px); }
  }
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

const DOMAIN_MAP = {
  Gym: {
    domainClass: 'GymMember', path: 'gym', items: 'members', item: 'member', Item: 'Member', Items: 'Members',
    fields: [
      { key: 'name', type: 'str', sample: 'Ravi' },
      { key: 'age', type: 'num', sample: 21 },
      { key: 'plan', type: 'str', sample: 'Basic' },
      { key: 'isActive', type: 'bool', sample: true },
    ],
  },
  Hotel: {
    domainClass: 'Room', path: 'hotel', items: 'rooms', item: 'room', Item: 'Room', Items: 'Rooms',
    fields: [
      { key: 'roomNumber', type: 'str', sample: '101' },
      { key: 'type', type: 'str', sample: 'Standard' },
      { key: 'pricePerNight', type: 'num', sample: 1500.0 },
      { key: 'isAvailable', type: 'bool', sample: true },
    ],
  },
  Mess: {
    domainClass: 'MessEntry', path: 'mess', items: 'entries', item: 'entry', Item: 'Entry', Items: 'Entries',
    fields: [
      { key: 'studentName', type: 'str', sample: 'Ravi' },
      { key: 'mealType', type: 'str', sample: 'Lunch' },
      { key: 'date', type: 'str', sample: '2025-01-06' },
      { key: 'attended', type: 'bool', sample: false },
    ],
  },
  Chai: {
    domainClass: 'ChaiOrder', path: 'chai', items: 'orders', item: 'order', Item: 'Order', Items: 'Orders',
    fields: [
      { key: 'itemName', type: 'str', sample: 'Cutting Chai' },
      { key: 'quantity', type: 'num', sample: 2 },
      { key: 'price', type: 'num', sample: 20.0 },
      { key: 'status', type: 'str', sample: 'Pending' },
    ],
  },
};

// Office filing cabinet: full JSON dossiers (not just names) get filed,
// pulled, edited-in-place, or removed. `event` is a one-shot { type, key }:
// 'post' | 'get' | 'put' | 'delete'.
function FilingCabinetScene({ items, fields, event, targetName, updatedFields, wasRestarted }) {
  const isPost = event?.type === 'post';
  const isGet = event?.type === 'get';
  const isPut = event?.type === 'put';
  const isDelete = event?.type === 'delete';
  const removingName = isDelete ? targetName : '';
  const isBusy = isPost || isGet || isPut || isDelete;

  return (
    <div className="cab-scene-wrap">
      <div className="cab-header">
        <div className="clerk-wrap">
          <span className={isBusy ? 'clerk-active' : 'clerk-idle'} key={isBusy ? `clerk-${event.key}` : 'idle'} style={{ fontSize: 22, lineHeight: 1, display: 'block' }}>
            🗄️
          </span>
        </div>
        <div className="cab-drawer-icon">
          <div className="cab-drawer-tier" />
          <div className="cab-drawer-tier" />
          <div className="cab-drawer-tier" />
        </div>
        <span className="cab-header-label">Object Filing Cabinet</span>
        <span className="cab-inmem-badge">In-memory</span>
      </div>

      <div className={`cab-body${isDelete ? ' cab-drawer-shake' : ''}`} key={isDelete ? `dr-${event.key}` : 'dr'} style={{ minHeight: 130 }}>
        <div className="cab-body-title-row">
          <span style={{ fontSize: 13 }}>🗃️</span>
          <span className="cab-body-title">Full Objects - not just Strings</span>
        </div>

        {isGet && (
          <div key={`mag-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <span className="cab-magnifier">🔍</span>
          </div>
        )}
        {isDelete && (
          <div key={`stamp-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <div className="cab-pulled-stamp">
              <span className="cab-pulled-text">Pulled</span>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cab-empty-state">
            {wasRestarted ? '🔄 memory cleared - server restarted' : 'No dossiers filed yet'}
          </div>
        ) : (
          items.map((obj, i) => {
            const isTarget = isPut && obj.name === targetName;
            const isNewest = isPost && i === items.length - 1;
            const isBeingRemoved = removingName && obj.name === removingName;
            return (
              <div className="cab-folder-row" key={obj.name + i}>
                <div
                  className={`cab-folder${isTarget ? ' cab-folder-updating' : ''}${isNewest ? ' cab-folder-fly-in' : ''}${isBeingRemoved ? ' cab-folder-sliding-out' : ''}`}
                >
                  <div className="cab-folder-name">📁 {obj.name}{isTarget && <span className="cab-pencil">✏️</span>}</div>
                  <div className="cab-folder-fields">
                    {fields.filter(f => f.key !== 'name').map(f => {
                      const val = obj[f.key];
                      const showUpdated = isTarget && updatedFields && f.key in updatedFields;
                      const cls = f.type === 'num' ? 'num' : f.type === 'bool' ? 'bool' : 'str';
                      return (
                        <span key={f.key} className={`obj-field ${cls}`}>
                          {f.key}: {showUpdated ? (
                            <><span className="cab-field-old">{String(val)}</span><span className="cab-field-new">{String(updatedFields[f.key])}</span></>
                          ) : String(val)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isPost && <div key={`postb-${event.key}`} className="cab-info-banner post-banner">📁 POST request → full dossier filed into the cabinet</div>}
      {isGet && <div key={`getb-${event.key}`} className="cab-info-banner get-banner">🔍 GET request → clerk pulled the drawer and read every dossier</div>}
      {isPut && <div key={`putb-${event.key}`} className="cab-info-banner put-banner">✏️ PUT request → found the dossier by name and updated its fields</div>}
      {isDelete && <div key={`delb-${event.key}`} className="cab-info-banner delete-banner">🗑️ DELETE request → the dossier was pulled out of the cabinet</div>}
    </div>
  );
}

export default function CRUDDomainBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };

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

  // register - gym example, object cards
  const GYM = DOMAIN_MAP.Gym;
  const [register, setRegister] = useState([
    { name: 'Ravi', age: 21, plan: 'Basic', isActive: true },
    { name: 'Suresh', age: 24, plan: 'Premium', isActive: true },
  ]);
  // one-shot scene animation: { type: 'post'|'get'|'put'|'delete', key: number }
  const [sceneEvent, setSceneEvent] = useState(null);
  const sceneEventKeyRef = useRef(0);
  const fireSceneEvent = (type) => { sceneEventKeyRef.current += 1; setSceneEvent({ type, key: sceneEventKeyRef.current }); };

  // Slot 1 - before/after upgrade + no-arg constructor
  const [upgradeShown, setUpgradeShown] = useState(false);
  const [noArgChecked, setNoArgChecked] = useState(false);

  function handleShowUpgrade() {
    play('tick');
    setUpgradeShown(true);
  }
  function handleNoArgCheck() {
    if (noArgChecked) return;
    setNoArgChecked(true);
    play('add');
  }

  // Slot 2 - 4 blanks
  const [b1, setB1] = useState(''); // list type e.g. GymMember
  const [b2, setB2] = useState(''); // GET return type
  const [b3, setB3] = useState(''); // POST return type
  const [b4, setB4] = useState(''); // PUT return type
  const [b1Status, setB1Status] = useState(null);
  const [b2Status, setB2Status] = useState(null);
  const [b3Status, setB3Status] = useState(null);
  const [b4Status, setB4Status] = useState(null);

  const handleB1 = (v) => {
    setB1(v);
    if (v.trim().length > 0) { setB1Status(true); play('add'); } else setB1Status(null);
    // re-validate B3/B4 in case they were filled before B1 was correct
    if (b3.trim()) setB3Status(v.trim() && b3.trim() === v.trim() ? true : false);
    if (b4.trim()) setB4Status(v.trim() && (b4.trim() === v.trim() || b4.trim() === 'null') ? true : false);
  };
  const checkB1 = () => { if (!b1.trim()) { setB1Status(false); play('warn'); } };
  const handleB2 = (v) => { setB2(v); if (/List/.test(v)) { setB2Status(true); play('add'); } else if (v) setB2Status(null); };
  const checkB2 = () => { if (!/List/.test(b2)) { setB2Status(false); play('warn'); } };
  const handleB3 = (v) => {
    setB3(v);
    if (b1.trim() && v.trim() === b1.trim()) { setB3Status(true); play('add'); }
    else if (v) setB3Status(null);
  };
  const checkB3 = () => { if (!(b1.trim() && b3.trim() === b1.trim())) { setB3Status(false); play('warn'); } };
  const handleB4 = (v) => {
    setB4(v);
    if (b1.trim() && (v.trim() === b1.trim() || v.trim() === 'null')) { setB4Status(true); play('add'); }
    else if (v) setB4Status(null);
  };
  const checkB4 = () => { if (!(b1.trim() && (b4.trim() === b1.trim() || b4.trim() === 'null'))) { setB4Status(false); play('warn'); } };

  const allBlanksCorrect = b1Status === true && b2Status === true && b3Status === true && b4Status === true;
  const blanksFiredRef = useRef(false);
  useEffect(() => {
    if (allBlanksCorrect && !blanksFiredRef.current) { blanksFiredRef.current = true; play('correct'); }
  }, [allBlanksCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const [removeIfShown, setRemoveIfShown] = useState(false);
  function handleShowRemoveIf() {
    play('tick');
    setRemoveIfShown(true);
  }

  // Slot 3 - Postman tests with JSON objects (5)
  const [t1, setT1] = useState(false); // POST full JSON
  const [t2, setT2] = useState(false); // GET array
  const [t3, setT3] = useState(false); // PUT updates
  const [t4, setT4] = useState(false); // DELETE removes
  const [t5, setT5] = useState(false); // GET confirms removal
  const allTestsConfirmed = t1 && t2 && t3 && t4 && t5;

  function checkT1() {
    if (t1) return;
    setT1(true);
    fireSceneEvent('post');
    play('add');
  }
  function checkT2() {
    if (!t1 || t2) return;
    setT2(true);
    fireSceneEvent('get');
    play('add');
  }
  function checkT3() {
    if (!t2 || t3) return;
    setT3(true);
    play('tick');
    fireSceneEvent('put');
    setRegister(r => r.map(m => m.name === 'Ravi' ? { ...m, plan: 'Premium' } : m));
  }
  function checkT4() {
    if (!t3 || t4) return;
    setT4(true);
    play('remove');
    fireSceneEvent('delete');
    setTimeout(() => {
      setRegister(r => r.filter(m => m.name !== 'Ravi'));
    }, 700);
  }
  function checkT5() {
    if (!t4 || t5) return;
    setT5(true);
    fireSceneEvent('get');
    play('add');
  }

  const testsDoneFiredRef = useRef(false);
  useEffect(() => {
    if (allTestsConfirmed && !testsDoneFiredRef.current) { testsDoneFiredRef.current = true; play('correct'); }
  }, [allTestsConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal
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
          if (count < 6) play('tick');
          if (count >= 6) clearInterval(intv);
        }, 550);
      }, 800);
    }
  }, [allTestsConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2
  const [domain, setDomain] = useState(null);
  const [freeCode, setFreeCode] = useState('');
  const [templateCode, setTemplateCode] = useState('');
  const [p2, setP2] = useState({ c1: false, c2: false, c3: false, c4: false, c5: false, c6: false, c7: false, c8: false });
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [parsedGet, setParsedGet] = useState(null);
  const [parsedPost, setParsedPost] = useState(null);
  const [parsedPut, setParsedPut] = useState(null);
  const [parsedDelete, setParsedDelete] = useState(null);
  const [parsedClass, setParsedClass] = useState(null);

  function handleDomain(d) {
    setDomain(d);
    const m = DOMAIN_MAP[d];
    const generated =
`import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
public class ${d}Controller {

    // stores real ${m.domainClass} objects
    private List<${m.domainClass}> ${m.items} = new ArrayList<>();

    // GET - return all ${m.items} as JSON
    @GetMapping("/${m.path}/${m.items}")
    public List<${m.domainClass}> get${m.Items}() {
        return ${m.items};
    }

    // POST - add a ${m.item} from JSON body
    @PostMapping("/${m.path}/${m.items}")
    public ${m.domainClass} add${m.Item}(@RequestBody ${m.domainClass} ${m.item}) {
        ${m.items}.add(${m.item});
        return ${m.item};
    }

    // PUT - update by name
    @PutMapping("/${m.path}/${m.items}/{name}")
    public ${m.domainClass} update${m.Item}(
        @PathVariable String name,
        @RequestBody ${m.domainClass} updated
    ) {
        for (int i = 0; i < ${m.items}.size(); i++) {
            if (${m.items}.get(i).getName().equals(name)) {
                ${m.items}.set(i, updated);
                return updated;
            }
        }
        return null;
    }

    // DELETE - remove by name
    @DeleteMapping("/${m.path}/${m.items}/{name}")
    public String delete${m.Item}(@PathVariable String name) {
        ${m.items}.removeIf(x -> x.getName().equals(name));
        return "Deleted: " + name;
    }
}`;
    setFreeCode(generated);
    setTemplateCode(generated);
    play('tick');
  }

  const MIN_MEANINGFUL_EDIT_CHARS = 3;
  function meaningfulEditDistance(a, b) {
    const normA = a.replace(/\s+/g, ' ').trim();
    const normB = b.replace(/\s+/g, ' ').trim();
    if (normA === normB) return 0;
    const lenDiff = Math.abs(normA.length - normB.length);
    let mismatches = 0;
    const maxLen = Math.max(normA.length, normB.length);
    for (let i = 0; i < maxLen; i++) if (normA[i] !== normB[i]) mismatches++;
    return Math.max(lenDiff, mismatches);
  }
  const codeWasEdited = meaningfulEditDistance(freeCode, templateCode) >= MIN_MEANINGFUL_EDIT_CHARS;

  useEffect(() => {
    if (!freeCode) return;
    const cls = freeCode.match(/private List<(\w+)>/);
    const gm = freeCode.match(/@GetMapping\("([^"]+)"\)/);
    const pm = freeCode.match(/@PostMapping\("([^"]+)"\)/);
    const pum = freeCode.match(/@PutMapping\("([^"]+)"\)/);
    const dm = freeCode.match(/@DeleteMapping\("([^"]+)"\)/);
    const hasPathVar = /@PathVariable/.test(freeCode);
    const prevGet = parsedGet?.path, prevPost = parsedPost?.path, prevPut = parsedPut?.path, prevDel = parsedDelete?.path;
    setParsedClass(cls ? cls[1] : null);
    setParsedGet(gm ? { path: gm[1] } : null);
    setParsedPost(pm ? { path: pm[1] } : null);
    setParsedPut(pum ? { path: pum[1], pathVar: hasPathVar } : null);
    setParsedDelete(dm ? { path: dm[1], pathVar: hasPathVar } : null);
    if (gm && !prevGet) play('add');
    if (pm && !prevPost) play('add');
    if (pum && !prevPut) play('add');
    if (dm && !prevDel) play('add');
  }, [freeCode]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleP2(key) {
    setP2(prev => {
      if (prev[key]) return prev;
      play('add');
      return { ...prev, [key]: true };
    });
  }

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const allP2Checked = Object.values(p2).every(Boolean);
  const allP2FiredRef = useRef(false);
  useEffect(() => {
    if (allP2Checked && !allP2FiredRef.current) { allP2FiredRef.current = true; play('correct'); }
  }, [allP2Checked]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = parsedGet && parsedPost && parsedPut && parsedDelete && codeWasEdited && allP2Checked && sentences >= 2;

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
        exerciseId: 'm2-t2-s3-crud-domain-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            upgradeUnderstood: upgradeShown,
            noArgConstructorAdded: noArgChecked,
            blanks: { listType: b1, getReturnType: b2, postReturnType: b3, putReturnType: b4 },
            postmanTests: { postWithJsonObject: t1, getReturnsArray: t2, putUpdatesObject: t3, deleteRemoves: t4, confirmDeletion: t5 },
          },
          phase2: {
            domainSelected: domain,
            domainClassName: parsedClass,
            controllerName: domain ? `${domain}Controller` : null,
            endpoints: {
              get: { path: parsedGet?.path },
              post: { path: parsedPost?.path },
              put: { path: parsedPut?.path, usesPathVariable: !!parsedPut?.pathVar },
              delete: { path: parsedDelete?.path, usesPathVariable: !!parsedDelete?.pathVar },
            },
            committedToGitHub: p2.c8,
            fullCode: freeCode,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch(e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const putB4Hint = b4Status === false ? 'Return the updated object type - same class as your list, e.g. GymMember (or "null" for the not-found case).' : '';

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>CRUD Domain Builder</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      {phase === 1 && (
        <div className="progress-strip">
          {['Upgrade to objects', 'Fill in CRUD', 'Test with JSON'].map((label, i) => {
            const stepNum = i + 1;
            const state = slot > stepNum ? 'done' : slot === stepNum ? 'active' : '';
            return (
              <div className="progress-step" key={label} style={{ flex: i === 2 ? '0 1 auto' : 1 }}>
                <div className={`progress-dot ${state}`}>{slot > stepNum ? '✓' : stepNum}</div>
                <span className={`progress-label ${state}`}>{label}</span>
                {i < 2 && <div className={`progress-line ${slot > stepNum ? 'done' : ''}`} />}
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
              {/* SLOT 1 - upgrade */}
              <div ref={el => slotRefs.current[1] = el} className={`card ${slot === 1 ? 'active' : 'complete'}`}>
                <div className="step-counter">Step 1 of 3</div>
                <h2 className="card-header">Your List&lt;String&gt; was practice. Now use your real domain class.</h2>

                {!upgradeShown ? (
                  <button className="btn" onClick={handleShowUpgrade}>Show me the upgrade →</button>
                ) : (
                  <>
                    <div className="before-after">
                      <div className="ba-card before">
                        <div className="ba-title">BEFORE</div>
                        <div className="code-block" style={{ margin: 0, background: 'transparent', padding: 0 }}>
                          <span className="ck">private</span> List&lt;<span className="diff-hl-red">String</span>&gt; members = <span className="ck">new</span> ArrayList&lt;&gt;();<br/><br/>
                          <span className="ca">@PostMapping</span>(<span className="cs">"/gym/members"</span>)<br/>
                          <span className="ck">public</span> String addMember(<br/>
                          &nbsp;&nbsp;<span className="ca">@RequestBody</span> <span className="diff-hl-red">String</span> name<br/>
                          ) {"{"}<br/>
                          &nbsp;&nbsp;members.add(name);<br/>
                          &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Added: "</span> + name;<br/>
                          {"}"}
                        </div>
                        <div className="ba-sub">Stores just a name (String)</div>
                      </div>
                      <div className="ba-card after">
                        <div className="ba-title">AFTER</div>
                        <div className="code-block" style={{ margin: 0, background: 'transparent', padding: 0 }}>
                          <span className="ck">private</span> List&lt;<span className="diff-hl-green">GymMember</span>&gt; members = <span className="ck">new</span> ArrayList&lt;&gt;();<br/><br/>
                          <span className="ca">@PostMapping</span>(<span className="cs">"/gym/members"</span>)<br/>
                          <span className="ck">public</span> <span className="diff-hl-green">GymMember</span> addMember(<br/>
                          &nbsp;&nbsp;<span className="ca">@RequestBody</span> <span className="diff-hl-green">GymMember</span> member<br/>
                          ) {"{"}<br/>
                          &nbsp;&nbsp;members.add(member);<br/>
                          &nbsp;&nbsp;<span className="ck">return</span> member;<br/>
                          {"}"}
                        </div>
                        <div className="ba-sub">Stores full GymMember object</div>
                      </div>
                    </div>

                    <div className="change-badge">🔁 Return type: <b>List&lt;GymMember&gt;</b> not List&lt;String&gt;</div>
                    <div className="change-badge">📥 @RequestBody receives: <b>GymMember</b> not String</div>
                    <div className="change-badge">📤 Method returns: <b>member object</b> not a String message</div>

                    <div className="purple-note">
                      When Postman sends this JSON:
                      <div className="test-json">
                        {'{'}<br/>
                        &nbsp;&nbsp;<span className="jk">"name"</span>: <span className="jv">"Ravi"</span>,<br/>
                        &nbsp;&nbsp;<span className="jk">"age"</span>: <span className="jv">21</span>,<br/>
                        &nbsp;&nbsp;<span className="jk">"plan"</span>: <span className="jv">"Basic"</span>,<br/>
                        &nbsp;&nbsp;<span className="jk">"isActive"</span>: <span className="jv">true</span><br/>
                        {'}'}
                      </div>
                      Spring Boot reads it and creates <b>new GymMember()</b>, then sets <code>name</code>, <code>age</code>, <code>plan</code>, <code>isActive</code> - automatically. You write zero conversion code.
                    </div>

                    <div className="amber-note">
                      <div className="amber-note-title">⚠️ One thing to add to your GymMember class:</div>
                      <div className="code-block" style={{ margin: '8px 0 0' }}>
                        <span className="ck">public</span> GymMember() {"{ }"} <span className="cc">// empty constructor</span><br/>
                        <span className="cc">// Spring Boot needs this to create the object before filling in fields</span>
                      </div>
                      Add this alongside your existing constructor.
                    </div>

                    <label className="checkbox-label">
                      <input type="checkbox" checked={noArgChecked} onChange={handleNoArgCheck} />
                      ✅ I added a no-arg constructor to my domain class
                    </label>

                    {noArgChecked && (
                      <button className="btn purple" style={{ width: '100%', marginTop: 8 }} onClick={() => { play('tick'); setSlot(2); }}>
                        Build the full CRUD →
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* SLOT 2 - 4 blanks */}
              {slot >= 2 && (
                <div ref={el => slotRefs.current[2] = el} className={`card ${slot === 2 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 2 of 3</div>
                  <h2 className="card-header">Complete CRUD with real objects</h2>
                  <p style={{ color: '#475569', margin: '0 0 8px' }}>Using GymMember as the example - fill in the 4 return types.</p>

                  <div className="code-block">
                    <span className="ck">@RestController</span><br/>
                    <span className="ck">public class</span> GymController {"{"}<br/><br/>
                    &nbsp;&nbsp;<span className="ck">private</span> List&lt;<div className="blank-wrap">
                      <input className={`blank-input ${b1Status === true ? 'blank-correct' : b1Status === false ? 'blank-wrong' : ''}`}
                        placeholder="GymMember" style={{ width: 110 }} value={b1} onChange={e => handleB1(e.target.value)} onBlur={checkB1} />
                    </div>&gt; items = <span className="cc">// blank 1 - your domain class name</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">new</span> ArrayList&lt;&gt;();<br/><br/>
                    &nbsp;&nbsp;<span className="ca">@GetMapping</span>(<span className="cs">"/gym/members"</span>)<br/>
                    &nbsp;&nbsp;<span className="ck">public</span> <div className="blank-wrap">
                      <input className={`blank-input ${b2Status === true ? 'blank-correct' : b2Status === false ? 'blank-wrong' : ''}`}
                        placeholder="List<GymMember>" style={{ width: 150 }} value={b2} onChange={e => handleB2(e.target.value)} onBlur={checkB2} />
                    </div> getMembers() {"{"} <span className="cc">// blank 2</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> items;<br/>
                    &nbsp;&nbsp;{"}"}<br/><br/>
                    &nbsp;&nbsp;<span className="ca">@PostMapping</span>(<span className="cs">"/gym/members"</span>)<br/>
                    &nbsp;&nbsp;<span className="ck">public</span> <div className="blank-wrap">
                      <input className={`blank-input ${b3Status === true ? 'blank-correct' : b3Status === false ? 'blank-wrong' : ''}`}
                        placeholder="GymMember" style={{ width: 110 }} value={b3} onChange={e => handleB3(e.target.value)} onBlur={checkB3} />
                    </div> addMember( <span className="cc">// blank 3</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ca">@RequestBody</span> GymMember item<br/>
                    &nbsp;&nbsp;) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;items.add(item);<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> item;<br/>
                    &nbsp;&nbsp;{"}"}<br/><br/>
                    &nbsp;&nbsp;<span className="ca">@PutMapping</span>(<span className="cs">"/gym/members/{'{name}'}"</span>)<br/>
                    &nbsp;&nbsp;<span className="ck">public</span> <div className="blank-wrap">
                      <input className={`blank-input ${b4Status === true ? 'blank-correct' : b4Status === false ? 'blank-wrong' : ''}`}
                        placeholder="GymMember" style={{ width: 110 }} value={b4} onChange={e => handleB4(e.target.value)} onBlur={checkB4} />
                    </div> updateMember( <span className="cc">// blank 4</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ca">@PathVariable</span> String name,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ca">@RequestBody</span> GymMember updated<br/>
                    &nbsp;&nbsp;) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">for</span> (<span className="ck">int</span> i = 0; i {'<'} items.size(); i++) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">if</span> (items.get(i).getName().equals(name)) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;items.set(i, updated);<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> updated;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="co">null</span>;<br/>
                    &nbsp;&nbsp;{"}"}<br/><br/>
                    &nbsp;&nbsp;<span className="ca">@DeleteMapping</span>(<span className="cs">"/gym/members/{'{name}'}"</span>)<br/>
                    &nbsp;&nbsp;<span className="ck">public</span> String deleteMember(<span className="ca">@PathVariable</span> String name) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;items.<span className="cy">removeIf</span>(item <span className="clam">-&gt;</span> item.getName().equals(name));<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Deleted: "</span> + name;<br/>
                    &nbsp;&nbsp;{"}"}<br/>
                    {"}"}
                  </div>

                  {b1Status === false && <div className="warn-msg">Type your domain class name - e.g. GymMember.</div>}
                  {b2Status === false && <div className="warn-msg">Your return type must contain "List" - e.g. List&lt;GymMember&gt;.</div>}
                  {b3Status === false && <div className="warn-msg">POST returns the saved object - same class as blank 1.</div>}
                  {b4Status === false && <div className="warn-msg">{putB4Hint}</div>}

                  {allBlanksCorrect && (
                    <div style={{ marginTop: 16, animation: 'slideIn 0.3s' }}>
                      {!removeIfShown ? (
                        <button className="btn" onClick={handleShowRemoveIf}>What does removeIf do? →</button>
                      ) : (
                        <div className="purple-note">
                          <div className="code-block" style={{ margin: '0 0 8px' }}>
                            items.<span className="cy">removeIf</span>(<br/>
                            &nbsp;&nbsp;item <span className="clam">-&gt;</span> item.getName().equals(name)<br/>
                            )
                          </div>
                          <b>removeIf</b> - goes through every item, removes any that match the condition.<br/>
                          <code>item -&gt; item.getName().equals(name)</code> - for each item, check if the name matches.
                        </div>
                      )}
                      <button className="btn green" style={{ marginTop: 12, width: '100%' }} onClick={() => { play('tick'); setSlot(3); }}>
                        Test with full JSON objects →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SLOT 3 - Postman JSON testing */}
              {slot >= 3 && (
                <div ref={el => slotRefs.current[3] = el} className="card active" style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 3 of 3</div>
                  <h2 className="card-header">Test with full JSON objects</h2>

                  <div className={`test-card${t1 ? ' confirmed' : ''}`}>
                    <div><span className="method-badge badge-post">POST</span> localhost:8080/gym/members</div>
                    <div className="test-json">
                      {'{'}<br/>
                      &nbsp;&nbsp;<span className="jk">"name"</span>: <span className="jv">"Ravi"</span>,<br/>
                      &nbsp;&nbsp;<span className="jk">"age"</span>: <span className="jv">21</span>,<br/>
                      &nbsp;&nbsp;<span className="jk">"plan"</span>: <span className="jv">"Basic"</span>,<br/>
                      &nbsp;&nbsp;<span className="jk">"isActive"</span>: <span className="jv">true</span><br/>
                      {'}'}
                    </div>
                    <label className="checkbox-label" style={{ marginTop: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={t1} onChange={checkT1} />
                      ✅ POST with full JSON object works
                    </label>
                  </div>

                  <div className={`test-card${t2 ? ' confirmed' : ''}`} style={{ opacity: t1 ? 1 : 0.5 }}>
                    <div><span className="method-badge badge-get">GET</span> localhost:8080/gym/members</div>
                    <div className="test-json">
                      [{'{'} <span className="jk">"name"</span>: <span className="jv">"Ravi"</span>, <span className="jk">"age"</span>: <span className="jv">21</span>, ... {'}'}]
                    </div>
                    <label className="checkbox-label" style={{ marginTop: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={t2} disabled={!t1} onChange={checkT2} />
                      ✅ GET returns array of objects
                    </label>
                  </div>

                  <div className={`test-card${t3 ? ' confirmed' : ''}`} style={{ opacity: t2 ? 1 : 0.5 }}>
                    <div><span className="method-badge badge-put">PUT</span> localhost:8080/gym/members/Ravi</div>
                    <div className="test-json">
                      {'{'} <span className="jk">"name"</span>: <span className="jv">"Ravi"</span>, <span className="jk">"plan"</span>: <span className="jv">"Premium"</span>, ... {'}'}
                    </div>
                    <label className="checkbox-label" style={{ marginTop: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={t3} disabled={!t2} onChange={checkT3} />
                      ✅ PUT updates a specific object
                    </label>
                  </div>

                  <div className={`test-card${t4 ? ' confirmed' : ''}`} style={{ opacity: t3 ? 1 : 0.5 }}>
                    <div><span className="method-badge badge-delete">DELETE</span> localhost:8080/gym/members/Ravi</div>
                    <label className="checkbox-label" style={{ marginTop: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={t4} disabled={!t3} onChange={checkT4} />
                      ✅ DELETE removes by name
                    </label>
                  </div>

                  <div className={`test-card${t5 ? ' confirmed' : ''}`} style={{ opacity: t4 ? 1 : 0.5 }}>
                    <div><span className="method-badge badge-get">GET</span> localhost:8080/gym/members</div>
                    <label className="checkbox-label" style={{ marginTop: 8, marginBottom: 0 }}>
                      <input type="checkbox" checked={t5} disabled={!t4} onChange={checkT5} />
                      ✅ GET after DELETE confirms removal
                    </label>
                  </div>

                  {allTestsConfirmed && revealLines > 0 && (
                    <div className="reveal-card" style={{ marginTop: 24, animation: 'slideIn 0.3s' }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#92400E' }}>What you just learned 🎉</h3>
                      {revealLines >= 1 && <div className="reveal-line">✅ <b>List&lt;DomainClass&gt;</b> → a list of real objects - not just Strings</div>}
                      {revealLines >= 2 && <div className="reveal-line">✅ <b>@RequestBody DomainClass</b> → Spring Boot deserialises JSON → Java object</div>}
                      {revealLines >= 3 && <div className="reveal-line">✅ <b>Serialisation</b> → Java object → JSON, happens automatically on return</div>}
                      {revealLines >= 4 && <div className="reveal-line">✅ <b>Deserialisation</b> → JSON → Java object, happens automatically with @RequestBody</div>}
                      {revealLines >= 5 && <div className="reveal-line">✅ <b>No-arg constructor</b> → Spring Boot needs an empty constructor to create objects</div>}
                      {revealLines >= 6 && <div className="reveal-line">✅ <b>removeIf(condition)</b> → removes items matching a condition</div>}
                      {revealLines >= 6 && (
                        <div style={{ marginTop: 24, textAlign: 'center', animation: 'slideIn 0.3s' }}>
                          <h3 style={{ color: '#1E293B' }}>
                            Your controller now works with real domain objects.<br/>
                            Postman sends JSON. Spring Boot converts to GymMember.<br/>
                            You work with real objects. Spring Boot converts back to JSON.<br/><br/>
                            This structure stays the same all the way through the project.<br/><br/>
                            One thing left - your data still resets on restart.<br/>
                            Next topic - MySQL. The notebook that survives everything.
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
              <h2 className="card-header" style={{ fontSize: '1.5rem' }}>Your complete domain CRUD controller</h2>
              <p style={{ color: '#64748B' }}>Use your real domain class. All 4 operations. Real objects.</p>

              {!domain ? (
                <div className="domain-pills">
                  <button className="domain-pill" onClick={() => handleDomain('Gym')}>🏋️ Gym</button>
                  <button className="domain-pill" onClick={() => handleDomain('Mess')}>🍱 Mess</button>
                  <button className="domain-pill" onClick={() => handleDomain('Hotel')}>🏨 Hotel</button>
                  <button className="domain-pill" onClick={() => handleDomain('Chai')}>☕ Chai</button>
                </div>
              ) : (
                <>
                  <textarea className="free-editor" value={freeCode} onChange={e => setFreeCode(e.target.value)} onPaste={e => e.preventDefault()} onContextMenu={e => e.preventDefault()} spellCheck="false" />
                  {!codeWasEdited && (
                    <div className="warn-msg" style={{ marginTop: 10 }}>
                      ✏️ This is the auto-filled starting point - before continuing, make a real change (a few characters isn't enough): rename a field, adjust a path, or add a comment in your own words.
                    </div>
                  )}

                  <div className="amber-note">
                    <div className="amber-note-title">After your CRUD is working:</div>
                    <div className="code-block" style={{ margin: '8px 0 0' }}>
                      git add .<br/>
                      git commit -m "add complete CRUD for {domain}"<br/>
                      git push origin main
                    </div>
                    This commit goes on your GitHub. Your mentor can see your controller.
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={p2.c8} onChange={() => toggleP2('c8')} disabled={!codeWasEdited} />
                    ✅ I committed and pushed my CRUD controller
                  </label>

                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Checklist:</h4>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c1} onChange={() => toggleP2('c1')} disabled={!codeWasEdited} />List&lt;DomainClass&gt; replacing List&lt;String&gt;</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c2} onChange={() => toggleP2('c2')} disabled={!p2.c1} />POST receives and returns domain object</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c3} onChange={() => toggleP2('c3')} disabled={!p2.c2} />GET returns List of domain objects</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c4} onChange={() => toggleP2('c4')} disabled={!p2.c3} />PUT updates by name with @PathVariable</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c5} onChange={() => toggleP2('c5')} disabled={!p2.c4} />DELETE removes by name</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c6} onChange={() => toggleP2('c6')} disabled={!p2.c5} />No-arg constructor in domain class</label>
                    <label className="checkbox-label"><input type="checkbox" checked={p2.c7} onChange={() => toggleP2('c7')} disabled={!p2.c6} />Tested all 4 with Postman JSON</label>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Reflection:</h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 8px 0' }}>
                      In 2 sentences - what is the difference between storing List&lt;String&gt; and List&lt;{parsedClass || 'YourDomainClass'}&gt;, and why does it matter?
                    </p>
                    <textarea className="reflection-box" placeholder="List<String> only stores names. List<GymMember> stores full member objects with all fields. It matters because..." value={reflection} onChange={e => setReflection(e.target.value)} onPaste={e => e.preventDefault()} />
                    <div className={`word-count ${sentences >= 2 ? 'ok' : ''}`}>{sentences} / 2 sentences minimum</div>
                  </div>

                  <button className="btn green" style={{ width: '100%', padding: 16, fontSize: '1.1rem', marginTop: 24, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? 'Completed ✅' : 'CRUD with real objects is working - on to MySQL →'}
                  </button>

                  {submitted && (
                    <div style={{ marginTop: 20, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46', animation: 'popIn 0.3s' }}>
                      <b>Topic 2 complete. 🎉</b><br/><br/>
                      ✅ Stores real domain objects<br/>
                      ✅ All 4 CRUD operations working<br/>
                      ✅ Spring Boot converts JSON ↔ Java automatically<br/>
                      ✅ Pushed to GitHub<br/><br/>
                      But every restart wipes your data.<br/><br/>
                      <b>Topic 3 - MySQL. Connect your server to a real database. Add a member - restart - they are still there.
                      That is the difference between a prototype and a real application.</b>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="split-right-col">
          <div className="sticky-panel">

            {/* JSON <-> Java conversion visual */}
            <div className="card" style={{ opacity: phase === 2 ? 0.3 : 1, transition: 'opacity 0.3s', marginBottom: 16 }}>
              <div className="step-counter" style={{ marginBottom: 10 }}>Postman sends → Spring Boot converts</div>
              <div className="conv-wrap">
                <div className="conv-box conv-json">
                  {'{'}<br/>
                  &nbsp;&nbsp;<span className="jk">"name"</span>: <span className="jv">"Ravi"</span>,<br/>
                  &nbsp;&nbsp;<span className="jk">"age"</span>: <span className="jv">21</span>,<br/>
                  &nbsp;&nbsp;<span className="jk">"plan"</span>: <span className="jv">"Basic"</span><br/>
                  {'}'}
                </div>
                <div className="conv-arrow">↔<span className="conv-arrow-label">Spring Boot</span></div>
                <div className="conv-box conv-java">
                  <div className="conv-java-title">GymMember</div>
                  <div className="conv-field"><span className="fname">name</span> = "Ravi"</div>
                  <div className="conv-field"><span className="fname">age</span> = 21</div>
                  <div className="conv-field"><span className="fname">plan</span> = "Basic"</div>
                </div>
              </div>
            </div>

            {/* Filing cabinet - illustrated, event-driven */}
            <div style={{ opacity: phase === 2 ? 0.3 : 1, transition: 'opacity 0.3s', marginBottom: 16 }}>
              <FilingCabinetScene
                items={register}
                fields={GYM.fields}
                event={sceneEvent}
                targetName="Ravi"
                updatedFields={t3 || t4 || t5 ? { plan: 'Premium' } : null}
                wasRestarted={false}
              />
            </div>

            {/* Route cards */}
            <div>
              {slot >= 2 && allBlanksCorrect && (
                <>
                  <div className="route-card get"><span className="method-badge badge-get">GET</span> /gym/members <span style={{ color: '#94A3B8' }}>→</span> List&lt;GymMember&gt;</div>
                  <div className="route-card post"><span className="method-badge badge-post">POST</span> /gym/members <span style={{ color: '#94A3B8' }}>→</span> GymMember</div>
                  <div className="route-card put"><span className="method-badge badge-put">PUT</span> /gym/members/{'{name}'} <span style={{ color: '#94A3B8' }}>→</span> GymMember</div>
                  <div className="route-card delete"><span className="method-badge badge-delete">DELETE</span> /gym/members/{'{name}'} <span style={{ color: '#94A3B8' }}>→</span> String</div>
                </>
              )}
              {phase === 2 && parsedGet && <div className="route-card get"><span className="method-badge badge-get">GET</span> {parsedGet.path} <span style={{ color: '#94A3B8' }}>→</span> List&lt;{parsedClass || domain}&gt;</div>}
              {phase === 2 && parsedPost && <div className="route-card post"><span className="method-badge badge-post">POST</span> {parsedPost.path} <span style={{ color: '#94A3B8' }}>→</span> {parsedClass || domain}</div>}
              {phase === 2 && parsedPut && <div className="route-card put"><span className="method-badge badge-put">PUT</span> {parsedPut.path} <span style={{ color: '#94A3B8' }}>→</span> {parsedClass || domain}</div>}
              {phase === 2 && parsedDelete && <div className="route-card delete"><span className="method-badge badge-delete">DELETE</span> {parsedDelete.path} <span style={{ color: '#94A3B8' }}>→</span> String</div>}
            </div>

            {phase === 1 && slot >= 2 && allBlanksCorrect && (
              <table className="crud-table">
                <thead><tr><th>Method</th><th>Returns</th></tr></thead>
                <tbody>
                  <tr><td><span className="method-badge badge-get">GET</span></td><td>List&lt;GymMember&gt;</td></tr>
                  <tr><td><span className="method-badge badge-post">POST</span></td><td>GymMember</td></tr>
                  <tr><td><span className="method-badge badge-put">PUT</span></td><td>GymMember</td></tr>
                  <tr><td><span className="method-badge badge-delete">DELETE</span></td><td>String</td></tr>
                </tbody>
              </table>
            )}

            {phase === 2 && (
              <div className="stat-box">
                <div className="stat-row"><span>Domain class:</span><b>{parsedClass || '-'}</b></div>
                <div className="stat-row"><span>Endpoints:</span><b>{[parsedGet, parsedPost, parsedPut, parsedDelete].filter(Boolean).length} / 4</b></div>
                <div className="stat-row"><span>Ready for MySQL:</span><b style={{ color: allP2Checked ? '#16A34A' : '#94A3B8' }}>{allP2Checked ? '✅' : '-'}</b></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
