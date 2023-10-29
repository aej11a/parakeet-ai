import { NextRequest, NextResponse } from "next/server";
import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { ChatCompletionRequestMessageRoleEnum as Roles } from "openai-edge";
import { auth } from "@clerk/nextjs";

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
  const currentPageRaw = req.nextUrl.searchParams.get("currentPage");
  const pageSizeRaw = req.nextUrl.searchParams.get("pageSize");
  const currentPage = currentPageRaw ? parseInt(currentPageRaw) : 1;
  const pageSize = pageSizeRaw
    ? parseInt(pageSizeRaw) < 20
      ? parseInt(pageSizeRaw)
      : 20
    : 20;

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
    JSON.stringify(await getMessages(userId, chat_uid, pageSize, currentPage)),
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
export const getMessages = async (
  userId: string,
  chatId: string,
  pageSize = 20,
  currentPage = 1
) => {
  const pageSizeWithLimit = pageSize > 20 ? 20 : pageSize;
  let doesNextPageExist = false;
  const conn = db.connection();
  const messages = await conn.execute(
    `SELECT * 
    FROM (
      SELECT *
      FROM messages
      WHERE chat_uid = :chatId AND user_uid = :userId
      ORDER BY created_at DESC
      LIMIT :limit
      OFFSET :offset
      ) AS subquery
    ORDER BY created_at ASC;`,
    {
      chatId,
      userId,
      limit: pageSizeWithLimit + 1,
      offset: (currentPage - 1) * pageSizeWithLimit,
    }
  );
  if (messages.rows.length === pageSizeWithLimit + 1) {
    doesNextPageExist = true;
    messages.rows.shift();
  }
  return {
    messages: messages.rows as MessageFromDb[],
    doesNextPageExist,
  };
};

export const DELETE = async (req: NextRequest) => {
  const chat_uid = req.nextUrl.pathname.split("/").pop();
  const { userId } = auth();

  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }

  if (!chat_uid) {
    return new Response("Missing chat_uid", { status: 400 });
  }

  return new NextResponse(JSON.stringify(await deleteChat(userId, chat_uid)), {
    headers: {
      "Content-Type": "application/json",
      // do not cache
      "Cache-Control": "private, no-store, no-cache",
    },
  });
};

const deleteChat = async (userId: string, chat_uid: string) => {
  try {
    const conn = db.connection();
    const messagesDeletion = await conn.execute(
      `DELETE FROM messages
    WHERE chat_uid = :chat_uid AND user_uid = :userId;`,
      {
        chat_uid,
        userId,
      }
    );
    const chatDeletion = await conn.execute(
      `DELETE FROM chats
    WHERE uid = :chat_uid AND user_uid = :userId;`,
      {
        chat_uid,
        userId,
      }
    );

    return {
      success: true,
      error: null,
    };
  } catch (e) {
    console.log("Error deleting chat", e);
    return {
      success: false,
      error: "Error deleting chat",
    };
  }
};
