import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Sound Engine ─── */
function useSounds() {
  const muted = useRef(false);
  const ctx = useRef(null);
  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.current.state === 'suspended') ctx.current.resume();
      const g = ctx.current.createGain();
      g.connect(ctx.current.destination);
      g.gain.setValueAtTime(0.25, ctx.current.currentTime);
      const o = (f, s, d, w = 'sine') => {
        const osc = ctx.current.createOscillator();
        osc.type = w; osc.connect(g);
        osc.frequency.setValueAtTime(f, ctx.current.currentTime + s);
        osc.start(ctx.current.currentTime + s);
        osc.stop(ctx.current.currentTime + s + d);
      };
      if (type === 'warn')    { o(330,0,.2); o(277,.1,.2); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.3); }
      if (type === 'correct') { [523,659,784].forEach((f,i)=>o(f,i*.1,.15)); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.45); }
      if (type === 'tick')    { o(800,0,.05,'triangle'); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.05); }
      if (type === 'reveal')  { [523,659,784,1047].forEach((f,i)=>o(f,i*.12,.2)); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.6); }
      if (type === 'submit')  { o(392,0,.4); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.4); }
      if (type === 'add')     { o(220,0,.15); o(440,.05,.15); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.2); }
      if (type === 'boom')    { o(80,0,.4,'sawtooth'); o(160,0,.3,'sine'); g.gain.exponentialRampToValueAtTime(0.01, ctx.current.currentTime+.5); }
    } catch(e) {}
  }, []);
  return { play, muted };
}

/* ─── Particle system for data loss ─── */
function DataParticles({ active }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const names = ['Ravi','Suresh','Priya','id:1','id:2','id:3','name','age','plan'];
    const ps = names.map((n, i) => ({
      id: i, label: n,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 4 + 2),
      opacity: 1, scale: 1,
    }));
    setParticles(ps);
    let frame;
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.15,
        opacity: Math.max(0, p.opacity - 0.025),
        scale: Math.max(0, p.scale - 0.01),
      })).filter(p => p.opacity > 0));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:20 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          opacity: p.opacity, transform:`scale(${p.scale})`,
          background:'#4F46E5', color:'white',
          padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700,
          fontFamily:'monospace', whiteSpace:'nowrap', boxShadow:'0 0 10px rgba(79,70,229,0.3)',
          pointerEvents:'none',
        }}>{p.label}</div>
      ))}
    </div>
  );
}

/* ─── Field → Column mapping data ─── */
const CLASS_FIELDS = [
  { key:'id',       type:'Long',    name:'id',       col:'id',       sqlType:'BIGINT',  label:'Auto-generated unique number for each row - MySQL assigns it', color:'#8B5CF6' },
  { key:'name',     type:'String',  name:'name',     col:'name',     sqlType:'VARCHAR', label:'Java String → MySQL VARCHAR - variable-length text', color:'#3B82F6' },
  { key:'age',      type:'int',     name:'age',      col:'age',      sqlType:'INTEGER', label:'Java int → MySQL INTEGER - whole numbers only', color:'#F59E0B' },
  { key:'plan',     type:'String',  name:'plan',     col:'plan',     sqlType:'VARCHAR', label:'Java String → MySQL VARCHAR - another text column', color:'#10B981' },
  { key:'isActive', type:'boolean', name:'isActive', col:'isActive', sqlType:'TINYINT', label:'Java boolean → MySQL TINYINT - stored as 0 or 1', color:'#EF4444' },
];

const SAMPLE_ROWS = [
  { id:1, name:'Ravi',   age:21, plan:'Basic',   isActive:true },
  { id:2, name:'Suresh', age:24, plan:'Premium', isActive:true },
  { id:3, name:'Priya',  age:22, plan:'Basic',   isActive:false },
];

const DOMAIN_FIELDS = {
  Gym:   [{ f:'id',type:'Long',c:'id',t:'BIGINT',auto:true},{ f:'name',type:'String',c:'name',t:'VARCHAR'},{ f:'age',type:'int',c:'age',t:'INTEGER'},{ f:'plan',type:'String',c:'plan',t:'VARCHAR'},{ f:'isActive',type:'boolean',c:'is_active',t:'TINYINT'}],
  Hotel: [{ f:'id',type:'Long',c:'id',t:'BIGINT',auto:true},{ f:'roomNumber',type:'String',c:'room_number',t:'VARCHAR'},{ f:'type',type:'String',c:'type',t:'VARCHAR'},{ f:'price',type:'double',c:'price',t:'DECIMAL'},{ f:'isAvailable',type:'boolean',c:'is_available',t:'TINYINT'}],
  Mess:  [{ f:'id',type:'Long',c:'id',t:'BIGINT',auto:true},{ f:'itemName',type:'String',c:'item_name',t:'VARCHAR'},{ f:'price',type:'double',c:'price',t:'DECIMAL'},{ f:'category',type:'String',c:'category',t:'VARCHAR'},{ f:'isAvail',type:'boolean',c:'is_available',t:'TINYINT'}],
  Chai:  [{ f:'id',type:'Long',c:'id',t:'BIGINT',auto:true},{ f:'itemName',type:'String',c:'item_name',t:'VARCHAR'},{ f:'qty',type:'int',c:'quantity',t:'INTEGER'},{ f:'customer',type:'String',c:'customer_name',t:'VARCHAR'},{ f:'done',type:'boolean',c:'is_prepared',t:'TINYINT'}],
};

const MCQ = [
  { q:'What happens to your List<GymMember> when MySQL is connected?',
    opts:[{a:'A',t:"It still exists alongside MySQL"},{ a:'B',t:'The List is replaced - MySQL stores the data instead'},{ a:'C',t:'MySQL is just a backup for the List'}],
    correct:'B', explain:'MySQL takes over completely. No more List.' },
  { q:'What is the relationship between one Java object and MySQL?',
    opts:[{ a:'A',t:'One object = one database'},{ a:'B',t:'One object = one row in the table'},{ a:'C',t:'One object = one column'}],
    correct:'B', explain:'Every GymMember object becomes exactly one row.' },
  { q:'Why does MySQL data survive restarts while List data doesn\'t?',
    opts:[{ a:'A',t:'MySQL is faster than a List'},{ a:'B',t:'MySQL stores on disk (hard drive), List stores in RAM (memory)'},{ a:'C',t:'MySQL is cloud-based'}],
    correct:'B', explain:'RAM is wiped on shutdown. Disk survives everything.' },
];

