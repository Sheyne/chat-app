import './RoomList.css';
import React, { useState } from 'react';

export function RoomList(props: {
  onSelectionChanged: (name: string) => void;
  onAddRoom: (name: string) => void;
  rooms: string[];
  currentRoom: string;
}) {
  const [newRoomName, setNewRoomName] = useState("");

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName) {
      props.onAddRoom(newRoomName);
      props.onSelectionChanged(newRoomName);
    }
    setNewRoomName("");
  }

  const rooms = props.rooms.map(name => <div
    key={name}
    onClick={() => props.onSelectionChanged(name)}
    className={`RoomList-room ${name === props.currentRoom ? "selected" : ""
      }`}>{name}</div>)

  return (
    <div className="RoomList" >
      {rooms}
      < div className='RoomList-addRoom' >
        <form onSubmit={e => addRoom(e)}>
          <input type="text" onChange={e => setNewRoomName(e.target.value)} value={newRoomName} />
          <input type="submit" value="+" />
        </form>
      </div>
    </div >
  );
}

export default RoomList;
