import {
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TextInput as RNTextInput,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, View } from "../../components/Themed";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  useEffect,
  useState,
  useContext,
  useRef,
  LegacyRef,
  createRef,
} from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import {
  Chat,
  ChatMember,
  ChatStaffProfileIfIsStaff,
  ChatStudentProfileIfIsStudent,
  ChatTypes,
} from "../../components/chats/ChatCard";
import socket from "../../Socket";
import { Post } from "../../components/posts/PostCard";
import MessageCard from "../../components/chats/MessageCard";
import Config from "../../Config";
import Utils from "../../Utils";
import { AuthContext } from "../_layout";
import Avatar from "../../components/Avatar";
import { AppThemeContext } from "../../Theme";
import GlobalStyles from "../../GlobalStyles";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";
import { Feather } from "@expo/vector-icons";
import ChatTopBar from "../../components/chats/ChatTopBar";
import ChatInfo from "./ChatInfo";
import Popover from "../../components/Popover";
import * as DocumentPicker from "expo-document-picker";
import uploadFile, {
  extractFileAsset,
  extractMultipleWebAssets,
} from "../../uploadFile";
import { extractAsset } from "../../uploadFile";
import * as ImagePicker from "expo-image-picker";
import Modal, { ModalVariant } from "../../components/Modal";
import FileCard from "../../components/files/FileCard";

export enum MessageStatus {
  pending = "pending",
  sent = "sent",
  delivered = "delivered",
  read = "read",
  deleted = "deleted",
}

export type Poll = {};

export type File = {
  name: string;
  id: number;
  path: string;
  folderId: number;
  createdAt: number;
  type: string;
  visibility: string;
};

export type newMessage = {
  message: string;
  status: string;
  chatId?: number;
};

export type Message = {
  message: string;
  sender: ChatMember;
  createdAt: string;
  updatedAt: string;
  attachedFiles: File[];
  id: number;
  senderId: number;
  readBy: ChatMember[];
  status: MessageStatus;
  replyingTo?: Message;
  replies?: Message[];
  replyingToId?: number;
  linkedPost?: Post;
  postId?: number;
  linkedPoll?: Poll;
  linkedPollId?: number;
  chat?: Chat;
};

export type FullChart = {
  id: number;
  name: string;
  description: string;
  chatType: ChatTypes;
  profileAvatarId: number;
  createdAt: string;
  updatedAt: string;
  members?: ChatMember[];
  studentProfileIfIsStudent?: ChatStudentProfileIfIsStudent;
  staffProfileIfIsStaff?: ChatStaffProfileIfIsStaff;
  messages: Message[];
  _counts: { messages: number; members: number };
  admins?: ChatMember[];
};

