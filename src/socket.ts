"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userId?: string) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    if (!socket) {
        socket = io(socketUrl, {
            autoConnect: true,
            transports: ["websocket"],
            auth: { userId },
        });
    } else if (userId) {
        socket.auth = { userId };
    }
    return socket;
}
