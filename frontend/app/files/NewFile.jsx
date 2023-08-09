import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useState, useEffect, useContext } from "react";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../_layout";
import { useNavigation } from "expo-router";
import Button from "../../components/Button";
import * as DocumentPicker from "expo-document-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Avatar from "../../components/Avatar";
const BackgroundImage = require("../../assets/images/background.png");
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function NewFileScreen() {
  const [files, setfiles] = useState();
  const { theme } = useContext(AppThemeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
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
              onPress={onSubmit}
              text="Post"
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
  }, [files]);

  async function pickfile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ",video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,",
      copyToCacheDirectory: false, // Set this to true if you want to copy the file to the cache directory,
      multiple: true,
    });

    // console.log("result :", result);

    // const asset = {
    //   uri: result.uri,
    //   type: result.file.type.split("/")[0],
    //   file: result.file,
    // };

    // const attr = Utils.extractMimeTypeAndBase64(asset.uri);
    // asset.mimeType = attr.mimeType;

    // setFiles((prevValues) => {
    //   let sameFile = false;
    //   let i = 0;
    //   while (!sameFile && i < prevValues.length) {
    //     if (
    //       prevValues[i].name === result.file.name ||
    //       prevValues[i].uri === result.uri
    //     ) {
    //       sameFile = true;
    //     }
    //     i++;
    //   }

    //   if (sameFile) {
    //     return [...prevValues];
    //   } else {
    //     uploadFile(asset);
    //     return [...prevValues, asset];
    //   }
    // });
  }

  async function uploadFile(file) {}

  async function onSubmit() {
    if (files && files.length > 0) {
      files.map(async (file) => {
        if (!file.id) {
          await uploadFile(file);
        }
      });
    }

    try {
    } catch (error) {
      console.log("error uploading files: ", error);
    }
  }
  return (
    <View style={styles.container}>
      <View>
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

              width: "80%",
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
            onPress={pickfile}
          >
            <AntDesign name="plus" size={30} color={theme.foreground} />
          </TouchableOpacity>

          <Entypo name="image-inverted" size={30} color={theme.foreground} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
