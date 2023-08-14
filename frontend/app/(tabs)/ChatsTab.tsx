import { StyleSheet, FlatList } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { Pressable } from "react-native";
import socket from "../../Socket";
import { useEffect, useState } from "react";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRootNavigationState,
  useRouter,
} from "expo-router";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import { AuthContext } from "../_layout";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../../Utils";
import Config from "../../Config";
import ChatCard, { Chat } from "../../components/chats/ChatCard";
import SingleChatScreen from "../chats/[chatId]";
import GlobalStyles from "../../GlobalStyles";
import { Platform } from "react-native";
import ChatsTopBar from "../../components/chats/ChatsTopBar";
import ChatsSearchScreen from "../chats/Search";
import NewChatScreen from "../chats/New";
import ChatsShareScreen from "../chats/share";

export default function ChatsTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigationState = useRootNavigationState();
  const { theme } = useContext(AppThemeContext);
  const { user, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [Chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const navigation = useNavigation();
  const [onPostCreate, setOnPostCrete] = useState<boolean>(false);
  function onLogout() {
    AsyncStorage.removeItem("user");
    AsyncStorage.removeItem("acessToken");
    AsyncStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUser(null);

    router.push("/auth/LoginEmail");
  }

  useEffect(() => {
    if (!navigationState?.key) return;

    socket.on("receive_message", (data) => {
      console.log("chats page: receive message:-------- ");
      getChats();
    });

    socket.on("send_message_response", (data) => {
      console.log("chats page: send message response:------- ");
      getChats();
    });

    socket.on("read_messages_response", (data) => {
      console.log("chats page: send message response:------- ");
      getChats();
    });

    socket.on("new_chat", (data) => {
      console.log("new chat  = id: ", data.id, "name: ", data.name);
      socket.emit("join", { chatId: data.id });
    });
  }, []);

  useEffect(() => {
    /**
     * Get Chats
     */
    getChats();
    navigation.addListener("focus", () => {
      getChats();
    });
  }, []);

  async function getChats() {
    console.log("...getting Chats...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get Chat results: (1) ", results.data[0]);
      if (results.success) {
        setChats(results.data);
        if (
          !Platform.select({ ios: true, android: true }) &&
          results.data &&
          results.data[0] &&
          results.data[0].id
        ) {
          router.push({
            pathname: "/(tabs)/ChatsTab",
            params: { chatId: results.data[0].id },
          });
        }
        console.log("successful get Chats");
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
      style={[
        styles.container,
        styles.flexRow,
        { justifyContent: "flex-start", alignItems: "flex-start" },
      ]}
    >
      <View
        style={{
          width: Platform.select({ ios: true, android: true })
            ? undefined
            : 500,
          maxWidth: Platform.select({ ios: true, android: true })
            ? undefined
            : 500,
          height: "100%",
          borderRightWidth: Platform.select({ ios: true, android: true })
            ? 0
            : 1,
          borderEndWidth: Platform.select({ ios: true, android: true }) ? 0 : 1,
          borderEndColor: theme.border,
          borderRightColor: theme.border,
        }}
      >
        {!Platform.select({ ios: true, android: true }) && (
          <ChatsTopBar
            onPostCreate={onPostCreate}
            setOnPostCreate={setOnPostCrete}
            onActionEnd={getChats}
          />
        )}

        {Chats &&
          params.action !== "search" &&
          params.action !== "add" &&
          params.action !== "share" && (
            <FlatList
              showsVerticalScrollIndicator={false}
              onRefresh={getChats}
              refreshing={loading}
              data={Chats}
              renderItem={({ item }: { item: Chat }) => (
                <ChatCard chat={item} />
              )}
              keyExtractor={(item) => {
                return item.id.toString();
              }}
            />
          )}

        {params.action === "search" && <ChatsSearchScreen />}

        {params.action === "add" && (
          <NewChatScreen onCreate={onPostCreate} setOnCreate={setOnPostCrete} />
        )}

        {params.action === "share" && <ChatsShareScreen />}
      </View>
      {!Platform.select({ ios: true, android: true }) &&
        params.action !== "search" &&
        params.action !== "add" &&
        params.action !== "share" && (
          <View
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            <SingleChatScreen />
          </View>
        )}

      {!Platform.select({ ios: true, android: true }) &&
        (params.action === "search" ||
          params.action === "add" ||
          params.action === "share") && (
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,
              {
                flex: 1,
                width: "100%",
                height: "100%",
              },
            ]}
          >
            <Text>Tuchat.</Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  container: {
    flex: 1,
  },
});
