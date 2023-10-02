import { View, Text } from "../Themed";
import { TouchableOpacity, Platform, StyleSheet, Image } from "react-native";
import { useEffect, useContext, useState } from "react";
import GlobalStyles from "../../GlobalStyles";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AppThemeContext } from "../../Theme";
import { AuthContext } from "../../app/_layout";
const Favicon = require("../../assets/images/favicon.png");
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";

export default function ChatsTopBar({
  onActionEnd,
  onPostCreate = false,
  setOnPostCreate,
}: {
  onActionEnd?: any;
  onPostCreate?: boolean;
  setOnPostCreate: any;
}) {
  const { theme } = useContext(AppThemeContext);
  const { user } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const router = useRouter();

  console.log("params: ", params);

  return (
    <View
      style={[
        styles.flexRow,
        styles.padding,
        {
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,
          backgroundColor: theme.backgroundMuted,
          borderRightWidth: Platform.select({ ios: true, android: true })
            ? 0
            : 1,
          borderRightColor: theme.foregroundMuted,
          width: "100%",
          height: 60,
        },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          styles.flexCenter,
          { backgroundColor: "transparent", marginLeft: 15 },
        ]}
      >
        {params.action !== "search" &&
          params.action !== "add" &&
          params.action !== "share" && (
            <Image source={Favicon} style={{ width: 42, height: 42 }} />
          )}

        {(params.action === "search" ||
          params.action === "add" ||
          params.action === "share") && (
          <View
            style={[
              styles.flexRow,
              {
                backgroundColor: theme.backgroundMuted,
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.accent}
              style={{ marginRight: 30 }}
              onPress={() => {
                if (onActionEnd) {
                  onActionEnd();
                }
                router.push("/(tabs)/ChatsTab");
              }}
            />
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {params.action === "add" ? "Create Your New Group" : ""}
              {params.action === "search"
                ? "Search a chat, user or group to chat with"
                : ""}
              {params.action === "share"
                ? "which chat do you want to share this message with?"
                : ""}
            </Text>
            {params.action === "add" && (
              <View
                style={[
                  styles.flexRow,
                  styles.flexCenter,
                  {
                    marginHorizontal: 20,
                    backgroundColor: "transparent",
                  },
                ]}
              >
                <Button
                  onPress={() => setOnPostCreate(true)}
                  text="Create"
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    marginVertical: "auto",
                  }}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {params.action !== "search" &&
        params.action !== "add" &&
        params.action !== "share" && (
          <>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Chats</Text>
            <View
              style={[
                styles.flexRow,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent",
                },
              ]}
            >
              <Link
                href={{
                  pathname: Platform.select({ ios: true, android: true })
                    ? "chats/Search"
                    : "/(tabs)/ChatsTab",
                  params: Platform.select({ ios: true, android: true })
                    ? undefined
                    : { action: "search" },
                }}
                style={{ marginHorizontal: 5 }}
                asChild
              >
                <MaterialIcons
                  name="search"
                  size={30}
                  color={theme.accent}
                  style={{
                    marginHorizontal: 15,
                    fontWeight: "bold",
                  }}
                />
              </Link>

              <Link
                href={{
                  pathname: Platform.select({ ios: true, android: true })
                    ? "chats/New"
                    : "/(tabs)/ChatsTab",
                  params: Platform.select({ ios: true, android: true })
                    ? undefined
                    : { action: "add" },
                }}
                style={{ marginHorizontal: 5 }}
                asChild
              >
                <MaterialIcons
                  name="add"
                  size={36}
                  color={theme.foreground}
                  style={{ marginRight: 15, fontWeight: "bold" }}
                />
              </Link>
            </View>
          </>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
});
