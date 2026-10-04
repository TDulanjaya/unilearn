"use client";

interface EssayQuestionProps {
  questionId: number;
  selectedAnswer: string | undefined;
  onAnswerChange: (answer: string) => void;
  // called when the field loses focus, used to save right away
  onBlur?: () => void;
}

export default function EssayQuestion({
  questionId,
  selectedAnswer = "",
  onAnswerChange,
  onBlur,
}: EssayQuestionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--on-surface-variant)]">
        <span>Detailed Answer:</span>
        <span className="text-[11px] text-[var(--outline)]">{selectedAnswer.length} characters typed</span>
      </div>
      <textarea
        rows={6}
        value={selectedAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Provide a detailed, well-structured response..."
        className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)] transition-colors leading-relaxed"
      />
    </div>
  );
}
