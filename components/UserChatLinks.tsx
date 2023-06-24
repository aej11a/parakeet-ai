"use client";
import type { FormattedChat } from "@/app/api/chats/route";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

export const UserChatLinks = ({ chats }: { chats: FormattedChat[] }) => {
  const segments = useSelectedLayoutSegments();
  console.log(segments);
  return (
    <div className="min-h-full overflow-y-auto">
      {chats.map((chat) => (
        <Link href={`/chat/${chat.uid}`} key={chat.uid} title={chat.name}>
          <div
            className={
              "p-2 m-2 transition-colors duration-200 rounded-lg text-ellipsis text-sm" +
              (segments[1] === chat.uid ? " bg-gray-200/30" : "") +
              (segments[1] !== chat.uid ? " hover:bg-gray-500/20" : "")
            }
          >
            {chat.name ? chat.name : "<no-name>"}
          </div>
        </Link>
      ))}
    </div>
  );
};
