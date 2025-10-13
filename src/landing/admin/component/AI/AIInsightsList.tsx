import React from "react";
import AIInsightCard from "./AIInsightCard";
export type { AIInsight } from "./AIInsightCard";

interface AIInsightsListProps {
  insights: AIInsight[];
  onViewDetails?: (insight: AIInsight) => void;
  onApply?: (insight: AIInsight) => void;
}

const AIInsightsList: React.FC<AIInsightsListProps> = ({
  insights,
  onViewDetails,
  onApply,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Thông tin AI
          </h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Xem tất cả
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {insights.map((insight) => (
          <AIInsightCard
            key={insight.id}
            insight={insight}
            onViewDetails={onViewDetails}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  );
};

export default AIInsightsList;
