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
import * as ImagePicker from "expo-image-picker";
import uploadFile, { extractAsset } from "../../uploadFile";
import * as DocumentPicker from "expo-document-picker";
import FolderView from "../../components/files/FolderView";

export default function AccountTabScreen() {
  const router = useRouter();

  const {
    user: authUser,
    setIsLoggedIn,
    setUser: setAuthUser,
    accessToken,
  } = useContext(AuthContext);
  const [user, setUser] = useState<User>(authUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useContext(AppThemeContext);
  const [activeTab, setActiveTab] = useState<"posts" | "files">("posts");
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [profileAvatarImageSource, setProfileAvatarImageSource] =
    useState<string>();
  const [coverImageSource, setCoverImageSource] = useState<string>();

  useEffect(() => {
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
      setProfileAvatarImageSource(
        user?.profileAvatarId && accessToken
          ? `${Config.API_URL}/files?fid=${user.profileAvatarId}&t=${accessToken}`
          : undefined
      );

      setCoverImageSource(
        user?.coverImageId && accessToken
          ? `${Config.API_URL}/files?fid=${user?.coverImageId}&t=${accessToken}`
          : undefined
      );
    }
  }, [user]);

  // useEffect(() => {
  //   console.log(
  //     "---change---profile avatar: ",
  //     profileAvatarImageSource,
  //     "cover: ",
  //     coverImageSource
  //   );
  // }, [coverImageSource, profileAvatarImageSource]);

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
      const URL = `${Config.API_URL}/auth/user/${authUser?.id}`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get user results: ", results);
      if (results.success) {
        setUser(results.data);
        setAuthUser(results.data);
        AsyncStorage.setItem("user", JSON.stringify(results.data));
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
        URL = `${Config.API_URL}/auth/user/unfollow/${authUser?.id}`;
      } else {
        URL = `${Config.API_URL}/auth/user/follow/${authUser?.id}`;
      }
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {},
      });
      console.log("toggle follow results: ", URL, results);
      if (results.success) {
        setUser(results.data);
        setAuthUser(results.data);
        AsyncStorage.setItem("user", JSON.stringify(results.data));
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

  async function pickImage(purpose: "avatar" | "cover") {
    if (Platform.OS == "web") {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
      });

      const asset: any = extractAsset(result);

      const attr = Utils.extractMimeTypeAndBase64(asset.uri);
      asset.mimeType = attr.mimeType;

      if (purpose === "avatar") {
        setProfileAvatarImageSource(asset.uri);
      } else if (purpose === "cover") {
        setCoverImageSource(asset.uri);
      }

      const uploaded = await uploadFile(asset);

      if (uploaded) {
        /**
         * update profile or cover
         */
        if (purpose === "avatar") {
          updateProfile(uploaded, purpose);
        } else if (purpose === "cover") {
          updateProfile(uploaded, purpose);
        }
      }

      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: purpose === "avatar" ? [1, 1] : [16, 9],
      quality: 1,
    });

    if (result && result.assets) {
      const asset: any = {
        uri: result.assets[0].uri,
        type: result.assets[0].type || "image",
      };

      asset.mimeType = Utils.getMimeTypeFromURI({
        uri: asset.uri,
        type: asset.type || "image",
      });

      asset.name = `${Utils.generateUniqueString()}${Utils.getMediaFileExtension(
        asset.mimeType
      )}`;

      console.log("picked assent: ", asset, " purpose: ", purpose);

      if (purpose === "avatar") {
        setProfileAvatarImageSource(asset.uri);
      } else if (purpose === "cover") {
        setCoverImageSource(asset.uri);
      }

      const uploaded = await uploadFile(asset);

      if (uploaded) {
        /**
         * update profile or cover
         */
        if (purpose === "avatar") {
          updateProfile(uploaded, purpose);
        } else if (purpose === "cover") {
          updateProfile(uploaded, purpose);
        }
      }
    }
  }

  async function updateProfile(uploadedFile: any, purpose: "avatar" | "cover") {
    console.log("...update profile Avatar...");
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/auth/user/${authUser?.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          profileAvatarId: purpose === "avatar" ? uploadedFile.id : undefined,
          coverImageId: purpose === "cover" ? uploadedFile.id : undefined,
        },
      });
      console.log("update profile avatar results: ", results);

      if (results.success) {
        setUser(results.data);
        setAuthUser(results.data);
        AsyncStorage.setItem("user", JSON.stringify(results.data));
        console.log("successful profile avatar update user");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error update profile avatar: ", error);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View>
        <View>
          <Image
            source={
              coverImageSource
                ? {
                    uri: coverImageSource,
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
                imageSource={profileAvatarImageSource}
                style={[
                  {
                    width: Platform.OS === "android" ? 110 : 120,
                    height: Platform.OS === "android" ? 110 : 120,
                  },
                ]}
                textStyles={{ fontSize: 30 }}
              />
              <TouchableOpacity
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  {
                    position: "absolute",
                    backgroundColor: theme.background,
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    bottom: 0,
                    right: 0,
                    zIndex: 10,
                  },
                ]}
                onPress={() => {
                  pickImage("avatar");
                }}
              >
                <Entypo name="camera" size={20} color={theme.foreground} />
              </TouchableOpacity>
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
                  onPress={() => {
                    router.push("/posts/New");
                  }}
                  style={[
                    styles.flexRow,
                    styles.flexCenter,
                    {
                      marginRight: 10,
                      backgroundColor: theme.foreground,
                      borderRadius: 4,
                    },
                  ]}
                >
                  <Entypo
                    name="plus"
                    size={24}
                    color={theme.background}
                    style={{ paddingLeft: 10 }}
                  />

                  <Button
                    text="Add A Post"
                    style={{
                      backgroundColor: theme.foreground,
                      paddingLeft: 10,
                      paddingRight: 15,
                      paddingVertical: 15,
                    }}
                    textStyles={{ color: theme.background }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.flexRow,
                    styles.flexCenter,
                    {
                      backgroundColor: theme.background,
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      marginRight: 5,
                    },
                  ]}
                  onPress={() => {
                    pickImage("cover");
                  }}
                >
                  <Entypo name="camera" size={20} color={theme.foreground} />
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
