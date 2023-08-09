import { CommentType } from "../../app/posts/[postId]";
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
import { PostCounts, PostLiker, PostOwner } from "./PostCard";

export type CommentCounts = {
  likers: number;
  replies: number;
  comments: number;
};

export type Comment = {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  type: CommentType;
  commentor: PostOwner;
  likers: PostLiker[];
  commentId: number;
  _count: CommentCounts; // id of the comment being replied to if the current comment is a reply
};

export default function CommentCard({ comment }: { comment: Comment }) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [noOfReplies, setNoOfReplies] = useState<number>(0);
  const [noOfLikes, setNoOfLikes] = useState<number>(0);
  const router = useRouter();
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState(
    Dimensions.get("window").width
  );

  // console.log("in comment card: ", comment);

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      SET_SCREEN_WIDTH(window.width);
    });
  }, []);

  useEffect(() => {
    hasLikedComment();
    setNoOfReplies(comment._count.replies);
    setNoOfLikes(comment._count.likers);
  }, [comment]);

  const hasLikedComment = () => {
    // console.log("has liked: ", comment.likers, user.id);
    let _isLiked = false;
    comment.likers.map((liker) => {
      if (liker.id === user?.id) {
        // console.log("truing is like", comment.id, liker.id, user.id);
        _isLiked = true;
      }
    });

    // console.log("is liked outside loop: ", _isLiked);

    setIsLiked(_isLiked);
  };

  async function likeComment() {
    console.log("...liking comment...");
    // if (loading) return;
    // setLoading(true);
    setNoOfLikes((prevValue) => {
      return prevValue + 1;
    });
    setIsLiked(true);

    try {
      const URL = `${Config.API_URL}/posts/comments/${comment.id}/like`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: {},
      });
      //   console.log("like comment results: ", results);
      if (results.success) {
        setIsLiked(true);
        setNoOfReplies(results.data._count.comments);
        setNoOfLikes(results.data._count.likers);
      } else {
        setNoOfLikes((prevValue) => {
          return prevValue - 1;
        });

        setIsLiked(false);
        // console.log("Error liking comment: ", results.message);
      }
    } catch (error) {
      setIsLiked(false);
      setNoOfLikes((prevValue) => {
        return prevValue - 1;
      });

      console.log("Error liking comment: ", error);
    }
  }

  async function unlikeComment() {
    console.log("...unliking comment...");
    // if (loading) return;
    // setLoading(true);
    setNoOfLikes((prevValue) => {
      return prevValue - 1;
    });
    setIsLiked(false);

    try {
      const URL = `${Config.API_URL}/posts/comments/${comment.id}/unlike`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: {},
      });
      //   console.log("unlike comment results: ", results);
      if (results.success) {
        setIsLiked(false);
        setNoOfReplies(results.data._count.comments);
        setNoOfLikes(results.data._count.likers);
      } else {
        setNoOfLikes((prevValue) => {
          return prevValue + 1;
        });
        setIsLiked(true);
        // console.log("Error unliking comment: ", results.message);
      }
    } catch (error) {
      setNoOfLikes((prevValue) => {
        return prevValue + 1;
      });
      setIsLiked(true);

      console.log("Error unliking comment: ", error);
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
            comment?.commentor
              ? `${comment?.commentor?.firstName[0]}${comment?.commentor?.lastName[0]}`
              : ""
          }
          imageSource={
            comment.commentor?.profileAvatarId
              ? `${Config.API_URL}/files?fid=${comment.commentor.profileAvatarId}&t=${accessToken}`
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
              {comment?.commentor?.firstName} {comment?.commentor?.lastName}
            </Text>
            {isLiked && (
              <TouchableOpacity
                onPress={unlikeComment}
                style={[{ paddingHorizontal: 5 }]}
              >
                <AntDesign name="heart" size={20} color={"#FE251B"} />
              </TouchableOpacity>
            )}

            {!isLiked && (
              <TouchableOpacity
                onPress={likeComment}
                style={[{ paddingHorizontal: 5 }]}
              >
                <AntDesign name="hearto" size={20} color={theme.foreground} />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={{
              fontSize: 10,
              paddingLeft: 5,
              color: theme.foregroundMuted,
            }}
          >
            {Utils.getTimeDifference(comment.createdAt)}
          </Text>
        </View>
      </View>
      <Text style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
        {comment.message}
      </Text>

      <View
        style={[
          styles.flexRow,

          {
            paddingHorizontal: 10,
            paddingTop: 5,
            paddingBottom: 15,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "nowrap",
          },
        ]}
      >
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
        {/* <View style={[{ paddingHorizontal: 5 }, styles.flexRow]}>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfReplies}
          </Text>
          <Text
            style={{
              color: theme.foregroundMuted,
              fontSize: 16,
              fontWeight: "bold",
              paddingHorizontal: 2,
            }}
          >
            {noOfReplies === 1 ? "Reply" : "Replies"}
          </Text>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
