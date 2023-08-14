import { FlatList, StyleSheet } from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import Button, { ButtonVariant } from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext, Titles, User } from "../_layout";
import { Image } from "react-native";
import Avatar from "../../components/Avatar";
import Config from "../../Config";
import { AppThemeContext } from "../../Theme";
const Background = require("../../assets/images/background.png");
import { Entypo } from "@expo/vector-icons";
import GlobalStyles from "../../GlobalStyles";
import Utils, { BodyRequestMethods } from "../../Utils";
import { TouchableOpacity, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import uploadFile, { extractAsset } from "../../uploadFile";
import * as DocumentPicker from "expo-document-picker";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome } from "@expo/vector-icons";

export type profileInput = {
  firstName?: string;
  lastName?: string;
  title?: Titles;
  position?: string;
  bio?: string;
  profileAvatarId?: string;
  coverImageId?: string;
};

export default function SettingsTabScreen() {
  const router = useRouter();
  const { user, setIsLoggedIn, setUser, accessToken } = useContext(AuthContext);
  console.log("user: ", user, "access", accessToken);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useContext(AppThemeContext);
  const navigation = useNavigation();
  const [profileAvatarImageSource, setProfileAvatarImageSource] =
    useState<string>();
  const [coverImageSource, setCoverImageSource] = useState<string>();

  const [profile, setProfile] = useState<profileInput>({});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [errors, setErrors] = useState<any>({});
  const dropDownRef = useRef<SelectDropdown>(null);

  const titles = [
    {
      id: "1",
      title: Titles.Mr,
    },
    {
      id: "2",
      title: Titles.Mrs,
    },
    {
      id: "3",
      title: Titles.Dr,
    },
    {
      id: "4",
      title: Titles.Prof,
    },
    {
      id: "5",
      title: Titles.Ms,
    },
  ];

  useEffect(() => {
    // getUser();
  }, []);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        title: "Edit Profile",

        headerRight: () => {
          return (
            <View
              style={[styles.flexRow, styles.flexCenter, { paddingRight: 10 }]}
            >
              <Button
                onPress={updateProfile}
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
    } else {
      console.log("-----no navigation-------");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      setProfileAvatarImageSource(
        user?.profileAvatarId && accessToken
          ? `${Config.API_URL}/files?fid=${user?.profileAvatarId}&t=${accessToken}`
          : undefined
      );

      setCoverImageSource(
        user?.coverImageId && accessToken
          ? `${Config.API_URL}/files?fid=${user?.coverImageId}&t=${accessToken}`
          : undefined
      );

      setProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        bio: user?.bio,
        title: user?.staffProfileIfIsStaff?.title,
        position: user?.staffProfileIfIsStaff?.position,
      });

      titles &&
        titles.map((title, index) => {
          if (user?.staffProfileIfIsStaff?.title === title.title) {
            dropDownRef.current?.selectIndex(index);
          }
        });
    }
  }, [user]);

  function onLogout() {
    AsyncStorage.removeItem("user");
    AsyncStorage.removeItem("acessToken");
    AsyncStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth/LoginEmail");
  }

  async function clearCache() {
    const user = await AsyncStorage.getItem("user");
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    await AsyncStorage.clear();

    if (user && accessToken && refreshToken) {
      AsyncStorage.setItem("user", user);
      AsyncStorage.setItem("accessToken", accessToken);
      AsyncStorage.setItem("refreshToken", refreshToken);
    } else {
      setIsLoggedIn(false);
      setUser(null);
      router.push("/auth/LoginEmail");
    }
  }

  async function getUser() {
    console.log("...getting user?...");
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/user/${user?.id}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("get user results: ", results);
      if (results.success) {
        if (results.data) {
          setUser(results.data);
          AsyncStorage.setItem("user", JSON.stringify(results.data));
        }
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
          setProfile((prevValues: profileInput) => {
            return {
              ...prevValues,
              profileAvatarId: uploaded.id,
            };
          });
        } else if (purpose === "cover") {
          setProfile((prevValues: profileInput) => {
            return {
              ...prevValues,
              coverImageId: uploaded.id,
            };
          });
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
          setProfile((prevValues: profileInput) => {
            return {
              ...prevValues,
              profileAvatarId: uploaded.id,
            };
          });
        } else if (purpose === "cover") {
          setProfile((prevValues: profileInput) => {
            return {
              ...prevValues,
              coverImageId: uploaded.id,
            };
          });
        }
      }
    }
  }

  async function updateProfile() {
    console.log("...update profile...");
    if (loading) return;
    setLoading(true);
    try {
      if (profile && Object.keys(profile).length < 1) {
        setLoading(false);
        return;
      } else if (profile.bio && profile.bio.length > 256) {
        setErrorMessage("Bio must be utmost 256 characters");
        setLoading(false);
        return;
      } else if (profile.firstName && profile.firstName?.length > 30) {
        setErrorMessage("First Name must be less than 30 characters");
        setLoading(false);
        return;
      } else if (profile.lastName && profile.lastName?.length > 30) {
        setErrorMessage("Last Name must be less than 30 characters");
        setLoading(false);
        return;
      }

      const URL = `${Config.API_URL}/auth/user/${user?.id}`;

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: profile,
      });
      console.log("update profile results: ", results);

      if (results.success) {
        if (results.data) {
          setUser(results.data);
          AsyncStorage.setItem("user", JSON.stringify(results.data));
        }

        router.push("/(tabs)/AccountTab");
        console.log("successful profile update user");
      } else {
        setError(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Your are not connected to the internet");
      console.log("Error update profile: ", error);
    }
  }

  if (!user?.firstName) {
    getUser();
    return (
      <View style={[styles.padding, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
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
            style={[{ height: 250, width: "100%" }]}
            resizeMode="cover"
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
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
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
                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            {
              position: "relative",
              top: -60,
              padding: Platform.select({ ios: true, android: true }) ? 20 : 50,
            },
          ]}
        >
          {errorMessage && (
            <Text style={[styles.error, styles.errorBorder]}>
              {errorMessage}
            </Text>
          )}

          {user?.staffProfileIfIsStaff?.title && (
            <View>
              <SelectDropdown
                ref={dropDownRef}
                data={titles}
                onSelect={(selectedItem, index) => {
                  setProfile((prevValues: profileInput) => {
                    return {
                      ...prevValues,
                      title: selectedItem.title || undefined,
                    };
                  });
                }}
                renderDropdownIcon={() => {
                  return (
                    <FontAwesome
                      name="chevron-down"
                      size={20}
                      style={{ paddingRight: 5 }}
                      color={theme.foreground}
                    />
                  );
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  console.log("selected title: ", selectedItem);
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
                    width: "100%",
                    maxWidth: "100%",
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
                defaultButtonText="Select Your Title"
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

              <Text style={styles.error}>{errors.title}</Text>
            </View>
          )}
          <View style={[styles.inputContainer]}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              placeholder="Eg. Martin"
              onChangeText={(value) => {
                setProfile((prevValues: profileInput) => {
                  return {
                    ...prevValues,
                    firstName: value,
                  };
                });
              }}
              underlineColorAndroid={"transparent"}
              returnKeyType="next"
            />
            <Text style={styles.error}>{errors.firstName}</Text>
          </View>

          <View style={[styles.inputContainer]}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              placeholder="Eg. Munene"
              onChangeText={(value) => {
                setProfile((prevValues: profileInput) => {
                  return {
                    ...prevValues,
                    lastName: value,
                  };
                });
              }}
              underlineColorAndroid={"transparent"}
              returnKeyType="next"
            />
            <Text style={styles.error}>{errors.lastName}</Text>
          </View>

          {user?.staffProfileIfIsStaff?.title && (
            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                value={profile.position}
                placeholder="Eg. Lecturer"
                onChangeText={(value) => {
                  setProfile((prevValues: profileInput) => {
                    return {
                      ...prevValues,
                      position: value,
                    };
                  });
                }}
                underlineColorAndroid={"transparent"}
                returnKeyType="next"
              />
              <Text style={styles.error}>{errors.position}</Text>
            </View>
          )}
          <View style={[styles.inputContainer]}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              multiline={true}
              textAlignVertical="top"
              style={[
                styles.input,
                {
                  height: 120,
                },
              ]}
              value={profile.bio}
              placeholder="Eg. Tell others about yourself"
              onChangeText={(value) => {
                setProfile((prevValues: profileInput) => {
                  return {
                    ...prevValues,
                    bio: value,
                  };
                });
              }}
              underlineColorAndroid={"transparent"}
              returnKeyType="next"
            />
            <Text style={styles.error}>{errors.position}</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.padding,
          {
            paddingHorizontal: Platform.select({ ios: true, android: true })
              ? undefined
              : 50,
          },
        ]}
      >
        <Button
          text="Logout"
          onPress={onLogout}
          style={[{ backgroundColor: theme.destructive }]}
        />
      </View>
      <View
        style={[
          styles.padding,
          {
            paddingHorizontal: Platform.select({ ios: true, android: true })
              ? undefined
              : 50,
          },
        ]}
      >
        <Button text="Clear Cache" onPress={clearCache} />
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
