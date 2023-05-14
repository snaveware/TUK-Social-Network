import { io } from "socket.io-client";
import Config from "./Config";

export const socket = io(Config.RTC_API_URL, {
    autoConnect: false,
});

export default socket;
