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
      <div className="max-w-2xl w-full p-4 border border-gray-300 rounded-md space-y-4">
        <h2 className="text-xl font-semibold">Chatbot</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto p-2 border-b border-gray-200">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-md mt-5 ${
                message.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <p>
                <strong>{message.role === "user" ? "You:" : "AI:"}</strong>{" "}
                <br/>
                {message.text}
              </p>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
