import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ────────────────────────────────────────────────────────
   AUDIO ENGINE (Web Audio API Only)
──────────────────────────────────────────────────────── */
function useSynthesizedSound() {
  const audioCtxRef = useRef(null);
  const isMuted = useRef(false);

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type) => {
    if (isMuted.current) return;
    try {
      initAudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'correct') {
        // Play major triad arpeggio
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
          subGain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.07);
          subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
          subOsc.start(ctx.currentTime + idx * 0.07);
          subOsc.stop(ctx.currentTime + idx * 0.07 + 0.25);
        });
      } else if (type === 'warn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(220.00, ctx.currentTime + 0.1); // A3
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'reveal') {
        // Ascending magic sweep
        const notes = [440, 554, 659, 880, 1109];
        notes.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          subGain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.08);
          subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          subOsc.start(ctx.currentTime + idx * 0.08);
          subOsc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } else if (type === 'submit') {
        // Solid confirmation sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn('Audio Synthesis failed:', e);
    }
  }, []);

  return { playSound, isMuted };
}

/* ────────────────────────────────────────────────────────
   STYLE CONFIGURATION
──────────────────────────────────────────────────────── */
const CSS_STYLE = `
  .flow-root {
    background: #F9FAFB;
    color: #1E293B;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  .flow-root * {
    box-sizing: border-box;
  }
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #E2E8F0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-title-wrap h1 {
    font-size: 1.25rem;
    font-weight: 850;
    background: linear-gradient(135deg, #f43f5e, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  .header-title-wrap p {
    font-size: 0.75rem;
    color: #64748b;
    margin: 2px 0 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }
  .mute-toggle-btn {
    background: #fff;
    color: #1E293B;
    border: 1px solid #E2E8F0;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mute-toggle-btn:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }

  .nav-pills {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    max-width: 1200px;
    margin: 24px auto 0;
    padding: 0 24px;
  }
  .nav-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #E2E8F0;
    color: #94A3B8;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    transition: all 0.3s ease;
  }
  .nav-pill.active {
    background: #EFF6FF;
    color: #2563EB;
    border-color: #3b82f6;
    box-shadow: 0 0 15px rgba(59,130,246,0.12);
  }
  .nav-pill.done {
    background: rgba(16,185,129,0.1);
    color: #16A34A;
    border-color: #10b981;
  }
  @media(max-width: 768px) {
    .nav-pills {
      flex-wrap: wrap;
    }
    .nav-pill {
      min-width: 130px;
    }
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }
  .main-grid > .right-column {
    align-self: stretch;
  }
  @media (max-width: 960px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
    .main-grid > .right-column {
      align-self: auto;
    }
  }

  .step-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  }
  .step-card.active {
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59,130,246,0.08);
  }
  .step-card.future {
    opacity: 0.45;
    pointer-events: none;
  }
  .step-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #3b82f6;
    margin-bottom: 6px;
  }
  .step-title {
    font-size: 1.25rem;
    font-weight: 850;
    color: #1E293B;
    margin: 0 0 16px;
  }

  .instruction-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 14px;
    font-size: 0.85rem;
    line-height: 1.7;
    margin-bottom: 16px;
    color: #334155;
  }
  .bold-tag {
    font-family: monospace;
    font-weight: 700;
    background: #FEE2E2;
    padding: 2px 6px;
    border-radius: 4px;
    color: #DC2626;
  }
  .bold-tag.post {
    color: #16A34A;
    background: #DCFCE7;
  }
  .bold-tag.get {
    color: #2563EB;
    background: #DBEAFE;
  }
  
  .copyable-code {
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 12px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.78rem;
    color: #e2e8f0;
    overflow-x: auto;
    position: relative;
    margin: 8px 0 16px;
    white-space: pre-wrap;
  }
  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #334155;
    color: #cbd5e1;
    border: 1px solid #475569;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.7rem;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.15s;
  }
  .copy-btn:hover {
    background: #475569;
    color: #fff;
  }

  .alert-card {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.82rem;
    line-height: 1.6;
    margin: 12px 0;
  }
  .alert-card.blue {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    color: #1E40AF;
  }
  .alert-card.amber {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    color: #78350F;
  }

  .token-textarea {
    width: 100%;
    height: 70px;
    background: #F8FAFC;
    color: #1E293B;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 0.75rem;
    resize: none;
    outline: none;
    margin-top: 10px;
  }
  .token-textarea:focus {
    border-color: #3b82f6;
  }

  .checkbox-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 10px;
    padding: 14px;
    margin-top: 16px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  .checkbox-btn:hover {
    background: #DCFCE7;
    border-color: #10b981;
  }
  .checkbox-btn.checked {
    background: #DCFCE7;
    border-color: #10b981;
  }
  .checkbox-indicator {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 2px solid #94A3B8;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .checkbox-btn.checked .checkbox-indicator {
    background: #10b981;
    border-color: #10b981;
  }
  .checkbox-indicator::after {
    content: '✓';
    color: #fff;
    font-size: 0.75rem;
    font-weight: 900;
    opacity: 0;
  }
  .checkbox-btn.checked .checkbox-indicator::after {
    opacity: 1;
  }
  .checkbox-label {
    font-size: 0.88rem;
    font-weight: 700;
    color: #475569;
    transition: color 0.2s;
  }
  .checkbox-btn.checked .checkbox-label {
    color: #15803D;
  }

  .interactive-sandbox {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
  }
  .sandbox-header {
    font-size: 0.75rem;
    font-weight: 800;
    color: #B45309;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
  }

  /* Pipeline Visuals (Right Panel) */
  .pipeline-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    position: sticky;
    top: 90px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  }
  @media (max-width: 960px) {
    .pipeline-card {
      position: static;
    }
  }
  .pipeline-header {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748B;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 12px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pipeline-flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  .pipeline-step {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: #F8FAFC;
    transition: all 0.4s ease;
  }
  .pipeline-step.active {
    background: #EFF6FF;
    border-color: #BFDBFE;
  }
  .pipeline-step.completed {
    background: #F0FDF4;
    border-color: #BBF7D0;
  }
  .pipeline-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #F1F5F9;
    border: 2px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 800;
    color: #94A3B8;
    transition: all 0.4s ease;
    flex-shrink: 0;
  }
  .pipeline-step.completed .pipeline-circle {
    background: #DCFCE7;
    border-color: #10b981;
    color: #16A34A;
    box-shadow: 0 0 12px rgba(16,185,129,0.2);
  }
  .pipeline-content {
    flex: 1;
  }
  .pipeline-step-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #94A3B8;
    transition: color 0.4s;
  }
  .pipeline-step.completed .pipeline-step-title {
    color: #1E293B;
  }
  .pipeline-step.active .pipeline-step-title {
    color: #2563EB;
  }
  .pipeline-step-desc {
    font-size: 0.7rem;
    color: #CBD5E1;
    margin-top: 2px;
    transition: color 0.4s;
  }
  .pipeline-step.completed .pipeline-step-desc {
    color: #64748B;
  }
  .pipeline-line {
    width: 2px;
    height: 24px;
    background: #E2E8F0;
    transition: background 0.4s;
  }
  .pipeline-line.completed {
    background: #10b981;
  }

  .jwt-decoder-box {
    margin-top: 10px;
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 12px;
    font-family: monospace;
    font-size: 0.7rem;
    line-height: 1.5;
    color: #E2E8F0;
  }
  
  /* Colorized JWT Parts */
  .jwt-part-header { color: #60a5fa; word-break: break-all; }
  .jwt-part-payload { color: #34d399; word-break: break-all; }
  .jwt-part-signature { color: #fbbf24; word-break: break-all; }
  
  /* 3D Gate Lock (Mentor Gate) */
  .gate-section {
    perspective: 1200px;
    margin: 32px 0;
    border-radius: 16px;
    overflow: hidden;
  }
  .gate-container {
    width: 100%;
    background: #fff;
    border: 2px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    position: relative;
    transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  }
  .gate-container.swung-open {
    transform: rotateY(-90deg);
    opacity: 0.05;
    pointer-events: none;
  }
  .gate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }
  .gate-header h3 {
    font-size: 1rem;
    font-weight: 850;
    color: #1E293B;
    margin: 0;
  }
  .gate-checklist {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .gate-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 8px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    cursor: pointer;
    transition: all 0.2s;
  }
  .gate-item:hover {
    border-color: #94A3B8;
  }
  .gate-item.checked {
    background: #F0FDF4;
    border-color: #BBF7D0;
  }
  .gate-item-check {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #94A3B8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .gate-item.checked .gate-item-check {
    background: #10b981;
    border-color: #10b981;
  }
  .gate-item-check::after {
    content: '✓';
    color: #fff;
    font-size: 0.7rem;
    font-weight: 800;
    opacity: 0;
  }
  .gate-item.checked .gate-item-check::after {
    opacity: 1;
  }
  .gate-item-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
  }
  .gate-item.checked .gate-item-label {
    color: #14532D;
  }

  .gate-bolts-panel {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: #F8FAFC;
    border: 1.5px dashed #E2E8F0;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
  }
  .gate-bolt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .bolt-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #CBD5E1;
    border: 2px solid #E2E8F0;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
    transition: all 0.3s;
  }
  .bolt-indicator.locked {
    background: #dc2626;
    box-shadow: 0 0 10px rgba(220,38,38,0.3);
  }
  .bolt-indicator.unlocked {
    background: #10b981;
    box-shadow: 0 0 10px rgba(16,185,129,0.4);
  }
  .bolt-label {
    font-size: 0.6rem;
    font-weight: 800;
    color: #94A3B8;
    text-transform: uppercase;
  }
  .bolt-indicator.unlocked + .bolt-label {
    color: #10b981;
  }

  .revealed-module4 {
    display: none;
    text-align: center;
    padding: 30px 20px;
    background: #F0FDF4;
    border: 2px solid #22c55e;
    border-radius: 16px;
    box-shadow: 0 0 30px rgba(34,197,94,0.1);
    animation: zoomIn 0.8s forwards;
    margin: 32px 0;
  }
  .revealed-module4.show {
    display: block;
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  /* React Preview Panel */
  .react-preview-box {
    border: 2.5px dashed #CBD5E1;
    background: #F8FAFC;
    opacity: 0.8;
    border-radius: 16px;
    padding: 24px;
    margin-top: 24px;
    position: relative;
    overflow: hidden;
  }
  .react-preview-box::before {
    content: "COMING IN MODULE 4";
    position: absolute;
    top: 15px;
    right: 15px;
    background: #E2E8F0;
    border: 1px solid #CBD5E1;
    color: #64748B;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .preview-login-form {
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 12px;
    max-width: 250px;
    margin: 12px 0;
    background: #1E293B;
  }
  
  /* Staggered Achievements Card */
  .achievement-list {
    background: #f8fafc;
    border-radius: 16px;
    padding: 24px;
    color: #0f172a;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .achievement-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.92rem;
    font-weight: 700;
    margin-bottom: 12px;
    opacity: 0;
    transform: translateY(10px);
    animation: slideUpFade 0.5s forwards;
  }
  @keyframes slideUpFade {
    to { opacity: 1; transform: translateY(0); }
  }

  .inline-warn {
    margin-top: 10px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 0.78rem;
    font-weight: 600;
    animation: slideUpFade 0.3s forwards;
  }

  .btn {
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 14px 24px;
    font-size: 0.95rem;
    font-weight: 800;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
  }
  .btn:hover {
    filter: brightness(1.08);
  }
  .btn:disabled {
    background: #334155;
    color: #64748b;
    cursor: not-allowed;
    filter: none;
  }
  .btn.green {
    background: #10b981;
  }

  .word-count {
    text-align: right;
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
    font-weight: 700;
  }
  .word-count.ok {
    color: #34d399;
  }
`;

