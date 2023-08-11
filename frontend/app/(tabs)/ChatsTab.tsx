import { StyleSheet, FlatList } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { Pressable } from "react-native";
import socket from "../../Socket";
import { useEffect, useState } from "react";
import { Link, useRootNavigationState, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import { AuthContext } from "../_layout";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../../Utils";
import Config from "../../Config";
import ChatCard, { Chat } from "../../components/chats/ChatCard";

export default function ChatsTabScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { theme } = useContext(AppThemeContext);
  const { user, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [Chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
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
  }, []);

  async function getChats() {
    console.log("...getting Chats...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get Chat results: ", results);
      if (results.success) {
        setChats(results.data);
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
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        onRefresh={getChats}
        refreshing={loading}
        data={Chats}
        renderItem={({ item }: { item: Chat }) => <ChatCard chat={item} />}
        keyExtractor={(item) => {
          return item.id.toString();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
