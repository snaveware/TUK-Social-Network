import GlobalStyles from "../GlobalStyles";

import { View, Text, ViewProps, useThemeColor, TextProps } from "./Themed";
import {
  ImageStyle,
  TextStyle,
} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

import { ThemeProps } from "./Themed";
import { useState, useContext, useLayoutEffect } from "react";
import { AppThemeContext } from "../Theme";
import { Image, StyleSheet } from "react-native";

export enum AvatarVariant {
  primary = "primary",
  secondary = "secondary",
  text = "text",
  outline = "outline",
}

export type CustomAvatarProps = {
  text: string;
  imageSource?: string;
  variant?: AvatarVariant;
  textColor?: string;
  textStyles?: TextStyle;
  imageStyles?: ImageStyle;
};

export type AvatarProps = ThemeProps & ViewProps & CustomAvatarProps;

export default function Avatar(props: AvatarProps) {
  const {
    style,
    lightColor,
    darkColor,
    text,
    imageSource,
    variant,
    textColor,
    textStyles,
    imageStyles,
    ...otherProps
  } = props;
  const { theme } = useContext(AppThemeContext);

  const [hasImage, setHasImage] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (imageSource) {
      setHasImage(true);
    }
  }, []);

  let backgroundColor = theme.accent;

  let color = theme.accentForeground;

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
    } else if (variant == "outline") {
      backgroundColor = theme.background;
      color = theme.primary;
      borderColor = theme.primary;
    } else if (variant == "primary") {
      backgroundColor = theme.primary;
      color = theme.primaryForeground;
      borderColor = theme.primary;
    }
  }

  if (hasImage) {
    backgroundColor = "transparent";
  }

  if (textColor) {
    color = textColor;
  }

  return (
    <View
      {...otherProps}
      style={[
        {
          backgroundColor: backgroundColor,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: borderColor,
          width: 60,
          height: 60,
        },
        styles.flexRow,
        styles.flexCenter,
        style,
      ]}
    >
      {!hasImage && (
        <Text
          style={[
            {
              color: color,
              textAlign: "center",
              fontSize: 18,
            },
            textStyles,
          ]}
        >
          {text}
        </Text>
      )}
      {hasImage && (
        <Image
          style={[
            {
              width: "90%",
              height: "90%",
            },
            imageStyles,
          ]}
          source={{ uri: imageSource }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
