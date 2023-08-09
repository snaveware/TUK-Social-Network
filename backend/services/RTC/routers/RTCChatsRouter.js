const RTCChatsController = require("../controllers/RTCChatsController");

module.exports = class RTCChatsRouter {
  static _init(socket) {
    console.log("a user connected", socket.id);

    // RTCChatsController.connect(socket);

    socket.on("join", (data) => {
      console.log("Join chat (router)");
      RTCChatsController.join(socket, data);
    });

    socket.on("setup_user", (data) => {
      console.log("----on setup user------");
      RTCChatsController.connect(socket, data);
    });

    socket.on("send_message", (data) => {
      console.log("Servers send message called");
      RTCChatsController.message(socket, data);
    });

    socket.on("read_messages", (data) => {
      console.log("......routeing reading messageS.......");
      RTCChatsController.readMessages(socket, data);
    });

    socket.on("search_chats", (data) => {
      console.log("searching chats (router))....");
      RTCChatsController.searchChats(socket, data);
    });

    socket.on("search_users", (data) => {
      console.log("searching users (router))....");
      RTCChatsController.searchUsers(socket, data);
    });

    socket.on("search_messages", (data) => {
      console.log("searching messages (router))....");
      RTCChatsController.searchMessages(socket, data);
    });

    socket.on("resolve_chat", (data) => {
      console.log("resolving chat (router)");
      RTCChatsController.resolveChat(socket, data);
    });
    socket.on("delete_message", (data) => {
      console.log("delelete message (router)");
      RTCChatsController.deleteMessage(socket, data);
    });

    socket.on("disconnect", (data) =>
      RTCChatsController.disconnect(socket, data)
    );
  }
};
