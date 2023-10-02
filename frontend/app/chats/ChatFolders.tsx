import { useState, useEffect, useContext } from "react";
import { Text, View } from "../../components/Themed";
import Config from "../../Config";
import Utils from "../../Utils";
import { useLocalSearchParams } from "expo-router";
import { Platform, TouchableOpacity, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FileCard from "../../components/files/FileCard";
import FolderCard from "../../components/files/FolderCard";
import GlobalStyles from "../../GlobalStyles";

export default function ChatFiles() {
  const [loading, setLoading] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const [folders, setFolders] = useState<any>();

  useEffect(() => {
    getChatFolders();
  }, []);

  async function getChatFolders() {
    console.log("...getting Chat files ...id: ", params.chatId);
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/folders/${params.chatId}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("get Chat folders results: ", results.data);

      if (results.success) {
        setFolders(results.data);
        console.log("successful get chat folders ");
      } else {
        console.log("error getting chat folders: ", results.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      //   setError("Your are not connected to the internet");
      console.log("Error getting Chats: ", error);
    }
  }

  return (
    <KeyboardAwareScrollView>
      <View
        style={[
          styles.flexRow,

          {
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          },
        ]}
      >
        {folders &&
          folders?.length > 0 &&
          folders.map((folder: any, index: number) => {
            return (
              <TouchableOpacity key={index}>
                <FolderCard folder={folder} />
              </TouchableOpacity>
            );
          })}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
