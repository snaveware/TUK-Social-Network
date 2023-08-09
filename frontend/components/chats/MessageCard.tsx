import { Message } from "../../app/chats/[chatId]";
import { View, Text } from "../Themed";
import Avatar from "../Avatar";
import { useContext, useRef, useEffect, useState } from "react";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Config from "../../Config";
import { StyleSheet } from "react-native";
import GlobalStyles from "../../GlobalStyles";
import { AuthContext } from "../../app/_layout";
import Utils from "../../Utils";
import { EvilIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Entypo } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import socket from "../../Socket";
import { useRouter } from "expo-router";

export default function MessageCard({
  message,
  setReplyMessage,
}: {
  message: Message;
  setReplyMessage: any;
}) {
  // console.log("message: ", message);
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const swipeableRef = useRef<Swipeable>(null); // Create a ref
  const router = useRouter();

  const closeSwipeable = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close(); // Call close method on the ref
    }
  };

  const [isDeleted, setIsDeleted] = useState<boolean>(
    message?.status === "deleted" ? true : false
  );

  useEffect(() => {
    setIsDeleted(message?.status === "deleted" ? true : false);
    socket.on("delete_message_response", (data) => {
      if (
        data.message.id === message?.id &&
        data.message?.status !== "deleted"
      ) {
        setIsDeleted(false);
      }
    });
  }, []);

  const renderLeftActions = () => (
    <View style={styles.leftActionsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.replyButton]}
        onPress={() => {
          setReplyMessage(message);
          closeSwipeable();
        }}
      >
        <Entypo name="reply" size={20} color="white" />
        <Text style={styles.buttonText}>Reply</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.shareButton]}
        onPress={() => {
          closeSwipeable();
          router.push({
            pathname: "/chats/share",
            params: { shareMessage: message.message },
          });
        }}
      >
        <Entypo name="forward" size={20} color="white" />
        <Text style={styles.buttonText}>Forward</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightActionsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => {
          socket.emit("delete_message", { messageId: message.id });
          setIsDeleted(true);
          closeSwipeable();
        }}
      >
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.copyButton]}
        onPress={() => {
          Clipboard.setStringAsync(message.message);
          closeSwipeable();
        }}
      >
        <Ionicons name="copy-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Copy</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={[styles.button, styles.infoButton]}>
        <Ionicons name="information-circle-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Info</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      ref={swipeableRef}
    >
      <View
        style={[
          styles.flexRow,
          styles.padding,

          {
            marginHorizontal: 5,

            justifyContent:
              user?.id === message.sender.id ? "flex-end" : "flex-start",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            styles.flexRow,
            {
              width: "65%",
              minWidth: "65%",

              justifyContent: "flex-start",
              alignItems: "flex-end",

              flexDirection:
                user?.id === message.sender.id ? "row-reverse" : "row",
            },
          ]}
        >
          <Avatar
            text={`${message.sender.firstName?.[0]} ${message.sender.lastName?.[1]}`}
            imageSource={
              message.sender.profileAvatarId
                ? `${Config.API_URL}/files?fid=${message.sender.profileAvatarId}&t=${accessToken}`
                : undefined
            }
            style={{ width: 40, height: 40 }}
            textStyles={{ fontSize: 10 }}
          />
          <View
            style={[
              styles.flexCols,
              styles.padding,
              {
                marginLeft: user?.id === message.sender.id ? 0 : 5,
                marginRight: user?.id === message.sender.id ? 5 : 0,
                flexWrap: "nowrap",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                borderBottomRightRadius:
                  user?.id === message.sender.id ? 0 : 12,
                borderBottomLeftRadius: user?.id === message.sender.id ? 12 : 0,
                backgroundColor:
                  user?.id === message.sender.id
                    ? theme.backgroundMuted
                    : theme.primary,
                borderColor:
                  user?.id === message.sender.id ? theme.border : "transparent",
                borderWidth: 1,
              },
            ]}
          >
            {message.replyingTo && (
              <View
                style={{
                  backgroundColor: theme.background,
                  borderWidth: 0.5,
                  borderColor: theme.border,
                  borderLeftWidth: 2,
                  borderLeftColor: theme.accent,
                  borderStartWidth: 2,
                  borderStartColor: theme.accent,
                  borderRadius: 5,
                  padding: 5,
                  marginBottom: 5,
                }}
              >
                <Text
                  style={[
                    {
                      fontSize: 10,
                      color: theme.primary,
                      textAlign: "left",
                      paddingBottom: 5,
                    },
                  ]}
                >
                  {`${message?.replyingTo?.sender?.firstName || ":"} ${
                    message?.replyingTo?.sender?.lastName || ")"
                  }`}
                </Text>

                <Text
                  style={[
                    {
                      color: theme.foregroundMuted,
                      borderColor:
                        user?.id === message.sender.id
                          ? theme.primaryForeground
                          : theme.foregroundMuted,
                      fontSize: 12,
                    },
                  ]}
                >
                  {message.replyingTo?.message.length > 80
                    ? message?.replyingTo.message.substring(0, 80)
                    : message?.replyingTo?.message}
                </Text>
              </View>
            )}
            {!isDeleted && (
              <Text
                style={[
                  {
                    color:
                      user?.id === message.sender.id
                        ? theme.foreground
                        : theme.primaryForeground,
                    borderColor:
                      user?.id === message.sender.id
                        ? theme.primaryForeground
                        : theme.foregroundMuted,
                  },
                ]}
              >
                {message.message}
              </Text>
            )}
            {isDeleted && (
              <View
                style={[
                  styles.flexRow,
                  {
                    justifyContent: "flex-start",
                    alignItems: "center",
                    borderColor:
                      user?.id === message.sender.id
                        ? theme.primaryForeground
                        : theme.foregroundMuted,
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
                      color:
                        user?.id === message.sender.id
                          ? theme.foreground
                          : theme.primaryForeground,
                      paddingLeft: 3,
                    },
                  ]}
                >
                  This message was deleted
                </Text>
              </View>
            )}

            <View
              style={[
                styles.flexRow,
                {
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor:
                    user?.id === message.sender.id
                      ? theme.backgroundMuted
                      : theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: 10,
                    color:
                      user?.id === message.sender.id
                        ? theme.foregroundMuted
                        : theme.primaryForeground,
                    textAlign: "right",
                    paddingTop: 5,
                    marginRight: 10,
                  },
                ]}
              >
                <EvilIcons
                  name="check"
                  size={16}
                  color={
                    user?.id === message.sender.id
                      ? theme.foregroundMuted
                      : theme.backgroundMuted
                  }
                />
              </Text>
              <Text
                style={[
                  {
                    fontSize: 10,
                    color:
                      user?.id === message.sender.id
                        ? theme.foregroundMuted
                        : theme.backgroundMuted,
                    textAlign: "right",
                    paddingTop: 5,
                  },
                ]}
              >
                {Utils.getTimeDifference(message.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  leftActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    width: 200,
    maxWidth: 200,
  },
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    width: 200,
    maxWidth: 200,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: "red",
  },
  infoButton: {
    backgroundColor: "cyan",
  },
  replyButton: {
    backgroundColor: "green",
  },
  copyButton: {
    backgroundColor: DefaultAppTheme.secondary,
  },
  shareButton: {
    backgroundColor: DefaultAppTheme.accent,
  },
});
