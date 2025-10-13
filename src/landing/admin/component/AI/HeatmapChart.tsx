import React from "react";
import { 
  MdTrendingUp, 
  MdInsights, 
  MdCalendarToday, 
  MdPsychology 
} from "react-icons/md";

interface QuickReport {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HeatmapChartProps {
  onReportClick?: (reportType: string) => void;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ onReportClick }) => {
  const quickReports: QuickReport[] = [
    { title: "Doanh thu", subtitle: "Theo thời gian", icon: MdTrendingUp },
    { title: "Hiệu suất xe", subtitle: "Tỷ lệ sử dụng", icon: MdInsights },
    { title: "Khách hàng", subtitle: "Phân tích hành vi", icon: MdCalendarToday },
    { title: "Dự báo", subtitle: "30 ngày tới", icon: MdPsychology },
  ];

  // Mock heatmap data - representing demand by location and time
  const heatmapData = [
    { location: "Quận 1", hour: 6, demand: 20 },
    { location: "Quận 1", hour: 8, demand: 80 },
    { location: "Quận 1", hour: 12, demand: 60 },
    { location: "Quận 1", hour: 18, demand: 90 },
    { location: "Quận 1", hour: 22, demand: 40 },
    
    { location: "Quận 7", hour: 6, demand: 15 },
    { location: "Quận 7", hour: 8, demand: 70 },
    { location: "Quận 7", hour: 12, demand: 85 },
    { location: "Quận 7", hour: 18, demand: 95 },
    { location: "Quận 7", hour: 22, demand: 50 },
    
    { location: "Tân Bình", hour: 6, demand: 30 },
    { location: "Tân Bình", hour: 8, demand: 60 },
    { location: "Tân Bình", hour: 12, demand: 40 },
    { location: "Tân Bình", hour: 18, demand: 75 },
    { location: "Tân Bình", hour: 22, demand: 35 },
  ];

  const locations = ["Quận 1", "Quận 7", "Tân Bình"];
  const hours = [6, 8, 12, 18, 22];

  const getHeatmapColor = (demand: number) => {
    if (demand >= 80) return "bg-red-500";
    if (demand >= 60) return "bg-orange-400";
    if (demand >= 40) return "bg-yellow-400";
    if (demand >= 20) return "bg-green-300";
    return "bg-blue-200";
  };

  const getDemandForLocationAndHour = (location: string, hour: number) => {
    const data = heatmapData.find(d => d.location === location && d.hour === hour);
    return data ? data.demand : 0;
  };

  return (
    <div className="space-y-6">
      {/* Demand Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Bản đồ nhiệt nhu cầu thuê xe
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Hôm nay</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Cập nhật trực tiếp</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-6 gap-2">
              {/* Header row */}
              <div></div>
              {hours.map(hour => (
                <div key={hour} className="text-center text-sm font-medium text-gray-700 py-2">
                  {hour}:00
                </div>
              ))}
              
              {/* Data rows */}
              {locations.map(location => (
                <React.Fragment key={location}>
                  <div className="text-sm font-medium text-gray-700 py-2 pr-4">
                    {location}
                  </div>
                  {hours.map(hour => {
                    const demand = getDemandForLocationAndHour(location, hour);
                    return (
                      <div
                        key={`${location}-${hour}`}
                        className={`h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(demand)} hover:scale-105 transition-transform cursor-pointer`}
                        title={`${location} lúc ${hour}:00 - Nhu cầu: ${demand}%`}
                      >
                        {demand}%
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-600">Nhu cầu thấp</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <div className="w-4 h-4 bg-red-500 rounded"></div>
          </div>
          <span className="text-sm text-gray-600">Nhu cầu cao</span>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Báo cáo nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report, index) => (
            <button
              key={index}
              onClick={() => onReportClick?.(report.title)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <report.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-600">
                {report.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
