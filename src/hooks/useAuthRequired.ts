import { useAuth } from "./useAuth";
import { useAuthModal } from "./useAuthModal";

/**
 * Hook to handle authentication-required actions
 * Returns a function that checks auth before executing action
 */
export const useAuthRequired = () => {
  const { isAuthenticated, user } = useAuth();
  const { showAuthModal } = useAuthModal();

  const requireAuth = (
    action: () => void,
    options?: {
      requireRole?: string[];
      message?: string;
    }
  ) => {
    const { requireRole = ["renter"], message = "Please login to continue" } =
      options || {};

    // Check if user is authenticated
    if (!isAuthenticated) {
      showAuthModal({
        message,
        onSuccess: action,
      });
      return;
    }

    // Check if user has required role
    if (requireRole.length > 0 && user && !requireRole.includes(user.role)) {
      showAuthModal({
        message: `This feature is not available for ${user.role} users. Please login with appropriate role.`,
        onSuccess: () => {}, // Empty success callback for role mismatch
      });
      return;
    }

    // All checks passed, execute the action
    action();
  };

  return { requireAuth, isAuthenticated, user };
};
