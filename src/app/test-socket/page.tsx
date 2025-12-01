"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/socket";

export default function TestSocket() {
    const [status, setStatus] = useState("Connecting...");

    useEffect(() => {
        const socket = getSocket("test-user");

        socket.on("connect", () => setStatus("✅ Connected"));
        socket.on("connect_error", (err) => setStatus(`❌ Error: ${err.message}`));
        socket.on("disconnect", () => setStatus("🔌 Disconnected"));

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
        };
    }, []);

    return <div className="p-4">Socket Status: {status}</div>;
}