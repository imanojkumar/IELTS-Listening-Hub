"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { takeRedirect } from "@/lib/redirect";

/**
 * Single declarative redirect for the auth pages.
 *
 * Once auth state has resolved and the user is verified, sends them to their
 * remembered path (set by a guard before bouncing them to /login) or the
 * dashboard. Centralising this here means:
 *   - a logged-in visitor never sits on /login or /register,
 *   - Google and email sign-in share ONE redirect path (no competing
 *     router.replace() calls racing to consume the one-shot redirect).
 *
 * Unverified users (just-registered email accounts) are intentionally ignored
 * so the register flow can route them to /verify-email instead.
 */
export function usePostAuthRedirect() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser?.emailVerified) {
      router.replace(takeRedirect() ?? "/dashboard");
    }
  }, [loading, currentUser, router]);
}
