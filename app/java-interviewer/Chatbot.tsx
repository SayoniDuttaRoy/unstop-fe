"use client";
import React, { useState } from "react";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    if (userInput.trim()) {
      // Add user message to chat
      const newMessage: ChatMessage = { role: "user", text: userInput };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Clear input
      setUserInput("");

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          role: "ai",
          text: "This is a simulated response from the AI.",
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }, 1000); // 1 second delay for AI response
    }
  };

  return (
    <div className="flex flex-col items-center my-20 space-y-4 w-full">
      <div className="max-w-2xl w-full p-6 border border-gray-300 rounded-lg shadow-lg space-y-4 bg-white">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chatbot</h2>
        <div className="space-y-4 max-h-80 overflow-y-auto p-3 border-b border-gray-300">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs md:max-w-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
