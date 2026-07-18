import React, { useState } from 'react';

const SCENES = [
  {
    title: "Chai Shop ☕",
    description: "Bhaiya at the college gate chai stall. 6am every morning. 40-50 students before class. He remembers every regular's order in his head. Sometimes he forgets. Sometimes two people get mixed up orders. He writes nothing down.",
    question: "What is being done manually here?",
    options: [
      {
        id: "A",
        text: "He remembers orders in his head - no system to track them",
        isBest: true,
        feedback: "Exactly. Order tracking in his head = lost orders, wrong orders, wasted money. An app that takes and tracks orders would fix this permanently. Great catch. 🎯"
      },
      {
        id: "B",
        text: "He makes chai by hand - could be automated",
        isBest: false,
        feedback: "Ha - fair thinking! But automating chai-making is hard. The bigger problem is tracking orders. Look again. 😄"
      },
      {
        id: "C",
        text: "He collects cash - no digital payment option",
        isBest: false,
        feedback: "Good eye - digital payments would help. But there is a bigger daily pain here. Think about what he forgets most often."
      }
    ]
  },
  {
    title: "College Gym 🏋️",
    description: "The gym inside your college hostel. The gym instructor has a register. Every student who enters signs their name. Some days 3 students come. Some days 30. He has no idea in advance. Equipment sits unused. Or 10 people wait for one machine.",
    question: "What is being done manually here?",
    options: [
      {
        id: "A",
        text: "Students sign in by hand - no digital attendance",
        isBest: false,
        feedback: "Digital attendance would help - but the deeper problem is before they even arrive. Think about what the instructor cannot predict."
      },
      {
        id: "B",
        text: "No way to book slots in advance - everyone just shows up",
        isBest: true,
        feedback: "Perfect. No slot booking = random crowds = poor experience for everyone. A simple booking app fixes this entirely. 🎯"
      },
      {
        id: "C",
        text: "Equipment condition not tracked - things break without warning",
        isBest: false,
        feedback: "Smart thinking - maintenance tracking is a real need. But there is a more daily pain here affecting every single student every single day."
      }
    ]
  },
  {
    title: "Hostel Mess 🍱",
    description: "Dinner time. Mess aunty is serving. 300 students. She keeps a rough count in her head of how many came. At the end of the month the contractor argues with the warden about how many meals were actually served. Nobody has real numbers.",
    question: "What is being done manually here?",
    options: [
      {
        id: "A",
        text: "Menu is decided randomly - no planning system",
        isBest: false,
        feedback: "Menu planning is a real problem in many messes. But the more urgent daily pain here is something the contractor and warden argue about every month."
      },
      {
        id: "B",
        text: "Meal count tracked in head - no reliable attendance record",
        isBest: true,
        feedback: "Spot on. No reliable attendance = monthly fights about numbers = someone always loses money. A simple check-in app solves this and everyone is happy. 🎯"
      },
      {
        id: "C",
        text: "Food wastage not measured - no data on what gets thrown",
        isBest: false,
        feedback: "Food wastage data would be incredibly valuable - you are thinking like a product manager. The more immediate daily problem though is even simpler."
      }
    ]
  },
  {
    title: "Local Medical Shop 💊",
    description: "Medical shop near your college gate. Uncle manages everything alone. Students come asking if a medicine is available. He walks to the shelf, checks, comes back. Sometimes it is there. Sometimes it finished yesterday and he didn't notice. Students go away frustrated.",
    question: "What is being done manually here?",
    options: [
      {
        id: "A",
        text: "No way to check stock without physically searching the shelf",
        isBest: true,
        feedback: "Exactly right. Manual stock checking = wasted time + frustrated customers + medicines running out without warning. A basic inventory tracker fixes all three. 🎯"
      },
      {
        id: "B",
        text: "No home delivery option for students",
        isBest: false,
        feedback: "Delivery would be a great feature - but that requires logistics. The most immediate daily pain uncle faces is much simpler and fixable with a basic app."
      },
      {
        id: "C",
        text: "No digital billing - everything handwritten",
        isBest: false,
        feedback: "Digital billing would help - but the problem that wastes his time and loses him customers every single day is something else."
      }
    ]
  },
  {
    title: "Small Hotel Near College 🏨",
    description: "10-room hotel near your college. Owner manages everything on a whiteboard. Room number. Guest name. Check-in date. Check-out date. When a guest checks out he erases the entry. Sometimes he erases the wrong room. Sometimes he forgets to erase. He has no idea how much money he made this month.",
    question: "What is being done manually here?",
    options: [
      {
        id: "A",
        text: "Room booking tracked on whiteboard - data gets erased and lost",
        isBest: true,
        feedback: "Perfect. Whiteboard = no history, no reports, no revenue data, mistakes every week. A simple room management app gives him everything he needs. 🎯"
      },
      {
        id: "B",
        text: "No online booking - customers must come in person",
        isBest: false,
        feedback: "Online booking would grow his business - but that is a big step. The problem he faces every single day, right now, with his current 10 customers is much more basic and urgent."
      },
      {
        id: "C",
        text: "No customer feedback collection system",
        isBest: false,
        feedback: "Feedback systems are valuable - but the owner's most painful daily problem is one he has been dealing with every single morning for years."
      }
    ]
  }
];

