import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { ChatFromDb } from "@/app/api/chats/route";

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);
export async function getChat(
  chatId: string,
  userId: string
): Promise<ChatFromDb | null> {
  const conn = db.connection();
  const query =
    "SELECT * FROM chats WHERE uid = :chatId AND user_uid = :userId";
  const params = { chatId, userId };
  const result = await conn.execute(query, params);
  if (result.rows.length === 0) {
    return null;
  } else {
    return result.rows[0] as ChatFromDb;
  }
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
