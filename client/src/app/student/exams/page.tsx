"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
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

export interface ActiveExamSession {
  id: number;
  courseCode: string;
  courseTitle: string;
  durationMinutes: number;
  questions: QuestionData[];
}

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
  durationMinutes?: number;
  isOnlineAvailable?: boolean;
}

export default function StudentExamsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"Upcoming" | "Completed">("Upcoming");
  const [activeExam, setActiveExam] = useState<ActiveExamSession | null>(null);

  // Exam wizard states
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
  const [examError, setExamError] = useState<string | null>(null);

  // enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const enrollmentList = enrollments || [];

  // exams for offerings
  const examQueries = useQueries({
    queries: enrollmentList.map((e: any) => ({
      queryKey: ["exams", e.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${e.offeringId}`),
    })),
  });

  // completed attempts
  const { data: studentAttempts } = useQuery({
    queryKey: ["studentExamAttempts", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/exam-attempts/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const rawExams = examQueries.flatMap((q: any) => q.data || []);

  const upcomingExams: ExamListEntry[] = rawExams.map((ex: any, idx: number) => ({
    id: ex.examId,
    courseCode: ex.courseCode || "—",
    courseTitle: ex.title || "Examination",
    dateTime: ex.startDateTime ? new Date(ex.startDateTime).toLocaleString() : "Date & Time TBD",
    venue: ex.location || "Online Exam Portal",
    seatNo: `SEAT-${idx + 10}`,
    type: "In-Class Assessment",
    status: "Upcoming",
    durationMinutes: ex.durationMinutes || 45,
    isOnlineAvailable: true,
  }));

  const completedExams: ExamListEntry[] = (studentAttempts || []).map((att: any) => {
    const matchedExam = rawExams.find((e: any) => e.examId === att.examId);
    return {
      id: att.examId || att.attemptId,
      courseCode: matchedExam?.courseCode || "Exam",
      courseTitle: matchedExam?.title || `Exam Attempt #${att.attemptId}`,
      dateTime: att.endTime ? new Date(att.endTime).toLocaleString() : (att.startTime ? new Date(att.startTime).toLocaleString() : "Submitted"),
      venue: "Online Exam Portal",
      seatNo: `ATT-${att.attemptId}`,
      type: "Final Exam",
      status: "Completed",
      grade: att.score != null ? `${att.score}%` : "Pending Grading",
      durationMinutes: matchedExam?.durationMinutes || 45,
      isOnlineAvailable: false,
    };
  });

  const exams: ExamListEntry[] = filter === "Upcoming" ? upcomingExams : completedExams;

  // Mutations
  const startAttemptMutation = useMutation({
    mutationFn: (examId: number) =>
      api.post("/api/v1/exam-attempts", {
        examId,
        studentId: user?.userId,
      }),
  });

  const saveAnswerMutation = useMutation({
    mutationFn: (data: { attemptId: number; questionId: number; answer: string }) =>
      api.post("/api/v1/exam-answers", {
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOption: data.answer,
        answerText: data.answer,
      }),
  });

  const completeAttemptMutation = useMutation({
    mutationFn: (attemptId: number) =>
      api.patch(`/api/v1/exam-attempts/${attemptId}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentExamAttempts", user?.userId] });
    },
  });

  const startExam = async (exam: ExamListEntry) => {
    setExamError(null);
    try {
      // create attempt
      const attemptRes = await startAttemptMutation.mutateAsync(exam.id);
      const attemptId = attemptRes.attemptId;
      setCurrentAttemptId(attemptId);

      // fetch exam questions
      const questionsRes = await api.get<any[]>(`/api/v1/exams/${exam.id}/questions`);

      const loadedQuestions: QuestionData[] = (questionsRes || []).map((q: any) => {
        let parsedOptions: string[] = [];
        if (q.options) {
          try {
            parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
          } catch {
            parsedOptions = [];
          }
        }
        let qType: QuestionType = "SHORT_TEXT";
        const rawType = (q.questionType || "").toLowerCase();
        if (rawType.includes("mcq")) qType = "MCQ";
        else if (rawType.includes("true") || rawType.includes("boolean")) qType = "TRUE_FALSE";
        else if (rawType.includes("essay")) qType = "ESSAY";
        else qType = "SHORT_TEXT";

        return {
          id: q.questionId,
          text: q.questionText || "Question",
          type: qType,
          points: Number(q.marksOverride ?? q.marks ?? 5),
          options: parsedOptions,
        };
      });

      const examDuration = exam.durationMinutes || 45;

      setActiveExam({
        id: exam.id,
        courseCode: exam.courseCode,
        courseTitle: exam.courseTitle,
        durationMinutes: examDuration,
        questions: loadedQuestions,
      });

      setSecondsRemaining(examDuration * 60);
      setCurrentQIndex(0);
      setAnswers({});
      setFlagged({});
      setTabSwitchCount(0);
      setIsSubmitted(false);
    } catch (err: any) {
      setExamError(err.message || "Failed to start exam attempt. Please try again.");
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
          if (currentAttemptId) {
            completeAttemptMutation.mutate(currentAttemptId);
          }
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, isSubmitted, currentAttemptId]);

  useEffect(() => {
    if (!activeExam || isSubmitted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an active exam in progress. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeExam, isSubmitted]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentAttemptId) {
      saveAnswerMutation.mutate({
        attemptId: currentAttemptId,
        questionId,
        answer: value,
      });
    }
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
Email: ${user?.email || "—"}

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
      <main className="max-w-[1200px] mx-auto px-3 sm:px-8 py-3 sm:py-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
        {/* Sticky Top Timer Bar on Mobile & Desktop */}
        <div className="glass sticky top-0 z-40 -mx-3 -mt-3 sm:mx-0 sm:mt-0 p-3.5 sm:p-6 border-b sm:border border-[var(--glass-border)] shadow-xl flex items-center justify-between gap-3 bg-[var(--surface-container-low)]/95 backdrop-blur-md rounded-none sm:rounded-3xl">
          <div className="min-w-0 pr-1">
            <span className="badge badge-accent mb-0.5 font-bold text-[10px]">
              {activeExam.courseCode}
            </span>
            <h1 className="font-display font-extrabold text-sm sm:text-2xl text-[var(--on-surface)] truncate">
              {activeExam.courseTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-[var(--on-surface-variant)]">
              Q {currentQIndex + 1}/{activeExam.questions.length} · Answered: {answeredCount}/{activeExam.questions.length}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {tabSwitchCount > 0 && (
              <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs flex items-center gap-1 font-semibold">
                <i className="ti ti-alert-triangle text-sm"></i>
                <span className="hidden sm:inline">Alerts: </span>{tabSwitchCount}
              </div>
            )}

            <div className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] font-mono font-extrabold text-base sm:text-lg flex items-center gap-1.5 shadow-md">
              <i className="ti ti-clock text-lg text-[var(--tertiary)]"></i>
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="card p-6 sm:p-12 text-center space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] max-w-2xl mx-auto shadow-2xl animate-scaleIn">
            <div className="w-16 h-16 rounded-3xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center mx-auto">
              <i className="ti ti-check-circle text-4xl"></i>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--on-surface)]">
              Assessment Submitted Successfully
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Your responses for <b>{activeExam.courseTitle}</b> have been saved. You answered {answeredCount} out of {activeExam.questions.length} questions.
            </p>

            <button
              onClick={() => setActiveExam(null)}
              className="btn-primary text-xs !py-3 !px-6 min-h-[44px] justify-center shadow-md mx-auto"
            >
              Return to Exams Dashboard
            </button>
          </div>
        ) : activeExam.questions.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] max-w-2xl mx-auto shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-3xl">
              <i className="ti ti-file-text"></i>
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              No Questions Configured
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)] max-w-sm mx-auto">
              Questions have not been published for this examination yet. Please contact your course lecturer.
            </p>
            <button
              onClick={() => setActiveExam(null)}
              className="btn-secondary text-xs !py-2.5 !px-4 min-h-[44px] mx-auto"
            >
              Back to Examinations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-4 sm:p-8 space-y-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3 sm:pb-4 mb-4 sm:mb-6 gap-2">
                  <span className="font-display font-bold text-xs sm:text-sm text-[var(--tertiary)]">
                    Question {currentQIndex + 1} of {activeExam.questions.length}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-xs">
                      {currentQ.points} Points
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFlag(currentQ.id)}
                      className={`text-xs px-3 py-1.5 min-h-[36px] rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
                        flagged[currentQ.id]
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                      }`}
                    >
                      <i className="ti ti-flag text-sm"></i>
                      <span className="hidden sm:inline">{flagged[currentQ.id] ? "Flagged" : "Flag for Review"}</span>
                      <span className="sm:hidden">{flagged[currentQ.id] ? "Flagged" : "Flag"}</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-[var(--on-surface)] mb-4 sm:mb-6 leading-relaxed">
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

              {/* Fixed Bottom Controls on Mobile, Normal in Desktop */}
              <div className="fixed bottom-0 left-0 right-0 sm:static p-3 sm:p-0 bg-[var(--surface-container-lowest)] sm:bg-transparent border-t border-[var(--outline-variant)] sm:border-0 z-30 shadow-2xl sm:shadow-none flex items-center justify-between gap-3 mt-4 sm:mt-8 pt-0 sm:pt-6">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((p) => p - 1)}
                  className="btn-secondary text-xs !py-3 sm:!py-2.5 !px-5 min-h-[44px] flex-1 sm:flex-none justify-center disabled:opacity-40"
                >
                  <i className="ti ti-arrow-left mr-1"></i> Prev
                </button>

                {currentQIndex < activeExam.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((p) => p + 1)}
                    className="btn-primary text-xs !py-3 sm:!py-2.5 !px-5 min-h-[44px] flex-1 sm:flex-none justify-center shadow-sm"
                  >
                    Next <i className="ti ti-arrow-right ml-1"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="btn-primary text-xs !py-3 sm:!py-2.5 !px-6 min-h-[44px] flex-1 sm:flex-none justify-center shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Submit Exam <i className="ti ti-check ml-1"></i>
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

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {examError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ti ti-alert-triangle text-base"></i>
            <span>{examError}</span>
          </div>
          <button onClick={() => setExamError(null)} className="hover:opacity-80">
            <i className="ti ti-x"></i>
          </button>
        </div>
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.length === 0 ? (
          <div className="text-center p-8 text-xs text-[var(--on-surface-variant)] col-span-2 font-semibold border border-dashed border-[var(--outline-variant)] rounded-2xl">
            No exams found in this category.
          </div>
        ) : (
          exams.map((exam) => (
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

                {exam.isOnlineAvailable && exam.status === "Upcoming" && (
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
