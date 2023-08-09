import GlobalStyles from "../../GlobalStyles";
import { StyleSheet, FlatList, Dimensions } from "react-native";
import { Text, View } from "../../components/Themed";
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

export default function FileView({
  user,
  folderId,
}: {
  user: any;
  folderId: number;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user: authUser, accessToken } = useContext(AuthContext);

  const [activeFolderId, setActiveFolderId] = useState<any>(folderId);
  const [folder, setFolder] = useState<any>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState<number>(
    Dimensions.get("window").width
  );
  const navigation = useNavigation();
  const router = useRouter();
  const stack: number[] = [];
  stack.push(folderId);
  useEffect(() => {
    stack.push(folderId);
    setActiveFolderId(folderId);

    console.log("stack: ", stack);
  }, [folderId]);

  useEffect(() => {
    if (folder) {
      navigation.setOptions({
        title: folder.path || "Files",

        headerLeft: () => {
          return (
            <View
              style={[
                styles.flexRow,
                styles.flexCenter,
                { backgroundColor: "transparent", marginLeft: 15 },
              ]}
            >
              <AntDesign
                onPress={() => {
                  console.log("stack: ", stack);
                  if (stack.length < 1) {
                    router.back();
                  } else {
                    setActiveFolderId(stack.pop());
                  }
                }}
                name="arrowleft"
                size={24}
                color={theme.secondary}
                style={{ marginRight: 10 }}
              />
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
    <View style={styles.container}>
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
        {(user?.id === authUser?.id ||
          (folder?.childFolder && folder.childFolders.length > 0)) && (
          <Text style={[styles.title, styles.padding]}>Folders</Text>
        )}

        {user?.id === authUser?.id && (
          <View
            style={[
              GlobalStyles.flexRow,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <AntDesign
              onPress={() => router.push("/files/NewFile")}
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

      {folder && folder?.childFolders && folder?.childFolders?.length > 0 && (
        <FlatList
          refreshing={loading}
          onRefresh={fetchFolder}
          data={folder.childFolders}
          style={{ height: "30%" }}
          numColumns={Platform.select({ android: true, ios: true }) ? 2 : 4}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                console.log("stack: ", stack);
                stack.push(item.id);
                setActiveFolderId(item.id);
              }}
              style={[
                styles.flexCols,
                styles.padding,
                {
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 2,
                  overflow: "hidden",
                },
              ]}
            >
              <View
                style={[
                  styles.flexRow,
                  {
                    justifyContent: "space-between",
                    width: SCREEN_WIDTH * 0.44,
                  },
                ]}
              >
                <Text>{item.name}</Text>
                <Entypo
                  name="dots-three-vertical"
                  size={24}
                  color={theme.foreground}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {folder && folder?.files && folder?.files?.length > 0 && (
        <FlatList
          ListHeaderComponent={() => {
            return <Text style={[styles.title, styles.padding]}>Files</Text>;
          }}
          style={[styles.padding, { overflow: "scroll" }]}
          numColumns={Platform.select({ android: true, ios: true }) ? 2 : 4}
          data={folder.files}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: "files/[fileId]",
                params: { fileId: item.id },
              }}
            >
              {item.type === "image" && (
                <View
                  style={[
                    styles.flexCols,
                    styles.padding,
                    {
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 2,
                      overflow: "hidden",
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: `${Config.API_URL}/files?fid=${item.id}&t=${accessToken}`,
                    }}
                    style={{
                      width: Platform.select({ ios: true, android: true })
                        ? 180
                        : 300,
                      height: Platform.select({ ios: true, android: true })
                        ? 180
                        : 300,
                    }}
                  />
                  {/* <Text>{item.name}</Text> */}
                </View>
              )}
              {item.type === "video" && (
                <Video
                  source={{
                    uri: `${Config.API_URL}/files?fid=${item.id}&t=${accessToken}`,
                  }}
                  style={{
                    width: Platform.select({ ios: true, android: true })
                      ? 180
                      : 300,
                    height: Platform.select({ ios: true, android: true })
                      ? 180
                      : 300,
                  }}
                />
              )}

              {item.type == "word" && (
                <View>
                  <Text>{item.name}</Text>
                </View>
              )}
              {item.type == "pdf" && (
                <View>
                  <Text>{item.name}</Text>
                </View>
              )}
            </Link>
          )}
        />
      )}
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
