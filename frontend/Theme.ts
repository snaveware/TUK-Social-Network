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
  // primary: "#252566",
  primary: "#252566",
  primaryMuted: "#007272",
  primaryForeground: "#FFFFFF",
  secondary: "#007272",
  secondaryForeground: "#FFFFFF",
  background: "#FFFFFF",
  // foreground: "#000000",
  foreground: "#09030a",
  // foregroundMuted: "#007272",
  foregroundMuted: "#051f19",
  backgroundMuted: "#F0F0F0",
  border: "#BEBEBE",
  accent: "#C6A767",
  accentForeground: "#FFFFFF",
  destructive: "#C66D67",
};

export const ThemeDark: ThemeContext = {
  primary: "#007272",
  primaryMuted: "#63A5A5",
  primaryForeground: "#FFFFFF",
  secondary: "#C6A767",
  secondaryForeground: "#FFFFFF",
  // background: "#000000",
  background: "#09030a",
  foreground: "#FFFFFF",
  foregroundMuted: "#007272",
  // backgroundMuted: "#2D2D2D",
  backgroundMuted: "#051f19",
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
