import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getChat } from "@/db/getChat";
import { MessageFromDb, searchForMessages } from "./searchForMessages";

export const GET = async (req: NextRequest) => {
  // split the req.nextUrl.pathname into an array of strings and grab the last element
  const url = req.nextUrl;
  const { userId } = auth();

  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }

  if (!url.searchParams.get("query")) {
    return new Response("Missing query", { status: 400 });
  }

  const resultMessages = await searchForMessages(
    userId,
    url.searchParams.get("query") as string
  );

  const results = await Promise.all(
    resultMessages.map(async (message) => {
      return {
        matchedMessage: message,
        associatedChat: await getChat(message.chat_uid, userId),
      };
    })
  );

  return new NextResponse(
    JSON.stringify({
      results,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        // do not cache
        "Cache-Control": "private, no-store, no-cache",
      },
    }
  );
};
