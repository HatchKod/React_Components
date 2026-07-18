import React, { useState, useEffect, useRef } from 'react';

// --- DATA ---
const featureData = {
  Gym: [
    { id: 'g1', name: 'Book a slot', desc: 'Member picks a time and books it', comp: 'Simple' },
    { id: 'g2', name: 'See available slots', desc: 'Show which times are free today', comp: 'Simple' },
    { id: 'g3', name: 'Cancel a booking', desc: "Member cancels if they can't come", comp: 'Simple' },
    { id: 'g4', name: 'Member login and profile', desc: 'Each member has their own account', comp: 'Simple' },
    { id: 'g5', name: 'Attendance tracker', desc: 'Track who came and how often', comp: 'Medium' },
    { id: 'g6', name: 'Monthly fee payment', desc: 'Collect membership fees digitally', comp: 'Complex' },
    { id: 'g7', name: 'Trainer schedule management', desc: 'Manage which trainer is when', comp: 'Medium' },
    { id: 'g8', name: 'WhatsApp booking reminder', desc: 'Send reminder before slot time', comp: 'Complex' },
    { id: 'g9', name: 'Revenue dashboard for owner', desc: 'Show monthly income and trends', comp: 'Medium' },
    { id: 'g10', name: 'Diet plan suggestion', desc: 'AI suggests diet based on goal', comp: 'Complex' },
  ],
  Mess: [
    { id: 'm1', name: 'Daily menu display', desc: "Show today's breakfast, lunch, dinner", comp: 'Simple' },
    { id: 'm2', name: 'Student meal check-in', desc: 'Student marks attendance for each meal', comp: 'Simple' },
    { id: 'm3', name: 'Update menu (for mess owner)', desc: 'Owner updates what is cooking today', comp: 'Simple' },
    { id: 'm4', name: 'Monthly attendance report', desc: 'How many meals each student took', comp: 'Medium' },
    { id: 'm5', name: 'Meal feedback from students', desc: "Students rate today's food", comp: 'Medium' },
    { id: 'm6', name: 'Online meal payment', desc: 'Students pay mess fees digitally', comp: 'Complex' },
    { id: 'm7', name: 'Food wastage tracking', desc: 'Track how much food is left over', comp: 'Medium' },
    { id: 'm8', name: 'WhatsApp menu notification', desc: "Send today's menu to students", comp: 'Complex' },
    { id: 'm9', name: 'Special diet requests', desc: 'Student flags dietary restrictions', comp: 'Complex' },
    { id: 'm10', name: 'Complaint management', desc: 'Students raise food quality issues', comp: 'Medium' },
  ],
  Hotel: [
    { id: 'h1', name: 'View room availability', desc: 'See which rooms are free right now', comp: 'Simple' },
    { id: 'h2', name: 'Book a room', desc: 'Guest books an available room', comp: 'Simple' },
    { id: 'h3', name: 'Checkout a room', desc: 'Mark room as empty when guest leaves', comp: 'Simple' },
    { id: 'h4', name: 'Guest check-in form', desc: 'Capture guest name, ID, dates', comp: 'Simple' },
    { id: 'h5', name: 'Room status dashboard', desc: 'Owner sees all rooms at a glance', comp: 'Medium' },
    { id: 'h6', name: 'Online payment collection', desc: 'Guest pays room charges digitally', comp: 'Complex' },
    { id: 'h7', name: 'Revenue report', desc: 'Monthly income by room type', comp: 'Medium' },
    { id: 'h8', name: 'Room service requests', desc: 'Guest requests food or housekeeping', comp: 'Medium' },
    { id: 'h9', name: 'Online booking from outside', desc: 'Anyone can book from the internet', comp: 'Complex' },
    { id: 'h10', name: 'Guest review system', desc: 'Guests rate their stay', comp: 'Complex' },
  ],
  'Chai Shop': [
    { id: 'c1', name: 'Take an order', desc: 'Record what a customer ordered', comp: 'Simple' },
    { id: 'c2', name: 'View active orders', desc: 'See all pending orders at once', comp: 'Simple' },
    { id: 'c3', name: 'Mark order as done', desc: 'Remove order when chai is served', comp: 'Simple' },
    { id: 'c4', name: 'Daily sales summary', desc: 'Total items sold and revenue today', comp: 'Medium' },
    { id: 'c5', name: 'Add or update menu items', desc: 'Owner adds new items, updates prices', comp: 'Simple' },
    { id: 'c6', name: 'Regular customer profiles', desc: 'Save frequent customers and orders', comp: 'Medium' },
    { id: 'c7', name: 'Digital billing and receipt', desc: 'Generate a receipt for each order', comp: 'Medium' },
    { id: 'c8', name: 'UPI payment integration', desc: 'Accept payments through UPI', comp: 'Complex' },
    { id: 'c9', name: 'Pre-order for college events', desc: 'Bulk orders booked in advance', comp: 'Complex' },
    { id: 'c10', name: 'Stock and ingredient tracking', desc: 'Track milk, tea leaves, sugar levels', comp: 'Complex' },
  ],
  Other: [
    { id: 'o1', name: 'Add a new record', desc: 'Create a new entry in the system', comp: 'Simple' },
    { id: 'o2', name: 'View all records', desc: 'See everything that has been added', comp: 'Simple' },
    { id: 'o3', name: 'Edit a record', desc: 'Update or correct existing data', comp: 'Simple' },
    { id: 'o4', name: 'Delete a record', desc: 'Remove an entry when no longer needed', comp: 'Simple' },
    { id: 'o5', name: 'Search and filter records', desc: 'Find specific entries quickly', comp: 'Medium' },
    { id: 'o6', name: 'Generate a report', desc: 'Summary view of all activity', comp: 'Medium' },
    { id: 'o7', name: 'User login and accounts', desc: 'Different users with their own access', comp: 'Simple' },
    { id: 'o8', name: 'Send notifications', desc: 'Alert users about important events', comp: 'Complex' },
    { id: 'o9', name: 'Accept digital payments', desc: 'Collect money through the app', comp: 'Complex' },
    { id: 'o10', name: 'Dashboard with charts', desc: 'Visual summary of key numbers', comp: 'Medium' },
  ]
};

