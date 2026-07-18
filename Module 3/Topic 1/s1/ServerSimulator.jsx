import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  .sim-root { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; min-height: 100vh; padding: 24px 16px; color: #1E293B; line-height: 1.5; }
  .sim-root * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .split-layout { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: start; max-width: 1100px; margin: 0 auto; }
  @media(max-width:900px) { .split-layout { grid-template-columns: 1fr; } }
  
  .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 24px; transition: all 0.3s; border-left: 4px solid transparent; }
  .card.active { border-left-color: #3B82F6; box-shadow: 0 8px 24px rgba(59,130,246,0.15); }
  .card.complete { border-left-color: #10B981; }
  .card.future { opacity: 0.5; pointer-events: none; }
  
  .card-header { font-size: 1.3rem; font-weight: 700; margin: 0 0 16px 0; color: #1E293B; }
  
  .btn { background: #3B82F6; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-block; width: 100%; text-align: center; }
  .btn:hover { background: #2563EB; }
  .btn:disabled { background: #9CA3AF; cursor: not-allowed; }
  .btn.green { background: #10B981; }
  .btn.green:hover { background: #059669; }

  /* Scene 1 Visual */
  .s1-visual { display: flex; align-items: center; justify-content: space-between; padding: 40px 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; position: relative; min-height: 200px; }
  .s1-node { display: flex; flex-direction: column; align-items: center; z-index: 10; width: 100px; }
  .s1-icon { font-size: 48px; background: white; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; }
  .s1-label { font-weight: 600; font-size: 0.9rem; margin-top: 8px; color: #475569; text-align: center; }
  
  .s1-wire { position: absolute; top: 50%; left: 0; width: 100%; height: 4px; border-top: 4px dashed #94A3B8; z-index: 1; transform: translateY(-50%); }
  .s1-wire.fail { border-top-color: #EF4444; }
  .s1-wire.success { border-top: 4px solid #10B981; }

  /* Scene 2 Choices */
  .choice-btn { background: white; border: 2px solid #E2E8F0; border-radius: 8px; padding: 16px; width: 100%; text-align: left; font-size: 1rem; color: #334155; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
  .choice-btn:hover { border-color: #3B82F6; background: #EFF6FF; }
  
  /* Scene 2 Chai Visual */
  .chai-visual { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 24px; min-height: 250px; position: relative; overflow: hidden; }
  .chai-counter { position: absolute; bottom: 20px; left: 10%; width: 80%; height: 60px; background: #B45309; border-radius: 8px; box-shadow: 0 -4px 0 #92400E inset; z-index: 5; display: flex; justify-content: center; align-items: flex-start; }
  .chai-server { font-size: 60px; z-index: 4; position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); }
  .chai-customer { font-size: 50px; position: absolute; bottom: 10px; left: 10%; z-index: 10; animation: walkIn 0.5s ease-out forwards; }
  .chai-bubble { position: absolute; top: 20px; left: 10%; background: white; padding: 12px 16px; border-radius: 12px; border: 2px solid #E2E8F0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: 600; z-index: 15; max-width: 200px; font-size: 0.9rem; animation: popIn 0.3s; }
  .chai-bubble::after { content: ''; position: absolute; bottom: -8px; left: 20px; border-width: 8px 8px 0; border-style: solid; border-color: white transparent transparent transparent; }
  .chai-data { position: absolute; bottom: 10px; right: 5%; font-size: 40px; z-index: 2; opacity: 0.8; }

  /* Scene 2 Logs */
  .log-panel { background: #1E293B; color: #E2E8F0; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.85rem; height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
  .log-entry { background: #0F172A; padding: 12px; border-radius: 6px; border-left: 3px solid #3B82F6; animation: slideIn 0.3s; }
  .log-req { color: #38BDF8; margin-bottom: 4px; }
  .log-res { color: #4ADE80; margin-bottom: 4px; }
  .log-err { border-left-color: #EF4444; }
  .log-err .log-res { color: #F87171; }

  /* Scene 3 — Full width stacked design */
  .s3-section { margin-top: 20px; }
  .s3-banner { display: flex; align-items: stretch; gap: 0; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; margin-bottom: 20px; }
  .s3-side { flex: 1; padding: 20px 24px; }
  .s3-side.red { background: #FEF2F2; border-right: 2px solid #FECACA; }
  .s3-side.green { background: #F0FDF4; }
  .s3-side-title { font-weight: 800; font-size: 1rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .s3-side.red .s3-side-title { color: #B91C1C; }
  .s3-side.green .s3-side-title { color: #065F46; }
  
  .s3-time { text-align: center; font-size: 2rem; font-weight: 900; margin-bottom: 6px; }
  .s3-time.red { color: #DC2626; }
  .s3-time.green { color: #10B981; }
  .s3-time-label { text-align: center; font-size: 0.8rem; color: #64748B; margin-bottom: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  .blur-code { background: #1E293B; padding: 12px; border-radius: 6px; margin-bottom: 12px; position: relative; overflow: hidden; }
  .blur-code::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(3px); background: rgba(30,41,59,0.5); }
  .blur-line { height: 6px; background: #334155; border-radius: 3px; margin-bottom: 6px; }
  
  .clean-code { background: white; border: 1px solid #BBF7D0; padding: 12px; border-radius: 6px; margin-bottom: 12px; font-family: monospace; font-size: 0.85rem; color: #065F46; line-height: 1.6; }
  
  .check-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
  .check-list li { margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-weight: 500; }
  .check-list.red li { color: #7F1D1D; }
  .check-list.green li { color: #065F46; }

  /* Misc */
  .reveal-card { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 24px; margin-top: 24px; }
  .reveal-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 1.05rem; animation: slideIn 0.4s ease-out; }
  
  .reflection-box { width: 100%; border: 2px solid #E2E8F0; border-radius: 8px; padding: 16px; font-size: 1.05rem; font-family: inherit; resize: vertical; min-height: 120px; outline: none; margin-top: 12px; line-height: 1.5; }
  .reflection-box:focus { border-color: #3B82F6; }
  .word-count { text-align: right; font-size: 0.9rem; color: #64748B; margin-top: 8px; font-weight: 600; }
  .word-count.ok { color: #10B981; }

  .warn-msg { background: #FFFBEB; color: #D97706; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #F59E0B; font-weight: 600; font-size: 0.95rem; margin-bottom: 16px; animation: shake 0.4s; }

  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes walkIn { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
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

      if (type === "warn") {
        makeOsc(330, 0, 0.2);
        makeOsc(277, 0.1, 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      } else if (type === "correct") {
        [523, 659, 784].forEach((f, i) => makeOsc(f, i * 0.1, 0.15));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
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

export default function ServerSimulator() {
  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  
  const [scene, setScene] = useState(1);
  
  // Scene 1
  const [s1State, setS1State] = useState(0); // 0: initial, 1: fail, 2: success
  
  // Scene 2
  const [reqNum, setReqNum] = useState(1);
  const [logs, setLogs] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  
  // Scene 3 / Task
  const [revealLines, setRevealLines] = useState(0);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    muted.current = !isMuted;
  };

  const tryDirectConnect = () => {
    setS1State(1);
    play("warn");
  };

  const addServer = () => {
    setS1State(2);
    play("correct");
    setTimeout(() => {
      setScene(2);
      play("tick");
    }, 2500);
  };

  const handleChoice = (isCorrect, reqText, resText, errText) => {
    if (isCorrect) {
      setErrMsg("");
      play("correct");
      setLogs(prev => [...prev, { req: reqText, res: resText, ok: true }]);
      if (reqNum < 3) {
        setTimeout(() => setReqNum(r => r + 1), 1000);
      } else {
        setTimeout(() => {
          setScene(3);
          play("tick");
        }, 1500);
      }
    } else {
      setErrMsg(errText);
      play("warn");
    }
  };

  const renderChoices = () => {
    if (reqNum === 1) {
      return (
        <>
          <div style={{ margin: '16px 0', fontWeight: 600 }}>Customer: "Give me the gym members list"</div>
          <button className="choice-btn" onClick={() => handleChoice(true, "Give me gym members", "Here is the list: Ravi, Suresh, Priya", "")}>
            A) Here is the list: Ravi, Suresh, Priya ✅
          </button>
          <button className="choice-btn" onClick={() => handleChoice(false, "", "", "A server tries to help. Try Button A.")}>
            B) Error — I don't understand ❌
          </button>
        </>
      );
    } else if (reqNum === 2) {
      return (
        <>
          <div style={{ margin: '16px 0', fontWeight: 600 }}>Customer: "Is Room 101 available?"</div>
          <button className="choice-btn" onClick={() => handleChoice(true, "Is Room 101 available?", "Yes, Room 101 is free", "")}>
            A) Yes — Room 101 is free ✅
          </button>
          <button className="choice-btn" onClick={() => handleChoice(false, "", "", "That response doesn't match the request. A server must respond to what was asked.")}>
            B) Here is the gym members list ❌
          </button>
          <button className="choice-btn" onClick={() => handleChoice(false, "", "", "A good server never crashes. It always sends SOMETHING back.")}>
            C) Error — I crashed ❌
          </button>
        </>
      );
    } else if (reqNum === 3) {
      return (
        <>
          <div style={{ margin: '16px 0', fontWeight: 600 }}>Customer: "xzqwerty??##@@"</div>
          <button className="choice-btn" onClick={() => handleChoice(false, "", "", "A good server never crashes. It handles bad requests gracefully.")}>
            A) I crashed completely ❌
          </button>
          <button className="choice-btn" onClick={() => handleChoice(true, "[invalid request]", "Error - I don't understand", "")}>
            B) I don't understand this request, please try again ✅
          </button>
          <button className="choice-btn" onClick={() => handleChoice(false, "", "", "Don't leak data on invalid requests!")}>
            C) Here is everything I have ❌
          </button>
        </>
      );
    }
  };

  const handleReveal = () => {
    setScene(4);
    play("reveal");
    let count = 0;
    const intv = setInterval(() => {
      count++;
      setRevealLines(count);
      if (count < 6) play("tick");
      if (count >= 6) clearInterval(intv);
    }, 600);
  };

  const sentences = (reflection.match(/[.!?]+/g) || []).length;
  const canSubmit = sentences >= 3;

  useEffect(() => {
    if (submitted) {
      try {
        const params = new URLSearchParams(window.location.search);
        window.parent.postMessage({
          type: 'HK_RESULT',
          version: '1',
          exerciseId: 'm2-t1-s1-server-simulator',
          status: 'completed',
          score: 3, maxScore: 3,
          answers: { 
            phase1: { withoutServerSeen: true, requestsHandled: { r1: 'correct', r2: 'correct', r3: 'correct' }, comparisonSeen: true },
            task: { reflectionText: reflection, mentionedCustomer: reflection.toLowerCase().includes('customer'), mentionedWaiter: reflection.toLowerCase().includes('waiter'), mentionedKitchen: reflection.toLowerCase().includes('kitchen') }
          },
          metadata: { subtopicId: params.get('subtopicId'), taskId: params.get('taskId') },
          completedAt: new Date().toISOString()
        }, '*');
      } catch(e) {}
    }
  }, [submitted]);

  return (
    <div className="sim-root">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="header">
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Server Simulator</h1>
        <button className="btn" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', padding: '8px 16px', width: 'auto' }} onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      <div className="split-layout">
        
        {/* LEFT PANEL */}
        <div>
          {/* SCENE 1 */}
          {scene === 1 && (
            <div className="card active">
              <h2 className="card-header">What happens without a server?</h2>
              <p style={{ color: '#475569', marginBottom: '24px' }}>Let's see what happens if a phone tries to read your data directly without a middleman.</p>
              
              {s1State === 0 && (
                <button className="btn" onClick={tryDirectConnect}>
                  What happens when the phone tries to get the data directly? →
                </button>
              )}

              {s1State === 1 && (
                <div style={{ animation: 'popIn 0.3s' }}>
                  <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #EF4444', marginBottom: '16px' }}>
                    <h4 style={{ color: '#B91C1C', margin: '0 0 8px 0' }}>Cannot connect ❌</h4>
                    <p style={{ color: '#7F1D1D', margin: 0 }}>The phone has no way to reach your data directly. They speak different languages. They are in different places. They need someone in the middle.<br/><br/><b>They need a server.</b></p>
                  </div>
                  <button className="btn green" onClick={addServer}>
                    Add the server →
                  </button>
                </div>
              )}

              {s1State === 2 && (
                <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10B981', color: '#065F46', fontWeight: 'bold' }}>
                  Server added! Connections established. ✅
                </div>
              )}
            </div>
          )}

          {/* SCENE 2 */}
          {scene === 2 && (
            <div className="card active" style={{ animation: 'slideIn 0.3s' }}>
              <h2 className="card-header">Now YOU are the server 🍵</h2>
              <p style={{ color: '#475569' }}>Requests are coming in. You decide what to send back. This is exactly what Spring Boot does.</p>
              
              {errMsg && <div className="warn-msg">{errMsg}</div>}
              
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                {renderChoices()}
              </div>
            </div>
          )}

          {/* SCENE 3 */}
          {(scene === 3 || scene === 4) && (
            <div className="card active" style={{ animation: 'slideIn 0.3s' }}>
              <h2 className="card-header">Writing this yourself takes weeks.<br/>Spring Boot does it in 5 minutes.</h2>
              <p style={{ color: '#475569' }}>You just did what a server does: received a request, figured it out, and responded gracefully. Writing that from scratch in Java is painful.</p>
              
              <div className="s3-section">
                <div className="s3-banner">
                  <div className="s3-side red">
                    <div className="s3-time red">~2 weeks</div>
                    <div className="s3-time-label">Without a framework</div>
                    <div className="s3-side-title">❌ What you'd write yourself</div>
                    <div className="blur-code">
                      <div className="blur-line" style={{ width: '85%' }}></div>
                      <div className="blur-line" style={{ width: '60%' }}></div>
                      <div className="blur-line" style={{ width: '75%' }}></div>
                      <div className="blur-line" style={{ width: '90%' }}></div>
                      <div className="blur-line" style={{ width: '50%' }}></div>
                    </div>
                    <ul className="check-list red">
                      <li>❌ Handle connections manually</li>
                      <li>❌ Parse every request by hand</li>
                      <li>❌ Format every response yourself</li>
                      <li>❌ Manage threads yourself</li>
                      <li>❌ Handle every crash yourself</li>
                    </ul>
                  </div>

                  <div className="s3-side green">
                    <div className="s3-time green">5 minutes</div>
                    <div className="s3-time-label">With the framework</div>
                    <div className="s3-side-title">✅ What you actually write</div>
                    <div className="clean-code">
                      Tell the framework:<br/>
                      → I am a server<br/>
                      → /gym/members → give list<br/>
                      → /room/101 → check room<br/>
                      <br/>
                      Framework handles everything else.
                    </div>
                    <ul className="check-list green">
                      <li>✅ Connections handled</li>
                      <li>✅ Request parsing handled</li>
                      <li>✅ Response formatting handled</li>
                      <li>✅ Thread management handled</li>
                      <li>✅ Error handling handled</li>
                    </ul>
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, color: '#334155', fontSize: '1.1rem', margin: '0 0 16px 0' }}>That framework is what we use in this module.</p>
              </div>
              
              {scene === 3 && (
                <button className="btn" style={{ marginTop: '16px' }} onClick={handleReveal}>I understand what a server is →</button>
              )}
            </div>
          )}

          {/* TASK */}
          {scene === 4 && (
            <div className="card" style={{ borderLeft: '4px solid #F59E0B', animation: 'slideIn 0.3s' }}>
              <h2 className="card-header" style={{ fontSize: '1.6rem' }}>Before you move forward 🙏</h2>
              <p style={{ color: '#475569' }}>
                You just played the role of a server.<br/><br/>
                In your own words — explain what a server does, using the chai shop analogy.
                Who is the customer? Who is the waiter? What is the kitchen?<br/><br/>
                <b>Write it for your neighbourhood project. Explain it like you are telling a friend.</b>
              </p>
              
              <textarea 
                className="reflection-box"
                placeholder="In my gym app, the server is like the waiter at a chai shop. The customer is..."
                value={reflection}
                onChange={e => setReflection(e.target.value)}
              />
              <div className={`word-count ${sentences >= 3 ? 'ok' : ''}`}>{sentences} / 3 sentences minimum</div>

              <button 
                className="btn green" 
                style={{ padding: '16px', fontSize: '1.1rem', marginTop: '24px', opacity: canSubmit ? 1 : 0.5 }}
                disabled={!canSubmit || submitted}
                onClick={() => { play("submit"); setSubmitted(true); }}
              >
                {submitted ? "Completed ✅" : "I understand servers — let's build one →"}
              </button>

              {submitted && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#F0FDF4', borderRadius: '8px', color: '#065F46', textAlign: 'center', animation: 'popIn 0.3s' }}>
                  <b>Perfect. You understand why servers exist.</b><br/>
                  Next — you will create one. Download Spring Boot. Run it. See your laptop serve a response for the first time.
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - VISUALIZER */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            
            {scene === 1 && (
              <div className="s1-visual">
                <div className={`s1-wire ${s1State === 1 ? 'fail' : s1State === 2 ? 'success' : ''}`}></div>
                
                <div className="s1-node">
                  <div className="s1-icon">📱</div>
                  <div className="s1-label">Phone<br/>"Want gym members"</div>
                </div>

                {s1State === 2 && (
                  <div className="s1-node" style={{ animation: 'popIn 0.4s' }}>
                    <div className="s1-icon" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>🧑‍🍳</div>
                    <div className="s1-label">Server</div>
                  </div>
                )}

                <div className="s1-node">
                  <div className="s1-icon" style={{ background: '#F1F5F9' }}>🗄️</div>
                  <div className="s1-label">Data<br/>[Ravi, Suresh...]</div>
                </div>
              </div>
            )}

            {scene === 2 && (
              <>
                <div className="chai-visual">
                  <div className="chai-counter"></div>
                  <div className="chai-server">🧑‍🍳</div>
                  <div className="chai-data">🗄️</div>
                  <div className="chai-customer" key={reqNum}>🚶</div>
                  <div className="chai-bubble" key={`bubble-${reqNum}`}>
                    {reqNum === 1 ? "Give me the gym members list" : reqNum === 2 ? "Is Room 101 available?" : "xzqwerty??##@@"}
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Server Logs:</h4>
                  <div className="log-panel">
                    {logs.map((log, i) => (
                      <div key={i} className={`log-entry ${!log.ok ? 'log-err' : ''}`}>
                        <div className="log-req">📥 Req: {log.req}</div>
                        <div className="log-res">📤 Res: {log.res}</div>
                        <div>{log.ok ? '✅ Success' : '❌ Failed'}</div>
                      </div>
                    ))}
                    {logs.length === 0 && <div style={{ color: '#475569', fontStyle: 'italic' }}>Waiting for requests...</div>}
                  </div>
                </div>
              </>
            )}

            {scene >= 4 && (
              <div className="reveal-card">
                <h2 style={{ margin: '0 0 20px 0', color: '#92400E' }}>Server Summary</h2>
                {revealLines >= 1 && <div className="reveal-line">✅ <b>Server</b> → program that receives requests & sends responses</div>}
                {revealLines >= 2 && <div className="reveal-line">✅ <b>HTTP Request</b> → how any device asks a server for something</div>}
                {revealLines >= 3 && <div className="reveal-line">✅ <b>HTTP Response</b> → what the server sends back</div>}
                {revealLines >= 4 && <div className="reveal-line">✅ <b>Framework</b> → pre-built tools that handle the boring parts</div>}
                {revealLines >= 5 && <div className="reveal-line">✅ <b>Spring Boot</b> → popular Java web framework (hires the waiter)</div>}
                {revealLines >= 6 && <div className="reveal-line">✅ <b>Port 8080</b> → the door your server listens on (localhost = your laptop)</div>}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
