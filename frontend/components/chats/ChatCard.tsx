import GlobalStyles from "../../GlobalStyles";
import { View, Text, ViewProps, useThemeColor, TextProps } from "../Themed";
import { ThemeProps } from "../Themed";
import { useState, useContext, useEffect } from "react";
import { AppThemeContext } from "../../Theme";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { AuthContext } from "../../app/_layout";
import Avatar from "../Avatar";
import Config from "../../Config";
import MediaGallery, { GalleryItem, WebMediaGallery } from "../MediaGallery";
import { EvilIcons, SimpleLineIcons } from "@expo/vector-icons";
import Utils, { BodyRequestMethods } from "../../Utils";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Link, useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { MessageStatus } from "../../app/chats/[chatId]";
import { MaterialIcons } from "@expo/vector-icons";

export enum ChatTypes {
  public = "public",
  class = "class",
  role = "role",
  school = "school",
  group = "group",
  private = "private",
  one_to_chat = "one_to_chat",
}

export type ChatStudentProfileIfIsStudent = {
  registrationNumber: string;
};

export type ChatStaffProfileIfIsStaff = {
  title: string;
  position: string;
};

export type ChatCounts = {
  _members: number;
};

export type ChatMember = {
  id: number;
  firstName: string;
  lastName: string;
  profileAvatarId: string;
  staffProfileIfStaff?: { title: string };
  studentProfileIfStudent?: { registrationNumber: string };
  bio?: string;
};

export type ChatCardMessage = {
  sender: ChatMember;
  message: string;
  createdAt: string;
  viewedBy: number[];
  _counts: ChatCounts;
  status: MessageStatus;
};

export type Chat = {
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
  messages: ChatCardMessage[];
  _count: { messages: number }; //number of unread
  manyChatId: number; //for one to many chats
  admins?: ChatMember[];
};

export type CustomChatCardProps = {
  chat: Chat;
};

export type ChatCardProps = ThemeProps & ViewProps & CustomChatCardProps;

export default function ChatCard(props: ChatCardProps) {
  const { style, lightColor, darkColor, chat, ...otherProps } = props;
  const { theme } = useContext(AppThemeContext);
  const params = useLocalSearchParams();
  const { user, accessToken } = useContext(AuthContext);

  const [chatImageSource, setChatImageSource] = useState<string | undefined>();
  const [chatName, setChatName] = useState<string | undefined>();

  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState(
    Platform.select({ ios: true, android: true })
      ? Dimensions.get("window").width
      : 500
  );
  // console.log("chat: ", chat);

  const router = useRouter();
  useEffect(() => {
    if (Platform.select({ ios: true, android: true })) {
      Dimensions.addEventListener("change", ({ window, screen }) => {
        SET_SCREEN_WIDTH(window.width);
      });
    }

    let _chatImageSourceId;
    let _chatName;

    if (chat.chatType == ChatTypes.private) {
      chat.members?.map((member) => {
        if (member.id !== user?.id) {
          _chatImageSourceId = member.profileAvatarId;
          if (chat.staffProfileIfIsStaff) {
            _chatName = `${chat.staffProfileIfIsStaff?.title} ${member.firstName} ${member.lastName}`;
          } else {
            _chatName = `${member.firstName} ${member.lastName}`;
          }
        }
      });
    } else {
      _chatImageSourceId = chat.profileAvatarId;
      _chatName = chat.name;
    }

    console.log("chat image source: ", chat.id, _chatImageSourceId);

    if (_chatImageSourceId) {
      setChatImageSource(
        `${Config.API_URL}/files?fid=${_chatImageSourceId}&t=${accessToken}`
      );
    }

    setChatName(_chatName);
  }, [chat]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.select({ ios: true, android: true })) {
          router.push({
            pathname: `/chats/[chatId]`,
            params: { chatId: chat.id },
          });
        } else {
          router.push({
            pathname: `/(tabs)/ChatsTab`,
            params: { chatId: chat.id },
          });
        }
      }}
      style={[
        styles.flexRow,
        {
          justifyContent: "flex-start",
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 20,
          paddingBottom: 5,
          marginVertical: 5,
          width: SCREEN_WIDTH - 10,

          backgroundColor:
            params && params.chatId && Number(params.chatId) === chat.id
              ? theme.backgroundMuted
              : theme.background,
        },
      ]}
    >
      {/* <Avatar
        text={`${chatName?.[0] || ":"} ${chatName?.[1] || ")"}`}
        imageSource={chatImageSource ? chatImageSource : undefined}
        style={{ width: 50, height: 50 }}
        textStyles={{ fontSize: 12 }}
      /> */}

      <Avatar
        text={`${chatName?.[0] || ":"} ${chatName?.[1] || ")"}`}
        imageSource={chatImageSource ? chatImageSource : undefined}
        style={{ width: 50, height: 50 }}
        textStyles={{ fontSize: 12 }}
      />

      <View
        style={{
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
          width: "87%",
          marginHorizontal: 10,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={[
            styles.flexRow,
            { justifyContent: "space-between", backgroundColor: "transparent" },
          ]}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
            }}
            selectable={false}
          >
            {chatName}
          </Text>
          {chat?.messages?.[0] && (
            <Text
              style={[
                {
                  fontSize: 10,
                  color: theme.foregroundMuted,
                  paddingHorizontal: 10,
                },
              ]}
              selectable={false}
            >
              {Utils.getTimeDifference(chat?.messages?.[0].createdAt)}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.flexRow,
            { justifyContent: "space-between", backgroundColor: "transparent" },
          ]}
        >
          <View
            style={[
              styles.flexRow,
              { paddingVertical: 5, backgroundColor: "transparent" },
            ]}
          >
            {chat?.messages?.[0] &&
              chat?.messages?.[0].sender?.id === user?.id && (
                <Text style={{ paddingRight: 5 }} selectable={false}>
                  <EvilIcons
                    name="check"
                    size={16}
                    color={theme.foregroundMuted}
                  />
                </Text>
              )}
            {chat?.messages?.[0] &&
              chat?.messages?.[0].status !== "deleted" && (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: theme.foregroundMuted,
                    width: Platform.select({ ios: true, android: true })
                      ? "90%"
                      : 350,
                    minHeight: 40,
                  }}
                  selectable={false}
                >
                  {chat?.chatType !== ChatTypes.private &&
                  chat?.messages?.[0]?.sender?.firstName
                    ? chat?.messages?.[0]?.sender?.firstName + ": "
                    : ""}
                  {chat?.messages?.[0]?.message.length > 80
                    ? chat?.messages?.[0]?.message.substring(0, 80) + "..."
                    : chat?.messages?.[0]?.message}
                </Text>
              )}
            {chat?.messages?.[0] &&
              chat?.messages?.[0].status === "deleted" && (
                <View
                  style={[
                    styles.flexRow,
                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="do-not-disturb"
                    size={20}
                    color={theme.destructive}
                  />
                  <Text
                    style={[
                      {
                        color: theme.foregroundMuted,
                        paddingLeft: 3,
                      },
                    ]}
                  >
                    This message was deleted
                  </Text>
                </View>
              )}
          </View>

          {chat?._count?.messages > 0 && (
            <View
              style={[
                styles.flexRow,
                styles.flexCenter,
                {
                  height: 20,
                  borderRadius: 9999,
                  paddingHorizontal: 5,
                  marginHorizontal: 10,
                  backgroundColor: theme.accent,
                  minWidth: 20,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: 10,

                    color: theme.accentForeground,
                  },
                ]}
                selectable={false}
              >
                {chat?._count?.messages}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
