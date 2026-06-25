/**
 * Firebase initialisation (modular SDK v12).
 *
 * The web config below is not secret — Firebase web keys are meant to ship in
 * the client. Real protection comes from Firebase Auth + Firestore Security
 * Rules + the project's Authorized Domains. Values can be overridden with
 * NEXT_PUBLIC_FIREBASE_* env vars (see .env.local.example); the literals are
 * the project defaults so the app works out of the box.
 *
 * Note on static export: `getAuth` / `getFirestore` are isomorphic and safe to
 * evaluate during the Node prerender. Analytics is browser-only and is loaded
 * lazily from the client (see initAnalytics) so it never touches the build.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCDni_c88MLbgKUeiEf6wFrluA9V4Z4Ocw",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "ielts-listening-hub.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "ielts-listening-hub",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "ielts-listening-hub.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "168944950775",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:168944950775:web:4f41ad0e91e5550e9a62f2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-N63Q4VEH6R",
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/**
 * Initialise Analytics on the client only, guarded by isSupported(). Safe to
 * call from a useEffect; resolves to null when unsupported (SSR, unsupported
 * browser, or when measurementId is absent).
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) return getAnalytics(app);
  } catch {
    /* analytics is optional — ignore failures */
  }
  return null;
}
