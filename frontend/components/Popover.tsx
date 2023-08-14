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
}: {
  variant: "plus" | "text" | "options";
  text?: string;
  children: ReactNode;
  start?: "right" | "left";
  isOpen?: boolean;
  setIsOpen: any;
  onPress?: any;
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
            <Feather name="x-circle" size={36} color={theme.foreground} />
          )}
          {!isOpen && (
            <MaterialIcons name="add" size={36} color={theme.foreground} />
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
            <Feather name="x-circle" size={36} color={theme.foreground} />
          )}
          {!isOpen && (
            <Entypo
              name="dots-three-vertical"
              size={24}
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
              zIndex: 1,
              left: start === "right" ? undefined : -20,
              right: start == "right" ? -20 : undefined,
              bottom: -300,
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
              bottom: "100%",
              left: start === "right" ? undefined : 10,
              right: start === "right" ? 0 : undefined,
              zIndex: 10,
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
