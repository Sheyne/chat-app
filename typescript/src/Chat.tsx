import "./Chat.css";
import { Room } from "./Room/index";
import React, { useEffect, useRef, useState } from "react";
import RoomList from "./RoomList";
import { request, CHAT_EVENTS } from "./helpers";

function Chat(props: { username: string; onLogout: () => void }) {
  const shouldSetCurrentRoom = useRef(false);
  const [currentRoom, setCurrentRoom] = useState("");
  const [rooms, setRooms] = useState(null as string[] | null);
  const [shouldShowRoomList, setShouldShowRoomList] = useState(true);

  const updateRoomList = async () => {
    const rooms = (await request("GET", "/rooms")) as string[];
    setRooms(rooms);
    if (shouldSetCurrentRoom.current || currentRoom === "") {
      if (rooms[0]) {
        setCurrentRoom(rooms[0]);
        shouldSetCurrentRoom.current = false;
      }
    }
  };

  if (rooms === null) updateRoomList();

  useEffect(() => {
    CHAT_EVENTS.addEventListener("newMessage", updateRoomList);
    CHAT_EVENTS.addEventListener("newRoom", updateRoomList);

    return () => {
      CHAT_EVENTS.removeEventListener("newMessage", updateRoomList);
      CHAT_EVENTS.removeEventListener("newRoom", updateRoomList);
    };
  });

  CHAT_EVENTS.start();

  const roomlist = shouldShowRoomList
    ? [
        <RoomList
          onAddRoom={async (room) => {
            shouldSetCurrentRoom.current = true;
            await request("POST", "/rooms", { name: room });
          }}
          onSelectionChanged={(room) => setCurrentRoom(room)}
          rooms={rooms ?? []}
          currentRoom={currentRoom}
        />,
      ]
    : [];

  return (
    <div className="Chat">
      <div className="Chat-header">
        <label>
          Show Rooms:{" "}
          <input
            type="checkbox"
            checked={shouldShowRoomList}
            onChange={(e) => setShouldShowRoomList(e.target.checked)}
          />
        </label>
        Welcome: {props.username}{" "}
        <input type="button" value="Logout" onClick={() => props.onLogout()} />
      </div>
      <div className="Chat-rest">
        {roomlist}
        <Room id={currentRoom} username={props.username} />
      </div>
    </div>
  );
}
export default Chat;
