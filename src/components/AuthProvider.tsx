// contexts/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType, User } from "../contexts/AuthContext";
import {
  logout as logoutApi,
  getCurrentUser,
} from "../service/apiUser/auth/API";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGlobalLoader, setShowGlobalLoader] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
        fetchCurrentUser();
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();

      console.log("✅ Fetch current user response:", response);

      if (response.success && response.data) {
        const userData = response.data;

        // ✅ Extract avatar URL from avatarUrl object
        let avatarUrl: string | undefined;
        if (userData.avatarUrl) {
          if (
            typeof userData.avatarUrl === "object" &&
            "url" in userData.avatarUrl
          ) {
            avatarUrl = userData.avatarUrl.url;
          } else if (typeof userData.avatarUrl === "string") {
            avatarUrl = userData.avatarUrl;
          }
        }

        const updatedUser: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: avatarUrl || userData.avatar,
          phone: userData.phone,
        };

        console.log("✅ Updated user with avatar:", updatedUser);

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (loginData: { token: string; user: User }) => {
    const { token: newToken, user: newUser } = loginData;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    hasRole,
    showGlobalLoading: () => setShowGlobalLoader(true),
    hideGlobalLoading: () => setShowGlobalLoader(false),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {showGlobalLoader ? (
        <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <motion.div
              className="rounded-full h-16 w-16 border border-black/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full h-16 w-16 border-t border-black/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full h-12 w-12 border-t border-r border-black"
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-black" />
            </motion.div>
          </div>
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
