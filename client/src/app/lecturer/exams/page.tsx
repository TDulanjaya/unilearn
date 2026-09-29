"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LecturerNavbar from "@/components/LecturerNavbar";
import DataTable from "@/components/DataTable";

interface Question {
  id: string;
  text: string;
  type: "MCQ" | "Essay" | "Short answer";
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface FlagEvent {
  id: string;
  attemptId: number;
  studentName: string;
  indexNo: string;
  flagType: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High";
  status: "Active" | "Warned" | "Paused" | "Terminated";
}

export default function LecturerExamsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeOfferingId, setActiveOfferingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"qb" | "build" | "proctoring">("qb");

  // Form states
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"MCQ" | "Essay" | "Short answer">("MCQ");
  const [qMarks, setQMarks] = useState(5);
  const [qDifficulty, setQDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [examTimer, setExamTimer] = useState(120);

  // lecturer offerings
  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["lecturerOfferings", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/course-offerings/lecturer/${user?.userId}`),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (offerings && offerings.length > 0 && !activeOfferingId) {
      setActiveOfferingId(offerings[0].offeringId);
    }
  }, [offerings]);

  const activeOffering = offerings?.find((o: any) => o.offeringId === activeOfferingId);
  const courseId = activeOffering?.courseId;

  // question bank for course
  const { data: qbs } = useQuery({
    queryKey: ["qbs", courseId],
    queryFn: () => api.get<any[]>(`/api/v1/question-banks/course/${courseId}`),
    enabled: !!courseId,
  });

  const activeBankId = qbs && qbs.length > 0 ? qbs[0].bankId : null;

  // questions in bank
  const { data: questionsResponse } = useQuery({
    queryKey: ["questions", activeBankId],
    queryFn: () => api.get<any>(`/api/v1/questions/bank/${activeBankId}?size=100`),
    enabled: !!activeBankId,
  });

  const questions: Question[] = (questionsResponse?.dataList || []).map((q: any) => ({
    id: String(q.questionId),
    text: q.questionText,
    type: q.questionType as any,
    marks: Number(q.marks),
    difficulty: (q.difficulty || "Medium") as any,
  }));

  // scheduled exams
  const { data: exams } = useQuery({
    queryKey: ["exams", activeOfferingId],
    queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${activeOfferingId}`),
    enabled: !!activeOfferingId,
  });

  const activeExamId = exams && exams.length > 0 ? exams[0].examId : null;

  // attempts for exam
  const { data: attempts } = useQuery({
    queryKey: ["examAttempts", activeExamId],
    queryFn: () => api.get<any[]>(`/api/v1/exam-attempts/exam/${activeExamId}`),
    enabled: !!activeExamId,
  });

  // proctoring flags
  const attemptIds = attempts?.map((att: any) => att.attemptId) || [];
  const flagsQueries = useQueries({
    queries: attemptIds.map((id: number) => ({
      queryKey: ["proctoringFlags", id],
      queryFn: () => api.get<any[]>(`/api/v1/proctoring-flags/attempt/${id}`),
    })),
  });

  const flags: FlagEvent[] = flagsQueries
    .flatMap((q: any) => q.data || [])
    .map((f: any) => {
      const attempt = attempts?.find((att: any) => att.attemptId === f.attemptId);
      return {
        id: String(f.flagId),
        attemptId: f.attemptId,
        studentName: attempt?.studentName || `Student #${attempt?.studentId}`,
        indexNo: `SE/2023/0${attempt?.studentId}`,
        flagType: f.flagType,
        timestamp: new Date(f.createdAt).toLocaleTimeString(),
        severity: "High",
        status: f.flagType.includes("Warn")
          ? "Warned"
          : f.flagType.includes("Pause")
          ? "Paused"
          : f.flagType.includes("Terminate")
          ? "Terminated"
          : "Active",
      };
    });

  // Mutations
  const createBankMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/question-banks", data),
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/questions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const scheduleExamMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/exams/inclass", data),
  });

  const createFlagMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/proctoring-flags", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proctoringFlags"] });
    },
  });

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !courseId) return;

    try {
      let bankId = activeBankId;
      if (!bankId) {
        const newBank = await createBankMutation.mutateAsync({
          courseId,
          createdByLecturerId: user?.userId,
        });
        bankId = newBank.bankId;
        queryClient.invalidateQueries({ queryKey: ["qbs", courseId] });
      }

      await createQuestionMutation.mutateAsync({
        bankId,
        questionText: qText.trim(),
        questionType: qType,
        marks: qMarks,
        difficulty: qDifficulty,
        topic: "General",
      });

      setQText("");
    } catch (err: any) {
      alert("Failed to save question: " + err.message);
    }
  };

  const handleSaveExamDraft = async () => {
    if (!activeOfferingId) return;
    try {
      await scheduleExamMutation.mutateAsync({
        offeringId: activeOfferingId,
        title: `Mid-Term Examination - ${activeOffering?.courseCode}`,
        durationMinutes: examTimer,
        scheduledById: user?.userId,
      });
      alert("In-class exam scheduled successfully!");
    } catch (err: any) {
      alert("Failed to schedule exam: " + err.message);
    }
  };

  const handleProctorAction = async (attemptId: number, action: "Warned" | "Paused" | "Terminated") => {
    try {
      await createFlagMutation.mutateAsync({
        attemptId,
        flagType: `Lecturer action: ${action}`,
        notes: `Lecturer manually flagged the student: ${action}`,
      });
      alert(`Sent ${action} flag notification to the student candidate.`);
    } catch (err: any) {
      alert("Failed to perform action: " + err.message);
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalAssembledMarks = questions
    .filter((q) => selectedQuestionIds.includes(q.id))
    .reduce((acc, q) => acc + q.marks, 0);

  if (offeringsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Question Banks & Exams...
        </div>
      </div>
    );
  }

  const proctorColumns = [
    {
      header: "Timestamp",
      accessor: (row: FlagEvent) => (
        <span className="font-mono text-xs text-[var(--on-surface-variant)]">{row.timestamp}</span>
      ),
    },
    {
      header: "Student Name",
      accessor: (row: FlagEvent) => (
        <div>
          <p className="font-bold text-xs text-[var(--on-surface)]">{row.studentName}</p>
          <p className="text-[10px] text-[var(--outline)]">{row.indexNo}</p>
        </div>
      ),
    },
    {
      header: "Flag Event Type",
      accessor: (row: FlagEvent) => (
        <span className="font-semibold text-xs text-[var(--on-surface)] flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-amber-500"></i> {row.flagType}
        </span>
      ),
    },
    {
      header: "Severity",
      accessor: (row: FlagEvent) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-red-500/10 text-red-600 border-red-500/20">
          {row.severity}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: FlagEvent) => (
        <span className={`badge ${row.status === "Terminated" ? "badge-danger" : "badge-gray"}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: FlagEvent) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleProctorAction(row.attemptId, "Warned")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 disabled:opacity-40"
          >
            Warn
          </button>
          <button
            onClick={() => handleProctorAction(row.attemptId, "Paused")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 disabled:opacity-40"
          >
            Pause
          </button>
          <button
            onClick={() => handleProctorAction(row.attemptId, "Terminated")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-40"
          >
            Terminate
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
              Exam Authoring & Live Proctoring
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
              Question bank management, exam paper builder, and real-time live proctoring feed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Course Offering:</label>
            <select
              value={activeOfferingId || ""}
              onChange={(e) => setActiveOfferingId(Number(e.target.value))}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              {offerings?.map((o: any) => (
                <option key={o.offeringId} value={o.offeringId}>
                  {o.courseCode} — {o.courseName} ({o.batchName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 border-b border-[var(--outline-variant)]">
          <button
            onClick={() => setActiveTab("qb")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === "qb" ? "border-b-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-database mr-1.5"></i> Question Bank
          </button>
          <button
            onClick={() => setActiveTab("build")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === "build" ? "border-b-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-file-pencil mr-1.5"></i> Build Exam
          </button>
          <button
            onClick={() => setActiveTab("proctoring")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all min-h-[44px] shrink-0 whitespace-nowrap ${activeTab === "proctoring" ? "border-b-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-shield-check mr-1.5 text-red-500"></i> Live Exam Proctoring
          </button>
        </div>

        {activeTab === "qb" && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="card p-4 sm:p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Question Bank ({questions.length} Items)
              </h3>

              {/* Mobile Card View (< md) */}
              <div className="md:hidden divide-y divide-[var(--outline-variant)]">
                {questions.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                    No questions added to the bank yet.
                  </p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--on-surface-variant)] font-semibold">{q.type}</span>
                        <span className={`badge ${q.difficulty === "Easy" ? "badge-success" : q.difficulty === "Medium" ? "badge-accent" : "badge-danger"}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--on-surface)]">{q.text}</p>
                      <div className="text-[11px] text-[var(--on-surface-variant)] font-semibold">
                        Marks: <span className="font-bold text-[var(--tertiary)]">{q.marks}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase font-semibold">
                      <th className="pb-3 px-3">Question</th>
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Marks</th>
                      <th className="pb-3 px-3">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]">
                    {questions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                          No questions added to the bank yet.
                        </td>
                      </tr>
                    ) : (
                      questions.map((q) => (
                        <tr key={q.id} className="hover:bg-[var(--surface-container-low)]">
                          <td className="py-3 px-3 font-medium text-[var(--on-surface)]">{q.text}</td>
                          <td className="py-3 px-3 text-[var(--on-surface-variant)]">{q.type}</td>
                          <td className="py-3 px-3 font-bold">{q.marks}</td>
                          <td className="py-3 px-3">
                            <span className={`badge ${q.difficulty === "Easy" ? "badge-success" : q.difficulty === "Medium" ? "badge-accent" : "badge-danger"}`}>
                              {q.difficulty}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Add New Question
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Question Type</label>
                  <select value={qType} onChange={(e) => setQType(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                    <option value="MCQ">MCQ</option>
                    <option value="Essay">Essay</option>
                    <option value="Short answer">Short answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Question Prompt</label>
                  <textarea rows={3} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Type question text..." className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Marks</label>
                    <input type="number" min={1} value={qMarks} onChange={(e) => setQMarks(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Difficulty</label>
                    <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-xs shadow-sm">
                  Save Question
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "build" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Select Questions from Bank
              </h3>
              <div className="space-y-2.5">
                {questions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                    No questions available to choose.
                  </div>
                ) : (
                  questions.map((q) => {
                    const isChecked = selectedQuestionIds.includes(q.id);
                    return (
                      <label key={q.id} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isChecked ? "border-[var(--tertiary)] bg-[var(--surface-container-low)]" : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"}`}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={isChecked} onChange={() => toggleQuestionSelection(q.id)} className="rounded text-[var(--tertiary)]" />
                          <span className="text-xs font-semibold text-[var(--on-surface)]">{q.text}</span>
                        </div>
                        <span className="badge badge-accent text-[10px] font-bold">{q.marks} marks</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Assembled Exam Summary — {selectedQuestionIds.length} Questions ({totalAssembledMarks} Marks)
              </h3>
              <div className="space-y-2">
                {questions.filter((q) => selectedQuestionIds.includes(q.id)).map((q) => (
                  <div key={q.id} className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-xs flex justify-between">
                    <span className="font-semibold text-[var(--on-surface)]">{q.text}</span>
                    <span className="font-bold text-[var(--tertiary)]">{q.marks} Marks</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Exam Timer (Minutes)</label>
                <input type="number" value={examTimer} onChange={(e) => setExamTimer(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" />
              </div>

              <button onClick={handleSaveExamDraft} className="btn-primary w-full justify-center text-xs shadow-md">
                Save Exam Draft & Schedule
              </button>
            </div>
          </div>
        )}

        {activeTab === "proctoring" && (
          <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  Live Exam Integrity Violation Feed ({activeOffering?.courseCode})
                </h3>
              </div>
              <span className="text-xs text-[var(--on-surface-variant)]">
                Auto-updating feed ({flags.length} events logged)
              </span>
            </div>

            <DataTable data={flags} columns={proctorColumns} searchPlaceholder="Search flagged students..." pageSize={10} />
          </div>
        )}
      </main>
    </div>
  );
}
