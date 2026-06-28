// FullStackSimulator.jsx
// A friendly interactive component that shows how a full‑stack app works.
// No technical terms are shown to the student.

import React, { useState, useEffect } from "react";

export default function FullStackSimulator() {
  // ---------- basic input ----------
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);

  // ---------- animation steps ----------
  const [step, setStep] = useState(0); // 0 = idle, 1‑5 animation, 6 = success shown
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealLines, setRevealLines] = useState([]);
  const [logLines, setLogLines] = useState([]);

  // ---------- task (reflection) ----------
  const [answer, setAnswer] = useState("");
  const [sentCount, setSentCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // ---------- helpers ----------
  const pulseClass = (box) => {
    return step === box ? "pulse" : "";
  };

  const statusText = (box) => {
    switch (box) {
      case 1:
        return step >= 1 ? "Sending your name to the brain..." : "";
      case 2:
        return step >= 2 ? "Received! Thinking about what to do..." : "";
      case 3:
        return step >= 3 ? `Writing '${name}' in the notebook... done!` : "";
      case 4:
        return step >= 4 ? "Notebook confirmed. Telling the screen..." : "";
      case 5:
        return step >= 5 ? `Got it! Showing the result to ${name}.` : "";
      default:
        return "";
    }
  };

  // ---------- start animation ----------
  const start = () => {
    setStarted(true);
    setStep(1);
    // timeline driven by setTimeouts – each step advances after the specified delay
    setTimeout(() => setStep(2), 1800);
    setTimeout(() => setStep(3), 3200);
    setTimeout(() => setStep(4), 4600);
    setTimeout(() => setStep(5), 5800);
    setTimeout(() => {
      setShowSuccess(true);
      setLogLines([
        "✅ You typed your name → The Screen received it",
        "✅ The Screen → sent it to The Brain",
        "✅ The Brain → gave it to The Notebook to save",
        "✅ The Notebook → confirmed it is saved forever",
        "✅ The Brain → told The Screen everything is done",
        "✅ The Screen → showed you the result",
      ]);
      // reveal card lines appear one‑by‑one
      const lines = [
        "The Counter (what you see and touch) = Frontend",
        "The Bhaiya (the invisible brain) = Backend",
        "The Notebook (remembers forever) = Database",
      ];
      lines.forEach((line, i) => {
        setTimeout(() => setRevealLines((prev) => [...prev, line]), 200 + i * 400);
      });
      // final line after the three
      setTimeout(() => setRevealLines((prev) => [...prev, "Frontend + Backend + Database = Full Stack App"], 200 + lines.length * 400 + 400);
    }, 6200);
  };

  // ---------- reset ----------
  const reset = () => {
    setName("");
    setStarted(false);
    setStep(0);
    setShowSuccess(false);
    setShowReveal(false);
    setRevealLines([]);
    setLogLines([]);
    setAnswer("");
    setSentCount(0);
    setSubmitted(false);
  };

  // ---------- answer handling ----------
  useEffect(() => {
    // simple sentence count – split on period, exclamation, question
    const count = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    setSentCount(count);
  }, [answer]);

  // ---------- reveal card visibility ----------
  useEffect(() => {
    if (showSuccess) {
      setShowReveal(true);
    }
  }, [showSuccess]);

  // ---------- UI ----------
  return (
    <div className="wrapper">
      {/* ----- style ----- */}
      <style>{`
        .wrapper {font-family: system-ui, Inter, sans-serif; background:#F9FAFB; padding:20px; max-width:720px; margin:auto;}
        .section {margin-bottom:24px;}
        .heading {font-size:1.5rem; font-weight:600; color:#111; margin-bottom:4px;}
        .subtext {font-size:0.95rem; color:#555; margin-bottom:12px;}
        .input-row {display:flex; gap:8px; margin-bottom:16px;}
        .input-row input{flex:1;padding:10px;font-size:1rem;border:1px solid #ddd;border-radius:8px;}
        .input-row button{padding:10px 16px;background:#3B82F6;color:#fff;border:none;border-radius:8px;cursor:pointer;transition:background .2s;}
        .input-row button:disabled{background:#A5B4FC;cursor:not-allowed;}
        .boxes {display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between;}
        .box{flex:1 1 calc(33% - 12px);background:#EFF6FF; border-radius:12px; padding:16px; text-align:center; position:relative; min-width:140px;}
        .box.green{background:#ECFDF5;}
        .box.orange{background:#FFFBEB;}
        .box .icon{font-size:2rem; margin-bottom:8px;}
        .box .desc{font-weight:500; margin-bottom:8px;}
        .box .status{font-size:0.85rem; color:#555; min-height:1.2em;}
        .box.pulse{animation: pulse 1.5s infinite;}
        @keyframes pulse {0%{box-shadow:0 0 0 0 rgba(0,0,0,0.2);}50%{box-shadow:0 0 0 8px rgba(0,0,0,0.1);}100%{box-shadow:0 0 0 0 rgba(0,0,0,0.2);}}
        .arrow{font-size:1.5rem; color:#777; margin:8px 0;}
        .success-card{background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:12px;padding:16px;margin-top:24px;animation: slideIn 0.6s forwards;}
        @keyframes slideIn {from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .big-text{font-size:1.4rem;font-weight:600;margin-bottom:8px;}
        .small-text{font-size:1rem;color:#555;margin-bottom:4px;}
        .tiny-italic{font-size:0.9rem;color:#777;font-style:italic;}
        .log-panel{background:#fff;border:1px solid #eee;border-radius:12px;padding:12px;margin-top:16px;max-height:150px;overflow-y:auto;}
        .log-line{font-size:0.85rem; margin:4px 0;}
        .reset-btn{margin-top:12px;background:#10B981;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;}
        .task-card{background:#fff;border-radius:12px;padding:16px;margin-top:24px;box-shadow:0 2px 6px rgba(0,0,0,0.05);}
        .task-heading{font-size:1.3rem;font-weight:600;margin-bottom:8px;}
        .textarea{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px;min-height:100px;font-size:1rem;resize:vertical;}
        .counter{font-size:0.85rem;margin-top:4px;}
        .counter.done{color:#10B981;}
        .submit-btn{background:#F59E0B;color:#fff;padding:10px 16px;border:none;border-radius:8px;margin-top:12px;cursor:pointer;}
        .submit-btn:disabled{background:#FCD34D;cursor:not-allowed;}
        .confirm-msg{background:#ECFDF5;border-left:4px solid #10B981;padding:12px;margin-top:12px;border-radius:8px;}
        @media (max-width:600px){
          .boxes {flex-direction:column;}
          .box{flex:1 1 100%;}
        }
      `}</style>

      {/* ---------- Section 1 ---------- */}
      <div className="section">
        <div className="heading">Watch what happens when you tap a button</div>
        <div className="subtext">Type your name below and tap the button. Watch carefully.</div>
        <div className="input-row">
          <input
            type="text"
            placeholder="Type your name here..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={started}
          />
          <button onClick={start} disabled={name.trim() === "" || started}>Watch what happens →</button>
        </div>
        {/* three boxes */}
        <div className="boxes">
          <div className={`box ${step === 1 ? "pulse" : ""}`}>
            <div className="icon">📱</div>
            <div className="desc">What you see and touch</div>
            <div className="status">{statusText(1)}</div>
          </div>
          <div className={`box green ${step === 2 ? "pulse" : ""}`}>
            <div className="icon">💡</div>
            <div className="desc">What thinks and decides</div>
            <div className="status">{statusText(2)}</div>
          </div>
          <div className={`box orange ${step === 3 ? "pulse" : ""}`}>
            <div className="icon">📓</div>
            <div className="desc">What remembers forever</div>
            <div className="status">{statusText(3)}</div>
          </div>
        </div>
        {/* arrow placeholder - simple emoji arrow that appears during steps */}
        {step >= 1 && step < 2 && <div className="arrow">➡️</div>}
        {step >= 2 && step < 3 && <div className="arrow">➡️</div>}
        {step >= 3 && step < 4 && <div className="arrow">➡️</div>}
        {step >= 4 && step < 5 && <div className="arrow">➡️</div>}
        {step >= 5 && <div className="arrow">➡️</div>}

        {/* Success card */}
        {showSuccess && (
          <div className="success-card">
            <div className="big-text">Hello, {name}! 👋</div>
            <div className="small-text">Your name is now saved in the notebook forever.</div>
            <div className="tiny-italic">This three‑part system is what every app you use is built on. You will build one just like this for your neighbourhood by Week 8.</div>
          </div>
        )}

        {/* Live log panel */}
        {showSuccess && (
          <div className="log-panel">
            <div className="heading" style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "4px" }}>What just happened — step by step:</div>
            {logLines.map((l, i) => (<div key={i} className="log-line">{l}</div>))}
          </div>
        )}

        {/* Reset button */}
        {showSuccess && (
          <button className="reset-btn" onClick={reset}>Try again with a different name →</button>
        )}
      </div>

      {/* ---------- Reveal Card ---------- */}
      {showReveal && (
        <div className="success-card" style={{ background: "#FFFBEB", borderLeft: `4px solid #F59E0B` }}>
          {revealLines.map((line, i) => {
            const isFinal = i === revealLines.length - 1 && line.includes("Full Stack App");
            return (
              <div key={i} style={{ marginBottom: "6px", fontSize: isFinal ? "1.2rem" : "1rem", fontWeight: isFinal ? "600" : "" }}>{line}</div>
            );
          })}
        </div>
      )}

      {/* ---------- Section 2 — The Task ---------- */}
      {showSuccess && (
        <div className="task-card">
          <div className="task-heading">Before you move forward — one small thing 🙏</div>
          <div style={{ marginBottom: "12px" }}>
            In the simulator above, you watched a name travel from the screen to the brain to the notebook and back.
            <br />Now close your eyes for 5 seconds. Then answer this:
            <br /><br />In your own words — what just happened? Write it like you are explaining it to your friend sitting next to you in class.
            <br /><br />There is no right or wrong answer. Your mentor will read this only to understand how you think — not to judge you.
            <br />One rule: write it yourself. No copying. Your own words, even if they are simple, even if your English is not perfect. Simple and honest beats perfect and copied. Every time.
            <br />We can tell the difference. And more importantly — so can you.
          </div>
          <textarea
            className="textarea"
            placeholder="Write here in your own words... (minimum 3 sentences)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className={`counter ${sentCount >= 3 ? "done" : ""}`}>{sentCount} of 3 sentences written</div>
          {!submitted && (
            <button
              className="submit-btn"
              disabled={sentCount < 3}
              onClick={() => setSubmitted(true)}
            >I wrote this myself — submit my answer →</button>
          )}
          {submitted && (
            <div className="confirm-msg">
              Thank you, {name}. Your mentor will read this. You just completed your first task on HatchKod. Keep going. 🚀
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// End of FullStackSimulator.jsx
