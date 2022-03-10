import './App.css';
import { Room } from "./Room/index";
import React from 'react';
import RoomList from './RoomList';
import { request, CHAT_EVENTS } from "./helpers";

class App extends React.Component<{}, { currentRoom: string, rooms: string[] }> {
  resetCurrentRoom = true;

  constructor(props: {}) {
    super(props);
    this.updateRoomList();

    CHAT_EVENTS.newMessageListeners.push(() => this.updateRoomList());
    CHAT_EVENTS.newRoomListeners.push(() => this.updateRoomList());

    CHAT_EVENTS.start();

    this.state = {
      currentRoom: "",
      rooms: []
    }
  }

  async updateRoomList() {
    const rooms = await request("GET", "/list_rooms");
    let state = { "rooms": rooms as string[] };
    if (this.resetCurrentRoom || this.state.currentRoom === "") {
      this.setState({...state, currentRoom: state.rooms[0]! });
    } else {
      this.setState(state);
    }
    this.resetCurrentRoom = false;
  }

  setCurrentRoom(room: string) {
    this.setState({ "currentRoom": room });
  }

  override render() {
    return (
      <div className='App'>
        <RoomList
          onAddRoom={async room => {
            this.resetCurrentRoom = true;
            await request("POST", "/add_room", { name: room });
          }}
          onSelectionChanged={room => this.setCurrentRoom(room)}
          rooms={this.state.rooms} />
        <Room id={this.state.currentRoom} />
      </div>
    );
  }
}
export default App;
