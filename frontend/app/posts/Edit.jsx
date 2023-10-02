import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import {
  useEffect,
  useState,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRootNavigationState,
  useRouter,
} from "expo-router";
import { AuthContext } from "../_layout";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Utils from "../../Utils";
import Config from "../../Config";
import * as ImagePicker from "expo-image-picker";
import { Swipeable } from "react-native-gesture-handler";

import { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SelectDropdown from "react-native-select-dropdown";
import Button, { ButtonVariant } from "../../components/Button";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Avatar from "../../components/Avatar";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
const BackgroundImage = require("../../assets/images/background.png");
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import MediaGallery, {
  GalleryItem,
  WebMediaGallery,
} from "../../components/MediaGallery";

// export interface NewPost {
//   caption: string;
//   files: string[];
//   pollId?: number;
//   visibility: "public" | "friends" | "faculty" | "school";
// }

import * as DocumentPicker from "expo-document-picker";
import Modal, { ModalVariant } from "../../components/Modal";

export default function EditPostPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [post, setPost] = useState({});
  const [errors, setErrors] = useState({});
  const { theme } = useContext(AppThemeContext);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [files, setFiles] = useState([]);
  const { user, accessToken } = useContext(AuthContext);
  const navigation = useNavigation();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [Access, setAccess] = useState();

  const [modalText, setModalText] = useState("");
  const [modalVariant, setModalVariant] = useState(ModalVariant.confirmation);
  const [loadPostStorage, setLoadPostStorage] = useState(true);
  const [loadFilesStorage, setLoadFilesStorage] = useState(true);
  const [postId, setPostId] = useState();

  typeDropdownRef = useRef(null);
  visibilityDropdownRef = useRef(null);

  // AsyncStorage.removeItem("incomplete-post");
  // AsyncStorage.removeItem("incomplete-files");

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    confirmSharing();
    getPost();
    navigation.addListener("focus", () => {
      confirmSharing();
    });
  }, []);

  async function getPost() {
    console.log("getting post to edit..............");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/posts/${params.postId}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("get single post edit results: ", results.data);

      if (results.success) {
        setPostId(results.data.id);
        setPost({
          caption: results.data.caption,
          visibility: results.data.visibility,
          type: results.data.type,
        });
        setFiles(results.data.files);

        // console.log("from storage: ", "post: ", post);
        Utils.postTypes.map((type, index) => {
          // console.log("found type: ", type, "post.type: ", post.type);
          if (type.name === results.data.type) {
            typeDropdownRef.current.selectIndex(index);
          }
        });

        Utils.postVisibilities.map((visibility, index) => {
          // console.log(
          //   "found visibility: ",
          //   visibility,
          //   "post visibility: ",
          //   post.visibility
          // );
          if (visibility.name === results.data.visibility) {
            visibilityDropdownRef.current.selectIndex(index);
          }
        });

        // const _Access = {
        //   users: [],
        //   faculties: [],
        //   schools: [],
        //   programmes: [],
        //   chats: [],
        //   classes: [],
        // };
        // let hasAAccess = false;

        // Object.keys(_Access).map((key) => {
        //   results.data.Access[key].map((item) => {
        //     hasAAccess = true;
        //     _Access[key].push(item.id);
        //   });
        // });

        // if (hasAAccess) {
        //   setAccess(_Access);
        //   AsyncStorage.setItem("selectedSearch", JSON.stringify(_Access));
        // }
      } else {
        console.log("Error getting single post: ", results.message);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("network error getting single post: ", error);
    }
  }

  const onModalConfirm = () => {
    if (files[activeFileIndex].id) {
      deleteFile();
    } else {
      setFiles((prevValues) => {
        prevValues.splice(activeFileIndex, 1);
        AsyncStorage.setItem("incomplete-files", JSON.stringify(files));
        return prevValues;
      });
    }
  };

  const deleteFileConfirm = () => {
    setModalText("Are you sure you want to delete this file?");
    setShowModal(true);
    setModalVariant(ModalVariant.confirmation);
    setShowModal(true);
  };

  const deleteFile = async () => {
    console.log("deleted file.........");
    // console.log("index", activeFileIndex, "files: ", files);
    if (loading) return;
    setLoading(true);
    setModalText("");
    try {
      const URL = `${Config.API_URL}/files/${files[activeFileIndex].id}`;
      // console.log("delete file url: ", URL);
      const results = await Utils.makeDeleteRequest(URL);

      // console.log("delete file results: ", results);

      if (results.success) {
        setFiles((prevValues) => {
          prevValues.splice(activeFileIndex, 1);
          AsyncStorage.setItem("incomplete-files", JSON.stringify(files));
          return prevValues;
        });
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Network Error deleting file");
      setModalText("Network Error, Please check your internet");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
    }
  };

  useEffect(() => {
    console.log("post change: ", post);
    if (post && Object.keys(post).length > 0) {
      // console.log("post change: ", post);
      AsyncStorage.setItem("incomplete-post", JSON.stringify(post));
    } else {
      if (loadPostStorage) {
        setLoadPostStorage(false);
        loadPostFromStorage();
      }
    }
  }, [post]);

  useEffect(() => {
    console.log("files change: ", files);
    if (files.length > 0) {
      // console.log("files change: ", files);
      AsyncStorage.setItem("incomplete-files", JSON.stringify(files));
    } else {
      if (loadFilesStorage) {
        setLoadFilesStorage(false);
        loadFilesFromStorage();
      }
    }
  }, [files]);

  useEffect(() => {
    navigation.setOptions({
      title: "Edit Post",
      headerRight: () => {
        return (
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,
              { paddingRight: Platform.OS == "web" ? 10 : 0 },
            ]}
          >
            <Button
              onPress={onSubmit}
              text="Save"
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                marginVertical: "auto",
              }}
            />
          </View>
        );
      },
    });
  }, [post, files, Access, loading]);

  async function loadPostFromStorage() {
    try {
      let post = await AsyncStorage.getItem("incomplete-post");

      if (post) {
        // console.log("setting post", post);
        post = JSON.parse(post);
        setPost(post);

        // console.log("from storage: ", "post: ", post);
        Utils.postTypes.map((type, index) => {
          // console.log("found type: ", type, "post.type: ", post.type);
          if (type.name === post.type) {
            typeDropdownRef.current.selectIndex(index);
          }
        });

        Utils.postVisibilities.map((visibility, index) => {
          // console.log(
          //   "found visibility: ",
          //   visibility,
          //   "post visibility: ",
          //   post.visibility
          // );
          if (visibility.name === post.visibility) {
            visibilityDropdownRef.current.selectIndex(index);
          }
        });
      } else {
        console.log("setting default post");
        setPost({
          type: "social",
          visibility: "public",
          caption: "",
          files: [],
        });
      }
    } catch (error) {
      console.log(
        "Error restoring posts from storage in new post page: ",
        error
      );
    }
  }

  async function loadFilesFromStorage() {
    try {
      let files = await AsyncStorage.getItem("incomplete-files");

      if (files) {
        files = JSON.parse(files);
        if (files.length > 0) {
          setFiles(files);
        }
      }
      console.log("from storage: ", "files: ", files);
    } catch (error) {
      console.log(
        "Error restoring files from storage in new post page: ",
        error
      );
    }
  }

  const pickImage = async () => {
    try {
      setLoading(true);

      if (Platform.OS == "web") {
        const result = await DocumentPicker.getDocumentAsync({
          type: ",video/*,image/*",
          copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
        });

        console.log("result: ", result);

        const asset = {
          uri: result.uri,
          type: result.file.type.split("/")[0],
          file: result.file,
        };

        const attr = Utils.extractMimeTypeAndBase64(asset.uri);
        asset.mimeType = attr.mimeType;

        setFiles((prevValues) => {
          let sameFile = false;
          let i = 0;
          while (!sameFile && i < prevValues.length) {
            if (
              prevValues[i].name === result.file.name ||
              prevValues[i].uri === result.uri
            ) {
              sameFile = true;
            }
            i++;
          }

          if (sameFile) {
            return [...prevValues];
          } else {
            uploadFile(asset);
            return [...prevValues, asset];
          }
        });
        setLoading(false);
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        // allowsEditing: true,
        // aspect: [4, 3],
        quality: 1,
        // videoMaxDuration: 60,
      });

      if (result && result.assets) {
        const asset = {
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

        console.log(
          "picked asset: ",
          asset,
          "mime: ",
          asset.mimeType,
          "type: ",
          asset.type
        );

        setFiles((prevValues) => {
          const sameFile = false;
          let i = 0;
          while (!sameFile && i < prevValues.length) {
            if (prevValues[i].uri === asset.uri) {
              sameFile = true;
            }
            i++;
          }

          if (sameFile) {
            return [...prevValues];
          } else {
            uploadFile(asset);
            return [...prevValues, asset];
          }
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setModalText("Sorry Failed to pick media, Please try again. ");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      console.log("error picking media file: ", error);
    }
  };

  const uploadFile = async (file) => {
    console.log("........Upload file called.......");
    try {
      const URL = `${Config.API_URL}/files`;
      const formData = new FormData();

      if (Platform.OS == "web") {
        formData.append("file", file.file);
      } else {
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        });
      }

      const results = await Utils.makeFormDataRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: formData,
      });

      // console.log("Media file upload results: ", results);

      if (results.success) {
        setFiles((prevValues) => {
          const otherFiles = prevValues.filter((_file) => {
            return _file.name !== file.name;
          });

          return [
            ...otherFiles,
            {
              id: results.data.id,
              type: results.data.type,
              name: results.data.name,
            },
          ];
        });
      } else {
        console.log("Error uploading file: ", results.message);
        setErrors({
          global: results.message,
        });
      }
    } catch (error) {
      console.log("Netowork Error UPloading file: ", error);
      setErrors({
        global: error.message,
      });
    }
  };

  async function onSubmit() {
    // setErrors({});
    console.log("...post update submitting...", loading);
    if (loading) return;
    setLoading(true);

    console.log("...post submitting started loading...", post, files);

    if (!isInputValid()) {
      setLoading(false);
      console.log("input invalid");
      return;
    }

    if (files && files.length > 0) {
      files.map(async (file) => {
        if (!file.id) {
          await uploadFile(file);
        }
      });
    }

    try {
      let filesIds = files.map((file) => {
        return file.id;
      });
      const URL = `${Config.API_URL}/posts/${postId}`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: { ...post, files: filesIds },
      });

      console.log("update post results: ", results);
      if (results.success) {
        await AsyncStorage.removeItem("incomplete-post");
        await AsyncStorage.removeItem("incomplete-files");

        console.log("granting other access: ", Access);

        if (Access) {
          console.log(
            "------------------access calling function --------------"
          );
          share(results.data.id);
        } else {
          setPost({});
          setFiles([]);
          router.push({
            pathname: "/(tabs)",
          });
        }

        console.log("successful post");
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Sending Email: ", error);
    }
  }

  function isInputValid() {
    const theErrors = {};
    let hasErrors = false;
    if (!post.caption) {
      theErrors.caption = "Please accompany your post with a message";
      hasErrors = true;
    }

    if (files.length < 1) {
      theErrors.files = "Please accompany your post with at least an image";
      hasErrors = true;
    }

    setErrors(theErrors);

    return !hasErrors;
  }

  function selectForSharing() {
    router.setParams({ selectionId: `new_post` });
    router.push({
      pathname: "/select",
      params: { selectionId: `new_post` },
    });
  }

  async function confirmSharing() {
    // console.log("(new post)confirming share.....");
    const storedSelectionId = await AsyncStorage.getItem("selectionId");
    let selection = await AsyncStorage.getItem("selectedSearch");
    // console.log("selection id: ", storedSelectionId, "selection :", selection);

    if (selection && storedSelectionId === `new_post`) {
      console.log("confirmed share...");

      selection = JSON.parse(selection);

      let _Access = {};

      Object.keys(selection).map((item) => {
        if (selection[item].length > 0) {
          _Access[item] = selection[item];
        }
      });

      console.log("new access: ", _Access);

      if (Object.keys(_Access).length > 0) {
        setAccess(_Access);
      } else {
        setAccess(undefined);
        // AsyncStorage.removeItem("selectionId");
        AsyncStorage.removeItem("selectedSearch");
      }
    } else if (!storedSelectionId || !selection) {
      setAccess(undefined);
      // AsyncStorage.removeItem("selectionId");
      // AsyncStorage.removeItem("selectedSearch");
    }
  }

  async function share(postId) {
    console.log("(post) doing share.....", Access);
    try {
      const body = {
        items: {
          post: postId,
        },
        ...Access,
      };

      console.log("access body before send: ........", Access);

      const URL = `${Config.API_URL}/auth/users/share`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: body,
      });
      if (results.success) {
        setLoading(false);
        AsyncStorage.removeItem("selectedSearch");
        AsyncStorage.removeItem("selectionId");
        setPost({});
        setFiles([]);
        console.log("......................share suceeeded...............");
        router.push({
          pathname: "/(tabs)",
        });
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      AsyncStorage.removeItem("selectedSearch");
      AsyncStorage.removeItem("selectionId");
      setModalText(
        "A network error occured while trying to share, please check your network and try again"
      );
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      setLoading(false);
      console.log("error Sharing folder");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
        onConfirm={onModalConfirm}
      />
      {loading && <ActivityIndicator animating={loading} size={40} />}
      <KeyboardAwareScrollView
        style={{ flex: 1, marginBottom: keyboardHeight }}
        onKeyboardWillShow={(frames) => {
          if (Platform.OS == "ios") {
            setKeyboardHeight(frames.endCoordinates.height);
          }
        }}
        onKeyboardWillHide={(frames) => {
          setKeyboardHeight(0);
        }}
        // showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.flexRow,
            { justifyContent: "flex-start", padding: 20, paddingBottom: 0 },
          ]}
        >
          <Avatar
            text={user ? `${user.firstName[0]}${user.lastName[0]}` : ""}
            imageSource={
              user?.profileAvatarId
                ? `${Config.API_URL}/files?fid=${user.profileAvatarId}&t=${accessToken}`
                : undefined
            }
          />
          <View style={[styles.flexCols, { marginLeft: 10 }]}>
            <View
              style={[
                styles.flexRow,
                styles.flexCenter,
                {
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text
                style={{ paddingLeft: 5, fontSize: 20, fontWeight: "bold" }}
              >
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
            <View
              style={[
                styles.flexRow,
                {
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginTop: 5,
                  flexWrap: "wrap",
                },
              ]}
            >
              <SelectDropdown
                ref={typeDropdownRef}
                renderCustomizedRowChild={(item, index, isSelected) => {
                  return (
                    <View style={[styles.flexCols, { paddingHorizontal: 5 }]}>
                      <Text>{item.label}</Text>
                      <Text
                        style={[{ fontSize: 10, color: theme.foregroundMuted }]}
                      >
                        {item.description}
                      </Text>
                    </View>
                  );
                }}
                data={Utils.postTypes}
                defaultValue={post?.type || Utils.postTypes[0]}
                sele
                onSelect={(selectedItem, index) => {
                  // console.log("type selected: ", selectedItem);
                  setPost((prevValues) => {
                    return {
                      ...prevValues,
                      type: selectedItem.name,
                    };
                  });
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem.label;
                }}
                rowTextForSelection={(item, index) => {
                  return item.label;
                }}
                buttonStyle={[
                  {
                    backgroundColor: theme.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 5,
                    paddingHorizontal: 5,
                    width: 120,
                    height: 43,
                  },
                ]}
                renderDropdownIcon={() => {
                  return (
                    <FontAwesome
                      name="chevron-down"
                      size={16}
                      style={{ paddingRight: 5 }}
                      color={theme.primaryForeground}
                    />
                  );
                }}
                buttonTextStyle={[
                  {
                    color: theme.primaryForeground,
                    textTransform: "capitalize",
                    fontSize: 14,
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
                  },
                ]}
                dropdownStyle={{
                  backgroundColor: theme.background,
                  height: 250,
                  minWidth: 180,
                }}
              />
              <TouchableOpacity
                style={[
                  styles.flexRow,
                  styles.flexCenter,

                  {
                    marginLeft: 5,
                    backgroundColor: theme.backgroundMuted,
                    paddingLeft: 8,
                    paddingRight: 2,
                    // paddingVertical: 12,
                    borderRadius: 5,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-eye"
                  size={20}
                  color={theme.foreground}
                />
                <SelectDropdown
                  ref={visibilityDropdownRef}
                  renderCustomizedRowChild={(item, index, isSelected) => {
                    return (
                      <View style={[styles.flexCols, { paddingHorizontal: 5 }]}>
                        <Text>{item.label}</Text>
                        <Text
                          style={[
                            { fontSize: 12, color: theme.foregroundMuted },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                    );
                  }}
                  data={Utils.postVisibilities}
                  defaultValue={post?.visibility || Utils.postVisibilities[0]}
                  onSelect={(selectedItem, index) => {
                    console.log("visibility selected: ", selectedItem);
                    setPost((prevValues) => {
                      return {
                        ...prevValues,
                        visibility: selectedItem.name,
                      };
                    });
                  }}
                  buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem.label;
                  }}
                  rowTextForSelection={(item, index) => {
                    return item.label;
                  }}
                  buttonStyle={[
                    {
                      backgroundColor: theme.backgroundMuted,
                      // borderWidth: 1,
                      // borderColor: theme.border,
                      // borderRadius: 5,
                      paddingHorizontal: 5,
                      width: 90,
                      height: 45,
                    },
                  ]}
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
                  buttonTextStyle={[
                    {
                      color: theme.foreground,
                      textTransform: "capitalize",
                      fontSize: 14,
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
                    },
                  ]}
                  dropdownStyle={{
                    backgroundColor: theme.background,
                    height: 250,
                    minWidth: 150,
                  }}
                />
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  {
                    marginLeft: 5,
                    backgroundColor: theme.backgroundMuted,
                    paddingHorizontal: 10,
                    paddingVertical: 12,
                    borderRadius: 5,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="chart-box-plus-outline"
                  size={16}
                  color={theme.foreground}
                />
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  {
                    marginLeft: 5,
                    backgroundColor: Access
                      ? theme.accent
                      : theme.backgroundMuted,
                    paddingHorizontal: 10,
                    paddingVertical: 12,
                    borderRadius: 5,
                  },
                ]}
                onPress={() => {
                  selectForSharing();
                }}
              >
                {!Access && (
                  <AntDesign
                    name="addusergroup"
                    size={24}
                    color={theme.foreground}
                  />
                )}

                {Access && (
                  <Feather
                    name="user-check"
                    size={24}
                    color={theme.foreground}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.inputContainer, { paddingTop: 0, padding: 20 }]}>
          {errors.global && (
            <Text style={[styles.error, styles.errorBorder]}>
              {errors.global}
            </Text>
          )}
          {errors.caption && (
            <Text style={[styles.error, styles.errorBorder]}>
              {errors.caption}
            </Text>
          )}
          {errors.files && (
            <Text style={[styles.error, styles.errorBorder]}>
              {errors.files}
            </Text>
          )}
          <TextInput
            value={post.caption}
            multiline={true}
            // autoFocus={true}
            textAlignVertical="top"
            placeholder="What do you have in mind?"
            onChangeText={(text) => {
              setPost((prevValues) => {
                return {
                  ...prevValues,
                  caption: text && text.trim() !== "" ? text : undefined,
                };
              });
            }}
            cursorColor={theme.primary}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={theme.foregroundMuted}
            style={[
              styles.input,
              styles.paddingV,
              { height: 80, marginBottom: 10 },
            ]}
          />
        </View>
        <View
          style={{
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {files && files.length > 0 && (
            <TouchableOpacity
              style={{
                position: "absolute",
                backgroundColor: theme.background,
                top: 20,
                right: 20,
                zIndex: 1000,
                width: 40,
                height: 40,
                borderRadius: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                deleteFileConfirm();
              }}
            >
              <MaterialIcons
                name="delete-outline"
                color={theme.destructive}
                size={24}
              />
            </TouchableOpacity>
          )}
          {Platform.select({ native: true }) && files && files.length > 0 && (
            <MediaGallery
              items={files}
              setActiveIndex={setActiveFileIndex}
              activeIndex={activeFileIndex}
            />
          )}
          {Platform.select({ web: true, windows: true, macos: true }) &&
            files &&
            files.length > 0 && (
              <WebMediaGallery
                items={files}
                setActiveIndex={setActiveFileIndex}
                activeIndex={activeFileIndex}
              />
            )}
        </View>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.flexCols,
          styles.flexCenter,
          {
            width: "100%",
            position: "absolute",
            bottom: keyboardHeight + 50,
            backgroundColor: "transparent",
          },
        ]}
      >
        {files.length < 5 && (
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,
              {
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 5,
                backgroundColor: theme.backgroundMuted,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: theme.primary,
                opacity: 0.6,
                width: "80%",
                marginHorizontal: "auto",
              },
            ]}
          >
            <Entypo name="video" size={30} color={theme.foreground} />
            <TouchableOpacity
              style={[
                {
                  padding: 8,
                  marginHorizontal: 10,
                  borderRadius: 5,
                  backgroundColor: "transparent",
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: theme.primary,
                },
              ]}
              onPress={pickImage}
            >
              <AntDesign name="plus" size={30} color={theme.foreground} />
            </TouchableOpacity>

            <Entypo name="image-inverted" size={30} color={theme.foreground} />
          </View>
        )}
        <View
          style={[
            styles.flexRow,
            styles.flexCenter,
            {
              marginTop: 10,
              backgroundColor: "transparent",
            },
          ]}
        >
          {files &&
            files.length > 0 &&
            files.map((file, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: activeFileIndex == index ? 13 : 10,
                    height: activeFileIndex == index ? 13 : 10,
                    borderRadius: 9999,
                    backgroundColor:
                      activeFileIndex == index
                        ? theme.primary
                        : theme.background,
                    borderWidth: 1,
                    borderColor:
                      activeFileIndex === index
                        ? theme.background
                        : theme.foreground,
                    shadowColor:
                      activeFileIndex === index ? "black" : "transparent",
                    shadowOpacity: 0.4,
                    shadowOffset: { width: 0, height: 4 },
                    margin: 2,
                  }}
                ></View>
              );
            })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
