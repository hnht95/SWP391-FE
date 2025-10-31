import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MdClose, MdCheck } from "react-icons/md";
import type { RawApiUser } from "../../../../types/userTypes";

export interface VerifyUserModalProps {
  user: RawApiUser | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string) => Promise<void>;
}

const getKycImageUrl = (img?: any): string | null => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (typeof img === "object" && img.url) return img.url as string;
  return null;
};

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex justify-between py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium">{value ?? "N/A"}</span>
  </div>
);

const ImageBox = ({ label, url }: { label: string; url: string | null }) => (
  <div>
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    {url ? (
      <img src={url} alt={label} className="w-full h-44 object-cover rounded-lg border" />
    ) : (
      <div className="w-full h-44 rounded-lg border flex items-center justify-center text-gray-400 text-sm">
        No image
      </div>
    )}
  </div>
);

const VerifyUserModal: React.FC<VerifyUserModalProps> = ({ user, isOpen, onClose, onApprove }) => {
  if (!isOpen || !user) return null;

  const idFront = getKycImageUrl(user.kyc?.idFrontImage as any);
  const idBack = getKycImageUrl(user.kyc?.idBackImage as any);
  const licenseFront = getKycImageUrl(user.kyc?.licenseFrontImage as any);
  const licenseBack = getKycImageUrl(user.kyc?.licenseBackImage as any);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
            >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Verification</h3>
            <p className="text-xs text-gray-500">Review KYC documents before approving</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left info card */}
            <div className="md:col-span-1">
              <div className="rounded-xl border bg-white shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h4 className="text-sm font-semibold text-gray-800">User Details</h4>
                </div>
                <div className="px-5 py-4">
                  <InfoRow label="Name" value={user.name} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Phone" value={user.phone} />
                  <InfoRow label="Gender" value={user.gender} />
                  <InfoRow label="Role" value={user.role} />
                  <InfoRow label="Active" value={user.isActive ? "Yes" : "No"} />
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">KYC</h5>
                    <InfoRow label="ID Number" value={user.kyc?.idNumber} />
                    <InfoRow label="License Number" value={user.kyc?.licenseNumber as any} />
                    <InfoRow label="Verified" value={user.kyc?.verified ? "Yes" : "No"} />
                    {user.kyc?.verifiedAt && (
                      <InfoRow label="Verified At" value={new Date(user.kyc.verifiedAt).toLocaleString()} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right image grid */}
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm font-semibold text-gray-800 mb-2">ID Card</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full h-48 rounded-lg border overflow-hidden bg-gray-50">
                  {idFront ? (
                      <img src={idFront} alt="ID Front" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>
                  <div className="w-full h-48 rounded-lg border overflow-hidden bg-gray-50">
                    {idBack ? (
                      <img src={idBack} alt="ID Back" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-gray-800 mb-2">Driver License</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full h-48 rounded-lg border overflow-hidden bg-gray-50">
                    {licenseFront ? (
                      <img src={licenseFront} alt="License Front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                    )}
                  </div>
                  <div className="w-full h-48 rounded-lg border overflow-hidden bg-gray-50">
                    {licenseBack ? (
                      <img src={licenseBack} alt="License Back" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <FooterActions userId={user._id} onApprove={onApprove} onClose={onClose} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const FooterActions = ({ userId, onApprove, onClose }: { userId: string; onApprove: (id: string) => Promise<void>; onClose: () => void }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const handleApprove = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onApprove(userId);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t bg-white">
      <button
        onClick={onClose}
        disabled={submitting}
        className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm disabled:opacity-60"
      >
        Close
      </button>
      <button
        onClick={handleApprove}
        disabled={submitting}
        className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold shadow-md transition-all duration-100 hover:bg-white hover:text-black hover:shadow-lg disabled:opacity-70"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
            Processing...
          </span>
        ) : (
          <>
            <MdCheck className="w-5 h-5" />
            Update Verify
          </>
        )}
      </button>
    </div>
  );
};

export default VerifyUserModal;


