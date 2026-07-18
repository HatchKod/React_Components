import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────
   SOUND ENGINE
───────────────────────────────────────── */
function useAudio() {
  const ctx = useRef(null);
  const muted = useRef(false);

  const play = useCallback((type) => {
    if (muted.current) return;
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.current.state === 'suspended') ctx.current.resume();
      const ac = ctx.current;

      const mk = (freq, type2, dur, vol) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = type2; o.frequency.setValueAtTime(freq, ac.currentTime);
        g.gain.setValueAtTime(vol, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        o.start(); o.stop(ac.currentTime + dur);
      };

      if (type === 'tick')    mk(880, 'sine', 0.06, 0.12);
      if (type === 'connect') { mk(440, 'sine', 0.15, 0.15); setTimeout(() => mk(660, 'sine', 0.15, 0.12), 100); }
      if (type === 'warn')    { mk(300, 'sawtooth', 0.1, 0.1); setTimeout(() => mk(240, 'sawtooth', 0.1, 0.1), 120); }
      if (type === 'correct') { [523, 659, 784].forEach((f, i) => setTimeout(() => mk(f, 'sine', 0.2, 0.1), i * 90)); }
      if (type === 'payoff')  { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => mk(f, 'sine', 0.3, 0.1), i * 80)); }
      if (type === 'remove')  mk(330, 'triangle', 0.1, 0.08);
    } catch (_) {}
  }, []);

  return { play, muted };
}

/* ─────────────────────────────────────────
   SYNTAX HIGHLIGHT HELPER
───────────────────────────────────────── */
function Code({ children, className = '' }) {
  return (
    <pre style={{
      background: '#060a12', border: '1px solid #1a2236', borderRadius: '10px',
      padding: '14px 16px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '13px', lineHeight: 1.75, overflowX: 'auto', margin: 0,
      color: '#cdd9f0', position: 'relative',
    }} className={className}>
      {children}
    </pre>
  );
}

function HL({ c, children }) {
  const colors = {
    kw: '#7dd3fc',   // keyword – sky blue
    an: '#a78bfa',   // annotation – violet
    st: '#6ee7b7',   // string – green
    cm: '#475569',   // comment – slate
    id: '#fbbf24',   // identifier – amber
    num: '#fb923c',  // number – orange
    ty: '#93c5fd',   // type – light blue
  };
  return <span style={{ color: colors[c] || '#cdd9f0' }}>{children}</span>;
}

/* ─────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────── */
function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} style={{
      background: copied ? '#064e3b' : '#111827',
      border: `1px solid ${copied ? '#059669' : '#1e293b'}`,
      color: copied ? '#34d399' : '#94a3b8',
      borderRadius: '7px', padding: '4px 11px',
      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.2s', position: 'absolute', top: 10, right: 10, zIndex: 5,
    }}>
      {copied ? '✓ Copied' : label}
    </button>
  );
}

/* ─────────────────────────────────────────
   MISSION PROGRESS STRIP
───────────────────────────────────────── */
const PHASES = ['Address Label', 'Maven Fuel', '@Entity Blueprint', 'Table Appears'];

