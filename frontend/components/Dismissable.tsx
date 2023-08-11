import { View, Text } from "./Themed";
import { useState, useEffect, useContext } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppThemeContext } from "../Theme";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import GlobalStyles from "../GlobalStyles";

export default function Dismissable({
  message,
  isDismissed = false,
  variant,
  onDismiss,
}: {
  message: string;
  isDismissed?: boolean;
  variant?: "success" | "info" | "danger";
  onDismiss: any;
}) {
  const { theme } = useContext(AppThemeContext);

  const [color, setColor] = useState<string>(theme.foreground);

  useEffect(() => {
    if (variant === "success") {
      setColor(theme.primary);
    } else if (variant === "info") {
      setColor(theme.accent);
    } else if (variant === "danger") {
      setColor(theme.destructive);
    }
  }, [variant]);

  return (
    <View
      style={[
        styles.padding,
        styles.margin,
        {
          flex: 1,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: theme.border,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          styles.paddingV,
          {
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingLeft: 20,
          },
        ]}
      >
        {variant === "danger" && (
          <MaterialIcons name="error-outline" size={48} color={color} />
        )}
        {variant === "info" && (
          <AntDesign name="infocirlceo" size={48} color={color} />
        )}

        {variant === "success" && (
          <AntDesign name="checkcircleo" size={48} color={color} />
        )}

        <Feather onPress={onDismiss} name="x-circle" size={24} color={color} />
      </View>
      <Text style={[styles.paddingH, { color: color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
