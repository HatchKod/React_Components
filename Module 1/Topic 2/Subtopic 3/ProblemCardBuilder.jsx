import { useState, useEffect } from "react";

const STEPS = [
  {
    id: 1,
    question: "What is the business called, and what kind of business is it?",
    placeholder:
      "e.g. Sai Krishna Tiffin Center — a small breakfast and tiffin shop near the college gate",
    type: "text",
  },
  {
    id: 2,
    question:
      "What did you see them doing manually — the thing that gave you the idea?",
    placeholder:
      "e.g. The owner writes down every order on small paper chits and keeps them in a box near the till",
    type: "textarea",
  },
  {
    id: 3,
    question:
      "What problem does this manual way cause? What did they tell you, or what did you notice?",
    placeholder:
      "e.g. Sometimes chits get lost, orders get mixed up during rush hour, and at the end of the day he can't tell how much he actually sold",
    type: "textarea",
  },
  {
    id: 4,
    question:
      "When you asked if an app would help — what did they say? What do you think would actually help them?",
    placeholder:
      "e.g. He said it would be great if there was a simple way to take orders on a phone or tablet so nothing gets lost, and he can see what sold at the end of the day",
    type: "textarea",
  },
  {
    id: 5,
    question: "Now — in ONE sentence, describe what you are going to build for them.",
    placeholder:
      "e.g. An app where the tiffin center can take and track orders digitally so nothing gets lost and they can see daily sales",
    type: "textarea",
  },
];

const SECTION_LABELS = [
  "Business",
  "What they currently do",
  "The problem this causes",
  "What would help",
];

