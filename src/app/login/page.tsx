"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authErrorMessage } from "@/lib/auth-errors";
import {
  AuthShell,
  Field,
  authInputClass,
  AuthError,
  AuthSuccess,
  SubmitButton,
} from "@/components/auth-shell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onForgotPassword() {
    setError(null);
    setNotice(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter your email address above, then tap Forgot Password.");
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email.trim());
      setNotice("Password reset email sent.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Welcome back. Sign in to continue practising."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthError message={error} />
        <AuthSuccess message={notice} />

        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass()}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" id="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass()}
            placeholder="••••••••"
          />
        </Field>

        <SubmitButton loading={submitting}>Login</SubmitButton>

        <button
          type="button"
          onClick={onForgotPassword}
          disabled={resetting}
          className="w-full text-center text-sm font-medium text-primary hover:underline disabled:opacity-60"
        >
          {resetting ? "Sending reset email…" : "Forgot Password"}
        </button>
      </form>
    </AuthShell>
  );
}
