import { View, Text } from "./Themed";
import Avatar from "./Avatar";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Notification } from "../app/Notifications";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../app/_layout";
import { AppThemeContext } from "../Theme";
import GlobalStyles from "../GlobalStyles";
import { Ionicons } from "@expo/vector-icons";
import Config from "../Config";

export default function NotificationCard({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const swipeableRef = useRef<Swipeable>(null); // Create a ref
  const router = useRouter();

  const closeSwipeable = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close(); // Call close method on the ref
    }
  };

  const renderRightActions = () => (
    <View style={styles.rightActionsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={() => {
          onDismiss(notification.id);
          closeSwipeable();
        }}
      >
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={{
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      }}
    >
      <Swipeable renderRightActions={renderRightActions} ref={swipeableRef}>
        <View
          style={[
            styles.flexRow,
            styles.padding,
            {
              justifyContent: "flex-start",
              alignItems: "center",
            },
          ]}
        >
          <Avatar
            text={`${notification.associatedUser.firstName[0]}${notification.associatedUser.lastName[0]}`}
            imageSource={
              notification.associatedUser.profileAvatarId
                ? `${Config.API_URL}/files?fid=${notification.associatedUser.profileAvatarId}&t=${accessToken}`
                : undefined
            }
            style={{ marginRight: 10 }}
          />
          <Text style={{ width: "80%" }}>{notification.message}</Text>
        </View>
      </Swipeable>
    </View>
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
});
