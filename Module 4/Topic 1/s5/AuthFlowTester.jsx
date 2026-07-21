import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .aft-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0B0F19;
    min-height: 100vh;
    padding: 24px 16px 60px;
    color: #E2E8F0;
    line-height: 1.5;
  }
  .aft-root * { box-sizing: border-box; }

  /* ── Header ── */
  .aft-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; max-width: 1260px; margin-left: auto; margin-right: auto;
  }
  .aft-header h1 { margin: 0; font-size: 1.4rem; font-weight: 900; color: #F1F5F9; letter-spacing: -0.02em; }
  .aft-subtitle { font-size: 0.8rem; color: #64748B; max-width: 1260px; margin: 0 auto 20px; }
  .mute-btn {
    background: #1E293B; color: #94A3B8; border: 1px solid #334155;
    padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.82rem;
    transition: all 0.2s;
  }
  .mute-btn:hover { border-color: #64748B; color: #E2E8F0; }

  /* ── Progress rail ── */
  .rail-strip {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    max-width: 1260px; margin: 0 auto 22px; flex-wrap: wrap;
  }
  .rail-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px; font-size: 0.74rem; font-weight: 700;
    background: #1E293B; color: #475569; border: 1px solid #1E293B;
    transition: all 0.3s;
  }
  .rail-pill.active { background: rgba(59,130,246,0.15); color: #60A5FA; border-color: rgba(59,130,246,0.4); }
  .rail-pill.done { background: rgba(16,185,129,0.12); color: #34D399; border-color: rgba(16,185,129,0.3); }
  .rail-line { width: 22px; height: 2px; background: #1E293B; border-radius: 2px; transition: background 0.3s; }
  .rail-line.done { background: #10B981; }

  /* ── Main Layout ── */
  .aft-layout {
    display: grid; grid-template-columns: 1fr 420px; gap: 22px;
    max-width: 1260px; margin: 0 auto;
  }
  .aft-layout > .right-col { align-self: stretch; }
  @media(max-width: 1050px) {
    .aft-layout { grid-template-columns: 1fr; }
    .aft-layout > .right-col { align-self: auto; }
  }

  /* ── LEFT: step cards ── */
  .step-card {
    background: #111827; border: 1px solid #1E293B; border-radius: 14px;
    padding: 22px; margin-bottom: 16px; transition: opacity 0.3s, border-color 0.3s;
  }
  .step-card.locked { opacity: 0.35; pointer-events: none; }
  .step-card.firing { border-color: rgba(251,191,36,0.5); }
  .step-card.passed { border-color: rgba(16,185,129,0.4); }

  .step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 50%; background: #1E293B;
    color: #64748B; font-size: 0.72rem; font-weight: 800; margin-right: 8px; flex-shrink: 0;
    transition: all 0.3s;
  }
  .step-num.active { background: #3B82F6; color: #fff; }
  .step-num.done { background: #10B981; color: #fff; }

  .step-title-row { display: flex; align-items: center; margin-bottom: 14px; }
  .step-title { font-size: 1rem; font-weight: 800; color: #F1F5F9; margin: 0; }

  /* ── HTTP request simulator ── */
  .http-sim {
    background: #0B0F19; border: 1px solid #1F2937; border-radius: 10px;
    overflow: hidden; margin-bottom: 14px;
  }
  .http-sim-bar {
    display: flex; align-items: center; gap: 10px; padding: 9px 14px;
    background: #111827; border-bottom: 1px solid #1F2937;
  }
  .http-method-badge {
    font-family: 'Fira Code', monospace; font-size: 0.72rem; font-weight: 700;
    padding: 3px 9px; border-radius: 5px;
  }
  .http-method-badge.get { background: rgba(22,163,74,0.15); color: #4ADE80; border: 1px solid rgba(22,163,74,0.3); }
  .http-method-badge.post { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); }
  .http-url { font-family: 'Fira Code', monospace; font-size: 0.78rem; color: #94A3B8; flex: 1; }
  .http-send-btn {
    background: #3B82F6; color: #fff; border: none; border-radius: 6px;
    padding: 5px 14px; font-weight: 700; cursor: pointer; font-size: 0.76rem;
    transition: all 0.15s;
  }
  .http-send-btn:hover { background: #2563EB; transform: translateY(-1px); }
  .http-send-btn:active { transform: translateY(0); }
  .http-send-btn:disabled { background: #1E293B; color: #475569; cursor: not-allowed; transform: none; }

  .http-body { padding: 12px 14px; font-family: 'Fira Code', monospace; font-size: 0.76rem; color: #64748B; line-height: 1.7; }
  .http-key { color: #93C5FD; }
  .http-val { color: #86EFAC; }
  .http-auth-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 0.74rem; color: #64748B; }
  .http-auth-badge { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: #FCD34D; padding: 2px 8px; border-radius: 4px; font-family: 'Fira Code', monospace; }

  /* response line */
  .http-response {
    border-top: 1px solid #1F2937; padding: 10px 14px;
    font-family: 'Fira Code', monospace; font-size: 0.8rem; min-height: 48px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .res-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #334155; border-top-color: #60A5FA; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; margin-top: 2px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .res-status { font-weight: 700; flex-shrink: 0; }
  .res-status.ok { color: #4ADE80; }
  .res-status.err { color: #F87171; }
  .res-body { color: #94A3B8; white-space: pre-wrap; word-break: break-all; }

  .info-box { background: #1E293B; border-left: 3px solid #3B82F6; border-radius: 0 8px 8px 0; padding: 10px 14px; font-size: 0.82rem; color: #94A3B8; line-height: 1.7; margin-bottom: 12px; }
  .info-box b { color: #E2E8F0; }
  .warn-box { background: #1E293B; border-left: 3px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 10px 14px; font-size: 0.82rem; color: #94A3B8; line-height: 1.7; margin-bottom: 12px; }
  .warn-box b { color: #FCD34D; }
  .good-box { background: #1E293B; border-left: 3px solid #10B981; border-radius: 0 8px 8px 0; padding: 10px 14px; font-size: 0.82rem; color: #94A3B8; line-height: 1.7; margin-bottom: 12px; }
  .good-box b { color: #34D399; }

  .confirm-btn {
    display: flex; align-items: center; gap: 10px; width: 100%;
    background: #1E293B; border: 1.5px solid #334155; border-radius: 8px;
    padding: 11px 14px; font-weight: 700; font-size: 0.88rem; color: #94A3B8;
    cursor: pointer; transition: all 0.2s; margin-top: 10px; text-align: left;
  }
  .confirm-btn:hover { border-color: #475569; color: #E2E8F0; }
  .confirm-btn.confirmed { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.4); color: #34D399; }
  .confirm-check { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #334155; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: all 0.2s; flex-shrink: 0; }
  .confirm-btn.confirmed .confirm-check { background: #10B981; border-color: #10B981; }

  /* contrast before/after */
  .contrast-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
  @media(max-width: 600px) { .contrast-grid { grid-template-columns: 1fr; } }
  .contrast-col { border-radius: 8px; padding: 12px 14px; font-size: 0.78rem; line-height: 1.8; font-family: 'Fira Code', monospace; }
  .contrast-col.before { background: rgba(220,38,38,0.06); border-left: 3px solid #DC2626; color: #F87171; }
  .contrast-col.after { background: rgba(16,185,129,0.06); border-left: 3px solid #10B981; color: #4ADE80; }
  .contrast-title { font-weight: 800; font-family: 'Inter', sans-serif; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; opacity: 0.7; }

  /* "one problem left" section */
  .repeat-strip { margin: 10px 0; }
  .repeat-row { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #64748B; padding: 6px 10px; background: rgba(220,38,38,0.05); border: 1px solid rgba(220,38,38,0.1); border-radius: 6px; margin-bottom: 4px; font-family: 'Fira Code', monospace; }
  .repeat-warn { color: #F87171; font-weight: 800; font-size: 0.76rem; text-align: center; margin-top: 8px; padding: 8px; background: rgba(220,38,38,0.08); border-radius: 6px; }

  /* JWT code block */
  .code-block {
    background: #0B0F19; color: #E2E8F0; border-radius: 10px; border: 1px solid #1F2937;
    padding: 14px 16px; font-family: 'Fira Code', monospace; font-size: 0.76rem; line-height: 1.8;
    margin: 10px 0; overflow-x: auto; position: relative; white-space: pre-wrap;
  }
  .copy-btn {
    position: absolute; top: 8px; right: 8px; background: #1E293B; color: #94A3B8;
    border: 1px solid #334155; border-radius: 5px; padding: 3px 9px; font-size: 0.66rem;
    cursor: pointer; font-weight: 700; transition: all 0.15s;
  }
  .copy-btn:hover { color: #E2E8F0; border-color: #64748B; }
  .code-comment { color: #475569; }
  .code-key { color: #93C5FD; }
  .code-val { color: #86EFAC; }

  /* Questions */
  .q-card { background: #111827; border: 1px solid #1E293B; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
  .q-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 12px; color: #F1F5F9; }
  .opt-btn {
    display: block; width: 100%; text-align: left; padding: 11px 14px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1.5px solid #1E293B;
    background: #0B0F19; margin-bottom: 7px; transition: all 0.2s; color: #94A3B8;
    font-family: 'Inter', sans-serif;
  }
  .opt-btn:hover { border-color: #334155; color: #E2E8F0; }
  .opt-btn.correct { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.4); color: #4ADE80; }
  .opt-btn.wrong { background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.4); color: #F87171; animation: shake 0.3s; }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .qcheck-note { font-size: 0.8rem; margin-top: 8px; padding: 10px 12px; border-radius: 8px; }
  .qcheck-note.wrong { background: rgba(220,38,38,0.08); color: #F87171; }
  .qcheck-note.correct { background: rgba(16,185,129,0.08); color: #4ADE80; }

  .reflection-box {
    width: 100%; border: 1.5px solid #1E293B; border-radius: 10px; padding: 14px;
    font-size: 0.88rem; font-family: 'Inter', sans-serif; resize: vertical; min-height: 90px;
    outline: none; background: #0B0F19; color: #E2E8F0; transition: border-color 0.2s;
  }
  .reflection-box:focus { border-color: #3B82F6; }
  .reflection-box::placeholder { color: #475569; }
  .word-count { text-align: right; font-size: 0.76rem; color: #64748B; margin-top: 4px; }
  .word-count.ok { color: #34D399; }

  .submit-btn {
    display: block; width: 100%; padding: 14px 24px; border-radius: 10px; font-size: 1rem;
    font-weight: 800; cursor: pointer; border: none; margin-top: 14px; transition: all 0.2s;
    background: linear-gradient(135deg, #10B981, #059669); color: #fff; letter-spacing: 0.01em;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
  .submit-btn:disabled { background: #1E293B; color: #475569; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── RIGHT: health dashboard ── */
  .dashboard-shell {
    background: #0B0F19; border: 1px solid #1F2937; border-radius: 16px;
    overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); position: sticky; top: 24px;
  }
  @media(max-width: 1050px) { .dashboard-shell { position: static; } }

  .dash-topbar {
    background: #111827; padding: 10px 16px; display: flex; align-items: center;
    gap: 8px; border-bottom: 1px solid #1F2937;
  }
  .dash-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dash-dot.r { background: #EF4444; } .dash-dot.y { background: #F59E0B; } .dash-dot.g { background: #10B981; }
  .dash-title { color: #64748B; font-size: 0.72rem; font-weight: 700; margin-left: 6px; font-family: 'Fira Code', monospace; }
  .dash-live-badge {
    margin-left: auto; font-size: 0.62rem; font-weight: 800; padding: 3px 9px;
    border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .dash-live-badge.running { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); animation: blink-badge 1.4s ease-in-out infinite; }
  .dash-live-badge.locked { background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }
  @keyframes blink-badge { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  /* test items */
  .dash-body { padding: 16px; }
  .test-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    border-radius: 10px; border: 1px solid #1F2937; background: #111827;
    margin-bottom: 10px; transition: all 0.4s ease;
  }
  .test-item.pending { opacity: 0.45; }
  .test-item.running { border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.04); opacity: 1; }
  .test-item.pass { border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.05); opacity: 1; }

  .test-dot {
    width: 10px; height: 10px; border-radius: 50%; background: #1E293B; flex-shrink: 0;
    border: 2px solid #334155; transition: all 0.4s;
  }
  .test-item.running .test-dot { background: #F59E0B; border-color: #F59E0B; animation: dot-pulse 0.8s ease-in-out infinite; }
  .test-item.pass .test-dot { background: #10B981; border-color: #10B981; }
  @keyframes dot-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.4); } }

  .test-info { flex: 1; }
  .test-name { font-size: 0.82rem; font-weight: 700; color: #94A3B8; transition: color 0.3s; }
  .test-item.running .test-name { color: #FCD34D; }
  .test-item.pass .test-name { color: #E2E8F0; }
  .test-sub { font-family: 'Fira Code', monospace; font-size: 0.68rem; color: #475569; margin-top: 2px; }

  .test-badge { font-size: 0.65rem; font-weight: 800; padding: 3px 9px; border-radius: 6px; flex-shrink: 0; }
  .test-item.pending .test-badge { background: #1E293B; color: #475569; }
  .test-item.running .test-badge { background: rgba(251,191,36,0.12); color: #FCD34D; }
  .test-item.pass .test-badge { background: rgba(16,185,129,0.12); color: #34D399; }

  /* response preview inside dashboard */
  .dash-response {
    background: #0B0F19; border: 1px solid #1F2937; border-radius: 8px;
    padding: 10px 12px; font-family: 'Fira Code', monospace; font-size: 0.7rem;
    color: #64748B; margin-top: 8px; line-height: 1.7;
    animation: slideIn 0.3s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .dr-ok { color: #4ADE80; font-weight: 700; }
  .dr-err { color: #F87171; font-weight: 700; }

  /* score bar */
  .score-bar-wrap { margin: 16px 0 0; }
  .score-bar-label { display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748B; font-weight: 700; margin-bottom: 6px; }
  .score-bar-track { height: 6px; background: #1E293B; border-radius: 10px; overflow: hidden; }
  .score-bar-fill { height: 100%; background: linear-gradient(90deg, #3B82F6, #10B981); border-radius: 10px; transition: width 0.5s ease; }

  /* JWT teaser panel */
  .jwt-teaser {
    margin-top: 14px; border: 1.5px solid rgba(139,92,246,0.35); border-radius: 12px;
    background: rgba(139,92,246,0.05); padding: 14px 16px;
    animation: glowPulse 3s ease-in-out infinite;
  }
  @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.1); } 50% { box-shadow: 0 0 0 6px rgba(139,92,246,0.05); } }
  .jwt-teaser-title { font-size: 0.78rem; font-weight: 800; color: #A78BFA; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .jwt-teaser-badge { font-size: 0.6rem; background: rgba(139,92,246,0.2); color: #A78BFA; padding: 2px 7px; border-radius: 8px; font-weight: 700; }

  .jwt-compare-row { display: flex; gap: 10px; }
  .jwt-compare-col { flex: 1; }
  .jwt-compare-head { font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
  .jwt-compare-head.basic { color: #F87171; }
  .jwt-compare-head.jwt { color: #34D399; }
  .jwt-mini-row { font-size: 0.64rem; font-family: 'Fira Code', monospace; padding: 4px 7px; border-radius: 4px; margin-bottom: 3px; }
  .jwt-mini-row.basic-row { background: rgba(220,38,38,0.08); color: #F87171; }
  .jwt-mini-row.jwt-row { background: rgba(16,185,129,0.08); color: #4ADE80; }

  .boarding-flow { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 10px; }
  .b-tag { background: #1E293B; border: 1px solid #334155; border-radius: 5px; padding: 3px 8px; font-family: 'Fira Code', monospace; font-size: 0.62rem; color: #94A3B8; }
  .b-arrow { color: #475569; font-size: 0.7rem; }

  /* ── CELEBRATION ── */
  .celebration-overlay {
    position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .confetti-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }

  .celebration-card {
    position: relative; z-index: 101; background: #111827; border: 1px solid rgba(16,185,129,0.3);
    border-radius: 20px; padding: 40px 48px; text-align: center; max-width: 560px; width: 90%;
    box-shadow: 0 0 0 1px rgba(16,185,129,0.1), 0 40px 80px rgba(0,0,0,0.6);
    animation: cardPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards;
    pointer-events: all;
  }
  @keyframes cardPop { from { transform: scale(0.7) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

  .cel-glow { position: absolute; inset: -1px; border-radius: 20px; background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1)); pointer-events: none; }
  .cel-icon { font-size: 3.5rem; margin-bottom: 12px; animation: bounce 0.8s ease 0.4s both; }
  @keyframes bounce { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .cel-heading { font-size: 1.8rem; font-weight: 900; color: #F1F5F9; margin-bottom: 6px; letter-spacing: -0.02em; }
  .cel-sub { font-size: 0.9rem; color: #64748B; margin-bottom: 28px; }

  .cel-list { list-style: none; margin: 0 0 28px; padding: 0; text-align: left; }
  .cel-list li {
    display: flex; align-items: center; gap: 10px; padding: 9px 14px;
    background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);
    border-radius: 8px; margin-bottom: 6px; font-size: 0.88rem; color: #94A3B8;
    opacity: 0; animation: lineSlide 0.4s ease forwards;
  }
  .cel-list li span.icon { flex-shrink: 0; font-size: 1rem; }
  @keyframes lineSlide { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }

  .cel-divider { border: none; border-top: 1px solid #1E293B; margin: 20px 0; }

  .cel-next { font-size: 0.88rem; color: #64748B; line-height: 1.8; margin-bottom: 24px; }
  .cel-next b { color: #A78BFA; }

  .cel-close-btn {
    background: linear-gradient(135deg, #10B981, #059669); color: #fff; border: none;
    border-radius: 10px; padding: 13px 32px; font-size: 0.95rem; font-weight: 800;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
  }
  .cel-close-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.5); }
`;

// ─── Sound Engine ────────────────────────────────────────────────────────────
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
      if (type === 'send') { osc(600, 0, 0.08, 'triangle'); osc(800, 0.06, 0.08, 'triangle'); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); }
      else if (type === 'pass') { [523,659,784].forEach((f,i) => osc(f, i*0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === 'fail') { osc(330, 0, 0.2); osc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === 'tick') { osc(800, 0, 0.05, 'triangle'); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); }
      else if (type === 'correct') { [523,659,784].forEach((f,i) => osc(f, i*0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === 'warn') { osc(330, 0, 0.2); osc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === 'fanfare') {
        [[523,0],[659,0.12],[784,0.24],[1047,0.36],[1319,0.5],[1047,0.66],[1319,0.8]].forEach(([f,t]) => osc(f, t, 0.18));
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
      }
      else if (type === 'submit') { osc(392, 0, 0.4); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); }
    } catch(e) {}
  }, []);
  return { play, muted };
}

// ─── Confetti Canvas ─────────────────────────────────────────────────────────
function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const COLORS = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EC4899','#34D399','#60A5FA'];
    const pieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.15,
      life: 1,
    }));
    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.angle += p.va;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / 220);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t < 240) rafRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}

// ─── Copyable Code ───────────────────────────────────────────────────────────
function CopyableCode({ code, children }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    try { navigator.clipboard.writeText(code); } catch(e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code-block">
      <button className="copy-btn" onClick={doCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
      {children}
    </div>
  );
}

// ─── Test definitions ────────────────────────────────────────────────────────
const TESTS = [
  { key: 'register', name: 'POST /auth/register', sub: '→ "Registered: gymowner"', badge200: '200 OK' },
  { key: 'login',    name: 'POST /auth/login',    sub: '→ "Login successful: gymowner"', badge200: '200 OK' },
  { key: 'access',  name: 'GET /gym/members + Basic Auth', sub: '→ members list returned', badge200: '200 OK' },
  { key: 'blocked', name: 'GET /gym/members — No Auth', sub: '→ 401 Unauthorized ✓', badge200: '401' },
];

// ─── HTTP Simulator ──────────────────────────────────────────────────────────
function HttpSim({ method, url, body, authRow, simulatedResponse, onSend, disabled, alreadyFired }) {
  const [state, setState] = useState('idle'); // idle | loading | done
  const handle = () => {
    if (state !== 'idle' && !alreadyFired) return;
    setState('loading');
    onSend && onSend();
    setTimeout(() => setState('done'), 900 + Math.random() * 400);
  };
  const isGet = method === 'GET';
  return (
    <div className="http-sim">
      <div className="http-sim-bar">
        <span className={`http-method-badge ${isGet ? 'get' : 'post'}`}>{method}</span>
        <span className="http-url">localhost:8080{url}</span>
        <button className="http-send-btn" onClick={handle} disabled={disabled}>
          {state === 'loading' ? '⏳ Sending…' : state === 'done' ? '↻ Re-run' : 'Send →'}
        </button>
      </div>
      {body && (
        <div className="http-body">
          {'{'}
          {'\n'}<span className="http-key">  "username"</span>: <span className="http-val">"gymowner"</span>,
          {'\n'}<span className="http-key">  "password"</span>: <span className="http-val">"gym@123"</span>
          {'\n'}{'}'}
        </div>
      )}
      {authRow && (
        <div className="http-body">
          <div className="http-auth-row">
            <span style={{ color: '#64748B' }}>Auth:</span>
            <span className="http-auth-badge">Basic {authRow}</span>
          </div>
        </div>
      )}
      <div className="http-response">
        {state === 'idle' && <span style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.74rem' }}>Click Send to fire request</span>}
        {state === 'loading' && <><div className="res-spinner" /><span style={{ color: '#64748B' }}>Waiting for Spring Boot…</span></>}
        {state === 'done' && (
          <>
            <span className={`res-status ${simulatedResponse.ok ? 'ok' : 'err'}`}>{simulatedResponse.status}</span>
            <span className="res-body">{simulatedResponse.body}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuthFlowTester() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(m => !m); muted.current = !isMuted; };

  // step confirmation state
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);

  // dashboard state per test: 'pending' | 'running' | 'pass'
  const [testStates, setTestStates] = useState({ register: 'pending', login: 'pending', access: 'pending', blocked: 'pending' });

  function setTestState(key, val) { setTestStates(s => ({ ...s, [key]: val })); }

  // Runs the simulated request and marks the dashboard state as passed once it
  // resolves - but deliberately does NOT set stepNDone itself. Completion is
  // only granted by the explicit "Confirmed" button below, which is in turn
  // gated on this having actually run (testStates[key] === 'pass'), so the two
  // affordances are coupled instead of being two independent ways to finish.
  function fireTest(key) {
    setTestState(key, 'running');
    play('send');
    setTimeout(() => {
      setTestState(key, 'pass');
      play('pass');
    }, 950 + Math.random() * 350);
  }

  const allStepsDone = step1Done && step2Done && step3Done && step4Done;
  const passCount = Object.values(testStates).filter(v => v === 'pass').length;

  const allDoneFiredRef = useRef(false);
  useEffect(() => {
    if (allStepsDone && !allDoneFiredRef.current) {
      allDoneFiredRef.current = true;
      setTimeout(() => play('fanfare'), 300);
    }
  }, [allStepsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // "one improvement left" section
  const [showMissing, setShowMissing] = useState(false);
  const missingFiredRef = useRef(false);
  useEffect(() => {
    if (allStepsDone && !missingFiredRef.current) {
      missingFiredRef.current = true;
      const t = setTimeout(() => { setShowMissing(true); play('tick'); }, 2500);
      return () => clearTimeout(t);
    }
  }, [allStepsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quiz
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [attempts, setAttempts] = useState([0, 0]);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function answerQ(qNum, val, correct, setter, current) {
    if (current === correct) return;
    setter(val);
    if (val === correct) play('correct'); else { play('warn'); setAttempts(a => { const n=[...a]; n[qNum-1]+=1; return n; }); }
  }

  const allCorrect = q1 === 'B' && q2 === 'B';
  const allCorrectFiredRef = useRef(false);
  useEffect(() => {
    if (allCorrect && !allCorrectFiredRef.current) { allCorrectFiredRef.current = true; play('correct'); }
  }, [allCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const canSubmit = allCorrect && sentences >= 1;

  // celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationLines, setCelebrationLines] = useState(0);
  const celebFiredRef = useRef(false);

  function handleSubmit() {
    if (!canSubmit) return;
    play('submit');
    setSubmitted(true);
    setShowCelebration(true);
    if (!celebFiredRef.current) {
      celebFiredRef.current = true;
      play('fanfare');
      let c = 0;
      const iv = setInterval(() => { c++; setCelebrationLines(c); if (c >= 5) clearInterval(iv); }, 450);
    }
  }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm4-t1-s5-auth-flow-tester',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: { step1Done, step2Done, step3Done, step4Done, q1, q2, reflectionText: reflection },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch(e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="aft-root">
      <style>{STYLE}</style>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="celebration-overlay">
          <ConfettiCanvas active={showCelebration} />
          <div className="celebration-card">
            <div className="cel-glow" />
            <div className="cel-icon">🔒</div>
            <div className="cel-heading">Topic 1 Complete!</div>
            <div className="cel-sub">Ravi's Gym API is now production-ready secure</div>
            <ul className="cel-list">
              {[
                { icon: '🛡️', text: 'Spring Security — every endpoint locked' },
                { icon: '🔐', text: 'BCrypt — passwords hashed, never plain text' },
                { icon: '📝', text: 'Register — real accounts created in MySQL' },
                { icon: '🔑', text: 'Login — credentials verified against DB' },
                { icon: '✅', text: 'Complete auth flow tested and confirmed' },
              ].map((item, i) => (
                celebrationLines >= i + 1 && (
                  <li key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="icon">{item.icon}</span>
                    {item.text}
                  </li>
                )
              ))}
            </ul>
            {celebrationLines >= 5 && (
              <>
                <hr className="cel-divider" />
                <div className="cel-next">
                  <b>Topic 2 — JWT</b><br />
                  Login returns a token.<br />
                  Every request uses the token — no more sending credentials each time.<br />
                  The gym membership wristband for your API.
                </div>
              </>
            )}
            <button className="cel-close-btn" onClick={() => setShowCelebration(false)}>
              Continue to Topic 2 →
            </button>
          </div>
        </div>
      )}

      <div className="aft-header">
        <h1>🧪 Auth Flow Tester</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Sound'}</button>
      </div>
      <div className="aft-subtitle">Module 4 · Topic 1 · s5 — Fire real requests. Watch the dashboard. Confirm the complete flow.</div>

      {/* Progress rail */}
      <div className="rail-strip">
        {['Register','Login','Access','Blocked'].map((label, i) => {
          const flags = [step1Done, step2Done, step3Done, step4Done];
          const cls = flags[i] ? 'done' : (i === 0 || flags[i-1]) ? 'active' : '';
          return (
            <React.Fragment key={label}>
              {i > 0 && <div className={`rail-line${flags[i-1] ? ' done' : ''}`} />}
              <div className={`rail-pill${cls ? ` ${cls}` : ''}`}>
                {flags[i] ? '✓' : `${i+1}`} {label}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="aft-layout">
        <div className="left-col">

          {/* STEP 1 — Register */}
          <div className={`step-card${step1Done ? ' passed' : ''}`}>
            <div className="step-title-row">
              <div className={`step-num${step1Done ? ' done' : ' active'}`}>{step1Done ? '✓' : '1'}</div>
              <h2 className="step-title">Register</h2>
            </div>
            <div className="info-box">
              Start fresh. Create the <b>gymowner</b> account. This creates a real row in your MySQL <code>users</code> table with a BCrypt-hashed password.
            </div>
            <HttpSim
              method="POST" url="/auth/register" body
              simulatedResponse={{ ok: true, status: '200 OK', body: '"Registered: gymowner"' }}
              onSend={() => !step1Done && fireTest('register')}
              disabled={step1Done}
            />
            <div className="info-box" style={{ marginBottom: 0 }}>
              Already registered in a previous slot? <b>Tick the box below</b> — the row still exists in MySQL.
            </div>
            <button className={`confirm-btn${step1Done ? ' confirmed' : ''}`} disabled={testStates.register !== 'pass' && !step1Done} onClick={() => { if (!step1Done && testStates.register === 'pass') { play('pass'); setStep1Done(true); } }}>
              <div className="confirm-check">{step1Done && '✓'}</div>
              {testStates.register === 'pass' || step1Done ? 'Confirmed — got "Registered: gymowner"' : 'Send the request first →'}
            </button>
          </div>

          {/* STEP 2 — Login */}
          <div className={`step-card${!step1Done ? ' locked' : step2Done ? ' passed' : ''}`}>
            <div className="step-title-row">
              <div className={`step-num${step2Done ? ' done' : step1Done ? ' active' : ''}`}>{step2Done ? '✓' : '2'}</div>
              <h2 className="step-title">Login</h2>
            </div>
            <HttpSim
              method="POST" url="/auth/login" body
              simulatedResponse={{ ok: true, status: '200 OK', body: '"Login successful: gymowner"' }}
              onSend={() => !step2Done && fireTest('login')}
              disabled={!step1Done || step2Done}
            />
            <div className="warn-box">
              <b>Notice:</b> login returns a plain String right now — not a token.<br />
              "Login successful: gymowner"<br /><br />
              Topic 2 changes this. Login will return a JWT token instead.
            </div>
            <button className={`confirm-btn${step2Done ? ' confirmed' : ''}`} disabled={testStates.login !== 'pass' && !step2Done} onClick={() => { if (step1Done && !step2Done && testStates.login === 'pass') { play('pass'); setStep2Done(true); } }}>
              <div className="confirm-check">{step2Done && '✓'}</div>
              {testStates.login === 'pass' || step2Done ? 'Confirmed — got "Login successful: gymowner"' : 'Send the request first →'}
            </button>
          </div>

          {/* STEP 3 — Access with Basic Auth */}
          <div className={`step-card${!step2Done ? ' locked' : step3Done ? ' passed' : ''}`}>
            <div className="step-title-row">
              <div className={`step-num${step3Done ? ' done' : step2Done ? ' active' : ''}`}>{step3Done ? '✓' : '3'}</div>
              <h2 className="step-title">Access protected data</h2>
            </div>
            <div className="info-box">
              In Postman → <b>Auth tab</b> → <b>Basic Auth</b> → enter gymowner / gym@123 → Send
            </div>
            <HttpSim
              method="GET" url="/gym/members"
              authRow="gymowner:gym@123"
              simulatedResponse={{ ok: true, status: '200 OK', body: '[{"id":1,"name":"Ravi","plan":"Annual"},{"id":2,"name":"Priya","plan":"Premium"}]' }}
              onSend={() => !step3Done && fireTest('access')}
              disabled={!step2Done || step3Done}
            />
            <div className="good-box">
              <b>✓</b> Spring Security checked your credentials → matched → you get through. Members list returned.
            </div>
            <button className={`confirm-btn${step3Done ? ' confirmed' : ''}`} disabled={testStates.access !== 'pass' && !step3Done} onClick={() => { if (step2Done && !step3Done && testStates.access === 'pass') { play('pass'); setStep3Done(true); } }}>
              <div className="confirm-check">{step3Done && '✓'}</div>
              {testStates.access === 'pass' || step3Done ? 'Confirmed — got members list with Basic Auth' : 'Send the request first →'}
            </button>
          </div>

          {/* STEP 4 — Stranger blocked */}
          <div className={`step-card${!step3Done ? ' locked' : step4Done ? ' passed' : ''}`}>
            <div className="step-title-row">
              <div className={`step-num${step4Done ? ' done' : step3Done ? ' active' : ''}`}>{step4Done ? '✓' : '4'}</div>
              <h2 className="step-title">Confirm the stranger is blocked</h2>
            </div>
            <div className="info-box">
              Same GET /gym/members → <b>Auth tab</b> → change to <b>No Auth</b> → Send
            </div>
            <HttpSim
              method="GET" url="/gym/members"
              simulatedResponse={{ ok: false, status: '401 Unauthorized', body: '{"error":"Full authentication is required to access this resource"}' }}
              onSend={() => !step4Done && fireTest('blocked')}
              disabled={!step3Done || step4Done}
            />
            <div className="contrast-grid">
              <div className="contrast-col before">
                <div className="contrast-title">s1 — Before</div>
                Stranger → /gym/members<br/>→ 200 OK ❌<br/>All data exposed
              </div>
              <div className="contrast-col after">
                <div className="contrast-title">Now — After Topic 1</div>
                Stranger → /gym/members<br/>→ 401 Unauthorized ✅<br/>Door locked
              </div>
            </div>
            <button className={`confirm-btn${step4Done ? ' confirmed' : ''}`} disabled={testStates.blocked !== 'pass' && !step4Done} onClick={() => { if (step3Done && !step4Done && testStates.blocked === 'pass') { play('pass'); setStep4Done(true); } }}>
              <div className="confirm-check">{step4Done && '✓'}</div>
              {testStates.blocked === 'pass' || step4Done ? 'Confirmed — 401 received, stranger is blocked' : 'Send the request first →'}
            </button>
          </div>

          {/* "One improvement left" section */}
          {showMissing && (
            <>
              <div className="step-card passed" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#FCD34D' }}>
                  ⚠️ One problem remains
                </h2>
                <div className="repeat-strip">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="repeat-row">
                      <span style={{ color: '#F87171' }}>req {i}:</span> gymowner + gym@123 sent every time
                    </div>
                  ))}
                  <div className="repeat-warn">Username + password on EVERY request — exposure risk</div>
                </div>
                <div className="warn-box" style={{ marginTop: 12 }}>
                  Imagine your college.<br /><br />
                  Show ID at the main gate ✓<br />
                  Now show ID at every classroom door. At the canteen. At the library. <b>Same ID, every door.</b><br /><br />
                  That is Basic Auth right now.
                </div>
                <div className="good-box">
                  Real apps use a <b>TOKEN</b> instead.<br /><br />
                  Show ID once at main gate → get a wristband → every door checks the wristband. No more ID.
                </div>
                <CopyableCode code={`// login returns a token\n"Login successful"\n→ { "token": "eyJhbGci..." }\n\n// every request uses the token\nAuthorization: Bearer eyJhbGci...\n→ no username/password needed`}>
                  <span className="code-comment">// login returns a token{'\n'}</span>
                  <span style={{ color: '#94A3B8' }}>"Login successful"{'\n'}</span>
                  → {'{ '}<span className="code-key">"token"</span>: <span className="code-val">"eyJhbGci..."</span> {'}'}{'\n\n'}
                  <span className="code-comment">// every request uses the token{'\n'}</span>
                  <span style={{ color: '#FCD34D' }}>Authorization: Bearer eyJhbGci...{'\n'}</span>
                  <span style={{ color: '#4ADE80' }}>→ no username/password needed</span>
                </CopyableCode>
                <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#A78BFA', fontWeight: 700, marginTop: 8 }}>
                  That token is called JWT. Topic 2 builds this.
                </div>
              </div>

              {/* Questions */}
              <div className="q-card">
                <p className="q-title">Q1: After Topic 1 — which paths are open without authentication?</p>
                {[['A','All paths'],['B','/auth/register and /auth/login only'],['C','/gym/members'],['D','No paths — everything locked']].map(([k,label]) => (
                  <button key={k} className={`opt-btn${q1 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(1,k,'B',setQ1,q1)}>
                    <strong>{k})</strong> {label}
                  </button>
                ))}
                {q1 && q1 !== 'B' && <div className="qcheck-note wrong">SecurityConfig sets permitAll only for /auth/**. Everything else requires login.</div>}
                {q1 === 'B' && <div className="qcheck-note correct">✓ Correct — only the auth endpoints are open.</div>}
              </div>

              <div className="q-card">
                <p className="q-title">Q2: Why is Basic Auth not ideal for production?</p>
                {[['A','It is too slow for Spring Boot'],['B','Username and password sent on every request — more exposure risk. A token is safer and more efficient'],['C','Spring Security does not support it'],['D','MySQL cannot verify it']].map(([k,label]) => (
                  <button key={k} className={`opt-btn${q2 === k ? (k === 'B' ? ' correct' : ' wrong') : ''}`} onClick={() => answerQ(2,k,'B',setQ2,q2)}>
                    <strong>{k})</strong> {label}
                  </button>
                ))}
                {q2 && q2 !== 'B' && <div className="qcheck-note wrong">Sending credentials repeatedly increases exposure risk. Tokens are safer and more efficient.</div>}
                {q2 === 'B' && <div className="qcheck-note correct">✓ Correct — tokens send credentials once; wristband does the rest.</div>}
              </div>

              {allCorrect && (
                <div className="q-card">
                  <h4 style={{ margin: '0 0 6px', color: '#F1F5F9' }}>Reflection</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 10px' }}>
                    Using the wristband analogy — explain in one sentence why JWT is better than Basic Auth.
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="JWT is better because instead of showing your ID at every door, you show it once at the main gate and get a wristband that every door accepts..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>
                  <button className="submit-btn" disabled={!canSubmit || submitted} onClick={handleSubmit}>
                    {submitted ? '✅ Submitted — Topic 1 Complete!' : 'Submit & Complete Topic 1 →'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: API Health Dashboard */}
        <div className="right-col">
          <div className="dashboard-shell">
            <div className="dash-topbar">
              <div className="dash-dot r" /><div className="dash-dot y" /><div className="dash-dot g" />
              <div className="dash-title">API_HEALTH_MONITOR</div>
              <div className={`dash-live-badge ${allStepsDone ? 'locked' : 'running'}`}>
                {allStepsDone ? '🔒 SECURED' : '● LIVE'}
              </div>
            </div>

            <div className="dash-body">
              {TESTS.map(test => {
                const state = testStates[test.key];
                const badgeLabel = state === 'pass' ? test.badge200 : state === 'running' ? 'Testing…' : 'Pending';
                return (
                  <div key={test.key} className={`test-item ${state}`}>
                    <div className="test-dot" />
                    <div className="test-info">
                      <div className="test-name">{test.name}</div>
                      <div className="test-sub">{test.sub}</div>
                    </div>
                    <div className="test-badge">{badgeLabel}</div>
                  </div>
                );
              })}

              {/* score bar */}
              <div className="score-bar-wrap">
                <div className="score-bar-label">
                  <span>Tests passing</span>
                  <span style={{ color: passCount === 4 ? '#34D399' : '#60A5FA' }}>{passCount} / 4</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${(passCount / 4) * 100}%` }} />
                </div>
              </div>

              {/* Dashboard response preview per test */}
              {step1Done && (
                <div className="dash-response">
                  <span className="dr-ok">POST /auth/register → 200</span>{'\n'}
                  <span style={{ color: '#64748B' }}>"Registered: gymowner"</span>
                </div>
              )}
              {step2Done && (
                <div className="dash-response">
                  <span className="dr-ok">POST /auth/login → 200</span>{'\n'}
                  <span style={{ color: '#64748B' }}>"Login successful: gymowner"</span>
                </div>
              )}
              {step3Done && (
                <div className="dash-response">
                  <span className="dr-ok">GET /gym/members + BasicAuth → 200</span>{'\n'}
                  <span style={{ color: '#64748B' }}>{'[{"id":1,"name":"Ravi"}, {"id":2,"name":"Priya"}]'}</span>
                </div>
              )}
              {step4Done && (
                <div className="dash-response">
                  <span className="dr-err">GET /gym/members (no auth) → 401</span>{'\n'}
                  <span style={{ color: '#64748B' }}>Stranger blocked ✓</span>
                </div>
              )}

              {/* JWT Teaser */}
              {showMissing && (
                <div className="jwt-teaser">
                  <div className="jwt-teaser-title">
                    🎫 Topic 2 Preview
                    <span className="jwt-teaser-badge">Coming Next</span>
                  </div>
                  <div className="jwt-compare-row">
                    <div className="jwt-compare-col">
                      <div className="jwt-compare-head basic">Basic Auth</div>
                      <div className="jwt-mini-row basic-row">req 1: user + pass</div>
                      <div className="jwt-mini-row basic-row">req 2: user + pass</div>
                      <div className="jwt-mini-row basic-row">req 3: user + pass</div>
                    </div>
                    <div className="jwt-compare-col">
                      <div className="jwt-compare-head jwt">JWT</div>
                      <div className="jwt-mini-row jwt-row">login → token issued</div>
                      <div className="jwt-mini-row jwt-row">req + token → ✓</div>
                      <div className="jwt-mini-row jwt-row">req + token → ✓</div>
                    </div>
                  </div>
                  <div className="boarding-flow">
                    <span className="b-tag">login</span>
                    <span className="b-arrow">→</span>
                    <span className="b-tag">token issued</span>
                    <span className="b-arrow">→</span>
                    <span className="b-tag">req + token</span>
                    <span className="b-arrow">→</span>
                    <span className="b-tag">🚪 opens</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
