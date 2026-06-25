"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Headphones } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { RequireAuth } from "@/components/require-auth";
import { authErrorMessage } from "@/lib/auth-errors";
import {
  Field,
  authInputClass,
  AuthError,
  AuthSuccess,
} from "@/components/auth-shell";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { currentUser, profile, saveProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const email = profile?.email || currentUser?.email || "";

  // Seed fields once profile / user is available.
  useEffect(() => {
    setName(profile?.name || currentUser?.displayName || "");
    setPhone(profile?.phone || "");
  }, [profile, currentUser]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ name: name.trim(), phone: phone.trim() });
      setNotice("Profile updated.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex w-[95%] max-w-[1800px] items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-white/80" aria-hidden />
            <span className="text-base font-semibold tracking-tight">IELTS Listening Hub</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Update your name and phone. Email can&apos;t be changed.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
          noValidate
        >
          <AuthError message={error} />
          <AuthSuccess message={notice} />

          <Field label="Name" id="name">
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={authInputClass()}
            />
          </Field>

          <Field label="Phone" id="phone">
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={authInputClass()}
            />
          </Field>

          <Field label="Email" id="email" hint="Email address cannot be changed.">
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className={`${authInputClass()} cursor-not-allowed bg-muted text-muted-foreground`}
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}
