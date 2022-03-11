import './Chat.css';
import { Room } from "./Room/index";
import React, { useEffect, useState } from 'react';
import RoomList from './RoomList';
import { request, CHAT_EVENTS } from "./helpers";

function Chat(props: { username: string, onLogout: () => void }) {
  const [shouldSetCurrentRoom, setShouldSetCurrentRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("");
  const [rooms, setRooms] = useState(null as string[] | null);

  const updateRoomList = async () => {
    const rooms = await request("GET", "/list_rooms") as string[];
    setRooms(rooms);
    if (shouldSetCurrentRoom || currentRoom === "") {
      if (rooms[0]) {
        setCurrentRoom(rooms[0])
        setShouldSetCurrentRoom(false);
      }
    }
  };

  if (rooms === null)
    updateRoomList();

  useEffect(() => {
    CHAT_EVENTS.addEventListener("newMessage", updateRoomList);
    CHAT_EVENTS.addEventListener("newRoom", updateRoomList);

    return () => {
      CHAT_EVENTS.removeEventListener("newMessage", updateRoomList);
      CHAT_EVENTS.removeEventListener("newRoom", updateRoomList);
    };
  });

  CHAT_EVENTS.start();

  return (
    <div className='Chat'>
      <div className="Chat-header">Welcome: {props.username} <input type="button" value="Logout" onClick={() => props.onLogout()} /></div>
      <div className="Chat-rest">
        <RoomList
          onAddRoom={async room => {
            setShouldSetCurrentRoom(true);
            await request("POST", "/add_room", { name: room });
          }}
          onSelectionChanged={room => setCurrentRoom(room)}
          rooms={rooms ?? []}
          currentRoom={currentRoom}
        />
        <Room id={currentRoom} username={props.username} />
      </div>
    </div>
  );
}
export default Chat;
