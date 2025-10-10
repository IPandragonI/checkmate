import React, {useEffect, useRef, useState} from "react";

interface GameChatProps {
    socket?: any;
    gameId: string;
    user: { id: string; name: string };
    chatMessages: any[];
}

interface ChatMessage {
    userId: string;
    message: string;
    sentAt: number | string;
}

const GameChat: React.FC<GameChatProps> = ({socket, gameId, user, chatMessages}) => {
    const [messages, setMessages] = useState<ChatMessage[]>(chatMessages || []);
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!user?.id) return;

        socket.on("messageReceived", (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => {
            socket.off("messageReceived");
        };
    }, [gameId, socket, user?.id]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg: ChatMessage = {
            userId: user.id,
            message: input,
            sentAt: Date.now(),
        };
        socket.emit("messageSend", {gameId, msg});
        setInput("");
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-2 p-2 bg-base-200 rounded flex-1 overflow-y-auto max-h-52">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat ${msg.userId === user.id ? "chat-end" : "chat-start"}`}>
                        <div className={`chat-bubble ${msg.userId === user.id ? "" : "chat-bubble-secondary"}`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    className="flex-1 input input-bordered"
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Votre message..."
                />
                <button type="submit" className="btn btn-primary">Envoyer</button>
            </form>
        </div>
    );
};

export default GameChat;
