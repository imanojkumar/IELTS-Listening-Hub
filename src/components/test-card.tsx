import Link from "next/link";
import { Headphones, ListChecks, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TestSummary } from "@/lib/types";

function approxMinutes(seconds: number) {
  const m = Math.max(1, Math.round(seconds / 60));
  return `Approx ${m} min`;
}

export function TestCard({ test }: { test: TestSummary }) {
  const number = String(test.id).padStart(2, "0");
  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between bg-navy px-5 py-4 text-navy-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Headphones className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-medium text-white/70">IELTS General Listening</span>
        </div>
        <span className="font-display text-2xl font-bold tabular-nums tracking-tight">
          {number}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Test {number}</h3>
        <Badge variant="accent" className="mt-2 w-fit">
          {test.type}
        </Badge>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" aria-hidden /> Questions
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{test.totalQuestions}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Duration
            </dt>
            <dd className="mt-0.5 font-semibold">{approxMinutes(test.durationSeconds)}</dd>
          </div>
        </dl>

        <Link
          href={`/test/${test.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}
        >
          Start Test
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
