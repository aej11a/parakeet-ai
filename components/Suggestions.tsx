import { useChat, Message, UseChatHelpers } from "ai/react";
import { ChatCompletionResponseMessageRoleEnum as Roles } from "openai-edge";
import { useEffect, useState } from "react";

export const Suggestions = ({
  completedMessages,
  addMessage,
}: {
  completedMessages: Message[];
  addMessage: UseChatHelpers["append"];
}) => {
  // state for suggestions
  const [suggestions, setSuggestions] = useState([]);

    const { messages, append } = useChat({
      api: "/api/chat/generic",
    });

  const completedMessagesStr = JSON.stringify(completedMessages);

    useEffect(() => {
      append({
        content: `Given the following messages, suggest three questions that \
        the user might want to ask the assistant next. All questions should be stated from the user's point-of-view. \
        You must respond in the form of a list of questions separated by the character "|". \
        Do not include any other punctiation. Do NOT number the list. \
        Add a "|" as the last character at the end of the last question too. \
        ${completedMessagesStr}`,
        role: "user",
        createdAt: new Date(),
      });
    }, [completedMessagesStr, append]);

//   const messages: Message[] = [{},{
//     id: "sadsads",
//     role: Roles.Assistant,
//     content: "Are there any dips that can be made ahead of time for a football party?|What are some vegetarian options for a football party?|Can you suggest some desserts to serve at a football party?|",
//   }];

  const suggestionsToRender =
    messages.length % 2 === 0 && messages[messages.length - 1]?.content
      ? messages[messages.length - 1]?.content.split("|").slice(0, -1)
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
