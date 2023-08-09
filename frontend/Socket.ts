import { io, Socket } from "socket.io-client";
import Config from "./Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const socket: Socket = io(Config.API_URL);

/**
 * Could use the authorization headers but asyncstorage is asyncronous. I do not want to use a function
 */
async function setupUser() {
  const accessToken = await AsyncStorage.getItem("accessToken");
  socket.emit("setup_user", { Authorization: accessToken });
}

socket.on("connect", () => {
  console.log("Connected to server");
  setupUser();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("error", (data) => {
  console.log("error in socket: ", data);
});

// console.log(socket);

export default socket;
