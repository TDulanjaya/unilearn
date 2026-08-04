"use client";

import { useState, useRef } from "react";
import { Course, MCQQuestion, StructuredQA } from "@/types/course";

interface CourseAiTabProps {
  course: Course;
  mcqBank: MCQQuestion[];
  structuredBank: StructuredQA[];
}

export default function CourseAiTab({
  course,
  mcqBank,
  structuredBank,
}: CourseAiTabProps) {
  const [studyMode, setStudyMode] = useState<"mcq" | "structured">("mcq");
  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "done">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});

  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: `Hello Nadeesha! I'm your AI Study Assistant for ${course.code}. Ask me anything about ${course.title} or request a quiz!`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const startQuiz = () => {
    setQuizState("loading");
    setTimeout(() => {
      setQuizState("active");
      setCurrentIdx(0);
      setSelectedOpt(null);
      setScore(0);
    }, 800);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === mcqBank[currentIdx]?.correctIndex) setScore((p) => p + 1);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < mcqBank.length) {
      setCurrentIdx((p) => p + 1);
      setSelectedOpt(null);
    } else setQuizState("done");
  };

  const toggleReveal = (id: number) =>
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Great question about "${userMsg}"! In ${course.title}, key concepts include process models, quality frameworks, and iterative improvement methodologies.`,
        },
      ]);
    }, 600);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-extrabold text-xl text-[var(--on-surface)] flex items-center gap-2">
          <i className="ti ti-sparkles text-[var(--tertiary)]"></i>
          AI Study Assistant — {course.code} {course.title}
        </h2>
        <p className="text-xs text-[var(--on-surface-variant)] mt-1">
          Interactive study tools and real-time AI course chat scoped to this course.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        
        <div className="space-y-4">
          
          <div className="flex p-1.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] gap-1.5">
            <button
              onClick={() => setStudyMode("mcq")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                studyMode === "mcq"
                  ? "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] shadow-sm border border-[var(--outline-variant)]"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              <i className="ti ti-brain text-base text-[var(--tertiary)]"></i> MCQ Practice Engine
            </button>
            <button
              onClick={() => setStudyMode("structured")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                studyMode === "structured"
                  ? "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] shadow-sm border border-[var(--outline-variant)]"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              <i className="ti ti-help-circle text-base text-[var(--tertiary)]"></i> Structured Q&A Bank
            </button>
          </div>

          
          {studyMode === "mcq" && (
            <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] min-h-[515px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--outline-variant)]">
                  <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                    <i className="ti ti-brain text-[var(--tertiary)] text-xl"></i> MCQ Practice Engine
                  </h3>
                  {quizState === "active" && (
                    <span className="badge badge-accent">
                      Q {currentIdx + 1} of {mcqBank.length}
                    </span>
                  )}
                </div>

                {quizState === "idle" && (
                  <div className="text-center py-12">
                    <i className="ti ti-sparkles text-5xl text-[var(--tertiary)] block mb-3 animate-pulse"></i>
                    <p className="font-semibold text-base mb-1 text-[var(--on-surface)]">
                      Generate Customized Practice Quiz
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mb-6 max-w-xs mx-auto">
                      Test your knowledge on {course.code} {course.title} with AI-generated interactive MCQs.
                    </p>
                    <button onClick={startQuiz} className="btn-primary shadow-md">
                      <i className="ti ti-player-play mr-1"></i> Start Quiz
                    </button>
                  </div>
                )}
                {quizState === "loading" && (
                  <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-semibold text-[var(--on-surface-variant)]">
                      Generating AI Quiz Questions...
                    </p>
                  </div>
                )}
                {quizState === "active" && mcqBank[currentIdx] && (
                  <div>
                    <p className="text-sm font-semibold mb-4 text-[var(--on-surface)]">
                      {mcqBank[currentIdx].question}
                    </p>
                    <div className="space-y-2.5 mb-5">
                      {mcqBank[currentIdx].options.map((opt, i) => {
                        let btnClass =
                          "w-full text-left p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors";
                        if (selectedOpt !== null) {
                          if (i === mcqBank[currentIdx].correctIndex)
                            btnClass =
                              "w-full text-left p-3.5 rounded-xl border border-[var(--secondary)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-bold text-sm";
                          else if (i === selectedOpt)
                            btnClass =
                              "w-full text-left p-3.5 rounded-xl border border-[var(--error)] bg-[var(--error-container)] text-[var(--on-error-container)] font-bold text-sm";
                        }
                        return (
                          <button
                            key={i}
                            disabled={selectedOpt !== null}
                            onClick={() => handleSelectOption(i)}
                            className={btnClass}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {selectedOpt !== null && (
                      <button
                        onClick={handleNextQuestion}
                        className="btn-primary w-full justify-center shadow-md"
                      >
                        {currentIdx + 1 < mcqBank.length ? "Next Question" : "Finish Quiz"}
                      </button>
                    )}
                  </div>
                )}
                {quizState === "done" && (
                  <div className="text-center py-10">
                    <i className="ti ti-trophy text-5xl text-[var(--secondary)] block mb-3"></i>
                    <h4 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                      Quiz Completed!
                    </h4>
                    <p className="text-sm text-[var(--on-surface-variant)] mb-6">
                      You scored{" "}
                      <b className="text-[var(--on-surface)] text-base">
                        {score} / {mcqBank.length}
                      </b>
                    </p>
                    <button onClick={startQuiz} className="btn-secondary text-xs">
                      Try Another Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          
          {studyMode === "structured" && (
            <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] min-h-[515px]">
              <h3 className="font-display font-bold text-lg mb-2 text-[var(--on-surface)] flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
                <i className="ti ti-help-circle text-[var(--tertiary)] text-xl"></i> Structured Q&A Bank
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Practice writing structured exam responses. Type your answer and click <b>Check & Compare</b> to compare with the model solution.
              </p>
              <div className="space-y-5">
                {structuredBank.map((item) => {
                  const isRevealed = revealedAnswers[item.id];
                  const typed = userAnswers[item.id] || "";
                  const isChecked = checkedAnswers[item.id];

                  return (
                    <div
                      key={item.id}
                      className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container-low)] space-y-3"
                    >
                      <p className="text-sm font-bold text-[var(--on-surface)]">
                        {item.question}
                      </p>

                      
                      <div>
                        <textarea
                          rows={2}
                          value={typed}
                          onChange={(e) =>
                            setUserAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Type your answer here to test yourself..."
                          className="w-full text-xs p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:border-[var(--tertiary)] focus:outline-none transition-colors"
                        />
                      </div>

                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCheckedAnswers((prev) => ({ ...prev, [item.id]: true }));
                            setRevealedAnswers((prev) => ({ ...prev, [item.id]: true }));
                          }}
                          className="btn-primary text-xs !py-1.5 flex items-center gap-1"
                        >
                          <i className="ti ti-sparkles text-sm"></i> Check & Compare
                        </button>
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="btn-secondary text-xs !py-1.5 flex items-center gap-1"
                        >
                          <i className={`ti ${isRevealed ? "ti-eye-off" : "ti-eye"} text-sm`}></i>{" "}
                          {isRevealed ? "Hide Answer" : "Reveal Model Answer"}
                        </button>
                      </div>

                      
                      {isRevealed && (
                        <div className="space-y-2.5 pt-2 border-t border-[var(--outline-variant)]">
                          {isChecked && typed.trim() && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                              <p className="font-bold flex items-center gap-1">
                                <i className="ti ti-[ti-checks] text-sm"></i> Response Evaluation:
                              </p>
                              <p className="text-[11px] leading-relaxed">
                                Great effort! Your answer covers key concepts. Review the official model answer below for full rubric details.
                              </p>
                            </div>
                          )}

                          {typed.trim() && (
                            <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-3 text-xs text-[var(--on-surface-variant)]">
                              <p className="font-bold text-[var(--on-surface)] mb-1">
                                Your Response:
                              </p>
                              <p className="italic">{typed}</p>
                            </div>
                          )}

                          <div className="bg-[var(--surface-container-lowest)] border border-[var(--tertiary)]/30 rounded-xl p-3.5 text-xs text-[var(--on-surface)] space-y-1">
                            <p className="font-bold text-[var(--tertiary)] flex items-center gap-1">
                              <i className="ti ti-check text-sm"></i> Official Model Solution:
                            </p>
                            <p className="leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        
        <div className="card p-6 flex flex-col h-[575px] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)] text-[var(--on-surface)]">
            <i className="ti ti-messages text-[var(--tertiary)] text-xl"></i> Course AI Tutor Chat
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.sender === "user" ? "justify-end" : ""
                }`}
              >
                {m.sender === "ai" && <div className="avatar w-7 h-7 text-[10px] shrink-0">AI</div>}
                <div
                  className={`p-3 rounded-xl text-xs max-w-sm ${
                    m.sender === "user"
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          <form
            onSubmit={handleSendChat}
            className="flex items-center gap-2 pt-3 border-t border-[var(--outline-variant)]"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask about ${course.code}...`}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            />
            <button type="submit" className="btn-primary">
              <i className="ti ti-send"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
