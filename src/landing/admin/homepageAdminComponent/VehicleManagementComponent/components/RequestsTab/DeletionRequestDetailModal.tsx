import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdClose, MdDeleteSweep, MdLocationOn, MdPerson, MdAccessTime } from "react-icons/md";
import { getPhotoUrls } from "../../../../../../service/apiAdmin/apiVehicles/API";

interface DeletionRequestDetailModalProps {
  request: any | null;
  isOpen: boolean;
  onClose: () => void;
  getStationName?: (stationIdOrObject: any) => string;
}

const DeletionRequestDetailModal: React.FC<DeletionRequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  getStationName,
}) => {
  if (!request) return null;

  const stationSource = request.station ?? request.vehicle?.station;
  const stationLabel = getStationName
    ? getStationName(stationSource)
    : (stationSource?.name || stationSource || "");

  const evidencePhotoUrls = getPhotoUrls((request.evidencePhotos || []) as any);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("vi-VN") : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MdDeleteSweep className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Deletion Request Details</h2>
                    <p className="text-sm text-gray-500">
                      {request?.vehicle?.brand} {request?.vehicle?.model} - {request?.vehicle?.plateNumber}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <MdAccessTime className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Created: {formatDate(request.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">Status: {request.status}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <MdLocationOn className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Station: {stationLabel}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start text-sm text-gray-700">
                      <MdPerson className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <div>Reported By: {request.reportedBy?.name || request.requestedBy}</div>
                        {request.reportedBy?.email && (
                          <div className="text-gray-500">Email: {request.reportedBy.email}</div>
                        )}
                        {request.reportedBy?.role && (
                          <div className="text-gray-500">Role: {request.reportedBy.role}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Reason / Report Content</div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-800">
                    {request.reportText || request.reason}
                  </div>
                </div>

                {/* Evidence Photos */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Evidence Photos</div>
                  {evidencePhotoUrls.length === 0 ? (
                    <div className="text-sm text-gray-500">No photos available</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {evidencePhotoUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block group"
                          title="View full size"
                        >
                          <img
                            src={url}
                            className="h-28 w-full object-cover rounded-lg border border-gray-200 group-hover:opacity-90"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeletionRequestDetailModal;


