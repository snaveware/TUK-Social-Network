import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import DefaultAppTheme, {
  AppThemeContext,
  AppThemeContextInterface,
  ThemeDark,
  ThemeLight,
} from "../Theme";

import { Appearance } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

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

  return (
    <>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppThemeContext.Provider value={{ theme, setTheme }}>
          <Stack>
            <Stack.Screen name="LoginEmail" options={{ headerShown: false }} />
            <Stack.Screen name="LoginCode" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </AppThemeContext.Provider>
      </ThemeProvider>
    </>
  );
}
