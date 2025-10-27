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
  if (allowedRoles.includes("guest")) {
    // Guest routes are accessible to everyone, no redirect needed
    return <>{children}</>;
  }
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
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
