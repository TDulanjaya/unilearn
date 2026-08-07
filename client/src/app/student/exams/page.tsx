"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import McqQuestion from "@/components/exam/McqQuestion";
import TrueFalseQuestion from "@/components/exam/TrueFalseQuestion";
import ShortTextQuestion from "@/components/exam/ShortTextQuestion";
import EssayQuestion from "@/components/exam/EssayQuestion";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_TEXT" | "ESSAY";

export interface QuestionData {
  id: number;
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
}

export interface MockExam {
  id: number;
  courseCode: string;
  courseTitle: string;
  durationMinutes: number;
  questions: QuestionData[];
}

const MOCK_ONLINE_EXAM: MockExam = {
  id: 101,
  courseCode: "SE308.3",
  courseTitle: "Software Process Management Final Assessment",
  durationMinutes: 45,
  questions: [
    {
      id: 1,
      text: "Which process model emphasizes early risk assessment in every iteration cycle?",
      type: "MCQ",
      points: 5,
      options: ["Waterfall Model", "Spiral Model", "V-Model", "Big Bang Model"],
    },
    {
      id: 2,
      text: "Code coverage measurements guarantee that software is 100% bug-free.",
      type: "TRUE_FALSE",
      points: 5,
    },
    {
      id: 3,
      text: "Define CMMI Level 3 in one concise sentence.",
      type: "SHORT_TEXT",
      points: 10,
    },
    {
      id: 4,
      text: "Discuss the trade-offs between Scrum and Kanban in high-velocity startup teams.",
      type: "ESSAY",
      points: 20,
    },
  ],
};

interface ExamListEntry {
  id: number;
  courseCode: string;
  courseTitle: string;
  dateTime: string;
  venue: string;
  seatNo: string;
  type: "Final Exam" | "Midterm Quiz" | "In-Class Assessment";
  status: "Upcoming" | "Completed";
  grade?: string;
  isOnlineAvailable?: boolean;
}

