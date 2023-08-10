import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform, Dimensions } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext, useEffect, useState } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function FileView({ file }: { file: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);
  const [screenWidth, setScreenWidth] = useState<number>(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState<number>(
    Dimensions.get("window").height
  );

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    });
  }, []);

  return (
    <View
      style={[
        styles.flexCols,
        styles.padding,

        {
          flex: 1,
          maxWidth: screenWidth,
          maxHeight: screenHeight - 50,
        },
      ]}
    >
      <View>
        <View
          style={[
            GlobalStyles.flexRow,
            {
              justifyContent: "flex-start",
              alignItems: "center",

              width: screenWidth,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              marginBottom: 20,
            },

            styles.padding,
          ]}
        >
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[styles.title, styles.padding, { width: screenWidth / 2 }]}
          >
            {file.name}
          </Text>

          <View
            style={[
              GlobalStyles.flexRow,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <MaterialIcons
              name="file-download"
              size={24}
              style={{ marginHorizontal: 15 }}
              color={theme.foreground}
            />
            {file.owner?.id === authUser?.id && (
              <>
                <AntDesign
                  name="sharealt"
                  size={24}
                  style={{ marginHorizontal: 15 }}
                  color={theme.foreground}
                />

                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={theme.destructive}
                />
              </>
            )}
          </View>
        </View>
      </View>
      {file.type === "image" && (
        <Image
          style={{
            width: screenWidth,
            maxWidth: screenWidth,
            height: screenWidth,

            maxHeight: screenHeight - 50,
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
            width: screenWidth,
            maxWidth: screenWidth,
            height: screenHeight - 50,
            maxHeight: screenHeight - 50,
          }}
        />
      )}

      {file.type == "word" && (
        <FontAwesome5
          name="file-word"
          size={screenWidth}
          color={theme.foreground}
        />
      )}

      {file.type == "pdf" && (
        <FontAwesome5
          name="file-pdf"
          size={screenWidth}
          color={theme.foreground}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
