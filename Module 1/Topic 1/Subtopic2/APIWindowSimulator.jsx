import React, { useState, useEffect } from 'react';

const SCENARIOS = {
  chai: {
    id: 'chai',
    label: '🍵 Chai Shop',
    pairs: [
      { req: "Show me today's snacks menu", res: "Samosa ₹10, Bread Pakoda ₹15, Bun Maska ₹12" },
      { req: "How many cups of chai are left?", res: "43 cups available right now" },
      { req: "Save my order — 2 cutting chai", res: "Done! Your order is saved. Total: ₹20" }
    ]
  },
  gym: {
    id: 'gym',
    label: '🏋️ Gym',
    pairs: [
      { req: "Show me available slots for tomorrow", res: "6AM, 8AM, 5PM, 7PM slots are free" },
      { req: "How many members joined this month?", res: "14 new members joined in June" },
      { req: "Book the 6AM slot for me", res: "Done! 6AM slot booked in your name" }
    ]
  },
  mess: {
    id: 'mess',
    label: '🍱 Mess',
    pairs: [
      { req: "What is today's lunch menu?", res: "Rice, Dal, Sabzi, Roti, Buttermilk" },
      { req: "How many students ate today?", res: "187 students checked in for lunch" },
      { req: "Mark my attendance for today's dinner", res: "Done! Dinner attendance marked for you" }
    ]
  },
  hotel: {
    id: 'hotel',
    label: '🏨 Hotel',
    pairs: [
      { req: "Show me rooms available tonight", res: "3 rooms available — AC Double, Non-AC Single, Suite" },
      { req: "What time is checkout tomorrow?", res: "Checkout is at 11AM. Late checkout available till 2PM" },
      { req: "Book the AC Double room for tonight", res: "Done! AC Double room booked. Key at reception" }
    ]
  }
};

// Web Audio API helper for sound effects
let audioCtx = null;
const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playSound = (type) => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    if (type === 'send') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'window') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'process') {
      // robotic blips
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 - i * 100, ctx.currentTime + i * 0.2);
        
        const gn = ctx.createGain();
        gn.connect(ctx.destination);
        gn.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
        gn.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.02);
        gn.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.1);
        
        osc.connect(gn);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.1);
      }
    } else if (type === 'complete') {
      // Success chord C major
      const freqs = [523.25, 659.25, 783.99, 1046.50]; 
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(gn);
        gn.connect(ctx.destination);
        gn.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gn.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.1 + 0.1);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 1.5);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 1.5);
      });
    }
  } catch (e) {
    console.error("Audio failed", e);
  }
};

