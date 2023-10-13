"use client";
import { FormEvent, useEffect, useState } from "react";
import { MessageFromDb } from "../../app/api/chat/[chat_uid]/route";
import { ChatFromDb } from "../../app/api/chats/route";
import { Chat } from "@/components/Chat_Backup";
import Link from "next/link";

export const SearchPageComponent = () => {
  const [searchResults, setSearchResults] = useState<
    {
      matchedMessage: MessageFromDb;
      associatedChat: ChatFromDb;
    }[]
  >();
  const [selectedChat, setSelectedChat] = useState<ChatFromDb>();
  const [searchTerm, setSearchTerm] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);

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

  if (isLoading)
    return (
      <>
        Loading...
        <form onSubmit={handleSearch}>
          <input name="searchterm" required />
          <button type="submit">Search!</button>
        </form>
      </>
    );
  else if (!searchResults || searchResults.length === 0)
    return (
      <>
        No Results
        <form onSubmit={handleSearch}>
          <input name="searchterm" required />
          <button type="submit">Search!</button>
        </form>
      </>
    );
  else
    return (
      <div className="flex">
        {/*Render messages*/}
        <div className="w-1/2 h-screen">
          <form onSubmit={handleSearch}>
            <input name="searchterm" required />
            <button type="submit">Search!</button>
          </form>
          <ul>
            {searchResults.map((searchResult) => (
              <li key={searchResult.matchedMessage.uid}>
                <p>
                  <b>
                    {searchResult.matchedMessage.role === "assistant"
                      ? "AI: "
                      : "You: "}
                  </b>
                  {searchResult.matchedMessage.message}
                </p>
                <p>
                  in chat{" "}
                  <Link href={`/chat/${searchResult.associatedChat.uid}`}>
                    <b>&quot;{searchResult.associatedChat.name}&quot;</b>
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
        {selectedChat && (
          <div className="w-1/2 h-screen">
            <Chat
              chatId={selectedChat.uid}
              chatName={selectedChat.name || "Your Chat"}
            />
          </div>
        )}
      </div>
    );
};
