import { useState, useEffect, useContext } from "react";
import { Text, View } from "../../components/Themed";
import Config from "../../Config";
import Utils from "../../Utils";
import { useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FileCard from "../../components/files/FileCard";

export default function ChatFiles() {
  const [loading, setLoading] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const [files, setFiles] = useState<any>();

  useEffect(() => {
    getChatFiles();
  }, []);

  async function getChatFiles() {
    console.log("...getting Chat files ...id: ", params.chatId);
    if (loading) return;
    setLoading(true);

    try {
      const URL = `${Config.API_URL}/chats/files/${params.chatId}`;
      const results = await Utils.makeGetRequest(URL);
      console.log("get Chat files results: ", results.data);

      if (results.success) {
        setFiles(results.data);
        console.log("successful get chat files ");
      } else {
        console.log("error getting chat files: ", results.message);
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
          {
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          },
        ]}
      >
        {files &&
          files.length > 0 &&
          files.map((file: any, index: number) => {
            return (
              <FileCard
                key={index}
                file={file}
                onRefresh={getChatFiles}
                onDelete={() => {
                  getChatFiles();
                }}
              />
            );
          })}
      </View>
    </KeyboardAwareScrollView>
  );
}
