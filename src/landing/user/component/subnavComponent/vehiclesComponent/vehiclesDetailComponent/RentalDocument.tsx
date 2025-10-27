import React, { useState } from "react";
import { FaRegFileAlt, FaLock, FaExclamationCircle } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";

// Custom Modal Component
const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-filter backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoIosCloseCircleOutline size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const RentalDocument: React.FC = () => {
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showCollateralModal, setShowCollateralModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Rental Conditions</h2>
      <div className="flex flex-col gap-6">
        {/* Document Section */}
        <div
          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowDocumentsModal(true)}
        >
          <div className="flex items-center gap-4">
            <div className="text-blue-500">
              <FaRegFileAlt size={24} />
            </div>
            <h3 className="text-lg font-semibold">Required Documents</h3>
            <div className="ml-auto text-gray-400">
              <FaExclamationCircle size={18} />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You have a chip-based CCCD
          </p>
        </div>

        {/* Collateral Section */}
        <div
          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowCollateralModal(true)}
        >
          <div className="flex items-center gap-4">
            <div className="text-green-500">
              <FaLock size={24} />
            </div>
            <h3 className="text-lg font-semibold">Collateral</h3>
            <div className="ml-auto text-gray-400">
              <FaExclamationCircle size={18} />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Owner supports a non-collateral policy
          </p>
        </div>
      </div>

      {/* Terms and Conditions Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Pay the rental fee upon vehicle handover.</li>
          <li>Use the car for its intended purpose only.</li>
          <li>Do not use the rented vehicle for illegal purposes.</li>
          <li>Do not use the rented vehicle as collateral.</li>
          <li>Do not smoke, chew gum, or litter in the car.</li>
          <li>Do not transport flammable goods or prohibited items.</li>
          <li>Do not transport strong-smelling fruits or foods.</li>
          <li>
            Upon return, if the car is dirty or has an odor, the customer must
            clean the car or pay an extra cleaning fee.
          </li>
          <li>Thank you, and we wish you a wonderful trip!</li>
        </ul>
      </div>

      {/* Documents Modal */}
      {showDocumentsModal && (
        <Modal
          title="Required Documents"
          onClose={() => setShowDocumentsModal(false)}
        >
          <p className="mb-4 text-gray-700">
            The renter must prepare **ORIGINAL** copies of all documents when
            completing the vehicle handover procedure.
          </p>
          <div className="space-y-4">
            {/* Option 1: With CCCD */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">You have a chip-based CCCD</h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>
                  Driver's license (the owner will cross-check the original with
                  the verified information on the Mioto app & return it to you)
                </li>
                <li>
                  Chip-based CCCD (the owner will cross-check the original with
                  your personal information on VNeID & return it to you)
                </li>
              </ul>
            </div>
            {/* Option 2: Without CCCD */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">
                You do not have a chip-based CCCD
              </h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>
                  Driver's license (the owner will cross-check the original with
                  the verified information on the Mioto app & return it to you)
                </li>
                <li>
                  Passport (the owner will check the original, keep it, and
                  return it to you upon vehicle return)
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Collateral Modal */}
      {showCollateralModal && (
        <Modal title="Collateral" onClose={() => setShowCollateralModal(false)}>
          <p className="mb-4 text-gray-700">
            The owner supports a **non-collateral** policy. The customer does
            not need to leave any assets (motorcycle or 15 million VND cash)
            when renting the owner's car.
          </p>
          <p className="text-gray-700">
            Any incurred surcharges (if any) during the rental period must be
            paid directly to the owner upon vehicle return.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default RentalDocument;
