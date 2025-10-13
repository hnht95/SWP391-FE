import React from "react";
import { MdClose, MdClear, MdSmartToy } from "react-icons/md";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import useChat from "./useChat";

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const {
    messages,
    isTyping,
    messagesEndRef,
    sendMessage,
    clearMessages,
    formatTime,
  } = useChat();

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MdSmartToy className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearMessages}
            className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
            title="Clear conversation"
          >
            <MdClear className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
            title="Close"
          >
            <MdClose className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        formatTime={formatTime}
      />

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
    </div>
  );
};

export default ChatWindow;
