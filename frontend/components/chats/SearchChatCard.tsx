import { View, Text } from "../Themed";
import { useEffect, useState, useContext } from "react";
import { Chat, ChatTypes } from "./ChatCard";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import Avatar from "../Avatar";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
import { useRouter } from "expo-router";
import Config from "../../Config";
import socket from "../../Socket";

export default function SearchChatCard({ chat }: { chat?: Chat }) {
  const { theme } = useContext(AppThemeContext);

  const { user, accessToken } = useContext(AuthContext);

  const [chatImageSource, setChatImageSource] = useState<string | undefined>();
  const [chatName, setChatName] = useState<string>(":)");

  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState(
    Dimensions.get("window").width
  );
  // console.log("chat: ", chat);

  const router = useRouter();
  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      SET_SCREEN_WIDTH(window.width);
    });

    let _chatImageSourceId;
    let _chatName;

    if (chat?.chatType == ChatTypes.private) {
      chat?.members?.map((member) => {
        if (member.id !== user?.id) {
          _chatImageSourceId = member.profileAvatarId;
          if (chat?.staffProfileIfIsStaff) {
            _chatName = `${chat?.staffProfileIfIsStaff?.title} ${member.firstName} ${member.lastName}`;
          } else {
            _chatName = `${member.firstName} ${member.lastName}`;
          }
        }
      });
    } else {
      _chatImageSourceId = chat?.profileAvatarId;
      _chatName = chat?.name;
    }

    if (_chatImageSourceId) {
      setChatImageSource(
        `${Config.API_URL}/files?fid=${_chatImageSourceId}&t=${accessToken}`
      );
    }

    if (_chatName) {
      setChatName(_chatName);
    }
  }, []);

  // useEffect(() => {
  //   console.log("--change--", chatName, chatImageSource);
  // }, [chatImageSource, chatName]);

  return (
    <TouchableOpacity
      onPress={() => {
        socket.emit("resolve_chat", { chatId: chat?.id });
      }}
      style={[
        styles.flexRow,

        {
          paddingHorizontal: 10,
          paddingVertical: 5,
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
        },
      ]}
    >
      <Avatar
        text={`${chatName?.[0]} ${chatName?.[1]}`}
        imageSource={chatImageSource}
        style={{ width: 50, height: 50 }}
        textStyles={{ fontSize: 12 }}
      />
      <View style={[styles.flexCols, { paddingLeft: 10 }]}>
        <Text style={{ paddingVertical: 2 }}>{chat?.name}</Text>
        <Text style={{ paddingVertical: 2, color: theme.foregroundMuted }}>
          {chat?.description &&
            (chat?.description?.length > 50
              ? chat?.description?.substring(0, 50) + "..."
              : chat?.description)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
