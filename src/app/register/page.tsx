"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authErrorMessage } from "@/lib/auth-errors";
import { usePostAuthRedirect } from "@/lib/use-auth-redirect";
import {
  AuthShell,
  Field,
  authInputClass,
  AuthError,
  SubmitButton,
} from "@/components/auth-shell";
import { GoogleButton, OrDivider } from "@/components/google-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  usePostAuthRedirect();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!email.trim()) return "Please enter your email address.";
    if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      });
      router.push("/verify-email");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register to access the IELTS Listening practice tests."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onError={setError} />
        <OrDivider />
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AuthError message={error} />

        <Field label="Full Name" id="name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputClass()}
            placeholder="Jane Doe"
          />
        </Field>

        <Field label="Phone Number" id="phone">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={authInputClass()}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Email Address" id="email">
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

        <Field label="Password" id="password" hint="At least 8 characters.">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass()}
            placeholder="••••••••"
          />
        </Field>

        <Field label="Confirm Password" id="confirm">
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInputClass()}
            placeholder="••••••••"
          />
        </Field>

        <SubmitButton loading={submitting}>Create Account</SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
