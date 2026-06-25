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
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  type User,
} from "firebase/auth";
import { auth, initAnalytics } from "@/lib/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/lib/user";

interface RegisterInput {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Analytics is optional and browser-only.
  useEffect(() => {
    void initAnalytics();
  }, []);

  // Single source of truth for auth state.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setProfile(await getUserProfile(user.uid));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
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
    const refreshed = auth.currentUser;
    setCurrentUser({ ...refreshed } as User);
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
      loading,
      register,
      login,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
      saveProfile,
    }),
    [
      currentUser,
      profile,
      loading,
      register,
      login,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
      saveProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
