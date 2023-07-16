import { Text, TextInput, View } from "../../components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GlobalStyles from "../../GlobalStyles";
import { AppThemeContext } from "../../Theme";
import { Image, StyleSheet, Platform } from "react-native";
import { useEffect, useState, useContext } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from "../_layout";
import Button from "../../components/Button";
import Utils from "../../Utils";
import Config from "../../Config";
const AdaptiveIcon = require("../../assets/images/favicon-lg.png");
import { BodyRequestMethods } from "../../Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

export interface ProgrammeItem {
  id: number;
  name: string;
  abbreviation: string;
}

export interface StudentUserValues {
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
  programmeId?: number;
  year?: number;
}

export default function SetupStudent() {
  const params = useLocalSearchParams();
  const { theme } = useContext(AppThemeContext);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { isLoggedIn, user, setUser, setIsLoggedIn } = useContext(AuthContext);
  const [userValues, setUservalues] = useState<StudentUserValues>({
    firstName: "Evans",
    lastName: "Munene",
    registrationNumber: "SCII/00819/2019",
    year: 2019,
  });
  const [errors, setErrors] = useState<any>({});

  const [programmes, setProgrammes] = useState<
    { id: string; title: string }[] | undefined
  >();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/(tabs)");
    }
    getProgrammes();
  }, []);

  async function getProgrammes() {
    console.log("getting programmes....");
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/programmes`;
      const results = await Utils.makeGetRequest(URL);
      setLoading(false);
      if (results.success) {
        const theProgrammes: { id: string; title: string }[] = [];
        results.data.map((programme: ProgrammeItem) => {
          theProgrammes.push({
            id: `${programme.id.toString()}`,
            title: programme.name,
          });
        });
        setProgrammes(theProgrammes);
      } else {
        setLoading(false);
        setErrors({ global: results.message });
      }
    } catch (error) {
      console.log("Error fetching programmes", error);
    }
  }

  async function onSetupUser() {
    const URL = `${Config.API_URL}/auth/student-setup`;
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      console.log("user values: ", userValues);
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { ...userValues, verificationToken: params.verificationToken },
      });
      console.log("Setup user Results: ", results);

      if (results.success) {
        setUser(results.data.user);
        setIsLoggedIn(true);
        await AsyncStorage.setItem("user", JSON.stringify(results.data.user));
        await AsyncStorage.setItem(
          "accessToken",
          JSON.stringify(results.data.accessToken)
        );
        await AsyncStorage.setItem(
          "refreshToken",
          JSON.stringify(results.data.refreshToken)
        );

        router.push("/(tabs)");
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Setting up student: ", error);
    }
  }

  function isInputValid() {
    const theErrors: any = {};
    let hasErrors = false;
    if (!userValues.firstName || userValues.firstName?.trim() === "") {
      theErrors.firstName = "First Name is Required";
      hasErrors = true;
    }

    if (!userValues.lastName || userValues.lastName?.trim() === "") {
      theErrors.lastName = "Last Name is Required";
      hasErrors = true;
    }

    if (
      !userValues.registrationNumber ||
      userValues.registrationNumber?.trim() === ""
    ) {
      theErrors.registrationNumber = "Registration Number is Required";
      hasErrors = true;
    }

    if (!userValues.programmeId) {
      theErrors.programmeId = "The Course You are taking is required";
      hasErrors = true;
    }

    if (!userValues.year) {
      theErrors.year = "The Year that Your class joined is Required";
      hasErrors = true;
    } else {
      if (userValues.year < 2013) {
        theErrors.year =
          "Sorry, We only support from the class that Joined in 2013";
        hasErrors = true;
      } else if (userValues.year > new Date().getFullYear()) {
        theErrors.year = `We are not yet in ${userValues.year}`;
        hasErrors = true;
      }
    }
    setErrors(theErrors);

    return !hasErrors;
  }

  return (
    <SafeAreaView
      style={[styles.fullView, { backgroundColor: theme.background }]}
    >
      <KeyboardAwareScrollView style={[styles.keyboardAvoidingView]}>
        <View style={[styles.LogoContainer]}>
          <Image source={AdaptiveIcon} style={styles.logo} />
        </View>
        {errors.global && (
          <Text style={[styles.error, styles.errorBorder]}>
            {errors.global}
          </Text>
        )}
        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={userValues.firstName}
            placeholder="Eg. Evans"
            onChangeText={(value) => {
              setUservalues((prevValues: StudentUserValues) => {
                return {
                  ...prevValues,
                  firstName: value,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.firstName}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={userValues.lastName}
            placeholder="Eg. Munene"
            onChangeText={(value) => {
              setUservalues((prevValues: StudentUserValues) => {
                return {
                  ...prevValues,
                  lastName: value,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.lastName}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Registration Number</Text>
          <TextInput
            style={styles.input}
            value={userValues.registrationNumber}
            placeholder="Eg. SCII/00819/2019"
            onChangeText={(value) => {
              setUservalues((prevValues: StudentUserValues) => {
                return {
                  ...prevValues,
                  registrationNumber: value,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.registrationNumber}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Year (When Your Class Joined)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            inputMode={"numeric"}
            value={userValues.year?.toString()}
            placeholder="Eg. 2019"
            onChangeText={(value) => {
              setUservalues((prevValues: StudentUserValues) => {
                return {
                  ...prevValues,
                  year: parseInt(value) ? parseInt(value) : undefined,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.year}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Select Your Course</Text>
          <AutocompleteDropdown
            containerStyle={{ backgroundColor: theme.background }}
            inputContainerStyle={{
              backgroundColor: theme.background,
              borderStyle: "solid",
              borderColor: theme.border,
              borderWidth: 0.5,
              borderRadius: 5,
            }}
            textInputProps={{ style: { color: theme.foreground } }}
            suggestionsListTextStyle={{
              color: theme.foregroundMuted,
            }}
            suggestionsListContainerStyle={{
              backgroundColor: theme.background,
              borderStyle: "solid",
              borderWidth: 0.5,
              borderColor: theme.border,
            }}
            clearOnFocus={false}
            closeOnBlur={true}
            closeOnSubmit={false}
            initialValue={{ id: programmes?.[0].id }}
            onSelectItem={(item) => {
              setUservalues((prevValues: StudentUserValues) => {
                return {
                  ...prevValues,
                  programmeId: item ? parseInt(item.id) : undefined,
                };
              });
            }}
            dataSet={programmes}
          />
          <Text style={styles.error}>{errors.programmeId}</Text>
        </View>

        <View style={styles.primaryBtnContainer}>
          <Button
            onPress={onSetupUser}
            text="Setup Your Account"
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
