"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

/**
 * The test runner is an immersive, full-height CBT screen with its own fixed
 * bottom action bar, so the global footer would render *underneath* that bar
 * and be partially obscured. Hide it on /test/* routes; show it everywhere
 * else (home, auth pages, dashboard, profile, admin, 403).
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/test/")) return null;
  return <SiteFooter />;
}
