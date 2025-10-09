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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles are specified and user doesn't have required role
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Redirect based on user's actual role
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "staff") {
      return <Navigate to="/staff" replace />;
    } else if (user?.role === "renter") {
      return <Navigate to="/" replace />; // Home page for users
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
