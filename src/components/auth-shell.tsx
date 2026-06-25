"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared chrome for the auth pages so register / login / verify / reset all
 * feel like the same platform — navy banner, centered white card, rounded.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      {/* Banner */}
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex w-[95%] max-w-[1800px] items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-white/80" aria-hidden />
            <span className="text-base font-semibold tracking-tight">IELTS Listening Hub</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
            Back to home
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* Small shared form primitives (kept local to the auth flow). */

export function Field({
  label,
  id,
  children,
  hint,
}: {
  label: string;
  id: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function authInputClass(invalid?: boolean) {
  return [
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors",
    "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    invalid ? "border-destructive" : "border-border",
  ].join(" ");
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
    >
      {message}
    </p>
  );
}

export function AuthSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-lg border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm font-medium text-success"
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  children,
  loading,
  disabled,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
