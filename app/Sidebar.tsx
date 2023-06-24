import { auth } from "@clerk/nextjs";
import { getChats } from "./api/chats/route";
import Link from "next/link";
import { UserChatLinks } from "@/components/UserChatLinks";

export async function Sidebar() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  const chats = await getChats(userId);
  return (
    <div>
      <UserChatLinks chats={chats} />
    </div>
  );
}
