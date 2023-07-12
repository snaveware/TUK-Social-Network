import GlobalStyles from "../GlobalStyles";
import {
  KeyboardAvoidingView,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, TextInput } from "../components/Themed";
import { useEffect, useState, useContext } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from "./_layout";
import DefaultAppTheme from "../Theme";
import Button from "../components/Button";
import Utils from "../Utils";
import Config from "../Config";
const AdaptiveIcon = require("../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../Utils";

export default function LoginCodeScreen({ navigation }: any) {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [code, setCode] = useState<string>();
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/(tabs)");
    }
  }, []);

  async function login() {
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      const URL = `${Config.API_URL}/auth/login`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { OTPCode: code, verificationToken: params.verificationToken },
      });
      console.log("Login Results: ", results);

      if (results.user && results.accessToken && results.refreshToken) {
        await AsyncStorage.setItem("user", JSON.stringify(results.user));
        await AsyncStorage.setItem(
          "accessToken",
          JSON.stringify(results.accessToken)
        );
        await AsyncStorage.setItem(
          "refreshToken",
          JSON.stringify(results.refreshToken)
        );

        router.push("/(tabs)");
      } else if (results.verificationToken) {
        console.log("New User: Go To setup Account");
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Verifying Code: ", error);
    }
  }

  function isInputValid() {
    const theErrors: any = {};
    let hasErrors = false;
    if (!code || code.trim() === "") {
      theErrors.email = "Your Code is Required";
      hasErrors = true;
    }

    setErrors(theErrors);

    return !hasErrors;
  }

  return (
    <View style={styles.fullView}>
      <KeyboardAvoidingView
        style={[styles["pt-25"], styles.keyboardAvoidingView]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.LogoContainer]}>
          <Image source={AdaptiveIcon} style={styles.logo} />
        </View>

        <Text style={styles.infoMessage}>
          An email with your verification code has been sent to you{" "}
        </Text>
        <Text style={styles.label}>Enter Code</Text>
        <TextInput
          value={code}
          placeholder="Eg. 4EBC80"
          onChangeText={(value) => setCode(value)}
          style={styles.input}
        />

        <Text style={styles.error}>{errors.email}</Text>
        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={login}
            text="Login"
            style={{ paddingHorizontal: 50 }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  infoMessage: {
    fontWeight: "600",
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: DefaultAppTheme.primary,
    padding: 10,
    marginVertical: 20,
  },
});
