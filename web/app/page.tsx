"use client";

import Image from "next/image";
import socket from "../Socket.js";
import { useEffect } from "react";

export default function Home() {
    async function sendMessage() {
        console.log("sending message");
        socket.emit("message", { message: "message from client" });
    }

    useEffect(() => {
        socket.on("connect", () => {
            console.log("socket connected");
            socket.emit("message", { message: "client received connect" });
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected");
        });

        socket.on("message", (message) => {
            console.log("new Message", message);
        });
    }, []);

    return (
        <>
            <p
                className="w-full text-center p-2 cursor-pointer"
                onClick={() => {
                    sendMessage();
                }}
            >
                TUK Social Network
            </p>
        </>
    );
}
