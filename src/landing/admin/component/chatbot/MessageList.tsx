import React from "react";
import { type Message } from "./useChat";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  formatTime: (date: Date) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  messagesEndRef,
  formatTime,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              message.sender === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-gray-200 text-gray-900 rounded-bl-none"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p
              className={`text-xs mt-1 opacity-70 ${
                message.sender === "user" ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-900 rounded-lg rounded-bl-none px-3 py-2 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
