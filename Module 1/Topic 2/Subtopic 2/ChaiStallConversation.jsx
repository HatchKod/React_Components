import React, { useState, useRef, useEffect } from 'react';

const ANNA_OPENING = "Cheppu cheppu, fast ga. (Tell me, tell me, quickly)";

const STEPS = [
  {
    label: "Introduce Yourself",
    stepNum: 1,
    options: [
      {
        id: "A",
        text: "Anna, nenu [your college] student. Local shops kosam chinna apps build chesthunna - free ga, naa learning kosam. Two minutes matrame.",
        isBest: true,
        ownerReply: "Sare sare, cheppu. (Okay okay, tell me)",
        nudge: null
      },
      {
        id: "B",
        text: "Sir, mee business gurinchi matladali.",
        isBest: false,
        ownerReply: "Business? Ippudu time ledu ra. (No time right now)",
        nudge: "Busy vallaki 'two minutes matrame' ani cheppadam vallu relax ayyi vinataniki help avtundi."
      }
    ]
  },
  {
    label: "Discover the Problem",
    stepNum: 2,
    options: [
      {
        id: "A",
        text: "Roju enni customers vastharu, mariyu orders ela track chestharu? (How many customers come daily, how do you track orders?)",
        isBest: true,
        ownerReply: "Arre track enti, anni gurthu pettukovali. Konchem saarlu order tappu avtundi, dabbulu kuda takkuva vasthayi.",
        nudge: null
      },
      {
        id: "B",
        text: "Mee business lo emaina problem unda?",
        isBest: false,
        ownerReply: "Problem? Anta bagane undi, konchem busy ga untanu antey.",
        nudge: "Daily routine gurinchi specific questions adagadam, generic questions kanna better ga real conversations open chestayi."
      }
    ]
  },
  {
    label: "Offer the Solution",
    stepNum: 3,
    options: [
      {
        id: "A",
        text: "Ee tracking kosam simple app vunte, orders ventane automatic gaa teesukunte, andariki help avutunda?",
        isBest: true,
        ownerReply: "Avunu kachitanga, free ga ayithe try chesthamu. Eppudu vasthavo cheppu.",
        nudge: null
      },
      {
        id: "B",
        text: "Nenu mee kosam app free ga build chesthanu, cheyamantava?",
        isBest: false,
        ownerReply: "Free ah? Sare chudham, kani fast ga cheppu emi cheyalo.",
        nudge: "'Help avutunda' ani adagadam vallaki idea lo involve cheskunnattu untundi. Build cheyataniki permission adagadam collaborative ga feel avtundi."
      }
    ]
  }
];

