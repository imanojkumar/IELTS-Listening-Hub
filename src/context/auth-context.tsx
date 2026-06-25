"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, initAnalytics } from "@/lib/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateLastLogin,
  type UserProfile,
} from "@/lib/user";
import { roleFromData, type UserRole } from "@/lib/roles";

interface RegisterInput {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  currentUser: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<boolean>; // returns latest emailVerified
  saveProfile: (patch: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  // Bumped to force a context re-render when a mutation happens on the same
  // Firebase User object reference (e.g. after reload()), without replacing the
  // real User instance with a plain object (which would drop its prototype).
  const [tick, setTick] = useState(0);

  // Analytics is optional and browser-only.
  useEffect(() => {
    void initAnalytics();
  }, []);

  // Auth + role state.
  //
  // Auth state is the trigger; the role is kept in sync with Firestore via a
  // real-time onSnapshot listener so a role provisioned in the console reaches
  // the live session without a re-login. Invariants enforced here:
  //   - exactly one role listener at a time (the previous one is detached
  //     before a new one is attached, so account switches / token refreshes
  //     never leak or duplicate listeners),
  //   - `loading` stays true until the FIRST role snapshot resolves, so guards
  //     never act on a not-yet-known role,
  //   - everything is torn down on unmount.
  useEffect(() => {
    let detachRole: (() => void) | null = null;

    const teardownRole = () => {
      if (detachRole) {
        detachRole();
        detachRole = null;
      }
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Always drop any prior role listener first.
      teardownRole();
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // A (new) signed-in user: resolve again before guards may proceed.
      setLoading(true);
      setRole(null);

      // Profile is mostly static — fetch once, independent of the role stream.
      getUserProfile(user.uid)
        .then(setProfile)
        .catch(() => setProfile(null));

      // Subscribe to roles/{uid} in real time.
      detachRole = onSnapshot(
        doc(db, "roles", user.uid),
        (snap) => {
          const nextRole = roleFromData(snap.exists() ? snap.data() : undefined);
          setRole(nextRole);
          setLoading(false);
          if (nextRole !== "admin" && process.env.NODE_ENV !== "production") {
            console.info(
              `[roles] roles/${user.uid} ${snap.exists() ? `role="${snap.data().role}"` : "not found"} → student`,
            );
          }
        },
        (error) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[roles] snapshot listener failed:", error);
          }
          setRole("student"); // fail closed
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth();
      teardownRole();
    };
  }, []);

  const register = useCallback(async ({ name, phone, email, password }: RegisterInput) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateAuthProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    await createUserProfile({
      uid: cred.user.uid,
      name,
      phone,
      email,
      emailVerified: cred.user.emailVerified,
      provider: "password",
    });
    setProfile(await getUserProfile(cred.user.uid));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      // Do not keep an unverified session around.
      await signOut(auth);
      const err = new Error("Please verify your email address before logging in.");
      err.name = "EmailNotVerified";
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;

    // Google accounts are already verified; ensure a Firestore profile exists.
    const existing = await getUserProfile(user.uid);
    if (!existing) {
      await createUserProfile({
        uid: user.uid,
        name: user.displayName ?? "",
        phone: user.phoneNumber ?? "",
        email: user.email ?? "",
        emailVerified: true,
        provider: "google",
        photoURL: user.photoURL ?? "",
      });
    } else {
      try {
        await updateLastLogin(user.uid);
      } catch {
        /* non-fatal */
      }
    }
    setProfile(await getUserProfile(user.uid));
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const resendVerification = useCallback(async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser; // same instance, mutated in place
    setCurrentUser(refreshed);
    setTick((t) => t + 1); // force consumers to re-read the mutated fields
    if (refreshed.emailVerified && profile && !profile.emailVerified) {
      try {
        await updateUserProfile(refreshed.uid, { emailVerified: true });
        setProfile({ ...profile, emailVerified: true });
      } catch {
        /* non-fatal */
      }
    }
    return refreshed.emailVerified;
  }, [profile]);

  const saveProfile = useCallback(
    async (patch: { name?: string; phone?: string }) => {
      if (!auth.currentUser) throw new Error("Not signed in.");
      await updateUserProfile(auth.currentUser.uid, patch);
      if (patch.name) await updateAuthProfile(auth.currentUser, { displayName: patch.name });
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      profile,
      role,
      isAdmin: role === "admin",
      loading,
      register,
      login,
      signInWithGoogle,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
      saveProfile,
    }),
    [
      currentUser,
      profile,
      role,
      loading,
      tick,
      register,
      login,
      signInWithGoogle,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
      saveProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
