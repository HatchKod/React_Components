import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .split-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; max-width: 1100px; margin: 0 auto; }
  @media(max-width:900px) { .split-layout { grid-template-columns: 1fr; } }
  
  .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 24px; transition: all 0.3s; border-left: 4px solid transparent; }
  .card.active { border-left-color: #3B82F6; box-shadow: 0 8px 24px rgba(59,130,246,0.15); }
  .card.complete { border-left-color: #10B981; }
  .card.future { opacity: 0.5; pointer-events: none; }
  
  .card-header { font-size: 1.25rem; font-weight: 700; margin: 0 0 16px 0; color: #1E293B; }
  
  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-block; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #9CA3AF; cursor: not-allowed; }
  .btn.green { background: #10B981; }
  .btn.green:hover { background: #059669; }

  /* WhatsApp Style Chat */
  .chat-panel { background: #E2E8F0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
  .chat-bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 0.95rem; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .chat-left { align-self: flex-start; background: #DBEAFE; color: #1E3A8A; border-bottom-left-radius: 4px; }
  .chat-right { align-self: flex-end; background: #DCFCE7; color: #065F46; border-bottom-right-radius: 4px; }
  .method-badge { font-size: 0.75rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; display: inline-block; }
  .badge-get { background: #10B981; color: white; }
  .badge-post { background: #3B82F6; color: white; }
  .status-code { font-size: 0.75rem; opacity: 0.7; margin-top: 4px; text-align: right; }

  @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  
  /* Method Table */
  .method-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.95rem; }
  .method-table td { padding: 10px 12px; border: 1px solid #E2E8F0; background: white; }
  .method-row.active-get { border-left: 4px solid #10B981; font-weight: 600; }
  .method-row.active-post { border-left: 4px solid #3B82F6; font-weight: 600; }
  .method-row.inactive { opacity: 0.5; background: #F8FAFC; }

  /* Pill Buttons */
  .domain-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .domain-pill { padding: 8px 16px; border-radius: 20px; background: #F1F5F9; border: 1.5px solid transparent; cursor: pointer; font-weight: 600; transition: all 0.2s; }
  .domain-pill:hover { background: #E2E8F0; }
  .domain-pill.selected { background: #EFF6FF; border-color: #3B82F6; color: #1D4ED8; }

  /* Blanks & Code */
  .code-container { background: #1E293B; color: #E2E8F0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; position: relative; }
  .blank-wrap { display: inline-block; position: relative; margin: 0 4px; }
  .blank-select { appearance: none; background: #334155; color: white; border: 1.5px solid #64748B; padding: 2px 8px; border-radius: 4px; font-family: inherit; font-size: inherit; cursor: pointer; outline: none; }
  .blank-input { background: #334155; color: white; border: 1.5px solid #64748B; padding: 2px 8px; border-radius: 4px; font-family: inherit; font-size: inherit; width: 160px; outline: none; }
  .blank-correct { border-color: #10B981; background: rgba(16, 185, 129, 0.1); }
  .blank-wrong { border-color: #EF4444; background: rgba(239, 68, 68, 0.1); }
  
  .code-kw { color: #E879F9; } /* annotations @ */
  .code-pkg { color: #60A5FA; }
  .code-cls { color: #FACC15; }
  .code-str { color: #4ADE80; }
  .code-cmt { color: #9CA3AF; }

  .tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #0F172A; color: white; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-family: system-ui; width: 220px; text-align: center; margin-bottom: 8px; z-index: 10; pointer-events: none; opacity: 0; transition: opacity 0.2s; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); font-weight: normal; }
  .tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: #0F172A transparent transparent transparent; }
  .has-tooltip:hover .tooltip { opacity: 1; }

  .checkbox-label { display: flex; align-items: center; gap: 12px; font-weight: 600; cursor: pointer; margin-top: 16px; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 1.05rem; }
  .checkbox-label input { width: 20px; height: 20px; cursor: pointer; accent-color: #10B981; }

  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 24px; margin-top: 24px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 1.05rem; animation: slideIn 0.4s ease-out; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  
  /* Controller Visuals */
  .server-box { background: white; border: 2px solid #E2E8F0; border-radius: 12px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px; transition: all 0.5s; }
  .server-box-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; }
  .controller-badge { background: #FAF5FF; color: #9333EA; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid #E9D5FF; font-size: 0.85rem; }
  .route-card { background: #F8FAFC; border-left: 4px solid #10B981; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-family: monospace; font-size: 0.9rem; animation: popIn 0.4s; position: relative; }
  .route-card-arrow { color: #94A3B8; margin: 0 8px; }
  
  .mockup-browser { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .mockup-header { background: #F8FAFC; padding: 12px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; gap: 12px; }
  .mockup-url { background: white; padding: 6px 12px; border-radius: 6px; font-size: 0.9rem; color: #475569; flex: 1; border: 1px solid #E2E8F0; font-family: monospace; transition: all 0.3s; }
  .mockup-body { padding: 24px; min-height: 120px; color: #1E293B; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

  /* Free Editor */
  .free-editor { width: 100%; min-height: 250px; background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.95rem; border: none; outline: none; resize: vertical; line-height: 1.5; }
  .free-editor:focus { box-shadow: 0 0 0 2px #3B82F6; }

  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 16px; font-size: 1.05rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; margin-top: 12px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 8px; font-weight: 600; }
  .word-count.ok { color: #10B981; }
  
  .hint-text { font-size: 0.85rem; color: #EF4444; position: absolute; top: 100%; left: 0; width: 200px; padding-top: 4px; display: none; }
  .blank-wrap.invalid .hint-text { display: block; }
`;

function useSounds() {
  const muted = useRef(false);
  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      const makeOsc = (freq, start, dur, wave = "sine") => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.connect(gain);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };

      if (type === "add") {
        makeOsc(220, 0, 0.15);
        makeOsc(440, 0, 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      } else if (type === "correct") {
        [523, 659, 784].forEach((f, i) => makeOsc(f, i * 0.1, 0.15));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      } else if (type === "warn") {
        makeOsc(330, 0, 0.2);
        makeOsc(277, 0.1, 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      } else if (type === "tick") {
        makeOsc(800, 0, 0.05, "triangle");
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      } else if (type === "reveal") {
        [523, 659, 784, 1047].forEach((f, i) => makeOsc(f, i * 0.12, 0.2));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      } else if (type === "submit") {
        makeOsc(392, 0, 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      }
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {}
  }, []);
  return { play, muted };
}

export default function RestAPIBuilder() {
  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);

  // Phase 1 State
  const [slot, setSlot] = useState(1);
  const [convStep, setConvStep] = useState(0); // 0: initial, 1: GET done, 2: POST asked, 3: POST done
  const [domain, setDomain] = useState(null);
  
  const [blanks, setBlanks] = useState({ b1: '', b2: '', b3: '', b4: '' });
  const [blankStatus, setBlankStatus] = useState({ b1: null, b2: null, b3: null, b4: null });
  
  const [slot2Checked, setSlot2Checked] = useState(false);
  const [slot3Checked, setSlot3Checked] = useState(false);
  
  const [revealLines, setRevealLines] = useState(0);
  const [phase, setPhase] = useState(1);

  // Phase 2 State
  const [freeCode, setFreeCode] = useState("@RestController\npublic class GymController {\n\n  // Add your real endpoints below\n  // Use @GetMapping for each\n\n}");
  const [p2Check1, setP2Check1] = useState(false);
  const [p2Check2, setP2Check2] = useState(false);
  const [p2Check3, setP2Check3] = useState(false);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Phase 2 derived stats
  const [parsedEndpoints, setParsedEndpoints] = useState([]);
  const [isRestController, setIsRestController] = useState(true);
  const [parsedClassName, setParsedClassName] = useState("GymController");
  
  // Visualizer State
  const [visualUrl, setVisualUrl] = useState("localhost:8080/");
  const [visualRes, setVisualRes] = useState("");

  const toggleMute = () => {
    setIsMuted(!isMuted);
    muted.current = !isMuted;
  };

  const handleSendConv = () => {
    if (convStep === 0) {
      setConvStep(1);
      play("correct");
      setTimeout(() => setConvStep(2), 1500);
    } else if (convStep === 2) {
      setConvStep(3);
      play("correct");
    }
  };

  const handleDomain = (d) => {
    setDomain(d);
    play("tick");
    setFreeCode(`@RestController\npublic class ${d}Controller {\n\n  // Add your real endpoints below\n  // Use @GetMapping for each\n\n}`);
  };

  const checkBlank = (id, val, correctVal) => {
    const newBlanks = { ...blanks, [id]: val };
    setBlanks(newBlanks);
    
    if (val === correctVal) {
      setBlankStatus({ ...blankStatus, [id]: true });
      play("add");
    } else if (val) {
      setBlankStatus({ ...blankStatus, [id]: false });
      play("warn");
    } else {
      setBlankStatus({ ...blankStatus, [id]: null });
    }
  };

  const allBlanksCorrect = blankStatus.b1 && blankStatus.b2 && blankStatus.b3 && blankStatus.b4;

  useEffect(() => {
    if (allBlanksCorrect && slot === 2 && !slot2Checked) {
      play("correct");
    }
  }, [allBlanksCorrect]);

  const handleCheck = (num) => {
    if (num === 2) { setSlot2Checked(true); play("correct"); setVisualUrl(`localhost:8080/${domain?.toLowerCase() || 'app'}/hello`); setVisualRes(`Welcome to ${domain || 'API'} API!`); }
    if (num === 3) { 
      setSlot3Checked(true); 
      play("correct"); 
      setVisualUrl(`localhost:8080/${domain?.toLowerCase() || 'app'}/status`); 
      setVisualRes("Server is running ✅");
      setTimeout(() => {
        play("reveal");
        let count = 0;
        const interval = setInterval(() => { count++; setRevealLines(count); if (count < 7) play("tick"); if (count >= 7) clearInterval(interval); }, 600);
      }, 1500);
    }
  };

  // Free Code Parser
  useEffect(() => {
    if (phase !== 2) return;
    setIsRestController(/@RestController/.test(freeCode));
    
    const classMatch = freeCode.match(/public\s+class\s+(\w+)/);
    if (classMatch) setParsedClassName(classMatch[1]);
    
    const endpoints = [];
    const regex = /@GetMapping\s*\(\s*["']([^"']+)["']\s*\)[\s\S]*?return\s+["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(freeCode)) !== null) {
      endpoints.push({ path: match[1], ret: match[2] });
    }
    setParsedEndpoints(endpoints);
    
    if (endpoints.length > parsedEndpoints.length) play("add");
    if (endpoints.length > 0) {
      setVisualUrl(`localhost:8080${endpoints[endpoints.length-1].path}`);
      setVisualRes(endpoints[endpoints.length-1].ret);
    } else {
      setVisualUrl(`localhost:8080/`);
      setVisualRes("");
    }
  }, [freeCode, phase]);

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const canSubmitP2 = parsedEndpoints.length >= 2 && p2Check1 && p2Check2 && p2Check3 && sentences >= 1;

  useEffect(() => {
    if (submitted) {
      try {
        const params = new URLSearchParams(window.location.search);
        window.parent.postMessage({
          type: 'HK_RESULT',
          version: '1',
          exerciseId: 'm2-t1-s3-rest-api-builder',
          status: 'completed',
          score: 3, maxScore: 3,
          answers: { 
            phase1: { domain, allBlanksCorrect, slot2Checked, slot3Checked },
            phase2: { controllerName: parsedClassName, endpoints: parsedEndpoints, checks: [p2Check1, p2Check2, p2Check3], reflection }
          },
          metadata: { subtopicId: params.get('subtopicId'), taskId: params.get('taskId') },
          completedAt: new Date().toISOString()
        }, '*');
      } catch(e) {}
    }
  }, [submitted]);

  const renderBlanks = () => {
    const dPath = domain?.toLowerCase() || 'app';
    const dTitle = domain === 'Gym' ? 'Gym API! 🏋️' : domain === 'Hotel' ? 'Hotel Room API! 🏨' : domain === 'Mess' ? 'Mess Management API! 🍱' : domain === 'Chai' ? 'Chai Order API! ☕' : 'my API! 👋';

    if (allBlanksCorrect) {
      return (
        <div className="code-container" style={{ animation: 'popIn 0.4s' }}>
          <span className="code-pkg">package</span> com.yourname.gymapp;<br/><br/>
          <span className="code-pkg">import</span> org.springframework.web.bind.annotation.GetMapping; <span className="code-cmt">// mapping annotation</span><br/>
          <span className="code-pkg">import</span> org.springframework.web.bind.annotation.RestController; <span className="code-cmt">// controller annotation</span><br/><br/>
          <span className="code-kw has-tooltip">@RestController<div className="tooltip">This class handles HTTP requests - every method with @GetMapping becomes an endpoint</div></span> <span className="code-cmt">// this class handles requests</span><br/>
          <span className="code-pkg">public class</span> <span className="code-cls">{domain}Controller</span> {"{"}<br/><br/>
          &nbsp;&nbsp;<span className="code-kw has-tooltip">@GetMapping<div className="tooltip">Maps GET request to this method</div></span>(<span className="code-str">"/{dPath}/hello"</span>) <span className="code-cmt">// GET /{dPath}/hello</span><br/>
          &nbsp;&nbsp;<span className="code-pkg">public</span> String hello() {"{"}<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-pkg">return</span> <span className="code-str has-tooltip">"{`Welcome to ${dTitle}`}"<div className="tooltip">This text goes back to whoever asked (the browser)</div></span>;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-cmt">// ↑ this goes back to the browser</span><br/>
          &nbsp;&nbsp;{"}"}<br/>
          {"}"}
        </div>
      );
    }

    return (
      <div className="code-container">
        package com.yourname.gymapp;<br/><br/>
        import org.springframework.web.bind.annotation.
        <div className={`blank-wrap ${blankStatus.b1 === false ? 'invalid' : ''}`}>
          <select className={`blank-select ${blankStatus.b1 ? 'blank-correct' : blankStatus.b1===false ? 'blank-wrong' : ''}`} value={blanks.b1} onChange={e => checkBlank('b1', e.target.value, 'GetMapping')}>
            <option value="">[ Select ]</option>
            <option value="GetMapping">GetMapping</option>
            <option value="PostMapping">PostMapping</option>
            <option value="SpringBootApplication">SpringBootApplication</option>
            <option value="Controller">Controller</option>
          </select>
          <div className="hint-text">GetMapping maps GET requests to methods</div>
        </div>;<br/>
        
        import org.springframework.web.bind.annotation.
        <div className={`blank-wrap ${blankStatus.b2 === false ? 'invalid' : ''}`}>
          <select className={`blank-select ${blankStatus.b2 ? 'blank-correct' : blankStatus.b2===false ? 'blank-wrong' : ''}`} value={blanks.b2} onChange={e => checkBlank('b2', e.target.value, 'RestController')}>
            <option value="">[ Select ]</option>
            <option value="RestController">RestController</option>
            <option value="SpringBootApplication">SpringBootApplication</option>
            <option value="Component">Component</option>
            <option value="Service">Service</option>
          </select>
          <div className="hint-text">RestController is correct here</div>
        </div>;<br/><br/>

        <div className={`blank-wrap ${blankStatus.b3 === false ? 'invalid' : ''}`}>
          <input className={`blank-input ${blankStatus.b3 ? 'blank-correct' : blankStatus.b3===false ? 'blank-wrong' : ''}`} placeholder="[Annotation]" value={blanks.b3} onChange={e => checkBlank('b3', e.target.value.trim(), '@RestController')} />
          <div className="hint-text">Type exactly: @RestController</div>
        </div> <span className="code-cmt">// marks class as request handler</span><br/>
        public class {domain}Controller {"{"}<br/><br/>
        
        &nbsp;&nbsp;<div className={`blank-wrap ${blankStatus.b4 === false ? 'invalid' : ''}`}>
          <input className={`blank-input ${blankStatus.b4 ? 'blank-correct' : blankStatus.b4===false ? 'blank-wrong' : ''}`} placeholder="[Annotation]" value={blanks.b4} onChange={e => checkBlank('b4', e.target.value.trim(), '@GetMapping')} />
          <div className="hint-text">Type exactly: @GetMapping</div>
        </div>("/{dPath}/hello")<br/>
        &nbsp;&nbsp;public String hello() {"{"}<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;return "{`Welcome to ${dTitle}`}";<br/>
        &nbsp;&nbsp;{"}"}<br/>
        {"}"}
      </div>
    );
  };

  return (
    <div className="sim-root">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>REST API Builder</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      <div className="split-layout">
        
        {/* LEFT PANEL */}
        <div>
          {phase === 1 && (
            <>
              {/* SLOT 1 */}
              <div className={`card ${slot === 1 ? 'active' : 'complete'}`}>
                <h2 className="card-header">REST - request, response, done.</h2>
                <p style={{ color: '#64748B' }}>Every URL maps to a specific response. It is a predictable conversation.</p>
                
                <div className="chat-panel">
                  <div className="chat-bubble chat-left">
                    <span className="method-badge badge-get">GET /gym/members</span><br/>
                    Give me the gym members list
                  </div>
                  
                  {convStep >= 1 ? (
                    <div className="chat-bubble chat-right">
                      Here they are: Ravi, Suresh, Priya
                      <div className="status-code">200 OK</div>
                    </div>
                  ) : (
                    <div className="chat-bubble chat-right" style={{ opacity: 0.5 }}>(thinking...)</div>
                  )}

                  {convStep >= 2 && (
                    <div className="chat-bubble chat-left" style={{ marginTop: '16px' }}>
                      <span className="method-badge badge-post">POST /gym/members</span><br/>
                      Add a new member - Anitha
                    </div>
                  )}

                  {convStep >= 3 ? (
                    <div className="chat-bubble chat-right">
                      Done! Anitha added.
                      <div className="status-code">201 Created</div>
                    </div>
                  ) : convStep >= 2 ? (
                    <div className="chat-bubble chat-right" style={{ opacity: 0.5 }}>(thinking...)</div>
                  ) : null}
                </div>

                {convStep < 3 && (
                  <button className="btn" onClick={handleSendConv}>Send this request →</button>
                )}

                {convStep === 3 && (
                  <div style={{ animation: 'slideIn 0.3s' }}>
                    <table className="method-table">
                      <tbody>
                        <tr className="method-row active-get"><td>GET</td><td>Give me something</td></tr>
                        <tr className="method-row active-post"><td>POST</td><td>Save something new</td></tr>
                        <tr className="method-row inactive"><td>PUT</td><td>Update something</td></tr>
                        <tr className="method-row inactive"><td>DELETE</td><td>Remove something</td></tr>
                      </tbody>
                    </table>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Today: GET only. POST, PUT, DELETE come later.</p>
                    <button className="btn green" onClick={() => { setSlot(2); play("tick"); }}>Now write my first endpoint →</button>
                  </div>
                )}
              </div>

              {/* SLOT 2 */}
              {slot >= 2 && (
                <div className={`card ${slot === 2 ? 'active' : 'complete'}`} style={{ animation: 'slideIn 0.3s' }}>
                  <h2 className="card-header">Write your first REST controller</h2>
                  
                  {!domain ? (
                    <>
                      <p style={{ color: '#475569' }}>Select your business domain to get started:</p>
                      <div className="domain-pills">
                        <button className="domain-pill" onClick={() => handleDomain('Gym')}>🏋️ Gym</button>
                        <button className="domain-pill" onClick={() => handleDomain('Mess')}>🍱 Mess</button>
                        <button className="domain-pill" onClick={() => handleDomain('Hotel')}>🏨 Hotel</button>
                        <button className="domain-pill" onClick={() => handleDomain('Chai')}>☕ Chai</button>
                        <button className="domain-pill" onClick={() => handleDomain('Other')}>🏪 Other</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#475569' }}>Fill in the blanks to complete your controller:</p>
                      {renderBlanks()}

                      {allBlanksCorrect && (
                        <div style={{ marginTop: '24px', animation: 'slideIn 0.3s' }}>
                          <h4 style={{ margin: '0 0 12px 0' }}>Instructions:</h4>
                          <ol style={{ paddingLeft: '20px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                            <li>Create <b>{domain}Controller.java</b> in the same folder as your Application.java file</li>
                            <li>Copy the code above and paste it in</li>
                            <li>Restart your server <code>./mvnw spring-boot:run</code></li>
                            <li>Open <code>http://localhost:8080/{domain.toLowerCase()}/hello</code> in browser</li>
                          </ol>
                          <label className="checkbox-label">
                            <input type="checkbox" checked={slot2Checked} onChange={() => handleCheck(2)} />
                            ✅ I see my welcome message in the browser
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SLOT 3 */}
              {slot2Checked && (
                <div className="card active" style={{ animation: 'slideIn 0.3s' }}>
                  <h2 className="card-header">Add one more endpoint - see how routing works</h2>
                  <div className="code-container" style={{ margin: '16px 0' }}>
                    &nbsp;&nbsp;<span className="code-kw">@GetMapping</span>(<span className="code-str">"/{domain.toLowerCase()}/status"</span>)<br/>
                    &nbsp;&nbsp;<span className="code-pkg">public</span> String status() {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-pkg">return</span> <span className="code-str">"Server is running ✅"</span>;<br/>
                    &nbsp;&nbsp;{"}"}
                  </div>
                  <p style={{ color: '#475569' }}>Add this method INSIDE your {domain}Controller class, after the hello() method. Restart server and test in browser.</p>
                  
                  <label className="checkbox-label">
                    <input type="checkbox" checked={slot3Checked} onChange={() => handleCheck(3)} />
                    ✅ I see the status message at /{domain.toLowerCase()}/status
                  </label>

                  {slot3Checked && (
                    <div style={{ marginTop: '24px', animation: 'slideIn 0.3s' }}>
                      <div className="reveal-card">
                        <h2 style={{ margin: '0 0 20px 0', color: '#92400E' }}>API Summary</h2>
                        {revealLines >= 1 && <div className="reveal-line">✅ <b>REST</b> → predictable request-response conversation pattern</div>}
                        {revealLines >= 2 && <div className="reveal-line">✅ <b>Endpoint</b> → a specific URL your API responds to</div>}
                        {revealLines >= 3 && <div className="reveal-line">✅ <b>@RestController</b> → this class handles HTTP requests</div>}
                        {revealLines >= 4 && <div className="reveal-line">✅ <b>@GetMapping</b> → maps a GET request to a method</div>}
                        {revealLines >= 5 && <div className="reveal-line">✅ <b>GET</b> → fetch/read data - does not change anything</div>}
                        {revealLines >= 6 && <div className="reveal-line">✅ <b>HTTP 200 OK</b> → the universal success response code</div>}
                        {revealLines >= 7 && (
                          <div style={{ marginTop: '30px', textAlign: 'center', animation: 'slideIn 0.5s' }}>
                            <h3 style={{ fontSize: '1.4rem', color: '#1E293B' }}>Every major app in the world uses REST APIs. You just built yours.</h3>
                            <button className="btn green" style={{ padding: '16px 32px', fontSize: '1.1rem', marginTop: '16px' }} onClick={() => { setPhase(2); play("tick"); }}>
                              Now build YOUR real endpoint →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {phase === 2 && (
            <div className="card active" style={{ animation: 'slideIn 0.4s' }}>
              <h2 className="card-header" style={{ fontSize: '1.6rem' }}>Build your real project controller</h2>
              <p style={{ color: '#64748B' }}>Add two meaningful endpoints that make sense for YOUR business. (Not hello or status - real domain endpoints).</p>
              
              <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10B981', margin: '20px 0', color: '#065F46' }}>
                <b>Hint for your {domain} API:</b><br/>
                {domain === 'Gym' && "Try /gym/members (returns list) or /gym/plans (returns plans)."}
                {domain === 'Hotel' && "Try /hotel/rooms (returns list) or /hotel/rates (returns rates)."}
                {domain === 'Mess' && "Try /mess/menu (returns today's menu) or /mess/timing."}
                {domain === 'Chai' && "Try /chai/menu (items and prices) or /chai/status (open/closed)."}
                {domain === 'Other' && "Try /app/users or /app/items."}<br/>
                For now, just return hardcoded Strings! Real data comes later.
              </div>

              <textarea 
                className="free-editor" 
                value={freeCode}
                onChange={e => setFreeCode(e.target.value)}
                onPaste={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
                spellCheck="false"
              />

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Instructions:</h4>
                <p style={{ color: '#475569', fontSize: '0.95rem' }}>Replace your old controller code with this new code, restart your server, and test each endpoint.</p>
                
                <label className="checkbox-label" style={{ padding: '12px', marginTop: '12px' }}>
                  <input type="checkbox" checked={p2Check1} onChange={e => { setP2Check1(e.target.checked); if(e.target.checked) play('add'); }} disabled={parsedEndpoints.length < 2} />
                  I have at least 2 @GetMapping endpoints
                </label>
                <label className="checkbox-label" style={{ padding: '12px', marginTop: '8px' }}>
                  <input type="checkbox" checked={p2Check2} onChange={e => { setP2Check2(e.target.checked); if(e.target.checked) play('add'); }} disabled={!p2Check1} />
                  I tested them in my browser
                </label>
                <label className="checkbox-label" style={{ padding: '12px', marginTop: '8px' }}>
                  <input type="checkbox" checked={p2Check3} onChange={e => { setP2Check3(e.target.checked); if(e.target.checked) play('add'); }} disabled={!p2Check2} />
                  Both return meaningful responses
                </label>
              </div>

              {p2Check3 && (
                <div style={{ marginTop: '32px', animation: 'slideIn 0.3s' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Reflection:</h4>
                  <p style={{ color: '#475569', margin: '0 0 12px 0' }}>In one sentence - what is the difference between /hello and your new endpoints? Why do we need different endpoints?</p>
                  <textarea 
                    className="reflection-box"
                    placeholder="/hello is just a welcome message. We need different endpoints because..."
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                  />
                  <div className={`word-count ${sentences >= 1 ? 'ok' : ''}`}>{sentences} / 1 sentence minimum</div>

                  <button 
                    className="btn green" 
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '24px', opacity: canSubmitP2 ? 1 : 0.5 }}
                    disabled={!canSubmitP2 || submitted}
                    onClick={() => { play("submit"); setSubmitted(true); }}
                  >
                    {submitted ? "Completed ✅" : "My first real REST endpoints are working →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - VISUALIZER */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            
            <div className="server-box" style={{ opacity: phase === 1 ? (slot >= 2 ? 1 : 0.3) : 1 }}>
              <div className="server-box-header">
                <span style={{ fontSize: '24px' }}>🍃</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>{phase === 1 ? (domain ? `${domain}Controller` : 'Controller') : parsedClassName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Spring Boot Server</div>
                </div>
                {(phase === 1 ? allBlanksCorrect : isRestController) && (
                  <div className="controller-badge" style={{ marginLeft: 'auto' }}>@RestController</div>
                )}
              </div>

              <div style={{ minHeight: '100px' }}>
                {phase === 1 ? (
                  <>
                    {allBlanksCorrect && (
                      <div className="route-card">
                        <span className="method-badge badge-get">GET</span> /{domain?.toLowerCase() || 'app'}/hello <span className="route-card-arrow">→</span> hello()
                      </div>
                    )}
                    {slot3Checked && (
                      <div className="route-card">
                        <span className="method-badge badge-get">GET</span> /{domain?.toLowerCase() || 'app'}/status <span className="route-card-arrow">→</span> status()
                      </div>
                    )}
                    {!allBlanksCorrect && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '8px' }}>
                        Endpoints will appear here
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {parsedEndpoints.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '8px' }}>
                        Type @GetMapping to add endpoints
                      </div>
                    )}
                    {parsedEndpoints.map((ep, i) => (
                      <div key={i} className="route-card" style={{ animation: 'slideIn 0.3s' }}>
                        <span className="method-badge badge-get">GET</span> {ep.path} <span className="route-card-arrow">→</span> <span style={{ color: '#4ADE80' }}>"{ep.ret}"</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="mockup-browser" style={{ opacity: phase === 1 ? (slot2Checked ? 1 : 0.3) : (parsedEndpoints.length > 0 ? 1 : 0.3), transition: 'opacity 0.3s' }}>
              <div className="mockup-header">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div className="mockup-url">{visualUrl}</div>
              </div>
              <div className="mockup-body">
                {visualRes || "Waiting for server response..."}
              </div>
            </div>

            {phase === 2 && (
              <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#64748B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Endpoints found:</span>
                  <span style={{ fontWeight: 700, color: parsedEndpoints.length >= 2 ? '#10B981' : '#1E293B' }}>{parsedEndpoints.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Valid Controller:</span>
                  <span style={{ fontWeight: 700, color: isRestController ? '#10B981' : '#EF4444' }}>{isRestController ? 'Yes' : 'No @RestController'}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
