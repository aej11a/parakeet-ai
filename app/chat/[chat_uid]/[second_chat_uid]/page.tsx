import { getMessages } from "@/app/api/chat/[chat_uid]/route";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chat } from "../../../../components/Chat";
import Link from "next/link";

export default async function ChatPage({
  params: { chat_uid, second_chat_uid },
}: {
  params: { chat_uid: string; second_chat_uid: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");
  if (chat_uid === second_chat_uid) redirect(`/chat/${chat_uid}`);
  const [leftMessages, rightMessages] = await Promise.all([
    getMessages(userId, chat_uid),
    getMessages(userId, second_chat_uid),
  ]);

  return (
    <div className="flex">
      {/*Render messages*/}
      <div className="w-1/2 h-screen overflow-y-scroll border-r-2">
        <Chat
          chatId={chat_uid}
          initialMessages={leftMessages
            .filter((row) => row.role && row.role !== "system")
            .map((message) => ({
              content: message.message,
              role: message.role,
              id: message.uid,
              createdAt: new Date(message.created_at),
            }))}
        />
      </div>
      <div className="w-1/2 h-screen overflow-y-scroll">
        <Chat
          chatId={second_chat_uid}
          initialMessages={rightMessages
            .filter((row) => row.role && row.role !== "system")
            .map((message) => ({
              content: message.message,
              role: message.role,
              id: message.uid,
              createdAt: new Date(message.created_at),
            }))}
        />
      </div>
    </div>
  );
}
