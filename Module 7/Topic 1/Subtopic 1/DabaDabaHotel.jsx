import React, { useState, useEffect, useRef } from 'react';

/* ============================================================
   Daba Daba Hotel — Two Sum Interactive
   Plain JSX, no TypeScript, useState/useEffect only,
   Web Audio API for sound, CSS keyframes/transitions for motion.
   ============================================================ */

const MENU = [
  { id: 0, name: 'Masala Dosa', price: 120 },
  { id: 1, name: 'Chicken Biryani', price: 250 },
  { id: 2, name: 'Paneer Thali', price: 180 },
  { id: 3, name: 'Family Combo', price: 350 },
  { id: 4, name: 'Veg Fried Rice', price: 200 },
];

const TARGET = 450;
const CHAR_NAME = 'Ravi';

/* Precomputed guided brute-force trace: outer i, inner j, sum, isMatch */
const BRUTE_TRACE = (() => {
  const trace = [];
  for (let i = 0; i < MENU.length; i++) {
    for (let j = i + 1; j < MENU.length; j++) {
      const sum = MENU[i].price + MENU[j].price;
      trace.push({ i, j, sum, isMatch: sum === TARGET });
    }
  }
  return trace;
})();

/* Precomputed optimal single-pass trace: for each i, complement, found-at-index or null */
const OPTIMAL_TRACE = (() => {
  const trace = [];
  const seen = {}; // price -> index
  for (let i = 0; i < MENU.length; i++) {
    const price = MENU[i].price;
    const complement = TARGET - price;
    const foundIndex = Object.prototype.hasOwnProperty.call(seen, complement) ? seen[complement] : null;
    trace.push({ i, complement, foundIndex, isMatch: foundIndex !== null });
    seen[price] = i;
  }
  return trace;
})();

/* ============================================================
   Web Audio helper — lazily created, gated behind first gesture
   ============================================================ */
function useSoundEngine() {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const tone = (freq, duration, type, startFreq, delay) => {
    if (mutedRef.current) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    if (startFreq) {
      osc.frequency.setValueAtTime(startFreq, t0);
      osc.frequency.linearRampToValueAtTime(freq, t0 + duration);
    } else {
      osc.frequency.setValueAtTime(freq, t0);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  };

  const sounds = {
    boxLand: (delay) => tone(800, 0.05, 'triangle', null, delay),
    uiPop: () => tone(440, 0.15, 'sine', 220),
    noMatch: () => tone(220, 0.1, 'sawtooth', 440),
    matchFound: () => {
      tone(523, 0.18, 'sine', null, 0);
      tone(659, 0.18, 'sine', null, 0.15);
      tone(784, 0.25, 'sine', null, 0.3);
    },
    notebookAdd: () => tone(330, 0.12, 'sine', 220),
    finalSuccess: () => {
      tone(523, 0.2, 'sine', null, 0);
      tone(659, 0.2, 'sine', null, 0.12);
      tone(784, 0.2, 'sine', null, 0.24);
      tone(1047, 0.4, 'sine', null, 0.36);
    },
    codeReveal: () => {
      [523, 659, 784, 1047].forEach((f, idx) => tone(f, 0.15, 'sine', null, idx * 0.08));
    },
    tick: () => tone(600, 0.06, 'sine'),
  };

  return { sounds, muted, setMuted, ensureCtx };
}

/* ============================================================
   Small presentational helpers
   ============================================================ */

function TypedText({ text, speed, onDone }) {
  const [shown, setShown] = useState('');
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setShown(text);
      if (onDone) onDone();
      return;
    }
    setShown('');
    let i = 0;
    const step = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) {
        timer = setTimeout(step, speed || 30);
      } else if (onDone) {
        onDone();
      }
    };
    let timer = setTimeout(step, speed || 30);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span>{shown}</span>;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
    };
  }, []);
  return reduced;
}

function Confetti({ active }) {
  const reduceMotion = usePrefersReducedMotion();
  if (!active) return null;
  const count = reduceMotion ? 0 : 24;
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.3;
    const dur = 0.9 + Math.random() * 0.6;
    const color = ['#ffb703', '#fb8500', '#219ebc', '#8ecae6', '#e63946'][i % 5];
    const rotate = Math.random() * 360;
    return (
      <span
        key={i}
        className="ddh-confetti-piece"
        style={{
          left: left + '%',
          background: color,
          animationDelay: delay + 's',
          animationDuration: dur + 's',
          transform: `rotate(${rotate}deg)`,
        }}
      />
    );
  });
  return <div className="ddh-confetti">{pieces}</div>;
}

/* ============================================================
   Code snippets
   ============================================================ */

const BRUTE_CODE_LINES = [
  { text: 'public static int[] twoSum(int[] prices, int target) {', kind: 'plain' },
  { text: '  for (int i = 0; i < prices.length; i++) {', kind: 'loop-i' },
  { text: '    for (int j = i + 1; j < prices.length; j++) {', kind: 'loop-j' },
  { text: '      if (prices[i] + prices[j] == target) {', kind: 'check' },
  { text: '        return new int[]{i, j};', kind: 'return' },
  { text: '      }', kind: 'plain' },
  { text: '    }', kind: 'plain' },
  { text: '  }', kind: 'plain' },
  { text: '  return null;', kind: 'plain' },
  { text: '}', kind: 'plain' },
];

const OPTIMAL_CODE_LINES = [
  { text: 'public static int[] twoSum(int[] prices, int target) {', kind: 'plain' },
  { text: '  Map<Integer, Integer> seen = new HashMap<>();', kind: 'plain' },
  { text: '  for (int i = 0; i < prices.length; i++) {', kind: 'loop-i' },
  { text: '    int complement = target - prices[i];', kind: 'complement' },
  { text: '    if (seen.containsKey(complement)) {', kind: 'check' },
  { text: '      return new int[]{seen.get(complement), i};', kind: 'return' },
  { text: '    }', kind: 'plain' },
  { text: '    seen.put(prices[i], i);', kind: 'set' },
  { text: '  }', kind: 'plain' },
  { text: '  return null;', kind: 'plain' },
  { text: '}', kind: 'plain' },
];

