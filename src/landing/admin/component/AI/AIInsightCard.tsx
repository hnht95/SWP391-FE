import React from "react";

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: "performance" | "prediction" | "optimization";
  priority: "high" | "medium" | "low";
}

interface AIInsightCardProps {
  insight: AIInsight;
  onViewDetails?: (insight: AIInsight) => void;
  onApply?: (insight: AIInsight) => void;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onViewDetails,
  onApply,
}) => {
  const getCategoryBadge = (category: AIInsight["category"]) => {
    const config = {
      performance: { color: "bg-blue-100 text-blue-800", text: "Hiệu suất" },
      prediction: { color: "bg-purple-100 text-purple-800", text: "Dự báo" },
      optimization: { color: "bg-green-100 text-green-800", text: "Tối ưu" },
    };
    return config[category];
  };

  const getPriorityBadge = (priority: AIInsight["priority"]) => {
    const config = {
      high: { color: "bg-red-100 text-red-800", text: "Cao" },
      medium: { color: "bg-yellow-100 text-yellow-800", text: "Trung bình" },
      low: { color: "bg-gray-100 text-gray-800", text: "Thấp" },
    };
    return config[priority];
  };

  const categoryConfig = getCategoryBadge(insight.category);
  const priorityConfig = getPriorityBadge(insight.priority);

  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {insight.title}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}
            >
              {categoryConfig.text}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}
            >
              Ưu tiên {priorityConfig.text.toLowerCase()}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{insight.description}</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Độ tin cậy:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${insight.confidence}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {insight.confidence}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onViewDetails?.(insight)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Xem chi tiết
          </button>
          <button
            onClick={() => onApply?.(insight)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;
