import { useState, useRef } from "react";
import {
  MdWarning,
  MdAttachMoney,
  MdAddAPhoto,
  MdCheckCircle,
  MdError,
} from "react-icons/md";

interface DamageReportFormProps {
  onSubmit: (data: {
    description: string;
    estimatedCost?: number;
    photos?: File[];
  }) => Promise<void>;
  loading: boolean;
}

export const DamageReportForm = ({
  onSubmit,
  loading,
}: DamageReportFormProps) => {
  const [damageDescription, setDamageDescription] = useState("");
  const [damageEstimatedCost, setDamageEstimatedCost] = useState<number>(0);
  const [damageReportPhotos, setDamageReportPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const damageReportPhotosInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!damageDescription) {
      setError("Please enter damage description");
      return;
    }
    setError(null);
    await onSubmit({
      description: damageDescription,
      estimatedCost: damageEstimatedCost || undefined,
      photos: damageReportPhotos.length > 0 ? damageReportPhotos : undefined,
    });
    setDamageDescription("");
    setDamageEstimatedCost(0);
    setDamageReportPhotos([]);
  };

  return (
    <div className="mt-4 space-y-4 bg-white border-2 border-red-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-red-100">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <MdWarning className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Damage Report</h4>
          <p className="text-xs text-gray-500">
            Record detailed vehicle damage (Optional)
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <MdWarning className="w-5 h-5 text-red-600" />
          Damage description *
        </label>
        <textarea
          value={damageDescription}
          onChange={(e) => setDamageDescription(e.target.value)}
          rows={4}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          placeholder="Describe the damage: location, severity, cause..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {damageDescription.length}/500 characters
        </p>
      </div>

      {/* Estimated Cost */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <MdAttachMoney className="w-5 h-5 text-orange-600" />
          Estimated cost (VND)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="1000"
            value={damageEstimatedCost}
            onChange={(e) => setDamageEstimatedCost(Number(e.target.value))}
            className="w-full border-2 border-orange-300 rounded-lg px-4 py-3 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
            VND
          </span>
        </div>
        <p className="text-xs text-orange-600 mt-2">
          {damageEstimatedCost > 0
            ? `${damageEstimatedCost.toLocaleString()} VND`
            : "Enter 0 if unknown yet"}
        </p>
      </div>

      {/* Photos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <MdAddAPhoto className="w-5 h-5 text-gray-600" />
          Damage photos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={damageReportPhotosInputRef}
          onChange={(e) =>
            setDamageReportPhotos(Array.from(e.target.files || []))
          }
          className="hidden"
        />
        <button
          type="button"
          onClick={() => damageReportPhotosInputRef.current?.click()}
          className="w-full border-2 border-dashed border-red-300 rounded-lg px-4 py-6 text-center hover:border-red-400 hover:bg-red-50 transition-all"
        >
          <MdAddAPhoto className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            Click to select damage photos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            (You can select multiple)
          </p>
        </button>
        {damageReportPhotos.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <MdCheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">
              Selected {damageReportPhotos.length} photo(s)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <MdError className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <MdWarning className="w-5 h-5" />
            <span>Submit damage report</span>
          </>
        )}
      </button>
    </div>
  );
};
