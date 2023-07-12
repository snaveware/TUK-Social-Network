import GlobalStyles from "../GlobalStyles";
import { TouchableOpacity } from "react-native";
import { Text } from "./Themed";

import { useThemeColor } from "./Themed";
import { ThemeProps } from "./Themed";
import { useState, useContext } from "react";
import { AppThemeContext } from "../Theme";

type text = {
  text: string;
};

export type ButtonProps = ThemeProps & TouchableOpacity["props"] & text;

export default function Button(props: ButtonProps) {
  const { style, lightColor, darkColor, text, ...otherProps } = props;
  const { theme } = useContext(AppThemeContext);

  return (
    <TouchableOpacity
      {...otherProps}
      activeOpacity={0.6}
      style={[
        {
          backgroundColor: theme.primary,
          borderRadius: 5,
          paddingVertical: 15,
          paddingHorizontal: 25,
          marginVertical: "auto",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: theme.primaryForeground,
          textAlign: "center",
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