export default function ProblemCardBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({ 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [view, setView] = useState("builder"); // "builder" | "review" | "submitted"
  const [animating, setAnimating] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [revealNote, setRevealNote] = useState(false);
  const [noteOpacity, setNoteOpacity] = useState(0);

  useEffect(() => {
    if (view === "review") {
      setTimeout(() => {
        setRevealNote(true);
        setTimeout(() => setNoteOpacity(1), 50);
      }, 800);
    }
  }, [view]);

  function wordCount(text) {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  }

  function goToStep(step) {
    setOpacity(0);
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setOpacity(1);
      setAnimating(false);
    }, 220);
  }

  function handleNext() {
    if (currentStep < 5) {
      goToStep(currentStep + 1);
    } else {
      setOpacity(0);
      setTimeout(() => {
        setView("review");
        setOpacity(1);
      }, 220);
    }
  }

  function handleEdit(step) {
    setOpacity(0);
    setTimeout(() => {
      setCurrentStep(step);
      setView("builder");
      setOpacity(1);
    }, 220);
  }

  function handleSubmit() {
    setOpacity(0);
    setTimeout(() => {
      setView("submitted");
      setOpacity(1);
    }, 220);
  }

  const styles = {
    wrapper: {
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      background: "linear-gradient(135deg, #fdf6ec 0%, #fef9f3 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "24px 16px 60px",
      boxSizing: "border-box",
    },
    container: {
      width: "100%",
      maxWidth: "620px",
      opacity: opacity,
      transition: "opacity 0.22s ease",
    },
    // ── Builder ──
    builderCard: {
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 4px 32px rgba(180,120,40,0.10), 0 1px 4px rgba(0,0,0,0.06)",
      padding: "36px 32px 32px",
      marginTop: "0",
    },
    heading: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#1a1a1a",
      margin: "0 0 6px",
      lineHeight: "1.3",
    },
    subtext: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0 0 28px",
      lineHeight: "1.6",
    },
    progressWrap: {
      marginBottom: "28px",
    },
    progressLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#d97706",
      marginBottom: "8px",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },
    progressTrack: {
      height: "5px",
      background: "#f3e8d0",
      borderRadius: "999px",
      overflow: "hidden",
    },
    progressBar: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      background: "linear-gradient(90deg, #f59e0b, #d97706)",
      borderRadius: "999px",
      transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
    }),
    stepQuestion: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px",
      lineHeight: "1.5",
    },
    input: {
      width: "100%",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      padding: "14px 16px",
      fontSize: "15px",
      color: "#111827",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "border-color 0.18s",
      resize: "vertical",
    },
    hint: {
      fontSize: "12.5px",
      color: "#9ca3af",
      fontStyle: "italic",
      marginTop: "8px",
      lineHeight: "1.5",
    },
    wordCounter: {
      fontSize: "12px",
      color: "#d97706",
      marginTop: "6px",
      fontWeight: "500",
    },
    nextBtn: (disabled) => ({
      marginTop: "24px",
      width: "100%",
      padding: "14px",
      background: disabled
        ? "#e5e7eb"
        : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: disabled ? "#9ca3af" : "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background 0.2s, transform 0.1s",
      letterSpacing: "0.3px",
    }),
    generateBtn: {
      marginTop: "28px",
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      letterSpacing: "0.3px",
    },
    // ── Review ──
    reviewOuter: {
      marginTop: "0",
    },
    reviewHeading: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1a1a1a",
      margin: "0 0 6px",
    },
    reviewSubtext: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0 0 28px",
      lineHeight: "1.6",
    },
    problemCard: {
      background: "#ffffff",
      border: "1.5px solid #e5e7eb",
      borderRadius: "16px",
      boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
      overflow: "hidden",
      marginBottom: "24px",
    },
    cardHeader: {
      background: "#1f2937",
      padding: "20px 28px 16px",
    },
    cardTitle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#f9fafb",
      letterSpacing: "2.5px",
      textTransform: "uppercase",
      margin: "0 0 4px",
    },
    cardSubtitle: {
      fontSize: "12px",
      color: "#9ca3af",
      margin: "0",
    },
    cardBody: {
      padding: "0 28px 8px",
    },
    cardSection: {
      borderBottom: "1px solid #f3f4f6",
      padding: "18px 0 14px",
    },
    cardSectionLast: {
      padding: "18px 0 14px",
    },
    cardLabel: {
      fontSize: "10.5px",
      fontWeight: "700",
      color: "#9ca3af",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      marginBottom: "6px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    editLink: {
      fontSize: "11px",
      color: "#d97706",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "underline",
      letterSpacing: "0",
      textTransform: "none",
    },
    cardValue: {
      fontSize: "14.5px",
      color: "#1f2937",
      lineHeight: "1.7",
      whiteSpace: "pre-wrap",
    },
    statementBox: {
      background: "#fffbeb",
      margin: "0 28px 28px",
      borderRadius: "12px",
      padding: "20px 22px",
      border: "1.5px solid #fde68a",
    },
    statementLabel: {
      fontSize: "10.5px",
      fontWeight: "700",
      color: "#b45309",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statementText: {
      fontSize: "16px",
      color: "#1f2937",
      fontWeight: "600",
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
    },
    revealNote: (noteOpacity) => ({
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: "12px",
      padding: "18px 22px",
      marginBottom: "24px",
      fontSize: "14px",
      color: "#166534",
      lineHeight: "1.7",
      opacity: noteOpacity,
      transition: "opacity 1.2s ease",
    }),
    submitBtn: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      letterSpacing: "0.3px",
    },
    // ── Submitted ──
    submittedCard: {
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 4px 32px rgba(37,99,235,0.10)",
      padding: "48px 32px 44px",
      textAlign: "center",
    },
    submittedIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      display: "block",
    },
    submittedTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "20px",
    },
    submittedBody: {
      fontSize: "15px",
      color: "#374151",
      lineHeight: "1.8",
      textAlign: "left",
    },
    submittedHighlight: {
      background: "#eff6ff",
      borderRadius: "10px",
      padding: "16px 20px",
      marginTop: "24px",
      fontSize: "15px",
      color: "#1e40af",
      fontWeight: "600",
      lineHeight: "1.6",
    },
  };

  const step = STEPS[currentStep - 1];
  const pct = (currentStep / 5) * 100;
  const currentAnswer = answers[currentStep] || "";
  const isNextDisabled = currentAnswer.trim() === "";

  // ── SUBMITTED ──
  if (view === "submitted") {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.submittedCard}>
            <span style={styles.submittedIcon}>🎯</span>
            <div style={styles.submittedTitle}>Your Problem Card is submitted.</div>
            <div style={styles.submittedBody}>
              <p style={{ marginTop: 0 }}>
                Your mentor will read this and either approve it, or come back
                with one quick question to help you sharpen it.
              </p>
              <p>
                Either way — you've done the hardest part. You found a real
                problem, talked to a real person, and wrote it down clearly.
              </p>
            </div>
            <div style={styles.submittedHighlight}>
              Next — we plan exactly what you'll build.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── REVIEW ──
  if (view === "review") {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, opacity }}>
          <div style={styles.reviewOuter}>
            <h1 style={styles.reviewHeading}>Here is your Problem Card 🎉</h1>
            <p style={styles.reviewSubtext}>
              This is the page your mentor will read. Review it — you can go
              back and edit any answer before submitting.
            </p>

            <div style={styles.problemCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Problem Card</div>
                <div style={styles.cardSubtitle}>
                  Friendly Neighbourhood Developer Internship — Module 0
                </div>
              </div>

              <div style={styles.cardBody}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={i < 3 ? styles.cardSection : styles.cardSectionLast}
                  >
                    <div style={styles.cardLabel}>
                      <span>{SECTION_LABELS[i]}</span>
                      <span
                        style={styles.editLink}
                        onClick={() => handleEdit(i + 1)}
                      >
                        Edit
                      </span>
                    </div>
                    <div style={styles.cardValue}>{answers[i + 1]}</div>
                  </div>
                ))}
              </div>

              <div style={styles.statementBox}>
                <div style={styles.statementLabel}>
                  <span>Problem Statement</span>
                  <span
                    style={{ ...styles.editLink, color: "#b45309" }}
                    onClick={() => handleEdit(5)}
                  >
                    Edit
                  </span>
                </div>
                <div style={styles.statementText}>{answers[5]}</div>
              </div>
            </div>

            {revealNote && (
              <div style={styles.revealNote(noteOpacity)}>
                This page is called a Problem Statement. Every app ever built —
                Swiggy, PhonePe, the one you're about to make — started with a
                page exactly like this. You just wrote yours.
              </div>
            )}

            <button style={styles.submitBtn} onClick={handleSubmit}>
              Submit my Problem Card to my mentor →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BUILDER ──
  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.container }}>
        <div style={styles.builderCard}>
          <h1 style={styles.heading}>
            Let's turn your conversation into your Problem Card 📋
          </h1>
          <p style={styles.subtext}>
            Five short questions. Answer based on what you actually saw and
            heard this week. No need to make it sound fancy — just real.
          </p>

          <div style={styles.progressWrap}>
            <div style={styles.progressLabel}>
              Step {currentStep} of 5
            </div>
            <div style={styles.progressTrack}>
              <div style={styles.progressBar(pct)} />
            </div>
          </div>

          <div style={{ opacity, transition: "opacity 0.22s ease" }}>
            <div style={styles.stepQuestion}>{step.question}</div>

            {step.type === "text" ? (
              <input
                style={styles.input}
                type="text"
                placeholder={step.placeholder}
                value={currentAnswer}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentStep]: e.target.value,
                  }))
                }
                onFocus={(e) =>
                  (e.target.style.borderColor = "#f59e0b")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#e5e7eb")
                }
              />
            ) : (
              <textarea
                style={{ ...styles.input, minHeight: "90px" }}
                placeholder={step.placeholder}
                value={currentAnswer}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentStep]: e.target.value,
                  }))
                }
                onFocus={(e) =>
                  (e.target.style.borderColor = "#f59e0b")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#e5e7eb")
                }
              />
            )}

            <div style={styles.hint}>{step.placeholder}</div>

            {currentStep === 5 && (
              <div style={styles.wordCounter}>
                {wordCount(currentAnswer)} word
                {wordCount(currentAnswer) !== 1 ? "s" : ""} — Keep it to one
                or two sentences. Simple is perfect.
              </div>
            )}

            {currentStep < 5 ? (
              <button
                style={styles.nextBtn(isNextDisabled)}
                disabled={isNextDisabled}
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <button
                style={
                  isNextDisabled
                    ? {
                        ...styles.generateBtn,
                        background: "#e5e7eb",
                        color: "#9ca3af",
                        cursor: "not-allowed",
                      }
                    : styles.generateBtn
                }
                disabled={isNextDisabled}
                onClick={handleNext}
              >
                Generate my Problem Card →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
