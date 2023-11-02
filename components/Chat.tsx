"use client";
import { Suggestions } from "@/components/Suggestions";
import { useChat, Message } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, memo, useMemo } from "react";
import Markdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import { useSidebarToggle } from "./SidebarContainer";
import { LuCopy, LuMousePointerClick } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import copy from "copy-to-clipboard";
import remarkGfm from "remark-gfm";

import dynamic from "next/dynamic";
import { useScrollControl } from "./useScrollControl";
import { DeleteChatButton } from "./DeleteChatButton";
import {
  ChatSettingsModal,
  getTemperatureFromLocalStorage,
} from "./SettingsModal";

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
  initialDoesNextPageExist,
  isSplitScreen = false,
}: {
  chatId: string;
  chatName: string;
  closeChatLink?: string;
  initialMessages?: Message[];
  initialDoesNextPageExist?: boolean;
  isSplitScreen?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doesNextPageExist, setDoesNextPageExist] = useState(
    initialDoesNextPageExist
  );
  const { toggleSidebar, isSideBarOpen } = useSidebarToggle();
  const [completedMessages, setCompletedMessages] = useState<Message[]>(
    initialMessages || []
  );
  const userMsgRef = useRef<string | null>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append: appendMessage,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId,
      temperature: getTemperatureFromLocalStorage(chatId),
    },
    initialMessages,
    onFinish(message) {
      setCompletedMessages((prev) => [
        ...prev,
        {
          id: "placeholder", // this doesn't actually matter
          role: "user",
          content: userMsgRef.current!,
        },
        message,
      ]);
    },
  });

  const loadMore = () => {
    setIsLoading(true);
    fetch(`/api/chat/${chatId}?currentPage=${messages.length / 20 + 1}`)
      .then((res) => res.json())
      .then((messagesData) => {
        setDoesNextPageExist(messagesData.doesNextPageExist);
        // @ts-ignore fix this later
        const formattedMsgs = messagesData.messages.map((dbMessage) => ({
          content: dbMessage.message,
          role: dbMessage.role,
        }));
        setMessages([...formattedMsgs, ...messages]);
        // @ts-ignore fix this later
        setCompletedMessages([...formattedMsgs, ...prev]);
        setIsLoading(false);
      });
  };

  const scrollingRef = useScrollControl(messages);

  return (
    <div
      className="chat h-full flex flex-col overflow-y-scroll"
      ref={scrollingRef}
    >
      <div className="sticky top-0 bg-white text-center py-2 border-b flex justify-between z-10">
        <div>
          <button
            onClick={() => toggleSidebar()}
            className="md:invisible p-2 ml-2 -mr-2 border rounded-xl hover:bg-gray-200 transition-all"
          >
            <GiHamburgerMenu />
          </button>
        </div>
        <div className="w-3/4 line-clamp-1 flex text-center justify-center">
          <div className="mr-4">{chatName}</div>
          <ChatSettingsModal chatName={chatName} chatUid={chatId} />
        </div>
        <div className="px-4">
          {closeChatLink && (
            <Link href={closeChatLink}>
              <AiOutlineClose className="mt-1" />
            </Link>
          )}
        </div>
      </div>
      {doesNextPageExist && (
        <div className="relative">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="absolute left-1/2 transform -translate-x-1/2 bg-gray-400 text-white rounded-full py-2 px-4 mt-1 text-sm hover:bg-gray-600  focus:outline-none focus:border-gray-900 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <div className="flex">
                <LuMousePointerClick size={18} className="mr-2" /> Load previous
                messages
              </div>
            )}
          </button>
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            (isSplitScreen
              ? "px-6 md:px-8 lg:px-16"
              : "px-6 md:px-16 lg:px-32") +
            (message.role === "assistant" ? " bg-gray-300" : " bg-white")
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
                      <div className="flex items-center relative px-4 py-2 -mb-2 text-xs justify-between rounded-t-md text-white bg-slate-700">
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
        </div>
      ))}
      {/* <div ref={messagesEndRef} /> */}
      <div className="flex-grow min-h-24 md:h-32"></div>
      <div className="sticky bottom-0 px-8 md:px-16 w-full">
        {completedMessages.length % 2 === 0 && completedMessages.length > 0 && (
          <Suggestions
            completedMessages={completedMessages}
            addMessage={appendMessage}
          />
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 rounded mb-8 shadow-xl p-2 w-full resize-none max-h-[200px]"
            value={input}
            placeholder="Say something..."
            onChange={(e) => {
              userMsgRef.current = e.target.value;
              handleInputChange(e);
            }}
          />
        </form>
      </div>
    </div>
  );
};
