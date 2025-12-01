"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userId?: string) {
    const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || defaultOrigin;
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
