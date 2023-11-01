"use client";
import { useChat } from "ai/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(uuidv4());
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    }
  });

  return (
    <div className="flex justify-end min-h-screen flex-col items-center md:justify-between sticky bottom-0 p-4 md:p-24">
      <div className="mx-auto w-full max-w-md py-4 md:py-24 flex flex-col stretch">
        {messages.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? "You: " : "AI: "}
            {m.content}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="">
          <input
            className="w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}
