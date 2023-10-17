"use client";
import type { FormattedChat } from "@/app/api/chats/route";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useReducer, useState } from "react";
import { AiOutlineSplitCells } from "react-icons/ai";
import { useSidebarToggle } from "./SidebarContainer";

export const UserChatLinks = ({
  chats,
  initialDoesNextPageExist,
}: {
  chats: FormattedChat[];
  initialDoesNextPageExist: boolean;
}) => {
  const segments = useSelectedLayoutSegments();
  const { toggleSidebar } = useSidebarToggle();

  const [doesNextPageExist, setDoesNextPageExist] = useState(
    initialDoesNextPageExist
  );
  const [cumulativeChats, appendChats] = useReducer(
    (prev: FormattedChat[], next: FormattedChat[]) => [...prev, ...next],
    chats
  );
  const [isLoading, setIsLoading] = useState(false);

  const onLoadMore = () => {
    setIsLoading(true);
    fetch(`/api/chats?currentPage=${cumulativeChats.length / 20 + 1}`)
      .then((res) => res.json())
      .then((addtlChats) => {
        setDoesNextPageExist(addtlChats.doesNextPageExist);
        appendChats(addtlChats.chats);
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-full overflow-y-auto">
      {cumulativeChats.map((chat) => (
        <div key={chat.uid}>
          <Link
            href={`/chat/${chat.uid}`}
            onClick={() => toggleSidebar()}
            title={chat.name}
          >
            <div className="chat-link">
              <div
                className={
                  "py-2 pl-2 m-2 transition-colors duration-200 rounded-lg text-ellipsis text-sm flex items-center justify-between" +
                  (segments[1] === chat.uid ? " bg-gray-200/30" : "") +
                  (segments[1] !== chat.uid ? " hover:bg-gray-500/20" : "")
                }
              >
                {chat.name ? chat.name : "<no-name>"}
                {segments[1] !== chat.uid ? (
                  <Link
                    href={`/chat/${segments[1]}/${chat.uid}`}
                    onClick={() => toggleSidebar()}
                    title={"Open in Split Screen"}
                    className="split-screen-button hover:bg-gray-500 text-white font-bold py-1 px-1 rounded-md mr-2"
                  >
                    <AiOutlineSplitCells size={20} />
                  </Link>
                ) : (
                  <span
                    className="split-screen-button text-white font-bold py-1 px-1 rounded-md"
                    style={{ height: 20, width: 20 }}
                  />
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
      {doesNextPageExist && (
        <div className="chat-link">
          <button
            className={
              "py-2 pl-2 m-2 transition-colors duration-200 rounded-lg text-ellipsis text-sm flex items-center justify-between hover:bg-gray-500/20 w-4/5 border border-white/20"
            }
            onClick={onLoadMore}
            disabled={!doesNextPageExist || isLoading}
          >
            <div className="text-left">
              {isLoading ? "Loading..." : "Load more chats"}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