/* ══════════════════════════════════════════════ */
export default function DatabaseIntro() {
  const params = new URLSearchParams(window.location.search);
  const { play, muted } = useSounds();
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = () => { setIsMuted(v=>!v); muted.current = !isMuted; };

  const [scene, setScene] = useState(0);      // 0=landing 1=pain 2=analogy 3=mapping 4=phase2
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (s) => {
    setTransitioning(true);
    setTimeout(() => { setScene(s); setTransitioning(false); play('tick'); }, 350);
  };

  /* Scene 1 */
  const [serverOn, setServerOn] = useState(true);
  const [burstActive, setBurstActive] = useState(false);
  const [listItems] = useState(['Ravi','Suresh','Priya']);
  const [listVisible, setListVisible] = useState(true);
  const [restartDone, setRestartDone] = useState(false);

  const handleRestart = () => {
    play('boom');
    setBurstActive(true);
    setServerOn(false);
    setTimeout(() => {
      setListVisible(false);
      setBurstActive(false);
    }, 800);
    setTimeout(() => {
      setServerOn(true);
      setRestartDone(true);
    }, 1400);
  };

  /* Scene 2 */
  const [wbNames, setWbNames] = useState(['Ravi, Suresh, Priya']);
  const [wbErasing, setWbErasing] = useState(false);
  const [wbErased, setWbErased] = useState(false);
  const [nbEntries, setNbEntries] = useState(['Entry 1: Ravi – 21 – Basic','Entry 2: Suresh – 24 – Premium']);
  const [nbFlash, setNbFlash] = useState(false);
  const [nbSurvived, setNbSurvived] = useState(false);

  const eraseWb = () => { play('warn'); setWbErasing(true); setTimeout(()=>setWbErased(true),900); };
  const addWb = () => { if(!wbErased) setWbNames(p=>[...p,'Anitha, Kiran']); };
  const addNb = () => setNbEntries(p=>[...p,`Entry ${p.length+1}: Anitha – 23 – Basic`]);
  const restartNb = () => {
    setNbFlash(true);
    setTimeout(() => { setNbFlash(false); setNbSurvived(true); play('correct'); }, 900);
  };

  /* Scene 3 */
  const [tapped, setTapped] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [revealLines, setRevealLines] = useState(0);
  const allTapped = tapped.length >= CLASS_FIELDS.length;

  const tapField = (key) => {
    if (tapped.includes(key)) return;
    setTapped(p => [...p, key]);
    setActiveField(key);
    play('tick');
    setTimeout(() => setActiveField(null), 2200);
  };

  useEffect(() => {
    if (!allTapped) return;
    play('correct');
    setTimeout(() => {
      play('reveal');
      let c = 0;
      const iv = setInterval(() => { c++; setRevealLines(c); play('tick'); if(c>=8) clearInterval(iv); }, 700);
    }, 700);
  }, [allTapped]);

  /* Phase 2 */
  const [domain, setDomain] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [qAnswers, setQAnswers] = useState({});
  const [qWrong, setQWrong] = useState({});
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sentences = (reflection.match(/[.!?]+/g)||[]).length;
  const allQ = qAnswers[0]==='B' && qAnswers[1]==='B' && qAnswers[2]==='B';
  const tableOk = domain && tableRows.every(r=>r.c && r.t);
  const canSubmit = allQ && tableOk && sentences>=1 && !submitted;

  const chooseDomain = (d) => {
    setDomain(d);
    setTableRows(DOMAIN_FIELDS[d].map(r=>({...r})));
    play('tick');
  };
  const answerQ = (qi, ans) => {
    if (qAnswers[qi]) return;
    if (ans === MCQ[qi].correct) { setQAnswers(p=>({...p,[qi]:ans})); play('correct'); }
    else { setQWrong(p=>({...p,[`${qi}-${ans}`]:true})); play('warn'); }
  };

  useEffect(() => {
    if (!submitted) return;
    try {
      window.parent.postMessage({
        type:'HK_RESULT', version:'1', exerciseId:'m2-t3-s1-database-intro',
        status:'completed', score:3, maxScore:3,
        answers:{ phase1:{ allTapped:true }, phase2:{ domain, tableRows, questions:qAnswers, reflection } },
        metadata:{ subtopicId:params.get('subtopicId'), taskId:params.get('taskId') },
        completedAt: new Date().toISOString()
      }, '*');
    } catch(e) {}
  }, [submitted]);

  /* ─── Styles ─── */
  const S = {
    root: {
      fontFamily:"'Inter', system-ui, -apple-system, sans-serif",
      background:'#F8FAFC',
      minHeight:'100vh',
      color:'#1E293B',
      padding:'0',
      lineHeight:1.6,
    },
    glow: (color='#6366F1') => ({
      boxShadow:`0 4px 20px ${color}15, 0 1px 3px rgba(0,0,0,0.05)`,
    }),
    glass: {
      background:'#FFFFFF',
      border:'1px solid #E2E8F0',
      borderRadius:16,
      boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    },
    glassLight: {
      background:'#FFFFFF',
      border:'1px solid #E2E8F0',
      borderRadius:12,
      boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
    pill: (color) => ({
      background:`${color}12`, border:`1px solid ${color}44`,
      color, padding:'4px 12px', borderRadius:20, fontSize:12,
      fontWeight:700, fontFamily:'monospace', display:'inline-block',
    }),
    badge: (color) => ({
      background:color, color:'white', padding:'3px 8px',
      borderRadius:4, fontSize:10, fontWeight:800, display:'inline-block',
    }),
  };

  const transStyle = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  };

  /* ─── Landing ─── */
  if (scene === 0) return (
    <div style={{ ...S.root, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .btn-main { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:12px; color:white; padding:16px 36px; font-size:1.1rem; font-weight:800; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 30px rgba(79,70,229,0.35); }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(79,70,229,0.5); }
        .btn-sec { background:white; border:1px solid #E2E8F0; border-radius:10px; color:#475569; padding:12px 24px; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.02); }
        .btn-sec:hover { background:#F8FAFC; color:#1E293B; border-color:#CBD5E1; }
        .btn-danger { background:linear-gradient(135deg,#EF4444,#DC2626); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(239,68,68,0.25); }
        .btn-danger:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(239,68,68,0.35); }
        .btn-green { background:linear-gradient(135deg,#10B981,#059669); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(16,185,129,0.25); }
        .btn-green:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(16,185,129,0.35); }
        .field-tap { cursor:pointer; padding:12px 16px; border-radius:8px; transition:all 0.2s; border:1px solid #E2E8F0; background:white; color:#334155; }
        .field-tap:hover { background:#F5F3FF; border-color:#C4B5FD; }
        .field-tap.done { background:#F5F3FF; border-color:#8B5CF6; }
        .mcq-btn { width:100%; text-align:left; padding:14px 18px; border-radius:10px; border:1.5px solid #E2E8F0; background:white; color:#334155; font-size:0.95rem; font-weight:500; cursor:pointer; transition:all 0.2s; margin-bottom:8px; box-shadow:0 1px 2px rgba(0,0,0,0.02); }
        .mcq-btn:hover:not(:disabled) { border-color:#CBD5E1; background:#F8FAFC; color:#1E293B; }
        .mcq-btn.correct { border-color:#10B981; background:#F0FDF4; color:#15803D; }
        .mcq-btn.wrong { border-color:#EF4444; background:#FEF2F2; color:#991B1B; animation:shake 0.3s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .table-row-clickable { cursor:pointer; transition:background 0.2s; }
        .table-row-clickable:hover { background:#F8FAFC; }
        .table-row-clickable.selected { background:#EFF6FF; }
        .wb-erase-bar { position:absolute; top:0; left:0; height:100%; background:rgba(255,255,255,0.95); transition:width 0.85s ease-in-out; z-index:2; display:flex; align-items:center; justify-content:center; border-radius:8px; overflow:hidden; }
        .reveal-item { animation:slide-up 0.4s ease both; }
      `}</style>

      {/* Decorative Orbs */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-15%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,70,229,0.08) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)' }} />
      </div>

      <div style={{ textAlign:'center', maxWidth:560, padding:40, zIndex:1, animation:'slide-up 0.6s ease' }}>
        <div style={{ fontSize:80, marginBottom:16, animation:'float 3s ease-in-out infinite' }}>💾</div>
        <div style={{ display:'inline-block', ...S.pill('#4F46E5'), marginBottom:20, fontSize:13 }}>Subtopic 2.3.1</div>
        <h1 style={{ fontSize:'clamp(2.2rem,5vw,3rem)', fontWeight:900, margin:'0 0 16px', color:'#1E293B', letterSpacing:'-0.02em' }}>
          Why Databases Exist
        </h1>
        <p style={{ color:'#475569', fontSize:'1.1rem', marginBottom:36, lineHeight:1.7 }}>
          You have seen data disappear three times on restart. Today you find out why - and how to fix it forever.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-main" onClick={() => { goTo(1); }}>Start the Journey →</button>
          <button onClick={toggleMute} className="btn-sec">{isMuted ? '🔇' : '🔊'} Sound</button>
        </div>
      </div>
    </div>
  );

  /* ─── Scene 1: The Pain ─── */
  if (scene === 1) return (
    <div style={{ ...S.root, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 10px rgba(16,185,129,0.4)} 50%{box-shadow:0 0 20px rgba(16,185,129,0.7)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .btn-main { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:12px; color:white; padding:16px 36px; font-size:1.1rem; font-weight:800; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 30px rgba(79,70,229,0.35); }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(79,70,229,0.5); }
        .btn-sec { background:white; border:1px solid #E2E8F0; border-radius:10px; color:#475569; padding:12px 24px; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-sec:hover { background:#F8FAFC; color:#1E293B; }
        .btn-danger { background:linear-gradient(135deg,#EF4444,#DC2626); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(239,68,68,0.25); }
        .btn-danger:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(239,68,68,0.35); }
        .btn-green { background:linear-gradient(135deg,#10B981,#059669); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(16,185,129,0.25); }
        .btn-green:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(16,185,129,0.35); }
      `}</style>

      {/* Header */}
      <div style={{ padding:'20px 32px', background:'white', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:5 }}>
        <div>
          <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Scene 1 of 3</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#1E293B' }}>The Data Loss Problem</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width:32, height:4, borderRadius:2, background: i === 1 ? '#4F46E5' : '#E2E8F0', boxShadow: i === 1 ? '0 0 8px rgba(79,70,229,0.4)' : 'none', transition:'all 0.3s' }} />
          ))}
          <button onClick={toggleMute} className="btn-sec" style={{ padding:'6px 12px', marginLeft:8 }}>{isMuted?'🔇':'🔊'}</button>
        </div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:0, position:'relative', zIndex:1 }}>

        {/* LEFT */}
        <div style={{ padding:'40px 36px', background:'white', ...transStyle }}>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, margin:'0 0 12px', color:'#1E293B' }}>
            You already know this problem.
          </h2>
          <p style={{ color:'#475569', marginBottom:28, fontSize:'1rem' }}>
            Three member names saved in an ArrayList. Watch what happens when you restart.
          </p>

          {/* Server + List card */}
          <div style={{ ...S.glassLight, padding:24, marginBottom:24, position:'relative', overflow:'hidden', background:'#F8FAFC' }}>
            <DataParticles active={burstActive} />

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background: serverOn ? '#10B981' : '#EF4444', boxShadow: serverOn ? '0 0 10px #10B981' : '0 0 10px #EF4444', animation: serverOn ? 'pulse-glow 2s infinite' : 'none', transition:'all 0.3s', flexShrink:0 }} />
              <span style={{ fontWeight:700, fontSize:'0.95rem', color: serverOn ? '#16A34A' : '#EF4444' }}>
                {serverOn ? 'Server running' : 'Restarting server...'}
              </span>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:'0.8rem', color:'#64748B', fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>ArrayList in memory (RAM)</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', minHeight:44, alignItems:'center' }}>
                {listVisible ? listItems.map((n,i) => (
                  <div key={i} style={{
                    background:'#EEF2F6', border:'1px solid #CBD5E1',
                    color:'#334155', padding:'8px 18px', borderRadius:20, fontWeight:700, fontSize:'0.9rem',
                    fontFamily:'monospace', animation:'slide-up 0.3s ease',
                    transition:'all 0.6s ease',
                  }}>{n}</div>
                )) : (
                  <div style={{ color:'#EF4444', fontFamily:'monospace', fontSize:'0.95rem', animation:'slide-up 0.3s', fontWeight:700 }}>
                    [ ] &nbsp;<span style={{ color:'#64748B', fontSize:'0.85rem', fontWeight:400 }}>// empty list! all names lost</span>
                  </div>
                )}
              </div>
            </div>

            {!restartDone && listVisible && (
              <button className="btn-danger" style={{ width:'100%' }} onClick={handleRestart}>
                🔄 Restart Server
              </button>
            )}
          </div>

          {restartDone && (
            <div style={{ animation:'slide-up 0.5s ease' }}>
              <div style={{ background:'#FEF2F2', borderLeft:'4px solid #EF4444', borderRadius:8, padding:20, marginBottom:20 }}>
                <div style={{ fontWeight:800, color:'#991B1B', marginBottom:8, fontSize:'1.05rem' }}>Ravi, Suresh, Priya - gone.</div>
                <p style={{ color:'#7F1D1D', margin:'0 0 8px', lineHeight:1.7, fontSize:'0.95rem' }}>
                  This is exactly how memory works. When your server stops - the ArrayList is <b>destroyed</b>.<br/>
                  When it starts up again, a brand new empty list is created.
                </p>
                <p style={{ color:'#4F46E5', fontWeight:800, margin:0, fontSize:'1.05rem' }}>Let's introduce a solution that remembers.</p>
              </div>
              <button className="btn-green" style={{ width:'100%', fontSize:'1rem', padding:'16px' }} onClick={() => goTo(2)}>
                Show me the fix →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT - Visual explanation */}
        <div style={{ borderLeft:'1px solid #E2E8F0', padding:'40px 28px', display:'flex', flexDirection:'column', gap:20, overflowY:'auto' }}>
          <div style={{ ...S.glassLight, padding:20, background:'#FEF2F2', border:'1px solid #FECACA' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>⚡</div>
            <div style={{ fontWeight:800, color:'#991B1B', fontSize:'1.1rem' }}>RAM (Memory)</div>
            <div style={{ color:'#7F1D1D', fontSize:'0.9rem', marginTop:4, lineHeight:1.6 }}>
              Lightning fast, but temporary. Everything here is completely wiped as soon as the program restarts or power cuts.
            </div>
            <div style={{ marginTop:12, padding:'8px 12px', background:'white', border:'1px solid #FCA5A5', borderRadius:8, fontFamily:'monospace', fontSize:'0.82rem', color:'#C53030', fontWeight:600 }}>
              ArrayList & variables live here
            </div>
          </div>

          <div style={{ textAlign:'center', fontSize:'1.2rem', color:'#94A3B8', fontWeight:700 }}>VS</div>

          <div style={{ ...S.glassLight, padding:20, background:'#F0FDF4', border:'1px solid #BBF7D0' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>💾</div>
            <div style={{ fontWeight:800, color:'#065F46', fontSize:'1.1rem' }}>Disk (MySQL Database)</div>
            <div style={{ color:'#14532D', fontSize:'0.9rem', marginTop:4, lineHeight:1.6 }}>
              Permanent storage. MySQL writes data directly to the disk, meaning it survives restarts, computer shutdowns, and power cuts.
            </div>
            <div style={{ marginTop:12, padding:'8px 12px', background:'white', border:'1px solid #86EFAC', borderRadius:8, fontFamily:'monospace', fontSize:'0.82rem', color:'#15803D', fontWeight:600 }}>
              Database tables live here
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Scene 2: Whiteboard vs Notebook ─── */
  if (scene === 2) return (
    <div style={{ ...S.root, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nb-entry { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .btn-main { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:12px; color:white; padding:16px 36px; font-size:1.1rem; font-weight:800; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 30px rgba(79,70,229,0.35); }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(79,70,229,0.5); }
        .btn-sec { background:white; border:1px solid #E2E8F0; border-radius:10px; color:#475569; padding:12px 24px; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-sec:hover { background:#F8FAFC; color:#1E293B; }
        .btn-sm { border:none; border-radius:8px; padding:10px 16px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.05); }
        .btn-green { background:linear-gradient(135deg,#10B981,#059669); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(16,185,129,0.25); }
        .btn-green:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(16,185,129,0.35); }
      `}</style>

      {/* Header */}
      <div style={{ padding:'20px 32px', background:'white', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:5 }}>
        <div>
          <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Scene 2 of 3</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#1E293B' }}>Whiteboard vs Notebook</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width:32, height:4, borderRadius:2, background: i <= 2 ? '#4F46E5' : '#E2E8F0', boxShadow: i <= 2 ? '0 0 8px rgba(79,70,229,0.4)' : 'none', transition:'all 0.3s' }} />
          ))}
          <button onClick={toggleMute} className="btn-sec" style={{ padding:'6px 12px', marginLeft:8 }}>{isMuted?'🔇':'🔊'}</button>
        </div>
      </div>

      <div style={{ flex:1, padding:'36px', overflowY:'auto', background:'white', ...transStyle }}>
        <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, marginBottom:8, color:'#1E293B' }}>
          Whiteboard vs Notebook Analogy
        </h2>
        <p style={{ color:'#475569', marginBottom:28, fontSize:'1rem' }}>
          Add names to both records. Then trigger a server restart on each to see the difference.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, marginBottom:28 }}>
          {/* Whiteboard */}
          <div style={{ ...S.glassLight, padding:24, background:'#EFF6FF', borderColor:'#BFDBFE' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <span style={{ fontSize:'2rem' }}>🖊️</span>
              <div>
                <div style={{ fontWeight:800, color:'#1E40AF', fontSize:'1.05rem' }}>Whiteboard (ArrayList)</div>
                <div style={{ fontSize:'0.8rem', color:'#60A5FA', fontWeight:600 }}>Temporary Memory Storage</div>
              </div>
            </div>

            <div style={{ background:'white', borderRadius:8, padding:16, minHeight:150, position:'relative', border:'2px solid #CBD5E1', overflow:'hidden', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              <div className="wb-erase-bar" style={{ width: wbErasing ? '100%' : '0%', transition: wbErasing ? 'width 0.85s ease-in-out' : 'none' }}>
                {wbErased && <span style={{ color:'#94A3B8', fontSize:'0.95rem', fontWeight:700 }}>- WIPED CLEAN -</span>}
              </div>
              {wbNames.map((n,i) => (
                <div key={i} style={{ color:'#1E293B', fontFamily:'monospace', fontSize:'0.9rem', marginBottom:6, animation:'nb-entry 0.3s ease' }}>• {n}</div>
              ))}
            </div>

            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button className="btn-sm" style={{ background:'#3B82F6', color:'white', flex:1 }} onClick={addWb} disabled={wbErased}>+ Add names</button>
              <button className="btn-sm" style={{ background:'#EF4444', color:'white', flex:1 }} onClick={eraseWb} disabled={wbErased || wbErasing}>🔄 Restart server</button>
            </div>
            {wbErased && (
              <div style={{ marginTop:12, padding:'12px 14px', background:'#FEE2E2', borderRadius:8, borderLeft:'4px solid #EF4444', color:'#991B1B', fontWeight:700, fontSize:'0.9rem', animation:'slide-up 0.3s' }}>
                ❌ Data is gone. Memory clears on restart.
              </div>
            )}
          </div>

          {/* Notebook */}
          <div style={{ ...S.glassLight, padding:24, background:'#F0FDF4', borderColor:'#86EFAC' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <span style={{ fontSize:'2rem' }}>📔</span>
              <div>
                <div style={{ fontWeight:800, color:'#065F46', fontSize:'1.05rem' }}>Notebook (MySQL Database)</div>
                <div style={{ fontSize:'0.8rem', color:'#34D399', fontWeight:600 }}>Permanent Disk Storage</div>
              </div>
            </div>

            <div style={{
              background:'#FEFCE8', borderRadius:8, padding:16, minHeight:150,
              borderLeft:'8px solid #FDE68A', border:'1px solid #FDE68A',
              opacity: nbFlash ? 0.2 : 1, transition:'opacity 0.4s',
              boxShadow:'0 2px 4px rgba(0,0,0,0.02)',
            }}>
              {nbEntries.map((n,i) => (
                <div key={i} style={{ color:'#1E293B', fontFamily:'Georgia, serif', fontSize:'0.85rem', marginBottom:6, borderBottom:'1px solid #FDE68A', paddingBottom:4, animation:'nb-entry 0.3s ease' }}>📝 {n}</div>
              ))}
            </div>

            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button className="btn-sm" style={{ background:'#10B981', color:'white', flex:1 }} onClick={addNb}>+ Add entry</button>
              <button className="btn-sm" style={{ background:'#6B7280', color:'white', flex:1 }} onClick={restartNb} disabled={nbFlash || nbSurvived}>🔄 Restart server</button>
            </div>
            {nbSurvived && (
              <div style={{ marginTop:12, padding:'12px 14px', background:'#DCFCE7', borderRadius:8, borderLeft:'4px solid #10B981', color:'#065F46', fontWeight:700, fontSize:'0.9rem', animation:'slide-up 0.3s' }}>
                ✅ Data survives. Stored on disk forever.
              </div>
            )}
          </div>
        </div>

        {/* Comparison card */}
        <div style={{ ...S.glassLight, padding:20, textAlign:'center', background:'#F8FAFC', marginBottom:24 }}>
          <span style={{ color:'#475569' }}>Your </span>
          <span style={{ color:'#EF4444', fontWeight:800, fontFamily:'monospace' }}>List&lt;GymMember&gt;</span>
          <span style={{ color:'#475569' }}> works like the <b>whiteboard</b>. </span>
          <span style={{ color:'#10B981', fontWeight:800, fontFamily:'monospace' }}>MySQL</span>
          <span style={{ color:'#475569' }}> works like the <b>notebook</b>. One forgets, one remembers.</span>
        </div>

        {(wbErased || nbSurvived) && (
          <button className="btn-green" style={{ width:'100%', fontSize:'1.05rem', padding:'16px', animation:'slide-up 0.3s' }} onClick={() => goTo(3)}>
            Show me how MySQL organises data →
          </button>
        )}
      </div>
    </div>
  );

  /* ─── Scene 3: Mapping ─── */
  if (scene === 3) return (
    <div style={{ ...S.root, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .btn-main { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:12px; color:white; padding:16px 36px; font-size:1.1rem; font-weight:800; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 30px rgba(79,70,229,0.35); }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(79,70,229,0.5); }
        .btn-sec { background:white; border:1px solid #E2E8F0; border-radius:10px; color:#475569; padding:12px 24px; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-sec:hover { background:#F8FAFC; color:#1E293B; }
        .btn-green { background:linear-gradient(135deg,#10B981,#059669); border:none; border-radius:10px; color:white; padding:14px 28px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; box-shadow:0 6px 20px rgba(16,185,129,0.25); }
        .btn-green:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(16,185,129,0.35); }
        .field-tap { cursor:pointer; padding:12px 16px; border-radius:8px; transition:all 0.2s; border:1px solid #E2E8F0; display:flex; align-items:center; gap:8px; margin-bottom:6px; background:white; }
        .field-tap:hover { background:#F3F4F6; }
        .field-tap.done { background:#EEF2F6; border-color:#CBD5E1; }
        .table-row-clickable { cursor:pointer; transition:background 0.2s; }
        .table-row-clickable:hover td { background:#F8FAFC !important; }
        .table-row-clickable.selected td { background:#EFF6FF !important; }
        .reveal-item { animation:slide-up 0.4s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ padding:'20px 32px', background:'white', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:5 }}>
        <div>
          <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Scene 3 of 3</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#1E293B' }}>Java Class → MySQL Table</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width:32, height:4, borderRadius:2, background:'#4F46E5', boxShadow:'0 0 8px rgba(79,70,229,0.4)', transition:'all 0.3s' }} />
          ))}
          <button onClick={toggleMute} className="btn-sec" style={{ padding:'6px 12px', marginLeft:8 }}>{isMuted?'🔇':'🔊'}</button>
        </div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:0, position:'relative', zIndex:1, overflowY:'auto' }}>

        {/* LEFT */}
        <div style={{ padding:'32px', background:'white', ...transStyle }}>
          <h2 style={{ fontSize:'clamp(1.2rem,2.5vw,1.8rem)', fontWeight:900, margin:'0 0 8px', color:'#1E293B' }}>
            Tap fields to map them to MySQL columns
          </h2>
          <p style={{ color:'#475569', marginBottom:24, fontSize:'0.95rem' }}>Every field in your class maps directly to a table column. Tap all 5 to see it live.</p>

          {/* Java class display */}
          <div style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:20, marginBottom:20, fontFamily:'monospace' }}>
            <div style={{ color:'#94A3B8', fontSize:'0.8rem', marginBottom:12, fontFamily:'sans-serif', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>GymMember.java</div>
            <div style={{ color:'#60A5FA', marginBottom:8 }}>public class <span style={{ color:'#FACC15' }}>GymMember</span> {'{'}</div>
            {CLASS_FIELDS.map(f => {
              const done = tapped.includes(f.key);
              const isActive = activeField === f.key;
              return (
                <div key={f.key} className={`field-tap ${done ? 'done' : ''}`}
                  onClick={() => tapField(f.key)}
                  style={{
                    borderColor: isActive ? f.color : done ? `${f.color}55` : '#334155',
                    background: isActive ? `${f.color}22` : done ? '#0F172A' : '#1E293B',
                    color: '#E2E8F0',
                    transition:'all 0.2s',
                  }}>
                  <span style={{ color:'#60A5FA' }}>{f.type}</span>&nbsp;
                  <span style={{ color:done ? f.color : '#E2E8F0', fontWeight:600 }}>{f.name}</span>;
                  {!done && <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#94A3B8', flexShrink:0 }}>← tap</span>}
                  {done && <span style={{ marginLeft:'auto', fontSize:'0.85rem', flexShrink:0, color:'#34D399' }}>✓</span>}
                </div>
              );
            })}
            <div style={{ color:'#60A5FA', marginTop:8 }}>{'}'}</div>
          </div>

          {/* Active explanation */}
          {activeField && (
            <div style={{ padding:'12px 16px', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:10, color:'#5B21B6', fontSize:'0.95rem', fontWeight:600, animation:'slide-up 0.3s', marginBottom:16 }}>
              💡 {CLASS_FIELDS.find(f=>f.key===activeField)?.label}
            </div>
          )}

          {/* Vocabulary Card */}
          {allTapped && (
            <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:12, padding:24, animation:'slide-up 0.4s' }}>
              <div style={{ fontWeight:800, color:'#92400E', marginBottom:16, fontSize:'1.05rem' }}>Database Vocabulary:</div>
              {[
                'Database → stores data permanently - survives restarts',
                'MySQL → most popular open-source database - free, powerful',
                'Table → like a spreadsheet - rows and columns',
                'Row → one GymMember object → one record',
                'Column → one field across all members',
                'id field → auto-generated unique number per row',
                'Persistence → data that survives program restarts',
                'Schema → structure of your database - tables and columns',
              ].slice(0, revealLines).map((line, i) => (
                <div key={i} className="reveal-item" style={{ display:'flex', gap:10, marginBottom:10, fontSize:'0.92rem', color:'#475569', animationDelay:`${i*0.05}s` }}>
                  <span style={{ color:'#10B981', flexShrink:0 }}>✅</span> <span>{line}</span>
                </div>
              ))}
              {revealLines >= 8 && (
                <div style={{ marginTop:20, padding:'16px', background:'#EFF6FF', borderRadius:10, textAlign:'center', animation:'slide-up 0.4s' }}>
                  <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#1E40AF', marginBottom:16 }}>
                    Every field → column.<br/>
                    Every object → row.
                  </div>
                  <button className="btn-main" onClick={() => goTo(4)}>
                    Map YOUR project's class →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT - MySQL table preview */}
        <div style={{ borderLeft:'1px solid #E2E8F0', padding:'32px 24px', background:'#F8FAFC' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>MySQL Table Preview</div>
            <div style={{ background:'white', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ padding:'10px 14px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0', fontFamily:'monospace', fontSize:'0.85rem', color:'#475569', fontWeight:700 }}>
                💾 gym_member
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                <thead>
                  <tr>
                    {['column','type'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', background:'#EEF2F6', color:'#475569', textAlign:'left', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLASS_FIELDS.map(f => {
                    const done = tapped.includes(f.key);
                    const isActive = activeField === f.key;
                    return (
                      <tr key={f.key} style={{ opacity: done ? 1 : 0.25, transition:'all 0.4s', background: isActive ? `${f.color}11` : 'transparent' }}>
                        <td style={{ padding:'10px 12px', fontFamily:'monospace', color: done ? f.color : '#64748B', fontWeight:600, borderBottom:'1px solid #E2E8F0' }}>{f.col}</td>
                        <td style={{ padding:'10px 12px', borderBottom:'1px solid #E2E8F0' }}>
                          <span style={{ background:`${f.color}11`, border:`1px solid ${f.color}44`, color:f.color, padding:'2px 8px', borderRadius:4, fontSize:'0.75rem', fontWeight:700, fontFamily:'monospace' }}>{f.sqlType}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample rows */}
          {tapped.length >= 3 && (
            <div style={{ animation:'slide-up 0.4s' }}>
              <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Sample rows - tap one:</div>
              <div style={{ background:'white', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
                  <thead>
                    <tr>{['id','name','age','plan','isActive'].map(h=><th key={h} style={{ padding:'7px 10px', background:'#EEF2F6', color:'#475569', textAlign:'left', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid #E2E8F0' }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map(r=>(
                      <tr key={r.id} className={`table-row-clickable ${selectedRow?.id===r.id?'selected':''}`} onClick={()=>{setSelectedRow(r);play('tick');}}>
                        {['id','name','age','plan','isActive'].map(k=>(
                          <td key={k} style={{ padding:'8px 10px', color:'#1E293B', borderBottom:'1px solid #E2E8F0', fontFamily:'monospace' }}>
                            {String(r[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedRow && (
                <div style={{ marginTop:12, background:'#F9FAFB', border:'1px solid #E2E8F0', borderRadius:10, padding:14, fontFamily:'monospace', fontSize:'0.82rem', animation:'slide-up 0.3s' }}>
                  <div style={{ color:'#4F46E5', marginBottom:8, fontWeight:700 }}>Java Object representation:</div>
                  <span style={{ color:'#4F46E5', fontWeight:700 }}>GymMember</span> object {'{'}
                  {Object.entries(selectedRow).map(([k,v])=>(
                    <div key={k} style={{ paddingLeft:16 }}>
                      <span style={{ color:'#0284C7' }}>{k}</span>: <span style={{ color: typeof v==='boolean'?'#D97706':typeof v==='number'?'#059669':'#1E293B' }}>{JSON.stringify(v)}</span>,
                    </div>
                  ))}
                  {'}'}
                  <div style={{ marginTop:8, color:'#64748B', fontSize:'0.75rem' }}>← This row ↔ this object</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── Phase 2 ─── */
  return (
    <div style={{ ...S.root, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .btn-main { background:linear-gradient(135deg,#4F46E5,#7C3AED); border:none; border-radius:12px; color:white; padding:16px 36px; font-size:1.1rem; font-weight:800; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 30px rgba(79,70,229,0.35); }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(79,70,229,0.5); }
        .btn-sec { background:white; border:1px solid #E2E8F0; border-radius:10px; color:#475569; padding:12px 24px; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-sec:hover { background:#F8FAFC; color:#1E293B; }
        .mcq-btn { width:100%; text-align:left; padding:14px 18px; border-radius:10px; border:1.5px solid #E2E8F0; background:white; color:#334155; font-size:0.95rem; font-weight:500; cursor:pointer; transition:all 0.2s; margin-bottom:8px; }
        .mcq-btn:hover:not(:disabled) { border-color:#CBD5E1; background:#F8FAFC; color:#1E293B; }
        .mcq-btn.correct { border-color:#10B981; background:#F0FDF4; color:#15803D; }
        .mcq-btn.wrong { border-color:#EF4444; background:#FEF2F2; color:#991B1B; animation:shake 0.3s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .domain-pill { padding:12px 20px; border-radius:12px; background:white; border:1.5px solid #E2E8F0; cursor:pointer; font-weight:700; transition:all 0.2s; color:#475569; font-size:0.95rem; box-shadow:0 1px 2px rgba(0,0,0,0.02); }
        .domain-pill:hover { border-color:#CBD5E1; color:#1E293B; }
        .domain-pill.selected { background:#EFF6FF; border-color:#3B82F6; color:#1D4ED8; box-shadow:0 0 12px rgba(59,130,246,0.15); }
        .builder-row { display:grid; grid-template-columns:1.2fr 24px 1.2fr 24px 1fr; gap:8px; align-items:center; margin-bottom:10px; }
        .b-field { background:#EEF2F6; color:#334155; padding:8px 12px; border-radius:6px; font-family:monospace; font-size:0.85rem; border:1px solid #E2E8F0; }
        .b-arrow { color:#94A3B8; font-weight:700; text-align:center; }
        .b-input { border:1px solid #CBD5E1; border-radius:6px; padding:7px 10px; font-size:0.85rem; font-family:monospace; outline:none; background:white; color:#1E293B; width:100%; }
        .b-input:focus { border-color:#4F46E5; }
        .b-select { border:1px solid #CBD5E1; border-radius:6px; padding:7px 8px; font-size:0.82rem; font-family:monospace; outline:none; background:white; color:#1E293B; width:100%; cursor:pointer; }
        .reflection-box { width:100%; border:1.5px solid #CBD5E1; border-radius:10px; padding:14px; font-size:0.95rem; font-family:inherit; resize:vertical; min-height:90px; outline:none; background:white; color:#1E293B; line-height:1.6; }
        .reflection-box:focus { border-color:#4F46E5; }
      `}</style>

      {/* Header */}
      <div style={{ padding:'20px 32px', background:'white', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:5 }}>
        <div>
          <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Phase 2</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#1E293B' }}>Map YOUR project class</div>
        </div>
        <button onClick={toggleMute} className="btn-sec" style={{ padding:'6px 12px' }}>{isMuted?'🔇':'🔊'}</button>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:0, position:'relative', zIndex:1, overflowY:'auto' }}>

        {/* LEFT */}
        <div style={{ padding:'32px', background:'white', ...transStyle }}>
          <h2 style={{ fontSize:'1.6rem', fontWeight:900, margin:'0 0 8px', color:'#1E293B' }}>
            What will YOUR table look like?
          </h2>
          <p style={{ color:'#475569', marginBottom:24 }}>Select your domain, configure your database columns, and answer the check questions.</p>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:24 }}>
            {['Gym','Mess','Hotel','Chai'].map(d => (
              <button key={d} className={`domain-pill ${domain===d?'selected':''}`} onClick={()=>chooseDomain(d)}>
                {d==='Gym'?'🏋️':d==='Mess'?'🍱':d==='Hotel'?'🏨':'☕'} {d}
              </button>
            ))}
          </div>

          {domain && (
            <div style={{ animation:'slide-up 0.4s' }}>
              <div style={{ fontSize:'0.8rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'grid', gridTemplateColumns:'1.2fr 24px 1.2fr 24px 1fr', gap:8, marginBottom:8 }}>
                <span>Java Field</span><span></span><span>Column Name</span><span></span><span>MySQL Type</span>
              </div>
              {tableRows.map((row, i) => (
                <div key={i} className="builder-row">
                  <div className="b-field"><span style={{ color:'#0284C7' }}>{row.type}</span> {row.f}</div>
                  <div className="b-arrow">→</div>
                  <input className="b-input" value={row.c} disabled={row.auto} onChange={e => { const r=[...tableRows]; r[i]={...r[i],c:e.target.value}; setTableRows(r); }} />
                  <div className="b-arrow">→</div>
                  <select className="b-select" value={row.t} disabled={row.auto} onChange={e => { const r=[...tableRows]; r[i]={...r[i],t:e.target.value}; setTableRows(r); play('add'); }}>
                    <option>BIGINT</option><option>VARCHAR</option><option>INTEGER</option><option>DECIMAL</option><option>TINYINT</option>
                  </select>
                </div>
              ))}

              {tableOk && (
                <div style={{ marginTop:28, animation:'slide-up 0.3s' }}>
                  <h4 style={{ color:'#1E293B', fontWeight:800, margin:'0 0 16px' }}>Understanding check:</h4>
                  {MCQ.map((q, qi) => (
                    (!qi || qAnswers[qi-1]) && (
                      <div key={qi} style={{ marginBottom:20, animation:'slide-up 0.3s', padding:'16px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E2E8F0' }}>
                        <p style={{ fontWeight:700, color:'#1E293B', margin:'0 0 12px', fontSize:'0.95rem' }}>Q{qi+1}: {q.q}</p>
                        {q.opts.map(o => (
                          <button key={o.a} className={`mcq-btn ${qAnswers[qi]===o.a?'correct':qWrong[`${qi}-${o.a}`]?'wrong':''}`}
                            disabled={!!qAnswers[qi]} onClick={()=>answerQ(qi,o.a)}>
                            <span style={{ color:'#4F46E5', fontWeight:800, marginRight:8 }}>{o.a})</span> {o.t}
                          </button>
                        ))}
                        {qAnswers[qi] && <div style={{ color:'#16A34A', fontSize:'0.85rem', fontWeight:600, marginTop:8 }}>✅ {q.explain}</div>}
                      </div>
                    )
                  ))}

                  {allQ && (
                    <div style={{ animation:'slide-up 0.4s' }}>
                      <h4 style={{ color:'#1E293B', margin:'0 0 8px', fontWeight:800 }}>Reflection:</h4>
                      <p style={{ color:'#475569', fontSize:'0.88rem', margin:'0 0 8px' }}>Using the notebook analogy - why does your app need MySQL?</p>
                      <textarea className="reflection-box" placeholder="My app needs MySQL because the in-memory List is like a whiteboard..." value={reflection} onChange={e=>setReflection(e.target.value)} />
                      <div style={{ textAlign:'right', fontSize:'0.85rem', color: sentences>=1?'#16A34A':'#64748B', fontWeight:700, marginTop:4 }}>{sentences} / 1 sentence minimum</div>
                      <button
                        className="btn-main"
                        style={{ width:'100%', marginTop:20, padding:'18px', fontSize:'1.05rem', opacity:canSubmit?1:0.4 }}
                        disabled={!canSubmit}
                        onClick={()=>{ play('submit'); setSubmitted(true); }}>
                        {submitted ? '✅ Completed!' : "I understand why we need MySQL - let's connect it →"}
                      </button>
                      {submitted && (
                        <div style={{ marginTop:20, padding:20, background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:12, animation:'slide-up 0.4s' }}>
                          <div style={{ fontWeight:800, color:'#166534', fontSize:'1.1rem', marginBottom:8 }}>The concept is clear. 🎯</div>
                          <p style={{ color:'#14532D', margin:0 }}>In 2.3.2 - two annotations on your class.<br/>In 2.3.3 - one file connects Spring Boot to MySQL.<br/><b style={{ color:'#047857' }}>After that - restart your server and your data is still there.</b></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ borderLeft:'1px solid #E2E8F0', padding:'32px 24px', background:'#F8FAFC' }}>
          <div style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Your MySQL Table</div>
          {domain ? (
            <div style={{ background:'white', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ padding:'10px 16px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0', fontFamily:'monospace', fontSize:'0.85rem', color:'#475569', fontWeight:700 }}>
                <span>💾</span> {domain.toLowerCase()}_table
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                <thead>
                  <tr>{['column','type','note'].map(h=><th key={h} style={{ padding:'8px 12px', background:'#EEF2F6', color:'#475569', textAlign:'left', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid #E2E8F0' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {tableRows.map((r,i)=>(
                    <tr key={i} style={{ animation:`slide-up 0.3s ease ${i*0.05}s both` }}>
                      <td style={{ padding:'9px 12px', fontFamily:'monospace', color:'#1E293B', fontWeight:600, borderBottom:'1px solid #E2E8F0' }}>{r.c}</td>
                      <td style={{ padding:'9px 12px', borderBottom:'1px solid #E2E8F0' }}>
                        <span style={{
                          background: r.t==='VARCHAR'?'rgba(59,130,246,0.1)':r.t==='INTEGER'?'rgba(245,158,11,0.1)':r.t==='BIGINT'?'rgba(139,92,246,0.1)':r.t==='DECIMAL'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
                          color: r.t==='VARCHAR'?'#1D4ED8':r.t==='INTEGER'?'#D97706':r.t==='BIGINT'?'#6D28D9':r.t==='DECIMAL'?'#047857':'#B91C1C',
                          padding:'2px 8px', borderRadius:4, fontSize:'0.72rem', fontWeight:800, fontFamily:'monospace',
                        }}>{r.t}</span>
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:'0.72rem', color:'#64748B', borderBottom:'1px solid #E2E8F0' }}>{r.auto?'AUTO_INCREMENT':''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding:'10px 14px', background:'#F9FAFB', borderTop:'1px solid #E2E8F0', fontSize:'0.78rem', color:'#64748B' }}>
                This table is created automatically when you connect in 2.3.2
              </div>
            </div>
          ) : (
            <div style={{ padding:40, textAlign:'center', color:'#94A3B8', fontSize:'0.9rem', border:'1px dashed #CBD5E1', borderRadius:12 }}>
              Select your domain option above to view database structure.
            </div>
          )}

          {allQ && (
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'List → replaced by MySQL', color:'#10B981' },
                { label:'Object ↔ Row in table', color:'#4F46E5' },
                { label:'RAM gone → Disk permanent', color:'#F59E0B' },
              ].map((item, i) => (
                <div key={i} style={{ padding:'10px 14px', background:`${item.color}11`, border:`1px solid ${item.color}33`, borderRadius:8, fontSize:'0.85rem', color:item.color, fontWeight:600, animation:`slide-up 0.3s ease ${i*0.15}s both` }}>
                  ✅ {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
