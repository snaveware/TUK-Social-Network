import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, SplashScreen, Stack, useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { Image, useColorScheme } from "react-native";
import DefaultAppTheme, {
  AppThemeContext,
  AppThemeContextInterface,
  ThemeDark,
  ThemeLight,
} from "../Theme";

import GlobalStyles from "../GlobalStyles";
import { StyleSheet } from "react-native";
import { Appearance, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { PostOwner } from "../components/posts/PostCard";
import { View } from "../components/Themed";
const Favicon = require("../assets/images/favicon.png");

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export enum AccessItemTypes {
  Post = "post",
  File = "file",
  Folder = "folder",
  Poll = "poll",
}

export interface Access {
  users: number[];
  schools: number[];
  classes: number[];
  faculties: number[];
  programmes: number[];
  chats: number[];
  isPublic: boolean;
}

export type UserCounts = {
  followedBy: number;
  follows: number;
  ownedPosts: number;
};

export enum Titles {
  Prof = "Prof",
  Dr = "Dr",
  Mr = "Mr",
  Ms = "Ms",
  Mrs = "Mrs",
}

export type StaffProfile = {
  userId: number;
  staffRegistrationNumber: string;
  title: Titles;
  position: string;
  schoolId: number;
  facultyId: number;
  createdAt: string;
  school?: { faculty?: any } | any;
  updatedAt: string;
};

export type StudentProfile = {
  userId: number;
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  classId: number;
  class: { programme: { school: { faculty: any } } } | any;
};

export type Role = {
  name: string;
  label: string;
  description: string;
  level: number;
  permissions: String[];
  createdAt: string;
  updatedAt: string;
  chatId: number;
};

enum defaultAudiences {
  public = "public",
  private = "private",
  followers = "followers",
  myclass = "myclass",
  myschool = "school",
  myfaculty = "myfaculty",
}

export enum Appearances {
  automatic = "automatic",
  dark = "dark",
  light = "light",
}

export type Preferences = {
  id: number;
  getMessagePushNotifications: boolean;
  getTaggingPushNotifications: boolean;
  getPostSharingPushNotifications: boolean;
  getFileSharedPushNotifications: boolean;
  appearance: Appearances;
  userId: number;
  makeEmailPublic: boolean;
  createdAt: string;
  updatedAt: string;
  favoriteColor: string;
  defaultAudience: defaultAudiences;
};

export enum AccounStatus {
  active = "active",
  inactive = "inactive",
  locked = "locked",
  deleted = "deleted",
}

export type User =
  | {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      bio?: string;
      roleName: string;
      status: AccounStatus;
      role: Role;
      profileAvatarId?: number;
      coverImageId?: number;
      studentProfileIfIsStudent?: StudentProfile;
      staffProfileIfIsStaff?: StaffProfile;
      preferences?: Preferences;
      createdAt: string;
      updatedAt: string;
      isOnline: boolean;
      rootFolderId: number;
      _count: UserCounts;
      followedBy: PostOwner[];
    }
  | undefined;

export interface AuthContextInterface {
  user?: User;
  setUser: any;
  isLoggedIn: boolean;
  setIsLoggedIn: any;
  accessToken?: string;
  setAccessToken: any;
}

const defaultAuthContext: AuthContextInterface = {
  isLoggedIn: false,
  setUser: () => {},
  setIsLoggedIn: () => {},
  setAccessToken: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <>
      {/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
      {!loaded && <SplashScreen />}
      {loaded && <RootLayoutNav />}
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(DefaultAppTheme);

  const listener = Appearance.addChangeListener(({ colorScheme }) => {
    if (colorScheme === "dark") {
      setTheme(ThemeDark);
    } else {
      setTheme(ThemeLight);
    }
  });

  const router = useRouter();

  const [user, setUser] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    restoreStoredUser();

    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.innerHTML = `
      ::-webkit-scrollbar {
        width: 10px;
      }
  
      ::-webkit-scrollbar-thumb {
        background-color: ${theme.backgroundMuted};
        
        border-radius: 5px;

      }
  
      ::-webkit-scrollbar-track {
        background-color: transparent;
        margin-block: 5px;
      }
      body {
        overflow: hidden;
      }
    `;

      document.head.appendChild(style);
    }
  }, []);

  async function restoreStoredUser() {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        if (accessToken) {
          setAccessToken(accessToken);
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        router.push("/auth/LoginEmail");
      }
    } catch (error) {
      console.log("Error restoring from local storage", error);
    }
  }

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          isLoggedIn,
          setIsLoggedIn,
          accessToken,
          setAccessToken,
        }}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AutocompleteDropdownContextProvider>
            <AppThemeContext.Provider value={{ theme, setTheme }}>
              <StatusBar style={"auto"} />

              {colorScheme === "light" && Platform.OS === "android" && (
                <StatusBar style={"dark"} />
              )}

              <Stack>
                <Stack.Screen
                  name="auth/LoginEmail"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="auth/LoginCode"
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="select"
                  options={{ presentation: "modal", title: "Select" }}
                />

                <Stack.Screen
                  name="auth/SetupStudent"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="auth/SetupStaff"
                  options={{ headerShown: false }}
                />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="posts/Search"
                  options={{ presentation: "modal", title: "Search" }}
                />
                <Stack.Screen name="posts/New" />
                <Stack.Screen name="posts/Edit" />

                <Stack.Screen
                  name="users/[userId]"
                  options={{
                    title: "User Profile",
                    headerTitle: " User Profile",
                  }}
                />

                <Stack.Screen
                  name="users/UpdateProfile"
                  options={{
                    title: "Update Profile",

                    headerRight: () => (
                      <Link
                        href="/users/UpdateProfile"
                        style={[
                          styles.flexRow,
                          { backgroundColor: "transparent" },
                        ]}
                        asChild
                      >
                        <FontAwesome
                          name="bell"
                          size={28}
                          color={theme.foreground}
                        />
                      </Link>
                    ),
                    headerLeft: () => {
                      return (
                        <View
                          style={[
                            styles.flexRow,
                            styles.flexCenter,
                            { backgroundColor: "transparent", marginLeft: 15 },
                          ]}
                        >
                          <Image
                            source={Favicon}
                            style={{ width: 36, height: 36 }}
                          />
                        </View>
                      );
                    },
                  }}
                />

                <Stack.Screen
                  name="posts/[postId]"
                  options={{ presentation: "modal", title: "Comments" }}
                />

                <Stack.Screen
                  name="chats/New"
                  options={{
                    title: "New Group",
                    headerTitle: "New Group",
                    presentation: "modal",
                  }}
                />

                <Stack.Screen
                  name="chats/ChatFiles"
                  options={{
                    title: "Chat Files",
                    headerTitle: "Chat Files",
                    presentation: "modal",
                  }}
                />

                <Stack.Screen
                  name="chats/ChatFolders"
                  options={{
                    title: "Chat Folders",
                    headerTitle: "Chat Folders",
                    presentation: "modal",
                  }}
                />

                <Stack.Screen
                  name="chats/share"
                  options={{
                    presentation: "modal",
                    title: "Forward Message",
                    headerTitle: "Forward Message",
                  }}
                />

                <Stack.Screen
                  name="chats/[chatId]"
                  options={{
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="chats/Search"
                  options={{ presentation: "modal", title: "Search Chats" }}
                />

                <Stack.Screen
                  name="files/NewFile"
                  options={{ title: "New File", presentation: "modal" }}
                />
                <Stack.Screen
                  name="files/NewFolder"
                  options={{ presentation: "modal", title: "New Folder Page" }}
                />
                <Stack.Screen
                  name="files/Search"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="files/[fileId]"
                  options={{ presentation: "modal" }}
                />

                <Stack.Screen name="files/folders/[folderId]" />

                <Stack.Screen
                  name="Notifications"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </AppThemeContext.Provider>
          </AutocompleteDropdownContextProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