/* Which code lines are "in scope" vs the single "current" line for a given trace step */
function bruteLineInfo(step) {
  return {
    primary: step.isMatch ? 4 : 3,
    scope: step.isMatch ? [1, 2, 3, 4] : [1, 2, 3],
  };
}

function optimalLineInfo(step) {
  return {
    primary: step.isMatch ? 5 : 7,
    scope: step.isMatch ? [2, 3, 4, 5] : [2, 3, 4, 7],
  };
}

/* Notebook contents right before a given optimal-trace step was decided */
function notebookBeforeStep(stepIdx) {
  const nb = {};
  for (let m = 0; m < stepIdx; m++) {
    nb[MENU[m].price] = m;
  }
  return nb;
}

function highlightSyntax(text) {
  // very small, dependency-free syntax coloring for the fixed snippets above
  const parts = [];
  const tokenRe = /(\/\/.*$)|('.*?')|(\b\d+\b)|(\bpublic\b|\bstatic\b|\bint\b|\bfor\b|\breturn\b|\bif\b|\bnew\b|\bnull\b)/g;
  let lastIndex = 0;
  let match;
  while ((match = tokenRe.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
    }
    const [full, comment, str, num, kw] = match;
    let color = '#d4d4d4';
    if (comment) color = '#6a9955';
    else if (str) color = '#ce9178';
    else if (num) color = '#b5cea8';
    else if (kw) color = '#569cd6';
    parts.push(
      <span key={match.index} style={{ color }}>
        {full}
      </span>
    );
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) parts.push(<span key={lastIndex + 'end'}>{text.slice(lastIndex)}</span>);
  return parts;
}

