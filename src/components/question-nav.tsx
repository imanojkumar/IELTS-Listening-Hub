"use client";

import { useTest } from "@/components/test-context";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * LEFT sidebar — circular question buttons coloured by status:
 *   grey  = unanswered      blue  = answered
 *   orange = current        green = marked for review
 * Clicking scrolls the matching field into view and focuses it.
 */
export function QuestionNav() {
  const {
    questionNumbers,
    currentQuestion,
    setCurrentQuestion,
    isAnswered,
    review,
    answeredCount,
  } = useTest();

  const total = questionNumbers.length;
  const pct = total ? (answeredCount / total) * 100 : 0;

  function jumpTo(q: number) {
    setCurrentQuestion(q);
    const el = document.getElementById(`q-${q}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => (el as HTMLInputElement).focus({ preventScroll: true }), 320);
    }
  }

  return (
    <nav aria-label="Question navigation" className="flex flex-col gap-5">
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Questions
        </h2>
        <ul className="grid grid-cols-5 gap-2">
          {questionNumbers.map((q) => {
            const answered = isAnswered(q);
            const current = currentQuestion === q;
            const reviewed = review[q];
            return (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => jumpTo(q)}
                  aria-label={`Question ${q}${answered ? ", answered" : ""}${
                    reviewed ? ", marked for review" : ""
                  }`}
                  aria-current={current ? "true" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    current
                      ? "border-warning bg-warning text-warning-foreground shadow-sm"
                      : reviewed
                        ? "border-warning/40 bg-warning/15 text-warning-foreground"
                        : answered
                          ? "border-secondary bg-secondary text-white"
                          : "border-border bg-card text-muted-foreground hover:border-secondary/50 hover:text-foreground",
                  )}
                >
                  {q}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {answeredCount} / {total}
          </span>
        </div>
        <Progress value={pct} />
        <p className="mt-2 text-xs text-muted-foreground">
          {answeredCount === total
            ? "All questions answered."
            : `${total - answeredCount} remaining`}
        </p>
      </div>

      <Legend />
    </nav>
  );
}

function Legend() {
  const items = [
    { c: "bg-secondary", l: "Answered" },
    { c: "bg-warning", l: "Current" },
    { c: "bg-warning/20 border border-warning/40", l: "Review" },
    { c: "bg-card border border-border", l: "Unanswered" },
  ];
  return (
    <ul className="space-y-1.5 text-xs text-muted-foreground">
      {items.map((i) => (
        <li key={i.l} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-full", i.c)} aria-hidden />
          {i.l}
        </li>
      ))}
    </ul>
  );
}
