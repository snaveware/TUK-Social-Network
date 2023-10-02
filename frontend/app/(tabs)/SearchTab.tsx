import { SafeAreaView } from "react-native-safe-area-context";
import { useContext } from "react";
import { StyleSheet } from "react-native";
import { AppThemeContext } from "../../Theme";
import GlobalStyles from "../../GlobalStyles";
import MultiSearch, { SearchTypes } from "../../components/MultiSearch";

export default function searchTab() {
  const { theme } = useContext(AppThemeContext);
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }]}>
      <MultiSearch
        searchTypes={[
          SearchTypes.files,
          SearchTypes.folders,
          SearchTypes.users,
          SearchTypes.posts,
          SearchTypes.classes,
          SearchTypes.programmes,
          SearchTypes.schools,
          SearchTypes.faculties,
        ]}
        mode="search"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
