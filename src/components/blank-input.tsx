"use client";

import { useTest } from "@/components/test-context";
import { cn } from "@/lib/utils";

/**
 * A single inline answer field, numbered like a real CBT paper. Width grows
 * with content. Tracks current-question focus and, in Show Answers mode,
 * renders correct/incorrect state with the key.
 */
export function BlankInput({ number, width = "md" }: { number: number; width?: "sm" | "md" | "lg" }) {
  const {
    answers,
    setAnswer,
    setCurrentQuestion,
    currentQuestion,
    showAnswers,
    isCorrect,
    isAnswered,
    test,
  } = useTest();

  const value = answers[number] ?? "";
  const isFocusTarget = currentQuestion === number;
  const correct = showAnswers && isCorrect(number);
  const wrong = showAnswers && isAnswered(number) && !isCorrect(number);
  const blank = showAnswers && !isAnswered(number);
  const accepted = test.answers[String(number)] ?? [];

  const widthClass = width === "sm" ? "w-16" : width === "lg" ? "w-48" : "w-28";

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1 align-baseline">
      <span className="relative inline-flex items-center">
        <span
          aria-hidden
          className={cn(
            "absolute -top-2 left-1.5 z-10 rounded-full px-1 text-[10px] font-bold leading-none tabular-nums",
            isFocusTarget ? "bg-warning text-warning-foreground" : "bg-secondary text-white",
          )}
        >
          {number}
        </span>
        <input
          id={`q-${number}`}
          type="text"
          inputMode="text"
          autoComplete="off"
          aria-label={`Answer for question ${number}`}
          value={value}
          disabled={showAnswers}
          onFocus={() => setCurrentQuestion(number)}
          onChange={(e) => setAnswer(number, e.target.value)}
          className={cn(
            "h-9 rounded-md border bg-card px-2.5 pt-1 text-sm font-medium text-foreground shadow-inner transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            widthClass,
            isFocusTarget && !showAnswers
              ? "border-warning ring-1 ring-warning"
              : "border-input",
            correct && "border-success bg-success/10 text-success ring-1 ring-success",
            wrong && "border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive",
            blank && "border-dashed border-muted-foreground/50",
          )}
        />
      </span>
      {showAnswers && !correct && (
        <span className="inline-flex items-baseline gap-1 text-xs font-medium text-success">
          <span className="text-muted-foreground">→</span>
          {accepted.join(" / ")}
        </span>
      )}
    </span>
  );
}
