import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "./Config";

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
        location.pathname = "/auth/login";
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
        location.pathname = "/auth/login";
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

  static async isLoggedIn() {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      return true;
    }
  }
}
