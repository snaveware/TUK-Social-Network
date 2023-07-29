import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useState, useContext, useLayoutEffect } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [post, setPost] = useState({
    caption: "",
    visibility: "public",
    files: [],
  });
  const [errors, setErrors] = useState({});
  const { theme } = useContext(AppThemeContext);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [files, setFiles] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    console.log("files change: ", files);
  }, [files]);

  const pickImage = async () => {
    if (Platform.OS == "web") {
      const result = await DocumentPicker.getDocumentAsync({
        type: ",video/*,image/*",
        copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
      });

      const asset = {
        uri: result.uri,
        type: result.file.type.split("/")[0],
        file: result.file,
      };

      const attr = Utils.extractMimeTypeAndBase64(asset.uri);
      asset.mimeType = attr.mimeType;

      setFiles((prevValues) => {
        const sameFile = false;
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
          return prevValues;
        } else {
          uploadFile(asset);
          return [...prevValues, asset];
        }
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: 60,
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
          return prevValues;
        } else {
          uploadFile(asset);
          return [...prevValues, asset];
        }
      });
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
          type: file.mimetype,
        });
      }

      const results = await Utils.makeFormDataRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: formData,
      });

      console.log("Media file upload results: ", results);

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
      }
    } catch (error) {
      console.log("Netowork Error UPloading file: ", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "New Post",
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
              text="Post"
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
  }, []);

  async function onSubmit() {
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      const URL = `${Config.API_URL}/posts`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { ...post },
      });
      console.log("create post results: ", results);
      if (results.success) {
        // router.push({
        //   pathname: "/(tabs)",
        // });
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
    // if (!email || email.trim() === "") {
    //   theErrors.email = "Email is Required";
    //   hasErrors = true;
    // }

    setErrors(theErrors);

    return !hasErrors;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAwareScrollView>
        <View
          style={[
            styles.flexRow,
            { justifyContent: "flex-start", padding: 20, paddingBottom: 0 },
          ]}
        >
          <Avatar
            text="JB"
            imageSource="https://www.snaveware.com/evans-profile.png"
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
                Evans Munene
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
                defaultValue={Utils.postTypes[0]}
                onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index);
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
                    height: 42,
                  },
                ]}
                renderDropdownIcon={() => {
                  return (
                    <FontAwesome
                      name="chevron-down"
                      size={12}
                      style={{ paddingRight: 5 }}
                      color={theme.primaryForeground}
                    />
                  );
                }}
                buttonTextStyle={[
                  {
                    color: theme.primaryForeground,
                    textTransform: "capitalize",
                    fontSize: 12,
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
                  size={16}
                  color={theme.foreground}
                />
                <SelectDropdown
                  renderCustomizedRowChild={(item, index, isSelected) => {
                    return (
                      <View style={[styles.flexCols, { paddingHorizontal: 5 }]}>
                        <Text>{item.label}</Text>
                        <Text
                          style={[
                            { fontSize: 10, color: theme.foregroundMuted },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                    );
                  }}
                  data={Utils.postVisibilities}
                  defaultValue={Utils.postVisibilities[0]}
                  onSelect={(selectedItem, index) => {
                    console.log(selectedItem, index);
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
                      width: 80,
                      height: 42,
                    },
                  ]}
                  renderDropdownIcon={() => {
                    return (
                      <FontAwesome
                        name="chevron-down"
                        size={12}
                        style={{ paddingRight: 5 }}
                        color={theme.foreground}
                      />
                    );
                  }}
                  buttonTextStyle={[
                    {
                      color: theme.foreground,
                      textTransform: "capitalize",
                      fontSize: 10,
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

              <TouchableOpacity
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
          <Text style={styles.error}>{errors.caption}</Text>
          <TextInput
            value={post.caption}
            multiline={true}
            // autoFocus={true}
            textAlignVertical="top"
            placeholder="What do you have in mind?"
            onChangeText={(value) => {
              setPost((prevValuest) => {
                return {
                  ...prevValues,
                  caption: value,
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
          }}
        >
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
            bottom: 50,
            backgroundColor: "transparent",
          },
        ]}
      >
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
