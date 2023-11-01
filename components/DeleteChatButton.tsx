"use client";
import { useRouter } from "next/navigation";
import { FiTrash2 as TrashIcon } from "react-icons/fi";
import { ConfirmationModal } from "./ModalWithTrigger";

export const DeleteChatButton = ({
  chatName,
  chatUid,
}: {
  chatName: string;
  chatUid: string;
}) => {
  const router = useRouter();
  return (
    <ConfirmationModal
      triggerContent={
        <>
          <p className="mr-2">Delete Chat</p>
          <TrashIcon size={20} />
        </>
      }
      triggerClassnames="flex px-4 py-2 rounded-lg bg-red-400 font-bold text-sm rounded hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
      headline="Delete chat?"
      bodyContent={
        <>
          Are you sure you want to delete the chat {chatName}? <br /> This
          action cannot be undone, the chat will be permanently deleted.
        </>
      }
      confirmText="DELETE CHAT"
      confirmClassnames="bg-red-500 text-white active:bg-red-600 font-bold uppercase"
      onConfirm={() => {
        fetch("/api/chat/" + chatUid, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((res) => {
            // TODO: add a confirmation message
            router.push("/");
          });
      }}
    />
  );
};
