"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * Renders the admin importer link only for administrators (cached Firestore
 * role). For every other visitor — logged out or normal student — it renders
 * nothing, so the page's existence isn't advertised.
 */
export function AdminLink() {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
    >
      <Settings className="h-4 w-4" aria-hidden /> Admin · Import
    </Link>
  );
}
