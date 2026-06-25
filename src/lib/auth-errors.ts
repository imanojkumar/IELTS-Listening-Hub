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
      default:
        break;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
