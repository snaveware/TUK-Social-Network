import { ThemeDark, ThemeLight } from "../Theme";

const tintColorLight = ThemeLight.primary;
const tintColorDark = ThemeDark.primary;

export default {
  light: {
    text: ThemeLight.foreground,
    background: ThemeLight.background,
    tint: tintColorLight,
    tabIconDefault: ThemeLight.primary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: ThemeDark.foreground,
    background: ThemeDark.background,
    tint: tintColorDark,
    tabIconDefault: ThemeDark.primaryMuted,
    tabIconSelected: tintColorDark,
  },
};
