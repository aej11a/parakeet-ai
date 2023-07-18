"use client";
import { Suggestions } from "@/components/Suggestions";
import { useChat, Message } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Markdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import { useSidebarToggle } from "./SidebarContainer";
import { LuCopy } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import copy from "copy-to-clipboard";
import remarkGfm from "remark-gfm";

import dynamic from "next/dynamic";
import { ResultImage } from "@/bing/image-types";
import { ImageGallery } from "./ImageGallery";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    loading: () => <p>Loading code...</p>,
  }
);

export const Chat = ({
  chatId,
  chatName,
  closeChatLink,
  initialMessages,
}: {
  chatId: string;
  chatName: string;
  closeChatLink?: string;
  initialMessages?: Message[];
}) => {
  const [images, setImages] = useState<Array<ResultImage>>([]);

  const { toggleSidebar, isSideBarOpen } = useSidebarToggle();

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
      getImages();
    },
  });
  // const messagesEndRef = useRef(null);
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };
  // useEffect(scrollToBottom, [messages]);
  return (
    <div className="chat h-full flex flex-col overflow-y-scroll">
      <div className="sticky top-0 bg-white text-center py-2 border-b flex justify-between z-10">
        <div>
          <button onClick={() => toggleSidebar()} className="md:invisible">
            Open
          </button>
        </div>
        <div className="w-3/4 line-clamp-1">{chatName}</div>
        <div className="px-4">
          {closeChatLink && (
            <Link href={closeChatLink}>
              <AiOutlineClose className="mt-1" />
            </Link>
          )}
        </div>
      </div>
      {messages.map((message, idx) => (
        <div
          key={message.id}
          className={
            "px-4 md:px-16 " +
            (message.role === "assistant" ? "bg-gray-300" : "bg-white")
          }
        >
          <div className="py-4">
            <b>{message.role === "assistant" ? "AI: " : "You: "}</b>
            <Markdown
              remarkPlugins={[remarkGfm]}
              // eslint-disable-next-line react/no-children-prop
              children={message.content}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <>
                      <div
                        className="flex items-center relative px-4 py-2 -mb-2 text-xs justify-between rounded-t-md text-white bg-slate-700"
                        // style={{ backgroundColor: "#1E1E1E" }}
                      >
                        <span>{className?.substring(9)}</span>
                        <button
                          className="flex ml-auto gap-2"
                          onClick={() => {
                            copy(String(children));
                          }}
                        >
                          <LuCopy />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        // eslint-disable-next-line react/no-children-prop
                        children={String(children).replace(/\n$/, "")}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                      />
                    </>
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
          {idx === messages.length - 1 && images.length > 0 && (
            <ImageGallery images={images} />
          )}
        </div>
      ))}
      {/* <div ref={messagesEndRef} /> */}
      <div className="flex-grow min-h-24 md:h-32"></div>
      <div className="sticky bottom-0 px-8 md:px-16 w-full">
        {/* 
           Not loving this - feels like a waste of space and resources ($$$), underpolished
           Need to re-evaluate later and see if it's worth it

          <Suggestions
            completedMessages={completedMessages}
            addMessage={appendMessage}
          /> 
        */}
        <form onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 rounded mb-8 shadow-xl p-2 w-full resize-none max-h-[200px]"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
};
