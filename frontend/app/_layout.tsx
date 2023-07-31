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

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export interface AuthContextInterface {
  user?: any;
  setUser: any;
  isLoggedIn: boolean;
  setIsLoggedIn: any;
}

const defaultAuthContext: AuthContextInterface = {
  isLoggedIn: false,
  setUser: () => {},
  setIsLoggedIn: () => {},
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

  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    restoreStoredUser();
  }, []);

  async function restoreStoredUser() {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      router.push("/auth/LoginEmail");
    }
  }

  return (
    <>
      <AuthContext.Provider
        value={{ user, setUser, isLoggedIn, setIsLoggedIn }}
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
                  name="Notifications"
                  options={{ presentation: "modal" }}
                />

                <Stack.Screen name="posts/New" />
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
