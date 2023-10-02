import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import Button from "../../components/Button";
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
import { TouchableOpacity, Platform, RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import socket from "../../Socket";

import FolderView from "../../components/files/FolderView";
import FileCard from "../../components/files/FileCard";

export default function UserPageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { user: authUser, accessToken } = useContext(AuthContext);
  const [user, setUser] = useState<User>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useContext(AppThemeContext);
  const [activeTab, setActiveTab] = useState<"posts" | "files">("posts");
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [files, setFiles] = useState<any[]>();

  function onSendMessage() {
    if (loading) return;
    setLoading(true);
    socket.emit("resolve_chat", { otherUserId: user?.id, origin: "user_page" });
  }

  useEffect(() => {
    socket.on("resolve_chat_response", (data) => {
      if (data.origin !== "user_page") {
        return;
      }

      console.log(
        "resolve chat response: (user page screen) "
        // , data
      );
      router.push(`/chats/${data.chat.id}`);
      setLoading(false);
    });
    getUser();
    getUserPosts();
  }, []);

  useEffect(() => {
    // console.log("user change: ", user);
    if (user) {
      if (user?.followedBy?.[0] && user?.followedBy?.[0].id === authUser?.id) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }
  }, [user]);

  async function getUserPosts() {
    console.log("...getting user posts...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/posts/user/${params.userId}`;
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

  async function getUserFiles() {
    console.log("...getting user files ...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/files/user/${user?.id}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("get user files results: ", results);
      if (results.success) {
        setFiles(results.data);
        console.log("successful get user files (accounts tab)");
      } else {
        setError(results.message);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error getting files: ", error);
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

        console.log("successful get user (single user page)");
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
      style={{ flex: 1, backgroundColor: theme.background, width: "100%" }}
      //showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            getUser();
            if (activeTab === "files") {
              getUserFiles();
            } else {
              getUserPosts();
            }
          }}
        />
      }
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
            style={[
              {
                height: Platform.select({ ios: true, android: true })
                  ? 250
                  : 300,
                width: "100%",
              },
            ]}
          />
          <View
            style={[
              styles.flexRow,
              {
                flexWrap: "nowrap",
                justifyContent: "space-between",
                paddingHorizontal: Platform.select({ ios: true, android: true })
                  ? undefined
                  : 100,
              },
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
              paddingHorizontal: Platform.select({ ios: true, android: true })
                ? undefined
                : 100,
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
        <View
          style={{
            paddingHorizontal: Platform.select({ ios: true, android: true })
              ? 10
              : 100,
          }}
        >
          {user?.staffProfileIfIsStaff?.school?.faculty && (
            <View
              style={{
                position: "relative",
                top: -130,
                padding: Platform.select({ ios: true, android: true })
                  ? undefined
                  : 30,
              }}
            >
              {/* <Text
              style={[
                styles.title,
                {
                  paddingLeft: 10,
                },
              ]}
            >
              School
            </Text> */}
              <Text
                style={[
                  {
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {user?.staffProfileIfIsStaff?.school?.faculty?.name}
              </Text>
              <Text
                style={[
                  {
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {user?.staffProfileIfIsStaff?.school.name}
              </Text>
            </View>
          )}

          {user?.studentProfileIfIsStudent?.class?.programme?.school
            ?.faculty && (
            <View
              style={{
                position: "relative",
                top: -130,
              }}
            >
              {/* <Text
              style={[
                styles.title,
                {
                  paddingLeft: 10,
                },
              ]}
            >
              School
            </Text> */}

              <Text
                style={[
                  {
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {
                  user?.studentProfileIfIsStudent?.class?.programme?.school
                    ?.name
                }
              </Text>
              <Text
                style={[
                  {
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {
                  user?.studentProfileIfIsStudent?.class?.programme?.school
                    ?.faculty?.name
                }
              </Text>
            </View>
          )}
          {user?.bio && (
            <View
              style={{
                position: "relative",
                top: -130,
              }}
            >
              <Text style={[styles.title]}>Bio</Text>
              <Text
                style={[
                  {
                    fontSize: 14,
                    fontWeight: "400",
                    paddingVertical: 10,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {user?.bio}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View
        style={{
          padding: Platform.select({ ios: true, android: true })
            ? undefined
            : 30,
        }}
      >
        <View
          style={[
            styles.flexRow,

            {
              justifyContent: "center",
              // borderWidth: 1,
              // borderColor: theme.border,
              borderBottomWidth: 1,
              borderBottomColor: theme.primary,

              backgroundColor: theme.backgroundMuted,
              borderRadius: 2,
              position: "relative",
              top: -120,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setActiveTab("posts");
              if (navigation) {
                navigation.setOptions({
                  title: "Account",
                });
              } else {
                console.log("-----no navigation-------");
              }
            }}
            style={[
              {
                paddingHorizontal: 70,
                paddingVertical: 10,
                backgroundColor:
                  activeTab === "posts" ? theme.primary : undefined,
                // borderWidth: activeTab === "posts" ? 0 : 10,
                // borderColor:
                //   activeTab === "posts" ? theme.primary : theme.background,
                borderColor: theme.primary,
                borderLeftWidth: Platform.select({ ios: true, android: true })
                  ? undefined
                  : 1,
              },
            ]}
          >
            <Text
              style={{
                color:
                  activeTab === "posts"
                    ? theme.primaryForeground
                    : theme.foreground,
              }}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              getUserFiles();
              setActiveTab("files");
            }}
            style={[
              {
                paddingHorizontal: 70,
                paddingVertical: 10,
                backgroundColor:
                  activeTab === "files" ? theme.primary : undefined,
                borderColor: theme.primary,
                borderRightWidth: Platform.select({ ios: true, android: true })
                  ? undefined
                  : 1,
              },
            ]}
          >
            <Text
              style={{
                color:
                  activeTab === "files"
                    ? theme.primaryForeground
                    : theme.foreground,
              }}
            >
              Files
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            position: "relative",
            top: -100,
            display: "flex",
            alignItems: "center",
          }}
        >
          {activeTab === "posts" &&
            posts &&
            posts?.map((post, index) => {
              return (
                <PostCard
                  loading={loading}
                  setLoading={setLoading}
                  key={index}
                  post={post}
                />
              );
            })}
          {activeTab === "files" && (
            <View
              style={[
                styles.flexRow,
                {
                  justifyContent: "space-around",
                  alignItems: "center",
                  flexWrap: "wrap",
                  backgroundColor: "transparent",
                },
              ]}
            >
              {files?.map((file, index) => {
                return (
                  <FileCard
                    key={index}
                    file={file}
                    showLabel={file.type === "word" || file.type === "pdf"}
                    showOptions={false}
                  />
                );
              })}
            </View>
          )}
        </View>
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
