import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, TextInput, View } from "../components/Themed";
import { useEffect, useState, useRef, useContext, SetStateAction } from "react";
import { useNavigation, useRouter } from "expo-router";
import { AppThemeContext } from "../Theme";
import { Chat, ChatTypes } from "./chats/ChatCard";
import GlobalStyles from "../GlobalStyles";
import { Platform } from "react-native";
import PostCard, { PostOwner } from "../components/posts/PostCard";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../Config";
import Utils, { BodyRequestMethods } from "../Utils";
import SearchUserCard from "./chats/searchUserCard";
import UserSelectCard from "./UserSelectCard";
import FolderCard from "./files/FolderCard";
import FileCard from "./files/FileCard";
import OrgCard from "./search/OrgCard";
import ClassCard from "./search/ClassCard";
import socket from "../Socket";
import SearchChatCard from "./chats/SearchChatCard";
import SelectSearchChatCard from "./search/SelectSearchChatCard";

export enum SearchTypes {
  users = "users",
  files = "files",
  folders = "folders",
  posts = "posts",
  classes = "classes",
  programmes = "programmes",
  schools = "schools",
  faculties = "faculties",
  chats = "chats",
}

export type Selection = {
  users: number[];
  chats: number[];
  folders: number[];
  files: number[];
  schools: number[];
  programmes: number[];
  classes: number[];
  posts: number[];
  faculties: number[];
};

