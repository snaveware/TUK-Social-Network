import GlobalStyles from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Platform } from "react-native";
import { Text, View, TextInput } from "../../components/Themed";
import { useEffect, useState, useContext, useLayoutEffect } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
import { AuthContext } from "../_layout";
import DefaultAppTheme, { AppThemeContext } from "../../Theme";
import Utils from "../../Utils";
import Config from "../../Config";
const AdaptiveIcon = require("../../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SelectDropdown from "react-native-select-dropdown";
import Button, { ButtonVariant } from "../../components/Button";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState<string>("evansmwenda006@gmail.com");
  const [errors, setErrors] = useState<any>({});
  const { theme } = useContext(AppThemeContext);
  const postTypes = ["social", "sellable", "event", "Poll"];
  const navigation = useNavigation();

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     router.push("/(tabs)");
  //   }
  // }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "New Post",
      headerRight: () => {
        return (
          <View style={[styles.flexRow, styles.flexCenter]}>
            <Button
              onPress={onSubmit}
              text="Post"
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                marginVertical: "auto",
              }}
            />
          </View>
        );
      },
    });
  }, []);

  async function onSubmit() {
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      const URL = `${Config.API_URL}/posts`;
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { email: email },
      });
      console.log("Send Email Results: ", results);
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
        <View style={[styles.flexRow]}>
          <SelectDropdown
            data={postTypes}
            defaultValue={"social"}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              return item;
            }}
            buttonStyle={[
              {
                backgroundColor: theme.primary,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 5,
              },
            ]}
            renderDropdownIcon={() => {
              return (
                <FontAwesome
                  name="chevron-down"
                  size={20}
                  style={{ paddingRight: 5 }}
                  color={theme.primaryForeground}
                />
              );
            }}
            buttonTextStyle={[
              { color: theme.primaryForeground, textTransform: "capitalize" },
            ]}
            rowStyle={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderBottomColor: theme.border,
            }}
            rowTextStyle={[
              { color: theme.foreground, textTransform: "capitalize" },
            ]}
          />
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
