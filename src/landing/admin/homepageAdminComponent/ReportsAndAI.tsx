import React from "react";
import { MdConstruction } from "react-icons/md";

const ReportsAndAI: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* AI Robot Icon */}
        <div className="mx-auto w-32 h-32 mb-6 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Robot Head */}
            <rect x="50" y="60" width="100" height="80" rx="10" fill="#f3f4f6" stroke="#1f2937" strokeWidth="4"/>
            {/* Antenna */}
            <line x1="100" y1="60" x2="100" y2="40" stroke="#1f2937" strokeWidth="3"/>
            <circle cx="100" cy="35" r="8" fill="#ef4444"/>
            {/* Eyes */}
            <circle cx="75" cy="85" r="8" fill="#1f2937"/>
            <circle cx="125" cy="85" r="8" fill="#1f2937"/>
            {/* Mouth */}
            <rect x="80" y="110" width="40" height="8" rx="4" fill="#1f2937"/>
            {/* Ears */}
            <rect x="35" y="75" width="15" height="30" rx="5" fill="#e5e7eb" stroke="#1f2937" strokeWidth="3"/>
            <rect x="150" y="75" width="15" height="30" rx="5" fill="#e5e7eb" stroke="#1f2937" strokeWidth="3"/>
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <MdConstruction className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Reports & AI</h1>
          </div>
          <p className="text-lg text-gray-600">
            This feature is currently under development.
          </p>
          <p className="text-sm text-gray-500">
            Please check back later. We're working hard to bring you intelligent analytics!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsAndAI;
