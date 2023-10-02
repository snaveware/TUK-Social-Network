import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { Entypo, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FolderCard({ folder }: { folder: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/files/folders/[folderId]",
          params: { folderId: folder.id },
        });
      }}
      style={[
        styles.flexRow,
        styles.padding,
        styles.margin,
        {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 2,
          overflow: "hidden",
          justifyContent: "space-around",
          alignItems: "center",
          paddingHorizontal: 20,
          width: Platform.select({ ios: "true", android: "true" }) ? 160 : 260,
        },
      ]}
    >
      <AntDesign name="folder1" size={24} color={theme.foreground} />

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ marginLeft: 20, width: "80%" }}
      >
        {folder.name}
      </Text>
      {/* <Entypo name="dots-three-vertical" size={24} color={theme.foreground} /> */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
