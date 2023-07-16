import { StyleSheet } from "react-native";
import { Text } from "../../components/Themed";
import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetupStaff() {
  return (
    <SafeAreaView>
      <Text style={[styles.center, styles.paddingV]}> Staff</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  ...GlobalStyles,
});