// --- SOUND SYSTEM ---
let audioCtx = null;

const playSound = (type, muted) => {
  if (muted) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  if (type === 'add') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'remove') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(659, now + 0.1);
    osc.frequency.setValueAtTime(784, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'submit') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'warn') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(277, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'reveal') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(659, now + 0.1);
    osc.frequency.setValueAtTime(784, now + 0.2);
    osc.frequency.setValueAtTime(1047, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'tick') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
};

// --- STYLES ---
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

body {
  margin: 0;
  background-color: #f8fafc;
}

.fb-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
  font-family: 'Outfit', sans-serif;
  color: #1e293b;
  min-height: 100vh;
  background: #f8fafc;
  box-sizing: border-box;
}

.fb-container * {
  box-sizing: border-box;
}

.fb-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInDown 0.6s ease-out;
}
.fb-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
}
.fb-header p {
  color: #64748b;
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1.6;
}

.fb-domain-selector {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  animation: fadeIn 0.8s ease-out;
}
.fb-pill {
  padding: 0.8rem 1.8rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.05rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.fb-pill:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: #0f172a;
}
.fb-pill.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.fb-input {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 2rem auto;
  padding: 0.8rem 1.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  font-size: 1.05rem;
  background: #ffffff;
  color: #0f172a;
}
.fb-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.fb-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  margin-bottom: 3rem;
}
@media (max-width: 768px) {
  .fb-layout {
    grid-template-columns: 1fr;
  }
}

.fb-col-header {
  margin-bottom: 1.5rem;
}
.fb-col-header h2 {
  font-size: 1.4rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #0f172a;
}
.fb-col-header p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.fb-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 550px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.fb-list::-webkit-scrollbar {
  width: 6px;
}
.fb-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.fb-card {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.fb-card:hover:not(.disabled) {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}
.fb-card.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: #f8fafc;
}

.fb-card-content {
  flex: 1;
}
.fb-card-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 0 0.35rem 0;
  color: #0f172a;
}
.fb-card-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 0.75rem 0;
}

