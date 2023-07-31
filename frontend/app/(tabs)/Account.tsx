import { StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../_layout";
import { Post } from "../../components/posts/PostCard";

export default function AccountTabScreen() {
  const router = useRouter();

  const { user, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Page</Text>
      <Button text="Logout" onPress={onLogout} />
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
