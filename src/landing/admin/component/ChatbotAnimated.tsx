import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdSend, MdExpandMore, MdExpandLess } from "react-icons/md";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatbotAnimated: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Zami's AI . How can I help you today? 👋",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cute cat speeches
  const catSpeeches = [
    "Meow~ Cậu chủ ơiiiii!",
    "Nya~ Có việc gì không?",
    "Ăn gì chưa mà làm việc?",
    "Mèo đây, cần giúp gì khum?",
    "Meow~ Có cần giúp gì hăm!",
    "Nghỉ ngơi chút đi cậu chủ~",
    "Hôm nay ổn hết chứ ạạ?",
    "Đi làm mấy ván bi da đi ạ",
  ];

  // Auto-reply responses for specific questions
  const autoReplies: { [key: string]: string } = {
    "hôm nay trời có mưa ko": "Hôm nay trời đẹp lắm cậu chủ ơi! ☀️ Không có mưa đâu, yên tâm đi làm nhé~ 🌤️",
    "trời hôm nay nóng ko": "Nhiệt độ hôm nay khoảng 28-30°C nè! 🌡️ Nóng nóng vậy nên nhớ uống nhiều nước nhé cậu chủ! 💧",
    "hôm nay là ngày mấy": `Hôm nay là ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} đó cậu chủ! 📅`,
    "nay có gì đặc biệt không": "Hôm nay đặc biệt vì cậu chủ đang làm việc chăm chỉ! 💪✨ Mèo rất tự hào về cậu chủ nè~ 🐾",
    "các station sao rồi": "Tất cả các station đang hoạt động bình thường cậu chủ ạ! ✅ Không có vấn đề gì đáng lo ngại đâu~ 🚗💨",
  };

  // Default responses when cat doesn't know the answer
  const defaultResponses = [
    "Mô Phật, hỏi câu khác đi cha !!!!",
    "Cậu chủ đang nói tiếng người á hảhả! 😿",
    "Câu này em đố cậu chủ trả lời được! 🙀",
    "Meow~ Em chỉ là con mèo thôi, không biết câu này! 🐾",
    "Nào cậu chủ trả lời được thì em trả lời! 🙏😿",
  ];

  // Function to find matching auto-reply
  const findAutoReply = (userInput: string): string | null => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Check for exact or partial matches
    for (const [question, answer] of Object.entries(autoReplies)) {
      if (normalizedInput.includes(question) || question.includes(normalizedInput)) {
        return answer;
      }
    }
    
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Random speech bubble effect
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        const randomSpeech = catSpeeches[Math.floor(Math.random() * catSpeeches.length)];
        setCurrentSpeech(randomSpeech);
        setShowSpeechBubble(true);
        
        setTimeout(() => {
          setShowSpeechBubble(false);
        }, 3000); // Hide after 3 seconds
      }, 8000); // Show every 8 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, catSpeeches]);

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputText;
    setInputText("");

    // Auto-reply with smart responses
    setTimeout(() => {
      const autoReply = findAutoReply(currentInput);
      const responseText = autoReply || defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 30px rgba(147, 51, 234, 0.8); }
        }

        .chatbot-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .chatbot-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        
        .chatbot-wave {
          animation: wave 1s ease-in-out infinite;
        }
        
        .chatbot-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Chatbot Button - Pure CSS Animation */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-5 right-5 z-50">
            {/* Speech Bubble */}
            <AnimatePresence>
              {showSpeechBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="absolute bottom-16 right-0 mb-2"
                >
                  {/* Comic-style speech bubble */}
                  <div className="relative bg-white border-3 border-gray-900 rounded-2xl px-4 py-3 shadow-lg max-w-[200px]">
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {currentSpeech}
                    </p>
                    {/* Bubble tail */}
                    <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-3 border-b-3 border-gray-900 transform rotate-45"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cat Button */}
            <motion.button
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => {
                if (!showSpeechBubble) {
                  const randomSpeech = catSpeeches[Math.floor(Math.random() * catSpeeches.length)];
                  setCurrentSpeech(randomSpeech);
                  setShowSpeechBubble(true);
                  setTimeout(() => setShowSpeechBubble(false), 3000);
                }
              }}
              className="w-14 h-14 rounded-full bg-gray-900 shadow-xl flex items-center justify-center group overflow-hidden chatbot-float hover:bg-gray-800"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 15 }}
            >
            {/* Cute Cat Icon */}
            <div className="relative chatbot-wave">
              <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-lg">
                {/* Cat Head */}
                <circle cx="32" cy="34" r="16" fill="#fff"/>
                {/* Cat Ears */}
                <path d="M20 22 L16 10 L24 20 Z" fill="#fff"/>
                <path d="M44 22 L48 10 L40 20 Z" fill="#fff"/>
                {/* Inner Ears */}
                <path d="M21 20 L18 12 L24 18 Z" fill="#fca5a5"/>
                <path d="M43 20 L46 12 L40 18 Z" fill="#fca5a5"/>
                {/* Eyes */}
                <ellipse cx="26" cy="32" rx="2.5" ry="4" fill="#1f2937"/>
                <ellipse cx="38" cy="32" rx="2.5" ry="4" fill="#1f2937"/>
                {/* Eye highlights */}
                <circle cx="27" cy="31" r="1" fill="#fff"/>
                <circle cx="39" cy="31" r="1" fill="#fff"/>
                {/* Nose */}
                <path d="M32 36 L30 38 L34 38 Z" fill="#fca5a5"/>
                {/* Mouth */}
                <path d="M32 38 L32 40 M32 40 Q28 42 26 40 M32 40 Q36 42 38 40" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                {/* Whiskers */}
                <line x1="18" y1="34" x2="24" y2="33" stroke="#1f2937" strokeWidth="1"/>
                <line x1="18" y1="37" x2="24" y2="36" stroke="#1f2937" strokeWidth="1"/>
                <line x1="46" y1="34" x2="40" y2="33" stroke="#1f2937" strokeWidth="1"/>
                <line x1="46" y1="37" x2="40" y2="36" stroke="#1f2937" strokeWidth="1"/>
              </svg>
            </div>

            {/* Simple Pulse Ring */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-50 chatbot-pulse-ring"></span>

            {/* Notification Badge */}
            <motion.span
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white shadow-lg"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              AI
            </motion.span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-5 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100"
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              height: isMinimized ? "60px" : "480px" 
            }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header with Black Theme */}
            <div className="bg-gray-900 p-3 flex items-center justify-between relative overflow-hidden border-b-2 border-gray-800">
              <div className="flex items-center space-x-2.5 relative z-10">
                {/* Cat Avatar */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 64 64" className="w-6 h-6">
                    <circle cx="32" cy="34" r="16" fill="#1f2937"/>
                    <path d="M20 22 L16 10 L24 20 Z" fill="#1f2937"/>
                    <path d="M44 22 L48 10 L40 20 Z" fill="#1f2937"/>
                    <ellipse cx="26" cy="32" rx="2" ry="3" fill="#fbbf24"/>
                    <ellipse cx="38" cy="32" rx="2" ry="3" fill="#fbbf24"/>
                    <circle cx="27" cy="31" r="0.8" fill="#fff"/>
                    <circle cx="39" cy="31" r="0.8" fill="#fff"/>
                    <path d="M32 36 L30 37 L34 37 Z" fill="#fca5a5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Zami AI</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
                    <p className="text-gray-400 text-[11px] font-medium">Online</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 relative z-10">
                <motion.button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMinimized ? (
                    <MdExpandLess className="w-4 h-4" />
                  ) : (
                    <MdExpandMore className="w-4 h-4" />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MdClose className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="h-80 overflow-y-auto p-3 bg-gradient-to-b from-gray-50 to-white">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, x: message.sender === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.1 }}
                        className={`mb-3 flex ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`max-w-[80%] rounded-xl px-3 py-2 shadow-md relative ${
                            message.sender === "user"
                              ? "bg-gray-900 text-white rounded-br-none"
                              : "bg-white border-2 border-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed">{message.text}</p>
                          <p
                            className={`text-xs mt-1.5 ${
                              message.sender === "user"
                                ? "text-gray-400"
                                : "text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t-2 border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-[13px]"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      className="bg-gray-900 text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={inputText.trim() === ""}
                    >
                      <MdSend className="w-4 h-4" />
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

export default ChatbotAnimated;

