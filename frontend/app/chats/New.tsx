import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, TextInput, View } from "../../components/Themed";
import { useEffect, useState, useContext } from "react";
import { useNavigation, useRouter } from "expo-router";
import MultiUserSelector from "../../components/MultiUserSelector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GlobalStyles from "../../GlobalStyles";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../_layout";
import Button from "../../components/Button";
import Config from "../../Config";
import Utils, { BodyRequestMethods } from "../../Utils";

export default function NewChatScreen() {
  const navigation = useNavigation();
  const [members, setMembers] = useState<string[]>();
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { theme } = useContext(AppThemeContext);
  const { user } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View
            style={[
              styles.flexRow,
              styles.flexCenter,
              { paddingRight: Platform.OS == "web" ? 10 : 0 },
            ]}
          >
            <Button
              onPress={onSubmit}
              text="Create"
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
  }, [members, name, description]);

  function onSelectionChange(selection: any) {
    setMembers(Object.keys(selection));
  }

  async function onSubmit() {
    console.log("submit: ", members, name, description);
    if (loading) return;
    setLoading(true);
    setErrorMessage(undefined);
    try {
      const URL = `${Config.API_URL}/chats`;

      if (!members || members.length < 1) {
        setErrorMessage("A group must have atleast one additional member");
        setLoading(false);
        return;
      }

      if (!name || name.trim().length < 1) {
        setErrorMessage("A group Name is required");
        setLoading(false);
        return;
      }

      if (!description || description.trim().length < 1) {
        setErrorMessage("A group Description is required");
        setLoading(false);
        return;
      } else if (description.length > 500) {
        setErrorMessage("A group Description must be less than 500 characters");
        setLoading(false);
        return;
      }

      let _members = [...members];

      if (!members.includes(user.id.toString())) {
        _members = [..._members, user.id];
      }

      const results = await Utils.makeBodyRequest({
        URL,
        method: BodyRequestMethods.POST,
        body: {
          name: name,
          description: description,
          members: _members,
          chatType: "group",
        },
      });

      console.log("group create results", results.data);

      if (results.success) {
        router.back();
        router.push({
          pathname: "/chats/[chatId]",
          params: { chatId: results.data.id },
        });
      } else {
        setErrorMessage(results.message);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error creating group chat: ", error);
    }
  }

  // useEffect(() => {
  //   console.log("new group members: ", members);
  // }, [members]);

  return (
    <KeyboardAwareScrollView
      style={{
        flex: 1,
        marginBottom: keyboardHeight,
        backgroundColor: theme.background,
      }}
      onKeyboardWillShow={(frames: any) => {
        if (Platform.OS == "ios") {
          setKeyboardHeight(frames.endCoordinates.height);
        }
      }}
      onKeyboardWillHide={(frames) => {
        setKeyboardHeight(0);
      }}
    >
      {errorMessage && (
        <Text
          style={[
            styles.padding,
            styles.error,
            styles.errorBorder,
            styles.marginH,
          ]}
        >
          {errorMessage}
        </Text>
      )}
      <View style={[styles.padding, styles.flexCols]}>
        <Text style={[styles.padding, { color: theme.accent }]}>
          Group Name
        </Text>
        <TextInput
          style={[
            {
              marginHorizontal: 5,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              borderWidth: 1,
              backgroundColor: theme.background,
              flex: 1,
            },
          ]}
          value={name}
          onChangeText={(value) => {
            setName(value);
          }}
          placeholder={"What do you want to call the group?"}
        />
      </View>

      <View style={[styles.padding, styles.flexCols]}>
        <Text style={[styles.padding, { color: theme.accent }]}>
          Description
        </Text>
        <TextInput
          style={[
            {
              marginHorizontal: 5,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 5,
              borderWidth: 1,
              backgroundColor: theme.background,
              flex: 1,
              minHeight: 60,
            },
          ]}
          multiline={true}
          value={description}
          onChangeText={(value) => {
            // console.log("new search string: ", value);
            setDescription(value);
          }}
          placeholder={"what's the group chat about?"}
        />
      </View>

      <Text style={[styles.padding, { color: theme.accent }]}>
        Add Group Members
      </Text>

      <MultiUserSelector onSelectChange={onSelectionChange} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
