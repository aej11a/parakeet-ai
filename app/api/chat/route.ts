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
import { getChat } from "@/db/getChat";

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

const INITIAL_MESSAGE: ChatMessage = {
  role: Roles.System,
  content:
    "From this point forward, keep all responses extremely concise. Minimize warning info, you do not need to mention that you are an AI model, because the user already knows.",
};

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const req_body = await req.json();
  const userId = auth().userId;
  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }
  if (!req_body.chatId) {
    return new Response("Missing chatId", { status: 400 });
  }

  // Extract the `messages` from the body of the request
  const req_messages = req_body.messages as ChatMessage[];

  // Add the initial prompt to set up the conversation
  // if (req_messages.length === 1) {
  //   req_messages.unshift(INITIAL_MESSAGE);
  // }

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: req_messages,
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onCompletion: async (new_ai_message) => {
      saveMessages({
        userId,
        chatId: req_body.chatId,
        user_message: req_messages[req_messages.length - 1].content,
        ai_message: new_ai_message,
      });
    },
  });
  // Respond with the stream
  return new StreamingTextResponse(stream);
}

const saveMessages = async ({
  userId,
  chatId,
  user_message,
  ai_message,
}: {
  userId: string;
  chatId: string;
  user_message: string;
  ai_message: string;
}) => {
  let chat = await getChat(chatId, userId);
  if (!chat) {
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
    const nameWithoutQuotes = rawName.replaceAll('"', "").replaceAll("'", "");
    const name =
      nameWithoutQuotes.slice(0, -1) === "."
        ? nameWithoutQuotes.slice(0, -1)
        : nameWithoutQuotes;
    await createChat(chatId, userId, name);
    // await saveMessage(
    //   chatId,
    //   userId,
    //   INITIAL_MESSAGE.role,
    //   INITIAL_MESSAGE.content
    // );
  }
  await saveMessage(chatId, userId, Roles.User, user_message);
  await saveMessage(chatId, userId, Roles.Assistant, ai_message);
};

const createChat = async (
  chatId: string,
  userId: string,
  chat_name: string
): Promise<any> => {
  const conn = db.connection();
  const createQuery = `INSERT INTO chats (uid, user_uid, name) VALUES (:chatId, :userId, :chat_name)`;
  const createChatResult = await conn.execute(createQuery, {
    userId,
    chatId,
    chat_name,
  });
  if (!createChatResult.rowsAffected) {
    throw new Error("Failed to create chat");
  }
  const insertQuery = `INSERT INTO messages (uid, chat_uid, user_uid, role, message) VALUES (UUID(), :chatId, :userId, :role, :content)`;
  // const insertParams = {
  //   chatId,
  //   userId,
  //   role: INITIAL_MESSAGE.role,
  //   content: INITIAL_MESSAGE.content,
  // };
  // await conn.execute(insertQuery, insertParams);
};

async function saveMessage(
  chatId: string,
  userId: string,
  role: string,
  content: string
): Promise<void> {
  const conn = db.connection();
  const checkQuery = `SELECT COUNT(*) AS count FROM chats WHERE uid = :chatId AND user_uid = :userId`;
  const checkParams = { chatId, userId };
  const checkResult = await conn.execute(checkQuery, checkParams);
  if (checkResult.rows.length === 0) {
    throw new Error("Chat not found");
  }
  if (checkResult.rows.length === 1) {
    const insertQuery = `
      INSERT INTO messages (uid, chat_uid, user_uid, role, message) VALUES (UUID(), :chatId, :userId, :role, :content)
    `;
    const insertParams = { chatId, userId, role, content };
    await conn.execute(insertQuery, insertParams);
  }
}
