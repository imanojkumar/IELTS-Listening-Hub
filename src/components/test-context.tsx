"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ListeningTest } from "@/lib/types";
import { isAnswerCorrect } from "@/lib/utils";
import { useTestState } from "@/lib/use-test-state";

interface TestContextValue {
  test: ListeningTest;
  hydrated: boolean;
  answers: Record<string, string>;
  review: Record<string, boolean>;
  currentQuestion: number;
  showAnswers: boolean;
  setAnswer: (q: number, value: string) => void;
  clearAnswer: (q: number) => void;
  toggleReview: (q: number) => void;
  setCurrentQuestion: (q: number) => void;
  setShowAnswers: (v: boolean) => void;
  resetAll: () => void;
  isAnswered: (q: number) => boolean;
  isCorrect: (q: number) => boolean;
  answeredCount: number;
  correctCount: number;
  questionNumbers: number[];

  // Auto-start (audio + timer begin together after a short countdown).
  started: boolean;
  countdown: number | null; // 5..1 while counting down, else null

  // Section timer (shared so audio, tools, and submission stay in sync).
  remaining: number;
  timerRunning: boolean;
  timeUp: boolean;
  sectionDuration: number;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Submission.
  submitted: boolean;
  submit: () => void;
}

const TestContext = createContext<TestContextValue | null>(null);

export function useTest() {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTest must be used within <TestProvider>");
  return ctx;
}

export function TestProvider({
  test,
  children,
}: {
  test: ListeningTest;
  children: React.ReactNode;
}) {
  const { hydrated, answers, review, setAnswer, clearAnswer, toggleReview, resetAll } =
    useTestState(test.id);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showAnswers, setShowAnswers] = useState(false);

  const sectionDuration =
    test.sections[0]?.durationSeconds ?? test.durationSeconds ?? 480;

  // --- Auto-start: 5s after the page is fully loaded, kick off a visible
  // countdown; at zero, flip `started` so audio + timer begin together. ---
  const [countdown, setCountdown] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let kickoff: ReturnType<typeof setTimeout> | null = null;

    const begin = () => {
      let c = 5;
      setCountdown(c);
      interval = setInterval(() => {
        c -= 1;
        if (c <= 0) {
          if (interval) clearInterval(interval);
          setCountdown(null);
          setStarted(true);
        } else {
          setCountdown(c);
        }
      }, 1000);
    };

    if (document.readyState === "complete") {
      kickoff = setTimeout(begin, 50);
    } else {
      window.addEventListener("load", begin, { once: true });
    }

    return () => {
      window.removeEventListener("load", begin);
      if (interval) clearInterval(interval);
      if (kickoff) clearTimeout(kickoff);
    };
  }, []);

  // --- Section timer (shared) ---
  const [remaining, setRemaining] = useState(sectionDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  // Begin counting when the auto-start fires.
  useEffect(() => {
    if (started) setTimerRunning(true);
  }, [started]);

  useEffect(() => {
    if (!timerRunning) return;
    if (remaining <= 0) {
      setTimeUp(true);
      setTimerRunning(false);
      return;
    }
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning, remaining]);

  const toggleTimer = useCallback(() => setTimerRunning((r) => !r), []);
  const resetTimer = useCallback(() => {
    setRemaining(sectionDuration);
    setTimeUp(false);
    setTimerRunning(false);
  }, [sectionDuration]);

  // --- Submission ---
  const [submitted, setSubmitted] = useState(false);
  const submit = useCallback(() => {
    setSubmitted(true);
    setTimerRunning(false);
  }, []);

  const questionNumbers = useMemo(() => {
    const nums: number[] = [];
    for (const s of test.sections) for (const g of s.groups) nums.push(...g.numbers);
    return nums.sort((a, b) => a - b);
  }, [test]);

  const isAnswered = useCallback(
    (q: number) => Boolean(answers[q] && answers[q].trim() !== ""),
    [answers],
  );

  const isCorrect = useCallback(
    (q: number) => isAnswerCorrect(answers[q], test.answers[String(q)]),
    [answers, test.answers],
  );

  const answeredCount = useMemo(
    () => questionNumbers.filter((q) => isAnswered(q)).length,
    [questionNumbers, isAnswered],
  );

  const correctCount = useMemo(
    () => questionNumbers.filter((q) => isCorrect(q)).length,
    [questionNumbers, isCorrect],
  );

  const value: TestContextValue = {
    test,
    hydrated,
    answers,
    review,
    currentQuestion,
    showAnswers,
    setAnswer,
    clearAnswer,
    toggleReview,
    setCurrentQuestion,
    setShowAnswers,
    resetAll,
    isAnswered,
    isCorrect,
    answeredCount,
    correctCount,
    questionNumbers,
    started,
    countdown,
    remaining,
    timerRunning,
    timeUp,
    sectionDuration,
    toggleTimer,
    resetTimer,
    submitted,
    submit,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}
