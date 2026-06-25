"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { authErrorMessage, isPopupCancel } from "@/lib/auth-errors";

/** Google "G" mark. */
function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.27a12 12 0 0 0 0 10.74l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export function GoogleButton({
  onError,
  label = "Continue with Google",
}: {
  onError?: (message: string | null) => void;
  label?: string;
}) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    onError?.(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      // Navigation is handled by usePostAuthRedirect() on the auth page once
      // auth state resolves — a single source of truth for the redirect.
    } catch (err) {
      if (!isPopupCancel(err)) onError?.(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleMark />
      {busy ? "Connecting…" : label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
