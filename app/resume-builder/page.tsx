"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [runId, setRunId] = useState("");
  const [createdResume, setCreatedResume] = useState("");
  const [showChatbot, setShowChatbot] = useState(false); // New state to control display

  const handleUserMessageSend = async (message?: string) => {
    const messageToSend = inputVal.trim() || message || "";
    if (messageToSend === "") {
      return;
    }
    const newMessage: ChatMessage = { role: "user", text: messageToSend };
    const newAIMessage: ChatMessage = { role: "ai", text: "Thinking..." };
    setMessages((chatMessages) => [...chatMessages, newMessage, newAIMessage]);
    setInputVal("");

    try {
      const response = await fetch(
        "https://api.genfuseai.com/api/v1/apps/run_apis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer 775810821a8493386087a4a1f3f159866c4457dd3b8d23a3ce570347043ab1e4",
          },
          body: JSON.stringify({
            app_id: "819eb174-8a7f-4da3-a427-b0b819c46277",
            run_id: runId,
            "in-1": messageToSend,
          }),
        }
      );
      if (response.ok) {
        const interviewerMsg = await readStreamingApiResponseWithRunId(
          response
        );
      } else {
        throw new Error("Failed");
      }
    } catch (error) {}
  };

  const readStreamingApiResponseWithRunId = async (response: any) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let streamingOutputMsg = "";
    let streamingOutputResume = "";
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
        partialData = lines.pop() || "";
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

                if (parsedJson["out-1"]) {
                  streamingOutputMsg = streamingOutputMsg + parsedJson["out-1"];
                  setMessages((chatMessages: any) => {
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    if (lastMessage && lastMessage.role === "ai") {
                      const updatedMessages = chatMessages.slice(0, -1);
                      return [
                        ...updatedMessages,
                        { text: streamingOutputMsg, role: "ai" },
                      ];
                    }
                    return [
                      ...chatMessages,
                      { text: streamingOutputMsg, role: "ai" },
                    ];
                  });
                } else if (parsedJson["out-2"]) {
                  streamingOutputResume =
                    streamingOutputResume + parsedJson["out-2"];
                  console.log(streamingOutputResume);
                }
              }
            } catch (error) {}
          }
        }
      }
    }
    if (streamingOutputResume.toLowerCase() !== "not found") {
      setCreatedResume(streamingOutputResume);
    }
    return streamingOutputMsg;
  };

  const startChat = () => {
    handleUserMessageSend("Start");
    setShowChatbot(true);
  }

  return (
    <div className="flex gap-16 p-20">
      {!showChatbot ? (
        <div className="w-full text-center">
          <p className="text-xl mb-4">
            To create your resume, you will need to provide details such as{" "}
            <strong>personal details</strong>,{" "}
            <strong>educational qualifications</strong>, and{" "}
            <strong>job experience</strong>. It should take around 10 minutes.
          </p>
          <button
            onClick={() => startChat()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Let’s Get Started
          </button>
        </div>
      ) : (
        <>
          <div className="w-[60%]">
            <p>Resume Builder Bot</p>
            <div className="max-w-2xl w-full p-6 border border-gray-300 rounded-lg shadow-lg space-y-4 bg-white h-[700px] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Chatbot
              </h2>
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
                <textarea
                  value={inputVal}
                  rows={2}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button
                  onClick={() => handleUserMessageSend()}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          <div className="w-[40%]">
            <p>Created Resume</p>
            <div className="prose">
              <ReactMarkdown>{createdResume}</ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
