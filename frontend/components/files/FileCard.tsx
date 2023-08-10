import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function FileCard({ file }: { file: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);
  return (
    <View
      style={[
        styles.flexCols,
        styles.padding,
        styles.flexCenter,
        styles.margin,
        {
          position: "relative",
          borderWidth: 1,
          borderColor: theme.border,
          // backgroundColor: "green",
          borderRadius: 2,

          width: Platform.select({ ios: true, android: true }) ? 180 : 280,
          maxWidth: Platform.select({ ios: true, android: true }) ? 180 : 280,
          height: Platform.select({ ios: true, android: true }) ? 220 : 320,
          maxHeight: Platform.select({ ios: true, android: true }) ? 220 : 320,
        },
      ]}
    >
      <Link
        href={{
          pathname: "files/[fileId]",
          params: { fileId: file.id },
        }}
      >
        {file.type === "image" && (
          <Image
            style={{
              width: Platform.select({ ios: true, android: true }) ? 160 : 240,
              maxWidth: Platform.select({ ios: true, android: true })
                ? 160
                : 240,
              height: Platform.select({ ios: true, android: true }) ? 160 : 240,
              maxHeight: Platform.select({ ios: true, android: true })
                ? 160
                : 240,
            }}
            source={{
              uri: `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`,
            }}
          />
        )}

        {file.type === "video" && (
          <Video
            source={{
              uri: `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`,
            }}
            style={{
              width: Platform.select({ ios: true, android: true }) ? 160 : 240,
              maxWidth: Platform.select({ ios: true, android: true })
                ? 160
                : 240,
              height: Platform.select({ ios: true, android: true }) ? 160 : 240,
              maxHeight: Platform.select({ ios: true, android: true })
                ? 160
                : 240,
            }}
          />
        )}

        {file.type == "word" && (
          <FontAwesome5
            name="file-word"
            size={Platform.select({ ios: true, android: true }) ? 160 : 240}
            color={theme.foreground}
          />
        )}

        {file.type == "pdf" && (
          <FontAwesome5
            name="file-pdf"
            size={Platform.select({ ios: true, android: true }) ? 160 : 240}
            color={theme.foreground}
          />
        )}
      </Link>

      <Text numberOfLines={1} ellipsizeMode="tail" style={[{ marginTop: 5 }]}>
        {file.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
