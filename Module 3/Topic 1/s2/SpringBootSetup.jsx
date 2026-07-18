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
  
  .input-group { margin-bottom: 16px; }
  .input-label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.95rem; }
  .input-field { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.2s; }
  .input-field:focus { border-color: #3B82F6; }
  .input-hint { font-size: 0.8rem; color: #64748B; margin-top: 4px; }
  .input-warn { font-size: 0.85rem; color: #D97706; margin-top: 4px; background: #FFFBEB; padding: 4px 8px; border-radius: 4px; display: inline-block; }
  
  .pill-group { display: flex; gap: 12px; margin-top: 8px; }
  .radio-pill { padding: 6px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0; font-size: 0.9rem; font-weight: 600; color: #64748B; }
  .radio-pill.selected { background: #EFF6FF; border-color: #3B82F6; color: #1D4ED8; }
  
  .dep-pill { background: #DCFCE7; border: 1px solid #10B981; color: #065F46; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: help; }
  
  .code-block { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; margin: 12px 0; overflow-x: auto; position: relative; }
  .code-block .cmd { color: #4ADE80; }
  .copy-btn { position: absolute; right: 8px; top: 8px; background: #334155; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.75rem; cursor: pointer; }
  
  .checkbox-label { display: flex; align-items: center; gap: 12px; font-weight: 600; cursor: pointer; margin-top: 20px; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 1.05rem; }
  .checkbox-label input { width: 20px; height: 20px; cursor: pointer; accent-color: #10B981; }
  
  .error-toggle { background: #FEE2E2; color: #B91C1C; font-weight: 600; padding: 12px 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; border: none; width: 100%; font-size: 1rem; margin-top: 16px; }
  .error-card { background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 8px; padding: 16px; margin-top: 12px; }
  .error-title { color: #B91C1C; font-weight: 700; margin-bottom: 4px; font-size: 1.05rem; }
  .error-cause { color: #7F1D1D; font-size: 0.9rem; margin-bottom: 12px; }
  
  .success-card { background: #F0FDF4; border-left: 4px solid #10B981; border-radius: 8px; padding: 20px; margin: 16px 0; }
  .success-title { color: #065F46; font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
  
  .file-tree { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9rem; margin: 12px 0; line-height: 1.6; }
  .file-item { cursor: pointer; padding: 2px 4px; border-radius: 4px; display: inline-block; transition: background 0.2s; }
  .file-item:hover { background: #334155; color: #38BDF8; }
  .file-item.active { background: #38BDF8; color: #0F172A; font-weight: bold; }
  
  .os-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
  .os-tab { padding: 8px 20px; border-radius: 20px; background: #F1F5F9; color: #475569; font-weight: 600; cursor: pointer; border: none; font-size: 0.95rem; }
  .os-tab.active { background: #3B82F6; color: white; }
  
  .mockup-browser { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 24px; }
  .mockup-header { background: #F8FAFC; padding: 12px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; gap: 12px; }
  .mockup-url { background: white; padding: 6px 12px; border-radius: 6px; font-size: 0.9rem; color: #475569; flex: 1; border: 1px solid #E2E8F0; font-family: monospace; }
  .mockup-body { padding: 24px; min-height: 200px; color: #1E293B; font-family: -apple-system, sans-serif; position: relative; }
  
  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 24px; margin-top: 24px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 1.05rem; animation: slideIn 0.4s ease-out; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  
  .timeline { display: flex; flex-direction: column; gap: 0; position: relative; margin-left: 12px; padding-left: 24px; border-left: 3px solid #E2E8F0; margin-bottom: 32px; }
  .timeline-item { position: relative; padding-bottom: 32px; color: #94A3B8; font-size: 1.05rem; }
  .timeline-item.complete { color: #10B981; font-weight: 600; }
  .timeline-item::before { content: ''; position: absolute; left: -31px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #F8FAFC; border: 3px solid #E2E8F0; transition: all 0.3s; z-index: 2; }
  .timeline-item.complete::before { background: #10B981; border-color: #10B981; box-shadow: 0 0 0 4px #DCFCE7; }
  
  .timeline-line-active { position: absolute; left: -3px; top: 0; width: 3px; background: #10B981; transition: height 0.5s ease-out; z-index: 1; }

  .mcq-opt { width: 100%; text-align: left; padding: 16px; background: white; border: 2px solid #E2E8F0; border-radius: 8px; margin-bottom: 12px; cursor: pointer; font-size: 1.05rem; font-weight: 500; transition: all 0.2s; color: #334155; }
  .mcq-opt:hover { background: #F8FAFC; border-color: #CBD5E1; }
  .mcq-opt.selected.correct { background: #F0FDF4; border-color: #10B981; color: #065F46; box-shadow: 0 4px 12px rgba(16,185,129,0.1); }
  .mcq-opt.selected.wrong { background: #FEF2F2; border-color: #EF4444; color: #991B1B; animation: shake 0.4s; }
  
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 16px; font-size: 1.05rem; font-family: inherit; resize: vertical; min-height: 120px; outline: none; margin-top: 12px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px #EFF6FF; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 8px; font-weight: 600; }
  .word-count.ok { color: #10B981; }

  .info-badge { background: #EFF6FF; color: #1D4ED8; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #3B82F6; }
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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="copy-btn" onClick={() => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function SpringBootSetup() {
  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);

  // Phase 1 State
  const [group, setGroup] = useState("");
  const [artifact, setArtifact] = useState("");
  const [groupHint, setGroupHint] = useState("");
  const [artifactHint, setArtifactHint] = useState("");
  const [zipGenerated, setZipGenerated] = useState(false);
  const [s1Checked, setS1Checked] = useState(false);

  const [activeFile, setActiveFile] = useState(null);
  const [s2Checked, setS2Checked] = useState(false);

  const [os, setOs] = useState("windows");
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [s3Checked, setS3Checked] = useState(false);

  const [s4Checked, setS4Checked] = useState(false);

  const [revealLines, setRevealLines] = useState(0);

  // Phase 2 State
  const [phase2, setPhase2] = useState(false);
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [attempts, setAttempts] = useState([1, 1, 1]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    muted.current = !isMuted;
  };

  const handleGroup = (v) => {
    setGroup(v);
    if (v.includes(" ")) {
      setGroupHint("No spaces allowed.");
      play("warn");
    } else if (v && !v.startsWith("com.") && !v.startsWith("in.") && !v.startsWith("org.")) {
      setGroupHint("Usually starts with com. or in. (e.g. com.ravi)");
    } else {
      setGroupHint("");
      if (v) play("tick");
    }
  };

  const handleArtifact = (v) => {
    setArtifact(v);
    if (v.includes(" ")) {
      setArtifactHint("No spaces — try gymapp or gym-app");
      play("warn");
    } else {
      setArtifactHint("");
      if (v) play("tick");
    }
  };

  const canGenerate = group && artifact && !groupHint && !artifactHint;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setZipGenerated(true);
    play("correct");
  };

  const handleCheck = (step) => {
    if (step === 1 && !s1Checked) { setS1Checked(true); play("add"); }
    if (step === 2 && !s2Checked) { setS2Checked(true); play("add"); }
    if (step === 3 && !s3Checked) { setS3Checked(true); play("correct"); }
    if (step === 4 && !s4Checked) { 
      setS4Checked(true); 
      play("correct"); 
      setTimeout(() => {
        play("reveal");
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setRevealLines(count);
          if (count < 6) play("tick");
          if (count >= 6) clearInterval(interval);
        }, 500);
      }, 1000);
    }
  };

  const handleQ = (qNum, val, isCorrect) => {
    if (qNum === 1 && q1 === 'correct') return;
    if (qNum === 2 && q2 === 'correct') return;
    if (qNum === 3 && q3 === 'correct') return;

    if (isCorrect) {
      play("correct");
      if (qNum === 1) setQ1('correct');
      if (qNum === 2) setQ2('correct');
      if (qNum === 3) setQ3('correct');
      
      if ((qNum === 1 || q1 === 'correct') && 
          (qNum === 2 || q2 === 'correct') && 
          (qNum === 3 || q3 === 'correct')) {
        setTimeout(() => play("tada"), 500);
      }
    } else {
      play("warn");
      const newAtt = [...attempts];
      newAtt[qNum-1]++;
      setAttempts(newAtt);
      if (qNum === 1) setQ1(val);
      if (qNum === 2) setQ2(val);
      if (qNum === 3) setQ3(val);
    }
  };

  const sentences = (reflection.match(/[.!?]+/g) || []).length;

  useEffect(() => {
    if (submitted) {
      try {
        const params = new URLSearchParams(window.location.search);
        window.parent.postMessage({
          type: 'HK_RESULT',
          version: '1',
          exerciseId: 'm2-t1-s2-spring-boot-setup',
          status: 'completed',
          score: 3, maxScore: 3,
          answers: { 
            phase1: { group, artifact, checked: [s1Checked, s2Checked, s3Checked, s4Checked], os },
            phase2: { q1, q2, q3, reflection, attempts }
          },
          metadata: { subtopicId: params.get('subtopicId'), taskId: params.get('taskId') },
          completedAt: new Date().toISOString()
        }, '*');
      } catch(e) {}
    }
  }, [submitted]);

  const timelineProgress = s4Checked ? 100 : s3Checked ? 75 : s2Checked ? 50 : s1Checked ? 25 : 0;

  return (
    <div className="sim-root">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Server Setup Guide</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px' }} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      {!phase2 ? (
        <div className="split-layout">
          <div>
            {/* STEP 1 */}
            <div className={`card ${!s1Checked ? 'active' : 'complete'}`}>
              <h2 className="card-header">Step 1 — Create project at start.spring.io</h2>
              
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div className="pill-group" style={{ marginBottom: '16px' }}>
                  <div className="radio-pill selected">Maven ●</div>
                  <div className="radio-pill">Java ●</div>
                  <div className="radio-pill">17 ●</div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Group</label>
                  <input className="input-field" placeholder="com.yourname" value={group} onChange={e => handleGroup(e.target.value)} />
                  {groupHint ? <div className="input-warn">⚠️ {groupHint}</div> : <div className="input-hint">your name, no spaces, lowercase (e.g. com.ravi)</div>}
                </div>

                <div className="input-group">
                  <label className="input-label">Artifact</label>
                  <input className="input-field" placeholder="gymapp" value={artifact} onChange={e => handleArtifact(e.target.value)} />
                  {artifactHint ? <div className="input-warn">⚠️ {artifactHint}</div> : <div className="input-hint">your project name, lowercase, no spaces</div>}
                </div>

                <div className="input-group">
                  <label className="input-label">Dependencies</label>
                  <div className="dep-pill" title="This is the waiter dependency. Without this — no web server.">
                    Spring Web <span style={{ opacity: 0.5 }}>×</span>
                  </div>
                </div>

                <button className={`btn ${canGenerate ? 'green' : ''}`} style={{ width: '100%', marginTop: '10px' }} disabled={!canGenerate} onClick={handleGenerate}>
                  Generate ZIP →
                </button>
              </div>

              {zipGenerated && (
                <div style={{ marginTop: '20px', animation: 'slideIn 0.3s' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#FFFBEB', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '30px' }}>📦</div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#92400E' }}>{artifact || 'project'}.zip Downloaded</h4>
                      <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9rem', color: '#78350F' }}>
                        <li>Find it in your Downloads folder</li>
                        <li>Right-click → Extract All</li>
                        <li>You now have a folder ready to open</li>
                      </ol>
                    </div>
                  </div>
                  
                  <label className="checkbox-label">
                    <input type="checkbox" checked={s1Checked} onChange={() => handleCheck(1)} />
                    I downloaded and unzipped the project
                  </label>
                </div>
              )}
            </div>

            {/* STEP 2 */}
            <div className={`card ${!s1Checked ? 'future' : !s2Checked ? 'active' : 'complete'}`}>
              <h2 className="card-header">Step 2 — Open in VS Code</h2>
              <ol style={{ margin: '0 0 20px 0', paddingLeft: '20px', color: '#475569' }}>
                <li>Open VS Code</li>
                <li>Click <b>File → Open Folder</b></li>
                <li>Select your unzipped folder</li>
                <li>If asked, click "Yes, I trust the authors"</li>
              </ol>

              <h4 style={{ margin: '0 0 10px 0' }}>Explore your project files:</h4>
              <div className="file-tree">
                <div>📁 src/main/java/com/yourname/gymapp/</div>
                <div className={`file-item ${activeFile === 'java' ? 'active' : ''}`} onClick={() => setActiveFile('java')} style={{ marginLeft: '24px' }}>
                  📄 {artifact ? artifact.charAt(0).toUpperCase() + artifact.slice(1) : 'GymApp'}Application.java (tap me)
                </div>
                <br/>
                <div className={`file-item ${activeFile === 'pom' ? 'active' : ''}`} onClick={() => setActiveFile('pom')}>
                  📄 pom.xml (tap me)
                </div>
              </div>

              <label className="checkbox-label">
                <input type="checkbox" checked={s2Checked} onChange={() => handleCheck(2)} disabled={!s1Checked} />
                I can see the files in VS Code
              </label>
            </div>

            {/* STEP 3 */}
            <div className={`card ${!s2Checked ? 'future' : !s3Checked ? 'active' : 'complete'}`}>
              <h2 className="card-header">Step 3 — Start your server</h2>
              
              <div className="os-tabs">
                <button className={`os-tab ${os === 'windows' ? 'active' : ''}`} onClick={() => setOs('windows')}>Windows</button>
                <button className={`os-tab ${os === 'mac' ? 'active' : ''}`} onClick={() => setOs('mac')}>Mac/Linux</button>
              </div>

              <p style={{ margin: '0 0 12px 0', color: '#475569' }}>In VS Code, click <b>View → Terminal</b> (or Ctrl + `), then type:</p>
              
              <div className="code-block">
                <CopyButton text={os === 'windows' ? 'mvnw.cmd spring-boot:run' : './mvnw spring-boot:run'} />
                &gt; <span className="cmd">{os === 'windows' ? 'mvnw.cmd spring-boot:run' : './mvnw spring-boot:run'}</span>
              </div>

              <div className="info-badge">
                ⏱️ <b>First run takes 2-5 minutes.</b><br/>
                Maven is downloading the internet (dependencies). Keep your internet on. Do not close the terminal.
              </div>

              <p style={{ fontWeight: 600, marginTop: '20px' }}>Wait for this specific line to appear:</p>
              <div className="code-block" style={{ color: '#E2E8F0' }}>
                ...<br/>
                ...<br/>
                Started {artifact ? artifact.charAt(0).toUpperCase() + artifact.slice(1) : 'GymApp'}Application in 4.5 seconds<br/>
              </div>

              <button className="error-toggle" onClick={() => setErrorsOpen(!errorsOpen)}>
                Something went wrong? (Errors) {errorsOpen ? '↑' : '↓'}
              </button>

              {errorsOpen && (
                <div style={{ animation: 'slideIn 0.3s' }}>
                  <div className="error-card">
                    <div className="error-title">Port 8080 already in use</div>
                    <div className="error-cause">Cause: Another program is using port 8080.</div>
                    <div className="code-block" style={{ margin: 0 }}>
                      {os === 'windows' ? 'netstat -ano | findstr :8080\ntaskkill /PID [number] /F' : 'lsof -i :8080\nkill -9 [number]'}
                    </div>
                  </div>
                  
                  <div className="error-card">
                    <div className="error-title">Java version not supported</div>
                    <div className="error-cause">Cause: Spring Boot 3 requires Java 17+.</div>
                    <div style={{ fontSize: '0.9rem', color: '#7F1D1D' }}>Check with `java -version`. Download Java 17 from Adoptium if needed.</div>
                  </div>

                  {os === 'mac' && (
                    <div className="error-card">
                      <div className="error-title">mvnw: Permission denied</div>
                      <div className="error-cause">Cause: Mac security blocking execution.</div>
                      <div className="code-block" style={{ margin: 0 }}>chmod +x mvnw<br/>./mvnw spring-boot:run</div>
                    </div>
                  )}
                </div>
              )}

              <label className="checkbox-label">
                <input type="checkbox" checked={s3Checked} onChange={() => handleCheck(3)} disabled={!s2Checked} />
                I see "Started Application" in my terminal
              </label>
            </div>

            {/* STEP 4 */}
            <div className={`card ${!s3Checked ? 'future' : !s4Checked ? 'active' : 'complete'}`}>
              <h2 className="card-header">Step 4 — Open your browser</h2>
              <p style={{ color: '#475569' }}>While the terminal is still running, open your browser and go to:</p>
              
              <div className="code-block" style={{ fontSize: '1.2rem', padding: '20px', textAlign: 'center' }}>
                <CopyButton text="http://localhost:8080" />
                <span className="cmd">http://localhost:8080</span>
              </div>

              <div className="success-card">
                <div className="success-title">✅ This is NOT an error!</div>
                <p style={{ margin: 0, color: '#065F46', lineHeight: 1.6 }}>
                  If you see a page saying <b>"Whitelabel Error Page"</b> — you have succeeded.<br/><br/>
                  Spring Boot is saying: "I am running. I heard you. But I have no routes set up yet to show you."<br/><br/>
                  <b>This means your server is ALIVE.</b>
                </p>
              </div>

              <label className="checkbox-label">
                <input type="checkbox" checked={s4Checked} onChange={() => handleCheck(4)} disabled={!s3Checked} />
                I see the Whitelabel Error page in my browser
              </label>
            </div>

            {s4Checked && (
              <div className="reveal-card">
                <h2 style={{ margin: '0 0 20px 0', color: '#92400E' }}>What just happened?</h2>
                {revealLines >= 1 && <div className="reveal-line">✅ <b>localhost</b> → "this computer" — your laptop is the server</div>}
                {revealLines >= 2 && <div className="reveal-line">✅ <b>8080</b> → port — the door number your server listens at</div>}
                {revealLines >= 3 && <div className="reveal-line">✅ <b>Whitelabel Error</b> → running, no routes yet — this IS success</div>}
                {revealLines >= 4 && <div className="reveal-line">✅ <b>pom.xml</b> → shopping list — Spring Web (waiter) was hired</div>}
                {revealLines >= 5 && <div className="reveal-line">✅ <b>mvnw</b> → Maven wrapper — downloads dependencies automatically</div>}
                
                {revealLines >= 6 && (
                  <div style={{ marginTop: '30px', textAlign: 'center', animation: 'slideIn 0.5s' }}>
                    <h3 style={{ fontSize: '1.4rem', color: '#1E293B' }}>Your laptop just served a response.</h3>
                    <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '24px' }}>
                      That is what every backend server in the world does.<br/>
                      Swiggy. PhonePe. WhatsApp.<br/>
                      Your server does it too. Right now.
                    </p>
                    <button className="btn" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={() => setPhase2(true)}>
                      Check your understanding →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {/* RIGHT SIDE VISUALS */}
            <div style={{ position: 'sticky', top: '24px' }}>
              
              <h3 style={{ margin: '0 0 20px 0' }}>Setup Progress</h3>
              <div className="timeline">
                <div className="timeline-line-active" style={{ height: `${timelineProgress}%` }} />
                <div className={`timeline-item ${s1Checked ? 'complete' : ''}`}>Step 1: Project created at start.spring.io</div>
                <div className={`timeline-item ${s2Checked ? 'complete' : ''}`}>Step 2: Opened in VS Code</div>
                <div className={`timeline-item ${s3Checked ? 'complete' : ''}`}>Step 3: Server started — port 8080</div>
                <div className={`timeline-item ${s4Checked ? 'complete' : ''}`} style={{ paddingBottom: 0 }}>Step 4: Browser received response</div>
              </div>

              {activeFile === 'java' && (
                <div className="card" style={{ animation: 'slideIn 0.3s' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Application.java</h4>
                  <div className="code-block" style={{ fontSize: '0.8rem', margin: 0 }}>
                    @SpringBootApplication<br/>
                    public class App {"{"}<br/>
                    &nbsp;&nbsp;public static void main(String[] args) {"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;SpringApplication.run(...);<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#9CA3AF' }}>// ↑ starts everything</span><br/>
                    &nbsp;&nbsp;{"}"}<br/>
                    {"}"}
                  </div>
                  <p style={{ margin: '12px 0 0 0', fontSize: '0.9rem', color: '#64748B' }}>You don't need to change this file. It runs automatically.</p>
                </div>
              )}

              {activeFile === 'pom' && (
                <div className="card" style={{ animation: 'slideIn 0.3s' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#3B82F6' }}>What is Maven & pom.xml?</h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#475569' }}>
                    Maven is the <b>delivery person</b>.<br/>
                    <b>pom.xml</b> is your <b>shopping list</b>.<br/><br/>
                    You write tools on the list. Maven downloads them from the internet and adds them to your project.
                  </p>
                  <div className="code-block" style={{ fontSize: '0.8rem', margin: '12px 0 0 0' }}>
                    &lt;dependencies&gt;<br/>
                    &nbsp;&nbsp;&lt;dependency&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;artifactId&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#FCD34D' }}>spring-boot-starter-web</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/artifactId&gt;<br/>
                    &nbsp;&nbsp;&lt;/dependency&gt;<br/>
                    &lt;/dependencies&gt;
                  </div>
                  <p style={{ margin: '12px 0 0 0', fontSize: '0.9rem', color: '#64748B' }}>That one dependency hires the web server (waiter) for you.</p>
                </div>
              )}

              {s4Checked && (
                <div style={{ animation: 'slideIn 0.5s', marginTop: '32px' }}>
                  <div className="mockup-browser">
                    <div className="mockup-header">
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
                      </div>
                      <div className="mockup-url">localhost:8080</div>
                    </div>
                    <div className="mockup-body">
                      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem' }}>Whitelabel Error Page</h2>
                      <p style={{ color: '#475569' }}>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>
                      
                      <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', animation: 'slideIn 0.5s', transform: 'rotate(-5deg)' }}>
                        Server Running ✅
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="split-layout">
          <div>
            <div className="card">
              <h2 className="card-header" style={{ fontSize: '1.6rem' }}>Make sure you understand what just happened 🧠</h2>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>Three quick questions to check your knowledge.</p>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>1. When you see 'Whitelabel Error Page' in your browser — what does it mean?</h4>
                <div className={`mcq-opt ${q1 === 'A' ? 'selected wrong' : ''}`} onClick={() => handleQ(1, 'A', false)}>A) Something went wrong — fix it</div>
                <div className={`mcq-opt ${q1 === 'correct' ? 'selected correct' : ''}`} onClick={() => handleQ(1, 'B', true)}>B) Spring Boot is running but has no routes yet</div>
                <div className={`mcq-opt ${q1 === 'C' ? 'selected wrong' : ''}`} onClick={() => handleQ(1, 'C', false)}>C) Your internet is not connected</div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>2. What does 'localhost:8080' mean?</h4>
                <div className={`mcq-opt ${q2 === 'A' ? 'selected wrong' : ''}`} onClick={() => handleQ(2, 'A', false)}>A) A website on the internet</div>
                <div className={`mcq-opt ${q2 === 'correct' ? 'selected correct' : ''}`} onClick={() => handleQ(2, 'B', true)}>B) Your laptop, listening at door 8080</div>
                <div className={`mcq-opt ${q2 === 'C' ? 'selected wrong' : ''}`} onClick={() => handleQ(2, 'C', false)}>C) VS Code's built-in browser</div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>3. Why did Maven download things during the first run?</h4>
                <div className={`mcq-opt ${q3 === 'A' ? 'selected wrong' : ''}`} onClick={() => handleQ(3, 'A', false)}>A) It was installing VS Code</div>
                <div className={`mcq-opt ${q3 === 'correct' ? 'selected correct' : ''}`} onClick={() => handleQ(3, 'B', true)}>B) It was downloading Spring Boot and its dependencies</div>
                <div className={`mcq-opt ${q3 === 'C' ? 'selected wrong' : ''}`} onClick={() => handleQ(3, 'C', false)}>C) It was backing up your files</div>
              </div>

              {q1 === 'correct' && q2 === 'correct' && q3 === 'correct' && (
                <div style={{ animation: 'slideIn 0.5s' }}>
                  <div className="success-card">
                    <h3 style={{ margin: '0 0 8px 0', color: '#065F46' }}>Awesome! Now in your own words:</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#065F46' }}>In one sentence — what just happened when you typed localhost:8080 in your browser?</p>
                    <textarea 
                      className="reflection-box"
                      placeholder="When I typed localhost:8080, my browser sent a request to..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                    />
                    <div className={`word-count ${sentences >= 1 ? 'ok' : ''}`}>
                      {sentences} / 1 sentence minimum
                    </div>
                  </div>

                  <button 
                    className="btn green" 
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem', opacity: sentences >= 1 ? 1 : 0.5 }}
                    disabled={sentences < 1 || submitted}
                    onClick={() => { play("submit"); setSubmitted(true); }}
                  >
                    {submitted ? "Completed ✅" : "Submit & Continue →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ position: 'sticky', top: '24px' }}>
              <div className="mockup-browser">
                <div className="mockup-header">
                  <div className="mockup-url">localhost:8080</div>
                </div>
                <div className="mockup-body" style={{ minHeight: '150px' }}>
                  <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Whitelabel Error Page</h2>
                  
                  {q1 === 'correct' && (
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: '#10B981', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', animation: 'slideIn 0.3s' }}>
                      Whitelabel = running ✅
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '40px' }}>🌐</div>
                  <div style={{ flex: 1, height: '4px', background: '#CBD5E1', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: '#64748B' }}>Request</div>
                  </div>
                  <div style={{ fontSize: '50px' }}>💻</div>
                </div>
                <h3 style={{ margin: '20px 0 0 0', color: '#1E293B' }}>You are the server now.</h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                  {q2 === 'correct' && <div className="pill" style={{ animation: 'slideIn 0.3s' }}>localhost = this laptop</div>}
                  {q2 === 'correct' && <div className="pill" style={{ animation: 'slideIn 0.3s' }}>8080 = port/door</div>}
                  {q3 === 'correct' && <div className="pill" style={{ animation: 'slideIn 0.3s' }}>pom.xml = shopping list</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
