import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput } from "../../components/Themed";
import PostCard, { Post } from "../../components/posts/PostCard";
import { useState, useContext, useEffect } from "react";
import Utils, { BodyRequestMethods } from "../../Utils";
import Config from "../../Config";
import MediaGallery from "../../components/MediaGallery";
import GlobalStyles from "../../GlobalStyles";
import { StyleSheet, Platform, TouchableOpacity } from "react-native";
import Avatar from "../../components/Avatar";
import { AuthContext } from "../_layout";
import { AppThemeContext } from "../../Theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CommentCard, { Comment } from "../../components/posts/CommentCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export enum CommentType {
  normal = "normal",
  reply = "reply",
}

type FullPost = Post & {
  comments: Comment[]; // Array of Comment
};

export default function SinglePostsAndCommentsScreen() {
  const [post, setPost] = useState<FullPost>();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { user, accessToken } = useContext(AuthContext);
  const [comment, setComment] = useState<string>();
  const { theme } = useContext(AppThemeContext);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    getPost();
  }, []);

  async function getPost() {
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/posts/${params.postId}`;
      const results = await Utils.makeGetRequest(URL);
      // console.log("get single post results: ", results.data);

      if (results.success) {
        setPost(results.data);
      } else {
        console.log("Error getting single post: ", results.message);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("network error getting single post: ", error);
    }
  }

  async function createComment() {
    if (loading) return;
    setLoading(true);
    try {
      console.log("commenting...");
      if (!comment || comment.trim() == "") {
        console.log("empty comment");
        setLoading(false);
        return;
      }
      const URL = `${Config.API_URL}/posts/comment`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { message: comment, postId: post?.id, type: CommentType.normal },
      });
      // console.log("create comment ", results);

      if (results.success) {
        setPost((prevValues: any) => {
          return {
            ...prevValues,
            comments: [...prevValues.comments, results.data],
          };
        });
        setComment(undefined);
      } else {
        console.log("Error getting single post: ", results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("network error getting single post: ", error);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        onKeyboardWillShow={(frames: any) => {
          setKeyboardHeight(frames.endCoordinates.height);
        }}
        onKeyboardWillHide={() => {
          setKeyboardHeight(0);
        }}
      >
        {post?.comments &&
          post.comments.length > 0 &&
          post.comments.map((comment, index) => {
            return <CommentCard key={index} comment={comment} />;
          })}
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.flexRow,
          {
            justifyContent: "space-between",
            borderTopWidth: 0.3,
            alignItems: "center",
            borderTopColor: theme.border,
            paddingHorizontal: 15,
            paddingVertical: 5,
            marginBottom: Platform.OS === "ios" ? keyboardHeight : 0,
          },
        ]}
      >
        <Avatar
          text={`${user?.firstName[0]}${user?.lastName[0]}`}
          imageSource={
            user?.profileAvatarId && accessToken
              ? `${Config.API_URL}/files?fid=${user.profileAvatarId}&t=${accessToken}`
              : undefined
          }
          textStyles={{ fontSize: 14 }}
          style={{ height: 40, width: 40 }}
        />
        <TextInput
          style={{
            marginHorizontal: 10,
            paddingHorizontal: 25,
            paddingVertical: 8,
            borderRadius: 15,
            borderWidth: 1,
            backgroundColor: theme.background,
            flex: 1,
          }}
          value={comment}
          onChangeText={(value) => {
            setComment(value);
          }}
        />
        <TouchableOpacity
          onPress={createComment}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <MaterialCommunityIcons
            name="send-circle"
            size={50}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
