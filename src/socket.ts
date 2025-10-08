"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userId?: string) {
    if (!socket) {
        socket = io("http://localhost:3000", {
            autoConnect: true,
            transports: ["websocket"],
            auth: { userId },
        });
    } else if (userId) {
        socket.auth = { userId };
    }
    return socket;
}
