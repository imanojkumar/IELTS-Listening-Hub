/**
 * Role lookup backed by Firestore.
 *
 * Collection: `roles`, document id = Firebase Auth UID, shape: { role: "admin" }.
 * Administrators are provisioned by writing a `roles/{uid}` document from the
 * Firebase console (see the README). A missing document — or any role other
 * than "admin" — is treated as a normal student.
 *
 * IMPORTANT: the document id must equal the Auth UID *exactly*. Because Firebase
 * UIDs mix visually similar glyphs (lowercase "l" vs uppercase "I", "0" vs "O"),
 * always COPY the UID from the console rather than typing it — a single
 * look-alike character produces a document that getDoc() can never find, which
 * fails closed to "student". The /403 page surfaces the exact UID to copy.
 *
 * These are the single source of truth for authorization. The auth context
 * subscribes to roles/{uid} in real time (onSnapshot) so a role provisioned in
 * the console propagates to the live session without a re-login; getUserRole /
 * isAdmin remain available for one-off, non-reactive checks.
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "admin" | "student";

interface RoleDoc {
  role?: string;
}

/** Map a roles/{uid} document's data to a role. Missing/!admin → "student". */
export function roleFromData(data: RoleDoc | undefined): UserRole {
  return data?.role === "admin" ? "admin" : "student";
}

/** Read roles/{uid}; defaults to "student" when missing or on any error. */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, "roles", uid));
    const role = roleFromData(snap.exists() ? (snap.data() as RoleDoc) : undefined);

    if (role !== "admin" && process.env.NODE_ENV !== "production") {
      console.info(
        `[roles] No admin role for uid "${uid}" ` +
          `(roles/${uid} ${snap.exists() ? `exists, role="${(snap.data() as RoleDoc).role}"` : "not found"}). Treating as student.`,
      );
    }
    return role;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[roles] Role lookup failed for uid "${uid}":`, err);
    }
    // unreadable / offline → least privilege
    return "student";
  }
}

/** True only when roles/{uid}.role === "admin". */
export async function isAdmin(uid: string): Promise<boolean> {
  return (await getUserRole(uid)) === "admin";
}
