/**
 * Formats Firebase authentication errors into clear, actionable, user-friendly messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const errorCode = error?.code || '';
  const errorMessage = error?.message || String(error);

  // Match known Firebase Auth error codes
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid email.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Firebase service error. Logged in with local guest session.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in Firebase console.';
    default:
      if (errorMessage.includes('ID Token')) {
        return 'Google Sign-In configuration error. Please try signing in with Email or Guest mode.';
      }
      if (errorMessage.includes('network') || errorMessage.includes('FETCH_FAILED')) {
        return 'Unable to reach authentication server. Please check your internet connection.';
      }
      // Clean up raw Firebase error prefixes if present
      return errorMessage.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[^)]+\)\.?/i, '').trim() || 'Authentication failed. Please try again.';
  }
}
