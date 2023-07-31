import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useState, useContext } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from "../_layout";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Button, { ButtonVariant } from "../../components/Button";
import Utils from "../../Utils";
import Config from "../../Config";
const AdaptiveIcon = require("../../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../../Utils";

export default function LoginCodeScreen({ navigation }: any) {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn, setUser, setIsLoggedIn, user } = useContext(AuthContext);
  const [code, setCode] = useState<string>();
  const [errors, setErrors] = useState<any>({});
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [verificationToken, setVerificationToken] = useState<any>();
  const { theme } = useContext(AppThemeContext);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/(tabs)");
    }

    setVerificationToken(params.verificationToken);
  }, []);

  useEffect(() => {
    if (resendCountdown > 0) {
      countResend();
    }
  }, [resendCountdown]);

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
        body: { OTPCode: code, verificationToken: verificationToken },
      });
      console.log("Login Results: ", results);

      if (results.success) {
        if (results.status === 206) {
          if (results.data.roleName === "student") {
            router.push({
              pathname: "/auth/SetupStudent",
              params: {
                verificationToken: results.data.verificationToken,
              },
            });
          } else if (results.data.roleName === "staff") {
            router.push({
              pathname: "/auth/SetupStaff",
              params: { verificationToken: results.data.verificationToken },
            });
          }
          return;
        }

        setUser(results.data.user);
        setIsLoggedIn(true);
        await AsyncStorage.setItem("user", JSON.stringify(results.data.user));
        await AsyncStorage.setItem("accessToken", results.data.accessToken);
        await AsyncStorage.setItem("refreshToken", results.data.refreshToken);

        router.push("/(tabs)");
      } else {
        setErrors({
          global: results.message,
        });
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
      theErrors.code = "Your Code is Required";
      hasErrors = true;
    }

    setErrors(theErrors);

    return !hasErrors;
  }

  function countResend() {
    if (resendCountdown < 1) return;
    setTimeout(() => {
      setResendCountdown((prevValue) => {
        return prevValue - 1;
      });
    }, 1000);
  }

  async function onResendCode() {
    if (loading) return;
    setLoading(true);

    console.log("resending code...........");

    try {
      const URL = `${Config.API_URL}/auth/sendemailcode`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { email: params.email },
      });
      console.log("Send Email Code Results: ", results);
      if (results.success) {
        setResendCountdown(60);
        setVerificationToken(results.data.verificationToken);
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error ResendSending Email Code: ", error);
    }
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
        {!loading && !errors.global && (
          <Text style={styles.infoMessage}>
            An email with your verification code has been sent to you{" "}
          </Text>
        )}
        <Text style={styles.label}>Enter Code</Text>
        <TextInput
          value={code}
          placeholder="Eg. 4EBC80"
          onChangeText={(value) => setCode(value)}
          style={styles.input}
        />

        <View style={styles.resendContainer}>
          <Text>Didn't get code?</Text>
          <Button
            onPress={() => {
              if (resendCountdown > 0) return;
              onResendCode();
            }}
            text={`${resendCountdown > 0 ? resendCountdown : ""} Resend`}
            variant={ButtonVariant.text}
            textStyles={{
              fontWeight: "bold",
              fontSize: 14,
            }}
            style={{
              opacity: resendCountdown > 0 ? 0.5 : 1,
            }}
          />
        </View>

        <Text style={styles.error}>{errors.code}</Text>
        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={login}
            text="Login"
            style={{ paddingHorizontal: 50 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
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
  resendContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
