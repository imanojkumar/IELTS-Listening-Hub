"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  History,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { RequireAuth } from "@/components/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const { currentUser, profile, logout } = useAuth();
  const router = useRouter();

  const name = profile?.name || currentUser?.displayName || "Student";
  const email = profile?.email || currentUser?.email || "";
  const phone = profile?.phone || "—";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      {/* Header */}
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex w-[95%] max-w-[1800px] items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-white/80" aria-hidden />
            <span className="text-base font-semibold tracking-tight">IELTS Listening Hub</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto w-[95%] max-w-5xl flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome, {name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pick up where you left off or review your details.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Continue Practice */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Continue Practice</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into any of the listening mock tests.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Browse Tests <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>

          {/* Previous Tests */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <History className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Previous Tests</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your recent attempts will appear here.</p>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
              No test history available yet.
            </div>
          </section>

          {/* Profile */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <UserIcon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                  <p className="text-sm text-muted-foreground">Your account details.</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Edit Profile
              </Link>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DetailItem label="Name" value={name} />
              <DetailItem label="Phone" value={phone} />
              <DetailItem label="Email" value={email} />
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
