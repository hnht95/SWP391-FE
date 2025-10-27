import { useAuth } from "./useAuth";

/**
 * Hook to get role-based navigation paths
 */
export const useRoleBasedNavigation = () => {
  const { user, isAuthenticated } = useAuth();

  const getBasePath = () => {
    if (!isAuthenticated) return "";

    switch (user?.role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";

      default:
        return "";
    }
  };

  const getNavigationPaths = () => {
    const basePath = getBasePath();

    if (!isAuthenticated) {
      // Guest navigation
      return {
        home: "/",
        vehicles: "/vehicles",
        aboutus: "/aboutus",
        contactus: "/contactus",
        terms: "/terms",
        faq: "/faq",
        privacy: "/privacy",
        profile: null, // Not available for guests
        booking: null, // Not available for guests
      };
    }

    if (user?.role === "renter") {
      // Renter pages mostly mirror guest/public pages. Profile and booking remain renter-only.
      return {
        home: "/home",
        vehicles: "/vehicles",
        aboutus: "/aboutus",
        contactus: "/contactus",
        terms: "/terms",
        faq: "/faq",
        privacy: "/privacy",
        profile: "/profile",
        booking: (vehicleId: string) => `/booking/${vehicleId}`,
      };
    }

    // Staff and admin have their own interfaces
    return {
      home: basePath,
      vehicles: null,
      aboutus: null,
      contactus: null,
      terms: null,
      faq: null,
      privacy: null,
      profile: basePath, // Admin/Staff profile points to their dashboard
      booking: null,
    };
  };

  const getDashboardPath = () => {
    if (!isAuthenticated) return "/";

    switch (user?.role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "renter":
        return "/home";
      default:
        return "/";
    }
  };

  return {
    getBasePath,
    getNavigationPaths,
    getDashboardPath,
    currentRole: user?.role || "guest",
  };
};
