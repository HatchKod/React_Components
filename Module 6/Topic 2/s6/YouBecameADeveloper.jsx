import React, { useState, useEffect, useRef, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

  .yd-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #0F172A; min-height: 100vh; color: #FFFFFF; position: relative; }
  .yd-root * { box-sizing: border-box; }

  .yd-mute-btn { position: fixed; top: 18px; right: 18px; background: transparent; color: #475569; border: 1px solid #334155; border-radius: 20px; padding: 6px 14px; font-size: 0.72rem; cursor: pointer; opacity: 0.6; transition: opacity 0.3s; z-index: 10; }
  .yd-mute-btn:hover { opacity: 1; color: #94A3B8; }

  .yd-page { max-width: 720px; margin: 0 auto; padding: 90px 24px 120px; }
  @media(max-width:600px) { .yd-page { padding: 70px 18px 100px; } }

  .yd-section { opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 60px; }
  @keyframes ydFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .yd-body { font-size: 1.2rem; line-height: 1.8; color: #E2E8F0; margin: 0 0 20px; white-space: pre-wrap; }
  .yd-body.muted { color: #94A3B8; }
  .yd-line { font-size: 1.2rem; line-height: 1.8; color: #E2E8F0; margin: 0 0 14px; opacity: 0; animation: ydFadeIn 0.8s ease-in-out forwards; }

  .yd-key-line { font-size: 1.6rem; line-height: 1.6; color: #FFFFFF; font-weight: 700; margin: 28px 0; text-align: center; }
  .yd-did-not-stop { font-size: 1.8rem; color: #F59E0B; font-weight: 800; text-align: center; margin: 36px 0; opacity: 0; animation: ydFadeIn 1.4s ease-in-out forwards; }

  .yd-url-box { display: inline-block; background: rgba(245,158,11,0.1); border: 1px solid #F59E0B; border-radius: 8px; padding: 12px 20px; color: #F59E0B; font-family: 'Fira Code', monospace; font-size: 1rem; margin: 16px 0; word-break: break-all; }
  .yd-url-caption { font-size: 0.85rem; color: #64748B; margin-top: 6px; }

  .yd-continue-btn { display: block; margin: 40px auto 0; background: transparent; color: #94A3B8; border: 1px solid #334155; border-radius: 24px; padding: 12px 32px; font-size: 0.95rem; cursor: pointer; transition: all 0.3s; }
  .yd-continue-btn:hover { border-color: #F59E0B; color: #F59E0B; }

  .yd-belief-line { font-size: 2rem; line-height: 1.5; color: #FFFFFF; font-weight: 800; text-align: center; margin: 36px 0; }

  .yd-memory-card { background: #F8FAFC; color: #1E293B; border-radius: 4px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); padding: 22px 24px; margin: 20px auto; max-width: 460px; font-size: 1.05rem; line-height: 1.6; opacity: 0; animation: ydFadeIn 1s ease-in-out forwards; }
  .yd-memory-card.m1 { transform: rotate(-1deg); }
  .yd-memory-card.m2 { transform: rotate(0.5deg); }
  .yd-memory-card.m3 { transform: rotate(1deg); }

  .yd-permanent-line { font-size: 1.8rem; line-height: 1.6; color: #FFFFFF; font-weight: 800; text-align: center; margin: 48px 0 20px; }

  .yd-question-block { text-align: center; margin-top: 40px; }
  .yd-question-text { font-size: 1.3rem; color: #E2E8F0; line-height: 1.7; margin-bottom: 24px; }
  .yd-textarea { width: 100%; background: #1E293B; color: #FFFFFF; border: none; border-radius: 8px; padding: 20px; font-size: 1.05rem; font-family: inherit; line-height: 1.7; resize: vertical; min-height: 140px; outline: none; }
  .yd-textarea::placeholder { color: #475569; }

  .yd-submit-btn { display: block; margin: 28px auto 0; background: transparent; color: #FFFFFF; border: 1px solid #FFFFFF; border-radius: 24px; padding: 14px 36px; font-size: 1.05rem; cursor: pointer; transition: all 0.3s; opacity: 0; animation: ydFadeIn 0.8s ease-in-out forwards; }
  .yd-submit-btn:hover { background: #FFFFFF; color: #0F172A; }

  /* final screen */
  .yd-final { position: fixed; inset: 0; background: #0F172A; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; z-index: 20; }
  .yd-final-logo { position: absolute; top: 28px; left: 50%; transform: translateX(-50%); font-size: 0.85rem; font-weight: 800; letter-spacing: 0.15em; color: #475569; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; }
  .yd-final-stamp { font-size: 1.6rem; font-weight: 800; letter-spacing: 0.3em; color: #FFFFFF; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 28px; text-transform: uppercase; }
  .yd-final-name { font-size: 2rem; font-weight: 800; color: #FFFFFF; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 8px; }
  .yd-final-date { font-size: 0.9rem; color: #64748B; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 28px; }
  .yd-final-stack { font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: #94A3B8; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 28px; }
  .yd-final-links { display: flex; flex-direction: column; gap: 10px; opacity: 0; animation: ydFadeIn 1.2s ease-in-out forwards; margin-bottom: 8px; }
  .yd-final-link { color: #F59E0B; text-decoration: none; font-family: 'Fira Code', monospace; font-size: 0.92rem; border-bottom: 1px solid rgba(245,158,11,0.3); padding-bottom: 2px; word-break: break-all; }
  .yd-final-link:hover { border-bottom-color: #F59E0B; }
  .yd-go-build { font-size: 1.5rem; color: #F59E0B; font-weight: 700; margin-top: 44px; opacity: 0; animation: ydFadeIn 1.6s ease-in-out forwards; }
`;

function useFinaleSounds() {
  const muted = useRef(false);
  const ctxRef = useRef(null);
  const play = useCallback((freq, dur, gainLevel = 0.2, delay = 0) => {
    if (muted.current) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime + delay);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.connect(gain);
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    } catch (e) {}
  }, []);
  const playChord = useCallback((freqs, noteDur, gap, gainLevel) => {
    freqs.forEach((f, i) => play(f, noteDur, gainLevel, i * gap));
  }, [play]);
  return { play, playChord, muted };
}

const SECTION_NOTES = [392, 440, 494, 523, 587, 659];

export default function YouBecameADeveloper() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, playChord, muted } = useFinaleSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(m => !m); muted.current = !isMuted; };

  const [visibleSection, setVisibleSection] = useState(1);
  const [showQuestion, setShowQuestion] = useState(false);
  const [memoriesShown, setMemoriesShown] = useState(0);
  const [showFinalLine6, setShowFinalLine6] = useState(false);

  // Read the learner's real name and URLs from the platform-provided query
  // params rather than hardcoding one fabricated example - every learner
  // should see their own identity and their own deployed app here, not a
  // stand-in demo student's data.
  const rawLiveUrl = params.get('liveUrl') || params.get('deployUrl') || '';
  const rawGithubUrl = params.get('githubUrl') || params.get('repoUrl') || '';
  const liveUrl = rawLiveUrl || 'your live URL';
  const githubUrl = rawGithubUrl || 'your GitHub repo';
  const studentName = params.get('studentName') || params.get('name') || 'Developer';

  function advanceSection(from) {
    play(SECTION_NOTES[from - 1] || 523, 0.9, 0.14);
    setVisibleSection(from + 1);
  }

  // Section 6 memory sequence — auto-reveals after entering section 6
  useEffect(() => {
    if (visibleSection !== 6) return;
    const timers = [];
    timers.push(setTimeout(() => { setMemoriesShown(1); play(800, 0.15, 0.12); }, 800));
    timers.push(setTimeout(() => { setMemoriesShown(2); play(800, 0.15, 0.12); }, 2000));
    timers.push(setTimeout(() => { setMemoriesShown(3); play(800, 0.15, 0.12); }, 3200));
    timers.push(setTimeout(() => { setShowFinalLine6(true); }, 4600));
    timers.push(setTimeout(() => { setShowQuestion(true); }, 9600));
    return () => timers.forEach(clearTimeout);
  }, [visibleSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const [oneMemory, setOneMemory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [showGoBuild, setShowGoBuild] = useState(false);

  function handleFinalSubmit() {
    if (!oneMemory.trim() || submitted) return;
    playChord([523, 659, 784], 0.6, 0.5, 0.15);
    setSubmitted(true);
    setTimeout(() => {
      setShowFinalScreen(true);
      setTimeout(() => {
        play(784, 0.3, 0.15);
        setShowGoBuild(true);
      }, 3000);
    }, 1600);
  }

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type: 'HK_RESULT',
        version: '1',
        exerciseId: 'm6-t2-s6-you-became-a-developer',
        exerciseType: 'interactive',
        status: 'completed',
        score: 1,
        maxScore: 1,
        answers: {
          oneMemory: oneMemory,
          completedAt: new Date().toISOString(),
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (e) {}
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (showFinalScreen) {
    return (
      <div className="yd-root">
        <style>{STYLE}</style>
        <div className="yd-final">
          <div className="yd-final-logo">HATCHKOD</div>
          <div className="yd-final-stamp" style={{ animationDelay: '0.3s' }}>FNDI Program{'\n'}Complete.</div>
          <div className="yd-final-name" style={{ animationDelay: '0.9s' }}>{studentName}</div>
          <div className="yd-final-date" style={{ animationDelay: '1.3s' }}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="yd-final-stack" style={{ animationDelay: '1.7s' }}>
            Full Stack Developer<br />
            Java · Spring Boot · React · MySQL · JWT · AI
          </div>
          <div className="yd-final-links" style={{ animationDelay: '2.1s' }}>
            {rawLiveUrl
              ? <a className="yd-final-link" href={rawLiveUrl} target="_blank" rel="noopener noreferrer">{liveUrl}</a>
              : <span className="yd-final-link" style={{ opacity: 0.6 }}>{liveUrl}</span>}
            {rawGithubUrl
              ? <a className="yd-final-link" href={rawGithubUrl} target="_blank" rel="noopener noreferrer">{githubUrl}</a>
              : <span className="yd-final-link" style={{ opacity: 0.6 }}>{githubUrl}</span>}
          </div>
          {showGoBuild && <div className="yd-go-build">Go build something.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="yd-root">
      <style>{STYLE}</style>
      <button className="yd-mute-btn" onClick={toggleMute}>{isMuted ? '🔇' : '🔊'}</button>

      <div className="yd-page">

        {/* SECTION 1 */}
        {visibleSection >= 1 && (
          <div className="yd-section" key="s1">
            <p className="yd-body">Stop for a moment.</p>
            <p className="yd-body muted">Not to check something.{'\n'}Not to fix something.{'\n'}Not to add something.</p>
            <p className="yd-body">Just — stop.</p>
            <p className="yd-body" style={{ marginTop: 32 }}>Eight weeks ago you opened a laptop and you did not know what a variable was.</p>
            <p className="yd-body">Look at what is open on your screen right now.</p>
            {visibleSection === 1 && <button className="yd-continue-btn" onClick={() => advanceSection(1)}>Continue →</button>}
          </div>
        )}

        {/* SECTION 2 */}
        {visibleSection >= 2 && (
          <div className="yd-section" key="s2">
            <p className="yd-body">A live URL. On the internet.{'\n'}That you built.</p>
            <div style={{ textAlign: 'center' }}>
              <div className="yd-url-box">{liveUrl}</div>
              <div className="yd-url-caption">Your app. Right now. On the internet.</div>
            </div>
            <p className="yd-body" style={{ marginTop: 32 }}>Not a tutorial. Not a copy-paste. Not an assignment.</p>
            <p className="yd-body">A real application.{'\n'}For a real person.{'\n'}Solving a real problem.{'\n'}Running on a real server.{'\n'}Right now.</p>
            <p className="yd-body" style={{ marginTop: 32 }}>Someone in your neighbourhood has seen what you built. They used it. And something happened in their eyes when they saw it work.</p>
            <p className="yd-key-line">You created that.</p>
            {visibleSection === 2 && <button className="yd-continue-btn" onClick={() => advanceSection(2)}>Continue →</button>}
          </div>
        )}

        {/* SECTION 3 */}
        {visibleSection >= 3 && (
          <div className="yd-section" key="s3">
            <p className="yd-body">Most people who say they want to learn to code — stop.</p>
            <p className="yd-body muted" style={{ marginTop: 24 }}>They stop when the first error message appears.</p>
            <p className="yd-body muted">They stop when the concept does not click immediately.</p>
            <p className="yd-body muted">They stop when they compare themselves to someone who seems to know more.</p>
            <p className="yd-body muted">They stop when they feel like they are too far behind.</p>

            <div className="yd-did-not-stop">You did not stop.</div>

            <p className="yd-body">You hit the error messages. You sat with the confusion. You restarted your server for the hundredth time.</p>
            <p className="yd-body">You saw '401 Unauthorized' at 11pm and figured out why.</p>
            <p className="yd-body">Every bug you fixed was a decision to not give up.</p>
            <p className="yd-body">Nobody saw most of them. They happened alone, in your room, at night.</p>
            <p className="yd-body">But they happened.</p>
            {visibleSection === 3 && <button className="yd-continue-btn" onClick={() => advanceSection(3)}>Continue →</button>}
          </div>
        )}

        {/* SECTION 4 */}
        {visibleSection >= 4 && (
          <div className="yd-section" key="s4">
            <p className="yd-body">The most important thing you built in these eight weeks is not the app.</p>
            <p className="yd-belief-line">It is the belief that you can build.</p>
            <p className="yd-body">Before — when you saw a website — you thought: 'somebody else made that.'</p>
            <p className="yd-body">Now — when you see a website — you think: 'I know how that works. I could build something like that.'</p>
            <p className="yd-body">That shift is permanent. It does not go away. It grows.</p>
            {visibleSection === 4 && <button className="yd-continue-btn" onClick={() => advanceSection(4)}>Continue →</button>}
          </div>
        )}

        {/* SECTION 5 */}
        {visibleSection >= 5 && (
          <div className="yd-section" key="s5">
            <p className="yd-key-line">You are going to get a job.</p>
            <p className="yd-body" style={{ marginTop: 32 }}>Not because you know everything. You do not. No developer does.</p>
            <p className="yd-body">Because you have something most candidates at your level do not have:</p>
            <p className="yd-body">A live application.{'\n'}A real client.{'\n'}A story you can tell.{'\n'}A demonstrated ability to learn hard things and ship them.</p>
            <p className="yd-body">When they ask 'have you built anything?' — you open a URL.</p>
            <p className="yd-body">That is different.</p>
            {visibleSection === 5 && <button className="yd-continue-btn" onClick={() => advanceSection(5)}>Continue →</button>}
          </div>
        )}

        {/* SECTION 6 */}
        {visibleSection >= 6 && (
          <div className="yd-section" key="s6">
            <p className="yd-body">On the days when the next job is hard to find — and there will be days like that — come back to this.</p>

            {memoriesShown >= 1 && <div className="yd-memory-card m1">Remember the business owner's face when they saw the AI suggestion.</div>}
            {memoriesShown >= 2 && <div className="yd-memory-card m2">Remember the first time you typed <code>git push origin main</code> and the commit appeared on GitHub.</div>}
            {memoriesShown >= 3 && <div className="yd-memory-card m3">Remember the night the JWT token finally worked and the members list loaded in React.</div>}

            {showFinalLine6 && (
              <>
                <p className="yd-body" style={{ marginTop: 32, textAlign: 'center' }}>Those moments are yours. They happened. Nobody can take them.</p>
                <p className="yd-permanent-line">You are a developer who has shipped something real.{'\n\n'}That is not a course completion.{'\n\n'}That is who you are now.</p>
              </>
            )}

            {showQuestion && (
              <div className="yd-question-block">
                <p className="yd-question-text">What is the one moment from these eight weeks that you will never forget?</p>
                <textarea
                  className="yd-textarea"
                  value={oneMemory}
                  onChange={e => setOneMemory(e.target.value)}
                />
                {oneMemory.trim().length > 0 && (
                  <button className="yd-submit-btn" onClick={handleFinalSubmit} disabled={submitted}>
                    I am a developer. →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
