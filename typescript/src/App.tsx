import './App.css';
import { Room } from "./Room/index";
import React from 'react';
import RoomList from './RoomList';

class App extends React.Component<{}, { currentRoom: string, rooms: string[] }> {
  constructor(props: {}) {
    super(props);

    this.state = {
      currentRoom: "1",
      rooms: ["1"]
    }
  }

  setCurrentRoom(room: string) {
    this.setState({ "currentRoom": room });
  }

  override render() {
    return (
      <div className='App'>
        <RoomList
          onAddRoom={room => this.setState({rooms: [...this.state.rooms, room]})}
          onSelectionChanged={room => this.setCurrentRoom(room)}
          rooms={this.state.rooms} />
        <Room id={this.state.currentRoom} />
      </div>
    );
  }
}
export default App;
