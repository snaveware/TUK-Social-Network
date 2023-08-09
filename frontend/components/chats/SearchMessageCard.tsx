import { Message } from "../../app/chats/[chatId]";
import { View, Text } from "../Themed";
import Avatar from "../Avatar";
import { useContext, useState, useEffect } from "react";
import { AppThemeContext } from "../../Theme";
import Config from "../../Config";
import GlobalStyles from "../../GlobalStyles";
import { AuthContext } from "../../app/_layout";
import Utils from "../../Utils";
import { EvilIcons } from "@expo/vector-icons";
import { Chat, ChatTypes } from "./ChatCard";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { PostOwner } from "../posts/PostCard";
import { Ionicons } from "@expo/vector-icons";

export default function SearchMessageCard({ message }: { message?: Message }) {
  // console.log("message: ", message);
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const [chatImageSource, setChatImageSource] = useState<string | undefined>();
  const [chatName, setChatName] = useState<string>(":)");

  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState(
    Dimensions.get("window").width
  );
  return (
    <TouchableOpacity
      style={[
        styles.flexRow,

        {
          paddingHorizontal: 5,
          marginHorizontal: 5,
          marginVertical: 5,
          justifyContent: "flex-start",
          alignItems: "center",
        },
      ]}
      onPress={() => {
        console.log("selected message: ", message);
      }}
    >
      <View
        style={[
          styles.flexRow,
          {
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
          },
        ]}
      >
        <Avatar
          text={`${message?.sender.firstName?.[0]} ${message?.sender.lastName?.[1]}`}
          imageSource={
            message?.sender.profileAvatarId
              ? `${Config.API_URL}/files?fid=${message?.sender.profileAvatarId}&t=${accessToken}`
              : undefined
          }
          style={{ width: 50, height: 50 }}
          textStyles={{ fontSize: 12 }}
        />
        <View
          style={[
            styles.flexCols,

            {
              paddingLeft: 10,
              flexWrap: "nowrap",
            },
          ]}
        >
          <View
            style={[
              styles.flexRow,
              { justifyContent: "space-between", marginBottom: 5 },
            ]}
          >
            <Text>
              {`${message?.sender.firstName} ${message?.sender.lastName} ${
                message?.chat?.chatType !== "private"
                  ? "(" + message?.chat?.name + ")"
                  : ""
              }`}
            </Text>
            {message?.createdAt && (
              <Text style={{ color: theme.foregroundMuted }}>
                {Utils.getTimeDifference(message?.createdAt)}
              </Text>
            )}
          </View>

          <Text
            style={[
              {
                color: theme.foregroundMuted,
                width: 300,
              },
            ]}
          >
            {message?.message &&
              (message?.message.length > 80
                ? message?.message.substring(0, 80) + "..."
                : message.message)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
