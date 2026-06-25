"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Headphones } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { setRedirect } from "@/lib/redirect";

/**
 * Client-side route guard. On a static-export site there is no server
 * middleware, so protection happens here: once auth state resolves, an
 * unauthenticated visitor is sent to /login and a signed-in but unverified
 * visitor is sent to /verify-email. While resolving (or about to redirect) a
 * full-screen loader is shown so protected content never flashes.
 */
export function RequireAuth({
  children,
  requireVerified = true,
}: {
  children: ReactNode;
  requireVerified?: boolean;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const verifiedOk = !requireVerified || Boolean(currentUser?.emailVerified);
  const allowed = Boolean(currentUser) && verifiedOk;

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      setRedirect(pathname);
      router.replace("/login");
    } else if (requireVerified && !currentUser.emailVerified) {
      router.replace("/verify-email");
    }
  }, [loading, currentUser, requireVerified, pathname, router]);

  if (loading || !allowed) return <AuthLoader />;
  return <>{children}</>;
}

export function AuthLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-navy text-white">
        <Headphones className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
