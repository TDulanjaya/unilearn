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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col p-4 sm:p-6 text-[var(--on-surface)] animate-scaleIn">
      
      <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
            <i className="ti ti-file-text text-xl"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-accent font-bold">{courseCode}</span>
              <span className="badge badge-gray">{batch}</span>
              <span className="text-xs text-[var(--on-surface-variant)]">• {examTitle}</span>
            </div>
            <h2 className="font-display font-extrabold text-lg text-[var(--on-surface)] mt-0.5 flex items-center gap-3">
              <span>{isIdentityRevealed ? `${studentName} (${candidateCode})` : candidateCode}</span>
              <button
                onClick={() => setIsIdentityRevealed(!isIdentityRevealed)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors flex items-center gap-1"
              >
                <i className={`ti ${isIdentityRevealed ? "ti-eye-off" : "ti-eye"}`}></i>
                {isIdentityRevealed ? "Mask Identity" : "Reveal Identity"}
              </button>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[var(--on-surface-variant)]">Exam Total</p>
            <p className="font-display font-extrabold text-xl text-[var(--tertiary)]">
              {totalScore} <span className="text-xs font-normal text-[var(--outline)]">/ {totalMax}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] p-2">
            <i className="ti ti-x text-2xl"></i>
          </button>
        </div>
      </div>

      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 p-4 sm:p-6 overflow-hidden bg-[var(--surface-container-lowest)] border-x border-[var(--outline-variant)]">
        
        <div className="space-y-2 border-r border-[var(--outline-variant)] pr-4 overflow-y-auto">
          <p className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
            Exam Questions ({questions.length})
          </p>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQIndex(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                activeQIndex === idx
                  ? "border-[var(--tertiary)] bg-[var(--surface-container-low)] font-bold text-[var(--on-surface)]"
                  : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]/50"
              }`}
            >
              <span>Q{idx + 1}. {q.type}</span>
              <span className="font-bold text-[var(--tertiary)]">{q.awardedMarks}/{q.maxMarks}</span>
            </button>
          ))}
        </div>

        
        <div className="flex flex-col h-full space-y-4 overflow-y-auto">
          <div className="card p-5 space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <span className="font-bold text-xs text-[var(--tertiary)]">
                Question {activeQIndex + 1} of {questions.length} ({currentQ.type})
              </span>
              <span className="badge badge-accent text-[10px] font-bold">{currentQ.maxMarks} Marks Max</span>
            </div>
            <p className="font-bold text-sm text-[var(--on-surface)] leading-relaxed">{currentQ.text}</p>
          </div>

          <div className="card p-5 space-y-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex-1 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
              Student Submitted Answer
            </h4>
            <div className="flex-1 p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] font-mono text-xs text-[var(--on-surface)] leading-relaxed whitespace-pre-line">
              {currentQ.studentAnswer}
            </div>

            <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
              <div>
                {currentQ.autoScored ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <i className="ti ti-check"></i> Objective Answer Auto-Scored
                  </span>
                ) : (
                  <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
                    Enter Manual Mark:
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={currentQ.maxMarks}
                  disabled={currentQ.autoScored}
                  value={currentQ.awardedMarks}
                  onChange={(e) => handleMarkChange(activeQIndex, Number(e.target.value))}
                  className="w-20 text-xs p-2 rounded-xl border border-[var(--outline-variant)] font-bold text-center bg-[var(--surface-container-lowest)] text-[var(--on-surface)] disabled:opacity-60"
                />
                <span className="text-xs font-bold text-[var(--on-surface-variant)]">/ {currentQ.maxMarks} Marks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex items-center justify-between p-4 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)] rounded-b-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveQIndex((i) => Math.max(0, i - 1))}
            disabled={activeQIndex === 0}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            Previous Q
          </button>
          <button
            onClick={() => setActiveQIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={activeQIndex === questions.length - 1}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            Next Q
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary text-xs px-6 py-2.5 shadow-md">
            <i className="ti ti-check mr-1 text-sm"></i> Save & Next Student
          </button>
        </div>
      </div>
    </div>
  );
}
