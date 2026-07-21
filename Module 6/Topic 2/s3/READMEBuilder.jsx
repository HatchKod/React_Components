import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;700&display=swap');

  .rb-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px 60px; color: #1E293B; line-height: 1.5; }
  .rb-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .mute-btn { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .mute-btn:hover { border-color: #94A3B8; }

  .progress-strip { display: flex; align-items: center; justify-content: center; gap: 4px; max-width: 1280px; margin: 0 auto 24px; flex-wrap: wrap; }
  .p-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
  .p-pill.done { background: rgba(124,58,237,0.12); color: #7C3AED; }
  .p-pill.active { background: #7C3AED; color: #fff; }
  .p-line { width: 14px; height: 2px; background: #E2E8F0; }
  .p-line.done { background: #7C3AED; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1280px; margin: 0 auto; }
  .layout > .right-col { align-self: stretch; }
  @media(max-width:960px) { .layout { grid-template-columns: 1fr; } .layout > .right-col { align-self: auto; } }

  .card { background: #fff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); padding: 22px; margin-bottom: 20px; }
  .sticky-panel { position: sticky; top: 24px; }
  @media(max-width:960px) { .sticky-panel { position: static; } }

  .amber-card { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #78350F; font-size: 0.88rem; line-height: 1.75; white-space: pre-wrap; }
  .warn-msg { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 8px; padding: 10px 14px; color: #92400E; font-size: 0.8rem; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
  .warn-msg button { background: #B45309; color: #fff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 0.76rem; font-weight: 700; cursor: pointer; }
  .green-card { background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #14532D; font-size: 0.88rem; line-height: 1.75; }
  .blue-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 16px 18px; margin: 12px 0; color: #1E40AF; font-size: 0.88rem; line-height: 1.75; }

  /* poster vs certificate */
  .poster-compare { display: flex; gap: 12px; margin: 14px 0; flex-wrap: wrap; }
  .poster-col { flex: 1; min-width: 140px; border-radius: 10px; padding: 16px; text-align: center; }
  .cert-col { background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #64748B; }
  .cert-col .cert-line { font-family: 'Fira Code', monospace; font-size: 0.68rem; margin-top: 6px; text-align: left; }
  .poster-col2 { background: linear-gradient(160deg, #1E1B4B, #4C1D95); color: #fff; box-shadow: 0 8px 20px rgba(76,29,149,0.3); }
  .poster-col2 .poster-title { font-size: 1.1rem; font-weight: 900; margin-top: 10px; letter-spacing: 0.02em; }
  .poster-col2 .poster-tag { font-size: 0.7rem; margin-top: 6px; opacity: 0.85; font-style: italic; }
  .poster-question { text-align: center; font-weight: 800; color: #7C3AED; font-size: 0.9rem; margin-top: 8px; }

  /* markdown mini-editor blocks */
  .md-element { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 16px; margin: 14px 0; background: #FAFAFA; }
  .md-element-num { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.78rem; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
  .md-src-row { display: flex; align-items: center; gap: 8px; font-family: 'Fira Code', monospace; font-size: 0.82rem; }
  .md-src-static { color: #475569; background: #F1F5F9; border-radius: 6px; padding: 6px 10px; }
  .md-blank-input { width: 52px; text-align: center; border: 1.5px solid #C4B5FD; border-radius: 6px; padding: 6px 4px; font-family: 'Fira Code', monospace; font-weight: 700; font-size: 0.9rem; }
  .md-blank-input.correct { border-color: #16A34A; background: #F0FDF4; color: #16A34A; }
  .md-check-btn { background: #7C3AED; color: #fff; border: none; border-radius: 6px; padding: 6px 14px; font-weight: 700; font-size: 0.78rem; cursor: pointer; }
  .md-arrow { color: #C4B5FD; }
  .md-rendered-preview { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; }

  /* markdown editor / live preview */
  .md-editor-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 10px; overflow: hidden; border: 1.5px solid #334155; margin: 14px 0; }
  @media(max-width: 700px) { .md-editor-wrap { grid-template-columns: 1fr; } }
  .md-editor-pane { background: #1E293B; }
  .md-editor-label { background: #0F172A; color: #94A3B8; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 12px; }
  .md-editor-textarea { width: 100%; min-height: 340px; background: #1E293B; color: #E2E8F0; border: none; padding: 14px; font-family: 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.7; resize: vertical; outline: none; }
  .md-preview-pane { background: #fff; }
  .md-preview-label { background: #F8FAFC; color: #64748B; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid #E2E8F0; }
  .md-preview-body { padding: 16px; min-height: 340px; max-height: 500px; overflow-y: auto; font-size: 0.86rem; line-height: 1.7; }
  .md-preview-body h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
  .md-preview-body h2 { font-size: 1.15rem; font-weight: 800; margin: 18px 0 8px; }
  .md-preview-body p { margin: 8px 0; }
  .md-preview-body code { background: #F1F5F9; color: #16A34A; border-radius: 4px; padding: 2px 6px; font-family: 'Fira Code', monospace; font-size: 0.82em; }
  .md-preview-body pre { background: #0F172A; color: #E2E8F0; border-radius: 8px; padding: 12px 14px; overflow-x: auto; font-family: 'Fira Code', monospace; font-size: 0.78rem; }
  .md-preview-body ul { margin: 8px 0; padding-left: 22px; }
  .md-preview-body li { margin: 4px 0; }
  .md-preview-body a { color: #2563EB; text-decoration: underline; }
  .md-preview-body img { max-width: 100%; border-radius: 6px; margin: 8px 0; display: block; }
  .md-preview-body b { font-weight: 800; }
  .md-preview-body .img-placeholder { display: flex; align-items: center; justify-content: center; height: 90px; background: #F1F5F9; border: 1.5px dashed #CBD5E1; border-radius: 6px; color: #94A3B8; font-size: 0.72rem; margin: 8px 0; }

  /* fill-in inputs */
  .fill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  @media(max-width:700px) { .fill-grid { grid-template-columns: 1fr; } }
  .fill-field { display: flex; flex-direction: column; gap: 4px; }
  .fill-field.full { grid-column: 1 / -1; }
  .fill-label { font-size: 0.76rem; font-weight: 700; color: #475569; }
  .fill-input { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; font-size: 0.84rem; font-family: inherit; }
  .fill-input:focus { border-color: #7C3AED; outline: none; }
  .fill-textarea { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; font-size: 0.84rem; font-family: inherit; resize: vertical; min-height: 60px; }
  .fill-input.lit, .fill-textarea.lit { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }

  /* shortcuts */
  .shortcut-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 12px; margin: 14px 0; }
  .shortcut-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; }
  .shortcut-os { font-weight: 800; font-size: 0.8rem; margin-bottom: 8px; }
  .key-row { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
  .key-cap { background: #1E293B; color: #E2E8F0; border-radius: 5px; padding: 4px 8px; font-family: 'Fira Code', monospace; font-size: 0.72rem; font-weight: 700; box-shadow: 0 2px 0 #0F172A; }
  .shortcut-step { font-size: 0.74rem; color: #64748B; margin-top: 2px; }

  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; font-weight: 700; font-size: 0.88rem; color: #1E293B; }
  .checkbox-row.checked { background: #F5F3FF; color: #6D28D9; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

  .btn { background: #7C3AED; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
  .btn:disabled { background: #CBD5E1; cursor: not-allowed; }

  .domain-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .domain-btn { padding: 10px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: #fff; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  .domain-btn.selected { background: #7C3AED; border-color: #7C3AED; color: #fff; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; margin-top: 10px; padding: 10px 14px; border-radius: 8px; background: #F8FAFC; cursor: pointer; }
  .task-item.checked { background: #F5F3FF; }
  .task-item input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }

  .reflection-box { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; }
  .reflection-box:focus { border-color: #7C3AED; }
  .word-count { text-align: right; font-size: 0.8rem; color: #94A3B8; margin-top: 6px; font-weight: 600; }
  .word-count.ok { color: #16A34A; }

  .reveal-strip { max-width: 1280px; margin: 24px auto 0; background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px; }
  .reveal-line-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #1E293B; animation: fadeInUp 0.4s ease; }
  .reveal-line-item b { color: #92400E; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RIGHT STAGE ── */
  .stage-card { background: #fff; border-radius: 16px; padding: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); min-height: 460px; overflow: hidden; }
  .stage-label { font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; padding: 16px 20px 0; }

  .gh-mockup { padding: 0 0 16px; }
  .gh-topbar { background: #F6F8FA; border-bottom: 1px solid #D0D7DE; padding: 10px 16px; display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .gh-dot { width: 8px; height: 8px; border-radius: 50%; background: #D0D7DE; }
  .gh-repo-name { font-size: 0.78rem; font-weight: 700; color: #57606A; font-family: 'Fira Code', monospace; }
  .gh-filelist { padding: 10px 16px; border-bottom: 1px solid #D0D7DE; }
  .gh-file-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 0.74rem; color: #57606A; font-family: 'Fira Code', monospace; }
  .gh-readme-render { padding: 16px 20px; font-size: 0.8rem; max-height: 380px; overflow-y: auto; }

  .keyboard-visual { display: flex; justify-content: center; margin: 10px 0; }
  .kb-key { background: #334155; color: #E2E8F0; border-radius: 6px; padding: 8px 12px; margin: 0 3px; font-family: 'Fira Code', monospace; font-size: 0.72rem; font-weight: 700; box-shadow: 0 3px 0 #1E293B; }

  .screenshot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 20px 16px; }
  .screenshot-placeholder { background: linear-gradient(135deg,#F1F5F9,#E2E8F0); border: 1.5px dashed #94A3B8; border-radius: 8px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 0.66rem; font-weight: 700; color: #64748B; text-align: center; padding: 4px; transition: all 0.3s; }
  .screenshot-placeholder.filled { background: linear-gradient(135deg,#F0FDF4,#DCFCE7); border-style: solid; border-color: #86EFAC; color: #16A34A; }
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

// ── Minimal Markdown renderer — exactly 6 elements: heading, bold, code, bullets, links, images ──
function renderMarkdown(src) {
  if (!src) return null;
  const lines = src.split('\n');
  const blocks = [];
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length) {
      blocks.push(<ul key={`ul-${blocks.length}`}>{listBuffer.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>);
      listBuffer = [];
    }
  }

  function inline(text) {
    const parts = [];
    let rest = text;
    let key = 0;
    const pattern = /(\!\[[^\]]*\]\([^)]*\))|(\[[^\]]*\]\([^)]*\))|(\*\*[^*]+\*\*)|(`[^`]+`)/;
    while (rest.length) {
      const m = rest.match(pattern);
      if (!m) { parts.push(rest); break; }
      const idx = m.index;
      if (idx > 0) parts.push(rest.slice(0, idx));
      const token = m[0];
      if (token.startsWith('![')) {
        const alt = token.match(/!\[([^\]]*)\]/)[1];
        parts.push(<span key={key++} className="img-placeholder">🖼 {alt || 'image'}</span>);
      } else if (token.startsWith('[')) {
        const label = token.match(/\[([^\]]*)\]/)[1];
        parts.push(<a key={key++} href="#" onClick={e => e.preventDefault()}>{label}</a>);
      } else if (token.startsWith('**')) {
        parts.push(<b key={key++}>{token.slice(2, -2)}</b>);
      } else if (token.startsWith('`')) {
        parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
      }
      rest = rest.slice(idx + token.length);
    }
    return parts;
  }

  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(<pre key={`code-${i}`}>{codeBuffer.join('\n')}</pre>);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }
    if (inCodeBlock) { codeBuffer.push(line); return; }

    if (/^#\s+/.test(line)) {
      flushList();
      blocks.push(<h1 key={`h-${i}`}>{line.replace(/^#\s+/, '')}</h1>);
    } else if (/^##\s+/.test(line)) {
      flushList();
      blocks.push(<h2 key={`h2-${i}`}>{line.replace(/^##\s+/, '')}</h2>);
    } else if (/^-\s+/.test(line)) {
      listBuffer.push(line.replace(/^-\s+/, ''));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={`p-${i}`}>{inline(line)}</p>);
    }
  });
  flushList();
  return blocks;
}

const DOMAIN_DATA = {
  Gym: { name: 'SaiFit Gym Manager', problem: 'The gym owner near my college tracked every member on paper registers — attendance, fees, and workout notes all scattered across notebooks.', features: ['Add and manage gym members', 'Track membership and fees', 'View member workout history'] },
  Hotel: { name: 'StayEasy Hotel Manager', problem: 'The small hotel owner near my college managed bookings and guest details in a physical diary, leading to double-bookings and lost records.', features: ['Manage room bookings', 'Track guest check-in and check-out', 'View booking history'] },
  Mess: { name: 'TiffinTrack Mess Manager', problem: 'The mess owner near my college tracked meal subscriptions and payments on paper, making it hard to know who paid and who missed meals.', features: ['Manage mess subscriptions', 'Track daily meal attendance', 'View payment history'] },
  Chai: { name: 'ChaiPoint Stall Manager', problem: 'The chai stall owner near my college kept customer credit (udhaar) in a notebook, often losing track of who owed what.', features: ['Manage customer credit accounts', 'Track daily sales', 'View customer order history'] },
};

function buildBackendTemplate(f) {
  const domain = f.domainName || '[Domain] Manager';
  const url = f.liveUrl || '(your live URL)';
  const problem = f.problem || '[2-3 sentences about the manual problem the owner had]';
  const feat1 = f.feature1 || '[Feature 1]';
  const feat2 = f.feature2 || '[Feature 2]';
  const feat3 = f.feature3 || '[Feature 3]';
  const name = f.yourName || '[Name]';
  const github = f.githubUrl || '(github link)';
  return `# ${domain}
A full-stack web app that helps a real business owner manage their work — built during HatchKod FNDI.

## 🔗 Live App
[Live App Link](${url})

## The Problem I Solved
${problem}

## What I Built
A web app that lets the owner:
- ${feat1}
- ${feat2}
- ${feat3}
- Get AI-powered suggestions

## Tech Stack
**Backend:** \`Spring Boot\`, \`Java\`
**Database:** \`MySQL\`
**Frontend:** \`React\`

## Features
- 🔐 Secure login with JWT
- 👥 Full management dashboard
- 🤖 AI suggestions via Google Gemini
- 📱 Mobile-friendly
- ☁️ Live on the internet

## Screenshots
![Login Screen](login.png)
![Members List](list.png)
![AI Feature](ai.png)

## How to Run Locally
**Backend**
\`\`\`
./mvnw spring-boot:run
\`\`\`
**Frontend**
\`\`\`
npm install && npm start
\`\`\`

## About This Project
Built during the HatchKod FNDI Program — an 8-week intensive where I found a real problem in my neighbourhood and built a full stack solution for it.

The business owner near my college is my client. I interviewed them in Week 1 and delivered a working app by Week 6.

Built by ${name} | [GitHub](${github})
`;
}

function buildFrontendTemplate(f) {
  const domain = f.domainName || '[Domain] Manager';
  const frontendUrl = f.frontendUrl || '(frontend URL)';
  const backendUrl = f.backendRepoUrl || '(backend repo URL)';
  return `# ${domain} — Frontend
React frontend for ${domain}.

## 🔗 Live App
[${domain}](${frontendUrl})

## Backend
[View Backend Repository](${backendUrl})

## Tech Stack
React, JavaScript, CSS

## How to Run
\`\`\`
npm install
npm start
\`\`\`
Requires backend running. See backend README for setup.
`;
}

const STEPS = ['Markdown Basics', 'Backend README', 'Screenshots', 'Frontend README'];

export default function READMEBuilder() {
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

  // ── STEP 1: Markdown basics ──
  const [hashBlank, setHashBlank] = useState('');
  const [hashCorrect, setHashCorrect] = useState(false);
  const [elementsSeen, setElementsSeen] = useState({ el1: false, el2: false, el3: false, el4: false, el5: false, el6: false });
  function checkHash() {
    if (hashBlank.trim() === '#') { setHashCorrect(true); play('add'); setElementsSeen(s => ({ ...s, el1: true })); }
    else play('warn');
  }
  function markSeen(key) {
    setElementsSeen(s => { if (s[key]) return s; play('tick'); return { ...s, [key]: true }; });
  }
  const allElementsSeen = Object.values(elementsSeen).every(Boolean);

  function goToStep2() { play('tick'); setStep(2); }

  // ── STEP 2: Backend README ──
  const [domainName, setDomainName] = useState('SaiFit Gym Manager');
  const [liveUrl, setLiveUrl] = useState('');
  const [problem, setProblem] = useState('');
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');
  const [yourName, setYourName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const backendFields = { domainName, liveUrl, problem, feature1, feature2, feature3, yourName, githubUrl };
  const backendMd = useMemo(() => buildBackendTemplate(backendFields), [domainName, liveUrl, problem, feature1, feature2, feature3, yourName, githubUrl]);
  const [backendMdEdited, setBackendMdEdited] = useState(null);
  const backendMdSource = backendMdEdited !== null ? backendMdEdited : backendMd;

  const [step2Done, setStep2Done] = useState(false);
  function toggleStep2() {
    if (!step2Done) { play('add'); setTimeout(() => setStep(3), 400); }
    setStep2Done(d => !d);
  }

  function goToStep3() { play('tick'); setStep(3); }

  // ── STEP 3: Screenshots ──
  const [shotsTaken, setShotsTaken] = useState(false);
  const [shotsFolder, setShotsFolder] = useState(false);
  const [shotsCommitted, setShotsCommitted] = useState(false);
  const [shotsShowInPreview, setShotsShowInPreview] = useState(false);
  const shots = { shotsTaken, shotsFolder, shotsCommitted, shotsShowInPreview };
  const shotSetters = { shotsTaken: setShotsTaken, shotsFolder: setShotsFolder, shotsCommitted: setShotsCommitted, shotsShowInPreview: setShotsShowInPreview };
  function toggleShot(key) {
    shotSetters[key](v => { const nv = !v; if (nv) play('tick'); return nv; });
  }
  const allShotsDone = shotsTaken && shotsFolder && shotsCommitted && shotsShowInPreview;
  const shotsFiredRef = useRef(false);
  useEffect(() => { if (allShotsDone && !shotsFiredRef.current) { shotsFiredRef.current = true; play('correct'); } }, [allShotsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToStep4() { play('tick'); setStep(4); }

  // ── STEP 4: Frontend README ──
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendRepoUrl, setBackendRepoUrl] = useState('');
  const frontendFields = { domainName, frontendUrl, backendRepoUrl };
  const frontendMd = useMemo(() => buildFrontendTemplate(frontendFields), [domainName, frontendUrl, backendRepoUrl]);

  const [finalChecks, setFinalChecks] = useState({ backendComplete: false, frontendComplete: false, bothCommitted: false, ghShowsReadme: false });
  function toggleFinal(key) {
    setFinalChecks(f => { const nv = { ...f, [key]: !f[key] }; if (nv[key]) play('tick'); return nv; });
  }
  const allFinalDone = Object.values(finalChecks).every(Boolean);
  const finalFiredRef = useRef(false);
  useEffect(() => { if (allFinalDone && !finalFiredRef.current) { finalFiredRef.current = true; play('correct'); } }, [allFinalDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [revealCount, setRevealCount] = useState(0);
  function revealPhase1Complete() {
    play('reveal');
    let c = 0;
    const iv = setInterval(() => { c += 1; setRevealCount(c); play('tick'); if (c >= 5) clearInterval(iv); }, 450);
  }
  const revealFiredRef = useRef(false);
  useEffect(() => {
    if (allFinalDone && !revealFiredRef.current) { revealFiredRef.current = true; setTimeout(revealPhase1Complete, 500); }
  }, [allFinalDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPhase2() { play('tick'); setPhase(2); }

  // ── Phase 2 ──
  const [domain, setDomain] = useState(null);
  const [p2BackendMd, setP2BackendMd] = useState('');
  const [p2FrontendMd, setP2FrontendMd] = useState('');

  function selectDomain(d) {
    play('add');
    setDomain(d);
    const data = DOMAIN_DATA[d];
    const seeded = buildBackendTemplate({
      domainName: data.name, liveUrl, problem: data.problem,
      feature1: data.features[0], feature2: data.features[1], feature3: data.features[2],
      yourName, githubUrl,
    });
    setP2BackendMd(seeded);
    setP2FrontendMd(buildFrontendTemplate({ domainName: data.name, frontendUrl, backendRepoUrl }));
  }

  const [tasks, setTasks] = useState({
    titleDesc: false, urlLinked: false, problemWritten: false, whatBuilt: false, aboutWritten: false, howToRun: false,
    shotsTakenP2: false, shotsCommittedP2: false, shotsShowP2: false,
    frontendShort: false, frontendLinksBackend: false, frontendLinksLive: false,
    backendCommitted: false, frontendCommitted: false,
  });
  function toggleTask(key) {
    setTasks(t => { const nv = { ...t, [key]: !t[key] }; if (nv[key]) play('add'); return nv; });
  }
  const task1Done = tasks.titleDesc && tasks.urlLinked && tasks.problemWritten && tasks.whatBuilt && tasks.aboutWritten && tasks.howToRun;
  const task2Done = tasks.shotsTakenP2 && tasks.shotsCommittedP2 && tasks.shotsShowP2;
  const task3Done = tasks.frontendShort && tasks.frontendLinksBackend && tasks.frontendLinksLive;
  const task4Done = tasks.backendCommitted && tasks.frontendCommitted;

  const [reflection, setReflection] = useState('');
  const sentences = reflection.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = domain && task1Done && task2Done && task3Done && task4Done && sentences >= 1;
  function handleSubmit() { if (!canSubmit) return; play('submit'); setSubmitted(true); }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm6-t2-s3-readme-builder',
        exerciseType: 'interactive',
        status: 'completed', score: 3, maxScore: 3,
        answers: {
          phase1: {
            slot1: { hashBlank },
            slot2: { backendReadmeComplete: step2Done, problemWritten: problem, solutionWritten: `${feature1}, ${feature2}, ${feature3}` },
            slot3: { screenshotsTaken: shotsTaken, screenshotsCommitted: shotsCommitted },
            slot4: { frontendReadmeComplete: finalChecks.frontendComplete, bothCommitted: finalChecks.bothCommitted },
          },
          phase2: {
            domainSelected: domain,
            backendReadmeContent: p2BackendMd,
            frontendReadmeContent: p2FrontendMd,
            screenshotsAdded: task2Done,
            bothReposUpdated: task4Done,
            reflectionText: reflection,
          },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rb-root">
      <style>{STYLE}</style>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>README Builder — Tell Your Story</h1>
        <button className="mute-btn" onClick={toggleMute}>{isMuted ? '🔇 Unmute' : '🔊 Mute'}</button>
      </div>

      {phase === 1 && (
        <>
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
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Six Markdown things — that is all you need</h2>

                  <div className="amber-card">
{`A film certificate:
Runtime: 142 min. Certificate: U/A.
Director: XYZ. Producer: ABC.

A film poster:
"One person. One mission. No time left."
Image. Feeling. Story.

Your README should be the film poster.
Not a list of npm commands.`}
                  </div>

                  <div className="poster-compare">
                    <div className="poster-col cert-col">
                      <div style={{ fontWeight: 800, fontSize: '0.78rem' }}>📄 Film Certificate</div>
                      <div className="cert-line">Runtime: 142 min</div>
                      <div className="cert-line">Certificate: U/A</div>
                      <div className="cert-line">Director: XYZ</div>
                      <div className="cert-line">Producer: ABC</div>
                    </div>
                    <div className="poster-col poster-col2">
                      <div style={{ fontSize: '1.4rem' }}>🎬</div>
                      <div className="poster-title">"One person. One mission."</div>
                      <div className="poster-tag">No time left.</div>
                    </div>
                  </div>
                  <div className="poster-question">Which would make you watch the film?</div>

                  {/* ELEMENT 1: Heading */}
                  <div className="md-element">
                    <div className="md-element-num">1 · Heading</div>
                    {!hashCorrect ? (
                      <>
                        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 8px' }}>In Markdown — a # at the start of a line makes it a heading. Type the symbol:</p>
                        <div className="md-src-row">
                          <input className={`md-blank-input${hashCorrect ? ' correct' : ''}`} placeholder="#" value={hashBlank} onChange={e => setHashBlank(e.target.value)} maxLength={1} />
                          <span className="md-src-static">SaiFit Gym Manager</span>
                          <button className="md-check-btn" onClick={checkHash}>Check</button>
                        </div>
                      </>
                    ) : (
                      <div className="md-src-row">
                        <span className="md-src-static">#&nbsp;SaiFit Gym Manager</span>
                        <span className="md-arrow">→</span>
                        <div className="md-rendered-preview"><h1 style={{ margin: 0, fontSize: '1.1rem' }}>SaiFit Gym Manager</h1></div>
                      </div>
                    )}
                  </div>

                  {/* ELEMENT 2: Bold */}
                  <div className="md-element" onClick={() => markSeen('el2')}>
                    <div className="md-element-num">2 · Bold</div>
                    <div className="md-src-row">
                      <span className="md-src-static">**bold text**</span>
                      <span className="md-arrow">→</span>
                      <div className="md-rendered-preview"><b>bold text</b></div>
                    </div>
                  </div>

                  {/* ELEMENT 3: Code */}
                  <div className="md-element" onClick={() => markSeen('el3')}>
                    <div className="md-element-num">3 · Code</div>
                    <div className="md-src-row">
                      <span className="md-src-static">`code`</span>
                      <span className="md-arrow">→</span>
                      <div className="md-rendered-preview"><code>code</code></div>
                    </div>
                  </div>

                  {/* ELEMENT 4: Bullets */}
                  <div className="md-element" onClick={() => markSeen('el4')}>
                    <div className="md-element-num">4 · Bullets</div>
                    <div className="md-src-row" style={{ alignItems: 'flex-start' }}>
                      <span className="md-src-static">- item one{'\n'}- item two</span>
                      <span className="md-arrow">→</span>
                      <div className="md-rendered-preview"><ul style={{ margin: 0, paddingLeft: 18 }}><li>item one</li><li>item two</li></ul></div>
                    </div>
                  </div>

                  {/* ELEMENT 5: Link */}
                  <div className="md-element" onClick={() => markSeen('el5')}>
                    <div className="md-element-num">5 · Link</div>
                    <div className="md-src-row">
                      <span className="md-src-static">[click here](url)</span>
                      <span className="md-arrow">→</span>
                      <div className="md-rendered-preview"><a href="#" onClick={e => e.preventDefault()}>click here</a></div>
                    </div>
                  </div>

                  {/* ELEMENT 6: Image */}
                  <div className="md-element" onClick={() => markSeen('el6')}>
                    <div className="md-element-num">6 · Image</div>
                    <div className="md-src-row">
                      <span className="md-src-static">![screenshot](img.png)</span>
                      <span className="md-arrow">→</span>
                      <div className="md-rendered-preview" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🖼 <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>rendered image</span></div>
                    </div>
                  </div>

                  <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#7C3AED', marginTop: 16 }}>
                    Six things. That is Markdown. GitHub renders everything else automatically.
                  </p>

                  <button className="btn" style={{ opacity: hashCorrect && allElementsSeen ? 1 : 0.5 }} disabled={!(hashCorrect && allElementsSeen)} onClick={goToStep2}>
                    {hashCorrect && allElementsSeen ? 'Next — write your backend README →' : 'Tap each element above to continue'}
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>The backend README — tell your story</h2>

                  <div className="blue-card">
                    <b>Story order:</b><br />
                    Project title + one line → Live URL (first — most important) → The Problem → What I Built → Tech Stack → Screenshots → Features → How to Run → About This Project
                  </div>

                  <div className="fill-grid">
                    <div className="fill-field">
                      <span className="fill-label">Domain name</span>
                      <input className={`fill-input${focusedField === 'domainName' ? ' lit' : ''}`} value={domainName} onFocus={() => setFocusedField('domainName')} onChange={e => setDomainName(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Live URL</span>
                      <input className={`fill-input${focusedField === 'liveUrl' ? ' lit' : ''}`} placeholder="https://yourapp.up.railway.app" value={liveUrl} onFocus={() => setFocusedField('liveUrl')} onChange={e => setLiveUrl(e.target.value)} />
                    </div>
                    <div className="fill-field full">
                      <span className="fill-label">Owner problem</span>
                      <textarea className={`fill-textarea${focusedField === 'problem' ? ' lit' : ''}`} placeholder="The gym owner near my college tracked members on paper..." value={problem} onFocus={() => setFocusedField('problem')} onChange={e => setProblem(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Feature 1</span>
                      <input className={`fill-input${focusedField === 'feature1' ? ' lit' : ''}`} placeholder="Add and manage members" value={feature1} onFocus={() => setFocusedField('feature1')} onChange={e => setFeature1(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Feature 2</span>
                      <input className={`fill-input${focusedField === 'feature2' ? ' lit' : ''}`} placeholder="Track fees and payments" value={feature2} onFocus={() => setFocusedField('feature2')} onChange={e => setFeature2(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Feature 3</span>
                      <input className={`fill-input${focusedField === 'feature3' ? ' lit' : ''}`} placeholder="View member history" value={feature3} onFocus={() => setFocusedField('feature3')} onChange={e => setFeature3(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Your name</span>
                      <input className={`fill-input${focusedField === 'yourName' ? ' lit' : ''}`} value={yourName} onFocus={() => setFocusedField('yourName')} onChange={e => setYourName(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">GitHub URL</span>
                      <input className={`fill-input${focusedField === 'githubUrl' ? ' lit' : ''}`} placeholder="https://github.com/you/repo" value={githubUrl} onFocus={() => setFocusedField('githubUrl')} onChange={e => setGithubUrl(e.target.value)} />
                    </div>
                  </div>

                  {backendMdEdited !== null && (
                    <div className="warn-msg" style={{ marginBottom: 8 }}>
                      ✏️ You've hand-edited this file - the fields above will no longer update it automatically.
                      <button type="button" onClick={() => setBackendMdEdited(null)}>Reconnect to fields</button>
                    </div>
                  )}
                  <div className="md-editor-wrap">
                    <div className="md-editor-pane">
                      <div className="md-editor-label">README.md (editable)</div>
                      <textarea className="md-editor-textarea" value={backendMdSource} onChange={e => setBackendMdEdited(e.target.value)} />
                    </div>
                    <div className="md-preview-pane">
                      <div className="md-preview-label">Preview</div>
                      <div className="md-preview-body">{renderMarkdown(backendMdSource)}</div>
                    </div>
                  </div>

                  <div className={`checkbox-row${step2Done ? ' checked' : ''}`} onClick={toggleStep2}>
                    <input type="checkbox" checked={step2Done} readOnly />
                    ✅ Backend README written and looks good
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Screenshots — 10x more attention</h2>

                  <div className="green-card">
                    A README with screenshots gets seen. A README without screenshots gets skipped.<br /><br />
                    One good screenshot = 100 words of description.<br /><br />
                    Take them. Add them. Always.
                  </div>

                  <div className="shortcut-grid">
                    <div className="shortcut-card">
                      <div className="shortcut-os">🍎 Mac</div>
                      <div className="key-row"><span className="key-cap">Cmd</span><span className="key-cap">Shift</span><span className="key-cap">4</span></div>
                      <div className="shortcut-step">Click and drag to select area</div>
                      <div className="shortcut-step">Screenshot saves to Desktop</div>
                    </div>
                    <div className="shortcut-card">
                      <div className="shortcut-os">🪟 Windows</div>
                      <div className="key-row"><span className="key-cap">Win</span><span className="key-cap">Shift</span><span className="key-cap">S</span></div>
                      <div className="shortcut-step">Click and drag to select area</div>
                      <div className="shortcut-step">Paste into Paint, save as PNG</div>
                    </div>
                    <div className="shortcut-card">
                      <div className="shortcut-os">📱 Phone</div>
                      <div className="shortcut-step">Take screenshot of app on phone</div>
                      <div className="shortcut-step">AirDrop/cable transfer to laptop</div>
                    </div>
                  </div>

                  <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: '16px 0 4px' }}>Take these four screenshots:</p>
                  <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: 20 }}>
                    <li>Login screen</li>
                    <li>[Domain] list (with real data)</li>
                    <li>Add form</li>
                    <li>AI suggestion on detail screen</li>
                  </ul>

                  <div className="blue-card">
                    <b>How to add to GitHub — in README.md:</b>
                    <div style={{ background: '#1E293B', color: '#6EE7B7', borderRadius: 6, padding: '8px 12px', marginTop: 8, fontFamily: "'Fira Code', monospace", fontSize: '0.78rem' }}>
                      ![Login Screen](screenshots/login.png)
                    </div>
                    GitHub shows the actual image. Not just the path.
                  </div>

                  {[
                    ['shotsTaken', 'Four screenshots taken'],
                    ['shotsFolder', 'Screenshots folder created'],
                    ['shotsCommitted', 'Screenshots committed to GitHub'],
                    ['shotsShowInPreview', 'Images show in README preview'],
                  ].map(([key, label]) => (
                    <div key={key} className={`checkbox-row${shots[key] ? ' checked' : ''}`} onClick={() => toggleShot(key)}>
                      <input type="checkbox" checked={shots[key]} readOnly />
                      {label}
                    </div>
                  ))}

                  <button className="btn" style={{ opacity: allShotsDone ? 1 : 0.5 }} disabled={!allShotsDone} onClick={goToStep4}>
                    {allShotsDone ? 'Next — frontend README →' : 'Complete all 4 items to continue'}
                  </button>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Frontend README — short and links to backend</h2>

                  <div className="blue-card">
                    The frontend README does not need to repeat everything.<br /><br />
                    Short. Clean. Links to backend for the full story.<br /><br />
                    The backend README has all the detail.
                  </div>

                  <div className="fill-grid">
                    <div className="fill-field">
                      <span className="fill-label">Frontend live URL</span>
                      <input className="fill-input" placeholder="https://your-frontend.up.railway.app" value={frontendUrl} onChange={e => setFrontendUrl(e.target.value)} />
                    </div>
                    <div className="fill-field">
                      <span className="fill-label">Backend repo URL</span>
                      <input className="fill-input" placeholder="https://github.com/you/backend" value={backendRepoUrl} onChange={e => setBackendRepoUrl(e.target.value)} />
                    </div>
                  </div>

                  <div className="md-editor-wrap">
                    <div className="md-editor-pane">
                      <div className="md-editor-label">README.md (frontend)</div>
                      <textarea className="md-editor-textarea" style={{ minHeight: 220 }} value={frontendMd} readOnly />
                    </div>
                    <div className="md-preview-pane">
                      <div className="md-preview-label">Preview</div>
                      <div className="md-preview-body" style={{ minHeight: 220 }}>{renderMarkdown(frontendMd)}</div>
                    </div>
                  </div>

                  <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#7C3AED' }}>
                    That is all. 10 lines. Links to the real story. Clean.
                  </p>

                  <div className="blue-card">
                    <b>Commit README to both repos — in each repo:</b>
                    <div style={{ background: '#1E293B', color: '#6EE7B7', borderRadius: 6, padding: '10px 12px', marginTop: 8, fontFamily: "'Fira Code', monospace", fontSize: '0.76rem', whiteSpace: 'pre-wrap' }}>
{`git add README.md
git commit -m "add README — story of the build"
git push origin main`}
                    </div>
                  </div>

                  {[
                    ['backendComplete', 'Backend README complete — has problem, solution, live URL, screenshots, about section'],
                    ['frontendComplete', 'Frontend README complete — links to backend'],
                    ['bothCommitted', 'Both READMEs committed'],
                    ['ghShowsReadme', 'GitHub shows README below file list'],
                  ].map(([key, label]) => (
                    <div key={key} className={`checkbox-row${finalChecks[key] ? ' checked' : ''}`} onClick={() => toggleFinal(key)}>
                      <input type="checkbox" checked={finalChecks[key]} readOnly />
                      {label}
                    </div>
                  ))}

                  {revealCount > 0 && (
                    <div className="reveal-strip">
                      <h3 style={{ margin: '0 0 16px', color: '#92400E' }}>Phase 1 complete</h3>
                      {revealCount >= 1 && <div className="reveal-line-item">✅ <span><b>headings, bold, code, bullets, [links], ![images]</b> → six Markdown elements — all you need</span></div>}
                      {revealCount >= 2 && <div className="reveal-line-item">✅ <span><b>Story-first structure</b> → problem → solution → live URL — not tech stack first</span></div>}
                      {revealCount >= 3 && <div className="reveal-line-item">✅ <span><b>Screenshots</b> → 10x more attention — four minimum</span></div>}
                      {revealCount >= 4 && <div className="reveal-line-item">✅ <span><b>"About This Project"</b> → HatchKod program + real person + neighbourhood</span></div>}
                      {revealCount >= 5 && <div className="reveal-line-item">✅ <span><b>Frontend README</b> → short, links to backend</span></div>}
                      {revealCount >= 5 && (
                        <>
                          <p style={{ textAlign: 'center', fontWeight: 700, marginTop: 16, color: '#1E293B', lineHeight: 1.9 }}>
                            Your story is on GitHub.<br /><br />
                            Someone finds your repo. They read the problem. They see the screenshots.<br />
                            They click the live URL. They try your app.<br /><br />
                            That is how developers get jobs.<br /><br />
                            Next — 5.2.4.<br />
                            Record your 3-minute demo.<br />
                            Show it. Do not just describe it.
                          </p>
                          <button className="btn" onClick={goToPhase2}>Write YOUR README →</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT STAGE */}
            <div className="right-col">
              <div className="sticky-panel">
                <StagePanel step={step} backendMdSource={backendMdSource} shots={shots} frontendMd={frontendMd} />
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <div className="layout" style={{ maxWidth: 1100 }}>
          <div className="left-col">
            <div className="card">
              <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Write YOUR README</h2>

              <div className="domain-row">
                {['Gym', 'Hotel', 'Mess', 'Chai'].map(d => (
                  <button key={d} className={`domain-btn${domain === d ? ' selected' : ''}`} onClick={() => selectDomain(d)}>{d}</button>
                ))}
              </div>

              {domain && (
                <>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 8px' }}>Backend README — pre-filled from your domain, edit freely:</p>
                  <div className="md-editor-wrap">
                    <div className="md-editor-pane">
                      <div className="md-editor-label">README.md — backend</div>
                      <textarea className="md-editor-textarea" value={p2BackendMd} onChange={e => setP2BackendMd(e.target.value)} />
                    </div>
                    <div className="md-preview-pane">
                      <div className="md-preview-label">Preview</div>
                      <div className="md-preview-body">{renderMarkdown(p2BackendMd)}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '16px 0 8px' }}>Frontend README:</p>
                  <div className="md-editor-wrap">
                    <div className="md-editor-pane">
                      <div className="md-editor-label">README.md — frontend</div>
                      <textarea className="md-editor-textarea" style={{ minHeight: 180 }} value={p2FrontendMd} onChange={e => setP2FrontendMd(e.target.value)} />
                    </div>
                    <div className="md-preview-pane">
                      <div className="md-preview-label">Preview</div>
                      <div className="md-preview-body" style={{ minHeight: 180 }}>{renderMarkdown(p2FrontendMd)}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 1 — Backend README</h3>
                  {[['titleDesc','Title + one-line description'],['urlLinked','Live URL linked'],['problemWritten','"The Problem I Solved" written'],['whatBuilt','"What I Built" — three features'],['aboutWritten','"About This Project" written'],['howToRun','How to Run instructions']].map(([key,label]) => (
                    <label key={key} className={`task-item${tasks[key] ? ' checked' : ''}`}>
                      <input type="checkbox" checked={tasks[key]} onChange={() => toggleTask(key)} />
                      {label}
                    </label>
                  ))}

                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 2 — Screenshots</h3>
                  {[['shotsTakenP2','Four screenshots taken'],['shotsCommittedP2','Screenshots folder committed'],['shotsShowP2','Images show in README']].map(([key,label]) => (
                    <label key={key} className={`task-item${tasks[key] ? ' checked' : ''}`}>
                      <input type="checkbox" checked={tasks[key]} onChange={() => toggleTask(key)} />
                      {label}
                    </label>
                  ))}

                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 3 — Frontend README</h3>
                  {[['frontendShort','Short README written'],['frontendLinksBackend','Links to backend repo'],['frontendLinksLive','Links to live URL']].map(([key,label]) => (
                    <label key={key} className={`task-item${tasks[key] ? ' checked' : ''}`}>
                      <input type="checkbox" checked={tasks[key]} onChange={() => toggleTask(key)} />
                      {label}
                    </label>
                  ))}

                  <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Task 4 — Commit</h3>
                  {[['backendCommitted','Backend README committed'],['frontendCommitted','Frontend README committed']].map(([key,label]) => (
                    <label key={key} className={`task-item${tasks[key] ? ' checked' : ''}`}>
                      <input type="checkbox" checked={tasks[key]} onChange={() => toggleTask(key)} />
                      {label}
                    </label>
                  ))}

                  {task1Done && task2Done && task3Done && task4Done && (
                    <>
                      <h3 style={{ fontSize: '1rem', margin: '20px 0 6px' }}>Reflection</h3>
                      <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 8px' }}>
                        In one sentence — what is the most important part of a README for someone who has never seen your code?
                      </p>
                      <textarea
                        className="reflection-box"
                        placeholder="The most important part is 'The Problem I Solved' section because it immediately tells anyone who finds the repo that this is a real project that helped a real person - not just a tutorial exercise..."
                        value={reflection}
                        onChange={e => setReflection(e.target.value)}
                        onPaste={e => e.preventDefault()}
                      />
                      <div className={`word-count${sentences >= 1 ? ' ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                      <button className="btn" style={{ opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit || submitted} onClick={handleSubmit}>
                        {submitted ? 'Submitted ✅' : 'README done — record demo next →'}
                      </button>

                      {submitted && (
                        <div style={{ marginTop: 16, padding: 16, background: '#F5F3FF', borderRadius: 8, color: '#5B21B6' }}>
                          <b>README complete. 📖</b><br /><br />
                          ✅ Story-first README written<br />
                          ✅ Screenshots added<br />
                          ✅ Live URL linked<br />
                          ✅ About section tells your story<br />
                          ✅ Both repos have README<br /><br />
                          Next — 5.2.4.<br />
                          Record your 3-minute demo.<br /><br />
                          This video becomes your answer when an employer asks: "tell me about your project."<br /><br />
                          You show it. You do not just describe it.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="right-col">
            <div className="sticky-panel">
              <StagePanel step={5} backendMdSource={p2BackendMd} shots={{ shotsTaken: tasks.shotsTakenP2, shotsFolder: tasks.shotsCommittedP2, shotsCommitted: tasks.shotsCommittedP2, shotsShowInPreview: tasks.shotsShowP2 }} frontendMd={p2FrontendMd} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StagePanel({ step, backendMdSource, shots, frontendMd }) {
  const showScreenshots = step >= 3;
  return (
    <div className="stage-card">
      <div className="stage-label">
        {step === 1 && 'Live Markdown preview — how GitHub renders it'}
        {step === 2 && 'GitHub repository view'}
        {step === 3 && 'README with screenshots'}
        {(step === 4 || step === 5) && 'This is what the world sees'}
      </div>

      {step === 1 && (
        <div className="gh-mockup">
          <div className="gh-readme-render">{renderMarkdown('# SaiFit Gym Manager\nA gym management app.\n\n**Live App**\n[Live App Link](url)\n\n- Add members\n- Track fees\n\nBuilt with `Spring Boot` and `React`.\n\n![Screenshot](preview.png)')}</div>
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94A3B8', padding: '0 20px' }}>This is exactly how GitHub shows your README</p>
        </div>
      )}

      {(step === 2 || step === 3 || step === 4 || step === 5) && (
        <div className="gh-mockup">
          <div className="gh-topbar">
            <div className="gh-dot" /><div className="gh-dot" /><div className="gh-dot" />
            <span className="gh-repo-name">github.com/you/backend-repo</span>
          </div>
          <div className="gh-filelist">
            <div className="gh-file-row">📁 src</div>
            <div className="gh-file-row">📄 pom.xml</div>
            <div className="gh-file-row">📄 README.md</div>
          </div>
          <div className="gh-readme-render">{renderMarkdown(step >= 4 ? frontendMd : backendMdSource)}</div>
          {showScreenshots && (
            <div className="screenshot-grid">
              {['Login Screen', 'Members List', 'AI Feature', 'Add Form'].map(label => (
                <div key={label} className={`screenshot-placeholder${shots.shotsShowInPreview ? ' filled' : ''}`}>
                  {shots.shotsShowInPreview ? `✅ ${label}` : `[${label}]`}
                </div>
              ))}
            </div>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94A3B8', padding: '0 20px 8px' }}>
            {step === 2 ? 'This is what recruiters see' : showScreenshots && shots.shotsShowInPreview ? 'With screenshots ✅' : 'This is what the world sees when they find your GitHub'}
          </p>
        </div>
      )}
    </div>
  );
}
