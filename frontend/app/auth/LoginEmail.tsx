import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Platform } from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useState, useContext } from "react";
import { Link, useRouter } from "expo-router";
import { AuthContext } from "../_layout";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Button from "../../components/Button";
import Utils from "../../Utils";
import Config from "../../Config";
const AdaptiveIcon = require("../../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function LoginEmailScreen({ navigation }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState<string>(
    Platform.OS == "android"
      ? "evansmwenda006@gmail.com"
      : "muneneevans018@gmail.com"
  );
  const [errors, setErrors] = useState<any>({});
  const { theme } = useContext(AppThemeContext);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/(tabs)");
    }
  }, []);

  async function sendEmail() {
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      const URL = `${Config.API_URL}/auth/sendemailcode`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { email: email },
      });
      // console.log("Send Email Results: ", results);
      if (results.success) {
        router.push({
          pathname: "/auth/LoginCode",
          params: {
            verificationToken: results.data.verificationToken,
            expiresAt: results.data.expiresAt,
            email: email,
          },
        });
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Sending Email: ", error);
    }
  }

  function isInputValid() {
    const theErrors: any = {};
    let hasErrors = false;
    if (!email || email.trim() === "") {
      theErrors.email = "Email is Required";
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
          <Text style={[styles.label, styles.paddingV]}>University Email</Text>
          <TextInput
            value={email}
            placeholder="Eg. guest@tukenya.ac.ke"
            onChangeText={(value) => setEmail(value)}
            style={[styles.input, styles.paddingV]}
          />
        </View>

        <Text style={styles.error}>{errors.email}</Text>
        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={sendEmail}
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
