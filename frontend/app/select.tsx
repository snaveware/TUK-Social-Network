import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import { AppThemeContext } from "../Theme";
import GlobalStyles from "../GlobalStyles";
import MultiSearch, { SearchTypes } from "../components/MultiSearch";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function select() {
  const { theme } = useContext(AppThemeContext);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.selectionId && typeof params.selectionId === "string") {
      AsyncStorage.setItem("selectionId", params.selectionId);
    }
  }, [params]);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }]}>
      <MultiSearch
        searchTypes={[
          SearchTypes.users,
          SearchTypes.classes,
          SearchTypes.programmes,
          SearchTypes.schools,
          SearchTypes.faculties,
          SearchTypes.chats,
        ]}
        mode="select"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
