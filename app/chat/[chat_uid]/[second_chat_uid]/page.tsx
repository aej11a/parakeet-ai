import { getMessages } from "@/app/api/chat/[chat_uid]/route";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chat } from "../../../../components/Chat";
import Link from "next/link";
import { getChat } from "@/db/getChat";

export default async function ChatPage({
  params: { chat_uid, second_chat_uid },
}: {
  params: { chat_uid: string; second_chat_uid: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");
  if (chat_uid === second_chat_uid) redirect(`/chat/${chat_uid}`);
  const [leftMessages, leftChat, rightMessages, rightChat] = await Promise.all([
    getMessages(userId, chat_uid),
    getChat(chat_uid, userId),
    getMessages(userId, second_chat_uid),
    getChat(second_chat_uid, userId),
  ]);

  if (!leftChat && !rightChat) redirect("/");
  else if (!leftChat) redirect(`/chat/${second_chat_uid}`);
  else if (!rightChat) redirect(`/chat/${chat_uid}`);

  return (
    <div className="flex">
      {/*Render messages*/}
      <div className="w-1/2 h-screen border-r-2">
        <Chat
          chatId={chat_uid}
          chatName={leftChat.name}
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
      <div className="w-1/2 h-screen">
        <Chat
          chatId={second_chat_uid}
          chatName={rightChat.name}
          closeChatLink={`/chat/${chat_uid}`}
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
