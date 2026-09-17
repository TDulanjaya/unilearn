"use client";

import { useState, useRef, useEffect } from "react";
import { Course, MCQQuestion, StructuredQA } from "@/types/course";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CourseAiTabProps {
  course: Course;
  offeringId?: number;
  materialsCount?: number;
  resourcesCount?: number;
  mcqBank?: MCQQuestion[];
  structuredBank?: StructuredQA[];
}

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

interface QuizQuestion {
  questionId: number;
  orderNo: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer?: string;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  answerRevealed?: boolean;
}

export default function CourseAiTab({
  course,
  offeringId = 1,
  materialsCount = 0,
  resourcesCount = 0,
  mcqBank = [],
  structuredBank = [],
}: CourseAiTabProps) {
  const { user } = useAuth();

  const [studyMode, setStudyMode] = useState<"mcq" | "structured">("mcq");
  const [sourceScope, setSourceScope] = useState<"full_course" | "ongoing_topics">("full_course");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Quiz state
  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "done">("idle");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [structuredInputs, setStructuredInputs] = useState<Record<number, string>>({});
  const [revealedStructured, setRevealedStructured] = useState<Record<number, boolean>>({});
  const [quizError, setQuizError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount or when offeringId changes
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      if (!offeringId) return;
      setIsLoadingHistory(true);
      try {
        const history = await api.get<any[]>(`/api/v1/ai/chat?offeringId=${offeringId}`);
        if (isMounted) {
          if (Array.isArray(history) && history.length > 0) {
            setMessages(
              history.map((m) => ({
                id: m.messageId,
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              }))
            );
          } else {
            setMessages([
              {
                role: "assistant",
                content: `Hello ${user?.fullName ? user.fullName.split(" ")[0] : "there"}! I am your AI Study Assistant for ${course.code} (${course.title}). I can answer questions and generate quizzes using official lecturer course materials and your personal study resources!`,
              },
            ]);
          }
        }
      } catch {
        if (isMounted) {
          setMessages([
            {
              role: "assistant",
              content: `Hello! I am your AI Study Assistant for ${course.code}. Ask me anything about ${course.title} or request a quiz!`,
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [offeringId, course.code, course.title, user?.fullName]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSendingChat]);

  // Handle send chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userText = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsSendingChat(true);

    try {
      const res = await api.post<any>("/api/v1/ai/chat", {
        offeringId: offeringId,
        content: userText,
        role: "user",
      });

      if (res && res.content) {
        setMessages((prev) => [...prev, { id: res.messageId, role: "assistant", content: res.content }]);
      } else {
        throw new Error("No response content from AI");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't complete that request: ${err.message || "Network error"}. Please make sure you have internet access and the AI model is ready.`,
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear your AI chat history for this course?")) return;
    try {
      await api.delete(`/api/v1/ai/chat?offeringId=${offeringId}`);
      setMessages([
        {
          role: "assistant",
          content: `Chat history cleared. What would you like to study today in ${course.code}?`,
        },
      ]);
    } catch (err: any) {
      alert("Failed to clear chat: " + err.message);
    }
  };

  // Parse options helper
  const parseOptions = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  // Start AI Quiz session
  const startQuiz = async () => {
    setQuizState("loading");
    setQuizError(null);
    setSelectedOpt(null);
    setCurrentIdx(0);
    setScore(0);

    try {
      const res = await api.post<any>("/api/v1/ai/quiz", {
        offeringId: offeringId,
        questionType: studyMode,
        questionCount: questionCount,
        sourceScope: sourceScope,
      });

      if (res && res.questions && res.questions.length > 0) {
        const mappedQuestions: QuizQuestion[] = res.questions.map((q: any) => ({
          questionId: q.questionId,
          orderNo: q.orderNo,
          questionText: q.questionText,
          questionType: q.questionType,
          options: parseOptions(q.options),
          correctAnswer: q.correctAnswer,
          studentAnswer: q.studentAnswer,
          isCorrect: q.isCorrect,
          answerRevealed: q.answerRevealed,
        }));

        setSessionId(res.sessionId);
        setQuestions(mappedQuestions);
        setQuizState("active");
      } else {
        throw new Error("No quiz questions were returned by AI.");
      }
    } catch (err: any) {
      console.warn("API quiz generation failed, falling back to local bank:", err);
      setQuizError(err.message || "Failed to generate AI quiz");
      // Fallback to local mock banks so student isn't blocked
      if (studyMode === "mcq" && mcqBank.length > 0) {
        setQuestions(
          mcqBank.slice(0, questionCount).map((m, i) => ({
            questionId: i + 1,
            orderNo: i + 1,
            questionText: m.question,
            questionType: "mcq",
            options: m.options,
            correctAnswer: m.options[m.correctIndex],
            isCorrect: null,
            answerRevealed: false,
          }))
        );
        setQuizState("active");
      } else if (studyMode === "structured" && structuredBank.length > 0) {
        setQuestions(
          structuredBank.slice(0, questionCount).map((s, i) => ({
            questionId: s.id,
            orderNo: i + 1,
            questionText: s.question,
            questionType: "structured",
            options: [],
            correctAnswer: s.answer,
            isCorrect: null,
            answerRevealed: false,
          }))
        );
        setQuizState("active");
      } else {
        setQuizState("idle");
      }
    }
  };

  // Submit MCQ Answer
  const handleSelectOption = async (opt: string) => {
    if (selectedOpt !== null || isSubmittingAnswer) return;
    setSelectedOpt(opt);
    setIsSubmittingAnswer(true);

    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    try {
      if (sessionId) {
        const res = await api.post<any>(`/api/v1/ai/quiz/${currentQ.questionId}/answer`, {
          studentAnswer: opt,
        });

        const isCorrect = res.isCorrect ?? (opt.trim().toLowerCase() === currentQ.correctAnswer?.trim().toLowerCase());
        if (isCorrect) setScore((p) => p + 1);

        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === currentIdx
              ? {
                  ...q,
                  studentAnswer: opt,
                  isCorrect: isCorrect,
                  correctAnswer: res.correctAnswer || q.correctAnswer,
                  answerRevealed: true,
                }
              : q
          )
        );
      } else {
        // Fallback local grading
        const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer?.trim().toLowerCase();
        if (isCorrect) setScore((p) => p + 1);
        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === currentIdx
              ? { ...q, studentAnswer: opt, isCorrect, answerRevealed: true }
              : q
          )
        );
      }
    } catch (err: any) {
      console.error("Failed to submit answer:", err);
      const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer?.trim().toLowerCase();
      if (isCorrect) setScore((p) => p + 1);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((p) => p + 1);
      setSelectedOpt(null);
    } else {
      setQuizState("done");
    }
  };

  // Submit Structured Question Answer
  const handleSubmitStructured = async (qId: number) => {
    const text = structuredInputs[qId] || "";
    setRevealedStructured((prev) => ({ ...prev, [qId]: true }));

    if (sessionId && text.trim()) {
      try {
        await api.post(`/api/v1/ai/quiz/${qId}/answer`, {
          studentAnswer: text,
        });
      } catch (err) {
        console.warn("Could not save structured answer on server:", err);
      }
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div>
      {/* Header & Grounding Context Bar */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl text-[var(--on-surface)] flex items-center gap-2">
            <i className="ti ti-sparkles text-[var(--tertiary)]"></i>
            AI Study Assistant — {course.code} {course.title}
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Grounded educational assistant powered by Google Gemini AI with live course context.
          </p>
        </div>

        {/* Grounding Source Badge */}
        <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[var(--on-surface-variant)]">
            Grounding Sources:{" "}
            <strong className="text-[var(--on-surface)]">
              {materialsCount} Lecture {materialsCount === 1 ? "File" : "Files"}
            </strong>{" "}
            +{" "}
            <strong className="text-[var(--on-surface)]">
              {resourcesCount} Personal {resourcesCount === 1 ? "Resource" : "Resources"}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: AI Quiz & Practice Engine */}
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex p-1.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] gap-1.5">
            <button
              onClick={() => {
                setStudyMode("mcq");
                if (quizState === "done") setQuizState("idle");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                studyMode === "mcq"
                  ? "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] shadow-sm border border-[var(--outline-variant)]"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              <i className="ti ti-brain text-base text-[var(--tertiary)]"></i> AI MCQ Practice
            </button>
            <button
              onClick={() => {
                setStudyMode("structured");
                if (quizState === "done") setQuizState("idle");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                studyMode === "structured"
                  ? "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] shadow-sm border border-[var(--outline-variant)]"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              <i className="ti ti-help-circle text-base text-[var(--tertiary)]"></i> AI Structured Q&A
            </button>
          </div>

          {/* Controls Bar for Quiz (Scope & Count) */}
          <div className="card p-3 px-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--on-surface-variant)] font-semibold">Scope:</span>
              <select
                value={sourceScope}
                onChange={(e) => setSourceScope(e.target.value as any)}
                disabled={quizState === "active" || quizState === "loading"}
                className="bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)] rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="full_course">Full Course Materials</option>
                <option value="ongoing_topics">Ongoing Topics Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--on-surface-variant)] font-semibold">Count:</span>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={quizState === "active" || quizState === "loading"}
                className="bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)] rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          {/* MCQ Practice Engine Panel */}
          {studyMode === "mcq" && (
            <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--outline-variant)]">
                  <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                    <i className="ti ti-brain text-[var(--tertiary)] text-xl"></i> AI MCQ Practice Engine
                  </h3>
                  {quizState === "active" && (
                    <span className="badge badge-accent">
                      Q {currentIdx + 1} of {questions.length}
                    </span>
                  )}
                </div>

                {quizError && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    <i className="ti ti-alert-circle mr-1"></i> {quizError} (Showing study bank questions)
                  </div>
                )}

                {/* Idle State */}
                {quizState === "idle" && (
                  <div className="text-center py-12">
                    <i className="ti ti-sparkles text-5xl text-[var(--tertiary)] block mb-3 animate-pulse"></i>
                    <p className="font-semibold text-base mb-1 text-[var(--on-surface)]">
                      Generate AI Practice Quiz
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mb-6 max-w-xs mx-auto">
                      Generate questions grounded in your lecturer&apos;s materials and your personal study resources.
                    </p>
                    <button onClick={startQuiz} className="btn-primary shadow-md inline-flex items-center gap-1.5">
                      <i className="ti ti-player-play"></i> Generate & Start Quiz
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {quizState === "loading" && (
                  <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-semibold text-[var(--on-surface)]">
                      Analyzing course materials & generating questions...
                    </p>
                    <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                      Powered by Gemini 3.6 Flash
                    </p>
                  </div>
                )}

                {/* Active Question */}
                {quizState === "active" && currentQ && (
                  <div>
                    <p className="text-sm font-semibold mb-4 text-[var(--on-surface)] leading-relaxed">
                      {currentQ.orderNo}. {currentQ.questionText}
                    </p>

                    <div className="space-y-2.5 mb-5">
                      {currentQ.options.map((opt, i) => {
                        const isChosen = selectedOpt === opt;
                        const isRevealed = selectedOpt !== null;
                        const isCorrectAnswer =
                          currentQ.correctAnswer &&
                          opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                        let btnClass =
                          "w-full text-left p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors flex items-center justify-between";

                        if (isRevealed) {
                          if (isCorrectAnswer) {
                            btnClass =
                              "w-full text-left p-3.5 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-between";
                          } else if (isChosen) {
                            btnClass =
                              "w-full text-left p-3.5 rounded-xl border border-[var(--error)] bg-[var(--error-container)] text-[var(--on-error-container)] font-bold text-sm flex items-center justify-between";
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={selectedOpt !== null || isSubmittingAnswer}
                            onClick={() => handleSelectOption(opt)}
                            className={btnClass}
                          >
                            <span>{opt}</span>
                            {isRevealed && isCorrectAnswer && (
                              <i className="ti ti-check text-emerald-600 text-base"></i>
                            )}
                            {isRevealed && isChosen && !isCorrectAnswer && (
                              <i className="ti ti-x text-red-500 text-base"></i>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOpt !== null && (
                      <div className="pt-2">
                        {currentQ.correctAnswer && (
                          <div className="p-3 mb-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-xs text-[var(--on-surface-variant)]">
                            <strong className="text-[var(--on-surface)]">Correct Answer: </strong>
                            {currentQ.correctAnswer}
                          </div>
                        )}
                        <button
                          onClick={handleNextQuestion}
                          className="btn-primary w-full justify-center shadow-md flex items-center gap-1"
                        >
                          <span>{currentIdx + 1 < questions.length ? "Next Question" : "Finish Quiz"}</span>
                          <i className="ti ti-arrow-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Done State */}
                {quizState === "done" && (
                  <div className="text-center py-10">
                    <i className="ti ti-trophy text-5xl text-[var(--secondary)] block mb-3"></i>
                    <h4 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                      Practice Quiz Completed!
                    </h4>
                    <p className="text-sm text-[var(--on-surface-variant)] mb-6">
                      You scored{" "}
                      <b className="text-[var(--on-surface)] text-base">
                        {score} / {questions.length}
                      </b>{" "}
                      ({questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%)
                    </p>
                    <button onClick={startQuiz} className="btn-primary text-xs shadow-md">
                      <i className="ti ti-rotate mr-1"></i> Try Another Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Structured Q&A Panel */}
          {studyMode === "structured" && (
            <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] min-h-[500px]">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  <i className="ti ti-help-circle text-[var(--tertiary)] text-xl"></i> AI Structured Q&A Bank
                </h3>
                <button
                  onClick={startQuiz}
                  disabled={quizState === "loading"}
                  className="btn-primary text-xs !py-1 px-2.5 flex items-center gap-1 shadow-sm"
                >
                  <i className="ti ti-sparkles"></i> Generate New
                </button>
              </div>

              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Write structured exam responses. Compare your answer with the AI-generated model solution.
              </p>

              {quizState === "loading" && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-[var(--on-surface-variant)]">Generating structured questions...</p>
                </div>
              )}

              {quizState !== "loading" && questions.length === 0 && (
                <div className="text-center py-12">
                  <i className="ti ti-clipboard-text text-4xl text-[var(--outline)] block mb-2"></i>
                  <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                    Click below to generate grounded structured questions for this course.
                  </p>
                  <button onClick={startQuiz} className="btn-primary text-xs">
                    <i className="ti ti-sparkles mr-1"></i> Generate Structured Questions
                  </button>
                </div>
              )}

              {quizState !== "loading" && questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((item) => {
                    const typed = structuredInputs[item.questionId] || "";
                    const isRevealed = revealedStructured[item.questionId];

                    return (
                      <div
                        key={item.questionId}
                        className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container-low)] space-y-3"
                      >
                        <p className="text-sm font-bold text-[var(--on-surface)] leading-relaxed">
                          {item.orderNo}. {item.questionText}
                        </p>

                        <textarea
                          rows={2}
                          value={typed}
                          onChange={(e) =>
                            setStructuredInputs((prev) => ({ ...prev, [item.questionId]: e.target.value }))
                          }
                          placeholder="Type your exam response here to test yourself..."
                          className="w-full text-xs p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:border-[var(--tertiary)] focus:outline-none transition-colors"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSubmitStructured(item.questionId)}
                            className="btn-primary text-xs !py-1.5 flex items-center gap-1"
                          >
                            <i className="ti ti-sparkles text-sm"></i> Check & Compare
                          </button>
                          <button
                            onClick={() =>
                              setRevealedStructured((prev) => ({
                                ...prev,
                                [item.questionId]: !prev[item.questionId],
                              }))
                            }
                            className="btn-secondary text-xs !py-1.5 flex items-center gap-1"
                          >
                            <i className={`ti ${isRevealed ? "ti-eye-off" : "ti-eye"} text-sm`}></i>{" "}
                            {isRevealed ? "Hide Model Answer" : "Reveal Model Answer"}
                          </button>
                        </div>

                        {isRevealed && (
                          <div className="space-y-2 pt-2 border-t border-[var(--outline-variant)]">
                            <div className="bg-[var(--surface-container-lowest)] border border-[var(--tertiary)]/30 rounded-xl p-3.5 text-xs text-[var(--on-surface)] space-y-1">
                              <p className="font-bold text-[var(--tertiary)] flex items-center gap-1">
                                <i className="ti ti-check text-sm"></i> AI Model Solution:
                              </p>
                              <p className="leading-relaxed whitespace-pre-line">{item.correctAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Tutor Chat */}
        <div className="card p-6 flex flex-col h-[610px] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 text-[var(--on-surface)]">
              <i className="ti ti-messages text-[var(--tertiary)] text-xl"></i> Course AI Tutor Chat
            </h3>
            <button
              onClick={handleClearChat}
              title="Clear chat history"
              className="text-xs text-[var(--outline)] hover:text-[var(--error)] flex items-center gap-1 p-1 px-2 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors"
            >
              <i className="ti ti-trash text-sm"></i> Clear History
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {isLoadingHistory && (
              <div className="text-center py-4 text-xs text-[var(--on-surface-variant)] flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin"></div>
                Loading conversation history...
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-[var(--tertiary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-xs max-w-sm whitespace-pre-line leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                      : "bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isSendingChat && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[var(--tertiary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  AI
                </div>
                <div className="p-3 rounded-xl text-xs bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface-variant)] flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin"></div>
                  Thinking & searching course materials...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={handleSendChat}
            className="flex items-center gap-2 pt-3 border-t border-[var(--outline-variant)]"
          >
            <input
              type="text"
              value={chatInput}
              disabled={isSendingChat}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask anything about ${course.code} or your study notes...`}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:border-[var(--tertiary)] focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="btn-primary !p-2.5 disabled:opacity-50"
            >
              <i className="ti ti-send"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
