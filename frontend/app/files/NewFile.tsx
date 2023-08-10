import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useState, useEffect, useContext } from "react";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../_layout";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import Button from "../../components/Button";
import * as DocumentPicker from "expo-document-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Avatar from "../../components/Avatar";
const BackgroundImage = require("../../assets/images/background.png");
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import GlobalStyles from "../../GlobalStyles";
import { FontAwesome5 } from "@expo/vector-icons";
import uploadFile from "../../uploadFile";
import { extractAsset } from "../../uploadFile";
import Utils from "../../Utils";
import * as ImagePicker from "expo-image-picker";

export default function NewFileScreen() {
  const [files, setfiles] = useState();
  const { theme } = useContext(AppThemeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const params = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,
              { paddingRight: Platform.OS == "web" ? 10 : 0 },
            ]}
          >
            <Button
              onPress={() => {
                uploadFile(file, params.folderId);
              }}
              text="Upload"
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                marginVertical: "auto",
              }}
            />
          </View>
        );
      },
    });
  }, [file, params]);

  async function pickfile() {
    const result = await DocumentPicker.getDocumentAsync({
      // type: "video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory,
    });

    const asset: any = extractAsset(result);

    const attr = Utils.extractMimeTypeAndBase64(asset.uri);
    asset.mimeType = attr.mimeType;

    console.log("picked asset (file): ", asset);

    setFile(asset);
  }

  async function pickImage() {
    if (Platform.OS == "web") {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*,video/*",
        copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory
      });

      const asset: any = extractAsset(result);

      const attr = Utils.extractMimeTypeAndBase64(asset.uri);
      asset.mimeType = attr.mimeType;
      console.log("picked asset (image): ", asset);

      setFile(asset);

      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result && result.assets) {
      const asset: any = {
        uri: result.assets[0].uri,
        type: result.assets[0].type || "image",
      };

      asset.mimeType = Utils.getMimeTypeFromURI({
        uri: asset.uri,
        type: asset.type || "image",
      });

      asset.name = `${Utils.generateUniqueString()}${Utils.getMediaFileExtension(
        asset.mimeType
      )}`;

      console.log("picked asset (image): ", asset);

      setFile(asset);
    }
  }

  return (
    <View
      style={[
        styles.flexCols,
        styles.padding,

        {
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
        },
      ]}
    >
      {file && (
        <View
          style={[
            styles.padding,
            styles.margin,
            {
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 5,
              width: "100%",
            },
          ]}
        >
          <Text>{file?.name}</Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: theme.backgroundMuted,
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: theme.primary,
          width: "100%",
          height: file ? undefined : "30%",
        }}
      >
        <Text style={[styles.padding, { textAlign: "center" }]}>Gallery</Text>

        <View
          style={[
            styles.flexRow,
            styles.flexCenter,

            {
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              backgroundColor: theme.backgroundMuted,
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: theme.primary,
              height: "100%",
            },
          ]}
        >
          <Entypo name="video" size={30} color={theme.foreground} />
          <TouchableOpacity
            style={[
              {
                padding: 8,
                marginHorizontal: 10,
                borderRadius: 5,
                backgroundColor: "transparent",
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: theme.primary,
              },
            ]}
            onPress={pickImage}
          >
            <AntDesign name="plus" size={30} color={theme.foreground} />
          </TouchableOpacity>

          <Entypo name="image-inverted" size={30} color={theme.foreground} />
        </View>
      </View>
      <View
        style={{
          backgroundColor: theme.backgroundMuted,
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: theme.primary,
          width: "100%",
          height: file ? undefined : "30%",
          marginTop: 50,
        }}
      >
        <Text style={[styles.padding, { textAlign: "center" }]}>Files</Text>

        <View
          style={[
            styles.flexRow,
            styles.flexCenter,

            {
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              backgroundColor: theme.backgroundMuted,
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: theme.primary,
              height: "100%",
            },
          ]}
        >
          <FontAwesome5 name="file-pdf" size={30} color={theme.foreground} />

          <TouchableOpacity
            style={[
              {
                padding: 8,
                marginHorizontal: 10,
                borderRadius: 5,
                backgroundColor: "transparent",
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: theme.primary,
              },
            ]}
            onPress={pickfile}
          >
            <AntDesign name="plus" size={30} color={theme.foreground} />
          </TouchableOpacity>

          <FontAwesome5 name="file-word" size={30} color={theme.foreground} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
