"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { clearRedirect } from "@/lib/redirect";

/**
 * Auth-aware navigation for the (public) homepage hero. Renders nothing until
 * auth state resolves to avoid a flicker between logged-in/out states.
 */
export function AuthNav() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const signedIn = Boolean(currentUser?.emailVerified);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return <div className="h-9 w-40" aria-hidden />;
  }

  if (signedIn) {
    return (
      <nav className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:scale-[1.02]"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden /> Dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Logout
        </button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/login"
        onClick={() => clearRedirect()}
        className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:scale-[1.02]"
      >
        Sign In
      </Link>
    </nav>
  );
}
