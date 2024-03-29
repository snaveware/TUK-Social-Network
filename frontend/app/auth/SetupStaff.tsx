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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SelectDropdown from "react-native-select-dropdown";
export interface SchoolItem {
  id: number;
  name: string;
  abbreviation: string;
}

export enum Titles {
  Mr = "Mr",
  Mrs = "Mrs",
  Prof = "Prof",
  Dr = "Dr",
  Ms = "Ms",
}
export interface StaffUserValues {
  title?: Titles;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  schoolId?: number;
  position?: string;
}

export default function SetupStaff() {
  const params = useLocalSearchParams();
  const { theme } = useContext(AppThemeContext);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    isLoggedIn,
    user,
    setUser,
    setIsLoggedIn,
    accessToken,
    setAccessToken,
  } = useContext(AuthContext);
  const [userValues, setUservalues] = useState<StaffUserValues>({});
  const [errors, setErrors] = useState<any>({});

  const [schools, setSchools] = useState<
    { id: string; title: string }[] | undefined
  >();
  const titles = [
    {
      id: "1",
      title: Titles.Mr,
    },
    {
      id: "2",
      title: Titles.Mrs,
    },
    {
      id: "3",
      title: Titles.Dr,
    },
    {
      id: "4",
      title: Titles.Prof,
    },
    {
      id: "5",
      title: Titles.Ms,
    },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
    getSchools();
  }, []);

  async function getSchools() {
    console.log("getting Schools....");
    if (loading) return;
    setLoading(true);
    try {
      const URL = `${Config.API_URL}/schools`;
      const results = await Utils.makeGetRequest(URL);
      setLoading(false);
      if (results.success) {
        const theSchools: { id: string; title: string }[] = [];
        results.data.map((school: SchoolItem) => {
          theSchools.push({
            id: `${school.id.toString()}`,
            title: `${school.abbreviation}: ${school.name}`,
          });
        });
        setSchools(theSchools);
      } else {
        setLoading(false);
        setErrors({ global: results.message });
      }
    } catch (error) {
      console.log("Error fetching Schools", error);
    }
  }

  async function onSetupUser() {
    console.log("user values: ", userValues);
    const URL = `${Config.API_URL}/auth/setup-staff`;
    if (loading) return;
    setLoading(true);

    if (!isInputValid()) {
      setLoading(false);
      return;
    }

    try {
      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: { ...userValues, verificationToken: params.verificationToken },
      });
      console.log("Setup user Results: ", results);

      if (results.success) {
        setUser(results.data.user);
        setAccessToken(results.data.accessToken);
        setIsLoggedIn(true);
        if (results.data) {
          await AsyncStorage.setItem("user", JSON.stringify(results.data.user));
          await AsyncStorage.setItem("accessToken", results.data.accessToken);
          await AsyncStorage.setItem("refreshToken", results.data.refreshToken);
        } else {
          router.push("/auth/LoginEmail");
          return;
        }
        router.replace("/(tabs)");
      } else {
        setErrors({
          global: results.message,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Setting up Staff: ", error);
    }
  }

  function isInputValid() {
    const theErrors: any = {};
    let hasErrors = false;

    if (!userValues.title || userValues.title?.trim() === "") {
      theErrors.title = "Title is required";
      hasErrors = true;
    }

    if (!userValues.firstName || userValues.firstName?.trim() === "") {
      theErrors.firstName = "First Name is Required";
      hasErrors = true;
    }

    if (!userValues.lastName || userValues.lastName?.trim() === "") {
      theErrors.lastName = "Last Name is Required";
      hasErrors = true;
    }

    if (!userValues.employeeId || userValues.employeeId?.trim() === "") {
      theErrors.employeeId = "Employee Number is Required";
      hasErrors = true;
    }

    if (!userValues.schoolId) {
      theErrors.schoolId = "Your School is required";
      hasErrors = true;
    }

    if (!userValues.position || userValues.position?.trim() === "") {
      theErrors.position = "Position Is Required";
      hasErrors = true;
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
          <Text style={styles.label}>Title</Text>
          {Platform.OS !== "web" && (
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
              // initialValue={{ id: titles?.[0].id }}
              onSelectItem={(item) => {
                setUservalues((prevValues: StaffUserValues) => {
                  console.log("new title: ", item);
                  const title: any = item?.title;
                  return {
                    ...prevValues,
                    title: item ? title : undefined,
                  };
                });
              }}
              dataSet={titles}
            />
          )}
          {Platform.OS === "web" && titles && titles.length > 0 && (
            <SelectDropdown
              data={titles}
              onSelect={(selectedItem, index) => {
                setUservalues((prevValues: StaffUserValues) => {
                  return {
                    ...prevValues,
                    title: selectedItem.title || undefined,
                  };
                });
              }}
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
              buttonTextAfterSelection={(selectedItem, index) => {
                console.log("selected title: ", selectedItem);
                return selectedItem.title;
              }}
              rowTextForSelection={(item, index) => {
                return item.title;
              }}
              buttonStyle={[
                {
                  backgroundColor: theme.background,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 5,
                  width: "100%",
                  maxWidth: "100%",
                  marginTop: 5,
                },
              ]}
              buttonTextStyle={[
                {
                  color: theme.foreground,
                  textTransform: "capitalize",
                  textAlign: "left",
                },
              ]}
              rowStyle={{
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                borderBottomColor: theme.border,
              }}
              rowTextStyle={[
                {
                  color: theme.foreground,
                  textTransform: "capitalize",
                  textAlign: "left",
                  paddingVertical: 3,
                },
              ]}
              dropdownStyle={{
                backgroundColor: theme.background,
              }}
            />
          )}
          <Text style={styles.error}>{errors.title}</Text>
        </View>
        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={userValues.firstName}
            placeholder="Eg. Martin"
            onChangeText={(value) => {
              setUservalues((prevValues: StaffUserValues) => {
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
              setUservalues((prevValues: StaffUserValues) => {
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
          <Text style={styles.label}>Employee Number</Text>
          <TextInput
            style={styles.input}
            value={userValues.employeeId}
            // placeholder="Eg. Emp/001/2019"
            onChangeText={(value) => {
              setUservalues((prevValues: StaffUserValues) => {
                return {
                  ...prevValues,
                  employeeId: value,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.employeeId}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Position</Text>
          <TextInput
            style={styles.input}
            value={userValues.position}
            placeholder="Eg. Lecturer"
            onChangeText={(value) => {
              setUservalues((prevValues: StaffUserValues) => {
                return {
                  ...prevValues,
                  position: value,
                };
              });
            }}
            underlineColorAndroid={"transparent"}
            returnKeyType="next"
          />
          <Text style={styles.error}>{errors.position}</Text>
        </View>

        <View style={[styles.inputContainer]}>
          <Text style={styles.label}>Select Your School</Text>
          {Platform.OS !== "web" && (
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
              initialValue={{ id: schools?.[0].id }}
              onSelectItem={(item) => {
                // console.log("selected items: ", item);
                setUservalues((prevValues: StaffUserValues) => {
                  return {
                    ...prevValues,
                    schoolId: item ? parseInt(item.id) : undefined,
                  };
                });
              }}
              dataSet={schools}
            />
          )}
          {Platform.OS === "web" && schools && schools.length > 0 && (
            <SelectDropdown
              search={true}
              data={schools}
              onSelect={(selectedItem, index) => {
                setUservalues((prevValues: StaffUserValues) => {
                  return {
                    ...prevValues,
                    schoolId: selectedItem
                      ? parseInt(selectedItem.id)
                      : undefined,
                  };
                });
              }}
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
              buttonTextAfterSelection={(selectedItem, index) => {
                // console.log("selected item: ", selectedItem);
                return selectedItem.title;
              }}
              rowTextForSelection={(item, index) => {
                return item.title;
              }}
              buttonStyle={[
                {
                  backgroundColor: theme.background,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 5,
                  width: "100%",
                  maxWidth: "100%",
                  marginTop: 5,
                },
              ]}
              buttonTextStyle={[
                {
                  color: theme.foreground,
                  textTransform: "capitalize",
                  textAlign: "left",
                },
              ]}
              rowStyle={{
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                borderBottomColor: theme.border,
              }}
              rowTextStyle={[
                {
                  color: theme.foreground,
                  textTransform: "capitalize",
                  textAlign: "left",
                  paddingVertical: 3,
                },
              ]}
              dropdownStyle={{
                backgroundColor: theme.background,
              }}
              searchInputStyle={{
                backgroundColor: theme.background,
                width: "100%",
                borderWidth: 0,
                marginBottom: 5,
                marginLeft: 0,
                display: "flex",
                justifyContent: "flex-start",
              }}
              searchInputTxtStyle={{
                color: theme.foreground,
                paddingHorizontal: 5,

                borderBottomWidth: 0,
              }}
            />
          )}
          <Text style={styles.error}>{errors.schoolId}</Text>
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
