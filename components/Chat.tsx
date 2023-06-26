"use client";
import { Suggestions } from "@/components/Suggestions";
import useDebouncedCallback from "@/components/useDebounce";
import { useChat, Message } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Markdown from "markdown-to-jsx";

export const Chat = ({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages?: Message[];
}) => {
  const router = useRouter();
  const [completedMessages, setCompletedMessages] = useState<Message[]>(
    initialMessages || []
  );
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append: appendMessage,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages,
    onFinish(message) {
      setCompletedMessages(() => [...messages, message]);
    },
  });
  return (
    <div className="flex-col-reverse">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            "px-24 " +
            (message.role === "assistant" ? "bg-gray-300" : "bg-white")
          }
        >
          <div className="py-4">
            <b>{message.role === "assistant" ? "AI: " : "User: "}</b>
            <Markdown>{message.content}</Markdown>
          </div>
        </div>
      ))}
      <div className="h-24 md:h-24 flex-shrink-0"></div>
      <div className="fixed bottom-0 px-24 w-full">
        <Suggestions
          completedMessages={completedMessages}
          addMessage={appendMessage}
        />
        <form onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 rounded mb-8 shadow-xl p-2 w-3/4 block"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
};
