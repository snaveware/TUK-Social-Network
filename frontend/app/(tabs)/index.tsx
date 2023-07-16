import { StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { Pressable } from "react-native";
import socket from "../../Socket";
import { useEffect } from "react";
import { Link, useRootNavigationState, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import { AuthContext } from "../_layout";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeTabScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { theme } = useContext(AppThemeContext);
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useContext(AuthContext);

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
    socket.on("connected", () => {
      console.log("socket connected..............");
      socket.emit("message", { message: "message from mobile client" });
    });
    socket.on("disconnected", () => {
      console.log("socket disconnected............");
    });
    socket.on("message", (message: any) => {
      console.log("new Message from server", message);
    });
  }, []);

  useEffect(() => {
    verifyLogin();
  }, [isLoggedIn]);

  async function verifyLogin() {
    const user = await AsyncStorage.getItem("user");
    console.log("login use effect...............", user);
    if (!user) {
      setIsLoggedIn(false);
      setUser(null);
      router.push("/auth/LoginEmail");
    } else if (!isLoggedIn) {
      setUser(JSON.parse(user));
      setIsLoggedIn(true);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page with Posts</Text>

      <Button text="Logout" onPress={onLogout} />

      <Text>
        {user?.firstName} {user?.lastName}
      </Text>
    </View>
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
