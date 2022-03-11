import './RoomList.css';
import React, { useState } from 'react';

export function RoomList(props: {
  onSelectionChanged: (name: string) => void;
  onAddRoom: (name: string) => void;
  rooms: string[];
}) {

  const [selected, setSelected_] = useState(props.rooms[0]!);
  const [newRoomName, setNewRoomName] = useState("");

  const setSelected = (name: string) => {
    setSelected_(name);
    props.onSelectionChanged(name);
  }

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName) {
      props.onAddRoom(newRoomName);
      setSelected(newRoomName);
    }
    setNewRoomName("");
  }

  const rooms = props.rooms.map(name => <div
    key={name}
    onClick={() => setSelected(name)}
    className={`RoomList-room ${name === selected ? "selected" : ""
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
