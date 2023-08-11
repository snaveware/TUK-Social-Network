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
import Utils from "../../Utils";
import { Image, Platform, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../VideoPlayer";
import { Entypo } from "@expo/vector-icons";
const Favicon = require("../../assets/images/favicon.png");
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";

export default function FolderView({ user }: { user: any }) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);

  const [activeFolderId, setActiveFolderId] = useState<any>(user.rootFolderId);
  const [folder, setFolder] = useState<any>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState<number>(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();
  const router = useRouter();
  console.log("folder: ", user.rootFolderId);

  // useEffect(() => {
  //   setActiveFolderId(user.rootFolderId);
  // }, [user]);

  useEffect(() => {
    if (folder) {
      navigation.setOptions({
        // title: "Files",
        headerLeft: () => {
          return (
            <View
              style={[
                styles.flexRow,
                styles.flexCenter,
                { backgroundColor: "transparent", marginLeft: 15 },
              ]}
            >
              {/* {folder?.parentFolderId && (
                <AntDesign
                  onPress={() => {
                    setActiveFolderId(folder.parentFolderId);
                  }}
                  name="arrowleft"
                  size={24}
                  color={theme.secondary}
                  style={{ marginRight: 10 }}
                />
              )} */}
              <Image source={Favicon} style={{ width: 36, height: 36 }} />
            </View>
          );
        },
      });
    }
  }, [folder]);

  useEffect(() => {
    if (activeFolderId && accessToken) {
      fetchFolder();
      navigation.addListener("focus", () => {
        fetchFolder();
      });
    }
  }, [activeFolderId, accessToken]);

  useEffect(() => {
    if (folder) {
      console.log("folder change: ", folder.files.length);
    }
  }, [folder]);

  async function fetchFolder() {
    try {
      if (loading) return;
      setLoading(true);
      const URL = `${Config.API_URL}/files/folder?fid=${activeFolderId}&t=${accessToken}`;

      const results = await Utils.makeGetRequest(URL);

      // console.log("folder request results: ", results.data);

      if (results.success) {
        setFolder(results.data);
      } else {
        setError(results.message);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error fetching folder: ", error);
    }
  }

  return (
    <View>
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
        {folder?.parentFolderId && (
          <AntDesign
            onPress={() => {
              setActiveFolderId(folder.parentFolderId);
              console.log("back folder: ", folder.parentFolderId);
            }}
            name="arrowleft"
            size={24}
            color={theme.secondary}
            style={{ marginRight: 10 }}
          />
        )}

        <Text
          ellipsizeMode="head"
          numberOfLines={1}
          style={[styles.title, styles.padding]}
        >
          {folder?.path || "My Drive"}
        </Text>

        {user?.id === authUser?.id && (
          <View
            style={[
              GlobalStyles.flexRow,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <AntDesign
              onPress={() =>
                router.push({
                  pathname: "/files/NewFile",
                  params: { folderId: activeFolderId },
                })
              }
              name="addfile"
              size={24}
              color={theme.foreground}
            />
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
          </View>
        )}
      </View>

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
          {
            display: "flex",
            flexDirection: "row-reverse",
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
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActiveFolderId(childFolder.id);
                }}
                style={[
                  styles.flexCols,
                  styles.padding,
                  styles.margin,
                  {
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 2,
                    overflow: "hidden",
                  },
                ]}
              >
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
            flexDirection: "row-reverse",
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
            return <FileCard key={index} file={file} />;
          })}
      </View>
    </View>
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
