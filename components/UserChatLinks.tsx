"use client";
import type { FormattedChat } from "@/app/api/chats/route";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { AiOutlineSplitCells } from "react-icons/ai";

export const UserChatLinks = ({ chats }: { chats: FormattedChat[] }) => {
  const segments = useSelectedLayoutSegments();
  return (
    <div className="min-h-full overflow-y-auto">
      {chats.map((chat) => (
        <div key={chat.uid}>
          <Link href={`/chat/${chat.uid}`} title={chat.name}>
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
                    title={"Open in Split Screen"}
                    className="split-screen-button hover:bg-gray-500 text-white font-bold py-1 px-1 rounded-md"
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
    </div>
  );
};
