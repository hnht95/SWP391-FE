import React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, hasRole, user } = useAuth();

  // Handle guest-only routes
  if (allowedRoles.includes("guest")) {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
      } else if (user.role === "staff") {
        return <Navigate to="/staff" replace />;
      } else if (user.role === "renter") {
        return <Navigate to="/home" replace />;
      }
    }
    // Allow guest access
    return <>{children}</>;
  }

  // For authenticated routes, check if user is logged in
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Strict role checking - user must have exactly the required role
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Redirect to user's appropriate dashboard
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "staff") {
      return <Navigate to="/staff" replace />;
    } else if (user?.role === "renter") {
      return <Navigate to="/home" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
