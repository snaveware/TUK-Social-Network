import GlobalStyles from "../GlobalStyles";
import {
  KeyboardAvoidingView,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { Text, View, TextInput } from "../components/Themed";
import { useEffect, useState, useContext } from "react";
import { Link, useRouter } from "expo-router";
import { AuthContext } from "./_layout";
import DefaultAppTheme from "../Theme";
import Button from "../components/Button";
import Utils from "../Utils";
import Config from "../Config";
const AdaptiveIcon = require("../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../Utils";

export default function LoginEmailScreen({ navigation }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState<string>();
  const [errors, setErrors] = useState<any>({});

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
      console.log("Send Email Results: ", results);
      if (results.verificationToken) {
        router.push({
          pathname: "/LoginCode",
          params: {
            verificationToken: results.verificationToken,
            expiresAt: results.expiresAt,
          },
        });
      } else {
        console.log("Sending Email Failed");
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
    <View style={styles.fullView}>
      <KeyboardAvoidingView
        style={[styles["pt-25"], styles.keyboardAvoidingView]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.LogoContainer]}>
          <Image source={AdaptiveIcon} style={styles.logo} />
        </View>

        <Text style={styles.label}>University Email</Text>
        <TextInput
          value={email}
          placeholder="Eg. guest@tukenya.ac.ke"
          onChangeText={(value) => setEmail(value)}
          style={styles.input}
        />

        <Text style={styles.error}>{errors.email}</Text>
        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={sendEmail}
            text="Continue"
            style={{ paddingHorizontal: 50 }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
