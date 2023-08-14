import Config from "./Config";
import Utils, { BodyRequestMethods } from "./Utils";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

export default async function uploadFile(file, folderId) {
  console.log("........Upload file called.......");
  try {
    let URL = `${Config.API_URL}/files`;

    if (folderId) {
      URL = `${Config.API_URL}/files?folderId=${folderId}`;
    }
    const formData = new FormData();

    if (Platform.OS == "web") {
      formData.append("file", file.file);
    } else {
      let uri = file.uri;

      formData.append("file", {
        uri: uri,
        name: file.name.replaceAll(" ", "-"),
        type: file.mimeType,
      });
    }

    const results = await Utils.makeFormDataRequest({
      URL,
      method: BodyRequestMethods.POST,
      body: formData,
    });

    console.log("Media file upload results: ", results);

    if (results.success) {
      return results.data;
    } else {
      console.log("Error uploading file: ", results.message);
      return false;
    }
  } catch (error) {
    console.log("Netowork Error UPloading file: ", error);
    return false;
  }
}

export function extractAsset(result) {
  return {
    uri: result.uri,
    type: result.file.type.split("/")[0],
    file: result.file,
  };
}

export function extractFileAsset(result) {
  return {
    uri: result.uri,
    mimeType: result.mimeType,
    name: result.name,
  };
}

export function extractMultipleWebAssets(result) {
  console.log("extracting files: ", result);
  const files = [];

  for (const file of result.output) {
    files.push({ file: file, type: Utils.getFileTypeFromMimeType(file.type) });
  }
  return files;
}
