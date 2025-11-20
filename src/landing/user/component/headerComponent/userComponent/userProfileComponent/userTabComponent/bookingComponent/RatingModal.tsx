import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import userBookingApi from "../../../../../../../../service/apiUser/booking/API";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  vehicleName: string;
  onSuccess: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  vehicleName,
  onSuccess,
}) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await userBookingApi.submitBookingRating(bookingId, {
        score,
        comment: comment.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-2">Rate Your Experience</h2>
        <p className="text-sm text-gray-600 mb-4">{vehicleName}</p>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setScore(star)}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                className={`text-4xl ${
                  star <= (hoveredStar || score)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-gray-700">
            {score === 5
              ? "Excellent!"
              : score === 4
              ? "Good"
              : score === 3
              ? "Average"
              : score === 2
              ? "Poor"
              : "Very Poor"}
          </p>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          rows={4}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RatingModal;
