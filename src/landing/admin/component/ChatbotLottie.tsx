import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { MdClose, MdSend, MdExpandMore, MdExpandLess } from "react-icons/md";

// Import Lottie animation JSON
import chatbotAnimation from "../../../assets/popupai/Live chatbot.json";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatbotLottie: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi có thể giúp gì cho bạn? 👋",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Cảm ơn bạn đã liên hệ! Tôi sẽ xử lý yêu cầu "${inputText}" ngay. 🚀`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Button with Lottie */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Lottie Animation */}
            <div className="w-16 h-16">
              <Lottie 
                animationData={chatbotAnimation} 
                loop 
                autoplay
              />
            </div>
            {/* Pulse ring effect */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              height: isMinimized ? "70px" : "550px" 
            }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header with Lottie */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Lottie Avatar */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                  <Lottie 
                    animationData={chatbotAnimation} 
                    loop 
                    autoplay
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Zami AI Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-blue-100 text-xs">Đang hoạt động</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMinimized ? (
                    <MdExpandLess className="w-5 h-5" />
                  ) : (
                    <MdExpandMore className="w-5 h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MdClose className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, x: message.sender === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`mb-4 flex ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p
                            className={`text-xs mt-1.5 ${
                              message.sender === "user"
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={inputText.trim() === ""}
                    >
                      <MdSend className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotLottie;

