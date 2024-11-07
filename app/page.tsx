import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-20">
      <a href="/java-interviewer" className="underline">
        Java Interviewer
      </a>
      <a href="/resume-builder" className="underline">
        Resume Builder
      </a>
    </div>
  );
}
