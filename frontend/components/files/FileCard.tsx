import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext, useState, useEffect } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import Modal, { ModalVariant } from "../Modal";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Button from "../Button";

export default function FileCard({
  file,
  size,
  showLabel = true,
  showBorder = true,
}: {
  file: any;
  size?: number;
  showLabel?: boolean;
  showBorder?: boolean;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);

  const [fileSource, setFileSource] = useState<string>(
    `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`
  );

  const router = useRouter();
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const [height, setHeight] = useState<number>(
    Platform.select({ ios: true, android: true }) ? 180 : 280
  );
  const [width, setWidth] = useState<number>(
    Platform.select({ ios: true, android: true }) ? 240 : 320
  );

  useEffect(() => {
    if (file.id) {
      setFileSource(`${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`);
    } else {
      setFileSource(file.uri);
    }
  }, [file]);

  useEffect(() => {
    let _width = Platform.select({ ios: true, android: true }) ? 180 : 280;
    let _height = Platform.select({ ios: true, android: true }) ? 240 : 320;

    if (size) {
      _width = size;
      _height = size;
    }

    setHeight(_height);
    setWidth(_width);
  }, [size, showLabel]);

  // useEffect(() => {
  //   console.log(
  //     "file: ",
  //     file,

  //     `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`
  //   );
  // }, [fileSource]);

  const openFileInBrowser = async () => {
    const name = `${Config.API_URL}/files/file/${file.name}?fid=${file.id}&t=${accessToken}`;
    console.log("file name: ", name);
    let result = await WebBrowser.openBrowserAsync(name, {
      enableBarCollapsing: true,
      enableDefaultShareMenuItem: true,
      showTitle: false,
      showInRecents: true,
    });
    setResult(result);
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
      setModalText(`Just a moment... ${progress.toString()}`);
      setModalVariant(undefined);
      setShowModal(true);
    };

    console.log("directory: ", FileSystem.documentDirectory);

    const outputDir = `${FileSystem.documentDirectory}${"my_file"}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`,
      outputDir,
      {},
      callback
    );

    try {
      // const directoryInfo = await FileSystem.getInfoAsync(outputDir);
      // if (!directoryInfo.exists) {
      //   await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });
      // }

      const result = await downloadResumable.downloadAsync();
      let uri: any;
      if (result?.uri) {
        uri = await FileSystem.getContentUriAsync(result.uri);
        console.log("content uri: ", uri);
      }

      if (!uri) {
        setModalText("An error occured while downloading the file");
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
        return;
      }

      console.log("Finished downloading to ", uri);

      setShowModal(false);
      Linking.openURL(uri);
    } catch (e) {
      console.error("error downloading: ", e);
    }

    // Linking.openURL(`${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`);
  };

  return (
    <View
      style={[
        styles.flexCols,
        // styles.padding,
        styles.flexCenter,
        styles.margin,

        {
          position: "relative",
          // borderWidth: showBorder ? 1 : 0,
          // borderColor: theme.border,
          backgroundColor: "transparent",
          // borderRadius: 2,
          width: width,
          maxWidth: width,
          height: showLabel ? height + 40 : height,
          maxHeight: showLabel ? height + 40 : height,
        },
      ]}
    >
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
      />
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "web") {
            router.push(
              `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`
            );
          } else {
            openFileInBrowser();
          }
        }}
      >
        {file.type === "image" && (
          <Image
            style={{
              width: width,
              maxWidth: width,
              height: width,
              maxHeight: width,
            }}
            source={{
              uri: fileSource,
            }}
          />
        )}

        {file.type === "video" && (
          <Video
            source={{
              uri: fileSource,
            }}
            style={{
              width: width,
              maxWidth: width,
              height: width,
              maxHeight: width,
            }}
          />
        )}

        {file.type == "word" && (
          <FontAwesome5
            name="file-word"
            size={width}
            color={theme.foregroundMuted}
          />
        )}

        {file.type == "pdf" && (
          <FontAwesome5
            name="file-pdf"
            size={width}
            color={theme.foregroundMuted}
          />
        )}
      </TouchableOpacity>

      {showLabel && (
        <Text numberOfLines={1} ellipsizeMode="tail" style={[{ marginTop: 5 }]}>
          {file.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
