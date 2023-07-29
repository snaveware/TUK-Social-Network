import { Appearance } from "react-native";
import { createContext } from "react";

const colorScheme = Appearance.getColorScheme();

export interface ThemeContext {
  primary: string;
  primaryMuted: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  foregroundMuted: string;
  backgroundMuted: string;
  border: string;
  accent: string;
  accentForeground: string;
  destructive: string;
}

export const ThemeLight: ThemeContext = {
  primary: "#C6A767",
  primaryMuted: "#007272",
  primaryForeground: "#FFFFFF",
  secondary: "#007272",
  secondaryForeground: "#FFFFFF",
  background: "#FFFFFF",
  foreground: "#000000",
  foregroundMuted: "#424242",
  backgroundMuted: "#F0F0F0",
  border: "#F0F0F0",
  accent: "#252566",
  accentForeground: "#FFFFFF",
  destructive: "#C66D67",
};

export const ThemeDark: ThemeContext = {
  primary: "#007272",
  primaryMuted: "#63A5A5",
  primaryForeground: "#FFFFFF",
  secondary: "#C6A767",
  secondaryForeground: "#FFFFFF",
  background: "#000000",
  foreground: "#FFFFFF",
  foregroundMuted: "#b8bab9",
  backgroundMuted: "#2D2D2D",
  border: "#2D2D2D",
  accent: "#C6A767",
  accentForeground: "#FFFFFF",
  destructive: "#C66D67",
};

let DefaultAppTheme = ThemeLight;

if (colorScheme == "dark") {
  DefaultAppTheme = ThemeDark;
}

export interface AppThemeContextInterface {
  theme: ThemeContext;
  setTheme: any;
}

export default DefaultAppTheme;

const defaultAppThemeContext: AppThemeContextInterface = {
  theme: DefaultAppTheme,
  setTheme: () => {},
};

export const AppThemeContext = createContext(defaultAppThemeContext);
