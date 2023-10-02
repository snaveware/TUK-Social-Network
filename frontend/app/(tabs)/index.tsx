import {
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
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
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import GlobalStyles from "../../GlobalStyles";
const Favicon = require("../../assets/images/favicon.png");
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function HomeTabScreen() {
  const router = useRouter();
  // const navigationState = useRootNavigationState();
  const { theme } = useContext(AppThemeContext);
  const { user, setIsLoggedIn, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<number>(1);
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
    setActivePage(1);
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

  async function loadMore() {
    console.log("...getting posts...");
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const URL = `${Config.API_URL}/posts?page=${activePage + 1}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("load more posts results: ", results);
      if (results.success) {
        setPosts((prevValues) => {
          return [...prevValues, ...results.data];
        });
        console.log("successful load more posts");

        setActivePage((prevValue) => {
          return prevValue + 1;
        });
      } else {
        setError(results.message);
      }
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
      setError("Your are not connected to the internet");
      console.log("Error getting posts: ", error);
    }
  }

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <SafeAreaView
      style={[{ flex: 1, height: "100%", backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.flexRow,
          {
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 5,
          },
        ]}
      >
        <View
          style={[
            styles.flexRow,
            styles.flexCenter,
            { backgroundColor: "transparent", marginLeft: 15 },
          ]}
        >
          <Image
            source={Favicon}
            style={{ width: 35, height: 35, marginRight: 10 }}
          />
          <Text style={{ fontSize: 18 }}>TUK Social</Text>
        </View>

        <View
          style={[
            styles.flexRow,
            { justifyContent: "flex-end", alignItems: "center" },
          ]}
        >
          <Link href="Notifications" asChild>
            <Pressable>
              {({ pressed }) => (
                <MaterialIcons
                  name="notifications-none"
                  size={35}
                  color={theme.foreground}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
          <Link href="posts/Search" asChild>
            <Pressable>
              {({ pressed }) => (
                <MaterialIcons
                  name="search"
                  size={35}
                  color={theme.foreground}
                  style={{
                    marginHorizontal: 15,
                    fontWeight: "bold",
                    opacity: pressed ? 0.5 : 1,
                  }}
                />
              )}
            </Pressable>
          </Link>

          <Link href="/posts/New" asChild>
            <Pressable>
              <MaterialIcons
                name="post-add"
                size={35}
                color={theme.foreground}
                style={{ marginRight: 15, color: theme.foreground }}
              />
            </Pressable>
          </Link>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{
          flex: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getPosts} />
        }
        //   onScrollEndDrag={() => {
        //     console.log(".................end reached load more................");
        //     loadMore();
        //   }}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            // enableSomeButton();
            console.log(
              ".................end reached load more................"
            );
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {posts?.map((post, index) => {
          return (
            <PostCard
              key={index}
              onRefresh={getPosts}
              loading={loading}
              setLoading={setLoading}
              post={post}
            />
          );
        })}
        {loadingMore && (
          <ActivityIndicator style={{ padding: 3 }} size={"small"} />
        )}
      </KeyboardAwareScrollView>

      {/* <FlatList
        // showsVerticalScrollIndicator={false}
        onRefresh={getPosts}
        refreshing={loading}
        data={posts}
        renderItem={({ item }: { item: Post }) => (
          
        )}
        keyExtractor={(item) => {
          return item.id.toString();
        }}
        style={{
          flex: 1,
        }}
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
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
