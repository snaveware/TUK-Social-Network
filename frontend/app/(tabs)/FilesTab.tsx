import { StyleSheet } from "react-native";

import { useContext, useEffect } from "react";
import { Text, View } from "../../components/Themed";
import GlobalStyles from "../../GlobalStyles";
import { AuthContext } from "../_layout";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { AppThemeContext } from "../../Theme";
import FolderView from "../../components/files/FolderView";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function FilesTabScreen({
  navigation: propNav,
}: {
  navigation: any;
}) {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useContext(AppThemeContext);
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={[styles.flexRow, { backgroundColor: "transparent" }]}>
          <Link href="Notifications" asChild>
            <Pressable>
              {({ pressed }) => (
                <FontAwesome
                  name="bell"
                  size={28}
                  color={theme.foreground}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
          <Link href="files/Search">
            <Pressable>
              {({ pressed }) => (
                <MaterialIcons
                  name="search"
                  size={32}
                  color={theme.foreground}
                  style={{
                    marginHorizontal: 15,
                    fontWeight: "bold",
                    opacity: pressed ? 0.5 : 1,
                  }}
                />
              )}
            </Pressable>
          </Link>

          <Link
            href={{
              pathname: "/files/NewFolder",
              params: {
                folderId: user?.rootFolderId,
              },
            }}
            asChild
          >
            <Pressable
            // onPress={() => {
            //   navigation.getParent()?.getParent()?.navigate("files/NewFolder");
            //   console.log("navigating to : /files/NewFolder");
            //   // router.push("/files/NewFolder");
            // }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="plus"
                  size={30}
                  color={theme.foreground}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        </View>
      ),
    });
  }, [user]);
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
    >
      {user && user.id && <FolderView user={user} />}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  container: {
    flex: 1,
  },
});