export default function ProblemSpotter() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Reflection task state
  const [reflectionText, setReflectionText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentScene = SCENES[currentSceneIdx];
  
  // Calculate sentences roughly (count period, exclamation, question mark followed by space or end)
  const sentenceCount = (reflectionText.match(/[.!?]+(\s|$)/g) || []).length;
  const isReflectionValid = sentenceCount >= 3;

  const handleOptionClick = (option) => {
    if (selectedOption?.isBest) return; // Prevent changing if they already got it right
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (currentSceneIdx < SCENES.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevent = (e) => {
    e.preventDefault();
  };

  return (
    <div className="problem-spotter-container">
      <style>{`
        .problem-spotter-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #fcfcfc;
          min-height: 100vh;
          color: #333;
        }
        
        .header-section {
          margin-bottom: 24px;
        }

        .main-heading {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #111;
        }

        .subtext {
          font-size: 1rem;
          color: #555;
          line-height: 1.5;
          margin: 0;
        }

        .progress-container {
          margin-bottom: 24px;
        }

        .progress-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
        }

        .progress-bar-bg {
          height: 6px;
          background-color: #eee;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: #10b981;
          transition: width 0.4s ease;
        }

        .scene-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        .scene-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .scene-description {
          font-size: 1rem;
          line-height: 1.6;
          color: #444;
          margin-bottom: 20px;
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }

        .question-text {
          font-weight: 600;
          font-size: 1.05rem;
          margin-bottom: 16px;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-btn {
          text-align: left;
          padding: 16px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
          line-height: 1.4;
        }

        .option-btn:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }

        .option-btn.selected {
          border-color: #10b981;
          background-color: #ecfdf5;
          box-shadow: 0 0 0 1px #10b981;
        }
        
        .option-btn.selected-not-best {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .feedback-card {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 0.95rem;
          line-height: 1.5;
          animation: fadeIn 0.4s ease;
        }
        
        .feedback-card.not-best {
          background-color: #eff6ff;
          border-color: #bfdbfe;
          color: #1e3a8a;
        }

        .next-btn {
          margin-top: 16px;
          width: 100%;
          padding: 14px;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .next-btn:hover {
          background-color: #059669;
        }

        /* Summary / Reflection section styles */
        .summary-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          text-align: left;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          text-align: center;
        }

        .summary-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #444;
          margin-bottom: 24px;
        }
        
        .problems-list-card {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }
        
        .problems-list-title {
          font-weight: 600;
          margin-bottom: 16px;
          font-size: 1.1rem;
        }

        .problems-list {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
        }

        .problems-list li {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.95rem;
        }
        
        .problems-list li:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .problem-place {
          font-weight: 600;
          color: #1f2937;
        }
        
        .problem-desc {
          color: #64748b;
          margin-top: 4px;
        }

        .problem-label {
          font-size: 0.85rem;
          color: #10b981;
          font-weight: 600;
          text-align: center;
          padding-top: 8px;
          border-top: 1px dashed #cbd5e1;
        }

        /* Task Section */
        .task-section {
          margin-top: 40px;
        }

        .task-heading {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #111;
        }

        .task-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .task-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #444;
          margin-bottom: 20px;
        }

        .reflection-textarea {
          width: 100%;
          min-height: 150px;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          box-sizing: border-box;
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
        }

        .reflection-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .counter {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .counter.valid {
          color: #10b981;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background-color: #111;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .submit-btn:hover {
          background-color: #333;
        }
        
        .submit-btn:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 24px;
          padding: 24px;
          background-color: #ecfdf5;
          border-radius: 12px;
          border: 1px solid #10b981;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .success-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #065f46;
          margin: 0 0 12px 0;
        }

        .success-text {
          color: #064e3b;
          line-height: 1.6;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {!showSummary ? (
        <>
          <div className="header-section">
            <h1 className="main-heading">Train your eye - spot what could be an app 🔍</h1>
            <p className="subtext">
              Look at these 5 places you already know. For each one - what is being done manually that could be digital?
            </p>
          </div>

          <div className="progress-container">
            <div className="progress-text">Place {currentSceneIdx + 1} of {SCENES.length}</div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((currentSceneIdx + 1) / SCENES.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="scene-card" key={currentSceneIdx}>
            <h2 className="scene-title">{currentScene.title}</h2>
            <div className="scene-description">{currentScene.description}</div>
            
            <div className="question-text">{currentScene.question}</div>
            
            <div className="options-list">
              {currentScene.options.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                let btnClass = "option-btn";
                if (isSelected) {
                  btnClass += option.isBest ? " selected" : " selected-not-best";
                }

                return (
                  <button 
                    key={option.id}
                    className={btnClass}
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedOption?.isBest}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            {selectedOption && (
              <div className={`feedback-card ${selectedOption.isBest ? '' : 'not-best'}`}>
                {selectedOption.feedback}
                {selectedOption.isBest && (
                  <button className="next-btn" onClick={handleNext}>
                    {currentSceneIdx < SCENES.length - 1 ? 'Next Place →' : 'See Summary →'}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="summary-section">
          <div className="summary-card">
            <h1 className="summary-title">Your eye is trained. 🎯</h1>
            <div className="summary-text">
              <p>You just spotted 5 real problems in 5 places you already know.</p>
              <p>None of these businesses are waiting for you with a list of requirements.</p>
              <p>But every single one of them has a problem that a simple app could solve.</p>
              <p>Tomorrow - you are going to walk into one of these places and have a real conversation. We will prepare you for exactly what to say in the next subtopic.</p>
            </div>

            <div className="problems-list-card">
              <div className="problems-list-title">Problems you spotted today:</div>
              <ul className="problems-list">
                {SCENES.map((scene, idx) => (
                  <li key={idx}>
                    <div className="problem-place">{scene.title}</div>
                    <div className="problem-desc">{scene.options.find(o => o.isBest).text}</div>
                  </li>
                ))}
              </ul>
              <div className="problem-label">These are called Requirements in the developer world. You just found 5.</div>
            </div>
          </div>

          <div className="task-section">
            <h2 className="task-heading">Before you move forward 🙏</h2>
            <div className="task-card">
              <div className="task-text">
                <p>You spotted problems in 5 places just now.</p>
                <p>But those were our examples.</p>
                <p>Think about YOUR daily life. Your college area. The places you actually go to.</p>
                <p><strong>One question:</strong></p>
                <p>Which ONE place near your college do you think has the biggest problem worth solving? And what exactly is being done manually there?</p>
                <p>Describe it like you are telling a friend. Which place. What you noticed. Why it bothers you.</p>
                <p>Your own words only. No copying. No ChatGPT. The more specific and real your answer - the better your project will be.</p>
              </div>

              <textarea
                className="reflection-textarea"
                placeholder="There is a [place] near my college where they still [manual thing]... I think this could be an app because..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                onPaste={handlePrevent}
                onContextMenu={handlePrevent}
                disabled={isSubmitted}
              />
              
              {!isSubmitted && (
                <>
                  <div className={`counter ${isReflectionValid ? 'valid' : ''}`}>
                    {sentenceCount} of 3 sentences written
                  </div>
                  
                  <button 
                    className="submit-btn" 
                    disabled={!isReflectionValid}
                    onClick={() => setIsSubmitted(true)}
                  >
                    I found a real problem - submit →
                  </button>
                </>
              )}

              {isSubmitted && (
                <div className="success-message">
                  <h3 className="success-heading">You just found your first real requirement. 🎯</h3>
                  <p className="success-text">
                    In the next subtopic - we will teach you exactly what to say when you walk through that door and talk to the owner.<br/><br/>
                    Keep going.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
