import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform, Dimensions } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext, useEffect, useState } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link, useNavigation, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal, { ModalVariant } from "../Modal";
import Utils, { BodyRequestMethods } from "../../Utils";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Button from "../Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FileView({ file }: { file: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);
  const [screenWidth, setScreenWidth] = useState<number>(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState<number>(
    Dimensions.get("window").height
  );

  const [result, setResult] = useState<any>(null);

  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const router = useRouter();

  const navigation = useNavigation();

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const onModalConfirm = () => {
    deleteFile();
  };

  const deleteFileConfirm = () => {
    setModalText("Are you sure you want to delete this file?");
    setShowModal(true);
    setModalVariant(ModalVariant.confirmation);
  };

  const deleteFile = async () => {
    console.log("deleted file.........", file.id);
    if (loading) return;
    setLoading(true);
    setModalText("");
    try {
      const URL = `${Config.API_URL}/files/${file.id}`;
      console.log("delete folder url: ", URL);
      const results = await Utils.makeDeleteRequest(URL);

      console.log("delete folder results: ", results);

      if (results.success) {
        router.back();
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Network Error deleting file");
      setModalText("Network Error, Please check your internet");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
    }
  };

  const downloadFile = async () => {
    console.log("download file.....", file.id);

    const callback = (downloadProgress: any) => {
      const progress = Math.floor(
        (downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite) *
          100
      );
      setDownloadProgress(progress);
      setModalText(progress.toString());
      setModalVariant(undefined);
      setShowModal(true);
    };

    console.log("directory: ", FileSystem.documentDirectory);

    const downloadResumable = FileSystem.createDownloadResumable(
      `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`,
      FileSystem.documentDirectory + file.name,
      {},
      callback
    );

    try {
      // const directoryInfo = await FileSystem.getInfoAsync(outputDir);
      // if (!directoryInfo.exists) {
      //     await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true
      //     });
      // }

      const result = await downloadResumable.downloadAsync();
      let uri: any;
      if (result?.uri) {
        uri = await FileSystem.getContentUriAsync(result.uri);
      }

      if (!uri) {
        setModalText("An error occured while downloading the file");
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
        return;
      }

      // setModalVariant(ModalVariant.success);
      // setModalText("Downloaded Successfully");
      // setShowModal(true);
      Linking.openURL(uri);
      console.log("Finished downloading to ", uri);
    } catch (e) {
      console.error("error downloading: ", e);
    }

    // Linking.openURL(`${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`);
  };

  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(
      `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`
    );
    setResult(result);
  };

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window, screen }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    });

    navigation.setOptions({
      headerTitleAlign: "left",
      headerRight: () => {
        return (
          <View>
            <View
              style={[
                GlobalStyles.flexRow,
                {
                  justifyContent: "flex-end",
                  alignItems: "center",
                },

                styles.padding,
              ]}
            >
              <View
                style={[
                  GlobalStyles.flexRow,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <MaterialIcons
                  onPress={downloadFile}
                  name="file-download"
                  size={24}
                  style={{ marginHorizontal: 15 }}
                  color={theme.foreground}
                />
                {file.owner?.id === authUser?.id && (
                  <>
                    <AntDesign
                      // onPress={selectForSharing}
                      name="sharealt"
                      size={24}
                      style={{ marginHorizontal: 15 }}
                      color={theme.foreground}
                    />

                    <MaterialIcons
                      onPress={deleteFileConfirm}
                      name="delete-outline"
                      size={24}
                      color={theme.destructive}
                    />
                  </>
                )}
              </View>
            </View>
          </View>
        );
      },
    });
  }, []);

  return (
    <View
      style={[
        styles.flexCols,
        styles.padding,
        styles.flexCenter,

        {
          flex: 1,
          maxWidth: screenWidth,
          maxHeight: screenHeight - 50,
        },
      ]}
    >
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
        onConfirm={onModalConfirm}
      />

      <View style={{ flex: 1 }}>
        <Button text="browser" onPress={_handlePressButtonAsync} />
        <Text>{result && JSON.stringify(result)}</Text>
      </View>

      {/* {file.type === "image" && (
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
      )} */}

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

      {(file.type === "word" || file.type === "pdf") &&
        Platform.OS === "ios" && (
          <WebView
            source={{
              uri: `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`,
            }}
          />
        )}

      {(file.type === "word" || file.type === "pdf") &&
        Platform.OS !== "ios" && (
          <Text>
            Just a moment... {downloadProgress ? downloadProgress : ""}
          </Text>
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
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
