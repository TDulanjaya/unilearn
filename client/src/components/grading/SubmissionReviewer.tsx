"use client";

import { useState } from "react";

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col p-4 sm:p-6 text-[var(--on-surface)] animate-scaleIn">
      
      <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
            <i className="ti ti-file-search text-xl"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-accent font-bold">{courseCode}</span>
              <span className="badge badge-gray">{batch}</span>
              <span className="text-xs text-[var(--on-surface-variant)]">• {submission.assignmentTitle}</span>
            </div>
            <h2 className="font-display font-extrabold text-lg text-[var(--on-surface)] mt-0.5">
              Reviewing: {submission.studentName} ({submission.studentId})
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] p-2 rounded-lg"
        >
          <i className="ti ti-x text-2xl"></i>
        </button>
      </div>

      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 overflow-hidden bg-[var(--surface-container-lowest)] border-x border-[var(--outline-variant)]">
        
        <div className="flex flex-col h-full border border-[var(--outline-variant)] rounded-2xl overflow-hidden bg-[var(--surface-container-low)]/50">
          <div className="flex items-center justify-between p-3.5 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-2">
              <i className="ti ti-file-type-pdf text-red-500 text-lg"></i>
              <span className="font-mono text-xs font-bold text-[var(--on-surface)]">
                {submission.fileName}
              </span>
            </div>
            <span className="text-[11px] text-[var(--outline)]">Submitted {submission.submittedAt}</span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto font-serif text-sm leading-relaxed text-[var(--on-surface)] bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] shadow-inner">
            <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-sans font-semibold flex items-center gap-2">
              <i className="ti ti-info-circle"></i> Preview (mock content standing in for actual document viewer)
            </div>

            <div className="whitespace-pre-line text-xs font-mono bg-[var(--surface-container-low)] p-4 rounded-xl border border-[var(--outline-variant)] text-[var(--on-surface)]">
              {submission.fileNote}
            </div>
          </div>
        </div>

        
        <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
          
          <div className="card p-4 flex items-center justify-between border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold">Total Awarded Score</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">
                {currentTotal} <span className="text-xs font-normal text-[var(--outline)]">/ {submission.maxMarks} Marks</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
                {Math.round((currentTotal / submission.maxMarks) * 100)}% Grade
              </span>
            </div>
          </div>

          
          <div className="card p-4 space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--on-surface-variant)] pb-2 border-b border-[var(--outline-variant)]">
              Assessment Rubric Criteria
            </h3>
            <div className="space-y-3">
              {rubric.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
                >
                  <div className="min-w-0 pr-3">
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
                      className="w-16 text-xs p-1.5 rounded-lg border border-[var(--outline-variant)] text-center font-bold bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                    />
                    <span className="text-xs font-bold text-[var(--on-surface-variant)]">/ {item.maxPoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="card p-4 space-y-2 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex-1 flex flex-col">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
              Lecturer Feedback & Notes
            </h3>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              className="w-full flex-1 text-xs p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-[var(--tertiary)]"
            ></textarea>
          </div>
        </div>
      </div>

      
      <div className="flex items-center justify-between p-4 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] rounded-b-2xl">
        <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
          Cancel
        </button>
        <button onClick={handleSave} className="btn-primary text-xs px-6 py-2.5 shadow-md">
          <i className="ti ti-check mr-1 text-sm"></i> Save & Confirm Grade
        </button>
      </div>
    </div>
  );
}
