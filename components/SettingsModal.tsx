"use client";
import { useRouter } from "next/navigation";
import { FiSettings as SettingsIcon } from "react-icons/fi";
import { ModalWithTrigger } from "./ModalWithTrigger";
import { DeleteChatButton } from "./DeleteChatButton";
import { useRef } from "react";

const setTemperatureInLocalStorage = (chatUid: string, temperature: number) => {
  const temperatures = JSON.parse(localStorage.getItem("temperatures") || "{}");
  temperatures[chatUid] = temperature;
  localStorage.setItem("temperatures", JSON.stringify(temperatures));
};

export const getTemperatureFromLocalStorage = (chatUid: string) => {
  const temperatures = JSON.parse(localStorage.getItem("temperatures") || "{}");
  return temperatures[chatUid] || 0.75;
};

export const ChatSettingsModal = ({
  chatName,
  chatUid,
}: {
  chatName: string;
  chatUid: string;
}) => {
  const router = useRouter();
  const tempSpanRef = useRef<HTMLSpanElement>(null);
  return (
    <ModalWithTrigger
      triggerContent={<SettingsIcon size={20} />}
      headline="Chat Settings"
      bodyContent={
        <div>
          <div className="my-4">
            <label
              htmlFor="temp-slider"
              id="temp-slider-label"
              className="block"
            >
              Temperature:{" "}
              <span className="inline-block" ref={tempSpanRef}>
                {getTemperatureFromLocalStorage(chatUid)}
              </span>
            </label>
            <input
              type="range"
              id="temp-slider"
              name="temp-slider"
              min={0}
              max={1.5}
              step={0.05}
              defaultValue={getTemperatureFromLocalStorage(chatUid)}
              onChange={(e) => {
                if (tempSpanRef.current) {
                  tempSpanRef.current.innerText = e.target.value;
                }
                setTemperatureInLocalStorage(chatUid, Number(e.target.value));
              }}
            ></input>
          </div>
          <DeleteChatButton chatName={chatName} chatUid={chatUid} />
        </div>
      }
    />
  );
};
