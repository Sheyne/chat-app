import './Chat.css';
import { Room } from "./Room/index";
import React from 'react';
import RoomList from './RoomList';
import { request, CHAT_EVENTS } from "./helpers";

class Chat extends React.Component<{ username: string, onLogout: ()=>void }, { currentRoom: string, rooms: string[] }> {
  resetCurrentRoom = true;
  updateRoomList: () => void;

  constructor(props: { username: string, onLogout: ()=>void }) {
    super(props);

    this.updateRoomList = async () => {
      const rooms = await request("GET", "/list_rooms");
      let state = { "rooms": rooms as string[] };
      if (this.resetCurrentRoom || this.state.currentRoom === "") {
        this.setState({ ...state, currentRoom: state.rooms[0]! });
      } else {
        this.setState(state);
      }
      this.resetCurrentRoom = false;
    };

    this.updateRoomList();


    CHAT_EVENTS.addEventListener("newMessage", this.updateRoomList);
    CHAT_EVENTS.addEventListener("newRoom", this.updateRoomList);

    CHAT_EVENTS.start();

    this.state = {
      currentRoom: "",
      rooms: []
    }
  }

  override componentWillUnmount() {
    CHAT_EVENTS.removeEventListener("newMessage", this.updateRoomList);
    CHAT_EVENTS.removeEventListener("newRoom", this.updateRoomList);
  }

  setCurrentRoom(room: string) {
    this.setState({ "currentRoom": room });
  }

  override render() {
    return (
      <div className='Chat'>
        <div className="Chat-header">Welcome: {this.props.username} <input type="button" value="Logout" onClick={()=>this.props.onLogout()} /></div>
        <div className="Chat-rest">
          <RoomList
            onAddRoom={async room => {
              this.resetCurrentRoom = true;
              await request("POST", "/add_room", { name: room });
            }}
            onSelectionChanged={room => this.setCurrentRoom(room)}
            rooms={this.state.rooms} />
          <Room id={this.state.currentRoom} username={this.props.username} />
        </div>
      </div>
    );
  }
}
export default Chat;
