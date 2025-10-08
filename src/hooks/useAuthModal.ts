import { createContext, useContext } from "react";

interface AuthModalContextType {
  showAuthModal: (options?: {
    message?: string;
    onSuccess?: () => void;
  }) => void;
  hideAuthModal: () => void;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
};
