"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { authErrorMessage } from "@/lib/auth-errors";
import { AuthShell, AuthError, AuthSuccess } from "@/components/auth-shell";

export default function VerifyEmailPage() {
  const { currentUser, resendVerification, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"resend" | "check" | null>(null);

  const email = currentUser?.email ?? "your email address";

  async function onResend() {
    setError(null);
    setNotice(null);
    setBusy("resend");
    try {
      await resendVerification();
      setNotice("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onCheck() {
    setError(null);
    setNotice(null);
    setBusy("check");
    try {
      const verified = await refreshUser();
      if (verified) router.replace("/dashboard");
      else setError("Not verified yet. Click the link in the email, then try again.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function onGoToLogin() {
    await logout();
    router.push("/login");
  }

  return (
    <AuthShell title="Verify your email" subtitle="One quick step before you start.">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-secondary/30 bg-accent/50 p-4">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="text-sm text-foreground">
            <p className="font-medium">Check your inbox.</p>
            <p className="mt-1 text-muted-foreground">
              We have sent a verification email to{" "}
              <span className="font-semibold text-foreground">{email}</span>. Please verify your
              email before logging in.
            </p>
          </div>
        </div>

        <AuthError message={error} />
        <AuthSuccess message={notice} />

        <div className="space-y-2.5">
          {currentUser && (
            <button
              type="button"
              onClick={onCheck}
              disabled={busy !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy === "check" ? "Checking…" : "I've verified — continue"}
            </button>
          )}

          <button
            type="button"
            onClick={onResend}
            disabled={busy !== null || !currentUser}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {busy === "resend" ? "Sending…" : "Resend Email"}
          </button>

          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full text-center text-sm font-medium text-primary hover:underline"
          >
            Go To Login
          </button>
        </div>

        {!currentUser && (
          <p className="text-xs text-muted-foreground">
            Tip: to resend a verification email, log in first — we&apos;ll bring you back here if
            your address still needs verifying.
          </p>
        )}
      </div>
    </AuthShell>
  );
}
