import { View, Text, TextInput } from "../Themed";
import { TouchableOpacity, Platform, StyleSheet, Image } from "react-native";
import { useEffect, useContext, useState } from "react";
import GlobalStyles from "../../GlobalStyles";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
const Favicon = require("../../assets/images/favicon.png");
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../Avatar";
import { FullChart } from "../../app/chats/[chatId]";
import socket from "../../Socket";
import Config from "../../Config";
import { ChatTypes } from "./ChatCard";

export default function ChatTopBar({
  chat,
  onSearchEnd,
  chatMode,
  setChatMode,
}: {
  chat: FullChart;
  onSearchEnd?: any;
  chatMode: "messages" | "info" | "search";
  setChatMode: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const router = useRouter();

  const [searchString, setSearchString] = useState<string>();

  useEffect(() => {
    if (chatMode === "search") {
      socket.emit("search_messages", { searchString, chatId: chat.id });
    }
  }, [searchString]);

  const [chatImageSource, setChatImageSource] = useState<string | undefined>();
  const [chatName, setChatName] = useState<string | undefined>();

  useEffect(() => {
    // if (Platform.select({ ios: true, android: true })) {
    //   Dimensions.addEventListener("change", ({ window, screen }) => {
    //     SET_SCREEN_WIDTH(window.width);
    //   });
    // }

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

    // console.log("chat image source: ", chat.id, _chatImageSourceId);

    if (_chatImageSourceId) {
      setChatImageSource(
        `${Config.API_URL}/files?fid=${_chatImageSourceId}&t=${accessToken}`
      );
    }

    setChatName(_chatName);
  }, [chat]);

  return (
    <View
      style={[
        styles.flexRow,
        styles.padding,
        {
          paddingTop: Platform.select({ ios: true, android: true })
            ? 20
            : undefined,
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,

          backgroundColor: theme.backgroundMuted,
          borderLeftWidth: Platform.select({ ios: true, android: true })
            ? 0
            : 1,
          borderLeftColor: theme.foregroundMuted,
          height: Platform.select({ ios: true, android: true })
            ? undefined
            : 60,
        },
      ]}
    >
      {chatMode === "messages" && (
        <>
          <View
            style={[
              styles.flexRow,
              {
                justifyContent: "flex-start",
                alignItems: "center",
                backgroundColor: theme.backgroundMuted,
              },
            ]}
          >
            {Platform.select({ ios: true, android: true }) && (
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.accent}
                  style={{ marginRight: 30 }}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setChatMode("info")}
              style={[
                styles.flexRow,
                { justifyContent: "flex-start", alignItems: "center" },
              ]}
            >
              {/* <Avatar
                style={{ height: 40, width: 40 }}
                textStyles={{ fontSize: 13 }}
                text={`${chat.name[0]} ${chat.name[1]}`}
                imageSource={
                  chat?.profileAvatarId
                    ? `${Config.API_URL}/files?fid=${chat?.profileAvatarId}&t=${accessToken}`
                    : ""
                }
              /> */}
              <Avatar
                text={`${chatName?.[0] || ":"} ${chatName?.[1] || ")"}`}
                imageSource={chatImageSource ? chatImageSource : undefined}
                style={{ width: 50, height: 50 }}
                textStyles={{ fontSize: 12 }}
              />
              <Text style={{ fontWeight: "500", marginLeft: 10 }}>
                {chatName}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.padding]}
            onPress={() => {
              setChatMode("search");
            }}
          >
            <MaterialIcons
              name="search"
              size={Platform.select({ ios: true, android: true }) ? 30 : 22}
              color={theme.foreground}
              style={{
                marginHorizontal: 15,
                fontWeight: "bold",
              }}
            />
          </TouchableOpacity>
        </>
      )}

      {chatMode === "info" && (
        <>
          <View
            style={[
              styles.flexRow,
              {
                justifyContent: "flex-start",
                alignItems: "center",
                backgroundColor: theme.backgroundMuted,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setChatMode("messages");
              }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.accent}
                style={{ marginRight: 30 }}
              />
            </TouchableOpacity>

            <Text style={{ fontWeight: "500", marginLeft: 10 }}>
              {`Chat Information `}
            </Text>
          </View>
        </>
      )}

      {chatMode === "search" && (
        <View
          style={[
            styles.flexRow,
            {
              justifyContent: "flex-start",
              alignItems: "center",
              backgroundColor: theme.backgroundMuted,
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              if (onSearchEnd) {
                onSearchEnd();
              }

              setChatMode("messages");
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.accent}
              style={{ marginRight: 30 }}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              {
                marginHorizontal: 5,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 15,
                borderWidth: 1,
                backgroundColor: theme.background,
                flex: 1,
                width: "100%",
              },
            ]}
            value={searchString}
            onChangeText={(value: string) => {
              // console.log("new search string: ", value);
              setSearchString(value);
            }}
            placeholder={"Search A message"}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
