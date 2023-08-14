import GlobalStyles from "../GlobalStyles";
import { TouchableOpacity } from "react-native";
import { Text, useThemeColor, TextProps } from "./Themed";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

import { ThemeProps } from "./Themed";
import { useState, useContext } from "react";
import { AppThemeContext } from "../Theme";

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  text = "text",
  outline = "outline",
  destructive = "destructive",
}

export type CustomButtonProps = {
  text: string;
  variant?: ButtonVariant;
  textColor?: string;
  textStyles?: TextStyle;
};

export type ButtonProps = ThemeProps &
  TouchableOpacity["props"] &
  CustomButtonProps;

export default function Button(props: ButtonProps) {
  const {
    style,
    lightColor,
    darkColor,
    text,
    variant,
    textColor,
    textStyles,
    ...otherProps
  } = props;
  const { theme } = useContext(AppThemeContext);

  let backgroundColor = theme.primary;

  let color = theme.primaryForeground;

  let borderColor = theme.primary;

  if (variant) {
    if (variant === "text") {
      backgroundColor = theme.background;
      color = theme.primary;
      borderColor = theme.background;
    } else if (variant === "secondary") {
      backgroundColor = theme.secondary;
      color = theme.secondaryForeground;
      borderColor = theme.secondary;
    } else if (variant === "outline") {
      backgroundColor = theme.background;
      color = theme.primary;
      borderColor = theme.primary;
    } else if (variant === "destructive") {
      backgroundColor = theme.destructive;
    }
  }

  if (textColor) {
    color = textColor;
  }

  return (
    <TouchableOpacity
      {...otherProps}
      activeOpacity={0.6}
      style={[
        {
          backgroundColor: backgroundColor,
          borderRadius: 5,
          paddingVertical: 14,
          paddingHorizontal: 35,
          marginVertical: "auto",
          borderColor: borderColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: color,
            textAlign: "center",
          },
          textStyles,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
