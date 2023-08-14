const { prisma } = require("../../../DatabaseInit");
const Logger = require("../../../Logger");
const { Config } = require("../../../configs");
const { verify } = require("jsonwebtoken");
const ChatsValidator = require("../Validator");
const { read } = require("fs");
const { io } = require("../../../server");

module.exports = class RTCChatsController {
  static async getChats(user) {
    let schoolId;
    let classId;

    if (user.studentProfileIfIsStudent) {
      classId = user.studentProfileIfIsStudent.classId;
      schoolId = user.studentProfileIfIsStudent.class.programme.schoolId;
    } else if (user.staffProfileIfIsStaff) {
      schoolId = user.staffProfileIfIsStaff.schoolId;
    }

    const chats = await prisma.chat.findMany({
      where: {
        // OR: [
        //   {
        //     members: {
        //       some: {
        //         id: user.id,
        //       },
        //     },
        //   },

        //   {
        //     schoolIfSchoolChat: {
        //       id: schoolId,
        //     },
        //   },
        //   {
        //     classIfClassChat: {
        //       id: classId,
        //     },
        //   },
        //   {
        //     roleIfRoleChat: {
        //       name: user.roleName,
        //     },
        //   },
        //   { chatType: "public" },
        // ],
        OR: [
          {
            members: {
              some: {
                id: user.id,
              },
            },
          },
          {
            AND: [
              {
                chatType: "school",
              },
              {
                schoolIfSchoolChat: {
                  id: schoolId,
                },
              },
            ],
          },
          {
            AND: [
              {
                chatType: "class",
              },
              {
                classIfClassChat: {
                  id: classId,
                },
              },
            ],
          },
          {
            AND: [
              {
                chatType: "role",
              },
              {
                roleIfRoleChat: {
                  name: user.roleName,
                },
              },
            ],
          },
          { chatType: "public" },
        ],
      },
    });

    return chats;
  }
  static async connect(socket, data) {
    try {
      console.log("user setup: ", data);
      await RTCChatsController.authorize(socket, data);

      // console.log("auth socket: ", socket.auth);

      if (!socket.auth) {
        throw new Error("unauthorized");
      }
      /**
       * Enter user into all member rooms based on chats
       */

      const chats = await RTCChatsController.getChats(socket.auth);
      chats.map((chat) => {
        // console.log("joining: ", chat.id, chat.name);
        socket.join(chat.id);
      });

      await prisma.user.update({
        where: {
          id: socket.auth.id,
        },
        data: {
          socketId: socket.id,
        },
      });
    } catch (error) {
      console.log("error connecting/initializing user: ", error);
      socket.emit("error", { error });
    }
  }

  static async join(socket, data) {
    try {
      if (!socket.auth) {
        throw new Error("unauthorized");
      }

      const chatId = data.chatId;

      if (!chatId) {
        throw new Error("chat Id is required");
      }

      let schoolId;
      let classId;

      if (socket.auth.studentProfileIfIsStudent) {
        classId = socket.auth.studentProfileIfIsStudent.classId;
        schoolId =
          socket.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (socket.auth.staffProfileIfIsStaff) {
        schoolId = socket.auth.staffProfileIfIsStaff.schoolId;
      }

      const chat = await prisma.chat.findUnique({
        where: {
          id: validated.chatId,
        },
        select: {
          id: true,
          chatType: true,
          members: true,
          manyChatId: true,
        },
      });

      if (
        (chat.chatType === "class" && chat.classIfClassChat.id == classId) ||
        (chat.chatType === "school" &&
          chat.schoolIfSchoolChat.id === schoolId) ||
        (chat.chatType == "role" &&
          chat.roleIfRoleChat.name === socket.auth.roleName) ||
        chat.members
          .map((member) => {
            return member.id;
          })
          .includes(socket.auth.id)
      ) {
        socket.join(chatId);
        console.log(
          `socket ${socket.id} should be in room ${validated.chatId}`
        );
      } else {
        throw new Error("You are not allowed to join this chat");
      }
    } catch (error) {
      console.log("error joining chat: ", chat);
      socket.emit("chat_error", { error: error.message });
    }
  }

  /**
   * new message: {message,chatId}
   * check if user is in the room
   * create a message in the database
   * broadcast to the room including sender
   */
  static async message(socket, data) {
    // console.log("socket: ", socket);
    try {
      if (!socket.auth) {
        throw new Error("unauthorized");
      }
      Logger.info(
        JSON.stringify({ action: "sending message", user: socket.auth.id })
      );

      console.log("data: ", data);
      const validated = await ChatsValidator.validateCreateMessage(
        data.message
      );

      // console.log(
      //   "socket rooms: ",
      //   socket.rooms
      //   // "socket rooms adapter: ",
      //   // socket.adaptar.rooms.get(validated.chatId)
      // );

      // return;

      // Function to check if the socket is in the room

      let schoolId;
      let classId;

      if (socket.auth.studentProfileIfIsStudent) {
        classId = socket.auth.studentProfileIfIsStudent.classId;
        schoolId =
          socket.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (socket.auth.staffProfileIfIsStaff) {
        schoolId = socket.auth.staffProfileIfIsStaff.schoolId;
      }

      const chat = await prisma.chat.findUnique({
        where: {
          id: validated.chatId,
        },
        select: {
          id: true,
          chatType: true,
          members: true,
          manyChatId: true,
        },
      });

      function isSocketInRoom(roomId, socket) {
        console.log("checking function.....");
        const room = socket.adapter.rooms.get(roomId);
        return room ? room.has(socket.id) : false;
      }

      console.log("checking if usr is in in room: ", validated.chatId);
      if (isSocketInRoom(validated.chatId, socket)) {
        console.log(`Socket ${socket.id} is in room ${validated.chatId}.`);
      } else {
        console.log(`Socket ${socket.id} is NOT in room ${validated.chatId}.`);
        /**
         * check if socket shoud be in room
         */
        console.log(
          "chat members: ",
          chat.members,
          "current user: ",
          socket.auth.id
        );
        if (
          (chat.chatType === "class" && chat.classIfClassChat.id == classId) ||
          (chat.chatType === "school" &&
            chat.schoolIfSchoolChat.id === schoolId) ||
          (chat.chatType == "role" &&
            chat.roleIfRoleChat.name === socket.auth.roleName) ||
          chat.members
            .map((member) => {
              return member.id;
            })
            .includes(socket.auth.id)
        ) {
          socket.join(validated.chatId);
          console.log(
            `socket ${socket.id} should be in room ${validated.chatId}`
          );
        } else {
          throw new Error("You are not allowed to message in this chat");
        }
      }

      console.log("new message: ", validated);

      if (validated.attachedFiles) {
        const filesAccesses = await prisma.file.findMany({
          where: {
            id: {
              in: validated.attached,
            },
          },
          select: {
            id: true,
          },
        });

        await prisma.chat.update({
          where: {
            id: validated.chatId,
          },
          data: {
            AccessGranted: {
              connect: filesAccesses,
            },
          },
        });

        validated.attachedFiles = {
          connect: validated.attachedFiles.map((id) => {
            return { id };
          }),
        };

        console.log("final attached files: ", validated.attachedFiles);
      }

      console.log("final attached files: ", validated.attachedFiles);

      const { chatId, replyingToId, ...otherParams } = validated;

      if (replyingToId) {
        otherParams.replyingTo = {
          connect: {
            id: replyingToId,
          },
        };
      }

      console.log("other params: ", otherParams);

      if (validated.replyingToId) {
        const replyMessage = await prisma.message.findUnique({
          where: {
            id: validated.replyingToId,
          },
        });

        if (!replyMessage) {
          throw new Error("The message you are replying to does not exist");
        }

        if (replyMessage.senderChatId && replyMessage.senderChatId !== chatId) {
          const createdMessage = await prisma.message.create({
            data: {
              sender: {
                connect: {
                  id: socket.auth.id,
                },
              },
              status: "sent",
              chat: {
                connect: {
                  id: replyMessage.senderChatId,
                },
              },
              readBy: {
                connect: {
                  id: socket.auth.id,
                },
              },
              senderChatId: chatId,
              ...otherParams,
            },

            include: {
              sender: true,
              readBy: true,
              attachedFiles: true,
              linkedPoll: true,
              linkedPost: true,
              replyingTo: {
                include: {
                  sender: {
                    select: {
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      staffProfileIfIsStaff: true,
                      studentProfileIfIsStudent: true,
                    },
                  },
                },
              },
            },
          });

          await prisma.chat.update({
            where: {
              id: replyMessage.senderChatId,
            },

            data: {
              updatedAt: new Date(),
            },
          });

          socket.broadcast
            .to(replyMessage.senderChatId)
            .emit("receive_message", { message: createdMessage });
        }
      }

      if (chat.chatType == "one_to_chat" && chat.manyChatId) {
        const _createdMessage = await prisma.message.create({
          data: {
            sender: {
              connect: {
                id: socket.auth.id,
              },
            },
            status: "sent",
            chat: {
              connect: {
                id: chat.manyChatId,
              },
            },
            readBy: {
              connect: {
                id: socket.auth.id,
              },
            },
            senderChatId: chatId,
            ...otherParams,
          },
          include: {
            sender: true,
            readBy: true,
            attachedFiles: true,
            linkedPoll: true,
            linkedPost: true,
            replyingTo: {
              include: {
                sender: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profileAvatarId: true,
                    staffProfileIfIsStaff: true,
                    studentProfileIfIsStudent: true,
                  },
                },
              },
            },
          },
        });

        await prisma.chat.update({
          where: {
            id: chat.manyChatId,
          },

          data: {
            updatedAt: new Date(),
          },
        });

        socket.broadcast
          .to(chat.manyChatId)
          .emit("receive_message", { message: _createdMessage });
      }

      const createdMessage = await prisma.message.create({
        data: {
          sender: {
            connect: {
              id: socket.auth.id,
            },
          },
          status: "sent",
          chat: {
            connect: {
              id: validated.chatId,
            },
          },
          readBy: {
            connect: {
              id: socket.auth.id,
            },
          },
          senderChatId: chatId,
          ...otherParams,
        },

        include: {
          sender: true,
          readBy: true,
          attachedFiles: true,
          linkedPoll: true,
          linkedPost: true,
          replyingTo: {
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
            },
          },
        },
      });

      await prisma.chat.update({
        where: {
          id: validated.chatId,
        },

        data: {
          updatedAt: new Date(),
        },
      });

      console.log("created message: ", createdMessage);

      socket.broadcast
        .to(validated.chatId)
        .emit("receive_message", { message: createdMessage });
      socket.emit("send_message_response", { message: createdMessage });

      console.log("controller message: ", socket.id, data);
    } catch (error) {
      console.log("error sending message: ", error);
      socket.emit("message_error", { error: error.message });
    }
  }

  static async readMessages(socket, data) {
    try {
      if (!socket.auth) {
        throw new Error("Unauthorized");
      }
      console.log("......controller reading messageS.......");
      Logger.info(
        JSON.stringify({ action: "read_messages", use: socket.auth.id })
      );

      const unreadMessages = await prisma.message.findMany({
        where: {
          NOT: {
            readBy: {
              some: {
                id: socket.auth.id,
              },
            },
          },
          chatId: data.chatId,
        },
        select: {
          id: true,
        },
      });

      if (unreadMessages.length > 0) {
        await prisma.user.update({
          where: {
            id: socket.auth.id,
          },
          data: {
            readMessages: {
              connect: unreadMessages,
            },
          },
        });
        socket.emit("read_messages_response", {});
      }
    } catch (error) {
      console.log("error reading messages: ", error);
      socket.emit("message_error", { error });
    }
  }

  static async searchChats(socket, data) {
    try {
      if (!socket.auth) {
        throw new Error("Unauthorized");
      }
      let schoolId;
      let classId;

      if (socket.auth.studentProfileIfIsStudent) {
        classId = socket.auth.studentProfileIfIsStudent.classId;
        schoolId =
          socket.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (socket.auth.staffProfileIfIsStaff) {
        schoolId = socket.auth.staffProfileIfIsStaff.schoolId;
      }

      const searchString = data.searchString || "";

      const chats = await prisma.chat.findMany({
        where: {
          name: {
            contains: searchString,
            mode: "insensitive",
          },
          OR: [
            {
              members: {
                some: {
                  id: socket.auth.id,
                },
              },
            },
            {
              AND: [
                {
                  chatType: "role",
                },
                {
                  roleIfRoleChat: {
                    name: socket.auth.roleName,
                  },
                },
              ],
            },
            {
              chatType: "school",
            },
            {
              chatType: "class",
            },
            { chatType: "public" },
            { chatType: "group" },
          ],
        },
        include: {
          members: {
            select: {
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      socket.emit("search_chats_results", { chats });
    } catch (error) {
      console.log("search error: ", error);
      socket.emit("search_error", error.message);
    }
  }

  static async searchUsers(socket, data) {
    try {
      if (!socket.auth) {
        throw new Error("Unauthorized");
      }
      const searchString = data.searchString || "";

      const users = await prisma.user.findMany({
        where: {
          role: {
            NOT: {
              name: "admin",
            },
          },
          OR: [
            {
              firstName: {
                contains: searchString,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: searchString,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileAvatarId: true,
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          bio: true,
        },
      });

      socket.emit("search_users_results", { users });
    } catch (error) {
      console.log("search error: ", error);
      socket.emit("search_error", error.message);
    }
  }

  static async searchMessages(socket, data) {
    try {
      if (!socket.auth) {
        throw new Error("Unauthorized");
      }
      let schoolId;
      let classId;

      if (socket.auth.studentProfileIfIsStudent) {
        classId = socket.auth.studentProfileIfIsStudent.classId;
        schoolId =
          socket.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (socket.auth.staffProfileIfIsStaff) {
        schoolId = socket.auth.staffProfileIfIsStaff.schoolId;
      }

      const searchString = data.searchString || "";

      const messages = await prisma.message.findMany({
        where: {
          chatId: data.chatId ? data.chatId : undefined,
          status: {
            not: "deleted",
          },
          chat: {
            OR: [
              {
                AND: [
                  {
                    chatType: "private",
                  },
                  {
                    members: {
                      some: {
                        id: socket.auth.id,
                      },
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    chatType: "one_to_chat",
                  },
                  {
                    members: {
                      some: {
                        id: socket.auth.id,
                      },
                    },
                  },
                ],
              },

              {
                AND: [
                  {
                    chatType: "school",
                  },
                  {
                    schoolIfSchoolChat: {
                      id: schoolId,
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    chatType: "class",
                  },
                  {
                    classIfClassChat: {
                      id: classId,
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    chatType: "role",
                  },
                  {
                    roleIfRoleChat: {
                      name: socket.auth.roleName,
                    },
                  },
                ],
              },
              { chatType: "public" },
              { chatType: "group" },
            ],
          },
          message: {
            contains: searchString,
            mode: "insensitive",
          },
        },
        include: {
          chat: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              studentProfileIfIsStudent: true,
              staffProfileIfIsStaff: true,
            },
          },
          attachedFiles: {
            select: {
              name: true,
              path: true,
              id: true,
              type: true,
            },
          },
          linkedPoll: true,
          linkedPost: true,
          replyingTo: {
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      socket.emit("search_messages_results", { messages });
    } catch (error) {
      console.log("search error: ", error);
      socket.emit("search_error", error.message);
    }
  }

  static async resolveChat(socket, data) {
    try {
      Logger.info(
        JSON.stringify({ action: "Resolve Chat", user: socket.auth.id })
      );

      if (!socket.auth) {
        throw new Error("unauthorized");
      }

      const validated = await ChatsValidator.validateChatResolution(data);

      let schoolId;
      let classId;

      if (socket.auth.studentProfileIfIsStudent) {
        classId = socket.auth.studentProfileIfIsStudent.classId;
        schoolId =
          socket.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (socket.auth.staffProfileIfIsStaff) {
        schoolId = socket.auth.staffProfileIfIsStaff.schoolId;
      }

      let chat;

      console.log("validated: ", validated);

      if (validated.chatId) {
        /**
         * Check the chat exists and if user is a member,
         * If not member create new chat between user and the chat.
         */
        const _chat = await prisma.chat.findUnique({
          where: {
            id: validated.chatId,
          },

          include: {
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatar: true,
                studentProfileIfIsStudent: {
                  select: {
                    registrationNumber: true,
                  },
                },
                staffProfileIfIsStaff: {
                  select: {
                    title: true,
                    position: true,
                  },
                },
              },
            },
            classIfClassChat: {
              select: {
                id: true,
              },
            },
            schoolIfSchoolChat: {
              select: {
                id: true,
              },
            },
            roleIfRoleChat: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!_chat) {
          throw new Error("The chat does not exist");
        }

        if (
          (_chat.chatType === "class" &&
            _chat.classIfClassChat.id == classId) ||
          (_chat.chatType === "school" &&
            _chat.schoolIfSchoolChat.id === schoolId) ||
          (_chat.chatType == "role" &&
            _chat.roleIfRoleChat.name === socket.auth.roleName) ||
          _chat.members
            .map((member) => {
              return member.id;
            })
            .includes(socket.auth.id)
        ) {
          chat = _chat;
        }

        const myWithTheChat = await prisma.chat.findFirst({
          where: {
            chatType: "one_to_chat",
            members: {
              some: {
                id: socket.auth.id,
              },
            },
            manyChatIfOneToChat: {
              id: _chat.id,
            },
          },
        });

        if (myWithTheChat) {
          chat = myWithTheChat;
        }

        console.log(
          "_chat: ",
          _chat,
          "my with chat: ",
          myWithTheChat,
          "school id: ",
          schoolId,
          "class id: ",
          classId,
          "_chat members: ",
          _chat.members,
          "auth user: ",
          socket.auth
        );

        if (
          !chat &&
          !myWithTheChat &&
          _chat.chatType !== "private" &&
          (!_chat.roleIfRoleChat || _chat.roleIfRoleChat.name !== "admin")
        ) {
          chat = await prisma.chat.create({
            data: {
              chatType: "one_to_chat",
              name: _chat.name,
              description: `My chat with ${_chat.name}`,
              members: {
                connect: [{ id: socket.auth.id }],
              },
              manyChatIfOneToChat: {
                connect: {
                  id: _chat.id,
                },
              },
            },

            include: {
              members: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileAvatar: true,
                  studentProfileIfIsStudent: {
                    select: {
                      registrationNumber: true,
                    },
                  },
                  staffProfileIfIsStaff: {
                    select: {
                      title: true,
                      position: true,
                    },
                  },
                },
              },
            },
          });

          socket.join(chat.id);

          // chat.members.map((member) => {
          //   if (member.socketId) {
          //     io.to(member.socketId).emit("new_chat", chat);
          //   }
          // });
        }
      } else if (validated.otherUserId) {
        /**
         * check if a chat exists between auth user and other user, and return it
         * if the chat does not exist, create a private chat between the auth user and the provided user id if exists
         *
         */

        chat = await prisma.chat.findFirst({
          where: {
            chatType: "private",
            members: {
              some: {
                id: socket.auth.id,
              },
            },
            members: {
              some: {
                id: validated.otherUserId,
              },
            },
          },
        });

        console.log("chat: ", chat);

        if (!chat) {
          console.log("chat not found creaing chat...");
          const otherUser = await prisma.user.findUnique({
            where: {
              id: validated.otherUserId,
            },
            select: {
              firstName: true,
              lastName: true,
              id: true,
            },
          });

          if (!otherUser) {
            throw new Error("Could not find other user");
          }

          console.log("other user: ", otherUser);

          chat = await prisma.chat.create({
            data: {
              chatType: "private",
              name: `${socket.auth.firstName} ${socket.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
              description: `chat between ${socket.auth.firstName} ${socket.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
              members: {
                connect: [
                  { id: socket.auth.id },
                  { id: validated.otherUserId },
                ],
              },
            },

            include: {
              members: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileAvatar: true,
                  studentProfileIfIsStudent: {
                    select: {
                      registrationNumber: true,
                    },
                  },
                  staffProfileIfIsStaff: {
                    select: {
                      title: true,
                      position: true,
                    },
                  },
                },
              },
            },
          });

          console.log("fnal chat (new): ", chat);

          socket.join(chat.id);

          // chat.members.map((member) => {
          //   if (member.socketId) {
          //     io.to(member.socketId).emit("new_chat", chat);
          //   }
          // });
        }
      }

      console.log("chat: ", chat);
      if (!chat) {
        throw new Error("Could not resolve chat");
      }

      socket.emit("resolve_chat_response", { chat });
    } catch (error) {
      console.log("Error resolving chat", error);
      socket.emit("search_error", error.message);
    }
  }

  static async deleteMessage(socket, data) {
    try {
      if (!data.messageId) {
        throw new Error("message id is required");
      }

      const message = await prisma.message.findUnique({
        where: {
          id: data.messageId,
        },
        include: {
          sender: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!message) {
        throw new Error("message not found");
      }

      if (message.sender.id !== socket.auth.id) {
        throw new Error("Your are not allowed to delete this message");
      }

      const updatedMessage = await prisma.message.update({
        where: {
          id: data.messageId,
        },
        data: {
          status: "deleted",
        },
      });

      socket.emit("delete_message_response", { message: updatedMessage });
    } catch (error) {
      console.log("error deleting message: ", error);
      socket.emit("message_error", error.message);
    }
  }

  static async disconnect(socket, data) {
    try {
      /**
       * remove user into all member rooms based on chats
       */
      const chats = await RTCChatsController.getChats(socket.auth);

      chats.map((chat) => {
        socket.leave(chat.id);
      });
      await prisma.user.update({
        where: {
          id: socket.auth.id,
        },
        data: {
          socketId: null,
        },
      });
    } catch (error) {
      console.log("error disconnecting: ", error);
    }
  }

  static async authorize(socket, data) {
    const token = data.Authorization;

    Logger.info("authorizing user socket ");

    if (!token) {
      throw new Error("token is required");
    }

    let extracted;

    try {
      Logger.info("verifying access token");
      extracted = verify(token, Config.SECRET);
    } catch (error) {
      error.message = "Acess token expired";
      error.status = 401;
      error.action = "REFRESH";
      console.log("Access token extraction failed");
      socket.emit("error", { error: error });
      return;
    }

    console.log("extracted in token: ", extracted);
    /**
     * ensure no auth object exists in socket
     */
    delete socket.auth;

    socket.auth = await prisma.user.findFirst({
      where: {
        id: extracted.userId,
        status: "active",
      },
      include: {
        role: true,
        preferences: true,
        rootFolder: true,
        staffProfileIfIsStaff: true,
        studentProfileIfIsStudent: {
          include: {
            class: {
              include: {
                programme: true,
              },
            },
          },
        },
      },
    });
  }
};
