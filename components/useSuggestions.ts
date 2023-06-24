import { Message, useChat } from "ai/react";
import { useEffect } from "react";

export interface UseSuggestionsOptions {
  completedMessages: Message[];
}

export const useSuggestions = ({
  completedMessages,
}: UseSuggestionsOptions) => {
  const { messages, append } = useChat({
    api: "/api/chat/generic",
  });

  const completedMessagesStr = JSON.stringify(completedMessages);

  useEffect(() => {
    append({
      content: `Given the following messages, suggest three questions that \
          the user might want to ask the assistant next. You must respond in the form of a list \
          of questions separated by the character "|". Do not include any other punctiation. \
          Do NOT number the list. Add a "|" as the last character at the end of the last question too. \
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

  const suggestions =
    messages.length % 2 === 0 && messages[messages.length - 1]?.content
      ? messages[messages.length - 1]?.content.split("|").slice(0, -1)
      : [];

  return {
    suggestions,
  };
};
