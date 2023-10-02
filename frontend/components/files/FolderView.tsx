import GlobalStyles from "../../GlobalStyles";
import { StyleSheet, FlatList, Dimensions } from "react-native";
import { Text, View } from "../Themed";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import Config from "../../Config";
import Utils, { BodyRequestMethods } from "../../Utils";
import {
  Image,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../VideoPlayer";
import { Entypo } from "@expo/vector-icons";
const Favicon = require("../../assets/images/favicon.png");
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";
import Dismissable from "../Dismissable";
import Modal, { ModalVariant } from "../Modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function FolderView({ folderId }: { folderId: string }) {
  const { theme } = useContext(AppThemeContext);
  const params = useLocalSearchParams();
  const { user: authUser, accessToken } = useContext(AuthContext);
  const [folder, setFolder] = useState<any>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState<number>(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();
  const router = useRouter();

  // const [dismissableMessage, setDismissableMessage] = useState<string>();

  // const [dismissableVariant, setDismissableVariant] = useState<
  //   "info" | "danger" | "success"
  // >("info");

  const [modalText, setModalText] = useState<string>("");
  const [modalVariant, setModalVariant] = useState<ModalVariant>();

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (folder) {
      navigation.setOptions({
        title: folder?.path,
      });
    }
    confirmSharing();
  }, [folder]);

  useEffect(() => {
    if (folderId) {
      navigation.addListener("focus", () => {
        if (folderId) {
          fetchFolder();
        }
      });

      fetchFolder();
      navigation.setOptions({
        headerRight: () => {
          return (
            <Link
              href={{
                pathname: "/files/NewFolder",
                params: {
                  folderId: folderId,
                },
              }}
              style={{ marginRight: 20 }}
              asChild
            >
              <AntDesign name="addfolder" size={24} color={theme.foreground} />
            </Link>
          );
        },
      });
    }
  }, []);

  const deleteFolderConfirm = () => {
    setModalText("Are you sure you want to delete this folder?");
    setShowModal(true);
    setModalVariant(ModalVariant.confirmation);
  };

  const onModalConfirm = () => {
    deleteFolder();
  };

  async function fetchFolder() {
    try {
      console.log("active folder id: ", folderId);
      if (!folderId) {
        setModalText("No Folder Id");
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      if (loading) return;
      setLoading(true);
      const URL = `${Config.API_URL}/files/folder?fid=${folderId}&t=${accessToken}`;

      const results = await Utils.makeGetRequest(URL);

      console.log("folder request results: ", results, URL);

      if (results.success) {
        setFolder(results.data);
      } else {
        setModalText(results.message);
        setModalVariant(ModalVariant.danger);
        setShowModal(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error fetching folder: ", error);

      setModalText("Network Error, Please check your internet");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
    }
  }

  async function deleteFolder() {
    console.log("deleting folder--------");
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/files/folder/${folderId}`;
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

      console.log("Network Error deleting folder");
      setModalText("Network Error, Please check your internet");
      setModalVariant(ModalVariant.danger);
      setShowModal(true);
    }
  }

  async function confirmSharing() {
    // console.log("(folder)confirming share.....");
    const storedSelectionId = await AsyncStorage.getItem("selectionId");
    let selection: any = await AsyncStorage.getItem("selectedSearch");

    if (selection && storedSelectionId === `folder_${folderId}`) {
      console.log("confirmed share...");
      setLoading(true);
      try {
        selection = JSON.parse(selection);

        const body = {
          items: {
            folder: folderId,
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
          setModalText("Successfully shared the folder");
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
        console.log("error Sharing folder");
      }
    }
  }

  async function togglePublic() {
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/auth/users/togglepublic`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.PUT,
        body: {
          type: "folder",
          itemId: folderId,
        },
      });

      if (results.success) {
        fetchFolder();
        setModalText(results.data.message);
        setModalVariant(ModalVariant.success);
        setShowModal(true);
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
    router.setParams({ selectionId: `folder_${folderId}` });
    router.push({
      pathname: "/select",
      params: { selectionId: `folder_${folderId}` },
    });
  }

  return (
    <KeyboardAwareScrollView
      style={{ paddingLeft: 10, backgroundColor: theme.background, flex: 1 }}
      // showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchFolder} />
      }
    >
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        variant={modalVariant}
        message={modalText}
        onConfirm={onModalConfirm}
      />
      <View
        style={[
          GlobalStyles.flexRow,
          {
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 20,
          },

          styles.padding,
        ]}
      >
        <Text
          ellipsizeMode="head"
          numberOfLines={1}
          style={[styles.title, styles.padding, { width: "50%" }]}
        >
          {folder && folder?.id === authUser?.rootFolderId
            ? "My Drive"
            : folder?.name}
        </Text>

        {(folder?.ownerId === authUser?.id ||
          folder?.ownerAsRootFolder?.id === authUser?.id) && (
          <View
            style={[
              GlobalStyles.flexRow,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <Link
              href={{
                pathname: "/files/NewFolder",
                params: {
                  folderId: folder?.id,
                },
              }}
              style={{ marginRight: 20 }}
              asChild
            >
              <AntDesign name="addfolder" size={24} color={theme.foreground} />
            </Link>

            <AntDesign
              onPress={() =>
                router.push({
                  pathname: "/files/NewFile",
                  params: { folderId: folderId },
                })
              }
              name="addfile"
              size={24}
              color={theme.foreground}
              style={{ marginHorizontal: 5 }}
            />

            {folder?.path && (
              <>
                <AntDesign
                  name="sharealt"
                  size={24}
                  style={{ marginHorizontal: 5 }}
                  color={theme.foreground}
                  onPress={selectForSharing}
                />
                <MaterialIcons
                  name="delete-outline"
                  size={30}
                  onPress={deleteFolderConfirm}
                  color={theme.destructive}
                  style={{ marginHorizontal: 5 }}
                />
              </>
            )}
            {folder &&
              folder?.id !== authUser?.rootFolderId &&
              folder?.Access?.isPublic && (
                <MaterialIcons
                  onPress={() => togglePublic()}
                  name="public"
                  size={24}
                  color={theme.foreground}
                  style={{ marginHorizontal: 5 }}
                />
              )}

            {folder &&
              folder?.id !== authUser?.rootFolderId &&
              !folder?.Access?.isPublic && (
                <MaterialIcons
                  onPress={() => togglePublic()}
                  name="public-off"
                  size={24}
                  color={theme.foreground}
                  style={{ marginHorizontal: 5 }}
                />
              )}
          </View>
        )}
      </View>

      {/* {dismissableMessage && (
        <Dismissable
          onDismiss={() => setDismissableMessage(undefined)}
          isDismissed={dismissableMessage ? true : false}
          variant={dismissableVariant}
          message={dismissableMessage}
        />
      )} */}

      {folder?.childFolders && folder?.childFolders?.length > 0 && (
        <Text
          ellipsizeMode="head"
          numberOfLines={1}
          style={[styles.title, styles.padding, { marginLeft: 12 }]}
        >
          Folders
        </Text>
      )}

      <View
        style={[
          styles.flexRow,

          {
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          },
        ]}
      >
        {folder?.childFolders &&
          folder?.childFolders?.length > 0 &&
          folder.childFolders.map((childFolder: any, index: number) => {
            return (
              <TouchableOpacity key={index}>
                <FolderCard folder={childFolder} />
              </TouchableOpacity>
            );
          })}
      </View>

      {folder?.files && folder?.files?.length > 0 && (
        <Text
          ellipsizeMode="head"
          numberOfLines={1}
          style={[styles.title, styles.padding, { marginLeft: 12 }]}
        >
          Files
        </Text>
      )}

      <View
        style={[
          {
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          },
        ]}
      >
        {folder &&
          folder?.files &&
          folder?.files?.length > 0 &&
          folder.files.map((file: any, index: number) => {
            return (
              <FileCard
                key={index}
                file={file}
                onRefresh={fetchFolder}
                onDelete={() => {
                  fetchFolder();
                }}
              />
            );
          })}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  container: {
    flex: 1,
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
