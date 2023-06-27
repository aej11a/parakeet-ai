import { getMessages } from "@/app/api/chat/[chat_uid]/route";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chat } from "../../../components/Chat";

export default async function ChatPage({
  params: { chat_uid },
}: {
  params: { chat_uid: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");
  const messages = (await getMessages(userId, chat_uid)).filter(
    (row) => row.role && row.role !== "system"
  );

  // NEED TO CONVERT THE FORMAT OF THE MESSAGES BEFORE PASSING IN INITIAL MESSAGES

  return (
    <div className="h-screen overflow-y-scroll">
      {/*Render messages*/}
      <Chat
        chatId={chat_uid}
        initialMessages={messages.map((message) => ({
          content: message.message,
          role: message.role,
          id: message.uid,
          createdAt: new Date(message.created_at),
        }))}
      />
    </div>
  );
}
