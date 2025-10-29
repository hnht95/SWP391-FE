import React, { useEffect, useMemo, useState } from "react";
import { MdSearch, MdVisibility } from "react-icons/md";
import { PageTransition } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import { getRenters, verifyUserKyc, type GetRentersResponse } from "../../../../service/apiAdmin/apiListUser/API";
import type { RawApiUser } from "../../../../types/userTypes";
import VerifyUserModal from "./VerifyUserModal";

const hasAllKycFields = (u: RawApiUser): boolean => {
  const k = u.kyc || ({} as any);
  const required = [
    k.idNumber,
    k.licenseNumber,
    k.idFrontImage,
    k.idBackImage,
    k.licenseFrontImage,
    k.licenseBackImage,
  ];
  return required.every((v) => v !== undefined && v !== null && String(v).trim() !== "");
};

const UserVerification: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renters, setRenters] = useState<RawApiUser[]>([]);

  const [selectedUser, setSelectedUser] = useState<RawApiUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: GetRentersResponse = await getRenters({ page, limit, q: search });
      setTotal(res.total ?? 0);
      setRenters(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load renters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const candidates = useMemo(
    () =>
      (renters || [])
        .filter((u) => u.role === "renter")
        .filter((u) => !u.kyc?.verified)
        .filter((u) => hasAllKycFields(u))
        .filter((u) => {
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone || "").toLowerCase().includes(q)
          );
        }),
    [renters, search]
  );

  const totalPages = Math.ceil(total / limit) || 1;

  const openModal = (u: RawApiUser) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const approve = async (userId: string) => {
    await verifyUserKyc(userId);
    closeModal();
    fetchRenters();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageTitle
          title="User Verification"
          subtitle="Review KYC documents and approve eligible renters"
        />

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRenters()}
                placeholder="Search name, email, phone"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={() => {
                setPage(1);
                fetchRenters();
              }}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
            >
              Search
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">Loading...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">{error}</div>
          ) : candidates.length === 0 ? (
            <div className="p-10 text-center text-gray-600">No users need verification.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC Numbers</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {candidates.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">ID: {u._id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{u.email}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>ID: {u.kyc?.idNumber}</div>
                        <div>License: {u.kyc?.licenseNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModal(u)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                          <MdVisibility className="w-5 h-5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <VerifyUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          onApprove={approve}
        />
      </div>
    </PageTransition>
  );
};

export default UserVerification;


