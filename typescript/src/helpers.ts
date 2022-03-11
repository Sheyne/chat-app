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
    private newRoomListeners: ((name: string) => void)[];
    private newMessageListeners: ((sender: string, message: string, room: string, time: Date) => void)[];

    running: boolean;

    constructor() {
        this.newRoomListeners = [];
        this.newMessageListeners = [];
        this.running = false;
    }

    async start() {
        if (this.running)
            return;
        this.running = true;
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

    addEventListener(event: "newRoom", listener: (name: string) => void): void;
    addEventListener(event: "newMessage", listener: (sender: string, message: string, room: string, time: Date) => void): void;
    addEventListener(event: string, listener: (...args: any[]) => void) {
        let listeners = event === "newRoom" ? this.newRoomListeners : (
            event === "newMessage" ? this.newMessageListeners : undefined);
        listeners?.push(listener);
    }

    removeEventListener(event: "newRoom", listener: (name: string) => void): void;
    removeEventListener(event: "newMessage", listener: (sender: string, message: string, room: string, time: Date) => void): void;
    removeEventListener(event: "newRoom" | "newMessage", listener: (...args: any[]) => void) {
        const key = `${event}Listeners`;
        (this as any)[key] = (this as any)[key].filter((e: any) => e !== listener);
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