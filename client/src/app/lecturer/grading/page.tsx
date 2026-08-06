"use client";

import { useState } from "react";
import LecturerNavbar from "@/components/LecturerNavbar";
import DataTable from "@/components/DataTable";
import FileDropzone from "@/components/FileDropzone";
import SubmissionReviewer, {
  SubmissionToReview,
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

interface RegradeRequest {
  id: string;
  candidateCode: string;
  studentName: string;
  originalScore: number;
  maxScore: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [];

const INITIAL_EXAM_SUBMISSIONS: ExamSubmissionItem[] = [];

const INITIAL_REGRADES: RegradeRequest[] = [];

export default function LecturerGradingPage() {
  const [selectedOffering, setSelectedOffering] = useState("SE308.3 — Software Process Management (Batch CS2023-A)");
  const [mainTab, setMainTab] = useState<"assignments" | "exams">("assignments");

  
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>("All Assignments");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionItem | null>(null);

  
  const [showCsvModal, setShowCsvModal] = useState(false);

  
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("Final Written Examination 2026");
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmissionItem[]>(INITIAL_EXAM_SUBMISSIONS);
  const [regrades, setRegrades] = useState<RegradeRequest[]>(INITIAL_REGRADES);
  const [reviewingExamSub, setReviewingExamSub] = useState<ExamSubmissionItem | null>(null);

  
  const distinctAssignments = Array.from(new Set(submissions.map((s) => s.assignmentTitle)));

  
  const filteredSubmissions = submissions.filter((s) => {
    if (selectedAssignmentFilter === "All Assignments") return true;
    return s.assignmentTitle === selectedAssignmentFilter;
  });

  const handleSaveSubmissionGrade = (
    submissionId: string,
    updatedRubric: RubricCriterion[],
    feedback: string,
    totalScore: number
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              rubric: updatedRubric,
              feedback,
              marks: totalScore,
              status: "graded",
            }
          : sub
      )
    );
    setReviewingSubmission(null);
  };

  const handleSaveExamGradeNext = (
    candidateCode: string,
    totalScore: number,
    updatedQuestions: ExamQuestionAnswer[]
  ) => {
    setExamSubmissions((prev) =>
      prev.map((sub) =>
        sub.candidateCode === candidateCode
          ? {
              ...sub,
              score: totalScore,
              questions: updatedQuestions,
              status: "Graded",
            }
          : sub
      )
    );

    
    const currentIndex = examSubmissions.findIndex((s) => s.candidateCode === candidateCode);
    const nextItem = examSubmissions[currentIndex + 1];

    if (nextItem) {
      setReviewingExamSub(nextItem);
    } else {
      setReviewingExamSub(null);
    }
  };

  const handlePublishAllExamResults = () => {
    setExamSubmissions((prev) => prev.map((sub) => ({ ...sub, status: "Published" })));
    alert("Final exam results published successfully to student portal!");
  };

  const handleRegradeAction = (id: string, action: "Approved" | "Rejected") => {
    setRegrades((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
  };

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
          <i className="ti ti-[#file-search] ti-file-search text-sm"></i>
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
              Per-offering assignment grading, mock file document preview, and blind exam paper evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Offering:</label>
            <select
              value={selectedOffering}
              onChange={(e) => setSelectedOffering(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="SE308.3 — Software Process Management (Batch CS2023-A)">
                SE308.3 — Software Process Management (Batch CS2023-A)
              </option>
              <option value="SE202.2 — Database Systems (Batch CS2023-A)">
                SE202.2 — Database Systems (Batch CS2023-A)
              </option>
            </select>
          </div>
        </div>

        
        <div className="flex gap-2 border-b border-[var(--outline-variant)]">
          <button
            onClick={() => setMainTab("assignments")}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${mainTab === "assignments" ? "border-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-clipboard-check mr-1.5"></i> Coursework Submissions & Rubric
          </button>
          <button
            onClick={() => setMainTab("exams")}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${mainTab === "exams" ? "border-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
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
                    value={selectedExamFilter}
                    onChange={(e) => setSelectedExamFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                  >
                    <option value="Final Written Examination 2026">Final Written Examination 2026</option>
                  </select>
                </div>

                <button onClick={handlePublishAllExamResults} className="btn-primary text-xs shadow-md">
                  <i className="ti ti-send mr-1"></i> Publish All Results
                </button>
              </div>

              
              <div className="space-y-3">
                {examSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-[var(--on-surface)]">{sub.candidateCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.status === "Published" ? "bg-emerald-500/10 text-emerald-600" : sub.status === "Graded" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>{sub.status}</span>
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
                ))}
              </div>
            </div>

            
            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Student Regrade Request Queue ({regrades.length})
              </h3>
              <div className="space-y-3">
                {regrades.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-[var(--on-surface)]">{r.candidateCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "Pending" ? "bg-amber-500/10 text-amber-600" : r.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>{r.status}</span>
                      </div>
                      <p className="text-[var(--on-surface-variant)] italic">"{r.reason}"</p>
                    </div>

                    {r.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRegradeAction(r.id, "Approved")} className="btn-primary text-xs !py-1.5">Approve Adjustment</button>
                        <button onClick={() => handleRegradeAction(r.id, "Rejected")} className="btn-secondary text-xs !py-1.5 text-red-500">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
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
          courseCode={selectedOffering.split("—")[0].trim()}
          batch={selectedOffering.split("(")[1]?.replace(")", "").trim() || "Batch CS2023-A"}
          onClose={() => setReviewingSubmission(null)}
          onSaveGrade={handleSaveSubmissionGrade}
        />
      )}

      
      {reviewingExamSub && (
        <ExamAnswerReviewer
          candidateCode={reviewingExamSub.candidateCode}
          studentName={reviewingExamSub.studentName}
          courseCode={selectedOffering.split("—")[0].trim()}
          batch={selectedOffering.split("(")[1]?.replace(")", "").trim() || "Batch CS2023-A"}
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
