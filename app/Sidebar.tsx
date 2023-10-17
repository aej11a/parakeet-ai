import { auth } from "@clerk/nextjs";
import { getChats } from "@/db/getChat";
import { UserChatLinks } from "@/components/UserChatLinks";

export async function Sidebar() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  const chatsRes = await getChats(userId);
  return (
    <div className="h-full">
      <UserChatLinks chats={chatsRes.chats} initialDoesNextPageExist={chatsRes.doesNextPageExist} />
    </div>
  );
}
