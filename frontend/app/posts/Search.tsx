import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useContext, useState } from "react";
import socket from "../../Socket";
import { Chat } from "../../components/chats/ChatCard";
import { PostOwner } from "../../components/posts/PostCard";
import SearchChatsList from "../../components/chats/SearchChatsList";
import GlobalStyles from "../../GlobalStyles";
import { AppThemeContext } from "../../Theme";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SearchusersList from "../../components/chats/searchUsersList";
import SearchMessagesList from "../../components/chats/SearchMessagesList";
import Utils, { BodyRequestMethods } from "../../Utils";
import Config from "../../Config";
import { useLocalSearchParams, useRouter } from "expo-router";

export enum SearchTypes {
  all = "all",
  chats = "chats",
  users = "users",
  messages = "messages",
}

export default function PostsSearchScreen() {
  const [users, setUsers] = useState<PostOwner[]>();
  const { theme } = useContext(AppThemeContext);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [searchString, setSearchString] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    socket.on("search_users_results", (data) => {
      console.log("---search users results--- ", data.users?.length);
      setUsers(data.users);
      setLoading(false);
    });

    socket.on("search_error", (error) => {
      console.log("search error: ", error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    search();
  }, [searchString]);

  function search() {
    console.log("searching: ", searchString);
    socket.emit("search_users", { searchString });
  }

  function onUserSelect(user: PostOwner) {
    router.back();
    router.push({
      pathname: "/users/[userId]",
      params: { userId: user.id },
    });
  }

  return (
    <View style={{ flex: 1 }}>
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
          },
        ]}
      >
        <TextInput
          style={[
            {
              marginHorizontal: 5,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 15,
              borderWidth: 1,
              backgroundColor: theme.background,
              flex: 1,
            },
          ]}
          value={searchString}
          onChangeText={(value) => {
            setSearchString(value);
          }}
          placeholder={"search users"}
        />
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1, marginBottom: keyboardHeight }}
        onKeyboardWillShow={(frames: any) => {
          if (Platform.OS == "ios") {
            setKeyboardHeight(frames.endCoordinates.height);
          }
        }}
        onKeyboardWillHide={(frames) => {
          setKeyboardHeight(0);
        }}
      >
        <SearchusersList onSelect={onUserSelect} users={users} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
