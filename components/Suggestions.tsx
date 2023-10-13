import { useChat, Message, UseChatHelpers } from "ai/react";
import { ChatCompletionResponseMessageRoleEnum as Roles } from "openai-edge";
import { useEffect } from "react";

export const Suggestions = ({
  completedMessages,
  addMessage,
}: {
  completedMessages: Message[];
  addMessage: UseChatHelpers["append"];
}) => {
  const { messages: suggMessages, append } = useChat({
    api: "/api/chat/generic",
  });

  const completedMessagesStr = JSON.stringify(completedMessages);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      append({
        content: `Given the following messages, suggest three questions that \
        the user might want to ask the assistant next. All questions should be stated from the user's point-of-view. \
        You must respond in the form of a list of questions separated by the character "|". \
        Do not include any other punctuation. Do NOT number the list. \
        Add a "|" as the last character at the end of the last question too. \
        ${completedMessagesStr}`,
        role: "user",
        createdAt: new Date(),
      });
    }
  }, [completedMessagesStr, append]);

  const suggestionsToRender =
    suggMessages.length % 2 === 0 &&
    suggMessages[suggMessages.length - 1]?.content
      ? suggMessages[suggMessages.length - 1]?.content.split("|").slice(0, -1)
      : [];

  return (
    <div className="w-3/4 mx-auto">
      {suggestionsToRender.map((suggestion) => (
        <span key={suggestion}>
          <button
            className="border rounded-full px-1 py-0.5 text-sm bg-white"
            onClick={() => {
              addMessage({
                content: suggestion,
                role: Roles.User,
                createdAt: new Date(),
              });
            }}
          >
            <p>{suggestion}</p>
          </button>
        </span>
      ))}
    </div>
  );
};
