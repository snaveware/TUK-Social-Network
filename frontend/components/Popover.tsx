import { View, Text } from "./Themed";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  StyleProp,
} from "react-native";
import { useState, useEffect, useContext, ReactNode } from "react";
import { MaterialIcons, Feather, Entypo } from "@expo/vector-icons";
import { AppThemeContext } from "../Theme";
import { AuthContext } from "../app/_layout";
import GlobalStyles from "../GlobalStyles";
import { TouchableProps } from "react-native-svg";
import { ViewStyle } from "@expo/html-elements/build/primitives/View";

export default function Popover({
  variant,
  text,
  children,
  start,
  isOpen = false,
  setIsOpen,
  onPress,
  iconSize,
  position = "top",
}: {
  variant: "plus" | "text" | "options";
  text?: string;
  children: ReactNode;
  start?: "right" | "left";
  position?: "top" | "bottom";
  isOpen?: boolean;
  setIsOpen: any;
  onPress?: any;
  iconSize?: number;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      setScreenHeight(window.height);
      setScreenWidth(window.width);
    });
  }, []);

  return (
    <View
      style={[
        styles.flexRow,
        styles.flexCenter,
        {
          position: "relative",
          backgroundColor: "transparent",
        },
      ]}
    >
      {variant === "plus" && (
        <TouchableOpacity
          onPress={() => {
            setIsOpen(!isOpen);
            if (onPress) {
              onPress();
            }
          }}
          style={[
            {
              zIndex: 100,
              paddingHorizontal: start === "right" ? undefined : 10,
            },
          ]}
        >
          {isOpen && (
            <Feather
              name="x-circle"
              size={iconSize || 36}
              color={theme.foreground}
            />
          )}
          {!isOpen && (
            <MaterialIcons
              name="add"
              size={iconSize || 36}
              color={theme.foreground}
            />
          )}
        </TouchableOpacity>
      )}

      {variant === "options" && (
        <TouchableOpacity
          onPress={() => {
            setIsOpen(!isOpen);
            if (onPress) {
              onPress();
            }
          }}
          style={[
            {
              //   backgroundColor: "green",
              zIndex: 100,
              paddingHorizontal: start === "right" ? undefined : 10,
            },
          ]}
        >
          {isOpen && (
            <Feather
              selectable={false}
              name="x-circle"
              size={iconSize || 36}
              color={theme.foreground}
            />
          )}
          {!isOpen && (
            <Entypo
              selectable={false}
              name="dots-three-vertical"
              size={iconSize || 24}
              color={theme.foreground}
            />
          )}
        </TouchableOpacity>
      )}
      {variant == "text" && text && <Text>{text}</Text>}
      {isOpen && (
        <TouchableOpacity
          onPress={() => {
            setIsOpen(false);
          }}
          style={[
            {
              width: screenWidth,
              height: screenHeight * 2,
              position: "absolute",
              zIndex: -5,
              left: start === "right" ? undefined : -20,
              right: start == "right" ? -30 : undefined,
              bottom: position == "top" ? -300 : undefined,

              backgroundColor: "transparent",
            },
          ]}
        ></TouchableOpacity>
      )}
      {isOpen && (
        <View
          style={[
            styles.padding,
            styles.flexCols,
            {
              position: "absolute",
              bottom: position === "top" ? "100%" : "-100%",
              left: start === "right" ? undefined : 10,
              right: start === "right" ? 20 : undefined,

              zIndex: 100,
              shadowColor: theme.border,
              shadowOpacity: 0.8,
              shadowOffset: { width: 0, height: 1000 },
              shadowRadius: 3,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              backgroundColor: theme.backgroundMuted,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
