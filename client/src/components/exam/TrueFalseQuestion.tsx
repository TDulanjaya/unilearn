"use client";

interface TrueFalseQuestionProps {
  questionId: number;
  selectedAnswer: string | undefined;
  onAnswerChange: (answer: string) => void;
}

export default function TrueFalseQuestion({
  questionId,
  selectedAnswer,
  onAnswerChange,
}: TrueFalseQuestionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {["True", "False"].map((option) => {
        const isSelected = selectedAnswer === option;
        return (
          <button
            type="button"
            key={option}
            onClick={() => onAnswerChange(option)}
            className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 font-display font-bold text-base transition-all ${
              isSelected
                ? "border-[var(--tertiary)] bg-[var(--tertiary)] text-white shadow-md scale-[1.02]"
                : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] text-[var(--on-surface)]"
            }`}
          >
            <i className={`ti ${option === "True" ? "ti-check" : "ti-x"} text-2xl`}></i>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
