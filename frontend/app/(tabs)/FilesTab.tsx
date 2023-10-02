import { StyleSheet } from "react-native";

import { useContext, useEffect } from "react";
import { Text, View } from "../../components/Themed";
import GlobalStyles from "../../GlobalStyles";
import { AuthContext } from "../_layout";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AntDesign } from "@expo/vector-icons";
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

  return (
    <View style={{ flex: 1 }}>
      {user && user.id && (
        <FolderView folderId={user.rootFolderId.toString()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  container: {
    flex: 1,
  },
});
