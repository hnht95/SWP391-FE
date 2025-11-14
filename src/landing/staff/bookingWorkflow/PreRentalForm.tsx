import { useState, useRef } from "react";
import {
  MdBatteryChargingFull,
  MdSpeed,
  MdAddAPhoto,
  MdCheckCircle,
  MdError,
} from "react-icons/md";

interface PreRentalFormProps {
  onSubmit: (data: {
    batteryLevel: number;
    mileage: number;
    damagePhotos?: File[];
  }) => Promise<void>;
  loading: boolean;
}

export const PreRentalForm = ({ onSubmit, loading }: PreRentalFormProps) => {
  const [batteryLevel, setBatteryLevel] = useState<number>(80);
  const [mileage, setMileage] = useState<number>(0);
  const [damagePhotos, setDamagePhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const damagePhotosInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!batteryLevel || !mileage) {
      setError("Please enter battery level and mileage");
      return;
    }
    setError(null);
    await onSubmit({
      batteryLevel,
      mileage,
      damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
    });
    setDamagePhotos([]);
  };

  return (
    <div className="mt-4 space-y-4 bg-white border-2 border-blue-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-blue-100">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MdCheckCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">
            Record Vehicle Condition
          </h4>
          <p className="text-xs text-gray-500">Enter info before handover</p>
        </div>
      </div>

      {/* Battery and Mileage */}
      <div className="grid grid-cols-2 gap-4">
        {/* Battery Level */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MdBatteryChargingFull className="w-5 h-5 text-green-600" />
            Battery %
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(Number(e.target.value))}
              className="w-full border-2 border-green-300 rounded-lg px-4 py-3 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0-100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              %
            </span>
          </div>
          {/* Battery Level Indicator */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                batteryLevel > 50
                  ? "bg-green-500"
                  : batteryLevel > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Mileage */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MdSpeed className="w-5 h-5 text-blue-600" />
            Mileage
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
              km
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {mileage.toLocaleString()} km đã đi
          </p>
        </div>
      </div>

      {/* Damage Photos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <MdAddAPhoto className="w-5 h-5 text-gray-600" />
          Damage photos (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={damagePhotosInputRef}
          onChange={(e) => setDamagePhotos(Array.from(e.target.files || []))}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => damagePhotosInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <MdAddAPhoto className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Click to select photos</p>
          <p className="text-xs text-gray-400 mt-1">
            (You can select multiple)
          </p>
        </button>
        {damagePhotos.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <MdCheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">
              Selected {damagePhotos.length} photo(s)
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
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Recording...</span>
          </>
        ) : (
          <>
            <MdCheckCircle className="w-5 h-5" />
            <span>Record condition</span>
          </>
        )}
      </button>
    </div>
  );
};
