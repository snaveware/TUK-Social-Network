import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import { useContext, useState, useEffect } from "react";
import { AuthContext, User } from "../_layout";
import PostCard, { Post, PostOwner } from "../../components/posts/PostCard";
import { Image } from "react-native";
import Avatar from "../../components/Avatar";
import Config from "../../Config";
import { AppThemeContext } from "../../Theme";
const Background = require("../../assets/images/background.png");
import { Entypo } from "@expo/vector-icons";
import GlobalStyles from "../../GlobalStyles";
import Utils, { BodyRequestMethods } from "../../Utils";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import socket from "../../Socket";
import FolderView from "../../components/files/FolderView";

export default function UserPageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    user: authUser,
    setIsLoggedIn,
    setUser: setAuthUser,
    accessToken,
  } = useContext(AuthContext);
  const [user, setUser] = useState<User>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useContext(AppThemeContext);
  const [activeTab, setActiveTab] = useState<"posts" | "files">("posts");
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  function onSendMessage() {
    if (loading) return;
    setLoading(true);
    socket.emit("resolve_chat", { otherUserId: user?.id });
  }

  useEffect(() => {
    socket.on("resolve_chat_response", (data) => {
      console.log("resolve chat response: ", data);
      router.push(`/chats/${data.chat.id}`);
      setLoading(false);
    });
    getUser();
  }, []);

  useEffect(() => {
    // console.log("user change: ", user);
    if (user) {
      getUserPosts();
      if (user?.followedBy?.[0] && user?.followedBy?.[0].id === authUser?.id) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }
  }, [user]);

  async function getUserPosts() {
    console.log("...getting posts...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/posts/user/${user?.id}`;
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

  async function getUser() {
    console.log("...getting posts...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/user/${params.userId}`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get user results: ", results);
      if (results.success) {
        setUser(results.data);
        console.log("successful get user");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error getting user: ", error);
    }
  }

  async function toggleFollowUser() {
    console.log("...toggle follow user...");
    if (loading) return;
    setLoading(true);
    try {
      let URL;
      if (isFollowing) {
        URL = `${Config.API_URL}/auth/user/unfollow/${user?.id}`;
      } else {
        URL = `${Config.API_URL}/auth/user/follow/${user?.id}`;
      }
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {},
      });
      console.log("toggle follow results: ", URL, results);
      if (results.success) {
        setUser(results.data);
        console.log("successful follow toggle user");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error getting user: ", error);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={[{ flex: 1 }]}>
        <View>
          <Image
            source={
              user?.coverImageId && accessToken
                ? {
                    uri: `${Config.API_URL}/files?fid=${user?.coverImageId}&t=${accessToken}`,
                  }
                : Background
            }
            style={[{ height: 250 }]}
          />
          <View
            style={[
              styles.flexRow,
              { flexWrap: "nowrap", justifyContent: "space-between" },
            ]}
          >
            <View
              style={[
                {
                  width: Platform.OS === "android" ? 110 : 120,
                  height: Platform.OS === "android" ? 110 : 120,
                  position: "relative",
                  top: -70,
                  left: 20,
                  borderRadius: 9999,
                },
              ]}
            >
              <Avatar
                text={`${user?.firstName[0] || ":"} ${
                  user?.lastName[0] || ")"
                }`}
                imageSource={
                  user?.profileAvatarId && accessToken
                    ? `${Config.API_URL}/files?fid=${user.profileAvatarId}&t=${accessToken}`
                    : undefined
                }
                style={[
                  {
                    width: Platform.OS === "android" ? 110 : 120,
                    height: Platform.OS === "android" ? 110 : 120,
                  },
                ]}
                textStyles={{ fontSize: 30 }}
              />
            </View>
            <View
              style={[
                styles.flexCols,
                {
                  backgroundColor: "transparent",
                  position: "relative",
                  top: -60,
                },
              ]}
            >
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent" },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.flexRow,
                    styles.flexCenter,
                    styles.padding,
                    {
                      borderRadius: 4,
                      marginHorizontal: 10,
                      backgroundColor: theme.background,
                    },
                  ]}
                  onPress={() => {
                    onSendMessage();
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color={theme.foreground}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  { backgroundColor: "transparent" },
                ]}
              >
                <View
                  style={[
                    styles.flexCols,
                    styles.flexCenter,
                    styles.padding,
                    {
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "500",
                      paddingTop: 10,
                      paddingBottom: 5,
                    }}
                  >
                    {user?._count.ownedPosts || 0}
                  </Text>
                  <Text>Posts</Text>
                </View>
                <View
                  style={[
                    styles.flexCols,
                    styles.flexCenter,
                    styles.padding,
                    {
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "500",
                      paddingTop: 10,
                      paddingBottom: 5,
                    }}
                  >
                    {user?._count.followedBy || 0}
                  </Text>
                  <Text>Followers</Text>
                </View>
                <View
                  style={[
                    styles.flexCols,
                    styles.flexCenter,
                    styles.padding,
                    {
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "500",
                      paddingTop: 10,
                      paddingBottom: 5,
                    }}
                  >
                    {user?._count.follows || 0}
                  </Text>
                  <Text>Following</Text>
                </View>
              </View>
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  styles.padding,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Button
                  text={isFollowing ? "unfollow" : "follow"}
                  style={{ marginRight: 5 }}
                  onPress={() => {
                    toggleFollowUser();
                  }}
                />
                {/* <Button text="Message" style={{ marginLeft: 5 }} /> */}
              </View>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.padding,
            {
              position: "relative",
              top: -120,
              width: "50%",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              textTransform: "capitalize",
            }}
          >
            {user?.staffProfileIfIsStaff
              ? user.staffProfileIfIsStaff.title + " "
              : ""}
            {user?.firstName} {user?.lastName}
          </Text>
          {user?.studentProfileIfIsStudent && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                paddingVertical: 10,
                textTransform: "uppercase",
              }}
            >
              {user.studentProfileIfIsStudent
                ? user.studentProfileIfIsStudent.registrationNumber
                : ""}
            </Text>
          )}

          <Text
            style={{
              fontSize: 18,
              fontWeight: "400",
              paddingVertical: 10,
              textTransform: "capitalize",
            }}
          >
            {user?.roleName}
          </Text>
        </View>
        {user?.bio && (
          <Text
            style={[
              {
                paddingHorizontal: 8,
                fontSize: 14,
                fontWeight: "400",
                paddingVertical: 10,
                textTransform: "capitalize",
                position: "relative",
                top: -130,
              },
            ]}
          >
            {user.bio}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.flexRow,

          {
            justifyContent: "space-around",
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 2,
            position: "relative",
            top: -120,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setActiveTab("posts");
            navigation.setOptions({
              title: "Account",
            });
          }}
          style={[
            {
              paddingHorizontal: 50,
              paddingVertical: 10,
              backgroundColor:
                activeTab === "posts" ? theme.primary : theme.background,
            },
          ]}
        >
          <Text>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("files")}
          style={[
            {
              paddingHorizontal: 50,
              paddingVertical: 10,
              backgroundColor:
                activeTab === "files" ? theme.primary : theme.background,
            },
          ]}
        >
          <Text>Files</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: "relative", top: -100 }}>
        {activeTab === "posts" &&
          posts?.map((post, index) => {
            return <PostCard key={index} post={post} />;
          })}
        {activeTab === "files" && user && <FolderView user={user} />}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
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
