"use client";
import { useState, useRef, useEffect } from "react";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const MCQ_BANK: MCQQuestion[] = [
  {
    id: 1,
    question: "What is the primary goal of black-box testing?",
    options: [
      "To test internal implementation logic",
      "To verify functionality against software requirements",
      "To measure code coverage metrics",
      "To optimize memory usage"
    ],
    correctIndex: 1
  },
  {
    id: 2,
    question: "Which SDLC model incorporates risk analysis in every iteration?",
    options: ["Waterfall Model", "V-Model", "Spiral Model", "Big Bang Model"],
    correctIndex: 2
  },
  {
    id: 3,
    question: "In Agile methodology, what is a Sprint Backlog?",
    options: [
      "List of all product features requested by customer",
      "Set of tasks selected for the current iteration",
      "Log of all fixed software bugs",
      "Documentation of software architecture"
    ],
    correctIndex: 1
  }
];

const STRUCTURED_BANK = [
  {
    id: 1,
    question: "Explain the difference between Verification and Validation in software quality assurance.",
    answer: "Verification checks whether software is built according to specified requirements ('Are we building the product right?'). Validation checks whether software fulfills customer needs ('Are we building the right product?')."
  },
  {
    id: 2,
    question: "Define Code Coverage and state two common types.",
    answer: "Code Coverage measures the degree to which source code is executed when a test suite runs. Two common types are Statement Coverage and Branch/Decision Coverage."
  }
];

export default function AiAssistantPage() {
  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "done">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello Nadeesha! I'm your AI Study Assistant for SE308.3. Ask me anything about Software Process Management or request a quiz!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    if (idx === MCQ_BANK[currentIdx].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < MCQ_BANK.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setQuizState("done");
    }
  };

  const toggleReveal = (id: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          text: `Great question about "${userMsg}"! In software process management, key standards like ISO/IEC 12207 and CMMI define structured workflows for project monitoring and defect tracking.`
        }
      ]);
    }, 600);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            AI Study Assistant
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Interactive MCQ quiz engine, structured Q&A, and AI course chat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  <i className="ti ti-brain text-[var(--tertiary)] text-xl"></i> MCQ Practice Engine
                </h3>
                {quizState === "active" && (
                  <span className="badge badge-accent">Q {currentIdx + 1} of {MCQ_BANK.length}</span>
                )}
              </div>

              {quizState === "idle" && (
                <div className="text-center py-8">
                  <i className="ti ti-sparkles text-4xl text-[var(--tertiary)] block mb-3"></i>
                  <p className="font-semibold text-base mb-1 text-[var(--on-surface)]">Generate Customized Practice Quiz</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mb-5">Test your knowledge on SE308.3 Software Process Management</p>
                  <button onClick={startQuiz} className="btn-primary shadow-md">Start Quiz</button>
                </div>
              )}

              {quizState === "loading" && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-semibold text-[var(--on-surface-variant)]">Generating AI Quiz Questions...</p>
                </div>
              )}

              {quizState === "active" && (
                <div>
                  <p className="text-sm font-semibold mb-4 text-[var(--on-surface)]">{MCQ_BANK[currentIdx].question}</p>
                  <div className="space-y-2.5 mb-5">
                    {MCQ_BANK[currentIdx].options.map((opt, i) => {
                      let btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors";
                      if (selectedOpt !== null) {
                        if (i === MCQ_BANK[currentIdx].correctIndex) {
                          btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--secondary)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-bold text-sm";
                        } else if (i === selectedOpt) {
                          btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--error)] bg-[var(--error-container)] text-[var(--on-error-container)] font-bold text-sm";
                        }
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
                    <button onClick={handleNextQuestion} className="btn-primary w-full justify-center shadow-md">
                      {currentIdx + 1 < MCQ_BANK.length ? "Next Question" : "Finish Quiz"}
                    </button>
                  )}
                </div>
              )}

              {quizState === "done" && (
                <div className="text-center py-6">
                  <i className="ti ti-trophy text-4xl text-[var(--secondary)] block mb-2"></i>
                  <h4 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">Quiz Completed!</h4>
                  <p className="text-sm text-[var(--on-surface-variant)] mb-5">You scored <b className="text-[var(--on-surface)]">{score} / {MCQ_BANK.length}</b></p>
                  <button onClick={startQuiz} className="btn-secondary text-xs">Try Another Quiz</button>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4 text-[var(--on-surface)] flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
                <i className="ti ti-help-circle text-[var(--tertiary)] text-xl"></i> Structured Q&A Bank
              </h3>
              <div className="space-y-3">
                {STRUCTURED_BANK.map((item) => {
                  const isRevealed = !!revealedAnswers[item.id];
                  return (
                    <div key={item.id} className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container-low)]">
                      <p className="text-sm font-semibold mb-2 text-[var(--on-surface)]">{item.question}</p>
                      {isRevealed ? (
                        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-3 text-xs text-[var(--on-surface)] mt-2">
                          <p className="font-bold mb-1 text-[var(--tertiary)]">Sample Answer:</p>
                          {item.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="btn-secondary text-xs !py-1"
                        >
                          Show Answer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col h-[600px]">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)] text-[var(--on-surface)]">
              <i className="ti ti-messages text-[var(--tertiary)] text-xl"></i> Course AI Tutor Chat
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.sender === "user" ? "justify-end" : ""}`}
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

            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI tutor a question..."
                className="flex-1"
              />
              <button type="submit" className="btn-primary">
                <i className="ti ti-send"></i>
              </button>
            </form>
          </div>
        </div>
      </main>
  );
}