.fb-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.fb-badge.simple { background: #dcfce7; color: #166534; }
.fb-badge.medium { background: #fef08a; color: #854d0e; }
.fb-badge.complex { background: #fee2e2; color: #991b1b; }

.fb-btn-add {
  padding: 0.6rem 1.2rem;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.fb-btn-add:hover {
  background: #e2e8f0;
}

.fb-slot {
  padding: 1.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  min-height: 120px;
  background: #f8fafc;
  transition: all 0.3s ease;
}
.fb-slot.filled {
  border: 2px solid #22c55e;
  background: #f0fdf4;
  justify-content: space-between;
  text-align: left;
  color: inherit;
}

.fb-slot-content {
  flex: 1;
}
.fb-btn-remove {
  padding: 0.5rem;
  background: transparent;
  color: #ef4444;
  border: none;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}
.fb-btn-remove:hover {
  background: #fee2e2;
}

.fb-coins {
  font-size: 2rem;
  margin-top: 1.5rem;
  text-align: right;
  letter-spacing: 0.5rem;
}
.fb-coin {
  transition: all 0.4s ease;
  display: inline-block;
}
.fb-coin.spent {
  filter: grayscale(100%) opacity(0.3);
  transform: scale(0.9);
}

.fb-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 2.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  margin-top: 3rem;
  animation: slideUp 0.5s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fb-warning {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 1.25rem;
  margin: 1.5rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #92400e;
  line-height: 1.5;
}
.fb-success {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  padding: 1.25rem;
  margin: 1.5rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #166534;
  line-height: 1.5;
}
.fb-note {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  color: #475569;
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
  line-height: 1.6;
}

.fb-btn-primary {
  display: block;
  width: 100%;
  padding: 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-family: 'Outfit', sans-serif;
}
.fb-btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}
.fb-btn-primary:disabled {
  background: #cbd5e1;
  color: #f8fafc;
  cursor: not-allowed;
  box-shadow: none;
}

.fb-section-2 {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 2px dashed #cbd5e1;
  animation: slideUp 0.5s ease-out forwards;
}

.fb-instruction-note {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 1.25rem;
  margin-bottom: 2rem;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #1e3a8a;
  font-size: 1rem;
  line-height: 1.5;
}

.fb-textarea-container {
  margin-bottom: 2rem;
}
.fb-textarea-label {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  display: block;
  color: #0f172a;
}
.fb-textarea {
  width: 100%;
  padding: 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 1.05rem;
  resize: vertical;
  min-height: 120px;
  background: #ffffff;
  color: #0f172a;
  transition: all 0.2s;
  box-sizing: border-box;
}
.fb-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.fb-textarea::placeholder {
  color: #94a3b8;
}

.fb-mute-btn {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  font-size: 1.5rem;
  z-index: 50;
  transition: all 0.2s ease;
  color: #0f172a;
}
.fb-mute-btn:hover {
  background: #f8fafc;
  transform: scale(1.05);
}

.fb-final-screen {
  text-align: center;
  padding: 5rem 3rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.6s ease-out forwards;
}
.fb-final-screen h2 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #0f172a;
}
.fb-final-screen p {
  font-size: 1.3rem;
  color: #475569;
  max-width: 600px;
  margin: 0 auto 1.5rem auto;
  line-height: 1.7;
}
`;

export default function FeatureBudget() {
  const [muted, setMuted] = useState(false);
  const [domain, setDomain] = useState('');
  const [otherDomainText, setOtherDomainText] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [stage, setStage] = useState(1); // 1: Select, 2: Commit, 3: Final
  const [justifications, setJustifications] = useState({});

  useEffect(() => {
    // Inject styles
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const handleDomainSelect = (d) => {
    playSound('tick', muted);
    setDomain(d);
    setSelectedFeatures([]);
    setStage(1);
    if (d !== 'Other') setOtherDomainText('');
  };

  const addFeature = (feat) => {
    if (selectedFeatures.length < 3 && !selectedFeatures.find(f => f.id === feat.id)) {
      playSound('add', muted);
      const newFeatures = [...selectedFeatures, feat];
      setSelectedFeatures(newFeatures);
      
      if (newFeatures.length === 3) {
        setTimeout(() => playSound('reveal', muted), 300);
      }
    }
  };

  const removeFeature = (featId) => {
    playSound('remove', muted);
    setSelectedFeatures(selectedFeatures.filter(f => f.id !== featId));
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const isMvpLocked = selectedFeatures.length === 3;

  const getFeedbackMessage = () => {
    if (!isMvpLocked) return null;
    const comps = selectedFeatures.map(f => f.comp);
    const complexCount = comps.filter(c => c === 'Complex').length;
    const mediumCount = comps.filter(c => c === 'Medium').length;
    const simpleCount = comps.filter(c => c === 'Simple').length;

    if (complexCount > 0) {
      playSound('warn', muted);
      return (
        <div className="fb-warning">
          <strong>Wait a minute... 🤔</strong><br/>
          One of your features is marked Complex - meaning it could take 6+ weeks on its own. 
          This might be risky for your 8-week timeline. Consider swapping it for a Simpler version. 
          Your mentor will guide you - but it's worth thinking about now.
        </div>
      );
    } else if (simpleCount === 3) {
      playSound('correct', muted);
      return (
        <div className="fb-success">
          <strong>Perfect foundation. 🎯</strong><br/>
          All 3 are buildable in your timeline. Your mentor will be very happy with this.
        </div>
      );
    } else {
      playSound('correct', muted);
      return (
        <div className="fb-success">
          <strong>Solid choices. 🎯</strong><br/>
          {simpleCount} simple features + {mediumCount} medium. Very achievable. Good balance.
        </div>
      );
    }
  };

  const handleTextareaChange = (id, val) => {
    setJustifications({ ...justifications, [id]: val });
    playSound('tick', muted);
  };

  const allJustified = selectedFeatures.every(f => {
    const text = justifications[f.id] || '';
    // Basic check for at least a few words ending with punctuation or just enough length
    return text.trim().length > 15 && text.trim().split(' ').length > 3;
  });

  const confirmMvp = () => {
    playSound('submit', muted);
    setStage(2);
  };

  const submitFinal = () => {
    playSound('submit', muted);
    setStage(3);
  };

  const preventCopyPaste = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fb-container">
      <button className="fb-mute-btn" onClick={toggleMute} title="Toggle Sound">
        {muted ? '🔇' : '🔊'}
      </button>

      {stage < 3 && (
        <div className="fb-header">
          <h1>You have 3 coins. Spend them wisely. 🪙🪙🪙</h1>
          <p>
            Pick exactly 3 features for your app. Not 4. Not 2. Exactly 3.<br/>
            These 3 will become your entire project.
          </p>
        </div>
      )}

      {stage === 1 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
            First - which type of business are you building for?
          </div>
          <div className="fb-domain-selector">
            {[
              { id: 'Gym', label: '🏋️ Gym' },
              { id: 'Mess', label: '🍱 Mess' },
              { id: 'Hotel', label: '🏨 Hotel' },
              { id: 'Chai Shop', label: '☕ Chai Shop' },
              { id: 'Other', label: '🏪 Other' }
            ].map(d => (
              <button
                key={d.id}
                className={`fb-pill ${domain === d.id ? 'active' : ''}`}
                onClick={() => handleDomainSelect(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          {domain === 'Other' && (
            <input
              type="text"
              className="fb-input"
              placeholder="What kind of business? (e.g. medical shop...)"
              value={otherDomainText}
              onChange={(e) => setOtherDomainText(e.target.value)}
            />
          )}

          {domain && (
            <div className="fb-layout">
              <div>
                <div className="fb-col-header">
                  <h2>Everything you COULD build</h2>
                  <p>But you can only pick 3</p>
                </div>
                <div className="fb-list">
                  {featureData[domain].map(feat => {
                    const isSelected = selectedFeatures.find(f => f.id === feat.id);
                    return (
                      <div key={feat.id} className={`fb-card ${isSelected || isMvpLocked ? 'disabled' : ''}`}>
                        <div className="fb-card-content">
                          <h3 className="fb-card-title">{feat.name}</h3>
                          <p className="fb-card-desc">{feat.desc}</p>
                          <span className={`fb-badge ${feat.comp.toLowerCase()}`}>
                            {feat.comp === 'Simple' ? '🟢' : feat.comp === 'Medium' ? '🟡' : '🔴'} {feat.comp}
                          </span>
                        </div>
                        <button 
                          className="fb-btn-add" 
                          onClick={() => addFeature(feat)}
                          disabled={isSelected || isMvpLocked}
                        >
                          + Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="fb-col-header">
                  <h2>Your 3 features</h2>
                  <p>These 3 will become your real app</p>
                </div>
                
                <div className="fb-slots">
                  {[0, 1, 2].map(i => {
                    const feat = selectedFeatures[i];
                    if (feat) {
                      return (
                        <div key={`slot-${i}`} className="fb-slot filled">
                          <div className="fb-slot-content">
                            <h3 className="fb-card-title">{feat.name}</h3>
                            <span className={`fb-badge ${feat.comp.toLowerCase()}`}>
                              {feat.comp === 'Simple' ? '🟢' : feat.comp === 'Medium' ? '🟡' : '🔴'} {feat.comp}
                            </span>
                          </div>
                          <button className="fb-btn-remove" onClick={() => removeFeature(feat.id)}>
                            Remove ×
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={`slot-${i}`} className="fb-slot">
                        Slot {i + 1} - drag or add a feature here
                      </div>
                    );
                  })}
                </div>

                <div className="fb-coins">
                  {[0, 1, 2].map(i => (
                    <span key={`coin-${i}`} className={`fb-coin ${i < selectedFeatures.length ? 'spent' : ''}`}>
                      🪙
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isMvpLocked && (
            <div className="fb-summary-card">
              <h2 style={{marginTop: 0}}>Your MVP is:</h2>
              <ol style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {selectedFeatures.map(f => (
                  <li key={f.id}><strong>{f.name}</strong></li>
                ))}
              </ol>
              
              {getFeedbackMessage()}

              <div className="fb-note">
                <strong>What you just defined is called an MVP</strong> - Minimum Viable Product. 
                The smallest version of your app that actually solves the problem. Every product in the world starts here.
              </div>

              <button className="fb-btn-primary" onClick={confirmMvp}>
                I'm happy with these 3 →
              </button>
            </div>
          )}
        </>
      )}

      {stage === 2 && (
        <div className="fb-section-2">
          <div className="fb-header" style={{ marginBottom: '1rem' }}>
            <h2>Before you move forward 🙏</h2>
          </div>
          
          <div className="fb-summary-card" style={{ marginTop: 0, marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#1e293b' }}>
              You just chose your 3 features.
              <br/><br/>
              Now - for each feature, write one sentence explaining <strong>WHY</strong> you chose it.
              <br/><br/>
              Not what it does - you already know that. <strong>WHY</strong> this one matters more than the others you didn't pick.
              <br/><br/>
              This forces you to think like a developer, not a student. Developers don't build features because they seem cool. They build them because a real person needs them.
              <br/><br/>
              <em>Your own words only. No copying. No ChatGPT.</em> What you write here will remind you - in Week 5 when things get hard - why you chose to build this.
            </p>
          </div>

          <div className="fb-instruction-note">
            <strong>How to unlock the next step:</strong>
            <br />
            To enable the "My MVP is locked" button, you must write a meaningful sentence for each feature. 
            Aim for at least 4 words and 15 characters per box.
          </div>

          {selectedFeatures.map((feat, i) => (
            <div key={feat.id} className="fb-textarea-container">
              <label className="fb-textarea-label">
                {i + 1}. {feat.name}
              </label>
              <textarea
                className="fb-textarea"
                placeholder="I chose this because..."
                value={justifications[feat.id] || ''}
                onChange={(e) => handleTextareaChange(feat.id, e.target.value)}
                onPaste={preventCopyPaste}
                onContextMenu={preventCopyPaste}
              />
            </div>
          ))}

          <button 
            className="fb-btn-primary" 
            onClick={submitFinal}
            disabled={!allJustified}
            style={{ marginTop: '2rem' }}
          >
            My MVP is locked - let's build it →
          </button>
        </div>
      )}

      {stage === 3 && (
        <div className="fb-final-screen">
          <h2>Your MVP is locked. 🔒</h2>
          <p>
            3 features. Real business. Real problem.
          </p>
          <p>
            Everything you learn from Module 1 onwards is a brick for this building.
          </p>
          <p>
            Next - let's draw what it looks like before we write a single line of code.
          </p>
        </div>
      )}
    </div>
  );
}
