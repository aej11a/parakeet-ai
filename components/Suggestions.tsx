import { useChat, Message, UseChatHelpers } from "ai/react";
import { ChatCompletionResponseMessageRoleEnum as Roles } from "openai-edge";
import { useEffect, useRef, useState } from "react";

const tryParseJSON = (jsonString: string) => {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    // Try appending a closing '}' or ']'
    try {
      parsed = JSON.parse(jsonString + "}");
    } catch (e1) {
      try {
        parsed = JSON.parse(jsonString + "}]");
      } catch (e2) {
        return null;
      }
    }
  }
  return parsed;
};

export const Suggestions = ({
  completedMessages,
  addMessage,
}: {
  completedMessages: Message[];
  addMessage: UseChatHelpers["append"];
}) => {
  // WARNING: it seems `append` is not referentially stable,
  // so DO NOT use it in a useEffect dependency array - it causes itself to be called infinitely
  const {
    messages: suggMessages,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat/generic",
    onFinish(message) {
      setMessages([]);
    },
  });

  const [suggestions, setSuggestions] = useState<
    Array<{
      shortform: string;
      question: string;
    }>
  >([]);

  const completedMessagesStr = JSON.stringify(
    completedMessages.map((msg) => msg.role + ": " + msg.content)
  );

  useEffect(() => {
    append({
      content: `Given the following messages, suggest three questions that \
        the user might want to ask the assistant next on related topics. All questions should be stated from the user's point-of-view. \
        Before each question, start with a one-to-three word short summary of the question. \
        Respond in the following format ONLY: [{shortform: "", question: ""}, ...]. It MUST be valid, parseable JSON. \
        ${completedMessagesStr.slice(-6000)}`, // this number seems safe for the token limit
      role: "user",
      createdAt: new Date(),
    });
  }, [completedMessagesStr]);

  const suggestionsJsonString =
    (suggMessages.length % 2 === 0 &&
      suggMessages[suggMessages.length - 1]?.content) ||
    "[]";

  try {
    const parsed = tryParseJSON(suggestionsJsonString);
    // this condition prevents infinite loop
    if (
      suggMessages.length > 0 &&
      parsed &&
      JSON.stringify(parsed) !== JSON.stringify(suggestions)
    )
      setSuggestions(parsed);
  } catch {
    console.log("Invalid JSON");
  }

  let setOfShortforms = new Set<string>();

  return (
    <div className="mx-auto">
      {suggestions
        .filter((suggestion) => {
          if (setOfShortforms.has(suggestion.shortform)) return false;
          setOfShortforms.add(suggestion.shortform);
          return suggestion.question && suggestion.shortform;
        })
        .map((suggestion) => (
          <span key={suggestion.question} className="mr-2 mb-2">
            <button
              className="text-sm font-semibold border bg-white border-gray-400 hover:bg-gray-400 py-1 px-2 mt-[0.25rem] mb-[0.25rem] rounded-full"
              onClick={() => {
                addMessage({
                  content: suggestion.question,
                  role: Roles.User,
                  createdAt: new Date(),
                });
                setSuggestions([]);
              }}
            >
              <p>
                {suggestion.shortform}
                {suggestion.shortform?.at(-1) === "?" ? "" : "?"}
              </p>
            </button>
          </span>
        ))}
    </div>
  );
};
