import { getMessages } from "@/app/api/chat/[chat_uid]/route";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chat } from "../../../components/Chat";
import { getChat } from "@/db/getChat";

export default async function ChatPage({
  params: { chat_uid },
}: {
  params: { chat_uid: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");

  const [messagesRes, chat] = await Promise.all([
    getMessages(userId, chat_uid),
    getChat(chat_uid, userId),
  ]);

  const messages = messagesRes.messages.filter(
    (row) => row.role && row.role !== "system"
  );

  return (
    <div className="h-screen overflow-y-scroll">
      {/*Render messages*/}
      <Chat
        chatId={chat_uid}
        chatName={chat?.name || "New chat"}
        initialMessages={messages.map((message) => ({
          content: message.message,
          role: message.role,
          id: message.uid,
          createdAt: new Date(message.created_at),
        }))}
        initialDoesNextPageExist={messagesRes.doesNextPageExist}
      />
    </div>
  );
}
