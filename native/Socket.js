import { io } from "socket.io-client";
import Config from "./Config";

const socket = io(Config.API_URL);

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

// console.log(socket);

export default socket;
