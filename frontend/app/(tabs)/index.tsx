import { StyleSheet, FlatList } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { Pressable, Platform } from "react-native";
import socket from "../../Socket";
import { useEffect, useState } from "react";
import {
  Link,
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
import PostCard, { Post } from "../../components/posts/PostCard";

export default function HomeTabScreen() {
  const router = useRouter();
  // const navigationState = useRootNavigationState();
  const { theme } = useContext(AppThemeContext);
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

  const navigation = useNavigation();

  // useEffect(() => {
  //   if (!navigationState?.key) return;
  // }, []);

  useEffect(() => {
    /**
     * Get Posts
     */
    getPosts();
    navigation.addListener("focus", () => {
      getPosts();
    });
  }, []);

  async function getPosts() {
    console.log("...getting posts...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/posts`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get post results: ", results);
      if (results.success) {
        setPosts(results.data);
        console.log("successful get posts");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error getting posts: ", error);
    }
  }

  return (
    <View style={[styles.container]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        onRefresh={getPosts}
        refreshing={loading}
        data={posts}
        renderItem={({ item }: { item: Post }) => <PostCard post={item} />}
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
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
