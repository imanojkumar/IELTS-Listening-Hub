"use client";

import { useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, MinusCircle, Award, Send } from "lucide-react";
import { useTest } from "@/components/test-context";
import { estimateBand } from "@/lib/band";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Submit confirmation (dismissible)                                   */
/* ------------------------------------------------------------------ */

export function ConfirmSubmitDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { answeredCount, questionNumbers } = useTest();
  const total = questionNumbers.length;
  const unanswered = total - answeredCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-bold text-foreground">
          Submit your test?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve answered{" "}
          <span className="font-semibold text-foreground">
            {answeredCount} of {total}
          </span>{" "}
          questions.
          {unanswered > 0
            ? ` ${unanswered} ${unanswered === 1 ? "question is" : "questions are"} still blank — these will be marked incorrect.`
            : " Nicely done — every question has an answer."}{" "}
          You&apos;ll see your estimated band score next.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Keep working
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success/90"
          >
            <Send className="h-4 w-4" aria-hidden /> Submit &amp; see score
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results (closes ONLY via the X button — backdrop clicks do nothing) */
/* ------------------------------------------------------------------ */

type Status = "correct" | "incorrect" | "unanswered";

export function ResultsModal({
  onClose,
  onReview,
}: {
  onClose: () => void;
  onReview: () => void;
}) {
  const { test, questionNumbers, answers, isCorrect, isAnswered, correctCount } = useTest();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const total = questionNumbers.length;
  const band = estimateBand(correctCount, total);

  const rows = questionNumbers.map((q) => {
    const status: Status = isCorrect(q)
      ? "correct"
      : isAnswered(q)
        ? "incorrect"
        : "unanswered";
    return {
      q,
      status,
      given: (answers[q] ?? "").trim(),
      accepted: test.answers[String(q)] ?? [],
    };
  });

  const incorrectNumbers = rows.filter((r) => r.status === "incorrect").map((r) => r.q);
  const unansweredNumbers = rows.filter((r) => r.status === "unanswered").map((r) => r.q);

  // Lock background scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keep focus within the dialog (Tab trap). Escape intentionally does NOT
  // close — the candidate must use the X button.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      // Backdrop clicks are deliberately inert.
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-navy px-6 py-4 text-navy-foreground">
          <div>
            <h2 id="results-title" className="text-lg font-bold">
              Test Complete
            </h2>
            <p className="text-xs text-white/60">{test.title}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close results"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[300px_1fr]">
          {/* LEFT — band score */}
          <div className="flex flex-col items-center gap-4 border-b border-border bg-accent/40 p-6 text-center md:border-b-0 md:border-r">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <Award className="h-4 w-4" aria-hidden /> Probable Band
            </span>
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-primary bg-card shadow-sm">
              <span className="text-4xl font-bold tabular-nums text-primary">
                {band.band.toFixed(1)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                estimate
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{band.label}</p>
            <div className="w-full rounded-xl border border-border bg-card p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Raw score</span>
                <span className="font-bold tabular-nums text-foreground">
                  {band.correct} / {band.total}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-bold tabular-nums text-foreground">{band.accuracy}%</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Scaled (/40)</span>
                <span className="font-bold tabular-nums text-foreground">{band.scaled40}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{band.tip}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              Estimated from a 10-question section, scaled to the IELTS 40-question band table.
              Indicative only.
            </p>
          </div>

          {/* RIGHT — metrics */}
          <div className="flex flex-col overflow-hidden">
            {/* Tally */}
            <div className="grid grid-cols-3 gap-3 border-b border-border p-5">
              <Stat
                tone="success"
                icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                label="Correct"
                value={correctCount}
              />
              <Stat
                tone="destructive"
                icon={<XCircle className="h-4 w-4" aria-hidden />}
                label="Incorrect"
                value={incorrectNumbers.length}
              />
              <Stat
                tone="muted"
                icon={<MinusCircle className="h-4 w-4" aria-hidden />}
                label="Unanswered"
                value={unansweredNumbers.length}
              />
            </div>

            {(incorrectNumbers.length > 0 || unansweredNumbers.length > 0) && (
              <div className="border-b border-border px-5 py-3 text-xs">
                {incorrectNumbers.length > 0 && (
                  <p className="text-foreground">
                    <span className="font-semibold text-destructive">Review these:</span>{" "}
                    <span className="tabular-nums">{incorrectNumbers.join(", ")}</span>
                  </p>
                )}
                {unansweredNumbers.length > 0 && (
                  <p className="mt-1 text-foreground">
                    <span className="font-semibold text-muted-foreground">Left blank:</span>{" "}
                    <span className="tabular-nums">{unansweredNumbers.join(", ")}</span>
                  </p>
                )}
              </div>
            )}

            {/* Per-question breakdown */}
            <div className="scroll-slim flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-semibold">#</th>
                    <th className="px-2 py-2.5 font-semibold">Your answer</th>
                    <th className="px-2 py-2.5 font-semibold">Correct answer</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.q} className="align-top">
                      <td className="px-5 py-3 font-semibold tabular-nums text-foreground">{r.q}</td>
                      <td className="px-2 py-3">
                        <span
                          className={cn(
                            "font-medium",
                            r.status === "correct" && "text-success",
                            r.status === "incorrect" && "text-destructive",
                            r.status === "unanswered" && "italic text-muted-foreground",
                          )}
                        >
                          {r.given || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-foreground">{r.accepted.join(" / ")}</td>
                      <td className="px-5 py-3 text-right">
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Close to keep the page, or review answers inline in the test.
              </p>
              <button
                type="button"
                onClick={onReview}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Review my answers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  tone,
  icon,
  label,
  value,
}: {
  tone: "success" | "destructive" | "muted";
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-center",
        tone === "success" && "border-success/30 bg-success/10",
        tone === "destructive" && "border-destructive/30 bg-destructive/10",
        tone === "muted" && "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-1 text-xs font-medium",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {icon} {label}
      </span>
      <span className="mt-1 block text-2xl font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "correct")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Correct
      </span>
    );
  if (status === "incorrect")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
        <XCircle className="h-3.5 w-3.5" aria-hidden /> Incorrect
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      <MinusCircle className="h-3.5 w-3.5" aria-hidden /> Blank
    </span>
  );
}
