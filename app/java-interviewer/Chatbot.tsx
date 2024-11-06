"use client";
import React, { useState } from "react";
import { readStreamingApiResponse } from "../utils";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

interface ChatbotProps {
  jobDesc: string;
  skills: string;
  generatedQuestions: string;
}

export default function Chatbot({
  jobDesc,
  skills,
  generatedQuestions,
}: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [runId, setRunId] = useState("");

  const handleUserMessageSend = async () => {
    const messageToSend = userInput.trim();
    const newMessage: ChatMessage = { role: "user", text: messageToSend };
    const newAIMessage: ChatMessage = { role: "ai", text: "Thinking..." };
    setMessages((chatMessages) => [...chatMessages, newMessage, newAIMessage]);
    setUserInput("");

    try {
      const response = await fetch(
        "https://api.genfuseai.com/api/v1/apps/run_apis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer 51239524929cfb3dd186fdf2ae8bb31110b22487cb4edbe87093dec977a5b0a1",
          },
          body: JSON.stringify({
            app_id: "d6343afc-4df5-48fb-a53a-8a29e5e649bd",
            run_id: runId,
            "in-1": messageToSend,
            "in-2": jobDesc,
            "in-3": generatedQuestions,
            "in-4": skills,
          }),
        }
      );
      if (response.ok) {
        const interviewerMsg = await readStreamingApiResponseWithRunId(response);
        setMessages((chatMessages: any) => {
          const lastMessage = chatMessages[chatMessages.length - 1];
          if (lastMessage && lastMessage.role === "ai") {
            const updatedMessages = chatMessages.slice(0, -1);
            return [...updatedMessages, { text: interviewerMsg, sender: "ai" }];
          }
          return [...chatMessages, { text: interviewerMsg, sender: "bot" }];
        });
      } else {
        throw new Error("Failed");
      }
    } catch (error) {}
  };

 const readStreamingApiResponseWithRunId = async (response: any) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";
    if (response.ok && reader && decoder) {
      let partialData = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decodedValue = decoder.decode(value, { stream: true });
        partialData += decodedValue;
        let lines = partialData.split("\n");
        partialData = lines.pop() || "";
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("data:")) {
            const jsonString = line.slice("data:".length).trim();
            if (jsonString === "[DONE]") {
              break;
            }
            try {
              const parsedJson = JSON.parse(jsonString);
              if (parsedJson.status === "ok") {
                result = result + parsedJson["out-1"];
                setRunId(parsedJson.run_id);
              }
            } catch (error) {}
          }
        }
      }
    }
    return result;
  };

  return (
    <div className="flex flex-col items-center my-20 space-y-4 w-full">
      <div className="max-w-2xl w-full p-6 border border-gray-300 rounded-lg shadow-lg space-y-4 bg-white">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chatbot</h2>
        <div className="space-y-4 p-3 border-b border-gray-300">
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
                <p className="whitespace-pre-wrap">{message.text}</p>
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
            onClick={handleUserMessageSend}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
