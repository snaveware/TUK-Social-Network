import {
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TextInput as RNTextInput,
  Keyboard,
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
import { FontAwesome5 } from "@expo/vector-icons";
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
  description: number;
  chatType: ChatTypes;
  profileAvatarId: number;
  createdAt: string;
  updatedAt: string;
  members?: ChatMember[];
  studentProfileIfIsStudent?: ChatStudentProfileIfIsStudent;
  staffProfileIfIsStaff?: ChatStaffProfileIfIsStaff;
  messages: Message[];
  _counts: { messages: number; members: number };
};

export default function SingleChatScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useContext(AppThemeContext);

  const [error, setError] = useState<string>();
  const [chat, setChat] = useState<FullChart>();

  const [sending, setSending] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<newMessage>({
    message: "",
    status: "pending",
  });

  const [replyMessage, setReplyMessage] = useState<Message>();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  useEffect(() => {
    getChat();
  }, [params]);

  useEffect(() => {
    getChat();

    navigation.setOptions({
      title: "chat",
    });
    socket.on("receive_message", (data) => {
      setChat((prevValues: any) => {
        return {
          ...prevValues,
          messages: [data.message, ...prevValues.messages],
        };
      });
      // console.log("single chat: receive message: ", data);
    });

    socket.on("send_message_response", (data) => {
      setSending(false);

      console.log("send message response: ", data.message);

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
      console.log("single chat: send message response: ", data);
    });

    socket.on("message_error", (data) => {
      setError(data.error.message);
      console.log("message error: ", data);
    });
  }, []);

  useEffect(() => {
    if (chat) {
      navigation.setOptions({
        title: chat.name,
      });

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

  function sendMessage() {
    if (sending) return;
    const message = {
      message: newMessage.message,
      chatId: newMessage.chatId,
      replyingToId: replyMessage ? replyMessage.id : undefined,
    };
    console.log("message: ", message);

    setSending(true);
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
      console.log("get Chat results: ", results);
      if (results.success) {
        setChat(results.data);
        console.log("successful get Chat");
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
        data={
          Platform.select({ ios: true, android: true })
            ? chat?.messages
            : chat?.messages.reverse()
        }
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
      {/* <View>
        {chat &&
          chat.messages.length > 0 &&
          chat.messages.map((message, index) => {
            return <MessageCard key={index} message={message} />;
          })}
      </View> */}

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
        <View
          style={[
            styles.flexRow,
            {
              justifyContent: "space-between",
              borderTopWidth: 0.3,
              alignItems: "flex-end",
              borderTopColor: theme.border,
              paddingHorizontal: 15,
              paddingVertical: 5,
            },
          ]}
        >
          {/* <FontAwesome5 name="plus" size={32} color={theme.foreground} /> */}
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

          <MaterialCommunityIcons
            name="send-circle"
            size={40}
            color={theme.primary}
            onPress={sendMessage}
            style={{
              opacity: sending ? 0.5 : 1,
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
