import GlobalStyles from "../../GlobalStyles";
import { View, Text, ViewProps, useThemeColor, TextProps } from "../Themed";
import { ThemeProps } from "../Themed";
import { useState, useContext, useEffect } from "react";
import { AppThemeContext } from "../../Theme";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { AuthContext } from "../../app/_layout";
import Avatar from "../Avatar";
import Config from "../../Config";
import MediaGallery, { GalleryItem, WebMediaGallery } from "../MediaGallery";
import { SimpleLineIcons } from "@expo/vector-icons";
import Utils, { BodyRequestMethods } from "../../Utils";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

export enum PostCardVariant {
  primary = "primary",
  secondary = "secondary",
  text = "text",
  outline = "outline",
}

export enum PostVisibility {
  public = "public",
  friends = "friends",
  faculty = "faculty",
  school = "school",
}

export enum PostTypes {
  social = "social",
  event = "event",
  sellable = "sellable",
  poll = "poll",
}
export enum FileVisibility {
  public = "public",
  private = "private",
  protected = "protected",
}

export type PostLiker = {
  id: number;
};

export type PostCounts = {
  files: number;
  reposters: number;
  likers: number;
  sharedTo: number;
  taggedUsers: number;
  Message: number;
  savedBy: number;
  comments: number;
};

export type File = {
  id: number;
  name: string;
  type: string;
  path: string;
  ownerId: 23;
  visibility: FileVisibility;
  noOfRequests: number;
  createdAt: string;
  updatedAt: string;
  postId: number;
  folderId: number;
};

export type PostOwner = {
  id: number;
  firstName: string;
  lastName: string;
  profileAvatarId?: string;
  staffProfileIfStaff?: { title: string };
  studentProfileIfStudent?: { registrationNumber: string };
  bio?: string;
};

export type Post = {
  id: number;
  caption: string;
  ownerId: number;
  noOfRequests: number;
  createdAt: string;
  updatedAt: string;
  type: PostTypes;
  pollId: number;
  visibility: PostVisibility;
  files: GalleryItem[];
  owner: PostOwner;
  _count: PostCounts;
  likers: PostLiker[];
};

export type CustomPostCardProps = {
  post: Post;
};

export type PostCardProps = ThemeProps & ViewProps & CustomPostCardProps;

