import { useState, useRef } from "react";
import { MdUploadFile, MdCheckCircle, MdError } from "react-icons/md";

interface ContractUploadFormProps {
  onSubmit: (file: File) => Promise<void>;
  loading: boolean;
}

export const ContractUploadForm = ({
  onSubmit,
  loading,
}: ContractUploadFormProps) => {
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!contractFile) {
      setError("Please select a contract file");
      return;
    }
    setError(null);
    await onSubmit(contractFile);
    setContractFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFile(file);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    contractInputRef.current?.click();
  };

  return (
    <div className="mt-4 space-y-4 bg-white border-2 border-blue-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-blue-100">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MdUploadFile className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Upload Contract</h4>
          <p className="text-xs text-gray-500">Select PDF, JPG or PNG file</p>
        </div>
      </div>

      {/* File Input Area */}
      <div>
        <input
          type="file"
          accept=".pdf,image/*"
          ref={contractInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Custom File Input Button */}
        <div
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            contractFile
              ? "border-green-300 bg-green-50"
              : "border-blue-300 bg-blue-50 hover:bg-blue-100"
          }`}
        >
          {contractFile ? (
            <div className="flex items-center justify-center gap-2">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-800">
                  {contractFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(contractFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <MdUploadFile className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to select contract file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or drag & drop file here
              </p>
            </div>
          )}
        </div>

        {contractFile && (
          <button
            onClick={triggerFileInput}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Choose another file
          </button>
        )}

        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <MdError className="w-4 h-4" />
            <p className="text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !contractFile}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <MdUploadFile className="w-5 h-5" />
            <span>Upload contract</span>
          </>
        )}
      </button>
    </div>
  );
};
