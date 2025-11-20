import { useState, useRef } from "react";
import {
  MdBatteryChargingFull,
  MdSpeed,
  MdPhotoCamera,
  MdClose,
} from "react-icons/md";

interface PostRentalFormProps {
  onSubmit: (data: {
    batteryLevel: number;
    mileage: number;
    dashboardPhotos?: File[];
  }) => Promise<void>;
  loading: boolean;
}

export const PostRentalForm = ({ onSubmit, loading }: PostRentalFormProps) => {
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [mileage, setMileage] = useState<number>(0);
  const [dashboardPhotos, setDashboardPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (batteryLevel < 0 || batteryLevel > 100) {
      setError("Battery level must be 0-100%");
      return;
    }
    if (mileage < 0) {
      setError("Mileage must be >= 0");
      return;
    }
    setError(null);
    await onSubmit({
      batteryLevel,
      mileage,
      dashboardPhotos: dashboardPhotos.length > 0 ? dashboardPhotos : undefined,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDashboardPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setDashboardPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 space-y-5 bg-white border-2 border-orange-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-orange-100">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <MdSpeed className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">
            Record Post-Rental Vehicle Condition
          </h4>
          <p className="text-xs text-gray-500">
            Enter battery, mileage & damage photos (if any)
          </p>
        </div>
      </div>

      {/* Battery Level */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MdBatteryChargingFull className="w-4 h-4 text-green-600" />
          Battery After Return (%)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={batteryLevel}
            onChange={(e) => setBatteryLevel(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-green-50 to-emerald-50 font-semibold text-gray-900"
            placeholder="100"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            %
          </span>
        </div>
        {/* Battery Progress Bar */}
        <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
          />
        </div>
      </div>

      {/* Mileage */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MdSpeed className="w-4 h-4 text-blue-600" />
          Mileage After Return
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-r from-blue-50 to-cyan-50 font-semibold text-gray-900"
            placeholder="8000"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            km
          </span>
        </div>
      </div>

      {/* Dashboard Photos */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MdPhotoCamera className="w-4 h-4 text-purple-600" />
          Dashboard Photos (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={photoInputRef}
          onChange={handlePhotoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-purple-600 font-medium flex items-center justify-center gap-2"
        >
          <MdPhotoCamera className="w-5 h-5" />
          <span>Select dashboard photos ({dashboardPhotos.length})</span>
        </button>

        {/* Photo Preview */}
        {dashboardPhotos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {dashboardPhotos.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Dashboard ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdClose className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Recording...</span>
          </>
        ) : (
          <>
            <MdSpeed className="w-5 h-5" />
            <span>Record & mark as returned</span>
          </>
        )}
      </button>
    </div>
  );
};
