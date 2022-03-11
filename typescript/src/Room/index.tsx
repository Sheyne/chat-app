import "./index.css";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Message, MessageProps } from "./Message";
import { request, listMessages, CHAT_EVENTS } from "../helpers";

export function Room(props: { id: string; username: string }) {
  const [roomId, setRoomId] = useState(props.id);
  const [messages, setMessages] = useState([] as MessageProps[]);
  const [message, setMessage] = useState("");
  const shouldScroll = useRef(true);
  const messagesEnd = useRef<HTMLDivElement | null>(null);

  const loadMessages = async (id: string) => {
    const messages = await listMessages(id);
    setMessages(messages);
    setRoomId(id);
    shouldScroll.current = true;
  };

  const listener = (
    sender: string,
    message: string,
    room: string,
    time: Date
  ) => {
    if (room === props.id) {
      messages.push({ sender, message, time });
      shouldScroll.current = true;
      setMessages(messages);
    }
  };

  useEffect(() => {
    CHAT_EVENTS.addEventListener("newMessage", listener);
    return () => {
      CHAT_EVENTS.removeEventListener("newMessage", listener);
    };
  });

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    request("POST", "/send_message", {
      sender: props.username,
      message: message,
      room: props.id,
    });

    setMessage("");
    shouldScroll.current = true;
  };

  if (roomId !== props.id) {
    loadMessages(props.id);
  }

  useLayoutEffect(() => {
    if (shouldScroll.current) {
      shouldScroll.current = false;
      messagesEnd.current?.scrollIntoView();
    }
  }, [shouldScroll.current]);

  let messageElements = messages.map((e) => (
    <Message
      message={e.message}
      time={e.time}
      sender={e.sender}
      key={`${e.message}--${e.time.getTime()}--${e.sender}`}
    />
  ));

  return (
    <div className="ChatBox">
      <div className="ChatBox-messages">
        {messageElements}
        <div ref={messagesEnd} style={{ height: 0 }} />
      </div>
      <div className="ChatBox-sender">
        <form onSubmit={(e) => sendMessage(e)}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
      </div>
    </div>
  );
}
