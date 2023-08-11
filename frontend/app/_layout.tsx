import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import DefaultAppTheme, {
  AppThemeContext,
  AppThemeContextInterface,
  ThemeDark,
  ThemeLight,
} from "../Theme";

import GlobalStyles from "../GlobalStyles";
import { StyleSheet } from "react-native";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { StatusBar } from "expo-status-bar";
import { PostOwner } from "../components/posts/PostCard";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

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
  updatedAt: string;
};

export type StudentProfile = {
  userId: number;
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  classId: number;
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

                <Stack.Screen
                  name="users/[userId]"
                  options={{
                    title: "User Profile",
                    headerTitle: " User Profile",
                  }}
                />

                <Stack.Screen
                  name="posts/[postId]"
                  options={{ presentation: "modal", title: "Comments" }}
                />

                <Stack.Screen
                  name="chats/New"
                  options={{
                    title: "New Chats",
                    headerTitle: "New Chat",
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
