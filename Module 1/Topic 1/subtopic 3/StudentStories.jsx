import React, { useState } from 'react';

const stories = [
  {
    id: 1,
    name: "Arjun",
    color: "#3B82F6",
    city: "Warangal",
    percentage: "61%",
    before: "Used to copy code from seniors the night before submissions. Thought Java was that language nobody uses in real life.",
    problem: "A gym near his college was managing 200 members through a WhatsApp group. Slots booked by typing names in chat. Fights every week over double bookings.",
    built: "A slot booking app for the gym. Live on a wall-mounted TV at the gym entrance by Week 8.",
    outcome: "Placed at ₹6.5 LPA - talked about his project for 11 minutes straight in the interview. Interviewer stopped him and said - when can you join?",
  },
  {
    id: 2,
    name: "Priya",
    color: "#10B981",
    city: "Bhilai",
    percentage: "58%",
    before: "Joined in the last week before the deadline because a friend forwarded the link. Almost did not join.",
    problem: "Her college mess was tracking attendance of 300 students in a hand-written register. Students were claiming meals they never took.",
    built: "A mess attendance and menu management app. The mess contractor started using it in Week 9.",
    outcome: "Placed at ₹5.8 LPA - her GitHub had one project. That one project got her the job.",
  },
  {
    id: 3,
    name: "Rohit",
    color: "#F59E0B",
    city: "Gorakhpur",
    percentage: "52%",
    before: "Failed one subject in second year. Used to sit in the last bench - not out of carelessness, but because he felt invisible.",
    problem: "A small hotel near his college had no way of tracking room occupancy without physically walking to each room.",
    built: "A room management dashboard for the hotel owner.",
    outcome: "Placed at ₹5.2 LPA - resubmitted Mini Project 1 twice, never gave up. First in his family to get a software job. His mother cried.",
  }
];

