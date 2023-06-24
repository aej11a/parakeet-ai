import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export type ChatFromDb = {
  uid: string;
  user_uid: string;
  created_at: string;
  name: string;
};
export type FormattedChat = {
  uid: string;
  user_id: string;
  created_at: Date;
  name: string;
};

export const runtime = "edge";

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);

export async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }

  return new NextResponse(
    JSON.stringify({
      chats: await getChats(userId),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        // do not cache
        "Cache-Control": "private, no-store, no-cache",
      },
    }
  );
}

// Get the user's last 20 chats from the database
export const getChats = async (userId: string) => {
  const conn = db.connection();
  const chats = await conn.execute(
    "SELECT * FROM chats WHERE user_uid = :userId ORDER BY created_at DESC LIMIT 20",
    { userId }
  );
  return (chats.rows as ChatFromDb[]).map((chat: ChatFromDb) => {
    return {
      uid: chat.uid,
      user_id: chat.user_uid,
      created_at: new Date(chat.created_at),
      name: chat.name,
    };
  });
};
