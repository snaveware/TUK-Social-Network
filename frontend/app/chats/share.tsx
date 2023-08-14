import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useContext, useState } from "react";
import socket from "../../Socket";
import { Chat } from "../../components/chats/ChatCard";
import { PostOwner } from "../../components/posts/PostCard";
import { Message } from "./[chatId]";
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

export default function ChatsShareScreen() {
  const params = useLocalSearchParams();
  const [chats, setChats] = useState<Chat[]>();
  const [users, setUsers] = useState<PostOwner[]>();
  const [messages, setMessages] = useState<Message[]>();
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.all);
  const { theme } = useContext(AppThemeContext);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [searchString, setSearchString] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const searchTypesArray = [
    {
      id: 1,
      title: SearchTypes.all,
    },
    {
      id: 2,
      title: SearchTypes.chats,
    },
    {
      id: 3,
      title: SearchTypes.users,
    },
  ];

  const [searchTypeItem, setSearchTypeItem] = useState<any>(
    searchTypesArray[0]
  );

  //   console.log("share message: ", params?.shareMessage);

  useEffect(() => {
    socket.on("search_chats_results", (data) => {
      console.log("---search chats results--- ", data.chats?.length);
      setChats(data.chats);
      setLoading(false);
    });

    socket.on("search_users_results", (data) => {
      console.log("---search users results--- ", data.users?.length);
      setUsers(data.users);
      setLoading(false);
    });

    socket.on("resolve_chat_response", (data) => {
      console.log("resolve chat response: ", data);

      if (Platform.select({ ios: true, android: true })) {
        router.back();
        router.push({
          pathname: `/chats/${data.chat.id}`,
          params: {
            shareMessage: params.shareMessage,
            targetChatId: data.chat.id,
          },
        });
      } else {
        router.push({
          pathname: `/(tabs)/ChatsTab`,
          params: {
            shareMessage: params.shareMessage,
            targetChatId: data.chat.id,
            chatId: data.chat.id,
          },
        });
      }

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
    console.log("searching: ", searchType, searchString);
    if (searchType === SearchTypes.all) {
      socket.emit("search_chats", { searchString });
      socket.emit("search_users", { searchString });
    } else if (searchType === SearchTypes.chats) {
      socket.emit("search_chats", { searchString });
    } else if (searchType === SearchTypes.users) {
      socket.emit("search_users", { searchString });
    }
  }

  function onUserSelect(user: PostOwner) {
    socket.emit("resolve_chat", { otherUserId: user?.id });
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
            // console.log("new search string: ", value);
            setSearchString(value);
          }}
          placeholder={
            searchType == SearchTypes.all
              ? "Search Chats, Users, or Messages"
              : `Search ${searchType}`
          }
        />
        <SelectDropdown
          data={searchTypesArray}
          defaultValue={searchTypeItem}
          onSelect={(selectedItem, index) => {
            // console.log("selected search type: ", selectedItem);
            setSearchTypeItem(selectedItem);
            setSearchType(selectedItem.title);
          }}
          renderDropdownIcon={() => {
            return (
              <FontAwesome
                name="chevron-down"
                size={16}
                style={{ paddingRight: 5 }}
                color={theme.foreground}
              />
            );
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.title;
          }}
          rowTextForSelection={(item, index) => {
            return item.title;
          }}
          buttonStyle={[
            {
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 5,
              width: 100,
              height: 38,
              marginTop: 5,
            },
          ]}
          buttonTextStyle={[
            {
              color: theme.foreground,
              textTransform: "capitalize",
              textAlign: "left",
            },
          ]}
          rowStyle={{
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderBottomColor: theme.border,
          }}
          rowTextStyle={[
            {
              color: theme.foreground,
              textTransform: "capitalize",
              textAlign: "left",
              paddingVertical: 3,
            },
          ]}
          dropdownStyle={{
            backgroundColor: theme.background,
          }}
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
        <SearchChatsList chats={chats} />
        <SearchusersList onSelect={onUserSelect} users={users} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
