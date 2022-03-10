import "./index.css";
import * as React from 'react';
import { Message, MessageProps } from "./Message";

export class Room extends React.Component<{ id: string }, { roomId: string, messages: MessageProps[], message: string }> {
  messagesEnd: HTMLDivElement | null = null;
  shouldScroll = false;

  constructor(props: { id: string }) {
    super(props);
    this.state = {
      roomId: props.id,
      messages: this.loadMessages(),
      message: "",
    };


  }

  loadMessages() {
    return [
      { sender: "a", "message": "The chat box", key: 1, time: new Date() },
      { sender: "a", "message": "Two", key: 2, time: new Date() },
      { sender: "a", "message": "Three", key: 3, time: new Date() },
      { sender: "a", "message": "Four", key: 4, time: new Date() },
      { sender: "a", "message": "Five", key: 5, time: new Date() },
      { sender: "a", "message": "Six", key: 6, time: new Date() },
      { sender: "a", "message": "Seven", key: 7, time: new Date() },
      { sender: "a", "message": "Eigt", key: 8, time: new Date() },
    ];
  }

  sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let messages = this.state.messages.slice();
    messages.push({ "sender": "b", "message": this.state.message, key: messages.length + 5, time: new Date() })
    this.setState({ message: "", messages: messages });
    this.shouldScroll = true;
  }

  inputChanged(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ message: e.target.value });
    console.log(e.target.value);
  }

  override componentDidUpdate() {
    if (this.state.roomId !== this.props.id) {
      this.setState({
        roomId: this.props.id,
        messages: this.loadMessages()
      });
    }

    if (this.shouldScroll)
      this.messagesEnd?.scrollIntoView();
    this.shouldScroll = false;
  }

  override render() {
    let messageElements = this.state.messages.map(e =>
      <Message message={e.message} time={e.time} sender={e.sender} key={e.key} />
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