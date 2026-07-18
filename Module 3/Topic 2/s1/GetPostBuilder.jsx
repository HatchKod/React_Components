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
  .card.future { opacity: 0.5; pointer-events: none; }
  .card-header { font-size: 1.25rem; font-weight: 700; margin: 0 0 16px 0; color: #1E293B; }

  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-block; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #9CA3AF; cursor: not-allowed; }
  .btn.green { background: #10B981; }
  .btn.green:hover { background: #059669; }
  .btn.orange { background: #F97316; }
  .btn.orange:hover { background: #EA580C; }

  .code-block { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; margin: 12px 0; position: relative; overflow-x: auto; }
  .ck { color: #60A5FA; }
  .ca { color: #E879F9; }
  .cs { color: #4ADE80; }
  .cc { color: #9CA3AF; }

  .blank-wrap { display: inline-block; margin: 0 4px; }
  .blank-select { appearance: none; background: #334155; color: white; border: 1.5px solid #64748B; padding: 3px 10px; border-radius: 4px; font-family: inherit; font-size: inherit; cursor: pointer; outline: none; }
  .blank-input { background: #334155; color: white; border: 1.5px solid #64748B; padding: 3px 10px; border-radius: 4px; font-family: inherit; font-size: inherit; width: 160px; outline: none; }
  .blank-correct { border-color: #10B981 !important; background: rgba(16,185,129,0.15) !important; }
  .blank-wrong { border-color: #EF4444 !important; animation: shake 0.3s; }

  .diff-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .diff-before { background: #1E293B; border-left: 3px solid #6B7280; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.85rem; color: #9CA3AF; overflow-x: auto; }
  .diff-after { background: #1E293B; border-left: 3px solid #10B981; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.85rem; color: #E2E8F0; overflow-x: auto; }
  .diff-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .diff-before .diff-label { color: #6B7280; }
  .diff-after .diff-label { color: #10B981; }
  @media(max-width:600px) {
    .diff-row { grid-template-columns: 1fr; }
    .diff-before, .diff-after { font-size: 0.78rem; white-space: pre; }
  }

  .mockup-browser { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 16px; }
  .mockup-header { background: #F8FAFC; padding: 10px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; gap: 10px; }
  .mockup-url { background: white; padding: 5px 12px; border-radius: 6px; font-size: 0.85rem; color: #475569; flex: 1; border: 1px solid #E2E8F0; font-family: monospace; }
  .mockup-body { padding: 16px; font-family: monospace; font-size: 1rem; color: #1E293B; min-height: 60px; display: flex; align-items: center; }

  .postman-box { background: #1B1B1D; border-radius: 12px; overflow: hidden; border: 1px solid #374151; }
  .postman-top { background: #262626; padding: 12px 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .postman-method { padding: 6px 14px; border-radius: 6px; font-weight: 800; font-size: 0.9rem; border: none; cursor: pointer; }
  .postman-method.get { background: #DCFCE7; color: #15803D; }
  .postman-method.post { background: #DBEAFE; color: #1D4ED8; }
  .postman-url { background: #1B1B1D; color: #E2E8F0; border: 1px solid #374151; padding: 7px 12px; border-radius: 6px; flex: 1; font-family: monospace; font-size: 0.9rem; outline: none; min-width: 180px; }
  .postman-send { background: #F97316; color: white; border: none; border-radius: 6px; padding: 7px 18px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
  .postman-send:hover { background: #EA580C; }
  .postman-body { background: #1B1B1D; padding: 12px 16px; }
  .postman-tabs { display: flex; gap: 8px; margin-bottom: 8px; }
  .postman-tab { padding: 4px 10px; font-size: 0.8rem; color: #9CA3AF; cursor: pointer; border-bottom: 2px solid transparent; }
  .postman-tab.active { color: #F97316; border-bottom-color: #F97316; }
  .postman-body-input { width: 100%; background: #111; color: #4ADE80; border: 1px solid #374151; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.95rem; outline: none; min-height: 70px; resize: none; }
  .postman-response { background: #111; border-top: 1px solid #374151; padding: 12px 16px; font-family: monospace; font-size: 0.9rem; color: #4ADE80; min-height: 40px; }
  .postman-response.error { color: #F87171; }
  .postman-res-label { color: #6B7280; font-size: 0.8rem; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  @media(max-width:520px) {
    .postman-top { flex-direction: column; align-items: stretch; }
    .postman-method { width: 100%; text-align: center; }
    .postman-url { min-width: 0; width: 100%; }
    .postman-send { width: 100%; }
  }

  .register { background: #FEFCE8; border: 2px solid #FDE68A; border-radius: 12px; padding: 20px; min-height: 200px; position: relative; }
  .register-title { font-weight: 800; font-size: 0.85rem; color: #92400E; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #FDE68A; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .reg-line { padding: 8px 12px; border-bottom: 1px solid #FDE68A; font-size: 0.95rem; color: #1E293B; animation: slideIn 0.3s; display: flex; align-items: center; gap: 8px; }
  .reg-empty { color: #94A3B8; font-style: italic; text-align: center; padding: 30px; font-size: 0.9rem; }
  .reg-json { background: #1E293B; color: #E2E8F0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.9rem; margin-top: 12px; }

  .route-card { padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: monospace; font-size: 0.85rem; animation: popIn 0.3s; position: relative; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .route-card.get { background: #F0FDF4; border-left: 4px solid #10B981; }
  .route-card.post { background: #EFF6FF; border-left: 4px solid #3B82F6; }
  .method-badge { font-weight: 800; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
  .badge-get { background: #10B981; color: white; }
  .badge-post { background: #3B82F6; color: white; }
  .badge-body { background: #E879F9; color: white; font-size: 0.7rem; }
  .badge-json { background: #F59E0B; color: white; font-size: 0.7rem; }

  .amber-note { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .amber-note-title { font-weight: 700; color: #92400E; margin-bottom: 8px; }
  .info-note { background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; padding: 16px; margin: 12px 0; font-size: 0.95rem; color: #1E40AF; }

  .progress-strip { display: flex; align-items: center; max-width: 1100px; margin: 0 auto 24px; gap: 4px; }
  .progress-step { flex: 1; display: flex; align-items: center; gap: 8px; }
  .progress-dot { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; background: #E2E8F0; color: #94A3B8; flex-shrink: 0; transition: all 0.3s; }
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

  .free-editor { width: 100%; min-height: 240px; background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; border: none; outline: none; resize: vertical; line-height: 1.5; }
  .free-editor:focus { box-shadow: 0 0 0 2px #3B82F6; }
  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 1rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; margin-top: 10px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #10B981; }

  .warn-msg { background: #FFFBEB; color: #D97706; padding: 10px 14px; border-radius: 8px; border-left: 4px solid #F59E0B; font-weight: 600; font-size: 0.9rem; margin-bottom: 12px; animation: shake 0.3s; }
  .domain-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .domain-pill { padding: 8px 16px; border-radius: 20px; background: #F1F5F9; border: 1.5px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s; }
  .step-counter { font-size: 0.8rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }

  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  @keyframes typeIn { from { width: 0; } to { width: 100%; } }

  /* === ANALOGUE REGISTER SCENE === */
  .reg-scene-wrap {
    background: linear-gradient(160deg, #FFFDF5 0%, #FEF8E7 40%, #FDF3D0 100%);
    border: 2px solid #D97706;
    border-radius: 14px;
    padding: 0 0 6px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(180,83,9,0.18), inset 0 0 40px rgba(253,230,138,0.25);
    position: relative;
  }
  .reg-counter {
    background: linear-gradient(180deg, #92400E 0%, #78350F 60%, #6B2D09 100%);
    padding: 10px 14px 12px;
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
    border-bottom: 3px solid #451A03;
    box-shadow: 0 3px 8px rgba(69,26,3,0.4);
  }
  .reg-counter-label {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 0.95rem; font-weight: 700; color: #FEF3C7;
    letter-spacing: 0.12em; text-transform: uppercase;
    flex: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .reg-inmem-badge {
    background: rgba(254,243,199,0.18); border: 1px solid rgba(254,243,199,0.35);
    color: #FDE68A; font-size: 0.65rem; padding: 3px 8px; border-radius: 8px;
    font-weight: 600; letter-spacing: 0.06em;
  }
  .tiffin-stack { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .tiffin-tier {
    background: linear-gradient(135deg, #E2E8F0, #CBD5E1);
    border: 1.5px solid #94A3B8; border-radius: 3px; position: relative;
  }
  .tiffin-tier::after {
    content: ''; position: absolute; left: 50%; top: -2px;
    transform: translateX(-50%); width: 40%; height: 3px;
    background: #94A3B8; border-radius: 2px 2px 0 0;
  }
  .tiffin-tier:first-child { width: 24px; height: 9px; }
  .tiffin-tier:nth-child(2) { width: 20px; height: 8px; }
  .tiffin-tier:last-child  { width: 16px; height: 8px; }
  .courier-wrap { position: relative; display: flex; align-items: flex-end; }
  .courier-idle { animation: bikeBob 1.4s ease-in-out infinite; }
  @keyframes bikeBob { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
  .courier-deliver { animation: bikeDeliver 1.1s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes bikeDeliver {
    0%   { transform: translateX(-70px) translateY(0); opacity: 0; }
    20%  { opacity: 1; }
    60%  { transform: translateX(10px) translateY(-4px); }
    80%  { transform: translateX(5px) translateY(0px); }
    100% { transform: translateX(0px) translateY(0px); opacity: 1; }
  }
  .steam-puff {
    position: absolute; width: 6px; height: 6px; border-radius: 50%;
    background: rgba(254,243,199,0.7); animation: steamRise 1.8s ease-in infinite;
  }
  .steam-puff:nth-child(1) { left: 2px;  animation-delay: 0s;   animation-duration: 1.6s; }
  .steam-puff:nth-child(2) { left: 7px;  animation-delay: 0.5s; animation-duration: 2.0s; }
  .steam-puff:nth-child(3) { left: 12px; animation-delay: 0.9s; animation-duration: 1.7s; }
  @keyframes steamRise {
    0%   { opacity: 0;   transform: translateY(0) scale(0.5); }
    20%  { opacity: 0.8; transform: translateY(-6px) scale(1); }
    100% { opacity: 0;   transform: translateY(-20px) scale(1.8); }
  }
  .reg-notebook {
    position: relative; margin: 10px 10px 6px;
    background: #FFFDF5; border: 1.5px solid #FDE68A; border-radius: 8px; overflow: hidden;
    box-shadow: inset 0 0 12px rgba(253,230,138,0.3), 0 2px 6px rgba(180,83,9,0.1);
    z-index: 1;
  }
  .reg-notebook::before {
    content: ''; position: absolute; top: 0; bottom: 0; left: 28px;
    width: 1.5px; background: rgba(220,38,38,0.25); z-index: 2;
  }
  .reg-spiral {
    position: absolute; top: 0; left: 0; bottom: 0; width: 22px;
    display: flex; flex-direction: column; justify-content: space-evenly;
    align-items: center; padding: 10px 0; z-index: 3;
  }
  .spiral-ring {
    width: 9px; height: 9px; border-radius: 50%;
    border: 2px solid #D97706; background: #FFFDF5;
    box-shadow: 0 0 0 1px rgba(180,83,9,0.2);
  }
  .reg-ruled-line { height: 1px; background: rgba(147,197,253,0.5); margin: 0 30px 0 32px; }
  .reg-order-row {
    display: flex; align-items: baseline; padding: 4px 10px 4px 34px;
    gap: 8px; position: relative; min-height: 26px;
  }
  .reg-row-num { font-family: 'Georgia', serif; font-size: 0.7rem; color: #DC2626; font-weight: 700; min-width: 18px; opacity: 0.7; }
  .reg-row-text { font-family: 'Georgia', 'Palatino Linotype', serif; font-size: 0.88rem; color: #1C1917; letter-spacing: 0.01em; }
  .reg-new-row { animation: inkReveal 0.7s ease forwards; }
  @keyframes inkReveal { 0% { opacity: 0; clip-path: inset(0 100% 0 0); } 100% { opacity: 1; clip-path: inset(0 0% 0 0); } }
  .reg-pen-nib { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 14px; animation: nibSweep 0.7s ease forwards; }
  @keyframes nibSweep { 0% { right: calc(100% - 36px); opacity: 1; } 85% { right: 8px; opacity: 1; } 100% { right: 6px; opacity: 0; } }
  .reg-empty-state { font-family: 'Georgia', serif; font-size: 0.82rem; font-style: italic; color: #B45309; text-align: center; padding: 20px 16px; opacity: 0.7; }
  .reg-magnifier { position: absolute; top: 8px; left: 30px; font-size: 20px; z-index: 10; animation: magnifierSweep 1.1s cubic-bezier(.34,1.2,.64,1) forwards; }
  @keyframes magnifierSweep {
    0%   { opacity: 0; transform: translateX(0) translateY(10px) rotate(-20deg); }
    15%  { opacity: 1; transform: translateX(0) translateY(0) rotate(0deg); }
    60%  { opacity: 1; transform: translateX(220px) translateY(-4px) rotate(5deg); }
    85%  { opacity: 1; transform: translateX(240px) translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateX(250px) translateY(-8px) rotate(10deg); }
  }
  .reg-json-reply {
    position: absolute; top: 8px; right: 14px; font-family: monospace;
    font-size: 0.75rem; font-weight: 800; color: #15803D; background: #DCFCE7;
    border: 1px solid #86EFAC; border-radius: 4px; padding: 2px 6px; z-index: 10;
    animation: jsonFlyBack 0.9s cubic-bezier(.34,1.2,.64,1) forwards;
    animation-delay: 0.55s; opacity: 0;
  }
  @keyframes jsonFlyBack {
    0%   { opacity: 0; transform: translateX(0) scale(0.7); }
    20%  { opacity: 1; transform: translateX(-10px) scale(1.15); }
    100% { opacity: 1; transform: translateX(-240px) scale(1); }
  }
  .reg-tiffin-fly { position: absolute; top: 4px; left: 8px; font-size: 20px; z-index: 10; animation: tiffinDeliver 0.95s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes tiffinDeliver {
    0%   { opacity: 0; transform: translate(0,0) scale(0.6) rotate(-10deg); }
    15%  { opacity: 1; transform: translate(0,-8px) scale(1.2) rotate(5deg); }
    55%  { opacity: 1; transform: translate(200px,-12px) scale(1) rotate(-5deg); }
    80%  { opacity: 1; transform: translate(230px,0px) scale(0.85) rotate(0deg); }
    100% { opacity: 0; transform: translate(240px,4px) scale(0.6); }
  }
  .reg-stamp {
    position: absolute; right: 12px; bottom: 10px; z-index: 12;
    display: flex; flex-direction: column; align-items: center;
    animation: stampBurst 2.2s ease forwards; transform-origin: center center;
  }
  .reg-stamp-ring {
    width: 64px; height: 64px; border-radius: 50%; border: 3px solid #B45309;
    display: flex; align-items: center; justify-content: center;
    background: rgba(254,243,199,0.92);
    box-shadow: 0 0 0 2px #FDE68A, 0 0 12px rgba(180,83,9,0.25);
  }
  .reg-stamp-text { font-family: 'Georgia', serif; font-size: 0.42rem; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 0.12em; text-align: center; line-height: 1.3; }
  @keyframes stampBurst {
    0%   { opacity: 0; transform: scale(2.5) rotate(-30deg); }
    12%  { opacity: 1; transform: scale(0.9) rotate(2deg); }
    20%  { transform: scale(1.05) rotate(-1deg); }
    30%  { transform: scale(1) rotate(0deg); }
    75%  { opacity: 1; }
    100% { opacity: 0; transform: scale(0.8) rotate(5deg); }
  }
  .reg-cleared-stamp {
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%) rotate(-20deg); z-index: 12;
    border: 3px solid #DC2626; border-radius: 6px; padding: 4px 10px;
    background: rgba(254,226,226,0.9); animation: clearedStamp 2.2s ease forwards;
    transform-origin: center center;
  }
  .reg-cleared-text { font-family: 'Georgia', serif; font-size: 0.9rem; font-weight: 700; color: #DC2626; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
  @keyframes clearedStamp {
    0%   { opacity: 0; transform: translate(-50%,-50%) rotate(-20deg) scale(2); }
    15%  { opacity: 1; transform: translate(-50%,-50%) rotate(-18deg) scale(0.95); }
    20%  { transform: translate(-50%,-50%) rotate(-20deg) scale(1); }
    75%  { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%,-50%) rotate(-22deg) scale(0.9); }
  }
  .reg-page-flip { animation: pageFlip 0.8s ease forwards; transform-origin: left center; }
  @keyframes pageFlip {
    0%   { transform: perspective(400px) rotateY(0deg);   opacity: 1; }
    45%  { transform: perspective(400px) rotateY(-80deg); opacity: 0.3; }
    55%  { transform: perspective(400px) rotateY(-80deg); opacity: 0.3; }
    100% { transform: perspective(400px) rotateY(0deg);   opacity: 1; }
  }
  .reg-info-banner {
    margin: 6px 10px; padding: 6px 10px; border-radius: 6px;
    font-size: 0.75rem; font-weight: 700; text-align: center;
    animation: bannerSlide 2.2s ease forwards; position: relative; z-index: 1;
  }
  .reg-info-banner.get-banner  { background: #DBEAFE; border: 1.5px solid #93C5FD; color: #1E40AF; }
  .reg-info-banner.post-banner { background: #FEF3C7; border: 1.5px solid #FBBF24; color: #92400E; }
  @keyframes bannerSlide {
    0%   { opacity: 0; transform: translateY(-6px); }
    10%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(-4px); }
  }
`;

function RegisterScene({ items, event, wasRestarted }) {
  const maxVisible = 6;
  const visible = items.slice(-maxVisible);
  const isGet     = event?.type === 'get';
  const isPostman = event?.type === 'postman';
  const isRestart = event?.type === 'restart';
  const ringCount = 7;

  return (
    <div className="reg-scene-wrap">
      <div className="reg-counter">
        <div style={{ position: 'relative', marginRight: 4 }}>
          <div style={{ position: 'absolute', top: -22, left: 0, width: 20, height: 20 }}>
            <div className="steam-puff" />
            <div className="steam-puff" />
            <div className="steam-puff" />
          </div>
          <div className="tiffin-stack">
            <div className="tiffin-tier" />
            <div className="tiffin-tier" />
            <div className="tiffin-tier" />
          </div>
        </div>
        <div className="courier-wrap">
          <span
            className={isPostman ? 'courier-deliver' : 'courier-idle'}
            key={isPostman ? event.key : 'idle'}
            style={{ fontSize: 22, lineHeight: 1, display: 'block' }}
          >🚴</span>
        </div>
        <span className="reg-counter-label">Tiffin Delivery</span>
        <span className="reg-inmem-badge">In-memory</span>
      </div>

      <div
        className={`reg-notebook${isRestart ? ' reg-page-flip' : ''}`}
        key={isRestart ? `nb-${event.key}` : 'nb'}
        style={{ minHeight: 120 }}
      >
        <div className="reg-spiral">
          {Array.from({ length: ringCount }).map((_, i) => (
            <div className="spiral-ring" key={i} />
          ))}
        </div>
        <div style={{ paddingLeft: 34, paddingRight: 10, paddingTop: 8, paddingBottom: 4, borderBottom: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>📔</span>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tiffin Order Register
          </span>
        </div>

        {isGet && (
          <div key={`mag-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <span className="reg-magnifier">🔍</span>
            <span className="reg-json-reply">[ ]</span>
          </div>
        )}
        {isPostman && (
          <div key={`fly-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <span className="reg-tiffin-fly">🍱</span>
          </div>
        )}
        {isPostman && (
          <div key={`stamp-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <div className="reg-stamp">
              <div className="reg-stamp-ring">
                <div className="reg-stamp-text">ORDER<br/>RECEIVED</div>
              </div>
            </div>
          </div>
        )}
        {isRestart && (
          <div key={`cleared-${event.key}`} style={{ position: 'relative', height: 0, overflow: 'visible' }}>
            <div className="reg-cleared-stamp">
              <span className="reg-cleared-text">Cleared</span>
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="reg-order-row" style={{ minHeight: 26 }} />
                <div className="reg-ruled-line" />
              </div>
            ))}
            <div className="reg-empty-state">
              {wasRestarted ? '🔄 memory cleared - server restarted' : 'No orders yet - POST to add'}
            </div>
          </>
        ) : (
          visible.map((item, i) => {
            const isLast = i === visible.length - 1;
            const globalNum = items.length - visible.length + i + 1;
            return (
              <div key={item + i}>
                <div className={`reg-order-row${isLast ? ' reg-new-row' : ''}`}>
                  <span className="reg-row-num">#{globalNum}</span>
                  <span className="reg-row-text">{item}</span>
                  {isLast && <span className="reg-pen-nib">✍️</span>}
                </div>
                <div className="reg-ruled-line" />
              </div>
            );
          })
        )}
        <div style={{ height: 8 }} />
      </div>

      {isGet && (
        <div key={`gb-${event.key}`} className="reg-info-banner get-banner">
          🔍 GET request → server read the register and sent the list back
        </div>
      )}
      {isPostman && (
        <div key={`pb-${event.key}`} className="reg-info-banner post-banner">
          🍱 POST request → new order written into the register
        </div>
      )}
    </div>
  );
}

function useSounds() {
  const muted = useRef(false);
  const ctxRef = useRef(null);
  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      const makeOsc = (freq, start, dur, wave = "sine") => {
        const o = ctx.createOscillator();
        o.type = wave; o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      if (type === "add") { makeOsc(220, 0, 0.15); makeOsc(440, 0.05, 0.15); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); }
      else if (type === "correct") { [523, 659, 784].forEach((f,i) => makeOsc(f, i*0.1, 0.15)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45); }
      else if (type === "warn") { makeOsc(330, 0, 0.2); makeOsc(277, 0.1, 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); }
      else if (type === "tick") { makeOsc(800, 0, 0.05, "triangle"); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); }
      else if (type === "reveal") { [523,659,784,1047].forEach((f,i) => makeOsc(f, i*0.12, 0.2)); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6); }
      else if (type === "submit") { makeOsc(392, 0, 0.4); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); }
    } catch(e) {}
  }, []);
  return { play, muted };
}

export default function GetPostBuilder() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');
  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
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
  const [retType, setRetType] = useState('');
  const [retStatus, setRetStatus] = useState(null);
  const [s1Checked, setS1Checked] = useState(false);
  const [sceneEvent, setSceneEvent] = useState(null);
  const sceneEventKeyRef = useRef(0);
  const fireSceneEvent = (type) => { sceneEventKeyRef.current += 1; setSceneEvent({ type, key: sceneEventKeyRef.current }); };
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [b1Status, setB1Status] = useState(null);
  const [b2Status, setB2Status] = useState(null);
  const [pmOpen, setPmOpen] = useState(false);
  const [pmMethod, setPmMethod] = useState('POST');
  const [pmUrl, setPmUrl] = useState('http://localhost:8080/gym/members');
  const [pmBody, setPmBody] = useState('"Ravi"');
  const [pmResponse, setPmResponse] = useState('');
  const [pmSent, setPmSent] = useState(false);
  const [s3Checked, setS3Checked] = useState(false);
  const [registerItems, setRegisterItems] = useState([]);
  const [c4_1, setC4_1] = useState(false);
  const [c4_2, setC4_2] = useState(false);
  const [c4_3, setC4_3] = useState(false);
  const [c4_4, setC4_4] = useState(false);
  const [revealLines, setRevealLines] = useState(0);
  const [domain, setDomain] = useState(null);
  const [freeCode, setFreeCode] = useState('');
  const [p2c1, setP2c1] = useState(false);
  const [p2c2, setP2c2] = useState(false);
  const [p2c3, setP2c3] = useState(false);
  const [p2c4, setP2c4] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [parsedGet, setParsedGet] = useState(null);
  const [parsedPost, setParsedPost] = useState(null);
  const toggleMute = () => { setIsMuted(!isMuted); muted.current = !isMuted; };
  const allBlanksCorrect = b1Status === true && b2Status === true;
  const allS4 = c4_1 && c4_2 && c4_3 && c4_4;
  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const RET_TYPE_HINTS = {
    String: 'String can only hold ONE value. You have a whole List of members - you need List<String>.',
    int: "int holds a single number. Member names aren't numbers - you need List<String>.",
    void: 'void returns nothing at all. GET must send the member list back - you need List<String>.',
  };
  const handleRetType = (v) => { setRetType(v); if (v === 'List<String>') { setRetStatus(true); play('add'); } else if (v) { setRetStatus(false); play('warn'); } };
  const handleB1 = (v) => { setB1(v); if (v.trim() === '@PostMapping') { setB1Status(true); play('add'); } else if (v) { setB1Status(null); } };
  const checkB1 = () => { if (b1.trim() !== '@PostMapping') { setB1Status(false); play('warn'); } };
  const handleB2 = (v) => { setB2(v); if (v.trim() === '@RequestBody') { setB2Status(true); play('add'); } else if (v) { setB2Status(null); } };
  const checkB2 = () => { if (b2.trim() !== '@RequestBody') { setB2Status(false); play('warn'); } };
  useEffect(() => { if (allBlanksCorrect) play('correct'); }, [allBlanksCorrect]);
  const handlePmSend = () => {
    if (!pmUrl || !pmBody) return;
    setPmResponse('Loading...');
    setTimeout(() => {
      if (pmMethod === 'POST') {
        const raw = pmBody.trim();
        const isValidJsonString = /^"[^"]*"$/.test(raw);
        if (!isValidJsonString) { setPmResponse(raw.length === 0 ? 'Error 400: empty body' : `Error 400: invalid JSON - a String body needs double quotes, e.g. "Ravi" (you sent ${raw})`); play('warn'); return; }
        const name = raw.slice(1, -1).trim();
        if (name) { setPmResponse(`Member added: ${name}`); setRegisterItems(prev => [...prev, name]); fireSceneEvent('postman'); play('correct'); setTimeout(() => setPmSent(true), 500); }
        else { setPmResponse('Error 400: empty string body'); play('warn'); }
      } else { fireSceneEvent('get'); setPmResponse(JSON.stringify(registerItems)); play('correct'); }
    }, 600);
  };
  const handleS4Check = (num, setter) => { setter(true); if (num === 3) fireSceneEvent('restart'); play(num === 4 ? 'tick' : 'add'); };
  useEffect(() => {
    if (allS4) {
      play('correct');
      setTimeout(() => { play('reveal'); let count = 0; const intv = setInterval(() => { count++; setRevealLines(count); if (count < 7) play('tick'); if (count >= 7) clearInterval(intv); }, 600); }, 800);
    }
  }, [allS4]);
  const [templateCode, setTemplateCode] = useState('');
  const handleDomain = (d) => {
    setDomain(d);
    const map = { Gym: ['members', 'member', 'gym'], Hotel: ['rooms', 'room', 'hotel'], Mess: ['menu', 'item', 'mess'], Chai: ['orders', 'order', 'chai'] };
    const [items, item, path] = map[d] || ['items', 'item', 'app'];
    const generated = `@RestController\npublic class ${d}Controller {\n\n  // in-memory storage - resets on restart\n  // database connection comes in Topic 3\n  private List<String> ${items} = new ArrayList<>();\n\n  // GET - read all ${items}\n  @GetMapping("/${path}/${items}")\n  public List<String> get${items.charAt(0).toUpperCase()+items.slice(1)}() {\n      return ${items};\n  }\n\n  // POST - add a new ${item}\n  @PostMapping("/${path}/${items}")\n  public String add${item.charAt(0).toUpperCase()+item.slice(1)}(@RequestBody String name) {\n      ${items}.add(name);\n      return "${item.charAt(0).toUpperCase()+item.slice(1)} added: " + name;\n  }\n}`;
    setFreeCode(generated); setTemplateCode(generated); play('tick');
  };
  const MIN_MEANINGFUL_EDIT_CHARS = 3;
  function meaningfulEditDistance(a, b) {
    const normA = a.replace(/\s+/g, ' ').trim(); const normB = b.replace(/\s+/g, ' ').trim();
    if (normA === normB) return 0;
    const lenDiff = Math.abs(normA.length - normB.length); let mismatches = 0;
    const maxLen = Math.max(normA.length, normB.length);
    for (let i = 0; i < maxLen; i++) { if (normA[i] !== normB[i]) mismatches++; }
    return Math.max(lenDiff, mismatches);
  }
  const codeWasEdited = meaningfulEditDistance(freeCode, templateCode) >= MIN_MEANINGFUL_EDIT_CHARS;
  useEffect(() => {
    if (!freeCode) return;
    const gm = freeCode.match(/@GetMapping\("([^"]+)"\)/);
    const pm = freeCode.match(/@PostMapping\("([^"]+)"\)/);
    const prevGet = parsedGet?.path; const prevPost = parsedPost?.path;
    setParsedGet(gm ? { path: gm[1] } : null); setParsedPost(pm ? { path: pm[1] } : null);
    if (gm && !prevGet) play('add'); if (pm && !prevPost) play('add');
  }, [freeCode]);
  const canSubmitP2 = parsedGet && parsedPost && codeWasEdited && p2c1 && p2c2 && p2c3 && p2c4 && sentences >= 1;
  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({ type: 'HK_RESULT', version: '1', exerciseId: 'm2-t2-s1-get-post-builder', status: 'completed', score: 3, maxScore: 3, answers: { phase1: { getReturnType: retType, postMapping: b1, requestBody: b2, postmanUsed: pmSent, registerItems, allChecked: allS4 }, phase2: { domain, freeCode, parsedGet, parsedPost, checks: [p2c1,p2c2,p2c3,p2c4], reflection } }, metadata: { subtopicId, taskId }, completedAt: new Date().toISOString() }, '*');
    } catch(e) {}
  }, [submitted]);

  return (
    <div className="sim-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>GET + POST Builder</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      {phase === 1 && (
        <div className="progress-strip">
          {['Return a List', 'Add a POST', 'Test in Postman', 'See it connect'].map((label, i) => {
            const stepNum = i + 1; const state = slot > stepNum ? 'done' : slot === stepNum ? 'active' : '';
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
        <div>
          {phase === 1 && (
            <>
              <div ref={el => slotRefs.current[1] = el} className={`card ${slot === 1 ? 'active' : 'complete'}`}>
                <div className="step-counter">Step 1 of 4</div>
                <h2 className="card-header">GET your data as a list</h2>
                <p style={{ color: '#475569' }}>In 2.1.3 you returned a String. Now you'll return a real List - Spring Boot converts it to JSON automatically.</p>
                <div className="diff-row">
                  <div className="diff-before">
                    <div className="diff-label">Before</div>
                    @GetMapping("/gym/hello")<br/>
                    public String hello() {"{"}  <br/>
                    &nbsp;&nbsp;return "Welcome!"; <span style={{color:'#6B7280'}}>// String</span><br/>
                    {"}"}
                  </div>
                  <div className="diff-after">
                    <div className="diff-label">After (what you build now)</div>
                    <span className="ck">private</span> List&lt;String&gt; members =<br/>
                    &nbsp;&nbsp;<span className="ck">new</span> ArrayList&lt;&gt;();<br/><br/>
                    <span className="ca">@GetMapping</span>("/gym/members")<br/>
                    <span className="ck">public</span>{' '}
                    <div className="blank-wrap">
                      <select className={`blank-select ${retStatus === true ? 'blank-correct' : retStatus === false ? 'blank-wrong' : ''}`} value={retType} onChange={e => handleRetType(e.target.value)}>
                        <option value="">[ return type ]</option>
                        <option value="String">String</option>
                        <option value="List<String>">List&lt;String&gt;</option>
                        <option value="int">int</option>
                        <option value="void">void</option>
                      </select>
                    </div>{' '}
                    getMembers() {"{"}<br/>
                    &nbsp;&nbsp;<span className="ck">return</span> members;<br/>
                    {"}"}
                  </div>
                </div>
                {retStatus === false && <div className="warn-msg">{RET_TYPE_HINTS[retType] || "That return type doesn't match - you need List<String>."}</div>}
                {retStatus === true && (
                  <div style={{ animation: 'slideIn 0.3s' }}>
                    <div className="info-note">Add this to your controller. Open <code>localhost:8080/gym/members</code></div>
                    <div className="mockup-browser">
                      <div className="mockup-header">
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ width:10,height:10,borderRadius:'50%',background:'#EF4444' }} />
                          <div style={{ width:10,height:10,borderRadius:'50%',background:'#F59E0B' }} />
                          <div style={{ width:10,height:10,borderRadius:'50%',background:'#10B981' }} />
                        </div>
                        <div className="mockup-url">localhost:8080/gym/members</div>
                      </div>
                      <div className="mockup-body">
                        <span style={{ color: '#94A3B8' }}>[ ]&nbsp;</span>
                        <span style={{ color: '#64748B', fontSize: '0.85rem', marginLeft: 8 }}>empty array - list exists, zero items ✅</span>
                      </div>
                    </div>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={s1Checked} onChange={() => { setS1Checked(true); play('correct'); fireSceneEvent('get'); setTimeout(() => setSlot(2), 600); }} />
                      ✅ I see [] in my browser
                    </label>
                  </div>
                )}
              </div>

              {slot >= 2 && (
                <div ref={el => slotRefs.current[2] = el} className={`card ${slot === 2 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 2 of 4</div>
                  <h2 className="card-header">POST to add data</h2>
                  <p style={{ color: '#475569', margin: '0 0 4px' }}>Your <code>getMembers()</code> from Step 1 can only read <code>members</code> - right now it's always empty. A POST is how something actually gets added to that same list.</p>
                  <p style={{ color: '#475569' }}>Fill in the two annotations that make POST work.</p>
                  <div className="code-block">
                    <span className="ck">import</span> org.springframework.web.bind.annotation.PostMapping;<br/>
                    <span className="ck">import</span> org.springframework.web.bind.annotation.RequestBody;<br/><br/>
                    <div className="blank-wrap">
                      <input className={`blank-input ${b1Status === true ? 'blank-correct' : b1Status === false ? 'blank-wrong' : ''}`} placeholder="@PostMapping" value={b1} onChange={e => handleB1(e.target.value)} onBlur={checkB1} />
                    </div> <span className="cc">// blank 1 - annotation for POST</span><br/>
                    <span className="ck">public</span> String addMember(<br/>
                    &nbsp;&nbsp;<div className="blank-wrap">
                      <input className={`blank-input ${b2Status === true ? 'blank-correct' : b2Status === false ? 'blank-wrong' : ''}`} placeholder="@RequestBody" value={b2} onChange={e => handleB2(e.target.value)} onBlur={checkB2} />
                    </div> String name <span className="cc">// blank 2 - reads the body</span><br/>
                    ) {"{"}<br/>
                    &nbsp;&nbsp;members.add(name);<br/>
                    &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Member added: "</span> + name;<br/>
                    {"}"}
                  </div>
                  {b1Status === false && <div className="warn-msg">Just the annotation name - type @PostMapping (no path needed here, unlike @GetMapping above).</div>}
                  {b2Status === false && <div className="warn-msg">Try @RequestBody - it reads whatever was sent in the POST request body.</div>}
                  {allBlanksCorrect && (
                    <div style={{ marginTop: 16, animation: 'slideIn 0.3s' }}>
                      <div className="code-block" style={{ border: '1px solid #10B981' }}>
                        <span className="ca">@PostMapping</span>(<span className="cs">"/gym/members"</span>) <span className="cc">// POST /gym/members</span><br/>
                        <span className="ck">public</span> String addMember(<br/>
                        &nbsp;&nbsp;<span className="ca">@RequestBody</span> String name <span className="cc">// read request body</span><br/>
                        ) {"{"}<br/>
                        &nbsp;&nbsp;members.add(name); <span className="cc">// add to in-memory list</span><br/>
                        &nbsp;&nbsp;<span className="ck">return</span> <span className="cs">"Member added: "</span> + name;<br/>
                        {"}"}
                      </div>
                      <button className="btn green" style={{ marginTop: 12, width: '100%' }} onClick={() => { setSlot(3); play('tick'); }}>Now install Postman →</button>
                    </div>
                  )}
                </div>
              )}

              {slot >= 3 && (
                <div ref={el => slotRefs.current[3] = el} className={`card ${slot === 3 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 3 of 4</div>
                  <h2 className="card-header">Test with Postman</h2>
                  <p style={{ color: '#475569', margin: '0 0 12px' }}>The <code>addMember()</code> endpoint you just wrote is real code now - but you can't call it by typing a URL in the browser.</p>
                  <div className="info-note" style={{ marginBottom: 16 }}>Your browser only sends GET requests. To send POST - you need <b>Postman</b>.<br/>Postman lets you send any HTTP method and see exactly what the server responds.</div>
                  <ol style={{ paddingLeft: 20, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>
                    <li>Go to <b>postman.com</b> and download the free desktop app</li>
                    <li>Create a free account (or skip)</li>
                    <li>Open Postman</li>
                  </ol>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={s3Checked} onChange={() => { setS3Checked(true); play('add'); setPmOpen(true); }} />
                    ✅ I have Postman open
                  </label>
                  {pmOpen && (
                    <div style={{ marginTop: 20, animation: 'slideIn 0.3s' }}>
                      <h4 style={{ margin: '0 0 12px 0' }}>Try it here (interactive mockup):</h4>
                      <div className="postman-box">
                        <div className="postman-top">
                          <button className={`postman-method ${pmMethod === 'GET' ? 'get' : 'post'}`} onClick={() => setPmMethod(m => m === 'GET' ? 'POST' : 'GET')}>{pmMethod} ▾</button>
                          <input className="postman-url" value={pmUrl} onChange={e => setPmUrl(e.target.value)} placeholder="http://localhost:8080/gym/members" />
                          <button className="postman-send" onClick={handlePmSend}>Send</button>
                        </div>
                        <div className="postman-body">
                          <div className="postman-tabs">
                            <div className="postman-tab active">Body</div>
                            <div className="postman-tab active" style={{ color: '#F97316', borderBottomColor: '#F97316' }}>raw</div>
                            <div className="postman-tab active" style={{ color: '#F97316', borderBottomColor: '#F97316' }}>JSON</div>
                          </div>
                          <textarea className="postman-body-input" value={pmBody} onChange={e => setPmBody(e.target.value)} placeholder='"Ravi"' />
                          <div style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: 6 }}>String body must be wrapped in double quotes - "Ravi", not Ravi</div>
                        </div>
                        {pmResponse && (
                          <div className={`postman-response${pmResponse.startsWith('Error') ? ' error' : ''}`}>
                            <div className="postman-res-label">Response</div>
                            {pmResponse}
                          </div>
                        )}
                      </div>
                      {pmSent && (
                        <div style={{ marginTop: 16, animation: 'slideIn 0.3s' }}>
                          <div className="info-note">Postman sent "Ravi" to your server. Your server added it to the List. Now check GET at <code>localhost:8080/gym/members</code> in your browser.</div>
                          <button className="btn green" style={{ marginTop: 12, width: '100%' }} onClick={() => { setSlot(4); play('tick'); }}>Watch GET + POST work together →</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {slot >= 4 && (
                <div ref={el => slotRefs.current[4] = el} className="card active" style={{ animation: 'slideIn 0.3s' }}>
                  <div className="step-counter">Step 4 of 4</div>
                  <h2 className="card-header">Watch GET and POST work together</h2>
                  <p style={{ color: '#475569', margin: '0 0 16px' }}>Check the register on the right - Ravi is already sitting in it from Postman. GET and POST are now the same list, viewed two ways.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                      <div style={{ fontWeight: 700, color: '#1D4ED8', marginBottom: 8 }}>POST - Write</div>
                      <p style={{ color: '#1E40AF', fontSize: '0.9rem', margin: 0 }}>Send via Postman:<br/><code>POST /gym/members</code><br/>body: "Ravi"</p>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                      <div style={{ fontWeight: 700, color: '#15803D', marginBottom: 8 }}>GET - Read</div>
                      <p style={{ color: '#166534', fontSize: '0.9rem', margin: 0 }}>Open in browser:<br/><code>GET /gym/members</code><br/>returns: ["Ravi"]</p>
                    </div>
                  </div>
                  <div className="mockup-browser">
                    <div className="mockup-header">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width:10,height:10,borderRadius:'50%',background:'#EF4444' }} />
                        <div style={{ width:10,height:10,borderRadius:'50%',background:'#F59E0B' }} />
                        <div style={{ width:10,height:10,borderRadius:'50%',background:'#10B981' }} />
                      </div>
                      <div className="mockup-url">localhost:8080/gym/members</div>
                    </div>
                    <div className="mockup-body" style={{ padding: '10px 14px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#9CA3AF' }}>[</span>
                      <span style={{ color: '#4ADE80' }}>"Ravi"</span>
                      <span style={{ color: '#9CA3AF' }}>, </span>
                      <span style={{ color: '#4ADE80' }}>"Suresh"</span>
                      <span style={{ color: '#9CA3AF' }}>, </span>
                      <span style={{ color: '#4ADE80' }}>"Priya"</span>
                      <span style={{ color: '#9CA3AF' }}>]</span>
                    </div>
                  </div>
                  <div className="info-note" style={{ background: '#F5F3FF', borderColor: '#8B5CF6', color: '#5B21B6' }}>
                    <b>That ["Ravi","Suresh","Priya"] in your browser is JSON.</b><br/>Spring Boot automatically converted your Java List to JSON. You wrote zero JSON code.
                  </div>
                  <div className="amber-note">
                    <div className="amber-note-title">⚠️ Restart your server now.</div>
                    Go to <code>localhost:8080/gym/members</code> again. You will see: <b>[ ]</b><br/><br/>
                    Empty. Ravi, Suresh, Priya are gone. That is expected. Your List lives in memory - it resets on restart.<br/><br/>
                    <b>In Topic 3 - you connect to a database. Data survives restarts. That is why databases exist.</b>
                  </div>
                  <label className="checkbox-label"><input type="checkbox" checked={c4_1} onChange={() => !c4_1 && handleS4Check(1, setC4_1)} />I added 3 members via Postman</label>
                  <label className="checkbox-label"><input type="checkbox" checked={c4_2} onChange={() => !c4_2 && handleS4Check(2, setC4_2)} disabled={!c4_1} />I saw them in GET response as JSON</label>
                  <label className="checkbox-label"><input type="checkbox" checked={c4_3} onChange={() => !c4_3 && handleS4Check(3, setC4_3)} disabled={!c4_2} />I restarted server and saw [] again</label>
                  <label className="checkbox-label"><input type="checkbox" checked={c4_4} onChange={() => !c4_4 && handleS4Check(4, setC4_4)} disabled={!c4_3} />I understand why the data disappeared</label>
                  {allS4 && (
                    <div className="reveal-card" style={{ marginTop: 24, animation: 'slideIn 0.3s' }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#92400E' }}>What you just built:</h3>
                      {revealLines >= 1 && <div className="reveal-line">✅ <b>@PostMapping</b> → maps POST request to a method</div>}
                      {revealLines >= 2 && <div className="reveal-line">✅ <b>@RequestBody</b> → reads what was sent in the request body</div>}
                      {revealLines >= 3 && <div className="reveal-line">✅ <b>POST</b> → creates new data - sends data TO the server</div>}
                      {revealLines >= 4 && <div className="reveal-line">✅ <b>GET</b> → reads data - gets data FROM the server</div>}
                      {revealLines >= 5 && <div className="reveal-line">✅ <b>JSON</b> → Spring Boot converts List to JSON automatically - zero code from you</div>}
                      {revealLines >= 6 && <div className="reveal-line">✅ <b>Postman</b> → tool to test APIs - send any HTTP method</div>}
                      {revealLines >= 7 && (
                        <div style={{ marginTop: 24, textAlign: 'center', animation: 'slideIn 0.3s' }}>
                          <h3 style={{ color: '#1E293B' }}>POST writes. GET reads.<br/>Your data disappears on restart because it lives in memory.<br/>Next - connect to MySQL. Data that survives forever.</h3>
                          <button className="btn green" style={{ padding: '16px 32px', fontSize: '1.1rem', marginTop: 20 }} onClick={() => { setPhase(2); play('tick'); }}>Now build for YOUR project →</button>
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
              <h2 className="card-header" style={{ fontSize: '1.5rem' }}>Build GET and POST for YOUR project</h2>
              <p style={{ color: '#64748B' }}>Same pattern - your domain. Replace the placeholder variables with your real domain.</p>
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
                    {domain === 'Gym' && "Your gym needs: GET /gym/members → returns member list. POST /gym/members → adds a member name. For now, List<String> is fine."}
                    {domain === 'Hotel' && "Your hotel needs: GET /hotel/rooms → room list. POST /hotel/rooms → adds a room name."}
                    {domain === 'Mess' && "Your mess needs: GET /mess/menu → menu items. POST /mess/menu → adds a menu item."}
                    {domain === 'Chai' && "Your chai shop needs: GET /chai/orders → order list. POST /chai/orders → adds an order."}
                  </div>
                  <textarea className="free-editor" value={freeCode} onChange={e => setFreeCode(e.target.value)} onPaste={e => e.preventDefault()} onContextMenu={e => e.preventDefault()} spellCheck="false" />
                  {!codeWasEdited && <div className="warn-msg" style={{ marginTop: 10 }}>✏️ This is the auto-filled starting point - before continuing, make a real change (a few characters isn't enough): rename a variable, adjust a path, or add a comment in your own words.</div>}
                </>
              )}
              {domain && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Postman task - test your endpoints:</h4>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c1} onChange={e => { setP2c1(e.target.checked); if(e.target.checked) play('add'); }} disabled={!codeWasEdited} />GET /{domain.toLowerCase()}/items working in browser</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c2} onChange={e => { setP2c2(e.target.checked); if(e.target.checked) play('add'); }} disabled={!p2c1} />POST /{domain.toLowerCase()}/items working via Postman</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c3} onChange={e => { setP2c3(e.target.checked); if(e.target.checked) play('add'); }} disabled={!p2c2} />I posted 3 real {domain.toLowerCase()} items via Postman</label>
                  <label className="checkbox-label"><input type="checkbox" checked={p2c4} onChange={e => { setP2c4(e.target.checked); if(e.target.checked) play('add'); }} disabled={!p2c3} />I restarted and confirmed data resets to []</label>
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Reflection:</h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 8px 0' }}>In one sentence - why does your data disappear when the server restarts, and what will fix this in Topic 3?</p>
                    <textarea className="reflection-box" placeholder="The data disappears because it lives in a Java List. In Topic 3, a database will fix this because..." value={reflection} onChange={e => setReflection(e.target.value)} />
                    <div className={`word-count ${sentences >= 1 ? 'ok' : ''}`}>{sentences} / 1 sentence minimum</div>
                  </div>
                  <button className="btn green" style={{ width: '100%', padding: 16, fontSize: '1.1rem', marginTop: 24, opacity: canSubmitP2 ? 1 : 0.5 }} disabled={!canSubmitP2 || submitted} onClick={() => { play('submit'); setSubmitted(true); }}>
                    {submitted ? 'Completed ✅' : 'GET and POST are working →'}
                  </button>
                  {submitted && (
                    <div style={{ marginTop: 20, padding: 16, background: '#F0FDF4', borderRadius: 8, color: '#065F46', animation: 'popIn 0.3s' }}>
                      <b>Your first real CRUD operations are working! 🎉</b><br/><br/>
                      ✅ POST writes to your List<br/>✅ GET reads from your List<br/>✅ Spring Boot returns JSON automatically<br/><br/>
                      <b>Next - PUT to update, DELETE to remove. Then - connect to MySQL.</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="split-right-col">
          <div className="sticky-panel">
            <RegisterScene items={c4_3 ? [] : registerItems} event={sceneEvent} wasRestarted={c4_3} />
            <div>
              {(slot >= 1 && retStatus === true) && (
                <div className="route-card get">
                  <span className="method-badge badge-get">GET</span> /gym/members
                  <span style={{ color: '#94A3B8' }}>→</span> getMembers()
                  <span className="method-badge badge-json">→ JSON</span>
                </div>
              )}
              {(slot >= 2 && allBlanksCorrect) && (
                <div className="route-card post">
                  <span className="method-badge badge-post">POST</span> /gym/members
                  <span style={{ color: '#94A3B8' }}>→</span> addMember()
                  <span className="method-badge badge-body">@RequestBody</span>
                </div>
              )}
              {phase === 2 && parsedGet && (
                <div className="route-card get">
                  <span className="method-badge badge-get">GET</span> {parsedGet.path}
                  <span className="method-badge badge-json">→ JSON</span>
                </div>
              )}
              {phase === 2 && parsedPost && (
                <div className="route-card post">
                  <span className="method-badge badge-post">POST</span> {parsedPost.path}
                  <span className="method-badge badge-body">@RequestBody</span>
                </div>
              )}
              {!retStatus && phase === 1 && slot === 1 && (
                <div style={{ textAlign: 'center', padding: 24, border: '2px dashed #E2E8F0', borderRadius: 8, color: '#94A3B8' }}>Endpoints appear here</div>
              )}
            </div>
            {(slot >= 4 || phase === 2) && (
              <div style={{ marginTop: 20 }}>
                <div className="mockup-browser">
                  <div className="mockup-header">
                    <div className="mockup-url">{phase === 2 && parsedGet ? `localhost:8080${parsedGet.path}` : 'localhost:8080/gym/members'}</div>
                  </div>
                  <div className="mockup-body" style={{ padding: '12px 16px' }}>
                    {c4_3 ? (
                      <span style={{ color: '#9CA3AF' }}>[ ] <span style={{ fontSize: '0.8rem', marginLeft: 8 }}>empty after restart</span></span>
                    ) : registerItems.length > 0 ? (
                      <span>
                        <span style={{ color: '#9CA3AF' }}>[</span>
                        {registerItems.map((r,i) => <span key={i}><span style={{ color: '#4ADE80' }}>"{r}"</span>{i < registerItems.length-1 && <span style={{ color: '#9CA3AF' }}>, </span>}</span>)}
                        <span style={{ color: '#9CA3AF' }}>]</span>
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>[ ]</span>
                    )}
                  </div>
                </div>
                {phase === 2 && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 16, marginTop: 12, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#64748B' }}>GET endpoint:</span>
                      <span style={{ fontWeight: 700, color: parsedGet ? '#10B981' : '#EF4444' }}>{parsedGet ? parsedGet.path : 'not found'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>POST endpoint:</span>
                      <span style={{ fontWeight: 700, color: parsedPost ? '#3B82F6' : '#EF4444' }}>{parsedPost ? parsedPost.path : 'not found'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
