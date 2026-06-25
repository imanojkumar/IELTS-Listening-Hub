"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { setRedirect } from "@/lib/redirect";
import { AuthLoader } from "@/components/require-auth";

/**
 * Guards the importer using the cached Firestore role. Unauthenticated visitors
 * go to /login (remembering /admin so they return after signing in);
 * authenticated non-administrators go to /403. The protected children never
 * render for anyone whose role isn't "admin", so the importer can't flash.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      setRedirect(pathname);
      router.replace("/login");
    } else if (!isAdmin) {
      router.replace("/403");
    }
  }, [loading, currentUser, isAdmin, pathname, router]);

  if (loading || !currentUser || !isAdmin) return <AuthLoader />;
  return <>{children}</>;
}