export default function ChaiStallConversation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [history, setHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, selectedOption, isComplete]);

  const handleSelect = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
  };

  const handleProceed = () => {
    const newMessages = [
      { speaker: 'you', text: selectedOption.text },
      { speaker: 'anna', text: selectedOption.ownerReply }
    ];
    setHistory(prev => [...prev, ...newMessages]);
    setSelectedOption(null);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
  };

  const step = STEPS[currentStep];
  const progressPct = isComplete ? 100 : (currentStep / STEPS.length) * 100;

  return (
    <div className="chai-container">
      <style>{`
        .chai-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #fcfcfc;
          min-height: 100vh;
          color: #333;
        }

        .chai-header {
          margin-bottom: 20px;
        }

        .chai-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #f59e0b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .chai-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px 0;
        }

        .chai-subtitle {
          font-size: 0.95rem;
          color: #555;
          line-height: 1.5;
          margin: 0;
        }

        .progress-wrap {
          margin-bottom: 20px;
        }

        .progress-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #666;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }

        .progress-bar-bg {
          height: 6px;
          background-color: #eee;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: #f59e0b;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .scene-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #78350f;
          line-height: 1.5;
        }

        .scene-card strong {
          color: #92400e;
        }

        .chat-window {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 120px;
        }

        .bubble-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }

        .bubble-row.anna {
          flex-direction: row;
        }

        .bubble-row.you {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .avatar.anna-avatar {
          background-color: #fef3c7;
          border: 2px solid #fbbf24;
        }

        .avatar.you-avatar {
          background-color: #eff6ff;
          border: 2px solid #93c5fd;
        }

        .bubble {
          max-width: 78%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .bubble.anna-bubble {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          color: #1e293b;
        }

        .bubble.you-bubble {
          background-color: #3b82f6;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .speaker-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .bubble-col {
          display: flex;
          flex-direction: column;
        }

        .bubble-col.you-col {
          align-items: flex-end;
        }

        .step-prompt {
          font-weight: 600;
          font-size: 1rem;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .option-btn {
          text-align: left;
          padding: 14px 16px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #334155;
          line-height: 1.45;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .option-btn:hover:not(:disabled) {
          border-color: #93c5fd;
          background-color: #f8fafc;
        }

        .option-btn:disabled {
          cursor: default;
        }

        .option-btn.selected-best {
          border-color: #10b981;
          background-color: #ecfdf5;
        }

        .option-btn.selected-bad {
          border-color: #f87171;
          background-color: #fff5f5;
        }

        .option-id {
          font-weight: 700;
          font-size: 0.85rem;
          min-width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .option-btn.selected-best .option-id {
          background: #10b981;
          color: white;
        }

        .option-btn.selected-bad .option-id {
          background: #f87171;
          color: white;
        }

        .feedback-card {
          border-radius: 12px;
          padding: 16px;
          font-size: 0.9rem;
          line-height: 1.55;
          margin-bottom: 14px;
          animation: fadeUp 0.35s ease;
        }

        .feedback-card.good {
          background-color: #f0fdf4;
          border: 1px solid #86efac;
          color: #166534;
        }

        .feedback-card.nudge {
          background-color: #fff7ed;
          border: 1px solid #fdba74;
          color: #9a3412;
        }

        .nudge-label {
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          color: #c2410c;
        }

        .action-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .action-btn.proceed {
          background-color: #10b981;
          color: white;
        }

        .action-btn.proceed:hover {
          background-color: #059669;
        }

        .action-btn.retry {
          background-color: #f59e0b;
          color: white;
        }

        .action-btn.retry:hover {
          background-color: #d97706;
        }

        .success-card {
          background: #ecfdf5;
          border: 1px solid #6ee7b7;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          animation: fadeUp 0.5s ease;
        }

        .success-emoji {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .success-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #065f46;
          margin: 0 0 12px 0;
        }

        .success-text {
          font-size: 0.95rem;
          color: #064e3b;
          line-height: 1.65;
          margin: 0 0 24px 0;
        }

        .lesson-list {
          text-align: left;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 0;
          list-style: none;
          padding-left: 20px;
        }

        .lesson-list li {
          font-size: 0.9rem;
          color: #1f2937;
          line-height: 1.55;
          margin-bottom: 10px;
          padding-left: 4px;
        }

        .lesson-list li::before {
          content: "✓ ";
          color: #10b981;
          font-weight: 700;
        }

        .lesson-list li:last-child {
          margin-bottom: 0;
        }

        .lesson-card-wrap {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          text-align: left;
        }

        .lesson-card-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #065f46;
          margin-bottom: 12px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="chai-header">
        <div className="chai-label">Conversation Simulator</div>
        <h1 className="chai-title">Busy Chai Stall Anna ☕</h1>
        <p className="chai-subtitle">
          Anna is serving 40+ customers right now. Pick the right words at each step - or watch the conversation go wrong.
        </p>
      </div>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>{isComplete ? 'Conversation complete' : `Step ${currentStep + 1} of ${STEPS.length}: ${step.label}`}</span>
          <span>{isComplete ? '3/3' : `${currentStep}/3`}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="scene-card">
        <strong>Scene:</strong> College gate chai stall, 8am. Anna is moving fast - cups in hand, cash on the counter, students calling out orders. This is your moment.
      </div>

      <div className="chat-window">
        {/* Anna's opening */}
        <div className="bubble-row anna">
          <div className="avatar anna-avatar">☕</div>
          <div className="bubble-col">
            <div className="speaker-name">Anna</div>
            <div className="bubble anna-bubble">{ANNA_OPENING}</div>
          </div>
        </div>

        {/* Conversation history */}
        {history.map((msg, idx) => (
          <div key={idx} className={`bubble-row ${msg.speaker}`}>
            <div className={`avatar ${msg.speaker === 'anna' ? 'anna-avatar' : 'you-avatar'}`}>
              {msg.speaker === 'anna' ? '☕' : '👤'}
            </div>
            <div className={`bubble-col ${msg.speaker === 'you' ? 'you-col' : ''}`}>
              <div className="speaker-name">{msg.speaker === 'anna' ? 'Anna' : 'You'}</div>
              <div className={`bubble ${msg.speaker === 'anna' ? 'anna-bubble' : 'you-bubble'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Current selection preview */}
        {selectedOption && (
          <>
            <div className="bubble-row you">
              <div className="avatar you-avatar">👤</div>
              <div className="bubble-col you-col">
                <div className="speaker-name">You</div>
                <div className="bubble you-bubble">{selectedOption.text}</div>
              </div>
            </div>
            <div className="bubble-row anna">
              <div className="avatar anna-avatar">☕</div>
              <div className="bubble-col">
                <div className="speaker-name">Anna</div>
                <div className="bubble anna-bubble">{selectedOption.ownerReply}</div>
              </div>
            </div>
          </>
        )}

        {isComplete && (
          <div className="bubble-row anna">
            <div className="avatar anna-avatar">☕</div>
            <div className="bubble-col">
              <div className="speaker-name">Anna</div>
              <div className="bubble anna-bubble">Eppudu vasthavo cheppu ra. Free ga chestunnaru ante try cheyyachu! (Come tell me when. If you're doing it free, we can try!)</div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!isComplete && (
        <div>
          <div className="step-prompt">
            {currentStep === 0 && "How do you open the conversation?"}
            {currentStep === 1 && "How do you find out what's wrong?"}
            {currentStep === 2 && "How do you pitch your help?"}
          </div>

          <div className="options-grid">
            {step.options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              let btnClass = 'option-btn';
              if (isSelected) btnClass += option.isBest ? ' selected-best' : ' selected-bad';

              return (
                <button
                  key={option.id}
                  className={btnClass}
                  onClick={() => handleSelect(option)}
                  disabled={!!selectedOption}
                >
                  <span className="option-id">{option.id}</span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <>
              {selectedOption.isBest ? (
                <div className="feedback-card good">
                  Right move. Anna is still listening - keep going.
                </div>
              ) : (
                <div className="feedback-card nudge">
                  <div className="nudge-label">Tip</div>
                  {selectedOption.nudge}
                </div>
              )}

              {selectedOption.isBest ? (
                <button
                  className="action-btn proceed"
                  onClick={handleProceed}
                >
                  {currentStep < STEPS.length - 1 ? 'Continue conversation →' : 'Finish conversation →'}
                </button>
              ) : (
                <button
                  className="action-btn retry"
                  onClick={handleRetry}
                >
                  Try a different approach
                </button>
              )}
            </>
          )}
        </div>
      )}

      {isComplete && (
        <div className="success-card">
          <div className="success-emoji">🎉</div>
          <h2 className="success-title">Anna agreed!</h2>
          <p className="success-text">
            Busy vallu kuda conversation short and clear ga unte 'yes' antaru.<br />
            (Even busy people say yes when the conversation is short and clear.)
          </p>
          <div className="lesson-card-wrap">
            <div className="lesson-card-title">What made this work:</div>
            <ul className="lesson-list">
              <li>You named yourself and said "two minutes" - Anna relaxed immediately.</li>
              <li>You asked about her daily routine, not "do you have problems".</li>
              <li>You asked if it would help - you didn't just announce you'd build it.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
