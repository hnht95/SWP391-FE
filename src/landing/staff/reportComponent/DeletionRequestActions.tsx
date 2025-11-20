import { useState } from "react";
import { MdClose } from "react-icons/md";
import { staffAPI } from "../../../service/apiStaff/API";

interface DeletionRequestActionsProps {
  requestId: string;
  currentDesc: string;
  onDone: () => void;
}

const DeletionRequestActions: React.FC<DeletionRequestActionsProps> = ({
  requestId,
  currentDesc,
  onDone,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [desc, setDesc] = useState(currentDesc);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await staffAPI.updateDeletionRequest(requestId, {
        description: desc,
        evidencePhotos: files.length > 0 ? files : undefined,
      });
      setEditOpen(false);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to update deletion request"
      );
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    try {
      setLoading(true);
      await staffAPI.deleteDeletionRequest(requestId);
      setShowDeleteModal(false);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to delete deletion request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (!editOpen)
    return (
      <>
        <div className="space-y-2">
          <button
            onClick={() => setEditOpen(true)}
            className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 font-medium"
            disabled={loading}
          >
            Update Request
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 font-medium"
            disabled={loading}
          >
            Delete Request
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this deletion request? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={remove}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Evidence Photos
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdClose className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
          <span className="text-sm text-gray-600">Choose Files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={submit}
          className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 font-medium"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditOpen(false)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeletionRequestActions;