export default function StudentStories() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hasReadLast, setHasReadLast] = useState(false);

  const activeStory = stories[currentStoryIndex];

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      if (nextIndex === stories.length - 1) {
        setHasReadLast(true);
      }
    } else {
      const el = document.getElementById('reflection-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const sentenceCount = reflection.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const isTextValid = sentenceCount >= 4;

  const handleSubmit = () => {
    if (isTextValid) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="hatchkod-student-stories">
      <style>{`
        .hatchkod-student-stories {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 640px;
          margin: 0 auto;
          padding: 24px 16px;
          color: #1F2937;
          background-color: #F9FAFB;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .hatchkod-student-stories * {
          box-sizing: border-box;
        }

        /* CARD STYLES */
        .story-container {
          position: relative;
          min-height: 400px;
          margin-bottom: 24px;
        }

        .story-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease-in-out;
          border: 1px solid #F3F4F6;
        }

        .quote-mark {
          position: absolute;
          top: 16px;
          right: 24px;
          font-size: 120px;
          font-family: serif;
          color: #F3F4F6;
          line-height: 1;
          user-select: none;
          z-index: 0;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
          margin-bottom: 32px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-text h3 {
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 700;
          color: #111827;
        }

        .header-text p {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
        }

        .section-block {
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .section-block:last-of-type {
          margin-bottom: 32px;
        }

        .section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9CA3AF;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-content {
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
          margin: 0;
        }

        .divider {
          height: 1px;
          background-color: #F3F4F6;
          margin: 20px 0;
        }

        .outcome-badge {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 16px;
          border-radius: 0 8px 8px 0;
          position: relative;
          z-index: 1;
        }

        .outcome-text {
          font-size: 15px;
          font-weight: 600;
          color: #92400E;
          margin: 0;
          line-height: 1.5;
        }

        /* NAVIGATION */
        .controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
        }

        .nav-button {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .nav-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .nav-button:not(:disabled):hover {
          background: #F3F4F6;
        }

        .nav-button.primary-nav {
          background: #111827;
          color: #FFFFFF;
          border-color: #111827;
        }
        
        .nav-button.primary-nav:hover {
          background: #374151;
          border-color: #374151;
        }

        .progress-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #D1D5DB;
          transition: background-color 0.3s;
        }

        .dot.active {
          background-color: #111827;
        }

        /* TRANSITION TEXT */
        .transition-text {
          text-align: center;
          font-size: 15px;
          color: #6B7280;
          font-style: italic;
          margin: 48px 0;
          line-height: 1.6;
          padding: 0 24px;
        }

        /* REFLECTION SECTION */
        .reflection-section {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 48px;
        }

        .reflection-section h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .reflection-intro {
          font-size: 15px;
          color: #4B5563;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .reflection-intro p {
          margin-bottom: 12px;
        }

        .textarea-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .reflection-textarea {
          width: 100%;
          height: 180px;
          padding: 16px;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .reflection-textarea:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          background: #F3F4F6;
          color: #6B7280;
          transition: all 0.3s;
        }

        .counter.valid {
          background: #D1FAE5;
          color: #065F46;
        }

        .submit-btn {
          width: 100%;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .submit-btn:not(:disabled):hover {
          background: #374151;
        }

        /* FULL SCREEN SUCCESS */
        .success-screen {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: fadeIn 0.6s ease-out forwards;
        }

        .success-screen h1 {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 16px;
        }

        .success-screen p {
          font-size: 18px;
          color: #4B5563;
          max-width: 400px;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {!submitted ? (
        <>
          {/* SECTION 1 - STORY CARDS */}
          <div className="story-container">
            <div className="story-card" key={activeStory.id}>
              <div className="quote-mark">"</div>
              
              <div className="card-header">
                <div 
                  className="avatar" 
                  style={{ backgroundColor: activeStory.color }}
                >
                  {activeStory.name.charAt(0)}
                </div>
                <div className="header-text">
                  <h3>{activeStory.name}</h3>
                  <p>{activeStory.city} | {activeStory.percentage}</p>
                </div>
              </div>

              <div className="section-block">
                <div className="section-label">Before the internship</div>
                <p className="section-content">{activeStory.before}</p>
              </div>

              <div className="divider"></div>

              <div className="section-block">
                <div className="section-label">
                  <span>🔍</span> What they discovered in Week 1
                </div>
                <p className="section-content">{activeStory.problem}</p>
              </div>

              <div className="divider"></div>

              <div className="section-block">
                <div className="section-label">
                  <span>🚀</span> What they shipped by Week 8
                </div>
                <p className="section-content">{activeStory.built}</p>
              </div>

              <div className="outcome-badge">
                <p className="outcome-text">{activeStory.outcome}</p>
              </div>
            </div>

            <div className="controls">
              <button 
                className="nav-button" 
                onClick={handlePrev} 
                disabled={currentStoryIndex === 0}
              >
                ← Previous
              </button>
              
              <div className="progress-dots">
                {stories.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`dot ${idx === currentStoryIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
              
              <button 
                className={`nav-button ${currentStoryIndex === stories.length - 1 ? 'primary-nav' : ''}`}
                onClick={handleNext}
              >
                {currentStoryIndex === stories.length - 1 && hasReadLast 
                  ? "I have read all three stories →" 
                  : "Next →"}
              </button>
            </div>
          </div>

          {(currentStoryIndex === stories.length - 1 || hasReadLast) && (
            <div className="transition-text">
              "Arjun, Priya and Rohit were sitting exactly where you are right now. 
              The only difference between them and you is eight weeks."
            </div>
          )}

          {/* SECTION 2 - THE TASK */}
          <div id="reflection-section" className="reflection-section" style={{
            opacity: hasReadLast ? 1 : 0.5,
            pointerEvents: hasReadLast ? 'auto' : 'none',
            transition: 'opacity 0.5s'
          }}>
            <h2>Now it is your turn 🙏</h2>
            
            <div className="reflection-intro">
              <p>You just read about three students who were exactly where you are right now.</p>
              <p>One question - and we want your honest answer:</p>
              <p><strong>By the time you finish this internship - what do you want someone to say about YOU?</strong></p>
              <p>Write your own story. The version that happens if you show up every week and build every task.</p>
              <p>Your city. Your problem. Your app. Your outcome.</p>
              <p>Write it in present tense - as if it already happened. As if someone is reading YOUR story card to the next batch of students.</p>
              <p style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>
                Your own words only. No copying. No ChatGPT. This is your promise to yourself. 
                No one grades this. But you will remember writing it.
              </p>
            </div>

            <div className="textarea-wrapper">
              <textarea 
                className="reflection-textarea"
                placeholder="My name is ___, I am from ___. I found a problem at ___ near my college. I built ___ and by Week 8..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className={`counter ${isTextValid ? 'valid' : ''}`}>
                {sentenceCount} of 4 sentences written
              </div>
            </div>

            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!isTextValid}
            >
              This is my story - I am committing to it →
            </button>
          </div>
        </>
      ) : (
        <div className="success-screen">
          <h1>Your story is written. 🚀</h1>
          <p>
            We will remind you of this on the last day of the internship.<br/><br/>
            Now let us go build it.
          </p>
          <button 
            className="submit-btn" 
            style={{ maxWidth: '250px' }}
            onClick={() => alert("Proceeding to next module...")}
          >
            Start Module 1 →
          </button>
        </div>
      )}
    </div>
  );
}