export default function StudentExamsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"Upcoming" | "Completed">("Upcoming");
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);

  // Exam wizard states
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(MOCK_ONLINE_EXAM.durationMinutes * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);

  // 1. Fetch student's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const enrollmentList = enrollments || [];

  // 2. Fetch scheduled exams for enrolled offerings
  const examQueries = useQueries({
    queries: enrollmentList.map((e: any) => ({
      queryKey: ["exams", e.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${e.offeringId}`),
    })),
  });

  const rawExams = examQueries.flatMap((q: any) => q.data || []);

  const exams: ExamListEntry[] = rawExams.map((ex: any, idx: number) => ({
    id: ex.examId,
    courseCode: ex.courseCode || "SE",
    courseTitle: ex.title || "Examination",
    dateTime: ex.startDateTime ? new Date(ex.startDateTime).toLocaleString() : "Date & Time TBD",
    venue: "Online Exam Portal",
    seatNo: `SEAT-${idx + 10}`,
    type: "In-Class Assessment",
    status: "Upcoming",
    isOnlineAvailable: true,
  }));

  // Mutations
  const startAttemptMutation = useMutation({
    mutationFn: (examId: number) =>
      api.post("/api/v1/exam-attempts", {
        examId,
        studentId: user?.userId,
      }),
  });

  const completeAttemptMutation = useMutation({
    mutationFn: (attemptId: number) =>
      api.patch(`/api/v1/exam-attempts/${attemptId}/complete`, {}),
  });

  const startExam = async (exam: any) => {
    try {
      const res = await startAttemptMutation.mutateAsync(exam.id);
      setCurrentAttemptId(res.attemptId);

      setActiveExam({
        id: exam.id,
        courseCode: exam.courseCode,
        courseTitle: exam.courseTitle,
        durationMinutes: exam.durationMinutes || 45,
        questions: MOCK_ONLINE_EXAM.questions,
      });

      setSecondsRemaining((exam.durationMinutes || 45) * 60);
      setCurrentQIndex(0);
      setAnswers({});
      setFlagged({});
      setTabSwitchCount(0);
      setIsSubmitted(false);
    } catch (err: any) {
      alert("Failed to start exam attempt: " + err.message);
    }
  };

  const handleManualSubmit = async () => {
    if (confirm("Are you sure you want to submit your exam now?")) {
      try {
        if (currentAttemptId) {
          await completeAttemptMutation.mutateAsync(currentAttemptId);
        }
        setIsSubmitted(true);
      } catch (err: any) {
        alert("Submission failed: " + err.message);
      }
    }
  };

  useEffect(() => {
    if (!activeExam || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeExam, isSubmitted]);

  useEffect(() => {
    if (!activeExam || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, isSubmitted]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleFlag = (questionId: number) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleDownloadSlipFile = (exam: ExamListEntry) => {
    const slipContent = `
============================================================
           UNILEARN OFFICIAL ADMISSION SLIP
============================================================
Student Name: ${user?.fullName || "Student"}
Index Number: SE-2023-042
Degree: B.Sc. (Hons) in Software Engineering

EXAM DETAILS:
Course Code : ${exam.courseCode}
Course Title: ${exam.courseTitle}
Date & Time : ${exam.dateTime}
Venue       : ${exam.venue}
Seat Number : ${exam.seatNo}

Generated on: ${new Date().toLocaleDateString("en-US")}
============================================================
`;
    const blob = new Blob([slipContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AdmissionSlip_${exam.courseCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Examination Data...
        </div>
      </div>
    );
  }

  if (activeExam) {
    const currentQ = activeExam.questions[currentQIndex];
    const answeredCount = Object.keys(answers).filter(
      (k) => answers[Number(k)]?.trim()
    ).length;

    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-container-low)]">
          <div>
            <span className="badge badge-accent mb-1 font-bold">
              {activeExam.courseCode}
            </span>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--on-surface)]">
              {activeExam.courseTitle}
            </h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Questions: {activeExam.questions.length} · Answered: {answeredCount}/{activeExam.questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 font-semibold">
              <i className="ti ti-alert-triangle text-base"></i>
              <span>Focus Alerts: {tabSwitchCount}</span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] font-mono font-bold text-lg flex items-center gap-2 shadow-md">
              <i className="ti ti-clock text-xl text-[var(--tertiary)]"></i>
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="card p-8 sm:p-12 text-center space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] max-w-2xl mx-auto shadow-2xl animate-scaleIn">
            <div className="w-16 h-16 rounded-3xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center mx-auto">
              <i className="ti ti-check-circle text-4xl"></i>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[var(--on-surface)]">
              Assessment Submitted Successfully
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Your responses for <b>{activeExam.courseTitle}</b> have been saved. You answered {answeredCount} out of {activeExam.questions.length} questions.
            </p>

            <button
              onClick={() => setActiveExam(null)}
              className="btn-primary text-xs !py-2.5 !px-6 justify-center shadow-md mx-auto"
            >
              Return to Exams Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6 sm:p-8 space-y-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-4 mb-6">
                  <span className="font-display font-bold text-sm text-[var(--tertiary)]">
                    Question {currentQIndex + 1} of {activeExam.questions.length}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-xs">
                      {currentQ.points} Points
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFlag(currentQ.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
                        flagged[currentQ.id]
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                      }`}
                    >
                      <i className="ti ti-flag text-sm"></i>
                      {flagged[currentQ.id] ? "Flagged" : "Flag for Review"}
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-[var(--on-surface)] mb-6 leading-relaxed">
                  {currentQ.text}
                </h3>

                {currentQ.type === "MCQ" && currentQ.options && (
                  <McqQuestion
                    questionId={currentQ.id}
                    options={currentQ.options}
                    selectedAnswer={answers[currentQ.id]}
                    onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
                  />
                )}
                {currentQ.type === "TRUE_FALSE" && (
                  <TrueFalseQuestion
                    questionId={currentQ.id}
                    selectedAnswer={answers[currentQ.id]}
                    onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
                  />
                )}
                {currentQ.type === "SHORT_TEXT" && (
                  <ShortTextQuestion
                    questionId={currentQ.id}
                    selectedAnswer={answers[currentQ.id]}
                    onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
                  />
                )}
                {currentQ.type === "ESSAY" && (
                  <EssayQuestion
                    questionId={currentQ.id}
                    selectedAnswer={answers[currentQ.id]}
                    onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
                  />
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--outline-variant)] pt-6 mt-8">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((p) => p - 1)}
                  className="btn-secondary text-xs !py-2.5 !px-5 disabled:opacity-40"
                >
                  <i className="ti ti-arrow-left mr-1"></i> Previous
                </button>

                {currentQIndex < activeExam.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((p) => p + 1)}
                    className="btn-primary text-xs !py-2.5 !px-5 shadow-sm"
                  >
                    Next Question <i className="ti ti-arrow-right ml-1"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="btn-primary text-xs !py-2.5 !px-6 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Finish & Submit Exam <i className="ti ti-check ml-1"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="card p-6 space-y-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] h-fit">
              <h4 className="font-display font-bold text-sm text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-3">
                Question Navigator
              </h4>

              <div className="grid grid-cols-4 gap-2.5">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnswered = Boolean(answers[q.id]?.trim());
                  const isFlagged = Boolean(flagged[q.id]);

                  let btnStyle = "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]";
                  if (isAnswered) btnStyle = "bg-[var(--tertiary)] text-white border-[var(--tertiary)]";
                  if (isFlagged) btnStyle = "bg-amber-500 text-white border-amber-500";
                  if (isCurrent) btnStyle += " ring-2 ring-offset-2 ring-[var(--primary)] font-bold";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-11 rounded-xl border text-xs flex items-center justify-center relative transition-all ${btnStyle}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs border-t border-[var(--outline-variant)] pt-4 text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[var(--tertiary)]"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-amber-500"></div>
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[var(--surface-container-low)] border border-[var(--outline-variant)]"></div>
                  <span>Unanswered</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSubmit}
                className="btn-outline w-full text-xs justify-center !py-2.5 mt-2"
              >
                Submit Exam Early
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  const filteredExams = exams.filter((e) => e.status === filter);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Examinations & Assessments
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            View upcoming hall exam schedules, download admission slips, or launch online exam assessments.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl self-start sm:self-auto">
          {(["Upcoming", "Completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filter === "Upcoming" && exams.length > 0 && (
        <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] shadow-xl bg-gradient-to-r from-[var(--surface-container-low)] via-[var(--surface-container)] to-[var(--surface-container-low)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-container-low)]">
          <div className="space-y-1">
            <span className="badge badge-accent font-bold">Live Portal Ready</span>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              {exams[0].courseCode} Online Exam Runner Wizard
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Practice test runner with countdown timer, draft auto-save, question navigator, and focus monitoring.
            </p>
          </div>
          <button
            onClick={() => startExam(exams[0])}
            className="btn-primary text-xs !py-3 !px-6 shadow-md shrink-0 justify-center"
          >
            <i className="ti ti-player-play"></i> Launch Exam Wizard
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.length === 0 ? (
          <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] col-span-2 font-semibold">
            No exams scheduled in this category.
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="card p-6 flex flex-col justify-between space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge badge-accent font-bold">{exam.courseCode}</span>
                  <span className="text-xs font-semibold text-[var(--tertiary)]">{exam.type}</span>
                </div>

                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] truncate">
                  {exam.courseTitle}
                </h3>

                <div className="space-y-1.5 text-xs text-[var(--on-surface-variant)]">
                  <p className="flex items-center gap-2">
                    <i className="ti ti-calendar-event text-sm text-[var(--tertiary)]"></i> {exam.dateTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <i className="ti ti-building text-sm text-[var(--tertiary)]"></i> Venue: {exam.venue}
                  </p>
                  <p className="flex items-center gap-2">
                    <i className="ti ti-ticket text-sm text-[var(--tertiary)]"></i> Seat No: {exam.seatNo}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
                {exam.status === "Upcoming" ? (
                  <button
                    onClick={() => handleDownloadSlipFile(exam)}
                    className="btn-outline text-xs !py-2 !px-4 flex items-center gap-1.5"
                  >
                    <i className="ti ti-download"></i> Admission Slip
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">Grade: {exam.grade}</span>
                )}

                {exam.isOnlineAvailable && (
                  <button
                    onClick={() => startExam(exam)}
                    className="btn-primary text-xs !py-2 !px-4"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
