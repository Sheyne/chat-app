export type Message = { "message": string, room: string, "sender": string, time: Date };


export const parseMessage = (message: unknown): Message => {
    const m = message as any;
    return {
        sender: m['sender'],
        message: m['message'],
        room: m['room'],
        time: new Date(m['time']),
    }
};

export class ChatEvents {
    newRoomListeners: ((name: string)=>void)[];
    newMessageListeners: ((sender: string, message: string, room: string, time: Date) => void)[];


    constructor() {
        this.newRoomListeners = [];
        this.newMessageListeners = [];
    }

    async start() {
        const evtSource = new EventSource("/events");
    
        evtSource.onmessage = (event) => {
            const packet = JSON.parse(event.data);
            if (packet["NewMessage"]) {
                const message = parseMessage(packet["NewMessage"]);
                for (const listener of this.newMessageListeners)
                    listener(message.sender, message.message, message.room, message.time);
            } else {
                for (const listener of this.newRoomListeners)
                    listener(packet.NewRoom);
            }
        };
    }
    
};

export const CHAT_EVENTS = new ChatEvents();

export const request = (method: "POST" | "GET", url: string, data?: unknown): Promise<unknown> => {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    if (data)
        xhr.setRequestHeader("Content-Type", "application/json");

    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject();
                }
            }
        }
        xhr.send(data ? JSON.stringify(data) : undefined);
    });
}

export const listMessages = async (room?: string): Promise<Message[]> => {
    if (room) {
        let messages = await request("GET", `/list_messages/${encodeURIComponent(room)}`);
        return (messages as any[]).map(m => parseMessage(m));
    }
    return [];
}