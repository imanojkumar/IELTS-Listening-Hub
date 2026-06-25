import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Prefix a public asset (audio/image) with the deployment basePath. */
export function asset(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}

/** Prefix an internal route with basePath (for plain <a>/window navigation). */
export function route(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}

/** mm:ss from seconds. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Normalise a string for forgiving answer comparison. */
function norm(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?'"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\u00a3|\$|€/g, ""); // drop stray currency symbols
}

/** Is `given` an acceptable answer among `accepted`? */
export function isAnswerCorrect(
  given: string | undefined,
  accepted: string[] | undefined,
): boolean {
  if (!given || !accepted || accepted.length === 0) return false;
  const g = norm(given);
  if (!g) return false;
  return accepted.some((a) => norm(a) === g);
}

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;
