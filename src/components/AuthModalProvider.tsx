import React, { useState } from "react";
import AuthModal from "./AuthModal";
import { AuthModalContext } from "../hooks/useAuthModal";

interface AuthModalProviderProps {
  children: React.ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Please login to continue");
  const [onSuccessCallback, setOnSuccessCallback] = useState<
    (() => void) | undefined
  >();

  const showAuthModal = (options?: {
    message?: string;
    onSuccess?: () => void;
  }) => {
    setModalMessage(options?.message || "Please login to continue");
    setOnSuccessCallback(() => options?.onSuccess);
    setIsModalOpen(true);
  };

  const hideAuthModal = () => {
    setIsModalOpen(false);
    setModalMessage("Please login to continue");
    setOnSuccessCallback(undefined);
  };

  const handleSuccess = () => {
    if (onSuccessCallback) {
      onSuccessCallback();
    }
    hideAuthModal();
  };

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}
      <AuthModal
        isOpen={isModalOpen}
        onClose={hideAuthModal}
        message={modalMessage}
        onSuccess={handleSuccess}
      />
    </AuthModalContext.Provider>
  );
};
