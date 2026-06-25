"use client";

import { useState } from "react";
import { Bookmark, Eraser, ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { ListeningTest } from "@/lib/types";
import { TestProvider, useTest } from "@/components/test-context";
import { TestHeader } from "@/components/test-header";
import { AudioPlayer } from "@/components/audio-player";
import { QuestionNav } from "@/components/question-nav";
import { TestTools } from "@/components/test-tools";
import { QuestionGroupCard } from "@/components/question-group";
import { ConfirmSubmitDialog, ResultsModal } from "@/components/results-modal";
import { cn } from "@/lib/utils";

export function TestRunner({ test }: { test: ListeningTest }) {
  return (
    <TestProvider test={test}>
      <RunnerInner test={test} />
    </TestProvider>
  );
}

function RunnerInner({ test }: { test: ListeningTest }) {
  const { submit, setShowAnswers } = useTest();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  function requestSubmit() {
    setConfirmOpen(true);
  }
  function doSubmit() {
    submit();
    setConfirmOpen(false);
    setResultsOpen(true);
  }
  function reviewAnswers() {
    setShowAnswers(true);
    setResultsOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <TestHeader />

        <div className="pt-[70px]">
          <AudioPlayer src={test.audio} />

          <main className="mx-auto w-[95%] max-w-[1800px] py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)]">
              {/* LEFT — question nav */}
              <div className="order-2 lg:order-1">
                <div className="lg:sticky lg:top-[184px]">
                  <QuestionNav />
                </div>
              </div>

              {/* CENTER — questions */}
              <div className="order-1 space-y-8 lg:order-2">
                <TestIntro />
                {test.sections.map((section) =>
                  section.groups.map((group) => (
                    <QuestionGroupCard key={group.id} group={group} />
                  )),
                )}
              </div>

              {/* RIGHT — tools */}
              <div className="order-3">
                <div className="lg:sticky lg:top-[184px]">
                  <TestTools onSubmit={requestSubmit} />
                </div>
              </div>
            </div>
          </main>
        </div>

        <ActionBar onSubmit={requestSubmit} />
      </div>

      {confirmOpen && (
        <ConfirmSubmitDialog onConfirm={doSubmit} onCancel={() => setConfirmOpen(false)} />
      )}
      {resultsOpen && <ResultsModal onClose={() => setResultsOpen(false)} onReview={reviewAnswers} />}
    </>
  );
}

function TestIntro() {
  const { test } = useTest();
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {test.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {test.type} · {test.totalQuestions} questions · Listen once and answer as you go. Your
        responses save automatically.
      </p>
    </div>
  );
}

/** Sticky bottom action bar mirroring the CBT mockup. */
function ActionBar({ onSubmit }: { onSubmit: () => void }) {
  const {
    currentQuestion,
    setCurrentQuestion,
    questionNumbers,
    toggleReview,
    clearAnswer,
    review,
    submitted,
  } = useTest();

  const idx = questionNumbers.indexOf(currentQuestion);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < questionNumbers.length - 1;
  const flagged = review[currentQuestion];

  function go(offset: number) {
    const target = questionNumbers[idx + offset];
    if (target === undefined) return;
    setCurrentQuestion(target);
    const el = document.getElementById(`q-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => (el as HTMLInputElement).focus({ preventScroll: true }), 320);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-[95%] max-w-[1800px] items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleReview(currentQuestion)}
            aria-pressed={flagged}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              flagged
                ? "border-warning bg-warning/15 text-warning-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            <Bookmark className={cn("h-4 w-4", flagged && "fill-current")} aria-hidden />
            <span className="hidden sm:inline">
              {flagged ? "Marked" : "Review later"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => clearAnswer(currentQuestion)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Eraser className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Clear answer</span>
          </button>
        </div>

        <div className="text-xs font-medium text-muted-foreground">
          Question <span className="font-bold text-foreground">{currentQuestion}</span> of{" "}
          {questionNumbers.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={!hasPrev}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!hasNext}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40 sm:px-4"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitted}
            className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-success/90 disabled:opacity-50 sm:px-4"
          >
            <Send className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{submitted ? "Submitted" : "Submit"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
