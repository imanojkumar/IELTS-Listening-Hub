"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * Access Denied. When the visitor is signed in (the common case for this page —
 * a logged-in non-admin who hit /admin), it surfaces their exact email and UID
 * with a copy button plus the precise Firestore path to grant admin. This turns
 * "why am I not admin?" into a one-glance, copy-paste fix and prevents the
 * look-alike-character UID mistake that silently denies access.
 */
export default function AccessDeniedPage() {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  async function copyUid() {
    if (!currentUser?.uid) return;
    try {
      await navigator.clipboard.writeText(currentUser.uid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex w-[95%] max-w-[1800px] items-center justify-between py-4">
          <Link href="/" className="text-base font-semibold tracking-tight">
            IELTS Listening Hub
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>

          {currentUser && (
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-1 break-all text-sm font-medium text-foreground">
                {currentUser.email}
              </p>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your account UID
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all rounded-md bg-card px-2 py-1.5 font-mono text-xs text-foreground">
                  {currentUser.uid}
                </code>
                <button
                  type="button"
                  onClick={copyUid}
                  aria-label="Copy UID"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Administrators are granted in Firestore. Create a document at{" "}
                <code className="rounded bg-card px-1 font-mono">roles/&lt;UID&gt;</code> with field{" "}
                <code className="rounded bg-card px-1 font-mono">role: &quot;admin&quot;</code>, using the{" "}
                <strong>exact</strong> UID above (copy it — don&apos;t retype it).
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
