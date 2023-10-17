"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { AiOutlineSplitCells } from "react-icons/ai";
import { BsArrowBarRight } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import { useSidebarToggle } from "./SidebarContainer";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const SidebarButtons = () => {
  const segments = useSelectedLayoutSegments();
  const { toggleSidebar } = useSidebarToggle();
  return (
    <div className="sidebar-buttons-top mb-1 flex flex-col gap-2 mt-2 pl-2 overflow-scroll sticky top-0 bg-slate-900 pb-2 shadow-b-md">
      <div className="pl-1 pt-1 mb-1 grid grid-cols-8 md:grid-cols-5">
        <p className="w-10/12 text-2xl col-span-6 md:col-span-4">Parakeet AI</p>
        <div className="mr-2">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="md:hidden">
          <button
            onClick={() => toggleSidebar()}
            className="mr-2 p-2 items-center gap-3 transition-colors duration-200 text-white cursor-pointer rounded-md border border-white/20 hover:bg-gray-500/10"
          >
            <BsArrowBarRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4">
        <Link
          href={"/chat/" + uuidv4()}
          onClick={() => toggleSidebar()}
          className="chat-link col-span-3 flex justify-between p-3 items-center transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 h-11 flex-shrink-0 flex-grow mr-2"
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
            <span className="ml-2">New chat</span>
          </div>
          {segments[0] === "chat" && segments[1] && (
            <Link
              // make new chats item also support split screen
              href={`/chat/${segments[1]}/${uuidv4()}`}
              onClick={() => toggleSidebar()}
              title={"Open new chat in Split Screen"}
              className="ml-2 hover:bg-gray-500 border border-gray-500 text-white font-bold py-1 px-1 rounded-md float-right"
            >
              <AiOutlineSplitCells size={20} />
            </Link>
          )}
        </Link>
        <Link
          href={"/search"}
          onClick={() => toggleSidebar()}
          className="chat-link flex items-center transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 h-11 flex-shrink-0 flex-grow mr-2"
        >
          <FaMagnifyingGlass height={24} width={24} className="mx-auto" />
        </Link>
      </div>
    </div>
  );
};
