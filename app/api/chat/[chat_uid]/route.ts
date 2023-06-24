import { NextRequest, NextResponse } from "next/server";
import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { ChatCompletionRequestMessageRoleEnum as Roles } from "openai-edge";
import { ChatFromDb } from "../../chats/route";
import { auth } from "@clerk/nextjs";

export type MessageFromDb = {
  uid: string;
  chat_uid: string;
  user_uid: string;
  message: string;
  created_at: string;
  role: Roles;
}

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);

export const GET = async (req: NextRequest) => {
  // split the req.nextUrl.pathname into an array of strings and grab the last element
  const chat_uid = req.nextUrl.pathname.split("/").pop();
  const { userId } = auth();

  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }

  if (!chat_uid) {
    return new Response("Missing chat_uid", { status: 400 });
  }

  return new NextResponse(
    JSON.stringify({
      messages: await getMessages(userId, chat_uid),
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
export const getMessages = async (userId: string, chatId: string) => {
  const conn = db.connection();
  const messages = await conn.execute(
    `SELECT *
    FROM messages
    WHERE chat_uid = :chatId AND user_uid = :userId
    ORDER BY created_at DESC
    LIMIT :limit;`,
    { chatId, userId, limit: 20 }
  );
  return messages.rows as MessageFromDb[];
};
