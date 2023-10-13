import { NextRequest, NextResponse } from "next/server";
import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { ChatCompletionRequestMessageRoleEnum as Roles } from "openai-edge";
import { auth } from "@clerk/nextjs";
import { getChat } from "@/db/getChat";

export type MessageFromDb = {
  uid: string;
  chat_uid: string;
  user_uid: string;
  message: string;
  created_at: string;
  role: Roles;
};

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);

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

// Get the user's last 20 chats from the database
export const searchForMessages = async (userId: string, searchTerm: string) => {
  const conn = db.connection();
  const messages = await conn.execute(
    `SELECT * 
    FROM messages 
    WHERE message LIKE :searchTerm AND user_uid = :userId
    LIMIT :limit;`,
    { searchTerm: `%${searchTerm}%`, userId, limit: 20 }
  );
  return messages.rows as MessageFromDb[];
};
