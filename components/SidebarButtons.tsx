"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { AiOutlineSplitCells } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { useSidebarToggle } from "./SidebarContainer";

// transition-colors duration-200 hover:bg-gray-500/10
export const SidebarButtons = () => {
  const segments = useSelectedLayoutSegments();
  const { toggleSidebar } = useSidebarToggle();
  return (
    <div className="sidebar-buttons-top mb-1 flex flex-col gap-2 mt-2 pl-2 overflow-scroll sticky top-0 bg-slate-900 pb-2 shadow-b-md">
      <div className="pl-1 pt-1 flex flex-row mb-1">
        <p className="w-10/12 text-2xl">My AI App</p>
        <div className="md:hidden">
          <button onClick={() => toggleSidebar()}>Close</button>
        </div>
        <div className="-mt-0.5 -ml-0.5">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      <Link
        href={"/chat/" + uuidv4()}
        className="chat-link flex justify-between p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 h-11 flex-shrink-0 flex-grow mr-2"
      >
        <div className="flex items-center">
          <svg
            stroke="currentColor"
            fill="none"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>&nbsp;&nbsp;&nbsp;New chat</span>
        </div>
        {segments[0] === "chat" && segments[1] && (
          <Link
            // make new chats item also support split screen
            href={`/chat/${segments[1]}/${uuidv4()}`}
            title={"Open in Split Screen"}
            className="split-screen-button hover:bg-gray-500 text-white font-bold py-1 px-1 rounded-md float-right hidden"
          >
            <AiOutlineSplitCells size={20} />
          </Link>
        )}
      </Link>
    </div>
  );
};
