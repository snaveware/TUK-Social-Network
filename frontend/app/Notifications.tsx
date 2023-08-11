import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";
import { useContext, useEffect, useState } from "react";
import Config from "../Config";
import Utils, { BodyRequestMethods } from "../Utils";
import { PostOwner } from "../components/posts/PostCard";
import NotificationCard from "../components/NotificationCard";
import { AppThemeContext } from "../Theme";

export type Notification = {
  id: number;
  message: string;
  userId: number;
  user: PostOwner;
  associatedPostId?: number;
  associatedCOmmentId?: number;
  associatedChatId?: number;
  associatedMessageId?: number;
  associatedUserId?: number;
  associatedUser: PostOwner;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>();
  const { theme } = useContext(AppThemeContext);

  useEffect(() => {
    getNotifications();
  }, []);

  async function getNotifications() {
    try {
      const URL = `${Config.API_URL}/auth/user/notifications`;

      const results = await Utils.makeGetRequest(URL);

      console.log("Get notifications results: ", results.data.length);

      if (results.success) {
        setNotifications(results.data);
        console.log("successful get notifications");
      } else {
        console.log("error getting notifications: ", results.message);
      }
    } catch (error) {
      console.log("error getting notifications", error);
    }
  }

  async function dismissNotification(notificationId: number) {
    console.log("dismissing notification: ", notificationId);
    try {
      const URL = `${Config.API_URL}/auth/user/notifications/${notificationId}/dismiss`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {},
      });

      // console.log("dismiss notification results: ", results);

      if (results.success) {
        getNotifications();
        console.log("successful dismissing notifications");
      } else {
        console.log("error dismissing notifications: ", results.message);
      }
    } catch (error) {
      console.log("error dismissing notifications", error);
    }
  }

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      {notifications &&
        notifications.length > 0 &&
        notifications.map((notification, index) => {
          return (
            <NotificationCard
              key={index}
              notification={notification}
              onDismiss={dismissNotification}
            />
          );
        })}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
