import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .mysql-root {
    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
    background: #0F172A;
    color: #F8FAFC;
    min-height: 100vh;
    padding: 24px 16px;
    line-height: 1.6;
  }
  .mysql-root * { box-sizing: border-box; }

  /* Mute button & header */
  .mysql-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto 28px;
    border-bottom: 1px solid #1E293B;
    padding-bottom: 16px;
  }
  .mysql-title {
    font-size: 1.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #38BDF8, #818CF8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  .mute-btn {
    background: #1E293B;
    color: #F1F5F9;
    border: 1px solid #334155;
    padding: 8px 16px;
    border-radius: 9999px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mute-btn:hover {
    background: #334155;
    border-color: #475569;
  }

  /* Progress Bar */
  .progress-bar-wrap {
    max-width: 1200px;
    margin: 0 auto 32px;
    background: #1E293B;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid #334155;
  }
  .progress-pills {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .progress-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    transition: all 0.3s ease;
    text-align: center;
  }
  .progress-pill.active {
    background: #0284C7;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(2, 132, 199, 0.4);
  }
  .progress-pill.complete {
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .progress-pill.future {
    background: #0F172A;
    color: #64748B;
    border: 1px solid #1E293B;
  }

  /* Split Layout */
  .split-container {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    align-items: start;
  }
  .split-right-col {
    position: sticky;
    top: 24px;
  }
  @media (max-width: 991px) {
    .split-container {
      grid-template-columns: 1fr;
    }
    .split-right-col {
      position: static;
    }
    .progress-pills {
      flex-wrap: wrap;
    }
    .progress-pill {
      min-width: 120px;
    }
  }

  /* Step Cards */
  .step-card {
    background: #1E293B;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border-left: 5px solid #475569;
    border-top: 1px solid #334155;
    border-bottom: 1px solid #334155;
    border-right: 1px solid #334155;
    transition: all 0.3s ease;
  }
  .step-card.active {
    border-left-color: #0284C7;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
  .step-card.complete {
    border-left-color: #10B981;
  }
  .step-card.future {
    opacity: 0.35;
    pointer-events: none;
  }
  .step-num-tag {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #38BDF8;
    margin-bottom: 8px;
  }
  .step-title {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0 0 16px;
    color: #F1F5F9;
  }

  /* OS Pill Selectors */
  .os-selectors {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
  .os-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    border: 2px solid #334155;
    background: #0F172A;
    color: #94A3B8;
    transition: all 0.2s ease;
  }
  .os-pill:hover {
    border-color: #475569;
    color: #F1F5F9;
  }
  .os-pill.selected {
    background: #38BDF8;
    color: #0F172A;
    border-color: #38BDF8;
    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
  }

  /* Tabbed Content (mac) */
  .mac-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 2px solid #334155;
    padding-bottom: 8px;
  }
  .mac-tab-btn {
    background: transparent;
    border: none;
    color: #64748B;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 6px;
  }
  .mac-tab-btn:hover {
    color: #F1F5F9;
    background: #334155;
  }
  .mac-tab-btn.active {
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.1);
  }

  /* Code Blocks */
  .code-block-container {
    background: #090D16;
    border: 1px solid #1E293B;
    border-radius: 12px;
    padding: 14px;
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    margin: 12px 0;
    position: relative;
    overflow-x: auto;
    color: #E2E8F0;
  }
  .copy-btn {
    position: absolute;
    right: 8px;
    top: 8px;
    background: #1E293B;
    color: #94A3B8;
    border: 1px solid #334155;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s;
  }
  .copy-btn:hover {
    background: #334155;
    color: #F1F5F9;
  }
  .kw { color: #60A5FA; font-weight: 700; }  /* SQL Keywords */
  .db-val { color: #34D399; }                /* DB Values */
  .punc { color: #FB923C; }                  /* Semicolons */
  .cmt { color: #64748B; font-style: italic; } /* Comments */

  /* Warnings & Info cards */
  .warning-card {
    background: #78350F;
    border: 2px solid #D97706;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    display: flex;
    gap: 16px;
  }
  .warning-card.amber {
    background: #FFFBEB;
    border-color: #F59E0B;
    color: #78350F;
  }
  .warning-icon {
    font-size: 1.8rem;
    align-self: flex-start;
  }
  .warning-text h4 {
    margin: 0 0 6px;
    font-weight: 800;
    font-size: 1rem;
  }
  .warning-text p {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .info-card {
    background: rgba(30, 41, 59, 0.5);
    border-left: 4px solid #38BDF8;
    padding: 14px;
    border-radius: 8px;
    margin: 14px 0;
  }
  .info-card p {
    margin: 0;
    font-size: 0.9rem;
    color: #CBD5E1;
  }

  /* Accordion Errors */
  .accordion-wrap {
    margin-top: 24px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #334155;
  }
  .accordion-trigger {
    background: #1E293B;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    user-select: none;
    transition: background 0.2s;
  }
  .accordion-trigger:hover {
    background: #2D3748;
  }
  .accordion-content {
    background: #0F172A;
    padding: 16px;
    border-top: 1px solid #334155;
  }
  .error-item {
    margin-bottom: 20px;
    border-bottom: 1px solid #1E293B;
    padding-bottom: 16px;
  }
  .error-item:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
  .error-title {
    color: #F87171;
    font-weight: 700;
    margin: 0 0 8px;
    font-size: 0.95rem;
  }

  /* Checkbox logic */
  .check-label {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
  }
  .check-label:hover {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10B981;
  }
  .check-input {
    width: 22px;
    height: 22px;
    cursor: pointer;
    accent-color: #10B981;
  }

  /* Terminal Mockup */
  .terminal-mock {
    background: #090D16;
    border-radius: 12px;
    border: 1px solid #334155;
    font-family: 'Fira Code', 'Courier New', monospace;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    margin: 16px 0;
  }
  .terminal-header {
    background: #1E293B;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid #334155;
  }
  .term-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
  }
  .term-red { background: #EF4444; }
  .term-yel { background: #F59E0B; }
  .term-grn { background: #10B981; }
  .term-title {
    color: #94A3B8;
    font-size: 0.75rem;
    margin-left: 8px;
    font-weight: 600;
  }
  .terminal-body {
    padding: 16px;
    font-size: 0.85rem;
    color: #4ADE80;
    min-height: 140px;
    line-height: 1.5;
  }
  .term-cursor {
    display: inline-block;
    width: 8px; height: 15px;
    background: #4ADE80;
    margin-left: 4px;
    animation: blink 1s step-end infinite;
    vertical-align: middle;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }

  /* Domain Pills */
  .domain-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0;
  }
  .domain-btn {
    background: #1E293B;
    color: #E2E8F0;
    border: 1px solid #334155;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
  }
  .domain-btn:hover {
    background: #334155;
  }
  .domain-btn.selected {
    background: #38BDF8;
    color: #0F172A;
    border-color: #38BDF8;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
  }

  /* Question Cards */
  .q-card {
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 18px;
  }
  .q-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 14px;
    color: #F1F5F9;
  }
  .opt-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .opt-btn {
    text-align: left;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 600;
    border: 1.5px solid #334155;
    background: #0F172A;
    color: #CBD5E1;
    transition: all 0.2s;
  }
  .opt-btn:hover {
    border-color: #475569;
    background: #1E293B;
  }
  .opt-btn.correct {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10B981;
    color: #10B981;
  }
  .opt-btn.wrong {
    background: rgba(239, 68, 68, 0.1);
    border-color: #EF4444;
    color: #EF4444;
  }

  /* Reflection input */
  .reflection-box {
    width: 100%;
    height: 100px;
    background: #090D16;
    color: #F8FAFC;
    border: 1.5px solid #334155;
    border-radius: 10px;
    padding: 14px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    outline: none;
    margin-top: 10px;
  }
  .reflection-box:focus {
    border-color: #38BDF8;
  }

  /* Milestone SVG Icons */
  .visual-cylinder {
    width: 48px;
    height: 48px;
    transition: all 0.3s ease;
  }
  .visual-cylinder path {
    transition: all 0.3s ease;
  }

  /* Right Side Tracker */
  .milestone-tracker {
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }
  .milestone-item {
    display: flex;
    gap: 16px;
    align-items: center;
    position: relative;
  }
  .milestone-line-vert {
    width: 3px;
    background: #334155;
    height: 40px;
    margin-left: 22px;
    position: relative;
  }
  .milestone-line-vert.filled {
    background: #10B981;
  }
  .milestone-content {
    flex: 1;
  }
  .milestone-header {
    font-weight: 800;
    font-size: 1rem;
    color: #94A3B8;
  }
  .milestone-header.active {
    color: #38BDF8;
  }
  .milestone-header.complete {
    color: #10B981;
  }
  .milestone-desc {
    font-size: 0.8rem;
    color: #64748B;
    margin-top: 2px;
  }

  /* Submit Button styling */
  .submit-btn {
    background: #10B981;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    padding: 16px;
    width: 100%;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  }
  .submit-btn:hover:not(:disabled) {
    background: #059669;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5);
  }
  .submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Reveal list tick animations */
  .reveal-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    margin-bottom: 8px;
    animation: popIn 0.3s ease forwards;
  }
  .reveal-tick {
    color: #10B981;
    font-weight: 800;
  }

  /* Properties Box */
  .prop-box {
    background: #090D16;
    border: 1.5px solid #334155;
    border-radius: 12px;
    padding: 14px;
    font-family: monospace;
    font-size: 0.85rem;
    color: #94A3B8;
    margin-top: 16px;
  }
`;

// Simple Sound synthesizers
function useAudio() {
  const isMuted = useRef(false);
  const audioCtxRef = useRef(null);

  const initCtx = () => {
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
      initCtx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'add') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'remove') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'correct') {
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          subGain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
          subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
          subOsc.start(ctx.currentTime + idx * 0.08);
          subOsc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      } else if (type === 'warn') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(277, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'reveal') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          subGain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
          subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.35);
          subOsc.start(ctx.currentTime + idx * 0.1);
          subOsc.stop(ctx.currentTime + idx * 0.1 + 0.35);
        });
      } else if (type === 'submit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio synthesis warning: ', e);
    }
  }, []);

  return { playSound, isMuted };
}

export default function MySQLInstall() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { playSound, isMuted } = useAudio();
  const [mutedState, setMutedState] = useState(false);

  // States for interactive flow
  const [activeStep, setActiveStep] = useState(1);
  const [selectedOS, setSelectedOS] = useState('');
  const [macTab, setMacTab] = useState('homebrew');

  // Checkboxes
  const [checkedStep1, setCheckedStep1] = useState(false);
  const [checkedStep2, setCheckedStep2] = useState(false);
  const [checkedStep3, setCheckedStep3] = useState(false);

  // Domain selector
  const [selectedDomain, setSelectedDomain] = useState('Gym');
  const [customDomainName, setCustomDomainName] = useState('');

  // Accordion collapsed state
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Completion reveals
  const [showCompletion, setShowCompletion] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);

  // Quiz questions
  const [q1Answer, setQ1Answer] = useState(null);
  const [q2Answer, setQ2Answer] = useState(null);
  const [q3Answer, setQ3Answer] = useState(null);
  const [attempts, setAttempts] = useState([1, 1, 1]);

  // Reflection
  const [reflectionText, setReflectionText] = useState('');
  const sentencesCount = reflectionText.trim().split(/[.!?]+/).filter(Boolean).length;

  const [submitted, setSubmitted] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Determine database name
  const getDbName = () => {
    if (selectedDomain === 'Gym') return 'gymapp';
    if (selectedDomain === 'Mess') return 'messapp';
    if (selectedDomain === 'Hotel') return 'hotelapp';
    if (selectedDomain === 'Chai') return 'chaiapp';
    return customDomainName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myapp';
  };
  const dbName = getDbName();

  // Determine the example Java model class name for the chosen domain
  const getModelClassName = () => {
    if (selectedDomain === 'Gym') return 'GymMember.java';
    if (selectedDomain === 'Mess') return 'MessMember.java';
    if (selectedDomain === 'Hotel') return 'HotelRoom.java';
    if (selectedDomain === 'Chai') return 'ChaiOrder.java';
    return 'YourModel.java';
  };
  const modelClassName = getModelClassName();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    playSound('tick');
    setTimeout(() => {
      setCopiedText('');
    }, 2000);
  };

  const handleOSSelect = (os) => {
    setSelectedOS(os);
    playSound('tick');
  };

  // Toggle mute state
  const toggleMuted = () => {
    isMuted.current = !isMuted.current;
    setMutedState(isMuted.current);
  };

  // Checkbox transitions
  const handleCheckStep1 = (val) => {
    setCheckedStep1(val);
    if (val) {
      playSound('add');
      setActiveStep(2);
    } else {
      playSound('remove');
    }
  };

  const handleCheckStep2 = (val) => {
    setCheckedStep2(val);
    if (val) {
      playSound('correct');
      setActiveStep(3);
    } else {
      playSound('remove');
    }
  };

  const handleCheckStep3 = (val) => {
    setCheckedStep3(val);
    if (val) {
      playSound('correct');
      setActiveStep(4);
    } else {
      playSound('remove');
    }
  };

  // Quiz evaluation
  const handleQ1 = (opt) => {
    if (q1Answer === 'B') return;
    setQ1Answer(opt);
    if (opt === 'B') {
      playSound('correct');
    } else {
      playSound('warn');
      setAttempts(a => [a[0] + 1, a[1], a[2]]);
    }
  };

  const handleQ2 = (opt) => {
    if (q2Answer === 'C') return;
    setQ2Answer(opt);
    if (opt === 'C') {
      playSound('correct');
    } else {
      playSound('warn');
      setAttempts(a => [a[0], a[1] + 1, a[2]]);
    }
  };

  const handleQ3 = (opt) => {
    if (q3Answer === 'B') return;
    setQ3Answer(opt);
    if (opt === 'B') {
      playSound('correct');
    } else {
      playSound('warn');
      setAttempts(a => [a[0], a[1], a[2] + 1]);
    }
  };

  const allQuestionsCorrect = q1Answer === 'B' && q2Answer === 'C' && q3Answer === 'B';

  // Play 'reveal' sound and animate lines on step 4 completion
  useEffect(() => {
    if (checkedStep1 && checkedStep2 && checkedStep3 && !showCompletion) {
      setShowCompletion(true);
      playSound('reveal');
      let currentReveal = 0;
      const interval = setInterval(() => {
        currentReveal += 1;
        setRevealIndex(currentReveal);
        playSound('tick');
        if (currentReveal >= 6) {
          clearInterval(interval);
        }
      }, 550);
    }
  }, [checkedStep1, checkedStep2, checkedStep3, showCompletion, playSound]);

  const canSubmit = checkedStep1 && checkedStep2 && checkedStep3 && allQuestionsCorrect && sentencesCount >= 1;

  const handleSubmit = () => {
    if (!canSubmit || submitted) return;
    playSound('submit');
    setSubmitted(true);
  };

  // Frame platform postMessage
  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT',
        version: '1',
        exerciseId: 'm2-t3-s2-mysql-install',
        exerciseType: 'interactive',
        status: 'completed',
        score: 3,
        maxScore: 3,
        answers: {
          setup: {
            osUsed: selectedOS,
            mysqlInstalled: true,
            mysqlPromptConfirmed: true,
            databaseName: dbName,
            databaseCreated: true
          },
          questions: {
            q1: q1Answer,
            q2: q2Answer,
            q3: q3Answer,
            attemptsPerQ: attempts
          },
          reflection: {
            text: reflectionText
          }
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch(e) {
      console.warn("postMessage failed", e);
    }
  }, [submitted, selectedOS, dbName, q1Answer, q2Answer, q3Answer, attempts, reflectionText, subtopicId, taskId]);

  return (
    <div className="mysql-root">
      <style>{STYLE}</style>

      {/* Header */}
      <header className="mysql-header">
        <h1 className="mysql-title">MySQL Setup Lab</h1>
        <button className="mute-btn" onClick={toggleMuted}>
          {mutedState ? '🔇 Muted' : '🔊 Sound On'}
        </button>
      </header>

      {/* Progress bar */}
      <section className="progress-bar-wrap">
        <div className="progress-pills">
          <div className={`progress-pill ${checkedStep1 ? 'complete' : activeStep === 1 ? 'active' : 'future'}`}>
            {checkedStep1 ? '✅ Installed' : '1. Install MySQL'}
          </div>
          <div className={`progress-pill ${checkedStep2 ? 'complete' : activeStep === 2 ? 'active' : 'future'}`}>
            {checkedStep2 ? '✅ Verified' : '2. Verify Setup'}
          </div>
          <div className={`progress-pill ${checkedStep3 ? 'complete' : activeStep === 3 ? 'active' : 'future'}`}>
            {checkedStep3 ? '✅ Database Ready' : '3. Create Database'}
          </div>
          <div className={`progress-pill ${submitted ? 'complete' : activeStep === 4 ? 'active' : 'future'}`}>
            {submitted ? '🎉 Lab Done' : '4. Completed'}
          </div>
        </div>
      </section>

      {/* Main split grid */}
      <main className="split-container">
        {/* Left Side steps */}
        <section>
          {/* STEP 1 */}
          <div className={`step-card ${activeStep === 1 ? 'active' : checkedStep1 ? 'complete' : 'future'}`}>
            <span className="step-num-tag">Step 1 of 4</span>
            <h2 className="step-title">Install MySQL 🗄️</h2>
            <p style={{ color: '#94A3B8', marginTop: 0 }}>Select your Operating System to get correct, fail-proof installation commands:</p>

            <div className="os-selectors">
              <button className={`os-pill ${selectedOS === 'mac' ? 'selected' : ''}`} onClick={() => handleOSSelect('mac')}>🍎 Mac</button>
              <button className={`os-pill ${selectedOS === 'windows' ? 'selected' : ''}`} onClick={() => handleOSSelect('windows')}>🪟 Windows</button>
              <button className={`os-pill ${selectedOS === 'linux' ? 'selected' : ''}`} onClick={() => handleOSSelect('linux')}>🐧 Linux</button>
            </div>

            {selectedOS === '' && (
              <div className="info-card" style={{ borderLeftColor: '#F59E0B' }}>
                <p style={{ color: '#F59E0B', fontWeight: 700 }}>⚠️ OS selection required. Please click your OS to proceed.</p>
              </div>
            )}

            {/* Mac Specific content */}
            {selectedOS === 'mac' && (
              <div>
                <div className="mac-tabs">
                  <button className={`mac-tab-btn ${macTab === 'homebrew' ? 'active' : ''}`} onClick={() => { setMacTab('homebrew'); playSound('tick'); }}>Homebrew (Recommended)</button>
                  <button className={`mac-tab-btn ${macTab === 'installer' ? 'active' : ''}`} onClick={() => { setMacTab('installer'); playSound('tick'); }}>Installer DMG</button>
                </div>

                {macTab === 'homebrew' ? (
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Copy and run these commands in your macOS terminal:</p>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>1. Install Homebrew (skip if already installed)</span>
                      <div className="code-block-container">
                        <button className="copy-btn" onClick={() => handleCopy('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')}>
                          {copiedText.includes('brew/install') ? 'Copied ✓' : 'Copy'}
                        </button>
                        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>2. Install MySQL</span>
                      <div className="code-block-container">
                        <button className="copy-btn" onClick={() => handleCopy('brew install mysql')}>
                          {copiedText === 'brew install mysql' ? 'Copied ✓' : 'Copy'}
                        </button>
                        brew install mysql
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>3. Start MySQL Service</span>
                      <div className="code-block-container">
                        <button className="copy-btn" onClick={() => handleCopy('brew services start mysql')}>
                          {copiedText === 'brew services start mysql' ? 'Copied ✓' : 'Copy'}
                        </button>
                        brew services start mysql
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>4. Run Security Installation Script</span>
                      <div className="code-block-container">
                        <button className="copy-btn" onClick={() => handleCopy('mysql_secure_installation')}>
                          {copiedText === 'mysql_secure_installation' ? 'Copied ✓' : 'Copy'}
                        </button>
                        mysql_secure_installation
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>
                    <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Go to <a href="https://dev.mysql.com/downloads/mysql/" target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', fontWeight: 700 }}>MySQL Community Server Downloads</a></li>
                      <li>Select the <b>macOS</b> tab.</li>
                      <li>Download the DMG file matching your hardware architecture (ARM / Intel).</li>
                      <li>Open the installer and drag the MySQL package to your Applications.</li>
                      <li>Open macOS <b>System Settings</b> → Scroll down to <b>MySQL</b>.</li>
                      <li>Click <b>Start MySQL Server</b>.</li>
                      <li>Copy down the temporary root password from the installation popup-you will need it immediately.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Windows Specific content */}
            {selectedOS === 'windows' && (
              <div style={{ color: '#CBD5E1', fontSize: '0.95rem' }}>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Go to <a href="https://dev.mysql.com/downloads/installer/" target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', fontWeight: 700 }}>MySQL Installer Downloads</a></li>
                  <li>Download <b>mysql-installer-web-community</b> (the smaller file ~2MB).</li>
                  <li>Run the executable installer.</li>
                  <li>In Setup Type: Select <b>Developer Default</b>.</li>
                  <li>Click <b>Execute</b> to automatically fetch and configure necessary database components.</li>
                  <li>Keep clicking <b>Next</b> through standard configurations.</li>
                  <li>Authentication Method: Select <b>"Use Strong Password Encryption"</b>.</li>
                  <li>Accounts and Roles: Enter a strong MySQL Root Password. <b>WRITE IT DOWN NOW!</b> 🔑</li>
                  <li>Click <b>Execute</b> → click <b>Finish</b> once setup wraps.</li>
                </ol>
              </div>
            )}

            {/* Linux Specific content */}
            {selectedOS === 'linux' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Execute these command blocks inside your bash shell:</p>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>Step 1: Update repository indices</span>
                  <div className="code-block-container">
                    <button className="copy-btn" onClick={() => handleCopy('sudo apt update')}>
                      {copiedText === 'sudo apt update' ? 'Copied ✓' : 'Copy'}
                    </button>
                    sudo apt update
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>Step 2: Install MySQL Package</span>
                  <div className="code-block-container">
                    <button className="copy-btn" onClick={() => handleCopy('sudo apt install mysql-server')}>
                      {copiedText === 'sudo apt install mysql-server' ? 'Copied ✓' : 'Copy'}
                    </button>
                    sudo apt install mysql-server
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>Step 3: Enable and start background service</span>
                  <div className="code-block-container">
                    <button className="copy-btn" onClick={() => handleCopy('sudo systemctl start mysql')}>
                      {copiedText === 'sudo systemctl start mysql' ? 'Copied ✓' : 'Copy'}
                    </button>
                    sudo systemctl start mysql
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>Step 4: Secure database root privileges</span>
                  <div className="code-block-container">
                    <button className="copy-btn" onClick={() => handleCopy('sudo mysql_secure_installation')}>
                      {copiedText === 'sudo mysql_secure_installation' ? 'Copied ✓' : 'Copy'}
                    </button>
                    sudo mysql_secure_installation
                  </div>
                </div>
              </div>
            )}

            {/* Amber Root Password Warning Card */}
            {selectedOS !== '' && (
              <div className="warning-card amber">
                <div className="warning-icon">🔑</div>
                <div className="warning-text">
                  <h4 style={{ margin: 0, color: '#78350F', fontWeight: 800 }}>Root password warning</h4>
                  <p style={{ marginTop: 4, color: '#78350F' }}>
                    Your root password is your MySQL master key.<br/>
                    When the installer or secure script asks to configure it:<br/>
                    → Press Y to set/change password<br/>
                    → Choose something you remember<br/>
                    → <b>Write it down RIGHT NOW</b><br/>
                    If you forget it, connecting Spring Boot to MySQL breaks and takes hours to reinstall.
                  </p>
                </div>
              </div>
            )}

            {/* Accordion Errors */}
            {selectedOS !== '' && (
              <div className="accordion-wrap">
                <div className="accordion-trigger" onClick={() => { setAccordionOpen(!accordionOpen); playSound('tick'); }}>
                  <span>Something went wrong? 🛠️</span>
                  <span>{accordionOpen ? '▼' : '▶'}</span>
                </div>
                {accordionOpen && (
                  <div className="accordion-content">
                    <div className="error-item">
                      <h4 className="error-title">1. mysql: command not found (Mac)</h4>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#94A3B8' }}>Add MySQL binary path to your environment profile:</p>
                      <div className="code-block-container">
                        <button className="copy-btn" onClick={() => handleCopy('export PATH="/usr/local/mysql/bin:$PATH"')}>
                          {copiedText === 'export PATH="/usr/local/mysql/bin:$PATH"' ? 'Copied ✓' : 'Copy'}
                        </button>
                        export PATH="/usr/local/mysql/bin:$PATH"
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>Save it inside <code>~/.zshrc</code>, run <code>source ~/.zshrc</code> and retry.</p>
                    </div>

                    <div className="error-item">
                      <h4 className="error-title">2. Access denied for user 'root'@'localhost'</h4>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#94A3B8' }}>First, attempt opening console mode with zero credentials:</p>
                      <div className="code-block-container">
                        mysql -u root
                      </div>
                      <p style={{ margin: '8px 0', fontSize: '0.85rem', color: '#94A3B8' }}>If successfully inside, force-set the root credential to something else:</p>
                      <div className="code-block-container">
                        ALTER USER 'root'@'localhost' IDENTIFIED BY 'yourpassword';<br/>
                        FLUSH PRIVILEGES;
                      </div>
                    </div>

                    <div className="error-item">
                      <h4 className="error-title">3. Can't connect to local MySQL server (not running)</h4>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#94A3B8' }}>Ensure your daemon process is started locally:</p>
                      <div className="code-block-container" style={{ fontSize: '0.85rem' }}>
                        <span className="cmt"># Mac</span><br/>
                        brew services start mysql<br/><br/>
                        <span className="cmt"># Windows (cmd/powershell admin)</span><br/>
                        net start MySQL80<br/><br/>
                        <span className="cmt"># Linux</span><br/>
                        sudo systemctl start mysql
                      </div>
                    </div>

                    <div className="error-item">
                      <h4 className="error-title">4. Port 3306 already in use</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
                        Another database process is already listening to MySQL's default port.
                        This is actually fine-MySQL is already running on your laptop. You can safely skip to Step 2.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedOS !== '' && (
              <label className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={checkedStep1}
                  onChange={(e) => handleCheckStep1(e.target.checked)}
                />
                <span>✅ MySQL is installed on my laptop</span>
              </label>
            )}
          </div>

          {/* STEP 2 */}
          <div className={`step-card ${activeStep === 2 ? 'active' : checkedStep2 ? 'complete' : 'future'}`}>
            <span className="step-num-tag">Step 2 of 4</span>
            <h2 className="step-title">Verify MySQL works 🔍</h2>
            <p style={{ color: '#94A3B8', marginTop: 0 }}>Open a new Terminal session (VS Code terminal is perfect) and login using the root username:</p>

            <div className="code-block-container">
              <button className="copy-btn" onClick={() => handleCopy('mysql -u root -p')}>
                {copiedText === 'mysql -u root -p' ? 'Copied ✓' : 'Copy'}
              </button>
              mysql -u root -p
            </div>

            <p style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>
              When requested for password <code>Enter password:</code>, type your root password.
              Note that characters will <b>NOT</b> print as you type them. This is standard terminal protection. Simply keep typing and press Enter.
            </p>

            <h4 style={{ margin: '20px 0 8px', color: '#38BDF8' }}>What you should see:</h4>
            <div className="terminal-mock">
              <div className="terminal-header">
                <div className="term-dot term-red"></div>
                <div className="term-dot term-yel"></div>
                <div className="term-dot term-grn"></div>
                <span className="term-title">terminal - mysql</span>
              </div>
              <div className="terminal-body">
                $ mysql -u root -p<br/>
                Enter password: ****<br/><br/>
                Welcome to the MySQL monitor. Commands end with ; or \g.<br/>
                Your MySQL connection id is 8<br/>
                Server version: 9.0.0 MySQL Community Server - GPL<br/><br/>
                mysql&gt;<span className="term-cursor"></span>
              </div>
            </div>

            <div className="info-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeftColor: '#10B981' }}>
              <p style={{ color: '#10B981', fontWeight: 700, margin: 0 }}>
                💡 <code>mysql&gt;</code> prompt shows MySQL is running and waiting for SQL statements!
              </p>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>To log out and close the MySQL connection, type:</p>
            <div className="code-block-container">
              <button className="copy-btn" onClick={() => handleCopy('exit')}>
                {copiedText === 'exit' ? 'Copied ✓' : 'Copy'}
              </button>
              exit
            </div>

            {/* Step 2 common errors */}
            <div className="info-card" style={{ borderLeftColor: '#F87171', background: 'rgba(248, 113, 113, 0.05)' }}>
              <h5 style={{ margin: '0 0 6px 0', color: '#F87171', fontWeight: 700 }}>Connection Errors:</h5>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                <li><b>ERROR 1045 (28000): Access denied:</b> Wrong password. Try logging in again. Ensure Caps Lock is off.</li>
                <li><b>ERROR 2002: Can't connect:</b> MySQL is not running. Launch it using start commands shown in Step 1.</li>
              </ul>
            </div>

            {checkedStep1 && (
              <label className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={checkedStep2}
                  onChange={(e) => handleCheckStep2(e.target.checked)}
                />
                <span>✅ I see the mysql&gt; prompt</span>
              </label>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`step-card ${activeStep === 3 ? 'active' : checkedStep3 ? 'complete' : 'future'}`}>
            <span className="step-num-tag">Step 3 of 4</span>
            <h2 className="step-title">Create your project database 📁</h2>
            <p style={{ color: '#94A3B8', marginTop: 0 }}>Select your project domain to generate custom creation code:</p>

            <div className="domain-pills">
              <button className={`domain-btn ${selectedDomain === 'Gym' ? 'selected' : ''}`} onClick={() => { setSelectedDomain('Gym'); playSound('tick'); }}>🏋️ Gym</button>
              <button className={`domain-btn ${selectedDomain === 'Mess' ? 'selected' : ''}`} onClick={() => { setSelectedDomain('Mess'); playSound('tick'); }}>🍱 Mess</button>
              <button className={`domain-btn ${selectedDomain === 'Hotel' ? 'selected' : ''}`} onClick={() => { setSelectedDomain('Hotel'); playSound('tick'); }}>🏨 Hotel</button>
              <button className={`domain-btn ${selectedDomain === 'Chai' ? 'selected' : ''}`} onClick={() => { setSelectedDomain('Chai'); playSound('tick'); }}>☕ Chai</button>
              <button className={`domain-btn ${selectedDomain === 'Other' ? 'selected' : ''}`} onClick={() => { setSelectedDomain('Other'); playSound('tick'); }}>🏪 Other</button>
            </div>

            {selectedDomain === 'Other' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>Custom App Name:</label>
                <input
                  type="text"
                  className="reflection-box"
                  style={{ height: '42px', marginTop: '6px' }}
                  placeholder="myapp"
                  value={customDomainName}
                  onChange={(e) => setCustomDomainName(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>* lowercase, no spaces</span>
              </div>
            )}

            <div className="info-card">
              <p style={{ margin: 0 }}>
                Target Database Name: <strong style={{ color: '#38BDF8' }}>{dbName}</strong>
              </p>
            </div>

            <p style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>
              Connect back into your database command console: <code>mysql -u root -p</code>. Then execute these three statements sequentially:
            </p>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>1. Create Database schema</span>
              <div className="code-block-container">
                <button className="copy-btn" onClick={() => handleCopy(`CREATE DATABASE ${dbName};`)}>
                  {copiedText === `CREATE DATABASE ${dbName};` ? 'Copied ✓' : 'Copy'}
                </button>
                <span className="kw">CREATE DATABASE</span> <span className="db-val">{dbName}</span><span className="punc">;</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
                💡 Note: Semicolon <code>;</code> is mandatory to execute commands in SQL.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>2. Show available databases</span>
              <div className="code-block-container">
                <button className="copy-btn" onClick={() => handleCopy('SHOW DATABASES;')}>
                  {copiedText === 'SHOW DATABASES;' ? 'Copied ✓' : 'Copy'}
                </button>
                <span className="kw">SHOW DATABASES</span><span className="punc">;</span>
              </div>
              <p style={{ margin: '4px 0 8px', fontSize: '0.82rem', color: '#94A3B8' }}>Expected output table containing your database name:</p>
              <div className="terminal-mock" style={{ minHeight: 'auto', margin: 0 }}>
                <div className="terminal-body" style={{ minHeight: 'auto', padding: '10px 14px' }}>
                  mysql&gt; SHOW DATABASES;<br/>
                  +--------------------+<br/>
                  | Database           |<br/>
                  +--------------------+<br/>
                  | <span style={{ color: '#10B981', fontWeight: 800 }}>{dbName}</span>             |<br/>
                  | information_schema |<br/>
                  | mysql              |<br/>
                  | performance_schema |<br/>
                  | sys                |<br/>
                  +--------------------+
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>3. Target current database namespace</span>
              <div className="code-block-container">
                <button className="copy-btn" onClick={() => handleCopy(`USE ${dbName};`)}>
                  {copiedText === `USE ${dbName};` ? 'Copied ✓' : 'Copy'}
                </button>
                <span className="kw">USE</span> <span className="db-val">{dbName}</span><span className="punc">;</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>Expected database log: <i>Database changed</i>.</p>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Leave the MySQL console:</p>
            <div className="code-block-container">
              <button className="copy-btn" onClick={() => handleCopy('exit')}>
                {copiedText === 'exit' ? 'Copied ✓' : 'Copy'}
              </button>
              exit
            </div>

            <div className="warning-card" style={{ background: 'rgba(30, 41, 59, 0.4)', borderColor: '#334155' }}>
              <div className="warning-icon">ℹ️</div>
              <div className="warning-text">
                <h4 style={{ color: '#F1F5F9' }}>Empty database status</h4>
                <p style={{ color: '#94A3B8' }}>
                  Your database is empty right now. There are no tables inside. This is correct.
                  Spring Boot + JPA will create tables automatically during connection in 2.3.3.
                  You never create tables manually.
                </p>
              </div>
            </div>

            {checkedStep2 && (
              <label className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={checkedStep3}
                  onChange={(e) => handleCheckStep3(e.target.checked)}
                />
                <span>✅ My [{dbName}] database exists in MySQL</span>
              </label>
            )}
          </div>

          {/* STEP 4 & COMPLETED LAB REVEALS */}
          {checkedStep3 && (
            <div className={`step-card active`}>
              <span className="step-num-tag">Completion</span>
              <h2 className="step-title">Database Creation Summary</h2>

              <div className="info-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderLeftColor: '#10B981' }}>
                <h4 style={{ color: '#10B981', margin: '0 0 8px 0' }}>What you just set up:</h4>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <li>✅ MySQL listening on local port <b>3306</b></li>
                  <li>✅ Secure root password set</li>
                  <li>✅ <b>{dbName}</b> database schema created</li>
                </ul>
              </div>

              <div style={{ background: '#78350F', border: '1px solid #D97706', borderRadius: '12px', padding: '16px', margin: '20px 0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#FCD34D' }}>🛠️ Concept Definitions</h4>
                {revealIndex >= 1 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>MySQL:</b> a program that stores your app's data permanently - even after you close your laptop.</span>
                  </div>
                )}
                {revealIndex >= 2 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>Port 3306:</b> the "door" other programs (like Spring Boot) knock on to talk to MySQL.</span>
                  </div>
                )}
                {revealIndex >= 3 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>Root password:</b> the master key to your MySQL - Spring Boot needs it to log in on your behalf.</span>
                  </div>
                )}
                {revealIndex >= 4 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>CREATE DATABASE:</b> makes a new, empty folder for your app's tables to live in later.</span>
                  </div>
                )}
                {revealIndex >= 5 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>SHOW DATABASES:</b> lists every database MySQL currently knows about, so you can confirm yours is there.</span>
                  </div>
                )}
                {revealIndex >= 6 && (
                  <div className="reveal-row">
                    <span className="reveal-tick">✓</span>
                    <span><b>USE [db]:</b> tells MySQL "everything I type next applies to this database."</span>
                  </div>
                )}
              </div>

              <p style={{ textAlign: 'center', fontWeight: '800', margin: '24px 0', color: '#38BDF8' }}>
                MySQL is running on your laptop. Your database is waiting. Next step: configure connection inside Spring Boot application.properties. That is 2.3.3.
              </p>

              {/* Quiz understanding check */}
              <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '8px', margin: '32px 0 16px' }}>Understanding Check</h3>

              <div className="q-card">
                <p className="q-title">Q1: What port does MySQL listen on?</p>
                <div className="opt-list">
                  <button className={`opt-btn ${q1Answer === 'A' ? 'wrong' : ''}`} onClick={() => handleQ1('A')}>A) 8080 (Spring Boot server port)</button>
                  <button className={`opt-btn ${q1Answer === 'B' ? 'correct' : ''}`} onClick={() => handleQ1('B')}>B) 3306 (MySQL default port)</button>
                  <button className={`opt-btn ${q1Answer === 'C' ? 'wrong' : ''}`} onClick={() => handleQ1('C')}>C) 443 (HTTPS secure Web port)</button>
                  <button className={`opt-btn ${q1Answer === 'D' ? 'wrong' : ''}`} onClick={() => handleQ1('D')}>D) 5432 (PostgreSQL default port)</button>
                </div>
                {q1Answer !== null && q1Answer !== 'B' && (
                  <p style={{ color: '#F87171', fontSize: '0.85rem', marginTop: 10 }}>❌ 8080 is Spring Boot's port. MySQL uses 3306.</p>
                )}
              </div>

              <div className="q-card">
                <p className="q-title">Q2: What does the command CREATE DATABASE accomplish?</p>
                <div className="opt-list">
                  <button className={`opt-btn ${q2Answer === 'A' ? 'wrong' : ''}`} onClick={() => handleQ2('A')}>A) Creates an SQL data table</button>
                  <button className={`opt-btn ${q2Answer === 'B' ? 'wrong' : ''}`} onClick={() => handleQ2('B')}>B) Downloads and configures local engine</button>
                  <button className={`opt-btn ${q2Answer === 'C' ? 'correct' : ''}`} onClick={() => handleQ2('C')}>C) Creates an empty database that will hold tables</button>
                  <button className={`opt-btn ${q2Answer === 'D' ? 'wrong' : ''}`} onClick={() => handleQ2('D')}>D) Bridges communication between Spring and MySQL</button>
                </div>
              </div>

              <div className="q-card">
                <p className="q-title">Q3: Your database is empty right now. What creates the tables inside it?</p>
                <div className="opt-list">
                  <button className={`opt-btn ${q3Answer === 'A' ? 'wrong' : ''}`} onClick={() => handleQ3('A')}>A) You write SQL CREATE TABLE scripts manually</button>
                  <button className={`opt-btn ${q3Answer === 'B' ? 'correct' : ''}`} onClick={() => handleQ3('B')}>B) Spring Boot + JPA handles table auto-creation based on your Java Model classes</button>
                  <button className={`opt-btn ${q3Answer === 'C' ? 'wrong' : ''}`} onClick={() => handleQ3('C')}>C) You create them inside VS Code project trees</button>
                  <button className={`opt-btn ${q3Answer === 'D' ? 'wrong' : ''}`} onClick={() => handleQ3('D')}>D) Postman routes create them dynamically on demand</button>
                </div>
              </div>

              {/* Reflection */}
              {allQuestionsCorrect && (
                <div style={{ marginTop: '28px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#F1F5F9' }}>Reflection Check:</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8' }}>
                    In one sentence - what is your MySQL root password for, and why must you remember it?
                  </p>
                  <textarea
                    className="reflection-box"
                    placeholder="The root password is the master key to my MySQL database. I must remember it because Spring Boot needs it to connect..."
                    value={reflectionText}
                    onPaste={(e) => e.preventDefault()}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: sentencesCount >= 1 ? '#10B981' : '#F87171',
                    display: 'block',
                    textAlign: 'right',
                    marginTop: '6px'
                  }}>
                    {sentencesCount} / 1 sentence minimum
                  </span>
                </div>
              )}

              {/* Submit button */}
              <div style={{ marginTop: '24px' }}>
                <button className="submit-btn" disabled={!canSubmit || submitted} onClick={handleSubmit}>
                  {submitted ? 'MySQL config submitted successfully! ✅' : 'MySQL ready - connect Spring Boot now →'}
                </button>
              </div>

              {/* Submitted message */}
              {submitted && (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1.5px solid #10B981',
                  color: '#CBD5E1',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  animation: 'popIn 0.3s ease'
                }}>
                  <h4 style={{ margin: '0 0 10px', color: '#10B981', fontWeight: 800 }}>MySQL is ready! 🎯</h4>
                  Next:configure one file in your Spring Boot project (<code>application.properties</code>). You tell Spring Boot:<br/>
                  → Where MySQL resides (localhost:3306)<br/>
                  → Which database context to use ({dbName})<br/>
                  → Secret database password (your root password)<br/><br/>
                  Spring Boot will read your Java class annotations, and JPA will auto-create the table dynamically. All CRUD endpoints will instantly persist records permanently. Even if you restart the server, data will survive forever!
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Side progress visual tracker */}
        <section className="split-right-col">
          <div className="milestone-tracker">
            <h3 style={{ margin: '0 0 24px', fontSize: '1.15rem', color: '#F1F5F9', borderBottom: '1.5px solid #334155', paddingBottom: '10px' }}>Setup Progress</h3>

            {/* MILESTONE 1 */}
            <div className="milestone-item">
              <svg className="visual-cylinder" viewBox="0 0 64 64">
                {/* Cylinder base */}
                <path d="M12,46 C12,52 52,52 52,46 L52,18 L12,18 Z" fill={checkedStep1 ? '#1E293B' : 'transparent'} stroke={checkedStep1 ? '#10B981' : '#475569'} strokeWidth="2.5" strokeDasharray={checkedStep1 ? 'none' : '4,4'} />
                {/* Cylinder divisions */}
                {checkedStep1 && (
                  <>
                    <path d="M12,18 C12,24 52,24 52,18 L52,32 C52,38 12,38 12,32 Z" fill="#10B981" opacity="0.3" />
                    <path d="M12,32 C12,38 52,38 52,32 L52,46 C52,52 12,52 12,46 Z" fill="#10B981" opacity="0.6" />
                  </>
                )}
                {/* Cylinder lid */}
                <ellipse cx="32" cy="18" rx="20" ry="6" fill={checkedStep1 ? '#10B981' : 'transparent'} stroke={checkedStep1 ? '#10B981' : '#475569'} strokeWidth="2.5" />
              </svg>
              <div className="milestone-content">
                <div className={`milestone-header ${checkedStep1 ? 'complete' : activeStep === 1 ? 'active' : ''}`}>
                  {checkedStep1 ? 'MySQL is running' : 'Install MySQL'}
                </div>
                <div className="milestone-desc">
                  {checkedStep1 ? 'Listening on port 3306' : 'Waiting for installation'}
                </div>
              </div>
            </div>

            {/* Connecting line 1 */}
            <div className={`milestone-line-vert ${checkedStep1 ? 'filled' : ''}`}></div>

            {/* MILESTONE 2 */}
            <div className="milestone-item">
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '8px', border: `2.5px ${checkedStep2 ? 'solid #10B981' : 'dashed #475569'}`,
                background: checkedStep2 ? '#090D16' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem',
                color: checkedStep2 ? '#10B981' : '#475569'
              }}>
                {checkedStep2 ? 'mysql>' : '>_'}
              </div>
              <div className="milestone-content">
                <div className={`milestone-header ${checkedStep2 ? 'complete' : activeStep === 2 ? 'active' : ''}`}>
                  {checkedStep2 ? "You're logged in" : 'Log in as root'}
                </div>
                <div className="milestone-desc">
                  {checkedStep2 ? 'MySQL console is open and ready' : 'Waiting for you to verify the mysql> prompt'}
                </div>
              </div>
            </div>

            {/* Connecting line 2 */}
            <div className={`milestone-line-vert ${checkedStep2 ? 'filled' : ''}`}></div>

            {/* MILESTONE 3 */}
            <div className="milestone-item">
              <svg className="visual-cylinder" viewBox="0 0 64 64">
                <path d="M12,46 C12,52 52,52 52,46 L52,18 L12,18 Z" fill={checkedStep3 ? '#10B981' : 'transparent'} opacity={checkedStep3 ? '0.3' : '1'} stroke={checkedStep3 ? '#10B981' : '#475569'} strokeWidth="2.5" strokeDasharray={checkedStep3 ? 'none' : '4,4'} />
                <ellipse cx="32" cy="18" rx="20" ry="6" fill={checkedStep3 ? '#10B981' : 'transparent'} stroke={checkedStep3 ? '#10B981' : '#475569'} strokeWidth="2.5" />
                {checkedStep3 && (
                  <text x="32" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="monospace">
                    {dbName}
                  </text>
                )}
              </svg>
              <div className="milestone-content">
                <div className={`milestone-header ${checkedStep3 ? 'complete' : activeStep === 3 ? 'active' : ''}`}>
                  {checkedStep3 ? 'Your database exists' : 'Create your database'}
                </div>
                <div className="milestone-desc">
                  {checkedStep3 ? `[${dbName}] is created and empty - ready for tables` : 'Waiting for CREATE DATABASE'}
                </div>
              </div>
            </div>

            {/* Connection properties box */}
            {checkedStep3 && (
              <div className="prop-box" style={{ animation: 'popIn 0.3s ease' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 800 }}>Spring Connection properties</span>
                <span style={{ color: '#F1F5F9' }}>spring.datasource.url</span>=jdbc:mysql://localhost:3306/{dbName}<br/>
                <span style={{ color: '#F1F5F9' }}>spring.datasource.username</span>=root<br/>
                <span style={{ color: '#F1F5F9' }}>spring.datasource.password</span>=<span style={{ color: '#A855F7', background: 'rgba(168, 85, 247, 0.1)', padding: '0 4px', borderRadius: '4px' }}>[your password]</span><br/><br/>
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>Ready for configuration in 2.3.3! 🚀</span>
              </div>
            )}

            {/* Visual quiz effects */}
            {checkedStep3 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '16px', fontSize: '0.85rem' }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>What you now know</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: q1Answer === 'B' ? '#10B981' : '#64748B', fontWeight: 700 }}>
                    <span>MySQL's door:</span>
                    <span style={{ textShadow: q1Answer === 'B' ? '0 0 10px #10B981' : 'none' }}>{q1Answer === 'B' ? 'Port 3306 🔑' : '?'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: q2Answer === 'C' ? '#10B981' : '#64748B', fontWeight: 700 }}>
                    <span>Your database:</span>
                    <span>{q2Answer === 'C' ? 'Empty - tables come in 2.3.3' : '?'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: q3Answer === 'B' ? '#10B981' : '#64748B', fontWeight: 700 }}>
                    <span>Who builds the tables:</span>
                    <span>{q3Answer === 'B' ? `${modelClassName} → JPA 🚀` : '?'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
