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
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import Utils, { BodyRequestMethods } from "../../Utils";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal, { ModalVariant } from "../Modal";
import Popover from "../Popover";

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

export type PostAccessCount = {
  schools: number;
  faculties: number;
  chats: number;
  programmes: number;
  users: number;
  classes: number;
};

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
  Access: { _count: PostAccessCount };
  reposters?: { id?: number }[];
};

export type CustomPostCardProps = {
  post: Post;
  loading: boolean;
  setLoading: any;
  onRefresh?: any;
  gallerySize?: number;
};

export type PostCardProps = ThemeProps & ViewProps & CustomPostCardProps;

export default function PostCard(props: PostCardProps) {
  const {
    style,
    lightColor,
    darkColor,
    post,
    loading,
    setLoading,
    onRefresh,
    gallerySize,
    ...otherProps
  } = props;
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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);

  // console.log("post: ", post);

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      SET_SCREEN_WIDTH(window.width);
    });
  }, []);

  useEffect(() => {
    hasLikedPost();
    setNoOfComments(post._count.comments);
    setNoOfLikes(post._count.likers);
    let _shares =
      post?.Access?._count?.faculties +
      post?.Access?._count?.users +
      post?.Access?._count?.programmes +
      post?.Access?._count?.chats +
      post?._count.reposters +
      post?._count.sharedTo;

    setNoOfShares(_shares);
    confirmSharing();
  }, [post]);

  const onModalConfirm = () => {
    deletePost();
  };

  const deletePostConfirm = () => {
    setModalText("Are you sure you want to delete this Post?");
    setShowModal(true);
    setModalVariant(ModalVariant.confirmation);
  };

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

  function selectForSharing() {
    router.setParams({ selectionId: `post_${post?.id}` });
    router.push({
      pathname: "/select",
      params: { selectionId: `post_${post?.id}` },
    });
  }

  async function confirmSharing() {
    // console.log("(post)confirming share.....");
    const storedSelectionId = await AsyncStorage.getItem("selectionId");
    let selection: any = await AsyncStorage.getItem("selectedSearch");

    // console.log("selections id: ", storedSelectionId, "selection: ", selection);
    if (selection && storedSelectionId === `post_${post?.id}`) {
      console.log("confirmed share...");
      setLoading(true);
      try {
        selection = JSON.parse(selection);

        if (!post.id) {
          return;
        }

        const body = {
          items: {
            post: post?.id,
          },
          users: selection.users,
          schools: selection.schools,
          classes: selection.classes,
          faculties: selection.faculties,
          programmes: selection.programmes,
          chats: selection.chats,
        };

        const URL = `${Config.API_URL}/auth/users/share`;

        const results = await Utils.makeBodyRequest({
          URL,
          method: BodyRequestMethods.PUT,
          body: body,
        });

        if (results.success) {
          if (onRefresh) {
            onRefresh();
          }
          setModalText("Successfully shared the post");
          setModalVariant(ModalVariant.success);
          setShowModal(true);
        } else {
          setModalText(results.message);
          setModalVariant(ModalVariant.danger);
          setShowModal(true);
        }
        setLoading(false);
        AsyncStorage.removeItem("selectedSearch");
        AsyncStorage.removeItem("selectionId");
      } catch (error) {
        AsyncStorage.removeItem("selectedSearch");
        AsyncStorage.removeItem("selectionId");
        setModalText(
          "A network error occured while trying to share, please check your network and try again"
        );
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
        setLoading(false);
        console.log("error Sharing file");
      }
    }
  }

  async function savePost() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/users/savepost/${post.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {},
      });

      if (results.success) {
        setModalText("Successfully saved the post");
        setModalVariant(ModalVariant.success);
        setShowModal(true);
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      console.log("network error saving post", error);
      setModalText(
        "A network error occured while trying to save the post, please check your network and try again"
      );
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      setLoading(false);
    }
  }

  async function rePost() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/users/repost/${post.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {},
      });

      if (results.success) {
        if (onRefresh) {
          onRefresh();
        }
        setModalText("Successfully Reposted the post");
        setModalVariant(ModalVariant.success);
        setShowModal(true);
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      console.log("network error saving post", error);
      setModalText(
        "A network error occured while trying to  repost the post, please check your network and try again"
      );
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      setLoading(false);
    }
  }

  async function deletePost() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/posts/${post.id}`;

      const results = await Utils.makeDeleteRequest(URL);

      if (results.success) {
        if (onRefresh) {
          onRefresh();
        }
        setModalText("Successfully deleted post");
        setModalVariant(ModalVariant.success);
        setShowModal(true);
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      console.log("network error saving post", error);
      setModalText(
        "A network error occured while trying to  delete the post, please check your network and try again"
      );
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        width: Platform.select({
          web: true,
          windows: true,
          macos: true,
        })
          ? gallerySize
            ? gallerySize
            : 500
          : "100%",
        margin: "auto",
      }}
    >
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
        onConfirm={onModalConfirm}
      />
      <View
        style={[
          styles.flexRow,
          {
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
            paddingBottom: 0,
          },
        ]}
      >
        <View
          style={[
            styles.flexRow,
            {
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 10,
              paddingHorizontal: 0,
              paddingBottom: 0,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/users/[userId]",
                params: { userId: post.owner.id },
              });
            }}
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
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <View
              style={[
                styles.flexRow,
                styles.flexCenter,

                {
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Text
                style={{
                  paddingLeft: 5,
                  paddingBottom: 2,
                  fontSize: 20,
                  fontWeight: "600",
                }}
              >
                {post.owner.staffProfileIfStaff?.title}
                {post.owner?.firstName} {post.owner?.lastName}
              </Text>

              {post?.reposters && post?.reposters?.[0]?.id === user?.id && (
                <View
                  style={[
                    styles.paddingH,
                    {
                      backgroundColor: theme.primary,
                      marginLeft: 10,
                      paddingVertical: 3,
                      borderRadius: 30,
                    },
                  ]}
                >
                  <Text
                    style={{ fontSize: 10, color: theme.primaryForeground }}
                  >
                    Reposted
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                paddingLeft: 5,
                color: theme.foregroundMuted,
              }}
            >
              {Utils.getTimeDifference(post.createdAt)}
            </Text>
          </View>
        </View>
        <Popover
          iconSize={23}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          variant="options"
          start="right"
          position="bottom"
        >
          <View style={{ backgroundColor: "transparent" }}>
            {post.ownerId === user?.id && (
              <TouchableOpacity
                style={[
                  styles.flexRow,
                  {
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingVertical: 3,
                  },
                ]}
                onPress={() => {
                  setIsOpen(false);
                  router.push({
                    pathname: "/posts/Edit",
                    params: {
                      postId: post.id,
                    },
                  });
                }}
              >
                <MaterialCommunityIcons
                  name="square-edit-outline"
                  size={24}
                  color={theme.foreground}
                />
                <Text style={{ paddingLeft: 10 }} selectable={false}>
                  Edit Post
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.flexRow,
                { justifyContent: "flex-start", alignItems: "center" },
              ]}
              onPress={() => {
                setIsOpen(false);
                rePost();
              }}
            >
              <MaterialIcons name="repeat" size={26} color={theme.foreground} />
              <Text selectable={false} style={{ paddingLeft: 10 }}>
                Re-post
              </Text>
            </TouchableOpacity>

            {post?.ownerId == user?.id && (
              <TouchableOpacity
                style={[
                  styles.flexRow,
                  { justifyContent: "flex-start", alignItems: "center" },
                ]}
                onPress={() => {
                  setIsOpen(false);
                  deletePostConfirm();
                }}
              >
                <MaterialIcons
                  name="delete"
                  size={26}
                  color={theme.foreground}
                />
                <Text selectable={false} style={{ paddingLeft: 10 }}>
                  Delete Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Popover>
      </View>
      <Text
        style={{
          paddingVertical: 10,
          paddingHorizontal: 10,
          zIndex: -10,
          fontSize: 16,
          lineHeight: 25,
          color: theme.foreground,
          textAlign: "justify",
        }}
      >
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

              marginHorizontal: 2,
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
            size={gallerySize}
          />
        )}
        {Platform.OS === "web" && (
          <WebMediaGallery
            items={post.files}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            size={gallerySize}
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
              <AntDesign name="heart" size={28} color={"#FE251B"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={likePost}
              style={[{ paddingHorizontal: 5 }]}
            >
              <AntDesign name="hearto" size={28} color={theme.foreground} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/posts/[postId]",
                params: { postId: post.id },
              })
            }
            style={[{ paddingHorizontal: 10 }]}
          >
            <Feather name="message-circle" size={30} color={theme.foreground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={selectForSharing}
            style={[{ paddingHorizontal: 5 }]}
          >
            <Feather name="send" size={28} color={theme.foreground} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={savePost} style={[{ paddingHorizontal: 5 }]}>
          <Ionicons name="bookmark" size={30} color={theme.foreground} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.flexRow,

          {
            paddingHorizontal: 10,

            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            borderBottomWidth: 0.6,
            borderBottomColor: theme.border,
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
          style={[
            styles.flexRow,
            {
              paddingHorizontal: 5,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {gallerySize && (
            <FontAwesome name="comments" size={16} color={theme.primary} />
          )}
          <Text
            selectable={false}
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {Utils.formatNumberWithSuffix(noOfComments)}
          </Text>
          {!gallerySize && (
            <Text
              selectable={false}
              style={{
                color: theme.foregroundMuted,
                fontSize: 16,
                fontWeight: "bold",
                paddingHorizontal: 2,
              }}
            >
              {noOfComments === 1 ? "Comment" : "Comments"}
            </Text>
          )}
        </TouchableOpacity>
        <View
          style={[
            styles.flexRow,
            {
              paddingHorizontal: 5,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {gallerySize && (
            <AntDesign name="heart" size={16} color={"#FE251B"} />
          )}
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 5,
            }}
          >
            {Utils.formatNumberWithSuffix(noOfLikes)}
          </Text>
          {!gallerySize && (
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
          )}
        </View>
        <View
          style={[
            styles.flexRow,
            {
              paddingHorizontal: 5,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {gallerySize && (
            <FontAwesome name="send" size={16} color={theme.primary} />
          )}
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 5,
            }}
          >
            {Utils.formatNumberWithSuffix(noOfShares)}
          </Text>
          {!gallerySize && (
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
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
