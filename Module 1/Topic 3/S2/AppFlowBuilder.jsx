// AppFlowBuilder.jsx - HatchKod Subtopic 0.3.2
// Drag-and-connect app flow diagram builder

const { useState, useEffect, useRef, useCallback } = React;

// ─────────────────────────────────────────────
// SOUND ENGINE
// ─────────────────────────────────────────────
let audioCtx = null;
function playSound(type, muted) {
  if (muted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'remove') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'submit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'warn') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(277, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      osc.frequency.setValueAtTime(1047, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    }
  } catch (e) { /* silent fail */ }
}

// ─────────────────────────────────────────────
// SCREEN DATA
// ─────────────────────────────────────────────
const screenData = {
  Gym: [
    { id: 'g1', icon: '📱', name: 'Login Screen',     desc: 'Where members sign in' },
    { id: 'g2', icon: '🏠', name: 'Home Screen',      desc: 'Welcome screen after login' },
    { id: 'g3', icon: '📅', name: 'Available Slots',  desc: 'Shows all open time slots' },
    { id: 'g4', icon: '✅', name: 'Book a Slot',      desc: 'Confirm a specific slot booking' },
    { id: 'g5', icon: '❌', name: 'Cancel Booking',   desc: 'Remove an existing booking' },
    { id: 'g6', icon: '👤', name: 'My Bookings',      desc: "Member's personal booking history" },
    { id: 'g7', icon: '⚙️', name: 'Admin Panel',      desc: 'Gym owner manages slots' },
  ],
  Mess: [
    { id: 'm1', icon: '📱', name: 'Login Screen',      desc: 'Where students sign in' },
    { id: 'm2', icon: '🏠', name: 'Home Screen',       desc: "Today's menu at a glance" },
    { id: 'm3', icon: '🍽️', name: "Today's Menu",      desc: 'Full breakfast, lunch, dinner details' },
    { id: 'm4', icon: '✅', name: 'Mark Attendance',   desc: 'Student checks in for a meal' },
    { id: 'm5', icon: '📊', name: 'My Attendance',     desc: "Student's monthly meal record" },
    { id: 'm6', icon: '⚙️', name: 'Admin Panel',       desc: 'Mess owner updates menu and sees counts' },
    { id: 'm7', icon: '📋', name: 'Monthly Report',    desc: 'Summary of all student attendance' },
  ],
  Hotel: [
    { id: 'h1', icon: '📱', name: 'Login Screen',      desc: 'Staff or owner signs in' },
    { id: 'h2', icon: '🏠', name: 'Dashboard',         desc: 'All rooms visible at one glance' },
    { id: 'h3', icon: '🛏️', name: 'Room List',         desc: 'Every room with current status' },
    { id: 'h4', icon: '➕', name: 'Check In Guest',    desc: 'Fill guest details, assign room' },
    { id: 'h5', icon: '➖', name: 'Check Out Guest',   desc: 'Mark room as empty, note dates' },
    { id: 'h6', icon: '📋', name: 'Guest History',     desc: 'Past guests and their stays' },
    { id: 'h7', icon: '📊', name: 'Revenue Summary',   desc: 'Monthly income overview' },
  ],
  'Chai Shop': [
    { id: 'c1', icon: '📱', name: 'Login Screen',      desc: 'Bhaiya signs in to start day' },
    { id: 'c2', icon: '🏠', name: 'Active Orders',     desc: 'All current pending orders' },
    { id: 'c3', icon: '➕', name: 'New Order',         desc: 'Take a new customer order' },
    { id: 'c4', icon: '✅', name: 'Mark Done',         desc: 'Order served, remove from list' },
    { id: 'c5', icon: '📋', name: "Today's Summary",   desc: 'What sold today, total revenue' },
    { id: 'c6', icon: '🍵', name: 'Menu Management',  desc: 'Add items, update prices' },
  ],
  Other: [
    { id: 'o1', icon: '📱', name: 'Login Screen',      desc: 'User signs in' },
    { id: 'o2', icon: '🏠', name: 'Home / Dashboard',  desc: 'Main overview screen' },
    { id: 'o3', icon: '➕', name: 'Add New Record',    desc: 'Create a new entry' },
    { id: 'o4', icon: '📋', name: 'View All Records',  desc: 'See everything in the system' },
    { id: 'o5', icon: '✏️', name: 'Edit Record',       desc: 'Update an existing entry' },
    { id: 'o6', icon: '🗑️', name: 'Delete Record',     desc: 'Remove an entry' },
    { id: 'o7', icon: '📊', name: 'Reports',           desc: 'Summary and stats view' },
  ],
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #f8fafc; font-family: 'Outfit', sans-serif; }
@keyframes fadeInDown  { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
@keyframes slideUp     { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn     { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes popIn       { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
@keyframes pulse       { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
@keyframes shimmer     { 0%   { background-position: -200% 0; }
                         100% { background-position:  200% 0; } }

.afb-wrap { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; color: #1e293b; min-height: 100vh; }
.afb-mute { position: fixed; top: 1.25rem; right: 1.25rem; z-index: 100;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 999px;
  width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.08);
  transition: all .2s; }
.afb-mute:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,0,0,.12); }

/* ── Header ── */
.afb-header { text-align: center; margin-bottom: 2.5rem; animation: fadeInDown .6s ease-out; }
.afb-header h1 { font-size: 2.2rem; font-weight: 700; color: #0f172a; margin-bottom: .5rem; }
.afb-header p  { color: #64748b; font-size: 1.1rem; line-height: 1.65; max-width: 640px; margin: 0 auto; }

/* ── Domain Pills ── */
.afb-pills { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center;
  margin-bottom: 2.5rem; animation: fadeIn .8s ease-out; }
.afb-pill { padding: .7rem 1.6rem; border-radius: 999px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #475569; cursor: pointer; font-size: 1rem; font-weight: 500;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); transition: all .2s; }
.afb-pill:hover  { border-color: #a78bfa; color: #6d28d9; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139,92,246,.15); }
.afb-pill.active { background: #ede9fe; border-color: #7c3aed; color: #5b21b6;
  box-shadow: 0 4px 12px rgba(139,92,246,.25); }

/* ── Section Titles ── */
.afb-section { margin-bottom: 1.5rem; }
.afb-section h2 { font-size: 1.35rem; font-weight: 700; color: #0f172a; margin-bottom: .25rem; }
.afb-section p  { color: #64748b; font-size: .95rem; }

/* ── Screen Library ── */
.afb-library-scroll {
  display: flex; gap: 1rem;
  overflow-x: auto; padding-bottom: 1rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.afb-library-scroll::-webkit-scrollbar { height: 6px; }
.afb-library-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

.afb-lib-card {
  flex: 0 0 140px; scroll-snap-align: start;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px;
  padding: 1rem .85rem; cursor: grab; user-select: none;
  transition: all .2s; display: flex; flex-direction: column; align-items: center;
  gap: .45rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.afb-lib-card:hover  { border-color: #a78bfa; transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139,92,246,.18); }
.afb-lib-card.used   { opacity: .45; pointer-events: none; }
.afb-lib-card-icon   { font-size: 1.75rem; }
.afb-lib-card-name   { font-weight: 600; font-size: .82rem; color: #0f172a; line-height: 1.3; }
.afb-lib-card-desc   { font-size: .7rem; color: #94a3b8; line-height: 1.4; }
.afb-lib-card-add    { margin-top: .3rem; padding: .3rem .8rem; border: none; border-radius: 999px;
  background: #ede9fe; color: #6d28d9; font-size: .72rem; font-weight: 600;
  cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .2s; }
.afb-lib-card-add:hover { background: #7c3aed; color: #fff; }

/* ── Canvas ── */
.afb-canvas-wrap { background: #f9fafb; border: 2px dashed #cbd5e1; border-radius: 16px;
  min-height: 340px; position: relative; overflow: hidden; margin-bottom: 1.5rem;
  transition: border-color .3s; }
.afb-canvas-wrap.dragover { border-color: #7c3aed; background: #f5f3ff; }
.afb-canvas-empty { position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; color: #94a3b8; gap: .5rem;
  pointer-events: none; animation: pulse 3s infinite; }
.afb-canvas-empty span { font-size: 2.5rem; }
.afb-canvas-empty p { font-size: .95rem; }

.afb-svg-layer { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.afb-svg-layer.interactive { pointer-events: all; }

/* ── Canvas Screen Cards ── */
.afb-screen-node {
  position: absolute; width: 110px;
  background: #fff; border: 2px solid #e2e8f0; border-radius: 14px;
  padding: .85rem .6rem .7rem;
  display: flex; flex-direction: column; align-items: center; gap: .35rem;
  box-shadow: 0 4px 12px rgba(0,0,0,.08); cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .15s;
  user-select: none; text-align: center;
  animation: popIn .25s ease-out;
}
.afb-screen-node:hover { transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,.12); }
.afb-screen-node.connecting-source { border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,.25); }
.afb-screen-node.connecting-target { border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.25); }
.afb-screen-node-icon { font-size: 1.5rem; }
.afb-screen-node-name { font-size: .72rem; font-weight: 600; color: #0f172a; line-height: 1.3; }
.afb-screen-node-remove {
  position: absolute; top: -8px; right: -8px;
  width: 22px; height: 22px; border-radius: 50%;
  background: #ef4444; color: #fff; border: 2px solid #fff;
  font-size: .65rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,.2);
  transition: all .2s; opacity: 0;
}
.afb-screen-node:hover .afb-screen-node-remove { opacity: 1; transform: scale(1.1); }

/* ── Arrow / Connection ── */
.afb-arrow-path { stroke: #8B5CF6; stroke-width: 2.5; fill: none; cursor: pointer;
  transition: stroke .2s; }
.afb-arrow-path:hover { stroke: #ef4444; stroke-width: 3; }

/* ── Drag ghost ── */
.afb-drag-ghost { position: fixed; pointer-events: none; z-index: 9999;
  opacity: .75; transform: rotate(3deg) scale(0.95); }

/* ── Canvas Connect Hint ── */
.afb-hint { display: flex; align-items: center; gap: .5rem; color: #6d28d9;
  font-size: .9rem; font-weight: 500; margin-bottom: 1rem; }
.afb-hint-dot { width: 8px; height: 8px; border-radius: 50%; background: #7c3aed;
  animation: pulse 1.2s infinite; }

/* ── Warning / Success banners ── */
.afb-warn   { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem 1.25rem;
  border-radius: 0 .5rem .5rem 0; color: #92400e; font-size: .95rem; line-height: 1.6;
  margin-bottom: 1.25rem; animation: slideIn .3s ease-out; }
.afb-success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem 1.25rem;
  border-radius: 0 .5rem .5rem 0; color: #166534; font-size: .95rem; line-height: 1.6;
  margin-bottom: 1.25rem; animation: slideIn .3s ease-out; }

/* ── Primary Button ── */
.afb-btn { display: block; width: 100%; padding: 1.1rem; border-radius: .75rem; border: none;
  font-size: 1.1rem; font-weight: 600; font-family: 'Outfit', sans-serif;
  cursor: pointer; transition: all .2s; text-align: center; }
.afb-btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  box-shadow: 0 4px 14px rgba(124,58,237,.35); }
.afb-btn-primary:hover:not(:disabled) { transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124,58,237,.45); }
.afb-btn-primary:disabled { background: #cbd5e1; color: #f8fafc;
  cursor: not-allowed; box-shadow: none; }
.afb-btn-amber { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
  box-shadow: 0 4px 14px rgba(245,158,11,.35); margin-top: 1.5rem; }
.afb-btn-amber:hover { transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245,158,11,.45); }

/* ── Flow Summary ── */
.afb-flow-summary { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,.06);
  animation: slideUp .45s ease-out forwards; margin-bottom: 2rem; }
.afb-flow-summary p { font-size: 1.05rem; color: #475569; line-height: 1.7; margin-bottom: .75rem; }

/* ── Reveal Card ── */
.afb-reveal { background: #fffbeb; border-left: 6px solid #f59e0b;
  border-radius: 0 16px 16px 0; padding: 2rem 2rem 1.5rem;
  margin-bottom: 2rem; animation: slideIn .5s ease-out forwards;
  box-shadow: 0 4px 24px rgba(245,158,11,.15); }
.afb-reveal h2 { font-size: 1.5rem; font-weight: 700; color: #78350f; margin-bottom: 1rem; }
.afb-reveal p  { color: #92400e; font-size: 1rem; line-height: 1.75; margin-bottom: .5rem; }

/* ── Divider ── */
.afb-divider { border: none; border-top: 2px dashed #e2e8f0; margin: 3rem 0; }

/* ── Section 2 ── */
.afb-section2 { animation: slideUp .5s ease-out forwards; }
.afb-paper-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,.06); margin-bottom: 2rem; }
.afb-paper-card p { color: #475569; line-height: 1.8; font-size: 1rem; margin-bottom: 1rem; }
.afb-checklist { list-style: none; margin: .5rem 0 1rem .25rem; }
.afb-checklist li { color: #166534; font-weight: 500; font-size: .95rem;
  margin-bottom: .35rem; display: flex; align-items: flex-start; gap: .5rem; }
.afb-textarea { width: 100%; padding: 1.1rem; border: 1.5px solid #e2e8f0; border-radius: .75rem;
  font-family: 'Outfit', sans-serif; font-size: 1rem; resize: vertical;
  min-height: 130px; background: #fff; color: #0f172a;
  transition: all .2s; line-height: 1.6; }
.afb-textarea:focus { outline: none; border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.afb-textarea::placeholder { color: #94a3b8; }
.afb-counter { font-size: .85rem; color: #94a3b8; margin-top: .5rem;
  font-weight: 500; transition: color .3s; }
.afb-counter.done { color: #22c55e; }
.afb-mentor-note { font-size: .88rem; color: #94a3b8; margin-top: .5rem;
  font-style: italic; }

/* ── Final Done Card ── */
.afb-done-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 2.5rem 2rem; box-shadow: 0 8px 30px rgba(0,0,0,.08);
  text-align: center; animation: popIn .5s ease-out forwards; }
.afb-done-card h2 { font-size: 2rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
.afb-done-card p  { color: #475569; font-size: 1.05rem; line-height: 1.75;
  max-width: 540px; margin: 0 auto .75rem; }
.afb-checklist-done { list-style: none; margin: 1.5rem auto; max-width: 420px; text-align: left; }
.afb-checklist-done li { color: #166534; font-weight: 600; font-size: 1rem;
  margin-bottom: .5rem; display: flex; align-items: flex-start; gap: .5rem; }

@media (max-width: 600px) {
  .afb-wrap { padding: 1.5rem 1rem 4rem; }
  .afb-header h1 { font-size: 1.6rem; }
  .afb-screen-node { width: 96px; }
  .afb-screen-node-name { font-size: .66rem; }
}
`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Count sentences (rough: split on ., ?, !)
function countSentences(text) {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/[.!?]+/).filter(s => s.trim().length > 3).length;
}

// ─────────────────────────────────────────────
// CANVAS COMPONENT
// ─────────────────────────────────────────────
function Canvas({ nodes, arrows, onAddNode, onRemoveNode, onAddArrow, onRemoveArrow, muted }) {
  const [connectSource, setConnectSource] = useState(null);
  const [dragGhost, setDragGhost] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const canvasRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // ── Drag-from-library (HTML5 drag)
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };
  const handleCanvasDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const screenId = e.dataTransfer.getData('screenId');
    if (!screenId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(e.clientX - rect.left - 55, rect.width - 120));
    const y = Math.max(10, Math.min(e.clientY - rect.top - 50, rect.height - 140));
    onAddNode(screenId, x, y);
    playSound('add', muted);
  };

  // ── Node dragging on canvas
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.target.classList.contains('afb-screen-node-remove')) return;
    if (connectSource !== null) return; // in connect mode - treat as click
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const node = nodesRef.current.find(n => n.id === nodeId);
    let startNX = node.x, startNY = node.y;
    let moved = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      const rect = canvasRef.current.getBoundingClientRect();
      const nx = Math.max(0, Math.min(startNX + dx, rect.width - 120));
      const ny = Math.max(0, Math.min(startNY + dy, rect.height - 150));
      // directly mutate for perf - re-render via state update
      onMoveNode(nodeId, nx, ny);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Will be injected via prop to keep Canvas pure
  const onMoveNode = useCallback((id, x, y) => {
    // We bubble up via a special prop if provided
  }, []);

  // ── Node click for connect mode
  const handleNodeClick = (e, nodeId) => {
    if (e.target.classList.contains('afb-screen-node-remove')) return;
    if (connectSource === null) {
      setConnectSource(nodeId);
    } else if (connectSource === nodeId) {
      setConnectSource(null);
    } else {
      // Check duplicate
      const exists = arrows.some(
        a => (a.from === connectSource && a.to === nodeId) ||
             (a.from === nodeId && a.to === connectSource)
      );
      if (!exists) {
        onAddArrow(connectSource, nodeId);
        playSound('tick', muted);
      }
      setConnectSource(null);
    }
  };

  // ── SVG arrow math
  const getNodeCenter = (node) => ({
    x: node.x + 55,
    y: node.y + 65,
  });

  const makeCurvedPath = (n1, n2) => {
    const c1 = getNodeCenter(n1);
    const c2 = getNodeCenter(n2);
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const cx = c1.x + dx / 2 + dy * 0.25;
    const cy = c1.y + dy / 2 - dx * 0.25;
    return `M ${c1.x} ${c1.y} Q ${cx} ${cy} ${c2.x} ${c2.y}`;
  };

  // Arrowhead at end of path
  const arrowHead = (n1, n2) => {
    const c1 = getNodeCenter(n1);
    const c2 = getNodeCenter(n2);
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const offset = 60;
    const tipX = c2.x - ux * offset / 2;
    const tipY = c2.y - uy * offset / 2;
    const size = 9;
    const lx = tipX - ux * size + uy * (size * 0.5);
    const ly = tipY - uy * size - ux * (size * 0.5);
    const rx = tipX - ux * size - uy * (size * 0.5);
    const ry = tipY - uy * size + ux * (size * 0.5);
    return `M ${tipX} ${tipY} L ${lx} ${ly} L ${rx} ${ry} Z`;
  };

  const isEmpty = nodes.length === 0;

  return (
    <div
      ref={canvasRef}
      className={`afb-canvas-wrap`}
      style={{ minHeight: 340 }}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      {isEmpty && (
        <div className="afb-canvas-empty">
          <span>📲</span>
          <p>Drag screens here to build your flow</p>
        </div>
      )}

      {/* SVG arrow layer */}
      <svg
        className={`afb-svg-layer${connectSource ? ' interactive' : ''}`}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
          </marker>
        </defs>
        {arrows.map(arrow => {
          const n1 = nodes.find(n => n.id === arrow.from);
          const n2 = nodes.find(n => n.id === arrow.to);
          if (!n1 || !n2) return null;
          return (
            <g key={arrow.id} onClick={() => { onRemoveArrow(arrow.id); playSound('remove', muted); }} style={{ cursor: 'pointer' }}>
              <path
                d={makeCurvedPath(n1, n2)}
                className="afb-arrow-path"
                markerEnd="url(#arrowhead)"
              />
              {/* invisible hit area */}
              <path
                d={makeCurvedPath(n1, n2)}
                stroke="transparent"
                strokeWidth="16"
                fill="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Screen nodes */}
      {nodes.map(node => (
        <div
          key={node.id}
          className={`afb-screen-node ${connectSource === node.id ? 'connecting-source' : ''} ${connectSource && connectSource !== node.id ? 'connecting-target' : ''}`}
          style={{ left: node.x, top: node.y }}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onClick={(e) => handleNodeClick(e, node.id)}
        >
          <button
            className="afb-screen-node-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveNode(node.id);
              playSound('remove', muted);
              if (connectSource === node.id) setConnectSource(null);
            }}
          >×</button>
          <div className="afb-screen-node-icon">{node.icon}</div>
          <div className="afb-screen-node-name">{node.name}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function AppFlowBuilder() {
  const [muted, setMuted] = useState(false);
  const [domain, setDomain] = useState('');
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [warning, setWarning] = useState('');
  const [flowReady, setFlowReady] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [flowText, setFlowText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const section2Ref = useRef(null);

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // Reset canvas when domain changes
  const handleDomain = (d) => {
    playSound('tick', muted);
    setDomain(d);
    setCanvasNodes([]);
    setArrows([]);
    setWarning('');
    setFlowReady(false);
    setShowReveal(false);
  };

  // ── Library → Canvas
  const addNodeToCanvas = (screen, x, y) => {
    const alreadyOn = canvasNodes.find(n => n.screenId === screen.id);
    if (alreadyOn) return;
    const canvasEl = document.querySelector('.afb-canvas-wrap');
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : { width: 600, height: 340 };
    // auto-position if no x/y
    const count = canvasNodes.length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    const autoX = 20 + col * 135;
    const autoY = 20 + row * 155;
    setCanvasNodes(prev => [...prev, {
      id: uid(),
      screenId: screen.id,
      icon: screen.icon,
      name: screen.name,
      x: x !== undefined ? x : autoX,
      y: y !== undefined ? y : autoY,
    }]);
  };

  const removeNodeFromCanvas = (nodeId) => {
    setCanvasNodes(prev => prev.filter(n => n.id !== nodeId));
    setArrows(prev => prev.filter(a => a.from !== nodeId && a.to !== nodeId));
  };

  const moveNode = (nodeId, x, y) => {
    setCanvasNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  };

  const addArrow = (from, to) => {
    setArrows(prev => [...prev, { id: uid(), from, to }]);
  };

  const removeArrow = (arrowId) => {
    setArrows(prev => prev.filter(a => a.id !== arrowId));
  };

  // ── Validate flow
  const handleFlowReady = () => {
    if (canvasNodes.length < 3) {
      playSound('warn', muted);
      setWarning('screens');
      return;
    }
    if (arrows.length === 0) {
      playSound('warn', muted);
      setWarning('arrows');
      return;
    }
    setWarning('');
    playSound('correct', muted);
    setFlowReady(true);
    setTimeout(() => {
      playSound('reveal', muted);
      setShowReveal(true);
    }, 800);
  };

  // ── Section 2
  const scrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sentenceCount = countSentences(flowText);
  const canSubmit = sentenceCount >= 2;

  const handleSubmit = () => {
    if (!canSubmit) return;
    playSound('submit', muted);
    setSubmitted(true);
  };

  const screens = domain ? screenData[domain] : [];

  return (
    <div className="afb-wrap">
      <button className="afb-mute" onClick={() => setMuted(m => !m)} title={muted ? 'Unmute' : 'Mute'}>
        {muted ? '🔇' : '🔊'}
      </button>

      {/* ════ SECTION 1 ════ */}
      <div className="afb-header">
        <h1>Draw how your app flows - screen by screen 📱</h1>
        <p>Drag the screens your app needs onto the canvas.<br/>Then connect them with arrows to show how a user moves through your app.</p>
      </div>

      {/* Domain Selector */}
      <div className="afb-pills">
        {[
          { id: 'Gym',       label: '🏋️ Gym' },
          { id: 'Mess',      label: '🍱 Mess' },
          { id: 'Hotel',     label: '🏨 Hotel' },
          { id: 'Chai Shop', label: '☕ Chai Shop' },
          { id: 'Other',     label: '🏪 Other' },
        ].map(d => (
          <button
            key={d.id}
            className={`afb-pill${domain === d.id ? ' active' : ''}`}
            onClick={() => handleDomain(d.id)}
          >{d.label}</button>
        ))}
      </div>

      {/* Builder - shown after domain selected */}
      {domain && !submitted && (
        <>
          {/* Screen Library */}
          <div className="afb-section" style={{ animation: 'fadeIn .5s ease-out' }}>
            <h2>Screens available for your app</h2>
            <p style={{ marginBottom: '.85rem' }}>Drag the ones you need onto the canvas below</p>
            <div className="afb-library-scroll">
              {screens.map(screen => {
                const used = !!canvasNodes.find(n => n.screenId === screen.id);
                return (
                  <div
                    key={screen.id}
                    className={`afb-lib-card${used ? ' used' : ''}`}
                    draggable={!used}
                    onDragStart={e => {
                      e.dataTransfer.setData('screenId', screen.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onDragEnd={() => {}}
                  >
                    <div className="afb-lib-card-icon">{screen.icon}</div>
                    <div className="afb-lib-card-name">{screen.name}</div>
                    <div className="afb-lib-card-desc">{screen.desc}</div>
                    {!used && (
                      <button
                        className="afb-lib-card-add"
                        onClick={() => { addNodeToCanvas(screen); playSound('add', muted); }}
                      >+ Add</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="afb-section" style={{ marginTop: '1.5rem', animation: 'fadeIn .6s ease-out' }}>
            <h2>Your app flow</h2>
            <p style={{ marginBottom: '.75rem' }}>Drop screens here. Then click two screens to draw an arrow between them.</p>

            {canvasNodes.length >= 2 && arrows.length === 0 && (
              <div className="afb-hint">
                <div className="afb-hint-dot" />
                Click a screen, then click another to connect them with an arrow
              </div>
            )}
            {canvasNodes.length >= 1 && arrows.length > 0 && (
              <div className="afb-hint" style={{ color: '#64748b' }}>
                <div className="afb-hint-dot" style={{ background: '#94a3b8', animationName: 'none' }} />
                Click any arrow to remove it · Click two screens to connect them
              </div>
            )}

            <CanvasWithMove
              nodes={canvasNodes}
              arrows={arrows}
              onAddNode={addNodeToCanvas}
              onRemoveNode={removeNodeFromCanvas}
              onMoveNode={moveNode}
              onAddArrow={addArrow}
              onRemoveArrow={removeArrow}
              muted={muted}
            />

            {/* Warnings */}
            {warning === 'screens' && (
              <div className="afb-warn">
                ⚠️ <strong>Your app needs at least 3 screens</strong> - one for each of your MVP features. Add a few more!
              </div>
            )}
            {warning === 'arrows' && (
              <div className="afb-warn">
                ⚠️ <strong>Don't forget the arrows!</strong> Connect your screens to show how a user moves through your app.
              </div>
            )}

            {!flowReady && (
              <button className="afb-btn afb-btn-primary" style={{ maxWidth: 420, margin: '0 auto' }} onClick={handleFlowReady}>
                My flow is ready →
              </button>
            )}
          </div>

          {/* Flow Ready Summary */}
          {flowReady && (
            <div className="afb-flow-summary">
              <p style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 600, marginBottom: '.5rem' }}>
                Your app has <strong>{canvasNodes.length} screens</strong> connected by <strong>{arrows.length} arrow{arrows.length !== 1 ? 's' : ''}</strong>.
              </p>
              <p>
                This is the journey a real user will take through your app.
              </p>
              <p>
                Before any code - you already know exactly what you are building.
              </p>
            </div>
          )}

          {/* Reveal Card */}
          {showReveal && (
            <div className="afb-reveal">
              <h2>You just made your first Wireframe 🎉</h2>
              <p>
                Those screen boxes and arrows?<br/>
                The whole developer world calls them <strong>Wireframes</strong>.
              </p>
              <p>
                Wireframes are the first thing every professional builds before any code.
                Not just beginners. Senior developers. Startup founders. Product teams.
              </p>
              <p>
                The people who built <strong>Swiggy</strong> drew wireframes before they wrote a line of code.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>You just did the same thing.</strong>
              </p>
              <button
                className="afb-btn afb-btn-amber"
                onClick={() => { scrollToSection2(); }}
              >
                Now let's do it on paper →
              </button>
            </div>
          )}
        </>
      )}

      {/* ════ SECTION 2 ════ */}
      {domain && showReveal && !submitted && (
        <div ref={section2Ref} className="afb-section2">
          <hr className="afb-divider" />
          <div className="afb-header" style={{ animation: 'fadeIn .6s' }}>
            <h1 style={{ fontSize: '1.9rem' }}>Now do this on real paper 📓</h1>
          </div>

          <div className="afb-paper-card">
            <p>
              The screen you just built digitally - now draw it in your notebook.
            </p>
            <p>
              Rough is perfect. Boxes for screens. Arrows between them. Labels on each box.
            </p>
            <p style={{ marginBottom: '.5rem' }}>
              This is not an art test. A 5-year-old's drawing is fine as long as it shows:
            </p>
            <ul className="afb-checklist">
              <li><span>✓</span> Which screens your app has</li>
              <li><span>✓</span> How a user moves between them</li>
            </ul>
            <p>
              Senior developers do this on whiteboards, napkins, the back of receipts.
              Your notebook is more than enough.
            </p>
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '.5rem' }}>When you are done:</p>
            <p style={{ marginBottom: '.25rem' }}>1. Take a photo of your sketch</p>
            <p style={{ marginBottom: '.25rem' }}>2. Come back here</p>
            <p>3. Write one sentence describing your app flow</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '1.05rem', color: '#0f172a', marginBottom: '.6rem' }}>
              Your own words only - what does your sketch show?
            </label>
            <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '.75rem', lineHeight: 1.6 }}>
              How does a user go from opening your app to completing their main task?
            </p>
            <textarea
              className="afb-textarea"
              placeholder={"My app starts at the Login screen, then the user goes to... and finally..."}
              value={flowText}
              onChange={e => setFlowText(e.target.value)}
              onPaste={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
            />
            <div className={`afb-counter${sentenceCount >= 2 ? ' done' : ''}`}>
              {sentenceCount >= 2
                ? `✓ ${sentenceCount} sentences written - ready to submit`
                : `${sentenceCount} of 2 sentences written`}
            </div>
            <div className="afb-mentor-note" style={{ marginTop: '.75rem' }}>
              Your mentor will ask you to share your paper sketch photo in the next check-in. Keep it ready.
            </div>
          </div>

          <button
            className="afb-btn afb-btn-primary"
            style={{ maxWidth: 480, margin: '0 auto' }}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            My sketch is done - I'm ready to set up →
          </button>
        </div>
      )}

      {/* ════ DONE STATE ════ */}
      {submitted && (
        <div className="afb-done-card" style={{ marginTop: '2rem' }}>
          <h2>Your wireframe is ready. 📱</h2>
          <p>You now know:</p>
          <ul className="afb-checklist-done">
            <li><span>✓</span> Your business and their problem</li>
            <li><span>✓</span> Your 3 MVP features</li>
            <li><span>✓</span> Your app's screens and flow</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            One more thing before the coding starts -<br/>
            let's make sure your laptop is ready.
          </p>
          <p style={{ fontWeight: 600, color: '#7c3aed', fontSize: '1.1rem', marginTop: '1rem' }}>
            Next: get your development environment set up.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CANVAS WITH MOVE - wraps Canvas and handles
// node movement state at this level so we keep
// Canvas re-renders minimal
// ─────────────────────────────────────────────
function CanvasWithMove({ nodes, arrows, onAddNode, onRemoveNode, onMoveNode, onAddArrow, onRemoveArrow, muted }) {
  const [connectSource, setConnectSource] = useState(null);
  const canvasRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const handleCanvasDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); };
  const handleCanvasDragLeave = (e) => { e.currentTarget.classList.remove('dragover'); };
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const screenId = e.dataTransfer.getData('screenId');
    if (!screenId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(e.clientX - rect.left - 55, rect.width - 125));
    const y = Math.max(10, Math.min(e.clientY - rect.top - 50, rect.height - 145));
    const domain = Object.keys(screenData).find(d => screenData[d].find(s => s.id === screenId));
    if (!domain) return;
    const screen = screenData[domain].find(s => s.id === screenId);
    onAddNode(screen, x, y);
    playSound('add', muted);
  };

  // Mouse-drag of node on canvas
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.target.classList.contains('afb-screen-node-remove')) return;
    if (connectSource !== null) {
      // treat as click for connecting
      handleNodeClick(nodeId);
      return;
    }
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const node = nodesRef.current.find(n => n.id === nodeId);
    const startNX = node.x, startNY = node.y;
    let moved = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      const rect = canvasRef.current.getBoundingClientRect();
      const nx = Math.max(0, Math.min(startNX + dx, rect.width - 120));
      const ny = Math.max(0, Math.min(startNY + dy, rect.height - 145));
      onMoveNode(nodeId, nx, ny);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleNodeClick = (nodeId) => {
    if (connectSource === null) {
      setConnectSource(nodeId);
    } else if (connectSource === nodeId) {
      setConnectSource(null);
    } else {
      const exists = arrows.some(
        a => (a.from === connectSource && a.to === nodeId) ||
             (a.from === nodeId && a.to === connectSource)
      );
      if (!exists) {
        onAddArrow(connectSource, nodeId);
        playSound('tick', muted);
      }
      setConnectSource(null);
    }
  };

  const getNodeCenter = (node) => ({ x: node.x + 55, y: node.y + 65 });

  const makeCurvedPath = (n1, n2) => {
    const c1 = getNodeCenter(n1);
    const c2 = getNodeCenter(n2);
    const dx = c2.x - c1.x, dy = c2.y - c1.y;
    const cx = c1.x + dx / 2 + dy * 0.3;
    const cy = c1.y + dy / 2 - dx * 0.3;
    return `M ${c1.x} ${c1.y} Q ${cx} ${cy} ${c2.x} ${c2.y}`;
  };

  const isEmpty = nodes.length === 0;

  return (
    <div
      ref={canvasRef}
      className="afb-canvas-wrap"
      style={{ minHeight: 340 }}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      {isEmpty && (
        <div className="afb-canvas-empty">
          <span>📲</span>
          <p>Drag screens here to build your flow</p>
        </div>
      )}

      {/* SVG arrows */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
      >
        <defs>
          <marker id="arr" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#8B5CF6" />
          </marker>
        </defs>
        {arrows.map(arrow => {
          const n1 = nodes.find(n => n.id === arrow.from);
          const n2 = nodes.find(n => n.id === arrow.to);
          if (!n1 || !n2) return null;
          return (
            <g key={arrow.id} style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onClick={() => { onRemoveArrow(arrow.id); playSound('remove', muted); }}>
              <path d={makeCurvedPath(n1, n2)} stroke="#8B5CF6" strokeWidth="2.5" fill="none" markerEnd="url(#arr)" />
              <path d={makeCurvedPath(n1, n2)} stroke="transparent" strokeWidth="18" fill="none" />
            </g>
          );
        })}
      </svg>

      {/* Screen Nodes */}
      {nodes.map(node => (
        <div
          key={node.id}
          className={`afb-screen-node${connectSource === node.id ? ' connecting-source' : ''}${connectSource && connectSource !== node.id ? ' connecting-target' : ''}`}
          style={{ left: node.x, top: node.y }}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onClick={(e) => {
            if (!e.target.classList.contains('afb-screen-node-remove')) handleNodeClick(node.id);
          }}
        >
          <button
            className="afb-screen-node-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveNode(node.id);
              if (connectSource === node.id) setConnectSource(null);
            }}
          >×</button>
          <div className="afb-screen-node-icon">{node.icon}</div>
          <div className="afb-screen-node-name">{node.name}</div>
        </div>
      ))}

      {/* Connecting hint overlay */}
      {connectSource && (
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(124,58,237,.9)', color: '#fff', borderRadius: 999,
          padding: '.35rem 1rem', fontSize: '.8rem', fontWeight: 600, pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          Now click another screen to connect →
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppFlowBuilder />);
