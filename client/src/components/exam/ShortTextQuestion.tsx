"use client";

interface ShortTextQuestionProps {
  questionId: number;
  selectedAnswer: string | undefined;
  onAnswerChange: (answer: string) => void;
  // called when the field loses focus, used to save right away
  onBlur?: () => void;
}

export default function ShortTextQuestion({
  questionId,
  selectedAnswer = "",
  onAnswerChange,
  onBlur,
}: ShortTextQuestionProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[var(--on-surface-variant)]">
        Your Short Answer:
      </label>
      <input
        type="text"
        value={selectedAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Type your concise response here..."
        className="w-full px-4 py-3 min-h-[48px] text-xs sm:text-sm rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)] transition-colors"
      />
    </div>
  );
}
