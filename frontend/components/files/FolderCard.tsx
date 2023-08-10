import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { Entypo } from "@expo/vector-icons";

export default function FolderCard({ folder }: { folder: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  return (
    <View
      style={[
        styles.flexRow,
        {
          paddingHorizontal: 8,
          paddingVertical: 5,
          justifyContent: "space-between",
          alignItems: "center",
          width: Platform.select({ ios: "true", android: "true" }) ? 160 : 260,
        },
      ]}
    >
      <Text numberOfLines={1} ellipsizeMode="tail" style={{ marginRight: 10 }}>
        {folder.name}
      </Text>
      <Entypo name="dots-three-vertical" size={24} color={theme.foreground} />
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
