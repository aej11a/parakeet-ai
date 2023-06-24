import "server-only";
import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { auth } from "@clerk/nextjs";
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessage as ChatMessage,
  ChatCompletionRequestMessageRoleEnum as Roles,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

interface Chat {
  id: number;
  user_id: number;
  created_at: Date;
}

interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  message: string;
  created_at: Date;
}

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { user_message, ai_message, chat_uid } = await req.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const nameResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: false,
    messages: [
      {
        role: Roles.User,
        content: `The following is the beginning of a chat between a user and an AI assistant. Please generate a concise, relevant name for this chat. Your response should consist only of the name, which should be 6 words or less.
        User: ${user_message}
        AI: ${ai_message}
        `,
      },
    ],
  });
  const rawName = (await nameResponse.json()).choices[0].message.content;
  // get rid of quotes with .replaceAll
  const name = rawName.replaceAll('"', "").replaceAll("'", "");
}

const addName = async (user_uid: string, chat_uid: string, name: string) => {
  const conn = db.connection();
  const createQuery = `UPDATE chats SET name = :chat_name WHERE uid = :chatId AND user_uid = :userId;`;
  const createChatResult = await conn.execute(createQuery, {
    userId: user_uid,
    chatId: chat_uid,
    chat_name: name,
  });
  if (!createChatResult.rowsAffected) {
    throw new Error("Failed to create chat");
  }
};
