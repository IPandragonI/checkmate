"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userId?: string) {
    if (!socket) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
            (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

        socket = io(socketUrl, {
            autoConnect: true,
            transports: ["websocket", "polling"],
            auth: { userId },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000,
        });
    } else if (userId) {
        socket.auth = { userId };
    }
    return socket;
}