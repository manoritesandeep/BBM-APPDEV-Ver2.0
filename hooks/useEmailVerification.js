import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";
import {
  checkEmailVerification,
  updateUserVerificationStatus,
} from "../util/auth";

/**
 * Hook to periodically check email verification status
 * Useful for automatically updating verification status when user returns to app
 */
export function useEmailVerificationStatus() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const [isChecking, setIsChecking] = useState(false);

  const checkVerificationStatus = async () => {
    if (!authCtx.token || !authCtx.userId || userCtx.user?.emailVerified) {
      return false;
    }

    setIsChecking(true);
    try {
      const verificationStatus = await checkEmailVerification(authCtx.token);

      if (verificationStatus.emailVerified && !userCtx.user?.emailVerified) {
        // Update verification status in Firestore
        await updateUserVerificationStatus(authCtx.userId, true);

        // Update user context
        userCtx.updateUser({ emailVerified: true });

        return true; // Status changed
      }

      return false; // No change
    } catch (error) {
      console.warn("Failed to check verification status:", error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Check verification status when app becomes active
  useEffect(() => {
    if (
      authCtx.isAuthenticated &&
      userCtx.user &&
      !userCtx.user.emailVerified
    ) {
      checkVerificationStatus();
    }
  }, [authCtx.isAuthenticated, userCtx.user?.emailVerified]);

  return {
    checkVerificationStatus,
    isChecking,
  };
}

/**
 * Component that automatically checks email verification when app becomes active
 */
export function EmailVerificationChecker() {
  useEmailVerificationStatus();
  return null;
}

export default useEmailVerificationStatus;
