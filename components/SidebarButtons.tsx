import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

// transition-colors duration-200 hover:bg-gray-500/10
export const SidebarButtons = () => {
  return (
    <div className="mb-1 flex flex-col gap-2 mt-2 pl-2 overflow-scroll">
      <div className="pl-1 pt-1 flex flex-row mb-1">
        <p className="w-10/12 text-2xl">My AI App</p>
        <div className="-mt-0.5 -ml-0.5">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      <Link
        href={"/chat/" + uuidv4()}
        className="flex p-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 h-11 flex-shrink-0 flex-grow mr-2"
      >
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
        New chat
      </Link>
    </div>
  );
};
