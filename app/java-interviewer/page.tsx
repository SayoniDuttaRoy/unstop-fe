"use client";
import React, { useState } from "react";

export default function Page() {
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Job Description:", jobDescription);
    console.log("Skills:", skills);
  };

  return (
    <div className="flex justify-center my-20">
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
        >
          Submit
        </button>
      </div>
    </div>
  );
}