function MissionStrip({ step, checks }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: '#060a12', border: '1px solid #1a2236',
      borderRadius: '12px', overflow: 'hidden', marginBottom: '24px',
    }}>
      {PHASES.map((label, i) => {
        const done = checks[i];
        const active = step === i + 1 && !done;
        return (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '12px 8px',
            background: done ? '#064e3b' : active ? '#1e3a5f' : 'transparent',
            borderRight: i < 3 ? '1px solid #1a2236' : 'none',
            transition: 'background 0.4s ease',
            position: 'relative',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: done ? '#34d399' : active ? '#60a5fa' : '#334155',
              marginBottom: '3px',
            }}>
              {done ? '✓ DONE' : active ? 'ACTIVE' : `STEP ${i+1}`}
            </div>
            <div style={{ fontSize: '11px', color: done ? '#6ee7b7' : active ? '#93c5fd' : '#374151', fontWeight: 600 }}>
              {label}
            </div>
            {active && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   DOCKING BAY VISUAL (Right Panel)
───────────────────────────────────────── */
function DockingBay({ step, checks, dbName, dbPass, tableName, entityName }) {
  const [tick, setTick] = useState(0);
  const [streamRows, setStreamRows] = useState([]);
  const payoffDone = checks[3];

  // Pulsing clock for animations
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 800);
    return () => clearInterval(t);
  }, []);

  // Stream data into "database" when step 4 done
  useEffect(() => {
    if (!payoffDone) { setStreamRows([]); return; }
    const ddl = [
      `Hibernate: create table ${tableName} (`,
      `  id bigint not null auto_increment,`,
      `  name varchar(255),`,
      `  primary key (id)`,
      `) engine=InnoDB;`,
      ``,
      `✓ Table '${tableName}' created.`,
    ];
    ddl.forEach((line, i) => {
      setTimeout(() => setStreamRows(prev => [...prev, line]), i * 200);
    });
  }, [payoffDone, tableName]);

  const cable = (filled) => (
    <div style={{
      width: '3px', height: '40px', margin: '0 auto',
      background: filled
        ? 'linear-gradient(to bottom, #34d399, #3b82f6)'
        : '#1e293b',
      borderRadius: '2px', position: 'relative', overflow: 'hidden',
      transition: 'background 0.5s ease',
    }}>
      {filled && (
        <div style={{
          position: 'absolute', width: '100%', height: '30%',
          background: 'rgba(255,255,255,0.6)', borderRadius: '2px',
          animation: 'flowDown 1s linear infinite',
        }} />
      )}
    </div>
  );

  const node = (icon, label, sub, state, extra) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: state === 'done' ? 'rgba(6,78,59,0.35)' : state === 'active' ? 'rgba(30,58,95,0.5)' : '#0a0e1a',
      border: `1.5px solid ${state === 'done' ? '#059669' : state === 'active' ? '#3b82f6' : '#1e293b'}`,
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: state === 'done' ? '0 0 14px rgba(52,211,153,0.15)' : state === 'active' ? '0 0 14px rgba(59,130,246,0.15)' : 'none',
      transition: 'all 0.4s ease', position: 'relative',
    }}>
      <div style={{ fontSize: '24px', lineHeight: 1 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '13px', color: state === 'done' ? '#34d399' : state === 'active' ? '#93c5fd' : '#334155' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{sub}</div>
      </div>
      {state === 'active' && (
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6',
          animation: 'pulse 1s ease-in-out infinite',
        }} />
      )}
      {state === 'done' && <div style={{ color: '#34d399', fontWeight: 900, fontSize: '16px' }}>✓</div>}
      {extra}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{
        fontSize: '10px', color: '#334155', fontWeight: 800, letterSpacing: '2px',
        textTransform: 'uppercase', marginBottom: '12px',
      }}>Live Connection Docking</div>

      {node('🍃', 'Spring Boot App', 'Port 8080', checks[0] ? 'done' : 'active')}
      {cable(checks[0])}
      {node('📄', 'application.properties', checks[0] ? `→ jdbc:mysql://localhost:3306/${dbName}` : 'Awaiting address config…', checks[0] ? 'done' : step === 1 ? 'active' : 'idle')}
      {cable(checks[1])}
      {node('⚙️', 'JPA + MySQL Driver', checks[1] ? 'spring-boot-starter-data-jpa ✓  mysql-connector-j ✓' : 'Awaiting pom.xml dependencies…', checks[1] ? 'done' : step === 2 ? 'active' : 'idle')}
      {cable(checks[2])}
      {node('🏷️', `@Entity ${entityName}`, checks[2] ? `Maps to table: ${tableName}` : 'Awaiting class annotation…', checks[2] ? 'done' : step === 3 ? 'active' : 'idle')}
      {cable(checks[3])}
      {node('🗄️', `MySQL: ${dbName}`, checks[3] ? `Table "${tableName}" created` : 'Awaiting JPA schema write…', checks[3] ? 'done' : step === 4 ? 'active' : 'idle')}

      {/* DDL Stream */}
      {payoffDone && streamRows.length > 0 && (
        <div style={{
          background: '#020508', border: '1px solid #059669', borderRadius: '10px',
          padding: '12px 14px', marginTop: '12px', fontFamily: 'monospace',
          fontSize: '11.5px', lineHeight: 1.7, color: '#6ee7b7',
        }}>
          {streamRows.map((r, i) => (
            <div key={i} style={{ opacity: 1, animation: 'fadeSlide 0.3s ease forwards' }}>
              {r === '' ? <br /> : r.startsWith('✓') ? (
                <span style={{ color: '#34d399', fontWeight: 900 }}>{r}</span>
              ) : r.startsWith('Hibernate') ? (
                <span style={{ color: '#60a5fa' }}>{r}</span>
              ) : (
                <span style={{ color: '#94a3b8' }}>{r}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Credentials badge */}
      {checks[0] && (
        <div style={{
          marginTop: '14px', background: '#0a0e1a', border: '1px solid #1e293b',
          borderRadius: '10px', padding: '12px 14px', fontSize: '11px',
          fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.7,
        }}>
          <div style={{ color: '#475569', fontWeight: 700, marginBottom: '4px', fontSize: '10px', letterSpacing: '1px' }}>ADDRESS LABEL</div>
          <div><span style={{ color: '#7dd3fc' }}>url</span>=jdbc:mysql://localhost:3306/<span style={{ color: '#fbbf24' }}>{dbName}</span></div>
          <div><span style={{ color: '#7dd3fc' }}>user</span>=root</div>
          <div><span style={{ color: '#7dd3fc' }}>pass</span>={dbPass ? '••••••' : <span style={{ color: '#475569' }}>[not set]</span>}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   BLANK FILL COMPONENT
───────────────────────────────────────── */
function Blank({ answer, hint, placeholder, onCorrect, play }) {
  const [val, setVal] = useState('');
  const [status, setStatus] = useState('idle');
  const [tries, setTries] = useState(0);

  const check = () => {
    if (val.trim() === answer) {
      setStatus('correct'); play('correct'); onCorrect?.();
    } else {
      setStatus('wrong'); setTries(t => t + 1); play('warn');
      setTimeout(() => setStatus('idle'), 1200);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
      <div style={{ fontSize: '11px', color: '#475569' }}>{hint}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={val} onChange={e => { setVal(e.target.value); setStatus('idle'); }}
          onKeyDown={e => e.key === 'Enter' && status !== 'correct' && check()}
          disabled={status === 'correct'} placeholder={placeholder}
          style={{
            flex: 1, background: '#060a12', border: `1.5px solid ${status === 'correct' ? '#059669' : status === 'wrong' ? '#dc2626' : '#1e293b'}`,
            borderRadius: '8px', padding: '9px 13px', color: '#f0f6ff',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
        {status !== 'correct' && (
          <button onClick={check} style={{
            background: '#1e3a5f', border: 'none', borderRadius: '8px',
            padding: '9px 16px', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', fontWeight: 800,
          }}>Check</button>
        )}
        {status === 'correct' && <div style={{ color: '#34d399', fontWeight: 800, fontSize: '13px', padding: '9px 0' }}>✓ Correct!</div>}
      </div>
      {status === 'wrong' && tries >= 2 && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', padding: '8px 12px', color: '#fca5a5', fontSize: '12px' }}>
          Answer: <strong style={{ color: '#ef4444' }}>{answer}</strong>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP CARD SHELL
───────────────────────────────────────── */
function StepCard({ n, total, title, state, children }) {
  return (
    <div style={{
      borderRadius: '14px', marginBottom: '20px',
      border: `1.5px solid ${state === 'active' ? '#1e3a5f' : state === 'done' ? '#064e3b' : '#111827'}`,
      background: state === 'active' ? 'rgba(15,23,42,0.9)' : state === 'done' ? 'rgba(6,78,59,0.12)' : 'rgba(9,11,18,0.6)',
      opacity: state === 'locked' ? 0.3 : 1,
      pointerEvents: state === 'locked' ? 'none' : 'auto',
      transition: 'all 0.4s ease',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: state === 'active' ? '1px solid #1e293b' : 'none',
        background: state === 'active' ? 'rgba(30,58,95,0.3)' : 'transparent',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: state === 'done' ? '#059669' : state === 'active' ? '#1e3a5f' : '#111827',
          border: `2px solid ${state === 'done' ? '#34d399' : state === 'active' ? '#3b82f6' : '#1e293b'}`,
          fontSize: '11px', fontWeight: 900, color: state === 'done' ? '#fff' : state === 'active' ? '#60a5fa' : '#334155',
        }}>
          {state === 'done' ? '✓' : n}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: state === 'done' ? '#34d399' : state === 'active' ? '#3b82f6' : '#334155', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Step {n} of {total}  ·  {state === 'done' ? 'Complete' : state === 'active' ? 'In progress' : 'Locked'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: state === 'locked' ? '#334155' : '#e2e8f0', marginTop: '2px' }}>{title}</div>
        </div>
      </div>
      {state !== 'locked' && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   CHECK LABEL
───────────────────────────────────────── */
function CheckLabel({ checked, onChange, children }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: checked ? 'rgba(6,78,59,0.25)' : 'rgba(30,58,95,0.15)',
      border: `1.5px solid ${checked ? '#059669' : '#1e3a5f'}`,
      borderRadius: '10px', padding: '14px 16px', marginTop: '18px',
      cursor: 'pointer', transition: 'all 0.25s',
    }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
      <span style={{ fontWeight: 700, color: checked ? '#34d399' : '#93c5fd', fontSize: '13px' }}>{children}</span>
    </label>
  );
}

/* ─────────────────────────────────────────
   DOMAIN SELECTOR
───────────────────────────────────────── */
const DOMAINS = [
  { id: 'Gym', emoji: '🏋️', label: 'Gym', db: 'gymapp', entity: 'GymMember', table: 'gym_member' },
  { id: 'Mess', emoji: '🍱', label: 'Mess', db: 'messapp', entity: 'MealRecord', table: 'meal_record' },
  { id: 'Hotel', emoji: '🏨', label: 'Hotel', db: 'hotelapp', entity: 'HotelRoom', table: 'hotel_room' },
  { id: 'Chai', emoji: '☕', label: 'Chai', db: 'chaiapp', entity: 'ChaiOrder', table: 'chai_order' },
];

/* ─────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes flowDown {
    0% { top: -30%; }
    100% { top: 130%; }
  }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 12px rgba(52,211,153,0.2); }
    50% { box-shadow: 0 0 28px rgba(52,211,153,0.5); }
  }
  button:hover { opacity: 0.88; }
`;

/* ─────────────────────────────────────────
   PHASE 2 - APPLY TO YOUR PROJECT
───────────────────────────────────────── */
function Phase2({
  play, entityName, tableName, dbName,
  p2c1, setP2c1, p2Entity, setP2Entity, p2Id, setP2Id,
  p2Gen, setP2Gen, p2Long, setP2Long, p2Ctor, setP2Ctor,
  p2GetSet, setP2GetSet, p2c3, setP2c3, p2c4, setP2c4,
  tableInputName, setTableInputName, reflectionText, setReflectionText,
  submitted, onSubmit,
}) {
  const sentenceCount = reflectionText.trim().split(/[.!?]+/).filter(Boolean).length;
  const allEntity = p2Entity && p2Id && p2Gen && p2Long && p2Ctor && p2GetSet;
  const canSubmit = p2c1 && allEntity && p2c3 && p2c4 && sentenceCount >= 1 && !submitted;

  const toggle = (state, setter) => {
    setter(!state);
    play(state ? 'remove' : 'connect');
  };

  const checks2 = [
    { label: '@Entity above class declaration', state: p2Entity, set: setP2Entity },
    { label: 'private Long id field added', state: p2Long, set: setP2Long },
    { label: '@Id above the id field', state: p2Id, set: setP2Id },
    { label: '@GeneratedValue(strategy = IDENTITY)', state: p2Gen, set: setP2Gen },
    { label: 'Empty no-arg constructor present', state: p2Ctor, set: setP2Ctor },
    { label: 'Getters & setters for all fields', state: p2GetSet, set: setP2GetSet },
  ];

  return (
    <div style={{ animation: 'popIn 0.4s ease' }}>
      {/* TASK 1 */}
      <div style={{ background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Task 1</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>Confirm your application.properties</div>
        <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
          Your local file must have all 5 property lines pointing to your database.
        </p>
        <CheckLabel checked={p2c1} onChange={() => toggle(p2c1, setP2c1)}>
          ✓ My application.properties is fully configured
        </CheckLabel>
      </div>

      {/* TASK 2 */}
      <div style={{ background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Task 2</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>Annotate your {entityName} class</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checks2.map((c, i) => (
            <label key={i} onClick={() => toggle(c.state, c.set)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: c.state ? 'rgba(6,78,59,0.2)' : '#0a0e1a',
              border: `1px solid ${c.state ? '#059669' : '#1a2236'}`,
              borderRadius: '9px', padding: '11px 14px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                background: c.state ? '#059669' : 'transparent',
                border: `2px solid ${c.state ? '#34d399' : '#334155'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '11px', fontWeight: 900,
              }}>
                {c.state && '✓'}
              </div>
              <span style={{ fontSize: '13px', color: c.state ? '#6ee7b7' : '#64748b', fontWeight: 600 }}>{c.label}</span>
            </label>
          ))}
        </div>

        {allEntity && (
          <div style={{ marginTop: '14px', background: 'rgba(6,78,59,0.2)', border: '1px solid #059669', borderRadius: '9px', padding: '10px 14px', color: '#34d399', fontSize: '12px', fontWeight: 700 }}>
            ✓ {entityName} is fully annotated - JPA will create the {tableName} table.
          </div>
        )}
      </div>

      {/* TASK 3 */}
      <div style={{ background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Task 3</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>Verify the table in MySQL</div>
        <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
          Run SHOW TABLES; - enter the table name you see:
        </p>
        <input
          value={tableInputName} onChange={e => setTableInputName(e.target.value)}
          placeholder={`e.g. ${tableName}`}
          style={{
            width: '100%', background: '#0a0e1a', border: '1.5px solid #1e293b',
            borderRadius: '8px', padding: '10px 14px', color: '#f0f6ff',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', outline: 'none',
          }}
        />
        <div style={{ fontSize: '11px', color: '#334155', marginTop: '6px' }}>
          JPA: GymMember → gym_member (CamelCase → snake_case)
        </div>
        {tableInputName && (
          <CheckLabel checked={p2c3} onChange={() => toggle(p2c3, setP2c3)}>
            ✓ I see {tableInputName} in SHOW TABLES
          </CheckLabel>
        )}
      </div>

      {/* TASK 4 */}
      <div style={{ background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Task 4 - Security</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>Git commit (safely)</div>
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ color: '#fca5a5', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>🚨 Before committing</div>
          <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.7 }}>
            Ensure <code style={{ color: '#fbbf24' }}>application.properties</code> is in your <code style={{ color: '#fbbf24' }}>.gitignore</code>.
            Never push passwords to GitHub.
          </div>
        </div>
        <Code>
          <CopyBtn text={`git add .\ngit commit -m "connect Spring Boot to MySQL - add @Entity"\ngit push origin main`} />
          git add .<br/>
          git commit -m <HL c="st">"connect Spring Boot to MySQL - add @Entity"</HL><br/>
          git push origin main
        </Code>
        <CheckLabel checked={p2c4} onChange={() => toggle(p2c4, setP2c4)}>
          ✓ Committed with application.properties in .gitignore
        </CheckLabel>
      </div>

      {/* REFLECTION */}
      {p2c1 && allEntity && p2c3 && p2c4 && (
        <div style={{ background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px', marginBottom: '20px', animation: 'popIn 0.4s ease' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '10px' }}>
            One sentence - your own words:
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>
            What does application.properties tell Spring Boot, and what does @Entity tell JPA?
          </p>
          <textarea
            value={reflectionText} onChange={e => setReflectionText(e.target.value)}
            onPaste={e => e.preventDefault()}
            placeholder="application.properties gives Spring Boot MySQL's address. @Entity tells JPA that my class maps to a database table…"
            style={{
              width: '100%', height: '90px', background: '#0a0e1a',
              border: '1.5px solid #1e293b', borderRadius: '10px',
              padding: '12px 14px', color: '#f0f6ff', fontFamily: 'inherit',
              fontSize: '13px', resize: 'none', outline: 'none', lineHeight: 1.6,
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '11px', marginTop: '6px', fontWeight: 700, color: sentenceCount >= 1 ? '#34d399' : '#64748b' }}>
            {sentenceCount} / 1 sentence minimum
          </div>
        </div>
      )}

      {/* SUBMIT */}
      <button onClick={onSubmit} disabled={!canSubmit} style={{
        width: '100%', padding: '16px', borderRadius: '12px',
        background: canSubmit ? 'linear-gradient(135deg, #059669, #0284c7)' : '#111827',
        border: 'none', color: '#fff', fontWeight: 900, fontSize: '15px',
        cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.4,
        transition: 'all 0.3s', boxShadow: canSubmit ? '0 0 20px rgba(5,150,105,0.3)' : 'none',
        animation: canSubmit ? 'glow 2s ease-in-out infinite' : 'none',
      }}>
        {submitted ? '✓ Spring Boot is connected to MySQL!' : 'Submit - Spring Boot ↔ MySQL connected →'}
      </button>

      {submitted && (
        <div style={{
          marginTop: '16px', background: 'rgba(6,78,59,0.25)', border: '1.5px solid #059669',
          borderRadius: '12px', padding: '20px', animation: 'popIn 0.4s ease', lineHeight: 1.7,
          color: '#94a3b8', fontSize: '13px',
        }}>
          <div style={{ color: '#34d399', fontWeight: 900, fontSize: '16px', marginBottom: '10px' }}>
            🔗 Connection established!
          </div>
          <div>✓ Spring Boot knows where MySQL lives.</div>
          <div>✓ JPA built the schema automatically - zero SQL written.</div>
          <div>✓ Your class is now a MySQL table.</div>
          <div style={{ marginTop: '12px', color: '#475569', fontSize: '12px' }}>
            Your controller still uses <code style={{ color: '#fbbf24' }}>List&lt;{entityName}&gt;</code>.
            Next - 2.3.4 replaces it with <code style={{ color: '#7dd3fc' }}>JpaRepository</code>.
            Persistence survives restarts - forever.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────── */
export default function SpringBootMySQL() {
  const params = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId = params.get('taskId');

  const { play, muted } = useAudio();
  const [muteState, setMuteState] = useState(false);

  const [phase, setPhase] = useState(1);
  const [activeStep, setActiveStep] = useState(1);

  // Domain
  const [selectedDomain, setSelectedDomain] = useState('Gym');
  const [dbPass, setDbPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const domain = DOMAINS.find(d => d.id === selectedDomain) || DOMAINS[0];
  const { db: dbName, entity: entityName, table: tableName } = domain;

  // Step checks
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3done, setS3done] = useState(false);
  const [blankCorrect, setBlankCorrect] = useState(false);
  const [s4, setS4] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Completion
  const [revealLines, setRevealLines] = useState([]);
  const revealTexts = [
    `application.properties → jdbc:mysql://localhost:3306/${dbName}`,
    'spring.jpa.hibernate.ddl-auto=update → tables auto-created',
    '@Entity → class mapped to SQL table',
    `@Id + @GeneratedValue → auto-increment primary key`,
    'Zero SQL written - JPA handled it all.',
    `Your table: ${tableName} ✓`,
  ];

  useEffect(() => {
    if (s1 && s2 && s3done && s4) {
      play('payoff');
      revealTexts.forEach((line, i) => {
        setTimeout(() => setRevealLines(prev => [...prev, line]), 600 + i * 500);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s1, s2, s3done, s4]);

  // Phase 2
  const [p2c1, setP2c1] = useState(false);
  const [p2Entity, setP2Entity] = useState(false);
  const [p2Id, setP2Id] = useState(false);
  const [p2Gen, setP2Gen] = useState(false);
  const [p2Long, setP2Long] = useState(false);
  const [p2Ctor, setP2Ctor] = useState(false);
  const [p2GetSet, setP2GetSet] = useState(false);
  const [p2c3, setP2c3] = useState(false);
  const [p2c4, setP2c4] = useState(false);
  const [tableInputName, setTableInputName] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submitted) return;
    play('payoff');
    setSubmitted(true);
    try {
      window.parent.postMessage({
        type: 'HK_RESULT', version: '1',
        exerciseId: 'm3-t3-s3-spring-boot-mysql',
        exerciseType: 'interactive', status: 'completed',
        score: 3, maxScore: 3,
        answers: {
          phase1: { domainSelected: selectedDomain, databaseName: dbName, tableName },
          phase2: { applicationPropertiesConfirmed: p2c1, entityAnnotation: p2Entity, tableVerified: p2c3, committedToGitHub: p2c4, reflectionText },
        },
        metadata: { subtopicId, taskId },
        completedAt: new Date().toISOString(),
      }, '*');
    } catch (_) {}
  };

  const checks = [s1, s2, s3done, s4];

  const selectedOS = typeof navigator !== 'undefined'
    ? navigator.userAgent.toLowerCase().includes('mac') ? 'mac' : navigator.userAgent.toLowerCase().includes('linux') ? 'linux' : 'windows'
    : 'windows';

  const propertiesText = `# MySQL connection
spring.datasource.url=jdbc:mysql://localhost:3306/${dbName}
spring.datasource.username=root
spring.datasource.password=${dbPass || 'your_password'}

# JPA settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`;

  const entityCode = `@Entity
public class ${entityName} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    public ${entityName}() { }

    // getters and setters...
}`;

  return (
    <div style={{
      minHeight: '100vh', background: '#04060d',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: '#e2e8f0',
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* ─── HEADER ─── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 28px', borderBottom: '1px solid #0f172a',
        background: 'rgba(4,6,13,0.95)', position: 'sticky', top: 0, zIndex: 200,
        backdropFilter: 'blur(10px)',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#334155', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
            HatchKod · Module 3 · 2.3.3
          </div>
          <h1 style={{
            fontSize: '18px', fontWeight: 900, margin: 0,
            background: 'linear-gradient(90deg, #34d399, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Spring Boot ↔ MySQL Connection
          </h1>
        </div>
        <button onClick={() => { muted.current = !muted.current; setMuteState(m => !m); }} style={{
          background: '#0a0e1a', border: '1px solid #1e293b', borderRadius: '8px',
          padding: '7px 14px', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
        }}>
          {muteState ? '🔇 Muted' : '🔊 Sound'}
        </button>
      </header>

      {/* ─── BODY ─── */}
      <main style={{
        display: 'grid', gridTemplateColumns: '1fr 360px',
        gap: '28px', maxWidth: '1280px', margin: '0 auto',
        padding: '28px',
      }}>
        {/* LEFT PANEL */}
        <div>
          {phase === 1 && (
            <>
              <MissionStrip step={activeStep} checks={checks} />

              {/* ── STEP 1: application.properties ── */}
              <StepCard n={1} total={4} title="Give Spring Boot MySQL's address" state={s1 ? 'done' : activeStep === 1 ? 'active' : 'locked'}>
                {/* Address label analogy - visual */}
                <div style={{
                  background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '12px',
                  padding: '18px', marginBottom: '18px',
                }}>
                  <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                    🏷️ The Analogy
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                      <div style={{ fontSize: '28px' }}>🍃</div>
                      <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, marginTop: '4px' }}>Spring Boot</div>
                      <div style={{ fontSize: '10px', color: '#334155' }}>starting up…</div>
                    </div>
                    <div style={{ flex: 2, background: '#ffffff', borderRadius: '8px', padding: '10px 14px', color: '#1e293b', boxShadow: '3px 3px 10px rgba(0,0,0,0.4)' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px', color: '#64748b', marginBottom: '4px' }}>📦 ADDRESS LABEL</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.7 }}>
                        <div>To: <strong>localhost:3306/{dbName}</strong></div>
                        <div>User: root</div>
                        <div>Mode: auto-create tables</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                      <div style={{ fontSize: '28px' }}>🗄️</div>
                      <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>MySQL</div>
                      <div style={{ fontSize: '10px', color: '#334155' }}>waiting at 3306</div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '12px', lineHeight: 1.6, marginTop: '12px', marginBottom: 0 }}>
                    <code style={{ color: '#fbbf24' }}>application.properties</code> is the address label Spring Boot reads at startup.
                    Without it, Spring has no idea where MySQL lives.
                  </p>
                </div>

                {/* Domain selector */}
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>Choose your project domain:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  {DOMAINS.map(d => (
                    <button key={d.id} onClick={() => { setSelectedDomain(d.id); play('tick'); }} style={{
                      background: selectedDomain === d.id ? '#1e3a5f' : '#0a0e1a',
                      border: `1.5px solid ${selectedDomain === d.id ? '#3b82f6' : '#1a2236'}`,
                      borderRadius: '9px', padding: '9px 16px',
                      color: selectedDomain === d.id ? '#60a5fa' : '#475569',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
                    }}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Your local MySQL root password:</div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={dbPass} onChange={e => { setDbPass(e.target.value); play('tick'); }}
                      placeholder="your MySQL root password"
                      style={{
                        width: '100%', background: '#060a12', border: '1.5px solid #1a2236',
                        borderRadius: '9px', padding: '10px 44px 10px 14px',
                        color: '#f0f6ff', fontSize: '13px', outline: 'none',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                    <button onClick={() => setShowPass(s => !s)} style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px',
                    }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div style={{ fontSize: '10px', color: '#1e293b', marginTop: '4px' }}>
                    Used locally only - never pushed anywhere.
                  </div>
                </div>

                {/* Generated properties */}
                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>Your generated properties:</div>
                <div style={{ position: 'relative' }}>
                  <Code>
                    <CopyBtn text={propertiesText} />
                    <span style={{ color: '#475569', fontStyle: 'italic' }}># MySQL connection</span>{'\n'}
                    <span style={{ color: '#7dd3fc' }}>spring.datasource.url</span>=jdbc:mysql://localhost:<span style={{ color: '#fb923c' }}>3306</span>/<span style={{ color: '#fbbf24' }}>{dbName}</span>{'\n'}
                    <span style={{ color: '#7dd3fc' }}>spring.datasource.username</span>=<span style={{ color: '#6ee7b7' }}>root</span>{'\n'}
                    <span style={{ color: '#7dd3fc' }}>spring.datasource.password</span>=<span style={{ color: '#6ee7b7' }}>{dbPass || 'your_password'}</span>{'\n\n'}
                    <span style={{ color: '#475569', fontStyle: 'italic' }}># JPA settings</span>{'\n'}
                    <span style={{ color: '#7dd3fc' }}>spring.jpa.hibernate.ddl-auto</span>=<span style={{ color: '#6ee7b7' }}>update</span>{'\n'}
                    <span style={{ color: '#7dd3fc' }}>spring.jpa.show-sql</span>=<span style={{ color: '#fb923c' }}>true</span>
                  </Code>
                </div>

                {/* Port explanation */}
                <div style={{ background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '9px', padding: '12px 14px', marginTop: '14px', marginBottom: '6px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '12px' }}>Port 3306</span>
                  <span style={{ color: '#475569', fontSize: '12px' }}> - MySQL's door. Spring Boot knocks here. You don't need to change it.</span>
                </div>

                {/* GitHub warning */}
                <div style={{
                  background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: '10px', padding: '14px', marginTop: '14px', marginBottom: '4px',
                  display: 'flex', gap: '12px',
                }}>
                  <div style={{ fontSize: '20px' }}>🚨</div>
                  <div>
                    <div style={{ color: '#fca5a5', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>Root password warning</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.6 }}>
                      Never push <code style={{ color: '#fbbf24' }}>application.properties</code> to GitHub.
                      Add it to <code style={{ color: '#fbbf24' }}>.gitignore</code> <em>before</em> your first commit.
                      Most beginners forget this step.
                    </div>
                  </div>
                </div>

                <CheckLabel checked={s1} onChange={e => { setS1(e.target.checked); if (e.target.checked) { play('connect'); setActiveStep(2); } else play('remove'); }}>
                  I added these lines to application.properties
                </CheckLabel>
              </StepCard>

              {/* ── STEP 2: pom.xml ── */}
              <StepCard n={2} total={4} title="Tell Maven about JPA and MySQL" state={s2 ? 'done' : activeStep === 2 ? 'active' : activeStep < 2 ? 'locked' : 'done'}>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                  Open <code style={{ color: '#fbbf24' }}>pom.xml</code>, find the <code style={{ color: '#7dd3fc' }}>&lt;dependencies&gt;</code> block, and add these two entries:
                </p>

                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>① JPA Starter - bridges Java objects to SQL:</div>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Code>
                    <CopyBtn text={`<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-data-jpa</artifactId>\n</dependency>`} />
                    &lt;<HL c="kw">dependency</HL>&gt;{'\n'}
                    {'    '}&lt;<HL c="kw">groupId</HL>&gt;<HL c="st">org.springframework.boot</HL>&lt;/<HL c="kw">groupId</HL>&gt;{'\n'}
                    {'    '}&lt;<HL c="kw">artifactId</HL>&gt;<HL c="id">spring-boot-starter-data-jpa</HL>&lt;/<HL c="kw">artifactId</HL>&gt;{'\n'}
                    &lt;/<HL c="kw">dependency</HL>&gt;
                  </Code>
                </div>

                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>② MySQL Connector - the JDBC driver:</div>
                <div style={{ position: 'relative', marginBottom: '18px' }}>
                  <Code>
                    <CopyBtn text={`<dependency>\n    <groupId>com.mysql</groupId>\n    <artifactId>mysql-connector-j</artifactId>\n    <scope>runtime</scope>\n</dependency>`} />
                    &lt;<HL c="kw">dependency</HL>&gt;{'\n'}
                    {'    '}&lt;<HL c="kw">groupId</HL>&gt;<HL c="st">com.mysql</HL>&lt;/<HL c="kw">groupId</HL>&gt;{'\n'}
                    {'    '}&lt;<HL c="kw">artifactId</HL>&gt;<HL c="id">mysql-connector-j</HL>&lt;/<HL c="kw">artifactId</HL>&gt;{'\n'}
                    {'    '}&lt;<HL c="kw">scope</HL>&gt;runtime&lt;/<HL c="kw">scope</HL>&gt;{'\n'}
                    &lt;/<HL c="kw">dependency</HL>&gt;
                  </Code>
                </div>

                <div style={{ background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '9px', padding: '12px 14px', marginBottom: '6px', fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  💡 Save pom.xml - Maven downloads the jars automatically.
                  Wait for <code style={{ color: '#34d399' }}>BUILD SUCCESS</code> in the terminal before continuing.
                </div>

                {s1 && (
                  <CheckLabel checked={s2} onChange={e => { setS2(e.target.checked); if (e.target.checked) { play('connect'); setActiveStep(3); } else play('remove'); }}>
                    Dependencies added - BUILD SUCCESS seen
                  </CheckLabel>
                )}
              </StepCard>

              {/* ── STEP 3: @Entity ── */}
              <StepCard n={3} total={4} title={`Tell JPA: "${entityName} is a table"`} state={s3done ? 'done' : activeStep === 3 ? 'active' : activeStep < 3 ? 'locked' : 'done'}>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                  Open <code style={{ color: '#fbbf24' }}>{entityName}.java</code>. Add these imports and annotations:
                </p>

                {/* Imports */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Code>
                    <CopyBtn text={`import jakarta.persistence.Entity;\nimport jakarta.persistence.GeneratedValue;\nimport jakarta.persistence.GenerationType;\nimport jakarta.persistence.Id;`} />
                    <HL c="kw">import</HL> jakarta.persistence.<HL c="ty">Entity</HL>;{'\n'}
                    <HL c="kw">import</HL> jakarta.persistence.<HL c="ty">GeneratedValue</HL>;{'\n'}
                    <HL c="kw">import</HL> jakarta.persistence.<HL c="ty">GenerationType</HL>;{'\n'}
                    <HL c="kw">import</HL> jakarta.persistence.<HL c="ty">Id</HL>;
                  </Code>
                </div>

                {/* Entity code */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Code>
                    <CopyBtn text={entityCode} />
                    <HL c="an">@Entity</HL> <HL c="cm">// → creates table "{tableName}" in MySQL</HL>{'\n'}
                    <HL c="kw">public class</HL> <HL c="ty">{entityName}</HL> {'{'}{'\n\n'}
                    {'    '}<HL c="an">@Id</HL> <HL c="cm">// → primary key column</HL>{'\n'}
                    {'    '}<HL c="an">@GeneratedValue</HL>(strategy = GenerationType.<HL c="id">IDENTITY</HL>) <HL c="cm">// → auto-increment</HL>{'\n'}
                    {'    '}<HL c="kw">private</HL> <HL c="ty">Long</HL> id;{'\n\n'}
                    {'    '}<HL c="kw">private</HL> <HL c="ty">String</HL> name;{'\n\n'}
                    {'    '}<HL c="kw">public</HL> <HL c="ty">{entityName}</HL>() {'{ }'} <HL c="cm">// required empty constructor</HL>{'\n'}
                    {'}'}
                  </Code>
                </div>

                {/* Annotation pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { an: '@Entity', color: '#a78bfa', desc: `Tells JPA to build a table named "${tableName}" from this class.` },
                    { an: '@Id', color: '#60a5fa', desc: 'Marks the primary key column - every row has a unique id.' },
                    { an: '@GeneratedValue', color: '#34d399', desc: 'MySQL auto-increments: 1, 2, 3… You never set the id manually.' },
                  ].map(({ an, color, desc }) => (
                    <div key={an} style={{
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '9px', padding: '10px 14px',
                    }}>
                      <code style={{ color, fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', paddingTop: '1px', minWidth: '120px' }}>{an}</code>
                      <span style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>{desc}</span>
                    </div>
                  ))}
                </div>

                {/* Blank fill */}
                <div style={{ background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 700, marginBottom: '4px' }}>
                    What annotation marks a class as a JPA entity?
                  </div>
                  <Blank
                    answer="@Entity" placeholder="@Entity"
                    hint="starts with @ - tells JPA to make a MySQL table from this class"
                    play={play} onCorrect={() => setBlankCorrect(true)}
                  />
                </div>

                {s2 && blankCorrect && (
                  <CheckLabel checked={s3done} onChange={e => { setS3done(e.target.checked); if (e.target.checked) { play('connect'); setActiveStep(4); } else play('remove'); }}>
                    I added @Entity, @Id, @GeneratedValue to my class
                  </CheckLabel>
                )}
              </StepCard>

              {/* ── STEP 4: See the table ── */}
              <StepCard n={4} total={4} title="Restart - see your table appear" state={s4 ? 'done' : activeStep === 4 ? 'active' : activeStep < 4 ? 'locked' : 'done'}>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '14px' }}>
                  Stop the server (Ctrl+C), then restart. Because <code style={{ color: '#fbbf24' }}>show-sql=true</code>, watch for Hibernate output:
                </p>

                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <Code>
                    <CopyBtn text={selectedOS === 'windows' ? 'mvnw.cmd spring-boot:run' : './mvnw spring-boot:run'} label="Copy cmd" />
                    {selectedOS === 'windows' ? 'mvnw.cmd spring-boot:run' : './mvnw spring-boot:run'}
                  </Code>
                </div>

                {/* Terminal mockup */}
                <div style={{
                  background: '#010307', border: '1px solid #1a2236', borderRadius: '10px', overflow: 'hidden',
                  fontFamily: "'JetBrains Mono', monospace", marginBottom: '14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ background: '#0a0e1a', padding: '8px 14px', display: 'flex', gap: '6px', alignItems: 'center', borderBottom: '1px solid #1a2236' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ color: '#334155', fontSize: '11px', marginLeft: '8px', fontFamily: 'system-ui' }}>Console</span>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: '12px', lineHeight: 1.8, color: '#94a3b8' }}>
                    <span style={{ color: '#60a5fa' }}>Hibernate: create table </span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>{tableName}</span>
                    <span style={{ color: '#94a3b8' }}> (</span><br />
                    <span style={{ paddingLeft: '20px', color: '#64748b' }}>id bigint not null auto_increment,</span><br />
                    <span style={{ paddingLeft: '20px', color: '#64748b' }}>name varchar(255),</span><br />
                    <span style={{ paddingLeft: '20px', color: '#64748b' }}>primary key (id)</span><br />
                    <span style={{ color: '#94a3b8' }}>) engine=InnoDB</span>
                  </div>
                </div>

                {/* Verify in MySQL */}
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Verify in MySQL terminal:</p>
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <Code>
                    <CopyBtn text={`mysql -u root -p\nUSE ${dbName};\nSHOW TABLES;`} />
                    mysql -u root -p{'\n'}
                    <HL c="kw">USE</HL> <HL c="id">{dbName}</HL>;{'\n'}
                    <HL c="kw">SHOW TABLES</HL>;
                  </Code>
                </div>

                {/* Expected output */}
                <div style={{
                  background: '#010307', border: '1px solid #1a2236', borderRadius: '10px', overflow: 'hidden',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', marginBottom: '14px',
                }}>
                  <div style={{ background: '#0a0e1a', padding: '6px 14px', fontSize: '10px', color: '#334155', borderBottom: '1px solid #1a2236' }}>Expected output</div>
                  <div style={{ padding: '12px 14px', color: '#94a3b8', lineHeight: 1.9 }}>
                    mysql&gt; SHOW TABLES;<br />
                    +--------------------+<br />
                    | Tables_in_{dbName} |<br />
                    +--------------------+<br />
                    | <span style={{ color: '#34d399', fontWeight: 900 }}>{tableName}</span>{'          '}|<br />
                    +--------------------+
                  </div>
                </div>

                {/* Common errors accordion */}
                <div style={{ border: '1px solid #1a2236', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                  <button onClick={() => { setAccordionOpen(o => !o); play('tick'); }} style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#0a0e1a', border: 'none', padding: '13px 16px', cursor: 'pointer',
                    color: '#64748b', fontSize: '13px', fontWeight: 700,
                  }}>
                    <span>🛠️ Common errors & fixes</span>
                    <span style={{ transition: 'transform 0.2s', transform: accordionOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                  </button>
                  {accordionOpen && (
                    <div style={{ background: '#060a12', padding: '14px 16px', borderTop: '1px solid #1a2236' }}>
                      {[
                        { err: "Access denied for user 'root'", fix: "Password in properties doesn't match. Re-type carefully - it's case-sensitive." },
                        { err: `Unknown database '${dbName}'`, fix: `Database not created yet. Run: CREATE DATABASE ${dbName}; in MySQL terminal.` },
                        { err: 'Communications link failure', fix: 'MySQL is not running. Start MySQL service first (Step 1 from 2.3.2).' },
                        { err: 'Table already exists', fix: `Change ddl-auto from "create" to "update" - update never drops existing tables.` },
                      ].map(({ err, fix }, i) => (
                        <div key={i} style={{ marginBottom: i < 3 ? '14px' : 0, paddingBottom: i < 3 ? '14px' : 0, borderBottom: i < 3 ? '1px solid #1a2236' : 'none' }}>
                          <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>✗ {err}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>Fix: {fix}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {s3done && (
                  <CheckLabel checked={s4} onChange={e => { setS4(e.target.checked); if (e.target.checked) play('payoff'); else play('remove'); }}>
                    I see {tableName} in SHOW TABLES ✓
                  </CheckLabel>
                )}
              </StepCard>

              {/* PAYOFF REVEAL */}
              {s1 && s2 && s3done && s4 && revealLines.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6,78,59,0.3), rgba(30,58,95,0.3))',
                  border: '1.5px solid #059669', borderRadius: '14px', padding: '22px',
                  marginBottom: '20px', animation: 'popIn 0.4s ease',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#34d399', marginBottom: '14px' }}>
                    🎉 Hibernate Integration Complete
                  </div>
                  {revealLines.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', animation: 'fadeSlide 0.3s ease' }}>
                      <span style={{ color: '#34d399', fontWeight: 900 }}>✓</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{line}</span>
                    </div>
                  ))}
                  {revealLines.length >= revealTexts.length && (
                    <button onClick={() => { setPhase(2); play('tick'); }} style={{
                      marginTop: '16px', background: 'linear-gradient(135deg, #059669, #0284c7)',
                      border: 'none', borderRadius: '10px', padding: '13px 22px',
                      color: '#fff', fontWeight: 900, fontSize: '14px', cursor: 'pointer', width: '100%',
                    }}>
                      Now apply this to YOUR project →
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {phase === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => setPhase(1)} style={{ background: '#0a0e1a', border: '1px solid #1a2236', borderRadius: '8px', padding: '7px 14px', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                  ← Back
                </button>
                <div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Phase 2</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#e2e8f0' }}>Apply this to YOUR project 🛠️</div>
                </div>
              </div>
              <Phase2
                play={play} entityName={entityName} tableName={tableName} dbName={dbName}
                p2c1={p2c1} setP2c1={setP2c1} p2Entity={p2Entity} setP2Entity={setP2Entity}
                p2Id={p2Id} setP2Id={setP2Id} p2Gen={p2Gen} setP2Gen={setP2Gen}
                p2Long={p2Long} setP2Long={setP2Long} p2Ctor={p2Ctor} setP2Ctor={setP2Ctor}
                p2GetSet={p2GetSet} setP2GetSet={setP2GetSet} p2c3={p2c3} setP2c3={setP2c3}
                p2c4={p2c4} setP2c4={setP2c4} tableInputName={tableInputName} setTableInputName={setTableInputName}
                reflectionText={reflectionText} setReflectionText={setReflectionText}
                submitted={submitted} onSubmit={handleSubmit}
              />
            </>
          )}
        </div>

        {/* RIGHT PANEL - sticky docking bay */}
        <aside style={{ position: 'sticky', top: '72px', height: 'fit-content' }}>
          <div style={{
            background: '#060a12', border: '1px solid #1a2236', borderRadius: '14px', padding: '20px',
          }}>
            <DockingBay step={activeStep} checks={checks} dbName={dbName} dbPass={dbPass} tableName={tableName} entityName={entityName} />

            {/* Summary line at bottom */}
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #1a2236' }}>
              <div style={{ fontSize: '10px', color: '#334155', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  ['application.properties', s1],
                  ['pom.xml dependencies', s2],
                  [`@Entity ${entityName}`, s3done],
                  [`Table: ${tableName}`, s4],
                ].map(([label, done], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: done ? '#64748b' : '#1e293b', fontFamily: 'monospace' }}>{label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: done ? '#34d399' : '#1e293b' }}>{done ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
