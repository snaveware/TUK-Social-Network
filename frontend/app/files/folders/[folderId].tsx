import GlobalStyles from "../../../GlobalStyles";
import { StyleSheet, FlatList, Dimensions, RefreshControl } from "react-native";
import { Text, View } from "../../../components/Themed";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { AppThemeContext } from "../../../Theme";
import { AuthContext } from "../../_layout";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import Config from "../../../Config";
import Utils from "../../../Utils";
import { Image, Platform, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../../../components/VideoPlayer";
import { Entypo } from "@expo/vector-icons";
const Favicon = require("../../../assets/images/favicon.png");
import FileCard from "../../../components/files/FileCard";
import FolderCard from "../../../components/files/FolderCard";
import Dismissable from "../../../components/Dismissable";
import Modal, { ModalVariant } from "../../../components/Modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FolderView from "../../../components/files/FolderView";

export default function SingleFolderPage() {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const [folder, setFolder] = useState<any>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState<number>(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();
  const router = useRouter();
  const [dismissableMessage, setDismissableMessage] = useState<string>();

  const [dismissableVariant, setDismissableVariant] = useState<
    "info" | "danger" | "success"
  >("info");

  console.log("params: ", params);

  useEffect(() => {
    if (folder) {
      navigation.setOptions({
        title: folder?.path,
      });
    }
  }, [folder]);

  useEffect(() => {
    navigation.addListener("focus", () => {
      if (params.folderId) {
        fetchFolder();
      }
    });
  }, []);

  useEffect(() => {
    if (params.folderId) {
      fetchFolder();

      navigation.setOptions({
        headerRight: () => {
          return (
            <Link
              href={{
                pathname: "/files/NewFolder",
                params: {
                  folderId: params.folderId,
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
  }, [params]);

  async function fetchFolder() {
    console.log("fetching folder>......");
    try {
      if (loading) return;
      setLoading(true);
      const URL = `${Config.API_URL}/files/folder?fid=${params.folderId}&t=${accessToken}`;

      const results = await Utils.makeGetRequest(URL);

      console.log("folder request results: ", results, URL);

      if (results.success) {
        setFolder(results.data);
      } else {
        setDismissableVariant("danger");
        setDismissableMessage(results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error fetching folder: ", error);
    }
  }

  async function deleteFolder() {
    console.log("deleting folder--------");
    if (loading) return;
    setLoading(true);
    setDismissableMessage(undefined);
    try {
      const URL = `${Config.API_URL}/files/folder/${params.folderId}`;
      console.log("delete folder url: ", URL);
      const results = await Utils.makeDeleteRequest(URL);

      console.log("delete folder results: ", results);

      if (results.success) {
        fetchFolder();
      } else {
        setDismissableMessage(results.message);
        setDismissableVariant("danger");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Network Error deleting message");
      setDismissableMessage("Network Error, Please check your internet");
      setDismissableVariant("danger");
    }
  }

  return (
    <FolderView
      folderId={
        params.folderId && typeof params.folderId == "string"
          ? params.folderId
          : ""
      }
    />
    // <KeyboardAwareScrollView
    //   style={{ paddingLeft: 10, backgroundColor: theme.background, flex: 1 }}
    //   showsVerticalScrollIndicator={false}
    //   refreshControl={
    //     <RefreshControl refreshing={loading} onRefresh={fetchFolder} />
    //   }
    // >
    //   <View
    //     style={[
    //       GlobalStyles.flexRow,
    //       {
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //         paddingTop: 20,
    //       },
    //       styles.padding,
    //     ]}
    //   >
    //     {folder?.ownerId === authUser?.id && (
    //       <View
    //         style={[
    //           GlobalStyles.flexRow,
    //           {
    //             justifyContent: "space-between",
    //             alignItems: "center",
    //             width: "100%",
    //           },
    //         ]}
    //       >
    //         <Text style={{ fontSize: 18, fontWeight: "500" }}>
    //           {folder?.name}
    //         </Text>
    //         <View
    //           style={[
    //             styles.flexRow,
    //             { justifyContent: "flex-end", alignItems: "center" },
    //           ]}
    //         >
    //           <AntDesign
    //             onPress={() =>
    //               router.push({
    //                 pathname: "/files/NewFile",
    //                 params: { folderId: params.folderId },
    //               })
    //             }
    //             name="addfile"
    //             size={24}
    //             color={theme.foreground}
    //             style={{ marginRight: 15 }}
    //           />
    //           <AntDesign
    //             name="sharealt"
    //             size={24}
    //             style={{ marginHorizontal: 15 }}
    //             color={theme.foreground}
    //           />
    //           {folder?.path && (
    //             <MaterialIcons
    //               name="delete-outline"
    //               size={30}
    //               onPress={deleteFolder}
    //               color={theme.destructive}
    //             />
    //           )}
    //         </View>
    //       </View>
    //     )}
    //   </View>

    //   {dismissableMessage && (
    //     <Dismissable
    //       onDismiss={() => setDismissableMessage(undefined)}
    //       isDismissed={dismissableMessage ? true : false}
    //       variant={dismissableVariant}
    //       message={dismissableMessage}
    //     />
    //   )}

    //   {folder?.childFolders && folder?.childFolders?.length > 0 && (
    //     <Text
    //       ellipsizeMode="head"
    //       numberOfLines={1}
    //       style={[styles.title, styles.padding, { marginLeft: 12 }]}
    //     >
    //       Folders
    //     </Text>
    //   )}

    //   <View
    //     style={[
    //       styles.flexRow,

    //       {
    //         justifyContent: "flex-start",
    //         alignItems: "center",
    //         flexWrap: "wrap",
    //       },
    //     ]}
    //   >
    //     {folder?.childFolders &&
    //       folder?.childFolders?.length > 0 &&
    //       folder.childFolders.map((childFolder: any, index: number) => {
    //         return (
    //           // <TouchableOpacity
    //           //   key={index}
    //           //   onPress={() => {
    //           //     setActiveFolderId(childFolder.id);
    //           //   }}
    //           //   style={[
    //           //     styles.flexCols,
    //           //     styles.padding,
    //           //     styles.margin,
    //           //     {
    //           //       borderWidth: 1,
    //           //       borderColor: theme.border,
    //           //       borderRadius: 2,
    //           //       overflow: "hidden",
    //           //     },
    //           //   ]}
    //           // >
    //           <FolderCard key={index} folder={childFolder} />
    //           // </TouchableOpacity>
    //         );
    //       })}
    //   </View>

    //   {folder?.files && folder?.files?.length > 0 && (
    //     <Text
    //       ellipsizeMode="head"
    //       numberOfLines={1}
    //       style={[styles.title, styles.padding, { marginLeft: 12 }]}
    //     >
    //       Files
    //     </Text>
    //   )}

    //   <View
    //     style={[
    //       {
    //         display: "flex",
    //         flexDirection: "row",
    //         justifyContent: "flex-start",
    //         alignItems: "center",
    //         flexWrap: "wrap",
    //       },
    //     ]}
    //   >
    //     {folder &&
    //       folder?.files &&
    //       folder?.files?.length > 0 &&
    //       folder.files.map((file: any, index: number) => {
    //         return (
    //           <FileCard
    //             key={index}
    //             file={file}
    //             onDelete={() => {
    //               fetchFolder();
    //             }}
    //           />
    //         );
    //       })}
    //   </View>
    // </KeyboardAwareScrollView>
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
