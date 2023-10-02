const RequestHandler = require("../../../RequestHandler");
const Logger = require("../../../Logger");
const ChatsValidator = require("../Validator");
const { prisma } = require("../../../DatabaseInit");
const { Config } = require("../../../configs");
module.exports = class ChatsHTTPController {
  static async createChat(req, res) {
    try {
      Logger.info(JSON.stringify({ action: "create Chat", user: req.auth.id }));
      const validated = await ChatsValidator.validateCreate(req.body);

      const membersData = validated.members.map((id) => ({ id }));

      const createdChat = await prisma.chat.create({
        data: {
          name: validated.name,
          description: validated.description,
          members: {
            connect: membersData,
          },
          chatType: validated.chatType,
          admins: {
            connect: [
              {
                id: req.auth.id,
              },
            ],
          },
        },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
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
              bio: true,
              socketId: true,
            },
          },
          admins: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
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
              bio: true,
              socketId: true,
            },
          },
        },
      });

      // createdChat.members.map((member) => {
      //   if (member.socketId) {
      //     io.to(member.socketId).emit("new_chat", createdChat);
      //   }
      // });

      RequestHandler.sendSuccess(req, res, createdChat);
    } catch (error) {
      console.log("Error creatiing chat", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getChats(req, res) {
    try {
      Logger.info(
        JSON.stringify({ action: "get user Chats", user: req.auth.id })
      );

      let schoolId;
      let classId;

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      // console.log("school id: ", schoolId);
      // console.log("class ID: ", classId);

      const chat = await prisma.chat.findMany({
        where: {
          OR: [
            {
              members: {
                some: {
                  id: req.auth.id,
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
                    id: classId || Math.random(),
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
                    name: req.auth.roleName,
                  },
                },
              ],
            },
            { chatType: "public" },
          ],
        },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              bio: true,
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
          _count: {
            select: {
              members: true,
              messages: {
                where: {
                  NOT: {
                    readBy: {
                      some: {
                        id: req.auth.id,
                      },
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              sender: {
                include: {
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
              attachedFiles: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
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
              },
              sharedFolders: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
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
              },
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      RequestHandler.sendSuccess(req, res, chat);
    } catch (error) {
      console.log("Error getting user chats", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getChat(req, res) {
    try {
      Logger.info(
        JSON.stringify({ action: "get one user Chats", user: req.auth.id })
      );

      const chatId = Number(req.params.chatId);
      if (!chatId) {
        RequestHandler.throwError(400, "Chat Id is required")();
      }

      let schoolId;
      let classId;

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [
            {
              members: {
                some: {
                  id: req.auth.id,
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
                    name: req.auth.roleName,
                  },
                },
              ],
            },
            { chatType: "public" },
          ],
        },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              bio: true,
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
          admins: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
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
              bio: true,
              socketId: true,
            },
          },
          schoolIfSchoolChat: true,
          classIfClassChat: true,
          roleIfRoleChat: true,
          _count: {
            select: {
              members: true,
              messages: true,
            },
          },

          messages: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  bio: true,
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
              sharedFolders: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
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
              },
              linkedPoll: true,
              linkedPost: {
                include: {
                  files: true,
                  owner: {
                    select: {
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
                      staffProfileIfIsStaff: true,
                      studentProfileIfIsStudent: true,
                    },
                  },
                  likers: {
                    where: {
                      id: req.auth.id,
                    },
                  },
                  _count: true,
                  Access: {
                    select: {
                      _count: true,
                    },
                  },
                },
              },
              chat: true,
              readBy: true,
              replyingTo: {
                include: {
                  sender: {
                    select: {
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
                      staffProfileIfIsStaff: true,
                      studentProfileIfIsStudent: true,
                    },
                  },
                  attachedFiles: true,
                  sharedFolders: {
                    include: {
                      owner: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          profileAvatarId: true,
                          bio: true,
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
                  },
                },
              },
            },
            take: Config.NO_OF_MESSAGES_PER_REQUEST,
          },
        },
      });

      RequestHandler.sendSuccess(req, res, chat);
    } catch (error) {
      console.log("Error getting user chats", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getMessages(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "get one chat messages",
          user: req.auth.id,
          chat: req.params.chatId,
        })
      );

      const chatId = Number(req.params.chatId);
      if (!chatId) {
        RequestHandler.throwError(400, "Chat Id is required")();
      }

      const page = parseInt(req.query.page) || 1;
      const pageSize = Config.NO_OF_MESSAGES_PER_REQUEST;
      const skip = (page - 1) * pageSize;

      console.log("page size skip", page, pageSize, skip);

      let schoolId;
      let classId;

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
              bio: true,
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
          sharedFolders: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  bio: true,
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
          },
          linkedPoll: true,
          linkedPost: {
            include: {
              files: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  bio: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
              likers: {
                where: {
                  id: req.auth.id,
                },
              },
              _count: true,
              Access: {
                select: {
                  _count: true,
                },
              },
            },
          },
          chat: true,
          readBy: true,
          replyingTo: {
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileAvatarId: true,
                  bio: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
              attachedFiles: true,
              sharedFolders: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profileAvatarId: true,
                      bio: true,
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
              },
            },
          },
        },
        skip: skip,
        take: Config.NO_OF_MESSAGES_PER_REQUEST,
      });

      console.log("messages: ", messages);

      RequestHandler.sendSuccess(req, res, messages);
    } catch (error) {
      console.log("Error getting user messages", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async resolveChat(req, res) {
    try {
      Logger.info(
        JSON.stringify({ action: "Resolve Chat", user: req.auth.id })
      );
      const validated = await ChatsValidator.validateChatResolution(req.body);

      let schoolId;
      let classId;

      if (req.auth.studentProfileIfIsStudent) {
        classId = req.auth.studentProfileIfIsStudent.classId;
        schoolId = req.auth.studentProfileIfIsStudent.class.programme.schoolId;
      } else if (req.auth.staffProfileIfIsStaff) {
        schoolId = req.auth.staffProfileIfIsStaff.schoolId;
      }

      let chat;

      console.log("validated (): ", validated);

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
                profileAvatarId: true,
                bio: true,
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
          RequestHandler.throwError(404, "The chat does not exist")();
        }

        if (
          (_chat.chatType === "class" &&
            _chat.classIfClassChat.id == classId) ||
          (_chat.chatType === "school" &&
            _chat.schoolIfSchoolChat.id === schoolId) ||
          (_chat.chatType == "role" &&
            _chat.roleIfRoleChat.name === req.auth.roleName) ||
          _chat.members
            .map((member) => {
              return member.id;
            })
            .includes(req.auth.id)
        ) {
          chat = _chat;
        }

        const myWithTheChat = await prisma.chat.findFirst({
          where: {
            chatType: "one_to_chat",
            members: {
              some: {
                id: req.auth.id,
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
          req.auth
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
                connect: [{ id: req.auth.id }],
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
                  profileAvatarId: true,
                  bio: true,
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
        }
      } else if (validated.otherUserId) {
        /**
         * check if a chat exists between auth user and other user, and return it
         * if the chat does not exist, create a private chat between the auth user and the provided user id if exists
         *
         */

        // chat = await prisma.chat.findFirst({
        //   where: {
        //     id: validated.chatId,
        //     members: {
        //       some: {
        //         id: req.auth.id,
        //       },
        //     },
        //     members: {
        //       some: {
        //         id: validated.otherUserId,
        //       },
        //     },
        //   },
        // });

        const possibleChats = await prisma.chat.findMany({
          where: {
            chatType: "private",
            members: {
              some: {
                id: req.auth.id,
              },
            },
            members: {
              some: {
                id: validated.otherUserId,
              },
            },
          },
          select: {
            id: true,
            members: true,
          },
        });

        console.log("possible chats: ", possibleChats, "o: ", possibleChats[0]);

        for (let i = 0; i < possibleChats.length; i++) {
          const element = possibleChats[i];
          console.log("auth id: ", req.auth.id);
          console.log("element members: ", element.members);

          if (
            element.members &&
            element.members.length === 2 &&
            (element.members[0].id === validated.otherUserId ||
              element.members[0].id === req.auth.id) &&
            (element.members[1].id === validated.otherUserId ||
              element.members[1].id === req.auth.id)
          ) {
            chat = element;
            break;
          }
        }

        if (!chat) {
          const otherUser = await prisma.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          });

          if (!otherUser) {
            RequestHandler.throwError(404, "The user was not found")();
          }

          chat = await prisma.chat.create({
            data: {
              name: `${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
              description: `A chat between ${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
              members: {
                connect: [
                  {
                    id: req.auth.id,
                  },
                  {
                    id: validated.otherUserId,
                  },
                ],
              },
              chatType: "private",
            },
          });
        }

        // if (!chat) {
        //   const otherUser = await prisma.user.findUnique({
        //     where: {
        //       id: validated.otherUserId,
        //     },
        //     select: {
        //       firstName: true,
        //       lastName: true,
        //       id: true,
        //     },
        //   });

        //   if (!otherUser) {
        //     RequestHandler.throwError(400, "Could not find other user")();
        //   }

        //   chat = await prisma.chat.create({
        //     data: {
        //       chatType: "private",
        //       name: `${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
        //       description: `chat between ${req.auth.firstName} ${req.auth.lastName} and ${otherUser.firstName} ${otherUser.lastName}`,
        //       members: {
        //         connect: [{ id: req.auth.id }, { id: validated.otherUserId }],
        //       },
        //     },

        //     include: {
        //       members: {
        //         select: {
        //           id: true,
        //           firstName: true,
        //           lastName: true,
        //           profileAvatarId: true,
        //           bio: true,
        //           studentProfileIfIsStudent: {
        //             select: {
        //               registrationNumber: true,
        //             },
        //           },
        //           staffProfileIfIsStaff: {
        //             select: {
        //               title: true,
        //               position: true,
        //             },
        //           },
        //         },
        //       },
        //     },
        //   });
        // }
      }

      console.log("chat: ", chat);

      if (!chat) {
        RequestHandler.throwError(400, "Could not resolve chat")();
      }

      RequestHandler.sendSuccess(req, res, chat);
    } catch (error) {
      console.log("Error resolving chat: ", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async updateChat(req, res) {
    try {
      Logger.info(
        JSON.stringify({
          action: "update Chat",
          user: req.auth.id,
          chatId: req.params.chatId,
        })
      );

      const chatId = Number(req.params.chatId);

      if (!chatId || isNaN(chatId)) {
        RequestHandler.throwError(400, "Valid chat Id is required")();
      }

      const validated = await ChatsValidator.validateUpdate(req.body);

      let chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          admins: {
            some: {
              id: req.auth.id,
            },
          },
        },
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
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
              bio: true,
              socketId: true,
            },
          },
          admins: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileAvatarId: true,
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
              bio: true,
              socketId: true,
            },
          },
        },
      });

      if (!chat) {
        RequestHandler.throwError(404, "Chat not found")();
      }

      const update = {
        members: {
          connect: [],
          disconnect: [],
        },
        admins: {
          connect: [],
          disconnect: [],
        },
      };

      if (validated.removeMembers) {
        const members = validated.removeMembers.map((id) => ({ id }));
        update.members.disconnect = members;
      }

      if (validated.addMembers) {
        const members = validated.addMembers.map((id) => ({ id }));
        update.members.connect = members;
      }

      if (validated.name && validated.name !== chat.name) {
        update.name = validated.name;
      }

      if (validated.description && validated.description !== chat.description) {
        update.description = validated.description;
      }

      if (validated.addAdmins) {
        const admins = validated.addAdmins.map((id) => ({ id }));
        update.admins.connect = admins;
      }

      if (validated.removeAdmins) {
        const admins = validated.removeAdmins.map((id) => ({ id }));
        update.admins.disconnect = admins;
      }

      if (validated.profileAvatarId) {
        update.profileAvatar = {
          connect: {
            id: validated.profileAvatarId,
          },
        };
      }

      console.log("chat update : ", update);

      if (Object.keys(update).length > 0) {
        chat = await prisma.chat.update({
          where: {
            id: chatId,
          },

          data: update,

          include: {
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatarId: true,
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
                bio: true,
                socketId: true,
              },
            },
            admins: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileAvatarId: true,
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
                bio: true,
                socketId: true,
              },
            },
          },
        });
      }
      RequestHandler.sendSuccess(req, res, chat);
    } catch (error) {
      console.log("Error creatiing chat", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getChatFiles(req, res) {
    try {
      console.log("chat params: ", req.params);
      Logger.info(
        JSON.stringify({ action: "get one Chat Files", user: req.auth.id })
      );

      const chatId = Number(req.params.chatId);
      if (!chatId) {
        RequestHandler.throwError(400, "Chat Id is required")();
      }

      const chatAccessGrantend = await prisma.chat.findFirst({
        where: {
          id: chatId,
        },
        include: {
          AccessGranted: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!chatAccessGrantend) {
        RequestHandler.throwError(404, "Chat not found")();
      }

      const accessIds = chatAccessGrantend.AccessGranted.map((access) => {
        return access.id;
      });

      const files = await prisma.file.findMany({
        where: {
          accessId: {
            in: accessIds,
          },
        },
      });

      console.log("chat Files: ", files);

      RequestHandler.sendSuccess(req, res, files);
    } catch (error) {
      console.log("Error getting user chats", error);
      RequestHandler.sendError(req, res, error);
    }
  }

  static async getChatFolders(req, res) {
    try {
      console.log("chat params: ", req.params);
      Logger.info(
        JSON.stringify({ action: "get one Chat Folders", user: req.auth.id })
      );

      const chatId = Number(req.params.chatId);
      if (!chatId) {
        RequestHandler.throwError(400, "Chat Id is required")();
      }

      const chatAccessGrantend = await prisma.chat.findFirst({
        where: {
          id: chatId,
        },
        include: {
          AccessGranted: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!chatAccessGrantend) {
        RequestHandler.throwError(404, "Chat not found")();
      }

      const accessIds = chatAccessGrantend.AccessGranted.map((access) => {
        return access.id;
      });

      const folders = await prisma.folder.findMany({
        where: {
          accessId: {
            in: accessIds,
          },
        },
      });

      console.log("chat Folders: ", folders);

      RequestHandler.sendSuccess(req, res, folders);
    } catch (error) {
      console.log("Error getting user chats", error);
      RequestHandler.sendError(req, res, error);
    }
  }
};
