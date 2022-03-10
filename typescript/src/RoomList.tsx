import './RoomList.css';
import * as React from 'react';

type Props = {
  onSelectionChanged: (name: string) => void;
  onAddRoom: (name: string) => void;
  rooms: string[];
};

export class RoomList extends React.Component<Props, { selected: string, newRoomName: string }> {

  constructor(props: Props) {
    super(props)

    this.state = { selected: this.props.rooms[0]!, newRoomName: "" };
  }

  setSelected(name: string) {
    this.setState({ selected: name });
    this.props.onSelectionChanged(name);
  }

  addRoom(e: React.FormEvent) {
    e.preventDefault();
    if (this.state.newRoomName) {
      this.props.onAddRoom(this.state.newRoomName);
    }
    this.setState({ newRoomName: "" });
  }

  setNewRoomName(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newRoomName: e.target.value });
  }

  override render() {
    const rooms = this.props.rooms.map(name => <div
      key={name}
      onClick={() => this.setSelected(name)}
      className={`RoomList-room ${name === this.state.selected ? "selected" : ""
        }`}>{name}</div>)

    return (
      <div className="RoomList">
        {rooms}
        <div className='RoomList-addRoom'>
          <form onSubmit={e => this.addRoom(e)}>
            <input type="text" onChange={e => this.setNewRoomName(e)} value={this.state.newRoomName} />
            <input type="submit" value="+" />
          </form>
        </div>
      </div>
    );
  }
}

export default RoomList;
