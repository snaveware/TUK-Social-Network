import { StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { Pressable } from "react-native";
import socket from "../../Socket";
import { useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";

export default function HomeTabScreen() {
  const router = useRouter();
  const { theme } = useContext(AppThemeContext);
  useEffect(() => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page with Posts</Text>

      <Link href={"/LoginEmail"} style={{ color: theme.accent }}>
        Login
      </Link>
      <Link href={"/(tabs)/Account"} style={{ color: theme.primary }}>
        Account
      </Link>
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
