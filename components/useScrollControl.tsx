import { useEffect, useRef, useState } from "react";

export const useScrollControl = (messages: any) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (divRef.current && initialLoad) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
      setInitialLoad(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    if (divRef.current && !initialLoad) {
      const { scrollTop, scrollHeight, clientHeight } = divRef.current;
      const isNearBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) <
        window.innerHeight / 10;

      if (isNearBottom) {
        divRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, initialLoad]);

  return divRef;
};
