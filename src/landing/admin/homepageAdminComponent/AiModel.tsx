import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdSmartToy, MdClose, MdSend, MdRefresh } from "react-icons/md";
import { getAllVehicles, type Vehicle, getAllTransferLogs } from "../../../service/apiAdmin/apiVehicles/API";
import { getAllStations, type Station } from "../../../service/apiAdmin/apiStation/API";
import { getAllBookings } from "../../../service/apiAdmin/apiBooking/API";
import logoZami from "../../../assets/loginImage/logoZami.png";

const GOOGLE_AI_API_KEY = "AIzaSyDzSXEWF13kYtsOQmYY8tqSMTzPphGrujQ";
const GOOGLE_AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AiModel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [databaseStats, setDatabaseStats] = useState<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial data and welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadDatabaseStats();
    }
  }, [isOpen]);

  // Fetch database statistics
  const loadDatabaseStats = async () => {
    setIsLoadingData(true);
    try {
      const [vehicles, stations, bookings] = await Promise.all([
        getAllVehicles(),
        getAllStations(),
        getAllBookings({ page: 1, limit: 1000 }),
      ]);

      const transferLogs = await getAllTransferLogs();

      // Calculate statistics
      const activeVehicles = vehicles.filter(
        (v) => v.status === "available" || v.status === "reserved" || v.status === "rented"
      );
      const vehiclesNeedingDeletion = vehicles.filter((v) => v.status === "pending_deletion");
      const vehiclesNeedingMaintenance = vehicles.filter(
        (v) => v.status === "maintenance" || v.status === "pending_maintenance"
      );
      const transferredVehicles = transferLogs.length;

      const activeStations = stations.filter((s) => s.isActive);
      const stationVehicleCounts = activeStations.map((station) => {
        const stationVehicles = vehicles.filter((v) => {
          if (typeof v.station === "string") return v.station === station._id;
          if (v.station && typeof v.station === "object") return v.station._id === station._id;
          return false;
        });
        return {
          stationName: station.name,
          vehicleCount: stationVehicles.length,
        };
      });

      // Booking statistics for demand forecasting
      const completedBookings = bookings.items.filter((b) => b.status === "completed");
      const activeBookings = bookings.items.filter((b) => b.status === "active" || b.status === "reserved");
      
      // Group bookings by month for trend analysis
      const monthlyBookings = completedBookings.reduce((acc: any, booking) => {
        const date = new Date(booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey]++;
        return acc;
      }, {});

      const stats = {
        vehicles: {
          total: vehicles.length,
          active: activeVehicles.length,
          needingDeletion: vehiclesNeedingDeletion.length,
          needingMaintenance: vehiclesNeedingMaintenance.length,
          transferred: transferredVehicles,
        },
        stations: {
          total: stations.length,
          active: activeStations.length,
          vehicleCounts: stationVehicleCounts,
        },
        bookings: {
          total: bookings.items.length,
          completed: completedBookings.length,
          active: activeBookings.length,
          monthlyTrends: monthlyBookings,
        },
      };

      setDatabaseStats(stats);

      // Add welcome message with statistics
      const welcomeMessage = `Xin chào! Tôi là AI Assistant cho hệ thống quản lý thuê xe điện. 

📊 **Thống kê hiện tại:**
- **Xe đang hoạt động:** ${stats.vehicles.active}/${stats.vehicles.total}
- **Xe cần xóa:** ${stats.vehicles.needingDeletion}
- **Xe cần bảo trì:** ${stats.vehicles.needingMaintenance}
- **Xe đã chuyển trạm:** ${stats.vehicles.transferred}
- **Trạm đang hoạt động:** ${stats.stations.active}/${stats.stations.total}
- **Đặt xe hoàn thành:** ${stats.bookings.completed}
- **Đặt xe đang hoạt động:** ${stats.bookings.active}

Tôi có thể giúp bạn:
- 📈 Dự báo nhu cầu thuê xe để nâng cấp đội xe
- 📊 Phân tích thống kê chi tiết
- 💡 Đưa ra gợi ý quản lý

Bạn muốn hỏi gì?`;

      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error loading database stats:", error);
      setMessages([
        {
          role: "assistant",
          content: "Xin chào! Tôi là AI Assistant. Có lỗi khi tải dữ liệu, nhưng tôi vẫn có thể giúp bạn. Bạn muốn hỏi gì?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Build context with database statistics
      const contextPrompt = databaseStats
        ? `
Bạn là AI Assistant cho hệ thống quản lý thuê xe điện. Dưới đây là dữ liệu từ database:

**THỐNG KÊ XE:**
- Tổng số xe: ${databaseStats.vehicles.total}
- Xe đang hoạt động: ${databaseStats.vehicles.active}
- Xe cần xóa: ${databaseStats.vehicles.needingDeletion}
- Xe cần bảo trì: ${databaseStats.vehicles.needingMaintenance}
- Xe đã chuyển trạm: ${databaseStats.vehicles.transferred}

**THỐNG KÊ TRẠM:**
- Tổng số trạm: ${databaseStats.stations.total}
- Trạm đang hoạt động: ${databaseStats.stations.active}
- Số xe trong từng trạm:
${databaseStats.stations.vehicleCounts.map((s: any) => `  - ${s.stationName}: ${s.vehicleCount} xe`).join("\n")}

**THỐNG KÊ ĐẶT XE:**
- Tổng số đặt xe: ${databaseStats.bookings.total}
- Đặt xe hoàn thành: ${databaseStats.bookings.completed}
- Đặt xe đang hoạt động: ${databaseStats.bookings.active}
- Xu hướng theo tháng: ${JSON.stringify(databaseStats.bookings.monthlyTrends)}

Hãy trả lời câu hỏi của người dùng dựa trên dữ liệu này. Nếu họ hỏi về dự báo nhu cầu, hãy phân tích xu hướng và đưa ra gợi ý cụ thể để nâng cấp đội xe.
`
        : "";

      const fullPrompt = `${contextPrompt}\n\nNgười dùng hỏi: ${userMessage.content}\n\nHãy trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.`;

      const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-black rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-gray-900 transition-all duration-300 group border-2 border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img
            src={logoZami}
            alt="AI Assistant"
            className="w-12 h-12 object-contain filter brightness-0 invert"
          />
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          AI
        </span>
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-black rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-700"
          >
              {/* Header */}
              <div className="bg-black text-white p-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <img
                      src={logoZami}
                      alt="AI"
                      className="w-6 h-6 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">AI Assistant</h3>
                    <p className="text-xs text-white/70">Hệ thống quản lý thuê xe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
                >
                  <MdClose className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
                {isLoadingData && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-white">
                      <MdRefresh className="w-5 h-5 animate-spin" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </div>
                )}
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.role === "user"
                          ? "bg-black text-white border border-white/20"
                          : "bg-gray-900 text-white shadow-sm border border-gray-700"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === "user" ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-700">
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-700 bg-black">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 resize-none border border-gray-700 bg-gray-900 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-gray-500"
                    rows={2}
                    disabled={loading || isLoadingData}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || isLoadingData || !input.trim()}
                    className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/20"
                  >
                    <MdSend className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Nhấn Enter để gửi, Shift+Enter để xuống dòng
                </p>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiModel;

