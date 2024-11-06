"use client";
import React, { useState } from "react";
import Chatbot from "./Chatbot";
import { readStreamingApiResponse } from "../utils";

export default function Page() {
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("Generating questions...");

    try {
      const response = await fetch(
        "https://api.genfuseai.com/api/v1/apps/run_apis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer 187cb8df4511abdb626109ac9167ea2b42e33711cf65c586e6dcf86e89ac922f",
          },
          body: JSON.stringify({
            app_id: "56bfbf49-ea22-4483-81e5-66590c3e4d7f",
            run_id: "",
            "in-1": jobDescription,
            "in-2": skills,
          }),
        }
      );
      if (response.ok) {
        const questions = await readStreamingApiResponse(response);
        setGeneratedQuestions(questions);
      } else {
        throw new Error("Failed");
      }
      setStatusMessage("Questions generated");
    } catch (error) {
      setStatusMessage("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-20 flex-col gap-16 items-center">
      <div className="max-w-2xl w-full flex flex-col space-y-4">
        <label className="text-lg font-semibold">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
          placeholder="Enter the job description"
        />
        <label className="text-lg font-semibold">Skills</label>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
          placeholder="Enter required skills"
        />
        <button
          onClick={handleSubmit}
          className="mt-4 p-2 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
        <p className="text-gray-500">{statusMessage}</p>
      </div>
      {generatedQuestions.length > 0 && (
        <div className="max-w-2xl w-full">
          <Chatbot
            jobDesc={jobDescription}
            skills={skills}
            generatedQuestions={generatedQuestions}
          />
        </div>
      )}
    </div>
  );
}
