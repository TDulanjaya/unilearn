"use client";

import { useState } from "react";

export interface ExamQuestionAnswer {
  id: string;
  text: string;
  type: "MCQ" | "Essay" | "Short answer";
  maxMarks: number;
  studentAnswer: string;
  awardedMarks: number;
  autoScored: boolean;
}

interface ExamAnswerReviewerProps {
  candidateCode: string;
  studentName: string;
  courseCode: string;
  batch: string;
  examTitle: string;
  questions: ExamQuestionAnswer[];
  onClose: () => void;
  onSaveNext: (candidateCode: string, totalScore: number, updatedQuestions: ExamQuestionAnswer[]) => void;
}

export default function ExamAnswerReviewer({
  candidateCode,
  studentName,
  courseCode,
  batch,
  examTitle,
  questions: initialQuestions,
  onClose,
  onSaveNext,
}: ExamAnswerReviewerProps) {
  const [questions, setQuestions] = useState<ExamQuestionAnswer[]>(initialQuestions);
  const [isIdentityRevealed, setIsIdentityRevealed] = useState(false);
  const [activeQIndex, setActiveQIndex] = useState(0);

  const handleMarkChange = (index: number, val: number) => {
    const max = questions[index].maxMarks;
    const capped = Math.min(Math.max(0, isNaN(val) ? 0 : val), max);
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, awardedMarks: capped } : q))
    );
  };

  const totalScore = questions.reduce((acc, q) => acc + (q.awardedMarks || 0), 0);
  const totalMax = questions.reduce((acc, q) => acc + q.maxMarks, 0);

  const handleSave = () => {
    onSaveNext(candidateCode, totalScore, questions);
  };

  const currentQ = questions[activeQIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col p-0 sm:p-6 text-[var(--on-surface)] animate-scaleIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3.5 sm:p-4 rounded-none sm:rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold shrink-0">
            <i className="ti ti-file-text text-lg sm:text-xl"></i>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="badge badge-accent font-bold text-[10px]">{courseCode}</span>
              <span className="badge badge-gray text-[10px]">{batch}</span>
              <span className="text-[11px] text-[var(--on-surface-variant)] truncate">• {examTitle}</span>
            </div>
            <h2 className="font-display font-extrabold text-sm sm:text-lg text-[var(--on-surface)] mt-0.5 flex items-center gap-2 flex-wrap truncate">
              <span>{isIdentityRevealed ? `${studentName} (${candidateCode})` : candidateCode}</span>
              <button
                onClick={() => setIsIdentityRevealed(!isIdentityRevealed)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors flex items-center gap-1 min-h-[32px]"
              >
                <i className={`ti ${isIdentityRevealed ? "ti-eye-off" : "ti-eye"}`}></i>
                {isIdentityRevealed ? "Mask" : "Reveal"}
              </button>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[var(--on-surface-variant)]">Exam Total</p>
            <p className="font-display font-extrabold text-base sm:text-xl text-[var(--tertiary)]">
              {totalScore} <span className="text-xs font-normal text-[var(--outline)]">/ {totalMax}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]"
            aria-label="Close"
          >
            <i className="ti ti-x text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 sm:gap-6 p-3 sm:p-6 overflow-y-auto lg:overflow-hidden bg-[var(--surface-container-lowest)] border-x-0 sm:border-x border-[var(--outline-variant)]">
        {/* Question Selector: Horizontal scroll pills on mobile, vertical list on desktop */}
        <div className="lg:border-r border-[var(--outline-variant)] lg:pr-4 overflow-x-auto no-scrollbar lg:overflow-y-auto flex lg:flex-col gap-2 pb-2 lg:pb-0 shrink-0">
          <p className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider hidden lg:block mb-2">
            Exam Questions ({questions.length})
          </p>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQIndex(idx)}
              className={`text-left p-2.5 sm:p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 shrink-0 min-h-[44px] ${
                activeQIndex === idx
                  ? "border-[var(--tertiary)] bg-[var(--surface-container-low)] font-bold text-[var(--on-surface)] shadow-sm"
                  : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]/50"
              }`}
            >
              <span>Q{idx + 1}. {q.type}</span>
              <span className="font-bold text-[var(--tertiary)]">{q.awardedMarks}/{q.maxMarks}</span>
            </button>
          ))}
        </div>

        {/* Question Answer & Grading */}
        <div className="flex flex-col space-y-4 overflow-y-auto">
          <div className="card p-4 sm:p-5 space-y-2 sm:space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <span className="font-bold text-xs text-[var(--tertiary)]">
                Question {activeQIndex + 1} of {questions.length} ({currentQ.type})
              </span>
              <span className="badge badge-accent text-[10px] font-bold">{currentQ.maxMarks} Marks Max</span>
            </div>
            <p className="font-bold text-xs sm:text-sm text-[var(--on-surface)] leading-relaxed">{currentQ.text}</p>
          </div>

          <div className="card p-4 sm:p-5 space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex-1 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
              Student Submitted Answer
            </h4>
            <div className="flex-1 min-h-[120px] p-3 sm:p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] font-mono text-xs text-[var(--on-surface)] leading-relaxed whitespace-pre-line break-words">
              {currentQ.studentAnswer || "No answer provided"}
            </div>

            <div className="pt-3 border-t border-[var(--outline-variant)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                {currentQ.autoScored ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <i className="ti ti-check"></i> Objective Answer Auto-Scored
                  </span>
                ) : (
                  <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
                    Enter Manual Mark:
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <input
                  type="number"
                  min={0}
                  max={currentQ.maxMarks}
                  disabled={currentQ.autoScored}
                  value={currentQ.awardedMarks}
                  onChange={(e) => handleMarkChange(activeQIndex, Number(e.target.value))}
                  className="w-20 min-h-[44px] text-xs p-2 rounded-xl border border-[var(--outline-variant)] font-bold text-center bg-[var(--surface-container-lowest)] text-[var(--on-surface)] disabled:opacity-60"
                />
                <span className="text-xs font-bold text-[var(--on-surface-variant)]">/ {currentQ.maxMarks} Marks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] rounded-none sm:rounded-b-2xl shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveQIndex((i) => Math.max(0, i - 1))}
            disabled={activeQIndex === 0}
            className="btn-secondary text-xs flex-1 sm:flex-none min-h-[44px] justify-center disabled:opacity-40"
          >
            Previous Q
          </button>
          <button
            onClick={() => setActiveQIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={activeQIndex === questions.length - 1}
            className="btn-secondary text-xs flex-1 sm:flex-none min-h-[44px] justify-center disabled:opacity-40"
          >
            Next Q
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="btn-secondary text-xs px-4 min-h-[44px] justify-center">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary text-xs px-6 min-h-[44px] shadow-md justify-center flex-1 sm:flex-none">
            <i className="ti ti-check mr-1 text-sm"></i> Save & Next
          </button>
        </div>
      </div>
    </div>
  );
}
