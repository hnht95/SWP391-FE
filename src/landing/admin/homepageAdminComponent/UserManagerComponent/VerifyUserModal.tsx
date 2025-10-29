import React from "react";
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Verify User</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Active" value={user.isActive ? "Yes" : "No"} />
              <div className="mt-4 border-t pt-3">
                <InfoRow label="ID Number" value={user.kyc?.idNumber} />
                <InfoRow label="License Number" value={user.kyc?.licenseNumber as any} />
                <InfoRow label="Verified" value={user.kyc?.verified ? "Yes" : "No"} />
                {user.kyc?.verifiedAt && (
                  <InfoRow label="Verified At" value={new Date(user.kyc.verifiedAt).toLocaleString()} />
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <ImageBox label="ID Front" url={idFront} />
            <ImageBox label="ID Back" url={idBack} />
            <ImageBox label="License Front" url={licenseFront} />
            <ImageBox label="License Back" url={licenseBack} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Close</button>
          <button
            onClick={() => onApprove(user._id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <MdCheck className="w-5 h-5" />
            Update Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyUserModal;


