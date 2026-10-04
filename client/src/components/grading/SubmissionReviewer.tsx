"use client";

import { useState } from "react";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { useFileUrl } from "@/lib/files";

export interface RubricCriterion {
  criterion: string;
  maxPoints: number;
  awarded: number;
}

export interface SubmissionToReview {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  fileName: string;
  fileNote: string;
  fileUrl?: string;
  rubric: RubricCriterion[];
  feedback: string;
  maxMarks: number;
}

interface SubmissionReviewerProps {
  submission: SubmissionToReview;
  courseCode: string;
  batch: string;
  onClose: () => void;
  onSaveGrade: (
    submissionId: string,
    updatedRubric: RubricCriterion[],
    feedback: string,
    totalScore: number
  ) => void;
}

export default function SubmissionReviewer({
  submission,
  courseCode,
  batch,
  onClose,
  onSaveGrade,
}: SubmissionReviewerProps) {
  const [rubric, setRubric] = useState<RubricCriterion[]>(submission.rubric);
  const [feedback, setFeedback] = useState(submission.feedback);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // load the file with the login token
  const { src: fileSrc, error: fileError } = useFileUrl(submission.fileUrl);

  const handlePointChange = (index: number, val: number) => {
    const max = rubric[index].maxPoints;
    const capped = Math.min(Math.max(0, isNaN(val) ? 0 : val), max);
    setRubric((prev) =>
      prev.map((item, i) => (i === index ? { ...item, awarded: capped } : item))
    );
  };

  const currentTotal = rubric.reduce((acc, curr) => acc + (curr.awarded || 0), 0);

  const handleSave = () => {
    onSaveGrade(submission.id, rubric, feedback, currentTotal);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col p-0 sm:p-6 text-[var(--on-surface)] animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3.5 sm:p-4 rounded-none sm:rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold shrink-0">
              <i className="ti ti-file-search text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="badge badge-accent font-bold text-[10px]">{courseCode}</span>
                <span className="badge badge-gray text-[10px]">{batch}</span>
                <span className="text-[11px] text-[var(--on-surface-variant)] truncate">• {submission.assignmentTitle}</span>
              </div>
              <h2 className="font-display font-extrabold text-sm sm:text-lg text-[var(--on-surface)] mt-0.5 truncate">
                Reviewing: {submission.studentName} ({submission.studentId})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors shrink-0"
            aria-label="Close"
          >
            <i className="ti ti-x text-2xl"></i>
          </button>
        </div>

        {/* Content Body: Stack on Mobile, 2 Cols on Desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 overflow-y-auto lg:overflow-hidden bg-[var(--surface-container-lowest)] border-x-0 sm:border-x border-[var(--outline-variant)]">
          {/* Real Submitted Document Viewer */}
          <div className="flex flex-col border border-[var(--outline-variant)] rounded-2xl overflow-hidden bg-[var(--surface-container-low)]/50 min-h-[350px] lg:h-full">
            <div className="flex items-center justify-between p-3 sm:p-3.5 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <i className="ti ti-file-text text-red-500 text-lg shrink-0"></i>
                <span className="font-mono text-xs font-bold text-[var(--on-surface)] truncate">
                  {submission.fileName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] sm:text-[11px] text-[var(--outline)] hidden sm:inline">Submitted {submission.submittedAt}</span>
                {submission.fileUrl && (
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="btn-secondary text-[11px] min-h-[36px] !py-1 !px-2.5 flex items-center gap-1"
                    title="Open Document Preview Modal"
                  >
                    <i className="ti ti-maximize"></i> Fullscreen
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-[var(--surface-container-lowest)]">
              {submission.fileUrl ? (
                <div className="w-full h-[320px] lg:h-full min-h-[250px] flex flex-col rounded-xl overflow-hidden border border-[var(--outline-variant)] bg-white">
                  {fileError ? (
                    <p className="p-4 text-center text-xs font-semibold text-red-500">{fileError}</p>
                  ) : !fileSrc ? (
                    <p className="p-4 text-center text-xs font-semibold text-slate-500">Loading file...</p>
                  ) : (
                    <iframe
                      src={fileSrc}
                      title={submission.fileName}
                      className="w-full flex-1 border-0"
                    />
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2 border border-dashed border-[var(--outline-variant)] rounded-xl my-auto">
                  <i className="ti ti-file-off text-3xl text-[var(--outline)]"></i>
                  <p className="text-xs text-[var(--on-surface-variant)] font-semibold">
                    No downloadable file attached with this submission.
                  </p>
                </div>
              )}

              {submission.fileNote && (
                <div className="p-3 sm:p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-1">
                  <p className="text-[11px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
                    Student Submission Remarks:
                  </p>
                  <p className="text-xs font-mono text-[var(--on-surface)] whitespace-pre-wrap">
                    {submission.fileNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Grading & Rubric Panel */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-1">
            <div className="card p-4 flex items-center justify-between border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <div>
                <p className="text-xs text-[var(--on-surface-variant)] font-semibold">Total Awarded Score</p>
                <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">
                  {currentTotal} <span className="text-xs font-normal text-[var(--outline)]">/ {submission.maxMarks} Marks</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
                  {Math.round((currentTotal / (submission.maxMarks || 100)) * 100)}% Grade
                </span>
              </div>
            </div>

            {/* Rubric Criteria */}
            <div className="card p-4 space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--on-surface-variant)] pb-2 border-b border-[var(--outline-variant)]">
                Assessment Rubric Criteria
              </h3>
              <div className="space-y-3">
                {rubric.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-xs text-[var(--on-surface)]">{item.criterion}</p>
                      <p className="text-[10px] text-[var(--outline)]">Max allowance: {item.maxPoints} pts</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={item.maxPoints}
                        value={item.awarded}
                        onChange={(e) => handlePointChange(idx, Number(e.target.value))}
                        className="w-16 min-h-[38px] text-xs p-1.5 rounded-lg border border-[var(--outline-variant)] text-center font-bold bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                      />
                      <span className="text-xs font-bold text-[var(--on-surface-variant)]">/ {item.maxPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lecturer Feedback */}
            <div className="card p-4 space-y-2 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex-1 flex flex-col">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                Lecturer Feedback & Notes
              </h3>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full flex-1 min-h-[90px] text-xs p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-[var(--tertiary)]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] rounded-none sm:rounded-b-2xl shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs px-4 min-h-[44px] justify-center">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary text-xs px-6 min-h-[44px] shadow-md justify-center">
            <i className="ti ti-check mr-1 text-sm"></i> Save & Confirm Grade
          </button>
        </div>
      </div>

      {isPreviewOpen && submission.fileUrl && (
        <DocumentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={submission.fileName}
          url={submission.fileUrl}
          type="Document"
        />
      )}
    </>
  );
}
