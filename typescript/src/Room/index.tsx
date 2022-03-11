import "./index.css";
import * as React from 'react';
import { Message, MessageProps } from "./Message";
import { request, listMessages, CHAT_EVENTS } from "../helpers";

export class Room extends React.Component<{ id: string, username: string }, { roomId: string, messages: MessageProps[], message: string }> {
  messagesEnd: HTMLDivElement | null = null;
  shouldScroll = false;
  listener: (sender: string, message: string, room: string, time: Date) => void;

  constructor(props: { id: string, username: string }) {
    super(props);
    this.state = {
      roomId: props.id,
      messages: [],
      message: "",
    };

    this.listener = (sender, message, room, time) => {
      if (room === this.props.id) {
        const messages = this.state.messages;
        messages.push({sender, message, time});
        this.shouldScroll = true;
        this.setState({messages});
      }
    };

    CHAT_EVENTS.addEventListener("newMessage", this.listener);

    this.loadMessages(props.id);
  }

  async loadMessages(id: string) {
    const messages = await listMessages(id);
    this.setState({ "messages": messages, "roomId": id });
  }

  sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    request("POST", "/send_message",
      { "sender": this.props.username, "message": this.state.message, "room": this.props.id }
    );

    this.setState({ message: "" });
    this.shouldScroll = true;
  }

  inputChanged(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ message: e.target.value });
  }

  override componentWillUnmount() {
    CHAT_EVENTS.removeEventListener("newMessage", this.listener);
  }

  override componentDidUpdate() {
    if (this.state.roomId !== this.props.id) {
      this.loadMessages(this.props.id);
    }

    if (this.shouldScroll)
      this.messagesEnd?.scrollIntoView();
    this.shouldScroll = false;
  }

  override render() {
    let messageElements = this.state.messages.map(e =>
      <Message message={e.message} time={e.time} sender={e.sender} key={`${e.message}--${e.time}--${e.sender}`} />
    );

    return (
      <div className="ChatBox">
        <div className="ChatBox-messages">
          {messageElements}
          <div ref={(el) => { this.messagesEnd = el; }} style={{ height: 0 }} />
        </div>
        <div className="ChatBox-sender">
          <form onSubmit={e => this.sendMessage(e)}>
            <input type="text" value={this.state.message} onChange={e => this.inputChanged(e)} />
            <input type="submit" value="Send" />
          </form>
        </div>
      </div>
    );
  }
}