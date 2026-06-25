/**
 * Firestore user-profile model and helpers.
 *
 * Collection: `users`, document id = Firebase Auth UID.
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface NewProfileInput {
  uid: string;
  name: string;
  phone: string;
  email: string;
  emailVerified: boolean;
}

const usersDoc = (uid: string) => doc(db, "users", uid);

/** Create the user's Firestore document at registration time. */
export async function createUserProfile(input: NewProfileInput): Promise<void> {
  await setDoc(usersDoc(input.uid), {
    uid: input.uid,
    name: input.name,
    phone: input.phone,
    email: input.email,
    emailVerified: input.emailVerified,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Fetch a user's profile, or null if it doesn't exist yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(usersDoc(uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Patch editable profile fields (name, phone). Email is immutable. */
export async function updateUserProfile(
  uid: string,
  patch: { name?: string; phone?: string; emailVerified?: boolean },
): Promise<void> {
  await updateDoc(usersDoc(uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