export default function APIWindowSimulator() {
  const [selectedScenario, setSelectedScenario] = useState('chai');
  const [progress, setProgress] = useState(0);
  const [conversations, setConversations] = useState([]);
  
  const [animating, setAnimating] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [activePair, setActivePair] = useState(null);

  const [taskText, setTaskText] = useState('');
  const [taskSubmitted, setTaskSubmitted] = useState(false);

  const sentenceCount = (taskText.match(/[.!?]+(\s|$)/g) || []).length;
  const isSubmitReady = sentenceCount >= 3;

  const currentScenario = SCENARIOS[selectedScenario];
  const isComplete = progress >= 3;

  const handleScenarioChange = (id) => {
    if (animating) return;
    setSelectedScenario(id);
    setProgress(0);
    setConversations([]);
    setAnimationStage(0);
    setActivePair(null);
  };

  const handleSend = (pair) => {
    if (animating) return;
    
    // Resume audio context inside user gesture
    getAudioCtx();
    
    setActivePair(pair);
    setAnimating(true);
    setAnimationStage(1); // Bubble starts at Screen
    playSound('send');

    setTimeout(() => {
      setAnimationStage(2); // Bubble moves to Window
      playSound('window');

      setTimeout(() => {
        setAnimationStage(3); // Bubble moves to Brain

        setTimeout(() => {
          setAnimationStage(4); // Brain processes
          playSound('process');

          setTimeout(() => {
            setAnimationStage(5); // Response bubble spawns at Brain

            setTimeout(() => {
              setAnimationStage(6); // Response moves to Window
              playSound('window');

              setTimeout(() => {
                setAnimationStage(7); // Response moves to Screen

                setTimeout(() => {
                  setAnimationStage(8); // Display on Screen
                  playSound('receive');

                  setTimeout(() => {
                    const nextProgress = progress + 1;
                    if (nextProgress >= 3) {
                      setTimeout(() => playSound('complete'), 400);
                    }
                    
                    setConversations(prev => [...prev, pair]);
                    setProgress(nextProgress);
                    setAnimating(false);
                    setAnimationStage(0);
                    setActivePair(null);
                  }, 3000); // Wait 3s so the user can read the response on the phone UI
                }, 800);
              }, 50);
            }, 800);
          }, 1500); // 1.5s brain processing
        }, 800);
      }, 800);
    }, 50);
  };

  const preventPasteAndRightClick = (e) => {
    e.preventDefault();
  };

  // Determine bubble properties
  let bubbleClass = 'floating-bubble ';
  let bubbleText = '';
  const showBubble = (animationStage >= 1 && animationStage <= 3) || (animationStage >= 5 && animationStage <= 7);

  if (animationStage >= 1 && animationStage <= 3) {
    bubbleClass += 'bubble-req ';
    bubbleText = activePair?.req || '';
  } else if (animationStage >= 5 && animationStage <= 7) {
    bubbleClass += 'bubble-res ';
    bubbleText = activePair?.res || '';
  }

  if (animationStage === 1 || animationStage === 8 || animationStage === 7) {
    bubbleClass += 'pos-screen';
  } else if (animationStage === 2 || animationStage === 6) {
    bubbleClass += 'pos-window';
  } else if (animationStage === 3 || animationStage === 4 || animationStage === 5) {
    bubbleClass += 'pos-brain';
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      color: '#1f2937',
      lineHeight: '1.5'
    }}>
      
      {/* Scenario Selector */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Pick a place you know</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {Object.values(SCENARIOS).map(scen => (
            <button
              key={scen.id}
              onClick={() => handleScenarioChange(scen.id)}
              disabled={animating}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                cursor: animating ? 'not-allowed' : 'pointer',
                backgroundColor: selectedScenario === scen.id ? '#1f2937' : '#e5e7eb',
                color: selectedScenario === scen.id ? '#ffffff' : '#4b5563',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s',
                boxShadow: selectedScenario === scen.id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {scen.label}
            </button>
          ))}
        </div>
      </div>

      {/* The 3 Boxes Container */}
      <div className="simulator-container" style={{
        backgroundColor: '#f9fafb',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '1px solid #e5e7eb'
      }}>
        
        {/* Floating Bubble */}
        <div className={bubbleClass} style={{
          opacity: showBubble ? 1 : 0,
          pointerEvents: 'none'
        }}>
          {bubbleText}
        </div>

        {/* LEFT: The Screen */}
        <div className="sim-box" style={{
          backgroundColor: '#EFF6FF',
          border: '2px solid #3B82F6',
          boxShadow: animationStage === 8 ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
          transform: animationStage === 8 ? 'scale(1.02)' : 'scale(1)'
        }}>
          <div style={{
            backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '12px', fontWeight: '800', 
            padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', 
            letterSpacing: '0.05em', marginBottom: '16px', border: '1px solid #BFDBFE'
          }}>Frontend</div>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
          <h3 style={{ margin: '0 0 4px', color: '#1E40AF', fontSize: '18px' }}>The Screen</h3>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#3B82F6' }}>Your phone</p>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            height: '140px',
            border: '2px solid #BFDBFE',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', color: '#6b7280' }}>
              {currentScenario.label} App
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
              {animationStage >= 1 && activePair && (
                <div style={{
                  alignSelf: 'flex-end',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: '12px 12px 0 12px',
                  fontSize: '11px',
                  maxWidth: '90%',
                  textAlign: 'right',
                  animation: 'popIn 0.3s'
                }}>
                  {activePair.req}
                </div>
              )}
              {animationStage === 8 && activePair && (
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#10B981',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: '12px 12px 12px 0',
                  fontSize: '11px',
                  maxWidth: '90%',
                  textAlign: 'left',
                  animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  {activePair.res}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE: The Window */}
        <div className="sim-box" style={{
          backgroundColor: '#F5F3FF',
          border: `3px solid ${(animationStage === 2 || animationStage === 6) ? '#8B5CF6' : '#C4B5FD'}`,
          boxShadow: (animationStage === 2 || animationStage === 6) ? '0 0 25px rgba(139, 92, 246, 0.5)' : 'none',
          transform: (animationStage === 2 || animationStage === 6) ? 'scale(1.05)' : 'scale(1)',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: '#EDE9FE', color: '#6D28D9', fontSize: '12px', fontWeight: '800', 
            padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', 
            letterSpacing: '0.05em', marginBottom: '16px', border: '1px solid #DDD6FE'
          }}>API</div>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '8px',
            transition: 'all 0.3s',
            transform: (animationStage === 2 || animationStage === 6) ? 'scale(1.2)' : 'scale(1)'
          }}>
            {(animationStage === 2 || animationStage === 6) ? '🪟' : '🚪'}
          </div>
          <h3 style={{ margin: '0 0 4px', color: '#5B21B6', fontSize: '20px' }}>The Window</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#8B5CF6', fontWeight: '500' }}>The only way they talk</p>

          <div style={{ height: '24px', marginTop: '16px' }}>
            {animationStage === 2 && (
              <span style={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
                Opening for request...
              </span>
            )}
            {animationStage === 6 && (
              <span style={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
                Opening for response...
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: The Brain + Notebook */}
        <div className="sim-box" style={{
          backgroundColor: '#ECFDF5',
          border: `2px solid ${animationStage === 4 ? '#10B981' : '#6EE7B7'}`,
          boxShadow: animationStage === 4 ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none',
          transform: animationStage === 4 ? 'scale(1.05)' : 'scale(1)'
        }}>
          <div style={{
            backgroundColor: '#D1FAE5', color: '#047857', fontSize: '12px', fontWeight: '800', 
            padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', 
            letterSpacing: '0.05em', marginBottom: '16px', border: '1px solid #A7F3D0'
          }}>Backend & Database</div>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {animationStage === 4 ? '⚡🧠⚡' : '💡📚'}
          </div>
          <h3 style={{ margin: '0 0 4px', color: '#065F46', fontSize: '18px' }}>The Brain + Notebook</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#10B981' }}>Works behind the scenes</p>
          
          <div style={{ height: '40px', marginTop: '16px' }}>
            {animationStage === 4 && (
              <div style={{
                backgroundColor: '#10B981', color: 'white', padding: '6px 12px',
                borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold',
                animation: 'pulse 1s infinite'
              }}>
                Checking the database...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Buttons */}
      {!isComplete && (
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ margin: '0 0 16px', color: '#4b5563', fontSize: '18px' }}>Send a request from your phone:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentScenario.pairs.map((pair, idx) => {
              const isSent = conversations.some(c => c.req === pair.req) || activePair?.req === pair.req;
              if (isSent && activePair?.req !== pair.req) return null; // Hide finished ones
              
              return (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  opacity: animating && activePair?.req !== pair.req ? 0.4 : 1,
                  transform: activePair?.req === pair.req ? 'scale(1.02)' : 'scale(1)',
                  borderLeft: activePair?.req === pair.req ? '4px solid #3B82F6' : '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}>
                  <span style={{ fontWeight: '500', fontSize: '16px', color: '#1f2937' }}>"{pair.req}"</span>
                  <button
                    onClick={() => handleSend(pair)}
                    disabled={animating}
                    style={{
                      backgroundColor: activePair?.req === pair.req ? '#9CA3AF' : '#3B82F6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: animating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {activePair?.req === pair.req ? 'Sending...' : 'Send request →'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation Log */}
      {conversations.length > 0 && (
        <div style={{ marginBottom: '40px', animation: 'fadeIn 0.5s' }}>
          <h4 style={{ margin: '0 0 16px', color: '#4b5563', fontSize: '18px' }}>The conversation so far:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            {conversations.map((c, idx) => (
              <div key={idx} style={{ 
                borderBottom: idx < conversations.length - 1 ? '1px solid #e5e7eb' : 'none', 
                paddingBottom: idx < conversations.length - 1 ? '16px' : '0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', marginBottom: '8px', fontWeight: '600' }}>
                  <span style={{ fontSize: '18px' }}>📱</span> You asked: "{c.req}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: '600' }}>
                  <span style={{ fontSize: '18px' }}>🧠</span> Answer came back: "{c.res}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion & Reveal */}
      {isComplete && (
        <div style={{ animation: 'fadeIn 1s', marginBottom: '40px' }}>
          <p style={{
            fontSize: '18px',
            color: '#374151',
            textAlign: 'center',
            marginBottom: '32px',
            backgroundColor: '#F3F4F6',
            padding: '24px',
            borderRadius: '12px',
            lineHeight: '1.6'
          }}>
            You just watched 3 full conversations through the window.<br/>
            <strong>Request goes out. Answer comes back. That is all an API is.</strong><br/>
            Every app in the world works exactly like this.
          </p>

          <div style={{
            backgroundColor: '#FFFBEB',
            borderLeft: '6px solid #F59E0B',
            padding: '32px',
            borderRadius: '0 12px 12px 0',
            marginBottom: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#B45309', fontSize: '24px' }}>You just used an API 🎉</h3>
            <p style={{ margin: '0 0 16px', color: '#78350F', fontSize: '16px' }}>
              That window between the Screen and the Brain?<br/>
              The whole world calls it an <strong>API</strong>.
            </p>
            <p style={{ margin: '0 0 16px', color: '#92400E', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '8px', display: 'inline-block' }}>
              API = the window through which apps talk to each other.
            </p>
            <p style={{ margin: '0', color: '#78350F', fontSize: '16px', lineHeight: '1.6' }}>
              When you build your neighbourhood app —<br/>
              your screen will send requests through YOUR API.<br/>
              Your backend will send answers back through YOUR API.<br/><br/>
              You already understand how. You just watched it happen.
            </p>
          </div>

          {/* TASK SECTION */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '26px', color: '#111827' }}>Before you move forward 🙏</h3>
            <div style={{ color: '#4b5563', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '16px' }}>
                You just watched a request travel from the screen, through the window, to the brain — and the answer come back the same way.
              </p>
              <p style={{ marginBottom: '16px' }}>
                In your own words — <strong>explain what the window does. Why does it exist? What would happen without it?</strong>
              </p>
              <p style={{ marginBottom: '24px' }}>
                Write like you are explaining to your classmate who missed today's session.
              </p>
              <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #6B7280' }}>
                <p style={{ fontWeight: '600', color: '#374151', margin: 0 }}>
                  Your own words only. No copying. No ChatGPT.<br/>
                  Simple and real beats perfect and fake. Always.<br/>
                  Your mentor will read this to understand how you think.
                </p>
              </div>
            </div>

            {!taskSubmitted ? (
              <div>
                <textarea
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onPaste={preventPasteAndRightClick}
                  onContextMenu={preventPasteAndRightClick}
                  placeholder="Explain the window in your own words..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #D1D5DB',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    marginBottom: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: isSubmitReady ? '#10B981' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {sentenceCount >= 3 ? (
                      <><span style={{ fontSize: '20px' }}>✅</span> 3+ sentences written. Ready to submit.</>
                    ) : (
                      <><span style={{ fontSize: '20px' }}>✍️</span> {sentenceCount} of 3 sentences written</>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setTaskSubmitted(true)}
                    disabled={!isSubmitReady}
                    style={{
                      backgroundColor: isSubmitReady ? '#111827' : '#E5E7EB',
                      color: isSubmitReady ? 'white' : '#9CA3AF',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: isSubmitReady ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s',
                      boxShadow: isSubmitReady ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                      transform: isSubmitReady ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    I wrote this myself — submit →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '2px solid #10B981',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>
                <h4 style={{ margin: '0 0 12px', color: '#065F46', fontSize: '22px' }}>
                  Well done, friend.
                </h4>
                <p style={{ margin: '0', color: '#047857', fontSize: '16px', lineHeight: '1.6' }}>
                  You just explained an API in your own words.<br/>
                  Most developers take weeks to understand this.<br/>
                  You got it on Day 1. Keep going. 🚀
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* Container styles */
        .simulator-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .sim-box {
          flex: 1;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 260px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 768px) {
          .simulator-container {
            flex-direction: row;
          }
        }

        /* Floating Bubble Styles */
        .floating-bubble {
          position: absolute;
          z-index: 50;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translate(-50%, -50%);
          max-width: 250px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bubble-req {
          background-color: #3B82F6;
          color: white;
          border: 2px solid #2563EB;
        }
        
        .bubble-res {
          background-color: #10B981;
          color: white;
          border: 2px solid #059669;
        }

        /* Mobile Positions (Vertical Layout) */
        .pos-screen { top: 16.6%; left: 50%; }
        .pos-window { top: 50%; left: 50%; }
        .pos-brain  { top: 83.3%; left: 50%; }

        /* Desktop Positions (Horizontal Layout) */
        @media (min-width: 768px) {
          .pos-screen { top: 50%; left: 16.6%; }
          .pos-window { top: 50%; left: 50%; }
          .pos-brain  { top: 50%; left: 83.3%; }
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
