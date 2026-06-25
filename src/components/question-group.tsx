"use client";

import type { QuestionGroup, ChoiceQuestion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Segments } from "@/components/segments";
import { useTest } from "@/components/test-context";
import { cn } from "@/lib/utils";

export function QuestionGroupCard({ group }: { group: QuestionGroup }) {
  return (
    <section
      id={`group-${group.id}`}
      className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      aria-label={`Questions ${group.range}`}
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="accent" className="text-sm">
          Questions {group.range}
        </Badge>
        <Badge variant="muted">
          {group.marks} {group.marks === 1 ? "mark" : "marks"}
        </Badge>
      </header>

      <div className="space-y-1.5">
        <p className="text-[15px] text-foreground">{group.instructions}</p>
        {group.wordLimit && (
          <p className="text-[15px] text-foreground">
            {renderWordLimit(group.wordLimit)}
          </p>
        )}
      </div>

      {group.heading && (
        <h3 className="mt-6 text-center text-base font-semibold text-primary">{group.heading}</h3>
      )}

      <div className="mt-5">
        <GroupBody group={group} />
      </div>
    </section>
  );
}

/** Bold the capitalised word-limit instruction the way IELTS papers do. */
function renderWordLimit(text: string) {
  const m = text.match(/^(Write )(.*?)( for each (?:answer|blank)\.)$/i);
  if (!m) return text;
  return (
    <>
      {m[1]}
      <strong className="font-bold">{m[2]}</strong>
      {m[3]}
    </>
  );
}

function GroupBody({ group }: { group: QuestionGroup }) {
  switch (group.type) {
    case "table":
      return <TableBody group={group} />;
    case "form":
      return <FormBody group={group} />;
    case "notes":
      return <NotesBody group={group} />;
    case "multiple-choice":
    case "dropdown":
    case "pick-from-list":
    case "checkbox":
      return <ChoiceBody group={group} />;
    default:
      // Sentence/short-answer reuse the notes layout (line + blank).
      return group.noteLines ? <NotesBody group={group} /> : null;
  }
}

function FormBody({ group }: { group: QuestionGroup }) {
  if (!group.formRows) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <dl className="divide-y divide-border">
        {group.formRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[minmax(8rem,11rem)_1fr] gap-x-4 px-4 py-3 sm:px-5">
            <dt className="self-baseline pt-1.5 text-sm font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="self-baseline text-[15px] text-foreground">
              <Segments segments={row.segments} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TableBody({ group }: { group: QuestionGroup }) {
  if (!group.tableColumns || !group.tableRows) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-[15px]">
        <thead>
          <tr className="bg-muted/70">
            {group.tableColumns.map((c, i) => (
              <th
                key={i}
                scope="col"
                className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {group.tableRows.map((row, r) => (
            <tr key={r} className="align-top">
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-4 text-foreground">
                  <Segments segments={cell.segments} blankWidth="sm" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotesBody({ group }: { group: QuestionGroup }) {
  if (!group.noteLines) return null;
  return (
    <div className="rounded-xl border border-border px-5 py-4 sm:px-6">
      <ul className="space-y-2.5">
        {group.noteLines.map((line, i) => {
          if (line.heading) {
            return (
              <li key={i} className={cn("text-sm font-bold uppercase tracking-wide text-primary", i > 0 && "pt-3")}>
                <Segments segments={line.segments} />
              </li>
            );
          }
          return (
            <li key={i} className="flex gap-2.5 text-[15px] text-foreground">
              {line.bullet && <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />}
              <span className={cn(!line.bullet && "pl-0")}>
                <Segments segments={line.segments} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Choice-style questions (multiple choice, dropdown, pick-from-list, checkbox). */
function ChoiceBody({ group }: { group: QuestionGroup }) {
  if (!group.questions) return null;
  return (
    <div className="space-y-6">
      {group.questions.map((q) => (
        <ChoiceItem key={q.number} q={q} multiple={group.type === "checkbox" || q.multiple} />
      ))}
    </div>
  );
}

function ChoiceItem({ q, multiple }: { q: ChoiceQuestion; multiple?: boolean }) {
  const { answers, setAnswer, isCorrect, isAnswered, showAnswers, setCurrentQuestion, test } = useTest();
  const current = answers[q.number] ?? "";
  const selected = new Set(current ? current.split("|") : []);
  const accepted = test.answers[String(q.number)] ?? [];

  function toggle(value: string) {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      setAnswer(q.number, [...next].join("|"));
    } else {
      setAnswer(q.number, value);
    }
    setCurrentQuestion(q.number);
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-3 flex gap-2 text-[15px] font-medium text-foreground">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-bold text-white tabular-nums">
          {q.number}
        </span>
        {q.prompt}
      </p>
      <div className="space-y-2">
        {q.options.map((opt) => {
          const isSel = selected.has(opt.value);
          const correctOpt = showAnswers && accepted.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              disabled={showAnswers}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                isSel ? "border-secondary bg-accent" : "border-border hover:bg-muted",
                correctOpt && "border-success bg-success/10",
                showAnswers && isSel && !correctOpt && "border-destructive bg-destructive/10",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-bold",
                  multiple ? "rounded-md" : "rounded-full",
                  isSel ? "border-secondary bg-secondary text-white" : "border-muted-foreground/40 text-muted-foreground",
                )}
              >
                {opt.value}
              </span>
              <span className="text-foreground">{opt.text}</span>
            </button>
          );
        })}
      </div>
      {showAnswers && !isCorrect(q.number) && (
        <p className="mt-2 text-xs font-medium text-success">
          Correct answer: {accepted.join(" / ")}
          {!isAnswered(q.number) && " (not answered)"}
        </p>
      )}
    </div>
  );
}
