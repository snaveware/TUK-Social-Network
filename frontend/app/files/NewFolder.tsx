import { StatusBar } from "expo-status-bar";
import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Platform } from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useState, useContext } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from "../_layout";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Button from "../../components/Button";
import Utils from "../../Utils";
import Config from "../../Config";
const AdaptiveIcon = require("../../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function NewFolderScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [folderName, setFolderName] = useState<string>("Unit 1");
  const [errors, setErrors] = useState<any>({});
  const { theme } = useContext(AppThemeContext);

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     router.push("/(tabs)");
  //   }
  // }, []);

  async function createFolder() {
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    const parentFolderId = params.parentFolderId;

    if (!parentFolderId) {
      setErrors({
        global: "Parent folder is needed",
      });
      return;
    }

    try {
      const URL = `${Config.API_URL}/files/folder`;
      // console.log("new folder: ", parentFolderId, folderName);

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { folderName: folderName, parentFolderId: parentFolderId },
      });
      // console.log("create folder results: ", results);
      if (results.success) {
        router.back();
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error creating Folder: ", error);
    }
  }

  function isInputValid() {
    const theErrors: any = {};
    let hasErrors = false;
    if (!folderName || folderName.trim() === "") {
      theErrors.email = "Folder Name is Required";
      hasErrors = true;
    }

    setErrors(theErrors);

    return !hasErrors;
  }

  return (
    <SafeAreaView
      style={[styles.fullView, { backgroundColor: theme.background }]}
    >
      <KeyboardAwareScrollView
        style={[styles["pt-25"], styles.keyboardAvoidingView]}
      >
        <View style={[styles.LogoContainer]}>
          <Image source={AdaptiveIcon} style={styles.logo} />
        </View>

        {errors.global && (
          <Text style={[styles.error, styles.errorBorder]}>
            {errors.global}
          </Text>
        )}

        <View style={[styles.inputContainer]}>
          <Text style={[styles.label, styles.paddingV]}>Folder Name</Text>
          <TextInput
            value={folderName}
            placeholder="Eg. Notes"
            onChangeText={(value) => setFolderName(value)}
            style={[styles.input, styles.paddingV]}
          />
        </View>

        <Text style={styles.error}>{errors.name}</Text>
        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={createFolder}
            text="Continue"
            style={{ paddingHorizontal: 50 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
