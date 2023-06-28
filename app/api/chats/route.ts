import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getChats } from "@/db/getChat";

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
