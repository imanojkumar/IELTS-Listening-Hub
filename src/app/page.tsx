import Link from "next/link";
import { Headphones, Sparkles, ShieldCheck, Settings } from "lucide-react";
import { getTestSummaries } from "@/lib/tests";
import { TestCard } from "@/components/test-card";
import { AuthNav } from "@/components/auth-nav";

export default function HomePage() {
  const tests = getTestSummaries();

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="border-b border-border bg-navy text-navy-foreground">
        <div className="mx-auto w-[95%] max-w-[1800px] py-14 sm:py-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-medium text-white/70">
              <Headphones className="h-4 w-4" aria-hidden />
              IELTS General Training · Listening
            </span>
            <AuthNav />
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Practice listening the way the real exam feels.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
            Ten full CBT-style mock tests with embedded answer fields, instant auto-save,
            review flags, and a built-in answer key. No sign-up, works offline once loaded.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/test/${tests[0]?.id ?? 1}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> Start Test 01
            </Link>
            <a
              href="#tests"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse all tests
            </a>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            <Feature icon={<Sparkles className="h-4 w-4" />} title="Exam-style interface">
              Fixed audio bar, timer, and three-column layout modelled on real CBT screens.
            </Feature>
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Auto-saved answers">
              Every keystroke is stored locally — refresh anytime and pick up where you left off.
            </Feature>
            <Feature icon={<Settings className="h-4 w-4" />} title="Drop-in content">
              Add new tests by uploading a ZIP — no coding required.
            </Feature>
          </ul>
        </div>
      </section>

      {/* Tests grid */}
      <section id="tests" className="mx-auto w-[95%] max-w-[1800px] py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Available Tests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tests.length} practice {tests.length === 1 ? "test" : "tests"} · IELTS General Training
            </p>
          </div>
          <Link
            href="/admin"
            className="hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            <Settings className="h-4 w-4" aria-hidden /> Admin · Import
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-white/80">{icon}</span>
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{children}</p>
    </li>
  );
}
