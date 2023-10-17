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

export async function GET(req: NextRequest) {
  const currentPageRaw = req.nextUrl.searchParams.get("currentPage");
  const pageSizeRaw = req.nextUrl.searchParams.get("pageSize");
  const currentPage = currentPageRaw ? parseInt(currentPageRaw) : 1;
  const pageSize = pageSizeRaw
    ? parseInt(pageSizeRaw) < 20
      ? parseInt(pageSizeRaw)
      : 20
    : 20;
  const { userId } = auth();

  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }

  return new NextResponse(
    JSON.stringify(await getChats(userId, pageSize, currentPage)),
    {
      headers: {
        "Content-Type": "application/json",
        // do not cache
        "Cache-Control": "private, no-store, no-cache",
      },
    }
  );
}
