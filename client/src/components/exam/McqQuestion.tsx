"use client";

interface McqQuestionProps {
  questionId: number;
  options: string[];
  selectedAnswer: string | undefined;
  onAnswerChange: (answer: string) => void;
}

export default function McqQuestion({
  questionId,
  options,
  selectedAnswer,
  onAnswerChange,
}: McqQuestionProps) {
  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const isSelected = selectedAnswer === option;
        return (
          <label
            key={idx}
            onClick={() => onAnswerChange(option)}
            className={`flex items-center gap-3.5 p-3.5 sm:p-4 min-h-[48px] rounded-2xl border cursor-pointer transition-all ${
              isSelected
                ? "border-[var(--tertiary)] bg-[var(--tertiary-container)]/20 text-[var(--on-surface)] shadow-sm font-semibold"
                : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? "border-[var(--tertiary)] bg-[var(--tertiary)]"
                  : "border-[var(--outline)]"
              }`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className="text-xs sm:text-sm leading-relaxed break-words">{option}</span>
          </label>
        );
      })}
    </div>
  );
}
