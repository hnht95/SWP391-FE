// src/components/vehicle/InsuranceModal.tsx
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <AiOutlineClose size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">
          Self-Drive Car Rental Insurance
        </h2>
        <p className="mb-4">
          With many years of experience in the car rental industry, Mioto
          understands that risks of collision, fire, explosion, or hydrolock
          causing significant losses (beyond a person's ability to pay) are
          always latent during the rental period.
        </p>
        <p className="mb-4">
          ❌ However, most risks arising during a self-drive car rental are not
          covered by annual comprehensive vehicle insurance (also known as
          two-way insurance).
        </p>
        <p className="mb-6">
          ✅ Based on essential customer needs, Mioto, in collaboration with
          leading insurance partners in Vietnam, offers a self-drive car rental
          insurance product with a truly affordable fee and a large insurance
          amount (up to 100% of the vehicle's value) that will help you stop
          worrying about renting a car & feel secure enjoying your journey.
        </p>

        <h3 className="text-xl font-bold mb-2">
          I. Car Rental Insurance Product Content
        </h3>
        <p className="mb-4">
          During the rental period, if an unforeseen incident occurs leading to
          vehicle damage, the renter will only compensate a maximum of 2,000,000
          VND for vehicle repairs (deductible), and the insurer will cover costs
          that exceed the deductible.
        </p>
        <table className="w-full table-auto border-collapse mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Vehicle Damage</th>
              <th className="border p-2 text-left">Renter's Payment</th>
              <th className="border p-2 text-left">Insurer's Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{"<= 2 million"}</td>
              <td className="border p-2">{"<= 2 million"}</td>
              <td className="border p-2">0 million</td>
            </tr>
            <tr>
              <td className="border p-2">{"> 2 million"}</td>
              <td className="border p-2">2 million</td>
              <td className="border p-2">298 million</td>
            </tr>
          </tbody>
        </table>
        <p className="mb-6">
          Example: Vehicle has an incident with 300,000,000 VND in damage
        </p>

        <h3 className="text-xl font-bold mb-2">II. Insurance Terms</h3>
        <ul className="list-disc list-inside mb-6">
          <li>Vehicle physical damage: collision, fire, explosion</li>
          <li>Free towing up to 70km/incident</li>
          <li>Hydro-lock insurance (20% deductible, minimum 3 million VND)</li>
          <li>Deductible: 2,000,000 VND/incident</li>
        </ul>
        <p className="mb-4">
          Explanation of Deductible: For any unforeseen incident within the
          insurance scope, the maximum amount the renter pays is 2 million VND,
          not including:
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>Deductibles/penalties according to the Insurer's Rules,</li>
            <li>Loss of use of the car during the repair period, if any,</li>
            <li>Other subjective reasons outside the scope of insurance.</li>
          </ul>
        </p>

        <h3 className="text-xl font-bold mb-2">
          III. Incident Handling Procedure
        </h3>
        <ul className="list-decimal list-inside">
          <li>
            The renter must keep the scene intact & take photos of the damaged
            vehicle.
          </li>
          <li>
            At the time of the incident, the renter must call the insurance
            company's claim center (MIC - 1900 55 88 91), (DBV (VNI) - 1900 96
            96 90), provide the insurance policy number, and follow the
            operator's instructions.
          </li>
          <li>
            The insurance adjuster will contact the renter to guide the
            handling, verify information, and inspect the scene (if necessary).
          </li>
          <li>
            The adjuster and the vehicle owner/renter will take the vehicle to a
            garage for damage assessment and to receive a repair quote.
          </li>
          <li>
            The insurance company's claim center will issue a damage assessment
            report.
          </li>
          <li>The garage will proceed with repairs according to the quote.</li>
        </ul>
      </div>
    </div>
  );
};

export default InsuranceModal;
