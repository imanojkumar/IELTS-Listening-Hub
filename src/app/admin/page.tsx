"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  Upload,
  FileCheck2,
  FileWarning,
  Download,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RequireAdmin } from "@/components/require-admin";

interface TestReport {
  file: string;
  ok: boolean;
  id?: number;
  title?: string;
  questions?: number;
  issues: string[];
  audioPresent?: boolean;
  imagePresent?: boolean;
}

interface ImportResult {
  tests: TestReport[];
  audioFiles: string[];
  imageFiles: string[];
  registry: unknown[];
}

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "title",
  "type",
  "audio",
  "totalQuestions",
  "durationSeconds",
  "sections",
  "answers",
] as const;

function basename(path: string) {
  return path.split("/").pop() ?? path;
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminImporter />
    </RequireAdmin>
  );
}

function AdminImporter() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleZip = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((f) => !f.dir);

      const testEntries = entries.filter((f) => /(^|\/)tests\/.+\.json$/i.test(f.name));
      const audioFiles = entries
        .filter((f) => /(^|\/)audio\/.+\.(mp3|m4a|ogg|wav)$/i.test(f.name))
        .map((f) => basename(f.name));
      const imageFiles = entries
        .filter((f) => /(^|\/)images\/.+\.(png|jpe?g|webp|gif|svg)$/i.test(f.name))
        .map((f) => basename(f.name));

      if (testEntries.length === 0) {
        throw new Error(
          "No test JSON files found. The ZIP must contain a /tests folder with testNN.json files.",
        );
      }

      const tests: TestReport[] = [];
      const registry: unknown[] = [];

      for (const entry of testEntries) {
        const report: TestReport = { file: basename(entry.name), ok: true, issues: [] };
        try {
          const raw = await entry.async("string");
          const json = JSON.parse(raw) as Record<string, unknown>;

          for (const field of REQUIRED_FIELDS) {
            if (!(field in json)) report.issues.push(`missing field "${field}"`);
          }

          report.id = typeof json.id === "number" ? json.id : undefined;
          report.title = typeof json.title === "string" ? json.title : undefined;

          const sections = Array.isArray(json.sections) ? json.sections : [];
          const answers =
            json.answers && typeof json.answers === "object"
              ? (json.answers as Record<string, unknown>)
              : {};
          report.questions =
            typeof json.totalQuestions === "number"
              ? json.totalQuestions
              : Object.keys(answers).length;

          // Cross-check audio reference.
          if (typeof json.audio === "string") {
            const audioName = basename(json.audio);
            report.audioPresent = audioFiles.includes(audioName);
            if (!report.audioPresent)
              report.issues.push(`audio "${audioName}" not found in /audio`);
          }
          if (typeof json.image === "string") {
            const imageName = basename(json.image);
            report.imagePresent = imageFiles.includes(imageName);
            if (!report.imagePresent)
              report.issues.push(`image "${imageName}" not found in /images`);
          }

          // Validate answers cover declared question numbers.
          const numbers = new Set<number>();
          for (const s of sections as Array<Record<string, unknown>>) {
            const groups = Array.isArray(s.groups) ? s.groups : [];
            for (const g of groups as Array<Record<string, unknown>>) {
              if (Array.isArray(g.numbers))
                for (const n of g.numbers as number[]) numbers.add(n);
            }
          }
          for (const n of numbers) {
            if (!(String(n) in answers)) report.issues.push(`no answer key for Q${n}`);
          }

          report.ok = report.issues.length === 0;

          if (report.id !== undefined) {
            registry.push({
              id: json.id,
              slug: json.slug,
              title: json.title,
              type: json.type,
              totalQuestions: json.totalQuestions,
              durationSeconds: json.durationSeconds,
              sectionCount: sections.length,
            });
          }
        } catch (err) {
          report.ok = false;
          report.issues.push(
            err instanceof Error ? `invalid JSON: ${err.message}` : "invalid JSON",
          );
        }
        tests.push(report);
      }

      registry.sort((a, b) => (a as { id: number }).id - (b as { id: number }).id);
      tests.sort((a, b) => (a.id ?? 999) - (b.id ?? 999));

      setResult({ tests, audioFiles, imageFiles, registry });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the ZIP file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      setError("Please choose a .zip file.");
      return;
    }
    void handleZip(file);
  };

  function downloadRegistry() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.registry, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registry.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = result?.tests.filter((t) => t.ok).length ?? 0;

  return (
    <div className="flex-1">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-[95%] max-w-4xl items-center gap-3 py-5">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Content Importer</h1>
            <p className="text-sm text-muted-foreground">
              Validate a content ZIP and generate the test registry.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-[95%] max-w-4xl space-y-8 py-10">
        {/* Structure help */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Expected ZIP structure</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed text-foreground">{`your-content.zip
├── tests/
│   ├── test01.json
│   └── test02.json
├── audio/
│   ├── test01.mp3
│   └── test02.mp3
└── images/
    ├── test01.png
    └── test02.png`}</pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Each <code className="rounded bg-muted px-1">testNN.json</code> must include{" "}
            {REQUIRED_FIELDS.join(", ")}. The importer validates every file, cross-checks that
            referenced audio and images exist, and produces a{" "}
            <code className="rounded bg-muted px-1">registry.json</code> for the homepage.
          </p>
        </section>

        {/* Dropzone */}
        <section>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFile(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
              dragging ? "border-secondary bg-accent/50" : "border-border bg-card",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-6 w-6" aria-hidden />
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              {busy ? "Reading ZIP…" : "Drag a content ZIP here, or"}
            </p>
            {!busy && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Choose file
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="sr-only"
              onChange={(e) => onFile(e.target.files)}
            />
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <FileWarning className="h-4 w-4 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <FileCheck2 className="h-4 w-4 text-success" aria-hidden />
                  {validCount}/{result.tests.length} tests valid
                </span>
                <span className="text-muted-foreground">{result.audioFiles.length} audio</span>
                <span className="text-muted-foreground">{result.imageFiles.length} images</span>
              </div>
              <button
                type="button"
                onClick={downloadRegistry}
                disabled={result.registry.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50"
              >
                <Download className="h-4 w-4" aria-hidden /> Download registry.json
              </button>
            </div>

            <ul className="space-y-2">
              {result.tests.map((t) => (
                <li
                  key={t.file}
                  className={cn(
                    "rounded-xl border p-4",
                    t.ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {t.ok ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
                      )}
                      <div>
                        <p className="font-mono text-sm font-semibold text-foreground">{t.file}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.title ?? "—"}
                          {t.questions ? ` · ${t.questions} questions` : ""}
                        </p>
                        {t.issues.length > 0 && (
                          <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-destructive">
                            {t.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {t.audioPresent !== undefined && (
                        <AssetChip ok={t.audioPresent} label="audio" />
                      )}
                      {t.imagePresent !== undefined && (
                        <AssetChip ok={t.imagePresent} label="image" />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-border bg-accent/40 p-5 text-sm text-foreground">
              <h3 className="font-semibold text-primary">Finish the import (one-time, no coding)</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
                <li>
                  Copy the ZIP&apos;s <code className="rounded bg-muted px-1">tests/*.json</code> into{" "}
                  <code className="rounded bg-muted px-1">src/data/tests/</code>.
                </li>
                <li>
                  Copy <code className="rounded bg-muted px-1">audio/*</code> into{" "}
                  <code className="rounded bg-muted px-1">public/audio/</code> and{" "}
                  <code className="rounded bg-muted px-1">images/*</code> into{" "}
                  <code className="rounded bg-muted px-1">public/images/</code>.
                </li>
                <li>
                  Run <code className="rounded bg-muted px-1">npm run build</code> — the registry is
                  regenerated automatically and the new tests appear on the homepage.
                </li>
              </ol>
              <p className="mt-2 text-xs">
                The downloaded <code className="rounded bg-muted px-1">registry.json</code> is also
                produced automatically by the build, so you only need it if you prefer to commit it
                directly.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AssetChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
      )}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}