export default function JWTFlowTester() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { playSound, isMuted } = useSynthesizedSound();
  const [mutedState, setMutedState] = useState(false);

  // Steps state
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);
  const [step5Done, setStep5Done] = useState(false);

  // Inputs
  const [tokenText, setTokenText] = useState('');
  const [tamperedToken, setTamperedToken] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  // Local JWT parsed sections
  const [jwtParts, setJwtParts] = useState({ header: '', payload: '', signature: '', raw: '' });
  const [decodedPayload, setDecodedPayload] = useState(null);

  // Tamper Sandbox simulation states
  const [originalChar, setOriginalChar] = useState('');
  const [alteredChar, setAlteredChar] = useState('');
  const [tamperIndex, setTamperIndex] = useState(-1);
  const [tamperPrediction, setTamperPrediction] = useState(null);

  // Gate state
  const [gateChecks, setGateChecks] = useState([false, false, false, false, false, false, false]);
  const [gateSwungOpen, setGateSwungOpen] = useState(false);

  // Staggered achievements trigger
  const [showAchievements, setShowAchievements] = useState(false);
  const [visibleAchievementsCount, setVisibleAchievementsCount] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [step2Warning, setStep2Warning] = useState(false);
  const [step5Warning, setStep5Warning] = useState(false);

  // Handle Mute
  const handleToggleMute = () => {
    isMuted.current = !isMuted.current;
    setMutedState(isMuted.current);
  };

  // Helper to copy text to clipboard
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    playSound('tick');
  };

  // Decode JWT on step 2 input
  useEffect(() => {
    const cleanToken = tokenText.trim();
    if (!cleanToken) {
      setJwtParts({ header: '', payload: '', signature: '', raw: '' });
      setDecodedPayload(null);
      return;
    }
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      setJwtParts({ header: parts[0], payload: parts[1], signature: parts[2], raw: cleanToken });
      try {
        // Decode base64 payload safely
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        setDecodedPayload(JSON.parse(jsonPayload));
      } catch (err) {
        setDecodedPayload({ error: 'Invalid payload structure' });
      }
    } else {
      setJwtParts({ header: '', payload: '', signature: '', raw: cleanToken });
      setDecodedPayload(null);
    }
  }, [tokenText]);

  // Handle step checkbox updates
  const handleStepCheck = (stepNum, isChecked) => {
    if (isChecked) {
      if (stepNum === 1) {
        setStep1Done(true);
        playSound('add');
        setCurrentStep(2);
      } else if (stepNum === 2) {
        if (!tokenText.trim()) {
          playSound('warn');
          setStep2Warning(true);
          return;
        }
        setStep2Warning(false);
        setStep2Done(true);
        playSound('correct');
        setCurrentStep(3);
      } else if (stepNum === 3) {
        setStep3Done(true);
        playSound('correct');
        setCurrentStep(4);
      } else if (stepNum === 4) {
        setStep4Done(true);
        playSound('correct');
        setCurrentStep(5);
      } else if (stepNum === 5) {
        if (!tamperedToken.trim()) {
          playSound('warn');
          setStep5Warning(true);
          return;
        }
        setStep5Warning(false);
        setStep5Done(true);
        playSound('correct');
      }
    } else {
      playSound('warn');
      if (stepNum === 1) setStep1Done(false);
      if (stepNum === 2) setStep2Done(false);
      if (stepNum === 3) setStep3Done(false);
      if (stepNum === 4) setStep4Done(false);
      if (stepNum === 5) setStep5Done(false);
    }
  };

  // Simulate tampering
  const handleSimulateTamper = () => {
    if (!jwtParts.payload) return;
    const payloadStr = jwtParts.payload;
    // Alter middle character
    const idx = Math.floor(payloadStr.length / 2);
    const origChar = payloadStr[idx];
    const newChar = origChar === 'X' ? 'Y' : 'X'; // change to X or Y
    const newPayload = payloadStr.substring(0, idx) + newChar + payloadStr.substring(idx + 1);
    
    setOriginalChar(origChar);
    setAlteredChar(newChar);
    setTamperIndex(idx);
    setTamperPrediction(null);

    const fullTamperedToken = `${jwtParts.header}.${newPayload}.${jwtParts.signature}`;
    setTamperedToken(fullTamperedToken);
    playSound('warn');
  };

  // Checklist handler
  const handleGateCheck = (idx) => {
    setGateChecks((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      playSound('add');
      return copy;
    });
  };

  // Checks count
  const allGateChecked = gateChecks.every((item) => item);
  const sentenceCount = reflectionText.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const isSubmissionFormValid =
    step1Done &&
    step2Done &&
    step3Done &&
    step4Done &&
    step5Done &&
    allGateChecked &&
    githubUrl.trim().startsWith('http') &&
    sentenceCount >= 2;

  // Handle final submit
  const handleFinalSubmit = () => {
    if (!isSubmissionFormValid) {
      playSound('warn');
      return;
    }
    playSound('submit');
    setGateSwungOpen(true);
    setTimeout(() => {
      setShowAchievements(true);
      playSound('reveal');
      // Trigger arpeggios staggered
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setVisibleAchievementsCount(count);
        playSound('tick');
        if (count >= 7) {
          clearInterval(interval);
          setTimeout(() => {
            playSound('correct');
          }, 500);
        }
      }, 400);
    }, 1200);

    setSubmitted(true);
  };

  // PostMessage relay
  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT',
        version: '1',
        exerciseId: 'm4-t2-s4-jwt-flow-tester',
        exerciseType: 'interactive',
        status: 'completed',
        score: 3,
        maxScore: 3,
        answers: {
          steps: {
            registerConfirmed: step1Done,
            loginGotToken: step2Done,
            tokenWorks: step3Done,
            noTokenBlocked: step4Done,
            tamperedTokenBlocked: step5Done
          },
          gate: {
            registerWorks: gateChecks[0],
            bcryptHashInMySQL: gateChecks[1],
            loginReturnsToken: gateChecks[2],
            validTokenAccepted: gateChecks[3],
            noTokenRejected: gateChecks[4],
            tamperedTokenRejected: gateChecks[5],
            authPathsOpen: gateChecks[6]
          },
          githubRepoUrl: githubUrl,
          reflectionText: reflectionText
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {
      console.warn('postMessage failed:', e);
    }
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto trigger correct sounds when all gate checked
  useEffect(() => {
    if (allGateChecked && step5Done) {
      playSound('correct');
    }
  }, [allGateChecked, step5Done]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flow-root">
      <style>{CSS_STYLE}</style>

      {/* Header bar */}
      <div className="header-bar">
        <div className="header-title-wrap">
          <h1>Complete JWT Flow Verification</h1>
          <p>Module 3 Graduation Milestone</p>
        </div>
        <button className="mute-toggle-btn" onClick={handleToggleMute}>
          {mutedState ? '🔇 Muted' : '🔊 Sound On'}
        </button>
      </div>

      {/* Progress indicators */}
      <div className="nav-pills">
        <div className={`nav-pill ${step1Done ? 'done' : currentStep === 1 ? 'active' : ''}`}>
          {step1Done ? '✓' : '1'} Register
        </div>
        <div className={`nav-pill ${step2Done ? 'done' : currentStep === 2 ? 'active' : ''}`}>
          {step2Done ? '✓' : '2'} Login + Token
        </div>
        <div className={`nav-pill ${step3Done ? 'done' : currentStep === 3 ? 'active' : ''}`}>
          {step3Done ? '✓' : '3'} Use Token
        </div>
        <div className={`nav-pill ${step4Done ? 'done' : currentStep === 4 ? 'active' : ''}`}>
          {step4Done ? '✓' : '4'} No Token
        </div>
        <div className={`nav-pill ${step5Done ? 'done' : currentStep === 5 ? 'active' : ''}`}>
          {step5Done ? '✓' : '5'} Tamper Test
        </div>
      </div>

      <div className="main-grid">
        {/* Left column guide */}
        <div className="left-column">
          
          {/* STEP 1 */}
          <div className="step-card active">
            <span className="step-badge">Step 1</span>
            <h2 className="step-title">Register the owner</h2>
            <div className="instruction-box">
              Send a request to create a user account.
              <br />
              <div style={{ marginTop: '8px' }}>
                <span className="bold-tag post">POST</span> <code>localhost:8080/auth/register</code>
              </div>
            </div>
            
            <div className="copyable-code">
              <button className="copy-btn" onClick={() => handleCopyText(`{\n    "username": "gymowner",\n    "password": "gym@123"\n}`)}>Copy</button>
{`{
    "username": "gymowner",
    "password": "gym@123"
}`}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Expected Response: <code style={{ color: '#10b981' }}>"Registered: gymowner"</code>
            </div>

            <div className="alert-card blue">
              <strong>Already registered in 3.1.3?</strong>
              <br />
              You can skip running this in Postman. The user record is already saved securely inside your MySQL database.
            </div>

            <div className={`checkbox-btn ${step1Done ? 'checked' : ''}`} onClick={() => handleStepCheck(1, !step1Done)}>
              <div className="checkbox-indicator" />
              <span className="checkbox-label">Register works / User exists in database</span>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`step-card ${step1Done ? 'active' : 'future'}`}>
            <span className="step-badge">Step 2</span>
            <h2 className="step-title">Login and obtain JWT</h2>
            <div className="instruction-box">
              Verify your credentials to request your digital membership wristband (JWT).
              <br />
              <div style={{ marginTop: '8px' }}>
                <span className="bold-tag post">POST</span> <code>localhost:8080/auth/login</code>
              </div>
            </div>

            <div className="copyable-code">
              <button className="copy-btn" onClick={() => handleCopyText(`{\n    "username": "gymowner",\n    "password": "gym@123"\n}`)}>Copy</button>
{`{
    "username": "gymowner",
    "password": "gym@123"
}`}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Expected Response:
              <pre style={{ color: '#3b82f6', margin: '4px 0 0' }}>{`{ "token": "eyJhbGciOi..." }`}</pre>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                Paste the token here:
              </label>
              <textarea
                className="token-textarea"
                placeholder="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI..."
                value={tokenText}
                onChange={(e) => setTokenText(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: '#475569', display: 'block', marginTop: '4px' }}>
                Paste the full token text returned in the Postman response
              </span>
            </div>

            {/* Local Interactive Decoder */}
            {jwtParts.header && (
              <div className="interactive-sandbox">
                <div className="sandbox-header">
                  <span>Interactive Token Decoder</span>
                  <span style={{ color: '#10b981' }}>Valid Segment count ✅</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#2563EB' }}>Header:</strong> Holds algorithm type (HS256).
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#16A34A' }}>Payload (Decoded claims):</strong>
                    <pre style={{ color: '#34d399', background: '#1E293B', padding: '8px', borderRadius: '6px', fontSize: '0.7rem', margin: '4px 0' }}>
                      {decodedPayload ? JSON.stringify(decodedPayload, null, 2) : 'Reading claims...'}
                    </pre>
                  </div>
                  <div>
                    <strong style={{ color: '#B45309' }}>Signature:</strong> Secret hash validating payload integrity.
                  </div>
                </div>
              </div>
            )}

            <div className={`checkbox-btn ${step2Done ? 'checked' : ''}`} onClick={() => handleStepCheck(2, !step2Done)}>
              <div className="checkbox-indicator" />
              <span className="checkbox-label">Login returns valid JWT token</span>
            </div>
            {step2Warning && <div className="inline-warn">⚠️ Please paste a token generated from /auth/login first.</div>}
          </div>

          {/* STEP 3 */}
          <div className={`step-card ${step2Done ? 'active' : 'future'}`}>
            <span className="step-badge">Step 3</span>
            <h2 className="step-title">Access secure endpoints</h2>
            <div className="instruction-box">
              Use the token you received to fetch secure members details.
              <br />
              <div style={{ marginTop: '8px' }}>
                <span className="bold-tag get">GET</span> <code>localhost:8080/gym/members</code>
              </div>
              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li>Open Postman.</li>
                <li>Go to the <strong>Headers</strong> tab.</li>
                <li>Add header field: <strong>Key:</strong> <code>Authorization</code>, <strong>Value:</strong> <code>Bearer &lt;token&gt;</code>.</li>
              </ol>
            </div>

            {tokenText && (
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  Copy your pre-built header value:
                </div>
                <div className="copyable-code">
                  <button className="copy-btn" onClick={() => handleCopyText(`Bearer ${tokenText.trim()}`)}>Copy</button>
                  {`Authorization: Bearer ${tokenText.slice(0, 30)}...`}
                </div>
              </div>
            )}

            <div className="alert-card blue">
              <strong>How this executes in Java:</strong>
              <br />
              The request hits <code>JwtFilter</code>. It parses the Authorization header, removes the <code>"Bearer "</code> prefix, uses <code>JwtUtil</code> to confirm validity, and sets authentication details in the <code>SecurityContextHolder</code> so Spring Security allows access.
            </div>

            <div className={`checkbox-btn ${step3Done ? 'checked' : ''}`} onClick={() => handleStepCheck(3, !step3Done)}>
              <div className="checkbox-indicator" />
              <span className="checkbox-label">Members list successfully returned</span>
            </div>
          </div>

          {/* STEP 4 */}
          <div className={`step-card ${step3Done ? 'active' : 'future'}`}>
            <span className="step-badge">Step 4</span>
            <h2 className="step-title">Test no-token blocking</h2>
            <div className="instruction-box">
              Confirm your application rules block requests without authorization.
              <br />
              <div style={{ marginTop: '8px' }}>
                <span className="bold-tag get">GET</span> <code>localhost:8080/gym/members</code>
              </div>
              <div style={{ marginTop: '8px' }}>
                In Postman, uncheck or remove the <code>Authorization</code> header completely and send.
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Expected Response: <code style={{ color: '#f43f5e' }}>401 Unauthorized</code> or <code style={{ color: '#f43f5e' }}>403 Forbidden</code>
            </div>

            <div className="alert-card amber">
              Because no signature token is passed, <code>JwtFilter</code> registers nothing in Spring Security's context. Spring Security blocks it automatically.
            </div>

            <div className={`checkbox-btn ${step4Done ? 'checked' : ''}`} onClick={() => handleStepCheck(4, !step4Done)}>
              <div className="checkbox-indicator" />
              <span className="checkbox-label">Blocked with 401 response</span>
            </div>
          </div>

          {/* STEP 5 */}
          <div className={`step-card ${step4Done ? 'active' : 'future'}`}>
            <span className="step-badge">Step 5</span>
            <h2 className="step-title">Verify signature tampering protection</h2>
            <div className="instruction-box">
              Learn how signatures protect tokens from server-side spoofing.
              If a malicious actor alters even a single byte in the payload, the signature calculation mismatches and breaks.
            </div>

            <div className="alert-card amber">
              A JWT consists of <code>[header].[payload].[signature]</code>. If we change any character in the middle part (payload), the validation engine rejects the entire token because it does not match the signature.
            </div>

            {/* Interactive Tamper Box */}
            {jwtParts.payload && (
              <div className="interactive-sandbox" style={{ borderStyle: 'dashed', borderColor: '#f59e0b' }}>
                <div className="sandbox-header" style={{ color: '#f59e0b' }}>
                  <span>Tamper Sandbox Playground</span>
                  <span>Payload Section</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 10px' }}>
                  Click the button below to simulate tampering. The system will alter a character in the center payload section:
                </p>
                <button
                  type="button"
                  className="mute-toggle-btn"
                  style={{ width: '100%', marginBottom: '12px', background: '#f59e0b', color: '#1E293B', borderColor: '#f59e0b' }}
                  onClick={handleSimulateTamper}
                >
                  🛠️ Simulate Tampering (Change 1 Character)
                </button>

                {tamperIndex !== -1 && (
                  <div style={{ fontSize: '0.75rem', color: '#1E293B', lineHeight: 1.6 }}>
                    <div style={{ background: '#1E293B', padding: '10px', borderRadius: '6px', marginBottom: '8px', color: '#E2E8F0' }}>
                      <div>Original Character: <span style={{ color: '#34D399', fontWeight: 700 }}>"{originalChar}"</span></div>
                      <div>Tampered to: <span style={{ color: '#F87171', fontWeight: 700 }}>"{alteredChar}"</span></div>
                    </div>
                    <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', background: '#1E293B', padding: '10px', borderRadius: '6px', color: '#E2E8F0' }}>
                      <span className="jwt-part-header">{jwtParts.header}</span>.
                      <span className="jwt-part-payload">
                        {jwtParts.payload.slice(0, tamperIndex)}
                        <span style={{ background: '#ef4444', color: '#fff', padding: '0 2px', borderRadius: '2px', fontWeight: 900 }}>
                          {alteredChar}
                        </span>
                        {jwtParts.payload.slice(tamperIndex + 1)}
                      </span>.
                      <span className="jwt-part-signature">{jwtParts.signature}</span>
                    </div>
                    {!tamperPrediction ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Predict: will Spring Security accept this token?</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="mute-toggle-btn" style={{ flex: 1 }} onClick={() => { setTamperPrediction('accept'); playSound('warn'); }}>Accept it — signature still matches</button>
                          <button type="button" className="mute-toggle-btn" style={{ flex: 1 }} onClick={() => { setTamperPrediction('reject'); playSound('pass'); }}>Reject it — 401</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#ef4444', marginTop: '10px', fontWeight: 700 }}>
                        {tamperPrediction === 'reject' ? '✅ Correct — ' : '❌ Not quite — '}
                        Signature integrity check failed! One flipped character in the payload no longer matches the original signature. Code returns 401.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tamperedToken && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                  Copy your tampered header value to test in Postman:
                </div>
                <div className="copyable-code">
                  <button className="copy-btn" onClick={() => handleCopyText(`Bearer ${tamperedToken}`)}>Copy</button>
                  {`Authorization: Bearer ${tamperedToken.slice(0, 30)}...`}
                </div>
              </div>
            )}

            <div className={`checkbox-btn ${step5Done ? 'checked' : ''}`} onClick={() => handleStepCheck(5, !step5Done)}>
              <div className="checkbox-indicator" />
              <span className="checkbox-label">Tampered token returns 401 blocked</span>
            </div>
            {step5Warning && <div className="inline-warn">⚠️ Please simulate or paste a tampered token first.</div>}

            {step5Done && (
              <div style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: '#14532D'
              }}>
                <strong>Why this is secure:</strong>
                <br />
                Nobody can edit a JWT and use it successfully. If any content changes, the signature math fails. Your user records and authentication scopes are completely secure.
              </div>
            )}
          </div>

          {/* GATE CHECKLIST */}
          {step5Done && (
            <div className="gate-section">
              <div className={`gate-container ${gateSwungOpen ? 'swung-open' : ''}`}>
                <div className="gate-header">
                  <h3>🔒 Module 3 graduation Gate</h3>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>7 items required</span>
                </div>

                <div className="gate-checklist">
                  {[
                    'Register endpoint works — user created in MySQL database',
                    'MySQL users table stores BCrypt hashes instead of plain text passwords',
                    'Login endpoint returns valid JWT token payload',
                    'Protected endpoints successfully accept valid token in Authorization headers',
                    'Protected endpoints reject requests without a token, returning a 401 error',
                    'Protected endpoints reject requests with tampered token payloads, returning a 401 error',
                    '/auth/register and /auth/login endpoints are open without authentication requirements'
                  ].map((label, idx) => (
                    <div
                      key={idx}
                      className={`gate-item ${gateChecks[idx] ? 'checked' : ''}`}
                      onClick={() => handleGateCheck(idx)}
                    >
                      <div className="gate-item-check" />
                      <div className="gate-item-label">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Gate Bolts panel */}
                <div className="gate-bolts-panel">
                  {gateChecks.map((val, idx) => (
                    <div key={idx} className="gate-bolt">
                      <div className={`bolt-indicator ${val ? 'unlocked' : 'locked'}`} />
                      <span className="bolt-label">Bolt {idx + 1}</span>
                    </div>
                  ))}
                </div>

                {allGateChecked && (
                  <div style={{ marginTop: '20px', animation: 'zoomIn 0.3s' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                        Your GitHub Repository URL:
                      </label>
                      <input
                        type="text"
                        className="token-textarea"
                        style={{ height: '40px', marginTop: 0 }}
                        placeholder="https://github.com/username/project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                        In 2 sentences, explain the difference when your API receives a request with a valid JWT token vs without one:
                      </label>
                      <textarea
                        className="token-textarea"
                        style={{ height: '90px', marginTop: 0 }}
                        placeholder="When a request arrives with a JWT token..."
                        value={reflectionText}
                        onPaste={(e) => e.preventDefault()}
                        onChange={(e) => setReflectionText(e.target.value)}
                      />
                      <div className={`word-count ${sentenceCount >= 2 ? 'ok' : ''}`}>
                        {sentenceCount} / 2 sentences minimum
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn green"
                      disabled={!isSubmissionFormValid}
                      onClick={handleFinalSubmit}
                    >
                      Module 3 complete — submit for mentor review →
                    </button>
                  </div>
                )}
              </div>

              {/* Revealed beyond the gate */}
              <div className={`revealed-module4 ${gateSwungOpen ? 'show' : ''}`}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4ade80', margin: '0 0 10px' }}>
                  Module 3 Complete! 🔐
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#14532D', marginBottom: '24px' }}>
                  Congratulations! Ravi's API is now production-ready secure.
                </p>

                {showAchievements && (
                  <div className="achievement-list">
                    {[
                      'Spring Security — every endpoint locked',
                      'BCrypt — passwords protected forever',
                      'Register + Login — real accounts',
                      'JWT tokens — digital membership cards',
                      'JwtFilter — token verified every request',
                      'Tampered tokens rejected — signatures work',
                      'Complete security flow — end to end'
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="achievement-item"
                        style={{
                          animationDelay: `${idx * 0.4}s`,
                          display: idx < visibleAchievementsCount ? 'flex' : 'none'
                        }}
                      >
                        <span style={{ color: '#10b981' }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #14532d', marginTop: '24px', paddingTop: '20px', textAlign: 'left' }}>
                  <h4 style={{ color: '#4ade80', margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 800 }}>
                    What is next — Module 4
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#86efac', lineHeight: 1.6, margin: 0 }}>
                    You have a secure backend API. Now it needs a face.
                    In Module 4, we build the frontend in React to:
                    <br />
                    • Show a login form.
                    <br />
                    • Send credentials to /auth/login.
                    <br />
                    • Receive the JWT token.
                    <br />
                    • Store the token in memory.
                    <br />
                    • Send the token with every request to /gym/members.
                    <br />
                    • Render secure data on screen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column flow visual */}
        <div className="right-column">
          <div className="pipeline-card">
            <div className="pipeline-header">
              <span>JWT Flow Pipeline</span>
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
                {step5Done ? 'Verification Complete ✅' : 'Verifying...'}
              </span>
            </div>

            <div className="pipeline-flow">
              {/* Step 1 in Pipeline */}
              <div className={`pipeline-step ${step1Done ? 'completed' : currentStep === 1 ? 'active' : ''}`}>
                <div className="pipeline-circle">1</div>
                <div className="pipeline-content">
                  <div className="pipeline-step-title">POST /auth/register</div>
                  <div className="pipeline-step-desc">
                    {step1Done ? 'Secured with BCrypt hashing' : 'Awaiting confirmation'}
                  </div>
                  {step1Done && (
                    <div style={{ marginTop: '8px', background: '#040508', border: '1px solid #161a23', padding: '6px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      <div style={{ color: '#94a3b8' }}>Database representation:</div>
                      <div style={{ color: '#34d399' }}>gymowner | $2a$10$...</div>
                      <div style={{ color: '#64748b', fontSize: '0.6rem', marginTop: '2px' }}>Hash stored — not plain ✅</div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`pipeline-line ${step2Done ? 'completed' : ''}`} />

              {/* Step 2 in Pipeline */}
              <div className={`pipeline-step ${step2Done ? 'completed' : currentStep === 2 ? 'active' : ''}`}>
                <div className="pipeline-circle">2</div>
                <div className="pipeline-content">
                  <div className="pipeline-step-title">POST /auth/login</div>
                  <div className="pipeline-step-desc">
                    {step2Done ? 'JwtUtil generates security token' : 'Awaiting authentication'}
                  </div>
                  {step2Done && jwtParts.header && (
                    <div className="jwt-decoder-box">
                      <span className="jwt-part-header">{jwtParts.header.slice(0, 10)}...</span>.
                      <span className="jwt-part-payload">{jwtParts.payload.slice(0, 10)}...</span>.
                      <span className="jwt-part-signature">{jwtParts.signature.slice(0, 10)}...</span>
                      <div style={{ color: '#475569', fontSize: '0.6rem', marginTop: '4px' }}>
                        Colorized structure: <span className="jwt-part-header">Header</span> / <span className="jwt-part-payload">Payload</span> / <span className="jwt-part-signature">Signature</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`pipeline-line ${step3Done ? 'completed' : ''}`} />

              {/* Step 3 in Pipeline */}
              <div className={`pipeline-step ${step3Done ? 'completed' : currentStep === 3 ? 'active' : ''}`}>
                <div className="pipeline-circle">3</div>
                <div className="pipeline-content">
                  <div className="pipeline-step-title">GET /gym/members (With Token)</div>
                  <div className="pipeline-step-desc">
                    {step3Done ? 'JwtFilter verifies claims & permits request' : 'Awaiting request validation'}
                  </div>
                  {step3Done && (
                    <div style={{ marginTop: '8px', background: '#040508', border: '1px solid #161a23', padding: '6px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.65rem', lineHeight: 1.5 }}>
                      <div style={{ color: '#60a5fa' }}>Token received ➔ validateToken() ✅</div>
                      <div style={{ color: '#34d399' }}>SecurityContextHolder: gymowner</div>
                      <div style={{ color: '#10b981' }}>➔ Access Granted</div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`pipeline-line ${step4Done ? 'completed' : ''}`} />

              {/* Step 4 in Pipeline */}
              <div className={`pipeline-step ${step4Done ? 'completed' : currentStep === 4 ? 'active' : ''}`}>
                <div className="pipeline-circle">4</div>
                <div className="pipeline-content">
                  <div className="pipeline-step-title">GET /gym/members (Without Token)</div>
                  <div className="pipeline-step-desc">
                    {step4Done ? 'Empty header detected and blocked' : 'Awaiting validation'}
                  </div>
                  {step4Done && (
                    <div style={{ marginTop: '8px', background: '#1c1917', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      <div style={{ color: '#ef4444' }}>Header empty ➔ Context unfilled ❌</div>
                      <div style={{ color: '#ef4444', fontWeight: 800 }}>➔ 401 Unauthorized Response</div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`pipeline-line ${step5Done ? 'completed' : ''}`} />

              {/* Step 5 in Pipeline */}
              <div className={`pipeline-step ${step5Done ? 'completed' : currentStep === 5 ? 'active' : ''}`}>
                <div className="pipeline-circle">5</div>
                <div className="pipeline-content">
                  <div className="pipeline-step-title">Security Tamper Check</div>
                  <div className="pipeline-step-desc">
                    {step5Done ? 'System robustness fully tested' : 'Awaiting checks'}
                  </div>
                  {tamperIndex !== -1 && (
                    <div style={{ marginTop: '8px', background: '#1c1917', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      <div style={{ color: '#ef4444' }}>Middle character tampered ➔ signature broken ❌</div>
                      <div style={{ color: '#ef4444', fontWeight: 800 }}>➔ 401 Unauthorized Response</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Faded React preview for Module 4 */}
            <div className="react-preview-box">
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                React Integration Visual
              </h4>

              <div className="preview-login-form">
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginBottom: '4px' }}>Username</div>
                <div style={{ height: '14px', background: '#334155', borderRadius: '3px', marginBottom: '8px' }} />
                <div style={{ height: '18px', background: '#3b82f6', borderRadius: '4px' }} />
              </div>

              <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', lineHeight: 1.5 }}>
                1. loginForm.submit()
                <br />
                2. localStorage.setItem('token', 'eyJ...')
                <br />
                3. axios.get('/gym/members', {'{'} Authorization: Bearer token {'}'})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
