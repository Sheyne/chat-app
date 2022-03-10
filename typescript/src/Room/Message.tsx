import "./Message.css";
import * as React from 'react';

export type MessageProps = { message: string, sender: string, time: Date };

export function Message(props: MessageProps) {
  return (
    <div className="ChatBox-Message">
      <div className="ChatBox-Message-time">{props.time.toDateString()}</div>
      <div className="ChatBox-Message-sender">{props.sender}</div>
      <div className="ChatBox-Message-body">{props.message}</div>
    </div>
  );
}
