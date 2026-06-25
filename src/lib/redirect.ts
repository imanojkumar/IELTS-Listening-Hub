/**
 * Post-login redirect memory.
 *
 * When a guard bounces a logged-out user away from a protected page, it records
 * the intended path here; the login flow replays it after a successful sign-in
 * (Google or email), otherwise it falls back to /dashboard.
 *
 * Paths are stored WITHOUT the GitHub Pages basePath (they come from Next's
 * usePathname, which already strips it) so they can be handed straight back to
 * router.replace(), which re-adds the prefix.
 *
 * sessionStorage keeps this per-tab and avoids the useSearchParams Suspense
 * requirement that query params impose on a static export.
 */
const KEY = "auth:redirect";

export function setRedirect(path: string): void {
  try {
    if (path && path !== "/login" && path !== "/register") {
      sessionStorage.setItem(KEY, path);
    }
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/** Read and clear the stored path (one-shot). */
export function takeRedirect(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}

export function clearRedirect(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* non-fatal */
  }
}
