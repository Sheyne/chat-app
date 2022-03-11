import "./index.css";
import React, { useState, createRef, useEffect } from 'react';
import { Message, MessageProps } from "./Message";
import { request, listMessages, CHAT_EVENTS } from "../helpers";

export function Room(props: { id: string, username: string }) {
  const [roomId, setRoomId] = useState(props.id);
  const [messages, setMessages] = useState([] as MessageProps[]);
  const [message, setMessage] = useState("");

  let messagesEnd = createRef<HTMLDivElement>();

  const loadMessages = async (id: string) => {
    const messages = await listMessages(id);
    setMessages(messages);
    setRoomId(id);
  };

  const listener = (sender: string, message: string, room: string, time: Date) => {
    if (room === props.id) {
      messages.push({ sender, message, time });
      messagesEnd.current?.scrollIntoView();
      setMessages(messages);
    }
  };

  useEffect(() => {
    CHAT_EVENTS.addEventListener("newMessage", listener);
    return () => {
      CHAT_EVENTS.removeEventListener("newMessage", listener);
    }
  });

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    request("POST", "/send_message",
      { "sender": props.username, "message": message, "room": props.id }
    );

    setMessage("");
    messagesEnd.current?.scrollIntoView();
  }

  if (roomId !== props.id) {
    loadMessages(props.id);
  }

  let messageElements = messages.map(e =>
    <Message message={e.message} time={e.time} sender={e.sender} key={`${e.message}--${e.time}--${e.sender}`} />
  );

  return (
    <div className="ChatBox">
      <div className="ChatBox-messages">
        {messageElements}
        <div ref={messagesEnd} style={{ height: 0 }} />
      </div>
      <div className="ChatBox-sender">
        <form onSubmit={e => sendMessage(e)}>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
          <input type="submit" value="Send" />
        </form>
      </div>
    </div>
  );
}