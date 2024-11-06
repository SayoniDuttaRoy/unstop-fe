"use client";
import React, { useState, useEffect, useRef } from "react";
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
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [runId, setRunId] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isBrowserSupportsSpeechRecognition = !!(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  useEffect(() => {
    if (!isBrowserSupportsSpeechRecognition) {
      console.error("Browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        let transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleUserMessageSend = async (message?: string) => {
    recognitionRef.current?.stop();
    setHasStarted(true);
    setListening(false);
    const messageToSend = transcript.trim() || message || "";
    if (messageToSend === "") {
      // Do not send empty messages
      return;
    }
    const newMessage: ChatMessage = { role: "user", text: messageToSend };
    const newAIMessage: ChatMessage = { role: "ai", text: "Thinking..." };
    setMessages((chatMessages) => [...chatMessages, newMessage, newAIMessage]);
    setTranscript("");

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
        const interviewerMsg = await readStreamingApiResponseWithRunId(
          response
        );
        handleAIResponse(interviewerMsg);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {}
  };

  const handleAIResponse = (aiMessage: string) => {
    const utterance = new SpeechSynthesisUtterance(aiMessage);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const readStreamingApiResponseWithRunId = async (response: any) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let streamingOutputMsg = "";
    if (response.ok && reader && decoder) {
      let done = false;
      let partialData = "";
      let lastDataReceivedTime = Date.now();

      while (!done) {
        const { value, done: readDone } = await Promise.race([
          reader.read(),
          new Promise<any>((resolve) =>
            setTimeout(() => resolve({ value: null, done: true }), 5000)
          ),
        ]);
        if (Date.now() - lastDataReceivedTime > 5000) {
          break;
        }
        if (value) {
          lastDataReceivedTime = Date.now();
        }
        if (readDone) {
          break;
        }
        const decodedValue = decoder.decode(value, { stream: true });
        partialData += decodedValue;
        let lines = partialData.split("\n");
        partialData = lines.pop() || ""; // Save incomplete line for next iteration
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("data:")) {
            const jsonString = line.slice("data:".length).trim();
            if (jsonString === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsedJson = JSON.parse(jsonString);
              if (parsedJson.status === "ok") {
                setRunId(parsedJson.run_id);
                streamingOutputMsg = streamingOutputMsg + parsedJson["out-1"];
                setMessages((chatMessages: any) => {
                  const lastMessage = chatMessages[chatMessages.length - 1];
                  if (lastMessage && lastMessage.role === "ai") {
                    // Remove the last message if it's from a bot
                    const updatedMessages = chatMessages.slice(0, -1);
                    return [
                      ...updatedMessages,
                      { text: streamingOutputMsg, role: "ai" },
                    ];
                  }
                  // If the last message is not from a bot, just add the new bot message
                  return [
                    ...chatMessages,
                    { text: streamingOutputMsg, role: "ai" },
                  ];
                });
              }
            } catch (error) {}
          }
        }
      }
    }
    return streamingOutputMsg;
  };

  return (
    <div className="flex flex-col items-center my-20 space-y-4 w-full">
      {!hasStarted ? (
        <button
          onClick={() => handleUserMessageSend("Start interview")}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Start Interview
        </button>
      ) : (
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
          {listening && (
            <div className="text-green-500 mb-2">
              Listening... Please speak.
            </div>
          )}
          <div className="flex space-x-2 mt-4">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your response will appear here..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={startListening}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Answering
            </button>
            <button
              onClick={() => handleUserMessageSend()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
