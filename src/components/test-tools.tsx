"use client";

import { useEffect, useState } from "react";
import {
  Timer,
  Bookmark,
  Eye,
  Contrast,
  AlertTriangle,
  ListChecks,
  Send,
} from "lucide-react";
import { useTest } from "@/components/test-context";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn, formatTime } from "@/lib/utils";

/**
 * RIGHT sidebar — exam utilities:
 *   countdown timer (warns at 0, never force-submits), word-limit reminders,
 *   review-later jump list, answered/unanswered tally, the Show-Answers +
 *   High-Contrast toggles, and the Submit action.
 */
export function TestTools({ onSubmit }: { onSubmit: () => void }) {
  const {
    test,
    answeredCount,
    questionNumbers,
    review,
    setCurrentQuestion,
    showAnswers,
    setShowAnswers,
    correctCount,
    submitted,
  } = useTest();

  const section = test.sections[0];
  const total = questionNumbers.length;
  const reviewList = questionNumbers.filter((q) => review[q]);
  const wordLimits = Array.from(
    new Set(section.groups.map((g) => g.wordLimit).filter(Boolean) as string[]),
  );

  function jumpTo(q: number) {
    setCurrentQuestion(q);
    const el = document.getElementById(`q-${q}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => (el as HTMLInputElement).focus({ preventScroll: true }), 320);
    }
  }

  return (
    <aside aria-label="Test tools" className="flex flex-col gap-4">
      <SectionTimer />

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitted}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors",
          submitted
            ? "cursor-not-allowed bg-success/60"
            : "bg-success hover:bg-success/90",
        )}
      >
        <Send className="h-4 w-4" aria-hidden />
        {submitted ? "Submitted" : "Submit Test"}
      </button>

      {/* Tally */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" aria-hidden /> Overview
        </h2>
        <dl className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-secondary/10 px-2 py-2.5">
            <dt className="text-xs text-muted-foreground">Answered</dt>
            <dd className="text-lg font-bold tabular-nums text-secondary">{answeredCount}</dd>
          </div>
          <div className="rounded-lg bg-muted px-2 py-2.5">
            <dt className="text-xs text-muted-foreground">Remaining</dt>
            <dd className="text-lg font-bold tabular-nums text-foreground">
              {total - answeredCount}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {section.title} · {total} questions
        </p>
      </div>

      {/* Review later */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Bookmark className="h-3.5 w-3.5" aria-hidden /> Review Later
        </h2>
        {reviewList.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No questions flagged. Use the bookmark in the action bar to mark one.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {reviewList.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => jumpTo(q)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-warning/40 bg-warning/15 text-sm font-semibold tabular-nums text-warning-foreground transition-colors hover:bg-warning/25"
                  aria-label={`Go to flagged question ${q}`}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Word limit reminder */}
      {wordLimits.length > 0 && (
        <div className="rounded-xl border border-secondary/30 bg-accent/60 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
            Word Limit
          </h2>
          <ul className="space-y-1.5">
            {wordLimits.map((w) => (
              <li key={w} className="text-xs font-medium leading-snug text-primary/90">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggles */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Tools
        </h2>
        <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden /> Show answers
          </span>
          <Switch
            checked={showAnswers}
            onCheckedChange={setShowAnswers}
            aria-label="Toggle show answers"
          />
        </label>
        {showAnswers && (
          <p className="mt-1 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Score:{" "}
            <span className="font-bold text-foreground tabular-nums">
              {correctCount} / {total}
            </span>{" "}
            correct
          </p>
        )}
        <Separator className="my-2" />
        <HighContrastToggle />
      </div>
    </aside>
  );
}

function SectionTimer() {
  const { remaining, timerRunning, timeUp, toggleTimer, resetTimer, countdown, started, submitted } =
    useTest();

  const low = remaining <= 60 && !timeUp;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        timeUp
          ? "border-destructive/40 bg-destructive/10"
          : low
            ? "border-warning/50 bg-warning/10"
            : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Timer className="h-3.5 w-3.5" aria-hidden /> Section Timer
        </h2>
        <span
          className={cn(
            "text-2xl font-bold tabular-nums",
            timeUp ? "text-destructive" : low ? "text-warning-foreground" : "text-foreground",
          )}
        >
          {formatTime(remaining)}
        </span>
      </div>

      {countdown !== null ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-secondary">
          <Timer className="h-3.5 w-3.5" aria-hidden /> Auto-starts in {countdown}s
        </p>
      ) : timeUp ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Time is up — you may keep working.
        </p>
      ) : !started ? (
        <p className="mt-2 text-xs text-muted-foreground">Starts automatically once the page loads.</p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={toggleTimer}
          disabled={timeUp || submitted}
          className="flex-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          {timerRunning ? "Pause" : started ? "Resume" : "Start"}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          disabled={submitted}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function HighContrastToggle() {
  const [high, setHigh] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (high) root.setAttribute("data-contrast", "high");
    else root.removeAttribute("data-contrast");
  }, [high]);

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Contrast className="h-4 w-4 text-muted-foreground" aria-hidden /> High contrast
      </span>
      <Switch checked={high} onCheckedChange={setHigh} aria-label="Toggle high contrast mode" />
    </label>
  );
}
