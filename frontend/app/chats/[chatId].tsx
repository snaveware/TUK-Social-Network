import {
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TextInput as RNTextInput,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  AppState,
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
import PostCard, { Post } from "../../components/posts/PostCard";
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
import { transform } from "@babel/core";
import FolderCard from "../../components/files/FolderCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

import * as Device from "expo-device";

import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
export async function sendPushNotification(
  expoPushToken: any,
  title: string,
  notificationMessage: string
) {
  console.log(
    "................sending expo push notification.......",
    "token: ",
    expoPushToken
  );

  const message = {
    to: expoPushToken,
    sound: Platform.OS === "android" ? null : "default",
    title: title,
    body: notificationMessage,
  };

  const sendResults = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
      host: "exp.host",
    },
    body: JSON.stringify(message),
  });

  // console.log("send results: ", JSON.stringify(sendResults));
}

export async function registerForPushNotificationsAsync() {
  console.log("........registering for push notifications........");
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      console.log(".......existing status is granted..........");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId,
    });

    console.log("...token in registration....", token, finalStatus);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

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
  sharedFolders: any[];
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
  const router = useRouter();
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
  const [sharedMessage, setSharedMessage] = useState<Message>();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);
  const [flatlistRef, setFlatlistRef] = useState<any>();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<number>(1);

  const [expoPushToken, setExpoPushToken] = useState<any>("");
  const [notification, setNotification] = useState<any>(false);
  const notificationListener: any = useRef();
  const responseListener: any = useRef();

  function scrollToAnIndex(item: any) {
    console.log("In scroll to index: ");
    if (chat?.messages) {
      for (let i = 0; i < chat?.messages?.length; i++) {
        const element = chat.messages[i];

        if (chat.messages[i].id === item.id) {
          flatlistRef.scrollToIndex({
            index: i,
            animated: true,
            viewPosition: 0.5,
          });
          return;
        }
      }
    }
  }

  // const [SCREEN_HEIGHT, SET_SCREEN_HEIGHT] = useState(
  //   Dimensions.get("window").height
  // );

  const { user, accessToken } = useContext(AuthContext);
  const inputRef = createRef<RNTextInput>();

  useEffect(() => {
    console.log("repy message changed: ", replyMessage);
    if (replyMessage) {
      console.log("repy message changed with value: ", replyMessage);
      setKeyboardHeight(270);
      inputRef.current?.focus();
    }
  }, [replyMessage]);

  useEffect(() => {
    console.log("new message changed: ", newMessage);
  }, [newMessage]);

  useEffect(() => {
    getChat();
    // navigation.addListener("focus", () => {
    //   getChat();
    // });
  }, [params.chatId]);

  useEffect(() => {
    getChat();

    socket.on("send_message_response", (data) => {
      setSending(false);

      // console.log("send message response: ", data.message);

      setFiles([]);

      setChat((prevValues: any) => {
        if (Platform.select({ web: true })) {
          return {
            ...prevValues,
            messages: [...prevValues.messages, data.message],
          };
        } else {
          return {
            ...prevValues,
            messages: [data.message, ...prevValues.messages],
          };
        }
      });

      setNewMessage({
        message: "",
        status: "pending",
        chatId: chat?.id,
      });

      setReplyMessage(undefined);
      setSharedMessage(undefined);
      AsyncStorage.removeItem("shared_message");
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
    socket.on("receive_message", (data) => {
      console.log("receive chat id: ", data.message.id, "current chat: ", chat);
      console.log("received new message...........");
      const name =
        data.message.sender.firstName + " " + data.message.sender.lastName;

      sendPushNotification(expoPushToken, name, data.message.message);
      setChat((prevValues: any) => {
        if (data.message.chatId !== prevValues?.id) {
          return prevValues;
        } else {
          console.log("setting new message.........");

          if (Platform.select({ web: true })) {
            return {
              ...prevValues,
              messages: [...prevValues.messages, data.message],
            };
          } else {
            return {
              ...prevValues,
              messages: [data.message, ...prevValues.messages],
            };
          }
        }
      });

      // console.log("single chat - receive message: ", data, "chat: ", chat);
    });
  }, [expoPushToken]);

  useEffect(() => {
    console.log("files changed--------", files);
  }, [files]);

  useEffect(() => {
    if (chat) {
      resolveSharedMessage();
      console.log("......reading messageS.......");
      socket.emit("read_messages", { chatId: chat.id });

      if (flatlistRef && Platform.select({ web: true }) && activePage < 2) {
        flatlistRef.scrollToEnd(false);
      }
    }
  }, [chat]);

  async function resolveSharedMessage() {
    const sharedMessage = await AsyncStorage.getItem("shared_message");
    console.log("message to share: ", sharedMessage);
    if (sharedMessage) {
      const message = JSON.parse(sharedMessage);
      setSharedMessage(message);
      setNewMessage((prevValues: any) => {
        return {
          ...prevValues,
          chatId: chat?.id,
          message: message.message,
        };
      });

      if (message.attachedFiles) {
        setFiles(message.attachedFiles);
      }
    } else {
      setNewMessage((prevValues: newMessage) => {
        return {
          ...prevValues,
          chatId: chat?.id,
        };
      });
    }
  }

  async function sendMessage() {
    if (sending || !chat?.id) return;

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

    const message: any = {
      message: newMessage.message,
      chatId: newMessage.chatId,
      replyingToId: replyMessage ? replyMessage.id : undefined,
      attachedFiles: _files.length > 0 ? _files : undefined,
      postId: undefined,
      sharedFolderId: undefined,
    };

    if (sharedMessage) {
      if (sharedMessage.postId) {
        message.postId = sharedMessage.postId;
      }

      if (
        sharedMessage.sharedFolders &&
        sharedMessage.sharedFolders.length > 0
      ) {
        message.sharedFolderId = sharedMessage.sharedFolders[0].id;
      }
    }

    // console.log("message: ", message);

    socket.emit("send_message", {
      message: message,
    });
  }

  async function getChat() {
    console.log(".........get chat called...........");
    if (!params.chatId) {
      console.log("no chat id: returning...");
      return;
    }
    console.log("...getting Chat ...id: ", params.chatId);

    if (loading) return;
    setLoading(true);
    setActivePage(1);
    try {
      const URL = `${Config.API_URL}/chats/${params.chatId}`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get Chat results: ", results.data.messages);

      if (results.success) {
        if (
          Platform.select({ web: true }) &&
          results.data &&
          results.data.messages
        ) {
          results.data.messages.reverse();
        }
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

  async function loadMore() {
    if (!params.chatId) {
      console.log(" (loading more) no chat id: returning...");
      return;
    }

    console.log("...loading more in Chat ...id: ", params.chatId);

    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const URL = `${Config.API_URL}/chats/messages/${params.chatId}?page=${
        activePage + 1
      }`;
      const results = await Utils.makeGetRequest(URL);
      console.log("laod more in chat results: ", results.data);

      if (results.success) {
        setActivePage((prevValue) => {
          return prevValue + 1;
        });
        if (Platform.select({ web: true }) && results.data && results.data) {
          results.data.reverse();
        }

        setChat((prevValues: any) => {
          return {
            ...prevValues,
            messages: [...prevValues.messages, ...results.data],
          };
        });

        console.log("successful get single Chat");
      } else {
        setError(results.message);
      }
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
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

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log(".............token: ", token);
      setExpoPushToken(token?.data);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
      {loadingMore && (
        <ActivityIndicator style={{ padding: 3 }} size={"small"} />
      )}

      {(chatMode === "messages" || chatMode === "search") && (
        <KeyboardAwareFlatList
          innerRef={(ref) => {
            setFlatlistRef(ref);
          }}
          scrollToOverflowEnabled={true}
          onKeyboardWillShow={(frames: any) => {
            if (Platform.OS == "ios") {
              // setKeyboardHeight(230);
              // console.log("frames: ", frames);
              setKeyboardHeight(frames.endCoordinates.height);
            }
          }}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          onKeyboardWillHide={(frames) => {
            setKeyboardHeight(0);
          }}
          onRefresh={getChat}
          refreshing={loading}
          data={chat?.messages}
          renderItem={({ item, index }: { item: Message; index: number }) => (
            <MessageCard
              index={index}
              onGoTO={scrollToAnIndex}
              setReplyMessage={setReplyMessage}
              message={item}
            />
          )}
          // onEndReached={() => {
          //   if (Platform.select({ ios: true, android: true })) {
          //     loadMore();
          //   }
          // }}
          // onScroll={(e: any) => {
          //   if (
          //     Platform.select({ web: true }) &&
          //     e.nativeEvent.contentOffset.y === 0
          //   ) {
          //     loadMore();
          //   }
          // }}
          keyExtractor={(item) => {
            return item.id.toString();
          }}
          inverted={Platform.OS !== "web" ? true : false}
          // inverted={true}
          scrollsToTop={false}
          overScrollMode={"always"}
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
              <View>
                <Text style={{ width: 300 }}>
                  {replyMessage.message.length > 80
                    ? replyMessage.message.substring(0, 80) + "..."
                    : replyMessage.message}
                </Text>
                {replyMessage?.attachedFiles &&
                  replyMessage?.attachedFiles.length > 0 && (
                    <View
                      style={[
                        styles.flexRow,
                        {
                          backgroundColor: "transparent",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <AntDesign
                        name="file1"
                        style={{ marginRight: 10 }}
                        color={theme.foregroundMuted}
                        size={20}
                      />
                      <Text
                        style={{ color: theme.foregroundMuted, width: "50%" }}
                      >
                        {replyMessage?.attachedFiles?.[0].name}
                      </Text>
                      {replyMessage?.attachedFiles?.length > 1 && (
                        <Text
                          style={{
                            color: theme.foregroundMuted,
                            marginLeft: 10,
                          }}
                        >{`+${
                          replyMessage?.attachedFiles?.length - 1
                        } More`}</Text>
                      )}
                    </View>
                  )}
              </View>
              <Feather
                onPress={() => setReplyMessage(undefined)}
                name="x-circle"
                size={24}
                color={theme.accent}
              />
            </View>
          )}

          {sharedMessage && (
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
              <View>
                <Text style={{ width: 300 }}>
                  {/* {sharedMessage.message.length > 80
                    ? sharedMessage.message.substring(0, 80) + "..."
                    : sharedMessage.message} */}
                  Send When Ready to Forward
                </Text>
                {sharedMessage?.attachedFiles &&
                  sharedMessage?.attachedFiles.length > 0 && (
                    <View
                      style={[
                        styles.flexRow,
                        {
                          backgroundColor: "transparent",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <AntDesign
                        name="file1"
                        style={{ marginRight: 10 }}
                        color={theme.foregroundMuted}
                        size={20}
                      />
                      <Text
                        style={{ color: theme.foregroundMuted, width: "50%" }}
                      >
                        {sharedMessage?.attachedFiles?.[0].name}
                      </Text>
                      {sharedMessage?.attachedFiles?.length > 1 && (
                        <Text
                          style={{
                            color: theme.foregroundMuted,
                            marginLeft: 10,
                          }}
                        >{`+${
                          sharedMessage?.attachedFiles?.length - 1
                        } More`}</Text>
                      )}
                    </View>
                  )}

                {sharedMessage.linkedPost && (
                  <View
                    style={{
                      width: 300,
                      borderRadius: 10,
                      padding: 5,
                      margin: 5,
                    }}
                  >
                    {/* <PostCard
                      post={sharedMessage.linkedPost}
                      loading={loading}
                      setLoading={setLoading}
                      gallerySize={300}
                    /> */}
                    <Text>Post: {sharedMessage.linkedPost.caption}...</Text>
                  </View>
                )}

                {sharedMessage.sharedFolders &&
                  sharedMessage.sharedFolders.length > 0 && (
                    <View
                      style={[
                        styles.flexRow,
                        {
                          backgroundColor: "transparent",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <FolderCard folder={sharedMessage.sharedFolders[0]} />
                    </View>
                  )}
              </View>
              <Feather
                onPress={() => {
                  setSharedMessage(undefined);
                  AsyncStorage.removeItem("shared_message");
                  setNewMessage((prevValues: newMessage) => {
                    return {
                      ...prevValues,
                      chatId: chat?.id,
                      message: "",
                    };
                  });
                }}
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
                  minHeight: Platform.select({ ios: true, android: true })
                    ? undefined
                    : newMessage.message.length > 200 &&
                      newMessage.message.length < 2000
                    ? 30 * (newMessage.message.length / 200)
                    : undefined,
                  maxHeight: 200,
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

            <TouchableOpacity
              onPress={() => {
                setKeyboardHeight(0);
                sendMessage();
              }}
            >
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
