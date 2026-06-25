/** Translate Firebase Auth error codes into human-friendly messages. */
export function authErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    // Our own thrown signal for unverified email.
    if ("name" in err && (err as { name?: string }).name === "EmailNotVerified") {
      return "Please verify your email address before logging in.";
    }
    const code = "code" in err ? String((err as { code?: string }).code) : "";
    switch (code) {
      case "auth/invalid-email":
        return "That email address looks invalid.";
      case "auth/email-already-in-use":
        return "An account already exists with this email. Try logging in.";
      case "auth/weak-password":
        return "Password is too weak — use at least 8 characters.";
      case "auth/missing-password":
        return "Please enter a password.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/popup-blocked":
        return "Your browser blocked the sign-in popup. Allow popups and try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email. Sign in with your email and password instead.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/unauthorized-domain":
        return "This domain isn't authorised for sign-in. Add it in Firebase Auth settings.";
      default:
        break;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

/** True when the user simply dismissed the Google popup — not a real error. */
export function isPopupCancel(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: string }).code);
    return code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request";
  }
  return false;
}
