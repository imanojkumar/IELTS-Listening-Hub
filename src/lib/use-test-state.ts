"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerState, ReviewState } from "@/lib/types";

interface PersistedState {
  answers: AnswerState;
  review: ReviewState;
  updatedAt: number;
}

function storageKey(testId: number) {
  return `ielts-hub:test:${testId}`;
}

function read(testId: number): PersistedState {
  if (typeof window === "undefined") return { answers: {}, review: {}, updatedAt: 0 };
  try {
    const raw = window.localStorage.getItem(storageKey(testId));
    if (!raw) return { answers: {}, review: {}, updatedAt: 0 };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      answers: parsed.answers ?? {},
      review: parsed.review ?? {},
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return { answers: {}, review: {}, updatedAt: 0 };
  }
}

/**
 * Answers + "review later" flags for one test, auto-persisted to
 * localStorage. Restores automatically on refresh.
 */
export function useTestState(testId: number) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [review, setReview] = useState<ReviewState>({});
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore on mount.
  useEffect(() => {
    const persisted = read(testId);
    setAnswers(persisted.answers);
    setReview(persisted.review);
    setHydrated(true);
  }, [testId]);

  // Debounced persist on any change (autosave — no save button).
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(
          storageKey(testId),
          JSON.stringify({ answers, review, updatedAt: Date.now() }),
        );
      } catch {
        /* storage full / disabled — fail quietly */
      }
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, review, hydrated, testId]);

  const setAnswer = useCallback((q: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [q]: value }));
  }, []);

  const clearAnswer = useCallback((q: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[String(q)];
      return next;
    });
  }, []);

  const toggleReview = useCallback((q: number) => {
    setReview((prev) => ({ ...prev, [q]: !prev[q] }));
  }, []);

  const resetAll = useCallback(() => {
    setAnswers({});
    setReview({});
    try {
      window.localStorage.removeItem(storageKey(testId));
    } catch {
      /* ignore */
    }
  }, [testId]);

  return {
    hydrated,
    answers,
    review,
    setAnswer,
    clearAnswer,
    toggleReview,
    resetAll,
  };
}