export default function MultiSearch({
  mode = "select",
  searchTypes,
}: {
  mode: "select" | "search";
  searchTypes: SearchTypes[];
}) {
  const { theme } = useContext(AppThemeContext);
  const [chats, setChats] = useState<Chat[]>();
  const [users, setUsers] = useState<PostOwner[]>();
  const [folders, setFolders] = useState<any[]>();
  const [files, setFiles] = useState<any[]>();
  const [programmes, setProgrammes] = useState<any[]>();
  const [schools, setSchools] = useState<any[]>();
  const [classes, setClasses] = useState<any[]>();
  const [faculties, setFaculties] = useState<any[]>();
  const [posts, setposts] = useState<any[]>();
  const [groups, setGroups] = useState<any[]>();
  const [searchType, setSearchType] = useState<SearchTypes>();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [searchString, setSearchString] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [searchTypeItem, setSearchTypeItem] = useState<any>();
  const [searchTypesArray, setSearchTypesArray] = useState<any>();
  const [selectedSearch, setSelectedSearch] = useState<Selection>({
    users: [],
    chats: [],
    folders: [],
    files: [],
    posts: [],
    classes: [],
    schools: [],
    programmes: [],
    faculties: [],
  });
  const navigation = useNavigation();
  const dropdownRef = useRef<any>();
  useEffect(() => {
    restoreSearch();
    navigation.addListener("focus", () => {
      if (searchString || searchType) {
        onSearch();
      }
    });
    socket.on("resolve_chat_response", (data) => {
      if (data.origin !== "multi_search") {
        return;
      }
      console.log(
        "resolve chat response (multisearch pages): "
        // , data
      );

      if (Platform.select({ ios: true, android: true })) {
        router.push(`/chats/${data.chat.id}`);
      } else {
        router.push({
          pathname: `/(tabs)/ChatsTab`,
          params: { chatId: data.chat.id },
        });
      }

      setLoading(false);
    });

    socket.on("search_error", (data) => {
      if (data.origin !== "multi_search") {
        return;
      }
      console.log("search error: ", data.error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (dropdownRef.current && searchTypesArray) {
      dropdownRef.current?.selectIndex(0);
    }
  }, [searchTypesArray, dropdownRef]);

  useEffect(() => {
    if (searchType) {
      onSearch();
    }
  }, [searchType, searchString]);

  useEffect(() => {
    if (searchTypes.length < 1) {
      return;
    }

    const _searchTypesArray = searchTypes.map((searchType, index) => {
      return {
        id: index,
        title: searchType,
      };
    });

    setSearchTypesArray(_searchTypesArray);
    setSearchTypeItem(_searchTypesArray[0]);
    setSearchType(_searchTypesArray[0]?.title);
  }, [searchTypes]);

  async function onSearch() {
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/auth/user/search`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { searchString: searchString, items: [searchType] },
      });

      // console.log("Search results: ", results.data);

      if (results.success) {
        console.log("get search success");
        if (results.data?.users) {
          setUsers(results.data.users);
        }

        if (results.data?.files) {
          setFiles(results.data.files);
        }

        if (results.data?.folders) {
          setFolders(results.data.folders);
        }
        if (results?.data?.programmes) {
          setProgrammes(results.data.programmes);
        }

        if (results?.data?.schools) {
          setSchools(results.data.schools);
        }
        if (results?.data?.faculties) {
          setFaculties(results?.data?.faculties);
        }

        if (results?.data?.classes) {
          setClasses(results?.data?.classes);
        }
        if (results?.data?.posts) {
          setposts(results.data.posts);
        }

        if (results?.data?.chats) {
          setGroups(results?.data?.chats);
        }
      } else {
        console.log("error searching");
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error searching", error);
    }
  }

  async function restoreSearch() {
    const storedSearchString = await AsyncStorage.getItem("searchString");

    if (storedSearchString) {
      setSearchString(searchString);
    }

    const selectedSearch = await AsyncStorage.getItem("selectedSearch");

    console.log("restore selected search", selectedSearch);

    if (selectedSearch) {
      setSelectedSearch(JSON.parse(selectedSearch));
    }
  }

  function isUserSelected(id: number) {
    if (!selectedSearch || !selectedSearch.users) {
      return false;
    }
    for (let i = 0; i < selectedSearch.users.length; i++) {
      if (selectedSearch.users[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onUserSelect(user: PostOwner) {
    // console.log("selected user: ", user);
    if (mode === "search") {
      router.push({
        pathname: "/users/[userId]",
        params: { userId: user.id },
      });
      return;
    }

    setSelectedSearch((prevValues: any) => {
      let newValues = {
        ...prevValues,
      };

      if (!isUserSelected(user.id)) {
        newValues.users = [...prevValues.users, user.id];
      } else {
        newValues.users = prevValues.users.filter((id: number) => {
          return id !== user.id;
        });
      }
      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  function isFacultySelected(id: number): boolean {
    if (!selectedSearch.faculties) {
      return false;
    }
    for (let i = 0; i < selectedSearch.faculties.length; i++) {
      if (selectedSearch.faculties[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onFacultySelected(faculty: any) {
    if (mode === "search") {
      // socket.emit("");
      return;
    }

    setSelectedSearch((prevValues: any) => {
      // console.log("prevValues: ", prevValues);

      let newValues = {
        ...prevValues,
      };

      // console.log("newValues: ", newValues);

      if (!isFacultySelected(faculty.id)) {
        newValues.faculties = [...prevValues.faculties, faculty.id];
      } else {
        newValues.faculties = prevValues.faculties.filter((id: number) => {
          return id !== faculty.id;
        });
      }
      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  function isSchoolSelected(id: number): boolean {
    if (!selectedSearch || !selectedSearch.schools) {
      return false;
    }
    for (let i = 0; i < selectedSearch.schools.length; i++) {
      if (selectedSearch.schools[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onSchoolSelect(school: any) {
    if (mode === "search") {
      socket.emit("resolve_chat", {
        schoolId: school.id,
        origin: "multi_search",
      });
      return;
    }
    setSelectedSearch((prevValues: any) => {
      // console.log("prevValues: ", prevValues);

      let newValues = {
        ...prevValues,
      };

      // console.log("newValues: ", newValues);

      if (!isSchoolSelected(school.id)) {
        newValues.schools = [...prevValues.schools, school.id];
      } else {
        newValues.schools = prevValues.schools.filter((id: number) => {
          return id !== school.id;
        });
      }
      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  function isProgrammeSelected(id: number): boolean {
    if (!selectedSearch || !selectedSearch.programmes) {
      return false;
    }
    for (let i = 0; i < selectedSearch.programmes.length; i++) {
      if (selectedSearch.programmes[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onProgrammeSelect(programme: any) {
    if (mode === "search") {
      // socket.emit("");
      return;
    }
    setSelectedSearch((prevValues: any) => {
      // console.log("prevValues: ", prevValues);

      let newValues = {
        ...prevValues,
      };

      // console.log("newValues: ", newValues);

      if (!isProgrammeSelected(programme.id)) {
        newValues.programmes = [...prevValues.programmes, programme.id];
      } else {
        newValues.programmes = prevValues.programmes.filter((id: number) => {
          return id !== programme.id;
        });
      }
      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  function isClassSelected(id: number): boolean {
    if (!selectedSearch || !selectedSearch.classes) {
      return false;
    }
    for (let i = 0; i < selectedSearch.classes.length; i++) {
      if (selectedSearch.classes[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onClassSelect(_class: any) {
    setSelectedSearch((prevValues: any) => {
      // console.log("prevValues: ", prevValues)

      if (mode === "search") {
        socket.emit("resolve_chat", {
          classId: _class?.id,
          origin: "multi_search",
        });
        return;
      }

      let newValues = {
        ...prevValues,
      };

      // console.log("newValues: ", newValues);

      if (!isClassSelected(_class.id)) {
        newValues.classes = [...prevValues.classes, _class.id];
      } else {
        newValues.classes = prevValues.classes.filter((id: number) => {
          return id !== _class.id;
        });
      }
      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  function isGroupSelected(id: number): boolean {
    if (!selectedSearch || !selectedSearch.chats) {
      return false;
    }
    for (let i = 0; i < selectedSearch.chats.length; i++) {
      if (selectedSearch.chats[i] === id) {
        return true;
      }
    }
    return false;
  }

  async function onGroupSelect(group: Chat) {
    console.log("on select group: ", group);
    setSelectedSearch((prevValues: any) => {
      // console.log("prevValues: ", prevValues)

      if (mode === "search") {
        // socket.emit("");
        return;
      }

      let newValues = {
        ...prevValues,
      };

      console.log("newValues group: ", newValues);

      if (!isGroupSelected(group.id)) {
        newValues.chats = [...prevValues.chats, group.id];
      } else {
        newValues.chats = prevValues.chats.filter((id: number) => {
          return id !== group.id;
        });
      }

      AsyncStorage.setItem("selectedSearch", JSON.stringify(newValues));
      return newValues;
    });
  }

  return (
    <View style={[{ flex: 1 }]}>
      <View
        style={[
          styles.flexRow,
          styles.padding,
          {
            justifyContent: "space-between",
            alignItems: "center",
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
            // if (!value || value.trim().length < 1) {
            //   setSearchString(undefined);
            //   return;
            // }
            setSearchString(value);
          }}
          placeholder={`Search ${searchType}`}
        />
        <SelectDropdown
          ref={dropdownRef}
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
                size={14}
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
              width: 120,
              height: 35,
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
        // showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onSearch} />
        }
      >
        {users?.map((user, index) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {mode === "select" &&
                (searchType === SearchTypes.users ||
                  isUserSelected(user.id)) && (
                  <UserSelectCard
                    key={index}
                    user={user}
                    checked={isUserSelected(user.id)}
                    onToggleCheck={onUserSelect}
                  />
                )}

              {mode === "search" && searchType === SearchTypes.users && (
                <SearchUserCard
                  key={index}
                  user={user}
                  onSelect={onUserSelect}
                />
              )}
            </View>
          );
        })}
        {faculties?.map((faculty: any, index: number) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {(searchType === SearchTypes.faculties ||
                isFacultySelected(faculty.id)) && (
                <OrgCard
                  key={index}
                  item={faculty}
                  checked={isFacultySelected(faculty.id)}
                  onToggleCheck={() => onFacultySelected(faculty)}
                  mode={mode}
                />
              )}
            </View>
          );
        })}

        {schools?.map((school: any, index: number) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {(searchType === SearchTypes.schools ||
                isSchoolSelected(school.id)) && (
                <OrgCard
                  key={index}
                  item={school}
                  checked={isSchoolSelected(school.id)}
                  onToggleCheck={() => onSchoolSelect(school)}
                  mode={mode}
                />
              )}
            </View>
          );
        })}

        {classes?.map((_class: any, index: number) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {(searchType === SearchTypes.classes ||
                isClassSelected(_class.id)) && (
                <ClassCard
                  key={index}
                  item={_class}
                  checked={isClassSelected(_class.id)}
                  onToggleCheck={() => onClassSelect(_class)}
                  mode={mode}
                />
              )}
            </View>
          );
        })}

        {programmes?.map((programme: any, index: number) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {(searchType === SearchTypes.programmes ||
                isProgrammeSelected(programme.id)) && (
                <OrgCard
                  key={index}
                  item={programme}
                  checked={isProgrammeSelected(programme.id)}
                  onToggleCheck={() => onProgrammeSelect(programme)}
                  mode={mode}
                />
              )}
            </View>
          );
        })}

        {posts?.map((post: any, index: number) => {
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {searchType === SearchTypes.posts && (
                <PostCard
                  loading={loading}
                  setLoading={setLoading}
                  key={index}
                  post={post}
                />
              )}
            </View>
          );
        })}

        {groups?.map((group: Chat, index: number) => {
          // console.log("groups map: ", group);
          return (
            <View key={index} style={{ backgroundColor: "transparent" }}>
              {(searchType === SearchTypes.chats ||
                isGroupSelected(group.id)) && (
                <SelectSearchChatCard
                  item={group}
                  onToggleCheck={() => {
                    console.log("......group selected.....");
                    onGroupSelect(group);
                  }}
                  checked={isGroupSelected(group.id)}
                  mode={mode}
                />
              )}
            </View>
          );
        })}

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
          {searchType === SearchTypes.folders &&
            folders?.map((folder, index) => {
              return <FolderCard key={index} folder={folder} />;
            })}

          {searchType === SearchTypes.files &&
            files?.map((file, index) => {
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
      </KeyboardAwareScrollView>
      {mode == "select" && (
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={[
            styles.flexRow,
            styles.flexCenter,
            {
              width: 60,
              height: 60,
              backgroundColor: "transparent",

              borderRadius: 9999,
              position: "absolute",
              right: 10,
              bottom: keyboardHeight + 30,
            },
          ]}
        >
          <Ionicons
            name="checkmark-done-circle"
            size={60}
            color={theme.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
