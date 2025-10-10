import React, { useState, useRef } from "react";
import { MdSend } from "react-icons/md";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn... (Shift+Enter để xuống dòng)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={2}
            style={{ minHeight: "40px", maxHeight: "80px" }}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
        >
          <MdSend className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Nhấn Enter để gửi, Shift+Enter để xuống dòng
      </p>
    </div>
  );
};

export default ChatInput;
