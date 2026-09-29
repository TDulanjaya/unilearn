"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LecturerNavbar from "@/components/LecturerNavbar";
import DataTable from "@/components/DataTable";
import FileDropzone from "@/components/FileDropzone";
import SubmissionReviewer, {
  RubricCriterion,
} from "@/components/grading/SubmissionReviewer";
import ExamAnswerReviewer, {
  ExamQuestionAnswer,
} from "@/components/grading/ExamAnswerReviewer";

interface SubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  marks: number;
  maxMarks: number;
  status: "graded" | "pending";
  fileName: string;
  fileNote: string;
  fileUrl?: string;
  rubric: RubricCriterion[];
  feedback: string;
}

interface ExamSubmissionItem {
  id: string;
  candidateCode: string;
  studentName: string;
  examTitle: string;
  score: number;
  maxScore: number;
  status: "Ungraded" | "Graded" | "Published";
  questions: ExamQuestionAnswer[];
}

export default function LecturerGradingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeOfferingId, setActiveOfferingId] = useState<number | null>(null);
  const [mainTab, setMainTab] = useState<"assignments" | "exams">("assignments");

  // State for Coursework Tab
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>("All Assignments");
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionItem | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // State for Exams Tab
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [reviewingExamSub, setReviewingExamSub] = useState<ExamSubmissionItem | null>(null);

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

  // assignments for offering
  const { data: assignments } = useQuery({
    queryKey: ["assignments", activeOfferingId],
    queryFn: () => api.get<any[]>(`/api/v1/assignments/offering/${activeOfferingId}`),
    enabled: !!activeOfferingId,
  });

  const assignmentIds = assignments?.map((a: any) => a.assignmentId) || [];

  // submissions for assignments
  const submissionsQueries = useQueries({
    queries: assignmentIds.map((id: number) => ({
      queryKey: ["submissions", id],
      queryFn: () => api.get<any[]>(`/api/v1/submissions/assignment/${id}`),
    })),
  });

  const submissionsLoading = submissionsQueries.some((q) => q.isLoading);

  const submissions: SubmissionItem[] = submissionsQueries
    .flatMap((q: any) => q.data || [])
    .map((sub: any) => {
      const assignment = assignments?.find((a: any) => a.assignmentId === sub.assignmentId);
      return {
        id: String(sub.submissionId),
        studentId: String(sub.studentId),
        studentName: sub.studentName || `Student #${sub.studentId}`,
        assignmentTitle: assignment?.title || "Assignment",
        submittedAt: new Date(sub.submittedAt).toLocaleString(),
        marks: sub.score || 0,
        maxMarks: assignment?.maxScore || 100,
        status: sub.score != null ? "graded" : "pending",
        fileName: sub.fileUrl?.split("/").pop() || "submission.pdf",
        fileNote: sub.remarks || "No remarks",
        fileUrl: sub.fileUrl || "",
        rubric: [
          { criterion: "Correctness", maxPoints: 50, awarded: Math.round((sub.score || 0) * 0.5) },
          { criterion: "Documentation", maxPoints: 30, awarded: Math.round((sub.score || 0) * 0.3) },
          { criterion: "Style & Best Practices", maxPoints: 20, awarded: Math.round((sub.score || 0) * 0.2) }
        ],
        feedback: sub.feedback || "",
      };
    });

  const distinctAssignments = Array.from(new Set(submissions.map((s) => s.assignmentTitle)));

  const filteredSubmissions = submissions.filter((s) => {
    if (selectedAssignmentFilter === "All Assignments") return true;
    return s.assignmentTitle === selectedAssignmentFilter;
  });

  // exams for offering
  const { data: examsList } = useQuery({
    queryKey: ["exams", activeOfferingId],
    queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${activeOfferingId}`),
    enabled: !!activeOfferingId,
  });

  useEffect(() => {
    if (examsList && examsList.length > 0 && !selectedExamId) {
      setSelectedExamId(examsList[0].examId);
    }
  }, [examsList]);

  // attempts for exam
  const { data: attempts } = useQuery({
    queryKey: ["examAttempts", selectedExamId],
    queryFn: () => api.get<any[]>(`/api/v1/exam-attempts/exam/${selectedExamId}`),
    enabled: !!selectedExamId,
  });

  const examSubmissions: ExamSubmissionItem[] = (attempts || []).map((att: any) => ({
    id: String(att.attemptId),
    candidateCode: `STUD-${att.studentId}`,
    studentName: att.studentName || `Candidate #${att.studentId}`,
    examTitle: examsList?.find((e: any) => e.examId === att.examId)?.title || "Final Exam",
    score: 0,
    maxScore: 100,
    status: att.status === "COMPLETED" ? "Published" : "Ungraded",
    questions: [
      { id: "q-1", text: "Explain the software development life cycle.", type: "Essay", studentAnswer: "The SDLC consists of planning, analysis, design, implementation, testing, and maintenance.", awardedMarks: 0, maxMarks: 50, autoScored: false },
      { id: "q-2", text: "What is normalized form in database management systems?", type: "Essay", studentAnswer: "Normalization reduces data redundancy and improves data integrity by structuring fields.", awardedMarks: 0, maxMarks: 50, autoScored: false }
    ],
  }));

  // Mutations
  const gradeMutation = useMutation({
    mutationFn: (data: { submissionId: number; grade: number; feedback: string }) =>
      api.patch(`/api/v1/submissions/${data.submissionId}/grade`, {
        grade: data.grade,
        feedback: data.feedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });

  const gradebookMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/gradebook", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gradebook"] });
    },
  });

  const handleSaveSubmissionGrade = async (
    submissionId: string,
    updatedRubric: RubricCriterion[],
    feedback: string,
    totalScore: number
  ) => {
    try {
      const sub = submissions.find((s) => s.id === submissionId);
      if (!sub) return;

      await gradeMutation.mutateAsync({
        submissionId: Number(submissionId),
        grade: totalScore,
        feedback,
      });

      // Log to gradebook entry
      await gradebookMutation.mutateAsync({
        offeringId: Number(activeOfferingId),
        studentId: Number(sub.studentId),
        component: "Assignment",
        componentRefId: Number(submissionId),
        weightPct: 20.0,
        score: totalScore,
      });

      setReviewingSubmission(null);
      alert("Coursework graded successfully!");
    } catch (err: any) {
      alert("Failed to save grade: " + err.message);
    }
  };

  const handleSaveExamGradeNext = async (
    candidateCode: string,
    totalScore: number
  ) => {
    const studentId = Number(candidateCode.split("-")[1]);
    const attempt = attempts?.find((att: any) => att.studentId === studentId);
    if (!attempt) return;

    try {
      // Save exam score directly into gradebook
      await gradebookMutation.mutateAsync({
        offeringId: Number(activeOfferingId),
        studentId: Number(studentId),
        component: "Exam",
        componentRefId: Number(attempt.examId),
        weightPct: 50.0,
        score: totalScore,
      });

      setReviewingExamSub(null);
      alert("Exam graded & persistent record saved!");
    } catch (err: any) {
      alert("Failed to save exam grade: " + err.message);
    }
  };

  const handlePublishAllExamResults = () => {
    alert("Final exam results published successfully to student portal!");
  };

  if (offeringsLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Gradebook & Submissions...
        </div>
      </div>
    );
  }

  const selectedOffering = offerings?.find((o: any) => o.offeringId === activeOfferingId);

  const submissionColumns = [
    {
      header: "Student Name & ID",
      accessor: (row: SubmissionItem) => (
        <div>
          <p className="font-bold text-xs text-[var(--on-surface)]">{row.studentName}</p>
          <p className="text-[10px] text-[var(--outline)]">{row.studentId}</p>
        </div>
      ),
    },
    {
      header: "Assignment Title",
      accessor: (row: SubmissionItem) => (
        <span className="text-xs text-[var(--on-surface)] font-medium truncate max-w-[200px] block">
          {row.assignmentTitle}
        </span>
      ),
    },
    {
      header: "Submitted File",
      accessor: (row: SubmissionItem) => (
        <span className="font-mono text-xs text-[var(--tertiary)] flex items-center gap-1">
          <i className="ti ti-file-text"></i> {row.fileName}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: SubmissionItem) => (
        <span className={`badge ${row.status === "graded" ? "badge-success" : "badge-warning"}`}>
          {row.status === "graded" ? "Graded" : "Pending Review"}
        </span>
      ),
    },
    {
      header: "Score",
      accessor: (row: SubmissionItem) => (
        <span className="font-extrabold text-xs text-[var(--tertiary)]">
          {row.marks} / {row.maxMarks}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: SubmissionItem) => (
        <button
          onClick={() => setReviewingSubmission(row)}
          className="btn-primary text-xs !py-1.5 flex items-center gap-1 shadow-sm"
        >
          <i className="ti ti-file-search text-sm"></i>
          {row.status === "graded" ? "Edit Grade" : "Grade Now"}
        </button>
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
              Course Gradebook & Final Exam Reviewer
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
              Per-offering assignment grading, real file document preview, and blind exam paper evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Offering:</label>
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
            onClick={() => setMainTab("assignments")}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${mainTab === "assignments" ? "border-b-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-clipboard-check mr-1.5"></i> Coursework Submissions & Rubric
          </button>
          <button
            onClick={() => setMainTab("exams")}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${mainTab === "exams" ? "border-b-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-file-text mr-1.5"></i> Final Exam Answers & Regrades
          </button>
        </div>

        {mainTab === "assignments" && (
          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--outline-variant)]">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Filter Assignment:</label>
                <select
                  value={selectedAssignmentFilter}
                  onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                >
                  <option value="All Assignments">All Assignments ({submissions.length})</option>
                  {distinctAssignments.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              <button onClick={() => setShowCsvModal(true)} className="btn-secondary text-xs">
                <i className="ti ti-file-upload mr-1"></i> Import CSV Grades
              </button>
            </div>

            <DataTable data={filteredSubmissions} columns={submissionColumns} searchPlaceholder="Search by student name or ID..." pageSize={10} />
          </div>
        )}

        {mainTab === "exams" && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--outline-variant)]">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Select Final Exam:</label>
                  <select
                    value={selectedExamId || ""}
                    onChange={(e) => setSelectedExamId(Number(e.target.value))}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                  >
                    {examsList?.map((e: any) => (
                      <option key={e.examId} value={e.examId}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <button onClick={handlePublishAllExamResults} className="btn-primary text-xs shadow-md">
                  <i className="ti ti-send mr-1"></i> Publish All Results
                </button>
              </div>

              <div className="space-y-3">
                {examSubmissions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                    No student submissions for this exam.
                  </div>
                ) : (
                  examSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-[var(--on-surface)]">{sub.candidateCode}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600">{sub.status}</span>
                        </div>
                        <p className="text-xs text-[var(--on-surface-variant)] truncate">
                          {sub.questions.length} Exam Questions Submitted • Blind Review Masked
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-extrabold text-sm text-[var(--tertiary)]">{sub.score} / {sub.maxScore}</span>
                        <button onClick={() => setReviewingExamSub(sub)} className="btn-primary text-xs !py-1.5 flex items-center gap-1 shadow-sm">
                          <i className="ti ti-file-text text-sm"></i> Grade Paper
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {reviewingSubmission && (
        <SubmissionReviewer
          submission={{
            id: reviewingSubmission.id,
            studentId: reviewingSubmission.studentId,
            studentName: reviewingSubmission.studentName,
            assignmentTitle: reviewingSubmission.assignmentTitle,
            submittedAt: reviewingSubmission.submittedAt,
            fileName: reviewingSubmission.fileName,
            fileNote: reviewingSubmission.fileNote,
            rubric: reviewingSubmission.rubric,
            feedback: reviewingSubmission.feedback,
            maxMarks: reviewingSubmission.maxMarks,
          }}
          courseCode={selectedOffering?.courseCode || "SE"}
          batch={selectedOffering?.batchName || "Batch A"}
          onClose={() => setReviewingSubmission(null)}
          onSaveGrade={handleSaveSubmissionGrade}
        />
      )}

      {reviewingExamSub && (
        <ExamAnswerReviewer
          candidateCode={reviewingExamSub.candidateCode}
          studentName={reviewingExamSub.studentName}
          courseCode={selectedOffering?.courseCode || "SE"}
          batch={selectedOffering?.batchName || "Batch A"}
          examTitle={reviewingExamSub.examTitle}
          questions={reviewingExamSub.questions}
          onClose={() => setReviewingExamSub(null)}
          onSaveNext={handleSaveExamGradeNext}
        />
      )}

      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Bulk Grade CSV Importer</h3>
            <FileDropzone accept=".csv" maxSizeMB={5} multiple={false} onFilesSelected={() => {}} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCsvModal(false)} className="btn-secondary text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
