"use client";

import Link from "next/link";
import { Headphones, ChevronLeft } from "lucide-react";
import { useTest } from "@/components/test-context";

/**
 * Fixed 70px chrome that stays pinned while the candidate scrolls.
 *   left   — brand + back-to-home
 *   center — current section + question range
 *   right  — live "answered" progress
 */
export function TestHeader() {
  const { test, answeredCount, questionNumbers } = useTest();
  const section = test.sections[0];
  const total = questionNumbers.length;

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[70px] border-b border-white/10 bg-navy text-navy-foreground">
      <div className="mx-auto flex h-full w-[95%] max-w-[1800px] items-center justify-between gap-4">
        {/* Brand / back */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to all tests"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <span className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-white/80" aria-hidden />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              IELTS Listening Hub
            </span>
          </span>
        </div>

        {/* Section / range */}
        <div className="hidden flex-col items-center leading-tight md:flex">
          <span className="text-sm font-semibold">{section?.title ?? "Section 1"}</span>
          <span className="text-xs text-white/60">
            Question{total > 1 ? "s" : ""} {section?.questionRange ?? "1-10"}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
          <span className="text-sm font-semibold tabular-nums">
            {answeredCount} / {total}
          </span>
          <span className="text-xs text-white/60">Answered</span>
        </div>
      </div>
    </header>
  );
}
