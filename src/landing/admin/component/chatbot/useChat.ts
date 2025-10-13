import { useState, useRef, useEffect } from "react";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock AI responses
  const aiResponses = [
    "Tôi hiểu ý bạn. Để giúp bạn tốt hơn, bạn có thể cung cấp thêm chi tiết không?",
    "Đây là một câu hỏi hay! Dựa trên dữ liệu hiện tại, tôi khuyên bạn nên...",
    "Cảm ơn bạn đã hỏi. Theo phân tích của tôi, có vẻ như...",
    "Điều này thật thú vị! Từ góc độ quản lý, tôi nghĩ rằng...",
    "Rất tốt! Tôi có thể giúp bạn phân tích vấn đề này từ nhiều khía cạnh khác nhau.",
    "Đây là một tình huống phức tạp. Hãy cùng tôi xem xét các yếu tố quan trọng...",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (): string => {
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 700);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: "1",
        content: "Cuộc trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    messages,
    isTyping,
    messagesEndRef,
    sendMessage,
    clearMessages,
    formatTime,
  };
}
