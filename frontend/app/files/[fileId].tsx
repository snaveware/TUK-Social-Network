import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Image, Dimensions } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import GlobalStyles from "../../GlobalStyles";
import Config from "../../Config";
import { AppThemeContext } from "../../Theme";
import Utils from "../../Utils";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoPlayer from "../../components/VideoPlayer";
import FileView from "../../components/files/FileView";

export type File = {
  id: number;
  name: string;
  path: string;
  type: string;
};

export default function SingleFileScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [file, setFile] = useState<File>();
  const { theme } = useContext(AppThemeContext);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [SCREEN_WIDTH, SET_SCREEN_WIDTH] = useState<number>(
    Dimensions.get("window").width
  );

  useEffect(() => {
    if (params.fileId) {
      getFile();
    }
  }, [params]);
  useEffect(() => {
    if (file) {
      navigation.setOptions({
        title: file?.name,
      });
    }
  }, [file]);

  useEffect(() => {
    getToken();
  }, []);

  async function getToken() {
    const token = await AsyncStorage.getItem("accessToken");
    setAccessToken(token || undefined);
  }

  async function getFile() {
    try {
      const URL = `${Config.API_URL}/files/${params.fileId}`;

      const results = await Utils.makeGetRequest(URL);

      console.log("file object results: ", results);

      if (results.success) {
        setFile(results.data);
      } else {
        console.log("error getting file object");
      }
    } catch (error) {
      console.log("error getting file: ", error);
    }
  }

  return file && <FileView file={file} />;
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
