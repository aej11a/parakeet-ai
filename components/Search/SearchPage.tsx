"use client";
import { FormEvent, useEffect, useState } from "react";
import { MessageFromDb } from "../../app/api/chat/[chat_uid]/route";
import { ChatFromDb } from "../../app/api/chats/route";
import Link from "next/link";
import Markdown from "react-markdown";
import { LuCopy } from "react-icons/lu";
import remarkGfm from "remark-gfm";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import dynamic from "next/dynamic";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useSidebarToggle } from "../SidebarContainer";
import { GiHamburgerMenu } from "react-icons/gi";
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    loading: () => <p>Loading code...</p>,
  }
);

type SearchResult = {
  matchedMessage: MessageFromDb;
  associatedChat: ChatFromDb;
};

export const SearchPageComponent = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>();
  const [selectedChat, setSelectedChat] = useState<ChatFromDb>();
  const [searchTerm, setSearchTerm] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);
  const { toggleSidebar, isSideBarOpen } = useSidebarToggle();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchTerm(formData.get("searchterm") as string);
  };

  useEffect(() => {
    if (searchTerm?.length) {
      setIsLoading(true);
      fetch(`/api/search?query=${searchTerm}`)
        .then((res) => res.json())
        .then((res) => setSearchResults(res.results))
        .then(() => setIsLoading(false));
    }
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-white text-center py-2 border-b flex justify-between z-10">
        <div>
          <button
            onClick={() => toggleSidebar()}
            className="md:invisible p-2 ml-2 -mr-2 border rounded-xl hover:bg-gray-200 transition-all"
          >
            <GiHamburgerMenu />
          </button>
        </div>
        <div className="w-3/4 line-clamp-1">Search</div>
        <div className="px-4">
        </div>
      </div>
      <div className="flex justify-center items-center h-44 px-4 bg-gray-100">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md"
        >
          <div className="flex items-stretch space-x-2">
            <input
              name="searchterm"
              required
              className="flex-grow p-4 text-lg border rounded-md focus:ring focus:ring-opacity-50 focus:ring-blue-300"
              placeholder="Enter search term"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-2 px-4 rounded-md"
            >
              <FaMagnifyingGlass height={30} width={30} />
            </button>
          </div>
        </form>
      </div>

      {isLoading && <div>Loading...</div>}
      {searchResults && searchResults.length === 0 && <div>No Results</div>}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className="bg-gray-100 px-4 md:px-48 overflow-auto flex-1">
          <ul className="space-y-4 list-none">
            {searchResults.map((searchResult) => (
              <FoundMessage
                key={
                  searchResult.matchedMessage.uid +
                  searchResult.associatedChat.uid
                }
                searchResult={searchResult}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FoundMessage = ({ searchResult }: { searchResult: SearchResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const message = {
    content: searchResult.matchedMessage.message,
    role: searchResult.matchedMessage.role,
  };

  return (
    <li
      key={searchResult.matchedMessage.uid}
      className={
        "bg-white rounded-md shadow-lg overflow-clip" +
        (isExpanded ? "" : " max-h-72")
      }
    >
      <div className={"p-4" + (isExpanded ? "" : " max-h-64")}>
        {/* <div className="flex mb-2">
                    <span className="text-lg font-semibold">
                      {searchResult.matchedMessage.role === "assistant"
                        ? "AI: "
                        : "You: "}
                    </span>
                    <span className="ml-2 text-lg">
                      {searchResult.matchedMessage.message}
                    </span>
                  </div> */}
        <div className="px-4">
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
                          // @ts-expect-error copy exists in the browser
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

      <div className="sticky bottom-0 bg-white flex justify-between">
        <div className="text-gray-500 px-4 py-1 max-w-3/4">
          in chat{" "}
          <Link
            href={`/chat/${searchResult.associatedChat.uid}`}
            className="text-blue-500 hover:underline"
          >
            <b>{`"${searchResult.associatedChat.name}"`}</b>
          </Link>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:underline mr-2 py-1"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      </div>
    </li>
  );
};