export default function PostCard(props: PostCardProps) {
  const { style, lightColor, darkColor, post, ...otherProps } = props;
  const { theme } = useContext(AppThemeContext);

  const { user, accessToken } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [noOfComments, setNoOfComments] = useState<number>(0);
  const [noOfLikes, setNoOfLikes] = useState<number>(0);
  const [noOfShares, setNoOfShares] = useState<number>(0);
  const router = useRouter();

  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      SET_SCREEN_WIDTH(window.width);
    });
  }, []);

  useEffect(() => {
    hasLikedPost();
    setNoOfComments(post._count.comments);
    setNoOfLikes(post._count.likers);
    setNoOfShares(post._count.sharedTo);
  }, [post]);

  const hasLikedPost = () => {
    // console.log("has liked: ", post.likers, user.id);
    post.likers.map((liker) => {
      if (liker.id === user?.id) {
        // console.log("truing is like", post.id);
        setIsLiked(true);
        return;
      } else {
        // console.log("falsingis like", post.id);

        setIsLiked(false);
      }
    });
  };

  async function likePost() {
    console.log("...liking post...");
    // if (loading) return;
    // setLoading(true);
    setNoOfLikes((prevValue) => {
      return prevValue + 1;
    });
    setIsLiked(true);

    try {
      const URL = `${Config.API_URL}/posts/${post.id}/like`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: {},
      });
      // console.log("like post results: ", results);
      if (results.success) {
        setIsLiked(true);
        setNoOfComments(results.data._count.comments);
        setNoOfLikes(results.data._count.likers);
        setNoOfShares(results.data._count.sharedTo);
      } else {
        setNoOfLikes((prevValue) => {
          return prevValue - 1;
        });
        setIsLiked(false);
        // console.log("Error liking post: ", results.message);
      }
    } catch (error) {
      setIsLiked(false);
      setNoOfLikes((prevValue) => {
        return prevValue - 1;
      });

      console.log("Error liking post: ", error);
    }
  }

  async function unlikePost() {
    console.log("...unliking post...");
    // if (loading) return;
    // setLoading(true);
    setNoOfLikes((prevValue) => {
      return prevValue - 1;
    });
    setIsLiked(false);

    try {
      const URL = `${Config.API_URL}/posts/${post.id}/unlike`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: {},
      });
      // console.log("get post results: ", results);
      if (results.success) {
        setIsLiked(false);
        setNoOfComments(results.data._count.comments);
        setNoOfLikes(results.data._count.likers);
        setNoOfShares(results.data._count.sharedTo);
      } else {
        setNoOfLikes((prevValue) => {
          return prevValue + 1;
        });
        setIsLiked(true);
        // console.log("Error unliking post: ", results.message);
      }
    } catch (error) {
      setNoOfLikes((prevValue) => {
        return prevValue + 1;
      });
      setIsLiked(true);

      console.log("Error unliking post: ", error);
    }
  }

  return (
    <View>
      <View
        style={[
          styles.flexRow,
          { justifyContent: "flex-start", padding: 10, paddingBottom: 0 },
        ]}
      >
        <Avatar
          text={
            post?.owner
              ? `${post?.owner?.firstName[0]}${post?.owner?.lastName[0]}`
              : ""
          }
          imageSource={
            post.owner?.profileAvatarId
              ? `${Config.API_URL}/files?fid=${post.owner.profileAvatarId}&t=${accessToken}`
              : undefined
          }
          style={{ width: 40, height: 40 }}
          textStyles={{ fontSize: 12 }}
        />

        <View style={{ marginLeft: 10 }}>
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,

              {
                justifyContent: "space-between",
                width: SCREEN_WIDTH - 100,
              },
            ]}
          >
            <Text
              style={{
                paddingLeft: 5,
                paddingBottom: 2,
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              {post.owner?.firstName} {post.owner?.lastName}
            </Text>
            <SimpleLineIcons
              name="options"
              size={16}
              color={theme.foreground}
            />
          </View>
          <Text
            style={{
              fontSize: 10,
              paddingLeft: 5,
              color: theme.foregroundMuted,
            }}
          >
            {Utils.getTimeDifference(post.createdAt)}
          </Text>
        </View>
      </View>
      <Text style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
        {post.caption}
      </Text>
      {post.files.length > 1 && (
        <View
          style={[
            styles.flexRow,
            {
              paddingHorizontal: 10,
              justifyContent: "flex-end",
              backgroundColor: "transparent",
              position: "relative",
              top: 50,
              zIndex: 100,
            },
          ]}
        >
          <View
            style={{
              width: 38,
              height: 25,
              borderRadius: 9999,
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,

              margin: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>
              {activeIndex + 1} / {post.files.length}
            </Text>
          </View>
        </View>
      )}
      <View style={{ overflow: "hidden" }}>
        {Platform.OS !== "web" && (
          <MediaGallery
            items={post.files}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        )}
        {Platform.OS === "web" && (
          <WebMediaGallery
            items={post.files}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        )}
      </View>
      {post.files.length > 1 && (
        <View
          style={[
            styles.flexRow,
            styles.flexCenter,
            {
              backgroundColor: "transparent",
              position: "relative",

              top: -30,
            },
          ]}
        >
          {post.files &&
            post.files.length > 0 &&
            post.files.map((file, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: activeIndex == index ? 13 : 10,
                    height: activeIndex == index ? 13 : 10,
                    borderRadius: 9999,
                    backgroundColor:
                      activeIndex == index ? theme.primary : theme.background,
                    borderWidth: 1,
                    borderColor:
                      activeIndex === index
                        ? theme.background
                        : theme.foreground,
                    shadowColor:
                      activeIndex === index ? "black" : "transparent",
                    shadowOpacity: 0.4,
                    shadowOffset: { width: 0, height: 4 },
                    margin: 2,
                  }}
                ></View>
              );
            })}
        </View>
      )}
      <View
        style={[
          styles.flexRow,

          {
            paddingTop: post.files.length > 1 ? 0 : 10,
            paddingBottom: 10,
            paddingHorizontal: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            alignItems: "center",
            borderBottomWidth: 0.8,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.flexRow,

            {
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "nowrap",
            },
          ]}
        >
          {isLiked ? (
            <TouchableOpacity
              onPress={unlikePost}
              style={[{ paddingHorizontal: 5 }]}
            >
              <AntDesign name="heart" size={26} color={"#FE251B"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={likePost}
              style={[{ paddingHorizontal: 5 }]}
            >
              <AntDesign name="hearto" size={25} color={theme.foreground} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/posts/[postId]",
                params: { postId: post.id },
              })
            }
            style={[{ paddingHorizontal: 5 }]}
          >
            <Feather name="message-circle" size={26} color={theme.foreground} />
          </TouchableOpacity>

          <TouchableOpacity style={[{ paddingHorizontal: 5 }]}>
            <Feather name="send" size={24} color={theme.foreground} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[{ paddingHorizontal: 5 }]}>
          <Ionicons name="bookmark" size={26} color={theme.foreground} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.flexRow,

          {
            paddingHorizontal: 10,
            paddingTop: 5,
            paddingBottom: 15,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "nowrap",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/posts/[postId]",
              params: { postId: post.id },
            })
          }
          style={[{ paddingHorizontal: 5 }, styles.flexRow]}
        >
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfComments}
          </Text>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfComments === 1 ? "Comment" : "Comments"}
          </Text>
        </TouchableOpacity>
        <View style={[{ paddingHorizontal: 5 }, styles.flexRow]}>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfLikes}
          </Text>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfLikes === 1 ? "Heart" : "Hearts"}
          </Text>
        </View>
        <View style={[{ paddingHorizontal: 5 }, styles.flexRow]}>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfShares}
          </Text>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfShares === 1 ? "Share" : "Shares"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
