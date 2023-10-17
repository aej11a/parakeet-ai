import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { ChatCompletionRequestMessageRoleEnum as Roles } from "openai-edge";

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