export default function SingleChatScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [picking, setPicking] = useState<boolean>(false);
  const { theme } = useContext(AppThemeContext);

  const [error, setError] = useState<string>();
  const [chat, setChat] = useState<FullChart>();

  const [sending, setSending] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<newMessage>({
    message: "",
    status: "pending",
  });
  const [chatMode, setChatMode] = useState<"messages" | "info" | "search">(
    "messages"
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // console.log("params chat id: ", params.chatId);

  const [replyMessage, setReplyMessage] = useState<Message>();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);

  // const [SCREEN_HEIGHT, SET_SCREEN_HEIGHT] = useState(
  //   Dimensions.get("window").height
  // );

  const { user, accessToken } = useContext(AuthContext);
  const inputRef = createRef<RNTextInput>();

  useEffect(() => {
    if (replyMessage) {
      console.log("repy message changed: ", replyMessage);
      setKeyboardHeight(270);
      inputRef.current?.focus();
    }
  }, [replyMessage]);

  // useEffect(() => {
  //   getChat();
  //   navigation.addListener("focus", () => {
  //     getChat();
  //   });
  // }, [params]);

  useEffect(() => {
    getChat();

    socket.on("receive_message", (data) => {
      // console.log("receive chat id: ", data.message.id, "current chat: ", chat);

      setChat((prevValues: any) => {
        if (data.message.chatId !== prevValues?.id) {
          return prevValues;
        } else {
          return {
            ...prevValues,
            messages: [data.message, ...prevValues.messages],
          };
        }
      });
      // console.log("single chat - receive message: ", data, "chat: ", chat);
    });

    socket.on("send_message_response", (data) => {
      setSending(false);

      // console.log("send message response: ", data.message);

      setFiles([]);

      setChat((prevValues: any) => {
        return {
          ...prevValues,
          messages: [data.message, ...prevValues.messages],
        };
      });

      setNewMessage({
        message: "",
        status: "pending",
        chatId: chat?.id,
      });
      setReplyMessage(undefined);
      // console.log("single chat: send message response: ", data);
    });

    socket.on("search_messages_results", (data) => {
      console.log(
        "---search meessages results--- ",
        data.messages?.length
        // data.messages[0]
      );
      setChat((prevValues: any) => {
        return {
          ...prevValues,
          messages: data.messages,
        };
      });
      setLoading(false);
    });

    socket.on("message_error", (data) => {
      setSending(false);
      setError(data.error.message);
      console.log("message error: ", data);
    });
  }, []);

  useEffect(() => {
    console.log("files changed--------", files);
  }, [files]);

  useEffect(() => {
    if (chat) {
      if (
        params.shareMessage &&
        typeof params.shareMessage === "string" &&
        Number(params.targetChatId) === chat?.id
      ) {
        setNewMessage((prevValues: any) => {
          return {
            ...prevValues,
            chatId: chat.id,
            message: params.shareMessage,
          };
        });

        setKeyboardHeight(270);
        inputRef.current?.focus();
      } else {
        setNewMessage((prevValues: newMessage) => {
          return {
            ...prevValues,
            chatId: chat.id,
          };
        });
      }

      // socket.emit("send_message", {
      //   message: {
      //     chatId: chat?.id,
      //     message: "A new chat message. Newest at 1",
      //   },
      // });
      console.log("......reading messageS.......");
      socket.emit("read_messages", { chatId: chat.id });
    }
  }, [chat]);

  async function sendMessage() {
    if (sending) return;
    setSending(true);
    if (
      (!newMessage.message || newMessage.message.trim().length < 1) &&
      files.length < 1
    ) {
      setSending(false);
      return;
    }
    console.log("sending message files: ", files);

    let _files: any[] = [];
    let _fullFiles: any[] = [];

    if (files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          if (file.id) {
            _files.push(file.id);
          } else {
            const upload = await uploadFile(file);
            console.log("file upload: ", upload);
            if (upload) {
              _fullFiles.push(upload);
              _files.push(upload.id);
            }
          }
        })
      );
    }

    console.log("uploaded files: ", _files, "full: ------", _fullFiles);

    if (_fullFiles.length > 0) {
      setFiles(_fullFiles);
    }

    console.log("uploaded files: ", _files, "full: ------", _fullFiles);

    const message = {
      message: newMessage.message,
      chatId: newMessage.chatId,
      replyingToId: replyMessage ? replyMessage.id : undefined,
      attachedFiles: _files.length > 0 ? _files : undefined,
    };

    // console.log("message: ", message);

    socket.emit("send_message", {
      message: message,
    });
  }

  async function getChat() {
    console.log("...getting Chat ...id: ", params.chatId);
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/${params.chatId}`;
      const results = await Utils.makeGetRequest(URL);
      // console.log(
      //   "get Chat results: ",
      //   results.data.messages[results.data.messages.length - 1]
      // );
      if (results.success) {
        setChat(results.data);
        console.log("successful get single Chat");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error getting Chats: ", error);
    }
  }

  async function pickfile() {
    setPicking(true);
    try {
      const result: DocumentPicker.DocumentResult =
        await DocumentPicker.getDocumentAsync({
          // type: "video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          // type: "application/pdf,application/msword",
          copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory,
          multiple: true,
        });

      console.log("result: ", result);

      if (Platform.select({ web: true })) {
        setFiles(extractMultipleWebAssets(result));
        setPicking(false);
        return;
      }

      // console.log("picked file result: ", result.output.length);

      let asset: any = extractFileAsset(result);

      asset.type = Utils.getFileTypeFromMimeType(asset.mimeType);

      if (!asset.type) {
        setModalText(
          "Invalid File Type! Only images, videos, pdfs and word documents are allowed"
        );
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
        return;
      }

      console.log("picked asset (file): ", asset);

      setFiles([asset]);
      setPicking(false);
    } catch (error) {
      setPicking(false);
      console.log("Error picking file", error);
    }
  }

  async function pickImage() {
    setPicking(true);
    try {
      if (Platform.OS == "web") {
        const result = await DocumentPicker.getDocumentAsync({
          type: "image/*,video/*",
          copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
          multiple: true,
        });

        console.log("result: ", result);

        setFiles(extractMultipleWebAssets(result));
        setPicking(false);
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (result && result.assets) {
        result.assets.map((file: ImagePicker.ImagePickerAsset) => {
          const asset: any = {
            uri: file.uri,
            type: file.type || "image",
          };

          asset.mimeType = Utils.getMimeTypeFromURI({
            uri: asset.uri,
            type: asset.type || "image",
          });

          asset.name = `${Utils.generateUniqueString()}${Utils.getMediaFileExtension(
            asset.mimeType
          )}`;

          if (!asset.type) {
            setModalText(
              "Invalid File Type! Only images, videos, pdfs and word documents are allowed"
            );
            setModalVariant(ModalVariant.danger);
            setShowModal(true);
            return;
          }

          setFiles((prevValues: any) => {
            return [...prevValues, asset];
          });
        });
      }
      setPicking(false);
    } catch (error: any) {
      setPicking(false);
      setModalText(`An error occured while picking images: ${error?.message}`);
      console.log("pick image error: ", error);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        // width: Platform.select({ ios: true, android: true }) ? undefined : 1000,
        // overflow: Platform.select({ ios: true, android: true })
        //   ? undefined
        //   : "visible",
      }}
    >
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
      />

      {chat && (
        <ChatTopBar
          chatMode={chatMode}
          setChatMode={setChatMode}
          onSearchEnd={getChat}
          chat={chat}
        />
      )}

      {(chatMode === "messages" || chatMode === "search") && (
        <KeyboardAwareFlatList
          onKeyboardWillShow={(frames: any) => {
            if (Platform.OS == "ios") {
              // setKeyboardHeight(230);
              // console.log("frames: ", frames);
              setKeyboardHeight(frames.endCoordinates.height);
            }
          }}
          onKeyboardWillHide={(frames) => {
            setKeyboardHeight(0);
          }}
          onRefresh={getChat}
          refreshing={loading}
          data={chat?.messages}
          renderItem={({ item }: { item: Message }) => (
            <MessageCard setReplyMessage={setReplyMessage} message={item} />
          )}
          keyExtractor={(item) => {
            return item.id.toString();
          }}
          inverted={Platform.OS !== "web" ? true : false}
          scrollsToTop={false}
          overScrollMode={"always"}
          ListHeaderComponent={() => {
            return (
              <>
                {sending && (
                  <View
                    style={[
                      styles.flexRow,
                      styles.padding,

                      {
                        marginHorizontal: 20,

                        justifyContent: "flex-end",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.flexRow,
                        {
                          width: "70%",
                          minWidth: "70%",
                          justifyContent: "flex-start",
                          alignItems: "flex-end",
                          // backgroundColor: "green",
                          flexDirection: "row-reverse",
                        },
                      ]}
                    >
                      <Avatar
                        text={`${user?.firstName?.[0]} ${user?.lastName?.[1]}`}
                        imageSource={
                          user?.profileAvatarId
                            ? `${Config.API_URL}/files?fid=${user?.profileAvatarId}&t=${accessToken}`
                            : undefined
                        }
                        style={{ width: 45, height: 45 }}
                        textStyles={{ fontSize: 12 }}
                      />
                      <View
                        style={[
                          styles.flexCols,
                          styles.padding,
                          {
                            marginRight: 10,
                            flexWrap: "nowrap",
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,

                            borderBottomLeftRadius: 12,
                            backgroundColor: theme.backgroundMuted,
                            borderColor: theme.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            {
                              color: theme.foreground,
                              borderColor: theme.primaryForeground,
                            },
                          ]}
                        >
                          {newMessage.message}
                        </Text>
                        <View
                          style={[
                            styles.flexRow,
                            {
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: theme.backgroundMuted,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              {
                                fontSize: 10,
                                color: theme.foregroundMuted,
                                textAlign: "right",
                                paddingTop: 5,
                                marginRight: 10,
                              },
                            ]}
                          >
                            <AntDesign
                              name="clockcircleo"
                              size={16}
                              color={theme.foregroundMuted}
                            />
                          </Text>
                          <Text
                            style={[
                              {
                                fontSize: 10,
                                color: theme.foregroundMuted,
                                textAlign: "right",
                                paddingTop: 5,
                                marginLeft: 10,
                              },
                            ]}
                          >
                            {Utils.getTimeDifference(new Date().toISOString())}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </>
            );
          }}
        />
      )}

      <ActivityIndicator animating={sending || picking} />

      {chatMode === "info" && chat && (
        <ChatInfo onUpdate={getChat} chat={chat} />
      )}

      {chatMode === "messages" && (
        <View
          style={{ marginBottom: Platform.OS === "ios" ? keyboardHeight : 0 }}
        >
          {replyMessage && (
            <View
              style={[
                styles.flexRow,
                styles.padding,
                {
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderWidth: 0.5,
                  borderColor: theme.border,
                  borderLeftWidth: 5,
                  borderLeftColor: theme.accent,
                  borderStartWidth: 5,
                  borderStartColor: theme.accent,
                },
              ]}
            >
              <Text style={{ width: 300 }}>
                {replyMessage.message.length > 80
                  ? replyMessage.message.substring(0, 80) + "..."
                  : replyMessage.message}
              </Text>
              <Feather
                onPress={() => setReplyMessage(undefined)}
                name="x-circle"
                size={24}
                color={theme.accent}
              />
            </View>
          )}

          {files && files.length > 0 && (
            <View
              style={[
                styles.flexCols,
                styles.flexCenter,
                styles.padding,
                {
                  shadowColor: theme.border,
                  shadowOpacity: 0.8,
                  shadowOffset: { width: 0, height: 1000 },
                  shadowRadius: 3,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  backgroundColor: theme.backgroundMuted,
                  width: "95%",
                  marginHorizontal: 10,
                },
              ]}
            >
              <View
                style={[
                  styles.flexRow,
                  ,
                  {
                    backgroundColor: "transparent",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                  },
                ]}
              >
                {/* <View
                  style={[
                    styles.flexRow,
                    styles.flexCenter,
                    styles.padding,
                    {
                      backgroundColor: theme.accent,
                      borderRadius: 20,
                      paddingHorizontal: 15,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      marginRight: 10,
                      color: theme.accentForeground,
                    }}
                  >
                    {files?.length} Files
                  </Text>
                </View> */}
                <TouchableOpacity onPress={() => setFiles([])}>
                  <Feather name="x-circle" size={32} color={theme.foreground} />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.flexRow,
                  styles.paddingV,
                  {
                    backgroundColor: "transparent",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
              >
                {files
                  .slice(
                    0,
                    Math.min(
                      files.length,
                      Platform.select({ ios: true, android: true }) ? 2 : 3
                    )
                  )
                  .map((file, index) => {
                    return (
                      <FileCard
                        key={index}
                        file={file}
                        size={100}
                        showLabel={false}
                      />
                    );
                  })}
                {files.length >
                  (Platform.select({ ios: true, android: true }) ? 2 : 3) && (
                  <Text
                    style={{
                      fontSize: 16,
                      marginRight: 10,
                      color: theme.accentForeground,
                    }}
                  >
                    +{" "}
                    {files?.length -
                      (Platform.select({ ios: true, android: true })
                        ? 2
                        : 3)}{" "}
                    More
                  </Text>
                )}
              </View>
            </View>
          )}
          <View
            style={[
              styles.flexRow,
              {
                justifyContent: "space-between",

                borderTopWidth: 0.3,
                alignItems: "flex-end",
                borderTopColor: theme.border,
                paddingRight: 15,
                paddingVertical: 5,
              },
            ]}
          >
            {/* <FontAwesome5 name="plus" size={32} color={theme.foreground} /> */}
            <Popover
              variant="plus"
              isOpen={isPopoverOpen}
              setIsOpen={setIsPopoverOpen}
            >
              <View style={[{ backgroundColor: theme.backgroundMuted }]}>
                <TouchableOpacity
                  style={[
                    styles.flexRow,
                    styles.padding,
                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBottom: 5,
                    },
                  ]}
                  onPress={() => {
                    setIsPopoverOpen(false);
                    setFiles([]);
                    pickImage();
                  }}
                >
                  <FontAwesome5
                    name="photo-video"
                    size={24}
                    color={theme.foreground}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: theme.foreground,
                    }}
                  >
                    Photos & Videos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.flexRow,
                    styles.padding,
                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => {
                    setFiles([]);
                    setIsPopoverOpen(false);
                    pickfile();
                  }}
                >
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={32}
                    color={theme.foreground}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: theme.foreground,
                    }}
                  >
                    Documents
                  </Text>
                </TouchableOpacity>
              </View>
            </Popover>
            <TextInput
              autoFocus={replyMessage ? true : false}
              multiline={true}
              ref={inputRef}
              editable={!sending}
              style={[
                {
                  marginHorizontal: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 15,
                  borderWidth: 1,
                  backgroundColor: theme.background,
                  flex: 1,
                },
              ]}
              value={newMessage.message}
              onChangeText={(value) => {
                setNewMessage((prevValues: newMessage) => {
                  return {
                    ...prevValues,
                    chatId: chat?.id,
                    message: value,
                  };
                });
              }}
            />

            <TouchableOpacity onPress={sendMessage}>
              <MaterialCommunityIcons
                name="send-circle"
                size={40}
                color={theme.primary}
                style={{
                  opacity: sending ? 0.5 : 1,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
