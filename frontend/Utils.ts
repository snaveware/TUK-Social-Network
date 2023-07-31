import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "./Config";
const base64 = require("base64-js");

export enum BodyRequestMethods {
  POST = "POST",
  PUT = "PUT",
}

export interface BodyRequestInterface {
  URL: string;
  body: any;
  method: BodyRequestMethods;
}

export default class Utils {
  static isFromMedium() {
    return Dimensions.get("window").width > 768;
  }

  static isLarge() {
    return Dimensions.get("window").width > 1024;
  }

  static async getHeaders(): Promise<Headers> {
    const accessToken = await AsyncStorage.getItem("accessToken");

    return new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    });
  }

  static async refreshToken() {
    const URL = `${Config.API_URL}/auth/refreshtoken`;
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const response = fetch(URL, {
      method: "POST",
      headers: await Utils.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    return response;
  }

  static async makeRequest(requestFunction: any) {
    const response = await requestFunction();

    // console.log("Main Response: ", response);

    if (!response.ok && response.status == 401) {
      /**
       * Refresh
       */
      const response = await Utils.refreshToken();

      //   console.log("Refresh Response: ", response);

      if (!response.ok && response.status === 401) {
        /**
         * Delete Tokens
         * Redirect To Login
         */
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("user");
        // location.pathname = "/auth/login";
        return;
      }

      const refreshResults = await response.json();

      await AsyncStorage.setItem(
        "accessToken",
        refreshResults.data.accessToken
      );
      await AsyncStorage.setItem(
        "refreshToken",
        refreshResults.data.refreshToken
      );

      const mainRequestResponse = await requestFunction();

      if (!mainRequestResponse.ok) {
        /**
         * unlikely. Means that the new tokens do not work
         */
        // location.pathname = "/auth/login";
      }

      return await mainRequestResponse.json();
    }

    return await response.json();
  }

  static async makeGetRequest(URL: string) {
    return Utils.makeRequest(async () => {
      const response = await fetch(URL, {
        method: "GET",
        headers: await Utils.getHeaders(),
      });

      //   console.log("Make Get Function: ", response);

      return response;
    });
  }

  static async makeBodyRequest({ URL, method, body }: BodyRequestInterface) {
    return Utils.makeRequest(async () => {
      const response = await fetch(URL, {
        method: method,
        headers: await Utils.getHeaders(),
        body: JSON.stringify(body),
      });

      return response;
    });
  }

  static async makeFormDataRequest({
    URL,
    method,
    body,
  }: BodyRequestInterface) {
    return Utils.makeRequest(async () => {
      console.log("form data in util request: ", body.getAll("file"));
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await fetch(URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: method,
        body: body,
      });

      return response;
    });
  }

  static async isLoggedIn() {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      return true;
    }
  }

  static postTypes = [
    {
      name: "social",
      label: "Social Post",
      description: "Just something about your life",
    },
    {
      name: "sellable",
      label: "Product Post",
      description: "Showcase your products and services",
    },
    {
      name: "event",
      label: "Event Post",
      description: "Inform people about an event",
    },
    {
      name: "poll",
      label: "Poll Post",
      description: "Focused on getting answers to a poll question",
    },
  ];
  static postVisibilities = [
    {
      name: "public",
      label: "public",
      description: "To Everyone",
    },
    {
      name: "friends",
      label: "Followers",
      description: "Only to Followers",
    },
    {
      name: "faculty",
      label: "Faculty",
      description: "Only My Faculty",
    },
    {
      name: "school",
      label: "School",
      description: "Only My School",
    },
  ];

  static base64ToBlob(base64String: string, contentType: string) {
    const byteCharacters = base64.toByteArray(base64String);
    return new Blob([byteCharacters], { type: contentType });
  }

  static extractMimeTypeAndBase64(dataURI: string) {
    const mimePrefix = "data:";
    const base64Prefix = ";base64,";
    const mimeEndIndex = dataURI.indexOf(";");
    const base64StartIndex = dataURI.indexOf(",") + 1;

    if (
      mimeEndIndex !== -1 &&
      base64StartIndex !== -1 &&
      mimeEndIndex < base64StartIndex
    ) {
      const mimeType = dataURI.slice(mimePrefix.length, mimeEndIndex);
      const base64String = dataURI.slice(base64StartIndex);
      return { mimeType, base64String };
    } else {
      throw new Error("Invalid data URI format");
    }
  }

  static generateUniqueString() {
    const randomString = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    return randomString + timestamp;
  }

  static getMimeTypeFromURI({ uri, type }: { uri: string; type: string }) {
    // Extract the file extension from the URI
    const lastDotIndex = uri.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return "application/octet-stream"; // Default to 'application/octet-stream' if no extension found
    }
    const fileExtension = uri.substring(lastDotIndex).toLowerCase();

    // Map file extensions to MIME types for images and videos
    const mimeTypes: any = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      // Add more file extensions and corresponding MIME types as needed
    };

    // Use the type to determine the correct MIME type
    if (type === "image") {
      return mimeTypes[fileExtension] || "image/jpeg"; // Default to 'image/jpeg' if MIME type not found
    } else if (type === "video") {
      return mimeTypes[fileExtension] || "video/mp4"; // Default to 'video/mp4' if MIME type not found
    } else {
      // Handle any other type as needed
      return "application/octet-stream"; // Default to 'application/octet-stream' if type is unknown
    }
  }

  static getMediaFileExtension(mimeType: string) {
    const mediaExtensions: any = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "video/mp4": ".mp4",
      "video/quicktime": ".mov",
      "video/3gpp": ".3gp",
      "video/x-matroska": ".mkv",
      // Add more MIME types and their corresponding extensions as needed
    };

    const extension = mediaExtensions[mimeType];
    return extension || null;
  }

  static getFileTypeFromMimeType(mimeType: string): string | null {
    const mimeToTypeMap: { [key: string]: string } = {
      "image/jpeg": "image",
      "image/png": "image",
      "image/gif": "image",
      "image/webp": "image",
      "image/bmp": "image",
      "image/svg+xml": "image",
      "video/mp4": "video",
      "video/mpeg": "video",
      "video/quicktime": "video",
      "application/pdf": "pdf",
      "application/msword": "word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "word",
      // Add more MIME types and their corresponding file types as needed
    };

    return mimeToTypeMap[mimeType] || null;
  }

  static getTimeDifference(fromDate: string) {
    const givenDate = new Date(fromDate);
    const now = new Date();
    const differenceInSeconds = Math.floor(
      (now.getTime() - givenDate.getTime()) / 1000
    );

    if (differenceInSeconds < 60) {
      return "now";
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return minutes + "m";
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return hours + "h";
    } else {
      const days = Math.floor(differenceInSeconds / 86400);
      return days + "d";
    }
  }
}