function CodePanel({
  title,
  lines,
  mode,
  history,
  stepIndex,
  note,
  complexity,
  onNext,
  onPrev,
  canNext,
  canPrev,
  onClose,
  isPlaying,
  onTogglePlay,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const step = history[stepIndex];
  const info = mode === 'brute' ? bruteLineInfo(step) : optimalLineInfo(step);
  const lineRefs = useRef([]);
  const [pointer, setPointer] = useState(null);

  useEffect(() => {
    const el = lineRefs.current[info.primary];
    if (el) {
      setPointer({ top: el.offsetTop, height: el.offsetHeight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.primary, stepIndex]);

  const vars =
    mode === 'brute'
      ? [
          { label: 'target', value: TARGET, tone: 'const' },
          { label: 'i', value: step.i },
          { label: 'j', value: step.j },
          { label: 'prices[i]', value: MENU[step.i].price },
          { label: 'prices[j]', value: MENU[step.j].price },
          { label: 'sum', value: step.sum, tone: step.isMatch ? 'good' : 'bad' },
        ]
      : [
          { label: 'target', value: TARGET, tone: 'const' },
          { label: 'i', value: step.i },
          { label: 'prices[i]', value: MENU[step.i].price },
          { label: 'complement', value: step.complement },
          { label: 'seen.containsKey(complement)', value: step.isMatch ? 'true' : 'false', tone: step.isMatch ? 'good' : 'bad' },
        ];

  return (
    <div className="ddh-code-overlay">
      <div className="ddh-code-panel">
        <div className="ddh-code-header">
          <span>{title}</span>
          <div className="ddh-code-header-actions">
            <button
              className="ddh-play-btn"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause auto-play' : 'Auto-play through your trace'}
            >
              {isPlaying ? '⏸ Pause' : '▶ Auto-play'}
            </button>
            <button className="ddh-close-btn" onClick={onClose} aria-label="Close code panel">✕</button>
          </div>
        </div>

        <div className="ddh-step-meter">
          Step {stepIndex + 1} of {history.length}
          <div className="ddh-step-track">
            <div
              className="ddh-step-fill"
              style={{ width: `${((stepIndex + 1) / history.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="ddh-var-strip">
          {vars.map((v) => (
            <div
              key={v.label + '-' + stepIndex}
              className={'ddh-var-chip' + (v.tone ? ' ddh-var-chip-' + v.tone : '') + (reduceMotion ? '' : ' ddh-var-pop')}
            >
              <span className="ddh-var-label">{v.label}</span>
              <span className="ddh-var-value">{v.value}</span>
            </div>
          ))}
        </div>

        <div className="ddh-code-block-wrap">
          {pointer && (
            <div
              className="ddh-code-pointer"
              style={{ transform: `translateY(${pointer.top}px)`, height: pointer.height }}
            >
              ▶
            </div>
          )}
          <pre className="ddh-code-block">
            {lines.map((line, idx) => {
              const isPrimary = idx === info.primary;
              const isScope = info.scope.includes(idx);
              return (
                <div
                  key={idx}
                  ref={(el) => (lineRefs.current[idx] = el)}
                  className={
                    'ddh-code-line' +
                    (isScope ? ' ddh-code-line-scope' : '') +
                    (isPrimary ? ' ddh-code-line-active' : '')
                  }
                >
                  {highlightSyntax(line.text)}
                </div>
              );
            })}
          </pre>
        </div>

        {mode === 'brute' ? (
          <div className="ddh-mini-viz ddh-mini-viz-full">
            <div className="ddh-mini-array-row">
              {MENU.map((item, idx) => {
                const isI = idx === step.i;
                const isJ = idx === step.j;
                return (
                  <div key={item.id} className="ddh-mini-array-slot">
                    <div className="ddh-mini-pointer-row">
                      {isI && <span className="ddh-mini-pointer ddh-pointer-i">i</span>}
                      {isJ && <span className="ddh-mini-pointer ddh-pointer-j">j</span>}
                    </div>
                    <div
                      className={
                        'ddh-mini-box' +
                        (isI || isJ ? ' ddh-mini-box-active' : '') +
                        (step.isMatch && (isI || isJ) ? ' ddh-box-gold' : '') +
                        (!step.isMatch && isJ ? ' ddh-box-red' : '') +
                        (!step.isMatch && isI ? ' ddh-box-current' : '')
                      }
                    >
                      <div className="ddh-box-index">{idx}</div>
                      <div className="ddh-box-value">₹{item.price}</div>
                      <div className="ddh-box-label">{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={'ddh-mini-result ' + (step.isMatch ? 'ddh-sum-match' : 'ddh-sum-no-match')}>
              prices[{step.i}] + prices[{step.j}] = {MENU[step.i].price} + {MENU[step.j].price} = {step.sum}
              {step.isMatch ? ' ✅' : ' ❌'}
            </div>
          </div>
        ) : (
          <div className="ddh-mini-viz ddh-mini-viz-full">
            <div className="ddh-mini-array-row">
              {MENU.map((item, idx) => {
                const isI = idx === step.i;
                return (
                  <div key={item.id} className="ddh-mini-array-slot">
                    <div className="ddh-mini-pointer-row">
                      {isI && <span className="ddh-mini-pointer ddh-pointer-i">i</span>}
                    </div>
                    <div
                      className={
                        'ddh-mini-box' +
                        (isI ? ' ddh-mini-box-active' : '') +
                        (step.isMatch && isI ? ' ddh-box-gold' : '') +
                        (!step.isMatch && isI ? ' ddh-box-current' : '')
                      }
                    >
                      <div className="ddh-box-index">{idx}</div>
                      <div className="ddh-box-value">₹{item.price}</div>
                      <div className="ddh-box-label">{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ddh-mini-notebook">
              <div className="ddh-notebook-title">📓 Notebook</div>
              <div className="ddh-notebook-entries">
                {Object.keys(notebookBeforeStep(step.i)).length === 0 && (
                  <div className="ddh-notebook-empty">Empty</div>
                )}
                {Object.entries(notebookBeforeStep(step.i)).map(([price, idx]) => (
                  <div
                    key={price}
                    className={'ddh-notebook-chip' + (step.isMatch && Number(price) === step.complement ? ' ddh-box-gold' : '')}
                  >
                    ₹{price} → {MENU[idx].name}
                  </div>
                ))}
              </div>
            </div>
            <div className={'ddh-mini-result ' + (step.isMatch ? 'ddh-sum-match' : 'ddh-sum-no-match')}>
              Need ₹{step.complement} — {step.isMatch ? 'found it! ✅' : 'not there yet ❌'}
            </div>
          </div>
        )}

        <div className="ddh-code-controls">
          <button disabled={!canPrev} onClick={onPrev}>← Prev step</button>
          <button disabled={!canNext} onClick={onNext}>Next step →</button>
        </div>
        {note && <div className="ddh-code-note">{note}</div>}
        {complexity && (
          <div className="ddh-complexity-badge">
            <strong>{complexity.big}</strong>
            <span>{complexity.plain}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Main component
   ============================================================ */

export default function DabaDabaHotel() {
  const { sounds, muted, setMuted } = useSoundEngine();
  const reduceMotion = usePrefersReducedMotion();

  // phase: intro -> menuReveal -> bubble -> chooseApproach -> brute/optimal flows
  const [phase, setPhase] = useState('intro');
  const [menuRevealCount, setMenuRevealCount] = useState(0);
  const [bubbleDone, setBubbleDone] = useState(false);
  const [helpClicked, setHelpClicked] = useState(false);

  const [activePath, setActivePath] = useState(null); // 'brute' | 'optimal'
  const [completedPaths, setCompletedPaths] = useState({ brute: false, optimal: false });

  // Brute force state
  const [bruteStepIndex, setBruteStepIndex] = useState(-1); // index into BRUTE_TRACE, -1 = not started
  const [bruteOuterStarted, setBruteOuterStarted] = useState(false);
  const [bruteFlashState, setBruteFlashState] = useState(null); // 'match' | 'no-match' | null
  const [bruteDone, setBruteDone] = useState(false);
  const [bruteHistory, setBruteHistory] = useState([]);

  // Optimal state
  const [optStepIndex, setOptStepIndex] = useState(-1);
  const [notebook, setNotebook] = useState({}); // price -> index
  const [optFlashState, setOptFlashState] = useState(null);
  const [optDone, setOptDone] = useState(false);
  const [optHistory, setOptHistory] = useState([]);

  // Code reveal
  const [showCode, setShowCode] = useState(false);
  const [traceCursor, setTraceCursor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const startedAtRef = useRef(null);
  const bruteFoundAtRef = useRef(null);
  const optFoundAtRef = useRef(null);

  /* ---------- Scene 1 auto-play sequencing ---------- */
  useEffect(() => {
    startedAtRef.current = Date.now();
    const t1 = setTimeout(() => setPhase('menuReveal'), reduceMotion ? 200 : 900);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'menuReveal') return;
    let cancelled = false;
    MENU.forEach((_, idx) => {
      setTimeout(() => {
        if (cancelled) return;
        setMenuRevealCount((c) => Math.max(c, idx + 1));
        sounds.tick();
        if (idx === MENU.length - 1) {
          setTimeout(() => !cancelled && setPhase('bubble'), 400);
        }
      }, reduceMotion ? idx * 40 : idx * 150);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---------- postMessage integration (fires once, after first path completed) ---------- */
  useEffect(() => {
    if (submitted) return;
    const anyDone = completedPaths.brute || completedPaths.optimal;
    if (!anyDone) return;
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const payload = {
      type: 'HK_RESULT',
      exerciseId: 'dsa-hashmap-s1-daba-daba-hotel-two-sum',
      exerciseType: 'interactive',
      subtopicId: params.get('subtopicId') || null,
      taskId: params.get('taskId') || null,
      completedPaths: { ...completedPaths },
      bruteHistory,
      optHistory,
      timeToFindMs: {
        brute: bruteFoundAtRef.current && startedAtRef.current ? bruteFoundAtRef.current - startedAtRef.current : null,
        optimal: optFoundAtRef.current && startedAtRef.current ? optFoundAtRef.current - startedAtRef.current : null,
      },
    };
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(payload, '*');
    }
    setSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedPaths]);

  /* ---------- Handlers ---------- */

  const handleHelpClick = () => {
    sounds.uiPop();
    setHelpClicked(true);
    setPhase('chooseApproach');
  };

  const choosePath = (path) => {
    sounds.uiPop();
    setActivePath(path);
    if (path === 'brute') {
      setBruteStepIndex(-1);
      setBruteOuterStarted(false);
      setBruteDone(false);
      setBruteFlashState(null);
      setBruteHistory([]);
    } else {
      setOptStepIndex(-1);
      setNotebook({});
      setOptDone(false);
      setOptFlashState(null);
      setOptHistory([]);
    }
  };

  const tryOtherWay = () => {
    sounds.uiPop();
    setShowCode(false);
    setTraceCursor(0);
    setIsPlaying(false);
    setActivePath(activePath === 'brute' ? 'optimal' : 'brute');
    if (activePath === 'brute') {
      setOptStepIndex(-1);
      setNotebook({});
      setOptDone(false);
      setOptFlashState(null);
      setOptHistory([]);
    } else {
      setBruteStepIndex(-1);
      setBruteOuterStarted(false);
      setBruteDone(false);
      setBruteFlashState(null);
      setBruteHistory([]);
    }
  };

  /* ---- Brute force step logic ---- */
  const startBrute = () => {
    sounds.uiPop();
    setBruteOuterStarted(true);
    setBruteStepIndex(0);
  };

  const checkBrutePair = () => {
    if (bruteStepIndex < 0 || bruteStepIndex >= BRUTE_TRACE.length) return;
    const step = BRUTE_TRACE[bruteStepIndex];
    setBruteHistory((h) => [...h, step]);
    if (step.isMatch) {
      setBruteFlashState('match');
      sounds.matchFound();
      setTimeout(() => {
        sounds.finalSuccess();
        setBruteDone(true);
        bruteFoundAtRef.current = Date.now();
        setCompletedPaths((p) => ({ ...p, brute: true }));
      }, 500);
    } else {
      setBruteFlashState('no-match');
      sounds.noMatch();
      setTimeout(() => {
        setBruteFlashState(null);
        setBruteStepIndex((idx) => idx + 1);
      }, 650);
    }
  };

  const currentBruteStep = bruteStepIndex >= 0 && bruteStepIndex < BRUTE_TRACE.length ? BRUTE_TRACE[bruteStepIndex] : null;
  const bruteOuterIndex = currentBruteStep ? currentBruteStep.i : bruteDone ? BRUTE_TRACE[BRUTE_TRACE.length - 1].i : 0;

  /* ---- Optimal step logic ---- */
  const startOptimal = () => {
    sounds.uiPop();
    setOptStepIndex(0);
  };

  const checkOptimalStep = () => {
    if (optStepIndex < 0 || optStepIndex >= OPTIMAL_TRACE.length) return;
    const step = OPTIMAL_TRACE[optStepIndex];
    setOptHistory((h) => [...h, step]);
    if (step.isMatch) {
      setOptFlashState('match');
      sounds.matchFound();
      setTimeout(() => {
        sounds.finalSuccess();
        setOptDone(true);
        optFoundAtRef.current = Date.now();
        setCompletedPaths((p) => ({ ...p, optimal: true }));
      }, 500);
    } else {
      setOptFlashState('no-match');
      sounds.noMatch();
      setTimeout(() => {
        setOptFlashState(null);
        setNotebook((nb) => ({ ...nb, [MENU[step.i].price]: step.i }));
        sounds.notebookAdd();
        setOptStepIndex((idx) => idx + 1);
      }, 650);
    }
  };

  const currentOptStep = optStepIndex >= 0 && optStepIndex < OPTIMAL_TRACE.length ? OPTIMAL_TRACE[optStepIndex] : null;

  /* ---- Code reveal navigation, synced to the student's own trace ---- */
  const activeHistory = activePath === 'brute' ? bruteHistory : optHistory;
  const maxTraceIndex = Math.max(activeHistory.length - 1, 0);

  const openCode = () => {
    sounds.codeReveal();
    setTraceCursor(0);
    setIsPlaying(false);
    setShowCode(true);
  };

  const nextTraceStep = () => setTraceCursor((i) => Math.min(i + 1, maxTraceIndex));
  const prevTraceStep = () => {
    setIsPlaying(false);
    setTraceCursor((i) => Math.max(i - 1, 0));
  };

  const togglePlay = () => {
    sounds.uiPop();
    if (!isPlaying && traceCursor >= maxTraceIndex) setTraceCursor(0);
    setIsPlaying((p) => !p);
  };

  /* Auto-play: step through the student's own recorded trace at a steady pace */
  useEffect(() => {
    if (!isPlaying) return;
    if (traceCursor >= maxTraceIndex) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      sounds.tick();
      setTraceCursor((i) => Math.min(i + 1, maxTraceIndex));
    }, reduceMotion ? 200 : 1300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, traceCursor, maxTraceIndex]);

  /* ---------- Derived UI bits ---------- */
  const anyDone = completedPaths.brute || completedPaths.optimal;
  const bothDone = completedPaths.brute && completedPaths.optimal;

  const totalPairsBrute = BRUTE_TRACE.length; // 10
  const totalItemsOptimal = MENU.length; // 5

  return (
    <div className="ddh-root">
      <style>{STYLES}</style>

      <button
        className="ddh-mute-btn"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="ddh-scene">
        {/* ---------- Hotel signboard + characters ---------- */}
        <div className={'ddh-storefront' + (phase !== 'intro' ? ' ddh-storefront-settled' : '')}>
          <div className="ddh-sign">🏨 Dhebba Dhebba Hotel</div>
          <div className="ddh-characters">
            <div className="ddh-char ddh-char-1">🧑</div>
            <div className="ddh-char ddh-char-2">🧑‍🦱</div>
            <div className="ddh-char ddh-char-3">🧑‍🦰</div>
          </div>
        </div>

        {/* ---------- Menu board ---------- */}
        {phase !== 'intro' && (
          <div className="ddh-menu-board">
            <div className="ddh-menu-title">Menu</div>
            <div className="ddh-menu-list">
              {MENU.map((item, idx) => (
                <div
                  key={item.id}
                  className={'ddh-menu-item' + (idx < menuRevealCount ? ' ddh-menu-item-shown' : '')}
                  style={{ transitionDelay: reduceMotion ? '0ms' : idx * 40 + 'ms' }}
                >
                  <span>{item.name}</span>
                  <span className="ddh-price">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Ravi's speech bubble ---------- */}
        {(phase === 'bubble' || phase === 'chooseApproach' || activePath) && (
          <div className="ddh-bubble">
            {phase === 'bubble' && !bubbleDone && (
              <TypedText
                text={`Guys, I only have ₹450. I want exactly 2 items. What should I get?`}
                onDone={() => setBubbleDone(true)}
              />
            )}
            {(bubbleDone || phase !== 'bubble') && phase === 'bubble' && (
              <span>{`Guys, I only have ₹450. I want exactly 2 items. What should I get?`}</span>
            )}
            {phase === 'chooseApproach' && !activePath && (
              <span>Alright, let's figure this out — try it yourself first.</span>
            )}
            {activePath === 'brute' && !bruteDone && <span>Okay, let's check every combo one by one!</span>}
            {activePath === 'optimal' && !optDone && <span>Let's keep a notebook of what we've seen.</span>}
            {bruteDone && activePath === 'brute' && (
              <span>That's it! Chicken Biryani + Veg Fried Rice = exactly ₹450!</span>
            )}
            {optDone && activePath === 'optimal' && (
              <span>Only one pass through the menu and I found it — Biryani + Fried Rice!</span>
            )}
          </div>
        )}

        {phase === 'bubble' && bubbleDone && !helpClicked && (
          <button className="ddh-help-btn ddh-pulse" onClick={handleHelpClick}>
            Help Me 🤔
          </button>
        )}

        {/* ---------- Approach chooser ---------- */}
        {phase === 'chooseApproach' && !activePath && (
          <div className="ddh-choose-wrap">
            <div className="ddh-choose-subtitle">Try it yourself first — I'll help you code it after.</div>
            <div className="ddh-choose-buttons">
              <button className="ddh-choice-btn" onClick={() => choosePath('brute')}>
                Normal Way
              </button>
              <button className="ddh-choice-btn ddh-choice-optimal" onClick={() => choosePath('optimal')}>
                Optimal Way
              </button>
            </div>
          </div>
        )}

        {/* ---------- Try the other way ---------- */}
        {activePath && (bruteDone || optDone) && !showCode && (
          <button className="ddh-other-way-btn" onClick={tryOtherWay}>
            ↺ Try the other way
          </button>
        )}

        {/* ================= BRUTE FORCE FLOW ================= */}
        {activePath === 'brute' && (
          <div className="ddh-flow">
            <div className="ddh-optimal-panels">
              <div className="ddh-array-row">
                {MENU.map((item, idx) => {
                  const isOuter = idx === bruteOuterIndex && bruteOuterStarted;
                  const isInner = currentBruteStep && idx === currentBruteStep.j;
                  const isDoneBox = bruteHistory.some((h) => h.i < bruteOuterIndex && (h.i === idx || h.j === idx)) && idx < bruteOuterIndex;
                  const isGold = bruteFlashState === 'match' && currentBruteStep && (idx === currentBruteStep.i || idx === currentBruteStep.j);
                  const isRed = bruteFlashState === 'no-match' && currentBruteStep && (idx === currentBruteStep.i || idx === currentBruteStep.j);
                  return (
                    <div key={item.id} className="ddh-array-slot">
                      <div className="ddh-array-pointer-row">
                        {isOuter && <span className="ddh-mini-pointer ddh-pointer-i">i</span>}
                        {isInner && <span className="ddh-mini-pointer ddh-pointer-j">j</span>}
                      </div>
                      <div
                        className={
                          'ddh-array-box' +
                          (isOuter ? ' ddh-box-current' : '') +
                          (isInner ? ' ddh-box-checking' : '') +
                          (isDoneBox ? ' ddh-box-done' : '') +
                          (isGold ? ' ddh-box-gold' : '') +
                          (isRed ? ' ddh-box-red' : '')
                        }
                      >
                        <div className="ddh-box-index">{idx}</div>
                        <div className="ddh-box-value">₹{item.price}</div>
                        <div className="ddh-box-label">{item.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {bruteHistory.length > 0 && (
                <div className="ddh-combo-log">
                  <div className="ddh-notebook-title">🧾 Combos checked</div>
                  <div className="ddh-notebook-entries">
                    {bruteHistory.map((h, idx) => (
                      <div
                        key={idx}
                        className={'ddh-combo-log-row' + (h.isMatch ? ' ddh-box-gold' : '')}
                      >
                        {MENU[h.i].name} + {MENU[h.j].name} = ₹{h.sum}
                        {h.isMatch ? ' ✅' : ' ❌'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!bruteOuterStarted && !bruteDone && (
              <div className="ddh-tooltip">
                Start here — click below to begin
                <button className="ddh-action-btn" onClick={startBrute}>
                  Start with box 0
                </button>
              </div>
            )}

            {bruteOuterStarted && currentBruteStep && !bruteDone && bruteFlashState === null && (
              <div className="ddh-tooltip">
                Check box {currentBruteStep.i} against box {currentBruteStep.j}:
                <button className="ddh-action-btn" onClick={checkBrutePair}>
                  {MENU[currentBruteStep.i].name} + {MENU[currentBruteStep.j].name}?
                </button>
              </div>
            )}

            {currentBruteStep && bruteFlashState && (
              <div className={'ddh-sum-banner ' + (bruteFlashState === 'match' ? 'ddh-sum-match' : 'ddh-sum-no-match')}>
                {MENU[currentBruteStep.i].price} + {MENU[currentBruteStep.j].price} = {currentBruteStep.sum}
                {bruteFlashState === 'match' ? ' ✅' : ' ❌'}
              </div>
            )}

            <Confetti active={bruteFlashState === 'match'} />

            {bruteDone && !showCode && (
              <button className="ddh-action-btn ddh-reveal-btn" onClick={openCode}>
                You solved it yourself! Now let me show you what this looks like in code →
              </button>
            )}
          </div>
        )}

        {/* ================= OPTIMAL FLOW ================= */}
        {activePath === 'optimal' && (
          <div className="ddh-flow">
            <div className="ddh-optimal-panels">
              <div className="ddh-array-row">
                {MENU.map((item, idx) => {
                  const isCurrent = currentOptStep && idx === currentOptStep.i;
                  const isMatchedSource = optFlashState === 'match' && currentOptStep && idx === currentOptStep.i;
                  const isMatchedTarget =
                    optFlashState === 'match' && currentOptStep && currentOptStep.foundIndex === idx;
                  const isDoneBox = idx < (currentOptStep ? currentOptStep.i : optDone ? MENU.length : -1);
                  return (
                    <div key={item.id} className="ddh-array-slot">
                      <div className="ddh-array-pointer-row">
                        {isCurrent && <span className="ddh-mini-pointer ddh-pointer-i">i</span>}
                        {isMatchedTarget && !isCurrent && (
                          <span className="ddh-mini-pointer ddh-pointer-found">✓</span>
                        )}
                      </div>
                      <div
                        className={
                          'ddh-array-box' +
                          (isCurrent ? ' ddh-box-current' : '') +
                          (isDoneBox ? ' ddh-box-done' : '') +
                          (isMatchedSource || isMatchedTarget ? ' ddh-box-gold' : '') +
                          (optFlashState === 'no-match' && isCurrent ? ' ddh-box-red' : '')
                        }
                      >
                        <div className="ddh-box-index">{idx}</div>
                        <div className="ddh-box-value">₹{item.price}</div>
                        <div className="ddh-box-label">{item.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ddh-notebook">
                <div className="ddh-notebook-title">📓 {CHAR_NAME}'s Notebook</div>
                <div className="ddh-notebook-entries">
                  {Object.keys(notebook).length === 0 && <div className="ddh-notebook-empty">Empty</div>}
                  {Object.entries(notebook).map(([price, idx]) => (
                    <div
                      key={price}
                      className={
                        'ddh-notebook-chip' +
                        (optFlashState === 'match' && currentOptStep && currentOptStep.foundIndex === Number(idx)
                          ? ' ddh-box-gold'
                          : '')
                      }
                    >
                      ₹{price} → {MENU[idx].name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {optStepIndex < 0 && !optDone && (
              <div className="ddh-tooltip">
                Walk through the items one at a time. For each one, ask: have I already seen its missing half?
                <button className="ddh-action-btn" onClick={startOptimal}>
                  Start with box 0
                </button>
              </div>
            )}

            {currentOptStep && optFlashState === null && !optDone && (
              <div className="ddh-tooltip">
                I need ₹{currentOptStep.complement} to complete a pair with {MENU[currentOptStep.i].name} (₹
                {MENU[currentOptStep.i].price}). Is ₹{currentOptStep.complement} in my notebook?
                <button className="ddh-action-btn" onClick={checkOptimalStep}>
                  Check notebook
                </button>
              </div>
            )}

            {currentOptStep && optFlashState && (
              <div className={'ddh-sum-banner ' + (optFlashState === 'match' ? 'ddh-sum-match' : 'ddh-sum-no-match')}>
                Need ₹{currentOptStep.complement} — {optFlashState === 'match' ? 'found it! ✅' : 'not there yet ❌'}
              </div>
            )}

            <Confetti active={optFlashState === 'match'} />

            {optDone && !showCode && (
              <button className="ddh-action-btn ddh-reveal-btn" onClick={openCode}>
                You solved it yourself! Now let me show you the code →
              </button>
            )}
          </div>
        )}

        {/* ---------- Comparison card once both paths are done ---------- */}
        {bothDone && !showCode && (
          <div className="ddh-comparison-card">
            <div>
              <strong>Normal way:</strong> checked {totalPairsBrute} pairs
            </div>
            <div>
              <strong>Optimal way:</strong> checked {totalItemsOptimal} items, once each
            </div>
          </div>
        )}
      </div>

      {/* ================= CODE REVEAL PANEL ================= */}
      {showCode && activePath === 'brute' && bruteHistory.length > 0 && (
        <CodePanel
          title="Brute Force — checking every pair"
          lines={BRUTE_CODE_LINES}
          mode="brute"
          history={bruteHistory}
          stepIndex={Math.min(traceCursor, bruteHistory.length - 1)}
          note={
            "That clicking-through-every-pair you just did? That's exactly what these two loops do — the developer world calls it Brute Force."
          }
          complexity={{ big: 'O(n²)', plain: 'checking every pair against every other pair' }}
          onNext={nextTraceStep}
          onPrev={prevTraceStep}
          canNext={traceCursor < maxTraceIndex}
          canPrev={traceCursor > 0}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onClose={() => {
            setShowCode(false);
            setIsPlaying(false);
          }}
        />
      )}

      {showCode && activePath === 'optimal' && optHistory.length > 0 && (
        <CodePanel
          title="Optimal — remembering what you've seen"
          lines={OPTIMAL_CODE_LINES}
          mode="optimal"
          history={optHistory}
          stepIndex={Math.min(traceCursor, optHistory.length - 1)}
          note={
            "That notebook you kept? The whole developer world calls it a Hash Map — remembering what you've already seen instead of re-checking everything."
          }
          complexity={{ big: 'O(n)', plain: 'one pass, one lookup per item' }}
          onNext={nextTraceStep}
          onPrev={prevTraceStep}
          canNext={traceCursor < maxTraceIndex}
          canPrev={traceCursor > 0}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onClose={() => {
            setShowCode(false);
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const STYLES = `
.ddh-root {
  position: relative;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(180deg, #fff7e6 0%, #ffe8cc 100%);
  border-radius: 16px;
  padding: 24px;
  min-height: 520px;
  overflow: hidden;
  color: #3a2a1a;
}
.ddh-mute-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  border: none;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 18px;
  cursor: pointer;
}
.ddh-scene { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.ddh-storefront {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.ddh-storefront-settled { opacity: 1; transform: translateX(0); }
.ddh-sign {
  font-size: 22px;
  font-weight: 700;
  background: #7a3e1d;
  color: #fff;
  padding: 8px 20px;
  border-radius: 10px;
}
.ddh-characters { display: flex; gap: 10px; font-size: 36px; }
.ddh-char { animation: ddh-bob 2s ease-in-out infinite; }
.ddh-char-2 { animation-delay: 0.3s; }
.ddh-char-3 { animation-delay: 0.6s; }
@keyframes ddh-bob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-4px);} }

.ddh-menu-board {
  background: #fffdf8;
  border: 2px solid #d8a15a;
  border-radius: 12px;
  padding: 12px 18px;
  min-width: 260px;
}
.ddh-menu-title { font-weight: 700; margin-bottom: 6px; text-align: center; }
.ddh-menu-list { display: flex; flex-direction: column; gap: 6px; }
.ddh-menu-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  padding: 4px 6px;
  border-radius: 6px;
}
.ddh-menu-item-shown { opacity: 1; transform: translateY(0); }
.ddh-price { font-weight: 700; color: #a65a1c; }

.ddh-bubble {
  background: #fff;
  border-radius: 14px;
  padding: 12px 18px;
  max-width: 420px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  text-align: center;
}
.ddh-bubble:after {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}

.ddh-help-btn, .ddh-choice-btn, .ddh-action-btn, .ddh-reveal-btn, .ddh-other-way-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #ff8c42;
  color: #fff;
  min-height: 44px;
}
.ddh-help-btn:hover, .ddh-choice-btn:hover, .ddh-action-btn:hover { background: #ff7a1f; }
.ddh-pulse { animation: ddh-pulse 1.6s ease-in-out infinite; }
@keyframes ddh-pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.03);} }

.ddh-choose-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.ddh-choose-subtitle { font-size: 14px; color: #6b5340; }
.ddh-choose-buttons { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.ddh-choice-optimal { background: #2a9d8f; }
.ddh-choice-optimal:hover { background: #22867a; }

.ddh-other-way-btn { background: #6b5340; }

.ddh-flow { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }

.ddh-array-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.ddh-array-slot { display: flex; flex-direction: column; align-items: center; }
.ddh-array-pointer-row { height: 22px; display: flex; align-items: flex-end; gap: 4px; }
.ddh-pointer-found { background: #ffb703; color: #3d2b00; }
.ddh-array-box {
  min-width: 76px;
  min-height: 76px;
  background: #fff;
  border: 2px solid #d8a15a;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
  text-align: center;
}
.ddh-box-index { font-size: 11px; color: #999; }
.ddh-box-value { font-weight: 700; font-size: 15px; }
.ddh-box-label { font-size: 10px; color: #6b5340; }
.ddh-box-current { border-color: #2a9d8f; box-shadow: 0 0 0 3px rgba(42,157,143,0.3); transform: scale(1.05); }
.ddh-box-checking {
  border-color: #ff8c42;
  border-width: 3px;
  box-shadow: 0 0 0 4px rgba(255,140,66,0.35);
  transform: scale(1.08);
  animation: ddh-checking-pulse 0.6s ease-in-out infinite;
}
@keyframes ddh-checking-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(255,140,66,0.35); }
  50% { box-shadow: 0 0 0 7px rgba(255,140,66,0.15); }
}
.ddh-box-done { opacity: 0.45; }
.ddh-box-gold { border-color: #ffd166; box-shadow: 0 0 0 4px rgba(255,209,102,0.5); background: #fff8e1; }
.ddh-box-red { animation: ddh-shake 0.35s ease; border-color: #e63946; }
@keyframes ddh-shake { 0%,100% { transform: translateX(0);} 25% { transform: translateX(-4px);} 75% { transform: translateX(4px);} }

.ddh-tooltip {
  background: #fff;
  border: 1px dashed #ff8c42;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  max-width: 420px;
}

.ddh-sum-banner {
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
}
.ddh-sum-match { background: #d9f7e3; color: #1b7a3d; }
.ddh-sum-no-match { background: #ffe1e1; color: #b3261e; }

.ddh-optimal-panels { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; width: 100%; }
.ddh-notebook {
  background: #fffdf3;
  border: 2px dashed #d8a15a;
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 180px;
}
.ddh-notebook-title { font-weight: 700; margin-bottom: 6px; }
.ddh-notebook-entries { display: flex; flex-direction: column; gap: 6px; }
.ddh-notebook-empty { color: #999; font-size: 13px; }
.ddh-notebook-chip {
  background: #fff;
  border: 1px solid #d8a15a;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
}

.ddh-combo-log {
  background: #fffdf3;
  border: 2px dashed #d8a15a;
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 220px;
  max-height: 240px;
  overflow-y: auto;
}
.ddh-combo-log-row {
  background: #fff;
  border: 1px solid #d8a15a;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  animation: ddh-combo-add 0.3s ease;
}
@keyframes ddh-combo-add { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: translateX(0); } }

.ddh-reveal-btn { background: #2a9d8f; }
.ddh-comparison-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.ddh-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ddh-confetti-piece {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 8px;
  animation-name: ddh-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}
@keyframes ddh-fall { to { transform: translateY(420px) rotate(360deg); opacity: 0; } }

.ddh-code-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.ddh-code-panel {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 12px;
  padding: 16px;
  width: min(560px, 92vw);
  max-height: 86vh;
  overflow-y: auto;
  animation: ddh-slide-up 0.3s ease;
}
@keyframes ddh-slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.ddh-code-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 10px; gap: 10px; }
.ddh-code-header-actions { display: flex; align-items: center; gap: 10px; }
.ddh-close-btn { background: none; border: none; color: #d4d4d4; font-size: 16px; cursor: pointer; }
.ddh-play-btn {
  background: #2a9d8f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  min-height: 32px;
}
.ddh-play-btn:hover { background: #22867a; }

.ddh-step-meter { font-size: 12px; color: #b8b8b8; margin-bottom: 10px; }
.ddh-step-track {
  margin-top: 4px;
  height: 5px;
  border-radius: 3px;
  background: #333;
  overflow: hidden;
}
.ddh-step-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a9d8f, #ffd166);
  transition: width 0.4s ease;
}

.ddh-var-strip { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.ddh-var-chip {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: baseline;
}
.ddh-var-label { color: #9a9a9a; }
.ddh-var-value { color: #ffd166; font-weight: 700; }
.ddh-var-chip-good { border-color: #3fb95f; }
.ddh-var-chip-good .ddh-var-value { color: #7be08a; }
.ddh-var-chip-bad { border-color: #b3453d; }
.ddh-var-chip-bad .ddh-var-value { color: #ff9b91; }
.ddh-var-chip-const { border-color: #6a8fd8; }
.ddh-var-chip-const .ddh-var-value { color: #9db8f0; }
.ddh-var-pop { animation: ddh-var-pop 0.3s ease; }
@keyframes ddh-var-pop { 0% { transform: scale(0.85); opacity: 0.3; } 100% { transform: scale(1); opacity: 1; } }

.ddh-code-block-wrap { position: relative; }
.ddh-code-pointer {
  position: absolute;
  left: -6px;
  top: 0;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd166;
  font-size: 12px;
  transition: transform 0.35s ease;
  pointer-events: none;
}
.ddh-code-trace { background: #2d2d2d; padding: 6px 10px; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
.ddh-code-block { font-family: 'Fira Code', monospace; font-size: 13px; line-height: 1.6; overflow-x: auto; padding-left: 16px; }
.ddh-code-line { padding: 2px 8px; border-radius: 4px; white-space: pre; transition: background-color 0.3s ease; }
.ddh-code-line-scope { background: rgba(86, 156, 214, 0.08); }
.ddh-code-line-active { background: rgba(255,209,102,0.28); animation: ddh-line-pulse 1.1s ease-in-out infinite; }
@keyframes ddh-line-pulse { 0%,100% { background-color: rgba(255,209,102,0.28); } 50% { background-color: rgba(255,209,102,0.48); } }

.ddh-mini-viz {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #171717;
  border-radius: 8px;
  padding: 10px;
  margin-top: 12px;
}
.ddh-mini-box {
  min-width: 58px;
  background: #262626;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 4px;
  text-align: center;
  color: #d4d4d4;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.ddh-mini-box .ddh-box-index { color: #888; }
.ddh-mini-box .ddh-box-label { color: #9a9a9a; }
.ddh-mini-box-active { box-shadow: 0 0 0 3px rgba(255,209,102,0.25); }
.ddh-mini-result { font-size: 13px; font-weight: 700; padding: 6px 10px; border-radius: 6px; }

.ddh-mini-viz-full { flex-direction: column; align-items: stretch; }
.ddh-mini-array-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ddh-mini-array-slot { display: flex; flex-direction: column; align-items: center; }
.ddh-mini-pointer-row { height: 18px; display: flex; align-items: flex-end; }
.ddh-mini-pointer {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 4px 4px 0 0;
  animation: ddh-pointer-bounce 0.9s ease-in-out infinite;
}
.ddh-pointer-i { background: #2a9d8f; color: #fff; }
.ddh-pointer-j { background: #ff8c42; color: #fff; }
@keyframes ddh-pointer-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.ddh-mini-notebook {
  background: #262626;
  border: 1px dashed #555;
  border-radius: 8px;
  padding: 6px 10px;
  min-width: 140px;
}
.ddh-mini-notebook .ddh-notebook-title { color: #d4d4d4; font-size: 12px; }
.ddh-mini-notebook .ddh-notebook-chip { background: #333; border-color: #555; color: #d4d4d4; }
.ddh-mini-notebook .ddh-notebook-empty { color: #777; }

.ddh-code-controls { display: flex; gap: 10px; margin-top: 12px; }
.ddh-code-controls button {
  background: #333;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  min-height: 44px;
}
.ddh-code-controls button:disabled { opacity: 0.4; cursor: not-allowed; }
.ddh-code-note { margin-top: 10px; font-size: 13px; color: #cfcfcf; }
.ddh-complexity-badge {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #2d2d2d;
  padding: 8px 12px;
  border-radius: 8px;
}
.ddh-complexity-badge strong { color: #ffd166; font-size: 16px; }

@media (max-width: 640px) {
  .ddh-optimal-panels { flex-direction: column; align-items: center; }
  .ddh-code-overlay { align-items: flex-end; }
  .ddh-code-panel { width: 100%; border-radius: 12px 12px 0 0; max-height: 92vh; }
}

@media (prefers-reduced-motion: reduce) {
  .ddh-storefront, .ddh-menu-item, .ddh-box-red, .ddh-pulse, .ddh-char,
  .ddh-code-line-active, .ddh-var-pop, .ddh-combo-log-row, .ddh-mini-pointer,
  .ddh-box-checking {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
  .ddh-confetti-piece { display: none; }
  .ddh-code-pointer { transition: none !important; }
}
`;
