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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.id) return;

        socket.on("messageReceived", (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => {
            socket.off("messageReceived");
        };
    }, [gameId, socket, user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

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
            <div className="flex-1 overflow-y-auto mb-2 p-2 bg-base-200 rounded">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-1 ${msg.userId === user.id ? "text-right" : "text-left"}`}>
                        <span className={`inline-block px-2 py-1 text-sm rounded ${msg.userId === user.id ? "bg-primary text-white" : "bg-gray-200 text-gray-800"}`}>{msg.message}</span>
                    </div>
                ))}
                <div ref={messagesEndRef}/>
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
