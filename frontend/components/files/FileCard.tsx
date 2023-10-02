import GlobalStyles from "../../GlobalStyles";
import { View, Text } from "../Themed";
import { Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { AppThemeContext } from "../../Theme";
import { useContext, useState, useEffect } from "react";
import Config from "../../Config";
import { AuthContext } from "../../app/_layout";
import { FontAwesome5, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import Modal, { ModalVariant } from "../Modal";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Button from "../Button";
import Popover from "../Popover";
import Utils, { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FileCard({
  file,
  size,
  showLabel = true,
  addPadding = true,
  onDelete,
  showOptions = true,
  onRefresh,
}: {
  file: any;
  size?: number;
  showLabel?: boolean;
  addPadding?: boolean;
  onDelete?: any;
  showOptions?: boolean;
  onRefresh?: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user, accessToken } = useContext(AuthContext);

  const [fileSource, setFileSource] = useState<string>(
    `${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`
  );

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const [height, setHeight] = useState<number>(
    Platform.select({ ios: true, android: true }) ? 140 : 240
  );
  const [width, setWidth] = useState<number>(
    Platform.select({ ios: true, android: true }) ? 200 : 280
  );

  // console.log("file: ", file);

  const deleteFileConfirm = () => {
    setModalText("Are you sure you want to delete this file?");
    setShowModal(true);
    setModalVariant(ModalVariant.confirmation);
  };

  const onModalConfirm = () => {
    deleteFile();
  };

  const deleteFile = async () => {
    console.log("deleting file.........", file.id);
    if (loading) return;
    setLoading(true);
    setModalText("");
    try {
      const URL = `${Config.API_URL}/files/${file.id}`;
      console.log("delete folder url: ", URL);
      const results = await Utils.makeDeleteRequest(URL);

      console.log("delete folder results: ", results);

      if (results.success) {
        if (onDelete) {
          onDelete(file);
        }
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Network Error deleting message");
      setModalText("Network Error, Please check your internet");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
    }
  };

  async function togglePublic() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/users/togglepublic`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          type: "file",
          itemId: file?.id,
        },
      });

      if (results.success) {
        setModalText(results.data.message);
        setModalVariant(ModalVariant.success);
        setShowModal(true);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setModalText(
        "A network error occurred, please check your internet and try again"
      );
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
      console.log("error toggling folder public");
    }
  }

  function selectForSharing() {
    router.setParams({ selectionId: `file_${file?.id}` });
    router.push({
      pathname: "/select",
      params: { selectionId: `file_${file?.id}` },
    });
  }

  async function confirmSharing() {
    // console.log("(file)confirming share.....");
    const storedSelectionId = await AsyncStorage.getItem("selectionId");
    let selection: any = await AsyncStorage.getItem("selectedSearch");

    // console.log("selections id: ", storedSelectionId, "selection: ", selection);
    if (selection && storedSelectionId === `file_${file?.id}`) {
      console.log("confirmed share...");
      setLoading(true);
      try {
        selection = JSON.parse(selection);

        if (!file.id) {
          return;
        }

        const body = {
          items: {
            file: file?.id,
          },
          users: selection.users,
          schools: selection.schools,
          classes: selection.classes,
          faculties: selection.faculties,
          programmes: selection.programmes,
          chats: selection.chats,
        };

        const URL = `${Config.API_URL}/auth/users/share`;

        const results = await Utils.makeBodyRequest({
          URL,
          method: BodyRequestMethods.PUT,
          body: body,
        });

        if (results.success) {
          setModalText("Successfully shared the file");
          setModalVariant(ModalVariant.success);
          setShowModal(true);
        } else {
          setModalText(results.message);
          setModalVariant(ModalVariant.danger);
          setShowModal(true);
        }
        setLoading(false);
        AsyncStorage.removeItem("selectedSearch");
        AsyncStorage.removeItem("selectionId");
      } catch (error) {
        AsyncStorage.removeItem("selectedSearch");
        AsyncStorage.removeItem("selectionId");
        setModalText(
          "A network error occured while trying to share, please check your network and try again"
        );
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
        setLoading(false);
        console.log("error Sharing file");
      }
    }
  }

  useEffect(() => {
    if (file.id) {
      setFileSource(`${Config.API_URL}/files?fid=${file.id}&t=${accessToken}`);
      confirmSharing();
    } else {
      setFileSource(file.uri);
    }
  }, [file]);

  useEffect(() => {
    let _width = Platform.select({ ios: true, android: true }) ? 140 : 240;
    let _height = Platform.select({ ios: true, android: true }) ? 200 : 280;

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
        styles.padding,
        styles.flexCenter,
        styles.margin,

        {
          position: "relative",
          backgroundColor: theme.backgroundMuted,
          borderRadius: 10,
          width: addPadding ? width + 40 : width,
          maxWidth: addPadding ? width + 40 : width,
          height: showLabel ? height + 20 : height,
          maxHeight: showLabel ? height + 20 : height,
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
        <View
          style={[
            styles.flexRow,

            {
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "transparent",
              paddingTop: 5,
              paddingHorizontal: Platform.select({ ios: true, android: true })
                ? undefined
                : 20,
              width: "100%",
            },
          ]}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              {
                marginTop: 5,
                width: showOptions ? "80%" : "100%",
                textAlign: showOptions ? "left" : "center",
              },
            ]}
          >
            {file.name}
          </Text>
          {user?.id === file?.owner?.id && showOptions && (
            <Popover
              isOpen={isPopoverOpen}
              setIsOpen={setIsPopoverOpen}
              variant="options"
              start="right"
              iconSize={20}
            >
              <View style={{ backgroundColor: "transparent" }}>
                <TouchableOpacity
                  style={[
                    styles.paddingH,
                    styles.flexRow,
                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingVertical: 3,
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => {
                    setIsPopoverOpen(false);
                    selectForSharing();
                  }}
                >
                  <AntDesign
                    name="sharealt"
                    size={24}
                    color={theme.primaryForeground}
                  />
                  <Text style={{ marginLeft: 10 }}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paddingH,
                    styles.flexRow,

                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingVertical: 3,
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => {
                    setIsPopoverOpen(false);
                    togglePublic();
                  }}
                >
                  {file &&
                    file?.id !== user?.rootFolderId &&
                    file?.Access?.isPublic && (
                      <MaterialIcons
                        onPress={() => togglePublic()}
                        name="public"
                        size={24}
                        color={theme.foreground}
                        style={{ marginHorizontal: 5 }}
                      />
                    )}

                  {file &&
                    file?.id !== user?.rootFolderId &&
                    !file?.Access?.isPublic && (
                      <MaterialIcons
                        onPress={() => togglePublic()}
                        name="public-off"
                        size={24}
                        color={theme.foreground}
                        style={{ marginHorizontal: 5 }}
                      />
                    )}
                  <Text style={{ marginLeft: 10 }}>
                    {file?.Access?.isPublic ? " Public" : "Not Public"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paddingH,
                    styles.flexRow,

                    {
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingVertical: 3,
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => {
                    setIsPopoverOpen(false);
                    deleteFileConfirm();
                  }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={24}
                    color={theme.destructive}
                  />
                  <Text style={{ marginLeft: 10 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Popover>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
